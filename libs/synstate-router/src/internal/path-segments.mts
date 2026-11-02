import { Optional } from 'ts-data-forge';

/**
 * Splits a pathname into percent-decoded segments, accepting it with or without
 * one trailing slash: `/` is `[]`, and `/a/b/` and `/a/b` are `['a', 'b']`.
 * `None` when a segment is empty (`//`, which `href` never writes and a URL
 * reads as the start of a host) or not valid percent-encoding: no route matches
 * either.
 */
export const decodePathname = (
  pathname: string,
): Optional<readonly string[]> => {
  if (pathname.includes('//')) {
    return Optional.none;
  }

  const withoutLeading = pathname.startsWith('/')
    ? pathname.slice(1)
    : pathname;

  const trimmed = withoutLeading.endsWith('/')
    ? withoutLeading.slice(0, -1)
    : withoutLeading;

  if (trimmed === '') {
    return Optional.some([]);
  }

  const mut_segments: string[] = [];

  for (const segment of trimmed.split('/')) {
    if (segment === '') {
      return Optional.none;
    }

    try {
      // A path segment, not a query string: query-string's `parse` does not
      // apply.
      // eslint-disable-next-line no-restricted-globals
      mut_segments.push(decodeURIComponent(segment));
    } catch {
      return Optional.none;
    }
  }

  return Optional.some(mut_segments);
};

/**
 * Encodes one segment, or a fragment, so that `/`, `%`, `?` and `#` stay inside
 * it. The caller checks `isWellFormed()` first: a lone surrogate has no
 * percent-encoding.
 */
export const encodeSegment = (segment: string): string =>
  // A path segment or a fragment, not a query string.
  // eslint-disable-next-line no-restricted-globals
  encodeURIComponent(segment);
