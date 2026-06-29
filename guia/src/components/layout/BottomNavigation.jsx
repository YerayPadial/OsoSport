import React from "react";
import { ClipboardList, Dumbbell, ReceiptText } from "lucide-react";

const baseItems = [
  { value: "rutinas", label: "Rutinas", icon: Dumbbell },
  { value: "dietas", label: "Dietas", icon: ReceiptText },
  { value: "marca", label: "Marca", icon: ClipboardList, trainingTab: "perfil" },
];

const BottomNavigation = ({ currentView, onSelectView, onSelectUserTraining, showDietas = false }) => {
  const items = baseItems.filter((item) => showDietas || item.value !== "dietas");

  const handleClick = (item) => {
    if (item.trainingTab) return onSelectUserTraining(item.trainingTab);
    return onSelectView(item.value);
  };
  const isActive = (item) => {
    if (item.trainingTab) {
      return currentView === "misRutinas";
    }
    return currentView === item.value;
  };

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-borde-oscuro/80 bg-surface-card/95 px-3 py-2 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg gap-1" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <button
                key={item.value}
                onClick={() => handleClick(item)}
                className={`app-focus flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-full text-xs font-black transition active:scale-95 ${
                  active
                    ? "bg-success-vanguard text-green-950"
                    : "text-texto-secundario-claro dark:text-texto-secundario-oscuro hover:text-texto-claro dark:hover:text-texto-oscuro"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNavigation;
