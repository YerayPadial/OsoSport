import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Edit,
  Eye,
  EyeOff,
  Image,
  LogIn,
  LogOut,
  Plus,
  Play,
  ReceiptText,
  Save,
  Search,
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
  async register(payload) {
    const response = await fetch(`${import.meta.env.BASE_URL}api/admin-auth.php?action=register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo crear la cuenta.");
    return result;
  },
  async saveProfile(payload) {
    const response = await fetch(`${import.meta.env.BASE_URL}api/admin-auth.php?action=profile`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo guardar el perfil.");
    return result.user;
  },
  async changePassword(payload) {
    const response = await fetch(`${import.meta.env.BASE_URL}api/admin-auth.php?action=password`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo cambiar la contraseña.");
    return result;
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
  async loadUsers() {
    const response = await fetch(`${import.meta.env.BASE_URL}api/admin-users.php`, {
      credentials: "include",
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "No se pudieron cargar los usuarios.");
    return payload.users;
  },
  async saveUser(user) {
    const response = await fetch(`${import.meta.env.BASE_URL}api/admin-users.php`, {
      method: user.id ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "No se pudo guardar el usuario.");
    return payload.user;
  },
  async deleteUser(id) {
    const response = await fetch(`${import.meta.env.BASE_URL}api/admin-users.php?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "No se pudo eliminar el usuario.");
    return payload;
  },
};

