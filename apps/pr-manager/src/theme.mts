/**
 * Light or dark, and where the reader's choice of it is kept.
 *
 * **The system decides until the reader does.** With nothing chosen the page
 * follows `prefers-color-scheme`, as it did before there was a button. A
 * choice is kept in the query string, `?theme=light` or `?theme=dark`, rather
 * than in storage: it travels with a bookmark and a pasted link, costs no key
 * on an origin every app under `noshiro-pf.github.io` shares, and is gone
 * from a tab opened without it.
 *
 * **Two buttons, one per look, and the pressed one is what is on screen.**
 * Not a third for the system: it would be pressed on a page that looks
 * exactly as one of the other two says, and pressing it would often change
 * nothing visible. So picking a look chooses it, and picking the one the
 * system shows is stored as no choice at all, which is what lets a page that
 * was switched to dark and back follow the system again.
 */

import { currentSearch, rewriteSearch } from './url.mjs';

/**
 * What the page is told to be. `auto` is no choice, and follows the system.
 *
 * Said here rather than on each member: a comment on a union member does not
 * survive `fix:codemod:full` (#2042).
 */
export type Theme = 'auto' | 'light' | 'dark';

/** What is on screen, which is also what the system can prefer. */
export type ColorScheme = 'light' | 'dark';

export const THEME_PARAM = 'theme';

/** Anything but `light` or `dark` is no choice, including another case. */
export const themeFromSearch = (search: string): Theme => {
  const params = new URLSearchParams(search);

  const value = params.get(THEME_PARAM);

  return value === 'light' || value === 'dark' ? value : 'auto';
};

/**
 * The query string with `theme` written into it, and the other parameters
 * left as they were. `auto` is written as the parameter's absence, so a page
 * that follows the system has a URL that says nothing about it.
 */
export const searchWithTheme = (search: string, theme: Theme): string => {
  const params = new URLSearchParams(search);

  if (theme === 'auto') {
    params.delete(THEME_PARAM);
  } else {
    params.set(THEME_PARAM, theme);
  }

  const written = params.toString();

  return written === '' ? '' : `?${written}`;
};

export const effectiveTheme = (
  theme: Theme,
  system: ColorScheme,
): ColorScheme => (theme === 'auto' ? system : theme);

/** The look picked, as no choice when the system agrees. */
export const chosenTheme = (picked: ColorScheme, system: ColorScheme): Theme =>
  picked === system ? 'auto' : picked;

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** What the query string asks for, now. */
export const themeFromLocation = (): Theme => themeFromSearch(currentSearch());

/** What the system prefers now. */
export const systemColorScheme = (): ColorScheme =>
  matchMedia(DARK_QUERY).matches ? 'dark' : 'light';

/**
 * The media query whose `change` event says the system's preference changed
 * — an OS that turns dark at sunset does so while the page is open.
 */
export const systemColorSchemeQuery = (): MediaQueryList =>
  matchMedia(DARK_QUERY);

/**
 * Tells the stylesheet. `data-theme` on `<html>` sets `color-scheme`, which
 * every token in `index.css` follows through `light-dark()`. `auto` is
 * written too, and matches no rule there, which leaves `color-scheme:
 * light dark` — the system.
 */
export const applyTheme = (theme: Theme): void => {
  // `mut_` because writing `dataset` is the point, and the key through a
  // constant because `dot-notation` and `noPropertyAccessFromIndexSignature`
  // want a literal one spelled two opposite ways.
  const mut_dataset = document.documentElement.dataset;

  mut_dataset[THEME_PARAM] = theme;
};

/** Writes the choice into the address bar; see `rewriteSearch`. */
export const saveTheme = (theme: Theme): void => {
  rewriteSearch((search) => searchWithTheme(search, theme));
};
