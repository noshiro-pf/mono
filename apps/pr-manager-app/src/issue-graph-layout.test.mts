import { Arr } from 'ts-data-forge';
import {
  assignColumns,
  connectedGroups,
  countCrossings,
  defaultPlacement,
  layoutConnected,
  layoutIssueGraph,
  levelColumn,
  NODE_HEIGHT,
  NODE_WIDTH,
  placeGrid,
  placementsFor,
  PRIORITY_OVERHANG,
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

    // Clear of the priority pill over the first row, descenders included.
    assert.isTrue(grid.every(({ y }) => y - PRIORITY_OVERHANG - label.y >= 4));

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

describe(placeGrid, () => {
  test('is the layout drawn by default when handed the default placement', () => {
    const issues = graph([1, 2, 3, 4, 5, 6], [edge(1, 2)]);

    const parts = layoutConnected(issues);

    assert.deepStrictEqual(
      placeGrid(parts, defaultPlacement(parts)),
      layoutIssueGraph(issues),
    );
  });

  test('lays the grid out as many to a row as it is told', () => {
    const parts = layoutConnected(graph([1, 2, 3, 4, 5, 6], [edge(1, 2)]));

    const layout = placeGrid(parts, { columns: 2, side: 'under' });

    const grid = layout.nodes.filter(({ number }) => number > 2);

    assert.deepStrictEqual(
      grid.map(({ y }) => y === grid[0]?.y),
      [true, true, false, false],
    );

    assert.strictEqual(Arr.uniq(grid.map(({ x }) => x)).length, 2);
  });

  test('beside the connected parts, puts the grid and its label to their right, from the top', () => {
    const parts = layoutConnected(graph([1, 2, 3, 4, 5, 6], [edge(1, 2)]));

    const layout = placeGrid(parts, { columns: 1, side: 'beside' });

    const connectedRight = Math.max(
      ...layout.nodes
        .filter(({ number }) => number <= 2)
        .map(({ x }) => x + NODE_WIDTH),
    );

    const grid = layout.nodes.filter(({ number }) => number > 2);

    const label = layout.unconnectedLabel;

    assert.isDefined(label);

    assert.isTrue(grid.every(({ x }) => x === label.x));

    assert.isTrue(label.x > connectedRight);

    // Level with the top of the connected parts, as the label under them
    // is with the space under them.
    assert.strictEqual(
      Math.min(...grid.map(({ y }) => y)),
      Math.min(...layout.nodes.map(({ y }) => y)) + 31,
    );

    assert.isTrue(label.y < Math.min(...grid.map(({ y }) => y)));

    assert.strictEqual(
      layout.width,
      Math.max(...layout.nodes.map(({ x }) => x)) + NODE_WIDTH + 16,
    );

    assert.strictEqual(
      layout.height,
      Math.max(...layout.nodes.map(({ y }) => y)) + NODE_HEIGHT + 16,
    );
  });
});

describe('placeGrid around the connected parts', () => {
  // One issue four wait for: a part two columns wide and four rows tall.
  const fan = graph(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    [edge(1, 2), edge(1, 3), edge(1, 4), edge(1, 5)],
  );

  test('fills the columns to the right of the parts first, then goes on under them, in the same columns', () => {
    const parts = layoutConnected(fan);

    const layout = placeGrid(parts, { columns: 4, side: 'around' });

    const connected = layout.nodes.filter(({ number }) => number <= 5);

    const grid = layout.nodes.filter(({ number }) => number > 5);

    const connectedRight = Math.max(
      ...connected.map(({ x }) => x + NODE_WIDTH),
    );

    const connectedBottom = Math.max(
      ...connected.map(({ y }) => y + NODE_HEIGHT),
    );

    const [first, second, third] = grid;

    assert.isDefined(first);

    assert.isDefined(second);

    assert.isDefined(third);

    // Two to a row beside the part, from its top.
    assert.isTrue(first.x > connectedRight);

    assert.strictEqual(second.y, first.y);

    assert.isBelow(first.y, connectedBottom);

    const beside = grid.filter(({ y }) => y < connectedBottom);

    const under = grid.filter(({ y }) => y >= connectedBottom);

    assert.isTrue(Arr.isNonEmpty(under));

    assert.isTrue(beside.every(({ x }) => x > connectedRight));

    assert.isTrue(beside.every(({ y }) => y + NODE_HEIGHT <= connectedBottom));

    // Under them, from the left edge of the drawing.
    assert.strictEqual(Math.min(...under.map(({ x }) => x)), 16);

    // One set of columns for both.
    assert.strictEqual(Arr.uniq(grid.map(({ x }) => x)).length, 4);

    // Nothing drawn over anything else.
    assert.isTrue(
      layout.nodes.every((a, ia) =>
        layout.nodes.every(
          (b, ib) =>
            ia === ib ||
            Math.abs(a.x - b.x) >= NODE_WIDTH ||
            Math.abs(a.y - b.y) >= NODE_HEIGHT,
        ),
      ),
    );
  });

  test('is offered for a part tall enough, and is the grid under it when there is no column to its right', () => {
    const parts = layoutConnected(fan);

    assert.isTrue(placementsFor(parts).some(({ side }) => side === 'around'));

    assert.deepStrictEqual(
      placeGrid(parts, { columns: 2, side: 'around' }),
      placeGrid(parts, { columns: 2, side: 'under' }),
    );
  });
});

describe(placementsFor, () => {
  test('starts with the default, and offers every width of grid, under and beside', () => {
    const parts = layoutConnected(graph([1, 2, 3, 4, 5], [edge(1, 2)]));

    const placements = placementsFor(parts);

    assert.deepStrictEqual(placements[0], defaultPlacement(parts));

    assert.strictEqual(placements.length, 6);

    assert.strictEqual(
      Arr.uniq(placements.map((p) => JSON.stringify(p))).length,
      6,
    );
  });

  test('offers nothing beside or around when nothing is connected, and only the default when nothing is not', () => {
    assert.isTrue(
      placementsFor(layoutConnected(graph([1, 2, 3], []))).every(
        ({ side }) => side === 'under',
      ),
    );

    assert.strictEqual(
      placementsFor(layoutConnected(graph([1, 2], [edge(1, 2)]))).length,
      1,
    );
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
      priority: 'none',
    })),
    edges,
  }) as const;
