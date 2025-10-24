import React from "react";
import { ChevronRight } from "lucide-react";


// Creamos un mapa de estilos.
const colorStyles = {
  1: {
    // Verde
    bg: "bg-nivel-1",
    text: "text-nivel-1",
    border: "hover:border-nivel-1 focus:border-nivel-1",
  },
  2: {
    // Naranja
    bg: "bg-nivel-2",
    text: "text-nivel-2",
    border: "hover:border-nivel-2 focus:border-nivel-2",
  },
  3: {
    // Rojo
    bg: "bg-nivel-3",
    text: "text-nivel-3",
    border: "hover:border-nivel-3 focus:border-nivel-3",
  },
};

// 2. Aceptamos la nueva prop: 'nivelId'
const ExerciseCard = ({ ejercicio, numero, onClick, nivelId }) => {
  // 3. Seleccionamos el set de colores correcto.
  // Si 'nivelId' no se proporciona, usamos el '1' (verde) como reserva.
  const colors = colorStyles[nivelId] || colorStyles[1];

  const thumbnailUrl = `/guia${ejercicio.thumbnail}`;

  return (
    <button
      onClick={() => onClick(ejercicio.id)}
      className={`
        w-full bg-white rounded-2xl shadow-lg 
        flex items-center p-4 gap-4 
        min-h-touch-target transition-all duration-200 
        transform active:scale-98 border-2 border-transparent 
        outline-none
        ${colors.border}  {/* 4. Aplicamos el borde dinámico */}
      `}
      aria-label={`Ver ejercicio ${ejercicio.nombre}`}
    >
      {/* Círculo con el número */}
      <div
        className={`
          flex-shrink-0 w-16 h-16 
          text-white text-3xl font-bold 
          rounded-full flex items-center justify-center
          ${colors.bg}  {/* 5. Aplicamos el fondo dinámico */}
        `}
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
        <p className={`text-lg font-bold mt-1 truncate ${colors.text}`}>
          {" "}
          {/* 6. Aplicamos el texto dinámico */}
          {ejercicio.specs}
        </p>
      </div>

      {/* Flecha a la derecha */}
      <ChevronRight className="flex-shrink-0 w-8 h-8 text-gray-400" />
    </button>
  );
};

export default ExerciseCard;
