/**
 * The colour theme: light, dark, or whichever the system is set to. The
 * setting is this browser's, kept in localStorage, not the account's.
 *
 * Dark is Blueprint's `bp6-dark` on `<body>`, which its style sheets and
 * `index.css` draw everything under.
 */

import { createState, type InitializedObservable } from 'synstate';

export type ThemeSetting = 'dark' | 'light' | 'system';

export type ThemeStore = Readonly<{
  setting: InitializedObservable<ThemeSetting>;
  setSetting: (setting: ThemeSetting) => void;
  /**
   * Applies the theme, and again whenever the setting or the system's
   * preference changes it; returns what stops following the system.
   */
  start: () => () => void;
}>;

export type ThemeEnvironment = Readonly<{
  storage: Readonly<{
    load: () => string | undefined;
    save: (setting: ThemeSetting) => void;
  }>;
  /** `prefers-color-scheme: dark`, and a way to hear it change. */
  systemPrefersDark: Readonly<{
    get: () => boolean;
    watch: (listener: () => void) => () => void;
  }>;
  /** Draws the page dark or light. */
  applyDark: (dark: boolean) => void;
}>;

export const createThemeStore = ({
  storage,
  systemPrefersDark,
  applyDark,
}: ThemeEnvironment): ThemeStore => {
  const [setting, setState, { getSnapshot }] = createState<ThemeSetting>(
    parseThemeSetting(storage.load()),
  );

  let mut_applied: boolean | undefined = undefined;

  const apply = (): void => {
    const current = getSnapshot();

    const dark =
      current === 'system' ? systemPrefersDark.get() : current === 'dark';

    if (dark === mut_applied) {
      return;
    }

    mut_applied = dark;

    applyDark(dark);
  };

  return {
    setting,
    setSetting: (next) => {
      setState(next);

      storage.save(next);

      apply();
    },
    start: () => {
      apply();

      return systemPrefersDark.watch(apply);
    },
  };
};

/** A stored setting, or `system` for none or one this version does not know. */
export const parseThemeSetting = (stored: string | undefined): ThemeSetting =>
  stored === 'dark' || stored === 'light' ? stored : 'system';
