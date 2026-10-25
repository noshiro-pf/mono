import {
  createMemoryRepository,
  type Backend,
  type BackendSession,
  type SignOutResult,
} from '../repository/index.mjs';
import { createSessionStore } from './session-store.mjs';

const repository = createMemoryRepository();

const fakeBackend = (
  signIn: () => Promise<void>,
  signOut: (discardUnsentWrites: boolean) => Promise<SignOutResult> = () =>
    Promise.resolve('signed-out'),
): Readonly<{
  backend: Backend;
  emit: (session: BackendSession) => void;
  signOuts: () => readonly boolean[];
}> => {
  let mut_listener: ((session: BackendSession) => void) | undefined = undefined;

  const mut_signOuts: boolean[] = [];

  return {
    backend: {
      watchSession: (listener) => {
        mut_listener = listener;

        return () => {
          mut_listener = undefined;
        };
      },
      signIn,
      signOut: ({ discardUnsentWrites }) => {
        mut_signOuts.push(discardUnsentWrites);

        return signOut(discardUnsentWrites);
      },
    },
    emit: (session) => {
      mut_listener?.(session);
    },
    signOuts: () => Array.from(mut_signOuts),
  };
};

/** Resolves once every promise already settled has run its callbacks. */
const flush = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

describe(createSessionStore, () => {
  test('is starting until the backend says who is signed in', () => {
    const store = createSessionStore();

    const { backend, emit } = fakeBackend(() => Promise.resolve());

    store.attach(backend);

    assert.deepStrictEqual(store.session.getSnapshot().value, {
      type: 'starting',
    });

    emit({ type: 'signed-in', userName: 'me', repository });

    assert.deepStrictEqual(store.session.getSnapshot().value, {
      type: 'signed-in',
      userName: 'me',
      repository,
    });

    emit({ type: 'signed-out' });

    assert.deepStrictEqual(store.session.getSnapshot().value, {
      type: 'signed-out',
      error: undefined,
      signingIn: false,
    });
  });

  test('shows a sign-in in progress, and why it failed', async () => {
    const store = createSessionStore();

    const failed = Promise.reject(new Error('boom'));

    const { backend, emit } = fakeBackend(() => failed);

    store.attach(backend);

    emit({ type: 'signed-out' });

    store.signIn();

    assert.deepStrictEqual(store.session.getSnapshot().value, {
      type: 'signed-out',
      error: undefined,
      signingIn: true,
    });

    await failed.catch(() => {});

    await Promise.resolve();

    assert.deepStrictEqual(store.session.getSnapshot().value, {
      type: 'signed-out',
      error: 'サインインできませんでした（boom）。',
      signingIn: false,
    });
  });

  test('signs out through the backend, keeping writes not yet sent', async () => {
    const store = createSessionStore();

    const { backend, signOuts } = fakeBackend(() => Promise.resolve());

    store.attach(backend);

    store.signOut();

    assert.strictEqual(store.signOutState.getSnapshot().value, 'waiting');

    await flush();

    assert.deepStrictEqual(signOuts(), [false]);

    assert.strictEqual(store.signOutState.getSnapshot().value, 'idle');
  });

  test('ignores another sign-out while one is in progress', async () => {
    const store = createSessionStore();

    const { backend, signOuts } = fakeBackend(() => Promise.resolve());

    store.attach(backend);

    store.signOut();

    store.signOut();

    await flush();

    assert.deepStrictEqual(signOuts(), [false]);
  });

  test('stops when writes cannot be sent, and gives them up only when told to', async () => {
    const store = createSessionStore();

    const { backend, signOuts } = fakeBackend(
      () => Promise.resolve(),
      (discardUnsentWrites) =>
        Promise.resolve(discardUnsentWrites ? 'signed-out' : 'unsent-writes'),
    );

    store.attach(backend);

    store.signOut();

    await flush();

    assert.deepStrictEqual(signOuts(), [false]);

    assert.strictEqual(store.signOutState.getSnapshot().value, 'unsent-writes');

    // Until somebody chooses, signing out again does nothing.
    store.signOut();

    await flush();

    assert.deepStrictEqual(signOuts(), [false]);

    store.discardUnsentWritesAndSignOut();

    await flush();

    assert.deepStrictEqual(signOuts(), [false, true]);

    assert.strictEqual(store.signOutState.getSnapshot().value, 'idle');
  });

  test('stays signed in when writes not yet sent are kept', async () => {
    const store = createSessionStore();

    const { backend, signOuts } = fakeBackend(
      () => Promise.resolve(),
      () => Promise.resolve('unsent-writes'),
    );

    store.attach(backend);

    store.signOut();

    await flush();

    store.cancelSignOut();

    assert.strictEqual(store.signOutState.getSnapshot().value, 'idle');

    store.discardUnsentWritesAndSignOut();

    await flush();

    assert.deepStrictEqual(signOuts(), [false]);
  });

  test('is ready to sign out again after a failure', async () => {
    const store = createSessionStore();

    const { backend, signOuts } = fakeBackend(
      () => Promise.resolve(),
      () => Promise.reject(new Error('boom')),
    );

    store.attach(backend);

    store.signOut();

    await flush();

    assert.strictEqual(store.signOutState.getSnapshot().value, 'idle');

    store.signOut();

    await flush();

    assert.deepStrictEqual(signOuts(), [false, false]);
  });

  test('stops following the backend when detached', () => {
    const store = createSessionStore();

    const { backend, emit } = fakeBackend(() => Promise.resolve());

    const detach = store.attach(backend);

    detach();

    emit({ type: 'signed-out' });

    assert.strictEqual(store.session.getSnapshot().value.type, 'starting');
  });
});
