/**
 * Who is signed in, and the repository that goes with them.
 *
 * Starts as `starting` and stays there until a {@link Backend} is attached:
 * `main.tsx` loads the Firebase one (or, in development, the demo) after the
 * first render, so the page has something on it while Firebase loads.
 */

import { createState, type InitializedObservable } from 'synstate';
import type { Backend, Repository } from '../repository/index.mjs';
import { describeSignInError } from '../view-model/index.mjs';

export type Session = Readonly<
  | { type: 'starting' }
  | {
      type: 'signed-out';
      /** Why the last attempt to sign in failed, if it did. */
      error: string | undefined;
      signingIn: boolean;
    }
  | {
      type: 'signed-in';
      userName: string;
      repository: Repository;
    }
>;

/**
 * Where a sign-out stands: none in progress, waiting for the writes made
 * offline to be sent, or stopped because they could not be, until somebody
 * either gives them up or keeps them.
 */
export type SignOutState = 'idle' | 'waiting' | 'unsent-writes';

export type SessionStore = Readonly<{
  session: InitializedObservable<Session>;
  signOutState: InitializedObservable<SignOutState>;
  /** Starts following `backend`, and returns what stops it. */
  attach: (backend: Backend) => () => void;
  signIn: () => void;
  signOut: () => void;
  /** Signs out after all, giving up the writes that could not be sent. */
  discardUnsentWritesAndSignOut: () => void;
  /** Stays signed in, keeping the writes that could not be sent. */
  cancelSignOut: () => void;
}>;

export const createSessionStore = (): SessionStore => {
  const [session, setSession, { getSnapshot }] = createState<Session>({
    type: 'starting',
  });

  const [signOutState, setSignOutState, { getSnapshot: getSignOutState }] =
    createState<SignOutState>('idle');

  let mut_backend: Backend | undefined = undefined;

  const attach = (backend: Backend): (() => void) => {
    mut_backend = backend;

    return backend.watchSession((next) => {
      setSession(
        next.type === 'signed-out'
          ? { type: 'signed-out', error: undefined, signingIn: false }
          : next,
      );
    });
  };

  const signIn = (): void => {
    const backend = mut_backend;

    const current = getSnapshot();

    if (backend === undefined || current.type !== 'signed-out') {
      return;
    }

    setSession({ type: 'signed-out', error: undefined, signingIn: true });

    backend.signIn().catch((error: unknown) => {
      // A successful sign-in is reported through `watchSession`; only a
      // failure comes back here.
      if (getSnapshot().type === 'signed-out') {
        setSession({
          type: 'signed-out',
          error: describeSignInError(error),
          signingIn: false,
        });
      }
    });
  };

  const runSignOut = (discardUnsentWrites: boolean): void => {
    const backend = mut_backend;

    if (backend === undefined) {
      return;
    }

    setSignOutState('waiting');

    backend
      .signOut({ discardUnsentWrites })
      .then((result) => {
        setSignOutState(result === 'unsent-writes' ? 'unsent-writes' : 'idle');
      })
      .catch((error: unknown) => {
        console.error('Signing out failed', error);

        setSignOutState('idle');
      });
  };

  const signOut = (): void => {
    if (getSignOutState() === 'idle') {
      runSignOut(false);
    }
  };

  const discardUnsentWritesAndSignOut = (): void => {
    if (getSignOutState() === 'unsent-writes') {
      runSignOut(true);
    }
  };

  const cancelSignOut = (): void => {
    if (getSignOutState() === 'unsent-writes') {
      setSignOutState('idle');
    }
  };

  return {
    session,
    signOutState,
    attach,
    signIn,
    signOut,
    discardUnsentWritesAndSignOut,
    cancelSignOut,
  };
};
