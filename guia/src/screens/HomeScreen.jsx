import React from "react";
import rutinasData from "../data/rutinas.json";
import LevelCard from "../components/ui/LevelCard";
import { Dumbbell } from "lucide-react";

const HomeScreen = ({ onSelectLevel }) => {
  return (
    <div className="bg-fondo-oscuro min-h-screen p-4 pt-8">
      <header className="text-center mb-10">
        <div className="flex justify-center items-center gap-3">
          <span className="text-4xl font-black text-white">Elige tu nivel</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-200 mt-4">
          Crece con nosotros, suerte en tu entrenamiento!
        </h1>
      </header>

      <div className="max-w-lg mx-auto space-y-5">
        {rutinasData.niveles.map((nivel) => (
          <LevelCard key={nivel.id} nivel={nivel} onClick={onSelectLevel} />
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;
