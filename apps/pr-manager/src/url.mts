/**
 * The query string, which is where the page keeps what a reader chose — the
 * theme (`theme.mts`), the layout (`layout.mts`), what the merge order and
 * the open issues show (`merge-order-view.mts`, `issues-list-view.mts`,
 * `issues-view-settings.mts`) and the DAG's zoom (`dag-zoom.mts`) — so that
 * a bookmark or a pasted link opens the same way. Outside it are only the
 * header's fold (`settings-db.mts`) and the token (`token.mts`).
 */

import { Arr } from 'ts-data-forge';

export const currentSearch = (): string => globalThis.location.search;

/**
 * Writes the query string that `rewrite` makes of the current one, without a
 * navigation or a history entry: a theme, a layout or a filter is not
 * somewhere the back button should go.
 *
 * The whole path is written, not just the query — `replaceState` with an
 * empty URL resolves to the current one, old query included, so removing the
 * last parameter would otherwise change nothing. A browser that refuses the
 * write — Safari throws once a page calls `replaceState` too often — leaves
 * the address bar as it was: the choice still applies for as long as the
 * page is open, and reaches the URL the next time the same setting is
 * written.
 */
export const rewriteSearch = (rewrite: (current: string) => string): void => {
  const { pathname, search, hash } = globalThis.location;

  const nextSearch = rewrite(search);

  if (nextSearch === search) {
    return;
  }

  try {
    window.history.replaceState(
      window.history.state,
      '',
      `${pathname}${nextSearch}${hash}`,
    );
  } catch {
    // See above.
  }
};

/**
 * Opens the page again at the query string `rewrite` makes of the current
 * one: what the page reads is decided as it opens, so a different one is a
 * different visit, with a history entry the back button returns from.
 */
export const navigateToSearch = (
  rewrite: (current: string) => string,
): void => {
  const { pathname, search, hash } = globalThis.location;

  globalThis.location.assign(`${pathname}${rewrite(search)}${hash}`);
};

/**
 * The query string `params` make: nothing at all for no parameter. Every
 * writer goes through it, so that they all spell it alike — otherwise each
 * write would change what the last one wrote, and the address bar would flip
 * between two spellings of the same thing.
 *
 * `/` is left as it is, as a reader would type it: it means nothing special
 * in a query, and `repo=owner/name` is what the README says.
 */
export const searchOf = (params: URLSearchParams): string => {
  const written = params.toString().replaceAll('%2F', '/');

  return written === '' ? '' : `?${written}`;
};

/**
 * The names of `all` that `values` list, joined with `.` — or repeated, as
 * a hand may write them — in the order of `all` and once each: one it does
 * not know is dropped. `values` is what `getAll` read of the key.
 */
export const namesParam = <T extends string>(
  all: readonly T[],
  values: readonly string[],
): readonly T[] => {
  const listed = new Set(values.flatMap((value) => value.split('.')));

  return all.filter((each) => listed.has(each));
};

/**
 * Writes `names` joined with `.`, which `URLSearchParams` does not escape;
 * none is no parameter. For names that hold no `.` of their own.
 */
export const setNamesParam = (
  params: URLSearchParams,
  key: string,
  names: readonly string[],
): void => {
  if (Arr.isNonEmpty(names)) {
    params.set(key, names.join('.'));
  } else {
    params.delete(key);
  }
};

/** Whether the switch is on: `1`, and anything else off. */
export const flagParam = (params: URLSearchParams, key: string): boolean =>
  params.get(key) === '1';

/** Writes a switch that is on as `1`, and one that is off as no parameter. */
export const setFlagParam = (
  params: URLSearchParams,
  key: string,
  on: boolean,
): void => {
  if (on) {
    params.set(key, '1');
  } else {
    params.delete(key);
  }
};
