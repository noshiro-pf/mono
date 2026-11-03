import { Arr } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';
import { withChronologicalEdges } from './chronological-edges.mjs';
import { createMilestone } from './create-milestone.mjs';
import { createTask } from './create-task.mjs';
import { buildDependencyGraph } from './dependency-graph.mjs';
import {
  asMilestoneId,
  asTaskId,
  type DomainState,
  type Milestone,
  type Task,
} from './types.mjs';

const day = 86_400_000;

const startOfUtcDay = (epochMs: number): number => epochMs - (epochMs % day);

const milestone = (
  id: string,
  date: number | undefined,
  dependencies: Milestone['dependencies'] = [],
): Milestone =>
  createMilestone({
    id: asMilestoneId(id),
    title: id,
    now: 0,
    date,
    dependencies,
  });

const task = (id: string, dueDate: number | undefined): Task =>
  createTask({ id: asTaskId(id), title: id, now: 0, dueDate });

const allDay = (id: string, dueDate: number): Task =>
  createTask({ id: asTaskId(id), title: id, now: 0, dueDate, dueAllDay: true });

const dependsOn = (id: string) =>
  ({
    from: { kind: 'task', id: asTaskId(id) },
    type: 'finish-to-start',
    lagMs: 0,
  }) as const;

const on = (id: string) =>
  ({ from: { kind: 'milestone', id: asMilestoneId(id) }, lagMs: 0 }) as const;

const impliedOf = (
  state: DomainState,
): readonly FixedLengthTuple<2, string>[] =>
  withChronologicalEdges(state, buildDependencyGraph(state), startOfUtcDay)
    .edges.filter(({ implied }) => implied)
    .map(({ from, to }) => [from, to] as const);

