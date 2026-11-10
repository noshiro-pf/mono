import {
  createState,
  skipIfNoChange,
  type InitializedObservable,
} from 'synstate';
import { Result } from 'ts-data-forge';
import {
  forgetToken,
  readToken,
  saveToken,
  type StoredToken,
  type TokenStores,
} from '../github/index.mjs';

export type TokenStore = Readonly<{
  /** The token in use, or none. */
  token: InitializedObservable<StoredToken | undefined>;
  /**
   * {@link TokenStore.token}, quiet while only where it is kept changes: what
   * reads GitHub follows this, so remembering the token in use reads nothing
   * again. Pasting the same token again is no change either; Refresh reads.
   */
  tokenValue: InitializedObservable<StoredToken | undefined>;
  /** Why the token could not be kept, if it could not. */
  saveError: InitializedObservable<string | undefined>;
  /** What is typed in the panel, and the panel's checkbox. */
  typed: InitializedObservable<string>;
  remember: InitializedObservable<boolean>;
  setTyped: (typed: string) => void;
  setRemember: (remember: boolean) => void;
  /** Uses what is typed, kept where the checkbox says. */
  submit: () => void;
  /** Forgets the token everywhere. */
  clear: () => void;
}>;

/** The token and the panel that sets it (spec §3). */
export const createTokenStore = (stores: TokenStores): TokenStore => {
  const kept = readToken(stores);

  const [token, setToken] = createState<StoredToken | undefined>(kept);

  const [saveError, setSaveError] = createState<string | undefined>(undefined);

  const [typed, setTyped, { getSnapshot: getTyped }] = createState('');

  // Ticked when the token in use is kept on the device, so that a new one
  // pasted over it stays there too unless the box is cleared.
  const [remember, setRemember, { getSnapshot: getRemember }] = createState(
    kept?.place === 'device',
  );

  const use = (next: StoredToken | undefined): void => {
    if (next === undefined) {
      forgetToken(stores);

      setSaveError(undefined);
    } else {
      const saved = saveToken(stores, next);

      setSaveError(Result.isErr(saved) ? saved.value : undefined);
    }

    setToken(next);
  };

  return {
    token,
    tokenValue: token.pipe(skipIfNoChange((a, b) => a?.value === b?.value)),
    saveError,
    typed,
    remember,
    setTyped: (next) => {
      setTyped(next);
    },
    setRemember: (next) => {
      setRemember(next);
    },
    submit: () => {
      const value = getTyped().trim();

      if (value === '') {
        return;
      }

      use({ value, place: getRemember() ? 'device' : 'session' });

      setTyped('');
    },
    clear: () => {
      setTyped('');

      // Forgotten everywhere: the next token is the session's unless ticked.
      setRemember(false);

      use(undefined);
    },
  };
};
