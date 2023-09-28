import { keyIsIn } from './key-is-in';

const f = <Key extends string, V, KeySub extends Key>(
  key: Key,
  obj: Record<KeySub, V>
): V | undefined => (keyIsIn(key, obj) ? obj[key] : undefined);

describe('keyIsIn', () => {
  // eslint-disable-next-line no-restricted-syntax
  f('a' as 'a' | 'b' | 'c', { a: 0, b: 1 });

  test('', () => {
    expect(
      keyIsIn('a', {
        a: 0,
        b: 1,
      })
    ).toBe(true);
  });
});
