/**
 * The query string, which is where the page keeps what a reader chose — the
 * theme (`theme.mts`) and the layout (`layout.mts`) — so that a bookmark or a
 * pasted link opens the same way.
 */

// Neither `window.location`, `globalThis.location` nor a bare `location`
// satisfies the lint rules together; destructuring once names each something
// that is none of the three — the same as in `github-view-defaults-extension`.
const { location: browserLocation, history: browserHistory } = globalThis;

export const currentSearch = (): string => browserLocation.search;

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
  const { pathname, search, hash } = browserLocation;

  const nextSearch = rewrite(search);

  if (nextSearch === search) {
    return;
  }

  browserHistory.replaceState(
    browserHistory.state,
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
  const { pathname, search, hash } = browserLocation;

  browserLocation.assign(`${pathname}${rewrite(search)}${hash}`);
};
