import { map, type InitializedObservable } from 'synstate';
import { createRouter, withSlash } from 'tiny-router-observable';
import { routeList, routes } from './constants/index.mjs';

export const selectTab = (tabIndex: number): void => {
  const route = routeList[tabIndex];

  if (route !== undefined) {
    Router.push(route);
  }
};

/**
 * Above `Router`, which calls it while it is created: a `const` below would
 * still be uninitialized then.
 */
const tabIndexOf = (pathname: string): number | undefined => {
  // eslint-disable-next-line unicorn/prefer-array-index-of
  const index = routeList.findIndex((route) => route === pathname);

  return index === -1 ? undefined : index;
};

// The app is served from `/mono/profile/` on the repository's Pages site, and
// the tabs are paths below it (`/mono/profile/career/`), so the router reads
// and writes them relative to that base. A path that names no tab opens the
// first one, and a tab's path without its trailing slash gains it.
export const Router = createRouter({
  basePath: import.meta.env.BASE_URL,
  redirect: (pathname) => {
    const normalized = withSlash(pathname);

    return tabIndexOf(normalized) === undefined
      ? routes.career
      : normalized === pathname
        ? undefined
        : normalized;
  },
});

/** The selected tab. The redirect above leaves no path that names none. */
export const tabIndex$: InitializedObservable<number> = Router.state.pipe(
  map(({ pathname }) => tabIndexOf(pathname) ?? 0),
);
