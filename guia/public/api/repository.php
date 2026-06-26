<?php

declare(strict_types=1);

function db(): PDO
{
    $config = require __DIR__ . '/config.php';

    return new PDO(
        sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            $config['host'],
            $config['port'],
            $config['database'],
            $config['charset']
        ),
        $config['username'],
        $config['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
        ]
    );
}

function loadAllContent(PDO $pdo): array
{
    ensureNormalizedTrainingSchema($pdo);
    ensureUserSchema($pdo);
    ensureUserTrainingSchema($pdo);

    return [
        'rutinas' => loadTrainingContent($pdo),
        'dietas' => loadDietContent($pdo),
        'settings' => loadAppSettings($pdo),
    ];
}

function replaceAllContent(PDO $pdo, array $content): void
{
    ensureNormalizedTrainingSchema($pdo);
    ensureUserSchema($pdo);
    ensureUserTrainingSchema($pdo);

    $rutinas = $content['rutinas'] ?? null;
    $dietas = $content['dietas'] ?? null;
    $settings = normalizeAppSettings(is_array($content['settings'] ?? null) ? $content['settings'] : []);

    if (!is_array($rutinas) || !is_array($dietas)) {
        throw new InvalidArgumentException('Contenido incompleto.');
    }

    $levels = $rutinas['niveles'] ?? null;
    $plans = $dietas['planes'] ?? null;

    if (!is_array($levels) || !is_array($plans)) {
        throw new InvalidArgumentException('Faltan rutinas o dietas.');
    }

    $pdo->beginTransaction();

    try {
        foreach ([
            'diet_foods',
            'diet_meals',
            'diet_days',
            'diet_plans',
            'training_workout_exercise_tips',
            'training_workout_exercises',
            'training_workout_days',
            'training_workout_notes',
            'training_workouts',
            'training_exercise_tips',
            'training_exercises',
            'training_level_notes',
            'training_levels',
        ] as $table) {
            if (tableExists($pdo, $table)) {
                $pdo->exec("DELETE FROM {$table}");
            }
        }

        saveTrainingContent($pdo, $levels);
        saveDietContent($pdo, $plans);
        saveAppSettings($pdo, $settings);

        $pdo->commit();
    } catch (Throwable $exception) {
        $pdo->rollBack();
        throw $exception;
    }
}

function defaultAppSettings(): array
{
    return [
        'navigation' => [
            'showDietas' => true,
        ],
        'theme' => [
            'colors' => [
                'fondo-oscuro' => '#11131B',
                'tarjeta-oscura' => '#1D1F28',
                'texto-oscuro' => '#E2E1ED',
                'texto-secundario-oscuro' => '#C3C5D7',
                'borde-oscuro' => '#434655',
                'surface-low' => '#191B23',
                'surface-card' => '#1D1F28',
                'surface-card-high' => '#282A32',
                'surface-bright' => '#373942',
                'surface-variant' => '#33343D',
                'primary-vanguard' => '#2D62ED',
                'primary-soft' => '#B5C4FF',
                'success-vanguard' => '#02B04C',
                'success-soft' => '#53E076',
                'nivel-0-claro' => '#8D90A1',
                'nivel-0-oscuro' => '#9CA3AF',
                'nivel-1-claro' => '#02B04C',
                'nivel-1-oscuro' => '#02B04C',
                'nivel-1Fem-claro' => '#D80458',
                'nivel-1Fem-oscuro' => '#D80458',
                'nivel-2-claro' => '#D35400',
                'nivel-2-oscuro' => '#D35400',
                'nivel-3-claro' => '#C0392B',
                'nivel-3-oscuro' => '#C0392B',
                'dieta-ganar-claro' => '#2D62ED',
                'dieta-ganar-oscuro' => '#2D62ED',
                'dieta-perder-claro' => '#D80458',
                'dieta-perder-oscuro' => '#D80458',
            ],
        ],
    ];
}

