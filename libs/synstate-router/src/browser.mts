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
  /** Scrolls to the element whose id is `id`, when there is one. */
  scrollToFragment: (id: string) => void;
}>;

/** A {@link RouterBrowser} in memory, with what a test reads of it. */
export type MemoryBrowser = RouterBrowser &
  Readonly<{
    /** The current URL. */
    url: () => URL;
    /** The scrolls so far, oldest first: `'top'`, or `#` and the id. */
    scrolls: () => readonly string[];
  }>;

/**
 * A browser that lives in memory, opened at `href`.
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
export const createMemoryBrowser = (href: string): MemoryBrowser => {
  const mut_history: { entries: readonly URL[]; index: number } = {
    entries: [new URL(href)],
    index: 0,
  };

  const mut_scrolls: string[] = [];

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
      mut_scrolls.push(`#${id}`);
    },
    url,
    scrolls: () => Array.from(mut_scrolls),
  };
};
