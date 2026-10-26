import { createThemeStore, parseThemeSetting } from './theme-store.mjs';

describe(parseThemeSetting, () => {
  test('reads a stored setting, and falls back to the system’s', () => {
    assert.strictEqual(parseThemeSetting('light'), 'light');

    assert.strictEqual(parseThemeSetting('dark'), 'dark');

    assert.strictEqual(parseThemeSetting('system'), 'system');

    assert.strictEqual(parseThemeSetting(undefined), 'system');

    assert.strictEqual(parseThemeSetting('sepia'), 'system');
  });
});

describe(createThemeStore, () => {
  test('starts from the stored setting and applies it at once', () => {
    const env = fakeEnvironment('dark', false);

    assert.strictEqual(env.store.setting.getSnapshot().value, 'dark');

    const stop = env.store.start();

    assert.deepStrictEqual(env.applied(), [true]);

    stop();
  });

  test('`system` follows the system’s preference as it changes', () => {
    const env = fakeEnvironment(undefined, true);

    const stop = env.store.start();

    env.setSystemDark(false);

    env.setSystemDark(true);

    assert.deepStrictEqual(env.applied(), [true, false, true]);

    stop();

    assert.isFalse(env.listening());
  });

  test('a chosen theme is saved, applied, and outlasts the system’s changes', () => {
    const env = fakeEnvironment('system', false);

    const stop = env.store.start();

    env.store.setSetting('dark');

    env.setSystemDark(false);

    env.store.setSetting('light');

    assert.deepStrictEqual(env.saved(), ['dark', 'light']);

    assert.deepStrictEqual(env.applied(), [false, true, false]);

    stop();
  });
});

/** What the store is given: storage, the system's preference, the page. */
const fakeEnvironment = (
  stored: string | undefined,
  systemDark: boolean,
): Readonly<{
  saved: () => readonly string[];
  applied: () => readonly boolean[];
  setSystemDark: (dark: boolean) => void;
  listening: () => boolean;
  store: ReturnType<typeof createThemeStore>;
}> => {
  const mut_saved: string[] = [];

  const mut_applied: boolean[] = [];

  let mut_systemDark = systemDark;

  let mut_listener: (() => void) | undefined = undefined;

  const store = createThemeStore({
    storage: {
      load: () => stored,
      save: (setting) => {
        mut_saved.push(setting);
      },
    },
    systemPrefersDark: {
      get: () => mut_systemDark,
      watch: (listener) => {
        mut_listener = listener;

        return () => {
          mut_listener = undefined;
        };
      },
    },
    applyDark: (dark) => {
      mut_applied.push(dark);
    },
  });

  return {
    saved: () => mut_saved,
    applied: () => mut_applied,
    setSystemDark: (dark) => {
      mut_systemDark = dark;

      mut_listener?.();
    },
    listening: () => mut_listener !== undefined,
    store,
  };
};
