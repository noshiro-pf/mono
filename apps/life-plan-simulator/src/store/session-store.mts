/**
 * Who is signed in, and the repository that goes with them.
 *
 * Starts as `starting` and stays there until a {@link Backend} is attached:
 * `main.tsx` loads the Firebase one (or, in development, the demo) after the
 * first render, so the page has something on it while Firebase loads.
 */

import { createReducer, map, type InitializedObservable } from 'synstate';
import { defineMachine } from 'ts-fsm-forge';
import type { RelaxedExtract } from 'ts-type-forge';
import type {
  Backend,
  BackendSession,
  PlanRepository,
  SignOutResult,
} from '../repository/index.mjs';
import { describeSignInError } from '../view-model/index.mjs';

export type Session = Readonly<
  | { type: 'starting' }
  | {
      type: 'signed-out';
      /** Why the last attempt to sign in failed, if it did. */
      error: string | undefined;
    }
  | { type: 'signing-in' }
  | {
      type: 'signed-in';
      userName: string;
      repository: PlanRepository;
    }
>;

/**
 * Where a sign-out stands: none in progress, waiting for the writes made
 * offline to be sent, or stopped because they could not be, until somebody
 * either gives them up or keeps them.
 */
export type SignOutState = 'idle' | 'unsent-writes' | 'waiting';

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

type SessionAction = Readonly<
  | { type: 'reported'; session: BackendSession }
  | { type: 'signIn' }
  | { type: 'signInFailed'; error: string | undefined }
>;

/**
 * What the backend reports is taken in every state: it is the backend that
 * knows who is signed in. A sign-in is started only from `signed-out`, so a
 * second click while the popup is open starts no second one. A failure is shown
 * unless the backend has since reported somebody signed in.
 */
const sessionMachine = defineMachine<Session, SessionAction>()(
  {
    starting: { reported: ['signed-out', 'signed-in'] },
    'signed-out': {
      reported: ['signed-out', 'signed-in'],
      signIn: 'signing-in',
      signInFailed: 'signed-out',
    },
    'signing-in': {
      reported: ['signed-out', 'signed-in'],
      signInFailed: 'signed-out',
    },
    'signed-in': { reported: ['signed-out', 'signed-in'] },
  },
  {
    starting: { reported: (_s, a) => fromBackend(a.session) },
    'signed-out': {
      reported: (_s, a) => fromBackend(a.session),
      signIn: () => ({ type: 'signing-in' }),
      signInFailed: (_s, a) => ({ type: 'signed-out', error: a.error }),
    },
    'signing-in': {
      reported: (_s, a) => fromBackend(a.session),
      signInFailed: (_s, a) => ({ type: 'signed-out', error: a.error }),
    },
    'signed-in': { reported: (_s, a) => fromBackend(a.session) },
  },
);

type SignOut = Readonly<
  { type: 'idle' } | { type: 'unsent-writes' } | { type: 'waiting' }
>;

type SignOutAction = Readonly<
  | { type: 'signOut' }
  | { type: 'settled'; result: SignOutResult | 'failed' }
  | { type: 'discard' }
  | { type: 'cancel' }
>;

const signOutMachine = defineMachine<SignOut, SignOutAction>()(
  {
    idle: { signOut: 'waiting' },
    waiting: { settled: ['idle', 'unsent-writes'] },
    'unsent-writes': { discard: 'waiting', cancel: 'idle' },
  },
  {
    idle: { signOut: () => ({ type: 'waiting' }) },
    waiting: {
      settled: (_s, a) =>
        a.result === 'unsent-writes'
          ? { type: 'unsent-writes' }
          : { type: 'idle' },
    },
    'unsent-writes': {
      discard: () => ({ type: 'waiting' }),
      cancel: () => ({ type: 'idle' }),
    },
  },
);

export const createSessionStore = (): SessionStore => {
  const [session, dispatchSession, { getSnapshot }] = createReducer(
    sessionMachine.reducer,
    { type: 'starting' } satisfies Session as Session,
  );

  const [signOut$, dispatchSignOut, { getSnapshot: getSignOut }] =
    createReducer(signOutMachine.reducer, {
      type: 'idle',
    } satisfies SignOut as SignOut);

  let mut_backend: Backend | undefined = undefined;

  const attach = (backend: Backend): (() => void) => {
    mut_backend = backend;

    return backend.watchSession((next) => {
      dispatchSession({ type: 'reported', session: next });
    });
  };

  const signIn = (): void => {
    const backend = mut_backend;

    if (backend === undefined || !sessionMachine.can(getSnapshot(), 'signIn')) {
      return;
    }

    dispatchSession({ type: 'signIn' });

    backend.signIn().catch((error: unknown) => {
      // A successful sign-in is reported through `watchSession`; only a failure
      // comes back here.
      dispatchSession({
        type: 'signInFailed',
        error: describeSignInError(error),
      });
    });
  };

  const runSignOut = (backend: Backend, discardUnsentWrites: boolean): void => {
    backend
      .signOut({ discardUnsentWrites })
      .then((result) => {
        dispatchSignOut({ type: 'settled', result });
      })
      .catch((error: unknown) => {
        console.error('Signing out failed', error);

        dispatchSignOut({ type: 'settled', result: 'failed' });
      });
  };

  const signOut = (): void => {
    const backend = mut_backend;

    if (backend === undefined || !signOutMachine.can(getSignOut(), 'signOut')) {
      return;
    }

    dispatchSignOut({ type: 'signOut' });

    runSignOut(backend, false);
  };

  const discardUnsentWritesAndSignOut = (): void => {
    const backend = mut_backend;

    if (backend === undefined || !signOutMachine.can(getSignOut(), 'discard')) {
      return;
    }

    dispatchSignOut({ type: 'discard' });

    runSignOut(backend, true);
  };

  const cancelSignOut = (): void => {
    dispatchSignOut({ type: 'cancel' });
  };

  return {
    session,
    signOutState: signOut$.pipe(map((s) => s.type)),
    attach,
    signIn,
    signOut,
    discardUnsentWritesAndSignOut,
    cancelSignOut,
  };
};

const fromBackend = (
  next: BackendSession,
): RelaxedExtract<Session, Readonly<{ type: 'signed-in' | 'signed-out' }>> =>
  next.type === 'signed-out'
    ? ({ type: 'signed-out', error: undefined } as const)
    : next;
