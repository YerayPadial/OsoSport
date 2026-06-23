<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');

try {
    $config = require __DIR__ . '/config.php';
    $pdo = new PDO(
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

    echo json_encode([
        'rutinas' => loadTrainingContent($pdo),
        'dietas' => loadDietContent($pdo),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode([
        'error' => 'No se pudo cargar el contenido.',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
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
        'SELECT id, nombre, descripcion
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
