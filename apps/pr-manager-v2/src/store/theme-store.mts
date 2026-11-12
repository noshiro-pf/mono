import {
  combine,
  createState,
  map,
  type InitializedObservable,
} from 'synstate';
import {
  colorSchemeOf,
  themeOfPick,
  type ColorScheme,
  type Theme,
} from '../domain/index.mjs';
import type { UrlField } from './url-store.mjs';

export type ThemeStore = Readonly<{
  theme: InitializedObservable<Theme>;
  /** What is drawn. */
  scheme: InitializedObservable<ColorScheme>;
  pick: (picked: ColorScheme) => void;
  start: () => () => void;
}>;

export type ThemeDeps = Readonly<{
  field: UrlField<Theme>;
  system: Readonly<{
    get: () => ColorScheme;
    /** Calls back on every change of the system's scheme; returns a stop. */
    watch: (onChange: () => void) => () => void;
  }>;
  /** Puts the theme on `<html>`, where the stylesheet reads it. */
  apply: (theme: Theme) => void;
}>;

/**
 * Light or dark (spec §5). Follows the system until the toggle is pressed; a
 * press shows the other scheme and keeps it in the URL, and a press back to
 * what the system shows lets the page follow the system again.
 */
export const createThemeStore = (deps: ThemeDeps): ThemeStore => {
  const [system, setSystem, { getSnapshot: getSystem }] = createState(
    deps.system.get(),
  );

  const scheme = combine([deps.field.value, system]).pipe(
    map(([theme, sys]) => colorSchemeOf(theme, sys)),
  );

  return {
    theme: deps.field.value,
    scheme,
    pick: (picked) => {
      deps.field.set(themeOfPick(picked, getSystem()));
    },
    start: () => {
      const stopWatching = deps.system.watch(() => {
        setSystem(deps.system.get());
      });

      const subscription = deps.field.value.subscribe(deps.apply);

      return () => {
        stopWatching();

        subscription.unsubscribe();
      };
    },
  };
};
