import React from "react";

// 1. Mapeo para las clases de ACENTO.
// Ya no necesitamos 'hover:' aquí, lo controlará la tarjeta.
const accentClasses = {
  1: "bg-nivel-1", // Verde
  2: "bg-nivel-2", // Naranja
  3: "bg-nivel-3", // Rojo
};

const LevelCard = ({ nivel, onClick }) => {
  // 2. Obtenemos la clase de acento, o un color por defecto
  const accentColor = accentClasses[nivel.id] || "bg-gray-500";

  return (
    <button
      onClick={() => onClick(nivel.id)}
      className={`
        w-full p-5 rounded-2xl shadow-lg bg-white
        flex items-center gap-5 
        text-left transition-all duration-300 transform 
        hover:shadow-xl hover:-translate-y-1 active:scale-98
        min-h-touch-target
      `}
      aria-label={`Seleccionar nivel ${nivel.nombre}`}
    >
      {/* 4. BLOQUE DE ACENTO (El Número) */}
      <div
        className={`
          ${accentColor}
          w-20 h-20 rounded-2xl 
          flex items-center justify-center 
          flex-shrink-0
        `}
      >
        <span className="text-5xl font-black text-white">{nivel.id}</span>
      </div>

      {/* 5. BLOQUE DE TEXTO */}
      <div className="flex-grow">
        <span className="block text-2xl font-bold text-gray-900">
          {nivel.nombre}
        </span>
        <span className="block text-lg font-normal text-gray-600 mt-1">
          {nivel.duracion}
        </span>
      </div>
    </button>
  );
};

export default LevelCard;
