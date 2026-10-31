/**
 * The page's own settings, kept in IndexedDB.
 *
 * Only the header's fold is kept here (`header-store.mts`). What the page
 * shows is kept in the URL (`url.mts`), so that a link opens it the same
 * way; whether the header is folded is how much room this screen has to
 * spare, not a way of looking at the page worth sharing in a link. A
 * database of the page's own name rather than a
 * `localStorage` key, since that one store is shared by every app on the
 * origin. Like `localStorage` it is per browser, and gone when the site's
 * data is cleared.
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
  settled(() => {
    const request = indexedDB.open(DATABASE, 1);

    request.addEventListener('upgradeneeded', () => {
      request.result.createObjectStore(STORE);
    });

    return request;
  });
