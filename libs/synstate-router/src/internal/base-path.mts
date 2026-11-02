import { Optional } from 'ts-data-forge';

/**
 * Normalizes a base path so that it begins with one slash and ends with a
 * slash and is percent-encoded, e.g. `mono/profile` → `/mono/profile/`; the
 * path of a whole URL. An empty one is the root. Throws on a relative one
 * (`./`).
 */
export const normalizeBasePath = (basePath: string): string => {
  // A whole URL, as Vite's `BASE_URL` is for a base on another origin: its path
  // is what the browser shows. Only with `scheme://`: `app:v2/` is a path.
  const path = wholeUrl.test(basePath)
    ? (URL.parse(basePath)?.pathname ?? basePath)
    : basePath;

  // A URL parser removes `.` and `..`, so a base with them (Vite's relative
  // `./`) never matches; it cannot be routed, since it names no path.
  if (path.split('/').some((s) => s === '.' || s === '..')) {
    throw new Error(
      `synstate-router: basePath ${basePath} is relative; pass the path the application is served under`,
    );
  }

  // One leading slash (`//host/` would be another host), and percent-encoded as
  // `location.pathname` is.
  const { pathname } = new URL(
    `/${path.replace(/^\/+/u, '')}`,
    'https://base.invalid/',
  );

  return pathname.endsWith('/') ? pathname : `${pathname}/`;
};

const wholeUrl = /^[a-z][\d+.a-z-]*:\/\//iu;

/**
 * The part of `pathname` below the normalized `basePath`, beginning with a
 * slash: `/mono/profile/career/` below `/mono/profile/` is `/career/`, and the
 * base without its trailing slash, as a server may serve it, is `/`.
 *
 * `None` for a pathname outside the base, which no route matches: reading it as
 * if it were inside would show a page the URL does not lead to.
 */
export const stripBasePath = (
  basePath: string,
  pathname: string,
): Optional<string> =>
  pathname.startsWith(basePath)
    ? Optional.some(`/${pathname.slice(basePath.length)}`)
    : `${pathname}/` === basePath
      ? Optional.some('/')
      : Optional.none;

/** `path`, which begins with a slash, placed below the normalized `basePath`. */
export const prependBasePath = (basePath: string, path: string): string =>
  `${basePath.slice(0, -1)}${path}` as const;
