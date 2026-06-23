import React from "react";
import { useAppData } from "../data/useAppData";
import ExerciseCard from "../components/ui/ExerciseCard";
import { ArrowLeft, Flame, Snowflake, ClipboardList } from "lucide-react";
import { getLevelColor } from "../utils/contentColors";

// Screen para lista de ejercicios de un día específico

const ExerciseListScreen = ({ navigation, onSelectExercise, onGoBack }) => {
  const { rutinasData } = useAppData();
  const nivelActual = rutinasData.niveles.find(
    (n) => n.id === navigation.nivelId
  );
  const ejerciciosDelDia =
    nivelActual?.ejercicios.filter((ej) => ej.dia === navigation.dia) || [];

  const levelColor = getLevelColor(nivelActual);

  if (!nivelActual || !ejerciciosDelDia) {
    return (
      <div className="bg-fondo-claro dark:bg-fondo-oscuro min-h-screen p-4">
        <h1 className="text-2xl text-red-400">
          Error: No se encontraron ejercicios
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

  return (
    <div className="bg-fondo-claro dark:bg-fondo-oscuro min-h-screen p-4 max-w-4xl mx-auto">
      {/* --- BOTÓN DE VOLVER --- */}
      <button
        onClick={onGoBack}
        className="mb-4 p-3 bg-tarjeta-clara dark:bg-tarjeta-oscura text-texto-claro dark:text-texto-oscuro font-medium rounded-lg flex items-center gap-2 min-h-touch-target"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Días
      </button>

      {/* --- TÍTULO --- */}
      <h1 className="text-4xl font-black mb-6" style={{ color: levelColor }}>
        {navigation.dia}
      </h1>

      {(nivelActual.calentamiento ||
        nivelActual.enfriamiento ||
        (nivelActual.notas && nivelActual.notas.length > 0)) && (
        <div className="bg-tarjeta-clara dark:bg-tarjeta-oscura rounded-2xl p-5 mb-6 shadow-lg space-y-4">
          {/* Sección de Calentamiento (solo si existe) */}
          {nivelActual.calentamiento && (
            <div className="flex items-start gap-3">
              <Flame className="w-7 h-7 text-nivel-2-claro dark:text-nivel-2-oscuro flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-texto-claro dark:text-texto-oscuro">
                  Calentamiento
                </h2>
                <p className="text-lg text-texto-secundario-claro dark:text-texto-secundario-oscuro leading-relaxed">
                  {nivelActual.calentamiento}
                </p>
              </div>
            </div>
          )}

          {/* Separador (solo si AMBOS existen) */}
          {nivelActual.calentamiento && nivelActual.enfriamiento && (
            <hr className="border-borde-claro dark:border-borde-oscuro" />
          )}

          {/* Sección de Enfriamiento (solo si existe) */}
          {nivelActual.enfriamiento && (
            <div className="flex items-start gap-3">
              <Snowflake className="w-7 h-7 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-texto-claro dark:text-texto-oscuro">
                  Enfriamiento
                </h2>
                <p className="text-lg text-texto-secundario-claro dark:text-texto-secundario-oscuro leading-relaxed">
                  {nivelActual.enfriamiento}
                </p>
              </div>
            </div>
          )}

          {/* Sección de notas (solo si existe) */}
          {nivelActual.notas && nivelActual.notas.length > 0 && (
              <>
                {/* Separador */}
                {(nivelActual.calentamiento || nivelActual.enfriamiento) && (
                  <hr className="border-borde-claro dark:border-borde-oscuro" />
                )}

                <div className="flex items-start gap-3">
                  <ClipboardList className="w-7 h-7 text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-xl font-bold text-texto-claro dark:text-texto-oscuro">
                      Notas Importantes
                    </h2>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      {nivelActual.notas.map((nota, index) => (
                        <li
                          key={index}
                          className="text-lg text-texto-secundario-claro dark:text-texto-secundario-oscuro leading-relaxed"
                        >
                          {nota}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
        </div>
      )}

      {/* --- LISTA DE EJERCICIOS --- */}
      <div className="space-y-4">
        {ejerciciosDelDia.map((ejercicio) => (
          <ExerciseCard
            key={ejercicio.id}
            ejercicio={ejercicio}
            numero={ejercicio.numero}
            onClick={onSelectExercise}
            color={levelColor}
          />
        ))}
      </div>
    </div>
  );
};

export default ExerciseListScreen;
