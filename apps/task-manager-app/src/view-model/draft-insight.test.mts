import {
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  type DomainState,
} from '../domain/index.mjs';
import { milestoneDraftInsight, taskDraftInsight } from './draft-insight.mjs';

const a = asTaskId('a');

const m = asMilestoneId('m');

const state: DomainState = {
  tasks: [createTask({ id: a, title: 'A', now: 0 })],
  milestones: [createMilestone({ id: m, title: 'M', now: 0, date: 5000 })],
} as const;

describe(taskDraftInsight, () => {
  test('evaluates the draft’s dependencies and progress, not the stored ones', () => {
    assert.deepStrictEqual(
      taskDraftInsight(
        state,
        asTaskId('new'),
        {
          progress: 'not-started',
          dependencies: [{ from: { kind: 'milestone', id: m }, lagMs: 0 }],
        },
        1000,
      ),
      {
        status: 'blocked',
        startedWithUnmetDependencies: false,
        unmet: [{ from: { kind: 'milestone', id: m }, lagMs: 0 }],
      },
    );

    assert.deepStrictEqual(
      taskDraftInsight(
        state,
        a,
        {
          progress: 'in-progress',
          dependencies: [{ from: { kind: 'milestone', id: m }, lagMs: 0 }],
        },
        1000,
      ).startedWithUnmetDependencies,
      true,
    );

    assert.strictEqual(
      taskDraftInsight(
        state,
        a,
        {
          progress: 'not-started',
          dependencies: [{ from: { kind: 'milestone', id: m }, lagMs: 0 }],
        },
        6000,
      ).status,
      'ready',
    );
  });
});

describe(milestoneDraftInsight, () => {
  test('says whether the milestone as drafted is reached', () => {
    const draft = {
      title: 'M',
      description: '',
      date: '1970-01-01T00:05',
      requiresManualCheck: true,
      checkedAt: undefined,
      dependencies: [],
    } as const;

    assert.isUndefined(
      milestoneDraftInsight(state, m, draft, 600_000, 'UTC').reachedAt,
    );

    assert.strictEqual(
      milestoneDraftInsight(
        state,
        m,
        { ...draft, checkedAt: 400_000 },
        600_000,
        'UTC',
      ).reachedAt,
      400_000,
    );

    assert.isUndefined(
      milestoneDraftInsight(
        state,
        m,
        { ...draft, requiresManualCheck: false },
        200_000,
        'UTC',
      ).reachedAt,
    );
  });

  test('says which conditions are not met yet', () => {
    const draft = {
      date: '1970-01-01T00:05',
      requiresManualCheck: true,
      checkedAt: undefined,
      dependencies: [
        { from: { kind: 'task', id: a }, type: 'finish-to-start', lagMs: 0 },
      ],
    } as const;

    const before = milestoneDraftInsight(state, m, draft, 200_000, 'UTC');

    assert.deepStrictEqual(
      {
        waitingForDate: before.waitingForDate,
        waitingForCheck: before.waitingForCheck,
        unmet: before.unmet,
      },
      {
        waitingForDate: 300_000,
        waitingForCheck: true,
        unmet: draft.dependencies,
      },
    );

    const after = milestoneDraftInsight(
      state,
      m,
      { ...draft, checkedAt: 100_000, dependencies: [] },
      600_000,
      'UTC',
    );

    assert.deepStrictEqual(
      {
        reachedAt: after.reachedAt,
        waitingForDate: after.waitingForDate,
        waitingForCheck: after.waitingForCheck,
      },
      { reachedAt: 300_000, waitingForDate: undefined, waitingForCheck: false },
    );
  });
});
