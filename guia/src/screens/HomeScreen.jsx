import React from "react";
import rutinasData from "../data/rutinas.json";
import LevelCard from "../components/ui/LevelCard";

// 3. Recibe la función para saber qué nivel se seleccionó
const HomeScreen = ({ onSelectLevel }) => {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Selecciona tu nivel</h1>

      {/* 4. Creamos un espacio para las tarjetas */}
      <div className="space-y-5">
        {/* 5. Mapeamos los niveles del JSON y creamos una LevelCard para cada uno */}
        {rutinasData.niveles.map((nivel) => (
          <LevelCard key={nivel.id} nivel={nivel} onClick={onSelectLevel} />
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;
