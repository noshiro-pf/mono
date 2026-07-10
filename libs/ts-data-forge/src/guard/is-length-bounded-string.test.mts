import {
  type BoundedLengthString,
  type FixedLengthString,
  type MaxLengthString,
  type MinLengthString,
  type NonEmptyString,
} from 'ts-type-forge';
import { expectType } from '../expect-type.mjs';
import {
  isBoundedLengthString,
  isFixedLengthString,
  isMaxLengthString,
  isMinLengthString,
} from './is-length-bounded-string.mjs';

describe(isMinLengthString, () => {
  test('should return true when the string is long enough', () => {
    assert.isTrue(isMinLengthString('hello', 3));

    assert.isTrue(isMinLengthString('hello', 5));

    assert.isTrue(isMinLengthString('', 0));

    assert.isTrue(isMinLengthString(' ', 1)); // Space counts
  });

  test('should return false when the string is too short', () => {
    assert.isFalse(isMinLengthString('hi', 3));

    assert.isFalse(isMinLengthString('', 1));
  });

  test('should measure length in UTF-16 code units', () => {
    assert.isTrue(isMinLengthString('🎉', 2)); // Surrogate pair

    assert.isFalse(isMinLengthString('🎉', 3));
  });

  test('should act as a type guard', () => {
    const value: string = 'very-secret-password';

    if (isMinLengthString(value, 12)) {
      expectType<typeof value, MinLengthString<12>>('<=');

      expectType<typeof value, NonEmptyString>('<='); // 12 >= 1

      expectType<typeof value, MinLengthString<16>>('!<=');

      expect(value.length).toBeGreaterThanOrEqual(12);
    }
  });

  test('should preserve literal string types', () => {
    const literal = 'hello';

    if (isMinLengthString(literal, 3)) {
      expectType<typeof literal, 'hello'>('<=');

      expectType<typeof literal, MinLengthString<3>>('<=');
    }
  });
});

describe(isMaxLengthString, () => {
  test('should return true when the string is short enough', () => {
    assert.isTrue(isMaxLengthString('hello', 10));

    assert.isTrue(isMaxLengthString('hello', 5));

    assert.isTrue(isMaxLengthString('', 0));
  });

  test('should return false when the string is too long', () => {
    assert.isFalse(isMaxLengthString('hello', 3));

    assert.isFalse(isMaxLengthString(' ', 0));
  });

  test('should measure length in UTF-16 code units', () => {
    assert.isFalse(isMaxLengthString('🎉', 1)); // Surrogate pair

    assert.isTrue(isMaxLengthString('🎉', 2));
  });

  test('should act as a type guard', () => {
    const value: string = 'noshiro';

    if (isMaxLengthString(value, 32)) {
      expectType<typeof value, MaxLengthString<32>>('<=');

      expectType<typeof value, MaxLengthString<64>>('<='); // 32 <= 64

      expectType<typeof value, MaxLengthString<16>>('!<=');

      expect(value.length).toBeLessThanOrEqual(32);
    }
  });
});

describe(isBoundedLengthString, () => {
  test('should return true when the length is within the range', () => {
    assert.isTrue(isBoundedLengthString('user-12345678', 8, 16));

    assert.isTrue(isBoundedLengthString('12345678', 8, 16)); // Lower bound (inclusive)

    assert.isTrue(isBoundedLengthString('1234567890123456', 8, 16)); // Upper bound (inclusive)

    assert.isTrue(isBoundedLengthString('', 0, 0));
  });

  test('should return false when the length is out of range', () => {
    assert.isFalse(isBoundedLengthString('user', 8, 16));

    assert.isFalse(isBoundedLengthString('12345678901234567', 8, 16));
  });

  test('should act as a type guard', () => {
    const value: string = 'user-12345678';

    if (isBoundedLengthString(value, 8, 16)) {
      expectType<typeof value, BoundedLengthString<8, 16>>('<=');

      expectType<typeof value, BoundedLengthString<1, 255>>('<='); // [8, 16] ⊆ [1, 255]

      expectType<typeof value, MinLengthString<8>>('<=');

      expectType<typeof value, MaxLengthString<16>>('<=');

      expectType<typeof value, NonEmptyString>('<='); // 8 >= 1

      expectType<typeof value, BoundedLengthString<10, 16>>('!<=');
    }
  });
});

describe(isFixedLengthString, () => {
  test('should return true only for the exact length', () => {
    assert.isTrue(isFixedLengthString('JP', 2));

    assert.isTrue(isFixedLengthString('', 0));

    assert.isFalse(isFixedLengthString('JPN', 2));

    assert.isFalse(isFixedLengthString('J', 2));
  });

  test('should measure length in UTF-16 code units', () => {
    assert.isTrue(isFixedLengthString('🎉', 2)); // Surrogate pair

    assert.isFalse(isFixedLengthString('🎉', 1));
  });

  test('should act as a type guard', () => {
    const value: string = 'JP';

    if (isFixedLengthString(value, 2)) {
      expectType<typeof value, FixedLengthString<2>>('<=');

      expectType<typeof value, BoundedLengthString<2, 2>>('<=');

      expectType<typeof value, MaxLengthString<5>>('<='); // 2 <= 5

      expectType<typeof value, MinLengthString<1>>('<='); // 2 >= 1

      expectType<typeof value, NonEmptyString>('<=');

      expectType<typeof value, FixedLengthString<3>>('!<=');
    }
  });
});
