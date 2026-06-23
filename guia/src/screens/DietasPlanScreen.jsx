import React from "react";
import { useAppData } from "../data/useAppData";
import DayCard from "../components/ui/DayCard";
import { ArrowLeft } from "lucide-react";
import { getDietColor } from "../utils/contentColors";

const DietasPlanScreen = ({ navigation, onSelectDay, onGoBack }) => {
  const { dietasData } = useAppData();
  const planActual = dietasData.planes.find((p) => p.id === navigation.planId);

  if (!planActual) {
    return <div>Error: Plan no encontrado</div>;
  }

  const planColor = getDietColor(planActual);

  return (
    <div className="bg-fondo-claro dark:bg-fondo-oscuro min-h-screen p-4 max-w-4xl mx-auto">
      <button
        onClick={onGoBack}
        className="mb-4 p-3 bg-tarjeta-clara dark:bg-tarjeta-oscura text-texto-claro dark:text-texto-oscuro font-medium rounded-lg flex items-center gap-2 min-h-touch-target"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Planes
      </button>

      <h1 className="text-4xl font-black mb-6" style={{ color: planColor }}>
        {planActual.nombre}
      </h1>

      <div className="space-y-5">
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
  );
};

export default DietasPlanScreen;
