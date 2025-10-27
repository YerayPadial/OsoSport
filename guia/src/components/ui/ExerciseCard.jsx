import React from "react";
import { ChevronRight } from "lucide-react";

// Componente para mostrar una tarjeta de ejercicio
const colorStyles = {
  1: {
    bg: "bg-nivel-1",
    text: "text-nivel-1",
    border: "hover:border-nivel-1 focus:border-nivel-1",
  },
  2: {
    bg: "bg-nivel-2",
    text: "text-nivel-2",
    border: "hover:border-nivel-2 focus:border-nivel-2",
  },
  3: {
    bg: "bg-nivel-3",
    text: "text-nivel-3",
    border: "hover:border-nivel-3 focus:border-nivel-3",
  },
};

const ExerciseCard = ({ ejercicio, numero, onClick, nivelId }) => {
  const colors = colorStyles[nivelId] || colorStyles[1];

  const thumbnailUrl = `/guia${ejercicio.thumbnail}`;

  return (
    <button
      onClick={() => onClick(ejercicio.id)}
      className={`
        w-full bg-gray-700 rounded-2xl shadow-lg 
        flex items-center p-4 gap-4 
        min-h-touch-target transition-all duration-200 
        transform active:scale-98 border-2 border-transparent 
        outline-none
        ${colors.border} De
      `}
      aria-label={`Ver ejercicio ${ejercicio.nombre}`}
    >
      <div
        className={`
          flex-shrink-0 
          w-20 h-20 sm:w-24 sm:h-24 
          rounded-full 
          bg-gray-800 overflow-hidden 
          relative 
          flex items-center justify-center
        `}
        style={{
          backgroundImage: `url(${thumbnailUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        role="img"
        aria-label={`Miniatura de ${ejercicio.nombre}`}
      >
        <div
          className={`
            absolute top-0 left-0 
            w-11 h-11 
            rounded-br-full 
            flex items-center justify-center 
            text-white text-lg font-extrabold 
            z-10
            ${colors.bg} 
            shadow-lg
          `}
        >
          {numero}
        </div>
      </div>

      <div className="flex-1 text-left overflow-hidden">
        <h3 className="text-xl font-semibold text-white truncate">
          {ejercicio.nombreCorto}
        </h3>
        <p className="text-base text-gray-300 truncate">{ejercicio.musculo}</p>
        <p className={`text-lg font-bold mt-1 truncate ${colors.text}`}>
          {ejercicio.specs}
        </p>
      </div>

      <ChevronRight className="flex-shrink-0 w-8 h-8 text-gray-500" />
    </button>
  );
};

export default ExerciseCard;
