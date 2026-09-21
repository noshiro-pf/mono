/**
 * The optional token, and the one thing it buys.
 *
 * This page reads two JSON files out of a public repository and nothing
 * else, so a token gives it no data it could not already see. What it gives it is the
 * rate limit. GitHub allows an anonymous caller 60 requests an hour for the
 * whole address the browser sits behind and charges it for a `304` as well
 * as for a `200`, which is what holds the poll at two minutes. It allows an
 * authenticated caller 5,000 an hour and charges nothing at all for a `304`,
 * so the same page with a token can look every fifteen seconds and spend
 * less doing it.
 *
 * That is the whole of it, and two things follow. The page has to work
 * without a token, because it is a convenience rather than a requirement.
 * And the token may be the weakest one GitHub can mint — the limit is
 * charged to the account, not to what the token is allowed to reach — which
 * is why the panel asks for one with no permissions rather than one that can
 * read issues. Nothing here ever sends it anywhere but `api.github.com`, and
 * the `Content-Security-Policy` the build writes into `index.html` is what
 * makes that a property of the page rather than a promise about its code.
 *
 * **Where it is kept is the reader's choice, and the default is the cautious
 * one.** `sessionStorage` belongs to the one tab and is gone when the tab
 * closes. `localStorage` survives the browser being shut — and on GitHub
 * Pages it is shared far more widely than it looks, because
 * `noshiro-pf.github.io` is a single origin for every app published from
 * every one of this account's repositories. Anything stored there is
 * readable by all of them. Hence the opt-in, and hence a key too specific to
 * collide with one of theirs.
 */

import { Result } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';

export type TokenStore =
  /** `localStorage`: kept until it is cleared, shared across the origin. */
  | 'device'
  /** `sessionStorage`: this tab, until it closes. */
  | 'session';

export type StoredToken = Readonly<{ value: string; store: TokenStore }>;

/**
 * The part of `Storage` this needs, which is also the whole of what a test
 * has to stand in for. Taken as an argument rather than reached for, in the
 * same way and for the same reason as `Fetch` in `fetch-report.mts`: what is
 * left implicit is what no test reads.
 */
export type KeyValueStore = Readonly<{
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}>;

/** Either may be absent, which is a browser with storage turned off. */
export type TokenStores = ReadonlyRecord<TokenStore, KeyValueStore | undefined>;

export const browserStores = (): TokenStores => ({
  device: storageFor('device'),
  session: storageFor('session'),
});

/**
 * The token this browser is holding, if any.
 *
 * The tab is asked first so that a token typed into one tab wins over an
 * older one left on the device, which is the order that makes "paste a new
 * one" behave the way it reads.
 */
export const readToken = (
  stores: TokenStores = browserStores(),
): StoredToken | undefined =>
  readFrom(stores, 'session') ?? readFrom(stores, 'device');

/**
 * Keeps one token in one place. The other store is cleared first, so that
 * moving a token from the tab to the device — or back — cannot leave a
 * forgotten copy behind in the one the reader thought they had left.
 */
export const saveToken = (
  token: StoredToken,
  stores: TokenStores = browserStores(),
): Result<undefined, string> => {
  forgetToken(stores);

  const target = stores[token.store];

  if (target === undefined) return Result.err(UNAVAILABLE);

  try {
    target.setItem(KEY, token.value);

    return Result.ok(undefined);
  } catch {
    return Result.err(UNAVAILABLE);
  }
};

/** Removes it from both stores, which is what the reader is asking for. */
export const forgetToken = (stores: TokenStores = browserStores()): void => {
  removeFrom(stores, 'session');

  removeFrom(stores, 'device');
};

/**
 * Specific enough not to collide with another of this account's Pages apps,
 * which share the `noshiro-pf.github.io` origin and therefore share the
 * storage this writes to.
 */
const KEY =
  'github-token--pr-manager-app--218bd917-a944-41cf-80a1-3436918878f8';

const UNAVAILABLE =
  'This browser is not letting the page store anything, so the token cannot be kept. It will still be used until the page is reloaded.';

/**
 * Reading the property itself throws where a browser has turned storage off
 * rather than returning something empty, so this is a `try` around the
 * access and not only around the call.
 */
const storageFor = (store: TokenStore): KeyValueStore | undefined => {
  try {
    return store === 'device' ? localStorage : sessionStorage;
  } catch {
    return undefined;
  }
};

const readFrom = (
  stores: TokenStores,
  store: TokenStore,
): StoredToken | undefined => {
  try {
    const value = stores[store]?.getItem(KEY);

    return value === null || value === undefined || value === ''
      ? undefined
      : { value, store };
  } catch {
    return undefined;
  }
};

const removeFrom = (stores: TokenStores, store: TokenStore): void => {
  try {
    stores[store]?.removeItem(KEY);
  } catch {
    // A store that will not answer cannot be holding a token either.
  }
};
