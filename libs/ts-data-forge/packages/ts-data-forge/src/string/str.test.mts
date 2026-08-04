import {
  type BoundedLengthString,
  type FixedLengthString,
  type MaxLengthString,
  type MinLengthString,
  type NonEmptyString,
} from 'ts-type-forge';
import { expectType } from '../expect-type.mjs';
import { Str } from './str.mjs';

describe(Str.isMinLengthString, () => {
  test('should return true when the string is long enough', () => {
    assert.isTrue(Str.isMinLengthString(3, 'hello'));

    assert.isTrue(Str.isMinLengthString(5, 'hello'));

    assert.isTrue(Str.isMinLengthString(0, ''));

    assert.isTrue(Str.isMinLengthString(1, ' ')); // Space counts
  });

  test('should return false when the string is too short', () => {
    assert.isFalse(Str.isMinLengthString(3, 'hi'));

    assert.isFalse(Str.isMinLengthString(1, ''));
  });

  test('should measure length in UTF-16 code units', () => {
    assert.isTrue(Str.isMinLengthString(2, '🎉')); // Surrogate pair

    assert.isFalse(Str.isMinLengthString(3, '🎉'));
  });

  test('should act as a type guard', () => {
    const value: string = 'very-secret-password';

    if (Str.isMinLengthString(12, value)) {
      expectType<typeof value, MinLengthString<12>>('<=');

      expectType<typeof value, NonEmptyString>('<='); // 12 >= 1

      expectType<typeof value, MinLengthString<16>>('!<=');

      expect(value.length).toBeGreaterThanOrEqual(12);
    }
  });

  test('should preserve literal string types', () => {
    const literal = 'hello';

    if (Str.isMinLengthString(3, literal)) {
      expectType<typeof literal, 'hello'>('<=');

      expectType<typeof literal, MinLengthString<3>>('<=');
    }
  });
});

describe(Str.isMaxLengthString, () => {
  test('should return true when the string is short enough', () => {
    assert.isTrue(Str.isMaxLengthString(10, 'hello'));

    assert.isTrue(Str.isMaxLengthString(5, 'hello'));

    assert.isTrue(Str.isMaxLengthString(0, ''));
  });

  test('should return false when the string is too long', () => {
    assert.isFalse(Str.isMaxLengthString(3, 'hello'));

    assert.isFalse(Str.isMaxLengthString(0, ' '));
  });

  test('should measure length in UTF-16 code units', () => {
    assert.isFalse(Str.isMaxLengthString(1, '🎉')); // Surrogate pair

    assert.isTrue(Str.isMaxLengthString(2, '🎉'));
  });

  test('should act as a type guard', () => {
    const value: string = 'noshiro';

    if (Str.isMaxLengthString(32, value)) {
      expectType<typeof value, MaxLengthString<32>>('<=');

      expectType<typeof value, MaxLengthString<64>>('<='); // 32 <= 64

      expectType<typeof value, MaxLengthString<16>>('!<=');

      expect(value.length).toBeLessThanOrEqual(32);
    }
  });
});

describe(Str.isBoundedLengthString, () => {
  test('should return true when the length is within the range', () => {
    assert.isTrue(Str.isBoundedLengthString(8, 16, 'user-12345678'));

    assert.isTrue(Str.isBoundedLengthString(8, 16, '12345678')); // Lower bound (inclusive)

    assert.isTrue(Str.isBoundedLengthString(8, 16, '1234567890123456')); // Upper bound (inclusive)

    assert.isTrue(Str.isBoundedLengthString(0, 0, ''));
  });

  test('should return false when the length is out of range', () => {
    assert.isFalse(Str.isBoundedLengthString(8, 16, 'user'));

    assert.isFalse(Str.isBoundedLengthString(8, 16, '12345678901234567'));
  });

  test('should act as a type guard', () => {
    const value: string = 'user-12345678';

    if (Str.isBoundedLengthString(8, 16, value)) {
      expectType<typeof value, BoundedLengthString<8, 16>>('<=');

      expectType<typeof value, BoundedLengthString<1, 255>>('<='); // [8, 16] ⊆ [1, 255]

      expectType<typeof value, MinLengthString<8>>('<=');

      expectType<typeof value, MaxLengthString<16>>('<=');

      expectType<typeof value, NonEmptyString>('<='); // 8 >= 1

      expectType<typeof value, BoundedLengthString<10, 16>>('!<=');
    }
  });
});

