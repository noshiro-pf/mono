import { createMilestone } from './create-milestone.mjs';
import { createTask } from './create-task.mjs';
import { removeNodes } from './remove-nodes.mjs';
import { asMilestoneId, asTaskId, type DomainState } from './types.mjs';

const a = asTaskId('a');

const b = asTaskId('b');

const c = asTaskId('c');

const m = asMilestoneId('m');

const now = 5000;

const state: DomainState = {
  tasks: [
    createTask({ id: a, title: 'A', now: 0 }),
    createTask({
      id: b,
      title: 'B',
      now: 0,
      dependencies: [
        { from: { kind: 'task', id: a }, type: 'finish-to-start', lagMs: 0 },
        { from: { kind: 'milestone', id: m }, lagMs: 100 },
        { from: { kind: 'task', id: a }, type: 'start-to-start', lagMs: 10 },
      ],
    }),
    createTask({
      id: c,
      title: 'C',
      now: 0,
      dependencies: [{ from: { kind: 'milestone', id: m }, lagMs: 0 }],
    }),
  ],
  milestones: [
    createMilestone({
      id: m,
      title: 'M',
      now: 0,
      dependencies: [
        { from: { kind: 'task', id: a }, type: 'finish-to-start', lagMs: 0 },
      ],
    }),
  ],
} as const;

describe(removeNodes, () => {
  test('removes a task and every dependency on it, in one change set', () => {
    const result = removeNodes(state, [{ kind: 'task', id: a }], now);

    assert.deepStrictEqual(
      result.state.tasks.map(({ id }) => id),
      [b, c],
    );

    assert.deepStrictEqual(
      result.state.tasks.find(({ id }) => id === b)?.dependencies,
      [{ from: { kind: 'milestone', id: m }, lagMs: 100 }],
    );

    assert.deepStrictEqual(result.state.milestones[0]?.dependencies, []);

    assert.deepStrictEqual(
      result.updatedTasks.map(({ id }) => id),
      [b],
    );

    assert.deepStrictEqual(
      result.updatedMilestones.map(({ id }) => id),
      [m],
    );
  });

  test('marks what it rewrote as updated now, and leaves the rest as they were', () => {
    const result = removeNodes(state, [{ kind: 'task', id: a }], now);

    assert.strictEqual(result.updatedTasks[0]?.updatedAt, now);

    assert.strictEqual(result.updatedMilestones[0]?.updatedAt, now);

    assert.strictEqual(result.state.tasks[1], state.tasks[2]);
  });

  test('removes a milestone and the dependencies on it', () => {
    const result = removeNodes(state, [{ kind: 'milestone', id: m }], now);

    assert.deepStrictEqual(result.state.milestones, []);

    assert.deepStrictEqual(
      result.updatedTasks.map(({ id, dependencies }) => [id, dependencies]),
      [
        [
          b,
          [
            {
              from: { kind: 'task', id: a },
              type: 'finish-to-start',
              lagMs: 0,
            },
            {
              from: { kind: 'task', id: a },
              type: 'start-to-start',
              lagMs: 10,
            },
          ],
        ],
        [c, []],
      ],
    );

    assert.deepStrictEqual(result.updatedMilestones, []);
  });

  test('a node nothing depends on changes nothing else', () => {
    const result = removeNodes(state, [{ kind: 'task', id: c }], now);

    assert.deepStrictEqual(
      result.state.tasks.map(({ id }) => id),
      [a, b],
    );

    assert.deepStrictEqual(result.updatedTasks, []);

    assert.deepStrictEqual(result.updatedMilestones, []);
  });

  test('a task and a milestone with the same id are different nodes', () => {
    const sameId: DomainState = {
      tasks: [
        createTask({ id: asTaskId('x'), title: 'X', now: 0 }),
        createTask({
          id: b,
          title: 'B',
          now: 0,
          dependencies: [
            { from: { kind: 'milestone', id: asMilestoneId('x') }, lagMs: 0 },
          ],
        }),
      ],
      milestones: [
        createMilestone({ id: asMilestoneId('x'), title: 'X', now: 0 }),
      ],
    } as const;

    const result = removeNodes(
      sameId,
      [{ kind: 'task', id: asTaskId('x') }],
      now,
    );

    assert.deepStrictEqual(
      result.state.tasks.map(({ id }) => id),
      [b],
    );

    assert.strictEqual(result.state.milestones.length, 1);

    assert.deepStrictEqual(result.updatedTasks, []);
  });

  test('removing a node that does not exist changes nothing', () => {
    const result = removeNodes(
      state,
      [{ kind: 'task', id: asTaskId('nope') }],
      now,
    );

    assert.deepStrictEqual(result.state, state);

    assert.deepStrictEqual(result.updatedTasks, []);

    assert.deepStrictEqual(result.updatedMilestones, []);
  });

  test('removes several nodes at once, and rewrites none of those it removes', () => {
    const result = removeNodes(
      state,
      [
        { kind: 'task', id: a },
        { kind: 'task', id: b },
      ],
      now,
    );

    assert.deepStrictEqual(
      result.state.tasks.map(({ id }) => id),
      [c],
    );

    // B depended on A, but is gone too.
    assert.deepStrictEqual(result.updatedTasks, []);

    assert.deepStrictEqual(
      result.updatedMilestones.map(({ id, dependencies }) => [
        id,
        dependencies,
      ]),
      [[m, []]],
    );
  });

  test('removes a task and a milestone together, and every dependency on either', () => {
    const result = removeNodes(
      state,
      [
        { kind: 'milestone', id: m },
        { kind: 'task', id: a },
      ],
      now,
    );

    assert.deepStrictEqual(result.state.milestones, []);

    assert.deepStrictEqual(
      result.updatedTasks.map(({ id, dependencies }) => [id, dependencies]),
      [
        [b, []],
        [c, []],
      ],
    );

    assert.deepStrictEqual(result.updatedMilestones, []);
  });

  test('removing none changes nothing', () => {
    const result = removeNodes(state, [], now);

    assert.deepStrictEqual(result.state, state);

    assert.deepStrictEqual(result.updatedTasks, []);

    assert.deepStrictEqual(result.updatedMilestones, []);
  });
});
