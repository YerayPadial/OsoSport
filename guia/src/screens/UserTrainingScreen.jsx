import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Award,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  Clock,
  Copy,
  Dumbbell,
  Flame,
  History,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Search,
  Timer,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useAppData } from "../data/useAppData";

const API_URL = `${import.meta.env.BASE_URL}api/user-training.php`;
const AUTH_URL = `${import.meta.env.BASE_URL}api/admin-auth.php`;

const muscleLabels = ["pecho", "espalda", "hombros", "bíceps", "tríceps", "antebrazo", "abdomen/core", "glúteos", "cuádriceps", "isquios", "gemelos"];
const exerciseCategories = [
  { value: "todos", label: "Todos" },
  { value: "pecho", label: "Pecho" },
  { value: "espalda", label: "Espalda" },
  { value: "espalda baja", label: "Espalda baja" },
  { value: "hombros", label: "Hombros" },
  { value: "bíceps", label: "Bíceps" },
  { value: "tríceps", label: "Tríceps" },
  { value: "core", label: "Core" },
  { value: "pierna", label: "Pierna" },
  { value: "glúteos", label: "Glúteos" },
  { value: "cardio", label: "Cardio" },
];

const UserTrainingScreen = ({ initialTab = "perfil", onTabChange, onGoBack, onLoginClick }) => {
  const { rutinasData } = useAppData();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [payload, setPayload] = useState({ routines: [], activeSession: null, history: [], progress: emptyProgress(), bodyProfile: emptyBodyProfile() });
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [message, setMessage] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restTimer, setRestTimer] = useState({ seconds: 0, running: false, label: "" });
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const saveTimer = useRef(null);
  const elapsedRef = useRef(0);

  const exerciseLibrary = useMemo(() => flattenGymExercises(rutinasData), [rutinasData]);
  const activeSession = payload.activeSession;
  const activeSessionId = activeSession?.id;
  const activeSessionStatus = activeSession?.status;
  const activeSessionDuration = activeSession?.durationSeconds;
  const changeTab = (tab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  useEffect(() => {
    loadTraining();
  // Initial bootstrap only; later refreshes are triggered by explicit actions.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const pending = window.sessionStorage.getItem("ososport-pending-official-workout");
    if (!pending) return;

    window.sessionStorage.removeItem("ososport-pending-official-workout");
    try {
      const payload = JSON.parse(pending);
      if (payload?.workoutId) {
        startOfficialSession(payload);
      }
    } catch {
      // Ignore malformed local navigation payloads.
    }
  // startOfficialSession intentionally reads current component state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!message) {
      setSuccessModalOpen(false);
      return undefined;
    }

    setSuccessModalOpen(true);
    const closeTimer = window.setTimeout(() => setSuccessModalOpen(false), 1500);
    const clearTimer = window.setTimeout(() => setMessage(""), 1500);

    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(clearTimer);
    };
  }, [message]);

  useEffect(() => {
    if (!activeSession) return undefined;

    const preserveLocalProgress = () => {
      persistActiveSession({
        ...activeSession,
        durationSeconds: elapsedRef.current,
      });
    };

    window.addEventListener("pagehide", preserveLocalProgress);
    return () => window.removeEventListener("pagehide", preserveLocalProgress);
  }, [activeSession]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!activeSessionId || activeSessionStatus !== "active") {
      setElapsedSeconds(0);
      elapsedRef.current = 0;
      return undefined;
    }

    const initialSeconds = Number(activeSessionDuration) || 0;
    const anchoredAt = Date.now();
    const updateElapsed = () => {
      const next = initialSeconds + Math.floor((Date.now() - anchoredAt) / 1000);
      elapsedRef.current = next;
      setElapsedSeconds(next);
    };

    updateElapsed();
    const interval = window.setInterval(() => {
      updateElapsed();
    }, 1000);
    document.addEventListener("visibilitychange", updateElapsed);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", updateElapsed);
    };
  // The server duration initializes the timer only when the active session changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSessionId, activeSessionStatus]);

  useEffect(() => {
    if (!restTimer.running || restTimer.seconds <= 0) return;
    const interval = window.setInterval(() => {
      setRestTimer((current) => {
        if (!current.running) return current;
        const nextSeconds = Math.max(0, current.seconds - 1);
        return { ...current, seconds: nextSeconds, running: nextSeconds > 0 };
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [restTimer.running, restTimer.seconds]);

  const loadTraining = async () => {
    setLoading(true);
    setError("");
    try {
      const status = await authStatus();

      if (!status.authenticated) {
        setPayload({ routines: [], activeSession: null, history: [], progress: emptyProgress(), bodyProfile: emptyBodyProfile() });
        setError("Inicia sesión para ver tu marca personal.");
        return;
      }

      const data = await api("bootstrap");
      setPayload(normalizeBootstrap(data));
      if (data.activeSession) {
        persistActiveSession(data.activeSession);
        changeTab("activo");
      } else {
        clearActiveSessionBackup();
      }
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const startSession = async () => {
    setSaving(true);
    try {
      const data = await api("start-session", { method: "POST", body: { name: "Entreno libre" } });
      const session = hydrateSession(data.session);
      setPayload((current) => ({ ...current, activeSession: session }));
      persistActiveSession(session);
      changeTab("activo");
      setMessage(data.resumed ? "Ya tenías un entrenamiento activo. Lo hemos retomado." : "Entreno iniciado.");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  };

  const startOfficialSession = async ({ workoutId, dayName = "" }) => {
    setSaving(true);
    setError("");
    try {
      const data = await api("start-gym-workout", { method: "POST", body: { workoutId, dayName } });
      const session = hydrateSession(data.session);
      setPayload((current) => ({ ...current, activeSession: session }));
      persistActiveSession(session);
      changeTab("activo");
      setMessage(data.resumed ? "Ya tenías un entrenamiento activo. Lo hemos retomado." : "Entrenamiento iniciado.");
    } catch (apiError) {
      if (apiError.status === 401) {
        setError("Inicia sesión para registrar este entrenamiento.");
      } else {
        setError(apiError.message);
      }
      changeTab("perfil");
    } finally {
      setSaving(false);
    }
  };

  const saveBodyProfile = async (bodyProfile) => {
    setSaving(true);
    setError("");
    try {
      const data = await api("body-profile", { method: "PUT", body: bodyProfile });
      setPayload((current) => ({ ...current, bodyProfile: data.bodyProfile ?? emptyBodyProfile() }));
      setMessage("Perfil físico guardado.");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  };

  const saveActiveSession = async (session = activeSession, options = {}) => {
    if (!session) return;
    try {
      const data = await api("session", { method: "PUT", body: serializeSession({ ...session, durationSeconds: elapsedRef.current }) });
      const hydratedSession = hydrateSession(data.session);
      setPayload((current) => ({ ...current, activeSession: hydratedSession, progress: data.progress ?? current.progress }));
      persistActiveSession(hydratedSession);
      if (!options.silent) setMessage("Entreno guardado.");
    } catch (apiError) {
      if (!options.silent) setError(apiError.message);
    }
  };

  const finishSession = async () => {
    if (!activeSession) return;
    setConfirmDialog({
      title: "Finalizar entrenamiento",
      text: "Se guardará el historial, el progreso, récords y músculos trabajados.",
      actionLabel: "Finalizar",
      onConfirm: async () => {
    setSaving(true);
    try {
      await saveActiveSession(activeSession, { silent: true });
      const data = await api("finish-session", { method: "POST", body: { id: activeSession.id, notes: activeSession.notes, durationSeconds: elapsedRef.current } });
      setPayload((current) => ({
        ...current,
        activeSession: null,
        history: [data, ...current.history.filter((item) => item.id !== data.id)].slice(0, 20),
        progress: data.progress ?? current.progress,
        lastSummary: data,
      }));
      clearActiveSessionBackup();
      changeTab("progreso");
      setMessage("Entreno finalizado. Buen trabajo.");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
      },
    });
  };

  const cancelSession = async () => {
    if (!activeSession) return;
    setConfirmDialog({
      title: "Cancelar entrenamiento",
      text: "Se descartará la sesión activa actual. Tus rutinas guardadas no se modificarán.",
      actionLabel: "Cancelar entreno",
      danger: true,
      onConfirm: async () => {
    setSaving(true);
    try {
      const data = await api("cancel-session", { method: "POST", body: { id: activeSession.id, durationSeconds: elapsedRef.current } });
      setPayload((current) => ({ ...current, activeSession: null, progress: data.progress ?? current.progress }));
      clearActiveSessionBackup();
      setMessage("Entreno cancelado.");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
      },
    });
  };

  const addExerciseToSession = (exercise) => {
    if (!activeSession) return;
    updateSession({
      ...activeSession,
      exercises: [
        ...activeSession.exercises,
        {
          localId: crypto.randomUUID(),
          exerciseId: exercise.id,
          workoutId: exercise.workoutId,
          exerciseName: exercise.nombre,
          muscle: exercise.musculo,
          muscleGroup: exercise.grupoMuscular,
          notes: "",
          sets: [{ localId: crypto.randomUUID(), weight: "", reps: "", timeSeconds: "", rpe: "", restSeconds: 90, completed: false, notes: "" }],
        },
      ],
    });
  };

  const updateSession = (session) => {
    setPayload((current) => ({ ...current, activeSession: session }));
    persistActiveSession(session);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(
      () => saveActiveSession(session, { silent: true }),
      900
    );
  };

  const filteredExercises = exerciseLibrary;

  if (loading) {
    return (
      <TrainingShell onGoBack={onGoBack}>
        <Panel>
          <p className="font-black">Cargando tu marca personal...</p>
        </Panel>
      </TrainingShell>
    );
  }

  return (
    <TrainingShell onGoBack={onGoBack}>
      <div className="max-w-[1500px] mx-auto space-y-4">
        {activeTab !== "activo" && <div className="app-card p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-primary-soft">Registro personal</p>
              <h1 className="text-4xl font-black">Marca personal</h1>
            </div>
          </div>
        </div>}

        <SuccessModal
          message={message}
          open={successModalOpen}
          onClose={() => {
            setSuccessModalOpen(false);
            window.setTimeout(() => setMessage(""), 250);
          }}
        />
        <ConfirmDialog
          dialog={confirmDialog}
          onCancel={() => setConfirmDialog(null)}
          onConfirm={async () => {
            const action = confirmDialog?.onConfirm;
            setConfirmDialog(null);
            await action?.();
          }}
        />
        {error && <Alert tone="error" onClose={() => setError("")}>{error}</Alert>}

        {activeTab === "activo" && (
          <ActiveWorkout
            session={activeSession}
            exercises={filteredExercises}
            query={exerciseQuery}
            setQuery={setExerciseQuery}
            onStartEmpty={() => startSession(null)}
            onAddExercise={addExerciseToSession}
            onChange={updateSession}
            onSave={() => saveActiveSession(activeSession)}
            onFinish={finishSession}
            onCancel={cancelSession}
            saving={saving}
            elapsedSeconds={elapsedSeconds}
            bodyProfile={payload.bodyProfile}
            restTimer={restTimer}
            setRestTimer={setRestTimer}
          />
        )}

        {activeTab !== "activo" && (
          error.includes("Inicia sesión") ? (
            <LoginRequiredPanel onLoginClick={onLoginClick} />
          ) : (
            <ProfilePanel
              progress={payload.progress}
              history={payload.history}
              bodyProfile={payload.bodyProfile}
              onSaveBodyProfile={saveBodyProfile}
              saving={saving}
            />
          )
        )}
      </div>
    </TrainingShell>
  );
};

const TrainingShell = ({ children, onGoBack }) => (
  <div className="app-page overflow-x-hidden">
    <div className="app-container max-w-[1500px]">
    <div className="mb-4">
      <button onClick={onGoBack} className="app-focus flex min-h-touch-target items-center gap-2 rounded-lg border border-borde-claro dark:border-borde-oscuro bg-surface-card px-4 font-black">
        <ArrowLeft className="w-5 h-5" />
        Volver
      </button>
    </div>
    {children}
    </div>
  </div>
);

const ActiveWorkout = ({ session, exercises, query, setQuery, onStartEmpty, onAddExercise, onChange, onSave, onFinish, onCancel, saving, elapsedSeconds, bodyProfile, restTimer, setRestTimer }) => {
  const titleRef = useRef(null);

  useEffect(() => {
    autoResizeTextarea(titleRef.current);
  }, [session?.name]);

  if (!session) {
    return (
      <Panel title="Entreno activo" icon={Timer}>
        <div className="text-center py-8">
          <Timer className="w-12 h-12 mx-auto" />
          <h2 className="text-2xl font-black mt-3">No hay entreno activo</h2>
          <p className="font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro mt-2">Empieza una rutina guardada o abre un entrenamiento libre.</p>
          <button onClick={onStartEmpty} className="app-focus mt-5 min-h-touch-target px-5 rounded-lg bg-primary-vanguard text-white font-black">
            Empezar entreno libre
          </button>
        </div>
      </Panel>
    );
  }

  const updateExercise = (index, nextExercise) => {
    onChange({ ...session, exercises: session.exercises.map((exercise, itemIndex) => (itemIndex === index ? nextExercise : exercise)) });
  };

  return (
    <div className="grid xl:grid-cols-[minmax(0,1fr)_340px] gap-4">
      <div className="space-y-4" data-workout-dropzone>
        <Panel>
          <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">Entreno activo</p>
              <textarea
                ref={titleRef}
                rows={1}
                value={session.name}
                onChange={(event) => onChange({ ...session, name: event.target.value })}
                onInput={(event) => autoResizeTextarea(event.currentTarget)}
                aria-label="Nombre del entrenamiento"
                className="app-focus mt-1 block w-full max-w-full min-w-0 resize-none overflow-hidden whitespace-pre-wrap break-words bg-transparent text-xl font-black leading-tight sm:text-2xl md:text-3xl"
              />
              <p className="font-numeric mt-1 text-lg font-black text-primary-soft">{formatDuration(elapsedSeconds)}</p>
            </div>
            <div className="grid min-w-0 w-full grid-cols-1 gap-2 min-[420px]:grid-cols-3 md:w-auto md:flex">
              <ActionButton onClick={onSave} icon={Save} disabled={saving}>Guardar</ActionButton>
              <ActionButton onClick={onFinish} icon={Check} disabled={saving}>Finalizar</ActionButton>
              <ActionButton onClick={onCancel} icon={X} danger disabled={saving}>Cancelar</ActionButton>
            </div>
          </div>
        </Panel>

        <RestTimer timer={restTimer} setTimer={setRestTimer} />

        {session.exercises.length === 0 ? (
          <Panel><EmptyState text="Añade ejercicios para empezar a registrar series." /></Panel>
        ) : (
          session.exercises.map((exercise, index) => (
            <SessionExercise
              key={exercise.id ?? exercise.localId ?? `${exercise.exerciseId}-${index}`}
              exercise={exercise}
              bodyProfile={bodyProfile}
              onChange={(nextExercise) => updateExercise(index, nextExercise)}
              onRemove={() => onChange({ ...session, exercises: session.exercises.filter((_, itemIndex) => itemIndex !== index) })}
              onStartRest={(seconds, label) => setRestTimer({ seconds, running: true, label })}
            />
          ))
        )}
      </div>
      <Panel title="Añadir ejercicio" icon={Plus}>
        <ExercisePicker query={query} setQuery={setQuery} exercises={exercises} onPick={onAddExercise} />
      </Panel>
    </div>
  );
};

const SessionExercise = ({ exercise, bodyProfile, onChange, onRemove, onStartRest }) => {
  const addSet = () => {
    const previous = exercise.sets[exercise.sets.length - 1] ?? {};
    onChange({
      ...exercise,
      sets: [
        ...exercise.sets,
        { localId: crypto.randomUUID(), weight: previous.weight ?? "", reps: previous.reps ?? "", timeSeconds: previous.timeSeconds ?? "", rpe: "", restSeconds: previous.restSeconds ?? 90, completed: false, notes: "" },
      ],
    });
  };

  const updateSet = (index, field, value) => {
    const nextSets = exercise.sets.map((set, itemIndex) => {
      if (itemIndex !== index) return set;
      const next = { ...set, [field]: value };
      if (field === "completed" && value) {
        next.completedAt = new Date().toISOString();
        if (!next.weight && isBodyweightExercise(exercise) && Number(bodyProfile?.weightKg) > 0) {
          next.weight = Number(bodyProfile.weightKg);
        }
      }
      return next;
    });
    onChange({ ...exercise, sets: nextSets });
    if (field === "completed" && value) {
      onStartRest(Number(exercise.sets[index]?.restSeconds || 90), exercise.exerciseName);
    }
  };

  return (
    <Panel>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-xl font-black">{exercise.exerciseName}</h3>
          <p className="text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">{exercise.muscle || exercise.muscleGroup || "General"}</p>
        </div>
        <IconButton onClick={onRemove} label="Eliminar ejercicio" danger><Trash2 className="w-4 h-4" /></IconButton>
      </div>
      <div className="space-y-2">
        {exercise.sets.map((set, index) => (
          <div key={set.id ?? set.localId ?? index} className={`rounded-lg border p-3 ${set.completed ? "border-success-vanguard/40 bg-success-vanguard/15" : "border-borde-claro bg-surface-low dark:border-borde-oscuro"}`}>
            <div className="mb-3 flex items-center justify-between gap-3 sm:hidden">
              <span className="font-numeric font-black">Serie {index + 1}</span>
              <button
                onClick={() => updateSet(index, "completed", !set.completed)}
                className={`app-focus flex min-h-touch-target flex-shrink-0 items-center gap-2 rounded-lg border px-3 font-black ${set.completed ? "border-success-vanguard bg-success-vanguard text-green-950" : "border-borde-claro dark:border-borde-oscuro"}`}
              >
                <Check className="h-5 w-5" />
                {set.completed ? "Hecha" : "Marcar"}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-[36px_repeat(4,minmax(0,1fr))_44px] sm:items-end sm:gap-2">
              <div className="hidden h-11 items-center justify-center font-numeric font-black sm:flex">{index + 1}</div>
              <MiniField label="Peso" type="number" value={set.weight ?? ""} onChange={(value) => updateSet(index, "weight", value)} />
              <MiniField label="Reps" type="number" value={set.reps ?? ""} onChange={(value) => updateSet(index, "reps", value)} />
              <MiniField label="Tiempo" type="number" value={set.timeSeconds ?? ""} onChange={(value) => updateSet(index, "timeSeconds", value)} />
              <MiniField label="RPE" type="number" value={set.rpe ?? ""} onChange={(value) => updateSet(index, "rpe", value)} />
              <button
                onClick={() => updateSet(index, "completed", !set.completed)}
                aria-label={set.completed ? "Desmarcar serie" : "Completar serie"}
                className={`app-focus hidden h-11 items-center justify-center rounded-lg border sm:flex ${set.completed ? "border-success-vanguard bg-success-vanguard text-green-950" : "border-borde-claro dark:border-borde-oscuro"}`}
              >
                <Check className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={addSet} className="app-focus mt-3 w-full min-h-touch-target rounded-lg border border-dashed border-primary-vanguard/70 bg-primary-vanguard/10 text-primary-soft font-black flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" /> Añadir serie
      </button>
    </Panel>
  );
};

const RestTimer = ({ timer, setTimer }) => (
  <div className="app-card flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
    <div className="flex min-w-0 items-center gap-3">
      <div className="w-12 h-12 rounded-lg bg-surface-low flex items-center justify-center text-primary-soft">
        <Clock className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">{timer.label || "Descanso"}</p>
        <p className="font-numeric text-3xl font-black text-primary-soft">{formatDuration(timer.seconds)}</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-5">
      <IconButton
        label="Pausar/reanudar"
        disabled={timer.seconds <= 0}
        onClick={() => setTimer((current) => ({ ...current, running: !current.running }))}
      >
        {timer.running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </IconButton>
      <IconButton
        label="Añadir 15 segundos"
        onClick={() => setTimer((current) => ({
          ...current,
          seconds: current.seconds + 15,
          running: true,
          label: current.label || "Descanso",
        }))}
      >
        +15
      </IconButton>
      <IconButton label="60 segundos" onClick={() => setTimer({ seconds: 60, running: true, label: "Descanso" })}>60</IconButton>
      <IconButton label="90 segundos" onClick={() => setTimer({ seconds: 90, running: true, label: "Descanso" })}>90</IconButton>
      <IconButton label="Saltar" onClick={() => setTimer({ seconds: 0, running: false, label: "" })}><RotateCcw className="w-4 h-4" /></IconButton>
    </div>
  </div>
);

const ProgressPanel = ({ progress, history, lastSummary }) => {
  const stats = progress?.stats ?? emptyProgress().stats;
  const records = progress?.records ?? [];
  const achievements = progress?.achievements ?? [];
  const chartData = buildHistoryChart(history);

  return (
    <div className="space-y-4">
      {lastSummary && (
        <Panel title="Resumen del último entreno" icon={Check}>
          <div className="grid sm:grid-cols-4 gap-2">
            <Metric label="Duración" value={formatDuration(lastSummary.durationSeconds)} />
            <Metric label="Ejercicios" value={lastSummary.exerciseCount} />
            <Metric label="Series" value={lastSummary.completedSets} />
            <Metric label="Volumen" value={`${lastSummary.volume} kg`} />
          </div>
        </Panel>
      )}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
        <Metric label="Entrenos" value={stats.totalWorkouts} />
        <Metric label="Días entrenados" value={stats.trainedDays} />
        <Metric label="Racha actual" value={`${stats.currentStreak} días`} />
        <Metric label="Volumen total" value={`${stats.totalVolume} kg`} />
      </div>
      <div className="grid xl:grid-cols-3 gap-4">
        <Panel title="Volumen y series" icon={Activity}>
          <VolumeChart data={chartData} />
        </Panel>
        <Panel title="Frecuencia" icon={CalendarDays}>
          <FrequencyCard stats={stats} history={history} />
        </Panel>
        <Panel title="Mapa muscular" icon={Flame}>
          <MuscleMap groups={progress?.muscles?.week ?? []} />
        </Panel>
      </div>
      <div className="grid xl:grid-cols-3 gap-4">
        <Panel title="Récords personales" icon={Award}>
          <RecordList records={records.slice(0, 8)} />
        </Panel>
        <Panel title="Logros" icon={Award}>
          <List items={achievements} empty="Los logros aparecerán al completar entrenos." render={(achievement) => `${achievement.title} · ${achievement.description}`} />
        </Panel>
        <Panel title="Historial" icon={History}>
          <WeeklyHistory history={history} />
        </Panel>
      </div>
    </div>
  );
};

const ProfilePanel = ({ progress, history, bodyProfile, onSaveBodyProfile, saving }) => {
  const [range, setRange] = useState("day");
  const stats = progress?.stats ?? emptyProgress().stats;
  const records = progress?.records ?? [];
  const level = Math.max(1, Math.floor((Number(stats.totalWorkouts) || 0) / 4) + 1);
  const summary = rangeSummary(history, range);
  const todayRecords = records.filter((record) => isSameDay(record.achievedAt, new Date())).slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="app-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-surface-card-high bg-surface-low text-primary-soft">
                <UserRound className="h-10 w-10" />
              </div>
              <div className="absolute -bottom-2 right-0 rounded-full border-2 border-fondo-oscuro bg-primary-vanguard px-2 py-1 font-numeric text-xs font-black text-white">
                Lv. {level}
              </div>
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-primary-soft">Marca personal</p>
              <h1 className="text-3xl font-black">Progreso y perfil</h1>
              <p className="mt-1 font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
                {stats.totalWorkouts} entrenos completados · {stats.bestStreak} días mejor racha
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Metric label="Racha" value={`${stats.currentStreak}`} />
            <Metric label="Entrenos" value={stats.totalWorkouts} />
            <Metric label="Días" value={stats.trainedDays} />
          </div>
        </div>
      </section>

      <BodyProfileCard bodyProfile={bodyProfile} onSave={onSaveBodyProfile} saving={saving} />

      <div className="grid xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] gap-4">
        <Panel title="Calendario mensual" icon={CalendarDays}>
          <MonthlyCalendar history={history} />
        </Panel>
        <Panel title="Resumen" icon={Activity}>
          <RangeSelector value={range} onChange={setRange} />
          {summary.workouts === 0 ? (
            <EmptyState text={range === "day" ? "Hoy todavía no hay entreno guardado. Empieza uno y deja el día marcado." : "No hay registros en este periodo. Buen momento para volver a sumar."} />
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric label="Entrenos" value={summary.workouts} />
              <Metric label="Series" value={summary.sets} />
              <Metric label="Volumen" value={`${summary.volume} kg`} />
              <Metric label="Tiempo" value={formatDuration(summary.seconds)} />
            </div>
          )}
        </Panel>
      </div>

      <div className="grid xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)] gap-4">
        <Panel title="Últimos logros del día" icon={Award}>
          {todayRecords.length > 0 ? (
            <RecordList records={todayRecords} />
          ) : (
            <EmptyState text="Los logros aparecerán aquí cuando finalices un entreno y superes tu marca." />
          )}
        </Panel>
        <Panel title="Mapa muscular" icon={Flame}>
          <MuscleMap groups={progress?.muscles?.week ?? []} />
        </Panel>
      </div>

      <Panel title="Historial semanal" icon={History}>
        <WeeklyHistory history={history} />
      </Panel>
    </div>
  );
};

const LoginRequiredPanel = ({ onLoginClick }) => (
  <Panel>
    <div className="mx-auto max-w-xl py-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-low text-primary-soft">
        <UserRound className="h-9 w-9" />
      </div>
      <h2 className="mt-4 text-2xl font-black">Inicia sesión para registrar tus entrenos</h2>
      <p className="mt-2 font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
        Tu marca personal guarda series, repeticiones, peso, tiempo, progreso y récords al finalizar entrenamientos.
      </p>
      <button onClick={onLoginClick} className="app-focus mt-5 min-h-touch-target rounded-lg bg-primary-vanguard px-5 font-black text-white">
        Entrar o crear cuenta
      </button>
    </div>
  </Panel>
);

const BodyProfileCard = ({ bodyProfile, onSave, saving }) => {
  const [heightCm, setHeightCm] = useState(bodyProfile?.heightCm ?? 175);
  const [weightKg, setWeightKg] = useState(bodyProfile?.weightKg ?? 70);

  useEffect(() => {
    setHeightCm(bodyProfile?.heightCm ?? 175);
    setWeightKg(bodyProfile?.weightKg ?? 70);
  }, [bodyProfile?.heightCm, bodyProfile?.weightKg]);

  const dirty = Number(heightCm) !== Number(bodyProfile?.heightCm ?? 175) || Number(weightKg) !== Number(bodyProfile?.weightKg ?? 70);

  return (
    <Panel title="Perfil físico" icon={UserRound}>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <WheelNumber label="Altura" value={heightCm} min={120} max={230} step={1} suffix="cm" display={(value) => `${(Number(value) / 100).toFixed(2).replace(".", ",")} m`} onChange={setHeightCm} />
        <WheelNumber label="Peso" value={weightKg} min={35} max={250} step={0.5} suffix="kg" display={(value) => `${Number(value).toFixed(1).replace(".", ",")} kg`} onChange={setWeightKg} />
        <button
          onClick={() => onSave({ heightCm: Number(heightCm), weightKg: Number(weightKg) })}
          disabled={saving || !dirty}
          className="app-focus min-h-touch-target rounded-lg bg-primary-vanguard px-5 font-black text-white disabled:opacity-50"
        >
          Guardar perfil
        </button>
      </div>
      <p className="mt-3 text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
        En ejercicios de peso corporal se usará este peso para calcular volumen si no pones kilos manualmente.
      </p>
    </Panel>
  );
};

const WheelNumber = ({ label, value, min, max, step, suffix, display, onChange }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">{label}</span>
    <div className="rounded-xl border border-borde-claro dark:border-borde-oscuro bg-surface-low p-3">
      <div className="mb-2 text-center font-numeric text-3xl font-black text-primary-soft">{display(value)}</div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-primary-vanguard"
        aria-label={`${label} en ${suffix}`}
      />
    </div>
  </label>
);

const RangeSelector = ({ value, onChange }) => (
  <div className="grid grid-cols-3 gap-1 rounded-lg border border-borde-claro dark:border-borde-oscuro bg-surface-low p-1">
    {[
      ["day", "Día"],
      ["week", "Semana"],
      ["month", "Mes"],
    ].map(([key, label]) => (
      <button
        key={key}
        onClick={() => onChange(key)}
        className={`app-focus min-h-touch-target rounded-md font-black ${value === key ? "bg-primary-vanguard text-white" : "text-texto-secundario-claro dark:text-texto-secundario-oscuro"}`}
      >
        {label}
      </button>
    ))}
  </div>
);

const MonthlyCalendar = ({ history }) => {
  const today = new Date();
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const trained = new Set(history.map((item) => item.completedAt && dateKey(new Date(item.completedAt))).filter(Boolean));
  const cells = Array.from({ length: offset + daysInMonth }, (_, index) => (index < offset ? null : index - offset + 1));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-black capitalize">{today.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}</p>
        <p className="text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">{trained.size} días con entreno</p>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
          <span key={day} className="text-xs font-black text-texto-secundario-claro dark:text-texto-secundario-oscuro">{day}</span>
        ))}
        {cells.map((day, index) => {
          if (!day) return <span key={`empty-${index}`} />;
          const date = new Date(today.getFullYear(), today.getMonth(), day);
          const key = dateKey(date);
          const done = trained.has(key);
          const isToday = key === dateKey(today);
          return (
            <div key={key} className={`flex aspect-square items-center justify-center rounded-lg border font-numeric font-black ${done ? "border-success-vanguard bg-success-vanguard text-green-950" : isToday ? "border-primary-soft bg-primary-vanguard/15 text-primary-soft" : "border-borde-claro dark:border-borde-oscuro bg-surface-low"}`}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const VolumeChart = ({ data }) => {
  const maxVolume = Math.max(1, ...data.map((item) => item.volume));
  const maxSets = Math.max(1, ...data.map((item) => item.sets));
  const points = data
    .map((item, index) => {
      const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
      const y = 100 - (item.sets / maxSets) * 82 - 8;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-3">
      <div className="relative flex h-56 items-end gap-2 rounded-lg bg-surface-low p-4">
        <svg className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
          <line x1="0" y1="0" x2="0" y2="100" stroke="#434655" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="100" x2="100" y2="100" stroke="#434655" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="66" x2="100" y2="66" stroke="#33343d" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="33" x2="100" y2="33" stroke="#33343d" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <polyline fill="none" points={points} stroke="#53e076" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        </svg>
        {data.map((item) => (
          <div key={item.key} className="relative z-10 flex flex-1 flex-col items-center justify-end gap-2">
            <div
              className="w-full max-w-8 rounded-t bg-primary-soft"
              style={{ height: `${Math.max(10, (item.volume / maxVolume) * 100)}%` }}
              title={`${item.volume} kg`}
            />
            <span className="font-numeric text-[10px] font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
        <span>Barra: volumen</span>
        <span className="text-success-soft">Línea: series</span>
      </div>
    </div>
  );
};

const FrequencyCard = ({ stats, history }) => {
  const monthGoal = 24;
  const progress = Math.min(100, Math.round(((Number(stats.totalWorkouts) || 0) / monthGoal) * 100));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="font-numeric text-3xl font-black text-primary-soft">{stats.totalWorkouts}</p>
          <p className="text-xs font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">Entrenos</p>
        </div>
        <div>
          <p className="font-numeric text-3xl font-black text-success-soft">{averagePerWeek(history)}</p>
          <p className="text-xs font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">Media/sem</p>
        </div>
        <div>
          <p className="font-numeric text-3xl font-black">{formatHours(history)}</p>
          <p className="text-xs font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">Tiempo</p>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-variant">
        <div className="h-full rounded-full bg-primary-soft" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-right text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
        Objetivo: {monthGoal} entrenos / mes
      </p>
    </div>
  );
};

const WeeklyActivity = ({ history }) => {
  const days = weeklyActivity(history);

  return (
    <div className="flex justify-between gap-2">
      {days.map((day) => (
        <div key={day.key} className="flex flex-col items-center gap-2">
          <span className="font-numeric text-xs font-black text-texto-secundario-claro dark:text-texto-secundario-oscuro">
            {day.label}
          </span>
          <span className={`flex h-9 w-9 items-center justify-center rounded-full ${day.done ? "bg-success-vanguard text-green-950" : day.today ? "border-2 border-dashed border-primary-soft bg-surface-low" : "bg-surface-variant"}`}>
            {day.done && <Check className="h-4 w-4" />}
          </span>
        </div>
      ))}
    </div>
  );
};

const WeeklyHistory = ({ history }) => {
  const days = weeklyHistory(history).filter((day) => day.items.length > 0);

  if (days.length === 0) {
    return <EmptyState text="Esta semana aún no hay entrenos guardados. Cuando entrenes, aparecerá aquí el día completado." />;
  }

  return (
    <div className="space-y-2">
      {days.map((day) => (
        <div key={day.key} className="rounded-lg bg-surface-low p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-black">{day.label}</p>
            <p className="text-xs font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">{day.dateLabel}</p>
          </div>
          <div className="mt-2 space-y-2">
            {day.items.map((item) => (
              <div key={item.id} className="rounded-lg border border-borde-claro dark:border-borde-oscuro bg-surface-card px-3 py-2">
                <p className="font-black">{item.name}</p>
                <p className="text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
                  {formatDuration(item.durationSeconds)} · {item.completedSets} series · {item.volume} kg
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const RecordList = ({ records }) =>
  records.length === 0 ? (
    <EmptyState text="Aún no hay récords. Completa un entreno para empezar." />
  ) : (
    <div className="space-y-2">
      {records.map((record, index) => (
        <div key={`${record.exerciseId}-${record.type}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-surface-low p-3">
          <div>
            <p className="font-black">{exerciseDisplayName(record)}</p>
            <p className="text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
              {recordLabel(record.type)}
            </p>
          </div>
          <p className="font-numeric text-lg font-black text-success-soft">{formatRecordValue(record)}</p>
        </div>
      ))}
    </div>
  );

const ProfileRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-low p-3">
    <span className="font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">{label}</span>
    <strong className="font-numeric text-primary-soft">{value}</strong>
  </div>
);

const MuscleMap = ({ groups }) => {
  const map = Object.fromEntries(groups.map((group) => [group.muscle, group]));
  const maxSets = Math.max(1, ...groups.map((group) => group.sets));
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {muscleLabels.map((label) => {
        const value = map[label]?.sets ?? 0;
        return (
          <div key={label} className="rounded-lg bg-surface-low border border-borde-claro dark:border-borde-oscuro p-3">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="font-black capitalize">{label}</p>
              <p className="text-sm font-bold">{value} series</p>
            </div>
            <div className="h-3 rounded-full bg-surface-card-high overflow-hidden">
              <div className="h-full bg-success-vanguard" style={{ width: `${Math.round((value / maxSets) * 100)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ExercisePicker = ({ query, setQuery, exercises, onPick, compact = false }) => {
  const [category, setCategory] = useState("todos");
  const [flight, setFlight] = useState(null);
  const normalizedQuery = normalizeText(query);
  const counts = useMemo(() => {
    const next = Object.fromEntries(exerciseCategories.map((item) => [item.value, 0]));
    for (const exercise of exercises) {
      next.todos += 1;
      const key = muscleCategoryForExercise(exercise);
      if (key !== "todos") {
        next[key] = (next[key] ?? 0) + 1;
      }
    }
    return next;
  }, [exercises]);
  const visibleExercises = exercises
    .filter((exercise) => category === "todos" || muscleCategoryForExercise(exercise) === category)
    .filter((exercise) => normalizeText(`${exercise.nombre} ${exercise.musculo} ${exercise.grupoMuscular} ${exercise.specs}`).includes(normalizedQuery))
    .slice(0, compact ? 16 : 28);

  const sendExercise = (event, exercise) => {
    if (flight) return;

    const source = event.currentTarget.getBoundingClientRect();
    const dropzone = document.querySelector("[data-workout-dropzone]");
    const target = dropzone?.getBoundingClientRect();
    const targetLeft = target
      ? target.left + Math.min(28, target.width / 2)
      : window.innerWidth / 2;
    const targetTop = target
      ? Math.min(Math.max(target.bottom - 72, 16), window.innerHeight - 80)
      : window.innerHeight + 80;
    const nextFlight = {
      exercise,
      left: source.left,
      top: source.top,
      width: Math.min(source.width, 320),
      x: targetLeft - source.left,
      y: targetTop - source.top,
      active: false,
    };

    setFlight(nextFlight);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setFlight((current) => current ? { ...current, active: true } : current);
      });
    });
    window.setTimeout(() => onPick(exercise), 380);
    window.setTimeout(() => setFlight(null), 560);
  };

  return (
    <div className="space-y-3">
      {flight && (
        <div
          className="pointer-events-none fixed z-[100] flex items-center gap-3 rounded-lg border border-primary-vanguard bg-tarjeta-clara p-2 text-texto-claro shadow-2xl transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] dark:bg-tarjeta-oscura dark:text-texto-oscuro"
          style={{
            left: flight.left,
            top: flight.top,
            width: flight.width,
            opacity: flight.active ? 0 : 1,
            transform: flight.active
              ? `translate3d(${flight.x}px, ${flight.y}px, 0) scale(.35) rotate(5deg)`
              : "translate3d(0, 0, 0) scale(1)",
          }}
          aria-hidden="true"
        >
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-surface-card-high">
            {flight.exercise.thumbnail ? (
              <img src={assetPath(flight.exercise.thumbnail)} alt="" className="h-full w-full object-cover" />
            ) : (
              <Dumbbell className="m-3 h-6 w-6" />
            )}
          </div>
          <p className="truncate font-black">{flight.exercise.nombre}</p>
        </div>
      )}
      <label className="flex items-center gap-2 rounded-lg border border-borde-claro dark:border-borde-oscuro bg-surface-low px-3">
        <Search className="w-5 h-5 opacity-70" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar ejercicio" className="app-focus w-full min-h-touch-target bg-transparent font-bold" />
      </label>

      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        {exerciseCategories.map((item) => (
          <button
            key={item.value}
            onClick={() => setCategory(item.value)}
            className={`px-3 h-10 rounded-full border text-sm font-black whitespace-nowrap ${
              category === item.value
                ? "bg-primary-vanguard text-white border-transparent"
                : "border-borde-claro dark:border-borde-oscuro bg-surface-card text-texto-secundario-claro dark:text-texto-secundario-oscuro hover:bg-surface-card-high"
            }`}
          >
            {item.label} {counts[item.value] ? <span className="opacity-70">{counts[item.value]}</span> : null}
          </button>
        ))}
      </div>

      <div className={`${compact ? "max-h-[520px]" : "max-h-[620px]"} overflow-y-auto space-y-2 pr-1`}>
        {visibleExercises.length === 0 ? (
          <EmptyState text="No hay ejercicios para ese filtro." />
        ) : (
          visibleExercises.map((exercise) => (
            <button
              key={`${exercise.workoutId}-${exercise.id}`}
              onClick={(event) => sendExercise(event, exercise)}
              disabled={Boolean(flight)}
              className="app-focus w-full rounded-lg border border-borde-claro dark:border-borde-oscuro bg-surface-low p-2 text-left hover:border-primary-vanguard transition-colors disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-surface-card-high overflow-hidden border border-borde-claro dark:border-borde-oscuro flex-shrink-0">
                  {exercise.thumbnail ? (
                    <img src={assetPath(exercise.thumbnail)} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <Dumbbell className="w-6 h-6 m-4 opacity-60" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black truncate">{exercise.nombre}</p>
                  <p className="text-xs font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro truncate">
                    {exercise.musculo} · {exercise.specs}
                  </p>
                  <p className="text-xs font-black text-primary-soft mt-1">
                    {categoryLabel(muscleCategoryForExercise(exercise))}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary-vanguard text-white flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

const Panel = ({ title, icon: Icon, children }) => (
  <section className="app-card min-w-0 overflow-hidden p-4">
    {title && (
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-5 h-5 text-primary-soft" />}
        <h2 className="text-xl font-black">{title}</h2>
      </div>
    )}
    {children}
  </section>
);

const Field = ({ label, value, onChange, type = "text", required = false, placeholder = "", min }) => (
  <label className="block">
    <span className="block text-sm font-bold mb-1 text-texto-secundario-claro dark:text-texto-secundario-oscuro">{label}{required && <span className="text-red-500"> *</span>}</span>
    <input type={type} min={min} value={value ?? ""} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="app-focus w-full min-h-touch-target rounded-lg bg-surface-low border border-borde-claro dark:border-borde-oscuro px-3 font-bold" />
  </label>
);

const MiniField = ({ label, value, onChange, type = "text" }) => (
  <label className="block min-w-0">
    <span className="mb-1 block text-[11px] font-black uppercase tracking-[0.02em] opacity-70 sm:text-xs sm:normal-case sm:tracking-normal">{label}</span>
    <input type={type} min="0" value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="app-focus w-full min-w-0 h-11 rounded-lg bg-surface-card border border-borde-claro dark:border-borde-oscuro px-2 text-sm font-numeric font-bold sm:bg-surface-low" />
  </label>
);

const TextArea = ({ label, value, onChange }) => (
  <label className="block">
    <span className="block text-sm font-bold mb-1 text-texto-secundario-claro dark:text-texto-secundario-oscuro">{label}</span>
    <textarea value={value ?? ""} rows={3} onChange={(event) => onChange(event.target.value)} className="app-focus w-full rounded-lg bg-surface-low border border-borde-claro dark:border-borde-oscuro px-3 py-2 font-bold" />
  </label>
);

const ActionButton = ({ children, onClick, icon: Icon, danger = false, disabled = false, className = "" }) => (
  <button onClick={onClick} disabled={disabled} className={`app-focus flex min-h-touch-target w-full min-w-0 flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-[11px] font-black leading-tight disabled:opacity-50 sm:flex-row sm:gap-2 sm:px-4 sm:text-base sm:leading-normal ${danger ? "border-red-500 text-red-300 hover:bg-red-950" : "border-borde-claro dark:border-borde-oscuro bg-surface-low hover:bg-surface-card-high"} ${className}`}>
    {React.createElement(Icon, { className: "w-5 h-5" })}
    {children}
  </button>
);

const IconButton = ({ children, onClick, label, danger = false, disabled = false }) => (
  <button type="button" onClick={onClick} title={label} aria-label={label} disabled={disabled} className={`app-focus w-10 h-10 rounded-lg border flex items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-35 ${danger ? "border-red-500 text-red-300 hover:bg-red-950" : "border-borde-claro dark:border-borde-oscuro hover:bg-surface-card-high"}`}>
    {children}
  </button>
);

const Alert = ({ children, tone, onClose }) => (
  <div className={`rounded-lg border p-3 font-bold flex items-center justify-between gap-3 ${tone === "error" ? "bg-red-950 text-red-100 border-red-700" : "bg-green-950 text-green-100 border-green-700"}`}>
    <span className="min-w-0 break-words">{children}</span>
    {onClose && <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"><X className="w-4 h-4" /></button>}
  </div>
);

const SuccessModal = ({ message, open, onClose }) => {
  if (!message) return null;

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center px-4 transition-all duration-300 ease-out ${
        open ? "opacity-100 backdrop-blur-sm" : "pointer-events-none opacity-0"
      }`}
      role="status"
      aria-live="polite"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/35" />
      <div
        className={`app-card relative w-full max-w-sm overflow-hidden border-success-vanguard/40 p-5 text-center shadow-2xl transition-all duration-300 ease-out ${
          open ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-95 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-vanguard text-green-950 shadow-inner">
          <Check className="h-7 w-7" />
        </div>
        <p className="text-sm font-black uppercase tracking-wide text-success-soft">
          Guardado
        </p>
        <p className="mt-1 text-lg font-black text-texto-claro dark:text-texto-oscuro">{message}</p>
        <div className="mt-5 h-1 overflow-hidden rounded-full bg-surface-variant">
          <div
            className="h-full rounded-full bg-success-vanguard transition-[width] duration-[1500ms] ease-linear"
            style={{ width: open ? "0%" : "100%" }}
          />
        </div>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ dialog, onCancel, onConfirm }) => {
  if (!dialog) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="app-card w-full max-w-md p-5 shadow-2xl">
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${dialog.danger ? "bg-red-950 text-red-200" : "bg-primary-vanguard text-white"}`}>
          {dialog.danger ? <Trash2 className="h-6 w-6" /> : <Check className="h-6 w-6" />}
        </div>
        <h2 className="text-2xl font-black">{dialog.title}</h2>
        <p className="mt-2 font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
          {dialog.text}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button onClick={onCancel} className="app-focus min-h-touch-target rounded-lg border border-borde-claro dark:border-borde-oscuro bg-surface-low font-black">
            Volver
          </button>
          <button onClick={onConfirm} className={`app-focus min-h-touch-target rounded-lg font-black text-white ${dialog.danger ? "bg-red-700" : "bg-primary-vanguard"}`}>
            {dialog.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ text }) => <div className="rounded-lg border border-dashed border-borde-claro dark:border-borde-oscuro bg-surface-low p-5 text-center font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">{text}</div>;

const Metric = ({ label, value }) => (
  <div className="app-card p-4">
    <p className="text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">{label}</p>
    <p className="font-numeric text-2xl font-black text-primary-soft">{value}</p>
  </div>
);

const List = ({ items, empty, render }) => items.length === 0 ? <EmptyState text={empty} /> : <div className="space-y-2">{items.map((item, index) => <div key={item.id ?? item.type ?? index} className="rounded-lg bg-surface-low border border-borde-claro dark:border-borde-oscuro p-3 font-bold">{render(item)}</div>)}</div>;

const UserTrainingIcon = () => <Dumbbell className="w-12 h-12 mx-auto" />;

async function api(action, options = {}) {
  const response = await fetch(`${API_URL}?action=${action}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: { Accept: "application/json", ...(options.body ? { "Content-Type": "application/json" } : {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "No se pudo completar la operación.");
    error.status = response.status;
    throw error;
  }
  return data;
}

async function authStatus() {
  const response = await fetch(`${AUTH_URL}?action=status`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return { authenticated: false };
  }

  return data;
}

function flattenGymExercises(rutinasData) {
  return (rutinasData?.niveles ?? []).flatMap((workout) =>
    (workout.ejercicios ?? []).map((exercise) => ({ ...exercise, workoutId: workout.id, workoutName: workout.nombre }))
  );
}

function normalizeBootstrap(data) {
  return {
    routines: data.routines ?? [],
    activeSession: data.activeSession ? hydrateSession(data.activeSession) : null,
    history: data.history ?? [],
    progress: data.progress ?? emptyProgress(),
    bodyProfile: data.bodyProfile ?? emptyBodyProfile(),
  };
}

function hydrateSession(session) {
  return {
    ...session,
    exercises: (session.exercises ?? []).map((exercise) => ({
      ...exercise,
      localId: exercise.localId ?? crypto.randomUUID(),
      sets: (exercise.sets ?? []).map((set) => ({ ...set, localId: set.localId ?? crypto.randomUUID() })),
    })),
  };
}

function persistActiveSession(session) {
  try {
    window.localStorage.setItem("ososport-active-session", JSON.stringify(session));
  } catch {
    // The server remains the source of truth when local storage is unavailable.
  }
  window.dispatchEvent(
    new CustomEvent("ososport-workout-change", { detail: { session } })
  );
}

function clearActiveSessionBackup() {
  try {
    window.localStorage.removeItem("ososport-active-session");
  } catch {
    // Nothing else is required when local storage is unavailable.
  }
  window.dispatchEvent(
    new CustomEvent("ososport-workout-change", { detail: { session: null } })
  );
}

function serializeSession(session) {
  return {
    ...session,
    exercises: session.exercises.map((exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) => ({
        ...set,
        weight: blankToNull(set.weight),
        reps: blankToNull(set.reps),
        timeSeconds: blankToNull(set.timeSeconds),
        rpe: blankToNull(set.rpe),
        restSeconds: blankToNull(set.restSeconds),
      })),
    })),
  };
}

function autoResizeTextarea(element) {
  if (!element) return;
  element.style.height = "0px";
  element.style.height = `${element.scrollHeight}px`;
}

function blankToNull(value) {
  return value === "" || value === undefined ? null : value;
}

function normalizeText(value) {
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function muscleCategoryForExercise(exercise) {
  const text = normalizeText(`${exercise.nombre} ${exercise.musculo} ${exercise.grupoMuscular}`);

  if (text.includes("cinta") || text.includes("bike") || text.includes("eliptica") || text.includes("ski") || text.includes("ergometro") || text.includes("cardio")) return "cardio";
  if (text.includes("lumbar") || text.includes("peso muerto") || text.includes("baja")) return "espalda baja";
  if (text.includes("pectoral") || text.includes("pecho") || text.includes("press banca") || text.includes("aperturas")) return "pecho";
  if (text.includes("dorsal") || text.includes("espalda") || text.includes("jalon") || text.includes("remo") || text.includes("dominadas")) return "espalda";
  if (text.includes("hombro") || text.includes("militar") || text.includes("laterales") || text.includes("frontales")) return "hombros";
  if (text.includes("biceps") || text.includes("curl") || text.includes("scott")) return "bíceps";
  if (text.includes("triceps") || text.includes("frances") || text.includes("fondo")) return "tríceps";
  if (text.includes("abdom") || text.includes("core") || text.includes("encogimiento") || text.includes("elevaciones")) return "core";
  if (text.includes("glute") || text.includes("aductor") || text.includes("abductor") || text.includes("sumo")) return "glúteos";
  if (text.includes("cuadriceps") || text.includes("femoral") || text.includes("gemelo") || text.includes("pierna") || text.includes("zancada") || text.includes("prensa")) return "pierna";

  return "todos";
}

function categoryLabel(value) {
  return exerciseCategories.find((category) => category.value === value)?.label ?? "General";
}

function assetPath(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

function formatDuration(seconds = 0) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remaining = safeSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

function buildHistoryChart(history = []) {
  const recent = [...history]
    .filter((item) => item.completedAt)
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
    .slice(-8);

  if (recent.length === 0) {
    return Array.from({ length: 8 }, (_, index) => ({
      key: `empty-${index}`,
      label: `D${index + 1}`,
      volume: 0,
      sets: 0,
    }));
  }

  return recent.map((item) => ({
    key: item.id ?? item.completedAt,
    label: shortDate(item.completedAt),
    volume: Number(item.volume) || 0,
    sets: Number(item.completedSets) || 0,
  }));
}

function weeklyActivity(history = []) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  start.setHours(0, 0, 0, 0);
  const trained = new Set(
    history
      .map((item) => item.completedAt && dateKey(new Date(item.completedAt)))
      .filter(Boolean)
  );
  const labels = ["L", "M", "X", "J", "V", "S", "D"];

  return labels.map((label, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      key: dateKey(date),
      label,
      done: trained.has(dateKey(date)),
      today: dateKey(date) === dateKey(today),
    };
  });
}

function weeklyHistory(history = []) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  start.setHours(0, 0, 0, 0);
  const labels = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  return labels.map((label, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = dateKey(date);
    return {
      key,
      label,
      dateLabel: date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }).replace(".", ""),
      items: history.filter((item) => item.completedAt && dateKey(new Date(item.completedAt)) === key),
    };
  });
}

function averagePerWeek(history = []) {
  if (history.length === 0) return "0.0";
  const dates = history
    .map((item) => item.completedAt && new Date(item.completedAt))
    .filter((date) => date && !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  if (dates.length === 0) return "0.0";
  const days = Math.max(7, Math.ceil((Date.now() - dates[0].getTime()) / 86400000));
  return ((history.length / days) * 7).toFixed(1);
}

function formatHours(history = []) {
  const seconds = history.reduce((total, item) => total + (Number(item.durationSeconds) || 0), 0);
  return `${Math.round(seconds / 3600)}h`;
}

function dateKey(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(value, reference) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return dateKey(date) === dateKey(reference);
}

function rangeSummary(history = [], range = "day") {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (range === "week") {
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  } else if (range === "month") {
    start.setDate(1);
  }

  const items = history.filter((item) => {
    const completed = new Date(item.completedAt);
    return !Number.isNaN(completed.getTime()) && completed >= start && completed <= now;
  });

  return items.reduce(
    (total, item) => ({
      workouts: total.workouts + 1,
      sets: total.sets + (Number(item.completedSets) || 0),
      volume: Math.round((total.volume + (Number(item.volume) || 0)) * 100) / 100,
      seconds: total.seconds + (Number(item.durationSeconds) || 0),
    }),
    { workouts: 0, sets: 0, volume: 0, seconds: 0 }
  );
}

function isBodyweightExercise(exercise) {
  const text = normalizeText(`${exercise?.exerciseName ?? ""} ${exercise?.muscle ?? ""} ${exercise?.muscleGroup ?? ""}`);
  return ["dominada", "flexion", "fondos", "peso corporal", "bodyweight", "sentadilla libre", "abdominal", "plancha"].some((word) => text.includes(word));
}

function shortDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }).replace(".", "");
}

function formatRecordValue(record) {
  const value = Number(record.value) || 0;
  if (record.type === "max_reps") return `${value} reps`;
  if (record.type === "best_time") return formatDuration(value);
  return `${value} kg`;
}

function exerciseDisplayName(record) {
  if (record?.exerciseName && !/^n\d+_/i.test(record.exerciseName)) {
    return record.exerciseName;
  }

  return "Ejercicio registrado";
}

function recordLabel(type) {
  return {
    max_weight: "Mejor peso",
    max_reps: "Máx. reps",
    max_volume: "Mejor volumen",
    estimated_1rm: "1RM estimado",
    best_time: "Mejor tiempo",
  }[type] ?? type;
}

function emptyProgress() {
  return {
    stats: { totalWorkouts: 0, totalSets: 0, totalVolume: 0, currentStreak: 0, bestStreak: 0, trainedDays: 0 },
    records: [],
    achievements: [],
    muscles: { lastSession: [], week: [], month: [] },
  };
}

function emptyBodyProfile() {
  return { heightCm: null, weightKg: null };
}

export default UserTrainingScreen;
