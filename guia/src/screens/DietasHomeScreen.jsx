import React from "react";
import { useAppData } from "../data/useAppData";
import DietPlanCard from "../components/ui/DietPlanCard";

const DietasHomeScreen = ({ onSelectPlan }) => {
  const { dietasData } = useAppData();

  return (
    <div className="bg-fondo-claro dark:bg-fondo-oscuro min-h-screen p-4 pt-8">
      <header className="text-center mb-10">
        <div className="flex justify-center items-center gap-3">
          <span className="text-4xl font-black text-texto-claro dark:text-texto-oscuro">
            Elige tu plan
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-texto-secundario-claro dark:text-texto-secundario-oscuro mt-4">
          Nutrición adaptada a tus objetivos.
        </h1>
      </header>

      <div className="max-w-lg mx-auto space-y-5">
        {dietasData.planes.map((plan) => (
          <DietPlanCard key={plan.id} plan={plan} onClick={onSelectPlan} />
        ))}
      </div>
    </div>
  );
};

export default DietasHomeScreen;
