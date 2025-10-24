import React from "react";
import rutinasData from "../data/rutinas.json";
// A ver si el bundler prefiere la ruta sin la extensión .jsx
import ExerciseCard from "../components/ui/ExerciseCard";
import { ArrowLeft } from "lucide-react";

const ExerciseListScreen = ({ navigation, onSelectExercise, onGoBack }) => {
  // 1. Encontrar el nivel actual
  const nivelActual = rutinasData.niveles.find(
    (n) => n.id === navigation.nivelId
  );

  // 2. Filtrar los ejercicios que coincidan con el día seleccionado
  // Usamos la propiedad "dia" de tu JSON
  const ejerciciosDelDia = nivelActual.ejercicios.filter(
    (ej) => ej.dia === navigation.dia
  );

  // 3. Encontrar el color del nivel para los botones
  const colorNivel = nivelActual.color || "#2B7D32";

  // Si no se encuentra el nivel, mostramos un error
  if (!nivelActual || !ejerciciosDelDia) {
    return (
      <div className="p-4">
        <h1 className="text-2xl text-red-500">
          Error: No se encontraron ejercicios
        </h1>
        <button
          onClick={onGoBack}
          className="mt-4 p-3 bg-gray-200 rounded-lg flex items-center gap-2 min-h-touch-target"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* --- BOTÓN DE VOLVER --- */}
      <button
        onClick={onGoBack}
        className="mb-4 p-3 bg-gray-100 rounded-lg flex items-center gap-2 min-h-touch-target"
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
        {ejerciciosDelDia.map((ejercicio, index) => (
          <ExerciseCard
            key={ejercicio.id}
            ejercicio={ejercicio}
            numero={ejercicio.numero} 
            onClick={onSelectExercise}
          />
        ))}
      </div>
    </div>
  );
};

export default ExerciseListScreen;
