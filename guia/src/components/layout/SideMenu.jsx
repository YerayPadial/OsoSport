import React from "react";
import { X, Dumbbell, ReceiptText, ClipboardList } from "lucide-react";

const SideMenu = ({ isOpen, onClose, onSelectView, onSelectUserTraining, currentView, showDietas = true }) => {
  return (
    <>
      {/* 1. Overlay oscuro */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 bg-black/70 z-50 backdrop-blur-sm
          transition-opacity duration-300
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        aria-hidden="true"
      />

      {/* 2. Panel del Menú */}
      <div
        className={`
          fixed top-0 right-0 h-full w-72 max-w-[80vw]
          bg-surface-card border-l border-borde-oscuro shadow-2xl z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
      >
        {/* Cabecera del Menú */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-borde-oscuro">
          <div>
            <span className="block text-xl font-black">Menú</span>
            <span className="text-xs font-bold uppercase tracking-wide text-texto-secundario-oscuro">
              OsoSport Gym
            </span>
          </div>
          <button
            onClick={onClose}
            className="app-focus p-2 rounded-full text-texto-oscuro hover:bg-surface-card-high transition-colors"
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
      </div>
    </>
  );
};

// Componente helper para las opciones
const MenuItem = ({ label, icon, onClick, isActive }) => {
  const activeClass = isActive
    ? "bg-primary-vanguard text-white font-black"
    : "hover:bg-surface-card-high text-texto-secundario-oscuro";

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
