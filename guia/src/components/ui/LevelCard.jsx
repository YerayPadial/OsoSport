import React from "react";
import { ArrowRight, Clock, Dumbbell } from "lucide-react";
import { getLevelColor } from "../../utils/contentColors";
import Badge from "./Badge";

// Componente para mostrar una tarjeta de nivel en la pantalla de inicio
const LevelCard = ({ nivel, onClick }) => {
  const bgColor = getLevelColor(nivel);

  return (
    <button
      onClick={() => onClick(nivel.id)}
      className="app-focus app-card-high group relative flex w-full min-h-[128px] overflow-hidden p-4 text-left transition duration-200 hover:bg-surface-bright active:scale-[0.99]"
      aria-label={`Seleccionar nivel ${nivel.nombre}`}
    >
      <span
        className="absolute -right-2 bottom-0 z-0 font-numeric text-9xl font-black text-white/5 select-none"
        style={{ color: bgColor }}
      >
        {nivel.dificultad}
      </span>

      <div className="z-10 flex flex-1 flex-col justify-between gap-4">
        <div className="space-y-2">
          <Badge tone={nivel.dificultad <= 1 ? "success" : nivel.dificultad >= 3 ? "danger" : "warning"}>
            Nivel {nivel.dificultad}
          </Badge>
          <span className="block text-2xl font-black text-texto-claro dark:text-texto-oscuro">
            {nivel.nombre}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" />
            45 min
          </span>
          <span className="inline-flex items-center gap-1">
            <Dumbbell className="h-4 w-4" />
            {nivel.ejercicios?.length ?? 0} ej.
          </span>
          <span>{nivel.sexo}</span>
        </div>
      </div>

      <div className="z-10 ml-3 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary-vanguard text-white transition group-hover:bg-primary-soft group-hover:text-blue-950">
        <ArrowRight className="w-5 h-5" />
      </div>
    </button>
  );
};

export default LevelCard;
