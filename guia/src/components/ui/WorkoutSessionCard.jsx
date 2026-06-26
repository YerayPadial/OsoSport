import React from "react";
import { Activity, ChevronRight } from "lucide-react";

const WorkoutSessionCard = ({ title, subtitle, meta, active, onClick }) => (
  <button
    onClick={onClick}
    className={`app-focus app-card-high w-full p-4 text-left transition hover:bg-surface-bright active:scale-[0.99] ${
      active ? "border-primary-vanguard" : ""
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-low text-primary-soft">
            <Activity className="h-5 w-5" />
          </span>
          <p className="truncate text-lg font-black text-texto-claro dark:text-texto-oscuro">
            {title}
          </p>
        </div>
        {subtitle && (
          <p className="line-clamp-2 text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
            {subtitle}
          </p>
        )}
        {meta && (
          <p className="mt-3 font-numeric text-xs font-bold uppercase tracking-wide text-texto-secundario-claro dark:text-texto-secundario-oscuro">
            {meta}
          </p>
        )}
      </div>
      <ChevronRight className="mt-1 h-5 w-5 flex-shrink-0 text-texto-secundario-claro dark:text-texto-secundario-oscuro" />
    </div>
  </button>
);

export default WorkoutSessionCard;
