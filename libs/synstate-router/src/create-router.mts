import {
  createScope,
  createState,
  keepEqualParts,
  map,
  untracked,
  type InitializedObservable,
  type Observable,
} from 'synstate';
import { isNonNullObject, Optional } from 'ts-data-forge';
import type {
  DeepReadonly,
  ReadonlyRecord,
  RelaxedExclude,
  StrictOmit,
} from 'ts-type-forge';
import type { RouterBrowser } from './browser.mjs';
import { matchRoutes } from './define-routes.mjs';
import type { PageMatch } from './href-with-search.mjs';
import type { Href } from './href.mjs';
import {
  canonicalPathname,
  fragmentId,
  globalBrowser,
  isAtOrBelow,
  isDevelopment,
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
import { matchedBranch } from './matched-branch.mjs';
import type {
  AnyRouteNode,
  AnyRoutes,
  AnySearchCodec,
  RouteBranch,
  RouteDefinitions,
  RouteMatch,
  RouteNodeValues,
  RouteSearch,
  RouteTitle,
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
   *
   * `location` is the URL being resolved, with its path canonicalized: the one
   * a `push`, `replace` or `setSearch` goes to, not the one the browser is at
   * yet. A redirect from a URL that matches no page can carry its query and
   * hash with it.
   */
  redirect?: (
    match: RouteMatch<R>,
    location: RouterLocation,
  ) => Href | undefined;
}>;

/**
 * The history state to write with a `push` or `replace`, next to the `Href`:
 * the value the destination page's `state` codec encodes. A page that declares
 * no state, or a destination a redirect changed, gets none.
 */
export type StateOptions = Readonly<{ state?: unknown }>;

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
   * The nodes from the top of the tree down to the page, with their `meta` and
   * `Href`s ({@link matchedBranch}), for a breadcrumb or a title. It follows
   * `match`, and keeps its references while the branch stays the same.
   */
  branch: InitializedObservable<RouteBranch<R>>;

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
  push: (href: Href, options?: StateOptions) => void;

  /** Goes to `href`, replacing the current history entry. */
  replace: (href: Href, options?: StateOptions) => void;

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
   * function that stops it; following also ends when `href$` completes (a move
   * it queued just before still happens) or the router is disposed, and after
   * `dispose` it follows nothing.
   */
  follow: (href$: Observable<Href>, options?: NavigateOptions) => () => void;

  /**
   * Makes the scroll a navigation scheduled (to the fragment, or to the top),
   * now. For a binding's `Routes`, which calls it once the new page is in the
   * document; without one, the router makes it after the next frame. The URL
   * the page was loaded at counts as a navigation when it has a fragment. A
   * fragment whose element is not in the document yet is looked for again by
   * every later call and, where the browser can observe the document, as soon
   * as the page draws it, until the location changes, the user scrolls, or
   * {@link maxFragmentWaitMs} pass: the frame can run before a binding has drawn
   * the page, and a page behind a `Suspense` boundary commits its fallback
   * first.
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
 * How long, in milliseconds, the router waits for the element of a fragment it
 * was asked to scroll to, while the location stays: a page behind a `Suspense`
 * boundary, or one waiting for its data, draws it after its first commit.
 */
export const maxFragmentWaitMs = 10_000;

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

    const found = snapshotOf(
      url,
      pathname,
      matchRoutes(routes, { pathname, search: url.search }),
    );

    // The location handed over is the one the snapshot keeps, the same object
    // `router.location` passes on, read-only by its type.
    const to = redirect?.(found.match, found.location);

    if (to === undefined) {
      return found;
    }

    const next = new URL(toUrl(to), url);

    if (next.href === url.href) {
      return found;
    }

    if (redirects >= maxRedirects) {
      console.error(
        `synstate-router: stopped after ${maxRedirects} redirects in a row, at ${url.href} (next: ${next.href})`,
      );

      return found;
    }

    return { ...resolve(next, redirects + 1), redirected: true } as const;
  };

  /**
   * `snapshot` with the page's typed state read from `raw`, the entry's state
   * as the browser stores it; none across a redirect.
   */
  const withState = (snapshot: Snapshot<R>, raw: unknown): Snapshot<R> => {
    const { match: m } = snapshot;

    if (m.route === undefined) {
      return snapshot;
    }

    const codec = routes[routeTreeKey].stateCodecOf(m.route);

    if (codec === undefined) {
      return snapshot;
    }

    const decoded =
      raw === undefined || raw === null || snapshot.redirected
        ? Optional.none
        : codec.decode(raw);

    const state = Optional.isSome(decoded) ? decoded.value : undefined;

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the page declares a state, so its match has one
    const withValue: RouteMatch<R> = { ...m, state } as RouteMatch<R>;

    return { ...snapshot, match: withValue } as const;
  };

  /** Whether the page of `m` declares a history state. */
  const declaresState = (m: RouteMatch<R>): boolean =>
    m.route !== undefined &&
    routes[routeTreeKey].stateCodecOf(m.route) !== undefined;

  /** What a new entry stores for `next`: `value` encoded by its page's codec. */
  const encodeStateFor = (next: Snapshot<R>, value: unknown): unknown => {
    if (next.redirected || next.match.route === undefined) {
      return null;
    }

    const codec = routes[routeTreeKey].stateCodecOf(next.match.route);

    return codec === undefined
      ? null
      : // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the caller's value, for the page's codec; the match decodes it back
        codec.encode(value as never);
  };

  /** The current URL, rewritten first when it is not where it leads. */
  const read = (): Snapshot<R> => {
    const current = new URL(browser.location.href);

    const raw = browser.history.state;

    const snapshot = withState(resolve(current, 0), raw);

    if (snapshot.location.href !== current.href) {
      // Canonicalizing keeps the entry's state; a redirect drops it.
      browser.history.replaceState(
        snapshot.redirected ? null : (raw ?? null),
        '',
        snapshot.location.href,
      );
    }

    return snapshot;
  };

  // Every observable of the router is made outside every scope: the router
  // outlives a component, a test or a `scope.run` that happened to create it,
  // and so does what `at` and `isActive` cache.
  const [snapshot$, setSnapshot, { getSnapshot }] = untracked(() =>
    createState(read(), {
      // The entry's state is not in the URL: a replace to the same URL with
      // another state is a change.
      equals: (a, b) =>
        a.location.href === b.location.href &&
        valuesEqual(
          Reflect.get(a.match, 'state'),
          Reflect.get(b.match, 'state'),
        ),
    }),
  );

  const update = (): void => {
    setSnapshot(read());
  };

  const match = untracked(() =>
    snapshot$.pipe(map((s) => s.match)).pipe(keepEqualParts<RouteMatch<R>>()),
  );

  const location = untracked(() => snapshot$.pipe(map((s) => s.location)));

  // Made when first read: a router that never reads it does no work for it on
  // each navigation.
  const mut_branch: {
    observable: InitializedObservable<RouteBranch<R>> | undefined;
  } = {
    observable: undefined,
  };

  const branchOf = (): InitializedObservable<RouteBranch<R>> => {
    mut_branch.observable ??= untracked(() =>
      match
        .pipe(map((m) => matchedBranch(routes, m)))
        .pipe(keepEqualParts<RouteBranch<R>>()),
    );

    return mut_branch.observable;
  };

  // The document's title

  // The title the document had before the router set one: what a page with no
  // title of its own goes back to.
  const mut_title: { original: string | undefined; set: string | undefined } = {
    original: undefined,
    set: undefined,
  };

  // A tree that declares no title costs nothing on a navigation.
  const declaresTitle = definesTitle(routes[routeTreeKey].definition);

  const stopTitle = untracked(() =>
    match.subscribe((m) => {
      const { documentTitle } = browser;

      if (documentTitle === undefined || !declaresTitle) {
        return;
      }

      const title = titleOf(matchedBranch(routes, m), m);

      if (title === undefined) {
        // A router that never set a title leaves the app's own alone.
        if (mut_title.set !== undefined) {
          documentTitle.set(mut_title.original ?? '');

          mut_title.set = undefined;
        }

        return;
      }

      if (mut_title.set === undefined) {
        mut_title.original = documentTitle.get();
      }

      mut_title.set = title;

      documentTitle.set(title);
    }),
  );

  // Scrolling

  const mut_scroll: {
    pending: Optional<ScrollTarget>;
    /** Whether a frame is queued to make `pending`. */
    frameQueued: boolean;
    /**
     * A fragment whose element was not in the document when its scroll was
     * made. The page can draw it later: the frame can run before a binding has
     * drawn the page, and a page behind a `Suspense` boundary commits its
     * fallback first. So it is looked for again by every `flushScroll` and on
     * every change of the document, until it is found, the location changes,
     * the user scrolls, or {@link maxFragmentWaitMs} pass.
     */
    missed: Optional<string>;
    /** Stops watching the document for `missed`, and its time limit. */
    stopWaiting: () => void;
  } = {
    pending: Optional.none,
    frameQueued: false,
    missed: Optional.none,
    stopWaiting: () => {},
  };

  const forgetMissed = (): void => {
    mut_scroll.missed = Optional.none;

    const stop = mut_scroll.stopWaiting;

    mut_scroll.stopWaiting = () => {};

    stop();
  };

  const waitFor = (id: string): void => {
    forgetMissed();

    mut_scroll.missed = Optional.some(id);

    const stopObserving = browser.observeDocument?.({
      changed: () => {
        if (browser.scrollToFragment(id)) {
          forgetMissed();
        }
      },
      // The page is where the user put it now, not where the URL said.
      userScrolled: forgetMissed,
    });

    // Armed with or without an observer of the document: `flushScroll` looks
    // again too. A memory browser finds every fragment unless a test says
    // otherwise, so a server render does not wait on this timer.
    const timer = setTimeout(forgetMissed, maxFragmentWaitMs);

    mut_scroll.stopWaiting = () => {
      clearTimeout(timer);

      stopObserving?.();
    };
  };

  // Any change of the location, and only that: a replace to the same URL is not
  // one.
  const stopMissed = untracked(() =>
    snapshot$.subscribe(() => {
      forgetMissed();
    }),
  );

  const makeScroll = (): void => {
    const { pending, missed } = mut_scroll;

    mut_scroll.pending = Optional.none;

    if (Optional.isNone(pending)) {
      if (Optional.isSome(missed) && browser.scrollToFragment(missed.value)) {
        forgetMissed();
      }

      return;
    }

    forgetMissed();

    // The top needs no element: a page still drawing its fallback is scrolled
    // to the top as well as the page itself would be.
    if (pending.value === 'top') {
      browser.scrollToTop();

      return;
    }

    if (!browser.scrollToFragment(pending.value.id)) {
      waitFor(pending.value.id);
    }
  };

  const flushScroll = (): void => {
    makeScroll();
  };

  const scheduleScroll = (target: ScrollTarget): void => {
    mut_scroll.pending = Optional.some(target);

    if (mut_scroll.frameQueued) {
      return;
    }

    mut_scroll.frameQueued = true;

    browser.afterRender(() => {
      mut_scroll.frameQueued = false;

      makeScroll();
    });
  };

  // The browser's own scroll to the fragment of the URL it loaded ran before
  // the page was drawn, while there was no element to scroll to. A reload, or
  // back or forward to this document, is the browser's to restore instead.
  const startHash = getSnapshot().location.hash;

  if (startHash !== '' && !browser.restoresScroll()) {
    scheduleScroll({ id: fragmentId(startHash) });
  }

  // Navigation

  const navigate = (
    href: Href,
    replace: boolean,
    scrolls: boolean,
    entryState: EntryState,
  ): void => {
    const before = getSnapshot().location;

    const current = new URL(browser.location.href);

    const target = new URL(toUrl(href), current);

    if (
      !replace &&
      !(entryState.kind === 'value' && declaresState(getSnapshot().match)) &&
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
    const resolved = resolve(target, 0);

    const raw =
      entryState.kind === 'value'
        ? encodeStateFor(resolved, entryState.value)
        : entryState.kind === 'keep' && !resolved.redirected
          ? (browser.history.state ?? null)
          : null;

    const next = withState(resolved, raw);

    if (
      isDevelopment &&
      raw !== null &&
      entryState.kind === 'value' &&
      next.match.route !== undefined &&
      Reflect.get(next.match, 'state') === undefined
    ) {
      console.warn(
        `synstate-router: ${next.match.route}: the state given does not read back through its codec, and is read as absent`,
      );
    }

    if (
      replace ||
      target.href === current.href ||
      next.location.href === current.href
    ) {
      browser.history.replaceState(raw, '', next.location.href);
    } else {
      browser.history.pushState(raw, '', next.location.href);
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
      // The same page: its state stays.
      keepState,
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

  // Owns the `follow` subscriptions, so that `dispose` ends them and one whose
  // observable completed is forgotten.
  const follows = createScope();

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

    // In the router's own scope, not whichever one happens to be running.
    const subscription = follows.run(() =>
      href$.subscribe((href) => {
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
          if (mut_follow.active && !mut_router.disposed) {
            navigate(href, navigateOptions?.replace ?? false, true, noState);
          }
        });
      }),
    );

    mut_follow.subscribing = false;

    const stop = (): void => {
      mut_follow.active = false;

      subscription.unsubscribe();
    };

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
    get branch() {
      return branchOf();
    },
    at,
    isActive,
    push: (href, stateOptions) => {
      navigate(href, false, true, entryStateOf(stateOptions));
    },
    replace: (href, stateOptions) => {
      navigate(href, true, true, entryStateOf(stateOptions));
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

      follows.dispose();

      mut_scroll.pending = Optional.none;

      forgetMissed();

      stopMissed.unsubscribe();

      stopTitle.unsubscribe();
    },
  };
};

