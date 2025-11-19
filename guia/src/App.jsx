import React, { useState, useEffect } from "react";
import Header from "./components/layout/Header";
import InstallPrompt from "./components/ui/InstallPrompt";
import SideMenu from "./components/layout/SideMenu";
import HomeScreen from "./screens/HomeScreen";
import LevelScreen from "./screens/LevelScreen";
import ExerciseListScreen from "./screens/ExerciseListScreen";
import ExerciseDetailScreen from "./screens/ExerciseDetailScreen";
import DietasHomeScreen from "./screens/DietasHomeScreen";
import DietasPlanScreen from "./screens/DietasPlanScreen";
import DietasDetailScreen from "./screens/DietasDetailScreen";

function App() {
  // --- 1. ESTADO DEL TEMA ---
  // El modo oscuro es el predeterminado
  const [theme, setTheme] = useState("dark");

  // --- 2. EFECTO PARA ACTUALIZAR EL HTML ---
  useEffect(() => {
    const root = document.documentElement; //etiqueta <html>
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]); // Se ejecuta cada vez que 'theme' cambia

  // --- 3. FUNCIÓN PARA CAMBIAR EL 'theme'---
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  //Estado del menú lateral
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // --- ESTADO DE NAVEGACIÓN ---

  // 'mainView' decide si vemos 'rutinas' o 'dietas'
  const [mainView, setMainView] = useState("rutinas");

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
    setMainView(view); // 'rutinas' o 'dietas'
    resetNavigation(view);
    setIsMenuOpen(false); // Cerrar el menú
  };

  // Se llama al pulsar el Logo en el Header
  const handleLogoClick = () => {
    resetNavigation(mainView);
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
            />
          );
        case "exerciseList":
          return (
            <ExerciseListScreen
              navigation={navigation}
              onSelectExercise={handleSelectExercise}
              onGoBack={handleGoBackToLevel}
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
  };

  return (
    <div className="min-h-screen bg-fondo-claro dark:bg-fondo-oscuro text-texto-claro dark:text-texto-oscuro">
      <Header
        navigation={navigation}
        onLogoClick={handleLogoClick}
        theme={theme}
        toggleTheme={toggleTheme}
        onMenuClick={toggleMenu}
      />
      <SideMenu
        isOpen={isMenuOpen}
        onClose={toggleMenu}
        onSelectView={handleSelectMainView}
        currentView={mainView}
      />
      <main>{renderScreen()}</main>
      <InstallPrompt />
    </div>
  );
}

export default App;
