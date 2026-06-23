import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import dietasData from "../src/data/dietas.json" with { type: "json" };
import rutinasData from "../src/data/rutinas.json" with { type: "json" };

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
  password_hash VARCHAR(255) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);

statements.push(`CREATE TABLE IF NOT EXISTS training_levels (
  id INT UNSIGNED PRIMARY KEY,
  dificultad VARCHAR(50) NOT NULL,
  sexo VARCHAR(50) NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL,
  duracion VARCHAR(80) NOT NULL,
  estructura VARCHAR(120) NOT NULL,
  calentamiento TEXT NULL,
  enfriamiento TEXT NULL,
  color VARCHAR(20) NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);

statements.push(`CREATE TABLE IF NOT EXISTS training_level_notes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  level_id INT UNSIGNED NOT NULL,
  text TEXT NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_training_level_notes_level FOREIGN KEY (level_id) REFERENCES training_levels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);

statements.push(`CREATE TABLE IF NOT EXISTS training_exercises (
  id VARCHAR(40) NOT NULL,
  level_id INT UNSIGNED NOT NULL,
  numero INT UNSIGNED NOT NULL,
  dia VARCHAR(120) NULL,
  nombre VARCHAR(160) NOT NULL,
  nombre_corto VARCHAR(100) NOT NULL,
  musculo VARCHAR(160) NOT NULL,
  grupo_muscular VARCHAR(120) NOT NULL,
  specs VARCHAR(120) NOT NULL,
  video VARCHAR(255) NOT NULL,
  thumbnail VARCHAR(255) NOT NULL,
  descripcion TEXT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (level_id, id),
  CONSTRAINT fk_training_exercises_level FOREIGN KEY (level_id) REFERENCES training_levels(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);

statements.push(`CREATE TABLE IF NOT EXISTS training_exercise_tips (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  level_id INT UNSIGNED NOT NULL,
  exercise_id VARCHAR(40) NOT NULL,
  text TEXT NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_training_exercise_tips_exercise FOREIGN KEY (level_id, exercise_id) REFERENCES training_exercises(level_id, id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);

statements.push(`CREATE TABLE IF NOT EXISTS diet_plans (
  id INT UNSIGNED PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT NOT NULL,
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
    level.dificultad,
    level.sexo,
    level.nombre,
    level.slug,
    level.duracion,
    level.estructura,
    level.calentamiento,
    level.enfriamiento,
    level.color,
    index + 1,
  ])
);
statements.push(`INSERT INTO training_levels (id, dificultad, sexo, nombre, slug, duracion, estructura, calentamiento, enfriamiento, color, sort_order) VALUES\n${levelRows.join(",\n")};`);

const noteRows = [];
const exerciseRows = [];
const tipRows = [];

rutinasData.niveles.forEach((level) => {
  level.notas?.forEach((note, index) => {
    noteRows.push(row([level.id, note, index + 1]));
  });

  level.ejercicios.forEach((exercise, index) => {
    exerciseRows.push(
      row([
        exercise.id,
        level.id,
        exercise.numero,
        exercise.dia,
        exercise.nombre,
        exercise.nombreCorto,
        exercise.musculo,
        exercise.grupoMuscular,
        exercise.specs,
        exercise.video,
        exercise.thumbnail,
        exercise.descripcion,
        index + 1,
      ])
    );

    exercise.consejos?.forEach((tip, tipIndex) => {
      tipRows.push(row([level.id, exercise.id, tip, tipIndex + 1]));
    });
  });
});

if (noteRows.length) {
  statements.push(`INSERT INTO training_level_notes (level_id, text, sort_order) VALUES\n${noteRows.join(",\n")};`);
}

statements.push(`INSERT INTO training_exercises (id, level_id, numero, dia, nombre, nombre_corto, musculo, grupo_muscular, specs, video, thumbnail, descripcion, sort_order) VALUES\n${exerciseRows.join(",\n")};`);

if (tipRows.length) {
  statements.push(`INSERT INTO training_exercise_tips (level_id, exercise_id, text, sort_order) VALUES\n${tipRows.join(",\n")};`);
}

const planRows = dietasData.planes.map((plan, index) =>
  row([plan.id, plan.nombre, plan.descripcion, index + 1])
);
statements.push(`INSERT INTO diet_plans (id, nombre, descripcion, sort_order) VALUES\n${planRows.join(",\n")};`);

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

statements.push(`INSERT INTO admin_users (username, display_name, password_hash, active) VALUES
${row(["ypadial", "Yeray Padial", "$2y$12$ZaYy4AQnE.ZPF8r6FWTNx.J77/BNthE0yurCxQAdnzJewMUatzNUy", 1])},
${row(["chema", "Chema", "$2y$12$4XA20KPphey8ZRKwE6OZDOz9W.h28Vtqj8.UsaJN1PkPqPTcBmrdm", 1])};`);

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${statements.join("\n\n")}\n`, "utf8");
console.log(`SQL generado en ${outputPath}`);
