import type { Repo } from '../domain/index.mjs';

/**
 * The page's own settings in IndexedDB: the header's fold (spec §5) and the
 * stacks folded in the merge order (§7.4), which are how much room a reader
 * wants rather than a view worth a link, so they are kept here rather than in
 * the URL. v1's database and keys, so the swap keeps them.
 *
 * Each rejects when the browser has no IndexedDB or refuses it (a private
 * window can); callers treat that as nothing saved.
 */
export type SettingsDb = Readonly<{
  read: (key: string) => Promise<unknown>;
  write: (key: string, value: unknown) => Promise<void>;
  /**
   * Replaces what `key` holds with what `change` makes of it, in one
   * transaction: no other tab's write comes between the read and the write, so
   * a tab saving its change this way never undoes what another saved.
   */
  update: (key: string, change: (stored: unknown) => unknown) => Promise<void>;
}>;

/**
 * Where the stacks folded in a repository's merge order are kept: one key each,
 * since pull request numbers mean nothing outside their repository. GitHub
 * matches owner and name without regard to case, so they are lower-cased.
 */
export const stackFoldsKey = (repo: Repo): string =>
  `stack-folds:${repo.owner.toLowerCase()}/${repo.name.toLowerCase()}` as const;

export const browserSettingsDb: SettingsDb = {
  read: async (key) => {
    const db = await open();

    try {
      return await settled(() =>
        db.transaction(STORE, 'readonly').objectStore(STORE).get(key),
      );
    } finally {
      db.close();
    }
  },
  write: async (key, value) => {
    const db = await open();

    try {
      await settled(() =>
        db.transaction(STORE, 'readwrite').objectStore(STORE).put(value, key),
      );
    } finally {
      db.close();
    }
  },
  update: async (key, change) => {
    const db = await open();

    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE, 'readwrite');

        const store = transaction.objectStore(STORE);

        const read = store.get(key);

        // `put` from the `get`'s own listener, while the transaction is sure to
        // be active; after an `await` it is only in browsers that keep it so
        // through microtasks.
        read.addEventListener('success', () => {
          store.put(change(read.result), key);
        });

        transaction.addEventListener('complete', () => {
          resolve();
        });

        transaction.addEventListener('error', () => {
          reject(transaction.error ?? new Error('IndexedDB request failed'));
        });

        transaction.addEventListener('abort', () => {
          reject(
            transaction.error ?? new Error('IndexedDB transaction aborted'),
          );
        });
      });
    } finally {
      db.close();
    }
  },
} as const;

const DATABASE = 'pr-manager-app';

const STORE = 'settings';

/**
 * v1's version. It only ever rises: a lower one than a browser has seen is
 * refused every read and write there.
 */
const VERSION = 2;

const settled = async <T,>(send: () => IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    const request = send();

    request.addEventListener('success', () => {
      resolve(request.result);
    });

    request.addEventListener('error', () => {
      reject(request.error ?? new Error('IndexedDB request failed'));
    });
  });

const open = async (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, VERSION);

    let mut_settled = false;

    request.addEventListener('upgradeneeded', ({ oldVersion }) => {
      if (oldVersion < 1) {
        request.result.createObjectStore(STORE);

        return;
      }

      // Version 1 kept whole reports under `report:<owner>/<repo>`, which
      // nothing reads any more.
      request.transaction
        ?.objectStore(STORE)
        .delete(IDBKeyRange.bound('report:', 'report:\u{FFFF}'));
    });

    // A tab of an older build holding version 1 open would hold this open with
    // no end; "nothing saved" at once serves the reader better.
    request.addEventListener('blocked', () => {
      mut_settled = true;

      reject(new Error('IndexedDB upgrade blocked by another tab'));
    });

    request.addEventListener('success', () => {
      // A request that was blocked has already settled as a failure; the
      // connection it opens once the other tab lets go has nobody to use it,
      // and left open it would block the next upgrade in turn.
      if (mut_settled) {
        request.result.close();

        return;
      }

      resolve(request.result);
    });

    request.addEventListener('error', () => {
      reject(request.error ?? new Error('IndexedDB request failed'));
    });
  });
