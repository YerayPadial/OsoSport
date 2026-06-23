import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import dietasData from "../src/data/dietas.json" with { type: "json" };
import rutinasData from "../src/data/rutinas.json" with { type: "json" };

const defaultLevelColors = {
  1: "#166534",
  2: "#6b21a8",
  3: "#B45309",
  4: "#B91C1C",
  5: "#4B5563",
};

const defaultDietColors = {
  9: "#0D9488",
  10: "#6D28D9",
};

const outputPath = resolve("public/api/schema-and-seed.sql");
const statements = [];

const value = (input) => {
  if (input === undefined || input === null || input === "") {
    return "NULL";
  }

  if (typeof input === "number") {
    return String(input);
  }

  return `'${String(input).replaceAll("\\", "\\\\").replaceAll("'", "''")}'`;
};

const row = (items) => `(${items.map(value).join(", ")})`;

statements.push("SET FOREIGN_KEY_CHECKS = 0;");
statements.push("DROP TABLE IF EXISTS diet_foods;");
statements.push("DROP TABLE IF EXISTS diet_meals;");
statements.push("DROP TABLE IF EXISTS diet_days;");
statements.push("DROP TABLE IF EXISTS diet_plans;");
statements.push("DROP TABLE IF EXISTS training_workout_exercise_tips;");
statements.push("DROP TABLE IF EXISTS training_workout_exercises;");
statements.push("DROP TABLE IF EXISTS training_workout_days;");
statements.push("DROP TABLE IF EXISTS training_workout_notes;");
statements.push("DROP TABLE IF EXISTS training_workouts;");
statements.push("DROP TABLE IF EXISTS training_exercise_tips;");
statements.push("DROP TABLE IF EXISTS training_exercises;");
statements.push("DROP TABLE IF EXISTS training_level_notes;");
statements.push("DROP TABLE IF EXISTS training_levels;");
statements.push("DROP TABLE IF EXISTS admin_users;");
statements.push("SET FOREIGN_KEY_CHECKS = 1;");

