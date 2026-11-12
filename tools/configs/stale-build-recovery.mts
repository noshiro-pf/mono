/**
 * Runs in the page, not in Node: `vite-app-config.mts` compiles it to a classic
 * script, `stale-build-recovery.js`, that `index.html` loads ahead of the app's
 * module script. It is outside the app's hashed module graph and imports
 * nothing at run time, so it is there to listen even when that graph is the
 * part that is gone, and `script-src 'self'` allows it.
 *
 * A deploy replaces the site, so the hashed chunks of the build before it are
 * gone from the server: the whole Pages site on every push to `main`, and the
 * Firebase-hosted apps' own sites on theirs. A page opened from the browser's
 * cache — Safari restoring a tab it discarded in the background does this —
 * still runs that build, and the chunks it asks for then fail to load, leaving
 * the page blank or broken until the reader reloads it. A reload asks for
 * `index.html` again, revalidated rather than taken from the cache, which names
 * the chunks the site serves now; so the page does it itself.
 *
 * It hears of a failure two ways: `vite:preloadError`, which Vite's preload
 * helper dispatches when an `import()` it wraps, or a file preloaded for it,
 * fails to load (the build fails on an `import()` the helper does not wrap,
 * `unwrappedDynamicImports` in `vite-app-config.mts`); and the `error` event
 * that a module script whose graph failed to load fires at its element — the
 * entry chunk, or a chunk it imports statically. Neither is cancelled: the
 * failure still surfaces as it would have, should the reload not come.
 *
 * It reloads only for a stale build: it fetches the page again, bypassing the
 * cache, and compares the entry script that page names with the one running. A
 * failure of the build still served — a module that throws as it runs, a
 * request that failed in passing — keeps the page and what the reader had on
 * it. Offline, or when the site cannot be reached, it waits for the browser to
 * be online again and checks then. It does nothing once the reader is leaving
 * the page, which makes a browser reject the imports still pending. And it
 * reloads at most once per {@link RETRY_AFTER_MS} in a tab and app, held in
 * `sessionStorage`, so that a new build that is itself broken stops at its
 * error rather than reloading for ever; where that storage cannot be read or
 * written there is nothing to hold it by, and the page does not reload.
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
  const mut_page = { leaving: false, recovering: false };

  globalThis.addEventListener('pagehide', () => {
    mut_page.leaving = true;
  });

  // A page restored from the back-forward cache is being shown again.
  globalThis.addEventListener('pageshow', () => {
    mut_page.leaving = false;
  });

  const recover = (): void => {
    // One at a time: a missing build fails several chunks at once.
    if (mut_page.recovering) {
      return;
    }

    mut_page.recovering = true;

    recoverFromStaleBuild({
      leaving: () => mut_page.leaving,
      online: () => navigator.onLine,
      checkBuild: checkServedBuild,
      waitForOnline: () =>
        new Promise<void>((resolve) => {
          globalThis.addEventListener(
            'online',
            () => {
              resolve();
            },
            { once: true },
          );
        }),
      now: () => Date.now(),
      storage: sessionStore(),
      storageKey,
      reload: () => {
        globalThis.location.reload();
      },
    })
      .finally(() => {
        mut_page.recovering = false;
      })
      // Nothing above throws; a failure would leave the page as it is.
      .catch(() => undefined);
  };

  globalThis.addEventListener('vite:preloadError', recover);

  // An element's `error` does not bubble, so it is heard in the capture phase.
  globalThis.addEventListener(
    'error',
    (event) => {
      const { target } = event;

      if (target instanceof HTMLScriptElement && target.type === 'module') {
        recover();
      }
    },
    true,
  );
};

/**
 * Reloads the page if the site serves another build than the one running (see
 * the top of this file), waiting for the network first when it is out of reach.
 *
 * @returns Whether the page is reloading.
 */
export const recoverFromStaleBuild = async (
  deps: RecoveryDeps,
): Promise<boolean> => {
  if (deps.leaving()) {
    return false;
  }

  const check: BuildCheck = deps.online()
    ? await deps.checkBuild()
    : 'unreachable';

  if (deps.leaving()) {
    return false;
  }

  switch (check) {
    case 'changed':
      return reloadForStaleBuild(deps);

    case 'unreachable':
      // Online again, the site may answer; one that does not while the browser
      // is online is not retried, as no `online` event comes.
      await deps.waitForOnline();

      return recoverFromStaleBuild(deps);

    case 'unchanged':
    case 'unknown':
      return false;
  }
};

/**
 * Notes a reload and makes it, unless this tab made one for this app
 * {@link RETRY_AFTER_MS} ago or less, or the note cannot be kept. A note from
 * the future — the clock was put back since — is no reason to hold back.
 *
 * @returns Whether the page is reloading.
 */
export const reloadForStaleBuild = ({
  now,
  storage,
  storageKey,
  reload,
}: StaleBuildDeps): boolean => {
  if (storage === undefined) {
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

/**
 * Whether the site serves another build than the one running, from the absolute
 * URLs of the two entry scripts; `unknown` when either is missing.
 */
export const compareEntries = (
  running: string | undefined,
  served: string | undefined,
): BuildCheck =>
  running === undefined || served === undefined
    ? 'unknown'
    : running === served
      ? 'unchanged'
      : 'changed';

/** What the page found when it asked the site which build it serves. */
export type BuildCheck = 'changed' | 'unchanged' | 'unknown' | 'unreachable';

/** The part of `Storage` this reads and writes. */
export type KeyValueStore = Readonly<
  StrictPick<Storage, 'getItem' | 'setItem'>
>;

export type StaleBuildDeps = Readonly<{
  now: () => number;
  /** Where the time of the last reload is kept; `undefined` where none is. */
  storage: KeyValueStore | undefined;
  storageKey: string;
  reload: () => void;
}>;

export type RecoveryDeps = StaleBuildDeps &
  Readonly<{
    /** `true` once the reader is leaving the page (`pagehide`). */
    leaving: () => boolean;
    /** `false` when the browser knows it has no network. */
    online: () => boolean;
    /** Asks the site which build it serves; see {@link compareEntries}. */
    checkBuild: () => Promise<BuildCheck>;
    /** Resolves when the browser is online again. */
    waitForOnline: () => Promise<void>;
  }>;

/**
 * Long enough for a reload to have answered, short enough that the same tab
 * meets the next deploy with the reload still on offer.
 */
const RETRY_AFTER_MS = 60_000;

/** The module script a document names, as an absolute URL. */
const entryScriptOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a DOM document, read only.
  doc: Document,
  baseUrl: string,
): string | undefined => {
  const src = doc
    .querySelector('script[type="module"][src]')
    ?.getAttribute('src');

  if (src === undefined || src === null) {
    return undefined;
  }

  const url = new URL(src, baseUrl);

  return url.href;
};

/**
 * Fetches this page again, bypassing the cache, and compares the entry script
 * it names with the one running.
 */
const checkServedBuild = async (): Promise<BuildCheck> => {
  const pageUrl = globalThis.location.href;

  const running = entryScriptOf(document, pageUrl);

  try {
    const response = await fetch(pageUrl, { cache: 'no-store' });

    if (!response.ok) {
      return 'unknown';
    }

    const parser = new DOMParser();

    const served = entryScriptOf(
      parser.parseFromString(await response.text(), 'text/html'),
      pageUrl,
    );

    return compareEntries(running, served);
  } catch {
    // `fetch` rejects only when the request could not be made at all.
    return 'unreachable';
  }
};

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
