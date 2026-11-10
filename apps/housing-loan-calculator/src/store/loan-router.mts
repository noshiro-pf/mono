import {
  createRouter,
  type Href,
  type Router,
  type RouterBrowser,
  type RouterLocation,
} from 'synstate-router';
import { Optional } from 'ts-data-forge';
import { routes, type Routes } from '../constants/index.mjs';

/**
 * The router of the app's one page. A URL off that page, such as the
 * `index.html` that Pages also serves the page at, is sent to the page with the
 * inputs its query holds and its hash: a shared link keeps them, and the
 * setters, which write the page's search, keep working. Query parameters the
 * page does not declare are not carried.
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
    redirect: (match, location) =>
      match.route === undefined ? loanPageFrom(location) : undefined,
  });

/** The loan page with what the query of `location` holds for it, and its hash. */
const loanPageFrom = ({ href, hash }: RouterLocation): Href => {
  // `matchExact` reads the query as a string, and `RouterLocation` holds it
  // parsed, so it is taken from the whole URL.
  const { search } = new URL(href);

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
