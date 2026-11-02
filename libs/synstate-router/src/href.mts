import type { Brand } from 'ts-type-forge';

/**
 * A path inside the application, made only by a route node's `href`, so that a
 * hand-written string cannot reach `push`, `replace` or `Link`.
 *
 * It holds the path without the base path (`/products/42/?page=2`); the router
 * adds the base path when it writes the URL.
 */
export type Href = Brand<string, 'synstate-router/Href'>;

/**
 * A URL outside the application, accepted by `Link` alone. Named apart from
 * {@link Href} so that leaving the application is written down where it
 * happens.
 */
export type ExternalHref = Brand<string, 'synstate-router/ExternalHref'>;

/**
 * Marks a URL as leaving the application. It must be absolute, with a scheme
 * (`https:`, `mailto:`): an `Href` is a path, so `Link` tells the two apart by
 * that, and a path of another application on this origin is written as a whole
 * URL. Throws on anything else.
 *
 * @example
 *
 * ```ts
 * const docs = externalHref('https://example.com/docs');
 *
 * assert.strictEqual(docs, 'https://example.com/docs');
 * ```
 */
export const externalHref = (url: string): ExternalHref => {
  if (!URL.canParse(url)) {
    throw new Error(
      `synstate-router: externalHref: ${url} is not an absolute URL`,
    );
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the one place an `ExternalHref` is made
  return url as ExternalHref;
};

/**
 * Whether a link's destination is a page of this application rather than an
 * `externalHref`: an `Href` is a path, and an `ExternalHref` an absolute URL.
 * A binding's `Link` routes only an `Href`, so an `ExternalHref` to this origin
 * still loads the page.
 */
export const isHref = (to: Href | ExternalHref): to is Href =>
  to.startsWith('/');
