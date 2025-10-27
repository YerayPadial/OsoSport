import React from "react";
import { ChevronRight } from "lucide-react";

// Componente para mostrar una tarjeta de día
const DayCard = ({ dia, descripcion, color, onClick }) => {
  // Mapeo de colores para el borde
  const borderColors = {
    "#2B7D32": "border-nivel-1",
    "#F59E0B": "border-nivel-2",
    "#DC2626": "border-nivel-3",
  };

  // Mapeo de colores para el texto
  const textColors = {
    "#2B7D32": "text-nivel-1",
    "#F59E0B": "text-nivel-2",
    "#DC2626": "text-nivel-3",
  };

  const borderColor = borderColors[color] || "border-gray-500";
  const textColor = textColors[color] || "text-gray-800";

  return (
    <button
      onClick={() => onClick(dia)}
      className={`
        w-full bg-white rounded-2xl shadow-lg 
        p-6 text-left min-h-touch-target 
        border-l-8 transition-all duration-200 
        transform active:scale-98
        ${borderColor}
      `}
      aria-label={`Seleccionar día: ${dia}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Nombre del Día */}
          <h2 className={`text-3xl font-bold ${textColor}`}>{dia}</h2>

          {/* Descripción (Grupos musculares) */}
          <p className="text-lg text-gray-600 mt-2">{descripcion}</p>
        </div>

        <ChevronRight className="flex-shrink-0 w-10 h-10 text-gray-400 ml-4" />
      </div>
    </button>
  );
};

export default DayCard;
