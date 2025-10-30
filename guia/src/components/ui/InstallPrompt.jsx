import React, { useState, useEffect } from "react";
import { X, Download } from "lucide-react";

const InstallPrompt = () => {
  const [isIOS, setIsIOS] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Detecta si es iOS (iPhone/iPad)
    const isDeviceIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isDeviceIOS);

    // Comprueba si ya está en modo PWA (standalone)
    const isInStandaloneMode = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    if (isInStandaloneMode) {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible) {
    return null; // No mostrar nada si ya está instalada o no es visible
  }

  // --- Instrucciones para iOS ---
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl bg-tarjeta-clara dark:bg-tarjeta-oscura p-4 shadow-xl border border-borde-claro dark:border-borde-oscuro">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3">
          <Download className="w-8 h-8 text-texto-claro dark:text-texto-oscuro flex-shrink-0" />
          <div>
            <p className="font-bold text-texto-claro dark:text-texto-oscuro">
              ¡Instala la Guía en tu iPhone!
            </p>
            <p className="text-sm text-texto-secundario-claro dark:text-texto-secundario-oscuro">
              Toca el icono de **Compartir** (cuadrado con flecha) y luego
              **"Añadir a pantalla de inicio"**.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Instrucciones para Android/PC (El navegador lo gestiona solo) ---
  // (VitePWA gestionará el aviso de instalación automáticamente en Android/Chrome)
  // No necesitamos mostrar un aviso manual para Android porque el
  // navegador mostrará la barra de "Instalar aplicación" él solo.

  return null; // No mostrar nada en Android (el navegador se encarga)
};

export default InstallPrompt;
