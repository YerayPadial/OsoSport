import React from "react";
import rutinasData from "../data/rutinas.json";
import ExerciseCard from "../components/ui/ExerciseCard";
import DayCard from "../components/ui/DayCard";
import { ArrowLeft } from "lucide-react";

//Pantalla para listar ejercicios que no tienen dias o seleccionar dias

const titleColorClasses = {
  1: "text-nivel-1-claro dark:text-nivel-1-oscuro",
  2: "text-nivel-1Fem-claro dark:text-nivel-1Fem-oscuro",
  3: "text-nivel-2-claro dark:text-nivel-2-oscuro",
  4: "text-nivel-3-claro dark:text-nivel-3-oscuro",
};

const LevelScreen = ({
  navigation,
  onSelectDay,
  onSelectExercise,
  onGoBack,
}) => {
  const nivelActual = rutinasData.niveles.find(
    (n) => n.id === navigation.nivelId
  );

  if (!nivelActual) {
    return (
      <div className="bg-fondo-claro dark:bg-fondo-oscuro min-h-screen p-4">
        <h1 className="text-2xl text-red-400">Error: Nivel no encontrado</h1>
        <button
          onClick={onGoBack}
          className="mt-4 p-3 bg-tarjeta-clara dark:bg-tarjeta-oscura text-texto-claro dark:text-texto-oscuro font-medium rounded-lg flex items-center gap-2 min-h-touch-target"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
      </div>
    );
  }

  const titleClass =
    titleColorClasses[nivelActual.id] ||
    "text-texto-claro dark:text-texto-oscuro";

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
            nivelId={nivelActual.id}
            onClick={onSelectDay}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-fondo-claro dark:bg-fondo-oscuro min-h-screen p-4 max-w-4xl mx-auto">
      <button
        onClick={onGoBack}
        className="mb-4 p-3 bg-tarjeta-clara dark:bg-tarjeta-oscura text-texto-claro dark:text-texto-oscuro font-medium rounded-lg flex items-center gap-2 min-h-touch-target"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Niveles
      </button>

      <h1 className={`text-4xl font-black mb-2 ${titleClass}`}>
        {nivelActual.nombre}
      </h1>

      <p className="text-xl text-texto-secundario-claro dark:text-texto-secundario-oscuro mb-6 leading-relaxed">
        {"Calentamiento en " + nivelActual.calentamiento}
      </p>

      {renderContent()}
    </div>
  );
};

export default LevelScreen;