const AdminScreen = ({ onGoBack }) => {
  const { rutinasData, dietasData, updateContent } = useAppData();
  const [auth, setAuth] = useState({ checking: true, authenticated: false, user: null });
  const [authMode, setAuthMode] = useState("login");
  const [credentials, setCredentials] = useState({ username: "", password: "", remember: false });
  const [registerForm, setRegisterForm] = useState({ firstName: "", lastName: "", email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [content, setContent] = useState(() => normalizeAdminContent({ rutinas: rutinasData, dietas: dietasData }));
  const [activeArea, setActiveArea] = useState("rutinas");
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", email: "", avatarPath: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [showProfileNewPassword, setShowProfileNewPassword] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userForm, setUserForm] = useState({ firstName: "", lastName: "", email: "", role: "user", active: true, password: "" });
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedMealIndex, setSelectedMealIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null);
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
        const user = payload.user || null;
        setAuth({
          checking: false,
          authenticated: Boolean(payload.authenticated),
          user,
        });
        if (user) {
          setProfileForm(userToProfileForm(user));
          setActiveArea(user.role === "admin" ? "rutinas" : "perfil");
        }
      })
      .catch(() => setAuth({ checking: false, authenticated: false, user: null }));
  }, []);

  useEffect(() => {
    setError("");
    setMessage("");
  }, [authMode]);

  useEffect(() => {
    window.dispatchEvent(new Event("ososport-auth-change"));
  }, [auth.user]);

  useEffect(() => {
    if (!auth.authenticated || auth.user?.role !== "admin") return;

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
  }, [auth.authenticated, auth.user?.role]);

  useEffect(() => {
    if (!auth.authenticated || auth.user?.role !== "admin") return;

    api
      .loadUsers()
      .then((payload) => {
        setUsers(payload);
        setSelectedUserId(payload[0]?.id ?? null);
        setUserForm(userToAdminForm(payload[0]));
      })
      .catch((loadError) => setError(loadError.message));
  }, [auth.authenticated, auth.user?.role]);

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
  const isAdmin = auth.user?.role === "admin";
  const visibleNavItems = isAdmin ? adminNavItems : userNavItems;

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

  const askConfirm = ({ title, text, confirmLabel = "Eliminar", onConfirm }) => {
    setConfirmDialog({ title, text, confirmLabel, onConfirm });
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
      setProfileForm(userToProfileForm(payload.user));
      setActiveArea(payload.user?.role === "admin" ? "rutinas" : "perfil");
      setCredentials({ username: "", password: "" });
    } catch (loginError) {
      setError(loginError.message);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      validateUserForm(registerForm, true);
      const payload = await api.register(registerForm);
      setAuth({ checking: false, authenticated: true, user: payload.user });
      setProfileForm(userToProfileForm(payload.user));
      setRegisterForm({ firstName: "", lastName: "", email: "", password: "" });
      setActiveArea("perfil");
    } catch (registerError) {
      setError(registerError.message);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setAuth({ checking: false, authenticated: false, user: null });
    setActiveArea("rutinas");
    setCredentials((current) => ({ ...current, password: "" }));
  };

  const handleSaveProfile = async () => {
    setError("");
    setMessage("");

    try {
      validateUserForm(profileForm, false);
      const user = await api.saveProfile(profileForm);
      setAuth((current) => ({ ...current, user }));
      setProfileForm(userToProfileForm(user));
      setMessage("Perfil guardado.");
    } catch (profileError) {
      setError(profileError.message);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setMessage("");

    try {
      validatePasswordForm(passwordForm.newPassword);
      await api.changePassword(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setMessage("Contraseña actualizada.");
    } catch (passwordError) {
      setError(passwordError.message);
    }
  };

  const handleAvatarUpload = async (file) => {
    setError("");
    setMessage("");

    try {
      const result = await api.uploadFile("avatar", file);
      const nextUser = { ...auth.user, avatarPath: result.path };
      setAuth((current) => ({ ...current, user: nextUser }));
      setProfileForm((current) => ({ ...current, avatarPath: result.path }));
      setMessage("Foto de perfil actualizada.");
    } catch (avatarError) {
      setError(avatarError.message);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUserId(user.id);
    setUserForm(userToAdminForm(user));
  };

  const handleNewUser = () => {
    setSelectedUserId(null);
    setUserForm({ firstName: "", lastName: "", email: "", role: "user", active: true, password: "" });
  };

  const handleSaveUser = async () => {
    setError("");
    setMessage("");

    try {
      validateUserForm(userForm, !selectedUserId);
      const savedUser = await api.saveUser({ ...userForm, id: selectedUserId });
      const nextUsers = selectedUserId
        ? users.map((user) => (user.id === savedUser.id ? savedUser : user))
        : [...users, savedUser];
      setUsers(nextUsers);
      setSelectedUserId(savedUser.id);
      setUserForm(userToAdminForm(savedUser));
      setMessage("Usuario guardado.");
    } catch (userError) {
      setError(userError.message);
    }
  };

  const handleDeleteUser = async (id = selectedUserId) => {
    if (!id) return;
    const selected = users.find((user) => user.id === id);
    askConfirm({
      title: "Eliminar usuario",
      text: `Vas a eliminar el usuario "${selected?.displayName || selected?.email}". Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        setError("");
        setMessage("");

        try {
          await api.deleteUser(id);
          const nextUsers = users.filter((user) => user.id !== id);
          setUsers(nextUsers);
          setSelectedUserId(nextUsers[0]?.id ?? null);
          setUserForm(userToAdminForm(nextUsers[0]));
          setMessage("Usuario eliminado.");
        } catch (deleteError) {
          setError(deleteError.message);
        }
      },
    });
  };

  const handleDeleteUsers = (ids) => {
    const selectedUsers = users.filter((user) => ids.includes(user.id));
    if (selectedUsers.length === 0) return;

    askConfirm({
      title: "Eliminar usuarios",
      text: `Vas a eliminar ${selectedUsers.length} usuario${selectedUsers.length === 1 ? "" : "s"}. Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      onConfirm: async () => {
        setError("");
        setMessage("");

        try {
          await Promise.all(selectedUsers.map((user) => api.deleteUser(user.id)));
          const nextUsers = users.filter((user) => !ids.includes(user.id));
          setUsers(nextUsers);
          setSelectedUserId(nextUsers[0]?.id ?? null);
          setUserForm(userToAdminForm(nextUsers[0]));
          setMessage("Usuarios eliminados.");
        } catch (deleteError) {
          setError(deleteError.message);
        }
      },
    });
  };

  const handleSave = async (scope = "Cambios") => {
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
      setMessage(`${scope} guardado.`);
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
    askConfirm({
      title: "Eliminar entreno",
      text: `Vas a eliminar el entreno "${selectedLevel.nombre}". Se borrarán también sus días, ejercicios, notas y consejos asociados.`,
      onConfirm: () => {
        patchContent((draft) => {
          draft.rutinas.niveles = draft.rutinas.niveles.filter((level) => level.id !== selectedLevel.id);
        });
        const nextLevel = levels.find((level) => level.id !== selectedLevel.id);
        setSelectedLevelId(nextLevel?.id ?? null);
        setSelectedExerciseId(nextLevel?.ejercicios?.[0]?.id ?? null);
      },
    });
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
    askConfirm({
      title: "Eliminar día",
      text: `Vas a eliminar el día "${deletedDay?.nombre || "seleccionado"}". Se borrarán también todos sus ejercicios.`,
      onConfirm: () => {
        patchContent((draft) => {
          const level = draft.rutinas.niveles.find((item) => item.id === selectedLevel.id);
          level.dias = level.dias.filter((day) => String(day.id) !== String(dayId));
          level.ejercicios = flattenTrainingExercises(level);
        });
        if (deletedDay?.ejercicios?.some((exercise) => exercise.id === selectedExerciseId)) {
          const nextDay = selectedLevel.dias.find((day) => String(day.id) !== String(dayId));
          setSelectedExerciseId(nextDay?.ejercicios?.[0]?.id ?? null);
        }
      },
    });
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
    askConfirm({
      title: "Eliminar ejercicio",
      text: `Vas a eliminar el ejercicio "${selectedExercise.nombre}".`,
      onConfirm: () => {
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
      },
    });
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
    askConfirm({
      title: "Eliminar plan",
      text: `Vas a eliminar el plan "${selectedPlan.nombre}". Se borrarán también sus días, comidas y alimentos asociados.`,
      onConfirm: () => {
        patchContent((draft) => {
          draft.dietas.planes = draft.dietas.planes.filter((plan) => plan.id !== selectedPlan.id);
        });
        const nextPlan = plans.find((plan) => plan.id !== selectedPlan.id);
        setSelectedPlanId(nextPlan?.id ?? null);
        setSelectedDayIndex(0);
        setSelectedMealIndex(0);
      },
    });
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
    askConfirm({
      title: "Eliminar día",
      text: `Vas a eliminar el día "${selectedDay.nombre}". Se borrarán también sus comidas y alimentos.`,
      onConfirm: () => {
        patchContent((draft) => {
          const plan = draft.dietas.planes.find((item) => item.id === selectedPlan.id);
          plan.dias.splice(selectedDayIndex, 1);
        });
        setSelectedDayIndex(Math.max(0, selectedDayIndex - 1));
        setSelectedMealIndex(0);
      },
    });
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
    askConfirm({
      title: "Eliminar comida",
      text: `Vas a eliminar la comida "${selectedMeal.tipo}".`,
      onConfirm: () => {
        patchContent((draft) => {
          const plan = draft.dietas.planes.find((item) => item.id === selectedPlan.id);
          plan.dias[selectedDayIndex].comidas.splice(selectedMealIndex, 1);
        });
        setSelectedMealIndex(Math.max(0, selectedMealIndex - 1));
      },
    });
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
              <UserRound className="w-6 h-6" />
            </div>
            <div>
          <h1 className="text-2xl font-black">Acceso</h1>
              <p className="text-texto-secundario-claro dark:text-texto-secundario-oscuro">
                OsoSport Gym
              </p>
            </div>
          </div>

          <SegmentedControl
            value={authMode}
            onChange={setAuthMode}
            options={[
              { value: "login", label: "Entrar", icon: LogIn },
              { value: "register", label: "Registro", icon: Sparkles },
            ]}
          />

          {authMode === "login" ? (
            <form className="space-y-4 mt-4" onSubmit={handleLogin}>
              <Field
                label="Email o usuario"
                value={credentials.username}
                onChange={(value) => setCredentials((current) => ({ ...current, username: value }))}
                autoComplete="username"
                required
              />
              <PasswordField
                label="Contraseña"
                visible={showPassword}
                setVisible={setShowPassword}
                value={credentials.password}
                onChange={(value) => setCredentials((current) => ({ ...current, password: value }))}
                autoComplete="current-password"
                required
              />
              <CheckboxField
                label="Mantener sesión iniciada"
                checked={credentials.remember}
                onChange={(value) => setCredentials((current) => ({ ...current, remember: value }))}
              />
            {error && <Alert tone="error">{error}</Alert>}
            <button className="w-full min-h-touch-target rounded-xl bg-nivel-1-claro dark:bg-nivel-1-oscuro text-white font-black flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" />
              Entrar
            </button>
            </form>
          ) : (
            <form className="space-y-4 mt-4" onSubmit={handleRegister}>
              <Field label="Nombre" value={registerForm.firstName} onChange={(value) => setRegisterForm((current) => ({ ...current, firstName: value }))} autoComplete="given-name" required />
              <Field label="Apellidos" value={registerForm.lastName} onChange={(value) => setRegisterForm((current) => ({ ...current, lastName: value }))} autoComplete="family-name" required />
              <Field label="Email" type="email" value={registerForm.email} onChange={(value) => setRegisterForm((current) => ({ ...current, email: value }))} autoComplete="email" required />
              <PasswordField
                label="Contraseña"
                visible={showRegisterPassword}
                setVisible={setShowRegisterPassword}
                value={registerForm.password}
                onChange={(value) => setRegisterForm((current) => ({ ...current, password: value }))}
                autoComplete="new-password"
                required
                hint="Mínimo 10 caracteres con mayúsculas, minúsculas y números."
              />
              <CheckboxField
                label="Mantener sesión iniciada"
                checked={registerForm.remember}
                onChange={(value) => setRegisterForm((current) => ({ ...current, remember: value }))}
              />
              {error && <Alert tone="error">{error}</Alert>}
              <button className="w-full min-h-touch-target rounded-xl bg-nivel-1-claro dark:bg-nivel-1-oscuro text-white font-black flex items-center justify-center gap-2">
                <UserRound className="w-5 h-5" />
                Crear cuenta
              </button>
            </form>
          )}
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
              <SessionAvatar user={auth.user} />
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
            items={visibleNavItems}
          />
          {isAdmin && (
            <div className="p-4 grid grid-cols-2 gap-2">
              <Stat label="Entrenos" value={stats.niveles} />
              <Stat label="Ejercicios" value={stats.ejercicios} />
              <Stat label="Planes" value={stats.planes} />
              <Stat label="Días" value={stats.dias} />
            </div>
          )}
        </aside>

        <div className="min-w-0 space-y-4">
          <div className="sticky top-20 z-30 bg-fondo-claro/95 dark:bg-fondo-oscuro/95 backdrop-blur border border-borde-claro dark:border-borde-oscuro rounded-2xl p-3 shadow-lg">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
                  {activeArea === "rapido" ? "Creación guiada" : "Gestión de contenido"}
                </p>
                <h1 className="text-2xl md:text-3xl font-black">
                  {visibleNavItems.find((item) => item.value === activeArea)?.label || "Perfil"}
                </h1>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:flex">
                <div className="min-h-touch-target px-4 rounded-xl border border-borde-claro dark:border-borde-oscuro bg-tarjeta-clara dark:bg-tarjeta-oscura font-bold flex items-center justify-center text-sm text-texto-secundario-claro dark:text-texto-secundario-oscuro">
                  Guarda desde cada tarjeta
                </div>
                <button
                  onClick={handleLogout}
                  className="min-h-touch-target px-4 rounded-xl border border-borde-claro dark:border-borde-oscuro bg-tarjeta-clara dark:bg-tarjeta-oscura font-bold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar sesión
                </button>
              </div>
            </div>
            <div className="lg:hidden mt-3">
              <SegmentedControl value={activeArea} onChange={setActiveArea} options={visibleNavItems} />
            </div>
          </div>

          {message && <Alert tone="success">{message}</Alert>}
          {error && <Alert tone="error">{error}</Alert>}

          {activeArea === "perfil" || !isAdmin ? (
            <ProfilePanel
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              passwordForm={passwordForm}
              setPasswordForm={setPasswordForm}
              showCurrentPassword={showProfilePassword}
              setShowCurrentPassword={setShowProfilePassword}
              showNewPassword={showProfileNewPassword}
              setShowNewPassword={setShowProfileNewPassword}
              user={auth.user}
              onSaveProfile={handleSaveProfile}
              onChangePassword={handleChangePassword}
              onAvatarUpload={handleAvatarUpload}
            />
          ) : activeArea === "usuarios" ? (
            <UsersEditor
              users={users}
              selectedUserId={selectedUserId}
              userForm={userForm}
              setUserForm={setUserForm}
              onSelectUser={handleSelectUser}
              onNewUser={handleNewUser}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
              onDeleteUsers={handleDeleteUsers}
            />
          ) : activeArea === "rapido" ? (
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
              saving={saving}
              onSave={handleSave}
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
              saving={saving}
              onSave={handleSave}
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
              saving={saving}
              onSave={handleSave}
            />
          )}
        </div>
      </div>
      <ConfirmDialog
        dialog={confirmDialog}
        onCancel={() => setConfirmDialog(null)}
        onConfirm={async () => {
          const action = confirmDialog?.onConfirm;
          setConfirmDialog(null);
          await action?.();
        }}
      />
    </AdminShell>
  );
};

const adminNavItems = [
  { value: "rapido", label: "Añadir rápido", icon: Sparkles },
  { value: "rutinas", label: "Rutinas", icon: Dumbbell },
  { value: "dietas", label: "Dietas", icon: ReceiptText },
  { value: "usuarios", label: "Usuarios", emoji: "👥" },
  { value: "perfil", label: "Perfil", icon: UserRound },
];

const userNavItems = [{ value: "perfil", label: "Perfil", icon: UserRound }];

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
        {item.emoji ? <span className="w-5 h-5 flex items-center justify-center">{item.emoji}</span> : <Icon className="w-5 h-5" />}
          {item.label}
        </button>
      );
    })}
  </nav>
);

