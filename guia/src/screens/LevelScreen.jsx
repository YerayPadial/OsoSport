import React from "react";
import rutinasData from "../data/rutinas.json";
import ExerciseCard from "../components/ui/ExerciseCard";
import DayCard from "../components/ui/DayCard";
import { ArrowLeft } from "lucide-react";

const LevelScreen = ({
  navigation,
  onSelectDay,
  onSelectExercise,
  onGoBack,
}) => {
  // 1. Encontrar el nivel actual usando el nivelId del estado
  const nivelActual = rutinasData.niveles.find(
    (n) => n.id === navigation.nivelId
  );

  // Si no se encuentra el nivel, mostramos un error
  if (!nivelActual) {
    return (
      <div className="bg-white min-h-screen p-4">
        <h1 className="text-2xl text-red-500">Error: Nivel no encontrado</h1>
        <button
          onClick={onGoBack}
          className="mt-4 p-3 bg-gray-100 text-gray-700 font-medium rounded-lg flex items-center gap-2 min-h-touch-target"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
      </div>
    );
  }

  // 2. Función para renderizar el contenido
  const renderContent = () => {
    if (nivelActual.estructura === "Full Body") {
      return (
        <div className="space-y-4">
          {nivelActual.ejercicios.map((ejercicio, index) => (
            <ExerciseCard
              key={ejercicio.id}
              ejercicio={ejercicio}
              numero={index + 1}
              onClick={onSelectExercise}
              nivelId={nivelActual.id}
            />
          ))}
        </div>
      );
    }

    const diasUnicos = [...new Set(nivelActual.ejercicios.map((e) => e.dia))];
    const diasConDescripcion = diasUnicos.map((dia) => {
      const primerEjercicioDelDia = nivelActual.ejercicios.find(
        (e) => e.dia === dia
      );
      return {
        nombre: dia,
        descripcion: primerEjercicioDelDia.descripcion,
      };
    });

    return (
      <div className="space-y-5">
        {diasConDescripcion.map((diaInfo) => (
          <DayCard
            key={diaInfo.nombre}
            dia={diaInfo.nombre}
            descripcion={diaInfo.descripcion}
            color={nivelActual.color}
            onClick={onSelectDay}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen p-4 max-w-4xl mx-auto">
      {/* Botón de Volver */}
      <button
        onClick={onGoBack}
        className="mb-4 p-3 bg-gray-100 text-gray-700 font-medium rounded-lg flex items-center gap-2 min-h-touch-target"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Niveles
      </button>

      {/* Título del Nivel */}
      <h1
        className="text-4xl font-black mb-2"
        style={{ color: nivelActual.color }}
      >
        {nivelActual.nombre}
      </h1>

      {/* TIPOGRAFÍA: Texto grande (20px), gris oscuro y con "aire" */}
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        {"Calentamiento en " + nivelActual.calentamiento}
      </p>

      {/* Contenido (Ejercicios o Días) */}
      {renderContent()}
    </div>
  );
};

export default LevelScreen;
