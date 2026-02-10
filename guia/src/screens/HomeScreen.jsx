import React from "react";
import rutinasData from "../data/rutinas.json";
import LevelCard from "../components/ui/LevelCard";
import { Dumbbell } from "lucide-react";

const HomeScreen = ({ onSelectLevel }) => {
  // Lista de IDs que quieres mostrar
  const idsVisibles = [1, 2, 5];

  return (
    <div className="bg-fondo-claro dark:bg-fondo-oscuro min-h-screen p-4 pt-8">
      <header className="text-center mb-10">
        <div className="flex justify-center items-center gap-3">
          <span className="text-4xl font-black text-texto-claro dark:text-texto-oscuro">
            Elige tu nivel
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-texto-secundario-claro dark:text-texto-secundario-oscuro mt-4">
          Crece con nosotros ¡Suerte en tu entrenamiento!
        </h1>
      </header>

      <div className="max-w-lg mx-auto space-y-5">
        {rutinasData.niveles
          // 👇 AQUÍ ESTÁ EL CAMBIO:
          // Solo mostramos el nivel si su ID está incluido en la lista [1, 2, 5]
          .filter((nivel) => idsVisibles.includes(nivel.id))
          .map((nivel) => (
            <LevelCard key={nivel.id} nivel={nivel} onClick={onSelectLevel} />
          ))}
      </div>
    </div>
  );
};

export default HomeScreen;


  // ---------------Quitar esto para todos los niveles-----------------
  /*
// Pantalla principal para seleccionar el nivel de entrenamiento
const HomeScreen = ({ onSelectLevel }) => {
  return (
    <div className="bg-fondo-claro dark:bg-fondo-oscuro min-h-screen p-4 pt-8">
      <header className="text-center mb-10">
        <div className="flex justify-center items-center gap-3">
          <span className="text-4xl font-black text-texto-claro dark:text-texto-oscuro">
            Elige tu nivel
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-texto-secundario-claro dark:text-texto-secundario-oscuro mt-4">
          Crece con nosotros ¡Suerte en tu entrenamiento!
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
*/