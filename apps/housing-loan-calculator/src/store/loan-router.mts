import {
  createRouter,
  type Href,
  type Router,
  type RouterBrowser,
} from 'synstate-router';
import { Optional } from 'ts-data-forge';
import { routes, type Routes } from '../constants/index.mjs';

/**
 * The router of the app's one page. A URL off that page, such as the
 * `index.html` that Pages also serves the page at, is sent to the page with the
 * inputs its query holds and its hash: a shared link keeps them, and the
 * setters, which write the page's search, keep working. Query parameters the
 * page does not declare are not carried.
 *
 * `redirect` is given the match, not the URL, so the URL is read from the
 * browser. That is the URL being resolved on the first load and on back and
 * forward, which is how a URL off the page arrives: every href the app pushes
 * is the page's own.
 */
export const createLoanRouter = (
  options: Readonly<{
    basePath: string;
    /** The browser to route; the real window if left out. */
    browser?: RouterBrowser;
  }>,
): Router<Routes> =>
  createRouter(routes, {
    basePath: options.basePath,
    ...(options.browser === undefined ? {} : { browser: options.browser }),
    redirect: (match) =>
      match.route === undefined
        ? loanPageFrom(
            options.browser?.location.href ?? globalThis.location.href,
          )
        : undefined,
  });

/** The loan page with what the query of `url` holds for it, and its hash. */
const loanPageFrom = (url: string): Href => {
  const { search, hash } = new URL(url);

  return routes.loan.href({
    search: Optional.unwrapOr(
      Optional.map(
        routes.loan.matchExact({ pathname: '/', search }),
        (values) => values.search,
      ),
      {},
    ),
    ...(hash === '' ? {} : { hash: hash.slice(1) }),
  });
};
