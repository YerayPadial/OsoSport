import React from "react";
import { useAppData } from "../data/useAppData";
import DayCard from "../components/ui/DayCard";
import { ArrowLeft } from "lucide-react";
import { getDietColor } from "../utils/contentColors";
import Badge from "../components/ui/Badge";

const DietasPlanScreen = ({ navigation, onSelectDay, onGoBack }) => {
  const { dietasData } = useAppData();
  const planActual = dietasData.planes.find((p) => p.id === navigation.planId);

  if (!planActual) {
    return <div>Error: Plan no encontrado</div>;
  }

  const planColor = getDietColor(planActual);

  return (
    <div className="app-page">
      <div className="app-container max-w-5xl">
      <button
        onClick={onGoBack}
        className="app-focus mb-5 flex min-h-touch-target items-center gap-2 rounded-lg border border-borde-claro dark:border-borde-oscuro bg-surface-card px-4 font-black"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Planes
      </button>

      <header className="mb-6">
        <Badge tone="primary">Plan nutricional</Badge>
        <h1 className="mt-3 text-4xl font-black text-texto-claro dark:text-texto-oscuro sm:text-5xl">
          {planActual.nombre}
        </h1>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {planActual.dias.map((diaInfo) => (
          <DayCard
            key={diaInfo.nombre}
            dia={diaInfo.nombre}
            descripcion={null} 
            color={planColor}
            onClick={onSelectDay}
          />
        ))}
      </div>
      </div>
    </div>
  );
};

export default DietasPlanScreen;