const SessionAvatar = ({ user }) => {
  const avatarUrl = user?.avatarPath?.startsWith("/") ? `/guia${user.avatarPath}` : user?.avatarPath;

  return (
    <div className="w-12 h-12 rounded-full bg-fondo-claro dark:bg-fondo-oscuro flex items-center justify-center overflow-hidden border border-borde-claro dark:border-borde-oscuro">
      {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : <UserRound className="w-6 h-6" />}
    </div>
  );
};

const ConfirmDialog = ({ dialog, onCancel, onConfirm }) => {
  if (!dialog) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-borde-claro dark:border-borde-oscuro bg-tarjeta-clara dark:bg-tarjeta-oscura shadow-2xl p-5">
        <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-200 flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black mb-2">{dialog.title}</h2>
        <p className="font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro mb-5">
          {dialog.text}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-touch-target rounded-xl border border-borde-claro dark:border-borde-oscuro bg-fondo-claro dark:bg-fondo-oscuro font-black"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-touch-target rounded-xl bg-red-600 text-white font-black"
          >
            {dialog.confirmLabel || "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
};

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
  saving,
  onSave,
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
    <div className="space-y-4">
      <CollapsiblePanel
        title="Entrenos"
        action={addLevel}
        danger={selectedLevel ? deleteLevel : null}
        onSave={() => onSave("Entrenos")}
        saving={saving}
      >
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
      </CollapsiblePanel>

      {selectedLevel && (
        <CollapsiblePanel
          title="Días del entreno"
          action={addExerciseInActiveDay}
          danger={activeDay ? () => deleteTrainingDay(activeDay.id) : null}
          onSave={() => onSave("Días del entreno")}
          saving={saving}
        >
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
              <div className="grid sm:grid-cols-[minmax(0,1fr)_150px] gap-3">
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
        </CollapsiblePanel>
      )}

      {selectedLevel && (
        <div className="space-y-4 min-w-0">
          <CollapsiblePanel
            title="Datos del entreno"
            danger={deleteLevel}
            onSave={() => onSave("Datos del entreno")}
            saving={saving}
          >
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
          </CollapsiblePanel>

          <CollapsiblePanel
            title={selectedExercise ? "Ejercicio" : "Añade un ejercicio"}
            action={addExerciseInActiveDay}
            danger={selectedExercise ? deleteExercise : null}
            onSave={() => onSave("Ejercicio")}
            saving={saving}
          >
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
          </CollapsiblePanel>
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
  saving,
  onSave,
}) => (
  <div className="space-y-4">
    <CollapsiblePanel
      title="Planes"
      action={addPlan}
      danger={selectedPlan ? deletePlan : null}
      onSave={() => onSave("Planes")}
      saving={saving}
    >
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
    </CollapsiblePanel>

    {selectedPlan && (
      <div className="space-y-4">
        <CollapsiblePanel title="Plan" danger={deletePlan} onSave={() => onSave("Plan")} saving={saving}>
          <div className="space-y-3">
            <Field label="ID" type="number" value={selectedPlan.id} onChange={(value) => updatePlan("id", value)} />
            <Field label="Nombre" value={selectedPlan.nombre} onChange={(value) => updatePlan("nombre", value)} />
            <ColorField label="Color de tarjetas" value={getDietColor(selectedPlan)} onChange={(value) => updatePlan("color", value)} />
            <TextArea label="Descripción" value={selectedPlan.descripcion} onChange={(value) => updatePlan("descripcion", value)} />
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel
          title="Días"
          action={addDay}
          danger={selectedDay ? deleteDay : null}
          onSave={() => onSave("Días del plan")}
          saving={saving}
        >
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
        </CollapsiblePanel>

        <CollapsiblePanel
          title="Comidas"
          action={selectedDay ? addMeal : null}
          danger={selectedMeal ? deleteMeal : null}
          onSave={() => onSave("Comidas")}
          saving={saving}
        >
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
        </CollapsiblePanel>
      </div>
    )}
  </div>
);

const ProfilePanel = ({
  profileForm,
  setProfileForm,
  passwordForm,
  setPasswordForm,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  user,
  onSaveProfile,
  onChangePassword,
  onAvatarUpload,
}) => (
  <div className="space-y-4">
    <CollapsiblePanel title="Perfil" onSave={onSaveProfile}>
      <div className="grid md:grid-cols-[180px_minmax(0,1fr)] gap-4">
        <AvatarField user={user} onUpload={onAvatarUpload} />
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Nombre" value={profileForm.firstName} onChange={(value) => setProfileForm((current) => ({ ...current, firstName: value }))} required />
          <Field label="Apellidos" value={profileForm.lastName} onChange={(value) => setProfileForm((current) => ({ ...current, lastName: value }))} required />
          <Field label="Email" type="email" value={profileForm.email} onChange={(value) => setProfileForm((current) => ({ ...current, email: value }))} required />
          <Field label="Rol" value={user?.role || "user"} onChange={() => {}} />
        </div>
      </div>
    </CollapsiblePanel>

    <CollapsiblePanel title="Cambiar contraseña" onSave={onChangePassword}>
      <div className="grid md:grid-cols-2 gap-3">
        <PasswordField
          label="Contraseña actual"
          visible={showCurrentPassword}
          setVisible={setShowCurrentPassword}
          value={passwordForm.currentPassword}
          onChange={(value) => setPasswordForm((current) => ({ ...current, currentPassword: value }))}
          autoComplete="current-password"
          required
        />
        <PasswordField
          label="Nueva contraseña"
          visible={showNewPassword}
          setVisible={setShowNewPassword}
          value={passwordForm.newPassword}
          onChange={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))}
          autoComplete="new-password"
          required
          hint="Mínimo 10 caracteres con mayúsculas, minúsculas y números."
        />
      </div>
    </CollapsiblePanel>
  </div>
);

