import { createAuthStore, type AuthStore } from './auth-store.mjs';

describe(createAuthStore, () => {
  test('follows the signed-in user once started', () => {
    const { store, auth } = setup();

    const alice = fakeUser('alice', ['password']);

    auth.emit(alice);

    assert.isUndefined(store.getFireAuthUserSnapshot());

    store.start();

    auth.emit(alice);

    assert.strictEqual(store.getFireAuthUserSnapshot(), alice);

    assert.isTrue(store.passwordProviderIncluded$.getSnapshot().value);

    auth.emit(undefined);

    assert.isUndefined(store.getFireAuthUserSnapshot());

    assert.isFalse(store.passwordProviderIncluded$.getSnapshot().value);
  });

  test('a user signed in with Google only has no password provider', () => {
    const { store, auth } = setup();

    store.start();

    auth.emit(fakeUser('bob', ['google.com']));

    assert.isFalse(store.passwordProviderIncluded$.getSnapshot().value);
  });

  test('stop ends the listening', () => {
    const { store, auth } = setup();

    const stopAuth = store.start();

    stopAuth();

    auth.emit(fakeUser('alice', ['password']));

    assert.isUndefined(store.getFireAuthUserSnapshot());
  });

  test('emitAuthStateChange reads the signed-in user again', () => {
    const { store, auth } = setup();

    const alice = fakeUser('alice', ['password']);

    auth.setCurrentUser(alice);

    store.emitAuthStateChange();

    assert.strictEqual(store.getFireAuthUserSnapshot(), alice);
  });

  test('signs out, then goes to the sign-in page', async () => {
    const { store, calls } = setup();

    await store.signOut();

    assert.deepStrictEqual(calls, ['signOut', 'push /signIn/']);
  });
});

type FakeAuth = Readonly<{
  emit: (user: FireAuthUser | undefined) => void;
  setCurrentUser: (user: FireAuthUser | undefined) => void;
}>;

const setup = (): Readonly<{
  store: AuthStore;
  auth: FakeAuth;
  calls: readonly string[];
}> => {
  const mut_listeners = new Set<(user: FireAuthUser | undefined) => void>();

  const mut_state: { currentUser: FireAuthUser | undefined } = {
    currentUser: undefined,
  };

  const mut_calls: string[] = [];

  const store = createAuthStore({
    auth: {
      currentUser: () => mut_state.currentUser,
      onAuthStateChanged: (listener) => {
        mut_listeners.add(listener);

        return () => {
          mut_listeners.delete(listener);
        };
      },
      signOut: () => {
        mut_calls.push('signOut');

        return Promise.resolve();
      },
    },
    router: {
      push: (nextUrl) => {
        mut_calls.push(`push ${nextUrl}`);
      },
    },
  });

  return {
    store,
    auth: {
      emit: (user) => {
        for (const listener of mut_listeners) {
          listener(user);
        }
      },
      setCurrentUser: (user) => {
        mut_state.currentUser = user;
      },
    },
    calls: mut_calls,
  } as const;
};

/**
 * A user with only what the store reads. Firebase's `User` has some thirty
 * members, methods among them, that nothing here touches.
 */
const fakeUser = (uid: string, providerIds: readonly string[]): FireAuthUser =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ({
    uid,
    providerData: providerIds.map((providerId) => ({ providerId })),
  }) as unknown as FireAuthUser;
