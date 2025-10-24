import React from "react";
import rutinasData from "../data/rutinas.json";
import VideoPlayer from "../components/ui/VideoPlayer";
import { ArrowLeft, CheckCircle, Info, Zap } from "lucide-react";

const ExerciseDetailScreen = ({ navigation, onGoBack }) => {
  // 1. Encontrar el nivel actual
  const nivelActual = rutinasData.niveles.find(
    (n) => n.id === navigation.nivelId
  );

  // 2. Encontrar el ejercicio actual dentro de la lista de ejercicios del nivel
  const ejercicioActual = nivelActual?.ejercicios.find(
    (ej) => ej.id === navigation.ejercicioId
  );

  // Si no se encuentra el ejercicio, mostramos un error
  if (!ejercicioActual || !nivelActual) {
    return (
      <div className="p-4">
        <h1 className="text-2xl text-red-500">
          Error: Ejercicio no encontrado
        </h1>
        <button
          onClick={onGoBack}
          className="mt-4 p-3 bg-gray-200 rounded-lg flex items-center gap-2 min-h-touch-target"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
      </div>
    );
  }

  // 3. CONSTRUIR LA RUTA DEL VÍDEO
  // Hardcodeamos la URL base a '/guia/'
  const BASE_URL = "/guia/";
  const videoUrl = `${BASE_URL}${ejercicioActual.video.substring(1)}`;
  const thumbnailUrl = `${BASE_URL}${ejercicioActual.thumbnail.substring(1)}`;

  // 4. Determinar el color del nivel para los títulos
  const colorNivel = nivelActual.color || "#2B7D32";

  return (
    <div className="pb-20">
      {" "}
      <div className="p-4 max-w-4xl mx-auto">
        <button
          onClick={onGoBack}
          className="mb-4 p-3 bg-gray-100 rounded-lg flex items-center gap-2 min-h-touch-target"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a la Lista
        </button>
      </div>
      {/* --- REPRODUCTOR DE VÍDEO --- */}
      <VideoPlayer src={videoUrl} poster={thumbnailUrl} />
      <div className="p-4 max-w-4xl mx-auto">
        {/* --- GRUPO 1: TÍTULO Y SPECS --- */}
        <h1 className="text-4xl font-black mt-4" style={{ color: colorNivel }}>
          {" "}
          {/* Añadido mt-4 para espacio post-video */}
          {ejercicioActual.nombre}
        </h1>
        <p className="text-2xl font-bold text-gray-800 mt-2 mb-8">
          {ejercicioActual.specs}
        </p>
        {/* --- GRUPO 2: BLOQUE DE INFORMACIÓN (con espaciado interno) --- */}
        <div className="space-y-6">
          {/* --- TARJETA DE INFORMACIÓN --- */}
          <div className="bg-white p-5 rounded-2xl shadow-lg">
            {/* ... (contenido de Descripción y Músculo sin cambios) ... */}
            <div className="flex items-start gap-3">
              <Info className="w-8 h-8 text-blue-500 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold mb-2">Descripción</h2>
                <p className="text-lg text-gray-700">
                  {ejercicioActual.descripcion ||
                    "Descripción del ejercicio no disponible."}
                </p>
              </div>
            </div>

            <hr className="my-4" />

            <div className="flex items-start gap-3">
              <Zap className="w-8 h-8 text-yellow-500 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold mb-2">Músculo</h2>
                <p className="text-lg text-gray-700">
                  {ejercicioActual.musculo}
                </p>
              </div>
            </div>
          </div>

          {/* --- TARJETA DE CONSEJOS (si existen) --- */}
          {ejercicioActual.consejos && ejercicioActual.consejos.length > 0 && (
            <div className="bg-white p-5 rounded-2xl shadow-lg">
              {/* ... (contenido de Consejos sin cambios) ... */}
              <h2 className="text-xl font-bold mb-4">Consejos</h2>
              <ul className="space-y-3">
                {ejercicioActual.consejos.map((consejo, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-lg text-gray-700">{consejo}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>{" "}
        {/* Fin del Grupo 2 */}
      </div>
    </div>
  );
};

export default ExerciseDetailScreen;
