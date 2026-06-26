import React from "react";
import { ChevronRight } from "lucide-react";
import Badge from "./Badge";

const ExerciseCard = ({ ejercicio, numero, onClick, color = "#166534" }) => {
  const thumbnailUrl = `/guia${ejercicio.thumbnail}`;

  return (
    <button
      onClick={() => onClick(ejercicio.id)}
      className={`
        app-focus app-card-high
        w-full flex items-center p-3 gap-4
        min-h-touch-target transition-all duration-200
        hover:bg-surface-bright active:scale-[0.99] border
      `}
      style={{ borderColor: "transparent", "--exercise-accent": color }}
      aria-label={`Ver ejercicio ${ejercicio.nombre}`}
    >
      <div
        className={`
          flex-shrink-0
          w-16 h-16 sm:w-20 sm:h-20
          rounded-lg
          bg-surface-variant
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
            w-8 h-8 rounded-br-lg
            flex items-center justify-center
            text-white text-sm font-black
            z-10 font-numeric
          `}
            style={{ backgroundColor: color }}
        >
          {numero}
        </div>
      </div>

      <div className="flex-1 text-left overflow-hidden">
        <h3 className="text-lg font-black text-texto-claro dark:text-texto-oscuro truncate">
          {ejercicio.nombreCorto}
        </h3>
        <div className="mt-1 flex items-center gap-2 overflow-hidden">
          <Badge>{ejercicio.musculo}</Badge>
        </div>
        <p className="mt-2 truncate font-numeric text-sm font-bold text-primary-soft">
          {ejercicio.specs}
        </p>
      </div>

      <ChevronRight className="flex-shrink-0 w-6 h-6 text-texto-secundario-claro dark:text-texto-secundario-oscuro" />
    </button>
  );
};

export default ExerciseCard;
