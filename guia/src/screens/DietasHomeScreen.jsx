import React from "react";
import { useAppData } from "../data/useAppData";
import DietPlanCard from "../components/ui/DietPlanCard";
import StatCard from "../components/ui/StatCard";
import { CalendarDays, Utensils } from "lucide-react";

const DietasHomeScreen = ({ onSelectPlan }) => {
  const { dietasData } = useAppData();

  return (
    <div className="app-page">
      <div className="app-container">
        <header className="mb-6 grid gap-4 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-primary-soft">
              Nutrición
            </p>
            <h1 className="mt-1 text-4xl font-black text-texto-claro dark:text-texto-oscuro sm:text-5xl">
              Elige tu plan
            </h1>
            <p className="mt-2 max-w-2xl text-base font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
              Menús organizados por día para acompañar tu objetivo de entrenamiento.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Utensils} label="Planes" value={dietasData.planes.length} />
            <StatCard icon={CalendarDays} label="Días" value={dietasData.planes.reduce((total, plan) => total + (plan.dias?.length ?? 0), 0)} tone="success" />
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dietasData.planes.map((plan) => (
            <DietPlanCard key={plan.id} plan={plan} onClick={onSelectPlan} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DietasHomeScreen;
