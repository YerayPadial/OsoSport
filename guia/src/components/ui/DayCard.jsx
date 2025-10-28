import React from "react";
import { ChevronRight } from "lucide-react";

// 1. Mapeo de ID a clases de Tailwind
const colorClasses = {
  1: { border: "border-nivel-1", text: "text-nivel-1" },
  2: { border: "border-nivel-1Fem", text: "text-nivel-1Fem" },
  3: { border: "border-nivel-2", text: "text-nivel-2" },
  4: { border: "border-nivel-3", text: "text-nivel-3" },
};

// 2. Recibe 'nivelId'
const DayCard = ({ dia, descripcion, nivelId, onClick }) => {
  // 3. Obtiene las clases correctas usando el ID
  const colors = colorClasses[nivelId] || {
    border: "border-gray-500",
    text: "text-gray-200",
  };

  return (
    <button
      onClick={() => onClick(dia)}
      className={`
        w-full bg-gray-700 rounded-2xl shadow-lg 
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
          <p className="text-lg text-gray-300 mt-2">{descripcion}</p>
        </div>
        <ChevronRight className="flex-shrink-0 w-10 h-10 text-gray-500 ml-4" />
      </div>
    </button>
  );
};

export default DayCard;
