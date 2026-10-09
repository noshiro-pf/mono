import {
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  type DomainState,
} from '../domain/index.mjs';
import { buildMilestoneRows, buildTaskRows } from './rows.mjs';

const a = asTaskId('a');

const b = asTaskId('b');

const c = asTaskId('c');

const m = asMilestoneId('m');

const n = asMilestoneId('n');

const now = 10_000;

const state: DomainState = {
  tasks: [
    createTask({ id: a, title: 'A', now: 0, priority: 2, dueDate: 5000 }),
    createTask({
      id: b,
      title: 'B',
      now: 0,
      priority: 1,
      progress: 'in-progress',
      startedAt: 1000,
      dependencies: [
        { from: { kind: 'task', id: a }, type: 'finish-to-start', lagMs: 0 },
      ],
    }),
    createTask({
      id: c,
      title: 'C',
      now: 0,
      progress: 'done',
      startedAt: 1000,
      completedAt: 2000,
      dueDate: 3000,
    }),
  ],
  milestones: [
    createMilestone({ id: m, title: 'M', now: 0, date: 20_000 }),
    createMilestone({
      id: n,
      title: 'N',
      now: 0,
      date: 5000,
      requiresManualCheck: true,
    }),
  ],
} as const;

describe(buildTaskRows, () => {
  test('derives each task’s status, warning, lateness and depth', () => {
    const rows = buildTaskRows(state, now, {
      sort: [{ key: 'title', order: 'asc' }],
      hideDone: false,
    });

    assert.deepStrictEqual(
      rows.map((row) => [
        row.task.id,
        row.status,
        row.startedWithUnmetDependencies,
        row.overdue,
        row.depth,
      ]),
      [
        [a, 'ready', false, true, 0],
        [b, 'in-progress', true, false, 1],
        [c, 'done', false, false, 0],
      ],
    );
  });

  test('sorts by the settings, status included', () => {
    const rows = buildTaskRows(state, now, {
      sort: [{ key: 'status', order: 'desc' }],
      hideDone: false,
    });

    assert.deepStrictEqual(
      rows.map((row) => row.task.id),
      [c, b, a],
    );
  });

  test('hides done tasks when asked to', () => {
    const rows = buildTaskRows(state, now, { sort: [], hideDone: true });

    assert.deepStrictEqual(
      rows.map((row) => row.task.id),
      [a, b],
    );
  });

  test('has no depth with a cycle, and still lists every task', () => {
    const cyclic: DomainState = {
      tasks: [
        createTask({
          id: a,
          title: 'A',
          now: 0,
          dependencies: [
            {
              from: { kind: 'task', id: b },
              type: 'finish-to-start',
              lagMs: 0,
            },
          ],
        }),
        createTask({
          id: b,
          title: 'B',
          now: 0,
          dependencies: [
            {
              from: { kind: 'task', id: a },
              type: 'finish-to-start',
              lagMs: 0,
            },
          ],
        }),
      ],
      milestones: [],
    } as const;

    const rows = buildTaskRows(cyclic, now, { sort: [], hideDone: false });

    assert.deepStrictEqual(
      rows.map((row) => [row.task.id, row.depth]),
      [
        [a, undefined],
        [b, undefined],
      ],
    );
  });
});

describe(buildMilestoneRows, () => {
  test('says which are reached and which wait for a check, by date', () => {
    const rows = buildMilestoneRows(state, now);

    assert.deepStrictEqual(
      rows.map((row) => [row.milestone.id, row.reachedAt, row.awaitingCheck]),
      [
        [n, undefined, true],
        [m, undefined, false],
      ],
    );

    assert.strictEqual(buildMilestoneRows(state, 30_000)[1]?.reachedAt, 20_000);
  });
});
