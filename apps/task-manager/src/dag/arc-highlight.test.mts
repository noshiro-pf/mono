import { arcHighlight, highlightOf } from './arc-highlight.mjs';

const edges = [
  { id: 'ab', from: 'task:a', to: 'task:b' },
  { id: 'bc', from: 'task:b', to: 'task:c' },
  { id: 'cd', from: 'task:c', to: 'task:d' },
] as const;

describe(arcHighlight, () => {
  test('is nothing while nothing is pointed at', () => {
    assert.isUndefined(arcHighlight(undefined, edges));
  });

  test('is the node, its arcs both ways, and the nodes at their other ends', () => {
    const highlight = arcHighlight('task:b', edges);

    assert.deepStrictEqual(
      highlight?.nodes,
      new Set(['task:b', 'task:a', 'task:c']),
    );

    assert.deepStrictEqual(highlight?.edges, new Set(['ab', 'bc']));
  });

  test('is the node alone when it has no arcs', () => {
    const highlight = arcHighlight('task:z', edges);

    assert.deepStrictEqual(highlight?.nodes, new Set(['task:z']));

    assert.strictEqual(highlight?.edges.size, 0);
  });
});

describe(highlightOf, () => {
  test('is none without a highlight, on in it and dim outside it', () => {
    const highlight = arcHighlight('task:a', edges);

    assert.strictEqual(highlightOf(undefined, 'task:a'), 'none');

    assert.strictEqual(highlightOf(highlight?.nodes, 'task:b'), 'on');

    assert.strictEqual(highlightOf(highlight?.nodes, 'task:c'), 'dim');

    assert.strictEqual(highlightOf(highlight?.edges, 'ab'), 'on');

    assert.strictEqual(highlightOf(highlight?.edges, 'cd'), 'dim');
  });
});
