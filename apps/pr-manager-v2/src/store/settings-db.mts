/**
 * The page's own settings in IndexedDB: only the header's fold (spec §5), which
 * is how much room a screen has rather than a view worth a link, so it is kept
 * here rather than in the URL. v1's database, so the swap keeps it.
 *
 * Both reject when the browser has no IndexedDB or refuses it (a private window
 * can); callers treat that as nothing saved.
 */
export type SettingsDb = Readonly<{
  read: (key: string) => Promise<unknown>;
  write: (key: string, value: unknown) => Promise<void>;
}>;

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
