import React from "react";
import rutinasData from "../data/rutinas.json";
import ExerciseCard from "../components/ui/ExerciseCard";
import { ArrowLeft } from "lucide-react";

// Screen para lista de ejercicios de un día específico
const ExerciseListScreen = ({ navigation, onSelectExercise, onGoBack }) => {
  const nivelActual = rutinasData.niveles.find(
    (n) => n.id === navigation.nivelId
  );
  const ejerciciosDelDia =
    nivelActual?.ejercicios.filter((ej) => ej.dia === navigation.dia) || [];
  const colorNivel = nivelActual?.color || "#2B7D32";

  if (!nivelActual || !ejerciciosDelDia) {
    return (
      <div className="bg-fondo-oscuro min-h-screen p-4">
        <h1 className="text-2xl text-red-400">
          Error: No se encontraron ejercicios
        </h1>
        <button
          onClick={onGoBack}
          className="mt-4 p-3 bg-gray-700 text-white font-medium rounded-lg flex items-center gap-2 min-h-touch-target"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="bg-fondo-oscuro min-h-screen p-4 max-w-4xl mx-auto">
      {/* --- BOTÓN DE VOLVER --- */}
      <button
        onClick={onGoBack}
        className="mb-4 p-3 bg-gray-700 text-white font-medium rounded-lg flex items-center gap-2 min-h-touch-target"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Días
      </button>

      {/* --- TÍTULO --- */}
      <h1 className="text-4xl font-black mb-6" style={{ color: colorNivel }}>
        {navigation.dia}
      </h1>

      {/* --- LISTA DE EJERCICIOS --- */}
      <div className="space-y-4">
        {ejerciciosDelDia.map((ejercicio) => (
          <ExerciseCard
            key={ejercicio.id}
            ejercicio={ejercicio}
            numero={ejercicio.numero}
            onClick={onSelectExercise}
            nivelId={navigation.nivelId}
          />
        ))}
      </div>
    </div>
  );
};

export default ExerciseListScreen;
