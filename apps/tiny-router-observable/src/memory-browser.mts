import { Arr } from 'ts-data-forge';
import type { RouterBrowser } from './router.mjs';

export type MemoryBrowser = RouterBrowser &
  Readonly<{
    /** The current URL. */
    url: () => URL;
  }>;

/**
 * A browser that lives in memory, opened at `href`: a `RouterBrowser` for a
 * router that runs without a window, such as a store under test.
 *
 * `pushState` and `replaceState` resolve a URL against the current one, as the
 * browser does. `go`, `back` and `forward` move through the entries and fire
 * `popstate` at once, where a browser would fire it a moment later.
 */
export const createMemoryBrowser = (href: string): MemoryBrowser => {
  const mut_history: { entries: readonly URL[]; index: number } = {
    entries: [new URL(href)],
    index: 0,
  };

  const mut_listeners = new Set<() => void>();

  const url = (): URL =>
    mut_history.entries[mut_history.index] ?? new URL(href);

  const go = (delta: number = 0): void => {
    const next = Math.min(
      Math.max(mut_history.index + delta, 0),
      mut_history.entries.length - 1,
    );

    if (next === mut_history.index) {
      return;
    }

    mut_history.index = next;

    for (const listener of mut_listeners) {
      listener();
    }
  };

  return {
    location: {
      get href() {
        return url().href;
      },
    },
    history: {
      pushState: (_data, _unused, next) => {
        mut_history.entries = Arr.toPushed(
          mut_history.entries.slice(0, mut_history.index + 1),
          new URL(next, url()),
        );

        mut_history.index += 1;
      },
      replaceState: (_data, _unused, next) => {
        mut_history.entries = mut_history.entries.with(
          mut_history.index,
          new URL(next, url()),
        );
      },
      go,
      forward: () => {
        go(1);
      },
      back: () => {
        go(-1);
      },
    },
    addEventListener: (_type, listener) => {
      mut_listeners.add(listener);
    },
    removeEventListener: (_type, listener) => {
      mut_listeners.delete(listener);
    },
    url,
  };
};
