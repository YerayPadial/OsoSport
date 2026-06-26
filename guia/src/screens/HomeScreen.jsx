import React from "react";
import { useAppData } from "../data/useAppData";
import LevelCard from "../components/ui/LevelCard";
import StatCard from "../components/ui/StatCard";
import { Dumbbell, Flame } from "lucide-react";

const HomeScreen = ({ onSelectLevel }) => {
  const { rutinasData } = useAppData();
  // Lista de IDs que quieres mostrar
  const idsVisibles = [1, 2, 3, 4, 5, 6];

  return (
    <div className="app-page">
      <div className="app-container">
      <header className="mb-6 grid gap-4 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-primary-soft">
            Guía oficial
          </p>
          <h1 className="mt-1 text-4xl font-black tracking-normal text-texto-claro dark:text-texto-oscuro sm:text-5xl">
            Elige tu nivel
          </h1>
          <p className="mt-2 max-w-2xl text-base font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
            Rutinas listas para entrenar, con vídeos, músculos y progresión por dificultad.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Dumbbell} label="Niveles" value={idsVisibles.length} />
          <StatCard icon={Flame} label="Ejercicios" value={rutinasData.niveles.reduce((total, nivel) => total + (nivel.ejercicios?.length ?? 0), 0)} tone="success" />
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rutinasData.niveles
          .filter((nivel) => idsVisibles.includes(nivel.id))
          .map((nivel) => (
            <LevelCard key={nivel.id} nivel={nivel} onClick={onSelectLevel} />
          ))}
      </div>
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
