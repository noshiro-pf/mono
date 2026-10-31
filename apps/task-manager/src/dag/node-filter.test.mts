import {
  asGroupId,
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  type DomainState,
  type GraphNodeId,
  type Group,
} from '../domain/index.mjs';
import { NO_DAG_FILTER } from '../view-model/index.mjs';
import { filterNodes, taskLabels } from './node-filter.mjs';

const group = (id: string): Group =>
  ({
    id: asGroupId(id),
    title: id,
    createdAt: 0,
    updatedAt: 0,
  }) as const;

const groups = [group('g1'), group('g2')] as const;

const dependsOn = (id: string) =>
  ({
    from: { kind: 'task', id: asTaskId(id) },
    type: 'finish-to-start',
    lagMs: 0,
  }) as const;

// a (g1, ui) <- b (g1, api) <- c (g2, ui) <- m (milestone, g2) d (no group, no
// labels), e (in a group that is gone, ui)
const state: DomainState = {
  tasks: [
    {
      ...createTask({ id: asTaskId('a'), title: 'A', now: 0 }),
      groupId: asGroupId('g1'),
      labels: ['ui'],
    },
    {
      ...createTask({
        id: asTaskId('b'),
        title: 'B',
        now: 0,
        dependencies: [dependsOn('a')],
      }),
      groupId: asGroupId('g1'),
      labels: ['api'],
    },
    {
      ...createTask({
        id: asTaskId('c'),
        title: 'C',
        now: 0,
        dependencies: [dependsOn('b')],
      }),
      groupId: asGroupId('g2'),
      labels: ['ui', 'api'],
    },
    createTask({ id: asTaskId('d'), title: 'D', now: 0 }),
    {
      ...createTask({ id: asTaskId('e'), title: 'E', now: 0 }),
      groupId: asGroupId('gone'),
      labels: ['ui'],
    },
  ],
  milestones: [
    {
      ...createMilestone({
        id: asMilestoneId('m'),
        title: 'M',
        now: 0,
        dependencies: [dependsOn('c')],
      }),
      groupId: asGroupId('g2'),
    },
  ],
} as const;

const nodes = (ids: readonly GraphNodeId[]): ReadonlySet<GraphNodeId> =>
  new Set(ids);

const none = nodes([]);

describe(filterNodes, () => {
  test('leaves out nothing more with nothing chosen', () => {
    const hidden: ReadonlySet<GraphNodeId> = nodes(['task:d']);

    const result = filterNodes(state, groups, NO_DAG_FILTER, hidden);

    assert.strictEqual(result.hidden, hidden);

    assert.deepStrictEqual(result.outside, nodes([]));
  });

  test('keeps a group’s nodes, and draws what they are joined to faint', () => {
    assert.deepStrictEqual(
      filterNodes(
        state,
        groups,
        { groups: [asGroupId('g1')], labels: [] },
        none,
      ),
      {
        hidden: nodes(['task:d', 'task:e', 'milestone:m']),
        outside: nodes(['task:c']),
      },
    );
  });

  test('keeps the nodes of any group chosen', () => {
    assert.deepStrictEqual(
      filterNodes(
        state,
        groups,
        { groups: [asGroupId('g1'), asGroupId('g2')], labels: [] },
        none,
      ),
      { hidden: nodes(['task:d', 'task:e']), outside: nodes([]) },
    );
  });

  test('takes a node in a group that is gone as in none', () => {
    assert.deepStrictEqual(
      filterNodes(state, groups, { groups: [undefined], labels: [] }, none),
      {
        hidden: nodes(['task:a', 'task:b', 'task:c', 'milestone:m']),
        outside: nodes([]),
      },
    );
  });

  test('keeps the tasks with any label chosen, and the milestones joined to them', () => {
    assert.deepStrictEqual(
      filterNodes(state, groups, { groups: [], labels: ['api'] }, none),
      {
        hidden: nodes(['task:d', 'task:e']),
        outside: nodes(['task:a']),
      },
    );
  });

  test('keeps the tasks with no label for 「ラベルなし」', () => {
    assert.deepStrictEqual(
      filterNodes(state, groups, { groups: [], labels: [undefined] }, none),
      {
        hidden: nodes(['task:a', 'task:b', 'task:c', 'task:e', 'milestone:m']),
        outside: nodes([]),
      },
    );
  });

  test('keeps only what passes both, a group and a label', () => {
    assert.deepStrictEqual(
      filterNodes(
        state,
        groups,
        { groups: [asGroupId('g1')], labels: ['ui'] },
        none,
      ),
      {
        hidden: nodes(['task:c', 'task:d', 'task:e', 'milestone:m']),
        outside: nodes(['task:b']),
      },
    );
  });

  test('keeps no milestone joined to no task kept', () => {
    assert.deepStrictEqual(
      filterNodes(
        state,
        groups,
        { groups: [asGroupId('g2')], labels: ['nothing', 'api'] },
        nodes(['task:c']),
      ).hidden,
      nodes(['task:a', 'task:b', 'task:c', 'task:d', 'task:e', 'milestone:m']),
    );
  });

  test('keeps hidden what is hidden already, joined or not', () => {
    assert.deepStrictEqual(
      filterNodes(
        state,
        groups,
        { groups: [asGroupId('g1')], labels: [] },
        nodes(['task:a', 'task:c']),
      ),
      {
        hidden: nodes(['task:a', 'task:c', 'task:d', 'task:e', 'milestone:m']),
        outside: nodes([]),
      },
    );
  });

  test('passes over a group or a label that is nowhere now', () => {
    const hidden: ReadonlySet<GraphNodeId> = nodes([]);

    const result = filterNodes(
      state,
      groups,
      { groups: [asGroupId('gone')], labels: ['nothing'] },
      hidden,
    );

    assert.strictEqual(result.hidden, hidden);

    assert.deepStrictEqual(result.outside, nodes([]));
  });
});

describe(taskLabels, () => {
  test('is every label on a task, once each, sorted', () => {
    assert.deepStrictEqual(taskLabels(state), ['api', 'ui']);
  });
});
