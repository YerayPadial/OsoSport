import React from "react";
import { ArrowRight } from "lucide-react";

const bgClasses = {
  1: "bg-nivel-1",
  2: "bg-nivel-2",
  3: "bg-nivel-3",
};

const LevelCard = ({ nivel, onClick }) => {
  const bgColor = bgClasses[nivel.id] || "bg-gray-500";

  return (
    <button
      onClick={() => onClick(nivel.id)}
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
      aria-label={`Seleccionar nivel ${nivel.nombre}`}
    >
      <span className="absolute -right-2 bottom-0 z-0 text-9xl font-black text-white/10 select-none">
        {nivel.id}
      </span>

      <div className="z-10">
        <span className="block text-3xl font-black">{nivel.nombre}</span>
        <span className="block text-xl font-normal text-white/80 mt-1">
         Nivel {nivel.id} &nbsp;|&nbsp; {nivel.duracion}
        </span>
      </div>

      <div className="z-10 flex-shrink-0 w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
        <ArrowRight className="w-6 h-6 text-white" />
      </div>
    </button>
  );
};

export default LevelCard;
