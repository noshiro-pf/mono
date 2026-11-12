import { memoryStore } from '../../test/index.mjs';
import { TOKEN_KEY } from '../github/index.mjs';
import { createTokenStore } from './token-store.mjs';

describe(createTokenStore, () => {
  test('keeps a new token where the one in use was kept', () => {
    const device = memoryStore();

    const session = memoryStore();

    device.setItem(TOKEN_KEY, 'old');

    const store = createTokenStore({ device, session });

    assert.isTrue(store.remember.getSnapshot().value);

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

    assert.isFalse(none.remember.getSnapshot().value);

    const session = memoryStore();

    session.setItem(TOKEN_KEY, 'kept');

    const inSession = createTokenStore({ device: memoryStore(), session });

    assert.isFalse(inSession.remember.getSnapshot().value);
  });

  test('clears the box once the token is forgotten', () => {
    const device = memoryStore();

    device.setItem(TOKEN_KEY, 'old');

    const store = createTokenStore({ device, session: memoryStore() });

    store.clear();

    assert.isFalse(store.remember.getSnapshot().value);
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

    assert.strictEqual(store.token.getSnapshot().value?.place, 'device');
  });
});
