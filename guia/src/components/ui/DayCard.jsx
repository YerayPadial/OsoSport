import React from "react";
import { CalendarDays, ChevronRight } from "lucide-react";

const DayCard = ({ dia, descripcion, color = "#166534", onClick }) => {
  return (
    <button
      onClick={() => onClick(dia)}
      className="app-focus app-card-high w-full p-4 text-left min-h-touch-target border-l-4 transition-all duration-200 hover:bg-surface-bright active:scale-[0.99]"
      style={{ borderLeftColor: color }}
      aria-label={`Seleccionar día: ${dia}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-surface-low" style={{ color }}>
            <CalendarDays className="h-6 w-6" />
          </span>
          <div className="min-w-0">
          <h2 className="truncate text-xl font-black text-texto-claro dark:text-texto-oscuro">
            {dia}
          </h2>
          {descripcion && <p className="mt-1 line-clamp-2 text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
            {descripcion}
          </p>}
          </div>
        </div>
        <ChevronRight className="ml-4 h-6 w-6 flex-shrink-0 text-texto-secundario-claro dark:text-texto-secundario-oscuro" />
      </div>
    </button>
  );
};

export default DayCard;
