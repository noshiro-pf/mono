import { createDagShowDoneStore } from './dag-show-done-store.mjs';

const setup = (
  initial: boolean,
): Readonly<{
  store: ReturnType<typeof createDagShowDoneStore>;
  saved: readonly boolean[];
}> => {
  const mut_saved: boolean[] = [];

  const store = createDagShowDoneStore({
    initial,
    save: (showDone) => {
      mut_saved.push(showDone);
    },
  });

  store.start();

  return { store, saved: mut_saved };
};

describe(createDagShowDoneStore, () => {
  test('starts from the setting read', () => {
    const { store } = setup(true);

    assert.isTrue(store.showDone.getSnapshot().value);
  });

  test('saves every change', () => {
    const { store, saved } = setup(false);

    store.set(true);

    store.set(false);

    assert.deepStrictEqual(saved, [false, true, false]);

    assert.isFalse(store.showDone.getSnapshot().value);
  });
});
