import { source, type Observable as SynstateObservable } from 'synstate';
import type { ColorScheme, Theme } from '../theme.mjs';
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

  const change = createListenedSource();

  const mut_system = {
    value: initialSystem,
    set: (next: ColorScheme) => {
      mut_system.value = next;

      change.next();
    },
    listening: change.listening,
  };

  const store = createThemeStore({
    initial,
    system: {
      get: () => mut_system.value,
      change: change.observable,
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

/**
 * A source that counts who listens to it. Whether anyone subscribes is not on
 * synstate's public types (#2117), so the double keeps the count itself.
 */
const createListenedSource = (): Readonly<{
  observable: SynstateObservable<undefined>;
  next: () => void;
  listening: () => boolean;
}> => {
  const change = source<undefined>();

  const mut_count = { value: 0 };

  return {
    observable: {
      ...change,
      subscribe: (onNext, onComplete) => {
        mut_count.value += 1;

        const subscription = change.subscribe(onNext, onComplete);

        const mut_active = { value: true };

        return {
          unsubscribe: () => {
            if (mut_active.value) {
              mut_active.value = false;

              mut_count.value -= 1;
            }

            subscription.unsubscribe();
          },
        };
      },
    },
    next: () => {
      change.next(undefined);
    },
    listening: () => mut_count.value > 0,
  };
};
