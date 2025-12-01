import { expectType } from '../../expect-type.mjs';
import { Uint8, asUint8, isUint8 } from './uint8.mjs';

describe('Uint8 test', () => {
  describe(isUint8, () => {
    test.each([
      { value: 0, expected: true },
      { value: 128, expected: true },
      { value: 255, expected: true },
      { value: -1, expected: false },
      { value: 256, expected: false },
      { value: 1.5, expected: false },
      { value: Number.NaN, expected: false },
      { value: Number.POSITIVE_INFINITY, expected: false },
      { value: Number.NEGATIVE_INFINITY, expected: false },
    ])('isUint8($value) should return $expected', ({ expected, value }) => {
      expect(isUint8(value)).toBe(expected);
    });
  });

  describe(asUint8, () => {
    test.each([
      { value: 0, expected: 0 },
      { value: 128, expected: 128 },
      { value: 255, expected: 255 },
    ])('asUint8($value) should return $expected', ({ expected, value }) => {
      expect(asUint8(value)).toBe(expected);
    });

    test.each([
      { value: -1, name: '-1' },
      { value: 256, name: '256' },
      { value: 1.5, name: '1.5' },
      { value: Number.NaN, name: 'NaN' },
      { value: Number.POSITIVE_INFINITY, name: 'Infinity' },
      { value: Number.NEGATIVE_INFINITY, name: '-Infinity' },
    ])('asUint8($name) should throw TypeError', ({ value }) => {
      expect(() => asUint8(value)).toThrowError(TypeError);
    });
  });

  describe('Uint8.is', () => {
    test('should be the same as isUint8', () => {
      expect(Uint8.is).toBe(isUint8);
    });
  });

  describe('Uint8.MIN_VALUE', () => {
    test('should be 0', () => {
      expect(Uint8.MIN_VALUE).toBe(0);

      expectType<typeof Uint8.MIN_VALUE, 0>('=');
    });
  });

  describe('Uint8.MAX_VALUE', () => {
    test('should be 255', () => {
      expect(Uint8.MAX_VALUE).toBe(255);

      expectType<typeof Uint8.MAX_VALUE, 255>('=');
    });
  });

  describe('Uint8.clamp', () => {
    test.each([
      { value: -100, expected: 0 },
      { value: 0, expected: 0 },
      { value: 128, expected: 128 },
      { value: 255, expected: 255 },
      { value: 300, expected: 255 },
      { value: 1.5, expected: 2 },
    ])('Uint8.clamp($value) should return $expected', ({ expected, value }) => {
      expect(Uint8.clamp(value)).toBe(expected);
    });
  });

  describe('Uint8.min', () => {
    test('should return minimum value', () => {
      expect(Uint8.min(100, 50, 10)).toBe(10);

      expect(Uint8.min(1, 2, 3)).toBe(1);
    });
  });

  describe('Uint8.max', () => {
    test('should return maximum value', () => {
      expect(Uint8.max(100, 50, 10)).toBe(100);

      expect(Uint8.max(1, 2, 3)).toBe(3);
    });
  });

  describe('Uint8.add', () => {
    test.each([
      { x: 10, y: 20, expected: 30 },
      { x: 200, y: 100, expected: 255 }, // clamped to max
      { x: 100, y: 50, expected: 150 },
    ] as const)(
      'Uint8.add($x, $y) should return $expected',
      ({ expected, x, y }) => {
        expect(Uint8.add(x, y)).toBe(expected);
      },
    );
  });

  describe('Uint8.sub', () => {
    test.each([
      { x: 30, y: 10, expected: 20 },
      { x: 10, y: 30, expected: 0 }, // clamped to min
      { x: 200, y: 50, expected: 150 },
    ] as const)(
      'Uint8.sub($x, $y) should return $expected',
      ({ expected, x, y }) => {
        expect(Uint8.sub(x, y)).toBe(expected);
      },
    );
  });

  describe('Uint8.mul', () => {
    test.each([
      { x: 5, y: 10, expected: 50 },
      { x: 20, y: 20, expected: 255 }, // clamped to max
      { x: 100, y: 2, expected: 200 },
    ] as const)(
      'Uint8.mul($x, $y) should return $expected',
      ({ expected, x, y }) => {
        expect(Uint8.mul(x, y)).toBe(expected);
      },
    );
  });

  describe('Uint8.div', () => {
    test.each([
      { x: 100, y: 2, expected: 50 },
      { x: 100, y: 3, expected: 33 }, // floor division
      { x: 255, y: 5, expected: 51 },
    ] as const)(
      'Uint8.div($x, $y) should return $expected',
      ({ expected, x, y }) => {
        expect(Uint8.div(x, y)).toBe(expected);
      },
    );
  });

  describe('Uint8.pow', () => {
    test.each([
      { x: 2, y: 3, expected: 8 },
      { x: 4, y: 4, expected: 255 }, // clamped to max
      { x: 10, y: 2, expected: 100 },
    ] as const)(
      'Uint8.pow($x, $y) should return $expected',
      ({ expected, x, y }) => {
        expect(Uint8.pow(x, y)).toBe(expected);
      },
    );
  });

  describe('Uint8.random', () => {
    test('should generate value within range', () => {
      const min = 10;

      const max = 50;

      const result = Uint8.random(min, max);

      expect(result).toBeGreaterThanOrEqual(min);

      expect(result).toBeLessThanOrEqual(max);

      assert.isTrue(Number.isInteger(result));
    });
  });
});
