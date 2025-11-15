import { expectType } from '../../expect-type.mjs';
import {
  every,
  indexIsInRange,
  isArray,
  isArrayAtLeastLength,
  isArrayOfLength,
  isEmpty,
  isNonEmpty,
  some,
} from './array-utils-validation.mjs';

describe('Arr validations', () => {
  describe(isArray, () => {
    test('should return true for arrays', () => {
      expect(isArray([1, 2, 3])).toBe(true);

      expect(isArray([])).toBe(true);

      expect(isArray(['a', 'b'])).toBe(true);
    });

    test('should return false for non-arrays', () => {
      expect(isArray('hello')).toBe(false);

      expect(isArray(123)).toBe(false);

      expect(isArray(null)).toBe(false);

      expect(isArray(undefined)).toBe(false);

      expect(isArray({})).toBe(false);

      expect(isArray(new Set())).toBe(false);
    });

    test('should refine union types correctly', () => {
      const processValue = (
        value: string | readonly number[] | null,
      ): number => {
        if (isArray(value)) {
          // value should be typed as number[]
          expectType<typeof value, readonly number[]>('=');

          return value.length;
        }

        return 0;
      };

      expect(processValue([1, 2, 3])).toBe(3);

      expect(processValue('hello')).toBe(0);

      expect(processValue(null)).toBe(0);
    });

    test('should work with readonly arrays', () => {
      const readonlyArray: readonly number[] = [1, 2, 3];

      if (isArray(readonlyArray)) {
        expectType<typeof readonlyArray, readonly number[]>('=');

        expect(readonlyArray).toHaveLength(3);
      }
    });

    test('should work with mutable arrays', () => {
      const mutableArray: number[] = [1, 2, 3];

      if (isArray(mutableArray)) {
        expectType<typeof mutableArray, number[]>('=');

        expect(mutableArray).toHaveLength(3);
      }
    });

    test('should exclude impossible array types from unions', () => {
      const checkUnion = (
        value: string | boolean | readonly number[] | Readonly<{ a: number }>,
      ): number => {
        if (isArray(value)) {
          // Only number[] should remain
          expectType<typeof value, readonly number[]>('=');

          return value.length;
        }

        // Non-array types
        expectType<typeof value, string | boolean | Readonly<{ a: number }>>(
          '=',
        );

        return -1;
      };

      expect(checkUnion([1, 2])).toBe(2);

      expect(checkUnion('test')).toBe(-1);

      expect(checkUnion(true)).toBe(-1);

      expect(checkUnion({ a: 1 })).toBe(-1);
    });

    test('should exclude impossible array types from unions (including unknown)', () => {
      const checkUnion = (
        value:
          | string
          | boolean
          | readonly number[]
          | Readonly<{ a: number }>
          | unknown
          | object,
      ): number => {
        if (isArray(value)) {
          // Only number[] should remain
          expectType<typeof value, readonly unknown[]>('=');

          return value.length;
        }

        // Non-array types
        expectType<
          typeof value,
          string | boolean | Readonly<{ a: number }> | unknown | object
        >('=');

        return -1;
      };

      expect(checkUnion([1, 2])).toBe(2);

      expect(checkUnion('test')).toBe(-1);

      expect(checkUnion(true)).toBe(-1);

      expect(checkUnion({ a: 1 })).toBe(-1);
    });

    test('should return true for arrays (additional)', () => {
      expect(isArray([])).toBe(true);

      expect(isArray([1, 2, 3])).toBe(true);

      expect(isArray(['a', 'b'])).toBe(true);
    });

    test('should return false for non-arrays (additional)', () => {
      expect(isArray('string')).toBe(false);

      expect(isArray(123)).toBe(false);

      expect(isArray({})).toBe(false);

      expect(isArray(null)).toBe(false);

      expect(isArray(undefined)).toBe(false);
    });

    test('should work as type guard (additional)', () => {
      const value: unknown = [1, 2, 3];

      if (isArray(value)) {
        expectType<typeof value, readonly unknown[]>('=');

        expect(value).toHaveLength(3);
      }
    });

    test('should handle array-like objects', () => {
      const arrayLike = { 0: 'a', 1: 'b', length: 2 };

      expect(isArray(arrayLike)).toBe(false);
    });

    describe('comprehensive type guard tests', () => {
      test('should narrow unknown type to array', () => {
        const value: unknown = [1, 2, 3];

        if (isArray(value)) {
          expectType<typeof value, readonly unknown[]>('=');
        } else {
          expectType<typeof value, unknown>('=');
        }
      });

      test('should handle any type', () => {
        const value: any = [1, 2, 3];

        if (isArray(value)) {
          expectType<typeof value, readonly unknown[]>('=');
        }
      });

      test('should work with nested arrays', () => {
        const nested: readonly (readonly number[])[] = [[1], [2], [3]];

        if (isArray(nested)) {
          expectType<typeof nested, readonly (readonly number[])[]>('=');
        }
      });

      test('should distinguish between array and tuple types', () => {
        const tuple: readonly [1, 2, 3] = [1, 2, 3];

        if (isArray(tuple)) {
          expectType<typeof tuple, readonly [1, 2, 3]>('=');
        }
      });

      test('should work with empty tuple type', () => {
        const emptyTuple: readonly [] = [];

        if (isArray(emptyTuple)) {
          expectType<typeof emptyTuple, readonly []>('=');
        }
      });

      test('should handle union of array types', () => {
        type MixedArrayUnion =
          | readonly string[]
          | readonly number[]
          | readonly boolean[];

        const mixedArray: MixedArrayUnion = [1, 2, 3];

        if (isArray(mixedArray)) {
          expectType<typeof mixedArray, MixedArrayUnion>('<=');
        }
      });

      test('should work with generic function', () => {
        const processGeneric = <T,>(value: T | readonly number[]): number => {
          if (isArray(value)) {
            // Type is narrowed to array type within this block
            return value.length;
          }

          return 0;
        };

        expect(processGeneric([1, 2, 3])).toBe(3);

        expect(processGeneric('hello')).toBe(0);
      });

      test('should handle never type correctly', () => {
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        const neverValue = undefined as never;

        if (isArray(neverValue)) {
          expectType<typeof neverValue, never>('=');
        }
      });

      test('should work with conditional types', () => {
        type ArrayOrValue<T> = T extends readonly unknown[] ? T : readonly T[];

        const makeArray = <T,>(value: T): ArrayOrValue<T> => {
          if (isArray(value)) {
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            return value as ArrayOrValue<T>;
          }

          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          return [value] as ArrayOrValue<T>;
        };

        assert.deepStrictEqual(makeArray([1, 2, 3]), [1, 2, 3]);

        assert.deepStrictEqual(makeArray(5), [5]);
      });

      test('should handle intersection types', () => {
        type TaggedArray = readonly number[] & { tag: string };

        const tagged = Object.assign([1, 2, 3], { tag: 'test' }) as TaggedArray;

        if (isArray(tagged)) {
          expectType<typeof tagged, TaggedArray>('=');

          expect(tagged.tag).toBe('test');
        }
      });

      test('should work with branded types', () => {
        type BrandedArray = readonly number[] & Readonly<{ __brand: unknown }>;

        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        const branded = [1, 2, 3] as unknown as BrandedArray;

        if (isArray(branded)) {
          expectType<typeof branded, BrandedArray>('=');
        }
      });

      test('should handle complex union discrimination', () => {
        type ComplexUnion =
          | { type: 'array'; data: readonly string[] }
          | { type: 'object'; data: Record<string, unknown> }
          | readonly number[]
          | string
          | null;

        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
        const processComplex = (value: ComplexUnion): number => {
          if (isArray(value)) {
            expectType<typeof value, readonly number[]>('=');

            return value.length;
          }

          if (typeof value === 'string') {
            expectType<typeof value, string>('=');

            return value.length;
          }

          if (value === null) {
            expectType<typeof value, null>('=');

            return 0;
          }

          expectType<
            typeof value,
            | { type: 'array'; data: readonly string[] }
            | { type: 'object'; data: Record<string, unknown> }
          >('=');

          return -1;
        };

        expect(processComplex([1, 2, 3])).toBe(3);

        expect(processComplex('test')).toBe(4);

        expect(processComplex(null)).toBe(0);

        expect(processComplex({ type: 'array', data: ['a', 'b'] })).toBe(-1);
      });

      test('should preserve literal types in arrays', () => {
        const literalArray = [1, 2, 3] as const;

        if (isArray(literalArray)) {
          expectType<typeof literalArray, readonly [1, 2, 3]>('=');
        }
      });

      test('should handle arrays with mixed element types', () => {
        const mixed: readonly (string | number | boolean)[] = [1, 'two', true];

        if (isArray(mixed)) {
          expectType<typeof mixed, readonly (string | number | boolean)[]>('=');
        }
      });

      test('should work with symbol-keyed arrays', () => {
        const sym = Symbol('test');

        const arrWithSymbol = Object.assign([1, 2, 3], { [sym]: 'value' });

        if (isArray(arrWithSymbol)) {
          expect(arrWithSymbol).toHaveLength(3);
        }
      });
    });
  });

  describe(isEmpty, () => {
    const xs = [1, 2, 3] as const;

    const result = isEmpty(xs);

    expectType<typeof result, boolean>('=');

    test('case 1', () => {
      expect(result).toBe(false);
    });

    test('case 2', () => {
      expect(isEmpty([])).toBe(true);
    });
  });

  describe(isNonEmpty, () => {
    const xs = [1, 2, 3] as const;

    const result = isNonEmpty(xs);

    expectType<typeof result, boolean>('=');

    test('case 1', () => {
      expect(result).toBe(true);
    });

    test('case 2', () => {
      expect(isNonEmpty([])).toBe(false);
    });
  });

  describe(isArrayOfLength, () => {
    test('should return true if array has specified length', () => {
      const arr = [1, 2, 3] as const;

      expect(isArrayOfLength(arr, 3)).toBe(true);

      if (isArrayOfLength(arr, 3)) {
        expectType<typeof arr, readonly [1, 2, 3]>('=');
      }
    });

    test('should return false if array does not have specified length', () => {
      const arr = [1, 2, 3] as const;

      expect(isArrayOfLength(arr, 2)).toBe(false);
    });

    test('should return true for empty array and length 0', () => {
      const arr = [] as const;

      expect(isArrayOfLength(arr, 0)).toBe(true);

      if (isArrayOfLength(arr, 0)) {
        expectType<typeof arr, readonly []>('=');
      }
    });

    test('should return false for non-empty array and length 0', () => {
      const arr = [1] as const;

      expect(isArrayOfLength(arr, 0)).toBe(false);
    });

    test('should work with unknown array type', () => {
      const arr: number[] = [1, 2];

      expect(isArrayOfLength(arr, 2)).toBe(true);

      if (isArrayOfLength(arr, 2)) {
        expectType<typeof arr, number[] & ArrayOfLength<2, number>>('=');
      }

      expect(isArrayOfLength(arr, 3)).toBe(false);
    });

    test('should work with unknown readonly array type', () => {
      const arr: readonly number[] = [1, 2];

      expect(isArrayOfLength(arr, 2)).toBe(true);

      if (isArrayOfLength(arr, 2)) {
        expectType<typeof arr, ArrayOfLength<2, number>>('=');
      }

      expect(isArrayOfLength(arr, 3)).toBe(false);
    });

    test('should return true for arrays of exact length (additional)', () => {
      expect(isArrayOfLength([1, 2, 3], 3)).toBe(true);

      expect(isArrayOfLength([], 0)).toBe(true);

      expect(isArrayOfLength(['a'], 1)).toBe(true);
    });

    test('should return false for arrays of different length (additional)', () => {
      expect(isArrayOfLength([1, 2, 3], 2)).toBe(false);

      expect(isArrayOfLength([1, 2, 3], 4)).toBe(false);

      expect(isArrayOfLength([], 1)).toBe(false);
    });

    test('should work as type guard with exact length (additional)', () => {
      const array: readonly number[] = [1, 2, 3];

      if (isArrayOfLength(array, 3)) {
        expectType<typeof array, ArrayOfLength<3, number>>('=');

        expect(array).toHaveLength(3);
      }
    });
  });

  describe(isArrayAtLeastLength, () => {
    test('should return true if array length is greater than or equal to specified length', () => {
      const arr = [1, 2, 3] as const;

      expect(isArrayAtLeastLength(arr, 3)).toBe(true);

      if (isArrayAtLeastLength(arr, 3)) {
        expectType<typeof arr, readonly [1, 2, 3]>('=');
      }

      expect(isArrayAtLeastLength(arr, 2)).toBe(true);

      if (isArrayAtLeastLength(arr, 2)) {
        expectType<typeof arr, readonly [1, 2, 3]>('=');
      }
    });

    test('should return false if array length is less than specified length', () => {
      const arr = [1, 2, 3] as const;

      expect(isArrayAtLeastLength(arr, 4)).toBe(false);
    });

    test('should return true for empty array and length 0', () => {
      const arr = [] as const;

      expect(isArrayAtLeastLength(arr, 0)).toBe(true);

      if (isArrayAtLeastLength(arr, 0)) {
        expectType<typeof arr, readonly []>('=');
      }
    });

    test('should return false for empty array and positive length', () => {
      const arr = [] as const;

      expect(isArrayAtLeastLength(arr, 1)).toBe(false);
    });

    test('should work with unknown array type', () => {
      const arr: number[] = [1, 2];

      expect(isArrayAtLeastLength(arr, 2)).toBe(true);

      if (isArrayAtLeastLength(arr, 2)) {
        expectType<typeof arr, number[] & ArrayAtLeastLen<2, number>>('=');
      }

      expect(isArrayAtLeastLength(arr, 1)).toBe(true);

      if (isArrayAtLeastLength(arr, 1)) {
        expectType<typeof arr, number[] & ArrayAtLeastLen<1, number>>('=');
      }

      expect(isArrayAtLeastLength(arr, 3)).toBe(false);
    });

    test('should return true for arrays of at least specified length (additional)', () => {
      expect(isArrayAtLeastLength([1, 2, 3], 3)).toBe(true);

      expect(isArrayAtLeastLength([1, 2, 3], 2)).toBe(true);

      expect(isArrayAtLeastLength([1, 2, 3], 1)).toBe(true);

      expect(isArrayAtLeastLength([1, 2, 3], 0)).toBe(true);
    });

    test('should return false for arrays shorter than specified length (additional)', () => {
      expect(isArrayAtLeastLength([1, 2, 3], 4)).toBe(false);

      expect(isArrayAtLeastLength([], 1)).toBe(false);
    });

    test('should work as type guard for at least length (additional)', () => {
      const array: readonly number[] = [1, 2, 3];

      if (isArrayAtLeastLength(array, 2)) {
        expectType<typeof array, ArrayAtLeastLen<2, number>>('=');

        expect(array.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe(every, () => {
    test('should return true when all elements satisfy predicate', () => {
      const evens = [2, 4, 6, 8];

      const allEven = every(evens, (n) => n % 2 === 0);

      expect(allEven).toBe(true);
    });

    test('should return false when not all elements satisfy predicate', () => {
      const mixed = [2, 3, 4, 6];

      const allEven = every(mixed, (n) => n % 2 === 0);

      expect(allEven).toBe(false);
    });

    test('should work as type guard', () => {
      const mixed: (string | number)[] = ['hello', 'world'];

      if (every(mixed, (x): x is string => typeof x === 'string')) {
        // TypeScript narrows mixed to readonly string[] here
        expect(mixed.every((s) => typeof s === 'string')).toBe(true);
      }
    });

    test('should work with curried version', () => {
      const isPositive = (n: number): boolean => n > 0;

      const allPositive = every(isPositive);

      expect(allPositive([1, 2, 3])).toBe(true);

      expect(allPositive([1, -2, 3])).toBe(false);
    });

    test('should work with curried type guards', () => {
      const isString = (x: unknown): x is string => typeof x === 'string';

      const allStrings = every(isString);

      const data: unknown[] = ['a', 'b', 'c'];

      if (allStrings(data)) {
        // TypeScript narrows data to readonly string[] here
        expect(data.join('')).toBe('abc');
      }
    });

    test('should return true for empty array', () => {
      const empty: number[] = [];

      const result = every(empty, (n) => n > 0);

      expect(result).toBe(true);
    });

    test('should pass index to predicate', () => {
      const numbers = [0, 1, 2, 3];

      const indexMatchesValue = every(numbers, (val, idx) => val === idx);

      expect(indexMatchesValue).toBe(true);
    });
  });

  describe(some, () => {
    test('should return true when at least one element satisfies predicate', () => {
      const numbers = [1, 3, 5, 8];

      const hasEven = some(numbers, (n) => n % 2 === 0);

      expect(hasEven).toBe(true);
    });

    test('should return false when no elements satisfy predicate', () => {
      const odds = [1, 3, 5, 7];

      const hasEven = some(odds, (n) => n % 2 === 0);

      expect(hasEven).toBe(false);
    });

    test('should work with curried version', () => {
      const isNegative = (n: number): boolean => n < 0;

      const hasNegative = some(isNegative);

      expect(hasNegative([1, 2, -3])).toBe(true);

      expect(hasNegative([1, 2, 3])).toBe(false);
    });

    test('should return false for empty array', () => {
      const empty: number[] = [];

      const result = some(empty, (n) => n > 0);

      expect(result).toBe(false);
    });

    test('should pass index to predicate', () => {
      const numbers = [10, 10, 10, 30];

      const hasValueMatchingIndex = some(
        numbers,
        (val, idx) => val === idx * 10,
      );

      expect(hasValueMatchingIndex).toBe(true);
    });
  });

  describe(indexIsInRange, () => {
    test('should return true for valid indices', () => {
      const array = ['a', 'b', 'c'];

      expect(indexIsInRange(array, 0)).toBe(true);

      expect(indexIsInRange(array, 1)).toBe(true);

      expect(indexIsInRange(array, 2)).toBe(true);
    });

    test('should return false for invalid indices', () => {
      const array = ['a', 'b', 'c'];

      expect(indexIsInRange(array, 3)).toBe(false);

      expect(indexIsInRange(array, 10)).toBe(false);
    });

    test('should work with empty array', () => {
      const empty: readonly string[] = [];

      expect(indexIsInRange(empty, 0)).toBe(false);

      // @ts-expect-error negative indices should not be allowed
      expect(indexIsInRange(empty, -1)).toBe(false);
    });

    test('should be type error with floating point indices', () => {
      const array = [1, 2, 3];

      // @ts-expect-error floating point indices should not be allowed
      expect(indexIsInRange(array, 1.5)).toBe(true); // JavaScript arrays accept floating point indices

      // @ts-expect-error floating point indices should not be allowed
      expect(indexIsInRange(array, 3.1)).toBe(false);
    });
  });
});