const UsersEditor = ({
  users,
  selectedUserId,
  userForm,
  setUserForm,
  onSelectUser,
  onNewUser,
  onSaveUser,
  onDeleteUser,
  onDeleteUsers,
}) => {
  const selectedUser = users.find((user) => user.id === selectedUserId);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRows, setSelectedRows] = useState([]);
  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const search = query.trim().toLowerCase();
        const matchesSearch =
          !search ||
          [user.displayName, user.email, user.role]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search));
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" ? user.active : !user.active);

        return matchesSearch && matchesRole && matchesStatus;
      }),
    [query, roleFilter, statusFilter, users],
  );
  const allVisibleSelected =
    filteredUsers.length > 0 && filteredUsers.every((user) => selectedRows.includes(user.id));

  const toggleRow = (id) => {
    setSelectedRows((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const toggleAllVisible = () => {
    setSelectedRows((current) =>
      allVisibleSelected
        ? current.filter((id) => !filteredUsers.some((user) => user.id === id))
        : [...new Set([...current, ...filteredUsers.map((user) => user.id)])],
    );
  };

  const handleNew = () => {
    setSelectedRows([]);
    onNewUser();
  };

  return (
    <div className="space-y-4">
      <section className="bg-tarjeta-clara dark:bg-tarjeta-oscura border border-borde-claro dark:border-borde-oscuro rounded-2xl shadow-lg overflow-hidden">
        <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-texto-secundario-claro dark:text-texto-secundario-oscuro">
              Usuarios · Listado
            </p>
            <h2 className="text-3xl font-black">Usuarios</h2>
          </div>
          <button
            type="button"
            onClick={handleNew}
            className="min-h-touch-target px-4 rounded-xl bg-green-600 text-white font-black flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Crear usuario
          </button>
        </div>

        <div className="border-y border-borde-claro dark:border-borde-oscuro bg-fondo-claro dark:bg-fondo-oscuro p-4 grid lg:grid-cols-[minmax(0,1fr)_180px_180px] gap-3">
          <label className="min-h-touch-target rounded-xl border border-borde-claro dark:border-borde-oscuro bg-tarjeta-clara dark:bg-tarjeta-oscura px-3 flex items-center gap-2">
            <Search className="w-5 h-5 text-texto-secundario-claro dark:text-texto-secundario-oscuro" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar"
              className="w-full bg-transparent outline-none font-bold"
            />
          </label>
          <SelectField
            label="Rol"
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { value: "all", label: "Todos" },
              { value: "admin", label: "Admin" },
              { value: "user", label: "User" },
            ]}
          />
          <SelectField
            label="Estado"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "Todos" },
              { value: "active", label: "Activos" },
              { value: "inactive", label: "Inactivos" },
            ]}
          />
        </div>

        <div className="px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-tarjeta-clara dark:bg-tarjeta-oscura">
          <button
            type="button"
            onClick={() => onDeleteUsers(selectedRows)}
            disabled={selectedRows.length === 0}
            className="min-h-touch-target px-4 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-300 font-black flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Trash2 className="w-5 h-5" />
            Borrar seleccionados
          </button>
          <div className="flex gap-3 text-sm font-black">
            <button type="button" onClick={toggleAllVisible} className="text-green-600 dark:text-green-300">
              {allVisibleSelected ? "Deseleccionar visibles" : `Seleccionar ${filteredUsers.length}`}
            </button>
            <span className="text-texto-secundario-claro dark:text-texto-secundario-oscuro">
              {selectedRows.length} seleccionados
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="border-y border-borde-claro dark:border-borde-oscuro">
              <tr className="text-sm text-texto-secundario-claro dark:text-texto-secundario-oscuro">
                <th className="w-14 p-4">
                  <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} className="w-5 h-5 accent-green-600" />
                </th>
                <th className="p-4">Nombre</th>
                <th className="p-4">Correo electrónico</th>
                <th className="p-4">Perfiles</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b border-borde-claro dark:border-borde-oscuro ${
                    selectedRows.includes(user.id) ? "bg-green-500/10" : ""
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(user.id)}
                      onChange={() => toggleRow(user.id)}
                      className="w-5 h-5 accent-green-600"
                    />
                  </td>
                  <td className="p-4 font-bold">{user.displayName}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-black ${user.active ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"}`}>
                      {user.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectUser(user)}
                        className="min-h-touch-target px-3 rounded-xl text-green-600 dark:text-green-300 font-black flex items-center gap-2"
                      >
                        <Edit className="w-5 h-5" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteUser(user.id)}
                        className="min-h-touch-target w-12 rounded-xl text-red-600 dark:text-red-300 flex items-center justify-center"
                        aria-label="Eliminar usuario"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6">
                    <EmptyState text="No hay usuarios que coincidan con los filtros." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <CollapsiblePanel
        title={selectedUser ? "Editar usuario" : "Nuevo usuario"}
        danger={selectedUser ? onDeleteUser : null}
        onSave={onSaveUser}
      >
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Nombre" value={userForm.firstName} onChange={(value) => setUserForm((current) => ({ ...current, firstName: value }))} required />
          <Field label="Apellidos" value={userForm.lastName} onChange={(value) => setUserForm((current) => ({ ...current, lastName: value }))} required />
          <Field label="Email" type="email" value={userForm.email} onChange={(value) => setUserForm((current) => ({ ...current, email: value }))} required />
          <SelectField label="Rol" value={userForm.role} onChange={(value) => setUserForm((current) => ({ ...current, role: value }))} options={[{ value: "admin", label: "Admin" }, { value: "user", label: "User" }]} />
          <SelectField label="Estado" value={userForm.active ? "1" : "0"} onChange={(value) => setUserForm((current) => ({ ...current, active: value === "1" }))} options={[{ value: "1", label: "Activo" }, { value: "0", label: "Inactivo" }]} />
          <PasswordField
            label={selectedUser ? "Nueva contraseña" : "Contraseña"}
            visible={showAdminPassword}
            setVisible={setShowAdminPassword}
            value={userForm.password}
            onChange={(value) => setUserForm((current) => ({ ...current, password: value }))}
            autoComplete="new-password"
            required={!selectedUser}
            hint={selectedUser ? "Déjalo vacío para no cambiarla." : "Mínimo 10 caracteres con mayúsculas, minúsculas y números."}
          />
        </div>
      </CollapsiblePanel>
    </div>
  );
};

