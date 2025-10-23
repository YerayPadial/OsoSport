import React, { useState } from "react";
import Header from "./components/layout/Header.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";

function App() {
  const [navigation, setNavigation] = useState({
    screen: "home", // Pantalla actual'
    nivelId: null, // ID del nivel seleccionado (1, 2, o 3)
    dia: null, // Día seleccionado (ej: "Lunes y Jueves")
    ejercicioId: null, // ID del ejercicio (ej: "n1_01")
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

  // Se llama cuando el usuario pulsa una LevelCard
  const handleSelectLevel = (id) => {
    setNavigation({
      ...navigation,
      screen: "level", 
      nivelId: id,
    });
  };

  // --- RENDERIZADO DE PANTALLAS ---

  // Función para decidir qué pantalla mostrar
  const renderScreen = () => {
    switch (navigation.screen) {
      case "home":
        return <HomeScreen onSelectLevel={handleSelectLevel} />;

      case "level":
        // Próximamente: crearemos LevelScreen
        // return <LevelScreen navigation={navigation} ... />;
        return (
          <div className="p-4">
            <h1 className="text-2xl">
              Próximamente: Nivel {navigation.nivelId}
            </h1>
            <button
              onClick={handleGoHome}
              className="p-2 bg-blue-500 text-white rounded mt-4"
            >
              Volver
            </button>
          </div>
        );

      case "exerciseDetail":
        // Próximamente: crearemos ExerciseDetailScreen
        // return <ExerciseDetailScreen navigation={navigation} ... />;
        return (
          <div className="p-4">
            <h1 className="text-2xl">Próximamente: Detalle de Ejercicio</h1>
            {/* Corrección: Corregir la etiqueta de cierre del botón */}
            <button
              onClick={handleGoHome}
              className="p-2 bg-blue-500 text-white rounded mt-4"
            >
              Volver
            </button>
          </div>
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