function normalizeAppSettings(array $settings): array
{
    $defaults = defaultAppSettings();
    $colors = $settings['theme']['colors'] ?? [];
    $hexColor = '/^#[0-9a-f]{6}$/i';
    $normalizedColors = $defaults['theme']['colors'];

    if (is_array($colors)) {
        foreach ($normalizedColors as $key => $defaultColor) {
            $value = $colors[$key] ?? $defaultColor;
            $normalizedColors[$key] = is_string($value) && preg_match($hexColor, $value) ? $value : $defaultColor;
        }
    }

    return [
        'navigation' => [
            'showDietas' => (bool) ($settings['navigation']['showDietas'] ?? $defaults['navigation']['showDietas']),
        ],
        'theme' => [
            'colors' => $normalizedColors,
        ],
    ];
}

function loadAppSettings(PDO $pdo): array
{
    ensureAppSettingsSchema($pdo);
    $statement = $pdo->prepare('SELECT value_json FROM app_settings WHERE setting_key = "app" LIMIT 1');
    $statement->execute();
    $raw = $statement->fetchColumn();
    $settings = is_string($raw) ? json_decode($raw, true) : null;

    return normalizeAppSettings(is_array($settings) ? $settings : []);
}

function saveAppSettings(PDO $pdo, array $settings): void
{
    $statement = $pdo->prepare(
        'INSERT INTO app_settings (setting_key, value_json)
         VALUES ("app", :value_json)
         ON DUPLICATE KEY UPDATE value_json = VALUES(value_json)'
    );
    $statement->execute([
        'value_json' => json_encode(normalizeAppSettings($settings), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    ]);
}

function saveTrainingContent(PDO $pdo, array $levels): void
{
    $workoutStatement = $pdo->prepare(
        'INSERT INTO training_workouts
         (id, level_number, name, slug, audience, duration, structure, warmup, cooldown, card_color, sort_order)
         VALUES
         (:id, :level_number, :name, :slug, :audience, :duration, :structure, :warmup, :cooldown, :card_color, :sort_order)'
    );
    $noteStatement = $pdo->prepare(
        'INSERT INTO training_workout_notes (workout_id, text, sort_order)
         VALUES (:workout_id, :text, :sort_order)'
    );
    $dayStatement = $pdo->prepare(
        'INSERT INTO training_workout_days (workout_id, name, is_default, sort_order)
         VALUES (:workout_id, :name, :is_default, :sort_order)'
    );
    $exerciseStatement = $pdo->prepare(
        'INSERT INTO training_workout_exercises
         (id, workout_id, day_id, number, name, short_name, muscle, muscle_group, specs, video, thumbnail, description, sort_order)
         VALUES
         (:id, :workout_id, :day_id, :number, :name, :short_name, :muscle, :muscle_group, :specs, :video, :thumbnail, :description, :sort_order)'
    );
    $tipStatement = $pdo->prepare(
        'INSERT INTO training_workout_exercise_tips (workout_id, exercise_id, text, sort_order)
         VALUES (:workout_id, :exercise_id, :text, :sort_order)'
    );

    foreach ($levels as $levelIndex => $level) {
        $levelId = requiredInt($level, 'id');

        $workoutStatement->execute([
            'id' => $levelId,
            'level_number' => requiredInt($level, 'nivel', 'dificultad'),
            'name' => requiredString($level, 'nombre'),
            'slug' => requiredString($level, 'slug'),
            'audience' => requiredString($level, 'sexo'),
            'duration' => requiredString($level, 'duracion'),
            'structure' => requiredString($level, 'estructura'),
            'warmup' => nullableString($level, 'calentamiento'),
            'cooldown' => nullableString($level, 'enfriamiento'),
            'card_color' => nullableString($level, 'color'),
            'sort_order' => $levelIndex + 1,
        ]);

        foreach (array_values($level['notas'] ?? []) as $noteIndex => $note) {
            if (trim((string) $note) === '') {
                continue;
            }

            $noteStatement->execute([
                'workout_id' => $levelId,
                'text' => (string) $note,
                'sort_order' => $noteIndex + 1,
            ]);
        }

        foreach (trainingDaysFromLevel($level) as $dayIndex => $day) {
            $dayName = requiredString($day, 'nombre');

            $dayStatement->execute([
                'workout_id' => $levelId,
                'name' => $dayName,
                'is_default' => !empty($day['isDefault']) ? 1 : 0,
                'sort_order' => $dayIndex + 1,
            ]);

            $dayId = (int) $pdo->lastInsertId();

            foreach (array_values($day['ejercicios'] ?? []) as $exerciseIndex => $exercise) {
                $exerciseId = requiredString($exercise, 'id');

                $exerciseStatement->execute([
                    'id' => $exerciseId,
                    'workout_id' => $levelId,
                    'day_id' => $dayId,
                    'number' => requiredInt($exercise, 'numero'),
                    'name' => requiredString($exercise, 'nombre'),
                    'short_name' => requiredString($exercise, 'nombreCorto'),
                    'muscle' => requiredString($exercise, 'musculo'),
                    'muscle_group' => requiredString($exercise, 'grupoMuscular'),
                    'specs' => requiredString($exercise, 'specs'),
                    'video' => requiredString($exercise, 'video'),
                    'thumbnail' => requiredString($exercise, 'thumbnail'),
                    'description' => nullableString($exercise, 'descripcion'),
                    'sort_order' => $exerciseIndex + 1,
                ]);

                foreach (array_values($exercise['consejos'] ?? []) as $tipIndex => $tip) {
                    if (trim((string) $tip) === '') {
                        continue;
                    }

                    $tipStatement->execute([
                        'workout_id' => $levelId,
                        'exercise_id' => $exerciseId,
                        'text' => (string) $tip,
                        'sort_order' => $tipIndex + 1,
                    ]);
                }
            }
        }
    }
}

function saveDietContent(PDO $pdo, array $plans): void
{
    $planStatement = $pdo->prepare(
        'INSERT INTO diet_plans (id, nombre, descripcion, color, sort_order)
         VALUES (:id, :nombre, :descripcion, :color, :sort_order)'
    );
    $dayStatement = $pdo->prepare(
        'INSERT INTO diet_days (plan_id, nombre, sort_order)
         VALUES (:plan_id, :nombre, :sort_order)'
    );
    $mealStatement = $pdo->prepare(
        'INSERT INTO diet_meals (day_id, tipo, sort_order)
         VALUES (:day_id, :tipo, :sort_order)'
    );
    $foodStatement = $pdo->prepare(
        'INSERT INTO diet_foods (meal_id, text, sort_order)
         VALUES (:meal_id, :text, :sort_order)'
    );

    foreach ($plans as $planIndex => $plan) {
        $planId = requiredInt($plan, 'id');

        $planStatement->execute([
            'id' => $planId,
            'nombre' => requiredString($plan, 'nombre'),
            'descripcion' => requiredString($plan, 'descripcion'),
            'color' => nullableString($plan, 'color'),
            'sort_order' => $planIndex + 1,
        ]);

        foreach (array_values($plan['dias'] ?? []) as $dayIndex => $day) {
            $dayStatement->execute([
                'plan_id' => $planId,
                'nombre' => requiredString($day, 'nombre'),
                'sort_order' => $dayIndex + 1,
            ]);

            $dayId = (int) $pdo->lastInsertId();

            foreach (array_values($day['comidas'] ?? []) as $mealIndex => $meal) {
                $mealStatement->execute([
                    'day_id' => $dayId,
                    'tipo' => requiredString($meal, 'tipo'),
                    'sort_order' => $mealIndex + 1,
                ]);

                $mealId = (int) $pdo->lastInsertId();

                foreach (array_values($meal['alimentos'] ?? []) as $foodIndex => $food) {
                    if (trim((string) $food) === '') {
                        continue;
                    }

                    $foodStatement->execute([
                        'meal_id' => $mealId,
                        'text' => (string) $food,
                        'sort_order' => $foodIndex + 1,
                    ]);
                }
            }
        }
    }
}

function loadTrainingContent(PDO $pdo): array
{
    $workouts = $pdo->query(
        'SELECT id, level_number, name, slug, audience, duration, structure, warmup, cooldown, card_color
         FROM training_workouts
         ORDER BY sort_order, id'
    )->fetchAll();

    $notes = groupRows(
        $pdo->query('SELECT workout_id, text FROM training_workout_notes ORDER BY sort_order, id')->fetchAll(),
        'workout_id'
    );
    $days = groupRows(
        $pdo->query('SELECT id, workout_id, name, is_default FROM training_workout_days ORDER BY workout_id, sort_order, id')->fetchAll(),
        'workout_id'
    );
    $exercises = groupRows(
        $pdo->query(
            'SELECT id, workout_id, day_id, number, name, short_name, muscle, muscle_group, specs, video, thumbnail, description
             FROM training_workout_exercises
             ORDER BY workout_id, day_id, sort_order, id'
        )->fetchAll(),
        'day_id'
    );
    $tips = groupRows(
        $pdo->query('SELECT workout_id, exercise_id, text FROM training_workout_exercise_tips ORDER BY workout_id, exercise_id, sort_order, id')->fetchAll(),
        fn (array $row): string => $row['workout_id'] . ':' . $row['exercise_id']
    );

    $mappedLevels = array_map(function (array $workout) use ($notes, $days, $exercises, $tips): array {
        $workoutId = (int) $workout['id'];
        $levelNumber = (int) $workout['level_number'];
        $mapped = [
            'id' => $workoutId,
            'nivel' => $levelNumber,
            'dificultad' => (string) $levelNumber,
            'sexo' => $workout['audience'],
            'nombre' => $workout['name'],
            'slug' => $workout['slug'],
            'duracion' => $workout['duration'],
            'estructura' => $workout['structure'],
        ];

        $optionalFields = [
            'calentamiento' => 'warmup',
            'enfriamiento' => 'cooldown',
            'color' => 'card_color',
        ];

        foreach ($optionalFields as $jsonField => $dbField) {
            if ($workout[$dbField] !== null && $workout[$dbField] !== '') {
                $mapped[$jsonField] = $workout[$dbField];
            }
        }

        if (!empty($notes[$workoutId])) {
            $mapped['notas'] = array_column($notes[$workoutId], 'text');
        }

        $allExercises = [];
        $mapped['dias'] = array_map(function (array $day) use ($exercises, $tips, $workoutId, &$allExercises): array {
            $dayId = (int) $day['id'];
            $isDefault = (bool) $day['is_default'];

            $dayExercises = array_map(function (array $exercise) use ($tips, $workoutId, $day, $isDefault): array {
                $exerciseId = $exercise['id'];
                $tipsKey = $workoutId . ':' . $exerciseId;
                $mappedExercise = [
                    'id' => $exerciseId,
                    'numero' => (int) $exercise['number'],
                    'nombre' => $exercise['name'],
                    'nombreCorto' => $exercise['short_name'],
                    'musculo' => $exercise['muscle'],
                    'grupoMuscular' => $exercise['muscle_group'],
                    'specs' => $exercise['specs'],
                    'video' => $exercise['video'],
                    'thumbnail' => $exercise['thumbnail'],
                    'descripcion' => $exercise['description'],
                    'consejos' => array_column($tips[$tipsKey] ?? [], 'text'),
                ];

                if (!$isDefault) {
                    $mappedExercise['dia'] = $day['name'];
                }

                return $mappedExercise;
            }, $exercises[$dayId] ?? []);

            foreach ($dayExercises as $exercise) {
                $allExercises[] = $exercise;
            }

            return [
                'id' => $dayId,
                'nombre' => $day['name'],
                'isDefault' => $isDefault,
                'ejercicios' => $dayExercises,
            ];
        }, $days[$workoutId] ?? []);

        $mapped['ejercicios'] = $allExercises;

        return $mapped;
    }, $workouts);

    return [
        'version' => 'mysql',
        'updated_at' => date('Y-m-d'),
        'entrenos' => $mappedLevels,
        'niveles' => $mappedLevels,
    ];
}

function loadDietContent(PDO $pdo): array
{
    $plans = $pdo->query(
        'SELECT id, nombre, descripcion, color
         FROM diet_plans
         ORDER BY sort_order, id'
    )->fetchAll();
    $days = groupRows(
        $pdo->query('SELECT id, plan_id, nombre FROM diet_days ORDER BY plan_id, sort_order, id')->fetchAll(),
        'plan_id'
    );
    $meals = groupRows(
        $pdo->query('SELECT id, day_id, tipo FROM diet_meals ORDER BY day_id, sort_order, id')->fetchAll(),
        'day_id'
    );
    $foods = groupRows(
        $pdo->query('SELECT meal_id, text FROM diet_foods ORDER BY meal_id, sort_order, id')->fetchAll(),
        'meal_id'
    );

    return [
        'planes' => array_map(function (array $plan) use ($days, $meals, $foods): array {
            $planId = (int) $plan['id'];

            return [
                'id' => $planId,
                'nombre' => $plan['nombre'],
                'descripcion' => $plan['descripcion'],
                'color' => $plan['color'],
                'dias' => array_map(function (array $day) use ($meals, $foods): array {
                    $dayId = (int) $day['id'];

                    return [
                        'nombre' => $day['nombre'],
                        'comidas' => array_map(function (array $meal) use ($foods): array {
                            $mealId = (int) $meal['id'];

                            return [
                                'tipo' => $meal['tipo'],
                                'alimentos' => array_column($foods[$mealId] ?? [], 'text'),
                            ];
                        }, $meals[$dayId] ?? []),
                    ];
                }, $days[$planId] ?? []),
            ];
        }, $plans),
    ];
}

function groupRows(array $rows, string|callable $key): array
{
    $grouped = [];

    foreach ($rows as $row) {
        $groupKey = is_callable($key) ? $key($row) : $row[$key];
        $grouped[$groupKey][] = $row;
    }

    return $grouped;
}

function ensureNormalizedTrainingSchema(PDO $pdo): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS training_workouts (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS training_workout_notes (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          workout_id INT UNSIGNED NOT NULL,
          text TEXT NOT NULL,
          sort_order INT UNSIGNED NOT NULL DEFAULT 0,
          CONSTRAINT fk_training_workout_notes_workout FOREIGN KEY (workout_id) REFERENCES training_workouts(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS training_workout_days (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          workout_id INT UNSIGNED NOT NULL,
          name VARCHAR(120) NOT NULL,
          is_default TINYINT(1) NOT NULL DEFAULT 0,
          sort_order INT UNSIGNED NOT NULL DEFAULT 0,
          CONSTRAINT fk_training_workout_days_workout FOREIGN KEY (workout_id) REFERENCES training_workouts(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS training_workout_exercises (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS training_workout_exercise_tips (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          workout_id INT UNSIGNED NOT NULL,
          exercise_id VARCHAR(40) NOT NULL,
          text TEXT NOT NULL,
          sort_order INT UNSIGNED NOT NULL DEFAULT 0,
          CONSTRAINT fk_training_workout_exercise_tips_exercise FOREIGN KEY (workout_id, exercise_id) REFERENCES training_workout_exercises(workout_id, id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    if ((int) $pdo->query('SELECT COUNT(*) FROM training_workouts')->fetchColumn() > 0 || !tableExists($pdo, 'training_levels')) {
        return;
    }

    $pdo->beginTransaction();

    try {
        migrateLegacyTrainingData($pdo);
        $pdo->commit();
    } catch (Throwable $exception) {
        $pdo->rollBack();
        throw $exception;
    }
}

function migrateLegacyTrainingData(PDO $pdo): void
{
    $pdo->exec(
        "INSERT INTO training_workouts
         (id, level_number, name, slug, audience, duration, structure, warmup, cooldown, card_color, sort_order)
         SELECT id, CAST(NULLIF(dificultad, '') AS UNSIGNED), nombre, slug, sexo, duracion, estructura, calentamiento, enfriamiento, color, sort_order
         FROM training_levels
         ORDER BY sort_order, id"
    );

    if (tableExists($pdo, 'training_level_notes')) {
        $pdo->exec(
            "INSERT INTO training_workout_notes (workout_id, text, sort_order)
             SELECT level_id, text, sort_order
             FROM training_level_notes
             ORDER BY level_id, sort_order, id"
        );
    }

    $legacyExercises = tableExists($pdo, 'training_exercises')
        ? $pdo->query(
            "SELECT id, level_id, numero, dia, nombre, nombre_corto, musculo, grupo_muscular, specs, video, thumbnail, descripcion, sort_order
             FROM training_exercises
             ORDER BY level_id, sort_order, id"
        )->fetchAll()
        : [];

    $dayStatement = $pdo->prepare(
        'INSERT INTO training_workout_days (workout_id, name, is_default, sort_order)
         VALUES (:workout_id, :name, :is_default, :sort_order)'
    );
    $exerciseStatement = $pdo->prepare(
        'INSERT INTO training_workout_exercises
         (id, workout_id, day_id, number, name, short_name, muscle, muscle_group, specs, video, thumbnail, description, sort_order)
         VALUES
         (:id, :workout_id, :day_id, :number, :name, :short_name, :muscle, :muscle_group, :specs, :video, :thumbnail, :description, :sort_order)'
    );

    $dayIds = [];
    $dayOrders = [];

    foreach ($legacyExercises as $exercise) {
        $workoutId = (int) $exercise['level_id'];
        $legacyDay = trim((string) ($exercise['dia'] ?? ''));
        $dayName = $legacyDay === '' ? 'Entreno completo' : $legacyDay;
        $dayKey = $workoutId . ':' . strtolower($dayName);

        if (!isset($dayIds[$dayKey])) {
            $dayOrders[$workoutId] = ($dayOrders[$workoutId] ?? 0) + 1;
            $dayStatement->execute([
                'workout_id' => $workoutId,
                'name' => $dayName,
                'is_default' => $legacyDay === '' ? 1 : 0,
                'sort_order' => $dayOrders[$workoutId],
            ]);
            $dayIds[$dayKey] = (int) $pdo->lastInsertId();
        }

        $exerciseStatement->execute([
            'id' => $exercise['id'],
            'workout_id' => $workoutId,
            'day_id' => $dayIds[$dayKey],
            'number' => (int) $exercise['numero'],
            'name' => $exercise['nombre'],
            'short_name' => $exercise['nombre_corto'],
            'muscle' => $exercise['musculo'],
            'muscle_group' => $exercise['grupo_muscular'],
            'specs' => $exercise['specs'],
            'video' => $exercise['video'],
            'thumbnail' => $exercise['thumbnail'],
            'description' => $exercise['descripcion'],
            'sort_order' => (int) $exercise['sort_order'],
        ]);
    }

    if (tableExists($pdo, 'training_exercise_tips')) {
        $pdo->exec(
            "INSERT INTO training_workout_exercise_tips (workout_id, exercise_id, text, sort_order)
             SELECT level_id, exercise_id, text, sort_order
             FROM training_exercise_tips
             ORDER BY level_id, exercise_id, sort_order, id"
        );
    }
}

function trainingDaysFromLevel(array $level): array
{
    if (isset($level['dias']) && is_array($level['dias']) && count($level['dias']) > 0) {
        return array_values($level['dias']);
    }

    $days = [];

    foreach (array_values($level['ejercicios'] ?? []) as $exercise) {
        $dayName = trim((string) ($exercise['dia'] ?? ''));
        $key = $dayName === '' ? '__full__' : strtolower($dayName);

        if (!isset($days[$key])) {
            $days[$key] = [
                'nombre' => $dayName === '' ? 'Entreno completo' : $dayName,
                'isDefault' => $dayName === '',
                'ejercicios' => [],
            ];
        }

        $days[$key]['ejercicios'][] = $exercise;
    }

    if (count($days) === 0) {
        $days['__full__'] = [
            'nombre' => 'Entreno completo',
            'isDefault' => true,
            'ejercicios' => [],
        ];
    }

    return array_values($days);
}

function tableExists(PDO $pdo, string $table): bool
{
    $statement = $pdo->prepare(
        'SELECT COUNT(*)
         FROM information_schema.tables
         WHERE table_schema = DATABASE() AND table_name = :table'
    );
    $statement->execute(['table' => $table]);

    return (int) $statement->fetchColumn() > 0;
}

function ensureUserSchema(PDO $pdo): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS users (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    if ((int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn() > 0 || !tableExists($pdo, 'admin_users')) {
        return;
    }

    $admins = $pdo->query(
        'SELECT username, display_name, role, password_hash, active
         FROM admin_users
         ORDER BY id'
    )->fetchAll();
    $statement = $pdo->prepare(
        'INSERT INTO users (username, email, first_name, last_name, display_name, role, password_hash, active)
         VALUES (:username, :email, :first_name, :last_name, :display_name, :role, :password_hash, :active)'
    );

    foreach ($admins as $admin) {
        [$firstName, $lastName] = splitDisplayName($admin['display_name'] ?: $admin['username']);
        $statement->execute([
            'username' => $admin['username'],
            'email' => $admin['username'] . '@ososport.local',
            'first_name' => $firstName,
            'last_name' => $lastName,
            'display_name' => $admin['display_name'] ?: trim($firstName . ' ' . $lastName),
            'role' => $admin['role'] ?: 'admin',
            'password_hash' => $admin['password_hash'],
            'active' => (int) $admin['active'],
        ]);
    }
}

function ensureAppSettingsSchema(PDO $pdo): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS app_settings (
          setting_key VARCHAR(80) PRIMARY KEY,
          value_json JSON NOT NULL,
          updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

function ensureUserTrainingSchema(PDO $pdo): void
{
    ensureNormalizedTrainingSchema($pdo);
    ensureUserSchema($pdo);
    ensureAppSettingsSchema($pdo);

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS user_routines (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS user_training_profiles (
          user_id INT UNSIGNED PRIMARY KEY,
          height_cm DECIMAL(5,2) NULL,
          weight_kg DECIMAL(5,2) NULL,
          updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_user_training_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS user_routine_exercises (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS workout_sessions (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS workout_session_exercises (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS workout_set_logs (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS personal_records (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS achievements (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

function splitDisplayName(string $displayName): array
{
    $parts = preg_split('/\s+/', trim($displayName)) ?: [];
    $firstName = $parts[0] ?? 'Usuario';
    $lastName = trim(implode(' ', array_slice($parts, 1))) ?: 'OsoSport';

    return [$firstName, $lastName];
}

function publicUser(array $user): array
{
    $avatarPath = $user['avatar_path'];

    if ($avatarPath !== null && $avatarPath !== '') {
        $avatarFile = dirname(__DIR__) . '/' . ltrim((string) $avatarPath, '/');

        if (!is_file($avatarFile)) {
            $avatarPath = null;
        }
    }

    return [
        'id' => (int) $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'firstName' => $user['first_name'],
        'lastName' => $user['last_name'],
        'displayName' => $user['display_name'],
        'role' => $user['role'],
        'avatarPath' => $avatarPath,
        'active' => (bool) $user['active'],
    ];
}

function requiredString(array $data, string $key): string
{
    $value = trim((string) ($data[$key] ?? ''));

    if ($value === '') {
        throw new InvalidArgumentException("El campo {$key} es obligatorio.");
    }

    return $value;
}

function nullableString(array $data, string $key): ?string
{
    $value = trim((string) ($data[$key] ?? ''));

    return $value === '' ? null : $value;
}

function requiredInt(array $data, string $key, ?string $fallbackKey = null): int
{
    $value = $data[$key] ?? ($fallbackKey !== null ? ($data[$fallbackKey] ?? null) : null);

    if ($value === null || !is_numeric($value)) {
        throw new InvalidArgumentException("El campo {$key} debe ser numérico.");
    }

    return (int) $value;
}
