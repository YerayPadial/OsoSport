import React from "react";
import { ChevronRight } from "lucide-react";

// 1. Mapeo de ID a clases de Tailwind
const colorClasses = {
  1: {
    border: "border-nivel-1-claro dark:border-nivel-1-oscuro",
    text: "text-nivel-1-claro dark:text-nivel-1-oscuro",
  },
  2: {
    border: "border-nivel-1Fem-claro dark:border-nivel-1Fem-oscuro",
    text: "text-nivel-1Fem-claro dark:text-nivel-1Fem-oscuro",
  },
  3: {
    border: "border-nivel-2-claro dark:border-nivel-2-oscuro",
    text: "text-nivel-2-claro dark:text-nivel-2-oscuro",
  },
  4: {
    border: "border-nivel-3-claro dark:border-nivel-3-oscuro",
    text: "text-nivel-3-claro dark:text-nivel-3-oscuro",
  },
  5: {
    border: "border-dieta-ganar-claro dark:border-dieta-ganar-oscuro",
    text: "text-dieta-ganar-claro dark:text-dieta-ganar-oscuro",
  },
  6: {
    border: "border-dieta-perder-claro dark:border-dieta-perder-oscuro",
    text: "text-dieta-perder-claro dark:text-dieta-perder-oscuro",
  },
};
// 2. Recibe 'nivelId'
const DayCard = ({ dia, descripcion, nivelId, onClick }) => {
  // 3. Obtiene las clases correctas usando el ID
  const colors = colorClasses[nivelId] || {
    border: "border-borde-claro dark:border-borde-oscuro",
    text: "text-texto-claro dark:text-texto-oscuro",
  };

  return (
    <button
      onClick={() => onClick(dia)}
      className={`
        w-full bg-tarjeta-clara dark:bg-tarjeta-oscura rounded-2xl shadow-lg
        p-6 text-left min-h-touch-target
        border-l-8 transition-all duration-200
        transform active:scale-98
        ${colors.border}
      `}
      aria-label={`Seleccionar día: ${dia}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className={`text-3xl font-bold ${colors.text}`}>{dia}</h2>
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
