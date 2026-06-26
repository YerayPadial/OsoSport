import React from "react";
import { ArrowRight, Utensils } from "lucide-react";
import { getDietColor } from "../../utils/contentColors";
import Badge from "./Badge";

const DietPlanCard = ({ plan, onClick }) => {
  const bgColor = getDietColor(plan);

  return (
    <button
      onClick={() => onClick(plan.id)}
      className="app-focus app-card-high group relative flex w-full min-h-[118px] items-center justify-between overflow-hidden p-4 text-left transition hover:bg-surface-bright active:scale-[0.99]"
      aria-label={`Seleccionar plan: ${plan.nombre}`}
    >
      <span className="absolute -right-4 -bottom-5 text-8xl font-black opacity-10" style={{ color: bgColor }}>
        <Utensils className="h-24 w-24" />
      </span>
      <div className="z-10 space-y-2">
        <Badge tone="primary">Nutrición</Badge>
        <span className="block text-2xl font-black text-texto-claro dark:text-texto-oscuro">{plan.nombre}</span>
        <span className="block text-sm font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro">
          {plan.descripcion}
        </span>
      </div>

      <div className="z-10 flex-shrink-0 w-11 h-11 rounded-full bg-primary-vanguard flex items-center justify-center text-white">
        <ArrowRight className="w-5 h-5" />
      </div>
    </button>
  );
};

export default DietPlanCard;
