/** How the router writes the end of a path. */
export type TrailingSlash = 'always' | 'never';

/**
 * `pathname` in the canonical form: ending in a slash for `'always'`, without
 * one for `'never'`. The root is `/` either way.
 */
export const canonicalPathname = (
  pathname: string,
  trailingSlash: TrailingSlash,
): string => {
  switch (trailingSlash) {
    case 'always':
      return pathname.endsWith('/') ? pathname : `${pathname}/`;

    case 'never':
      return pathname !== '/' && pathname.endsWith('/')
        ? pathname.slice(0, -1)
        : pathname;
  }
};
