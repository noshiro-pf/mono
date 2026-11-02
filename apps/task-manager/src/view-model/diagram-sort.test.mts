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

  test('is title ascending for what is not a list', () => {
    for (const stored of [
      '',
      'not json',
      '{}',
      '"title"',
      '{"sort":[{"key":"title","order":"desc"}],"hideDone":false}',
    ]) {
      assert.deepStrictEqual(
        diagramSortStorage.parse(stored),
        DEFAULT_DIAGRAM_SORT,
      );
    }
  });

  test('is title ascending for a list of nothing but broken entries', () => {
    for (const stored of [
      '[{"key":"colour","order":"asc"}]',
      '[{"key":"title","order":"up"}]',
      '[{"key":"title"}]',
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
  test('keeps the keys that are fine and drops the rest', () => {
    assert.deepStrictEqual(
      diagramSortStorage.parse(
        '[{"key":"colour","order":"desc"},{"key":"priority","order":"desc"},{"key":"status","order":"sideways"},3]',
      ),
      [{ key: 'priority', order: 'desc' }],
    );
  });

  test('drops an unknown key rather than turning it into title', () => {
    assert.deepStrictEqual(
      diagramSortStorage.parse(
        '[{"key":"colour","order":"desc"},{"key":"title","order":"asc"}]',
      ),
      [{ key: 'title', order: 'asc' }],
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
