import { expectType } from '../../expect-type.mjs';
import { Int8, asInt8, isInt8 } from './int8.mjs';

describe('Int8 test', () => {
  describe(isInt8, () => {
    test.each([
      { value: -128, expected: true },
      { value: 0, expected: true },
      { value: 127, expected: true },
      { value: -129, expected: false },
      { value: 128, expected: false },
      { value: 1.5, expected: false },
      { value: Number.NaN, expected: false },
      { value: Number.POSITIVE_INFINITY, expected: false },
      { value: Number.NEGATIVE_INFINITY, expected: false },
    ])('isInt8($value) should return $expected', ({ expected, value }) => {
      expect(isInt8(value)).toBe(expected);
    });
  });

  describe(asInt8, () => {
    test.each([
      { value: -128, expected: -128 },
      { value: 0, expected: 0 },
      { value: 127, expected: 127 },
    ])('asInt8($value) should return $expected', ({ expected, value }) => {
      expect(asInt8(value)).toBe(expected);
    });

    test.each([
      { value: -129, name: '-129' },
      { value: 128, name: '128' },
      { value: 1.5, name: '1.5' },
      { value: Number.NaN, name: 'NaN' },
      { value: Number.POSITIVE_INFINITY, name: 'Infinity' },
      { value: Number.NEGATIVE_INFINITY, name: '-Infinity' },
    ])('asInt8($name) should throw TypeError', ({ value }) => {
      expect(() => asInt8(value)).toThrowError(TypeError);
    });
  });

  describe('Int8.is', () => {
    test('should be the same as isInt8', () => {
      expect(Int8.is).toBe(isInt8);
    });
  });

  describe('Int8.MIN_VALUE', () => {
    test('should be -128', () => {
      expect(Int8.MIN_VALUE).toBe(-128);

      expectType<typeof Int8.MIN_VALUE, -128>('=');
    });
  });

  describe('Int8.MAX_VALUE', () => {
    test('should be 127', () => {
      expect(Int8.MAX_VALUE).toBe(127);

      expectType<typeof Int8.MAX_VALUE, 127>('=');
    });
  });

  describe('Int8.clamp', () => {
    test.each([
      { value: -200, expected: -128 },
      { value: -128, expected: -128 },
      { value: 0, expected: 0 },
      { value: 127, expected: 127 },
      { value: 200, expected: 127 },
      { value: 1.5, expected: 2 },
    ])('Int8.clamp($value) should return $expected', ({ expected, value }) => {
      expect(Int8.clamp(value)).toBe(expected);
    });
  });

  describe('Int8.min', () => {
    test('should return minimum value', () => {
      expect(Int8.min(-100, -50, 10)).toBe(-100);

      expect(Int8.min(1, 2, 3)).toBe(1);
    });
  });

  describe('Int8.max', () => {
    test('should return maximum value', () => {
      expect(Int8.max(-100, -50, 10)).toBe(10);

      expect(Int8.max(1, 2, 3)).toBe(3);
    });
  });

  describe('Int8.abs', () => {
    test.each([
      { value: -100, expected: 100 },
      { value: 0, expected: 0 },
      { value: 50, expected: 50 },
      { value: -128, expected: 128 },
    ] as const)(
      'Int8.abs($value) should return $expected',
      ({ expected, value }) => {
        const result = Int8.abs(value);

        expect(result).toBe(expected);

        expectType<typeof result, typeof expected>('=');
      },
    );
  });

  describe('Int8.add', () => {
    test.each([
      { x: 10, y: 20, expected: 30 },
      { x: 100, y: 50, expected: 127 }, // clamped to max
      { x: -100, y: -50, expected: -128 }, // clamped to min
    ] as const)(
      'Int8.add($x, $y) should return $expected',
      ({ expected, x, y }) => {
        expect(Int8.add(x, y)).toBe(expected);
      },
    );
  });

  describe('Int8.sub', () => {
    test.each([
      { x: 20, y: 10, expected: 10 },
      { x: -100, y: 50, expected: -128 }, // clamped to min
      { x: 100, y: -50, expected: 127 }, // clamped to max
    ] as const)(
      'Int8.sub($x, $y) should return $expected',
      ({ expected, x, y }) => {
        expect(Int8.sub(x, y)).toBe(expected);
      },
    );
  });

  describe('Int8.mul', () => {
    test.each([
      { x: 5, y: 10, expected: 50 },
      { x: 20, y: 10, expected: 127 }, // clamped to max
      { x: -20, y: 10, expected: -128 }, // clamped to min
    ] as const)(
      'Int8.mul($x, $y) should return $expected',
      ({ expected, x, y }) => {
        expect(Int8.mul(x, y)).toBe(expected);
      },
    );
  });

  describe('Int8.div', () => {
    test.each([
      { x: 100, y: 2, expected: 50 },
      { x: 100, y: 3, expected: 33 }, // floor division
      { x: -100, y: 3, expected: -34 },
    ] as const)(
      'Int8.div($x, $y) should return $expected',
      ({ expected, x, y }) => {
        expect(Int8.div(x, y)).toBe(expected);
      },
    );
  });

  describe('Int8.pow', () => {
    test.each([
      { x: 2, y: 3, expected: 8 },
      { x: 10, y: 3, expected: 127 }, // clamped to max
      { x: -10, y: 3, expected: -128 }, // clamped to min
    ] as const)(
      'Int8.pow($x, $y) should return $expected',
      ({ expected, x, y }) => {
        expect(Int8.pow(x, y)).toBe(expected);
      },
    );
  });

  describe('Int8.random', () => {
    test('should generate value within range', () => {
      const min = -10;

      const max = 10;

      const result = Int8.random(min, max);

      expect(result).toBeGreaterThanOrEqual(min);

      expect(result).toBeLessThanOrEqual(max);

      assert.isTrue(Number.isInteger(result));
    });
  });
});
