import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Dumbbell,
  LogIn,
  LogOut,
  Plus,
  ReceiptText,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useAppData } from "../data/useAppData";

const emptyLevel = (id) => ({
  id,
  dificultad: "1",
  sexo: "Unisex",
  nombre: "Nuevo nivel",
  slug: `nuevo-nivel-${id}`,
  duracion: "1 mes",
  estructura: "Full Body",
  calentamiento: "",
  enfriamiento: "",
  color: "",
  notas: [],
  ejercicios: [],
});

const emptyExercise = (level, index) => ({
  id: `n${level.id}_${String(index + 1).padStart(2, "0")}`,
  numero: index + 1,
  dia: "",
  nombre: "Nuevo ejercicio",
  nombreCorto: "Ejercicio",
  musculo: "General",
  grupoMuscular: "General",
  specs: "3x12 rep",
  video: "/videos/",
  thumbnail: "/thumbnails/",
  descripcion: "",
  consejos: [],
});

const emptyPlan = (id) => ({
  id,
  nombre: "Nuevo plan",
  descripcion: "Descripción del plan",
  dias: [],
});

const emptyDay = () => ({
  nombre: "Nuevo día",
  comidas: [],
});

const emptyMeal = () => ({
  tipo: "Nueva comida",
  alimentos: [],
});

const clone = (value) => JSON.parse(JSON.stringify(value));

const linesToArray = (value) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const arrayToLines = (value) => (Array.isArray(value) ? value.join("\n") : "");

