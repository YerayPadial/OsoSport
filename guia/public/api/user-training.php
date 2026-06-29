<?php

declare(strict_types=1);

require __DIR__ . '/repository.php';
require __DIR__ . '/admin-session.php';

startAdminSession();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $action = $_GET['action'] ?? 'bootstrap';
    $pdo = db();
    ensureUserTrainingSchema($pdo);
    $user = currentUserSession();

    if ($method === 'GET' && $action === 'bootstrap' && !$user) {
        respondJson(emptyTrainingBootstrap());
    }

    $user = requireTrainingUser();
    $userId = (int) $user['id'];

    if ($method === 'GET' && $action === 'bootstrap') {
        respondJson(trainingBootstrap($pdo, $userId));
    }

    if ($method === 'PUT' && $action === 'body-profile') {
        $payload = readJsonBody();
        respondJson(['bodyProfile' => saveBodyProfile($pdo, $userId, $payload)]);
    }

    if ($method === 'POST' && $action === 'routine') {
        $payload = readJsonBody();
        $routineId = saveUserRoutine($pdo, $userId, $payload);
        respondJson(['routine' => loadUserRoutine($pdo, $userId, $routineId)]);
    }

    if ($method === 'PUT' && $action === 'routine') {
        $payload = readJsonBody();
        $routineId = positiveInt($payload['id'] ?? null, 'rutina');
        assertOwnRoutine($pdo, $userId, $routineId);
        saveUserRoutine($pdo, $userId, $payload, $routineId);
        respondJson(['routine' => loadUserRoutine($pdo, $userId, $routineId)]);
    }

    if ($method === 'DELETE' && $action === 'routine') {
        $routineId = positiveInt($_GET['id'] ?? null, 'rutina');
        assertOwnRoutine($pdo, $userId, $routineId);
        $statement = $pdo->prepare('UPDATE user_routines SET is_archived = 1 WHERE id = :id AND user_id = :user_id');
        $statement->execute(['id' => $routineId, 'user_id' => $userId]);
        respondJson(['ok' => true]);
    }

    if ($method === 'POST' && $action === 'duplicate-routine') {
        $payload = readJsonBody();
        $routineId = positiveInt($payload['id'] ?? null, 'rutina');
        assertOwnRoutine($pdo, $userId, $routineId);
        respondJson(['routine' => duplicateUserRoutine($pdo, $userId, $routineId)]);
    }

    if ($method === 'POST' && $action === 'clone-gym-routine') {
        $payload = readJsonBody();
        $workoutId = positiveInt($payload['workoutId'] ?? null, 'entreno');
        respondJson(['routine' => cloneGymRoutine($pdo, $userId, $workoutId)]);
    }

    if ($method === 'POST' && $action === 'start-session') {
        $payload = readJsonBody();
        $active = loadActiveSession($pdo, $userId);
        respondJson([
            'session' => $active ?: startWorkoutSession($pdo, $userId, $payload),
            'resumed' => $active !== null,
        ]);
    }

    if ($method === 'POST' && $action === 'start-gym-workout') {
        $payload = readJsonBody();
        $workoutId = positiveInt($payload['workoutId'] ?? null, 'entreno');
        $dayName = cleanText($payload['dayName'] ?? '', 140);
        $active = loadActiveSession($pdo, $userId);
        respondJson([
            'session' => $active ?: startGymWorkoutSession($pdo, $userId, $workoutId, $dayName),
            'resumed' => $active !== null,
        ]);
    }

    if ($method === 'PUT' && $action === 'session') {
        $payload = readJsonBody();
        $sessionId = positiveInt($payload['id'] ?? null, 'sesión');
        assertOwnSession($pdo, $userId, $sessionId);
        saveWorkoutSession($pdo, $userId, $payload, $sessionId);
        respondJson(['session' => loadWorkoutSession($pdo, $userId, $sessionId), 'progress' => trainingProgress($pdo, $userId)]);
    }

    if ($method === 'POST' && $action === 'finish-session') {
        $payload = readJsonBody();
        $sessionId = positiveInt($payload['id'] ?? null, 'sesión');
        assertOwnSession($pdo, $userId, $sessionId);
        $summary = finishWorkoutSession($pdo, $userId, $sessionId, cleanText($payload['notes'] ?? '', 3000));
        respondJson($summary);
    }

    if ($method === 'POST' && $action === 'cancel-session') {
        $payload = readJsonBody();
        $sessionId = positiveInt($payload['id'] ?? null, 'sesión');
        assertOwnSession($pdo, $userId, $sessionId);
        $statement = $pdo->prepare('UPDATE workout_sessions SET status = "cancelled", completed_at = NOW(), duration_seconds = :duration WHERE id = :id AND user_id = :user_id');
        $statement->execute([
            'id' => $sessionId,
            'user_id' => $userId,
            'duration' => nonNegativeInt($payload['durationSeconds'] ?? 0, 'duración'),
        ]);
        respondJson(['ok' => true, 'progress' => trainingProgress($pdo, $userId)]);
    }

    respondError('Acción no disponible.', 404);
} catch (InvalidArgumentException $exception) {
    respondError($exception->getMessage(), 422);
} catch (Throwable $exception) {
    respondError('No se pudo procesar el entrenamiento.', 500);
}

function requireTrainingUser(): array
{
    $user = currentUserSession();

    if (!$user) {
        respondError('Inicia sesión para usar tus rutinas.', 401);
    }

    return $user;
}

