import React from "react";
import { ArrowRight } from "lucide-react";

// Mapeo de ID a colores de Tailwind (usando los nuevos que añadimos)
const bgClasses = {
  5: "bg-dieta-ganar-claro dark:bg-dieta-ganar-oscuro", // Ganar Peso
  6: "bg-dieta-perder-claro dark:bg-dieta-perder-oscuro", // Perder Peso
};

const DietPlanCard = ({ plan, onClick }) => {
  const bgColor = bgClasses[plan.id] || "bg-gray-500";

  return (
    <button
      onClick={() => onClick(plan.id)}
      className={`
        w-full p-6 rounded-2xl
        flex justify-between items-center
        text-white text-left 
        shadow-lg transition-all duration-300 transform
        hover:scale-105 active:scale-98
        min-h-touch-target
        relative overflow-hidden
        ${bgColor}
      `}
      aria-label={`Seleccionar plan: ${plan.nombre}`}
    >
      <div className="z-10">
        <span className="block text-3xl font-black">{plan.nombre}</span>
        <span className="block text-xl font-normal text-white/80 mt-1">
          {plan.descripcion}
        </span>
      </div>

      <div className="z-10 flex-shrink-0 w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
        <ArrowRight className="w-6 h-6 text-white" />
      </div>
    </button>
  );
};

export default DietPlanCard;
