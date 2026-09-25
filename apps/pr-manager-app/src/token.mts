/**
 * The token, which the page cannot read anything without.
 *
 * GitHub's GraphQL API answers nobody without one, and GraphQL is what makes
 * the page affordable: one query for every open pull request rather than
 * three REST requests for each. What the token needs is no permission at
 * all — the repository is public — so the panel asks for the weakest one
 * GitHub can mint. Nothing here ever sends it anywhere but `api.github.com`,
 * and the `Content-Security-Policy` the build writes into `index.html` is
 * what makes that a property of the page rather than a promise about its
 * code.
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

/**
 * Where the token is kept.
 *
 * `device` is `localStorage`: kept until it is cleared, and shared across
 * the whole origin. `session` is `sessionStorage`: this tab, until it
 * closes.
 *
 * Said here rather than on each member, which is where it was. A comment on
 * a union member does not survive `fix:codemod:full` — the first run drops
 * every one after the first, and each run after that doubles what is left,
 * so a file written that way can never come out of the check clean.
 */
export type TokenStore = 'device' | 'session';

export type StoredToken = Readonly<{ value: string; store: TokenStore }>;

/**
 * The part of `Storage` this needs, which is also the whole of what a test
 * has to stand in for. Taken as an argument rather than reached for, in the
 * same way and for the same reason as `Fetch` in `graphql.mts`: what is
 * left implicit is what no test reads.
 */
export type KeyValueStore = Readonly<{
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}>;

/** Either may be absent, which is a browser with storage turned off. */
export type TokenStores = ReadonlyRecord<TokenStore, KeyValueStore | undefined>;

export const browserStores = (): TokenStores =>
  ({
    device: storageFor('device'),
    session: storageFor('session'),
  }) as const;

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

  if (target === undefined) {
    return Result.err(UNAVAILABLE);
  }

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
