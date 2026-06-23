import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Dumbbell,
  Eye,
  EyeOff,
  Image,
  LogIn,
  LogOut,
  Plus,
  Play,
  ReceiptText,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { useAppData } from "../data/useAppData";
import { defaultDietColors, defaultLevelColors, getDietColor, getLevelColor } from "../utils/contentColors";

const emptyLevel = (id) => ({
  id,
  nivel: 1,
  dificultad: "1",
  sexo: "Unisex",
  nombre: "Nuevo entreno",
  slug: `nuevo-entreno-${id}`,
  duracion: "1 mes",
  estructura: "Full Body",
  calentamiento: "",
  enfriamiento: "",
  color: defaultLevelColors[id] || "#166534",
  notas: [],
  dias: [emptyTrainingDay("Entreno completo", true)],
  ejercicios: [],
});

const emptyExercise = (level, index, values = {}) => ({
  id: `n${level.id}_${String(index + 1).padStart(2, "0")}`,
  numero: index + 1,
  dia: "",
  nombre: values.nombre || "Nuevo ejercicio",
  nombreCorto: values.nombreCorto || values.nombre || "Ejercicio",
  musculo: "General",
  grupoMuscular: "General",
  specs: values.specs || "3x12 rep",
  video: values.video || "/videos/",
  thumbnail: values.thumbnail || "/thumbnails/",
  descripcion: values.descripcion || "",
  consejos: [],
});

function emptyTrainingDay(nombre = "Nuevo día", isDefault = false) {
  return {
    id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    nombre,
    isDefault,
    ejercicios: [],
  };
}

