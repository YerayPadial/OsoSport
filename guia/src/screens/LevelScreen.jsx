import React from "react";
import { useAppData } from "../data/useAppData";
import ExerciseCard from "../components/ui/ExerciseCard";
import DayCard from "../components/ui/DayCard";
import { ArrowLeft, Flame, Snowflake, ClipboardList } from "lucide-react";
import { getLevelColor } from "../utils/contentColors";
import Badge from "../components/ui/Badge";

//Pantalla para listar ejercicios que no tienen dias o seleccionar dias

const LevelScreen = ({
  navigation,
  onSelectDay,
  onSelectExercise,
  onGoBack,
}) => {
  const { rutinasData } = useAppData();
  const nivelActual = rutinasData.niveles.find(
    (n) => n.id === navigation.nivelId
  );

  if (!nivelActual) {
    return (
      <div className="bg-fondo-claro dark:bg-fondo-oscuro min-h-screen p-4">
        <h1 className="text-2xl text-red-400">Error: Nivel no encontrado</h1>
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

  const levelColor = getLevelColor(nivelActual);

  const renderContent = () => {
    if (nivelActual.estructura === "Full Body") {
      return (
        <div className="grid gap-3 lg:grid-cols-2">
          {nivelActual.ejercicios.map((ejercicio, index) => (
            <ExerciseCard
              key={ejercicio.id}
              ejercicio={ejercicio}
              numero={index + 1}
              onClick={onSelectExercise}
              color={levelColor}
            />
          ))}
        </div>
      );
    }

    const diasUnicos = [...new Set(nivelActual.ejercicios.map((e) => e.dia))];
    const diasConDescripcion = diasUnicos.map((dia) => {
      const primerEjercicioDelDia = nivelActual.ejercicios.find(
        (e) => e.dia === dia
      );
      return {
        nombre: dia,
        descripcion: primerEjercicioDelDia.descripcion,
      };
    });

    return (
      <div className="space-y-5">
        {diasConDescripcion.map((diaInfo) => (
          <DayCard
            key={diaInfo.nombre}
            dia={diaInfo.nombre}
            descripcion={diaInfo.descripcion}
            color={levelColor}
            onClick={onSelectDay}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="app-page">
      <div className="app-container max-w-5xl">
      <button
        onClick={onGoBack}
        className="app-focus mb-5 flex min-h-touch-target items-center gap-2 rounded-lg border border-borde-claro dark:border-borde-oscuro bg-surface-card px-4 font-black"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Niveles
      </button>

      <header className="mb-6">
        <Badge tone={nivelActual.dificultad <= 1 ? "success" : nivelActual.dificultad >= 3 ? "danger" : "warning"}>
          Nivel {nivelActual.dificultad} · {nivelActual.sexo}
        </Badge>
        <h1 className="mt-3 text-4xl font-black text-texto-claro dark:text-texto-oscuro sm:text-5xl">
          {nivelActual.nombre}
        </h1>
      </header>

      {nivelActual.estructura === "Full Body" && (nivelActual.calentamiento ||
        nivelActual.enfriamiento ||
        (nivelActual.notas && nivelActual.notas.length > 0)) && (
        <div className="app-card mb-6 space-y-4 p-5">
          
          {/* Sección de Calentamiento */}
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

          {/* Separador si hay calentamiento y enfriamiento */}
          {nivelActual.calentamiento && nivelActual.enfriamiento && (
            <hr className="border-borde-claro dark:border-borde-oscuro" />
          )}

          {/* Sección de Enfriamiento */}
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

          {/* 3. AÑADIDO: Bloque para renderizar las notas */}
          {nivelActual.notas && nivelActual.notas.length > 0 && (
            <>
              {/* Separador si hay algo antes de las notas */}
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

      {renderContent()}
      </div>
    </div>
  );
};

export default LevelScreen;
