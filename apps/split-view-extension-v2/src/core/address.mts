import { nonEmpty, parseUrl } from './fields.mjs';

/**
 * What was typed into a pane's address bar, as an address a frame can load
 * (spec P2): a scheme a pane navigates to is kept, any other scheme becomes a
 * search, a local host gets `http://`, a host with a dot `https://`, and the
 * rest is searched for.
 */
export const normalizeAddress = (input: string): string => {
  const trimmed = input.trim();

  if (trimmed === '') {
    return '';
  }

  if (schemePattern.test(trimmed)) {
    const lower = trimmed.toLowerCase();

    return navigableSchemes.some((scheme) => lower.startsWith(scheme))
      ? trimmed
      : searchUrlOf(trimmed);
  }

  // The URL parser decides what a host is, since it is what will resolve it.
  const hostname = hostnameOf(`https://${trimmed}`);

  return hostname === undefined
    ? searchUrlOf(trimmed)
    : localHostnames.has(hostname)
      ? `http://${trimmed}`
      : hostname.includes('.')
        ? `https://${trimmed}`
        : searchUrlOf(trimmed);
};

export const originOf = (address: string): string | undefined => {
  const origin = parseUrl(address)?.origin;

  return origin === undefined || origin === 'null' ? undefined : origin;
};

export const hostnameOf = (address: string): string | undefined =>
  nonEmpty(parseUrl(address)?.hostname);

/**
 * An address whose scheme a pane navigates to (the allowlist P2 keeps), or
 * `undefined`: what a frame reports is the framed page's word, and only such an
 * address may become a pane's or a new tab's.
 */
export const paneAddressOf = (address: string): string | undefined => {
  const lower = address.trim().toLowerCase();

  return navigableSchemes.some((scheme) => lower.startsWith(scheme))
    ? address
    : undefined;
};

/** An `http:` or `https:` address, or `undefined`. */
export const webPageUrlOf = (
  address: string | undefined,
): string | undefined => {
  if (address === undefined) {
    return undefined;
  }

  const protocol = parseUrl(address)?.protocol;

  return protocol === 'http:' || protocol === 'https:' ? address : undefined;
};

/**
 * Why Chrome will not put an address in a frame at all, whatever the rules do
 * (spec P10). `undefined` is "nothing known against it", not "it will work".
 */
export type Unframeable =
  | 'browser-page'
  | 'extension-page'
  | 'local-file'
  | 'unsupported-scheme'
  | 'web-store';

export const unframeableOf = (address: string): Unframeable | undefined => {
  if (address === '' || address === 'about:blank') {
    return undefined;
  }

  const url = parseUrl(address);

  if (url === undefined) {
    return undefined;
  }

  if (browserSchemes.has(url.protocol)) {
    return 'browser-page';
  }

  if (extensionSchemes.has(url.protocol)) {
    return 'extension-page';
  }

  if (url.protocol === 'file:') {
    return 'local-file';
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return 'unsupported-scheme';
  }

  return url.hostname === 'chromewebstore.google.com' ||
    (url.hostname === 'chrome.google.com' &&
      url.pathname.startsWith('/webstore'))
    ? 'web-store'
    : undefined;
};

/** A scheme, not a `host:port`: `localhost:5173` has a digit after the colon. */
const schemePattern = /^[a-z][a-z\d+.-]*:(?!\d)/iu;

/** An allowlist, so that an unforeseen scheme is searched for, not loaded. */
const navigableSchemes: readonly string[] = [
  'about:',
  'file:',
  'ftp:',
  'http:',
  'https:',
] as const;

const localHostnames: ReadonlySet<string> = new Set<string>([
  'localhost',
  '127.0.0.1',
  '[::1]',
]);

const browserSchemes: ReadonlySet<string> = new Set<string>([
  'about:',
  'chrome-untrusted:',
  'chrome:',
  'devtools:',
  'view-source:',
]);

const extensionSchemes: ReadonlySet<string> = new Set<string>([
  'chrome-extension:',
  'moz-extension:',
]);

const searchUrlOf = (query: string): string => {
  const url = new URL('https://www.google.com/search');

  url.searchParams.set('q', query);

  return url.href;
};
