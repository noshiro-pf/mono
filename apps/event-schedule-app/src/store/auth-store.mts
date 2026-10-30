import { type InitializedObservable, map } from 'synstate';
import { createState, useObservableValue } from 'synstate-react-hooks';
import type { StrictPick } from 'ts-type-forge';
import type { Api } from '../api/index.mjs';
import { Routes } from '../constants/index.mjs';
import { clog } from '../utils/index.mjs';

export type AuthDeps = Readonly<{
  auth: StrictPick<
    Api['auth'],
    'currentUser' | 'onAuthStateChanged' | 'signOut'
  >;
  router: Readonly<{ push: (nextUrl: string) => void }>;
}>;

/**
 * The signed-in user, as Firebase Authentication reports it once started, and
 * signing out. Firebase is `deps.auth`, so a test hands it a fake.
 */
export const createAuthStore = (deps: AuthDeps): AuthStore => {
  const [
    useFireAuthUser,
    setFireAuthUser,
    { state: fireAuthUser$, getSnapshot: getFireAuthUserSnapshot },
  ] = createState<FireAuthUser | undefined>(undefined);

  const passwordProviderIncluded$: InitializedObservable<boolean> =
    fireAuthUser$.pipe(
      map(
        (user) =>
          user?.providerData.some((p) => p.providerId === 'password') ?? false,
      ),
    );

  const usePasswordProviderIncluded = (): boolean =>
    useObservableValue(passwordProviderIncluded$);

  const emitAuthStateChange = (): void => {
    setFireAuthUser(deps.auth.currentUser());
  };

  const signOut = async (): Promise<void> => {
    await deps.auth.signOut();

    deps.router.push(Routes.routes.signInPage);
  };

  const signOutClick = (): void => {
    // TODO: use toast
    signOut().catch(console.error);
  };

  /** Starts listening to the auth state; returns what stops it. */
  const start = (): (() => void) =>
    deps.auth.onAuthStateChanged((user) => {
      clog('onAuthStateChanged', user);

      setFireAuthUser(user);
    });

  return {
    fireAuthUser$,
    getFireAuthUserSnapshot,
    passwordProviderIncluded$,
    useFireAuthUser,
    usePasswordProviderIncluded,
    emitAuthStateChange,
    signOut,
    signOutClick,
    start,
  } as const;
};

export type AuthStore = Readonly<{
  fireAuthUser$: InitializedObservable<FireAuthUser | undefined>;
  getFireAuthUserSnapshot: () => FireAuthUser | undefined;
  passwordProviderIncluded$: InitializedObservable<boolean>;
  useFireAuthUser: () => FireAuthUser | undefined;
  usePasswordProviderIncluded: () => boolean;
  /** Reads the signed-in user again, for a change Firebase does not report. */
  emitAuthStateChange: () => void;
  signOut: () => Promise<void>;
  signOutClick: () => void;
  /** Starts listening to the auth state; returns what stops it. */
  start: () => () => void;
}>;
