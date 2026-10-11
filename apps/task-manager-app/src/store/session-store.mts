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

export type SessionStore = Readonly<{
  session: InitializedObservable<Session>;
  /** Starts following `backend`, and returns what stops it. */
  attach: (backend: Backend) => () => void;
  signIn: () => void;
  signOut: () => void;
}>;

export const createSessionStore = (): SessionStore => {
  const [session, setSession, { getSnapshot }] = createState<Session>({
    type: 'starting',
  });

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

  const signOut = (): void => {
    mut_backend?.signOut().catch((error: unknown) => {
      console.error('Signing out failed', error);
    });
  };

  return { session, attach, signIn, signOut };
};