statements.push(`CREATE TABLE IF NOT EXISTS admin_users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  display_name VARCHAR(120) NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'user',
  password_hash VARCHAR(255) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);

statements.push(`CREATE TABLE IF NOT EXISTS training_workouts (
  id INT UNSIGNED PRIMARY KEY,
  level_number INT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL,
  audience VARCHAR(50) NOT NULL,
  duration VARCHAR(80) NOT NULL,
  structure VARCHAR(120) NOT NULL,
  warmup TEXT NULL,
  cooldown TEXT NULL,
  card_color VARCHAR(20) NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);

statements.push(`CREATE TABLE IF NOT EXISTS training_workout_notes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  workout_id INT UNSIGNED NOT NULL,
  text TEXT NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_training_workout_notes_workout FOREIGN KEY (workout_id) REFERENCES training_workouts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);

statements.push(`CREATE TABLE IF NOT EXISTS training_workout_days (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  workout_id INT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_training_workout_days_workout FOREIGN KEY (workout_id) REFERENCES training_workouts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);

statements.push(`CREATE TABLE IF NOT EXISTS training_workout_exercises (
  id VARCHAR(40) NOT NULL,
  workout_id INT UNSIGNED NOT NULL,
  day_id INT UNSIGNED NOT NULL,
  number INT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  short_name VARCHAR(100) NOT NULL,
  muscle VARCHAR(160) NOT NULL,
  muscle_group VARCHAR(120) NOT NULL,
  specs VARCHAR(120) NOT NULL,
  video VARCHAR(255) NOT NULL,
  thumbnail VARCHAR(255) NOT NULL,
  description TEXT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (workout_id, id),
  CONSTRAINT fk_training_workout_exercises_workout FOREIGN KEY (workout_id) REFERENCES training_workouts(id) ON DELETE CASCADE,
  CONSTRAINT fk_training_workout_exercises_day FOREIGN KEY (day_id) REFERENCES training_workout_days(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);

statements.push(`CREATE TABLE IF NOT EXISTS training_workout_exercise_tips (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  workout_id INT UNSIGNED NOT NULL,
  exercise_id VARCHAR(40) NOT NULL,
  text TEXT NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_training_workout_exercise_tips_exercise FOREIGN KEY (workout_id, exercise_id) REFERENCES training_workout_exercises(workout_id, id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);

statements.push(`CREATE TABLE IF NOT EXISTS diet_plans (
  id INT UNSIGNED PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT NOT NULL,
  color VARCHAR(20) NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);

statements.push(`CREATE TABLE IF NOT EXISTS diet_days (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plan_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(80) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_diet_days_plan FOREIGN KEY (plan_id) REFERENCES diet_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);

statements.push(`CREATE TABLE IF NOT EXISTS diet_meals (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  day_id INT UNSIGNED NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_diet_meals_day FOREIGN KEY (day_id) REFERENCES diet_days(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);

statements.push(`CREATE TABLE IF NOT EXISTS diet_foods (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  meal_id INT UNSIGNED NOT NULL,
  text TEXT NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_diet_foods_meal FOREIGN KEY (meal_id) REFERENCES diet_meals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);

const levelRows = rutinasData.niveles.map((level, index) =>
  row([
    level.id,
    Number(level.nivel ?? level.dificultad) || 0,
    level.nombre,
    level.slug,
    level.sexo,
    level.duracion,
    level.estructura,
    level.calentamiento,
    level.enfriamiento,
    level.color || defaultLevelColors[level.id],
    index + 1,
  ])
);
statements.push(`INSERT INTO training_workouts (id, level_number, name, slug, audience, duration, structure, warmup, cooldown, card_color, sort_order) VALUES\n${levelRows.join(",\n")};`);

const noteRows = [];
const trainingDayRows = [];
const exerciseRows = [];
const tipRows = [];
let trainingDayId = 1;

rutinasData.niveles.forEach((level) => {
  level.notas?.forEach((note, index) => {
    noteRows.push(row([level.id, note, index + 1]));
  });

  const dayMap = new Map();

  level.ejercicios.forEach((exercise, index) => {
    const legacyDay = String(exercise.dia || "").trim();
    const dayName = legacyDay || "Entreno completo";
    const dayKey = dayName.toLowerCase();

    if (!dayMap.has(dayKey)) {
      const currentDayId = trainingDayId;
      dayMap.set(dayKey, currentDayId);
      trainingDayRows.push(row([currentDayId, level.id, dayName, legacyDay ? 0 : 1, dayMap.size]));
      trainingDayId += 1;
    }

    exerciseRows.push(row([
      exercise.id,
      level.id,
      dayMap.get(dayKey),
      exercise.numero,
      exercise.nombre,
      exercise.nombreCorto,
      exercise.musculo,
      exercise.grupoMuscular,
      exercise.specs,
      exercise.video,
      exercise.thumbnail,
      exercise.descripcion,
      index + 1,
    ]));

    exercise.consejos?.forEach((tip, tipIndex) => tipRows.push(row([level.id, exercise.id, tip, tipIndex + 1])));
  });
});

if (noteRows.length) {
  statements.push(`INSERT INTO training_workout_notes (workout_id, text, sort_order) VALUES\n${noteRows.join(",\n")};`);
}

statements.push(`INSERT INTO training_workout_days (id, workout_id, name, is_default, sort_order) VALUES\n${trainingDayRows.join(",\n")};`);
statements.push(`INSERT INTO training_workout_exercises (id, workout_id, day_id, number, name, short_name, muscle, muscle_group, specs, video, thumbnail, description, sort_order) VALUES\n${exerciseRows.join(",\n")};`);

if (tipRows.length) {
  statements.push(`INSERT INTO training_workout_exercise_tips (workout_id, exercise_id, text, sort_order) VALUES\n${tipRows.join(",\n")};`);
}

const planRows = dietasData.planes.map((plan, index) =>
  row([plan.id, plan.nombre, plan.descripcion, plan.color || defaultDietColors[plan.id], index + 1])
);
statements.push(`INSERT INTO diet_plans (id, nombre, descripcion, color, sort_order) VALUES\n${planRows.join(",\n")};`);

const dayRows = [];
const mealRows = [];
const foodRows = [];
let dayId = 1;
let mealId = 1;

dietasData.planes.forEach((plan) => {
  plan.dias.forEach((day, dayIndex) => {
    const currentDayId = dayId;
    dayRows.push(row([currentDayId, plan.id, day.nombre, dayIndex + 1]));
    dayId += 1;

    day.comidas.forEach((meal, mealIndex) => {
      const currentMealId = mealId;
      mealRows.push(row([currentMealId, currentDayId, meal.tipo, mealIndex + 1]));
      mealId += 1;

      meal.alimentos.forEach((food, foodIndex) => {
        foodRows.push(row([currentMealId, food, foodIndex + 1]));
      });
    });
  });
});

statements.push(`INSERT INTO diet_days (id, plan_id, nombre, sort_order) VALUES\n${dayRows.join(",\n")};`);
statements.push(`INSERT INTO diet_meals (id, day_id, tipo, sort_order) VALUES\n${mealRows.join(",\n")};`);
statements.push(`INSERT INTO diet_foods (meal_id, text, sort_order) VALUES\n${foodRows.join(",\n")};`);

statements.push(`INSERT INTO admin_users (username, display_name, role, password_hash, active) VALUES
${row(["ypadial", "Yeray Padial", "admin", "$2y$12$ZaYy4AQnE.ZPF8r6FWTNx.J77/BNthE0yurCxQAdnzJewMUatzNUy", 1])},
${row(["chema", "Chema", "admin", "$2y$12$4XA20KPphey8ZRKwE6OZDOz9W.h28Vtqj8.UsaJN1PkPqPTcBmrdm", 1])};`);

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${statements.join("\n\n")}\n`, "utf8");
console.log(`SQL generado en ${outputPath}`);
