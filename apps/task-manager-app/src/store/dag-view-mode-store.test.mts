import type { DagViewMode } from '../view-model/index.mjs';
import { createDagViewModeStore } from './dag-view-mode-store.mjs';

const setup = (
  initial: DagViewMode,
): Readonly<{
  store: ReturnType<typeof createDagViewModeStore>;
  saved: readonly DagViewMode[];
}> => {
  const mut_saved: DagViewMode[] = [];

  const store = createDagViewModeStore({
    initial,
    save: (mode) => {
      mut_saved.push(mode);
    },
  });

  store.start();

  return { store, saved: mut_saved };
};

describe(createDagViewModeStore, () => {
  test('starts from the mode read', () => {
    const { store } = setup('arc');

    assert.strictEqual(store.mode.getSnapshot().value, 'arc');
  });

  test('saves every change', () => {
    const { store, saved } = setup('dag');

    store.set('arc');

    store.set('dag');

    assert.deepStrictEqual(saved, ['dag', 'arc', 'dag']);

    assert.strictEqual(store.mode.getSnapshot().value, 'dag');
  });
});
