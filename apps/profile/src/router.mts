import { map, type InitializedObservable } from 'synstate';
import { createRouter } from 'synstate-router';
import { routes, tabKeys } from './constants/index.mjs';

export const selectTab = (tabIndex: number): void => {
  const key = tabKeys[tabIndex];

  // A cross-fade where the browser has View Transitions, and the same change as
  // before where it does not; `index.css` turns it off for reduced motion.
  if (key !== undefined) {
    router.push(routes[key].href(), { viewTransition: true });
  }
};

// The app is served from `/mono/profile/` on the repository's Pages site, and
// the tabs are paths below it (`/mono/profile/career/`), so the router reads
// and writes them relative to that base. A path that names no tab opens the
// first one; the router adds a missing trailing slash itself.
const router = createRouter(routes, {
  basePath: import.meta.env.BASE_URL,
  redirect: (match) =>
    match.route === undefined ? routes[tabKeys[0]].href() : undefined,
});

/**
 * The selected tab. The redirect above leaves no path below the base that names
 * none; a URL outside the base, which the router does not redirect, shows the
 * first tab.
 */
export const tabIndex$: InitializedObservable<number> = router.match.pipe(
  map(({ route }) => (route === undefined ? 0 : tabKeys.indexOf(route))),
);
