import { DEFAULT_LAYOUT, withColumns, type Layout } from '../layout.mjs';
import { createLayoutStore, type LayoutStore } from './layout-store.mjs';

describe(createLayoutStore, () => {
  test('saves the layout it starts with at once, and a burst of changes once it settles', async () => {
    const { store, saved } = setup(DEFAULT_LAYOUT);

    store.start();

    assert.deepStrictEqual(saved, [DEFAULT_LAYOUT]);

    store.setColumns(2);

    store.setSplit(30);

    store.setHeight('merged', 400);

    assert.strictEqual(saved.length, 1);

    await settle();

    assert.deepStrictEqual(saved, [
      DEFAULT_LAYOUT,
      {
        ...withColumns(DEFAULT_LAYOUT, 2),
        split: 30,
        heights: { merged: 400 },
      },
    ]);
  });

  test('a height drag follows the pointer from where it started', () => {
    const { store } = setup(DEFAULT_LAYOUT);

    store.resizeTo(500);

    assert.deepStrictEqual(store.layout.getSnapshot().value.heights, {});

    store.startResize('open', 100, 300);

    store.resizeTo(160);

    assert.deepStrictEqual(store.layout.getSnapshot().value.heights, {
      open: 360,
    });

    store.endResize();

    store.resizeTo(900);

    assert.isUndefined(store.resizing.getSnapshot().value);

    assert.deepStrictEqual(store.layout.getSnapshot().value.heights, {
      open: 360,
    });
  });

  test('the settings open and close', () => {
    const { store } = setup(DEFAULT_LAYOUT);

    assert.isFalse(store.settingsOpen.getSnapshot().value);

    store.openSettings();

    assert.isTrue(store.settingsOpen.getSnapshot().value);

    store.closeSettings();

    assert.isFalse(store.settingsOpen.getSnapshot().value);
  });

  test('a drag shows where the block would land, and moves it on drop', () => {
    const { store } = setup(DEFAULT_LAYOUT);

    store.startMove('issues');

    store.moveOver({ column: 0, index: 0 });

    assert.deepStrictEqual(store.moving.getSnapshot().value, {
      block: 'issues',
      target: { column: 0, index: 0 },
    });

    store.drop();

    assert.isUndefined(store.moving.getSnapshot().value);

    assert.deepStrictEqual(store.layout.getSnapshot().value.left, [
      'issues',
      'open',
      'merged',
    ]);
  });

  test('a drag dropped nowhere, or cancelled, moves nothing', () => {
    const { store } = setup(DEFAULT_LAYOUT);

    store.startMove('issues');

    store.drop();

    store.startMove('open');

    store.moveOver({ column: 0, index: 3 });

    store.cancelMove();

    assert.deepStrictEqual(store.layout.getSnapshot().value, DEFAULT_LAYOUT);
  });

  test('moveOver without a drag does nothing', () => {
    const { store } = setup(DEFAULT_LAYOUT);

    store.moveOver({ column: 0, index: 0 });

    assert.isUndefined(store.moving.getSnapshot().value);
  });

  test('reset puts the default back', () => {
    const { store } = setup(withColumns(DEFAULT_LAYOUT, 2));

    store.move('open', { column: 1, index: 0 });

    store.reset();

    assert.deepStrictEqual(store.layout.getSnapshot().value, DEFAULT_LAYOUT);
  });

  test('stop ends the saving, a change still waiting included', async () => {
    const { store, saved } = setup(DEFAULT_LAYOUT);

    const stopLayout = store.start();

    store.setSplit(30);

    stopLayout();

    store.setSplit(40);

    await settle();

    assert.strictEqual(saved.length, 1);
  });
});

type Setup = Readonly<{
  store: LayoutStore;
  saved: readonly Layout[];
}>;

const setup = (initial: Layout): Setup => {
  const mut_saved: Layout[] = [];

  const store = createLayoutStore({
    initial,
    save: (layout) => {
      mut_saved.push(layout);
    },
    // Real timers, only short: the repository's lint keeps `vi`'s fake ones
    // out of tests.
    saveDelayMs: 0,
  });

  return { store, saved: mut_saved };
};

const settle = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 10);
  });
};
