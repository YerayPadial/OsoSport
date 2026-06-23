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
        ]
    );
}

function loadAllContent(PDO $pdo): array
{
    return [
        'rutinas' => loadTrainingContent($pdo),
        'dietas' => loadDietContent($pdo),
    ];
}

function replaceAllContent(PDO $pdo, array $content): void
{
    $rutinas = $content['rutinas'] ?? null;
    $dietas = $content['dietas'] ?? null;

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
            'training_exercise_tips',
            'training_exercises',
            'training_level_notes',
            'training_levels',
        ] as $table) {
            $pdo->exec("DELETE FROM {$table}");
        }

        saveTrainingContent($pdo, $levels);
        saveDietContent($pdo, $plans);

        $pdo->commit();
    } catch (Throwable $exception) {
        $pdo->rollBack();
        throw $exception;
    }
}

function saveTrainingContent(PDO $pdo, array $levels): void
{
    $levelStatement = $pdo->prepare(
        'INSERT INTO training_levels
         (id, dificultad, sexo, nombre, slug, duracion, estructura, calentamiento, enfriamiento, color, sort_order)
         VALUES
         (:id, :dificultad, :sexo, :nombre, :slug, :duracion, :estructura, :calentamiento, :enfriamiento, :color, :sort_order)'
    );
    $noteStatement = $pdo->prepare(
        'INSERT INTO training_level_notes (level_id, text, sort_order)
         VALUES (:level_id, :text, :sort_order)'
    );
    $exerciseStatement = $pdo->prepare(
        'INSERT INTO training_exercises
         (id, level_id, numero, dia, nombre, nombre_corto, musculo, grupo_muscular, specs, video, thumbnail, descripcion, sort_order)
         VALUES
         (:id, :level_id, :numero, :dia, :nombre, :nombre_corto, :musculo, :grupo_muscular, :specs, :video, :thumbnail, :descripcion, :sort_order)'
    );
    $tipStatement = $pdo->prepare(
        'INSERT INTO training_exercise_tips (level_id, exercise_id, text, sort_order)
         VALUES (:level_id, :exercise_id, :text, :sort_order)'
    );

    foreach ($levels as $levelIndex => $level) {
        $levelId = requiredInt($level, 'id');

        $levelStatement->execute([
            'id' => $levelId,
            'dificultad' => requiredString($level, 'dificultad'),
            'sexo' => requiredString($level, 'sexo'),
            'nombre' => requiredString($level, 'nombre'),
            'slug' => requiredString($level, 'slug'),
            'duracion' => requiredString($level, 'duracion'),
            'estructura' => requiredString($level, 'estructura'),
            'calentamiento' => nullableString($level, 'calentamiento'),
            'enfriamiento' => nullableString($level, 'enfriamiento'),
            'color' => nullableString($level, 'color'),
            'sort_order' => $levelIndex + 1,
        ]);

        foreach (array_values($level['notas'] ?? []) as $noteIndex => $note) {
            if (trim((string) $note) === '') {
                continue;
            }

            $noteStatement->execute([
                'level_id' => $levelId,
                'text' => (string) $note,
                'sort_order' => $noteIndex + 1,
            ]);
        }

        foreach (array_values($level['ejercicios'] ?? []) as $exerciseIndex => $exercise) {
            $exerciseId = requiredString($exercise, 'id');

            $exerciseStatement->execute([
                'id' => $exerciseId,
                'level_id' => $levelId,
                'numero' => requiredInt($exercise, 'numero'),
                'dia' => nullableString($exercise, 'dia'),
                'nombre' => requiredString($exercise, 'nombre'),
                'nombre_corto' => requiredString($exercise, 'nombreCorto'),
                'musculo' => requiredString($exercise, 'musculo'),
                'grupo_muscular' => requiredString($exercise, 'grupoMuscular'),
                'specs' => requiredString($exercise, 'specs'),
                'video' => requiredString($exercise, 'video'),
                'thumbnail' => requiredString($exercise, 'thumbnail'),
                'descripcion' => nullableString($exercise, 'descripcion'),
                'sort_order' => $exerciseIndex + 1,
            ]);

            foreach (array_values($exercise['consejos'] ?? []) as $tipIndex => $tip) {
                if (trim((string) $tip) === '') {
                    continue;
                }

                $tipStatement->execute([
                    'level_id' => $levelId,
                    'exercise_id' => $exerciseId,
                    'text' => (string) $tip,
                    'sort_order' => $tipIndex + 1,
                ]);
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
    $levels = $pdo->query(
        'SELECT id, dificultad, sexo, nombre, slug, duracion, estructura, calentamiento, enfriamiento, color
         FROM training_levels
         ORDER BY sort_order, id'
    )->fetchAll();

    $notes = groupRows(
        $pdo->query('SELECT level_id, text FROM training_level_notes ORDER BY sort_order, id')->fetchAll(),
        'level_id'
    );
    $exercises = groupRows(
        $pdo->query(
            'SELECT id, level_id, numero, dia, nombre, nombre_corto, musculo, grupo_muscular, specs, video, thumbnail, descripcion
             FROM training_exercises
             ORDER BY level_id, sort_order, id'
        )->fetchAll(),
        'level_id'
    );
    $tips = groupRows(
        $pdo->query('SELECT level_id, exercise_id, text FROM training_exercise_tips ORDER BY level_id, exercise_id, sort_order, id')->fetchAll(),
        fn (array $row): string => $row['level_id'] . ':' . $row['exercise_id']
    );

    $mappedLevels = array_map(function (array $level) use ($notes, $exercises, $tips): array {
        $levelId = (int) $level['id'];
        $mapped = [
            'id' => $levelId,
            'dificultad' => $level['dificultad'],
            'sexo' => $level['sexo'],
            'nombre' => $level['nombre'],
            'slug' => $level['slug'],
            'duracion' => $level['duracion'],
            'estructura' => $level['estructura'],
        ];

        foreach (['calentamiento', 'enfriamiento', 'color'] as $field) {
            if ($level[$field] !== null && $level[$field] !== '') {
                $mapped[$field] = $level[$field];
            }
        }

        if (!empty($notes[$levelId])) {
            $mapped['notas'] = array_column($notes[$levelId], 'text');
        }

        $mapped['ejercicios'] = array_map(function (array $exercise) use ($tips): array {
            $exerciseId = $exercise['id'];
            $tipsKey = $exercise['level_id'] . ':' . $exerciseId;
            $mappedExercise = [
                'id' => $exerciseId,
                'numero' => (int) $exercise['numero'],
                'nombre' => $exercise['nombre'],
                'nombreCorto' => $exercise['nombre_corto'],
                'musculo' => $exercise['musculo'],
                'grupoMuscular' => $exercise['grupo_muscular'],
                'specs' => $exercise['specs'],
                'video' => $exercise['video'],
                'thumbnail' => $exercise['thumbnail'],
                'descripcion' => $exercise['descripcion'],
            ];

            if ($exercise['dia'] !== null && $exercise['dia'] !== '') {
                $mappedExercise['dia'] = $exercise['dia'];
            }

            $mappedExercise['consejos'] = array_column($tips[$tipsKey] ?? [], 'text');

            return $mappedExercise;
        }, $exercises[$levelId] ?? []);

        return $mapped;
    }, $levels);

    return [
        'version' => 'mysql',
        'updated_at' => date('Y-m-d'),
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

function requiredInt(array $data, string $key): int
{
    if (!isset($data[$key]) || !is_numeric($data[$key])) {
        throw new InvalidArgumentException("El campo {$key} debe ser numérico.");
    }

    return (int) $data[$key];
}
