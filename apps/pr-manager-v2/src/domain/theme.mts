import { readChoice, writeChoice, type ParamCodec } from './url/index.mjs';

/**
 * Light or dark. `auto` follows the system; a press of the toggle picks one and
 * keeps it in the URL (`?theme=`), so a bookmark opens the same way and no key
 * is added to a `localStorage` every app on the origin shares. A pick that
 * matches the system is `auto` again, so the page keeps following the system
 * from there.
 */
export type Theme = 'auto' | ColorScheme;

export type ColorScheme = 'dark' | 'light';

export const themeCodec: ParamCodec<Theme> = {
  read: (params) => readChoice(params, KEY, THEMES, 'auto'),
  write: (theme, params) => {
    writeChoice(params, KEY, theme, 'auto');
  },
} as const;

/** What is drawn. */
export const colorSchemeOf = (
  theme: Theme,
  system: ColorScheme,
): ColorScheme => (theme === 'auto' ? system : theme);

/** The theme a press that shows `picked` leaves. */
export const themeOfPick = (picked: ColorScheme, system: ColorScheme): Theme =>
  picked === system ? 'auto' : picked;

const KEY = 'theme';

const THEMES = ['auto', 'light', 'dark'] as const;
