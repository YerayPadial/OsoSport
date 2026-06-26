import React from "react";
import { useAppData } from "../data/useAppData";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { getDietColor } from "../utils/contentColors";
import Badge from "../components/ui/Badge";

const DietasDetailScreen = ({ navigation, onGoBack }) => {
  const { dietasData } = useAppData();
  const planActual = dietasData.planes.find(
    (p) => p.id === navigation.planId
  );
  const diaActual = planActual?.dias.find(
    (d) => d.nombre === navigation.diaDieta
  );

  if (!planActual || !diaActual) {
    return <div>Error: Día de dieta no encontrado</div>;
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
        Volver a Días
      </button>

      <header className="mb-6">
        <Badge tone="primary">{planActual.nombre}</Badge>
        <h1 className="mt-3 text-4xl font-black text-texto-claro dark:text-texto-oscuro sm:text-5xl">
          {diaActual.nombre}
        </h1>
      </header>

      {/* Lista de comidas */}
      <div className="grid gap-4 lg:grid-cols-2">
        {diaActual.comidas.map((comida, index) => (
          <div
            key={index}
            className="app-card p-5"
          >
            <h2 className="text-2xl font-bold mb-4 text-texto-claro dark:text-texto-oscuro">
              {comida.tipo}
            </h2>
            <ul className="space-y-3">
              {comida.alimentos.map((alimento, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: planColor }} />
                  <span className="text-lg text-texto-secundario-claro dark:text-texto-secundario-oscuro leading-relaxed">
                    {alimento}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default DietasDetailScreen;
