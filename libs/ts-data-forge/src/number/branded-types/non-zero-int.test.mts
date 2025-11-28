import { expectType } from '../../expect-type.mjs';
import { range } from '../../iterator/index.mjs';
import { asNonZeroInt, isNonZeroInt, NonZeroInt } from './non-zero-int.mjs';

describe('NonZeroInt test', () => {
  describe(asNonZeroInt, () => {
    test('accepts valid non-zero integers', () => {
      expect(() => asNonZeroInt(1)).not.toThrow();

      expect(() => asNonZeroInt(-1)).not.toThrow();

      expect(() => asNonZeroInt(42)).not.toThrow();

      expect(() => asNonZeroInt(-42)).not.toThrow();

      expect(() => asNonZeroInt(Number.MAX_SAFE_INTEGER)).not.toThrow();

      expect(() => asNonZeroInt(Number.MIN_SAFE_INTEGER)).not.toThrow();
    });

    test('rejects zero', () => {
      expect(() => asNonZeroInt(0)).toThrow(TypeError);

      expect(() => asNonZeroInt(-0)).toThrow(TypeError);
    });

    test('rejects non-integers', () => {
      expect(() => asNonZeroInt(Number.NaN)).toThrow(TypeError);

      expect(() => asNonZeroInt(Number.POSITIVE_INFINITY)).toThrow(TypeError);

      expect(() => asNonZeroInt(Number.NEGATIVE_INFINITY)).toThrow(TypeError);

      expect(() => asNonZeroInt(1.2)).toThrow(TypeError);

      expect(() => asNonZeroInt(-3.4)).toThrow(TypeError);
    });

    test('returns the same value for valid inputs', () => {
      expect(asNonZeroInt(5)).toBe(5);

      expect(asNonZeroInt(-10)).toBe(-10);

      expect(asNonZeroInt(1)).toBe(1);
    });

    test.each([
      { name: 'Number.NaN', value: Number.NaN },
      { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
      { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
      { name: '1.2', value: 1.2 },
      { name: '-3.4', value: -3.4 },
      { name: '0', value: 0 },
    ] as const)(`asNonZeroInt($name) should throw a TypeError`, ({ value }) => {
      expect(() => asNonZeroInt(value)).toThrow(
        new TypeError(`Expected a non-zero integer, got: ${value}`),
      );
    });
  });

  describe(isNonZeroInt, () => {
    test('correctly identifies non-zero integers', () => {
      assert.isTrue(isNonZeroInt(1));

      assert.isTrue(isNonZeroInt(-1));

      assert.isTrue(isNonZeroInt(42));

      assert.isTrue(isNonZeroInt(-42));

      assert.isTrue(isNonZeroInt(Number.MAX_SAFE_INTEGER));

      assert.isTrue(isNonZeroInt(Number.MIN_SAFE_INTEGER));
    });

    test('correctly identifies zero', () => {
      assert.isFalse(isNonZeroInt(0));

      assert.isFalse(isNonZeroInt(-0));
    });

    test('correctly identifies non-integers', () => {
      assert.isFalse(isNonZeroInt(Number.NaN));

      assert.isFalse(isNonZeroInt(Number.POSITIVE_INFINITY));

      assert.isFalse(isNonZeroInt(Number.NEGATIVE_INFINITY));

      assert.isFalse(isNonZeroInt(1.2));

      assert.isFalse(isNonZeroInt(-3.4));
    });
  });

  describe('NonZeroInt.is', () => {
    test('same as isNonZeroInt function', () => {
      expect(NonZeroInt.is(5)).toBe(isNonZeroInt(5));

      expect(NonZeroInt.is(0)).toBe(isNonZeroInt(0));

      expect(NonZeroInt.is(-10)).toBe(isNonZeroInt(-10));
    });
  });

  describe('mathematical operations', () => {
    const a = asNonZeroInt(5);

    const b = asNonZeroInt(2);

    const c = asNonZeroInt(-3);

    test('abs', () => {
      expect(NonZeroInt.abs(a)).toBe(5);

      expect(NonZeroInt.abs(c)).toBe(3);

      expect(NonZeroInt.abs(asNonZeroInt(-1))).toBe(1);
    });

    test('min and max', () => {
      expect(NonZeroInt.min(a, b)).toBe(2);

      expect(NonZeroInt.max(a, b)).toBe(5);

      expect(NonZeroInt.min(a, c)).toBe(-3);

      expect(NonZeroInt.max(a, c)).toBe(5);
    });

    test('add', () => {
      expect(NonZeroInt.add(a, b)).toBe(7);

      expect(NonZeroInt.add(a, c)).toBe(2);
    });

    test('sub', () => {
      expect(NonZeroInt.sub(a, b)).toBe(3);

      expect(NonZeroInt.sub(a, c)).toBe(8);
    });

    test('mul', () => {
      expect(NonZeroInt.mul(a, b)).toBe(10);

      expect(NonZeroInt.mul(a, c)).toBe(-15);
    });

    test('div (floor division)', () => {
      expect(NonZeroInt.div(a, b)).toBe(2);

      expect(NonZeroInt.div(asNonZeroInt(7), asNonZeroInt(3))).toBe(2);

      expect(NonZeroInt.div(asNonZeroInt(-7), asNonZeroInt(3))).toBe(-3);
    });

    test('pow', () => {
      expect(NonZeroInt.pow(asNonZeroInt(2), asNonZeroInt(3))).toBe(8);

      expect(NonZeroInt.pow(asNonZeroInt(3), asNonZeroInt(2))).toBe(9);

      expect(NonZeroInt.pow(asNonZeroInt(-2), asNonZeroInt(3))).toBe(-8);
    });
  });

  describe('random', () => {
    test('generates non-zero integers within specified range (positive range)', () => {
      const min = 1;

      const max = 10;

      for (const _ of range(10)) {
        const result = NonZeroInt.random(min, max);

        expect(result).toBeGreaterThanOrEqual(min);

        expect(result).toBeLessThanOrEqual(max);

        assert.isTrue(NonZeroInt.is(result));

        assert.isTrue(Number.isInteger(result));

        expect(result).not.toBe(0);
      }
    });

    test('generates non-zero integers within specified range (negative range)', () => {
      const min = -10;

      const max = -1;

      for (const _ of range(10)) {
        const result = NonZeroInt.random(min, max);

        expect(result).toBeGreaterThanOrEqual(min);

        expect(result).toBeLessThanOrEqual(max);

        assert.isTrue(NonZeroInt.is(result));

        assert.isTrue(Number.isInteger(result));

        expect(result).not.toBe(0);
      }
    });

    test('generates non-zero integers within range that spans zero', () => {
      const min = -5;

      const max = 5;

      for (const _ of range(10)) {
        const result = NonZeroInt.random(min, max);

        expect(result).toBeGreaterThanOrEqual(min);

        expect(result).toBeLessThanOrEqual(max);

        assert.isTrue(NonZeroInt.is(result));

        assert.isTrue(Number.isInteger(result));

        expect(result).not.toBe(0);
      }
    });
  });

  describe('type assertions', () => {
    test('type relationships', () => {
      expectType<NonZeroInt, number>('<=');

      expectTypeOf(asNonZeroInt(5)).toExtend<NonZeroInt>();
    });
  });
});
