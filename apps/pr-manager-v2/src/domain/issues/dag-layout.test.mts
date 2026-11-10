import { asPositiveInt, Num } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';
import {
  bestFreeColumns,
  layoutDag,
  NODE_HEIGHT,
  NODE_WIDTH,
} from './dag-layout.mjs';
import type { DagEdge, DagNode, IssueGraph } from './issue-graph.mjs';

describe(layoutDag, () => {
  test('lays a chain left to right, the free nodes in a grid under it', () => {
    const layout = layoutDag(
      graph(
        [1, 2, 3, 9],
        [
          [1, 2],
          [2, 3],
        ],
      ),
    );

    const x = (n: number): number | undefined =>
      layout.nodes.find(({ node }) => node.number === n)?.x;

    assert.deepStrictEqual(
      [x(1), x(2), x(3)],
      [0, NODE_WIDTH + 72, 2 * (NODE_WIDTH + 72)],
    );

    const free = layout.nodes.find(({ node }) => node.number === 9);

    assert.isDefined(layout.freeCaptionY);

    assert.isTrue((free?.y ?? 0) > layout.freeCaptionY);

    assert.strictEqual(layout.edges.length, 2);
  });

  test('is as tall as its lowest node when every node has an edge', () => {
    const layout = layoutDag(graph([1, 2], [[1, 2]]));

    const lowest = Math.max(...layout.nodes.map(({ y }) => y));

    assert.strictEqual(layout.height, lowest + NODE_HEIGHT);
  });

  test('puts the largest part first', () => {
    const layout = layoutDag(
      graph(
        [1, 2, 3, 4, 5],
        [
          [1, 2],
          [3, 4],
          [4, 5],
        ],
      ),
    );

    const y = (n: number): number =>
      layout.nodes.find(({ node }) => node.number === n)?.y ?? -1;

    assert.isTrue(y(3) < y(1));
  });

  test('lays out a cycle', () => {
    const layout = layoutDag(
      graph(
        [1, 2],
        [
          [1, 2],
          [2, 1],
        ],
      ),
    );

    assert.strictEqual(layout.nodes.length, 2);
  });

  test('levels a node with its only neighbor', () => {
    const layout = layoutDag(
      graph(
        [1, 2, 3, 4],
        [
          [1, 3],
          [2, 3],
          [3, 4],
        ],
      ),
    );

    const y = (n: number): number =>
      layout.nodes.find(({ node }) => node.number === n)?.y ?? -1;

    assert.strictEqual(y(4), y(3));
  });
});

describe(bestFreeColumns, () => {
  test('lays free nodes wide in a wide box, and tall in a tall one', () => {
    const nodes = graph([1, 2, 3, 4, 5, 6, 7, 8], []);

    assert.isTrue(
      (bestFreeColumns(nodes, 2000, 200) ?? 0) >
        (bestFreeColumns(nodes, 300, 2000) ?? 0),
    );
  });

  test('picks the count whose full layout draws largest', () => {
    const mixed = graph(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      [
        [1, 2],
        [2, 3],
        [1, 4],
      ],
    );

    const scale = (columns: number): number => {
      const { width, height } = layoutDag(mixed, columns);

      return Math.min(
        Num.div(900, asPositiveInt(Math.ceil(width))),
        Num.div(500, asPositiveInt(Math.ceil(height))),
      );
    };

    const best = bestFreeColumns(mixed, 900, 500);

    assert.isDefined(best);

    for (const columns of [1, 2, 3, 4, 5, 6, 7]) {
      assert.isAtLeast(scale(best), scale(columns));
    }
  });
});

const issueNode = (number: number): DagNode =>
  ({
    id: `i${number}`,
    kind: 'issue',
    number,
    title: `#${number}`,
    url: '',
    state: 'free',
    pill: undefined,
    faint: false,
    claim: undefined,
    extra: false,
  }) as const;

const graph = (
  numbers: readonly number[],
  links: readonly FixedLengthTuple<2, number>[],
): IssueGraph =>
  ({
    nodes: numbers.map(issueNode),
    edges: links.map(([from, to]): DagEdge => ({
      from: `i${from}`,
      to: `i${to}`,
      kind: 'waits',
    })),
  }) as const;
