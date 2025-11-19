import React from "react";
import dietasData from "../data/dietas.json";
import { ArrowLeft, CheckCircle } from "lucide-react";

// Mapeo de colores
const titleColorClasses = {
  5: "text-dieta-ganar-claro dark:text-dieta-ganar-oscuro",
  6: "text-dieta-perder-claro dark:text-dieta-perder-oscuro",
};

const DietasDetailScreen = ({ navigation, onGoBack }) => {
  const planActual = dietasData.planes.find(
    (p) => p.id === navigation.planId
  );
  const diaActual = planActual?.dias.find(
    (d) => d.nombre === navigation.diaDieta
  );

  if (!planActual || !diaActual) {
    // ... (Manejo de error)
    return <div>Error: Día de dieta no encontrado</div>;
  }

  const titleClass =
    titleColorClasses[planActual.id] ||
    "text-texto-claro dark:text-texto-oscuro";

  return (
    <div className="bg-fondo-claro dark:bg-fondo-oscuro min-h-screen p-4 max-w-4xl mx-auto pb-20">
      <button
        onClick={onGoBack}
        className="mb-4 p-3 bg-tarjeta-clara dark:bg-tarjeta-oscura text-texto-claro dark:text-texto-oscuro font-medium rounded-lg flex items-center gap-2 min-h-touch-target"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Días
      </button>

      <h1 className={`text-4xl font-black mt-4 ${titleClass}`}>
        {diaActual.nombre}
      </h1>
      <p className="text-2xl font-bold text-texto-secundario-claro dark:text-texto-secundario-oscuro mt-2 mb-8">
        Plan: {planActual.nombre}
      </p>

      {/* Lista de comidas */}
      <div className="space-y-6">
        {diaActual.comidas.map((comida, index) => (
          <div
            key={index}
            className="bg-tarjeta-clara dark:bg-tarjeta-oscura p-5 rounded-2xl shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-4 text-texto-claro dark:text-texto-oscuro">
              {comida.tipo}
            </h2>
            <ul className="space-y-3">
              {comida.alimentos.map((alimento, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className={`w-6 h-6 ${titleClass} flex-shrink-0 mt-1`} />
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
  );
};

export default DietasDetailScreen;