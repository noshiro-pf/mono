import {
  derive,
  filter,
  map,
  scan,
  skipIfNoChange,
  type InitializedObservable,
  type Observable as SynstateObservable,
} from 'synstate';
import {
  createRouter,
  type Href,
  type Router,
  type RouterBrowser,
} from 'synstate-router';
import { Optional } from 'ts-data-forge';
import { routes } from '../constants/index.mjs';

/**
 * The app's router: the URL, which page it names, and the event id in it.
 * `browser` is the real window when left out; a test hands it
 * `createMemoryBrowser`.
 */
export const createAppRouter = (browser?: RouterBrowser): AppRouter => {
  const router = createRouter(routes, {
    redirect: (m) => (m.route === 'root' ? routes.create.href() : undefined),
    ...(browser === undefined ? {} : { browser }),
  });

  const pageToBack$ = derive(
    [router.match, router.location],
    (...values) => values,
  )
    .pipe(
      filter(
        // ログインページ・新規登録ページは除外
        ([m]) => m.route !== 'signIn' && m.route !== 'register',
      ),
    )
    .pipe(map(([, location]) => router.parseHref(location.href)))
    .pipe(filter(Optional.isSome))
    .pipe(map((href) => Optional.unwrap(href)));

  const absoluteUrlOf = (href: Href): string => {
    // `toUrl` gives the path from the root: only the origin is taken.
    const { origin } = new URL(
      Optional.unwrap(router.location.getSnapshot()).href,
    );

    const url = new URL(router.toUrl(href), origin);

    return url.href;
  };

  // Counts each change of the page shown, its path, not its query: a visit
  // lasts while this stays the same.
  const pageChanges$ = router.location
    .pipe(map((location) => location.pathname))
    .pipe(skipIfNoChange())
    .pipe(scan((count: number) => count + 1, 0));

  const trackVisit = (): (() => boolean) => {
    const visit = Optional.unwrap(pageChanges$.getSnapshot());

    return () => Optional.unwrap(pageChanges$.getSnapshot()) === visit;
  };

  return {
    ...router,
    pageToBack$,
    trackVisit,
    absoluteUrlOf,
    eventId$: router
      .at(routes.event.answer)
      .pipe(
        map((values) =>
          Optional.isSome(values)
            ? Optional.unwrap(values).params.eventId
            : undefined,
        ),
      ),
    editPageLeaves$: router
      .isActive(routes.event.answer.edit)
      .pipe(filter((isEditPage) => !isEditPage))
      .pipe(scan((count) => count + 1, 0)),
  } as const;
};

export type AppRouter = Router<typeof routes> &
  Readonly<{
    /**
     * The last page that was neither the sign-in nor the register page, with
     * its query: where signing in or registering returns to. An address that
     * names no page is not one to return to.
     */
    pageToBack$: SynstateObservable<Href>;
    /**
     * Taken when a request starts on a page: whether that visit lasts, the page
     * shown neither left nor left and opened again since. An answer that comes
     * back after it ended is for a page no longer there.
     */
    trackVisit: () => () => boolean;
    /** The whole URL of a page, to copy and share. */
    absoluteUrlOf: (href: Href) => string;
    eventId$: InitializedObservable<string | undefined>;
    /**
     * How many times the edit page has been left: what the edit page keeps is
     * forgotten when it changes, and an answer that comes back after it changed
     * is for a visit already over.
     */
    editPageLeaves$: InitializedObservable<number>;
  }>;
