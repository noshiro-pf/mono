import { Optional } from 'ts-data-forge';
import { memoryStore } from '../../test/index.mjs';
import { TOKEN_KEY } from '../github/index.mjs';
import { createTokenStore } from './token-store.mjs';

describe(createTokenStore, () => {
  test('keeps a new token where the one in use was kept', () => {
    const device = memoryStore();

    const session = memoryStore();

    device.setItem(TOKEN_KEY, 'old');

    const store = createTokenStore({ device, session });

    assert.isTrue(Optional.unwrap(store.remember.getSnapshot()));

    store.setTyped('new');

    store.submit();

    assert.strictEqual(device.getItem(TOKEN_KEY), 'new');

    assert.isNull(session.getItem(TOKEN_KEY));
  });

  test('starts clear for a session token or none', () => {
    const none = createTokenStore({
      device: memoryStore(),
      session: memoryStore(),
    });

    assert.isFalse(Optional.unwrap(none.remember.getSnapshot()));

    const session = memoryStore();

    session.setItem(TOKEN_KEY, 'kept');

    const inSession = createTokenStore({ device: memoryStore(), session });

    assert.isFalse(Optional.unwrap(inSession.remember.getSnapshot()));
  });

  test('clears the box once the token is forgotten', () => {
    const device = memoryStore();

    device.setItem(TOKEN_KEY, 'old');

    const store = createTokenStore({ device, session: memoryStore() });

    store.clear();

    assert.isFalse(Optional.unwrap(store.remember.getSnapshot()));
  });

  test('tokenValue stays quiet while only the place changes', () => {
    const store = createTokenStore({
      device: memoryStore(),
      session: memoryStore(),
    });

    const mut_seen: (string | undefined)[] = [];

    store.tokenValue.subscribe((t) => {
      mut_seen.push(t?.value);
    });

    store.setTyped('a');

    store.submit();

    store.setRemember(true);

    store.setTyped('a');

    store.submit();

    store.setTyped('b');

    store.submit();

    assert.deepStrictEqual(mut_seen, [undefined, 'a', 'b']);

    assert.strictEqual(
      Optional.unwrap(store.token.getSnapshot())?.place,
      'device',
    );
  });
});
