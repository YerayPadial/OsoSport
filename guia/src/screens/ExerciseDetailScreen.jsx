import React from "react";
import { useAppData } from "../data/useAppData";
import VideoPlayer from "../components/ui/VideoPlayer";
import { ArrowLeft, CheckCircle, Info, Zap } from "lucide-react";
import { getLevelColor } from "../utils/contentColors";
import Badge from "../components/ui/Badge";

// Screen para detalle de un ejercicio específico

const ExerciseDetailScreen = ({ navigation, onGoBack }) => {
  const { rutinasData } = useAppData();
  const nivelActual = rutinasData.niveles.find(
    (n) => n.id === navigation.nivelId
  );
  const ejercicioActual = nivelActual?.ejercicios.find(
    (ej) => ej.id === navigation.ejercicioId
  );

  if (!ejercicioActual || !nivelActual) {
    return (
      <div className="bg-fondo-claro dark:bg-fondo-oscuro min-h-screen p-4">
        <h1 className="text-2xl text-red-400">
          Error: Ejercicio no encontrado
        </h1>
        <button
          onClick={onGoBack}
          className="mt-4 p-3 bg-tarjeta-clara dark:bg-tarjeta-oscura text-texto-claro dark:text-texto-oscuro font-medium rounded-lg flex items-center gap-2 min-h-touch-target"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
      </div>
    );
  }

  const BASE_URL = "/guia/";
  const videoUrl = `${BASE_URL}${ejercicioActual.video.substring(1)}`;
  const thumbnailUrl = `${BASE_URL}${ejercicioActual.thumbnail.substring(1)}`;
  const levelColor = getLevelColor(nivelActual);

  return (
    <div className="app-page">
      <div className="app-container max-w-5xl pb-4">
        <button
          onClick={onGoBack}
          className="app-focus mb-4 flex min-h-touch-target items-center gap-2 rounded-lg border border-borde-claro dark:border-borde-oscuro bg-surface-card px-4 font-black"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a la Lista
        </button>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-borde-oscuro bg-surface-low">
          <VideoPlayer src={videoUrl} poster={thumbnailUrl} />
        </div>
      </div>

      <div className="app-container max-w-5xl pt-5">
        <Badge tone="primary">{ejercicioActual.musculo}</Badge>
        <h1 className="mt-3 text-4xl font-black text-texto-claro dark:text-texto-oscuro sm:text-5xl">
          {ejercicioActual.nombre}
        </h1>
        <p className="font-numeric text-lg font-bold text-primary-soft mt-2 mb-6">
          {ejercicioActual.specs}
        </p>

        <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
          <div className="app-card p-5">
            <div className="flex items-start gap-3">
              <Info className="w-8 h-8 text-blue-500 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold mb-2 text-texto-claro dark:text-texto-oscuro">
                  Descripción
                </h2>
                <p className="text-lg text-texto-secundario-claro dark:text-texto-secundario-oscuro leading-relaxed">
                  {ejercicioActual.descripcion ||
                    "Descripción del ejercicio no disponible."}
                </p>
              </div>
            </div>

            <hr className="my-4 border-borde-claro dark:border-borde-oscuro" />

            <div className="flex items-start gap-3">
              <Zap className="w-8 h-8 text-yellow-500 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold mb-2 text-texto-claro dark:text-texto-oscuro">
                  Músculo
                </h2>
                <p className="text-lg text-texto-secundario-claro dark:text-texto-secundario-oscuro">
                  {ejercicioActual.musculo}
                </p>
              </div>
            </div>
          </div>

          {ejercicioActual.consejos && ejercicioActual.consejos.length > 0 && (
            <div className="app-card p-5">
              <h2 className="text-xl font-bold mb-4 text-texto-claro dark:text-texto-oscuro">
                Consejos
              </h2>
              <ul className="space-y-3">
                {ejercicioActual.consejos.map((consejo, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: levelColor }} />
                    <span className="text-lg text-texto-secundario-claro dark:text-texto-secundario-oscuro leading-relaxed">
                      {consejo}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailScreen;
