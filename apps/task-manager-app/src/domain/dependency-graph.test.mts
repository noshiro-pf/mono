import { createMilestone } from './create-milestone.mjs';
import { createTask } from './create-task.mjs';
import { buildDependencyGraph } from './dependency-graph.mjs';
import { asMilestoneId, asTaskId } from './types.mjs';

const a = asTaskId('a');

const b = asTaskId('b');

const m = asMilestoneId('m');

describe(buildDependencyGraph, () => {
  test('an empty state is an empty graph', () => {
    assert.deepStrictEqual(
      buildDependencyGraph({ tasks: [], milestones: [] }),
      {
        nodes: [],
        edges: [],
      },
    );
  });

  test('has a node per task and milestone, and an edge per dependency', () => {
    const graph = buildDependencyGraph({
      tasks: [
        createTask({ id: a, title: 'A', now: 0 }),
        createTask({
          id: b,
          title: 'B',
          now: 0,
          dependencies: [
            {
              from: { kind: 'task', id: a },
              type: 'start-to-start',
              lagMs: 100,
            },
            { from: { kind: 'milestone', id: m }, lagMs: 0 },
          ],
        }),
      ],
      milestones: [
        createMilestone({
          id: m,
          title: 'M',
          now: 0,
          date: 5000,
          dependencies: [
            {
              from: { kind: 'task', id: a },
              type: 'finish-to-start',
              lagMs: 0,
            },
          ],
        }),
      ],
    });

    assert.deepStrictEqual(graph.nodes, [
      { id: 'task:a', ref: { kind: 'task', id: a } },
      { id: 'task:b', ref: { kind: 'task', id: b } },
      { id: 'milestone:m', ref: { kind: 'milestone', id: m } },
    ]);

    assert.deepStrictEqual(graph.edges, [
      {
        id: 'task:b#0',
        from: 'task:a',
        to: 'task:b',
        type: 'start-to-start',
        lagMs: 100,
      },
      {
        id: 'task:b#1',
        from: 'milestone:m',
        to: 'task:b',
        type: undefined,
        lagMs: 0,
      },
      {
        id: 'milestone:m#0',
        from: 'task:a',
        to: 'milestone:m',
        type: 'finish-to-start',
        lagMs: 0,
      },
    ]);
  });

  test('leaves out an edge from a node that does not exist', () => {
    const graph = buildDependencyGraph({
      tasks: [
        createTask({
          id: a,
          title: 'A',
          now: 0,
          dependencies: [
            {
              from: { kind: 'milestone', id: asMilestoneId('missing') },
              lagMs: 0,
            },
            {
              from: { kind: 'task', id: b },
              type: 'finish-to-start',
              lagMs: 0,
            },
          ],
        }),
        createTask({ id: b, title: 'B', now: 0 }),
      ],
      milestones: [],
    });

    assert.deepStrictEqual(graph.edges, [
      {
        id: 'task:a#1',
        from: 'task:b',
        to: 'task:a',
        type: 'finish-to-start',
        lagMs: 0,
      },
    ]);
  });
});