const AvatarField = ({ user, onUpload }) => {
  const [localError, setLocalError] = useState("");
  const avatarUrl = user?.avatarPath?.startsWith("/") ? `/guia${user.avatarPath}` : user?.avatarPath;

  const handleFile = (file) => {
    setLocalError("");
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setLocalError("Usa PNG, JPG o WEBP.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setLocalError("Máximo 3 MB.");
      return;
    }
    onUpload(file);
  };

  return (
    <div className="rounded-xl border border-borde-claro dark:border-borde-oscuro bg-fondo-claro dark:bg-fondo-oscuro p-3 space-y-3">
      <div className="w-32 h-32 rounded-full overflow-hidden bg-tarjeta-clara dark:bg-tarjeta-oscura border border-borde-claro dark:border-borde-oscuro mx-auto flex items-center justify-center">
        {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : <UserRound className="w-14 h-14" />}
      </div>
      <label className="w-full min-h-touch-target px-3 rounded-xl bg-tarjeta-clara dark:bg-tarjeta-oscura border border-borde-claro dark:border-borde-oscuro font-bold flex items-center justify-center cursor-pointer">
        Elegir foto
        <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => handleFile(event.target.files?.[0])} />
      </label>
      {localError && <p className="text-sm font-bold text-red-600 dark:text-red-300">{localError}</p>}
    </div>
  );
};

