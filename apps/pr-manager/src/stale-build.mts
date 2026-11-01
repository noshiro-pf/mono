/**
 * The page's code loaded after `main.tsx`, recovering from a build the site no
 * longer serves.
 *
 * Every push to `main` replaces the whole Pages site, so the hashed chunks of
 * the build before it are gone from the server. A page opened from the
 * browser's cache — Safari restoring a tab it discarded in the background does
 * this — still runs that build's `main.tsx`, whose `import()` of the rest then
 * fails, and the page stays blank until the reader reloads it. A reload asks
 * for `index.html` again, revalidated rather than taken from the cache, which
 * names the chunks the site serves now; so the page does it itself.
 *
 * At most once per {@link RETRY_AFTER_MS} in a tab, held in `sessionStorage`,
 * so that an import that fails for another reason (the network is down, or the
 * new build is broken) stops at its error rather than reloading for ever.
 * Where that storage cannot be read or written there is nothing to hold it by,
 * and the page does not reload.
 */

import type { KeyValueStore } from './token.mjs';

/**
 * What `load` gives, or `undefined` when it failed and the page is reloading,
 * in which case nothing more is to be done with it.
 */
export const importOrReload = async <T,>(
  load: () => Promise<T>,
  deps: StaleBuildDeps,
): Promise<T | undefined> => {
  try {
    const loaded = await load();

    forgetReload(deps.storage);

    return loaded;
  } catch (error: unknown) {
    if (!markReload(deps)) {
      throw error;
    }

    deps.reload();

    return undefined;
  }
};

/** The real surroundings: this tab's `sessionStorage` and `location`. */
export const browserStaleBuildDeps = (): StaleBuildDeps =>
  ({
    now: () => Date.now(),
    storage: sessionStore(),
    reload: () => {
      globalThis.location.reload();
    },
  }) as const;

export type StaleBuildDeps = Readonly<{
  now: () => number;
  /** Where the time of the last reload is kept; `undefined` where none is. */
  storage: KeyValueStore | undefined;
  reload: () => void;
}>;

const RELOAD_KEY = 'pr-manager:reloaded-for-stale-build-at';

/**
 * Long enough for a reload to have answered, short enough that the same tab
 * meets the next deploy with the reload still on offer.
 */
const RETRY_AFTER_MS = 60_000;

/**
 * Notes a reload about to be made, and says whether to make it: not when this
 * tab made one {@link RETRY_AFTER_MS} ago or less, and not when the note cannot
 * be kept. A note from the future — the clock was put back since — is no reason
 * to hold back.
 */
const markReload = ({ now, storage }: StaleBuildDeps): boolean => {
  if (storage === undefined) {
    return false;
  }

  try {
    const last = Number(storage.getItem(RELOAD_KEY) ?? Number.NaN);

    const nowMs = now();

    if (last <= nowMs && nowMs - last < RETRY_AFTER_MS) {
      return false;
    }

    storage.setItem(RELOAD_KEY, nowMs.toString());

    return true;
  } catch {
    return false;
  }
};

/**
 * This tab's `sessionStorage`, or `undefined` where it is refused: a browser
 * that blocks storage throws on reading the global itself, not on a call, so
 * the `try` is around the name (as `storageFor` in `token.mts`).
 */
const sessionStore = (): KeyValueStore | undefined => {
  try {
    return sessionStorage;
  } catch {
    return undefined;
  }
};

const forgetReload = (storage: KeyValueStore | undefined): void => {
  try {
    storage?.removeItem(RELOAD_KEY);
  } catch {
    // Nothing was noted where nothing can be.
  }
};
