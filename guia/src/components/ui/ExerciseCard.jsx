import React from "react";
import { ChevronRight } from "lucide-react";

const ExerciseCard = ({ ejercicio, numero, onClick }) => {
  // Construimos la URL del thumbnail. Usamos la config 'base' de Vite.
  // Ejemplo: /guia/thumbnails/abdominal-encogimiento.jpg
  const thumbnailUrl = `/guia${ejercicio.thumbnail}`;

  return (
    <button
      onClick={() => onClick(ejercicio.id)}
      className="
        w-full bg-white rounded-2xl shadow-lg 
        flex items-center p-4 gap-4 
        min-h-touch-target transition-all duration-200 
        transform active:scale-98 border-2 border-transparent 
        hover:border-nivel-1 focus:border-nivel-1 outline-none
      "
      aria-label={`Ver ejercicio ${ejercicio.nombre}`}
    >
      {/* Círculo con el número */}
      <div
        className="
          flex-shrink-0 w-16 h-16 bg-nivel-1 
          text-white text-3xl font-bold 
          rounded-full flex items-center justify-center
        "
      >
        {numero}
      </div>

      {/* Miniatura (Thumbnail) */}
      <img
        src={thumbnailUrl}
        alt={`Miniatura de ${ejercicio.nombre}`}
        className="flex-shrink-0 w-20 h-20 object-cover rounded-lg bg-gray-200"
        loading="lazy" 
      />

      {/* Información del ejercicio */}
      <div className="flex-1 text-left overflow-hidden">
        <h3 className="text-xl font-semibold text-gray-900 truncate">
          {ejercicio.nombreCorto}
        </h3>
        <p className="text-base text-gray-600 truncate">{ejercicio.musculo}</p>
        <p className="text-lg font-bold text-nivel-1 mt-1 truncate">
          {ejercicio.specs}
        </p>
      </div>

      {/* Flecha a la derecha */}
      <ChevronRight className="flex-shrink-0 w-8 h-8 text-gray-400" />
    </button>
  );
};

export default ExerciseCard;
