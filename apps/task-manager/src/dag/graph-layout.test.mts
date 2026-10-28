import { Arr } from 'ts-data-forge';
import {
  asGroupId,
  asMilestoneId,
  asTaskId,
  buildDependencyGraph,
  createMilestone,
  createTask,
  type DomainState,
  type GraphNodeId,
} from '../domain/index.mjs';
import { DAY_MS, nodeSizes } from '../view-model/index.mjs';
import { PLACEMENT_GAP, type Bounds } from './dag-layout.mjs';
import { layoutWithElk } from './elk.mjs';
import {
  clearOfFrames,
  COMPACT_MILESTONE_NODE_SIZE,
  COMPACT_TASK_NODE_SIZE,
  dagDirections,
  edgeLabel,
  fromElkGraph,
  labelSize,
  LARGE_MILESTONE_NODE_SIZE,
  LARGE_TASK_NODE_SIZE,
  layOutGraph,
  layoutInput,
  layoutKey,
  MILESTONE_NODE_SIZE,
  nodeBoxSize,
  resizeNodes,
  TASK_NODE_SIZE,
  toElkGraph,
  type LaidOutNode,
  type LayoutGroup,
} from './graph-layout.mjs';
import {
  EMPTY_GROUP_SIZE,
  GROUP_HEADER,
  GROUP_PADDING,
} from './group-frames.mjs';

const a = asTaskId('a');

const b = asTaskId('b');

const m = asMilestoneId('m');

const g = asGroupId('g');

const h = asGroupId('h');

/** `elk.spacing.nodeNode`. */
const NODE_SPACING = 28;

/** More than `elk.spacing.edgeLabel`, less than any node. */
const LABEL_ROOM = 8;

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
        {
          id: 'task:b#0',
          from: 'task:a',
          to: 'task:b',
          label: 'SS +3日',
          implied: false,
        },
        {
          id: 'milestone:m#0',
          from: 'task:b',
          to: 'milestone:m',
          label: '',
          implied: false,
        },
      ],
      groups: [],
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

describe('layoutInput, with groups', () => {
  test('keeps each group with the members that are nodes, each in the first group listing it', () => {
    const input = layoutInput(
      buildDependencyGraph(state),
      'right',
      'standard',
      [
        { id: g, members: ['task:a', 'task:gone', 'task:b'] },
        { id: h, members: ['task:b', 'milestone:m'] },
      ],
    );

    assert.deepStrictEqual(input.groups, [
      { id: g, members: ['task:a', 'task:b'] },
      { id: h, members: ['milestone:m'] },
    ]);
  });

  test('changes the key when a node changes group', () => {
    const graph = buildDependencyGraph(state);

    assert.notStrictEqual(
      layoutKey(
        layoutInput(graph, 'right', 'standard', [{ id: g, members: [] }]),
      ),
      layoutKey(
        layoutInput(graph, 'right', 'standard', [
          { id: g, members: ['task:a'] },
        ]),
      ),
    );
  });
});

