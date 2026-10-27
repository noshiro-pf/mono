import { createTask } from './create-task.mjs';
import { setProgress } from './set-progress.mjs';
import { asTaskId, type Progress, type Task } from './types.mjs';

const now = 10_000;

const task = (
  progress: Progress,
  startedAt: number | undefined,
  completedAt: number | undefined,
): Task =>
  createTask({
    id: asTaskId('a'),
    title: 'A',
    now: 0,
    progress,
    startedAt,
    completedAt,
  });

const timestamps = ({
  progress,
  startedAt,
  completedAt,
  updatedAt,
}: Task): Readonly<{
  progress: Progress;
  startedAt: number | undefined;
  completedAt: number | undefined;
  updatedAt: number;
}> => ({ progress, startedAt, completedAt, updatedAt }) as const;

describe(setProgress, () => {
  test('starting a task records when it started', () => {
    assert.deepStrictEqual(
      timestamps(
        setProgress(
          task('not-started', undefined, undefined),
          'in-progress',
          now,
        ),
      ),
      {
        progress: 'in-progress',
        startedAt: now,
        completedAt: undefined,
        updatedAt: now,
      },
    );

    assert.deepStrictEqual(
      timestamps(
        setProgress(
          task('not-started', undefined, undefined),
          'in-review',
          now,
        ),
      ),
      {
        progress: 'in-review',
        startedAt: now,
        completedAt: undefined,
        updatedAt: now,
      },
    );
  });

  test('moving among started states keeps the start time', () => {
    assert.deepStrictEqual(
      timestamps(
        setProgress(task('in-progress', 100, undefined), 'in-review', now),
      ),
      {
        progress: 'in-review',
        startedAt: 100,
        completedAt: undefined,
        updatedAt: now,
      },
    );
  });

  test('finishing a task records when it finished', () => {
    assert.deepStrictEqual(
      timestamps(setProgress(task('in-review', 100, undefined), 'done', now)),
      { progress: 'done', startedAt: 100, completedAt: now, updatedAt: now },
    );
  });

  test('finishing a task that never started records both times', () => {
    assert.deepStrictEqual(
      timestamps(
        setProgress(task('not-started', undefined, undefined), 'done', now),
      ),
      { progress: 'done', startedAt: now, completedAt: now, updatedAt: now },
    );
  });

  test('reopening a done task clears the finish time only', () => {
    assert.deepStrictEqual(
      timestamps(setProgress(task('done', 100, 200), 'in-progress', now)),
      {
        progress: 'in-progress',
        startedAt: 100,
        completedAt: undefined,
        updatedAt: now,
      },
    );
  });

  test('going back to not-started clears both times', () => {
    assert.deepStrictEqual(
      timestamps(setProgress(task('done', 100, 200), 'not-started', now)),
      {
        progress: 'not-started',
        startedAt: undefined,
        completedAt: undefined,
        updatedAt: now,
      },
    );
  });

  test('setting the progress a task already has changes nothing', () => {
    const original = task('in-progress', 100, undefined);

    assert.strictEqual(setProgress(original, 'in-progress', now), original);
  });

  test('does not mutate the task', () => {
    const original = task('not-started', undefined, undefined);

    setProgress(original, 'done', now);

    assert.strictEqual(original.progress, 'not-started');

    assert.isUndefined(original.startedAt);
  });
});
