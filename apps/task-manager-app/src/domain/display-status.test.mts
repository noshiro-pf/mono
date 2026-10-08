import { createMilestone } from './create-milestone.mjs';
import { createTask } from './create-task.mjs';
import {
  displayStatus,
  isStartedWithUnmetDependencies,
} from './display-status.mjs';
import { buildEvaluationContext } from './evaluation-context.mjs';
import {
  asMilestoneId,
  asTaskId,
  type Dependency,
  type Progress,
  type Task,
} from './types.mjs';

const now = 1000;

const context = buildEvaluationContext({
  tasks: [],
  milestones: [
    createMilestone({ id: asMilestoneId('met'), title: 'Met', now: 0 }),
    createMilestone({
      id: asMilestoneId('unmet'),
      title: 'Unmet',
      now: 0,
      requiresManualCheck: true,
    }),
  ],
});

const met: Dependency = {
  from: { kind: 'milestone', id: asMilestoneId('met') },
  lagMs: 0,
} as const;

const unmet: Dependency = {
  from: { kind: 'milestone', id: asMilestoneId('unmet') },
  lagMs: 0,
} as const;

const task = (progress: Progress, dependencies: readonly Dependency[]): Task =>
  createTask({ id: asTaskId('t'), title: 'T', now: 0, progress, dependencies });

describe(displayStatus, () => {
  test('a not-started task is ready when every dependency holds', () => {
    assert.strictEqual(
      displayStatus(task('not-started', []), context, now),
      'ready',
    );

    assert.strictEqual(
      displayStatus(task('not-started', [met]), context, now),
      'ready',
    );
  });

  test('a not-started task is blocked when a dependency does not hold', () => {
    assert.strictEqual(
      displayStatus(task('not-started', [met, unmet]), context, now),
      'blocked',
    );
  });

  test('a started task shows its progress whatever its dependencies', () => {
    assert.strictEqual(
      displayStatus(task('in-progress', [unmet]), context, now),
      'in-progress',
    );

    assert.strictEqual(
      displayStatus(task('in-review', [unmet]), context, now),
      'in-review',
    );

    assert.strictEqual(
      displayStatus(task('done', [unmet]), context, now),
      'done',
    );
  });
});

describe(isStartedWithUnmetDependencies, () => {
  test('is true for an in-progress or in-review task with an unmet dependency', () => {
    assert.isTrue(
      isStartedWithUnmetDependencies(
        task('in-progress', [unmet]),
        context,
        now,
      ),
    );

    assert.isTrue(
      isStartedWithUnmetDependencies(
        task('in-review', [met, unmet]),
        context,
        now,
      ),
    );
  });

  test('is false when every dependency holds', () => {
    assert.isFalse(
      isStartedWithUnmetDependencies(task('in-progress', [met]), context, now),
    );
  });

  test('is false for a task that is not started or already done', () => {
    assert.isFalse(
      isStartedWithUnmetDependencies(
        task('not-started', [unmet]),
        context,
        now,
      ),
    );

    assert.isFalse(
      isStartedWithUnmetDependencies(task('done', [unmet]), context, now),
    );
  });
});
