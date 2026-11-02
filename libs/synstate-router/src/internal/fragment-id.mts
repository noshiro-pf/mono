/**
 * The element id a URL's `hash` (`#a%20b`) points at (`a b`), as a browser
 * decodes it; the hash without `#` when it is not valid percent-encoding.
 */
export const fragmentId = (hash: string): string => {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;

  try {
    // A fragment, not a query string.
    // eslint-disable-next-line no-restricted-globals
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};
