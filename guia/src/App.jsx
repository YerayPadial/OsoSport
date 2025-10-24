import React, { useState } from "react";
import Header from "./components/layout/Header";
import HomeScreen from "./screens/HomeScreen";
import LevelScreen from "./screens/LevelScreen";
import ExerciseListScreen from "./screens/ExerciseListScreen";
import ExerciseDetailScreen from "./screens/ExerciseDetailScreen";

function App() {
  // El estado que controla toda la navegación
  const [navigation, setNavigation] = useState({
    screen: "home",
    nivelId: null,
    dia: null,
    ejercicioId: null,
  });

  // --- FUNCIONES DE NAVEGACIÓN ---

  // Ir a la pantalla de inicio
  const handleGoHome = () => {
    setNavigation({
      screen: "home",
      nivelId: null,
      dia: null,
      ejercicioId: null,
    });
  };

  // Se llama desde HomeScreen -> LevelCard
  const handleSelectLevel = (id) => {
    setNavigation({
      ...navigation,
      screen: "level",
      nivelId: id,
    });
  };

  // Se llama desde LevelScreen -> Botón Volver
  const handleGoBackToHome = () => {
    handleGoHome();
  };

  // Se llama desde LevelScreen -> DayCard (Nivel 2 o 3)
  const handleSelectDay = (diaNombre) => {
    setNavigation({
      ...navigation,
      screen: "exerciseList",
      dia: diaNombre,
    });
  };

  // Se llama desde LevelScreen (Nivel 1) o ExerciseListScreen (Nivel 2/3)
  const handleSelectExercise = (ejercicioId) => {
    setNavigation({
      ...navigation,
      screen: "exerciseDetail",
      ejercicioId: ejercicioId,
    });
  };

  // Se llama desde ExerciseListScreen -> Botón Volver
  const handleGoBackToLevel = () => {
    setNavigation({
      ...navigation,
      screen: "level",
      dia: null,
      ejercicioId: null,
    });
  };

  // Se llama desde ExerciseDetailScreen -> Botón Volver
  const handleGoBackFromDetail = () => {
    // Si venimos de un día (Nivel 2 o 3), volvemos a 'exerciseList'
    if (navigation.dia) {
      setNavigation({
        ...navigation,
        screen: "exerciseList",
        ejercicioId: null,
      });
    } else {
      // Si no (Nivel 1), volvemos a 'level'
      setNavigation({
        ...navigation,
        screen: "level",
        ejercicioId: null,
      });
    }
  };

  // --- RENDERIZADO DE PANTALLAS ---

  // Función para decidir qué pantalla mostrar
  const renderScreen = () => {
    switch (navigation.screen) {
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
  };

  return (
    // Usamos un fondo gris claro para la app
    <div className="min-h-screen bg-gray-50">
      <Header navigation={navigation} onGoHome={handleGoHome} />
      <main>{renderScreen()}</main>
    </div>
  );
}

export default App;
