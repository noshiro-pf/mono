import {
  DEFAULT_DIAGRAM_SORT,
  diagramSortStorage,
  effectiveDiagramSort,
} from './diagram-sort.mjs';

describe(diagramSortStorage.parse, () => {
  test('round-trips with serialize', () => {
    for (const sort of [
      [
        { key: 'priority', order: 'desc' },
        { key: 'title', order: 'asc' },
      ],
      [{ key: 'status', order: 'asc' }],
      [],
    ] as const) {
      assert.deepStrictEqual(
        diagramSortStorage.parse(diagramSortStorage.serialize(sort)),
        sort,
      );
    }
  });

  test('is title ascending for nothing stored', () => {
    assert.deepStrictEqual(diagramSortStorage.parse(null), [
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
      assert.deepStrictEqual(
        diagramSortStorage.parse(stored),
        DEFAULT_DIAGRAM_SORT,
      );
    }
  });

  test('keeps the first of a key that is repeated', () => {
    assert.deepStrictEqual(
      diagramSortStorage.parse(
        '[{"key":"title","order":"desc"},{"key":"title","order":"asc"}]',
      ),
      [{ key: 'title', order: 'desc' }],
    );
  });
});

describe('a partly broken diagram sort', () => {
  test('keeps the keys that are fine and repairs the rest field by field', () => {
    assert.deepStrictEqual(
      diagramSortStorage.parse(
        '[{"key":"priority","order":"desc"},{"key":"status","order":"sideways"}]',
      ),
      [
        { key: 'priority', order: 'desc' },
        { key: 'status', order: 'asc' },
      ],
    );
  });

  test('repairs an entry that is not a sort key to title ascending', () => {
    assert.deepStrictEqual(
      diagramSortStorage.parse('[{"key":"priority","order":"desc"},3]'),
      [
        { key: 'priority', order: 'desc' },
        { key: 'title', order: 'asc' },
      ],
    );
  });
});

describe('the stored diagram sort', () => {
  test('keeps its key and its JSON, which earlier visits wrote', () => {
    assert.strictEqual(diagramSortStorage.key, 'task-manager-app:diagram-sort');

    assert.strictEqual(
      diagramSortStorage.serialize([{ key: 'priority', order: 'desc' }]),
      '[{"key":"priority","order":"desc"}]',
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
