/**
 * Runs in the page, not in Node: `vite-app-config.mts` puts it at the head of
 * the entry chunk of every app published to GitHub Pages, ahead of the app's
 * own code. It imports nothing at run time, so that it bundles the same from
 * here as from the app.
 *
 * Every push to `main` replaces the whole Pages site, so the hashed chunks of
 * the build before it are gone from the server. A page opened from the
 * browser's cache — Safari restoring a tab it discarded in the background does
 * this — still runs that build's entry chunk, whose `import()` of the rest then
 * fails, and the page stays blank until the reader reloads it. A reload asks
 * for `index.html` again, revalidated rather than taken from the cache, which
 * names the chunks the site serves now; so the page does it itself.
 *
 * It hears of the failure through `vite:preloadError`, the event Vite's preload
 * helper dispatches when an `import()` it wraps, or a file preloaded for it,
 * fails to load. The build fails on an `import()` the helper does not wrap
 * (`unwrappedDynamicImports` in `vite-app-config.mts`), so that none of them
 * escapes this. The event is not cancelled: the `import()` still rejects as it
 * would have, and its error is what the reader sees should the reload not come.
 *
 * At most once per {@link RETRY_AFTER_MS} in a tab and app, held in
 * `sessionStorage`, so that an import that fails for another reason (the
 * network is down, or the new build is broken) stops at its error rather than
 * reloading for ever. Where that storage cannot be read or written there is
 * nothing to hold it by, and the page does not reload.
 */

import type { StrictPick } from 'ts-type-forge';

/**
 * Listens, for the rest of the page's life, for a chunk that failed to load.
 *
 * @param storageKey Where the time of the last reload is noted. Every app on
 *   the Pages site shares one origin and so one `sessionStorage`, so the key
 *   names the app, lest a reload in one hold back another's.
 */
export const installStaleBuildRecovery = (storageKey: string): void => {
  globalThis.addEventListener('vite:preloadError', () => {
    reloadForStaleBuild({
      now: () => Date.now(),
      online: () => navigator.onLine,
      storage: sessionStore(),
      storageKey,
      reload: () => {
        globalThis.location.reload();
      },
    });
  });
};

/**
 * Notes a reload and makes it, unless this tab made one for this app
 * {@link RETRY_AFTER_MS} ago or less, or the note cannot be kept, or the
 * browser knows it is offline: then the chunk failed for want of a network, not
 * for being gone, and a reload would only trade the page, and whatever the
 * reader had done on it, for the browser's offline error. A note from the
 * future — the clock was put back since — is no reason to hold back.
 *
 * @returns Whether the page is reloading.
 */
export const reloadForStaleBuild = ({
  now,
  online,
  storage,
  storageKey,
  reload,
}: StaleBuildDeps): boolean => {
  if (storage === undefined || !online()) {
    return false;
  }

  try {
    const last = Number(storage.getItem(storageKey) ?? Number.NaN);

    const nowMs = now();

    if (last <= nowMs && nowMs - last < RETRY_AFTER_MS) {
      return false;
    }

    storage.setItem(storageKey, nowMs.toString());
  } catch {
    return false;
  }

  reload();

  return true;
};

/** The part of `Storage` this reads and writes. */
export type KeyValueStore = Readonly<
  StrictPick<Storage, 'getItem' | 'setItem'>
>;

export type StaleBuildDeps = Readonly<{
  now: () => number;
  /** `false` when the browser knows it has no network. */
  online: () => boolean;
  /** Where the time of the last reload is kept; `undefined` where none is. */
  storage: KeyValueStore | undefined;
  storageKey: string;
  reload: () => void;
}>;

/**
 * Long enough for a reload to have answered, short enough that the same tab
 * meets the next deploy with the reload still on offer.
 */
const RETRY_AFTER_MS = 60_000;

/**
 * This tab's `sessionStorage`, or `undefined` where it is refused: a browser
 * that blocks storage throws on reading the global itself, not on a call, so
 * the `try` is around the name.
 */
const sessionStore = (): KeyValueStore | undefined => {
  try {
    return sessionStorage;
  } catch {
    return undefined;
  }
};
