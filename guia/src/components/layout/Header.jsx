import React from "react";
import { Dumbbell } from "lucide-react";

const Logo = () => (
  <div className="flex items-center gap-2">
    <Dumbbell className="w-8 h-8 text-white" />
    <div className="flex flex-col -space-y-2">
      <span className="text-2xl font-black text-white">OSOSPORT</span>
      <span className="text-xl font-light text-white">GYM</span>
    </div>
  </div>
);

const Header = ({ navigation, onGoHome }) => {
  const isHome = navigation.screen === "home";

  return (
    <header className="sticky top-0 z-50 w-full bg-fondo-oscuro border-b border-gray-700">
      <div className="flex items-center h-20 px-4 max-w-4xl mx-auto">
        {isHome ? (
          <div className="cursor-default" aria-label="Estás en el inicio">
            <Logo />
          </div>
        ) : (
          <button
            onClick={onGoHome}
            className="transition-opacity hover:opacity-80 active:opacity-60"
            aria-label="Volver al inicio"
          >
            <Logo />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
