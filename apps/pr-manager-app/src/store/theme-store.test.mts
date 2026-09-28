import { source } from 'synstate';
import { type ColorScheme, type Theme } from '../theme.mjs';
import { createThemeStore, type ThemeStore } from './theme-store.mjs';

describe(createThemeStore, () => {
  test('applies and saves the starting theme, and every one after it', () => {
    const { store, applied, saved } = setup('dark', 'light');

    store.start();

    store.choose('light');

    assert.deepStrictEqual(applied, ['dark', 'auto']);

    assert.deepStrictEqual(saved, ['dark', 'auto']);
  });

  test('chooses against what the system prefers now', () => {
    const { store, system } = setup('auto', 'light');

    store.start();

    system.set('dark');

    assert.strictEqual(store.system.getSnapshot().value, 'dark');

    store.choose('light');

    assert.strictEqual(store.theme.getSnapshot().value, 'light');

    store.choose('dark');

    assert.strictEqual(store.theme.getSnapshot().value, 'auto');
  });

  test('stop ends the listener and the writes', () => {
    const { store, system, applied } = setup('auto', 'light');

    const stopTheme = store.start();

    stopTheme();

    system.set('dark');

    store.choose('dark');

    assert.strictEqual(store.system.getSnapshot().value, 'light');

    assert.deepStrictEqual(applied, ['auto']);

    assert.isFalse(system.listening());
  });
});

type Setup = Readonly<{
  store: ThemeStore;
  applied: readonly Theme[];
  saved: readonly Theme[];
  system: Readonly<{
    set: (next: ColorScheme) => void;
    listening: () => boolean;
  }>;
}>;

const setup = (initial: Theme, initialSystem: ColorScheme): Setup => {
  const mut_applied: Theme[] = [];

  const mut_saved: Theme[] = [];

  const change = source<undefined>();

  const mut_system = {
    value: initialSystem,
    set: (next: ColorScheme) => {
      mut_system.value = next;

      change.next(undefined);
    },
    listening: () => change.hasSubscriber,
  };

  const store = createThemeStore({
    initial,
    system: {
      get: () => mut_system.value,
      change,
    },
    apply: (theme) => {
      mut_applied.push(theme);
    },
    save: (theme) => {
      mut_saved.push(theme);
    },
  });

  return {
    store,
    applied: mut_applied,
    saved: mut_saved,
    system: mut_system,
  } as const;
};
