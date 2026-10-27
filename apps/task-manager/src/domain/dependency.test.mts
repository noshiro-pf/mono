import { Arr } from 'ts-data-forge';
import type { StrictOmit } from 'ts-type-forge';
import { createMilestone } from './create-milestone.mjs';
import { createTask } from './create-task.mjs';
import {
  isActionable,
  isMilestoneReached,
  milestoneReachedAt,
  satisfiedSince,
  unmetDependencies,
} from './dependency.mjs';
import {
  buildEvaluationContext,
  type EvaluationContext,
} from './evaluation-context.mjs';
import {
  asMilestoneId,
  asTaskId,
  type Dependency,
  type Milestone,
  type MilestoneId,
  type Task,
  type TaskId,
} from './types.mjs';

const now = 10_000;

const finishToStart = (id: TaskId, lagMs = 0): Dependency =>
  ({
    from: { kind: 'task', id },
    type: 'finish-to-start',
    lagMs,
  }) as const;

const startToStart = (id: TaskId, lagMs = 0): Dependency =>
  ({
    from: { kind: 'task', id },
    type: 'start-to-start',
    lagMs,
  }) as const;

const onMilestone = (id: MilestoneId, lagMs = 0): Dependency =>
  ({
    from: { kind: 'milestone', id },
    lagMs,
  }) as const;

const a = asTaskId('a');

const b = asTaskId('b');

const c = asTaskId('c');

const tasks: readonly Task[] = [
  createTask({
    id: a,
    title: 'A',
    now: 0,
    progress: 'done',
    startedAt: 1000,
    completedAt: 3000,
  }),
  createTask({
    id: b,
    title: 'B',
    now: 0,
    progress: 'in-progress',
    startedAt: 2000,
  }),
  createTask({ id: c, title: 'C', now: 0 }),
] as const;

const milestone = (
  id: string,
  fields: Partial<
    StrictOmit<Milestone, 'id' | 'title' | 'createdAt' | 'updatedAt'>
  > = {},
): Milestone =>
  createMilestone({ title: id, now: 500, ...fields, id: asMilestoneId(id) });

const context = (milestones: readonly Milestone[] = []): EvaluationContext =>
  buildEvaluationContext({ tasks, milestones });

/** When `target` is reached, in a state of `target` and `others`. */
const reachedAt = (
  target: Milestone,
  others: readonly Milestone[] = [],
): number | undefined =>
  milestoneReachedAt(target, context(Arr.toUnshifted(target)(others)), now);

const withDependencies = (dependencies: readonly Dependency[]): Task =>
  createTask({ id: asTaskId('t'), title: 'T', now: 0, dependencies });

describe(satisfiedSince, () => {
  describe('finish-to-start', () => {
    test('holds from the completion plus the lag', () => {
      assert.strictEqual(
        satisfiedSince(finishToStart(a), context(), now),
        3000,
      );

      assert.strictEqual(
        satisfiedSince(finishToStart(a, 7000), context(), now),
        10_000,
      );
    });

    test('does not hold while the lag runs', () => {
      assert.isUndefined(
        satisfiedSince(finishToStart(a, 7001), context(), now),
      );
    });

    test('does not hold while the source is not done', () => {
      assert.isUndefined(satisfiedSince(finishToStart(b), context(), now));

      assert.isUndefined(satisfiedSince(finishToStart(c), context(), now));
    });
  });

  describe('start-to-start', () => {
    test('holds from the start plus the lag, for any started progress', () => {
      assert.strictEqual(satisfiedSince(startToStart(b), context(), now), 2000);

      assert.strictEqual(
        satisfiedSince(startToStart(b, 500), context(), now),
        2500,
      );

      assert.strictEqual(satisfiedSince(startToStart(a), context(), now), 1000);
    });

    test('does not hold while the source has not started', () => {
      assert.isUndefined(satisfiedSince(startToStart(c), context(), now));
    });
  });

  test('a dependency on a missing node does not hold', () => {
    assert.isUndefined(
      satisfiedSince(finishToStart(asTaskId('missing')), context(), now),
    );

    assert.isUndefined(
      satisfiedSince(onMilestone(asMilestoneId('missing')), context(), now),
    );
  });

  test('a dependency on a milestone holds from its reach plus the lag', () => {
    const ctx = context([milestone('m', { date: 4000 })]);

    assert.strictEqual(
      satisfiedSince(onMilestone(asMilestoneId('m')), ctx, now),
      4000,
    );

    assert.strictEqual(
      satisfiedSince(onMilestone(asMilestoneId('m'), 6000), ctx, now),
      10_000,
    );

    assert.isUndefined(
      satisfiedSince(onMilestone(asMilestoneId('m'), 6001), ctx, now),
    );
  });
});