describe(withChronologicalEdges, () => {
  test('joins only the milestones next to each other in time', () => {
    assert.deepStrictEqual(
      impliedOf({
        tasks: [],
        milestones: [
          milestone('m25', 25 * day),
          milestone('m20', 20 * day),
          milestone('m22', 22 * day),
        ],
      }),
      [
        ['milestone:m20', 'milestone:m22'],
        ['milestone:m22', 'milestone:m25'],
      ],
    );
  });

  test('leaves out milestones with no date, and keeps the dependencies as they are', () => {
    const a = asTaskId('a');

    const state: DomainState = {
      tasks: [
        createTask({ id: a, title: 'A', now: 0, dependencies: [on('m1')] }),
      ],
      milestones: [
        milestone('m1', day),
        milestone('none', undefined),
        milestone('m2', 2 * day),
      ],
    } as const;

    const graph = buildDependencyGraph(state);

    const withImplied = withChronologicalEdges(state, graph, startOfUtcDay);

    assert.deepStrictEqual(withImplied.nodes, graph.nodes);

    assert.deepStrictEqual(
      withImplied.edges,
      Arr.toPushed(graph.edges, {
        id: 'chronological:milestone:m1>milestone:m2',
        from: 'milestone:m1',
        to: 'milestone:m2',
        type: undefined,
        lagMs: 0,
        implied: true,
      }),
    );

    assert.isTrue(graph.edges.every(({ implied }) => !implied));
  });

  test('joins every milestone of a date to every one of the next', () => {
    assert.deepStrictEqual(
      impliedOf({
        tasks: [],
        milestones: [
          milestone('a', day),
          milestone('b', 2 * day),
          milestone('c', 2 * day),
          milestone('d', 3 * day),
        ],
      }),
      [
        ['milestone:a', 'milestone:b'],
        ['milestone:a', 'milestone:c'],
        ['milestone:b', 'milestone:d'],
        ['milestone:c', 'milestone:d'],
      ],
    );
  });

  test('adds nothing where a dependency already orders the two', () => {
    const a = asTaskId('a');

    assert.deepStrictEqual(
      impliedOf({
        tasks: [
          createTask({ id: a, title: 'A', now: 0, dependencies: [on('m1')] }),
        ],
        milestones: [
          milestone('m1', day),
          milestone('m2', 2 * day, [
            {
              from: { kind: 'task', id: a },
              type: 'finish-to-start',
              lagMs: 0,
            },
          ]),
          milestone('m3', 3 * day),
        ],
      }),
      [['milestone:m2', 'milestone:m3']],
    );
  });

  test('adds nothing against a dependency, nor anything that would close a cycle', () => {
    // m1 depends on m3 although it comes first: m1 → m2 is added, and m2 →
    // m3 would close m3 → m1 → m2 → m3.
    assert.deepStrictEqual(
      impliedOf({
        tasks: [],
        milestones: [
          milestone('m1', day, [on('m3')]),
          milestone('m2', 2 * day),
          milestone('m3', 3 * day),
        ],
      }),
      [['milestone:m1', 'milestone:m2']],
    );
  });

  test('joins a task to the milestones of the first date at or after its deadline', () => {
    assert.deepStrictEqual(
      impliedOf({
        tasks: [
          task('early', day),
          task('between', 15 * day),
          task('same', 20 * day),
          task('late', 30 * day),
          task('none', undefined),
        ],
        milestones: [
          milestone('m20', 20 * day),
          milestone('m25', 25 * day),
          milestone('m25b', 25 * day),
        ],
      }),
      [
        ['milestone:m20', 'milestone:m25'],
        ['milestone:m20', 'milestone:m25b'],
        ['task:early', 'milestone:m20'],
        ['task:between', 'milestone:m20'],
        ['task:same', 'milestone:m20'],
      ],
    );
  });

  test('joins a task whose deadline is after the milestones of a date to those of the next', () => {
    assert.deepStrictEqual(
      impliedOf({
        tasks: [task('t', 22 * day)],
        milestones: [
          milestone('m20', 20 * day),
          milestone('m25', 25 * day),
          milestone('m25b', 25 * day),
        ],
      }),
      [
        ['milestone:m20', 'milestone:m25'],
        ['milestone:m20', 'milestone:m25b'],
        ['task:t', 'milestone:m25'],
        ['task:t', 'milestone:m25b'],
      ],
    );
  });

  test('takes an all-day deadline from the start of its day', () => {
    assert.deepStrictEqual(
      impliedOf({
        tasks: [
          // Due on day 4, stored as its last moment.
          allDay('sameDay', 5 * day - 1),
          allDay('dayBefore', 4 * day - 1),
        ],
        milestones: [
          // Day 4, stored as its start.
          createMilestone({
            id: asMilestoneId('m4'),
            title: 'm4',
            now: 0,
            date: 4 * day,
            dateAllDay: true,
          }),
          milestone('m9', 9 * day),
        ],
      }),
      [
        ['milestone:m4', 'milestone:m9'],
        ['task:sameDay', 'milestone:m4'],
        ['task:dayBefore', 'milestone:m4'],
      ],
    );
  });

  test('adds no deadline edge where the edges already order the task and the milestone', () => {
    const after = asTaskId('after');

    assert.deepStrictEqual(
      impliedOf({
        tasks: [
          // Due before m1, which already depends on it.
          task('direct', 2 * day),
          // Due before m2, and already before it through m1 and the order in
          // time.
          task('through', 4 * day),
          // Due before m1, but depends on it, so it cannot come before it.
          createTask({
            id: after,
            title: 'after',
            now: 0,
            dueDate: day,
            dependencies: [on('m1')],
          }),
        ],
        milestones: [
          milestone('m1', 3 * day, [dependsOn('direct'), dependsOn('through')]),
          milestone('m2', 5 * day),
        ],
      }),
      [['milestone:m1', 'milestone:m2']],
    );
  });

  test('joins only the tasks in the graph', () => {
    const state: DomainState = {
      tasks: [task('shown', day), task('hidden', day)],
      milestones: [milestone('m', 2 * day)],
    } as const;

    const graph = buildDependencyGraph(state);

    assert.deepStrictEqual(
      withChronologicalEdges(
        state,
        {
          nodes: graph.nodes.filter(({ id }) => id !== 'task:hidden'),
          edges: [],
        },
        startOfUtcDay,
      ).edges,
      [
        {
          id: 'deadline:task:shown>milestone:m',
          from: 'task:shown',
          to: 'milestone:m',
          type: undefined,
          lagMs: 0,
          implied: true,
        },
      ],
    );
  });

  test('joins only the milestones in the graph', () => {
    const state: DomainState = {
      tasks: [],
      milestones: [
        milestone('m1', day),
        milestone('m2', 2 * day),
        milestone('m3', 3 * day),
      ],
    } as const;

    const graph = buildDependencyGraph(state);

    assert.deepStrictEqual(
      withChronologicalEdges(
        state,
        {
          nodes: graph.nodes.filter(({ id }) => id !== 'milestone:m2'),
          edges: [],
        },
        startOfUtcDay,
      ).edges.map(({ from, to }) => [from, to]),
      [['milestone:m1', 'milestone:m3']],
    );
  });
});
