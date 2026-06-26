import React from "react";
import { useAppData } from "../data/useAppData";
import ExerciseCard from "../components/ui/ExerciseCard";
import { ArrowLeft, Flame, Snowflake, ClipboardList, Play } from "lucide-react";
import { getLevelColor } from "../utils/contentColors";
import Badge from "../components/ui/Badge";

// Screen para lista de ejercicios de un día específico

const ExerciseListScreen = ({ navigation, onSelectExercise, onGoBack, onStartWorkout }) => {
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
    <div className="app-page">
      <div className="app-container max-w-5xl">
      {/* --- BOTÓN DE VOLVER --- */}
      <button
        onClick={onGoBack}
        className="app-focus mb-5 flex min-h-touch-target items-center gap-2 rounded-lg border border-borde-claro dark:border-borde-oscuro bg-surface-card px-4 font-black"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Días
      </button>

      {/* --- TÍTULO --- */}
      <header className="mb-6">
        <Badge tone="primary">{nivelActual.nombre}</Badge>
        <h1 className="mt-3 text-4xl font-black text-texto-claro dark:text-texto-oscuro sm:text-5xl">
          {navigation.dia}
        </h1>
        <button
          onClick={() => onStartWorkout?.({ workoutId: nivelActual.id, dayName: navigation.dia })}
          className="app-focus mt-4 flex min-h-touch-target w-full items-center justify-center gap-2 rounded-lg bg-primary-vanguard px-4 font-black text-white sm:w-auto"
        >
          <Play className="h-5 w-5" />
          Empezar entrenamiento
        </button>
      </header>

      {(nivelActual.calentamiento ||
        nivelActual.enfriamiento ||
        (nivelActual.notas && nivelActual.notas.length > 0)) && (
        <div className="app-card mb-6 space-y-4 p-5">
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
      <div className="grid gap-3 lg:grid-cols-2">
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
    </div>
  );
};

export default ExerciseListScreen;
