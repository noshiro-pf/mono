import { createTask } from './create-task.mjs';
import { asMilestoneId, asTaskId } from './types.mjs';

describe(createTask, () => {
  test('fills every field it is not given with the defaults', () => {
    assert.deepStrictEqual(
      createTask({ id: asTaskId('a'), title: 'Write', now: 1000 }),
      {
        id: asTaskId('a'),
        title: 'Write',
        description: '',
        progress: 'not-started',
        priority: 3,
        dueDate: undefined,
        createdAt: 1000,
        updatedAt: 1000,
        startedAt: undefined,
        completedAt: undefined,
        labels: [],
        estimateHours: undefined,
        assignees: [],
        reviewers: [],
        dependencies: [],
      },
    );
  });

  test('keeps the fields it is given', () => {
    const task = createTask({
      id: asTaskId('b'),
      title: 'Review',
      now: 1000,
      progress: 'done',
      priority: 1,
      startedAt: 800,
      completedAt: 900,
      labels: ['docs'],
      dependencies: [
        { from: { kind: 'milestone', id: asMilestoneId('m') }, lagMs: 0 },
      ],
    });

    assert.strictEqual(task.progress, 'done');

    assert.strictEqual(task.priority, 1);

    assert.strictEqual(task.completedAt, 900);

    assert.deepStrictEqual(task.labels, ['docs']);

    assert.deepStrictEqual(task.dependencies, [
      { from: { kind: 'milestone', id: asMilestoneId('m') }, lagMs: 0 },
    ]);

    assert.strictEqual(task.createdAt, 1000);
  });
});
