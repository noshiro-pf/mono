import { createMilestone } from './create-milestone.mjs';
import { createTask } from './create-task.mjs';
import { buildEvaluationContext } from './evaluation-context.mjs';
import { createEvaluator } from './evaluator.mjs';
import { asMilestoneId, asTaskId, type Dependency } from './types.mjs';

const now = 10_000;

const a = asTaskId('a');

const reopened = asTaskId('reopened');

const m = asMilestoneId('m');

const context = buildEvaluationContext({
  tasks: [
    createTask({
      id: a,
      title: 'A',
      now: 0,
      progress: 'done',
      startedAt: 1000,
      completedAt: 3000,
    }),
    // Inconsistent on purpose: a completedAt left behind on a task that is
    // no longer done is not read.
    createTask({
      id: reopened,
      title: 'Reopened',
      now: 0,
      progress: 'in-progress',
      startedAt: 1000,
      completedAt: 3000,
    }),
  ],
  milestones: [createMilestone({ id: m, title: 'M', now: 0, date: 4000 })],
});

const finishToStart = (id: typeof a, lagMs: number): Dependency =>
  ({
    from: { kind: 'task', id },
    type: 'finish-to-start',
    lagMs,
  }) as const;

describe(createEvaluator, () => {
  const evaluator = createEvaluator(context, now);

  test('sourceEventAt is the event time, before the lag and whatever now is', () => {
    assert.strictEqual(evaluator.sourceEventAt(finishToStart(a, 99_999)), 3000);

    assert.strictEqual(
      evaluator.sourceEventAt({
        from: { kind: 'milestone', id: m },
        lagMs: 99_999,
      }),
      4000,
    );
  });

  test('satisfiedSince adds the lag and requires it to have passed', () => {
    assert.strictEqual(evaluator.satisfiedSince(finishToStart(a, 1000)), 4000);

    assert.isUndefined(evaluator.satisfiedSince(finishToStart(a, 99_999)));
  });

  test('reads completedAt only while the task is done', () => {
    assert.isUndefined(evaluator.sourceEventAt(finishToStart(reopened, 0)));
  });

  test('milestoneReachedAt gives the same answer when asked again', () => {
    const milestone = context.milestonesById.get(m);

    assert.isDefined(milestone);

    assert.strictEqual(evaluator.milestoneReachedAt(milestone), 4000);

    assert.strictEqual(evaluator.milestoneReachedAt(milestone), 4000);
  });
});
