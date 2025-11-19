import React from "react";
import dietasData from "../data/dietas.json";
import DayCard from "../components/ui/DayCard";
import { ArrowLeft } from "lucide-react";

// Mapeo de colores (para el título)
const titleColorClasses = {
  5: "text-dieta-ganar-claro dark:text-dieta-ganar-oscuro",
  6: "text-dieta-perder-claro dark:text-dieta-perder-oscuro",
};

const DietasPlanScreen = ({ navigation, onSelectDay, onGoBack }) => {
  const planActual = dietasData.planes.find((p) => p.id === navigation.planId);

  if (!planActual) {
    // ... (Manejo de error igual que en LevelScreen)
    return <div>Error: Plan no encontrado</div>;
  }

  const titleClass =
    titleColorClasses[planActual.id] ||
    "text-texto-claro dark:text-texto-oscuro";

  return (
    <div className="bg-fondo-claro dark:bg-fondo-oscuro min-h-screen p-4 max-w-4xl mx-auto">
      <button
        onClick={onGoBack}
        className="mb-4 p-3 bg-tarjeta-clara dark:bg-tarjeta-oscura text-texto-claro dark:text-texto-oscuro font-medium rounded-lg flex items-center gap-2 min-h-touch-target"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Planes
      </button>

      <h1 className={`text-4xl font-black mb-6 ${titleClass}`}>
        {planActual.nombre}
      </h1>

      <div className="space-y-5">
        {planActual.dias.map((diaInfo) => (
          <DayCard
            key={diaInfo.nombre}
            dia={diaInfo.nombre}
            descripcion={null} 
            nivelId={planActual.id} 
            onClick={onSelectDay}
          />
        ))}
      </div>
    </div>
  );
};

export default DietasPlanScreen;
