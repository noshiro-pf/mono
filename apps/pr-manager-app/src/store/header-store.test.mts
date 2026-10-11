import { createHeaderStore } from './header-store.mjs';

describe(createHeaderStore, () => {
  test('starts unfolded, then takes what was saved, and saves nothing before it has read', async () => {
    const { store, saved, resolveLoad } = setup();

    store.start();

    assert.isFalse(store.folded.getSnapshot().value);

    assert.deepStrictEqual(saved, []);

    resolveLoad(true);

    await settle();

    assert.isTrue(store.folded.getSnapshot().value);

    store.toggle();

    assert.isFalse(store.folded.getSnapshot().value);

    assert.deepStrictEqual(saved.at(-1), false);
  });

  test('a toggle made before the saved value is read is kept, and saved', async () => {
    const { store, saved, resolveLoad } = setup();

    store.start();

    store.toggle();

    resolveLoad(false);

    await settle();

    assert.isTrue(store.folded.getSnapshot().value);

    assert.deepStrictEqual(saved.at(-1), true);
  });

  test('anything saved but a boolean leaves it unfolded', async () => {
    const { store, resolveLoad } = setup();

    store.start();

    resolveLoad('true');

    await settle();

    assert.isFalse(store.folded.getSnapshot().value);
  });

  test('a database that cannot be read leaves it unfolded, and changes are still handed to save', async () => {
    const { store, saved, rejectLoad } = setup();

    store.start();

    rejectLoad();

    await settle();

    assert.isFalse(store.folded.getSnapshot().value);

    store.toggle();

    assert.deepStrictEqual(saved.at(-1), true);
  });

  test('stopped before the read answers, it neither applies nor saves', async () => {
    const { store, saved, resolveLoad } = setup();

    const stopStore = store.start();

    stopStore();

    resolveLoad(true);

    await settle();

    assert.isFalse(store.folded.getSnapshot().value);

    assert.deepStrictEqual(saved, []);
  });
});

const setup = (): Readonly<{
  store: ReturnType<typeof createHeaderStore>;
  saved: readonly boolean[];
  resolveLoad: (stored: unknown) => void;
  rejectLoad: () => void;
}> => {
  const mut_saved: boolean[] = [];

  const { promise, resolve, reject } = Promise.withResolvers<unknown>();

  const store = createHeaderStore({
    load: () => promise,
    save: (folded) => {
      mut_saved.push(folded);
    },
  });

  return {
    store,
    saved: mut_saved,
    resolveLoad: resolve,
    rejectLoad: () => {
      reject(new Error('blocked'));
    },
  };
};

const settle = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};
