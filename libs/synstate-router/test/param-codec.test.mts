import { asSafeInt, expectType, Optional, type SafeInt } from 'ts-data-forge';
import type { Brand } from 'ts-type-forge';
import { param, type ParamCodec } from '../src/index.mjs';

describe('param.string', () => {
  test('reads any non-empty segment', () => {
    assert.deepStrictEqual(param.string.decode('a b'), Optional.some('a b'));
  });

  test('rejects the empty segment', () => {
    assert.isTrue(Optional.isNone(param.string.decode('')));
  });
});

describe('param.int', () => {
  test('reads canonical integers', () => {
    assert.deepStrictEqual(param.int.decode('0'), Optional.some(asSafeInt(0)));

    assert.deepStrictEqual(
      param.int.decode('42'),
      Optional.some(asSafeInt(42)),
    );

    assert.deepStrictEqual(
      param.int.decode('-7'),
      Optional.some(asSafeInt(-7)),
    );

    expectType<typeof param.int, ParamCodec<SafeInt>>('=');
  });

  test.each(['01', '+1', '1.0', '1e3', '-0', '', ' 1', 'abc', '0x10'])(
    'rejects the non-canonical %j',
    (raw) => {
      assert.isTrue(Optional.isNone(param.int.decode(raw)));
    },
  );

  test('rejects integers past the safe range', () => {
    assert.isTrue(Optional.isNone(param.int.decode('9007199254740992')));

    assert.isTrue(
      Optional.isSome(param.int.decode(Number.MAX_SAFE_INTEGER.toString())),
    );
  });
});

describe('param.literal', () => {
  const env = param.literal('live', 'sandbox');

  test('reads only the listed values', () => {
    expectType<typeof env, ParamCodec<'live' | 'sandbox'>>('=');

    assert.deepStrictEqual(env.decode('live'), Optional.some('live'));

    assert.isTrue(Optional.isNone(env.decode('staging')));
  });
});

describe('param.refine', () => {
  type UserId = Brand<string, 'UserId'>;

  const isUserId = (s: string): s is UserId => /^u\d+$/u.test(s);

  const userId = param.refine(param.string, isUserId);

  test('narrows the type and checks the guard at run time', () => {
    expectType<typeof userId, ParamCodec<UserId>>('=');

    assert.isTrue(Optional.isSome(userId.decode('u1')));

    assert.isTrue(Optional.isNone(userId.decode('alice')));

    assert.isTrue(Optional.isNone(userId.decode('')));
  });
});

describe('param.custom', () => {
  test('passes the codec through', () => {
    const slugs = param.custom<readonly string[]>({
      decode: (raw) =>
        raw !== '' && raw.split('-').every((part) => /^[a-z]+$/u.test(part))
          ? Optional.some(raw.split('-'))
          : Optional.none,
      encode: (parts) => parts.join('-'),
    });

    assert.deepStrictEqual(slugs.decode('a-b'), Optional.some(['a', 'b']));

    assert.isTrue(Optional.isNone(slugs.decode('a--b')));
  });
});