function respondJson(array $payload): never
{
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function trainingBootstrap(PDO $pdo, int $userId): array
{
    return [
        'routines' => loadUserRoutines($pdo, $userId),
        'activeSession' => loadActiveSession($pdo, $userId),
        'history' => loadWorkoutHistory($pdo, $userId),
        'progress' => trainingProgress($pdo, $userId),
        'bodyProfile' => loadBodyProfile($pdo, $userId),
    ];
}

function emptyTrainingBootstrap(): array
{
    return [
        'routines' => [],
        'activeSession' => null,
        'history' => [],
        'progress' => emptyTrainingProgress(),
        'bodyProfile' => [
            'heightCm' => null,
            'weightKg' => null,
        ],
    ];
}

function emptyTrainingProgress(): array
{
    return [
        'stats' => [
            'totalWorkouts' => 0,
            'totalSets' => 0,
            'totalVolume' => 0,
            'trainedDays' => 0,
            'currentStreak' => 0,
            'bestStreak' => 0,
            'totalSeconds' => 0,
            'lastWorkoutAt' => null,
        ],
        'records' => [],
        'achievements' => [],
        'muscles' => [
            'lastSession' => [],
            'week' => [],
            'month' => [],
        ],
    ];
}

function loadBodyProfile(PDO $pdo, int $userId): array
{
    $statement = $pdo->prepare('SELECT height_cm, weight_kg FROM user_training_profiles WHERE user_id = :user_id LIMIT 1');
    $statement->execute(['user_id' => $userId]);
    $row = $statement->fetch() ?: [];

    return [
        'heightCm' => isset($row['height_cm']) && $row['height_cm'] !== null ? (float) $row['height_cm'] : null,
        'weightKg' => isset($row['weight_kg']) && $row['weight_kg'] !== null ? (float) $row['weight_kg'] : null,
    ];
}

function saveBodyProfile(PDO $pdo, int $userId, array $payload): array
{
    $height = nullableFloat($payload['heightCm'] ?? null, 'altura');
    $weight = nullableFloat($payload['weightKg'] ?? null, 'peso');

    if ($height !== null && ($height < 120 || $height > 230)) {
        throw new InvalidArgumentException('La altura debe estar entre 120 y 230 cm.');
    }

    if ($weight !== null && ($weight < 35 || $weight > 250)) {
        throw new InvalidArgumentException('El peso debe estar entre 35 y 250 kg.');
    }

    $statement = $pdo->prepare(
        'INSERT INTO user_training_profiles (user_id, height_cm, weight_kg)
         VALUES (:user_id, :height_cm, :weight_kg)
         ON DUPLICATE KEY UPDATE height_cm = VALUES(height_cm), weight_kg = VALUES(weight_kg)'
    );
    $statement->execute([
        'user_id' => $userId,
        'height_cm' => $height,
        'weight_kg' => $weight,
    ]);

    return loadBodyProfile($pdo, $userId);
}

function loadUserRoutines(PDO $pdo, int $userId): array
{
    $statement = $pdo->prepare(
        'SELECT id FROM user_routines
         WHERE user_id = :user_id AND is_archived = 0
         ORDER BY updated_at DESC, created_at DESC, id DESC'
    );
    $statement->execute(['user_id' => $userId]);

    return array_map(fn (array $row): array => loadUserRoutine($pdo, $userId, (int) $row['id']), $statement->fetchAll());
}

function loadUserRoutine(PDO $pdo, int $userId, int $routineId): array
{
    $statement = $pdo->prepare(
        'SELECT id, name, description, goal, notes, source_type, source_routine_id, is_archived, created_at, updated_at
         FROM user_routines
         WHERE id = :id AND user_id = :user_id
         LIMIT 1'
    );
    $statement->execute(['id' => $routineId, 'user_id' => $userId]);
    $routine = $statement->fetch();

    if (!$routine) {
        throw new InvalidArgumentException('Rutina no encontrada.');
    }

    $exerciseStatement = $pdo->prepare(
        'SELECT id, exercise_id, workout_id, exercise_name, muscle, muscle_group, sort_order, target_sets, target_reps,
                target_weight, target_time_seconds, rest_seconds, notes
         FROM user_routine_exercises
         WHERE routine_id = :routine_id
         ORDER BY sort_order, id'
    );
    $exerciseStatement->execute(['routine_id' => $routineId]);

    return [
        'id' => (int) $routine['id'],
        'name' => $routine['name'],
        'description' => $routine['description'] ?? '',
        'goal' => $routine['goal'] ?? '',
        'notes' => $routine['notes'] ?? '',
        'sourceType' => $routine['source_type'],
        'sourceRoutineId' => $routine['source_routine_id'] !== null ? (int) $routine['source_routine_id'] : null,
        'isArchived' => (bool) $routine['is_archived'],
        'createdAt' => $routine['created_at'],
        'updatedAt' => $routine['updated_at'],
        'exercises' => array_map('mapRoutineExercise', $exerciseStatement->fetchAll()),
    ];
}

function mapRoutineExercise(array $exercise): array
{
    return [
        'id' => (int) $exercise['id'],
        'exerciseId' => $exercise['exercise_id'],
        'workoutId' => $exercise['workout_id'] !== null ? (int) $exercise['workout_id'] : null,
        'exerciseName' => $exercise['exercise_name'],
        'muscle' => $exercise['muscle'] ?? '',
        'muscleGroup' => $exercise['muscle_group'] ?? '',
        'order' => (int) $exercise['sort_order'],
        'targetSets' => (int) $exercise['target_sets'],
        'targetReps' => $exercise['target_reps'] ?? '',
        'targetWeight' => $exercise['target_weight'] !== null ? (float) $exercise['target_weight'] : null,
        'targetTimeSeconds' => $exercise['target_time_seconds'] !== null ? (int) $exercise['target_time_seconds'] : null,
        'restSeconds' => (int) $exercise['rest_seconds'],
        'notes' => $exercise['notes'] ?? '',
    ];
}

function saveUserRoutine(PDO $pdo, int $userId, array $payload, ?int $routineId = null): int
{
    $name = cleanText($payload['name'] ?? '', 140);
    if ($name === '') {
        throw new InvalidArgumentException('El nombre de la rutina es obligatorio.');
    }

    $description = cleanText($payload['description'] ?? '', 2000);
    $goal = cleanText($payload['goal'] ?? '', 160);
    $notes = cleanText($payload['notes'] ?? '', 3000);
    $exercises = array_values(is_array($payload['exercises'] ?? null) ? $payload['exercises'] : []);

    $pdo->beginTransaction();

    try {
        if ($routineId === null) {
            $statement = $pdo->prepare(
                'INSERT INTO user_routines (user_id, name, description, goal, notes, source_type)
                 VALUES (:user_id, :name, :description, :goal, :notes, "custom")'
            );
            $statement->execute([
                'user_id' => $userId,
                'name' => $name,
                'description' => nullableValue($description),
                'goal' => nullableValue($goal),
                'notes' => nullableValue($notes),
            ]);
            $routineId = (int) $pdo->lastInsertId();
        } else {
            $statement = $pdo->prepare(
                'UPDATE user_routines
                 SET name = :name, description = :description, goal = :goal, notes = :notes
                 WHERE id = :id AND user_id = :user_id'
            );
            $statement->execute([
                'id' => $routineId,
                'user_id' => $userId,
                'name' => $name,
                'description' => nullableValue($description),
                'goal' => nullableValue($goal),
                'notes' => nullableValue($notes),
            ]);
            $pdo->prepare('DELETE FROM user_routine_exercises WHERE routine_id = :routine_id')->execute(['routine_id' => $routineId]);
        }

        insertRoutineExercises($pdo, $routineId, $exercises);
        $pdo->commit();
        return $routineId;
    } catch (Throwable $exception) {
        $pdo->rollBack();
        throw $exception;
    }
}

function insertRoutineExercises(PDO $pdo, int $routineId, array $exercises): void
{
    $statement = $pdo->prepare(
        'INSERT INTO user_routine_exercises
         (routine_id, exercise_id, workout_id, exercise_name, muscle, muscle_group, sort_order, target_sets,
          target_reps, target_weight, target_time_seconds, rest_seconds, notes)
         VALUES
         (:routine_id, :exercise_id, :workout_id, :exercise_name, :muscle, :muscle_group, :sort_order, :target_sets,
          :target_reps, :target_weight, :target_time_seconds, :rest_seconds, :notes)'
    );

    foreach ($exercises as $index => $exercise) {
        $sets = nonNegativeInt($exercise['targetSets'] ?? 3, 'series');
        if ($sets < 1 || $sets > 30) {
            throw new InvalidArgumentException('Las series deben estar entre 1 y 30.');
        }

        $statement->execute([
            'routine_id' => $routineId,
            'exercise_id' => cleanText($exercise['exerciseId'] ?? '', 40) ?: ('custom-' . ($index + 1)),
            'workout_id' => isset($exercise['workoutId']) && is_numeric($exercise['workoutId']) ? (int) $exercise['workoutId'] : null,
            'exercise_name' => cleanText($exercise['exerciseName'] ?? $exercise['nombre'] ?? '', 160) ?: 'Ejercicio',
            'muscle' => nullableValue(cleanText($exercise['muscle'] ?? $exercise['musculo'] ?? '', 160)),
            'muscle_group' => nullableValue(cleanText($exercise['muscleGroup'] ?? $exercise['grupoMuscular'] ?? '', 120)),
            'sort_order' => $index + 1,
            'target_sets' => $sets,
            'target_reps' => nullableValue(cleanText($exercise['targetReps'] ?? '', 40)),
            'target_weight' => nullableFloat($exercise['targetWeight'] ?? null, 'peso objetivo'),
            'target_time_seconds' => nullableNonNegativeInt($exercise['targetTimeSeconds'] ?? null, 'tiempo objetivo'),
            'rest_seconds' => nonNegativeInt($exercise['restSeconds'] ?? 90, 'descanso'),
            'notes' => nullableValue(cleanText($exercise['notes'] ?? '', 2000)),
        ]);
    }
}

function duplicateUserRoutine(PDO $pdo, int $userId, int $routineId): array
{
    $routine = loadUserRoutine($pdo, $userId, $routineId);
    $routine['name'] = $routine['name'] . ' copia';
    unset($routine['id']);
    $newId = saveUserRoutine($pdo, $userId, $routine);

    return loadUserRoutine($pdo, $userId, $newId);
}

function cloneGymRoutine(PDO $pdo, int $userId, int $workoutId): array
{
    $workoutStatement = $pdo->prepare('SELECT id, name, structure FROM training_workouts WHERE id = :id LIMIT 1');
    $workoutStatement->execute(['id' => $workoutId]);
    $workout = $workoutStatement->fetch();

    if (!$workout) {
        throw new InvalidArgumentException('El entreno base no existe.');
    }

    $exerciseStatement = $pdo->prepare(
        'SELECT id, workout_id, name, muscle, muscle_group, specs, sort_order
         FROM training_workout_exercises
         WHERE workout_id = :workout_id
         ORDER BY sort_order, id'
    );
    $exerciseStatement->execute(['workout_id' => $workoutId]);
    $exercises = array_map(function (array $exercise): array {
        return [
            'exerciseId' => $exercise['id'],
            'workoutId' => (int) $exercise['workout_id'],
            'exerciseName' => $exercise['name'],
            'muscle' => $exercise['muscle'],
            'muscleGroup' => $exercise['muscle_group'],
            'targetSets' => parseTargetSets($exercise['specs']),
            'targetReps' => parseTargetReps($exercise['specs']),
            'restSeconds' => 90,
            'notes' => $exercise['specs'],
        ];
    }, $exerciseStatement->fetchAll());

    $payload = [
        'name' => $workout['name'] . ' personal',
        'description' => 'Rutina clonada desde el entreno oficial del gimnasio.',
        'goal' => $workout['structure'],
        'notes' => '',
        'exercises' => $exercises,
    ];

    $newId = saveUserRoutine($pdo, $userId, $payload);
    $update = $pdo->prepare('UPDATE user_routines SET source_type = "cloned_from_gym", source_routine_id = :source WHERE id = :id AND user_id = :user_id');
    $update->execute(['source' => $workoutId, 'id' => $newId, 'user_id' => $userId]);

    return loadUserRoutine($pdo, $userId, $newId);
}

function startWorkoutSession(PDO $pdo, int $userId, array $payload): array
{
    $active = loadActiveSession($pdo, $userId);
    if ($active) {
        return $active;
    }

    $routineId = isset($payload['routineId']) && $payload['routineId'] !== null ? positiveInt($payload['routineId'], 'rutina') : null;
    $name = cleanText($payload['name'] ?? '', 160);
    $sourceExercises = [];

    if ($routineId !== null) {
        assertOwnRoutine($pdo, $userId, $routineId);
        $routine = loadUserRoutine($pdo, $userId, $routineId);
        $name = $name ?: $routine['name'];
        $sourceExercises = $routine['exercises'];
    }

    if ($name === '') {
        $name = 'Entreno libre';
    }

    $pdo->beginTransaction();

    try {
        $sessionStatement = $pdo->prepare(
            'INSERT INTO workout_sessions (user_id, routine_id, name, status, started_at, notes)
             VALUES (:user_id, :routine_id, :name, "active", NOW(), :notes)'
        );
        $sessionStatement->execute([
            'user_id' => $userId,
            'routine_id' => $routineId,
            'name' => $name,
            'notes' => nullableValue(cleanText($payload['notes'] ?? '', 3000)),
        ]);
        $sessionId = (int) $pdo->lastInsertId();
        insertSessionExercises($pdo, $sessionId, $sourceExercises);
        $pdo->commit();

        return loadWorkoutSession($pdo, $userId, $sessionId);
    } catch (Throwable $exception) {
        $pdo->rollBack();
        throw $exception;
    }
}

function startGymWorkoutSession(PDO $pdo, int $userId, int $workoutId, string $dayName = ''): array
{
    $active = loadActiveSession($pdo, $userId);
    if ($active) {
        return $active;
    }

    $workoutStatement = $pdo->prepare('SELECT id, name FROM training_workouts WHERE id = :id LIMIT 1');
    $workoutStatement->execute(['id' => $workoutId]);
    $workout = $workoutStatement->fetch();

    if (!$workout) {
        throw new InvalidArgumentException('El entreno base no existe.');
    }

    $sql = 'SELECT e.id, e.workout_id, e.name, e.muscle, e.muscle_group, e.specs, d.name day_name
            FROM training_workout_exercises e
            INNER JOIN training_workout_days d ON d.id = e.day_id
            WHERE e.workout_id = :workout_id';
    $params = ['workout_id' => $workoutId];

    if ($dayName !== '') {
        $sql .= ' AND d.name = :day_name';
        $params['day_name'] = $dayName;
    }

    $sql .= ' ORDER BY e.sort_order, e.id';
    $exerciseStatement = $pdo->prepare($sql);
    $exerciseStatement->execute($params);
    $sourceExercises = array_map(function (array $exercise): array {
        return [
            'exerciseId' => $exercise['id'],
            'workoutId' => (int) $exercise['workout_id'],
            'exerciseName' => $exercise['name'],
            'muscle' => $exercise['muscle'],
            'muscleGroup' => $exercise['muscle_group'],
            'targetSets' => parseTargetSets($exercise['specs']),
            'targetReps' => parseTargetReps($exercise['specs']),
            'restSeconds' => 90,
            'notes' => $exercise['specs'],
        ];
    }, $exerciseStatement->fetchAll());

    if (count($sourceExercises) === 0) {
        throw new InvalidArgumentException('No hay ejercicios para iniciar este entrenamiento.');
    }

    $sessionName = $dayName !== '' ? $workout['name'] . ' · ' . $dayName : $workout['name'];
    $pdo->beginTransaction();

    try {
        $sessionStatement = $pdo->prepare(
            'INSERT INTO workout_sessions (user_id, routine_id, name, status, started_at, notes)
             VALUES (:user_id, NULL, :name, "active", NOW(), :notes)'
        );
        $sessionStatement->execute([
            'user_id' => $userId,
            'name' => $sessionName,
            'notes' => 'Entrenamiento oficial OsoSport',
        ]);
        $sessionId = (int) $pdo->lastInsertId();
        insertSessionExercises($pdo, $sessionId, $sourceExercises);
        $pdo->commit();

        return loadWorkoutSession($pdo, $userId, $sessionId);
    } catch (Throwable $exception) {
        $pdo->rollBack();
        throw $exception;
    }
}

function saveWorkoutSession(PDO $pdo, int $userId, array $payload, int $sessionId): void
{
    $name = cleanText($payload['name'] ?? 'Entreno', 160);
    $notes = cleanText($payload['notes'] ?? '', 3000);
    $duration = nonNegativeInt($payload['durationSeconds'] ?? 0, 'duración');
    $exercises = array_values(is_array($payload['exercises'] ?? null) ? $payload['exercises'] : []);

    $pdo->beginTransaction();

    try {
        $statement = $pdo->prepare(
            'UPDATE workout_sessions
             SET name = :name, notes = :notes, duration_seconds = :duration
             WHERE id = :id AND user_id = :user_id AND status = "active"'
        );
        $statement->execute([
            'id' => $sessionId,
            'user_id' => $userId,
            'name' => $name ?: 'Entreno',
            'notes' => nullableValue($notes),
            'duration' => $duration,
        ]);
        $pdo->prepare('DELETE FROM workout_session_exercises WHERE session_id = :session_id')->execute(['session_id' => $sessionId]);
        insertSessionExercises($pdo, $sessionId, $exercises);
        $pdo->commit();
    } catch (Throwable $exception) {
        $pdo->rollBack();
        throw $exception;
    }
}

function insertSessionExercises(PDO $pdo, int $sessionId, array $exercises): void
{
    $exerciseStatement = $pdo->prepare(
        'INSERT INTO workout_session_exercises
         (session_id, exercise_id, workout_id, exercise_name, muscle, muscle_group, sort_order, notes)
         VALUES (:session_id, :exercise_id, :workout_id, :exercise_name, :muscle, :muscle_group, :sort_order, :notes)'
    );
    $setStatement = $pdo->prepare(
        'INSERT INTO workout_set_logs
         (session_exercise_id, set_number, weight, reps, time_seconds, distance, rpe, is_warmup, is_drop_set,
          is_failure, completed, completed_at, rest_seconds, notes)
         VALUES
         (:session_exercise_id, :set_number, :weight, :reps, :time_seconds, :distance, :rpe, :is_warmup, :is_drop_set,
          :is_failure, :completed, :completed_at, :rest_seconds, :notes)'
    );

    foreach ($exercises as $exerciseIndex => $exercise) {
        $exerciseStatement->execute([
            'session_id' => $sessionId,
            'exercise_id' => cleanText($exercise['exerciseId'] ?? '', 40) ?: ('custom-' . ($exerciseIndex + 1)),
            'workout_id' => isset($exercise['workoutId']) && is_numeric($exercise['workoutId']) ? (int) $exercise['workoutId'] : null,
            'exercise_name' => cleanText($exercise['exerciseName'] ?? $exercise['nombre'] ?? '', 160) ?: 'Ejercicio',
            'muscle' => nullableValue(cleanText($exercise['muscle'] ?? $exercise['musculo'] ?? '', 160)),
            'muscle_group' => nullableValue(cleanText($exercise['muscleGroup'] ?? $exercise['grupoMuscular'] ?? '', 120)),
            'sort_order' => $exerciseIndex + 1,
            'notes' => nullableValue(cleanText($exercise['notes'] ?? '', 2000)),
        ]);
        $sessionExerciseId = (int) $pdo->lastInsertId();
        $sets = array_values(is_array($exercise['sets'] ?? null) ? $exercise['sets'] : defaultSetsForExercise($exercise));

        foreach ($sets as $setIndex => $set) {
            $completed = !empty($set['completed']);
            $setStatement->execute([
                'session_exercise_id' => $sessionExerciseId,
                'set_number' => $setIndex + 1,
                'weight' => nullableFloat($set['weight'] ?? null, 'peso'),
                'reps' => nullableNonNegativeInt($set['reps'] ?? null, 'repeticiones'),
                'time_seconds' => nullableNonNegativeInt($set['timeSeconds'] ?? null, 'tiempo'),
                'distance' => nullableFloat($set['distance'] ?? null, 'distancia'),
                'rpe' => nullableRpe($set['rpe'] ?? null),
                'is_warmup' => !empty($set['isWarmup']) ? 1 : 0,
                'is_drop_set' => !empty($set['isDropSet']) ? 1 : 0,
                'is_failure' => !empty($set['isFailure']) ? 1 : 0,
                'completed' => $completed ? 1 : 0,
                'completed_at' => $completed ? date('Y-m-d H:i:s') : null,
                'rest_seconds' => nullableNonNegativeInt($set['restSeconds'] ?? $exercise['restSeconds'] ?? null, 'descanso'),
                'notes' => nullableValue(cleanText($set['notes'] ?? '', 1000)),
            ]);
        }
    }
}

function loadActiveSession(PDO $pdo, int $userId): ?array
{
    $statement = $pdo->prepare(
        'SELECT id FROM workout_sessions
         WHERE user_id = :user_id AND status = "active"
         ORDER BY started_at DESC, id DESC
         LIMIT 1'
    );
    $statement->execute(['user_id' => $userId]);
    $row = $statement->fetch();

    return $row ? loadWorkoutSession($pdo, $userId, (int) $row['id']) : null;
}

function loadWorkoutSession(PDO $pdo, int $userId, int $sessionId): array
{
    $statement = $pdo->prepare(
        'SELECT id, routine_id, name, status, started_at, completed_at, duration_seconds, notes
         FROM workout_sessions
         WHERE id = :id AND user_id = :user_id
         LIMIT 1'
    );
    $statement->execute(['id' => $sessionId, 'user_id' => $userId]);
    $session = $statement->fetch();

    if (!$session) {
        throw new InvalidArgumentException('Sesión no encontrada.');
    }

    $exerciseStatement = $pdo->prepare(
        'SELECT id, exercise_id, workout_id, exercise_name, muscle, muscle_group, sort_order, notes
         FROM workout_session_exercises
         WHERE session_id = :session_id
         ORDER BY sort_order, id'
    );
    $exerciseStatement->execute(['session_id' => $sessionId]);
    $exercises = $exerciseStatement->fetchAll();
    $setsByExercise = [];

    if ($exercises) {
        $ids = implode(',', array_fill(0, count($exercises), '?'));
        $setStatement = $pdo->prepare(
            "SELECT id, session_exercise_id, set_number, weight, reps, time_seconds, distance, rpe,
                    is_warmup, is_drop_set, is_failure, completed, completed_at, rest_seconds, notes
             FROM workout_set_logs
             WHERE session_exercise_id IN ({$ids})
             ORDER BY session_exercise_id, set_number, id"
        );
        $setStatement->execute(array_column($exercises, 'id'));
        $setsByExercise = groupRows($setStatement->fetchAll(), 'session_exercise_id');
    }

    return [
        'id' => (int) $session['id'],
        'routineId' => $session['routine_id'] !== null ? (int) $session['routine_id'] : null,
        'name' => $session['name'],
        'status' => $session['status'],
        'startedAt' => $session['started_at'],
        'completedAt' => $session['completed_at'],
        'durationSeconds' => $session['status'] === 'active'
            ? max((int) $session['duration_seconds'], time() - strtotime($session['started_at']))
            : (int) $session['duration_seconds'],
        'notes' => $session['notes'] ?? '',
        'exercises' => array_map(fn (array $exercise): array => mapSessionExercise($exercise, $setsByExercise[(int) $exercise['id']] ?? []), $exercises),
    ];
}

function mapSessionExercise(array $exercise, array $sets): array
{
    return [
        'id' => (int) $exercise['id'],
        'exerciseId' => $exercise['exercise_id'],
        'workoutId' => $exercise['workout_id'] !== null ? (int) $exercise['workout_id'] : null,
        'exerciseName' => $exercise['exercise_name'],
        'muscle' => $exercise['muscle'] ?? '',
        'muscleGroup' => $exercise['muscle_group'] ?? '',
        'order' => (int) $exercise['sort_order'],
        'notes' => $exercise['notes'] ?? '',
        'sets' => array_map(fn (array $set): array => [
            'id' => (int) $set['id'],
            'setNumber' => (int) $set['set_number'],
            'weight' => $set['weight'] !== null ? (float) $set['weight'] : null,
            'reps' => $set['reps'] !== null ? (int) $set['reps'] : null,
            'timeSeconds' => $set['time_seconds'] !== null ? (int) $set['time_seconds'] : null,
            'distance' => $set['distance'] !== null ? (float) $set['distance'] : null,
            'rpe' => $set['rpe'] !== null ? (float) $set['rpe'] : null,
            'isWarmup' => (bool) $set['is_warmup'],
            'isDropSet' => (bool) $set['is_drop_set'],
            'isFailure' => (bool) $set['is_failure'],
            'completed' => (bool) $set['completed'],
            'completedAt' => $set['completed_at'],
            'restSeconds' => $set['rest_seconds'] !== null ? (int) $set['rest_seconds'] : null,
            'notes' => $set['notes'] ?? '',
        ], $sets),
        'previous' => [],
    ];
}

function finishWorkoutSession(PDO $pdo, int $userId, int $sessionId, string $notes): array
{
    $session = loadWorkoutSession($pdo, $userId, $sessionId);
    $duration = max((int) $session['durationSeconds'], strtotime('now') - strtotime($session['startedAt']));
    $statement = $pdo->prepare(
        'UPDATE workout_sessions
         SET status = "completed", completed_at = NOW(), duration_seconds = :duration, notes = :notes
         WHERE id = :id AND user_id = :user_id AND status = "active"'
    );
    $statement->execute([
        'id' => $sessionId,
        'user_id' => $userId,
        'duration' => $duration,
        'notes' => nullableValue($notes ?: $session['notes']),
    ]);

    $records = updatePersonalRecords($pdo, $userId, $sessionId);
    $achievements = unlockAchievements($pdo, $userId, count($records) > 0);
    $summary = sessionSummary($pdo, $userId, $sessionId);
    $summary['records'] = $records;
    $summary['achievements'] = $achievements;
    $summary['progress'] = trainingProgress($pdo, $userId);

    return $summary;
}

function updatePersonalRecords(PDO $pdo, int $userId, int $sessionId): array
{
    $rows = sessionCompletedSets($pdo, $userId, $sessionId);
    $records = [];
    $byExerciseVolume = [];
    $bodyWeight = loadBodyProfile($pdo, $userId)['weightKg'];

    foreach ($rows as $row) {
        $exerciseId = $row['exercise_id'];
        $weight = effectiveSetWeight($row, $bodyWeight);
        $reps = (int) ($row['reps'] ?? 0);
        $time = (int) ($row['time_seconds'] ?? 0);
        $volume = $weight * $reps;
        $estimated = $weight > 0 && $reps > 0 ? $weight * (1 + min($reps, 12) / 30) : 0;
        $byExerciseVolume[$exerciseId] = ($byExerciseVolume[$exerciseId] ?? 0) + $volume;

        foreach ([
            ['type' => 'max_weight', 'value' => $weight],
            ['type' => 'max_reps', 'value' => $reps],
            ['type' => 'estimated_1rm', 'value' => $estimated],
            ['type' => 'best_time', 'value' => $time],
        ] as $candidate) {
            if ($candidate['value'] <= 0) {
                continue;
            }
            $record = upsertRecord($pdo, $userId, $exerciseId, $sessionId, (int) $row['set_id'], $candidate['type'], (float) $candidate['value']);
            if ($record) {
                $records[] = $record;
            }
        }
    }

    foreach ($byExerciseVolume as $exerciseId => $volume) {
        if ($volume <= 0) {
            continue;
        }
        $record = upsertRecord($pdo, $userId, $exerciseId, $sessionId, null, 'max_volume', (float) $volume);
        if ($record) {
            $records[] = $record;
        }
    }

    return uniqueRecordNotifications($records);
}

function upsertRecord(PDO $pdo, int $userId, string $exerciseId, int $sessionId, ?int $setLogId, string $type, float $value): ?array
{
    $statement = $pdo->prepare('SELECT id, value FROM personal_records WHERE user_id = :user_id AND exercise_id = :exercise_id AND type = :type LIMIT 1');
    $statement->execute(['user_id' => $userId, 'exercise_id' => $exerciseId, 'type' => $type]);
    $existing = $statement->fetch();

    if ($existing && (float) $existing['value'] >= $value) {
        return null;
    }

    $previous = $existing ? (float) $existing['value'] : null;
    if ($existing) {
        $update = $pdo->prepare(
            'UPDATE personal_records
             SET session_id = :session_id, set_log_id = :set_log_id, value = :value, previous_value = :previous_value, achieved_at = NOW()
             WHERE id = :id'
        );
        $update->execute([
            'id' => (int) $existing['id'],
            'session_id' => $sessionId,
            'set_log_id' => $setLogId,
            'value' => $value,
            'previous_value' => $previous,
        ]);
    } else {
        $insert = $pdo->prepare(
            'INSERT INTO personal_records (user_id, exercise_id, session_id, set_log_id, type, value, previous_value, achieved_at)
             VALUES (:user_id, :exercise_id, :session_id, :set_log_id, :type, :value, NULL, NOW())'
        );
        $insert->execute([
            'user_id' => $userId,
            'exercise_id' => $exerciseId,
            'session_id' => $sessionId,
            'set_log_id' => $setLogId,
            'type' => $type,
            'value' => $value,
        ]);
    }

    return [
        'exerciseId' => $exerciseId,
        'type' => $type,
        'value' => round($value, 2),
        'previousValue' => $previous,
    ];
}

function uniqueRecordNotifications(array $records): array
{
    $unique = [];

    foreach ($records as $record) {
        $key = $record['exerciseId'] . ':' . $record['type'];
        $unique[$key] = $record;
    }

    return array_values($unique);
}

function unlockAchievements(PDO $pdo, int $userId, bool $hasNewRecord): array
{
    $stats = rawTrainingStats($pdo, $userId);
    $definitions = [
        ['type' => 'first_workout', 'threshold' => 1, 'title' => 'Primer entreno', 'description' => 'Has completado tu primer entrenamiento.'],
        ['type' => 'workouts_5', 'threshold' => 5, 'title' => '5 entrenos', 'description' => 'Ya llevas 5 entrenamientos completados.'],
        ['type' => 'workouts_10', 'threshold' => 10, 'title' => '10 entrenos', 'description' => 'Diez sesiones guardadas.'],
        ['type' => 'workouts_25', 'threshold' => 25, 'title' => '25 entrenos', 'description' => 'Constancia seria.'],
        ['type' => 'workouts_50', 'threshold' => 50, 'title' => '50 entrenos', 'description' => 'Medio centenar de entrenos.'],
        ['type' => 'workouts_100', 'threshold' => 100, 'title' => '100 entrenos', 'description' => 'Cien entrenamientos completados.'],
    ];
    $unlocked = [];

    foreach ($definitions as $definition) {
        if ($stats['totalWorkouts'] >= $definition['threshold']) {
            $achievement = insertAchievement($pdo, $userId, $definition['type'], $definition['title'], $definition['description']);
            if ($achievement) {
                $unlocked[] = $achievement;
            }
        }
    }

    foreach ([3, 7] as $days) {
        if ($stats['currentStreak'] >= $days) {
            $achievement = insertAchievement($pdo, $userId, "streak_{$days}", "{$days} días seguidos", "Has entrenado {$days} días seguidos.");
            if ($achievement) {
                $unlocked[] = $achievement;
            }
        }
    }

    if ($hasNewRecord) {
        $achievement = insertAchievement($pdo, $userId, 'first_record', 'Primer récord personal', 'Has desbloqueado tu primer récord personal.');
        if ($achievement) {
            $unlocked[] = $achievement;
        }
    }

    return $unlocked;
}

function insertAchievement(PDO $pdo, int $userId, string $type, string $title, string $description): ?array
{
    $statement = $pdo->prepare(
        'INSERT IGNORE INTO achievements (user_id, type, title, description, unlocked_at)
         VALUES (:user_id, :type, :title, :description, NOW())'
    );
    $statement->execute([
        'user_id' => $userId,
        'type' => $type,
        'title' => $title,
        'description' => $description,
    ]);

    return $statement->rowCount() > 0 ? ['type' => $type, 'title' => $title, 'description' => $description] : null;
}

function trainingProgress(PDO $pdo, int $userId): array
{
    $stats = rawTrainingStats($pdo, $userId);

    return [
        'stats' => $stats,
        'records' => loadPersonalRecords($pdo, $userId),
        'achievements' => loadAchievements($pdo, $userId),
        'muscles' => [
            'lastSession' => muscleMap($pdo, $userId, 'last'),
            'week' => muscleMap($pdo, $userId, 'week'),
            'month' => muscleMap($pdo, $userId, 'month'),
        ],
    ];
}

function rawTrainingStats(PDO $pdo, int $userId): array
{
    $statement = $pdo->prepare(
        'SELECT COUNT(*) total_workouts,
                COALESCE(SUM(duration_seconds), 0) total_seconds,
                COUNT(DISTINCT DATE(completed_at)) trained_days,
                MAX(completed_at) last_workout_at
         FROM workout_sessions
         WHERE user_id = :user_id AND status = "completed"'
    );
    $statement->execute(['user_id' => $userId]);
    $row = $statement->fetch() ?: [];
    $setStatement = $pdo->prepare(
        'SELECT COUNT(*) total_sets,
                COALESCE(SUM(COALESCE(l.weight, 0) * COALESCE(l.reps, 0)), 0) total_volume
         FROM workout_set_logs l
         INNER JOIN workout_session_exercises e ON e.id = l.session_exercise_id
         INNER JOIN workout_sessions s ON s.id = e.session_id
         WHERE s.user_id = :user_id AND s.status = "completed" AND l.completed = 1'
    );
    $setStatement->execute(['user_id' => $userId]);
    $sets = $setStatement->fetch() ?: [];
    $streaks = trainingStreaks($pdo, $userId);

    return [
        'totalWorkouts' => (int) ($row['total_workouts'] ?? 0),
        'totalSets' => (int) ($sets['total_sets'] ?? 0),
        'totalVolume' => round((float) ($sets['total_volume'] ?? 0), 2),
        'trainedDays' => (int) ($row['trained_days'] ?? 0),
        'currentStreak' => $streaks['current'],
        'bestStreak' => $streaks['best'],
        'totalSeconds' => (int) ($row['total_seconds'] ?? 0),
        'lastWorkoutAt' => $row['last_workout_at'] ?? null,
    ];
}

function trainingStreaks(PDO $pdo, int $userId): array
{
    $statement = $pdo->prepare(
        'SELECT DISTINCT DATE(completed_at) trained_day
         FROM workout_sessions
         WHERE user_id = :user_id AND status = "completed"
         ORDER BY trained_day DESC'
    );
    $statement->execute(['user_id' => $userId]);
    $days = array_column($statement->fetchAll(), 'trained_day');
    $best = 0;
    $currentRun = 0;
    $previous = null;

    foreach (array_reverse($days) as $day) {
        if ($previous === null || strtotime($day) === strtotime($previous . ' +1 day')) {
            $currentRun++;
        } else {
            $currentRun = 1;
        }
        $best = max($best, $currentRun);
        $previous = $day;
    }

    $current = 0;
    $cursor = date('Y-m-d');
    if (!in_array($cursor, $days, true)) {
        $cursor = date('Y-m-d', strtotime('-1 day'));
    }

    while (in_array($cursor, $days, true)) {
        $current++;
        $cursor = date('Y-m-d', strtotime($cursor . ' -1 day'));
    }

    return ['current' => $current, 'best' => $best];
}

function loadPersonalRecords(PDO $pdo, int $userId): array
{
    $statement = $pdo->prepare(
        'SELECT pr.exercise_id, COALESCE(latest.exercise_name, pr.exercise_id) exercise_name,
                pr.type, pr.value, pr.previous_value, pr.achieved_at
         FROM personal_records pr
         LEFT JOIN (
            SELECT e.exercise_id, MAX(e.exercise_name) exercise_name
            FROM workout_session_exercises e
            INNER JOIN workout_sessions s ON s.id = e.session_id
            WHERE s.user_id = :user_id_for_names
            GROUP BY e.exercise_id
         ) latest ON latest.exercise_id = pr.exercise_id
         WHERE pr.user_id = :user_id
         ORDER BY pr.achieved_at DESC
         LIMIT 80'
    );
    $statement->execute(['user_id' => $userId, 'user_id_for_names' => $userId]);

    return array_map(fn (array $row): array => [
        'exerciseId' => $row['exercise_id'],
        'exerciseName' => $row['exercise_name'],
        'type' => $row['type'],
        'value' => (float) $row['value'],
        'previousValue' => $row['previous_value'] !== null ? (float) $row['previous_value'] : null,
        'achievedAt' => $row['achieved_at'],
    ], $statement->fetchAll());
}

function loadAchievements(PDO $pdo, int $userId): array
{
    $statement = $pdo->prepare(
        'SELECT type, title, description, unlocked_at
         FROM achievements
         WHERE user_id = :user_id
         ORDER BY unlocked_at DESC'
    );
    $statement->execute(['user_id' => $userId]);

    return array_map(fn (array $row): array => [
        'type' => $row['type'],
        'title' => $row['title'],
        'description' => $row['description'],
        'unlockedAt' => $row['unlocked_at'],
    ], $statement->fetchAll());
}

function muscleMap(PDO $pdo, int $userId, string $range): array
{
    $where = 's.user_id = :user_id AND s.status = "completed" AND l.completed = 1';
    $params = ['user_id' => $userId];

    if ($range === 'last') {
        $last = $pdo->prepare('SELECT id FROM workout_sessions WHERE user_id = :user_id AND status = "completed" ORDER BY completed_at DESC, id DESC LIMIT 1');
        $last->execute(['user_id' => $userId]);
        $sessionId = $last->fetchColumn();
        if (!$sessionId) {
            return [];
        }
        $where .= ' AND s.id = :session_id';
        $params['session_id'] = (int) $sessionId;
    } elseif ($range === 'week') {
        $where .= ' AND s.completed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } elseif ($range === 'month') {
        $where .= ' AND s.completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }

    $statement = $pdo->prepare(
        "SELECT e.muscle, e.muscle_group, COUNT(*) sets, COALESCE(SUM(COALESCE(l.weight, 0) * COALESCE(l.reps, 0)), 0) volume
         FROM workout_set_logs l
         INNER JOIN workout_session_exercises e ON e.id = l.session_exercise_id
         INNER JOIN workout_sessions s ON s.id = e.session_id
         WHERE {$where}
         GROUP BY e.muscle, e.muscle_group"
    );
    $statement->execute($params);
    $mapped = [];

    foreach ($statement->fetchAll() as $row) {
        $key = normalizeMuscle((string) ($row['muscle'] ?: $row['muscle_group']));
        $mapped[$key] = [
            'muscle' => $key,
            'sets' => ($mapped[$key]['sets'] ?? 0) + (int) $row['sets'],
            'volume' => round(($mapped[$key]['volume'] ?? 0) + (float) $row['volume'], 2),
        ];
    }

    return array_values($mapped);
}

function loadWorkoutHistory(PDO $pdo, int $userId): array
{
    $statement = $pdo->prepare(
        'SELECT id FROM workout_sessions
         WHERE user_id = :user_id AND status = "completed"
         ORDER BY completed_at DESC, id DESC
         LIMIT 20'
    );
    $statement->execute(['user_id' => $userId]);

    return array_map(fn (array $row): array => sessionSummary($pdo, $userId, (int) $row['id'], false), $statement->fetchAll());
}

function sessionSummary(PDO $pdo, int $userId, int $sessionId, bool $includeSession = true): array
{
    $session = loadWorkoutSession($pdo, $userId, $sessionId);
    $completedSets = 0;
    $volume = 0;

    foreach ($session['exercises'] as $exercise) {
        foreach ($exercise['sets'] as $set) {
            if ($set['completed']) {
                $completedSets++;
                $volume += (float) ($set['weight'] ?? 0) * (int) ($set['reps'] ?? 0);
            }
        }
    }

    $summary = [
        'id' => $session['id'],
        'name' => $session['name'],
        'completedAt' => $session['completedAt'],
        'durationSeconds' => $session['durationSeconds'],
        'exerciseCount' => count($session['exercises']),
        'completedSets' => $completedSets,
        'volume' => round($volume, 2),
        'muscles' => muscleMap($pdo, $userId, 'last'),
    ];

    if ($includeSession) {
        $summary['session'] = $session;
    }

    return $summary;
}

function sessionCompletedSets(PDO $pdo, int $userId, int $sessionId): array
{
    $statement = $pdo->prepare(
        'SELECT l.id set_id, e.exercise_id, e.exercise_name, e.muscle, e.muscle_group, l.weight, l.reps, l.time_seconds
         FROM workout_set_logs l
         INNER JOIN workout_session_exercises e ON e.id = l.session_exercise_id
         INNER JOIN workout_sessions s ON s.id = e.session_id
         WHERE s.user_id = :user_id AND s.id = :session_id AND l.completed = 1'
    );
    $statement->execute(['user_id' => $userId, 'session_id' => $sessionId]);

    return $statement->fetchAll();
}

function effectiveSetWeight(array $row, ?float $bodyWeight): float
{
    $weight = (float) ($row['weight'] ?? 0);

    if ($weight > 0 || $bodyWeight === null || $bodyWeight <= 0) {
        return $weight;
    }

    $text = strtolower((string) (($row['exercise_name'] ?? '') . ' ' . ($row['muscle'] ?? '') . ' ' . ($row['muscle_group'] ?? '')));
    foreach (['dominada', 'flexion', 'flexión', 'fondos', 'peso corporal', 'bodyweight', 'sentadilla libre', 'abdominal', 'plancha'] as $needle) {
        if (str_contains($text, $needle)) {
            return $bodyWeight;
        }
    }

    return $weight;
}

function assertOwnRoutine(PDO $pdo, int $userId, int $routineId): void
{
    $statement = $pdo->prepare('SELECT COUNT(*) FROM user_routines WHERE id = :id AND user_id = :user_id');
    $statement->execute(['id' => $routineId, 'user_id' => $userId]);
    if ((int) $statement->fetchColumn() === 0) {
        throw new InvalidArgumentException('No puedes modificar esa rutina.');
    }
}

function assertOwnSession(PDO $pdo, int $userId, int $sessionId): void
{
    $statement = $pdo->prepare('SELECT COUNT(*) FROM workout_sessions WHERE id = :id AND user_id = :user_id');
    $statement->execute(['id' => $sessionId, 'user_id' => $userId]);
    if ((int) $statement->fetchColumn() === 0) {
        throw new InvalidArgumentException('No puedes modificar esa sesión.');
    }
}

function defaultSetsForExercise(array $exercise): array
{
    $count = max(1, min(10, (int) ($exercise['targetSets'] ?? 3)));
    $sets = [];
    for ($index = 0; $index < $count; $index++) {
        $sets[] = [
            'weight' => $exercise['targetWeight'] ?? null,
            'reps' => numericFromText((string) ($exercise['targetReps'] ?? '')),
            'timeSeconds' => $exercise['targetTimeSeconds'] ?? null,
            'restSeconds' => $exercise['restSeconds'] ?? 90,
            'completed' => false,
        ];
    }

    return $sets;
}

function parseTargetSets(string $specs): int
{
    return preg_match('/(\d+)\s*x/i', $specs, $matches) ? max(1, min(10, (int) $matches[1])) : 3;
}

function parseTargetReps(string $specs): string
{
    return trim(preg_replace('/^\d+\s*x\s*/i', '', $specs) ?? $specs);
}

function numericFromText(string $value): ?int
{
    return preg_match('/\d+/', $value, $matches) ? (int) $matches[0] : null;
}

function cleanText(mixed $value, int $maxLength): string
{
    $text = preg_replace('/\s+/', ' ', trim((string) $value)) ?? '';
    if ($text !== strip_tags($text)) {
        throw new InvalidArgumentException('Los textos no pueden contener HTML.');
    }

    if (strlen($text) > $maxLength) {
        throw new InvalidArgumentException('Hay un texto demasiado largo.');
    }

    return $text;
}

function nullableValue(string $value): ?string
{
    return $value === '' ? null : $value;
}

function positiveInt(mixed $value, string $label): int
{
    if (!is_numeric($value) || (int) $value < 1) {
        throw new InvalidArgumentException("El campo {$label} no es válido.");
    }

    return (int) $value;
}

function nonNegativeInt(mixed $value, string $label): int
{
    if ($value === null || $value === '') {
        return 0;
    }

    if (!is_numeric($value) || (int) $value < 0) {
        throw new InvalidArgumentException("El campo {$label} no puede ser negativo.");
    }

    return (int) $value;
}

function nullableNonNegativeInt(mixed $value, string $label): ?int
{
    if ($value === null || $value === '') {
        return null;
    }

    return nonNegativeInt($value, $label);
}

function nullableFloat(mixed $value, string $label): ?float
{
    if ($value === null || $value === '') {
        return null;
    }

    if (!is_numeric($value) || (float) $value < 0) {
        throw new InvalidArgumentException("El campo {$label} no puede ser negativo.");
    }

    return (float) $value;
}

function nullableRpe(mixed $value): ?float
{
    if ($value === null || $value === '') {
        return null;
    }

    if (!is_numeric($value) || (float) $value < 0 || (float) $value > 10) {
        throw new InvalidArgumentException('El esfuerzo debe estar entre 0 y 10.');
    }

    return (float) $value;
}

function normalizeMuscle(string $value): string
{
    $value = strtolower($value);

    return match (true) {
        str_contains($value, 'pect') || str_contains($value, 'pecho') => 'pecho',
        str_contains($value, 'dors') || str_contains($value, 'espalda') || str_contains($value, 'remo') => 'espalda',
        str_contains($value, 'homb') => 'hombros',
        str_contains($value, 'bíc') || str_contains($value, 'bic') => 'bíceps',
        str_contains($value, 'tríc') || str_contains($value, 'tric') => 'tríceps',
        str_contains($value, 'antebra') => 'antebrazo',
        str_contains($value, 'abdom') || str_contains($value, 'core') => 'abdomen/core',
        str_contains($value, 'glú') || str_contains($value, 'glu') || str_contains($value, 'aductor') || str_contains($value, 'abductor') => 'glúteos',
        str_contains($value, 'cuád') || str_contains($value, 'cuad') => 'cuádriceps',
        str_contains($value, 'femoral') || str_contains($value, 'isqu') => 'isquios',
        str_contains($value, 'gemel') => 'gemelos',
        default => $value !== '' ? $value : 'otros',
    };
}
