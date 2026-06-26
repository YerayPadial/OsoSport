CREATE TABLE IF NOT EXISTS user_routines (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  name VARCHAR(140) NOT NULL,
  description TEXT NULL,
  goal VARCHAR(160) NULL,
  notes TEXT NULL,
  source_type VARCHAR(30) NOT NULL DEFAULT 'custom',
  source_routine_id INT UNSIGNED NULL,
  is_archived TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_routines_user (user_id, is_archived),
  CONSTRAINT fk_user_routines_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_routines_source FOREIGN KEY (source_routine_id) REFERENCES training_workouts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_routine_exercises (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  routine_id INT UNSIGNED NOT NULL,
  exercise_id VARCHAR(40) NOT NULL,
  workout_id INT UNSIGNED NULL,
  exercise_name VARCHAR(160) NOT NULL,
  muscle VARCHAR(160) NULL,
  muscle_group VARCHAR(120) NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  target_sets INT UNSIGNED NOT NULL DEFAULT 3,
  target_reps VARCHAR(40) NULL,
  target_weight DECIMAL(8,2) NULL,
  target_time_seconds INT UNSIGNED NULL,
  rest_seconds INT UNSIGNED NOT NULL DEFAULT 90,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_routine_exercises_routine (routine_id, sort_order),
  CONSTRAINT fk_user_routine_exercises_routine FOREIGN KEY (routine_id) REFERENCES user_routines(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_training_profiles (
  user_id INT UNSIGNED PRIMARY KEY,
  height_cm DECIMAL(5,2) NULL,
  weight_kg DECIMAL(5,2) NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_training_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS workout_sessions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  routine_id INT UNSIGNED NULL,
  name VARCHAR(160) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  started_at DATETIME NOT NULL,
  completed_at DATETIME NULL,
  duration_seconds INT UNSIGNED NOT NULL DEFAULT 0,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_workout_sessions_user_status (user_id, status, started_at),
  CONSTRAINT fk_workout_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_workout_sessions_routine FOREIGN KEY (routine_id) REFERENCES user_routines(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS workout_session_exercises (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id INT UNSIGNED NOT NULL,
  exercise_id VARCHAR(40) NOT NULL,
  workout_id INT UNSIGNED NULL,
  exercise_name VARCHAR(160) NOT NULL,
  muscle VARCHAR(160) NULL,
  muscle_group VARCHAR(120) NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_workout_session_exercises_session (session_id, sort_order),
  CONSTRAINT fk_workout_session_exercises_session FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS workout_set_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_exercise_id INT UNSIGNED NOT NULL,
  set_number INT UNSIGNED NOT NULL,
  weight DECIMAL(8,2) NULL,
  reps INT UNSIGNED NULL,
  time_seconds INT UNSIGNED NULL,
  distance DECIMAL(8,2) NULL,
  rpe DECIMAL(3,1) NULL,
  is_warmup TINYINT(1) NOT NULL DEFAULT 0,
  is_drop_set TINYINT(1) NOT NULL DEFAULT 0,
  is_failure TINYINT(1) NOT NULL DEFAULT 0,
  completed TINYINT(1) NOT NULL DEFAULT 0,
  completed_at DATETIME NULL,
  rest_seconds INT UNSIGNED NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_workout_set_logs_exercise (session_exercise_id, set_number),
  CONSTRAINT fk_workout_set_logs_session_exercise FOREIGN KEY (session_exercise_id) REFERENCES workout_session_exercises(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS personal_records (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  exercise_id VARCHAR(40) NOT NULL,
  session_id INT UNSIGNED NOT NULL,
  set_log_id INT UNSIGNED NULL,
  type VARCHAR(40) NOT NULL,
  value DECIMAL(12,2) NOT NULL,
  previous_value DECIMAL(12,2) NULL,
  achieved_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_personal_record_best (user_id, exercise_id, type),
  INDEX idx_personal_records_user (user_id, achieved_at),
  CONSTRAINT fk_personal_records_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_personal_records_session FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_personal_records_set FOREIGN KEY (set_log_id) REFERENCES workout_set_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS achievements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  type VARCHAR(80) NOT NULL,
  title VARCHAR(140) NOT NULL,
  description TEXT NULL,
  unlocked_at DATETIME NOT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_achievement_user_type (user_id, type),
  INDEX idx_achievements_user (user_id, unlocked_at),
  CONSTRAINT fk_achievements_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