type Snapshot<R extends AnyRoutes> = Readonly<{
  location: RouterLocation;
  match: RouteMatch<R>;
  /** Whether a redirect led here: the state given for the URL asked is not this page's. */
  redirected: boolean;
}>;

type ScrollTarget = 'top' | Readonly<{ id: string }>;

/** What a navigation writes as the new entry's state. */
type EntryState = Readonly<
  { kind: 'value'; value: unknown } | { kind: 'keep' } | { kind: 'none' }
>;

const keepState: EntryState = { kind: 'keep' } as const;

const noState: EntryState = { kind: 'none' } as const;

const entryStateOf = (options: StateOptions | undefined): EntryState =>
  options?.state === undefined
    ? noState
    : ({ kind: 'value', value: options.state } as const);

/** Whether some node of `definitions` has a `meta.title`. */
const definesTitle = (definitions: RouteDefinitions): boolean =>
  Object.values(definitions).some(
    (definition) =>
      definition.meta?.title !== undefined ||
      definesTitle(definition.children ?? {}),
  );

/** The title of the deepest node of `branch` that has one. */
const titleOf = <R extends AnyRoutes>(
  branch: RouteBranch<R>,
  match: RouteMatch<R>,
): string | undefined => {
  if (match.route === undefined) {
    return undefined;
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- `route` is not undefined, which a generic match does not narrow by
  const page = match as PageMatch<R>;

  for (const { meta } of branch.toReversed()) {
    const title: unknown = isNonNullObject(meta)
      ? Reflect.get(meta, 'title')
      : undefined;

    if (typeof title === 'string') {
      return title;
    }

    if (typeof title === 'function') {
      // The type of `meta.title` was checked against `RouteMeta`.
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- see above
      return (title as RelaxedExclude<RouteTitle, string>)({
        params: page.params,
        search: page.search,
      });
    }
  }

  return undefined;
};

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
    redirected: false,
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
