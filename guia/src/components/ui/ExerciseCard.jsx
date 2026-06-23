import React from "react";
import { ChevronRight } from "lucide-react";

const ExerciseCard = ({ ejercicio, numero, onClick, color = "#166534" }) => {
  const thumbnailUrl = `/guia${ejercicio.thumbnail}`;

  return (
    <button
      onClick={() => onClick(ejercicio.id)}
      className={`
        w-full bg-tarjeta-clara dark:bg-tarjeta-oscura rounded-2xl shadow-lg
        flex items-center p-4 gap-4
        min-h-touch-target transition-all duration-200
        transform active:scale-98 border-2
        outline-none
      `}
      style={{ borderColor: "transparent", "--exercise-accent": color }}
      aria-label={`Ver ejercicio ${ejercicio.nombre}`}
    >
      <div
        className={`
          flex-shrink-0
          w-20 h-20 sm:w-24 sm:h-24
          rounded-full
          bg-fondo-claro dark:bg-tarjeta-oscura 
          overflow-hidden relative
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
            w-11 h-11 rounded-br-full
            flex items-center justify-center
            text-white text-lg font-extrabold
            z-10
            shadow-lg
          `}
            style={{ backgroundColor: color }}
        >
          {numero}
        </div>
      </div>

      <div className="flex-1 text-left overflow-hidden">
        <h3 className="text-xl font-semibold text-texto-claro dark:text-texto-oscuro truncate">
          {ejercicio.nombreCorto}
        </h3>
        <p className="text-base text-texto-secundario-claro dark:text-texto-secundario-oscuro truncate">
          {ejercicio.musculo}
        </p>
        <p className="text-lg font-bold mt-1 truncate text-[var(--exercise-accent)] dark:text-texto-oscuro">
          {ejercicio.specs}
        </p>
      </div>

      <ChevronRight className="flex-shrink-0 w-8 h-8 text-gray-400 dark:text-gray-500" />
    </button>
  );
};

export default ExerciseCard;
