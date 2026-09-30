import { Result } from 'ts-data-forge';
import { number } from '../primitives/index.mjs';
import { type Type } from '../type.mjs';

describe('cast and assertIs', () => {
  const T: Type<number> = number(0);

  // A value that fails validation is a bug at the call site, so both stop by
  // panicking (Sumi D-48) rather than with a plain `Error`: the boundary
  // functions (`Result.fromThrowable` and friends) rethrow a panic instead of
  // turning it into `Err`. `validate` is the recoverable path.
  test('cast panics on an invalid value', () => {
    expect(() => T.cast('a')).toThrow(
      expect.objectContaining({ name: 'PanicError', $$panic: true }),
    );

    expect(() => Result.fromThrowable(() => T.cast('a'))).toThrow(Error);
  });

  test('assertIs panics on an invalid value', () => {
    expect(() => {
      T.assertIs('a');
    }).toThrow(expect.objectContaining({ name: 'PanicError', $$panic: true }));

    expect(() =>
      Result.fromThrowable(() => {
        T.assertIs('a');
      }),
    ).toThrow(Error);
  });

  test('both pass a valid value through', () => {
    assert.strictEqual(T.cast(1), 1);

    expect(() => {
      T.assertIs(1);
    }).not.toThrow();
  });
});
