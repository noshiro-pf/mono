import { Arr } from 'ts-data-forge';
import { fragmentId, withHash } from './internal/index.mjs';

/**
 * What the router reads and writes of the browser: the URL, the session
 * history, its `popstate` event, and scrolling. The real window is the default;
 * {@link createMemoryBrowser} is one that lives in memory, for a test or
 * anything else that runs without a window.
 */
export type RouterBrowser = Readonly<{
  /** The current URL. */
  location: Readonly<{ href: string }>;
  history: Readonly<{
    pushState: (data: unknown, unused: string, url: string) => void;
    replaceState: (data: unknown, unused: string, url: string) => void;
    /** Moves through the history; the URL changes when `popstate` fires. */
    go: (delta: number) => void;
  }>;
  /**
   * `location.hash = hash`: a fragment navigation, which the browser scrolls
   * for and marks `:target` on.
   */
  setHash: (hash: string) => void;
  addEventListener: (type: 'popstate', listener: () => void) => void;
  removeEventListener: (type: 'popstate', listener: () => void) => void;
  /** Runs `callback` once the new page has been drawn. */
  afterRender: (callback: () => void) => void;
  scrollToTop: () => void;
  /**
   * Scrolls to the element whose id is `id`, and returns whether there was one:
   * a page not drawn yet may not have it.
   */
  scrollToFragment: (id: string) => boolean;
  /**
   * Calls `changed` after the document changes and `userScrolled` when the user
   * starts scrolling the page, until the returned function is called: how the
   * router finds the element of a fragment that a page draws after its first
   * commit, behind a `Suspense` boundary or once its data has come, and gives
   * it up once the user has moved the page themselves. Left out, such a
   * fragment is looked for by `flushScroll` alone.
   */
  observeDocument?: (on: DocumentObserver) => () => void;
  /**
   * The document's title, which the router sets from the `title` in the matched
   * nodes' `meta`. Left out, the router sets none.
   */
  documentTitle?: Readonly<{ get: () => string; set: (title: string) => void }>;
  /**
   * Whether the scroll position of this document load is restored by someone
   * other than the router: the browser, or an app that restores it itself,
   * after a reload or back or forward to the document.
   */
  restoresScroll: () => boolean;
}>;

/** What {@link RouterBrowser}'s `observeDocument` calls. */
export type DocumentObserver = Readonly<{
  /** The document has changed: an element added, or an id given. */
  changed: () => void;
  /** The user has started scrolling: a wheel, a touch, a key or a pointer. */
  userScrolled: () => void;
}>;

/** A {@link RouterBrowser} in memory, with what a test reads of it. */
export type MemoryBrowser = RouterBrowser &
  Readonly<{
    /** The current URL. */
    url: () => URL;
    /** The scrolls so far, oldest first: `'top'`, or `#` and the id. */
    scrolls: () => readonly string[];
    /** The document's title. */
    title: () => string;
  }>;

export type MemoryBrowserOptions = Readonly<{
  /**
   * Whether the document has an element with the id, for `scrollToFragment`.
   * Every id is there when left out.
   */
  hasElement?: (id: string) => boolean;
  /** What `restoresScroll` returns: `false` when left out. */
  restoresScroll?: boolean;
  /** The document's title at first: `''` when left out. */
  title?: string;
  /**
   * The browser's `observeDocument`, which a test calls from where it draws an
   * element or scrolls. Left out, the browser has none.
   */
  observeDocument?: (on: DocumentObserver) => () => void;
}>;

/**
 * A browser that lives in memory, opened at `href`, as a document loaded by a
 * link is.
 *
 * It keeps the timing of a real one, so that a test does not depend on a
 * stronger promise than a browser gives: `go` moves through the entries in a
 * later task (`setTimeout`), firing `popstate` there, and `afterRender` runs
 * its callback in a later task too. `pushState`, `replaceState` and `setHash`
 * change the URL at once, and `setHash` fires `popstate` at once, as a fragment
 * navigation does.
 *
 * @example
 *
 * ```ts
 * const browser = createMemoryBrowser('https://example.com/');
 *
 * browser.history.pushState(null, '', '/products/');
 *
 * assert.strictEqual(browser.url().pathname, '/products/');
 *
 * browser.history.go(-1);
 *
 * // A browser moves through the history in a later task.
 * assert.strictEqual(browser.url().pathname, '/products/');
 *
 * await new Promise((resolve) => {
 *   setTimeout(resolve, 0);
 * });
 *
 * assert.strictEqual(browser.url().pathname, '/');
 * ```
 */
export const createMemoryBrowser = (
  href: string,
  options?: MemoryBrowserOptions,
): MemoryBrowser => {
  const hasElement = options?.hasElement ?? (() => true);

  const mut_history: { entries: readonly URL[]; index: number } = {
    entries: [new URL(href)],
    index: 0,
  };

  const mut_scrolls: string[] = [];

  const mut_title = { current: options?.title ?? '' };

  const mut_listeners = new Set<() => void>();

  const url = (): URL =>
    mut_history.entries[mut_history.index] ?? new URL(href);

  const firePopstate = (): void => {
    for (const listener of mut_listeners) {
      listener();
    }
  };

  const pushEntry = (next: Readonly<URL>): void => {
    mut_history.entries = Arr.toPushed(
      mut_history.entries.slice(0, mut_history.index + 1),
      next,
    );

    mut_history.index += 1;
  };

  return {
    location: {
      get href() {
        return url().href;
      },
    },
    history: {
      pushState: (_data, _unused, next) => {
        pushEntry(new URL(next, url()));
      },
      replaceState: (_data, _unused, next) => {
        mut_history.entries = mut_history.entries.with(
          mut_history.index,
          new URL(next, url()),
        );
      },
      go: (delta) => {
        setTimeout(() => {
          // A browser converts the delta to an integer, NaN to 0.
          const next =
            mut_history.index +
            (Number.isFinite(delta) ? Math.trunc(delta) : 0);

          // A browser ignores a move past either end.
          if (
            next === mut_history.index ||
            next < 0 ||
            mut_history.entries.length <= next
          ) {
            return;
          }

          mut_history.index = next;

          firePopstate();
        }, 0);
      },
    },
    setHash: (hash) => {
      const next = withHash(url().href, hash);

      if (next.href !== url().href) {
        pushEntry(next);

        firePopstate();
      }

      mut_scrolls.push(`#${fragmentId(next.hash)}`);
    },
    addEventListener: (_type, listener) => {
      mut_listeners.add(listener);
    },
    removeEventListener: (_type, listener) => {
      mut_listeners.delete(listener);
    },
    afterRender: (callback) => {
      setTimeout(callback, 0);
    },
    scrollToTop: () => {
      mut_scrolls.push('top');
    },
    scrollToFragment: (id) => {
      if (!hasElement(id)) {
        return false;
      }

      mut_scrolls.push(`#${id}`);

      return true;
    },
    restoresScroll: () => options?.restoresScroll ?? false,
    documentTitle: {
      get: () => mut_title.current,
      set: (title) => {
        mut_title.current = title;
      },
    },
    ...(options?.observeDocument === undefined
      ? {}
      : { observeDocument: options.observeDocument }),
    url,
    scrolls: () => Array.from(mut_scrolls),
    title: () => mut_title.current,
  };
};
