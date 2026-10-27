/**
 * The reader's token, and the form they give it in.
 *
 * Read from storage once, when the store is made, so that a reader who
 * ticked "remember" does not have to paste it again. After that the store
 * is the one copy that is changed, and storage follows it: once started,
 * each change of `token` is written through `token.mts`, so no action has
 * to remember to write both.
 */

import {
  createState,
  empty,
  map,
  switchMap,
  withInitialValue,
  type InitializedObservable,
} from 'synstate';
import { Result } from 'ts-data-forge';
import {
  forgetToken,
  readToken,
  saveToken,
  type StoredToken,
  type TokenStores,
} from '../token.mjs';

export type TokenStore = Readonly<{
  token: InitializedObservable<StoredToken | undefined>;
  /** Said out loud only when the browser refused to keep the token. */
  saveError: InitializedObservable<string | undefined>;
  /** What is in the field, not yet submitted. */
  typed: InitializedObservable<string>;
  remember: InitializedObservable<boolean>;
  setTyped: (typed: string) => void;
  setRemember: (remember: boolean) => void;
  /**
   * Keeps what was typed. Kept even when the browser refuses to store it: a
   * token that works for as long as the tab is open is still the thing the
   * reader asked for, and `saveError` is what says the rest.
   */
  submit: () => void;
  forget: () => void;
  /** Starts writing each change of `token` to storage; returns what stops it. */
  start: () => () => void;
}>;

export const createTokenStore = (stores: TokenStores): TokenStore => {
  const [token, setToken] = createState<StoredToken | undefined>(
    readToken(stores),
  );

  // Written to storage only while started; switching away stops it.
  const [started, setStarted] = createState(false);

  // What writing each change of `token` to storage said. The first one is the
  // value just read from storage, and writing it back is a write of what is
  // already there.
  const saveError = started
    .pipe(
      switchMap((isStarted) =>
        isStarted
          ? token.pipe(map((next) => persist(next, stores)))
          : empty<string | undefined>(),
      ),
    )
    .pipe(withInitialValue(undefined));

  const [typed, setTypedState, { getSnapshot: getTyped }] = createState('');

  const [remember, setRememberState, { getSnapshot: getRemember }] =
    createState(false);

  const setTyped = (next: string): void => {
    setTypedState(next);
  };

  const setRemember = (next: boolean): void => {
    setRememberState(next);
  };

  const submit = (): void => {
    const trimmed = getTyped().trim();

    if (trimmed === '') {
      return;
    }

    const next: StoredToken = {
      value: trimmed,
      store: getRemember() ? ('device' as const) : ('session' as const),
    } as const;

    setToken(next);

    setTypedState('');
  };

  const forget = (): void => {
    setTypedState('');

    setToken(undefined);
  };

  const start = (): (() => void) => {
    setStarted(true);

    return () => {
      setStarted(false);
    };
  };

  return {
    token,
    saveError,
    typed,
    remember,
    setTyped,
    setRemember,
    submit,
    forget,
    start,
  };
};

/** Writes `next` to storage, and returns what went wrong, if anything. */
const persist = (
  next: StoredToken | undefined,
  stores: TokenStores,
): string | undefined => {
  if (next === undefined) {
    forgetToken(stores);

    return undefined;
  }

  const saved = saveToken(next, stores);

  return Result.isErr(saved) ? saved.value : undefined;
};
