/**
 * The query string, which is where the page keeps what a reader chose — the
 * theme (`theme.mts`), the layout (`layout.mts`) and the DAG's zoom
 * (`dag-zoom.mts`) — so that a bookmark or a pasted link opens the same way.
 */

export const currentSearch = (): string => globalThis.location.search;

/**
 * Writes the query string that `rewrite` makes of the current one, without a
 * navigation or a history entry: a theme or a layout is not somewhere the
 * back button should go.
 *
 * The whole path is written, not just the query — `replaceState` with an
 * empty URL resolves to the current one, old query included, so removing the
 * last parameter would otherwise change nothing.
 */
export const rewriteSearch = (rewrite: (current: string) => string): void => {
  const { pathname, search, hash } = globalThis.location;

  const nextSearch = rewrite(search);

  if (nextSearch === search) {
    return;
  }

  window.history.replaceState(
    window.history.state,
    '',
    `${pathname}${nextSearch}${hash}`,
  );
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