const api = {
  async status() {
    const response = await fetch(`${import.meta.env.BASE_URL}api/admin-auth.php?action=status`, {
      credentials: "include",
    });
    return response.json();
  },
  async login(credentials) {
    const response = await fetch(`${import.meta.env.BASE_URL}api/admin-auth.php?action=login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "No se pudo iniciar sesión.");
    return payload;
  },
  async logout() {
    await fetch(`${import.meta.env.BASE_URL}api/admin-auth.php?action=logout`, {
      method: "POST",
      credentials: "include",
    });
  },
  async loadContent() {
    const response = await fetch(`${import.meta.env.BASE_URL}api/admin-content.php`, {
      credentials: "include",
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "No se pudo cargar el contenido.");
    return payload;
  },
  async saveContent(content) {
    const response = await fetch(`${import.meta.env.BASE_URL}api/admin-content.php`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "No se pudo guardar.");
    return payload.content;
  },
};

const AdminScreen = ({ onGoBack }) => {
  const { rutinasData, dietasData, updateContent } = useAppData();
  const [auth, setAuth] = useState({ checking: true, authenticated: false, user: null });
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [content, setContent] = useState(() => clone({ rutinas: rutinasData, dietas: dietasData }));
  const [activeArea, setActiveArea] = useState("rutinas");
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedMealIndex, setSelectedMealIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .status()
      .then((payload) => {
        setAuth({
          checking: false,
          authenticated: Boolean(payload.authenticated),
          user: payload.user || null,
        });
      })
      .catch(() => setAuth({ checking: false, authenticated: false, user: null }));
  }, []);

  useEffect(() => {
    if (!auth.authenticated) return;

    api
      .loadContent()
      .then((payload) => {
        setContent(clone(payload));
        setSelectedLevelId(payload.rutinas.niveles[0]?.id ?? null);
        setSelectedExerciseId(payload.rutinas.niveles[0]?.ejercicios?.[0]?.id ?? null);
        setSelectedPlanId(payload.dietas.planes[0]?.id ?? null);
      })
      .catch((loadError) => setError(loadError.message));
  }, [auth.authenticated]);

  const levels = useMemo(() => content.rutinas?.niveles ?? [], [content.rutinas?.niveles]);
  const plans = useMemo(() => content.dietas?.planes ?? [], [content.dietas?.planes]);
  const selectedLevel = levels.find((level) => level.id === selectedLevelId) ?? levels[0] ?? null;
  const selectedExercise =
    selectedLevel?.ejercicios?.find((exercise) => exercise.id === selectedExerciseId) ??
    selectedLevel?.ejercicios?.[0] ??
    null;
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0] ?? null;
  const selectedDay = selectedPlan?.dias?.[selectedDayIndex] ?? null;
  const selectedMeal = selectedDay?.comidas?.[selectedMealIndex] ?? null;

  const stats = useMemo(
    () => ({
      niveles: levels.length,
      ejercicios: levels.reduce((total, level) => total + (level.ejercicios?.length ?? 0), 0),
      planes: plans.length,
      dias: plans.reduce((total, plan) => total + (plan.dias?.length ?? 0), 0),
    }),
    [levels, plans]
  );

  const patchContent = (producer) => {
    setMessage("");
    setError("");
    setContent((current) => {
      const draft = clone(current);
      producer(draft);
      return draft;
    });
  };

  const updateLevel = (key, value) => {
    const nextValue = key === "id" ? Number(value) : value;
    patchContent((draft) => {
      const level = draft.rutinas.niveles.find((item) => item.id === selectedLevel.id);
      level[key] = nextValue;
    });
    if (key === "id") {
      setSelectedLevelId(nextValue);
    }
  };

  const updateExercise = (key, value) => {
    const nextValue = key === "numero" ? Number(value) : value;
    patchContent((draft) => {
      const level = draft.rutinas.niveles.find((item) => item.id === selectedLevel.id);
      const exercise = level.ejercicios.find((item) => item.id === selectedExercise.id);
      exercise[key] = nextValue;
    });
    if (key === "id") {
      setSelectedExerciseId(nextValue);
    }
  };

  const updatePlan = (key, value) => {
    const nextValue = key === "id" ? Number(value) : value;
    patchContent((draft) => {
      const plan = draft.dietas.planes.find((item) => item.id === selectedPlan.id);
      plan[key] = nextValue;
    });
    if (key === "id") {
      setSelectedPlanId(nextValue);
    }
  };

  const updateDay = (key, value) => {
    patchContent((draft) => {
      const plan = draft.dietas.planes.find((item) => item.id === selectedPlan.id);
      plan.dias[selectedDayIndex][key] = value;
    });
  };

  const updateMeal = (key, value) => {
    patchContent((draft) => {
      const plan = draft.dietas.planes.find((item) => item.id === selectedPlan.id);
      plan.dias[selectedDayIndex].comidas[selectedMealIndex][key] =
        key === "alimentos" ? linesToArray(value) : value;
    });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const payload = await api.login(credentials);
      setAuth({ checking: false, authenticated: true, user: payload.user });
      setCredentials({ username: "", password: "" });
    } catch (loginError) {
      setError(loginError.message);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setAuth({ checking: false, authenticated: false, user: null });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const saved = await api.saveContent(content);
      setContent(clone(saved));
      updateContent(saved);
      setMessage("Cambios guardados.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const addLevel = () => {
    const nextId = Math.max(0, ...levels.map((level) => Number(level.id) || 0)) + 1;
    patchContent((draft) => draft.rutinas.niveles.push(emptyLevel(nextId)));
    setSelectedLevelId(nextId);
    setSelectedExerciseId(null);
  };

  const deleteLevel = () => {
    if (!selectedLevel || levels.length <= 1) return;
    patchContent((draft) => {
      draft.rutinas.niveles = draft.rutinas.niveles.filter((level) => level.id !== selectedLevel.id);
    });
    const nextLevel = levels.find((level) => level.id !== selectedLevel.id);
    setSelectedLevelId(nextLevel?.id ?? null);
    setSelectedExerciseId(nextLevel?.ejercicios?.[0]?.id ?? null);
  };

  const addExercise = () => {
    if (!selectedLevel) return;
    const index = selectedLevel.ejercicios?.length ?? 0;
    const exercise = emptyExercise(selectedLevel, index);
    patchContent((draft) => {
      const level = draft.rutinas.niveles.find((item) => item.id === selectedLevel.id);
      level.ejercicios = [...(level.ejercicios ?? []), exercise];
    });
    setSelectedExerciseId(exercise.id);
  };

  const deleteExercise = () => {
    if (!selectedLevel || !selectedExercise) return;
    patchContent((draft) => {
      const level = draft.rutinas.niveles.find((item) => item.id === selectedLevel.id);
      level.ejercicios = level.ejercicios.filter((exercise) => exercise.id !== selectedExercise.id);
    });
    const nextExercise = selectedLevel.ejercicios.find((exercise) => exercise.id !== selectedExercise.id);
    setSelectedExerciseId(nextExercise?.id ?? null);
  };

  const addPlan = () => {
    const nextId = Math.max(0, ...plans.map((plan) => Number(plan.id) || 0)) + 1;
    patchContent((draft) => draft.dietas.planes.push(emptyPlan(nextId)));
    setSelectedPlanId(nextId);
    setSelectedDayIndex(0);
    setSelectedMealIndex(0);
  };

  const deletePlan = () => {
    if (!selectedPlan || plans.length <= 1) return;
    patchContent((draft) => {
      draft.dietas.planes = draft.dietas.planes.filter((plan) => plan.id !== selectedPlan.id);
    });
    const nextPlan = plans.find((plan) => plan.id !== selectedPlan.id);
    setSelectedPlanId(nextPlan?.id ?? null);
    setSelectedDayIndex(0);
    setSelectedMealIndex(0);
  };

  const addDay = () => {
    if (!selectedPlan) return;
    patchContent((draft) => {
      const plan = draft.dietas.planes.find((item) => item.id === selectedPlan.id);
      plan.dias = [...(plan.dias ?? []), emptyDay()];
    });
    setSelectedDayIndex(selectedPlan.dias?.length ?? 0);
    setSelectedMealIndex(0);
  };

  const deleteDay = () => {
    if (!selectedPlan || !selectedDay) return;
    patchContent((draft) => {
      const plan = draft.dietas.planes.find((item) => item.id === selectedPlan.id);
      plan.dias.splice(selectedDayIndex, 1);
    });
    setSelectedDayIndex(Math.max(0, selectedDayIndex - 1));
    setSelectedMealIndex(0);
  };

  const addMeal = () => {
    if (!selectedDay) return;
    patchContent((draft) => {
      const plan = draft.dietas.planes.find((item) => item.id === selectedPlan.id);
      plan.dias[selectedDayIndex].comidas = [
        ...(plan.dias[selectedDayIndex].comidas ?? []),
        emptyMeal(),
      ];
    });
    setSelectedMealIndex(selectedDay.comidas?.length ?? 0);
  };

  const deleteMeal = () => {
    if (!selectedMeal) return;
    patchContent((draft) => {
      const plan = draft.dietas.planes.find((item) => item.id === selectedPlan.id);
      plan.dias[selectedDayIndex].comidas.splice(selectedMealIndex, 1);
    });
    setSelectedMealIndex(Math.max(0, selectedMealIndex - 1));
  };

  if (auth.checking) {
    return <AdminShell onGoBack={onGoBack}>Cargando...</AdminShell>;
  }

  if (!auth.authenticated) {
    return (
      <AdminShell onGoBack={onGoBack}>
        <div className="max-w-md mx-auto bg-tarjeta-clara dark:bg-tarjeta-oscura border border-borde-claro dark:border-borde-oscuro rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-nivel-1-claro dark:bg-nivel-1-oscuro text-white flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Acceso admin</h1>
              <p className="text-texto-secundario-claro dark:text-texto-secundario-oscuro">
                OsoSport Gym
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <Field
              label="Usuario"
              value={credentials.username}
              onChange={(value) => setCredentials((current) => ({ ...current, username: value }))}
              autoComplete="username"
            />
            <Field
              label="Contraseña"
              type="password"
              value={credentials.password}
              onChange={(value) => setCredentials((current) => ({ ...current, password: value }))}
              autoComplete="current-password"
            />
            {error && <Alert tone="error">{error}</Alert>}
            <button className="w-full min-h-touch-target rounded-xl bg-nivel-1-claro dark:bg-nivel-1-oscuro text-white font-black flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" />
              Entrar
            </button>
          </form>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell onGoBack={onGoBack}>
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black">Panel admin</h1>
            <p className="text-texto-secundario-claro dark:text-texto-secundario-oscuro">
              {auth.user?.displayName || auth.user?.username}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex gap-2">
            <Stat label="Niveles" value={stats.niveles} />
            <Stat label="Ejercicios" value={stats.ejercicios} />
            <Stat label="Planes" value={stats.planes} />
            <Stat label="Días" value={stats.dias} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <SegmentedControl
            value={activeArea}
            onChange={setActiveArea}
            options={[
              { value: "rutinas", label: "Rutinas", icon: Dumbbell },
              { value: "dietas", label: "Dietas", icon: ReceiptText },
            ]}
          />
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              onClick={handleSave}
              disabled={saving}
              className="min-h-touch-target px-4 rounded-xl bg-nivel-1-claro dark:bg-nivel-1-oscuro text-white font-black flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Save className="w-5 h-5" />
              {saving ? "Guardando" : "Guardar"}
            </button>
            <button
              onClick={handleLogout}
              className="min-h-touch-target px-4 rounded-xl border border-borde-claro dark:border-borde-oscuro font-bold flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Salir
            </button>
          </div>
        </div>

        {message && <Alert tone="success">{message}</Alert>}
        {error && <Alert tone="error">{error}</Alert>}

        {activeArea === "rutinas" ? (
          <RoutineEditor
            levels={levels}
            selectedLevel={selectedLevel}
            selectedExercise={selectedExercise}
            setSelectedLevelId={setSelectedLevelId}
            setSelectedExerciseId={setSelectedExerciseId}
            updateLevel={updateLevel}
            updateExercise={updateExercise}
            addLevel={addLevel}
            deleteLevel={deleteLevel}
            addExercise={addExercise}
            deleteExercise={deleteExercise}
          />
        ) : (
          <DietEditor
            plans={plans}
            selectedPlan={selectedPlan}
            selectedDay={selectedDay}
            selectedMeal={selectedMeal}
            selectedDayIndex={selectedDayIndex}
            selectedMealIndex={selectedMealIndex}
            setSelectedPlanId={setSelectedPlanId}
            setSelectedDayIndex={setSelectedDayIndex}
            setSelectedMealIndex={setSelectedMealIndex}
            updatePlan={updatePlan}
            updateDay={updateDay}
            updateMeal={updateMeal}
            addPlan={addPlan}
            deletePlan={deletePlan}
            addDay={addDay}
            deleteDay={deleteDay}
            addMeal={addMeal}
            deleteMeal={deleteMeal}
          />
        )}
      </div>
    </AdminShell>
  );
};

const AdminShell = ({ children, onGoBack }) => (
  <div className="bg-fondo-claro dark:bg-fondo-oscuro min-h-screen p-4 pb-24">
    <div className="max-w-7xl mx-auto mb-4">
      <button
        onClick={onGoBack}
        className="min-h-touch-target px-4 rounded-xl bg-tarjeta-clara dark:bg-tarjeta-oscura border border-borde-claro dark:border-borde-oscuro font-bold flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver
      </button>
    </div>
    {children}
  </div>
);

const RoutineEditor = ({
  levels,
  selectedLevel,
  selectedExercise,
  setSelectedLevelId,
  setSelectedExerciseId,
  updateLevel,
  updateExercise,
  addLevel,
  deleteLevel,
  addExercise,
  deleteExercise,
}) => (
  <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-4">
    <Panel>
      <PanelHeader title="Niveles" action={addLevel} />
      <Picker
        items={levels}
        selectedId={selectedLevel?.id}
        label={(level) => `${level.nombre} · ${level.sexo}`}
        onSelect={(level) => {
          setSelectedLevelId(level.id);
          setSelectedExerciseId(level.ejercicios?.[0]?.id ?? null);
        }}
      />
    </Panel>

    {selectedLevel && (
      <div className="grid xl:grid-cols-2 gap-4">
        <Panel>
          <PanelHeader title="Nivel" danger={deleteLevel} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="ID" type="number" value={selectedLevel.id} onChange={(value) => updateLevel("id", value)} />
            <Field label="Dificultad" value={selectedLevel.dificultad} onChange={(value) => updateLevel("dificultad", value)} />
            <Field label="Nombre" value={selectedLevel.nombre} onChange={(value) => updateLevel("nombre", value)} />
            <Field label="Sexo" value={selectedLevel.sexo} onChange={(value) => updateLevel("sexo", value)} />
            <Field label="Slug" value={selectedLevel.slug} onChange={(value) => updateLevel("slug", value)} />
            <Field label="Duración" value={selectedLevel.duracion} onChange={(value) => updateLevel("duracion", value)} />
            <Field label="Estructura" value={selectedLevel.estructura} onChange={(value) => updateLevel("estructura", value)} />
            <Field label="Color" value={selectedLevel.color || ""} onChange={(value) => updateLevel("color", value)} />
          </div>
          <TextArea label="Calentamiento" value={selectedLevel.calentamiento || ""} onChange={(value) => updateLevel("calentamiento", value)} />
          <TextArea label="Enfriamiento" value={selectedLevel.enfriamiento || ""} onChange={(value) => updateLevel("enfriamiento", value)} />
          <TextArea label="Notas" value={arrayToLines(selectedLevel.notas)} onChange={(value) => updateLevel("notas", linesToArray(value))} rows={5} />
        </Panel>

        <Panel>
          <PanelHeader title="Ejercicios" action={addExercise} danger={selectedExercise ? deleteExercise : null} />
          <Picker
            items={selectedLevel.ejercicios ?? []}
            selectedId={selectedExercise?.id}
            label={(exercise) => `${exercise.numero}. ${exercise.nombre}`}
            onSelect={(exercise) => setSelectedExerciseId(exercise.id)}
          />
          {selectedExercise && (
            <div className="mt-4 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="ID" value={selectedExercise.id} onChange={(value) => updateExercise("id", value)} />
                <Field label="Número" type="number" value={selectedExercise.numero} onChange={(value) => updateExercise("numero", value)} />
                <Field label="Nombre" value={selectedExercise.nombre} onChange={(value) => updateExercise("nombre", value)} />
                <Field label="Nombre corto" value={selectedExercise.nombreCorto} onChange={(value) => updateExercise("nombreCorto", value)} />
                <Field label="Día" value={selectedExercise.dia || ""} onChange={(value) => updateExercise("dia", value)} />
                <Field label="Series/reps" value={selectedExercise.specs} onChange={(value) => updateExercise("specs", value)} />
                <Field label="Músculo" value={selectedExercise.musculo} onChange={(value) => updateExercise("musculo", value)} />
                <Field label="Grupo" value={selectedExercise.grupoMuscular} onChange={(value) => updateExercise("grupoMuscular", value)} />
                <Field label="Vídeo" value={selectedExercise.video} onChange={(value) => updateExercise("video", value)} />
                <Field label="Miniatura" value={selectedExercise.thumbnail} onChange={(value) => updateExercise("thumbnail", value)} />
              </div>
              <TextArea label="Descripción" value={selectedExercise.descripcion || ""} onChange={(value) => updateExercise("descripcion", value)} />
              <TextArea label="Consejos" value={arrayToLines(selectedExercise.consejos)} onChange={(value) => updateExercise("consejos", linesToArray(value))} rows={5} />
            </div>
          )}
        </Panel>
      </div>
    )}
  </div>
);

const DietEditor = ({
  plans,
  selectedPlan,
  selectedDay,
  selectedMeal,
  selectedDayIndex,
  selectedMealIndex,
  setSelectedPlanId,
  setSelectedDayIndex,
  setSelectedMealIndex,
  updatePlan,
  updateDay,
  updateMeal,
  addPlan,
  deletePlan,
  addDay,
  deleteDay,
  addMeal,
  deleteMeal,
}) => (
  <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-4">
    <Panel>
      <PanelHeader title="Planes" action={addPlan} />
      <Picker
        items={plans}
        selectedId={selectedPlan?.id}
        label={(plan) => plan.nombre}
        onSelect={(plan) => {
          setSelectedPlanId(plan.id);
          setSelectedDayIndex(0);
          setSelectedMealIndex(0);
        }}
      />
    </Panel>

    {selectedPlan && (
      <div className="grid xl:grid-cols-3 gap-4">
        <Panel>
          <PanelHeader title="Plan" danger={deletePlan} />
          <div className="space-y-3">
            <Field label="ID" type="number" value={selectedPlan.id} onChange={(value) => updatePlan("id", value)} />
            <Field label="Nombre" value={selectedPlan.nombre} onChange={(value) => updatePlan("nombre", value)} />
            <TextArea label="Descripción" value={selectedPlan.descripcion} onChange={(value) => updatePlan("descripcion", value)} />
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Días" action={addDay} danger={selectedDay ? deleteDay : null} />
          <IndexPicker
            items={selectedPlan.dias ?? []}
            selectedIndex={selectedDayIndex}
            label={(day) => day.nombre}
            onSelect={(index) => {
              setSelectedDayIndex(index);
              setSelectedMealIndex(0);
            }}
          />
          {selectedDay && (
            <div className="mt-4">
              <Field label="Nombre del día" value={selectedDay.nombre} onChange={(value) => updateDay("nombre", value)} />
            </div>
          )}
        </Panel>

        <Panel>
          <PanelHeader title="Comidas" action={selectedDay ? addMeal : null} danger={selectedMeal ? deleteMeal : null} />
          {selectedDay && (
            <IndexPicker
              items={selectedDay.comidas ?? []}
              selectedIndex={selectedMealIndex}
              label={(meal) => meal.tipo}
              onSelect={setSelectedMealIndex}
            />
          )}
          {selectedMeal && (
            <div className="mt-4 space-y-3">
              <Field label="Tipo" value={selectedMeal.tipo} onChange={(value) => updateMeal("tipo", value)} />
              <TextArea label="Alimentos" value={arrayToLines(selectedMeal.alimentos)} onChange={(value) => updateMeal("alimentos", value)} rows={8} />
            </div>
          )}
        </Panel>
      </div>
    )}
  </div>
);

const Panel = ({ children }) => (
  <section className="bg-tarjeta-clara dark:bg-tarjeta-oscura border border-borde-claro dark:border-borde-oscuro rounded-2xl p-4 shadow-lg">
    {children}
  </section>
);

const PanelHeader = ({ title, action, danger }) => (
  <div className="flex items-center justify-between gap-2 mb-4">
    <h2 className="text-xl font-black">{title}</h2>
    <div className="flex gap-2">
      {action && (
        <IconButton onClick={action} label="Añadir">
          <Plus className="w-5 h-5" />
        </IconButton>
      )}
      {danger && (
        <IconButton onClick={danger} label="Eliminar" danger>
          <Trash2 className="w-5 h-5" />
        </IconButton>
      )}
    </div>
  </div>
);

const Picker = ({ items, selectedId, label, onSelect }) => (
  <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
    {items.map((item) => (
      <button
        key={item.id}
        onClick={() => onSelect(item)}
        className={`w-full min-h-touch-target text-left px-4 py-3 rounded-xl border transition-colors ${
          item.id === selectedId
            ? "bg-fondo-claro dark:bg-fondo-oscuro border-nivel-1-claro dark:border-nivel-1-oscuro font-black"
            : "border-borde-claro dark:border-borde-oscuro hover:bg-fondo-claro dark:hover:bg-fondo-oscuro"
        }`}
      >
        {label(item)}
      </button>
    ))}
  </div>
);

const IndexPicker = ({ items, selectedIndex, label, onSelect }) => (
  <div className="space-y-2 max-h-[320px] overflow-auto pr-1">
    {items.map((item, index) => (
      <button
        key={`${label(item)}-${index}`}
        onClick={() => onSelect(index)}
        className={`w-full min-h-touch-target text-left px-4 py-3 rounded-xl border transition-colors ${
          index === selectedIndex
            ? "bg-fondo-claro dark:bg-fondo-oscuro border-dieta-ganar-claro dark:border-dieta-ganar-oscuro font-black"
            : "border-borde-claro dark:border-borde-oscuro hover:bg-fondo-claro dark:hover:bg-fondo-oscuro"
        }`}
      >
        {label(item)}
      </button>
    ))}
  </div>
);

const Field = ({ label, value, onChange, type = "text", autoComplete }) => (
  <label className="block">
    <span className="block text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro mb-1">
      {label}
    </span>
    <input
      type={type}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      autoComplete={autoComplete}
      className="w-full min-h-touch-target rounded-xl border border-borde-claro dark:border-borde-oscuro bg-fondo-claro dark:bg-fondo-oscuro px-4 text-texto-claro dark:text-texto-oscuro outline-none focus:ring-2 focus:ring-nivel-1-claro dark:focus:ring-nivel-1-oscuro"
    />
  </label>
);

const TextArea = ({ label, value, onChange, rows = 4 }) => (
  <label className="block mt-3">
    <span className="block text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro mb-1">
      {label}
    </span>
    <textarea
      rows={rows}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-borde-claro dark:border-borde-oscuro bg-fondo-claro dark:bg-fondo-oscuro px-4 py-3 text-texto-claro dark:text-texto-oscuro outline-none focus:ring-2 focus:ring-nivel-1-claro dark:focus:ring-nivel-1-oscuro"
    />
  </label>
);

const SegmentedControl = ({ value, onChange, options }) => (
  <div className="grid grid-cols-2 rounded-xl border border-borde-claro dark:border-borde-oscuro bg-tarjeta-clara dark:bg-tarjeta-oscura p-1">
    {options.map((option) => {
      const Icon = option.icon;
      const active = value === option.value;
      return (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`min-h-touch-target px-4 rounded-lg font-black flex items-center justify-center gap-2 ${
            active ? "bg-fondo-claro dark:bg-fondo-oscuro" : "opacity-70"
          }`}
        >
          <Icon className="w-5 h-5" />
          {option.label}
        </button>
      );
    })}
  </div>
);

const Stat = ({ label, value }) => (
  <div className="bg-tarjeta-clara dark:bg-tarjeta-oscura border border-borde-claro dark:border-borde-oscuro rounded-xl px-4 py-2 min-w-24">
    <div className="text-2xl font-black">{value}</div>
    <div className="text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
      {label}
    </div>
  </div>
);

const IconButton = ({ children, onClick, label, danger = false }) => (
  <button
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
      danger
        ? "border-red-300 text-red-600 dark:border-red-800 dark:text-red-300"
        : "border-borde-claro dark:border-borde-oscuro text-texto-claro dark:text-texto-oscuro"
    } hover:bg-fondo-claro dark:hover:bg-fondo-oscuro`}
  >
    {children}
  </button>
);

const Alert = ({ tone, children }) => {
  const toneClass =
    tone === "success"
      ? "border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-100"
      : "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-100";

  return (
    <div className={`border rounded-xl px-4 py-3 font-bold flex items-center gap-2 ${toneClass}`}>
      {tone === "success" && <Check className="w-5 h-5" />}
      {children}
    </div>
  );
};

export default AdminScreen;
