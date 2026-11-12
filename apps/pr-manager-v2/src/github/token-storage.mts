import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * Where the token is kept (spec §3): `session` is `sessionStorage`, this tab
 * until it closes, and the default; `device` is `localStorage`, which on
 * GitHub Pages every app under `noshiro-pf.github.io` shares, so it is the
 * reader's opt-in. The key is v1's, so the swap keeps a remembered token.
 */
export type TokenPlace = 'device' | 'session';

export type StoredToken = Readonly<{ value: string; place: TokenPlace }>;

/** The part of `Storage` used, so a test can pass a map. */
export type KeyValueStore = Readonly<{
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}>;

/** A store the browser refuses (a private window can) is `undefined`. */
export type TokenStores = ReadonlyRecord<TokenPlace, KeyValueStore | undefined>;

export const browserTokenStores = (): TokenStores =>
  ({
    device: storageOrUndefined(() => localStorage),
    session: storageOrUndefined(() => sessionStorage),
  }) as const;

/** The session's token first, then the device's. */
export const readToken = (stores: TokenStores): StoredToken | undefined =>
  readFrom(stores, 'session') ?? readFrom(stores, 'device');

/** Keeps `token` where it asks to be, and nowhere else. */
export const saveToken = (
  stores: TokenStores,
  token: StoredToken,
): Result<undefined, string> => {
  forgetToken(stores);

  try {
    const target = stores[token.place];

    if (target === undefined) {
      return Result.err(UNAVAILABLE);
    }

    target.setItem(TOKEN_KEY, token.value);

    return Result.ok(undefined);
  } catch {
    return Result.err(UNAVAILABLE);
  }
};

export const forgetToken = (stores: TokenStores): void => {
  for (const place of PLACES) {
    try {
      stores[place]?.removeItem(TOKEN_KEY);
    } catch {
      // A store that will not answer is not holding a token either.
    }
  }
};

export const TOKEN_KEY =
  'github-token--pr-manager-app--218bd917-a944-41cf-80a1-3436918878f8';

const PLACES = ['session', 'device'] as const;

const UNAVAILABLE =
  'This browser is not letting the page store anything, so the token cannot be kept. It is still used until the page is reloaded.';

const storageOrUndefined = (
  get: () => KeyValueStore,
): KeyValueStore | undefined => {
  try {
    return get();
  } catch {
    return undefined;
  }
};

const readFrom = (
  stores: TokenStores,
  place: TokenPlace,
): StoredToken | undefined => {
  try {
    const value = stores[place]?.getItem(TOKEN_KEY) ?? '';

    return value === '' ? undefined : { value, place };
  } catch {
    return undefined;
  }
};