describe(nodeBoxSize, () => {
  test('is the box of each kind at each size, compact the smaller and large the larger', () => {
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

    assert.deepStrictEqual(nodeBoxSize('task', 'large'), LARGE_TASK_NODE_SIZE);

    assert.deepStrictEqual(
      nodeBoxSize('milestone', 'large'),
      LARGE_MILESTONE_NODE_SIZE,
    );

    for (const kind of ['task', 'milestone'] as const) {
      const standard = nodeBoxSize(kind, 'standard');

      const compact = nodeBoxSize(kind, 'compact');

      assert.isBelow(compact.width, standard.width);

      assert.isBelow(compact.height, standard.height);

      const large = nodeBoxSize(kind, 'large');

      assert.isAbove(large.width, standard.width);

      assert.isAbove(large.height, standard.height);
    }

    // In 「アーク」 the milestones line up on the tasks' right side.
    for (const size of nodeSizes) {
      assert.isAtMost(
        nodeBoxSize('milestone', size).width,
        nodeBoxSize('task', size).width,
      );
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

describe('toElkGraph, with groups', () => {
  test('gives ELK the members of a group one after another, among the other nodes, and an empty group as a box', () => {
    const graph = toElkGraph(
      layoutInput(buildDependencyGraph(state), 'right', 'standard', [
        { id: g, members: ['task:a', 'milestone:m'] },
        { id: h, members: [] },
      ]),
    );

    assert.isUndefined(graph.layoutOptions?.['elk.hierarchyHandling']);

    assert.deepStrictEqual(
      graph.children?.map(({ id, children, width, height }) => [
        id,
        children,
        width,
        height,
      ]),
      [
        ['task:a', undefined, TASK_NODE_SIZE.width, TASK_NODE_SIZE.height],
        [
          'milestone:m',
          undefined,
          MILESTONE_NODE_SIZE.width,
          MILESTONE_NODE_SIZE.height,
        ],
        ['task:b', undefined, TASK_NODE_SIZE.width, TASK_NODE_SIZE.height],
        ['group:h', undefined, EMPTY_GROUP_SIZE.width, EMPTY_GROUP_SIZE.height],
      ],
    );

    assert.deepStrictEqual(
      graph.edges?.map(({ sources, targets }) => [sources, targets]),
      [
        [['task:a'], ['task:b']],
        [['task:b'], ['milestone:m']],
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

  test('places the members of a group where they are in the graph, inside its box', async () => {
    const tasks = Arr.toPushed(
      state.tasks,
      createTask({
        id: asTaskId('c'),
        title: 'C',
        now: 0,
        dependencies: [
          { from: { kind: 'task', id: a }, type: 'finish-to-start', lagMs: 0 },
        ],
      }),
    );

    const input = layoutInput(
      buildDependencyGraph({ ...state, tasks }),
      'right',
      'standard',
      [
        { id: g, members: ['task:a', 'task:c'] },
        { id: h, members: [] },
      ],
    );

    const layout = fromElkGraph(input, await layoutWithElk(toElkGraph(input)));

    const [groupG, groupH] = layout.groups;

    assert.isDefined(groupG);

    assert.isDefined(groupH);

    assert.deepStrictEqual(groupG.members, ['task:a', 'task:c']);

    assert.deepStrictEqual(
      layout.nodes.filter((node) => inside(node, groupG)).map(({ id }) => id),
      ['task:a', 'task:c'],
    );

    const memberA = layout.nodes.find(({ id }) => id === 'task:a');

    assert.isDefined(memberA);

    assert.isAtLeast(memberA.y - groupG.y, GROUP_HEADER);

    assert.deepStrictEqual(
      [groupH.width, groupH.height],
      [EMPTY_GROUP_SIZE.width, EMPTY_GROUP_SIZE.height],
    );
  });

  test.each(dagDirections)(
    'keeps every edge going forward, %s, when a dependency leaves a group and comes back into it',
    async (direction) => {
      // a → b → c → d, with a, c and d in the group and b not: one ELK is
      // given the group of lays its inside out first, and turns an edge back.
      const chain = ['a', 'b', 'c', 'd'] as const;

      const tasks = chain.map((id, index) =>
        createTask({
          id: asTaskId(id),
          title: id,
          now: 0,
          dependencies:
            index === 0
              ? []
              : [
                  {
                    from: {
                      kind: 'task',
                      id: asTaskId(chain[index - 1] ?? id),
                    },
                    type: 'finish-to-start',
                    lagMs: 0,
                  },
                ],
        }),
      );

      const input = layoutInput(
        buildDependencyGraph({ tasks, milestones: [] }),
        direction,
        'standard',
        [{ id: g, members: ['task:a', 'task:c', 'task:d'] }],
      );

      const layout = fromElkGraph(
        input,
        await layoutWithElk(toElkGraph(input)),
      );

      const along = (id: string): number => {
        const node = layout.nodes.find((n) => n.id === id);

        assert.isDefined(node);

        return direction === 'right' ? node.x : node.y;
      };

      assert.isBelow(along('task:a'), along('task:b'));

      assert.isBelow(along('task:b'), along('task:c'));

      assert.isBelow(along('task:c'), along('task:d'));

      const [group] = layout.groups;

      assert.isDefined(group);

      assert.deepStrictEqual(
        layout.nodes
          .filter((node) => overlaps(node, group))
          .map(({ id }) => id),
        ['task:a', 'task:c', 'task:d'],
      );
    },
  );

  test.each(dagDirections)(
    'moves nothing but a neighbor a little, %s, when a node with no dependency goes into a group of its own',
    async (direction) => {
      const tasks = Arr.toPushed(
        state.tasks,
        createTask({ id: asTaskId('z'), title: 'Z', now: 0 }),
      );

      const graph = buildDependencyGraph({ ...state, tasks });

      const nodesWith = async (
        groups: readonly LayoutGroup[],
      ): Promise<readonly LaidOutNode[]> => {
        const input = layoutInput(graph, direction, 'standard', groups);

        return fromElkGraph(input, await layoutWithElk(toElkGraph(input)))
          .nodes;
      };

      const before = await nodesWith([]);

      const after = await nodesWith([{ id: g, members: ['task:z'] }]);

      const across = direction === 'right' ? 'y' : 'x';

      const along = direction === 'right' ? 'x' : 'y';

      assert.deepStrictEqual(
        after.map((node) => node[along]),
        before.map((node) => node[along]),
      );

      // The node put in the group stays; one ELK put close by moves out of
      // the way of the frame round it, by no more than the frame's room.
      assert.deepStrictEqual(
        after.find(({ id }) => id === 'task:z'),
        before.find(({ id }) => id === 'task:z'),
      );

      for (const [index, node] of after.entries()) {
        const moved = node[across] - (before[index]?.[across] ?? Number.NaN);

        assert.isAtLeast(moved, 0);

        assert.isAtMost(moved, GROUP_HEADER + PLACEMENT_GAP);
      }
    },
  );

  test.each(dagDirections)(
    'puts the two ends of a labelled edge in adjacent layers, %s, leaving no layer inside a group that holds them',
    async (direction) => {
      // b waits for x, and for a to start with a lag: given a layer of its
      // own, the label made one between a and b, which x went into, and x,
      // moved out of the frame round a and b, left that layer empty.
      const x = asTaskId('x');

      const nodesWith = async (
        type: 'finish-to-start' | 'start-to-start',
        lagMs: number,
      ): Promise<readonly LaidOutNode[]> => {
        const tasks = [
          createTask({ id: x, title: 'X', now: 0 }),
          createTask({ id: a, title: 'A', now: 0 }),
          createTask({
            id: b,
            title: 'B',
            now: 0,
            dependencies: [
              {
                from: { kind: 'task', id: x },
                type: 'finish-to-start',
                lagMs: 0,
              },
              { from: { kind: 'task', id: a }, type, lagMs },
            ],
          }),
        ] as const;

        const input = layoutInput(
          buildDependencyGraph({ tasks, milestones: [] }),
          direction,
          'standard',
          [{ id: g, members: ['task:a', 'task:b'] }],
        );

        return fromElkGraph(input, await layoutWithElk(toElkGraph(input)))
          .nodes;
      };

      const along = direction === 'right' ? 'x' : 'y';

      const alongSize = direction === 'right' ? 'width' : 'height';

      const gapBetweenAAndB = (nodes: readonly LaidOutNode[]): number => {
        const [, nodeA, nodeB] = nodes;

        assert.isDefined(nodeA);

        assert.isDefined(nodeB);

        return nodeB[along] - (nodeA[along] + nodeA[alongSize]);
      };

      const unlabelled = gapBetweenAAndB(await nodesWith('finish-to-start', 0));

      const labelled = gapBetweenAAndB(
        await nodesWith('start-to-start', 3 * DAY_MS),
      );

      // Wider by the label, and the little room ELK keeps round it.
      assert.isAbove(labelled, unlabelled);

      assert.isAtMost(
        labelled,
        unlabelled + labelSize('SS +3日')[alongSize] + LABEL_ROOM,
      );
    },
  );

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

describe(layOutGraph, () => {
  // p and q depend on nothing and s on r, all in the group; u, v and w
  // depend on nothing, and z on y, in none.
  const tasks = [
    ['p'],
    ['q'],
    ['u'],
    ['v'],
    ['r'],
    ['s', 'r'],
    ['w'],
    ['y'],
    ['z', 'y'],
  ] as const satisfies readonly (readonly [string, string?])[];

  const graph = buildDependencyGraph({
    tasks: tasks.map(([id, from]: readonly [string, string?]) =>
      createTask({
        id: asTaskId(id),
        title: id,
        now: 0,
        dependencies:
          from === undefined
            ? []
            : [
                {
                  from: { kind: 'task', id: asTaskId(from) },
                  type: 'finish-to-start',
                  lagMs: 0,
                },
              ],
      }),
    ),
    milestones: [],
  });

  const members: readonly GraphNodeId[] = [
    'task:p',
    'task:q',
    'task:r',
    'task:s',
  ] as const;

  test.each(dagDirections)(
    'makes the frame of a group of nodes no edge joins no larger, %s, than its members laid out alone',
    async (direction) => {
      const input = layoutInput(graph, direction, 'standard', [
        { id: g, members },
      ]);

      const layout = await layOutGraph(input, layoutWithElk);

      const [group] = layout.groups;

      assert.isDefined(group);

      assert.deepStrictEqual(
        layout.nodes
          .filter((node) => overlaps(node, group))
          .map(({ id }) => id),
        Array.from(members),
      );

      // Without the other nodes, there is nothing to move out of the frame.
      const alone = layoutInput(
        {
          nodes: graph.nodes.filter(({ id }) => members.includes(id)),
          edges: graph.edges.filter(({ to }) => members.includes(to)),
        },
        direction,
        'standard',
        [{ id: g, members }],
      );

      const [groupAlone] = fromElkGraph(
        alone,
        await layoutWithElk(toElkGraph(alone)),
      ).groups;

      assert.deepStrictEqual(
        [group.width, group.height],
        [groupAlone?.width, groupAlone?.height],
      );

      // And every node clear of every other.
      for (const [index, node] of layout.nodes.entries()) {
        for (const other of layout.nodes.slice(index + 1)) {
          assert.isFalse(overlaps(node, other));
        }
      }
    },
  );

  test.each(dagDirections)(
    'lays out as ELK does at once, %s, when no group holds nodes no edge joins',
    async (direction) => {
      const input = layoutInput(graph, direction, 'standard', [
        { id: g, members: ['task:r', 'task:s'] },
        { id: h, members: [] },
      ]);

      assert.deepStrictEqual(
        await layOutGraph(input, layoutWithElk),
        fromElkGraph(input, await layoutWithElk(toElkGraph(input))),
      );
    },
  );
});

describe('layOutGraph, with a dependency between groups', () => {
  test.each(dagDirections)(
    'leaves no band inside a group, %s, where a member waits for a node in the middle of another group',
    async (direction) => {
      // Three chains in g, the middle one waiting for s in h; h holds s and
      // n, which nothing joins: s goes where it is waited for, in the
      // middle of g, and n where ELK puts what nothing joins, apart.
      const chains = [
        ['a1', 'a2', 'a3', 'a4'],
        ['b1', 'b2', 'b3', 'b4'],
        ['c1', 'c2', 'c3', 'c4'],
      ] as const;

      const tasks = [
        ...chains.flatMap((chain) =>
          chain.map((id, index) =>
            createTask({
              id: asTaskId(id),
              title: id,
              now: 0,
              dependencies: [
                ...(index === 0 ? [] : [chain[index - 1] ?? id]),
                ...(id === 'b3' ? ['s'] : []),
              ].map((from) => ({
                from: { kind: 'task', id: asTaskId(from) },
                type: 'finish-to-start',
                lagMs: 0,
              })),
            }),
          ),
        ),
        createTask({ id: asTaskId('s'), title: 's', now: 0 }),
        createTask({ id: asTaskId('n'), title: 'n', now: 0 }),
      ] as const;

      const input = layoutInput(
        buildDependencyGraph({ tasks, milestones: [] }),
        direction,
        'standard',
        [
          {
            id: g,
            members: chains.flatMap((chain) =>
              chain.map((id): GraphNodeId => `task:${id}`),
            ),
          },
          { id: h, members: ['task:n', 'task:s'] },
        ],
      );

      const layout = await layOutGraph(input, layoutWithElk);

      const groupH = layout.groups.find(({ id }) => id === h);

      assert.isDefined(groupH);

      const acrossSize = direction === 'right' ? 'height' : 'width';

      // No larger across than two nodes, one band apart.
      assert.isAtMost(
        groupH[acrossSize],
        2 * TASK_NODE_SIZE[acrossSize] +
          NODE_SPACING +
          GROUP_HEADER +
          GROUP_PADDING,
      );

      for (const [index, node] of layout.nodes.entries()) {
        for (const other of layout.nodes.slice(index + 1)) {
          assert.isFalse(overlaps(node, other));
        }
      }

      for (const group of layout.groups) {
        assert.deepStrictEqual(
          layout.nodes
            .filter((node) => overlaps(node, group))
            .map(({ id }) => id)
            .toSorted(),
          group.members.toSorted(),
        );
      }
    },
  );
});

describe(labelSize, () => {
  test('grows with the text, wide characters counting double', () => {
    assert.isBelow(labelSize('SS').width, labelSize('SS +3日').width);

    assert.strictEqual(labelSize('SS').height, labelSize('+1日').height);
  });
});

describe(clearOfFrames, () => {
  const box = (id: string, x: number, y: number): LaidOutNode =>
    ({
      id: `task:${id}`,
      kind: 'task',
      x,
      y,
      ...TASK_NODE_SIZE,
    }) as const;

  // Two members in a column with a node between them, and one node below.
  const layout = {
    nodes: [
      box('a', 0, 0),
      box('b', 0, 100),
      box('c', 0, 200),
      box('d', 0, 300),
      box('e', 400, 100),
    ],
    edges: [],
    groups: [
      { id: g, members: ['task:a', 'task:c'], x: 0, y: 0, width: 0, height: 0 },
    ],
  } as const;

  test('draws the members together, moves what is between them past the frame, and leaves what is clear of it', () => {
    const moved = clearOfFrames('right', layout);

    const [group] = moved.groups;

    assert.isDefined(group);

    // c up to as close below a as ELK puts two nodes of a layer, and the
    // frame round them: b's place between them is not left empty.
    const nodeC = TASK_NODE_SIZE.height + NODE_SPACING;

    assert.deepStrictEqual(group, {
      id: g,
      members: ['task:a', 'task:c'],
      x: -GROUP_PADDING,
      y: -GROUP_HEADER,
      width: TASK_NODE_SIZE.width + 2 * GROUP_PADDING,
      height: nodeC + TASK_NODE_SIZE.height + GROUP_HEADER + GROUP_PADDING,
    });

    const [nodeA, nodeB, movedC, nodeD, nodeE] = moved.nodes;

    const below = group.y + group.height + PLACEMENT_GAP;

    assert.deepStrictEqual(
      [nodeA, movedC].map((node) => [node?.x, node?.y]),
      [
        [0, 0],
        [0, nodeC],
      ],
    );

    // Down past the frame; d is below that already, and stays.
    assert.deepStrictEqual([nodeB?.x, nodeB?.y], [0, below]);

    assert.isAbove(300, below + TASK_NODE_SIZE.height + PLACEMENT_GAP);

    assert.strictEqual(nodeD, layout.nodes[3]);

    // Nothing in its way, in a layer of its own.
    assert.strictEqual(nodeE, layout.nodes[4]);
  });

  test('draws the bands of members together, and keeps the members of a band where they are in it', () => {
    // a and b side by side in one band, c a little below b in it; d far
    // below, and further along.
    const moved = clearOfFrames('right', {
      nodes: [
        box('a', 0, 0),
        box('b', 240, 10),
        box('c', 480, 40),
        box('d', 720, 500),
      ],
      edges: [],
      groups: [
        {
          id: g,
          members: ['task:a', 'task:b', 'task:c', 'task:d'],
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        },
      ],
    });

    assert.deepStrictEqual(
      moved.nodes.map(({ x, y }) => [x, y]),
      [
        [0, 0],
        [240, 10],
        [480, 40],
        [720, 40 + TASK_NODE_SIZE.height + NODE_SPACING],
      ],
    );
  });

  test('moves to the right when the graph grows down', () => {
    const moved = clearOfFrames('down', {
      ...layout,
      nodes: [box('a', 0, 0), box('b', 100, 0), box('c', 200, 0)],
    });

    const [group] = moved.groups;

    assert.isDefined(group);

    assert.deepStrictEqual(
      moved.nodes.map(({ x, y }) => [x, y]),
      [
        [0, 0],
        [group.x + group.width + PLACEMENT_GAP, 0],
        [200, 0],
      ],
    );
  });

  test('keeps nodes no closer than ELK did, closer than a frame', () => {
    // ELK puts the parts of a graph that no edge joins 20 apart.
    const apart = {
      nodes: [box('a', 0, 0), box('b', 0, TASK_NODE_SIZE.height + 20)],
      edges: [],
      groups: [{ id: h, members: [], x: 400, y: 0, ...EMPTY_GROUP_SIZE }],
    } as const;

    assert.deepStrictEqual(clearOfFrames('right', apart), apart);
  });

  test('moves a group as one, past what comes before it', () => {
    const moved = clearOfFrames('right', {
      nodes: [box('a', 0, 0), box('b', 0, 60), box('c', 0, 100)],
      edges: [],
      groups: [
        {
          id: g,
          members: ['task:b', 'task:c'],
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        },
      ],
    });

    const shift = TASK_NODE_SIZE.height + PLACEMENT_GAP + GROUP_HEADER - 60;

    assert.deepStrictEqual(
      moved.nodes.map(({ y }) => y),
      [0, 60 + shift, 100 + shift],
    );
  });
});

const inside = (node: Bounds, frame: Bounds): boolean =>
  frame.x <= node.x &&
  frame.y <= node.y &&
  node.x + node.width <= frame.x + frame.width &&
  node.y + node.height <= frame.y + frame.height;

const overlaps = (node: Bounds, frame: Bounds): boolean =>
  node.x < frame.x + frame.width &&
  frame.x < node.x + node.width &&
  node.y < frame.y + frame.height &&
  frame.y < node.y + node.height;
