import { Arr, expectType } from 'ts-data-forge';
import type * as t from 'ts-fortress';
import { sortKeys, type SortSpec } from '../domain/index.mjs';
import {
  addSortKey,
  moveSortKey,
  removeSortKey,
  sortKeyActions,
  sortKeyLabels,
  SortSpecCodec,
  toggleSortOrder,
  uniqueSortKeys,
  unusedSortKeys,
} from './sort-edit.mjs';

const sort: readonly SortSpec[] = [
  { key: 'dueDate', order: 'asc' },
  { key: 'priority', order: 'desc' },
] as const;

describe(addSortKey, () => {
  test('appends a key in ascending order', () => {
    assert.deepStrictEqual(
      addSortKey(sort, 'title'),
      Arr.toPushed(sort, { key: 'title', order: 'asc' }),
    );
  });

  test('does nothing for a key already there', () => {
    assert.deepStrictEqual(addSortKey(sort, 'dueDate'), sort);
  });
});

describe(removeSortKey, () => {
  test('removes the key at the index', () => {
    assert.deepStrictEqual(removeSortKey(sort, 0), [
      { key: 'priority', order: 'desc' },
    ]);
  });

  test('may remove the last key', () => {
    assert.deepStrictEqual(removeSortKey(removeSortKey(sort, 0), 0), []);
  });
});

describe(moveSortKey, () => {
  test('swaps a key with the one next to it', () => {
    const swapped = [
      { key: 'priority', order: 'desc' },
      { key: 'dueDate', order: 'asc' },
    ] as const;

    assert.deepStrictEqual(moveSortKey(sort, 1, -1), swapped);

    assert.deepStrictEqual(moveSortKey(sort, 0, 1), swapped);
  });

  test('does nothing past either end', () => {
    assert.deepStrictEqual(moveSortKey(sort, 0, -1), sort);

    assert.deepStrictEqual(moveSortKey(sort, 1, 1), sort);
  });
});

describe(toggleSortOrder, () => {
  test('flips the order of the key at the index', () => {
    assert.deepStrictEqual(toggleSortOrder(sort, 1), [
      { key: 'dueDate', order: 'asc' },
      { key: 'priority', order: 'asc' },
    ]);
  });
});

describe(unusedSortKeys, () => {
  test('lists the keys not in use, in the order of sortKeys', () => {
    assert.deepStrictEqual(unusedSortKeys(sort), [
      'title',
      'status',
      'depth',
      'createdAt',
      'updatedAt',
      'estimate',
    ]);
  });

  test('is every key for none in use', () => {
    assert.deepStrictEqual(unusedSortKeys([]), sortKeys);
  });
});

describe(uniqueSortKeys, () => {
  test('keeps the first of a key that is repeated', () => {
    assert.deepStrictEqual(
      uniqueSortKeys([
        { key: 'title', order: 'desc' },
        { key: 'priority', order: 'asc' },
        { key: 'title', order: 'asc' },
      ]),
      [
        { key: 'title', order: 'desc' },
        { key: 'priority', order: 'asc' },
      ],
    );
  });
});

describe(sortKeyActions, () => {
  test('applies each edit to what the updater holds', () => {
    let mut_sort: readonly SortSpec[] = sort;

    const actions = sortKeyActions((edit) => {
      mut_sort = edit(mut_sort);
    });

    actions.addKey('title');

    assert.deepStrictEqual(
      mut_sort,
      Arr.toPushed(sort, { key: 'title', order: 'asc' }),
    );

    actions.moveKey(2, -1);

    actions.toggleOrder(0);

    actions.removeKey(2);

    assert.deepStrictEqual(mut_sort, [
      { key: 'dueDate', order: 'desc' },
      { key: 'title', order: 'asc' },
    ]);
  });
});

describe('the labels of the keys', () => {
  test('label every key', () => {
    assert.deepStrictEqual(
      sortKeys.map((key) => sortKeyLabels[key]),
      [
        'タイトル',
        '期限',
        '優先度',
        '状態',
        '依存の深さ',
        '作成日時',
        '更新日時',
        '見積',
      ],
    );
  });
});

describe(SortSpecCodec.is, () => {
  test('is the sort key of the domain', () => {
    expectType<t.TypeOf<typeof SortSpecCodec>, SortSpec>('=');

    assert.isTrue(SortSpecCodec.is({ key: 'depth', order: 'desc' }));

    assert.isFalse(SortSpecCodec.is({ key: 'depth', order: 'down' }));

    assert.isFalse(SortSpecCodec.is({ key: 'colour', order: 'asc' }));
  });
});
