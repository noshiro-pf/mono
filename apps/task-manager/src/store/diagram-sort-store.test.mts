import { Optional } from 'ts-data-forge';
import type { SortSpec } from '../domain/index.mjs';
import { DEFAULT_DIAGRAM_SORT } from '../view-model/index.mjs';
import { createDiagramSortStore } from './diagram-sort-store.mjs';

const setup = (
  initial: readonly SortSpec[] = DEFAULT_DIAGRAM_SORT,
): Readonly<{
  store: ReturnType<typeof createDiagramSortStore>;
  saved: readonly (readonly SortSpec[])[];
}> => {
  const mut_saved: (readonly SortSpec[])[] = [];

  const store = createDiagramSortStore({
    initial,
    save: (sort) => {
      mut_saved.push(sort);
    },
  });

  store.start();

  return { store, saved: mut_saved };
};

describe(createDiagramSortStore, () => {
  test('starts from the order read', () => {
    const initial = [{ key: 'priority', order: 'desc' }] as const;

    const { store } = setup(initial);

    assert.deepStrictEqual(Optional.unwrap(store.sort.getSnapshot()), initial);
  });

  test('edits the keys', () => {
    const { store } = setup();

    store.addKey('priority');

    store.toggleOrder(1);

    store.moveKey(1, -1);

    store.addKey('status');

    store.moveKey(2, -1);

    store.removeKey(2);

    assert.deepStrictEqual(Optional.unwrap(store.sort.getSnapshot()), [
      { key: 'priority', order: 'desc' },
      { key: 'status', order: 'asc' },
    ]);
  });

  test('does not add a key twice', () => {
    const { store } = setup();

    store.addKey('title');

    assert.deepStrictEqual(
      Optional.unwrap(store.sort.getSnapshot()),
      DEFAULT_DIAGRAM_SORT,
    );
  });

  test('may be left with no keys', () => {
    const { store } = setup();

    store.removeKey(0);

    assert.deepStrictEqual(Optional.unwrap(store.sort.getSnapshot()), []);
  });

  test('saves every change', () => {
    const { store, saved } = setup();

    store.addKey('dueDate');

    store.removeKey(0);

    assert.deepStrictEqual(saved, [
      DEFAULT_DIAGRAM_SORT,
      [
        { key: 'title', order: 'asc' },
        { key: 'dueDate', order: 'asc' },
      ],
      [{ key: 'dueDate', order: 'asc' }],
    ]);
  });
});
