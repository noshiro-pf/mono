/**
 * The page's own settings, kept in IndexedDB.
 *
 * The header's fold is kept here (`header-store.mts`). What the page shows is
 * kept in the URL (`url.mts`), so that a link opens it the same way; whether
 * the header is folded is how much room this screen has to spare, not a way of
 * looking at the page worth sharing in a link. A database of the page's own
 * name rather than a `localStorage` key, since that one store is shared by
 * every app on the origin. Like `localStorage` it is per browser, and gone when
 * the site's data is cleared.
 *
 * Both functions reject when the browser has no IndexedDB or refuses it (a
 * private window can); the store treats that as nothing saved.
 */

export const readSetting = async (key: string): Promise<unknown> => {
  const database = await openDatabase();

  try {
    return await settled(() =>
      database.transaction(STORE, 'readonly').objectStore(STORE).get(key),
    );
  } finally {
    database.close();
  }
};

export const writeSetting = async (
  key: string,
  value: unknown,
): Promise<void> => {
  const database = await openDatabase();

  try {
    await settled(() =>
      database
        .transaction(STORE, 'readwrite')
        .objectStore(STORE)
        .put(value, key),
    );
  } finally {
    database.close();
  }
};

const DATABASE = 'pr-manager-app';

const STORE = 'settings';

/**
 * The database's version. Version 2 forgets the reports version 1 kept, every
 * repository's, under the keys `report:<owner>/<repo>`: earlier builds drew the
 * last one on opening, and nothing reads them any more. A tab still running
 * such a build cannot write one back, since it opens version 1, which the
 * browser refuses once the database is at 2.
 *
 * It only ever rises: a build that opens a lower version than a browser has
 * seen is refused every read and write there, which the header takes for
 * nothing saved. A revert of a version bump keeps the version.
 */
const VERSION = 2;

/**
 * The keys the reports were kept under, as bounds of a key range: every string
 * that starts with `report:` sorts between them.
 */
export const KEPT_REPORT_KEYS = ['report:', 'report:\u{FFFF}'] as const;

/** What the request `send` makes answers, as a promise. */
const settled = <T,>(send: () => IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    const request = send();

    request.addEventListener('success', () => {
      resolve(request.result);
    });

    request.addEventListener('error', () => {
      reject(request.error ?? new Error('IndexedDB request failed'));
    });
  });

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, VERSION);

    const mut_open = { blocked: false };

    request.addEventListener('upgradeneeded', ({ oldVersion }) => {
      if (oldVersion < 1) {
        request.result.createObjectStore(STORE);

        return;
      }

      const { transaction } = request;

      // Never `null` inside `upgradeneeded`. Thrown rather than skipped: the
      // open is then aborted and the upgrade tried again by the next, where a
      // skip would mark the reports forgotten while they stay on disk.
      if (transaction === null) {
        throw new Error('IndexedDB upgrade without its transaction');
      }

      transaction
        .objectStore(STORE)
        .delete(IDBKeyRange.bound(...KEPT_REPORT_KEYS));
    });

    // A tab of an older build holding version 1 open holds the upgrade, with no
    // end; the reader is better served by "nothing saved" at once. The
    // connection the open makes once that tab lets go is closed unused.
    request.addEventListener('blocked', () => {
      mut_open.blocked = true;

      reject(new Error('IndexedDB upgrade blocked by another tab'));
    });

    request.addEventListener('success', () => {
      if (mut_open.blocked) {
        request.result.close();
      } else {
        resolve(request.result);
      }
    });

    request.addEventListener('error', () => {
      reject(request.error ?? new Error('IndexedDB request failed'));
    });
  });
