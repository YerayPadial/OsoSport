import React from "react";
import { ChevronRight } from "lucide-react";

const DayCard = ({ dia, descripcion, color = "#166534", onClick }) => {
  return (
    <button
      onClick={() => onClick(dia)}
      className={`
        w-full bg-tarjeta-clara dark:bg-tarjeta-oscura rounded-2xl shadow-lg
        p-6 text-left min-h-touch-target
        border-l-8 transition-all duration-200
        transform active:scale-98
      `}
      style={{ borderLeftColor: color }}
      aria-label={`Seleccionar día: ${dia}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-3xl font-bold" style={{ color }}>
            {dia}
          </h2>
          <p className="text-lg text-texto-secundario-claro dark:text-texto-secundario-oscuro mt-2">
            {descripcion}
          </p>
        </div>
        <ChevronRight className="flex-shrink-0 w-10 h-10 text-gray-400 dark:text-gray-500 ml-4" />
      </div>
    </button>
  );
};

export default DayCard;
