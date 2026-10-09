import {
  asMilestoneId,
  asTaskId,
  buildDependencyGraph,
  createMilestone,
  createTask,
  type DomainState,
} from '../domain/index.mjs';
import { DAY_MS } from '../view-model/index.mjs';
import { layoutWithElk } from './elk.mjs';
import {
  COMPACT_MILESTONE_NODE_SIZE,
  COMPACT_TASK_NODE_SIZE,
  edgeLabel,
  fromElkGraph,
  labelSize,
  layoutInput,
  layoutKey,
  MILESTONE_NODE_SIZE,
  nodeBoxSize,
  resizeNodes,
  TASK_NODE_SIZE,
  toElkGraph,
} from './graph-layout.mjs';

const a = asTaskId('a');

const b = asTaskId('b');

const m = asMilestoneId('m');

const state: DomainState = {
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
          lagMs: 3 * DAY_MS,
        },
      ],
    }),
  ],
  milestones: [
    createMilestone({
      id: m,
      title: 'M',
      now: 0,
      dependencies: [
        { from: { kind: 'task', id: b }, type: 'finish-to-start', lagMs: 0 },
      ],
    }),
  ],
} as const;

describe(edgeLabel, () => {
  test('says SS for start-to-start, and the lag when there is one', () => {
    assert.strictEqual(
      edgeLabel({ type: 'start-to-start', lagMs: 3 * DAY_MS }),
      'SS +3日',
    );

    assert.strictEqual(edgeLabel({ type: 'start-to-start', lagMs: 0 }), 'SS');

    assert.strictEqual(
      edgeLabel({ type: 'finish-to-start', lagMs: DAY_MS }),
      '+1日',
    );

    assert.strictEqual(edgeLabel({ type: undefined, lagMs: 0 }), '');
  });
});

describe(layoutInput, () => {
  test('sizes each node by its kind and labels each edge', () => {
    const input = layoutInput(buildDependencyGraph(state), 'right', 'standard');

    assert.deepStrictEqual(input, {
      direction: 'right',
      nodes: [
        { id: 'task:a', kind: 'task', ...TASK_NODE_SIZE },
        { id: 'task:b', kind: 'task', ...TASK_NODE_SIZE },
        { id: 'milestone:m', kind: 'milestone', ...MILESTONE_NODE_SIZE },
      ],
      edges: [
        { id: 'task:b#0', from: 'task:a', to: 'task:b', label: 'SS +3日' },
        { id: 'milestone:m#0', from: 'task:b', to: 'milestone:m', label: '' },
      ],
    });
  });

  test('sizes the nodes compact when asked to, edges as before', () => {
    const standard = layoutInput(
      buildDependencyGraph(state),
      'right',
      'standard',
    );

    const compact = layoutInput(
      buildDependencyGraph(state),
      'right',
      'compact',
    );

    assert.deepStrictEqual(compact.nodes, [
      { id: 'task:a', kind: 'task', ...COMPACT_TASK_NODE_SIZE },
      { id: 'task:b', kind: 'task', ...COMPACT_TASK_NODE_SIZE },
      { id: 'milestone:m', kind: 'milestone', ...COMPACT_MILESTONE_NODE_SIZE },
    ]);

    assert.deepStrictEqual(compact.edges, standard.edges);
  });
});

describe(nodeBoxSize, () => {
  test('is the box of each kind at each size, compact the smaller', () => {
    assert.deepStrictEqual(nodeBoxSize('task', 'standard'), TASK_NODE_SIZE);

    assert.deepStrictEqual(
      nodeBoxSize('milestone', 'standard'),
      MILESTONE_NODE_SIZE,
    );

    assert.deepStrictEqual(
      nodeBoxSize('task', 'compact'),
      COMPACT_TASK_NODE_SIZE,
    );

    assert.deepStrictEqual(
      nodeBoxSize('milestone', 'compact'),
      COMPACT_MILESTONE_NODE_SIZE,
    );

    for (const kind of ['task', 'milestone'] as const) {
      const standard = nodeBoxSize(kind, 'standard');

      const compact = nodeBoxSize(kind, 'compact');

      assert.isBelow(compact.width, standard.width);

      assert.isBelow(compact.height, standard.height);
    }
  });
});

describe(resizeNodes, () => {
  test('gives each node the box of its kind at the size, where it is', () => {
    assert.deepStrictEqual(
      resizeNodes(
        [
          { id: 'task:a', kind: 'task', x: 10, y: 20, ...TASK_NODE_SIZE },
          {
            id: 'milestone:m',
            kind: 'milestone',
            x: 30,
            y: 40,
            ...MILESTONE_NODE_SIZE,
          },
        ],
        'compact',
      ),
      [
        { id: 'task:a', kind: 'task', x: 10, y: 20, ...COMPACT_TASK_NODE_SIZE },
        {
          id: 'milestone:m',
          kind: 'milestone',
          x: 30,
          y: 40,
          ...COMPACT_MILESTONE_NODE_SIZE,
        },
      ],
    );
  });
});

describe(layoutKey, () => {
  test('changes with the structure, the direction and the node size, not with titles', () => {
    const key = layoutKey(
      layoutInput(buildDependencyGraph(state), 'right', 'standard'),
    );

    const renamed: DomainState = {
      ...state,
      tasks: state.tasks.map((task) => ({ ...task, title: `${task.title}!` })),
    } as const;

    assert.strictEqual(
      layoutKey(
        layoutInput(buildDependencyGraph(renamed), 'right', 'standard'),
      ),
      key,
    );

    assert.notStrictEqual(
      layoutKey(layoutInput(buildDependencyGraph(state), 'down', 'standard')),
      key,
    );

    assert.notStrictEqual(
      layoutKey(layoutInput(buildDependencyGraph(state), 'right', 'compact')),
      key,
    );

    assert.notStrictEqual(
      layoutKey(
        layoutInput(
          buildDependencyGraph({ ...state, milestones: [] }),
          'right',
          'standard',
        ),
      ),
      key,
    );
  });
});

