import { Result } from 'ts-data-forge';
import { memoryStore } from '../../test/index.mjs';
import {
  forgetToken,
  readToken,
  saveToken,
  TOKEN_KEY,
  type TokenStores,
} from './token-storage.mjs';

const stores = (): TokenStores &
  Readonly<{
    device: ReturnType<typeof memoryStore>;
    session: ReturnType<typeof memoryStore>;
  }> =>
  ({
    device: memoryStore(),
    session: memoryStore(),
  }) as const;

describe(saveToken, () => {
  test('keeps the token in one place only', () => {
    const s = stores();

    saveToken(s, { value: 'a', place: 'device' });

    saveToken(s, { value: 'b', place: 'session' });

    assert.isFalse(s.device.map.has(TOKEN_KEY));

    assert.deepStrictEqual(readToken(s), { value: 'b', place: 'session' });
  });

  test('says so when the browser refuses', () => {
    const result = saveToken(
      { device: undefined, session: undefined },
      { value: 'a', place: 'session' },
    );

    assert.isTrue(Result.isErr(result));
  });
});

describe(readToken, () => {
  test('prefers the session’s token and ignores an empty one', () => {
    const s = stores();

    s.device.setItem(TOKEN_KEY, 'device');

    s.session.setItem(TOKEN_KEY, '');

    assert.deepStrictEqual(readToken(s), { value: 'device', place: 'device' });
  });
});

test(forgetToken, () => {
  const s = stores();

  saveToken(s, { value: 'a', place: 'device' });

  forgetToken(s);

  assert.isUndefined(readToken(s));
});