const emptyPlan = (id) => ({
  id,
  nombre: "Nuevo plan",
  descripcion: "Descripción del plan",
  color: defaultDietColors[id] || "#0D9488",
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

const difficultyOptions = [
  { value: "0", label: "0 · Inicial/Cardio" },
  { value: "1", label: "1 · Principiante" },
  { value: "2", label: "2 · Intermedia" },
  { value: "3", label: "3 · Avanzada" },
];

const sexOptions = [
  { value: "Unisex", label: "Unisex" },
  { value: "Hombre", label: "Hombre" },
  { value: "Mujer", label: "Mujer" },
];

const durationOptions = [
  { value: "1 mes", label: "1 mes" },
  { value: "2 a 3 meses", label: "2 a 3 meses" },
  { value: "3 meses", label: "3 meses" },
  { value: "4 a 6 meses", label: "4 a 6 meses" },
];

const structureOptions = [
  { value: "Full Body", label: "Full Body" },
  { value: "Dividida (Opciones de Cardio)", label: "Dividida · opciones de cardio" },
  { value: "Dividida (Lunes/Jueves y Martes/Viernes)", label: "Dividida · 2 días" },
  { value: "Dividida (Lunes, Martes, Miércoles - se repite el ciclo)", label: "Dividida · 3 días" },
];

const muscleOptions = [
  "Abdomen",
  "Abdominal (Abdomen)",
  "Bíceps",
  "Cardio",
  "Cuádriceps",
  "Dorsal",
  "Dorsales",
  "Femoral",
  "Full body",
  "Gemelos",
  "Glúteos y Aductores",
  "Hombro",
  "Hombros",
  "Pectoral",
  "Pectorales",
  "Piernas",
  "Tríceps",
].map((value) => ({ value, label: value }));

const groupOptions = [
  "Brazos",
  "Cardio",
  "Core",
  "Espalda",
  "General",
  "Hombros",
  "Pecho",
  "Pierna",
  "Pierna / Glúteos",
  "Tren Superior",
].map((value) => ({ value, label: value }));

const normalizeAdminContent = (payload) => {
  const normalized = clone(payload);
  normalized.rutinas = normalized.rutinas || {};
  const workouts = normalized.rutinas.entrenos || normalized.rutinas.niveles || [];
  normalized.rutinas.niveles = workouts.map(normalizeTrainingLevel);
  normalized.rutinas.entrenos = normalized.rutinas.niveles;
  normalized.dietas = normalized.dietas || { planes: [] };
  normalized.dietas.planes = normalized.dietas.planes || [];
  return normalized;
};

const normalizeTrainingLevel = (level) => {
  const normalized = {
    ...level,
    nivel: Number(level.nivel ?? level.dificultad ?? 0),
    dificultad: String(level.nivel ?? level.dificultad ?? ""),
    dias: normalizeTrainingDays(level),
  };

  normalized.ejercicios = flattenTrainingExercises(normalized);
  return normalized;
};

const normalizeTrainingDays = (level) => {
  if (Array.isArray(level.dias) && level.dias.length > 0) {
    return level.dias.map((day, index) => ({
      id: day.id ?? `local-day-${level.id}-${index}`,
      nombre: day.nombre || (day.isDefault ? "Entreno completo" : `Día ${index + 1}`),
      isDefault: Boolean(day.isDefault),
      ejercicios: (day.ejercicios ?? []).map((exercise, exerciseIndex) => ({
        ...exercise,
        numero: Number(exercise.numero ?? exerciseIndex + 1),
        dia: day.isDefault ? "" : day.nombre,
      })),
    }));
  }

  const groups = new Map();
  (level.ejercicios ?? []).forEach((exercise, index) => {
    const dayName = String(exercise.dia || "").trim();
    const key = dayName || "__full__";
    if (!groups.has(key)) {
      groups.set(key, {
        id: `local-day-${level.id}-${groups.size + 1}`,
        nombre: dayName || "Entreno completo",
        isDefault: !dayName,
        ejercicios: [],
      });
    }
    groups.get(key).ejercicios.push({ ...exercise, numero: Number(exercise.numero ?? index + 1) });
  });

  return Array.from(groups.values()).length > 0
    ? Array.from(groups.values())
    : [emptyTrainingDay("Entreno completo", true)];
};

const flattenTrainingExercises = (level) =>
  (level.dias ?? []).flatMap((day) =>
    (day.ejercicios ?? []).map((exercise) => ({
      ...exercise,
      dia: day.isDefault ? "" : day.nombre,
    })),
  );

const getTrainingDayOptions = (level) =>
  (level?.dias ?? []).map((day) => ({
    value: String(day.id),
    label: day.isDefault ? "Entreno completo" : day.nombre,
  }));

const withCurrentOption = (options, value) => {
  if (!value || options.some((option) => String(option.value) === String(value))) {
    return options;
  }

  return [{ value, label: value }, ...options];
};

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
  async uploadFile(kind, file) {
    const formData = new FormData();
    formData.append("kind", kind);
    formData.append("file", file);

    const response = await fetch(`${import.meta.env.BASE_URL}api/admin-upload.php`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "No se pudo subir el archivo.");
    return payload;
  },
};

const AdminScreen = ({ onGoBack }) => {
  const { rutinasData, dietasData, updateContent } = useAppData();
  const [auth, setAuth] = useState({ checking: true, authenticated: false, user: null });
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [content, setContent] = useState(() => normalizeAdminContent({ rutinas: rutinasData, dietas: dietasData }));
  const [activeArea, setActiveArea] = useState("rutinas");
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedMealIndex, setSelectedMealIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [quickLevel, setQuickLevel] = useState({
    nombre: "",
    dificultad: "1",
    sexo: "Unisex",
    duracion: "1 mes",
    estructura: "Full Body",
    color: "#166534",
  });
  const [quickExercise, setQuickExercise] = useState({
    levelId: "",
    nombre: "",
    dia: "",
    specs: "3x12 rep",
    video: "/videos/",
    thumbnail: "/thumbnails/",
  });
  const [quickPlan, setQuickPlan] = useState({
    nombre: "",
    descripcion: "",
    color: "#0D9488",
  });
  const [quickMode, setQuickMode] = useState("ejercicio");

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
        const normalizedPayload = normalizeAdminContent(payload);
        setContent(normalizedPayload);
        setSelectedLevelId(normalizedPayload.rutinas.niveles[0]?.id ?? null);
        setQuickExercise((current) => ({
          ...current,
          levelId: normalizedPayload.rutinas.niveles[0]?.id ?? "",
        }));
        setSelectedExerciseId(normalizedPayload.rutinas.niveles[0]?.ejercicios?.[0]?.id ?? null);
        setSelectedPlanId(normalizedPayload.dietas.planes[0]?.id ?? null);
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
    const nextValue = key === "id" || key === "nivel" || key === "dificultad" ? Number(value) : value;
    patchContent((draft) => {
      const level = draft.rutinas.niveles.find((item) => item.id === selectedLevel.id);
      level[key] = nextValue;
      if (key === "nivel" || key === "dificultad") {
        level.nivel = Number(nextValue);
        level.dificultad = String(nextValue);
      }
      level.ejercicios = flattenTrainingExercises(level);
    });
    if (key === "id") {
      setSelectedLevelId(nextValue);
    }
  };

  const updateExercise = (key, value) => {
    const nextValue = key === "numero" ? Number(value) : value;
    patchContent((draft) => {
      const level = draft.rutinas.niveles.find((item) => item.id === selectedLevel.id);
      const exercise = level.dias
        .flatMap((day) => day.ejercicios)
        .find((item) => item.id === selectedExercise.id);
      exercise[key] = nextValue;
      level.ejercicios = flattenTrainingExercises(level);
    });
    if (key === "id") {
      setSelectedExerciseId(nextValue);
    }
  };

  const updateTrainingDay = (dayId, key, value) => {
    patchContent((draft) => {
      const level = draft.rutinas.niveles.find((item) => item.id === selectedLevel.id);
      const day = level.dias.find((item) => String(item.id) === String(dayId));
      if (!day) return;
      day[key] = key === "isDefault" ? Boolean(value) : value;
      day.ejercicios = (day.ejercicios ?? []).map((exercise) => ({
        ...exercise,
        dia: day.isDefault ? "" : day.nombre,
      }));
      level.ejercicios = flattenTrainingExercises(level);
    });
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
    const validationErrors = validateContent(content);

    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      setMessage("");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const saved = normalizeAdminContent(await api.saveContent(content));
      setContent(saved);
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

  const addTrainingDay = (name = "Nuevo día") => {
    if (!selectedLevel) return null;
    const day = emptyTrainingDay(name, false);
    patchContent((draft) => {
      const level = draft.rutinas.niveles.find((item) => item.id === selectedLevel.id);
      level.dias = [...(level.dias ?? []), day];
      level.ejercicios = flattenTrainingExercises(level);
    });
    return day.id;
  };

  const deleteTrainingDay = (dayId) => {
    if (!selectedLevel || (selectedLevel.dias?.length ?? 0) <= 1) return;
    const deletedDay = selectedLevel.dias.find((day) => String(day.id) === String(dayId));
    patchContent((draft) => {
      const level = draft.rutinas.niveles.find((item) => item.id === selectedLevel.id);
      level.dias = level.dias.filter((day) => String(day.id) !== String(dayId));
      level.ejercicios = flattenTrainingExercises(level);
    });
    if (deletedDay?.ejercicios?.some((exercise) => exercise.id === selectedExerciseId)) {
      const nextDay = selectedLevel.dias.find((day) => String(day.id) !== String(dayId));
      setSelectedExerciseId(nextDay?.ejercicios?.[0]?.id ?? null);
    }
  };

  const addExercise = (dayId = null) => {
    if (!selectedLevel) return;
    const targetDay = selectedLevel.dias?.find((day) => String(day.id) === String(dayId)) ?? selectedLevel.dias?.[0];
    if (!targetDay) return;
    const index = selectedLevel.ejercicios?.length ?? 0;
    const exercise = {
      ...emptyExercise(selectedLevel, index),
      dia: targetDay.isDefault ? "" : targetDay.nombre,
    };
    patchContent((draft) => {
      const level = draft.rutinas.niveles.find((item) => item.id === selectedLevel.id);
      const day = level.dias.find((item) => String(item.id) === String(targetDay.id));
      day.ejercicios = [...(day.ejercicios ?? []), exercise];
      level.ejercicios = flattenTrainingExercises(level);
    });
    setSelectedExerciseId(exercise.id);
  };

  const deleteExercise = () => {
    if (!selectedLevel || !selectedExercise) return;
    patchContent((draft) => {
      const level = draft.rutinas.niveles.find((item) => item.id === selectedLevel.id);
      level.dias = level.dias.map((day) => ({
        ...day,
        ejercicios: (day.ejercicios ?? []).filter((exercise) => exercise.id !== selectedExercise.id),
      }));
      level.ejercicios = flattenTrainingExercises(level);
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
          <h1 className="text-2xl font-black">Acceso</h1>
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
              type={showPassword ? "text" : "password"}
              value={credentials.password}
              onChange={(value) => setCredentials((current) => ({ ...current, password: value }))}
              autoComplete="current-password"
              rightAction={
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
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
      <div className="mx-auto max-w-[1500px] grid lg:grid-cols-[260px_minmax(0,1fr)] gap-4">
        <aside className="lg:sticky lg:top-24 lg:self-start bg-tarjeta-clara dark:bg-tarjeta-oscura border border-borde-claro dark:border-borde-oscuro rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-borde-claro dark:border-borde-oscuro">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-fondo-claro dark:bg-fondo-oscuro flex items-center justify-center">
                <UserRound className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
                  Sesión
                </p>
                <p className="font-black truncate">{auth.user?.displayName || auth.user?.username}</p>
              </div>
            </div>
          </div>
          <AdminNavigation
            value={activeArea}
            onChange={setActiveArea}
            items={adminNavItems}
          />
          <div className="p-4 grid grid-cols-2 gap-2">
            <Stat label="Niveles" value={stats.niveles} />
            <Stat label="Ejercicios" value={stats.ejercicios} />
            <Stat label="Planes" value={stats.planes} />
            <Stat label="Días" value={stats.dias} />
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          <div className="sticky top-20 z-30 bg-fondo-claro/95 dark:bg-fondo-oscuro/95 backdrop-blur border border-borde-claro dark:border-borde-oscuro rounded-2xl p-3 shadow-lg">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
                  {activeArea === "rapido" ? "Creación guiada" : "Gestión de contenido"}
                </p>
                <h1 className="text-2xl md:text-3xl font-black">
                  {adminNavItems.find((item) => item.value === activeArea)?.label}
                </h1>
              </div>
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
                  className="min-h-touch-target px-4 rounded-xl border border-borde-claro dark:border-borde-oscuro bg-tarjeta-clara dark:bg-tarjeta-oscura font-bold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Salir
                </button>
              </div>
            </div>
            <div className="lg:hidden mt-3">
              <SegmentedControl value={activeArea} onChange={setActiveArea} options={adminNavItems} />
            </div>
          </div>

          {message && <Alert tone="success">{message}</Alert>}
          {error && <Alert tone="error">{error}</Alert>}

          {activeArea === "rapido" ? (
            <QuickAddPanel
              levels={levels}
              quickLevel={quickLevel}
              setQuickLevel={setQuickLevel}
              quickExercise={quickExercise}
              setQuickExercise={setQuickExercise}
              quickPlan={quickPlan}
              setQuickPlan={setQuickPlan}
              setSelectedLevelId={setSelectedLevelId}
              quickMode={quickMode}
              setQuickMode={setQuickMode}
              uploadFile={api.uploadFile}
              addQuickLevel={() => {
                const nextId = Math.max(0, ...levels.map((level) => Number(level.id) || 0)) + 1;
                const level = {
                  ...emptyLevel(nextId),
                  ...quickLevel,
                  id: nextId,
                  nivel: Number(quickLevel.dificultad),
                  dificultad: String(quickLevel.dificultad),
                  slug: slugify(quickLevel.nombre || `entreno-${nextId}`),
                };
                level.dias = [emptyTrainingDay("Entreno completo", true)];
                level.ejercicios = [];
                patchContent((draft) => draft.rutinas.niveles.push(level));
                setSelectedLevelId(nextId);
                setSelectedExerciseId(null);
                setActiveArea("rutinas");
              }}
              addQuickExercise={() => {
                const targetLevel =
                  levels.find((level) => level.id === Number(quickExercise.levelId)) || selectedLevel;
                if (!targetLevel) return;
                const targetDay =
                  quickMode === "dia"
                    ? emptyTrainingDay(quickExercise.dia.trim(), false)
                    : targetLevel.dias?.find((day) => String(day.id) === String(quickExercise.dia)) ??
                      targetLevel.dias?.[0];
                if (!targetDay) return;
                const index = targetLevel.ejercicios?.length ?? 0;
                const exercise = {
                  ...emptyExercise(targetLevel, index, quickExercise),
                  dia: targetDay.isDefault ? "" : targetDay.nombre,
                };
                patchContent((draft) => {
                  const level = draft.rutinas.niveles.find((item) => item.id === targetLevel.id);
                  if (quickMode === "dia") {
                    level.dias = [...(level.dias ?? []), { ...targetDay, ejercicios: [exercise] }];
                  } else {
                    const day = level.dias.find((item) => String(item.id) === String(targetDay.id));
                    day.ejercicios = [...(day.ejercicios ?? []), exercise];
                  }
                  level.ejercicios = flattenTrainingExercises(level);
                });
                setSelectedLevelId(targetLevel.id);
                setSelectedExerciseId(exercise.id);
                setActiveArea("rutinas");
              }}
              addQuickPlan={() => {
                const nextId = Math.max(0, ...plans.map((plan) => Number(plan.id) || 0)) + 1;
                const plan = {
                  ...emptyPlan(nextId),
                  ...quickPlan,
                  id: nextId,
                  dias: [emptyDay()],
                };
                patchContent((draft) => draft.dietas.planes.push(plan));
                setSelectedPlanId(nextId);
                setSelectedDayIndex(0);
                setSelectedMealIndex(0);
                setActiveArea("dietas");
              }}
              selectedLevel={selectedLevel}
            />
          ) : activeArea === "rutinas" ? (
            <RoutineEditor
              levels={levels}
              selectedLevel={selectedLevel}
              selectedExercise={selectedExercise}
              setSelectedLevelId={setSelectedLevelId}
              setSelectedExerciseId={setSelectedExerciseId}
              updateLevel={updateLevel}
              updateExercise={updateExercise}
              uploadFile={api.uploadFile}
              addLevel={addLevel}
              deleteLevel={deleteLevel}
              addExercise={addExercise}
              addTrainingDay={addTrainingDay}
              updateTrainingDay={updateTrainingDay}
              deleteTrainingDay={deleteTrainingDay}
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
      </div>
    </AdminShell>
  );
};

const adminNavItems = [
  { value: "rapido", label: "Añadir rápido", icon: Sparkles },
  { value: "rutinas", label: "Rutinas", icon: Dumbbell },
  { value: "dietas", label: "Dietas", icon: ReceiptText },
];

const AdminShell = ({ children, onGoBack }) => (
  <div className="bg-fondo-claro dark:bg-fondo-oscuro min-h-screen p-3 md:p-4 pb-24">
    <div className="max-w-[1500px] mx-auto mb-3">
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

const AdminNavigation = ({ value, onChange, items }) => (
  <nav className="hidden lg:block p-3 space-y-1">
    {items.map((item) => {
      const Icon = item.icon;
      const active = value === item.value;

      return (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={`w-full min-h-touch-target rounded-xl px-4 flex items-center gap-3 text-left font-black transition-colors ${
            active
              ? "bg-fondo-claro dark:bg-fondo-oscuro text-texto-claro dark:text-texto-oscuro"
              : "text-texto-secundario-claro dark:text-texto-secundario-oscuro hover:bg-fondo-claro dark:hover:bg-fondo-oscuro"
          }`}
        >
          <Icon className="w-5 h-5" />
          {item.label}
        </button>
      );
    })}
  </nav>
);

const RoutineEditor = ({
  levels,
  selectedLevel,
  selectedExercise,
  setSelectedLevelId,
  setSelectedExerciseId,
  updateLevel,
  updateExercise,
  uploadFile,
  addLevel,
  deleteLevel,
  addExercise,
  addTrainingDay,
  updateTrainingDay,
  deleteTrainingDay,
  deleteExercise,
}) => {
  const [activeDayId, setActiveDayId] = useState("");
  const [newDayName, setNewDayName] = useState("");
  const dayOptions = useMemo(() => getTrainingDayOptions(selectedLevel), [selectedLevel]);
  const activeDay = selectedLevel?.dias?.find((day) => String(day.id) === String(activeDayId)) ?? selectedLevel?.dias?.[0] ?? null;
  const exercisesForDay = useMemo(() => activeDay?.ejercicios ?? [], [activeDay]);

  useEffect(() => {
    if (!selectedLevel) return;
    const stillExists = dayOptions.some((option) => String(option.value) === String(activeDayId));
    if (!stillExists) {
      setActiveDayId(dayOptions[0]?.value || "");
      return;
    }
    setSelectedExerciseId(exercisesForDay[0]?.id ?? null);
  }, [activeDayId, dayOptions, exercisesForDay, selectedLevel, setSelectedExerciseId]);

  const addExerciseInActiveDay = () => {
    addExercise(activeDay?.id);
  };

  const createDay = () => {
    if (!newDayName.trim()) return;
    const dayId = addTrainingDay(newDayName.trim());
    setActiveDayId(dayId);
    setNewDayName("");
  };

  return (
    <div className="grid xl:grid-cols-[280px_260px_minmax(0,1fr)] gap-4">
      <Panel>
        <PanelHeader title="Entrenos" action={addLevel} />
        <Picker
          items={levels}
          selectedId={selectedLevel?.id}
          label={(level) => `Nivel ${level.nivel ?? level.dificultad} · ${level.nombre}`}
          onSelect={(level) => {
            setSelectedLevelId(level.id);
            setActiveDayId(level.dias?.[0]?.id ?? "");
            setSelectedExerciseId(level.dias?.[0]?.ejercicios?.[0]?.id ?? null);
          }}
        />
      </Panel>

      {selectedLevel && (
        <Panel>
          <PanelHeader title="Días del entreno" action={addExerciseInActiveDay} danger={activeDay ? () => deleteTrainingDay(activeDay.id) : null} />
          <div className="space-y-3">
            <SelectField
              label="Entreno"
              value={selectedLevel.id}
              onChange={(value) => setSelectedLevelId(Number(value))}
              options={levels.map((level) => ({ value: level.id, label: `Nivel ${level.nivel ?? level.dificultad} · ${level.nombre}` }))}
            />
            <SelectField
              label="Día de entreno"
              value={activeDay?.id ?? ""}
              onChange={(value) => {
                const nextDay = selectedLevel.dias?.find((day) => String(day.id) === String(value));
                setActiveDayId(value);
                setSelectedExerciseId(nextDay?.ejercicios?.[0]?.id ?? null);
              }}
              options={dayOptions}
            />
            {activeDay && (
              <div className="grid grid-cols-[minmax(0,1fr)_130px] gap-3">
                <Field
                  label="Nombre del día"
                  value={activeDay.nombre}
                  onChange={(value) => updateTrainingDay(activeDay.id, "nombre", value)}
                  required
                />
                <SelectField
                  label="Tipo"
                  value={activeDay.isDefault ? "1" : "0"}
                  onChange={(value) => updateTrainingDay(activeDay.id, "isDefault", value === "1")}
                  options={[
                    { value: "0", label: "Día" },
                    { value: "1", label: "Completo" },
                  ]}
                />
              </div>
            )}
            <Field
              label="Nuevo día"
              value={newDayName}
              onChange={setNewDayName}
              hint="Crea el día añadiendo su primer ejercicio."
            />
            <PrimaryAction onClick={createDay} disabled={!newDayName.trim()}>
              Crear día
            </PrimaryAction>
            <div className="pt-3 border-t border-borde-claro dark:border-borde-oscuro">
              <p className="text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro mb-2">
                Ejercicios del día
              </p>
              <Picker
                items={exercisesForDay}
                selectedId={selectedExercise?.id}
                label={(exercise) => `${exercise.numero}. ${exercise.nombre}`}
                onSelect={(exercise) => setSelectedExerciseId(exercise.id)}
              />
            </div>
          </div>
        </Panel>
      )}

      {selectedLevel && (
        <div className="space-y-4 min-w-0">
          <Panel>
            <PanelHeader title="Datos del entreno" danger={deleteLevel} />
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="ID" type="number" value={selectedLevel.id} onChange={(value) => updateLevel("id", value)} required />
              <SelectField label="Nivel" value={selectedLevel.nivel ?? selectedLevel.dificultad} onChange={(value) => updateLevel("nivel", value)} options={difficultyOptions} />
              <Field label="Nombre del entreno" value={selectedLevel.nombre} onChange={(value) => updateLevel("nombre", value)} required />
              <SelectField label="Sexo" value={selectedLevel.sexo} onChange={(value) => updateLevel("sexo", value)} options={sexOptions} />
              <Field label="Slug" value={selectedLevel.slug} onChange={(value) => updateLevel("slug", value)} required />
              <SelectField label="Duración" value={selectedLevel.duracion} onChange={(value) => updateLevel("duracion", value)} options={durationOptions} />
              <SelectField label="Estructura" value={selectedLevel.estructura} onChange={(value) => updateLevel("estructura", value)} options={structureOptions} />
              <ColorField label="Color de tarjetas" value={getLevelColor(selectedLevel)} onChange={(value) => updateLevel("color", value)} />
            </div>
            <TextArea label="Calentamiento" value={selectedLevel.calentamiento || ""} onChange={(value) => updateLevel("calentamiento", value)} />
            <TextArea label="Enfriamiento" value={selectedLevel.enfriamiento || ""} onChange={(value) => updateLevel("enfriamiento", value)} />
            <TextArea label="Notas" value={arrayToLines(selectedLevel.notas)} onChange={(value) => updateLevel("notas", linesToArray(value))} rows={4} />
          </Panel>

          <Panel>
            <PanelHeader title={selectedExercise ? "Ejercicio" : "Añade un ejercicio"} action={addExerciseInActiveDay} danger={selectedExercise ? deleteExercise : null} />
            {selectedExercise ? (
              <div className="space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <Field label="ID" value={selectedExercise.id} onChange={(value) => updateExercise("id", value)} required />
                  <Field label="Número" type="number" value={selectedExercise.numero} onChange={(value) => updateExercise("numero", value)} required />
                  <Field label="Nombre" value={selectedExercise.nombre} onChange={(value) => updateExercise("nombre", value)} required />
                  <Field label="Nombre corto" value={selectedExercise.nombreCorto} onChange={(value) => updateExercise("nombreCorto", value)} required />
                  <Field label="Series/reps" value={selectedExercise.specs} onChange={(value) => updateExercise("specs", value)} required hint="Ejemplo: 3x12 rep, 25 min" />
                  <SelectField label="Músculo" value={selectedExercise.musculo} onChange={(value) => updateExercise("musculo", value)} options={muscleOptions} />
                  <SelectField label="Grupo" value={selectedExercise.grupoMuscular} onChange={(value) => updateExercise("grupoMuscular", value)} options={groupOptions} />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <MediaField label="Vídeo" kind="video" value={selectedExercise.video} onChange={(value) => updateExercise("video", value)} uploadFile={uploadFile} />
                  <MediaField label="Miniatura" kind="thumbnail" value={selectedExercise.thumbnail} onChange={(value) => updateExercise("thumbnail", value)} uploadFile={uploadFile} />
                </div>
                <TextArea label="Descripción" value={selectedExercise.descripcion || ""} onChange={(value) => updateExercise("descripcion", value)} />
                <TextArea label="Consejos" value={arrayToLines(selectedExercise.consejos)} onChange={(value) => updateExercise("consejos", linesToArray(value))} rows={5} />
              </div>
            ) : (
              <EmptyState text="Este día no tiene ejercicios. Añade uno para empezar." />
            )}
          </Panel>
        </div>
      )}
    </div>
  );
};

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
            <ColorField label="Color de tarjetas" value={getDietColor(selectedPlan)} onChange={(value) => updatePlan("color", value)} />
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

const QuickAddPanel = ({
  levels,
  selectedLevel,
  quickLevel,
  setQuickLevel,
  quickExercise,
  setQuickExercise,
  quickPlan,
  setQuickPlan,
  setSelectedLevelId,
  quickMode,
  setQuickMode,
  uploadFile,
  addQuickLevel,
  addQuickExercise,
  addQuickPlan,
}) => {
  const quickOptions = [
    { value: "ejercicio", label: "Ejercicio", icon: Dumbbell },
    { value: "dia", label: "Día", icon: Plus },
    { value: "nivel", label: "Nivel", icon: Sparkles },
    { value: "plan", label: "Plan", icon: ReceiptText },
  ];
  const levelOptions = levels.map((level) => ({ value: level.id, label: level.nombre }));
  const targetLevel =
    levels.find((level) => level.id === Number(quickExercise.levelId)) || selectedLevel || levels[0];
  const dayOptions = getTrainingDayOptions(targetLevel);

  return (
    <div className="space-y-4">
      <Panel>
        <SegmentedControl value={quickMode} onChange={setQuickMode} options={quickOptions} />
      </Panel>

      {quickMode === "nivel" && (
        <Panel>
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-6 h-6" />
        <h2 className="text-xl font-black">Nuevo nivel</h2>
      </div>
      <div className="space-y-3">
        <Field label="Nombre" value={quickLevel.nombre} onChange={(value) => setQuickLevel((current) => ({ ...current, nombre: value }))} required />
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Dificultad" value={quickLevel.dificultad} onChange={(value) => setQuickLevel((current) => ({ ...current, dificultad: value }))} options={difficultyOptions} required />
          <SelectField label="Sexo" value={quickLevel.sexo} onChange={(value) => setQuickLevel((current) => ({ ...current, sexo: value }))} options={sexOptions} required />
        </div>
        <SelectField label="Duración" value={quickLevel.duracion} onChange={(value) => setQuickLevel((current) => ({ ...current, duracion: value }))} options={durationOptions} required />
        <SelectField label="Estructura" value={quickLevel.estructura} onChange={(value) => setQuickLevel((current) => ({ ...current, estructura: value }))} options={structureOptions} required />
        <ColorField label="Color de tarjetas" value={quickLevel.color} onChange={(value) => setQuickLevel((current) => ({ ...current, color: value }))} />
        <PrimaryAction onClick={addQuickLevel} disabled={!quickLevel.nombre.trim()}>
          Crear nivel
        </PrimaryAction>
      </div>
        </Panel>
      )}

      {(quickMode === "ejercicio" || quickMode === "dia") && (
        <Panel>
      <div className="flex items-center gap-3 mb-4">
        <Dumbbell className="w-6 h-6" />
        <h2 className="text-xl font-black">
          {quickMode === "dia" ? "Nuevo día con primer ejercicio" : "Nuevo ejercicio"}
        </h2>
      </div>
      <div className="space-y-3">
        <SelectField
          label="Nivel destino"
          value={quickExercise.levelId || selectedLevel?.id || ""}
          onChange={(value) => {
            const levelId = Number(value);
            setSelectedLevelId(levelId);
            setQuickExercise((current) => ({ ...current, levelId }));
          }}
          options={levelOptions}
        />
        {quickMode === "ejercicio" ? (
          <SelectField
            label="Día"
            value={quickExercise.dia || "__full__"}
            onChange={(value) =>
              setQuickExercise((current) => ({
                ...current,
                dia: value === "__full__" ? "" : value,
              }))
            }
            options={dayOptions}
          />
        ) : (
          <Field
            label="Nombre del nuevo día"
            value={quickExercise.dia}
            onChange={(value) => setQuickExercise((current) => ({ ...current, dia: value }))}
            required
            hint="Ejemplo: Lunes, Martes y Viernes, Pierna"
          />
        )}
        <Field label="Nombre" value={quickExercise.nombre} onChange={(value) => setQuickExercise((current) => ({ ...current, nombre: value }))} required />
        <Field label="Series/reps" value={quickExercise.specs} onChange={(value) => setQuickExercise((current) => ({ ...current, specs: value }))} required hint="Ejemplo: 3x12 rep, 25 min" />
        <MediaField
          label="Vídeo"
          kind="video"
          value={quickExercise.video}
          onChange={(value) => setQuickExercise((current) => ({ ...current, video: value }))}
          uploadFile={uploadFile}
        />
        <MediaField
          label="Miniatura"
          kind="thumbnail"
          value={quickExercise.thumbnail}
          onChange={(value) => setQuickExercise((current) => ({ ...current, thumbnail: value }))}
          uploadFile={uploadFile}
        />
        <PrimaryAction
          onClick={addQuickExercise}
          disabled={
            !targetLevel ||
            !quickExercise.nombre.trim() ||
            (quickMode === "dia" && !quickExercise.dia.trim())
          }
        >
          {quickMode === "dia" ? "Crear día y ejercicio" : "Crear ejercicio"}
        </PrimaryAction>
      </div>
        </Panel>
      )}

      {quickMode === "plan" && (
        <Panel>
      <div className="flex items-center gap-3 mb-4">
        <ReceiptText className="w-6 h-6" />
        <h2 className="text-xl font-black">Nuevo plan</h2>
      </div>
      <div className="space-y-3">
        <Field label="Nombre" value={quickPlan.nombre} onChange={(value) => setQuickPlan((current) => ({ ...current, nombre: value }))} required />
        <TextArea label="Descripción" value={quickPlan.descripcion} onChange={(value) => setQuickPlan((current) => ({ ...current, descripcion: value }))} required />
        <ColorField label="Color de tarjetas" value={quickPlan.color} onChange={(value) => setQuickPlan((current) => ({ ...current, color: value }))} />
        <PrimaryAction onClick={addQuickPlan} disabled={!quickPlan.nombre.trim()}>
          Crear plan
        </PrimaryAction>
      </div>
        </Panel>
      )}
    </div>
  );
};

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

const Field = ({ label, value, onChange, type = "text", autoComplete, rightAction, required = false, hint }) => (
  <label className="block">
    <span className="block text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro mb-1">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </span>
    <div
      className={`flex rounded-xl border bg-fondo-claro dark:bg-fondo-oscuro focus-within:ring-2 focus-within:ring-nivel-1-claro dark:focus-within:ring-nivel-1-oscuro ${
        required && !String(value ?? "").trim()
          ? "border-red-400 dark:border-red-700"
          : "border-borde-claro dark:border-borde-oscuro"
      }`}
    >
      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        className="w-full min-w-0 min-h-touch-target rounded-xl bg-transparent px-4 text-texto-claro dark:text-texto-oscuro outline-none"
      />
      {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
    </div>
    {hint && <span className="block mt-1 text-xs font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">{hint}</span>}
  </label>
);

const SelectField = ({ label, value, onChange, options, required = false, hint }) => (
  <label className="block">
    <span className="block text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro mb-1">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </span>
    <select
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      className="w-full min-w-0 min-h-touch-target rounded-xl border border-borde-claro dark:border-borde-oscuro bg-fondo-claro dark:bg-fondo-oscuro px-3 font-black text-texto-claro dark:text-texto-oscuro outline-none focus:ring-2 focus:ring-nivel-1-claro dark:focus:ring-nivel-1-oscuro"
    >
      {withCurrentOption(options, value).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {hint && <span className="block mt-1 text-xs font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">{hint}</span>}
  </label>
);

const MediaField = ({ label, kind, value, onChange, uploadFile }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState("");
  const accept = kind === "thumbnail" ? "image/png,image/jpeg,image/webp" : "video/mp4,video/webm,video/quicktime";
  const Icon = kind === "thumbnail" ? Image : Play;
  const currentUrl = value?.startsWith("/") ? `/guia${value}` : value;

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFile = (selectedFile) => {
    setLocalError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const validType =
      kind === "thumbnail"
        ? ["image/png", "image/jpeg", "image/webp"].includes(selectedFile.type)
        : ["video/mp4", "video/webm", "video/quicktime"].includes(selectedFile.type);

    if (!validType) {
      setLocalError(kind === "thumbnail" ? "Usa PNG, JPG o WEBP." : "Usa MP4, WEBM o MOV.");
      setFile(null);
      return;
    }

    const maxSize = kind === "thumbnail" ? 8 * 1024 * 1024 : 160 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setLocalError(kind === "thumbnail" ? "Máximo 8 MB." : "Máximo 160 MB.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setLocalError("");

    try {
      const result = await uploadFile(kind, file);
      onChange(result.path);
      setFile(null);
    } catch (uploadError) {
      setLocalError(uploadError.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-borde-claro dark:border-borde-oscuro bg-fondo-claro dark:bg-fondo-oscuro p-3 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="font-black truncate">{label}</span>
        </div>
        <label className="min-h-touch-target px-3 rounded-xl bg-tarjeta-clara dark:bg-tarjeta-oscura border border-borde-claro dark:border-borde-oscuro font-bold flex items-center justify-center cursor-pointer">
          Elegir
          <input
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </label>
      </div>

      <input
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-h-touch-target rounded-xl border border-borde-claro dark:border-borde-oscuro bg-tarjeta-clara dark:bg-tarjeta-oscura px-3 text-sm text-texto-claro dark:text-texto-oscuro outline-none focus:ring-2 focus:ring-nivel-1-claro dark:focus:ring-nivel-1-oscuro"
      />

      <MediaPreview kind={kind} src={previewUrl || currentUrl} />

      {file && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="w-full min-h-touch-target rounded-xl bg-nivel-1-claro dark:bg-nivel-1-oscuro text-white font-black disabled:opacity-60"
        >
          {uploading ? "Subiendo..." : "Subir y usar archivo"}
        </button>
      )}

      {localError && <p className="text-sm font-bold text-red-600 dark:text-red-300">{localError}</p>}
    </div>
  );
};

const MediaPreview = ({ kind, src }) => {
  if (!src || src.endsWith("/videos/") || src.endsWith("/thumbnails/")) {
    return (
      <div className="aspect-video rounded-xl bg-tarjeta-clara dark:bg-tarjeta-oscura border border-dashed border-borde-claro dark:border-borde-oscuro flex items-center justify-center text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
        Sin preview
      </div>
    );
  }

  if (kind === "thumbnail") {
    return (
      <img
        src={src}
        alt=""
        className="w-full aspect-video object-cover rounded-xl border border-borde-claro dark:border-borde-oscuro"
      />
    );
  }

  return (
    <video
      src={src}
      controls
      muted
      className="w-full aspect-video object-cover rounded-xl border border-borde-claro dark:border-borde-oscuro bg-black"
    />
  );
};

const TextArea = ({ label, value, onChange, rows = 4, required = false, hint }) => (
  <label className="block mt-3">
    <span className="block text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro mb-1">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </span>
    <textarea
      rows={rows}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      className={`w-full rounded-xl border bg-fondo-claro dark:bg-fondo-oscuro px-4 py-3 text-texto-claro dark:text-texto-oscuro outline-none focus:ring-2 focus:ring-nivel-1-claro dark:focus:ring-nivel-1-oscuro ${
        required && !String(value ?? "").trim()
          ? "border-red-400 dark:border-red-700"
          : "border-borde-claro dark:border-borde-oscuro"
      }`}
    />
    {hint && <span className="block mt-1 text-xs font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">{hint}</span>}
  </label>
);

const ColorField = ({ label, value, onChange }) => (
  <label className="block">
    <span className="block text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro mb-1">
      {label}
    </span>
    <div className="grid grid-cols-[60px_minmax(0,1fr)] gap-3">
      <input
        type="color"
        value={value || "#166534"}
        onChange={(event) => onChange(event.target.value)}
        className="w-[60px] h-[60px] rounded-xl border border-borde-claro dark:border-borde-oscuro bg-transparent p-1"
        aria-label={label}
      />
      <input
        type="text"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-h-touch-target rounded-xl border border-borde-claro dark:border-borde-oscuro bg-fondo-claro dark:bg-fondo-oscuro px-4 text-texto-claro dark:text-texto-oscuro outline-none focus:ring-2 focus:ring-nivel-1-claro dark:focus:ring-nivel-1-oscuro"
      />
    </div>
  </label>
);

const PrimaryAction = ({ children, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full min-h-touch-target rounded-xl bg-nivel-1-claro dark:bg-nivel-1-oscuro text-white font-black flex items-center justify-center gap-2 disabled:opacity-50"
  >
    <Plus className="w-5 h-5" />
    {children}
  </button>
);

const EmptyState = ({ text }) => (
  <div className="rounded-xl border border-dashed border-borde-claro dark:border-borde-oscuro bg-fondo-claro dark:bg-fondo-oscuro p-6 text-center font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
    {text}
  </div>
);

const SegmentedControl = ({ value, onChange, options }) => (
  <div
    className="grid rounded-xl border border-borde-claro dark:border-borde-oscuro bg-tarjeta-clara dark:bg-tarjeta-oscura p-1"
    style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
  >
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

const validateContent = (content) => {
  const errors = [];
  const levels = content.rutinas?.niveles ?? [];
  const plans = content.dietas?.planes ?? [];
  const hexColor = /^#[0-9a-f]{6}$/i;

  if (levels.length === 0) {
    errors.push("Debe existir al menos un nivel.");
  }

  levels.forEach((level, levelIndex) => {
    const label = level.nombre || `Nivel ${levelIndex + 1}`;

    if (!Number.isFinite(Number(level.id))) errors.push(`${label}: el ID es obligatorio.`);
    if (!Number.isFinite(Number(level.nivel ?? level.dificultad))) errors.push(`${label}: el nivel es obligatorio.`);
    if (!String(level.nombre || "").trim()) errors.push(`${label}: el nombre del entreno es obligatorio.`);
    if (!String(level.slug || "").trim()) errors.push(`${label}: el slug es obligatorio.`);
    if (!String(level.dificultad || "").trim()) errors.push(`${label}: la dificultad es obligatoria.`);
    if (!String(level.sexo || "").trim()) errors.push(`${label}: el sexo es obligatorio.`);
    if (!String(level.duracion || "").trim()) errors.push(`${label}: la duración es obligatoria.`);
    if (!String(level.estructura || "").trim()) errors.push(`${label}: la estructura es obligatoria.`);
    if (!hexColor.test(level.color || "")) errors.push(`${label}: el color debe tener formato #RRGGBB.`);

    if (!Array.isArray(level.dias) || level.dias.length === 0) {
      errors.push(`${label}: debe tener al menos un día de entreno.`);
    }

    (level.dias ?? []).forEach((day, dayIndex) => {
      const dayLabel = day.nombre || `Día ${dayIndex + 1}`;
      if (!String(day.nombre || "").trim()) errors.push(`${label}: el día ${dayIndex + 1} necesita nombre.`);

      (day.ejercicios ?? []).forEach((exercise, exerciseIndex) => {
        const exerciseLabel = `${dayLabel} · ${exercise.nombre || `Ejercicio ${exerciseIndex + 1}`}`;

        if (!String(exercise.id || "").trim()) errors.push(`${exerciseLabel}: el ID es obligatorio.`);
        if (!Number.isFinite(Number(exercise.numero))) errors.push(`${exerciseLabel}: el número es obligatorio.`);
        if (!String(exercise.nombre || "").trim()) errors.push(`${exerciseLabel}: el nombre es obligatorio.`);
        if (!String(exercise.nombreCorto || "").trim()) errors.push(`${exerciseLabel}: el nombre corto es obligatorio.`);
        if (!String(exercise.musculo || "").trim()) errors.push(`${exerciseLabel}: el músculo es obligatorio.`);
        if (!String(exercise.grupoMuscular || "").trim()) errors.push(`${exerciseLabel}: el grupo muscular es obligatorio.`);
        if (!String(exercise.specs || "").trim()) errors.push(`${exerciseLabel}: las series/reps son obligatorias.`);
        if (!String(exercise.video || "").startsWith("/videos/")) errors.push(`${exerciseLabel}: el vídeo debe estar en /videos/.`);
        if (!String(exercise.thumbnail || "").startsWith("/thumbnails/")) errors.push(`${exerciseLabel}: la miniatura debe estar en /thumbnails/.`);
      });
    });
  });

  if (plans.length === 0) {
    errors.push("Debe existir al menos un plan de dieta.");
  }

  plans.forEach((plan, planIndex) => {
    const label = plan.nombre || `Plan ${planIndex + 1}`;

    if (!Number.isFinite(Number(plan.id))) errors.push(`${label}: el ID es obligatorio.`);
    if (!String(plan.nombre || "").trim()) errors.push(`${label}: el nombre es obligatorio.`);
    if (!String(plan.descripcion || "").trim()) errors.push(`${label}: la descripción es obligatoria.`);
    if (!hexColor.test(plan.color || "")) errors.push(`${label}: el color debe tener formato #RRGGBB.`);

    (plan.dias ?? []).forEach((day, dayIndex) => {
      if (!String(day.nombre || "").trim()) errors.push(`${label}: el día ${dayIndex + 1} necesita nombre.`);

      (day.comidas ?? []).forEach((meal, mealIndex) => {
        if (!String(meal.tipo || "").trim()) errors.push(`${label}: la comida ${mealIndex + 1} necesita tipo.`);
        if (!Array.isArray(meal.alimentos) || meal.alimentos.length === 0) {
          errors.push(`${label}: la comida ${meal.tipo || mealIndex + 1} necesita alimentos.`);
        }
      });
    });
  });

  return errors;
};

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default AdminScreen;
