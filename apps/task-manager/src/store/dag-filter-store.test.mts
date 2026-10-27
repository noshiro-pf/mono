import { asGroupId } from '../domain/index.mjs';
import { NO_DAG_FILTER } from '../view-model/index.mjs';
import { createDagFilterStore } from './dag-filter-store.mjs';

describe(createDagFilterStore, () => {
  test('starts from the filter read', () => {
    const initial = { groups: [asGroupId('g1')], labels: [] } as const;

    const store = createDagFilterStore({ initial });

    assert.deepStrictEqual(store.filter.getSnapshot().value, initial);
  });

  test('chooses groups and labels, and takes them out', () => {
    const store = createDagFilterStore({ initial: NO_DAG_FILTER });

    store.toggleGroup(asGroupId('g1'));

    store.toggleGroup(undefined);

    store.toggleLabel('ui');

    assert.deepStrictEqual(store.filter.getSnapshot().value, {
      groups: [asGroupId('g1'), undefined],
      labels: ['ui'],
    });

    store.toggleGroup(asGroupId('g1'));

    store.toggleLabel('ui');

    assert.deepStrictEqual(store.filter.getSnapshot().value, {
      groups: [undefined],
      labels: [],
    });
  });

  test('clears every choice', () => {
    const store = createDagFilterStore({
      initial: { groups: [undefined], labels: ['ui'] },
    });

    store.clear();

    assert.deepStrictEqual(store.filter.getSnapshot().value, NO_DAG_FILTER);
  });
});
