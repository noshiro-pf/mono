import {
  createMemoryRepository,
  type Backend,
  type BackendSession,
} from '../repository/index.mjs';
import { createSessionStore } from './session-store.mjs';

const repository = createMemoryRepository({ tasks: [], milestones: [] });

const fakeBackend = (
  signIn: () => Promise<void>,
): Readonly<{
  backend: Backend;
  emit: (session: BackendSession) => void;
  signOuts: () => number;
}> => {
  let mut_listener: ((session: BackendSession) => void) | undefined = undefined;

  let mut_signOuts = 0;

  return {
    backend: {
      watchSession: (listener) => {
        mut_listener = listener;

        return () => {
          mut_listener = undefined;
        };
      },
      signIn,
      signOut: () => {
        mut_signOuts += 1;

        return Promise.resolve();
      },
    },
    emit: (session) => {
      mut_listener?.(session);
    },
    signOuts: () => mut_signOuts,
  };
};

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

  test('signs out through the backend', () => {
    const store = createSessionStore();

    const { backend, signOuts } = fakeBackend(() => Promise.resolve());

    store.attach(backend);

    store.signOut();

    assert.strictEqual(signOuts(), 1);
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
