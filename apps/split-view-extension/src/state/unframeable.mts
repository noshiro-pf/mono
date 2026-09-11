/**
 * Why the browser itself will not put an address in a pane's frame.
 *
 * Each of these is refused by Chrome before a request is made, whatever the
 * site's headers say and whatever rules the extension has in place. They are
 * told apart from one another only so that the pane can name the reason: what
 * the user does about it is the same in every case — open it in a tab of its
 * own.
 */
export type UnframeableKind =
  | 'browser-page'
  | 'extension-page'
  | 'local-file'
  | 'unsupported-scheme'
  | 'web-store';

/**
 * Recognizes those addresses, from the address alone.
 *
 * Worth doing separately from waiting for the frame to answer, because for
 * most of them there is nothing to wait for: measured, `chrome://version`,
 * `view-source:` and `file:` are refused before a navigation starts, so the
 * frame keeps whatever it was showing and never fires `load`. The Web Store is
 * the exception — it loads an error page like any framing refusal would — and
 * is here anyway, because "this one is out of every extension's reach" is a
 * better answer than "no answer from the page".
 *
 * `undefined` means "nothing known against it", not "this will work".
 */
export const unframeableKindOf = (
  address: string,
): UnframeableKind | undefined => {
  if (address === '' || address === 'about:blank') {
    return undefined;
  }

  const parsed = parseUrl(address);

  if (parsed === undefined) {
    return undefined;
  }

  if (browserSchemes.has(parsed.protocol)) {
    return 'browser-page';
  }

  if (extensionSchemes.has(parsed.protocol)) {
    return 'extension-page';
  }

  if (parsed.protocol === 'file:') {
    return 'local-file';
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return 'unsupported-scheme';
  }

  return isWebStore(parsed.hostname, parsed.pathname) ? 'web-store' : undefined;
};

/**
 * Chrome's own pages, and the two schemes that show one.
 *
 * `about:` is here for `about:srcdoc` and the like; `about:blank` is dealt with
 * above, being a blank page on purpose rather than a page that failed.
 */
const browserSchemes = new Set([
  'about:',
  'chrome-untrusted:',
  'chrome:',
  'devtools:',
  'view-source:',
]);

/** Including this extension's own pages: a split view inside a pane is not one. */
const extensionSchemes = new Set(['chrome-extension:', 'moz-extension:']);

/**
 * `chrome.google.com` is the Web Store only under `/webstore`; the rest of that
 * host is ordinary Google pages, which frame like any other page.
 */
const isWebStore = (hostname: string, pathname: string): boolean =>
  hostname === 'chromewebstore.google.com' ||
  (hostname === 'chrome.google.com' && pathname.startsWith('/webstore'));

const parseUrl = (address: string): URL | undefined => {
  try {
    return new URL(address);
  } catch {
    return undefined;
  }
};
