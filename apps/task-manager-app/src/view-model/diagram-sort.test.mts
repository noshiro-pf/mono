import {
  DEFAULT_DIAGRAM_SORT,
  effectiveDiagramSort,
  parseDiagramSort,
  serializeDiagramSort,
} from './diagram-sort.mjs';

describe(parseDiagramSort, () => {
  test('round-trips with serializeDiagramSort', () => {
    for (const sort of [
      [
        { key: 'priority', order: 'desc' },
        { key: 'title', order: 'asc' },
      ],
      [{ key: 'status', order: 'asc' }],
      [],
    ] as const) {
      assert.deepStrictEqual(
        parseDiagramSort(serializeDiagramSort(sort)),
        sort,
      );
    }
  });

  test('is title ascending for nothing stored', () => {
    assert.deepStrictEqual(parseDiagramSort(null), [
      { key: 'title', order: 'asc' },
    ]);

    assert.deepStrictEqual(DEFAULT_DIAGRAM_SORT, [
      { key: 'title', order: 'asc' },
    ]);
  });

  test('is title ascending for what is not a sort', () => {
    for (const stored of [
      '',
      'not json',
      '{}',
      '"title"',
      '[{"key":"colour","order":"asc"}]',
      '[{"key":"title","order":"up"}]',
      '[{"key":"title"}]',
      '{"sort":[{"key":"title","order":"desc"}],"hideDone":false}',
    ]) {
      assert.deepStrictEqual(parseDiagramSort(stored), DEFAULT_DIAGRAM_SORT);
    }
  });

  test('keeps the first of a key that is repeated', () => {
    assert.deepStrictEqual(
      parseDiagramSort(
        '[{"key":"title","order":"desc"},{"key":"title","order":"asc"}]',
      ),
      [{ key: 'title', order: 'desc' }],
    );
  });
});

describe(effectiveDiagramSort, () => {
  test('is the keys given', () => {
    const sort = [{ key: 'priority', order: 'desc' }] as const;

    assert.deepStrictEqual(effectiveDiagramSort(sort), sort);
  });

  test('falls back to title ascending for no keys', () => {
    assert.deepStrictEqual(effectiveDiagramSort([]), DEFAULT_DIAGRAM_SORT);
  });
});
