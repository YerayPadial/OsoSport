import React from "react";
import { X, Dumbbell, ReceiptText, ClipboardList } from "lucide-react";

const SideMenu = ({ isOpen, onClose, onSelectView, onSelectUserTraining, currentView, showDietas = false }) => {
  return (
    <>
      {/* 1. Overlay oscuro */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm
          transition-opacity duration-300
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        aria-hidden="true"
      />

      {/* 2. Panel del Menú */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-72 max-w-[80vw]
          z-[70] isolate border-l border-borde-claro bg-tarjeta-clara text-texto-claro shadow-2xl dark:border-borde-oscuro dark:bg-fondo-oscuro dark:text-texto-oscuro
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0 visible" : "translate-x-full invisible"}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
      >
        {/* Cabecera del Menú */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-borde-claro dark:border-borde-oscuro">
          <div>
            <span className="block text-xl font-black">Menú</span>
            <span className="text-xs font-bold uppercase tracking-wide text-texto-secundario-claro dark:text-texto-secundario-oscuro">
              OsoSport Gym
            </span>
          </div>
          <button
            onClick={onClose}
            className="app-focus p-2 rounded-full text-texto-claro hover:bg-surface-card-high transition-colors dark:text-texto-oscuro"
            aria-label="Cerrar menú"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Opciones del Menú */}
        <nav className="p-4 space-y-2">
          <MenuItem
            label="Rutinas"
            icon={<Dumbbell className="w-5 h-5" />}
            onClick={() => onSelectView("rutinas")}
            isActive={currentView === "rutinas"}
          />
          {showDietas && (
            <MenuItem
              label="Dietas"
              icon={<ReceiptText className="w-5 h-5" />}
              onClick={() => onSelectView("dietas")}
              isActive={currentView === "dietas"}
            />
          )}
          <MenuItem
            label="Marca personal"
            icon={<ClipboardList className="w-5 h-5" />}
            onClick={() => onSelectUserTraining("perfil")}
            isActive={currentView === "misRutinas"}
          />
        </nav>
      </aside>
    </>
  );
};

// Componente helper para las opciones
const MenuItem = ({ label, icon, onClick, isActive }) => {
  const activeClass = isActive
    ? "bg-primary-vanguard text-white font-black"
    : "hover:bg-surface-card-high text-texto-secundario-claro dark:text-texto-secundario-oscuro";

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center w-full text-left gap-3
        app-focus p-4 rounded-lg
        text-base
        transition-all duration-200
        ${activeClass}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default SideMenu;
