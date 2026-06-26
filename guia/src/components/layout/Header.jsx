import React, { useEffect, useState } from "react";
import { Dumbbell, Menu, UserRound } from "lucide-react";

const titles = {
  rutinas: "Rutinas",
  dietas: "Dietas",
  misRutinas: "Marca personal",
  admin: "Perfil",
};

const Header = ({
  navigation,
  currentView,
  onLogoClick,
  onAdminClick,
  onMenuClick,
}) => {
  const [sessionUser, setSessionUser] = useState(null);
  const isHome =
    navigation.screen === "home" || navigation.screen === "dietHome";
  const avatarUrl = sessionUser?.avatarPath?.startsWith("/")
    ? `/guia${sessionUser.avatarPath}`
    : sessionUser?.avatarPath;
  const title = titles[currentView] ?? "OsoSport";

  useEffect(() => {
    const loadSession = () => {
      fetch(`${import.meta.env.BASE_URL}api/admin-auth.php?action=status`, {
        credentials: "include",
      })
        .then((response) => response.json())
        .then((payload) => setSessionUser(payload.authenticated ? payload.user : null))
        .catch(() => setSessionUser(null));
    };

    loadSession();
    window.addEventListener("focus", loadSession);
    window.addEventListener("ososport-auth-change", loadSession);

    return () => {
      window.removeEventListener("focus", loadSession);
      window.removeEventListener("ososport-auth-change", loadSession);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-borde-oscuro/80 bg-fondo-oscuro/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          onClick={isHome ? undefined : onLogoClick}
          className="app-focus flex items-center gap-3 rounded-lg pr-2 text-left transition hover:opacity-90"
          aria-label={isHome ? "Inicio" : "Volver al inicio"}
        >
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-borde-oscuro bg-surface-card-high">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Dumbbell className="h-5 w-5 text-primary-soft" />
            )}
          </span>
          <span>
            <span className="block text-xl font-black leading-tight text-texto-oscuro">
              {title}
            </span>
            <span className="hidden text-xs font-bold uppercase tracking-wide text-texto-secundario-oscuro sm:block">
              OsoSport Gym
            </span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onAdminClick}
            className="app-focus flex h-10 w-10 items-center justify-center rounded-full text-texto-secundario-oscuro transition hover:bg-surface-card-high hover:text-texto-oscuro"
            aria-label="Abrir cuenta"
            title="Cuenta"
          >
            <UserRound className="h-5 w-5" />
          </button>
          <button
            onClick={onMenuClick}
            className="app-focus flex h-10 w-10 items-center justify-center rounded-full text-primary-soft transition hover:bg-surface-card-high"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
