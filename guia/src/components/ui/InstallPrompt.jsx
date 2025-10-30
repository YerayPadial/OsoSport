import React, { useState, useEffect } from "react";
import { X, Download } from "lucide-react";

const InstallPrompt = () => {
  // Estado para el tipo de dispositivo
  const [promptType, setPromptType] = useState(null); // 'ios' | 'android' | null
  // Estado para guardar el evento de instalación de Android/Desktop
  const [installEvent, setInstallEvent] = useState(null);

  useEffect(() => {
    // 1. Comprobar si ya está instalada (modo standalone)
    const isInStandaloneMode = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    if (isInStandaloneMode) {
      setPromptType(null); // No mostrar nada si ya está instalada
      return;
    }

    // 2. Comprobar si es iOS
    const isDeviceIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isDeviceIOS) {
      setPromptType("ios");
      return; // Es iOS, mostrar instrucciones de Safari
    }

    // 3. Escuchar el evento de instalación en Android/Desktop (Chrome, Edge)
    const handler = (e) => {
      e.preventDefault(); // Prevenir el aviso automático del navegador
      setInstallEvent(e); // Guardar el evento
      setPromptType("android"); // Indicar que podemos mostrar nuestro botón
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []); // Se ejecuta solo una vez al montar el componente

  // --- CONTROLADORES DE EVENTOS ---

  // Para el botón de cerrar
  const handleClose = () => {
    setPromptType(null); // Oculta el aviso
  };

  // Para el botón de "Instalar" en Android/Desktop
  const handleInstallClick = async () => {
    if (!installEvent) return; // No hacer nada si el evento no está listo

    // Mostrar el diálogo de instalación nativo del navegador
    installEvent.prompt();

    // Esperar a que el usuario elija
    await installEvent.userChoice;

    // Limpiar: ocultar nuestro botón y borrar el evento
    setPromptType(null);
    setInstallEvent(null);
  };

  // --- RENDERIZADO ---

  // CASO 1: Es iOS
  if (promptType === "ios") {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl bg-tarjeta-clara dark:bg-tarjeta-oscura p-4 shadow-xl border border-borde-claro dark:border-borde-oscuro">
        <button
          onClick={handleClose}
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

  // CASO 2: Es Android o Desktop (y el evento está listo)
  if (promptType === "android" && installEvent) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl bg-tarjeta-clara dark:bg-tarjeta-oscura p-4 shadow-xl border border-borde-claro dark:border-borde-oscuro">
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
        {/* Hacemos que todo el cuerpo sea un botón */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={handleInstallClick}
        >
          <Download className="w-8 h-8 text-texto-claro dark:text-texto-oscuro flex-shrink-0" />
          <div>
            <p className="font-bold text-texto-claro dark:text-texto-oscuro">
              ¡Instala OsoSport Gym!
            </p>
            <p className="text-sm text-texto-secundario-claro dark:text-texto-secundario-oscuro">
              Toca aquí para añadirla a tu pantalla de inicio y usarla offline.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // CASO 3: No mostrar nada (ya está instalada o no es compatible)
  return null;
};

export default InstallPrompt;
