import React from "react";
import { X, Dumbbell, ReceiptText, UserRound } from "lucide-react"; // ReceiptText para dietas

const SideMenu = ({ isOpen, onClose, onSelectView, onSelectAdmin, currentView }) => {
  return (
    <>
      {/* 1. Overlay oscuro */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 bg-black/60 z-50
          transition-opacity duration-300
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        aria-hidden="true"
      />

      {/* 2. Panel del Menú */}
      <div
        className={`
          fixed top-0 right-0 h-full w-72 max-w-[80vw]
          bg-tarjeta-clara dark:bg-fondo-oscuro 
          shadow-xl z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
      >
        {/* Cabecera del Menú */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-borde-claro dark:border-borde-oscuro">
          <span className="text-xl font-bold">Menú</span>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-texto-claro dark:text-texto-oscuro hover:bg-fondo-claro dark:hover:bg-tarjeta-oscura transition-colors"
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
          <MenuItem
            label="Dietas"
            icon={<ReceiptText className="w-5 h-5" />}
            onClick={() => onSelectView("dietas")}
            isActive={currentView === "dietas"}
          />
          <MenuItem
            label="Admin"
            icon={<UserRound className="w-5 h-5" />}
            onClick={onSelectAdmin}
            isActive={currentView === "admin"}
          />
        </nav>
      </div>
    </>
  );
};

// Componente helper para las opciones
const MenuItem = ({ label, icon, onClick, isActive }) => {
  const activeClass = isActive
    ? "bg-fondo-claro dark:bg-tarjeta-oscura font-bold"
    : "hover:bg-fondo-claro dark:hover:bg-tarjeta-oscura opacity-80";

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center w-full text-left gap-3
        p-4 rounded-lg
        text-lg text-texto-claro dark:text-texto-oscuro
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
