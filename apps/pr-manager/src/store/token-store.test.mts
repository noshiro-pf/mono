import { Optional } from 'ts-data-forge';
import type { KeyValueStore, TokenStores } from '../token.mjs';
import { createTokenStore } from './token-store.mjs';

describe(createTokenStore, () => {
  test('starts from the token the browser is holding', () => {
    const stores = memoryStores();

    const first = createTokenStore(stores);

    first.start();

    first.setRemember(true);

    first.setTyped('ghp_kept');

    first.submit();

    assert.deepStrictEqual(
      Optional.unwrap(createTokenStore(stores).token.getSnapshot()),
      {
        value: 'ghp_kept',
        store: 'device',
      },
    );
  });

  test('keeps what was typed, trimmed, for the tab unless told to remember', () => {
    const store = createTokenStore(memoryStores());

    store.setTyped('  ghp_a  ');

    store.submit();

    assert.deepStrictEqual(Optional.unwrap(store.token.getSnapshot()), {
      value: 'ghp_a',
      store: 'session',
    });

    assert.strictEqual(Optional.unwrap(store.typed.getSnapshot()), '');

    store.setRemember(true);

    store.setTyped('ghp_b');

    store.submit();

    assert.deepStrictEqual(Optional.unwrap(store.token.getSnapshot()), {
      value: 'ghp_b',
      store: 'device',
    });
  });

  test('submits nothing when nothing was typed', () => {
    const store = createTokenStore(memoryStores());

    store.setTyped(' '.repeat(3));

    store.submit();

    assert.isUndefined(Optional.unwrap(store.token.getSnapshot()));
  });

  test('uses a token the browser refused to keep, and says so', () => {
    const store = createTokenStore({ device: undefined, session: undefined });

    store.start();

    store.setTyped('ghp_a');

    store.submit();

    assert.deepStrictEqual(Optional.unwrap(store.token.getSnapshot()), {
      value: 'ghp_a',
      store: 'session',
    });

    assert.isString(Optional.unwrap(store.saveError.getSnapshot()));
  });

  test('forgetting clears the token, the error, what was typed, and the storage', () => {
    const stores = memoryStores();

    const store = createTokenStore(stores);

    store.start();

    store.setTyped('ghp_a');

    store.submit();

    store.setTyped('half-typ');

    store.forget();

    assert.isUndefined(Optional.unwrap(store.token.getSnapshot()));

    assert.isUndefined(Optional.unwrap(store.saveError.getSnapshot()));

    assert.strictEqual(Optional.unwrap(store.typed.getSnapshot()), '');

    assert.isUndefined(
      Optional.unwrap(createTokenStore(stores).token.getSnapshot()),
    );
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

    assert.deepStrictEqual(
      Optional.unwrap(createTokenStore(stores).token.getSnapshot()),
      {
        value: 'ghp_during',
        store: 'session',
      },
    );
  });
});

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

const memoryStores = (): TokenStores =>
  ({
    device: memory(),
    session: memory(),
  }) as const;
