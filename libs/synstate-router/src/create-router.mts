import {
  createState,
  keepEqualParts,
  map,
  untracked,
  type InitializedObservable,
  type Observable,
} from 'synstate';
import { Optional } from 'ts-data-forge';
import type { DeepReadonly, ReadonlyRecord, StrictOmit } from 'ts-type-forge';
import type { RouterBrowser } from './browser.mjs';
import { matchRoutes } from './define-routes.mjs';
import type { Href } from './href.mjs';
import {
  canonicalPathname,
  fragmentId,
  globalBrowser,
  isAtOrBelow,
  normalizeBasePath,
  prependBasePath,
  routeNodeKey,
  routeTreeKey,
  stripBasePath,
  toHref,
  valuesEqual,
  type TrailingSlash,
} from './internal/index.mjs';
import { matchAt } from './match-at.mjs';
import type {
  AnyRouteNode,
  AnyRoutes,
  AnySearchCodec,
  RouteMatch,
  RouteNodeValues,
  RouteSearch,
  RouteValues,
} from './route-types.mjs';

export type ReadonlyURLSearchParams = DeepReadonly<
  StrictOmit<URLSearchParams, 'append' | 'delete' | 'set' | 'sort'>
>;

/** The URL as the router reads it, for what no route declares. */
export type RouterLocation = Readonly<{
  /**
   * Below the base path (`/career/` for `/mono/profile/career/` under
   * `/mono/profile/`); the whole pathname when it is outside the base.
   */
  pathname: string;
  search: ReadonlyURLSearchParams;
  /** With `#`, or `''`. */
  hash: string;
  /** The whole URL. */
  href: string;
}>;

export type RouterOptions<R extends AnyRoutes> = Readonly<{
  /**
   * The path the application is served under, e.g. `/mono/profile/`: pass
   * `import.meta.env.BASE_URL` from a Vite app. Defaults to `/`. The routes are
   * matched below it, and `toUrl` puts an `Href` under it. A whole URL stands
   * for its path. A relative base (Vite's `base: './'`) names no path, so
   * `createRouter` throws on it: build with the path the app is served under.
   */
  basePath?: string;

  /** The browser to route; the real window, read when called, if left out. */
  browser?: RouterBrowser;

  /**
   * The canonical end of a path, which the router writes and rewrites the URL
   * to. Matching accepts both. Defaults to `'always'`.
   */
  trailingSlash?: TrailingSlash;

  /**
   * The page to go to instead of `match`, or `undefined` to stay. It is applied
   * to every URL before `match` shows it, the first one included, so that
   * nobody has to navigate from a subscriber. A chain stops after
   * {@link maxRedirects} redirects, with a `console.error`.
   */
  redirect?: (match: RouteMatch<R>) => Href | undefined;
}>;

export type NavigateOptions = Readonly<{
  /** Replace the current history entry instead of adding one. */
  replace?: boolean;
}>;

export type Router<R extends AnyRoutes> = Readonly<{
  routes: R;

  /**
   * Where the location is. An update that leaves the route, its params and its
   * search structurally the same is not passed on, and the parts that did not
   * change keep their references.
   */
  match: InitializedObservable<RouteMatch<R>>;

  /** The URL itself, for query parameters no route declares. */
  location: InitializedObservable<RouterLocation>;

  /**
   * `Some` with the node's params and search while the page is the node or one
   * of its descendants: for layouts, and values that mean something only inside
   * a branch.
   */
  at: <N extends AnyRouteNode>(
    node: N,
  ) => InitializedObservable<Optional<RouteNodeValues<N>>>;

  /**
   * Whether the page is the node, or with `exact: false` (the default) one of
   * its descendants.
   */
  isActive: (
    node: AnyRouteNode,
    options?: Readonly<{ exact?: boolean }>,
  ) => InitializedObservable<boolean>;

  /**
   * Goes to `href`, adding a history entry; replaces the current one when
   * `href`, before or after redirects, is where the location already is.
   */
  push: (href: Href) => void;

  /** Goes to `href`, replacing the current history entry. */
  replace: (href: Href) => void;

  /**
   * Rewrites the search of `node` while the page is the node or one of its
   * descendants, keeping the path, the hash and the query parameters the node
   * does not declare. Returns whether the node was matched.
   */
  setSearch: <
    S extends AnySearchCodecs,
    // `const`, so that a literal in the recipe's result keeps its type.
    const Next extends RouteSearch<S>,
  >(
    node: AnyRouteNode & DeclaresSearch<S> & Readonly<{ search: S }>,
    recipe: (prev: RouteSearch<S>) => Next,
    options?: NavigateOptions,
  ) => boolean;

  /** The location changes when the browser fires `popstate`. */
  back: () => void;

  /** The location changes when the browser fires `popstate`. */
  forward: () => void;

  /** The location changes when the browser fires `popstate`. */
  go: (delta: number) => void;

  /**
   * An `Href` for a URL from outside (a link in an email, a server's answer):
   * `Some` when it is on this origin, below the base path, and a page.
   */
  parseHref: (url: string) => Optional<Href>;

  /**
   * The URL the browser shows for `href`: below the base path, with the
   * canonical trailing slash. For an `<a>` written without `Link`, or a URL to
   * copy.
   */
  toUrl: (href: Href) => string;

  /**
   * Goes to each `Href` that `href$` passes on, after its update has propagated
   * (in a microtask): the way to navigate from an observable, such as a
   * debounced search box. The value an initialized observable already holds
   * when following starts is a state, not a move, and is skipped. Returns the
   * function that stops it; after `dispose`, it follows nothing.
   */
  follow: (href$: Observable<Href>, options?: NavigateOptions) => () => void;

  /**
   * Makes the scroll a navigation scheduled (to the fragment, or to the top),
   * now. For a binding's `Routes`, which calls it once the new page is in the
   * document; without one, the router makes it after the next frame.
   */
  flushScroll: () => void;

  /**
   * Stops listening to `popstate`, stops every `follow`, and drops a scroll not
   * yet made.
   */
  dispose: () => void;
}>;

