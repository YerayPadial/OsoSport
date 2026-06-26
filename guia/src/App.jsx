import React, { useEffect, useState } from "react";
import Header from "./components/layout/Header";
import InstallPrompt from "./components/ui/InstallPrompt";
import SideMenu from "./components/layout/SideMenu";
import BottomNavigation from "./components/layout/BottomNavigation";
import HomeScreen from "./screens/HomeScreen";
import LevelScreen from "./screens/LevelScreen";
import ExerciseListScreen from "./screens/ExerciseListScreen";
import ExerciseDetailScreen from "./screens/ExerciseDetailScreen";
import DietasHomeScreen from "./screens/DietasHomeScreen";
import DietasPlanScreen from "./screens/DietasPlanScreen";
import DietasDetailScreen from "./screens/DietasDetailScreen";
import AdminScreen from "./screens/AdminScreen";
import UserTrainingScreen from "./screens/UserTrainingScreen";
import { useAppData } from "./data/useAppData";
import { normalizeSettings, themeStyleFromSettings } from "./utils/appSettings";

function App() {
  const { settings: rawSettings } = useAppData();
  const settings = normalizeSettings(rawSettings);
  const showDietas = settings.navigation.showDietas;

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    if (!showDietas && mainView === "dietas") {
      handleSelectMainView("rutinas");
    }
  // handleSelectMainView intentionally depends on current component state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDietas, mainView]);

  //Estado del menú lateral
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // --- ESTADO DE NAVEGACIÓN ---

  // 'mainView' decide si vemos 'rutinas' o 'dietas'
  const [mainView, setMainView] = useState("rutinas");
  const [trainingInitialTab, setTrainingInitialTab] = useState("perfil");

  // 'navigation' controla la pantalla *dentro* de la vista principal
  const [navigation, setNavigation] = useState({
    screen: "home", // home, level, exerciseList, exerciseDetail, dietHome, dietPlan, dietDetail
    // Para Rutinas
    nivelId: null,
    dia: null,
    ejercicioId: null,
    // Para Dietas
    planId: null,
    diaDieta: null,
  });

  // --- FUNCIONES DE NAVEGACIÓN  ---

  const resetNavigation = (view) => {
    const defaultScreen = view === "rutinas" ? "home" : "dietHome";
    setNavigation({
      screen: defaultScreen,
      nivelId: null,
      dia: null,
      ejercicioId: null,
      planId: null,
      diaDieta: null,
    });
  };

  // Se llama al cambiar en el SideMenu
  const handleSelectMainView = (view) => {
    if (view === "dietas" && !showDietas) {
      view = "rutinas";
    }
    setMainView(view); // 'rutinas' o 'dietas'
    resetNavigation(view);
    setIsMenuOpen(false); // Cerrar el menú
  };

  // Se llama al pulsar el Logo en el Header
  const handleLogoClick = () => {
    resetNavigation(mainView);
  };

  const handleAdminClick = () => {
    setMainView("admin");
    setNavigation({
      screen: "admin",
      nivelId: null,
      dia: null,
      ejercicioId: null,
      planId: null,
      diaDieta: null,
    });
    setIsMenuOpen(false);
  };

  const handleUserTrainingClick = (tab = "perfil") => {
    setTrainingInitialTab(tab);
    setMainView("misRutinas");
    setNavigation({
      screen: "misRutinas",
      nivelId: null,
      dia: null,
      ejercicioId: null,
      planId: null,
      diaDieta: null,
    });
    setIsMenuOpen(false);
  };

  const handleStartOfficialWorkout = async ({ workoutId, dayName = "" }) => {
    setTrainingInitialTab("activo");
    window.sessionStorage.setItem("ososport-pending-official-workout", JSON.stringify({ workoutId, dayName }));
    setMainView("misRutinas");
    setNavigation({
      screen: "misRutinas",
      nivelId: null,
      dia: null,
      ejercicioId: null,
      planId: null,
      diaDieta: null,
    });
  };

  // --- NAVEGACIÓN RUTINAS ---
  const handleSelectLevel = (id) => {
    setNavigation({ ...navigation, screen: "level", nivelId: id });
  };
  const handleGoBackToHome = () => {
    setNavigation({ ...navigation, screen: "home", nivelId: null, dia: null });
  };
  const handleSelectDay = (diaNombre) => {
    setNavigation({ ...navigation, screen: "exerciseList", dia: diaNombre });
  };
  const handleSelectExercise = (ejercicioId) => {
    setNavigation({ ...navigation, screen: "exerciseDetail", ejercicioId });
  };
  const handleGoBackToLevel = () => {
    setNavigation({
      ...navigation,
      screen: "level",
      dia: null,
      ejercicioId: null,
    });
  };
  const handleGoBackFromDetail = () => {
    const screen = navigation.dia ? "exerciseList" : "level";
    setNavigation({ ...navigation, screen: screen, ejercicioId: null });
  };

  // --- NAVEGACIÓN DIETAS ---
  const handleSelectPlan = (planId) => {
    setNavigation({ ...navigation, screen: "dietPlan", planId: planId });
  };
  const handleGoBackToDietHome = () => {
    setNavigation({
      ...navigation,
      screen: "dietHome",
      planId: null,
      diaDieta: null,
    });
  };
  const handleSelectDietDay = (diaNombre) => {
    setNavigation({ ...navigation, screen: "dietDetail", diaDieta: diaNombre });
  };
  const handleGoBackToDietPlan = () => {
    setNavigation({ ...navigation, screen: "dietPlan", diaDieta: null });
  };

  // --- RENDERIZADO DE PANTALLAS ---
  const renderScreen = () => {
    const { screen } = navigation;

    if (mainView === "dietas" && !showDietas) {
      return <HomeScreen onSelectLevel={handleSelectLevel} />;
    }

    // Vistas de Rutinas
    if (mainView === "rutinas") {
      switch (screen) {
        case "home":
          return <HomeScreen onSelectLevel={handleSelectLevel} />;
        case "level":
          return (
            <LevelScreen
              navigation={navigation}
              onSelectDay={handleSelectDay}
              onSelectExercise={handleSelectExercise}
              onGoBack={handleGoBackToHome}
              onStartWorkout={handleStartOfficialWorkout}
            />
          );
        case "exerciseList":
          return (
            <ExerciseListScreen
              navigation={navigation}
              onSelectExercise={handleSelectExercise}
              onGoBack={handleGoBackToLevel}
              onStartWorkout={handleStartOfficialWorkout}
            />
          );
        case "exerciseDetail":
          return (
            <ExerciseDetailScreen
              navigation={navigation}
              onGoBack={handleGoBackFromDetail}
            />
          );
        default:
          return <HomeScreen onSelectLevel={handleSelectLevel} />;
      }
    }

    // Vistas de Dietas
    if (mainView === "dietas") {
      switch (screen) {
        case "dietHome":
          return <DietasHomeScreen onSelectPlan={handleSelectPlan} />;
        case "dietPlan":
          return (
            <DietasPlanScreen
              navigation={navigation}
              onSelectDay={handleSelectDietDay}
              onGoBack={handleGoBackToDietHome}
            />
          );
        case "dietDetail":
          return (
            <DietasDetailScreen
              navigation={navigation}
              onGoBack={handleGoBackToDietPlan}
            />
          );
        default:
          return <DietasHomeScreen onSelectPlan={handleSelectPlan} />;
      }
    }

    if (mainView === "admin") {
      return <AdminScreen onGoBack={() => handleSelectMainView("rutinas")} />;
    }

    if (mainView === "misRutinas") {
      return (
        <UserTrainingScreen
          initialTab={trainingInitialTab}
          onTabChange={setTrainingInitialTab}
          onGoBack={() => handleSelectMainView("rutinas")}
          onLoginClick={handleAdminClick}
        />
      );
    }
  };

  return (
    <div
      className="min-h-screen bg-fondo-claro dark:bg-fondo-oscuro text-texto-claro dark:text-texto-oscuro"
      style={themeStyleFromSettings(settings)}
    >
      <Header
        navigation={navigation}
        currentView={mainView}
        onLogoClick={handleLogoClick}
        onMenuClick={toggleMenu}
        onAdminClick={handleAdminClick}
      />
      <SideMenu
        isOpen={isMenuOpen}
        onClose={toggleMenu}
        onSelectView={handleSelectMainView}
        onSelectUserTraining={handleUserTrainingClick}
        currentView={mainView}
        showDietas={showDietas}
      />
      <main>{renderScreen()}</main>
      <BottomNavigation
        currentView={mainView}
        onSelectView={handleSelectMainView}
        onSelectUserTraining={handleUserTrainingClick}
        showDietas={showDietas}
      />
      <InstallPrompt />
    </div>
  );
}

export default App;
