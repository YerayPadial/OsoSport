import React from "react";
import rutinasData from "../data/rutinas.json";
import LevelCard from "../components/ui/LevelCard";

const HomeScreen = ({ onSelectLevel }) => {
  return (
    <div className="bg-white min-h-screen p-4 max-w-4xl mx-auto">
      <h1 className="text-4xl font-black text-gray-900 mb-2">
        Selecciona tu nivel
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Comienza con la rutina que mejor se adapte a ti.
      </p>

      {/* 4. Creamos un espacio para las tarjetas */}
      <div className="space-y-5">
        {/* 5. Mapeamos los niveles */}
        {rutinasData.niveles.map((nivel) => (
          <LevelCard key={nivel.id} nivel={nivel} onClick={onSelectLevel} />
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;
