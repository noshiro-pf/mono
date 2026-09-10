/**
 * A scheme, and not a `host:port`.
 *
 * The negative lookahead is what tells `https://example.com` from
 * `localhost:5173` and `example.com:8080`, which have the same shape and are
 * addresses in need of a scheme rather than schemes.
 */
const schemePattern = /^[a-z][a-z\d+.-]*:(?!\d)/iu;

/**
 * The schemes a pane will navigate to, as an allowlist.
 *
 * An allowlist rather than a list of refusals, so that a scheme nobody thought
 * about — one that runs script in the frame with the page's own privileges,
 * say — becomes a search rather than a navigation.
 */
const allowedSchemes: readonly string[] = [
  'about:',
  'file:',
  'ftp:',
  'http:',
  'https:',
] as const;

const localHostnames = new Set(['localhost', '127.0.0.1', '[::1]']);

const searchUrl = 'https://www.google.com/search';

/**
 * Turns what was typed in a pane's address bar into something an `iframe` can
 * load: a bare host gets `https://`, `localhost` gets `http://`, and anything
 * that is not addressable becomes a web search.
 */
export const normalizeAddress = (input: string): string => {
  const trimmed = input.trim();

  if (trimmed === '') {
    return '';
  }

  if (schemePattern.test(trimmed)) {
    return allowedSchemes.some((scheme) =>
      trimmed.toLowerCase().startsWith(scheme),
    )
      ? trimmed
      : toSearchUrl(trimmed);
  }

  // Whether the text is a host is decided by the URL parser rather than by a
  // pattern: it is the same parser that will resolve the address, and a
  // hand-written one would only disagree with it.
  const hostname = hostnameOf(`https://${trimmed}`);

  if (hostname === undefined) {
    return toSearchUrl(trimmed);
  }

  if (localHostnames.has(hostname)) {
    return `http://${trimmed}`;
  }

  return hostname.includes('.') ? `https://${trimmed}` : toSearchUrl(trimmed);
};

/** The origin of an address, for reaching the site outside the failing page. */
export const originOf = (url: string): string | undefined => {
  try {
    const parsed = new URL(url);

    return parsed.origin === 'null' ? undefined : parsed.origin;
  } catch {
    return undefined;
  }
};

/** The host of an address, for labelling a pane whose title is unknown. */
export const hostnameOf = (url: string): string | undefined => {
  try {
    const parsed = new URL(url);

    return parsed.hostname === '' ? undefined : parsed.hostname;
  } catch {
    return undefined;
  }
};

const toSearchUrl = (query: string): string => {
  const url = new URL(searchUrl);

  url.searchParams.set('q', query);

  return url.href;
};
