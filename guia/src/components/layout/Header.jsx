import React from "react";
import { Dumbbell, Sun, Moon, Menu } from "lucide-react";

const Logo = () => (
  <div className="flex items-center gap-2">
    <Dumbbell className="w-8 h-8 text-texto-claro dark:text-texto-oscuro" />{" "}
    <div className="flex flex-col -space-y-2 text-left">
      <span className="text-2xl font-black text-texto-claro dark:text-texto-oscuro">
        OSOSPORT
      </span>
      <span className="text-xl font-light text-texto-claro dark:text-texto-oscuro">
        GYM
      </span>
    </div>
  </div>
);

const Header = ({
  navigation,
  onLogoClick,
  theme,
  toggleTheme,
  onMenuClick,
}) => {
  const isHome =
    navigation.screen === "home" || navigation.screen === "dietHome";

  return (
    <header className="sticky top-0 z-50 w-full bg-tarjeta-clara dark:bg-fondo-oscuro border-b border-borde-claro dark:border-borde-oscuro">
      <div className="flex items-center justify-between h-20 px-4 max-w-4xl mx-auto">
        {/* Logo*/}
        {isHome ? (
          <div className="cursor-default" aria-label="Estás en el inicio">
            <Logo />
          </div>
        ) : (
          <button
            onClick={onLogoClick}
            className="transition-opacity hover:opacity-80 active:opacity-60"
            aria-label="Volver al inicio"
          >
            <Logo />
          </button>
        )}
        <div className="flex items-center gap-2">
          {/* Botón theme*/}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-texto-claro dark:text-texto-oscuro hover:bg-fondo-claro dark:hover:bg-tarjeta-oscura transition-colors min-h-touch-target min-w-touch-target flex items-center justify-center"
            aria-label={
              theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"
            }
          >
            {theme === "dark" ? (
              <Sun className="w-6 h-6" />
            ) : (
              <Moon className="w-6 h-6" />
            )}
          </button>
          {/* Botón menú*/}
          {
            /*
            
            <button
            onClick={onMenuClick}
            className="p-2 rounded-full text-texto-claro dark:text-texto-oscuro hover:bg-fondo-claro dark:hover:bg-tarjeta-oscura transition-colors min-h-touch-target min-w-touch-target flex items-center justify-center"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-6 h-6" />
          </button>
            
            */
            <button
            onClick={onMenuClick}
            className="p-2 rounded-full text-texto-claro dark:text-texto-oscuro hover:bg-fondo-claro dark:hover:bg-tarjeta-oscura transition-colors min-h-touch-target min-w-touch-target flex items-center justify-center"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-6 h-6" />
          </button>
          }
        </div>
      </div>
    </header>
  );
};

export default Header;