describe(milestoneReachedAt, () => {
  test('a milestone with nothing to wait for is reached when created', () => {
    assert.strictEqual(reachedAt(milestone('m')), 500);
  });

  test('a date gate is reached on its date', () => {
    assert.strictEqual(reachedAt(milestone('m', { date: 5000 })), 5000);

    assert.strictEqual(reachedAt(milestone('m', { date: now })), now);

    assert.isUndefined(reachedAt(milestone('m', { date: now + 1 })));
  });

  test('a manual check is reached when checked', () => {
    assert.isUndefined(
      reachedAt(milestone('m', { requiresManualCheck: true })),
    );

    assert.strictEqual(
      reachedAt(milestone('m', { requiresManualCheck: true, checkedAt: 6000 })),
      6000,
    );

    assert.isUndefined(
      reachedAt(
        milestone('m', { requiresManualCheck: true, checkedAt: now + 1 }),
      ),
    );
  });

  test('a checkedAt without requiresManualCheck is ignored', () => {
    assert.strictEqual(reachedAt(milestone('m', { checkedAt: 6000 })), 500);
  });

  test('an aggregate is reached when its last dependency holds', () => {
    assert.strictEqual(
      reachedAt(
        milestone('m', { dependencies: [finishToStart(a), startToStart(b)] }),
      ),
      3000,
    );

    assert.isUndefined(
      reachedAt(
        milestone('m', { dependencies: [finishToStart(a), finishToStart(b)] }),
      ),
    );
  });

  test('a combination is reached when every component is, at the latest', () => {
    assert.strictEqual(
      reachedAt(
        milestone('m', {
          date: 4000,
          requiresManualCheck: true,
          checkedAt: 6000,
          dependencies: [finishToStart(a)],
        }),
      ),
      6000,
    );

    assert.isUndefined(
      reachedAt(
        milestone('m', {
          date: 4000,
          requiresManualCheck: true,
          dependencies: [finishToStart(a)],
        }),
      ),
    );
  });

  test('follows dependencies through other milestones', () => {
    assert.strictEqual(
      reachedAt(
        milestone('m2', {
          dependencies: [onMilestone(asMilestoneId('m1'), 1000)],
        }),
        [milestone('m1', { date: 5000 })],
      ),
      6000,
    );
  });

  test('terminates on a cycle, which is never reached', () => {
    const m1 = milestone('m1', {
      dependencies: [onMilestone(asMilestoneId('m2'))],
    });

    const m2 = milestone('m2', {
      dependencies: [onMilestone(asMilestoneId('m1'))],
    });

    assert.isUndefined(reachedAt(m1, [m2]));
  });

  test('evaluates a shared milestone once per evaluation', () => {
    // 40 layers of diamonds: 2^40 paths, so only memoization finishes.
    const layers = 40;

    const milestones = Array.from({ length: layers + 1 }, (_, i) =>
      i === 0
        ? [milestone('m0', { date: 1000 })]
        : [
            milestone(`l${i}`, {
              dependencies: [onMilestone(asMilestoneId(`m${i - 1}`), 1)],
            }),
            milestone(`r${i}`, {
              dependencies: [onMilestone(asMilestoneId(`m${i - 1}`), 2)],
            }),
            milestone(`m${i}`, {
              dependencies: [
                onMilestone(asMilestoneId(`l${i}`)),
                onMilestone(asMilestoneId(`r${i}`)),
              ],
            }),
          ],
    ).flat();

    const last = milestones.at(-1);

    assert.isDefined(last);

    assert.strictEqual(
      milestoneReachedAt(last, context(milestones), now),
      1000 + 2 * layers,
    );
  });
});

describe(isMilestoneReached, () => {
  test('is whether the milestone has been reached by now', () => {
    const reached = milestone('m', { date: 5000 });

    const pending = milestone('p', { date: now + 1 });

    const ctx = context([reached, pending]);

    assert.isTrue(isMilestoneReached(reached, ctx, now));

    assert.isFalse(isMilestoneReached(pending, ctx, now));
  });
});

describe('unmetDependencies / isActionable', () => {
  const ctx = context([milestone('m', { requiresManualCheck: true })]);

  test('a task with no dependencies is actionable', () => {
    assert.deepStrictEqual(
      unmetDependencies(withDependencies([]), ctx, now),
      [],
    );

    assert.isTrue(isActionable(withDependencies([]), ctx, now));
  });

  test('every dependency has to hold', () => {
    const task = withDependencies([
      finishToStart(a),
      startToStart(c),
      onMilestone(asMilestoneId('m')),
    ]);

    assert.deepStrictEqual(unmetDependencies(task, ctx, now), [
      startToStart(c),
      onMilestone(asMilestoneId('m')),
    ]);

    assert.isFalse(isActionable(task, ctx, now));
  });

  test('is actionable when all dependencies hold', () => {
    assert.isTrue(
      isActionable(
        withDependencies([finishToStart(a), startToStart(b)]),
        ctx,
        now,
      ),
    );
  });
});
