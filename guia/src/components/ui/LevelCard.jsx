import React from "react";

// Mapeo para conectar el ID del nivel con el color de Tailwind
const colorClasses = {
  1: "bg-nivel-1 hover:bg-green-800", // Verde
  2: "bg-nivel-2 hover:bg-orange-700", // Naranja
  3: "bg-nivel-3 hover:bg-red-800", // Rojo
};

const LevelCard = ({ nivel, onClick }) => {
  // Obtenemos la clase de color correcta, o un color por defecto
  const color = colorClasses[nivel.id] || "bg-gray-500 hover:bg-gray-600";

  return (
    <button
      onClick={() => onClick(nivel.id)}
      // Aplicamos las clases de Tailwind
      className={`
            w-full p-6 rounded-2xl shadow-lg text-white 
            font-bold text-left transition-all duration-200 
            transform active:scale-98 min-h-touch-target
            flex flex-col justify-center
            ${color}
          `}
      aria-label={`Seleccionar nivel ${nivel.nombre}`}
    >
      {/* Número del Nivel */}
      <span className="text-6xl font-black">{nivel.id}</span>

      {/* Nombre del Nivel */}
      <span className="text-3xl mt-1">{nivel.nombre}</span>

      {/* Duración */}
      <span className="text-lg font-normal opacity-90 mt-2">
        {nivel.duracion}
      </span>
    </button>
  );
};

export default LevelCard;
