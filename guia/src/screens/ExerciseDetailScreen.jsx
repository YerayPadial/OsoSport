import React from "react";
import rutinasData from "../data/rutinas.json";
import VideoPlayer from "../components/ui/VideoPlayer";
import { ArrowLeft, CheckCircle, Info, Zap } from "lucide-react";

// Screen para detalle de un ejercicio específico
const ExerciseDetailScreen = ({ navigation, onGoBack }) => {
  const nivelActual = rutinasData.niveles.find(
    (n) => n.id === navigation.nivelId
  );
  const ejercicioActual = nivelActual?.ejercicios.find(
    (ej) => ej.id === navigation.ejercicioId
  );

  if (!ejercicioActual || !nivelActual) {
    return (
      <div className="bg-fondo-oscuro min-h-screen p-4">
        <h1 className="text-2xl text-red-400">
          Error: Ejercicio no encontrado
        </h1>
        <button
          onClick={onGoBack}
          className="mt-4 p-3 bg-gray-700 text-white font-medium rounded-lg flex items-center gap-2 min-h-touch-target"
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
  const colorNivel = nivelActual.color || "#2B7D32";

  return (
    <div className="bg-fondo-oscuro min-h-screen pb-20">
      <div className="p-4 max-w-4xl mx-auto">
        <button
          onClick={onGoBack}
          className="mb-4 p-3 bg-gray-700 text-white font-medium rounded-lg flex items-center gap-2 min-h-touch-target"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a la Lista
        </button>
      </div>

      <VideoPlayer src={videoUrl} poster={thumbnailUrl} />

      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mt-4" style={{ color: colorNivel }}>
          {ejercicioActual.nombre}
        </h1>
        <p className="text-2xl font-bold text-gray-200 mt-2 mb-8">
          {ejercicioActual.specs}
        </p>

        <div className="space-y-6">
          <div className="bg-gray-700 p-5 rounded-2xl shadow-lg">
            <div className="flex items-start gap-3">
              <Info className="w-8 h-8 text-blue-500 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold mb-2 text-white">
                  Descripción
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {ejercicioActual.descripcion ||
                    "Descripción del ejercicio no disponible."}
                </p>
              </div>
            </div>

            <hr className="my-4 border-gray-600" />

            <div className="flex items-start gap-3">
              <Zap className="w-8 h-8 text-yellow-500 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold mb-2 text-white">Músculo</h2>
                <p className="text-lg text-gray-300">
                  {ejercicioActual.musculo}
                </p>
              </div>
            </div>
          </div>

          {ejercicioActual.consejos && ejercicioActual.consejos.length > 0 && (
            <div className="bg-gray-700 p-5 rounded-2xl shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-white">Consejos</h2>
              <ul className="space-y-3">
                {ejercicioActual.consejos.map((consejo, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-lg text-gray-300 leading-relaxed">
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
