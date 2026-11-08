import type { InitializedObservable } from 'synstate';
import type { Result } from 'ts-data-forge';

/**
 * The parts of `Api['auth']` the account dialogs use. They pass the user and
 * the credential through without looking inside, so both are type parameters:
 * the app's are Firebase's, and a test's can be anything.
 */
export type AccountAuthApi<User, ReauthCredential> = Readonly<{
  emailCredential: (email: string, password: string) => ReauthCredential;
  /** Only whether it went through, and why not, is read. */
  reauthenticateWithGooglePopup: (
    user: User,
  ) => Promise<Result<unknown, AuthError>>;
  /** Only whether it went through, and why not, is read. */
  reauthenticateWithCredential: (
    user: User,
    credential: ReauthCredential,
  ) => Promise<Result<unknown, AuthError>>;
  deleteUser: (user: User) => Promise<Result<void, AuthError>>;
  update: Readonly<{
    displayName: (
      user: User,
      displayName: string,
    ) => Promise<Result<void, AuthError>>;
    password: (
      user: User,
      password: string,
    ) => Promise<Result<void, AuthError>>;
  }>;
  /** Sends `email` a link that changes the user's address to it once opened. */
  verifyBeforeUpdateEmail: (
    user: User,
    email: string,
  ) => Promise<Result<void, AuthError>>;
}>;

/** What the account dialogs read of the auth store. */
export type AccountAuth<User> = Readonly<{
  fireAuthUser$: InitializedObservable<User | undefined>;
  getFireAuthUserSnapshot: () => User | undefined;
  /** Reads the signed-in user again, for a change Firebase does not report. */
  emitAuthStateChange: () => void;
}>;

/** What the account dialogs read of the signed-in user themselves. */
export type AccountUser = Readonly<{
  email: string | null;
  displayName: string | null;
}>;

export type AuthError = Readonly<{ code: string; message: string }>;
