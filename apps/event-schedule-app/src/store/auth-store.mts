import { createState, type InitializedObservable, map } from 'synstate';
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
  // Firebase updates a profile in place, so the user object read again after
  // `updateProfile` is the one already held: the name and email are copied out
  // each time, so that what shows them is told of the change.
  const [snapshot$, setSnapshot, { getSnapshot }] = createState<AuthSnapshot>(
    toSnapshot(undefined),
  );

  const setFireAuthUser = (user: FireAuthUser | undefined): void => {
    setSnapshot(toSnapshot(user));
  };

  const getFireAuthUserSnapshot = (): FireAuthUser | undefined =>
    getSnapshot().user;

  const fireAuthUser$: InitializedObservable<FireAuthUser | undefined> =
    snapshot$.pipe(map((s) => s.user));

  const displayName$: InitializedObservable<string | null> = snapshot$.pipe(
    map((s) => s.displayName),
  );

  const email$: InitializedObservable<string | null> = snapshot$.pipe(
    map((s) => s.email),
  );

  const passwordProviderIncluded$: InitializedObservable<boolean> =
    fireAuthUser$.pipe(
      map(
        (user) =>
          user?.providerData.some((p) => p.providerId === 'password') ?? false,
      ),
    );

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
    displayName$,
    email$,
    getFireAuthUserSnapshot,
    passwordProviderIncluded$,
    emitAuthStateChange,
    signOut,
    signOutClick,
    start,
  } as const;
};

type AuthSnapshot = Readonly<{
  user: FireAuthUser | undefined;
  displayName: string | null;
  email: string | null;
}>;

const toSnapshot = (user: FireAuthUser | undefined): AuthSnapshot =>
  ({
    user,
    displayName: user?.displayName ?? null,
    email: user?.email ?? null,
  }) as const;

export type AuthStore = Readonly<{
  fireAuthUser$: InitializedObservable<FireAuthUser | undefined>;
  /** The user's name, followed through a profile changed in place. */
  displayName$: InitializedObservable<string | null>;
  /** The user's email, followed through a profile changed in place. */
  email$: InitializedObservable<string | null>;
  getFireAuthUserSnapshot: () => FireAuthUser | undefined;
  passwordProviderIncluded$: InitializedObservable<boolean>;
  /** Reads the signed-in user again, for a change Firebase does not report. */
  emitAuthStateChange: () => void;
  signOut: () => Promise<void>;
  signOutClick: () => void;
  /** Starts listening to the auth state; returns what stops it. */
  start: () => () => void;
}>;
