/**
 * Light or dark: what the reader chose, and what the system prefers. What a
 * press does is `theme.mts`; this holds the two values and writes the first
 * to the page and the URL whenever it changes.
 */

import {
  createState,
  type InitializedObservable,
  type Observable as SynstateObservable,
} from 'synstate';
import { toggledTheme, type ColorScheme, type Theme } from '../theme.mjs';

export type ThemeDeps = Readonly<{
  initial: Theme;
  system: Readonly<{
    get: () => ColorScheme;
    /** An OS that turns dark at sunset does so while the page is open. */
    change: SynstateObservable<unknown>;
  }>;
  apply: (theme: Theme) => void;
  save: (theme: Theme) => void;
}>;

export type ThemeStore = Readonly<{
  theme: InitializedObservable<Theme>;
  system: InitializedObservable<ColorScheme>;
  toggle: () => void;
  /** Starts writing and listening, and returns what stops both. */
  start: () => () => void;
}>;

export const createThemeStore = (deps: ThemeDeps): ThemeStore => {
  const [theme, , { updateState: updateTheme }] = createState<Theme>(
    deps.initial,
  );

  const [system, setSystem, { getSnapshot: getSystem }] =
    createState<ColorScheme>(deps.system.get());

  const toggle = (): void => {
    updateTheme((current) => toggledTheme(current, getSystem()));
  };

  const start = (): (() => void) => {
    const themeSubscription = theme.subscribe((next) => {
      deps.apply(next);

      deps.save(next);
    });

    const systemSubscription = deps.system.change.subscribe(() => {
      setSystem(deps.system.get());
    });

    return () => {
      themeSubscription.unsubscribe();

      systemSubscription.unsubscribe();
    };
  };

  return { theme, system, toggle, start };
};