const RoleBadge = ({ role }) => (
  <span
    className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-black border ${
      role === "admin"
        ? "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-300"
        : "border-teal-500/50 bg-teal-500/10 text-teal-700 dark:text-teal-300"
    }`}
  >
    {role === "admin" ? "admin" : "user"}
  </span>
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
  saving,
  onSave,
}) => {
  const quickOptions = [
    { value: "ejercicio", label: "Ejercicio", icon: Dumbbell },
    { value: "dia", label: "Día", icon: Plus },
    { value: "nivel", label: "Entreno", icon: Sparkles },
    { value: "plan", label: "Plan", icon: ReceiptText },
  ];
  const levelOptions = levels.map((level) => ({
    value: level.id,
    label: `Nivel ${level.nivel ?? level.dificultad} · ${level.nombre}`,
  }));
  const targetLevel =
    levels.find((level) => level.id === Number(quickExercise.levelId)) || selectedLevel || levels[0];
  const dayOptions = getTrainingDayOptions(targetLevel);
  const selectedQuickDay = quickExercise.dia || dayOptions[0]?.value || "";

  return (
    <div className="space-y-4">
      <Panel>
        <SegmentedControl value={quickMode} onChange={setQuickMode} options={quickOptions} />
      </Panel>

      {quickMode === "nivel" && (
        <CollapsiblePanel title="Nuevo entreno" onSave={() => onSave("Añadir rápido")} saving={saving}>
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-6 h-6" />
        <h2 className="text-xl font-black">Nuevo entreno</h2>
      </div>
      <div className="space-y-3">
        <Field label="Nombre del entreno" value={quickLevel.nombre} onChange={(value) => setQuickLevel((current) => ({ ...current, nombre: value }))} required />
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Nivel" value={quickLevel.dificultad} onChange={(value) => setQuickLevel((current) => ({ ...current, dificultad: value }))} options={difficultyOptions} required />
          <SelectField label="Sexo" value={quickLevel.sexo} onChange={(value) => setQuickLevel((current) => ({ ...current, sexo: value }))} options={sexOptions} required />
        </div>
        <SelectField label="Duración" value={quickLevel.duracion} onChange={(value) => setQuickLevel((current) => ({ ...current, duracion: value }))} options={durationOptions} required />
        <SelectField label="Estructura" value={quickLevel.estructura} onChange={(value) => setQuickLevel((current) => ({ ...current, estructura: value }))} options={structureOptions} required />
        <ColorField label="Color de tarjetas" value={quickLevel.color} onChange={(value) => setQuickLevel((current) => ({ ...current, color: value }))} />
        <PrimaryAction onClick={addQuickLevel} disabled={!quickLevel.nombre.trim()}>
          Crear entreno
        </PrimaryAction>
      </div>
        </CollapsiblePanel>
      )}

      {(quickMode === "ejercicio" || quickMode === "dia") && (
        <CollapsiblePanel title={quickMode === "dia" ? "Nuevo día" : "Nuevo ejercicio"} onSave={() => onSave("Añadir rápido")} saving={saving}>
      <div className="flex items-center gap-3 mb-4">
        <Dumbbell className="w-6 h-6" />
        <h2 className="text-xl font-black">
          {quickMode === "dia" ? "Nuevo día con primer ejercicio" : "Nuevo ejercicio"}
        </h2>
      </div>
      <div className="space-y-3">
        <SelectField
          label="Entreno destino"
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
            value={selectedQuickDay}
            onChange={(value) =>
              setQuickExercise((current) => ({
                ...current,
                dia: value,
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
        </CollapsiblePanel>
      )}

      {quickMode === "plan" && (
        <CollapsiblePanel title="Nuevo plan" onSave={() => onSave("Añadir rápido")} saving={saving}>
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
        </CollapsiblePanel>
      )}
    </div>
  );
};

const Panel = ({ children }) => (
  <section className="bg-tarjeta-clara dark:bg-tarjeta-oscura border border-borde-claro dark:border-borde-oscuro rounded-2xl p-4 shadow-lg">
    {children}
  </section>
);

const CollapsiblePanel = ({ title, children, action, danger, onSave, saving = false, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="bg-tarjeta-clara dark:bg-tarjeta-oscura border border-borde-claro dark:border-borde-oscuro rounded-2xl p-4 shadow-lg min-w-0">
      <div className={`flex items-center justify-between gap-2 ${open ? "mb-4" : ""}`}>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="min-h-touch-target min-w-0 flex-1 flex items-center gap-2 text-left"
        >
          {open ? <ChevronUp className="w-5 h-5 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 flex-shrink-0" />}
          <span className="text-xl font-black truncate">{title}</span>
        </button>
        <div className="flex gap-2 flex-shrink-0">
          {onSave && (
            <IconButton onClick={onSave} label="Guardar" disabled={saving}>
              <Save className="w-5 h-5" />
            </IconButton>
          )}
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
      {open && children}
    </section>
  );
};

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

const PasswordField = ({ label, visible, setVisible, value, onChange, autoComplete, required = false, hint }) => (
  <Field
    label={label}
    type={visible ? "text" : "password"}
    value={value}
    onChange={onChange}
    autoComplete={autoComplete}
    required={required}
    hint={hint}
    rightAction={
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    }
  />
);

const CheckboxField = ({ label, checked, onChange }) => (
  <label className="min-h-touch-target rounded-xl border border-borde-claro dark:border-borde-oscuro bg-fondo-claro dark:bg-fondo-oscuro px-4 flex items-center gap-3 font-bold cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="w-5 h-5 accent-nivel-1-claro dark:accent-nivel-1-oscuro"
    />
    <span>{label}</span>
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
          {option.emoji ? <span className="w-5 h-5 flex items-center justify-center">{option.emoji}</span> : <Icon className="w-5 h-5" />}
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

const IconButton = ({ children, onClick, label, danger = false, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
      danger
        ? "border-red-300 text-red-600 dark:border-red-800 dark:text-red-300"
        : "border-borde-claro dark:border-borde-oscuro text-texto-claro dark:text-texto-oscuro"
    } hover:bg-fondo-claro dark:hover:bg-fondo-oscuro disabled:opacity-50`}
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
  const normalizeKey = (value) => String(value ?? "").trim().toLowerCase();
  const findDuplicates = (items, getter) => {
    const seen = new Set();
    const duplicated = new Set();

    items.map(getter).filter(Boolean).forEach((value) => {
      const key = normalizeKey(value);
      if (seen.has(key)) duplicated.add(String(value));
      seen.add(key);
    });

    return [...duplicated];
  };

  if (levels.length === 0) {
    errors.push("Debe existir al menos un nivel.");
  }

  findDuplicates(levels, (level) => level.id).forEach((value) => errors.push(`Hay un ID de entreno duplicado: ${value}.`));
  findDuplicates(levels, (level) =>
    String(level.nombre || "").trim()
      ? `${level.nivel ?? level.dificultad}|${level.sexo}|${level.nombre}`
      : null,
  ).forEach((value) => {
    const [, audience, name] = String(value).split("|");
    errors.push(`Hay un entreno duplicado para ${audience}: ${name}.`);
  });
  findDuplicates(levels, (level) => level.slug).forEach((value) => errors.push(`Hay un slug de entreno duplicado: ${value}.`));

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

    findDuplicates(level.dias ?? [], (day) => day.nombre).forEach((value) =>
      errors.push(`${label}: hay un día duplicado llamado ${value}.`),
    );
    findDuplicates(level.ejercicios ?? [], (exercise) => exercise.id).forEach((value) =>
      errors.push(`${label}: hay un ID de ejercicio duplicado: ${value}.`),
    );
    (level.dias ?? []).forEach((day, dayIndex) => {
      const dayLabel = day.nombre || `Día ${dayIndex + 1}`;
      if (!String(day.nombre || "").trim()) errors.push(`${label}: el día ${dayIndex + 1} necesita nombre.`);
      findDuplicates(day.ejercicios ?? [], (exercise) => exercise.numero).forEach((value) =>
        errors.push(`${label} · ${dayLabel}: hay un número de ejercicio duplicado: ${value}.`),
      );
      findDuplicates(day.ejercicios ?? [], (exercise) => exercise.nombre).forEach((value) =>
        errors.push(`${label} · ${dayLabel}: hay un ejercicio duplicado llamado ${value}.`),
      );

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

  findDuplicates(plans, (plan) => plan.id).forEach((value) => errors.push(`Hay un ID de plan duplicado: ${value}.`));
  findDuplicates(plans, (plan) => plan.nombre).forEach((value) => errors.push(`Hay un nombre de plan duplicado: ${value}.`));

  plans.forEach((plan, planIndex) => {
    const label = plan.nombre || `Plan ${planIndex + 1}`;

    if (!Number.isFinite(Number(plan.id))) errors.push(`${label}: el ID es obligatorio.`);
    if (!String(plan.nombre || "").trim()) errors.push(`${label}: el nombre es obligatorio.`);
    if (!String(plan.descripcion || "").trim()) errors.push(`${label}: la descripción es obligatoria.`);
    if (!hexColor.test(plan.color || "")) errors.push(`${label}: el color debe tener formato #RRGGBB.`);

    findDuplicates(plan.dias ?? [], (day) => day.nombre).forEach((value) =>
      errors.push(`${label}: hay un día duplicado llamado ${value}.`),
    );

    (plan.dias ?? []).forEach((day, dayIndex) => {
      if (!String(day.nombre || "").trim()) errors.push(`${label}: el día ${dayIndex + 1} necesita nombre.`);
      findDuplicates(day.comidas ?? [], (meal) => meal.tipo).forEach((value) =>
        errors.push(`${label} · ${day.nombre || `Día ${dayIndex + 1}`}: hay una comida duplicada llamada ${value}.`),
      );

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

const userToProfileForm = (user) => ({
  firstName: user?.firstName || "",
  lastName: user?.lastName || "",
  email: user?.email || "",
  avatarPath: user?.avatarPath || "",
});

const userToAdminForm = (user) => ({
  firstName: user?.firstName || "",
  lastName: user?.lastName || "",
  email: user?.email || "",
  role: user?.role || "user",
  active: user?.active ?? true,
  password: "",
});

const validateUserForm = (form, passwordRequired) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!String(form.firstName || "").trim() || String(form.firstName || "").trim().length < 2) {
    throw new Error("El nombre debe tener al menos 2 caracteres.");
  }

  if (!String(form.lastName || "").trim() || String(form.lastName || "").trim().length < 2) {
    throw new Error("Los apellidos deben tener al menos 2 caracteres.");
  }

  if (!emailPattern.test(String(form.email || "").trim())) {
    throw new Error("Introduce un email válido.");
  }

  if (passwordRequired || String(form.password || "").trim()) {
    validatePasswordForm(form.password);
  }
};

const validatePasswordForm = (password) => {
  const value = String(password || "");

  if (value.length < 10 || value.length > 72) {
    throw new Error("La contraseña debe tener entre 10 y 72 caracteres.");
  }

  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value)) {
    throw new Error("La contraseña debe incluir mayúsculas, minúsculas y números.");
  }
};

export default AdminScreen;
