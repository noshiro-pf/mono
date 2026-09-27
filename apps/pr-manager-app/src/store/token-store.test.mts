import { type KeyValueStore, type TokenStores } from '../token.mjs';
import { createTokenStore } from './token-store.mjs';

describe(createTokenStore, () => {
  test('starts from the token the browser is holding', () => {
    const stores = memoryStores();

    const first = createTokenStore(stores);

    first.start();

    first.setRemember(true);

    first.setTyped('ghp_kept');

    first.submit();

    assert.deepStrictEqual(createTokenStore(stores).token.getSnapshot().value, {
      value: 'ghp_kept',
      store: 'device',
    });
  });

  test('keeps what was typed, trimmed, for the tab unless told to remember', () => {
    const store = createTokenStore(memoryStores());

    store.setTyped('  ghp_a  ');

    store.submit();

    assert.deepStrictEqual(store.token.getSnapshot().value, {
      value: 'ghp_a',
      store: 'session',
    });

    assert.strictEqual(store.typed.getSnapshot().value, '');

    store.setRemember(true);

    store.setTyped('ghp_b');

    store.submit();

    assert.deepStrictEqual(store.token.getSnapshot().value, {
      value: 'ghp_b',
      store: 'device',
    });
  });

  test('submits nothing when nothing was typed', () => {
    const store = createTokenStore(memoryStores());

    store.setTyped(' '.repeat(3));

    store.submit();

    assert.isUndefined(store.token.getSnapshot().value);
  });

  test('uses a token the browser refused to keep, and says so', () => {
    const store = createTokenStore({ device: undefined, session: undefined });

    store.start();

    store.setTyped('ghp_a');

    store.submit();

    assert.deepStrictEqual(store.token.getSnapshot().value, {
      value: 'ghp_a',
      store: 'session',
    });

    assert.isString(store.saveError.getSnapshot().value);
  });

  test('forgetting clears the token, the error, what was typed, and the storage', () => {
    const stores = memoryStores();

    const store = createTokenStore(stores);

    store.start();

    store.setTyped('ghp_a');

    store.submit();

    store.setTyped('half-typ');

    store.forget();

    assert.isUndefined(store.token.getSnapshot().value);

    assert.isUndefined(store.saveError.getSnapshot().value);

    assert.strictEqual(store.typed.getSnapshot().value, '');

    assert.isUndefined(createTokenStore(stores).token.getSnapshot().value);
  });

  test('writes to storage only while started', () => {
    const stores = memoryStores();

    const store = createTokenStore(stores);

    store.setTyped('ghp_before');

    store.submit();

    const stopToken = store.start();

    store.setTyped('ghp_during');

    store.submit();

    stopToken();

    store.setTyped('ghp_after');

    store.submit();

    assert.deepStrictEqual(createTokenStore(stores).token.getSnapshot().value, {
      value: 'ghp_during',
      store: 'session',
    });
  });
});

const memoryStores = (): TokenStores =>
  ({
    device: memory(),
    session: memory(),
  }) as const;

const memory = (): KeyValueStore => {
  const mut_entries = new Map<string, string>();

  return {
    getItem: (key) => mut_entries.get(key) ?? null,
    setItem: (key, value) => {
      mut_entries.set(key, value);
    },
    removeItem: (key) => {
      mut_entries.delete(key);
    },
  };
};
