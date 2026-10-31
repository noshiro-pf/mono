import {
  DEFAULT_LAYOUT,
  withColumns,
  withMode,
  type Layout,
} from '../layout.mjs';
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

  test('a boundary drag shares the height between two blocks', () => {
    const { store } = setup(withMode(DEFAULT_LAYOUT, 'fill'));

    store.startBoundaryResize({
      upper: 'merged',
      lower: 'issues',
      fromY: 100,
      upperHeight: 200,
      lowerHeight: 200,
      upperShare: 100,
      lowerShare: 100,
    });

    store.resizeTo(150);

    assert.deepStrictEqual(store.layout.getSnapshot().value.shares, {
      merged: 125,
      issues: 75,
    });

    store.endResize();

    store.resizeTo(300);

    assert.deepStrictEqual(store.layout.getSnapshot().value.shares, {
      merged: 125,
      issues: 75,
    });

    store.evenShares(['merged', 'issues']);

    assert.deepStrictEqual(store.layout.getSnapshot().value.shares, {
      merged: 100,
      issues: 100,
    });
  });

  test('the mode follows the layout, and emits only when it changes', () => {
    const { store } = setup(DEFAULT_LAYOUT);

    const mut_modes: string[] = [];

    store.mode.subscribe((mode) => {
      mut_modes.push(mode);
    });

    store.setMode('fill');

    store.setShare('open', 50);

    store.setMode('natural');

    assert.deepStrictEqual(mut_modes, ['natural', 'fill', 'natural']);

    assert.deepStrictEqual(store.layout.getSnapshot().value.shares, {
      open: 50,
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

  test('reset puts the default back', () => {
    const { store } = setup(withColumns(DEFAULT_LAYOUT, 2));

    store.move('open', { column: 1, index: 0 });

    store.reset();

    assert.deepStrictEqual(store.layout.getSnapshot().value, DEFAULT_LAYOUT);
  });

  test('the line between two of three columns moves with the pointer, and a double click evens them', () => {
    const { store } = setup(withColumns(DEFAULT_LAYOUT, 3));

    store.setLine(1, 80);

    store.setLine(0, 20);

    assert.deepStrictEqual(store.layout.getSnapshot().value.lines, [20, 80]);

    store.evenLine(0);

    assert.deepStrictEqual(store.layout.getSnapshot().value.lines, [40, 80]);
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
    // Real timers, only short: the repository's lint keeps `vi`'s fake ones out
    // of tests.
    saveDelayMs: 0,
  });

  return { store, saved: mut_saved };
};

const settle = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 10);
  });
};
