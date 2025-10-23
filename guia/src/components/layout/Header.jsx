import React from "react";
import { Home } from "lucide-react";

// Este componente recibirá el estado de navegación y una función para volver al inicio
const Header = ({ navigation, onGoHome }) => {
  const logoUrl = "/guia/logo-ososport.jpeg";

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="flex items-center justify-between h-20 px-4 max-w-4xl mx-auto">
        {/* Logo */}
        <img
          src={logoUrl}
          alt="Logo de OsoSport Gym"
          className="h-12 w-auto" 
        />

        {/* Botón de Volver a Inicio (solo si no estamos en 'home') */}
        {navigation.screen !== "home" && (
          <button
            onClick={onGoHome}
            className="flex items-center justify-center p-3 bg-gray-100 rounded-full min-w-touch-target min-h-touch-target"
            aria-label="Volver al inicio"
          >
            <Home className="w-6 h-6 text-gray-800" />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
