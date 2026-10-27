/**
 * Normalizes a base path so it begins and ends with a slash, e.g.
 * `mono/profile` → `/mono/profile/`. An empty one is the root.
 */
export const normalizeBasePath = (basePath: string): string => {
  const withLeading = basePath.startsWith('/')
    ? basePath
    : (`/${basePath}` as const);

  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
};

/**
 * The part of `pathname` below `basePath`, beginning with a slash —
 * `/mono/profile/career/` below `/mono/profile/` is `/career/`.
 *
 * A pathname outside the base comes back unchanged: there is nothing to strip,
 * and making a path up would hide where the page really is.
 */
export const stripBasePath = (basePath: string, pathname: string): string => {
  const base = normalizeBasePath(basePath);

  if (pathname.startsWith(base)) {
    return `/${pathname.slice(base.length)}`;
  }

  // The base without its trailing slash, as a server may serve it.
  return `${pathname}/` === base ? '/' : pathname;
};

/**
 * `path` placed below `basePath` when it is root-relative (`/career/` →
 * `/mono/profile/career/`).
 *
 * Anything else — a whole URL such as the `href` of a clicked link, or a
 * protocol-relative `//host/…` — already says where it goes, and comes back
 * unchanged.
 */
export const prependBasePath = (basePath: string, path: string): string =>
  path.startsWith('/') && !path.startsWith('//')
    ? (`${normalizeBasePath(basePath).slice(0, -1)}${path}` as const)
    : path;
