import {
  assignColumns,
  connectedGroups,
  countCrossings,
  layoutIssueGraph,
  levelColumn,
  NODE_HEIGHT,
  NODE_WIDTH,
} from './issue-graph-layout.mjs';
import type { IssueGraph, IssueGraphEdge } from './issue-graph.mjs';

describe(assignColumns, () => {
  test('puts each node one past the furthest of what it waits for', () => {
    assert.deepStrictEqual(
      assignColumns([1, 2, 3], [edge(1, 2), edge(2, 3), edge(1, 3)]),
      new Map([
        [1, 0],
        [2, 1],
        [3, 2],
      ]),
    );
  });

  test('moves a node that only leads to something late beside it', () => {
    const columns = assignColumns(
      [1, 2, 3, 4],
      [edge(1, 2), edge(2, 3), edge(4, 3)],
    );

    assert.strictEqual(columns.get(4), 1);
  });

  test('turns round an edge that runs back on a cycle', () => {
    const columns = assignColumns([1, 2], [edge(1, 2), edge(2, 1)]);

    assert.deepStrictEqual([columns.get(1), columns.get(2)], [0, 1]);
  });
});

describe(connectedGroups, () => {
  test('groups by edges read both ways, largest first, then lowest number', () => {
    assert.deepStrictEqual(
      connectedGroups([9, 1, 2, 3, 4, 5], [edge(2, 1), edge(4, 3), edge(5, 3)]),
      [[3, 4, 5], [1, 2], [9]],
    );
  });
});

describe(countCrossings, () => {
  test('counts the pairs whose ends are in opposite orders', () => {
    assert.strictEqual(
      countCrossings([
        { from: 0, to: 1 },
        { from: 1, to: 0 },
        { from: 2, to: 2 },
      ]),
      1,
    );
  });
});

describe(levelColumn, () => {
  test('puts each where it is wanted when nothing overlaps', () => {
    assert.deepStrictEqual(
      levelColumn(
        [
          { wanted: 0, height: 10, weight: 1 },
          { wanted: 40, height: 10, weight: 1 },
        ],
        5,
      ),
      [0, 40],
    );
  });

  test('moves two that want the same place apart, around it', () => {
    assert.deepStrictEqual(
      levelColumn(
        [
          { wanted: 20, height: 10, weight: 1 },
          { wanted: 20, height: 10, weight: 1 },
        ],
        10,
      ),
      [10, 30],
    );
  });

  test('keeps the order, and lets the heavier one stay nearer its place', () => {
    assert.deepStrictEqual(
      levelColumn(
        [
          { wanted: 30, height: 10, weight: 3 },
          { wanted: 0, height: 10, weight: 1 },
        ],
        0,
      ),
      [20, 30],
    );
  });
});

describe(layoutIssueGraph, () => {
  test('draws a chain left to right, level, with the edges from box to box', () => {
    const layout = layoutIssueGraph(graph([1, 2, 3], [edge(1, 2), edge(2, 3)]));

    const [a, b, c] = layout.nodes;

    assert.isDefined(a);

    assert.isDefined(b);

    assert.isDefined(c);

    assert.isTrue(a.x < b.x && b.x < c.x);

    assert.isTrue(a.y === b.y && b.y === c.y);

    assert.strictEqual(
      layout.edges[0]?.path,
      `M ${a.x + NODE_WIDTH} ${a.y + NODE_HEIGHT / 2} L ${b.x} ${b.y + NODE_HEIGHT / 2}`,
    );

    assert.isUndefined(layout.unconnectedLabel);
  });

  test('draws an edge that skips a column straight through it, clear of the node there', () => {
    const layout = layoutIssueGraph(
      graph([1, 2, 3], [edge(1, 2), edge(2, 3), edge(1, 3)]),
    );

    const byNumber = new Map(layout.nodes.map((node) => [node.number, node]));

    const two = byNumber.get(2);

    const long = layout.edges.find(({ from, to }) => from === 1 && to === 3);

    assert.isDefined(two);

    assert.isDefined(long);

    // The path crosses the middle column at one height, outside node 2.
    const crossing = /L (?<x>\d+) (?<y>\d+)/u.exec(long.path);

    const y = Number(crossing?.groups?.['y']);

    assert.strictEqual(Number(crossing?.groups?.['x']), two.x + NODE_WIDTH);

    assert.isTrue(y < two.y || two.y + NODE_HEIGHT < y);
  });

  test('puts the nodes with no edge in a grid under a label, after the rest', () => {
    const layout = layoutIssueGraph(graph([1, 2, 3, 4, 5, 6], [edge(1, 2)]));

    const label = layout.unconnectedLabel;

    assert.isDefined(label);

    const grid = layout.nodes.filter(({ number }) => number > 2);

    assert.isTrue(grid.every(({ y }) => y > label.y));

    // Three to a row at the least.
    assert.deepStrictEqual(
      grid.map(({ y }) => y === grid[0]?.y),
      [true, true, true, false],
    );
  });

  test('does not draw an edge from a node to itself', () => {
    const layout = layoutIssueGraph(graph([1], [edge(1, 1)]));

    assert.deepStrictEqual(layout.edges, []);

    assert.strictEqual(layout.nodes.length, 1);
  });

  test('draws an edge on a cycle back the way it runs', () => {
    const layout = layoutIssueGraph(graph([1, 2], [edge(1, 2), edge(2, 1)]));

    const back = layout.edges.find(({ from }) => from === 2);

    const two = layout.nodes.find(({ number }) => number === 2);

    assert.isDefined(back);

    assert.isDefined(two);

    // It leaves 2 from its left side, toward 1.
    assert.isTrue(back.path.startsWith(`M ${two.x} `));
  });
});

const edge = (from: number, to: number): IssueGraphEdge =>
  ({ from, to, kind: 'start-after', settled: false }) as const;

const graph = (
  numbers: readonly number[],
  edges: readonly IssueGraphEdge[],
): IssueGraph =>
  ({
    nodes: numbers.map((number) => ({
      number,
      kind: 'issue',
      title: `Issue ${number}`,
      url: `https://github.com/o/r/issues/${number}`,
      state: 'free',
    })),
    edges,
  }) as const;
