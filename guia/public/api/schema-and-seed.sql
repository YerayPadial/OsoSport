SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS diet_foods;

DROP TABLE IF EXISTS diet_meals;

DROP TABLE IF EXISTS diet_days;

DROP TABLE IF EXISTS diet_plans;

DROP TABLE IF EXISTS training_workout_exercise_tips;

DROP TABLE IF EXISTS training_workout_exercises;

DROP TABLE IF EXISTS training_workout_days;

DROP TABLE IF EXISTS training_workout_notes;

DROP TABLE IF EXISTS training_workouts;

DROP TABLE IF EXISTS training_exercise_tips;

DROP TABLE IF EXISTS training_exercises;

DROP TABLE IF EXISTS training_level_notes;

DROP TABLE IF EXISTS training_levels;

DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS admin_users;

DROP TABLE IF EXISTS app_settings;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NULL UNIQUE,
  email VARCHAR(190) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(140) NOT NULL,
  display_name VARCHAR(160) NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'user',
  password_hash VARCHAR(255) NOT NULL,
  avatar_path VARCHAR(255) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  display_name VARCHAR(120) NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'user',
  password_hash VARCHAR(255) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS app_settings (
  setting_key VARCHAR(80) PRIMARY KEY,
  value_json JSON NOT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS training_workouts (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS training_workout_notes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  workout_id INT UNSIGNED NOT NULL,
  text TEXT NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_training_workout_notes_workout FOREIGN KEY (workout_id) REFERENCES training_workouts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS training_workout_days (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  workout_id INT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_training_workout_days_workout FOREIGN KEY (workout_id) REFERENCES training_workouts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS training_workout_exercises (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS training_workout_exercise_tips (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  workout_id INT UNSIGNED NOT NULL,
  exercise_id VARCHAR(40) NOT NULL,
  text TEXT NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_training_workout_exercise_tips_exercise FOREIGN KEY (workout_id, exercise_id) REFERENCES training_workout_exercises(workout_id, id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS diet_plans (
  id INT UNSIGNED PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT NOT NULL,
  color VARCHAR(20) NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS diet_days (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plan_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(80) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_diet_days_plan FOREIGN KEY (plan_id) REFERENCES diet_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS diet_meals (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  day_id INT UNSIGNED NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_diet_meals_day FOREIGN KEY (day_id) REFERENCES diet_days(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS diet_foods (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  meal_id INT UNSIGNED NOT NULL,
  text TEXT NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_diet_foods_meal FOREIGN KEY (meal_id) REFERENCES diet_meals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO training_workouts (id, level_number, name, slug, audience, duration, structure, warmup, cooldown, card_color, sort_order) VALUES
(5, 0, 'Bajar Peso y Quema Grasa', 'bajar-peso-quema-grasa', 'Unisex', '3 meses', 'Dividida (Opciones de Cardio)', NULL, NULL, '#4B5563', 1),
(1, 1, 'Principiantes', 'principiantes-hombres', 'Hombre', '1 mes', 'Full Body', 'Calentamiento en bicicleta 10 minutos.', 'Enfriamiento en bicicleta o cinta: De 10 a 15 minutos.', '#166534', 2),
(2, 1, 'Principiantes', 'principiantes-mujeres', 'Mujer', '1 mes', 'Full Body', 'Calentamiento en bicicleta 10 minutos.', 'Enfriamiento en bicicleta o cinta: De 10 a 15 minutos.', '#DB2777', 3),
(3, 2, 'Intermedia', 'intermedia', 'Unixex', '2 a 3 meses', 'Dividida (Lunes/Jueves y Martes/Viernes)', 'Calentamiento en bicicleta 10 minutos.', 'Enfriamiento en bicicleta o cinta: De 10 a 15 minutos.', '#B45309', 4),
(4, 3, 'Avanzada', 'avanzada', 'Unisex', '4 a 6 meses', 'Dividida (Lunes, Martes, Miércoles - se repite el ciclo)', 'Calentamiento en bicicleta 10 minutos.', 'Enfriamiento en bicicleta o cinta: De 10 a 15 minutos.', '#B91C1C', 5);

INSERT INTO training_workout_notes (workout_id, text, sort_order) VALUES
(5, 'Opción Bajar de Peso: Circuito aeróbico para mejorar la forma física general y fortalecer el core (realizar de 2 a 5 veces).', 1),
(5, 'Opción Quema Grasa (HIIT): Hazlo 3-4 veces por semana después de tu entrenamiento principal.', 2),
(5, 'En la cinta, cada nivel extra de inclinación aumenta la quema de calorías un 4% aprox.', 3),
(1, 'El objetivo es mejorar la forma física general, fortalecer el core y definir.', 1),
(2, 'El objetivo es mejorar la forma física general, fortalecer el core y definir las piernas.', 1),
(3, 'Lunes y Jueves: Pectoral, Hombro, Bíceps, Abdomen', 1),
(3, 'Martes y Viernes: Dorsales, Cuádriceps, Femoral y Gemelos, Tríceps', 2),
(4, 'Hacer abdomen: 3 x 20 rep (días alternos).', 1),
(4, 'Repetir rutina a partir del Jueves.', 2);

INSERT INTO training_workout_days (id, workout_id, name, is_default, sort_order) VALUES
(1, 5, 'Bajar de Peso', 0, 1),
(2, 5, 'Quema Grasa', 0, 2),
(3, 1, 'Entreno completo', 1, 1),
(4, 2, 'Entreno completo', 1, 1),
(5, 3, 'Lunes y Jueves', 0, 1),
(6, 3, 'Martes y Viernes', 0, 2),
(7, 4, 'Lunes', 0, 1),
(8, 4, 'Martes', 0, 2),
(9, 4, 'Miércoles', 0, 3);

INSERT INTO training_workout_exercises (id, workout_id, day_id, number, name, short_name, muscle, muscle_group, specs, video, thumbnail, description, sort_order) VALUES
('n5_01', 5, 1, 1, 'Cinta', 'Cinta', 'Full body', 'Core', '3 min a 5 min', '/videos/cinta-2.mp4', '/thumbnails/cinta-2.png', 'Circuito de ejercicios aeróbicos para mejorar la forma física general.', 1),
('n5_02', 5, 1, 2, 'Eliptica', 'Eliptica', 'Full body', 'Core', '3 min a 5 min', '/videos/eliptica-2.mp4', '/thumbnails/eliptica-2.png', 'Circuito de ejercicios aeróbicos para mejorar la forma física general.', 2),
('n5_03', 5, 1, 3, 'SkiErg', 'Ski', 'Full body', 'Core', '3 min a 5 min', '/videos/skierg-2.mp4', '/thumbnails/skierg-2.png', 'Circuito de ejercicios aeróbicos para mejorar la forma física general.', 3),
('n5_04', 5, 1, 4, 'Air Bike', 'Air Bike', 'Full body', 'Core', '3 min a 5 min', '/videos/air-bike-2.mp4', '/thumbnails/air-bike-2.png', 'Circuito de ejercicios aeróbicos para mejorar la forma física general.', 4),
('n5_05', 5, 1, 5, 'Ergometro', 'Ergometro', 'Full body', 'Core', '3 min a 5 min', '/videos/ergometro-2.mp4', '/thumbnails/ergometro-2.png', 'Circuito de ejercicios aeróbicos para mejorar la forma física general.', 5),
('n5_06', 5, 2, 1, 'HIIT en Cinta (Intervalos)', 'Cinta HIIT', 'Cardio', 'Cardio', '25 min', '/videos/cinta-2.mp4', '/thumbnails/cinta-2.png', 'El truco de cardio que te hará perder grasa el triple de rápido.', 6),
('n1_01', 1, 3, 1, 'Abdominal (encogimiento)', 'Encogimiento', 'Abdominal (Abdomen)', 'Core', '3x20 rep', '/videos/abdominal-encogimiento.mp4', '/thumbnails/abdominal-encogimiento.png', 'Rutina completa para principiantes.', 1),
('n1_02', 1, 3, 2, 'Abdominal (elevaciones)', 'Elevaciones', 'Abdominal (Abdomen)', 'Core', '3x15 rep', '/videos/abdominal-elevaciones.mp4', '/thumbnails/abdominal-elevaciones.png', 'Rutina completa para principiantes.', 2),
('n1_03', 1, 3, 3, 'Press Banca', 'Press Banca', 'Pectoral', 'Pecho', '3x15 rep', '/videos/press-banca-1.mp4', '/thumbnails/press-banca-1.png', 'Rutina completa para principiantes.', 3),
('n1_04', 1, 3, 4, 'Jalón Nuca', 'Jalón Nuca', 'Dorsal', 'Espalda', '3x15 rep', '/videos/jalon-nuca.mp4', '/thumbnails/jalon-nuca.png', 'Rutina completa para principiantes.', 4),
('n1_05', 1, 3, 5, 'Press Militar', 'Press Militar', 'Hombro', 'Hombros', '3x12 rep', '/videos/press-militar-1.mp4', '/thumbnails/press-militar-1.png', 'Rutina completa para principiantes.', 5),
('n1_06', 1, 3, 6, 'Extensiones de Cuádriceps', 'Ext. Cuádriceps', 'Cuádriceps', 'Pierna', '3x15 rep', '/videos/extensiones-cuadriceps-1.mp4', '/thumbnails/extensiones-cuadriceps-1.png', 'Rutina completa para principiantes.', 6),
('n1_07', 1, 3, 7, 'Femoral', 'Femoral', 'Femoral', 'Pierna', '3x15 rep', '/videos/femoral.mp4', '/thumbnails/femoral.png', 'Rutina completa para principiantes.', 7),
('n1_08', 1, 3, 8, 'Curl con Barra', 'Curl Barra', 'Bíceps', 'Brazos', '3x12 rep', '/videos/curl-barra.mp4', '/thumbnails/curl-barra.png', 'Rutina completa para principiantes.', 8),
('n1_09', 1, 3, 9, 'Extensiones de Tríceps', 'Ext. Tríceps', 'Tríceps', 'Brazos', '3x12 rep', '/videos/extensiones-triceps.mp4', '/thumbnails/extensiones-triceps.png', 'Rutina completa para principiantes.', 9),
('n1_10', 1, 3, 10, 'Gemelos de Pie', 'Gemelos Pie', 'Gemelos', 'Pierna', '3x15 rep', '/videos/gemelos-pie.mp4', '/thumbnails/gemelos-pie.png', 'Rutina completa para principiantes.', 10),
('n2_01', 2, 4, 1, 'Abdominal (encogimiento)', 'Encogimiento', 'Abdomen', 'Core', '3x20 rep', '/videos/abdominal-encogimiento-2.mp4', '/thumbnails/abdominal-encogimiento-2.png', 'Fortalece el abdomen superior.', 1),
('n2_02', 2, 4, 2, 'Abdominal (elevaciones)', 'Elevaciones', 'Abdomen', 'Core', '3x15 rep', '/videos/abdominal-elevaciones.mp4', '/thumbnails/abdominal-elevaciones.png', 'Enfocado en el abdomen inferior.', 2),
('n2_03', 2, 4, 3, 'Press banca', 'Press Banca', 'Pectoral', 'Pecho', '3x15 rep', '/videos/press-banca-2.mp4', '/thumbnails/press-banca-2.png', 'Tonificación de pectorales y tríceps.', 3),
('n2_04', 2, 4, 4, 'Extensiones de cuádriceps', 'Ext. Cuádriceps', 'Cuádriceps', 'Pierna', '3x15 rep', '/videos/extensiones-cuadriceps-2.mp4', '/thumbnails/extensiones-cuadriceps-2.png', 'Activa la parte frontal de las piernas.', 4),
('n2_05', 2, 4, 5, 'Sentadilla sumo', 'Sent. Sumo', 'Glúteos y Aductores', 'Pierna / Glúteos', '4x20 rep', '/videos/sentadilla-sumo.mp4', '/thumbnails/sentadilla-sumo.png', 'Tonifica glúteos y aductores.', 5),
('n2_06', 2, 4, 6, 'Zancadas alternas', 'Zancadas', 'Cuádriceps/Glúteos', 'Pierna / Glúteos', '4x12 rep', '/videos/zancadas.mp4', '/thumbnails/zancadas.png', 'Trabaja equilibrio y fuerza unilateral.', 6),
('n2_07', 2, 4, 7, 'Curl femoral trasero (máquina)', 'Curl Femoral', 'Femoral', 'Pierna', '4x15 rep', '/videos/curl-femoral-trasero.mp4', '/thumbnails/curl-femoral-trasero.png', 'Fortalece la zona trasera de las piernas y glúteos.', 7),
('n2_08', 2, 4, 8, 'Aductores (máquina)', 'Aductores', 'Aductor', 'Pierna', '4x15 rep', '/videos/aductor.mp4', '/thumbnails/aductor.png', 'Fortalece la zona interna de las piernas.', 8),
('n2_09', 2, 4, 9, 'Abductores exterior (máquina)', 'Abductores', 'Abductor', 'Pierna', '4x15 rep', '/videos/abductor-exterior.mp4', '/thumbnails/abductor-exterior.png', 'Fortalece la zona externa de las piernas.', 9),
('n2_10', 2, 4, 10, 'Femoral', 'Femoral', 'Femoral', 'Pierna', '3x15 rep', '/videos/femoral-2.mp4', '/thumbnails/femoral-2.png', 'Enfocado en la parte posterior del muslo.', 10),
('n2_11', 2, 4, 11, 'Gemelos de pie', 'Gemelos Pie', 'Gemelos', 'Pierna', '3x15 rep', '/videos/gemelos-pie-2.mp4', '/thumbnails/gemelos-pie-2.png', 'Define y fortalece los gemelos.', 11),
('n2_12', 2, 4, 12, 'Jalón tras nuca', 'Jalón Nuca', 'Dorsal', 'Espalda', '3x12 rep', '/videos/jalon-nuca2.mp4', '/thumbnails/jalon-nuca-2.png', 'Trabaja la amplitud de la espalda y los dorsales.', 12),
('n2_13', 2, 4, 13, 'Curl de bíceps con barra Z', 'Curl Barra Z', 'Bíceps', 'Brazos', '3x10 rep', '/videos/curl-barra-2.mp4', '/thumbnails/curl-barra-2.png', 'Aumenta el volumen y la fuerza de los bíceps reduciendo la tensión en las muñecas.', 13),
('n2_14', 2, 4, 14, 'Extensiones de tríceps', 'Ext. Tríceps', 'Tríceps', 'Brazos', '3x12 rep', '/videos/extensiones-triceps-2.mp4', '/thumbnails/extensiones-triceps-2.png', 'Mejora la tonificación del brazo.', 14),
('n2_15', 2, 4, 15, 'Press militar', 'Press Militar', 'Hombros', 'Tren Superior', '3x10 rep', '/videos/press-militar-2.mp4', '/thumbnails/press-militar-2.png', 'Desarrolla la fuerza, el volumen y la estabilidad de los hombros.', 15),
('n2_01', 3, 5, 1, 'Press banca', 'Press Banca', 'Pectoral', 'Pecho', '3x15-12-10 rep', '/videos/press-banca-1.mp4', '/thumbnails/press-banca-1.png', NULL, 1),
('n2_02', 3, 5, 2, 'Aperturas', 'Aperturas', 'Pectoral', 'Pecho', '3x12 rep', '/videos/aperturas.mp4', '/thumbnails/aperturas.png', NULL, 2),
('n2_03', 3, 5, 3, 'Press militar', 'Press Militar', 'Hombro', 'Hombros', '3x15-12-10 rep', '/videos/press-militar-1.mp4', '/thumbnails/press-militar-1.png', NULL, 3),
('n2_04', 3, 5, 4, 'Elevaciones laterales', 'Elev. Laterales', 'Hombro', 'Hombros', '3x12 rep', '/videos/elevaciones-laterales.mp4', '/thumbnails/elevaciones-laterales.png', NULL, 4),
('n2_05', 3, 5, 5, 'Curl con barra', 'Curl Barra', 'Bíceps', 'Brazos', '3x8 rep', '/videos/curl-barra.mp4', '/thumbnails/curl-barra.png', NULL, 5),
('n2_06', 3, 5, 6, 'Curl Scott', 'Curl Scott', 'Bíceps', 'Brazos', '3x10 rep', '/videos/curl-scott.mp4', '/thumbnails/curl-scott.png', NULL, 6),
('n2_07', 3, 5, 7, 'Elevaciones maquina (Abdomen)', 'Elev. Abdomen', 'Abdomen', 'Core', '3x15 rep', '/videos/abdominal-elevaciones-maquina.mp4', '/thumbnails/abdominal-elevaciones-maquina.png', NULL, 7),
('n2_08', 3, 5, 8, 'Elevaciones (Abdomen)', 'Elev. Abdomen', 'Abdomen', 'Core', '3x15 rep', '/videos/abdominal-elevaciones.mp4', '/thumbnails/abdominal-elevaciones.png', NULL, 8),
('n2_09', 3, 5, 9, 'Encogimiento (Abdomen)', 'Encogimiento', 'Abdomen', 'Core', '3x50 rep', '/videos/abdominal-encogimiento.mp4', '/thumbnails/abdominal-encogimiento.png', NULL, 9),
('n2_10', 3, 6, 1, 'Jalón tras nuca', 'Jalón Nuca', 'Dorsales', 'Espalda', '3x15-12-10 rep', '/videos/jalon-nuca.mp4', '/thumbnails/jalon-nuca.png', NULL, 10),
('n2_11', 3, 6, 2, 'Remo mancuerna', 'Remo Mancuerna', 'Dorsales', 'Espalda', '3x12 rep', '/videos/remo-mancuerna.mp4', '/thumbnails/remo-mancuerna.png', NULL, 11),
('n2_12', 3, 6, 3, 'Sentadillas', 'Sentadillas', 'Cuádriceps', 'Pierna', '3x15-12-10 rep', '/videos/sentadillas.mp4', '/thumbnails/sentadillas.png', NULL, 12),
('n2_13', 3, 6, 4, 'Extensiones (Cuádriceps)', 'Ext. Cuádriceps', 'Cuádriceps', 'Pierna', '3x12 rep', '/videos/extensiones-cuadriceps-1.mp4', '/thumbnails/extensiones-cuadriceps-1.png', NULL, 13),
('n2_14', 3, 6, 5, 'Peso muerto', 'Peso Muerto', 'Femoral', 'Pierna', '3x12 rep', '/videos/peso-muerto.mp4', '/thumbnails/peso-muerto.png', NULL, 14),
('n2_15', 3, 6, 6, 'Gemelos sentado', 'Gemelos Sentado', 'Gemelos', 'Pierna', '3x12 rep', '/videos/gemelos-sentado.mp4', '/thumbnails/gemelos-sentado.png', NULL, 15),
('n2_16', 3, 6, 7, 'Press francés', 'Press Francés', 'Tríceps', 'Brazos', '3x15-12-10 rep', '/videos/press-frances.mp4', '/thumbnails/press-frances.png', NULL, 16),
('n2_17', 3, 6, 8, 'Jalón de tríceps', 'Jalón Tríceps', 'Tríceps', 'Brazos', '3x12 rep', '/videos/extensiones-triceps.mp4', '/thumbnails/extensiones-triceps.png', NULL, 17),
('n3_01', 4, 7, 1, 'Press banca', 'Press Banca', 'Pectorales', 'Pecho', '4x12-10-8-6 rep', '/videos/press-banca-1.mp4', '/thumbnails/press-banca-1.png', 'Día Lunes: Pectorales y Bíceps', 1),
('n3_02', 4, 7, 2, 'Press superior', 'Press Superior', 'Pectorales', 'Pecho', '3x12-10-8 rep', '/videos/press-superior.mp4', '/thumbnails/press-superior.png', 'Día Lunes: Pectorales y Bíceps', 2),
('n3_03', 4, 7, 3, 'Fondos', 'Fondos', 'Pectorales', 'Pecho', '3x12 rep', '/videos/fondo.mp4', '/thumbnails/fondo.png', 'Día Lunes: Pectorales y Bíceps', 3),
('n3_04', 4, 7, 4, 'Apertura', 'Apertura', 'Pectorales', 'Pecho', '3x12 rep', '/videos/aperturas.mp4', '/thumbnails/aperturas.png', 'Día Lunes: Pectorales y Bíceps', 4),
('n3_05', 4, 7, 5, 'Curl barra', 'Curl Barra', 'Bíceps', 'Brazos', '3x8 rep', '/videos/curl-barra.mp4', '/thumbnails/curl-barra.png', 'Día Lunes: Pectorales y Bíceps', 5),
('n3_06', 4, 7, 6, 'Curl mancuerna', 'Curl Mancuerna', 'Bíceps', 'Brazos', '3x8 rep', '/videos/curl-mancuerna.mp4', '/thumbnails/curl-mancuerna.png', 'Día Lunes: Pectorales y Bíceps', 6),
('n3_07', 4, 7, 7, 'Curl Scott', 'Curl Scott', 'Bíceps', 'Brazos', '3x10 rep', '/videos/curl-scott.mp4', '/thumbnails/curl-scott.png', 'Día Lunes: Pectorales y Bíceps', 7),
('n3_08', 4, 8, 1, 'Dominadas', 'Dominadas', 'Dorsales', 'Espalda', '4x8 rep', '/videos/dominadas.mp4', '/thumbnails/dominadas.png', 'Día Martes: Dorsales y Tríceps', 8),
('n3_09', 4, 8, 2, 'Jalón tras nuca', 'Jalón Nuca', 'Dorsales', 'Espalda', '3x12-10-8 rep', '/videos/jalon-nuca.mp4', '/thumbnails/jalon-nuca.png', 'Día Martes: Dorsales y Tríceps', 9),
('n3_10', 4, 8, 3, 'Remo barra', 'Remo Barra', 'Dorsales', 'Espalda', '3x8 rep', '/videos/remo-barra.mp4', '/thumbnails/remo-barra.png', 'Día Martes: Dorsales y Tríceps', 10),
('n3_11', 4, 8, 4, 'Remo mancuerna', 'Remo Mancuerna', 'Dorsales', 'Espalda', '3x12 rep', '/videos/remo-mancuerna.mp4', '/thumbnails/remo-mancuerna.png', 'Día Martes: Dorsales y Tríceps', 11),
('n3_12', 4, 8, 5, 'Press francés', 'Press Francés', 'Tríceps', 'Brazos', '3x8 rep', '/videos/press-frances.mp4', '/thumbnails/press-frances.png', 'Día Martes: Dorsales y Tríceps', 12),
('n3_13', 4, 8, 6, 'Press francés de pie', 'Francés de pie', 'Tríceps', 'Brazos', '3x8 rep', '/videos/frances-de-pie.mp4', '/thumbnails/frances-de-pie.png', 'Día Martes: Dorsales y Tríceps', 13),
('n3_14', 4, 8, 7, 'Jalón de tríceps', 'Jalón Tríceps', 'Tríceps', 'Brazos', '3x10 rep', '/videos/extensiones-triceps.mp4', '/thumbnails/extensiones-triceps.png', 'Día Martes: Dorsales y Tríceps', 14),
('n3_15', 4, 9, 1, 'Sentadillas', 'Sentadillas', 'Piernas', 'Pierna', '3x15-12-10 rep', '/videos/sentadillas.mp4', '/thumbnails/sentadillas.png', 'Día Miércoles: Piernas y Hombros', 15),
('n3_16', 4, 9, 2, 'Prensa', 'Prensa', 'Piernas', 'Pierna', '3x15-12-10 rep', '/videos/prensa.mp4', '/thumbnails/prensa.png', 'Día Miércoles: Piernas y Hombros', 16),
('n3_17', 4, 9, 3, 'Extensiones', 'Extensiones', 'Cuádriceps', 'Pierna', '3x12 rep', '/videos/extensiones-cuadriceps-1.mp4', '/thumbnails/extensiones-cuadriceps-1.png', 'Día Miércoles: Piernas y Hombros', 17),
('n3_18', 4, 9, 4, 'Femoral', 'Femoral', 'Femoral', 'Pierna', '3x15 rep', '/videos/femoral.mp4', '/thumbnails/femoral.png', 'Día Miércoles: Piernas y Hombros', 18),
('n3_19', 4, 9, 5, 'Gemelos', 'Gemelos', 'Gemelos', 'Pierna', '3x15 rep', '/videos/gemelos-sentado.mp4', '/thumbnails/gemelos-sentado.png', 'Día Miércoles: Piernas y Hombros', 19),
('n3_20', 4, 9, 6, 'Press militar', 'Press Militar', 'Hombros', 'Hombros', '4x12-10-8-6 rep', '/videos/press-militar-1.mp4', '/thumbnails/press-militar-1.png', 'Día Miércoles: Piernas y Hombros', 20),
('n3_21', 4, 9, 7, 'Elevaciones laterales', 'Elev. Laterales', 'Hombros', 'Hombros', '3x10 rep', '/videos/elevaciones-laterales.mp4', '/thumbnails/elevaciones-laterales.png', 'Día Miércoles: Piernas y Hombros', 21),
('n3_22', 4, 9, 8, 'Elevaciones frontales', 'Elev. Frontales', 'Hombros', 'Hombros', '3x10 rep', '/videos/elevaciones-frontales.mp4', '/thumbnails/elevaciones-frontales.png', 'Día Miércoles: Piernas y Hombros', 22);

INSERT INTO training_workout_exercise_tips (workout_id, exercise_id, text, sort_order) VALUES
(5, 'n5_01', 'Mantén la mirada al frente y los hombros relajados. Evita sujetarte de los pasamanos para aumentar la activación del core y el gasto calórico.', 1),
(5, 'n5_02', 'Mantén los talones pegados a los pedales para activar los glúteos. Usa los bastones móviles con fuerza para trabajar también la espalda y los brazos.', 1),
(5, 'n5_03', 'Extiéndete por completo arriba y usa tu peso corporal al bajar. La fuerza debe nacer de una contracción abdominal explosiva, no solo de tirar con los brazos.', 1),
(5, 'n5_04', 'No solo pedalees: empuja y tracciona con los brazos agresivamente. La resistencia de la máquina aumenta cuanto más rápido te mueves, así que mantén el ritmo.', 1),
(5, 'n5_05', 'Sigue la secuencia: Piernas, cuerpo, brazos. Empuja fuerte con los pies antes de inclinarte atrás y tirar del manillar hacia la boca del estómago.', 1),
(5, 'n5_06', 'Min 1-5: Inclinación 5 | Velocidad 3', 1),
(5, 'n5_06', 'Min 5-10: Inclinación 8 | Velocidad 3.8', 2),
(5, 'n5_06', 'Min 10-15: Inclinación 11 | Velocidad 4', 3),
(5, 'n5_06', 'Min 15-20: Inclinación 9 | Velocidad 3', 4),
(5, 'n5_06', 'Min 20-25: Inclinación 12 | Velocidad 4', 5),
(1, 'n1_01', 'Mantén la barbilla despegada del pecho y la zona lumbar pegada al suelo. Sube contrayendo el abdomen, no tirando del cuello.', 1),
(1, 'n1_02', 'Presiona tu espalda baja contra el suelo. Si se arquea, flexiona las rodillas o reduce el rango de movimiento.', 1),
(1, 'n1_03', 'Retrae las escápulas (junta los omóplatos) y pégalos al banco. Baja la barra al esternón controladamente, con los codos en un ángulo de 45-75 grados, no a 90.', 1),
(1, 'n1_04', 'Mantén el torso totalmente vertical y el pecho fuera. Baja la barra solo hasta la base de la nuca o la altura de las orejas. No fuerces el cuello hacia adelante.', 1),
(1, 'n1_05', 'Contrae glúteos y abdomen para estabilizar el tronco. Empuja la barra "a través de la cabeza" una vez que supera la frente, terminando con los brazos bloqueados.', 1),
(1, 'n1_06', 'Ajusta la almohadilla justo por encima del tobillo. Evita usar impulso; el movimiento debe ser fluido y controlado desde la rodilla.', 1),
(1, 'n1_07', 'Mantén la cadera pegada al banco durante todo el ejercicio. Si se levanta, estás usando la espalda baja y no los isquiotibiales.', 1),
(1, 'n1_08', 'Fija los codos a tus costados. No los muevas hacia adelante ni uses la espalda para balancearte. Sube y baja de forma controlada.', 1),
(1, 'n1_09', 'Fija los codos a los costados. Al final de la extensión, rota ligeramente las muñecas hacia afuera (con cuerda) o hacia abajo (con barra) para una contracción máxima.', 1),
(1, 'n1_10', ' Empuja con los dedos gordos del pie. Evita que los tobillos rueden hacia afuera. Controla la bajada para maximizar el estiramiento.', 1),
(2, 'n2_01', 'Mantén la barbilla despegada del pecho y la zona lumbar pegada al suelo. Sube contrayendo el abdomen, no tirando del cuello.', 1),
(2, 'n2_02', 'Presiona tu espalda baja contra el suelo. Si se arquea, flexiona las rodillas o reduce el rango de movimiento.', 1),
(2, 'n2_03', 'Retrae las escápulas (junta los omóplatos) y pégalos al banco. Baja la barra al esternón controladamente, con los codos en un ángulo de 45-75 grados, no a 90.', 1),
(2, 'n2_04', 'Ajusta la almohadilla justo por encima del tobillo. Evita usar impulso; el movimiento debe ser fluido y controlado desde la rodilla.', 1),
(2, 'n2_05', 'Puntas de los pies y rodillas apuntando hacia afuera. Baja "sentándote entre tus talones" y mantén el pecho erguido.', 1),
(2, 'n2_06', ' Da un paso largo y baja hasta que ambas rodillas formen 90 grados. Empuja con el talón de la pierna delantera para volver a la posición inicial.', 1),
(2, 'n2_07', 'Controla la fase negativa (al bajar). No dejes que las placas choquen; mantén la tensión constante en la parte externa de tus glúteos.', 1),
(2, 'n2_08', 'Controla la fase negativa (al abrir). No dejes que las placas choquen; mantén la tensión constante en la parte interna.', 1),
(2, 'n2_09', 'Controla la fase negativa (al cerrar). No dejes que las placas choquen; mantén la tensión constante en la parte externa.', 1),
(2, 'n2_10', 'Mantén la cadera pegada al banco durante todo el ejercicio. Si se levanta, estás usando la espalda baja y no los isquiotibiales.', 1),
(2, 'n2_11', 'Empuja con los dedos gordos del pie. Evita que los tobillos rueden hacia afuera. Controla la bajada para maximizar el estiramiento.', 1),
(2, 'n2_12', 'Mantén el torso recto. Tira de la barra hacia la nuca controlando el movimiento. Nota: Si sientes molestias en los hombros, es recomendable hacer el jalón por delante.', 1),
(2, 'n2_13', 'Mantén los codos pegados a los costados. Evita balancear el cuerpo hacia atrás para tomar impulso. Aprieta el bíceps en la parte superior del movimiento.', 1),
(2, 'n2_14', 'Fija los codos a los costados. Al final de la extensión, rota ligeramente las muñecas hacia afuera (con cuerda) o hacia abajo (con barra) para una contracción máxima.', 1),
(2, 'n2_15', 'Mantén el abdomen contraído para proteger la zona lumbar. Empuja el peso en línea recta hacia arriba y evita arquear la espalda en exceso. Baja de forma controlada hasta la altura de los ojos.', 1),
(3, 'n2_01', 'Retrae las escápulas (junta los omóplatos) y pégalos al banco. Baja la barra al esternón controladamente, con los codos en un ángulo de 45-75 grados, no a 90.', 1),
(3, 'n2_02', 'No bajes los codos más allá de la línea de tus hombros. Piensa en "abrazar un árbol", manteniendo una ligera flexión en el codo, no en "presionar".', 1),
(3, 'n2_03', 'Contrae glúteos y abdomen para estabilizar el tronco. Empuja la barra "a través de la cabeza" una vez que supera la frente, terminando con los brazos bloqueados', 1),
(3, 'n2_04', 'Lidera el movimiento con los codos, no con las muñecas. Levanta los brazos hacia los lados como si "vertieras dos jarras de agua", no subas más allá del hombro.', 1),
(3, 'n2_05', 'Fija los codos a tus costados. No los muevas hacia adelante ni uses la espalda para balancearte. Sube y baja de forma controlada.', 1),
(3, 'n2_06', 'No extiendas completamente el codo en la parte inferior para proteger la articulación. Mantén los tríceps pegados al banco en todo momento.', 1),
(3, 'n2_07', 'Presiona tu zona lumbar con fuerza contra el respaldo. Contrae el abdomen antes de subir las piernas y levántalas rectas solo hasta el punto en que puedas mantener la lumbar pegada.', 1),
(3, 'n2_08', 'Presiona tu espalda baja contra el suelo. Si se arquea, flexiona las rodillas o reduce el rango de movimiento.', 1),
(3, 'n2_09', 'Exhala con fuerza al subir y contrae el abdomen al máximo. El movimiento es corto; enfócate en flexionar la columna torácica.', 1),
(3, 'n2_10', 'Mantén el torso totalmente vertical y el pecho fuera. Baja la barra solo hasta la base de la nuca o la altura de las orejas. No fuerces el cuello hacia adelante.', 1),
(3, 'n2_11', ' Tira de la mancuerna hacia tu cadera, no hacia tu axila, y rota el torso lo mínimo posible. Contrae el dorsal en la cima del movimiento.', 1),
(3, 'n2_12', 'Inicia el movimiento echando la cadera hacia atrás. Rompe la paralela (cadera por debajo de la rodilla) y mantén el pecho erguido y la espalda neutra.', 1),
(3, 'n2_13', 'Concéntrate en apretar el cuádriceps en la parte superior. Sostén la contracción 1-2 segundos antes de bajar controladamente.', 1),
(3, 'n2_14', 'Mantén la cadera pegada al banco durante todo el ejercicio. Si se levanta, estás usando la espalda baja y no los isquiotibiales.', 1),
(3, 'n2_15', 'Trabaja el sóleo. Asegúrate de bajar completamente para estirar y subir al máximo, sin rebotes en la parte inferior.', 1),
(3, 'n2_16', 'Fija los hombros. El movimiento debe ser una bisagra solo en los codos. Mantén los codos apuntando al techo.', 1),
(3, 'n2_17', 'Fija los codos a los costados. Al final de la extensión, rota ligeramente las muñecas hacia afuera (con cuerda) o hacia abajo (con barra) para una contracción máxima.', 1),
(4, 'n3_01', 'Retrae las escápulas (junta los omóplatos) y pégalos al banco. Baja la barra al esternón controladamente, con los codos en un ángulo de 45-75 grados, no a 90.', 1),
(4, 'n3_02', 'Ajusta el banco a 30-45 grados. Lleva la barra a la parte alta del pecho (clavícula) y empuja hacia arriba y ligeramente hacia atrás.', 1),
(4, 'n3_03', 'Inclina el torso ligeramente hacia adelante para enfocar el pectoral. Baja hasta que los hombros estén ligeramente por debajo de los codos, manteniendo los codos cerca.', 1),
(4, 'n3_04', 'No bajes los codos más allá de la línea de tus hombros. Piensa en "abrazar un árbol", manteniendo una ligera flexión en el codo, no en "presionar".', 1),
(4, 'n3_05', 'Fija los codos a tus costados. No los muevas hacia adelante ni uses la espalda para balancearte. Sube y baja de forma controlada.', 1),
(4, 'n3_07', 'No extiendas completamente el codo en la parte inferior para proteger la articulación. Mantén los tríceps pegados al banco en todo momento.', 1),
(4, 'n3_08', 'Inicia el movimiento retrayendo las escápulas (hombros hacia atrás y abajo). Tira con los dorsales, no solo con los brazos, y lleva el pecho a la barra.', 1),
(4, 'n3_09', 'Mantén el torso totalmente vertical y el pecho fuera. Baja la barra solo hasta la base de la nuca o la altura de las orejas. No fuerces el cuello hacia adelante.', 1),
(4, 'n3_10', 'Mantén el torso casi paralelo al suelo y la espalda recta. Tira de la barra hacia la parte baja del abdomen (ombligo), contrayendo los dorsales, no los bíceps.', 1),
(4, 'n3_11', 'Tira de la mancuerna hacia tu cadera, no hacia tu axila, y rota el torso lo mínimo posible. Contrae el dorsal en la cima del movimiento.', 1),
(4, 'n3_12', 'Fija los hombros. El movimiento debe ser una bisagra solo en los codos. Mantén los codos apuntando al techo.', 1),
(4, 'n3_13', 'Aprieta el abdomen y los glúteos para mantener la espalda recta. No arquees la zona lumbar al empujar la barra hacia arriba.', 1),
(4, 'n3_14', 'Fija los codos a los costados. Al final de la extensión, rota ligeramente las muñecas hacia afuera (con cuerda) o hacia abajo (con barra) para una contracción máxima.', 1),
(4, 'n3_15', 'Inicia el movimiento echando la cadera hacia atrás. Rompe la paralela (cadera por debajo de la rodilla) y mantén el pecho erguido y la espalda neutra.', 1),
(4, 'n3_16', 'Baja las rodillas hacia el pecho, pero nunca dejes que tu zona lumbar o glúteos se despeguen del asiento. Empuja con toda la planta del pie.', 1),
(4, 'n3_17', 'Concéntrate en apretar el cuádriceps en la parte superior. Sostén la contracción 1-2 segundos antes de bajar controladamente.', 1),
(4, 'n3_18', 'Mantén la cadera pegada al banco durante todo el ejercicio. Si se levanta, estás usando la espalda baja y no los isquiotibiales.', 1),
(4, 'n3_19', 'Haz una pausa en la parte superior, apretando el gemelo al máximo. Baja lentamente, sintiendo el estiramiento completo en la parte inferior.', 1),
(4, 'n3_20', 'Contrae glúteos y abdomen para estabilizar el tronco. Empuja la barra "a través de la cabeza" una vez que supera la frente, terminando con los brazos bloqueados', 1),
(4, 'n3_21', 'Lidera el movimiento con los codos, no con las muñecas. Levanta los brazos hacia los lados como si "vertieras dos jarras de agua", no subas más allá del hombro.', 1),
(4, 'n3_22', 'Sube la mancuerna solo hasta la altura del hombro, con el codo ligeramente flexionado. No uses el impulso de las piernas.', 1);

INSERT INTO diet_plans (id, nombre, descripcion, color, sort_order) VALUES
(9, 'Ganar Peso', 'Dieta de superávit calórico (Hipertrofia)', '#0D9488', 1),
(10, 'Perder Peso', 'Déficit calórico y alta proteína (Definición)', '#6D28D9', 2);

INSERT INTO diet_days (id, plan_id, nombre, sort_order) VALUES
(1, 9, 'Lunes', 1),
(2, 9, 'Martes', 2),
(3, 9, 'Miércoles', 3),
(4, 9, 'Jueves', 4),
(5, 9, 'Viernes', 5),
(6, 10, 'Lunes', 1),
(7, 10, 'Martes', 2),
(8, 10, 'Miércoles', 3),
(9, 10, 'Jueves', 4),
(10, 10, 'Viernes', 5);

INSERT INTO diet_meals (id, day_id, tipo, sort_order) VALUES
(1, 1, 'Desayuno', 1),
(2, 1, 'Media Mañana', 2),
(3, 1, 'Almuerzo', 3),
(4, 1, 'Merienda', 4),
(5, 1, 'Cena', 5),
(6, 2, 'Desayuno', 1),
(7, 2, 'Media Mañana', 2),
(8, 2, 'Almuerzo', 3),
(9, 2, 'Merienda', 4),
(10, 2, 'Cena', 5),
(11, 3, 'Desayuno', 1),
(12, 3, 'Media Mañana', 2),
(13, 3, 'Almuerzo', 3),
(14, 3, 'Merienda', 4),
(15, 3, 'Cena', 5),
(16, 4, 'Desayuno', 1),
(17, 4, 'Media Mañana', 2),
(18, 4, 'Almuerzo', 3),
(19, 4, 'Merienda', 4),
(20, 4, 'Cena', 5),
(21, 5, 'Desayuno', 1),
(22, 5, 'Media Mañana', 2),
(23, 5, 'Almuerzo', 3),
(24, 5, 'Merienda', 4),
(25, 5, 'Cena', 5),
(26, 6, 'Desayuno', 1),
(27, 6, 'Media Mañana', 2),
(28, 6, 'Almuerzo', 3),
(29, 6, 'Merienda', 4),
(30, 6, 'Cena', 5),
(31, 7, 'Desayuno', 1),
(32, 7, 'Media Mañana', 2),
(33, 7, 'Almuerzo', 3),
(34, 7, 'Merienda', 4),
(35, 7, 'Cena', 5),
(36, 8, 'Desayuno', 1),
(37, 8, 'Media Mañana', 2),
(38, 8, 'Almuerzo', 3),
(39, 8, 'Merienda', 4),
(40, 8, 'Cena', 5),
(41, 9, 'Desayuno', 1),
(42, 9, 'Media Mañana', 2),
(43, 9, 'Almuerzo', 3),
(44, 9, 'Merienda', 4),
(45, 9, 'Cena', 5),
(46, 10, 'Desayuno', 1),
(47, 10, 'Media Mañana', 2),
(48, 10, 'Almuerzo', 3),
(49, 10, 'Merienda', 4),
(50, 10, 'Cena', 5);

INSERT INTO diet_foods (meal_id, text, sort_order) VALUES
(1, '100g Avena cocida con leche entera', 1),
(1, '1 Plátano troceado', 2),
(1, '2 Huevos enteros revueltos', 3),
(2, 'Sandwich integral de pavo y queso', 1),
(2, 'Puñado de nueces (30g)', 2),
(3, '200g Pechuga de pollo a la plancha', 1),
(3, '150g Arroz integral', 2),
(3, 'Ensalada mixta con aceite de oliva', 3),
(4, 'Batido de proteína (Whey) con leche', 1),
(4, '1 Manzana grande', 2),
(4, 'Tortitas de arroz (2 uds)', 3),
(5, '200g Salmón al horno', 1),
(5, '200g Patata asada', 2),
(5, 'Brócoli al vapor con aceite', 3),
(6, '2 Tostadas integrales grandes', 1),
(6, 'Medio aguacate untado', 2),
(6, '100g Pechuga de pavo', 3),
(6, 'Zumo de naranja natural', 4),
(7, '200g Queso fresco batido', 1),
(7, 'Miel y almendras', 2),
(7, '1 Pera', 3),
(8, 'Plato de lentejas estofadas con verduras', 1),
(8, '150g Filete de ternera magra', 2),
(8, 'Pan integral', 3),
(9, 'Bowl de yogur griego con granola', 1),
(9, 'Frutos rojos', 2),
(10, '200g Merluza o pescado blanco', 1),
(10, 'Batata (Boniato) al horno', 2),
(10, 'Espárragos trigueros', 3),
(11, 'Tortitas de avena (3 claras + 1 huevo + 80g avena)', 1),
(11, 'Crema de cacahuete', 2),
(11, 'Café con leche', 3),
(12, 'Bocadillo pequeño de atún al natural', 1),
(12, '1 Plátano', 2),
(13, 'Pasta integral (150g) con carne picada magra y tomate', 1),
(13, 'Queso rallado', 2),
(13, 'Ensalada verde', 3),
(14, 'Batido de proteínas', 1),
(14, 'Barrita de cereales', 2),
(14, 'Puñado de avellanas', 3),
(15, 'Tortilla de 3 huevos con patata cocida', 1),
(15, 'Ensalada de tomate y orégano', 2),
(15, 'Yogur natural', 3),
(16, 'Porridge de avena con leche y cacao puro', 1),
(16, 'Trozos de chocolate negro 85%', 2),
(16, '2 Huevos cocidos', 3),
(17, 'Tostada con requesón y mermelada light', 1),
(17, 'Manzana', 2),
(18, 'Garbanzos salteados con espinacas', 1),
(18, 'Pollo asado (cuarto trasero)', 2),
(18, 'Pan integral', 3),
(19, 'Sandwich de jamón serrano (sin grasa)', 1),
(19, 'Tomate restregado', 2),
(20, 'Emperador o Atún a la plancha', 1),
(20, 'Arroz basmati (100g)', 2),
(20, 'Verduras salteadas', 3),
(21, 'Revuelto de huevos (3) con jamón york', 1),
(21, '2 Tostadas integrales con aceite', 2),
(21, 'Pieza de fruta', 3),
(22, 'Yogur griego con avena y miel', 1),
(22, 'Nueces', 2),
(23, 'Estofado de pavo con patatas', 1),
(23, 'Menestra de verduras', 2),
(23, 'Pan', 3),
(24, 'Batido de plátano, leche y proteína', 1),
(24, 'Crema de cacahuete', 2),
(25, 'Hamburguesa casera de ternera (pan brioche)', 1),
(25, 'Queso light', 2),
(25, 'Patatas gajo al horno (sin freír)', 3),
(26, 'Café solo o Té verde', 1),
(26, '1 Tostada integral con tomate triturado', 2),
(26, '2 lonchas de pavo', 3),
(27, '1 Manzana verde', 1),
(27, '3 Nueces', 2),
(28, 'Gran ensalada variada (lechuga, pepino, cebolla)', 1),
(28, '1 Lata de atún al natural', 2),
(28, '80g Quinoa cocida', 3),
(29, 'Yogur natural 0% grasa', 1),
(29, 'Canela', 2),
(30, 'Filete de pescado blanco (merluza/bacalao)', 1),
(30, 'Brócoli y coliflor al vapor', 2),
(30, 'Infusión relajante', 3),
(31, '40g Copos de avena con agua (gachas)', 1),
(31, 'Canela y stevia', 2),
(31, '3 Claras de huevo cocidas', 3),
(32, '1 Kiwi', 1),
(32, 'Té verde', 2),
(33, 'Pechuga de pollo a la plancha con limón', 1),
(33, 'Parrillada de verduras (pimiento, calabacín)', 2),
(33, 'Pequeña guarnición de arroz blanco (40g)', 3),
(34, 'Queso fresco batido 0%', 1),
(34, '3 Almendras crudas', 2),
(35, 'Tortilla francesa (1 huevo + 2 claras)', 1),
(35, 'Espinacas salteadas', 2),
(35, 'Tomate picado', 3),
(36, 'Revuelto de claras con champiñones', 1),
(36, 'Café con leche desnatada', 2),
(36, '1 Mandarina', 3),
(37, 'Rodaja de piña natural', 1),
(37, 'Infusión', 2),
(38, 'Judías verdes cocidas con ajo', 1),
(38, 'Filete de ternera magra a la plancha', 2),
(38, '1 patata pequeña cocida', 3),
(39, 'Lata de berberechos o mejillones al natural', 1),
(39, 'Pepincillos', 2),
(40, 'Crema de calabacín (sin nata)', 1),
(40, 'Sepia o calamar a la plancha con ajo y perejil', 2),
(41, 'Tostada de pan de centeno', 1),
(41, 'Queso de untar light', 2),
(41, 'Salmón ahumado (1 loncha)', 3),
(42, 'Gelatina 0% azúcar', 1),
(42, 'Un puñado pequeño de arándanos', 2),
(43, 'Ensalada de lentejas (con pimiento, cebolla, tomate)', 1),
(43, 'Huevo duro picado', 2),
(43, 'Vinagreta ligera', 3),
(44, 'Batido de proteína isolada con agua', 1),
(45, 'Pechuga de pavo a la plancha', 1),
(45, 'Espárragos blancos', 2),
(45, 'Ensalada de rúcula', 3),
(46, 'Tortitas fit (claras de huevo y un poco de avena)', 1),
(46, 'Siropre cero calorías', 2),
(46, 'Café solo', 3),
(47, 'Yogur proteico', 1),
(47, '2 Nueces', 2),
(48, 'Wok de verduras (zanahoria, calabacín, brotes)', 1),
(48, 'Tiras de pollo', 2),
(48, 'Salsa de soja baja en sodio', 3),
(49, 'Queso burgos desnatado', 1),
(49, '1 loncha de pavo', 2),
(50, 'Salmón a la plancha (grasas saludables)', 1),
(50, 'Judías verdes o Bimi al vapor', 2),
(50, 'Infusión', 3);

INSERT INTO admin_users (username, display_name, role, password_hash, active) VALUES
('ypadial', 'Yeray Padial', 'admin', '$2y$12$ZaYy4AQnE.ZPF8r6FWTNx.J77/BNthE0yurCxQAdnzJewMUatzNUy', 1),
('chema', 'Chema', 'admin', '$2y$12$4XA20KPphey8ZRKwE6OZDOz9W.h28Vtqj8.UsaJN1PkPqPTcBmrdm', 1);

INSERT INTO users (username, email, first_name, last_name, display_name, role, password_hash, active) VALUES
('ypadial', 'ypadial@ososport.local', 'Yeray', 'Padial', 'Yeray Padial', 'admin', '$2y$12$ZaYy4AQnE.ZPF8r6FWTNx.J77/BNthE0yurCxQAdnzJewMUatzNUy', 1),
('chema', 'chema@ososport.local', 'Chema', 'OsoSport', 'Chema', 'admin', '$2y$12$4XA20KPphey8ZRKwE6OZDOz9W.h28Vtqj8.UsaJN1PkPqPTcBmrdm', 1);