describe(toElkGraph, () => {
  test('asks for a layered layout in the direction given', () => {
    const graph = toElkGraph(
      layoutInput(buildDependencyGraph(state), 'down', 'standard'),
    );

    assert.strictEqual(graph.layoutOptions?.['elk.algorithm'], 'layered');

    assert.strictEqual(graph.layoutOptions?.['elk.direction'], 'DOWN');

    assert.strictEqual(
      toElkGraph(layoutInput(buildDependencyGraph(state), 'right', 'standard'))
        .layoutOptions?.['elk.direction'],
      'RIGHT',
    );

    // Fewer crossings and shorter edges, with room beside the nodes of a
    // layer for the edges that skip it (`edge-routing.mts`), in a layout
    // that follows the order of the input where it can.
    const options = graph.layoutOptions ?? {};

    assert.deepStrictEqual(
      [
        options['elk.layered.crossingMinimization.strategy'],
        options['elk.layered.nodePlacement.strategy'],
        options['elk.layered.considerModelOrder.strategy'],
        options['elk.spacing.edgeNode'],
        options['elk.layered.spacing.edgeNodeBetweenLayers'],
      ],
      ['LAYER_SWEEP', 'NETWORK_SIMPLEX', 'NODES_AND_EDGES', '24', '24'],
    );

    assert.deepStrictEqual(
      graph.edges?.map(({ sources, targets, labels }) => [
        sources,
        targets,
        labels?.map(({ text }) => text),
      ]),
      [
        [['task:a'], ['task:b'], ['SS +3日']],
        [['task:b'], ['milestone:m'], []],
      ],
    );
  });
});

describe(fromElkGraph, () => {
  test('reads the positions back from what ELK laid out', async () => {
    const input = layoutInput(buildDependencyGraph(state), 'right', 'standard');

    const layout = fromElkGraph(input, await layoutWithElk(toElkGraph(input)));

    assert.deepStrictEqual(
      layout.nodes.map(({ id, kind, width, height }) => [
        id,
        kind,
        width,
        height,
      ]),
      [
        ['task:a', 'task', TASK_NODE_SIZE.width, TASK_NODE_SIZE.height],
        ['task:b', 'task', TASK_NODE_SIZE.width, TASK_NODE_SIZE.height],
        [
          'milestone:m',
          'milestone',
          MILESTONE_NODE_SIZE.width,
          MILESTONE_NODE_SIZE.height,
        ],
      ],
    );

    const [nodeA, nodeB, nodeM] = layout.nodes;

    // Left to right, in dependency order.
    assert.isBelow(nodeA?.x ?? Number.NaN, nodeB?.x ?? Number.NaN);

    assert.isBelow(nodeB?.x ?? Number.NaN, nodeM?.x ?? Number.NaN);

    assert.deepStrictEqual(layout.edges, input.edges);
  });

  test('lays out top to bottom when asked to go down', async () => {
    const input = layoutInput(buildDependencyGraph(state), 'down', 'standard');

    const layout = fromElkGraph(input, await layoutWithElk(toElkGraph(input)));

    const [nodeA, nodeB] = layout.nodes;

    assert.isBelow(nodeA?.y ?? Number.NaN, nodeB?.y ?? Number.NaN);
  });

  test('lays out compact nodes at their size, closer together', async () => {
    const graph = buildDependencyGraph(state);

    const compactInput = layoutInput(graph, 'down', 'compact');

    assert.deepStrictEqual(
      toElkGraph(compactInput).children?.map(({ id, width, height }) => [
        id,
        width,
        height,
      ]),
      [
        ['task:a', COMPACT_TASK_NODE_SIZE.width, COMPACT_TASK_NODE_SIZE.height],
        ['task:b', COMPACT_TASK_NODE_SIZE.width, COMPACT_TASK_NODE_SIZE.height],
        [
          'milestone:m',
          COMPACT_MILESTONE_NODE_SIZE.width,
          COMPACT_MILESTONE_NODE_SIZE.height,
        ],
      ],
    );

    const compact = fromElkGraph(
      compactInput,
      await layoutWithElk(toElkGraph(compactInput)),
    );

    const standardInput = layoutInput(graph, 'down', 'standard');

    const standard = fromElkGraph(
      standardInput,
      await layoutWithElk(toElkGraph(standardInput)),
    );

    const spanOf = (layout: typeof compact): number =>
      (layout.nodes.at(-1)?.y ?? Number.NaN) - (layout.nodes[0]?.y ?? 0);

    assert.isBelow(spanOf(compact), spanOf(standard));

    assert.deepStrictEqual(
      compact.nodes.map(({ width, height }) => ({ width, height })),
      compactInput.nodes.map(({ width, height }) => ({ width, height })),
    );
  });

  test('lays out nothing as nothing', async () => {
    const input = layoutInput(
      buildDependencyGraph({ tasks: [], milestones: [] }),
      'right',
      'standard',
    );

    const layout = fromElkGraph(input, await layoutWithElk(toElkGraph(input)));

    assert.deepStrictEqual(layout.nodes, []);

    assert.deepStrictEqual(layout.edges, []);
  });
});

describe(labelSize, () => {
  test('grows with the text, wide characters counting double', () => {
    assert.isBelow(labelSize('SS').width, labelSize('SS +3日').width);

    assert.strictEqual(labelSize('SS').height, labelSize('+1日').height);
  });
});