describe(Str.isFixedLengthString, () => {
  test('should return true only for the exact length', () => {
    assert.isTrue(Str.isFixedLengthString(2, 'JP'));

    assert.isTrue(Str.isFixedLengthString(0, ''));

    assert.isFalse(Str.isFixedLengthString(2, 'JPN'));

    assert.isFalse(Str.isFixedLengthString(2, 'J'));
  });

  test('should measure length in UTF-16 code units', () => {
    assert.isTrue(Str.isFixedLengthString(2, '🎉')); // Surrogate pair

    assert.isFalse(Str.isFixedLengthString(1, '🎉'));
  });

  test('should act as a type guard', () => {
    const value: string = 'JP';

    if (Str.isFixedLengthString(2, value)) {
      expectType<typeof value, FixedLengthString<2>>('<=');

      expectType<typeof value, BoundedLengthString<2, 2>>('<=');

      expectType<typeof value, MaxLengthString<5>>('<='); // 2 <= 5

      expectType<typeof value, MinLengthString<1>>('<='); // 2 >= 1

      expectType<typeof value, NonEmptyString>('<=');

      expectType<typeof value, FixedLengthString<3>>('!<=');
    }
  });
});

describe('Str length-bounded casts', () => {
  test('asMinLengthString returns the value and narrows its type', () => {
    const result = Str.asMinLengthString(3, 'very-secret');

    expectType<typeof result, MinLengthString<3>>('<=');

    assert.strictEqual(result, 'very-secret');
  });

  test('asMinLengthString throws when too short', () => {
    assert.throws(() => Str.asMinLengthString(3, 'hi'), TypeError);
  });

  test('asMaxLengthString returns the value and narrows its type', () => {
    const result = Str.asMaxLengthString(32, 'noshiro');

    expectType<typeof result, MaxLengthString<32>>('<=');

    assert.strictEqual(result, 'noshiro');
  });

  test('asMaxLengthString throws when too long', () => {
    assert.throws(() => Str.asMaxLengthString(3, 'noshiro'), TypeError);
  });

  test('asBoundedLengthString returns the value and narrows its type', () => {
    const result = Str.asBoundedLengthString(8, 16, 'user-12345678');

    expectType<typeof result, BoundedLengthString<8, 16>>('<=');

    assert.strictEqual(result, 'user-12345678');
  });

  test('asBoundedLengthString throws when out of range', () => {
    assert.throws(() => Str.asBoundedLengthString(8, 16, 'user'), TypeError);
  });

  test('asFixedLengthString returns the value and narrows its type', () => {
    const result = Str.asFixedLengthString(2, 'JP');

    expectType<typeof result, FixedLengthString<2>>('<=');

    assert.strictEqual(result, 'JP');
  });

  test('asFixedLengthString throws when the length differs', () => {
    assert.throws(() => Str.asFixedLengthString(3, 'JP'), TypeError);
  });
});

describe('Str length-bounded casts (curried)', () => {
  test('asMinLengthString returns the value and narrows its type', () => {
    const result = Str.asMinLengthString(3)('very-secret');

    expectType<typeof result, MinLengthString<3>>('<=');

    assert.strictEqual(result, 'very-secret');
  });

  test('asMinLengthString throws when too short', () => {
    assert.throws(() => Str.asMinLengthString(3)('hi'), TypeError);
  });

  test('asMaxLengthString returns the value and narrows its type', () => {
    const result = Str.asMaxLengthString(32)('noshiro');

    expectType<typeof result, MaxLengthString<32>>('<=');

    assert.strictEqual(result, 'noshiro');
  });

  test('asMaxLengthString throws when too long', () => {
    assert.throws(() => Str.asMaxLengthString(3)('noshiro'), TypeError);
  });

  test('asBoundedLengthString returns the value and narrows its type', () => {
    const result = Str.asBoundedLengthString(8, 16)('user-12345678');

    expectType<typeof result, BoundedLengthString<8, 16>>('<=');

    assert.strictEqual(result, 'user-12345678');
  });

  test('asBoundedLengthString throws when out of range', () => {
    assert.throws(() => Str.asBoundedLengthString(8, 16)('user'), TypeError);
  });

  test('asFixedLengthString returns the value and narrows its type', () => {
    const result = Str.asFixedLengthString(2)('JP');

    expectType<typeof result, FixedLengthString<2>>('<=');

    assert.strictEqual(result, 'JP');
  });

  test('asFixedLengthString throws when the length differs', () => {
    assert.throws(() => Str.asFixedLengthString(3)('JP'), TypeError);
  });
});

describe(Str.asNonEmptyString, () => {
  test('returns the value and narrows its type', () => {
    const result = Str.asNonEmptyString('noshiro');

    expectType<typeof result, NonEmptyString>('<=');

    expectType<typeof result, MinLengthString<1>>('<=');

    assert.strictEqual(result, 'noshiro');
  });

  test('throws when the string is empty', () => {
    assert.throws(() => Str.asNonEmptyString(''), TypeError);
  });

  test('preserves literal string types', () => {
    const result = Str.asNonEmptyString('hello');

    expectType<typeof result, 'hello'>('<=');

    expectType<typeof result, NonEmptyString>('<=');

    assert.strictEqual(result, 'hello');
  });
});