type AnySearchCodecs = ReadonlyRecord<string, AnySearchCodec>;

/** Rejects, by type, a node that declares no search to set. */
export type DeclaresSearch<S extends AnySearchCodecs> = [keyof S] extends [
  never,
]
  ? 'synstate-router: this node declares no search'
  : unknown;

/** How many redirects in a row the router follows. */
export const maxRedirects = 10;

/**
 * Starts routing `routes` in the browser.
 *
 * @example
 *
 * ```ts
 * const routes = defineRoutes({
 *   home: { segment: '' },
 *   products: {
 *     search: { page: search.int({ default: 1 }) },
 *     children: { item: { params: { productId: param.int } } },
 *   },
 * });
 *
 * const router = createRouter(routes, {
 *   browser: createMemoryBrowser('https://example.com/'),
 * });
 *
 * router.push(routes.products.item.href({ productId: asSafeInt(42) }));
 *
 * const m = router.match.getSnapshot().value;
 *
 * assert.isTrue(m.route === 'products.item' && m.params.productId === 42);
 *
 * router.dispose();
 * ```
 */
export const createRouter = <R extends AnyRoutes>(
  routes: R,
  options?: RouterOptions<R>,
): Router<R> => {
  const basePath = normalizeBasePath(options?.basePath ?? '/');

  const trailingSlash = options?.trailingSlash ?? 'always';

  const browser = options?.browser ?? globalBrowser();

  const redirect = options?.redirect;

  const toUrl = (href: Href): string => {
    const suffixStart = href.search(/[?#]/u);

    const pathEnd = suffixStart === -1 ? href.length : suffixStart;

    return `${prependBasePath(
      basePath,
      canonicalPathname(href.slice(0, pathEnd), trailingSlash),
    )}${href.slice(pathEnd)}`;
  };

  /** Where `start` leads: canonicalized, and redirected while asked. */
  const resolve = (start: Readonly<URL>, redirects: number): Snapshot<R> => {
    const inside = stripBasePath(basePath, start.pathname);

    if (Optional.isNone(inside)) {
      return snapshotOf(start, start.pathname, {
        route: undefined,
        pathname: start.pathname,
      });
    }

    const pathname = canonicalPathname(inside.value, trailingSlash);

    // Set, not parsed from a string: a pathname that begins with `//` would
    // parse as another host.
    const mut_url = new URL(start.href);

    mut_url.pathname = prependBasePath(basePath, pathname);

    const url: Readonly<URL> = mut_url;

    const found = matchRoutes(routes, { pathname, search: url.search });

    const to = redirect?.(found);

    if (to === undefined) {
      return snapshotOf(url, pathname, found);
    }

    const next = new URL(toUrl(to), url);

    if (next.href === url.href) {
      return snapshotOf(url, pathname, found);
    }

    if (redirects >= maxRedirects) {
      console.error(
        `synstate-router: stopped after ${maxRedirects} redirects in a row, at ${url.href} (next: ${next.href})`,
      );

      return snapshotOf(url, pathname, found);
    }

    return resolve(next, redirects + 1);
  };

  /** The current URL, rewritten first when it is not where it leads. */
  const read = (): Snapshot<R> => {
    const current = new URL(browser.location.href);

    const snapshot = resolve(current, 0);

    if (snapshot.location.href !== current.href) {
      browser.history.replaceState(null, '', snapshot.location.href);
    }

    return snapshot;
  };

  // Every observable of the router is made outside every scope: the router
  // outlives a component, a test or a `scope.run` that happened to create it,
  // and so does what `at` and `isActive` cache.
  const [snapshot$, setSnapshot, { getSnapshot }] = untracked(() =>
    createState(read(), {
      equals: (a, b) => a.location.href === b.location.href,
    }),
  );

  const update = (): void => {
    setSnapshot(read());
  };

  const match = untracked(() =>
    snapshot$.pipe(map((s) => s.match)).pipe(keepEqualParts<RouteMatch<R>>()),
  );

  const location = untracked(() => snapshot$.pipe(map((s) => s.location)));

  // Scrolling

  const mut_scroll: { pending: Optional<ScrollTarget> } = {
    pending: Optional.none,
  };

  const flushScroll = (): void => {
    const { pending } = mut_scroll;

    mut_scroll.pending = Optional.none;

    if (Optional.isNone(pending)) {
      return;
    }

    if (pending.value === 'top') {
      browser.scrollToTop();
    } else {
      browser.scrollToFragment(pending.value.id);
    }
  };

  const scheduleScroll = (target: ScrollTarget): void => {
    if (Optional.isNone(mut_scroll.pending)) {
      browser.afterRender(flushScroll);
    }

    mut_scroll.pending = Optional.some(target);
  };

  // Navigation

  const navigate = (href: Href, replace: boolean, scrolls: boolean): void => {
    const before = getSnapshot().location;

    const current = new URL(browser.location.href);

    const target = new URL(toUrl(href), current);

    if (
      !replace &&
      target.hash !== '' &&
      target.pathname === current.pathname &&
      target.search === current.search
    ) {
      // A fragment navigation: the browser scrolls, fires `hashchange`, and
      // marks `:target`. A scroll scheduled earlier in this frame, for a page
      // not drawn yet, is pointed at the fragment instead of undoing it.
      if (Optional.isSome(mut_scroll.pending)) {
        mut_scroll.pending = Optional.some({ id: fragmentId(target.hash) });
      }

      browser.setHash(target.hash);

      update();

      return;
    }

    // Where the target leads after redirects. A push to where the location
    // already is, before or after them, replaces the entry instead of adding
    // one.
    const next = resolve(target, 0);

    if (
      replace ||
      target.href === current.href ||
      next.location.href === current.href
    ) {
      browser.history.replaceState(null, '', next.location.href);
    } else {
      browser.history.pushState(null, '', next.location.href);
    }

    setSnapshot(next);

    if (!scrolls) {
      return;
    }

    const scrollTarget = scrollTargetOf(before, getSnapshot().location);

    if (Optional.isSome(scrollTarget)) {
      scheduleScroll(scrollTarget.value);
    }
  };

  const assertOwnNode = (node: AnyRouteNode, method: string): void => {
    if (node[routeNodeKey].tree !== routes[routeTreeKey]) {
      throw new Error(
        `synstate-router: router.${method}: ${node.id} is a node of another route tree`,
      );
    }
  };

  const setSearch = <S extends AnySearchCodecs>(
    node: AnyRouteNode & Readonly<{ search: S }>,
    recipe: (prev: RouteSearch<S>) => RouteSearch<S>,
    navigateOptions?: NavigateOptions,
  ): boolean => {
    assertOwnNode(node, 'setSearch');

    const { location: current, match: currentMatch } = getSnapshot();

    const values = matchAt(node, currentMatch);

    if (Optional.isNone(values)) {
      return false;
    }

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- read with the codecs of `node`
    const before = (values.value as RouteValues<never, S>).search;

    const next = recipe(before);

    if (valuesEqual(next, before)) {
      return true;
    }

    const { searchKeys, encodeSearch } = node[routeNodeKey];

    const url = new URL(current.href);

    const mut_searchParams = url.searchParams;

    for (const key of searchKeys) {
      mut_searchParams.delete(key);
    }

    for (const [key, value] of encodeSearch(`${node.id}.setSearch`, next)) {
      mut_searchParams.append(key, value);
    }

    const query = mut_searchParams.toString();

    navigate(
      toHref(
        `${current.pathname}${query === '' ? '' : `?${query}`}${current.hash}`,
      ),
      navigateOptions?.replace ?? false,
      false,
    );

    return true;
  };

  const parseHref = (url: string): Optional<Href> => {
    const current = new URL(browser.location.href);

    const parsed = URL.parse(url, current);

    if (parsed?.origin !== current.origin) {
      return Optional.none;
    }

    const inside = stripBasePath(basePath, parsed.pathname);

    if (Optional.isNone(inside)) {
      return Optional.none;
    }

    const m = matchRoutes(routes, {
      pathname: inside.value,
      search: parsed.search,
    });

    return m.route === undefined
      ? Optional.none
      : Optional.some(
          toHref(
            `${canonicalPathname(inside.value, 'always')}${parsed.search}${parsed.hash}`,
          ),
        );
  };

  /** What `dispose` stops: the `follow` subscriptions. */
  const mut_stops = new Set<() => void>();

  const mut_router = { disposed: false };

  const follow = (
    href$: Observable<Href>,
    navigateOptions?: NavigateOptions,
  ): (() => void) => {
    if (mut_router.disposed) {
      return () => {};
    }

    const held = href$.getSnapshot();

    const mut_follow = { active: true, subscribing: true };

    const subscription = href$.subscribe((href) => {
      // An initialized observable delivers the value it holds during
      // `subscribe`: a state, not a move.
      if (
        mut_follow.subscribing &&
        Optional.isSome(held) &&
        held.value === href
      ) {
        return;
      }

      queueMicrotask(() => {
        if (mut_follow.active) {
          navigate(href, navigateOptions?.replace ?? false, true);
        }
      });
    });

    mut_follow.subscribing = false;

    const stop = (): void => {
      mut_follow.active = false;

      subscription.unsubscribe();

      mut_stops.delete(stop);
    };

    mut_stops.add(stop);

    return stop;
  };

  // Derived observables, one per node, so that a component asking again does
  // not attach another child to `match`.

  const mut_atCache = new Map<
    string,
    InitializedObservable<Optional<unknown>>
  >();

  const at = <N extends AnyRouteNode>(
    node: N,
  ): InitializedObservable<Optional<RouteNodeValues<N>>> => {
    assertOwnNode(node, 'at');

    // Outside every scope, as above: the first caller may be a component.
    const cached =
      mut_atCache.get(node.id) ??
      untracked(() =>
        match
          .pipe(map((m) => matchAt(node, m)))
          .pipe(keepEqualParts<Optional<unknown>>()),
      );

    mut_atCache.set(node.id, cached);

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- read with the codecs of `node`
    return cached as InitializedObservable<Optional<RouteNodeValues<N>>>;
  };

  const mut_isActiveCache = new Map<string, InitializedObservable<boolean>>();

  const isActive = (
    node: AnyRouteNode,
    isActiveOptions?: Readonly<{ exact?: boolean }>,
  ): InitializedObservable<boolean> => {
    assertOwnNode(node, 'isActive');

    const exact = isActiveOptions?.exact ?? false;

    const key = `${exact ? 'exact' : 'prefix'}:${node.id}` as const;

    // Outside every scope, as above.
    const cached =
      mut_isActiveCache.get(key) ??
      untracked(() =>
        match.pipe(
          map((m) =>
            exact ? m.route === node.id : isAtOrBelow(m.route, node.id),
          ),
        ),
      );

    mut_isActiveCache.set(key, cached);

    return cached;
  };

  browser.addEventListener('popstate', update);

  return {
    routes,
    match,
    location,
    at,
    isActive,
    push: (href) => {
      navigate(href, false, true);
    },
    replace: (href) => {
      navigate(href, true, true);
    },
    setSearch,
    back: () => {
      browser.history.go(-1);
    },
    forward: () => {
      browser.history.go(1);
    },
    go: (delta) => {
      browser.history.go(delta);
    },
    parseHref,
    toUrl,
    follow,
    flushScroll,
    dispose: () => {
      mut_router.disposed = true;

      browser.removeEventListener('popstate', update);

      for (const stop of mut_stops) {
        stop();
      }

      mut_scroll.pending = Optional.none;
    },
  };
};

type Snapshot<R extends AnyRoutes> = Readonly<{
  location: RouterLocation;
  match: RouteMatch<R>;
}>;

type ScrollTarget = 'top' | Readonly<{ id: string }>;

const snapshotOf = <R extends AnyRoutes>(
  url: Readonly<URL>,
  pathname: string,
  match: RouteMatch<R>,
): Snapshot<R> =>
  ({
    location: {
      pathname,
      search: url.searchParams,
      hash: url.hash,
      href: url.href,
    },
    match,
  }) as const;

/**
 * Where a navigation from `before` to `after` scrolls: to the fragment when
 * there is one, to the top when the path changed, and nowhere when only the
 * search changed.
 */
const scrollTargetOf = (
  before: RouterLocation,
  after: RouterLocation,
): Optional<ScrollTarget> => {
  if (
    after.href === before.href ||
    (after.pathname === before.pathname && after.hash === before.hash)
  ) {
    return Optional.none;
  }

  return after.hash !== ''
    ? Optional.some({ id: fragmentId(after.hash) })
    : after.pathname === before.pathname
      ? Optional.none
      : Optional.some('top');
};
