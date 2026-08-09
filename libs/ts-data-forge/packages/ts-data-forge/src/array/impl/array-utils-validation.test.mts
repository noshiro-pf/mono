import {
  type BoundedLengthArray,
  type FixedLengthArray,
  type FixedLengthTuple,
  type MinLengthArray,
  type ReadonlyRecord,
} from 'ts-type-forge';
import { expectType } from '../../expect-type.mjs';
import {
  asBoundedLengthArray,
  asFixedLengthArray,
  asMinLengthArray,
} from './array-utils-length-bounded-array-cast.mjs';
import {
  every,
  indexIsInRange,
  isArray,
  some,
} from './array-utils-validation.mjs';

describe('Arr validations', () => {
  describe(isArray, () => {
    test('should return true for arrays', () => {
      assert.isTrue(isArray([1, 2, 3]));

      assert.isTrue(isArray([]));

      assert.isTrue(isArray(['a', 'b']));
    });

    test('should return false for non-arrays', () => {
      assert.isFalse(isArray('hello'));

      assert.isFalse(isArray(123));

      assert.isFalse(isArray(null));

      assert.isFalse(isArray(undefined));

      assert.isFalse(isArray({}));

      assert.isFalse(isArray(new Set()));
    });

    test('should refine union types correctly', () => {
      const processValue = (
        value: string | null | readonly number[],
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
      const readonlyArray: readonly number[] = [1, 2, 3] as const;

      if (isArray(readonlyArray)) {
        expectType<typeof readonlyArray, readonly number[]>('=');

        expect(readonlyArray).toHaveLength(3);
      }
    });

    test('should work with mutable arrays', () => {
      // transformer-ignore-next-line convert-to-readonly, append-as-const
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
          | unknown
          | object
          | readonly number[]
          | Readonly<{ a: number }>,
      ): number => {
        if (isArray(value)) {
          // Only number[] should remain
          expectType<typeof value, readonly unknown[]>('=');

          return value.length;
        }

        // Non-array types
        expectType<
          typeof value,
          string | boolean | unknown | object | Readonly<{ a: number }>
        >('=');

        return -1;
      };

      expect(checkUnion([1, 2])).toBe(2);

      expect(checkUnion('test')).toBe(-1);

      expect(checkUnion(true)).toBe(-1);

      expect(checkUnion({ a: 1 })).toBe(-1);
    });

    test('should return true for arrays (additional)', () => {
      assert.isTrue(isArray([]));

      assert.isTrue(isArray([1, 2, 3]));

      assert.isTrue(isArray(['a', 'b']));
    });

    test('should return false for non-arrays (additional)', () => {
      assert.isFalse(isArray('string'));

      assert.isFalse(isArray(123));

      assert.isFalse(isArray({}));

      assert.isFalse(isArray(null));

      assert.isFalse(isArray(undefined));
    });

    test('should work as type guard (additional)', () => {
      const value: unknown = [1, 2, 3] as const;

      if (isArray(value)) {
        expectType<typeof value, readonly unknown[]>('=');

        expect(value).toHaveLength(3);
      }
    });

    test('should handle array-like objects', () => {
      const arrayLike = { 0: 'a', 1: 'b', length: 2 } as const;

      assert.isFalse(isArray(arrayLike));
    });

    describe('comprehensive type guard tests', () => {
      test('should narrow unknown type to array', () => {
        const value: unknown = [1, 2, 3] as const;

        if (isArray(value)) {
          expectType<typeof value, readonly unknown[]>('=');
        } else {
          expectType<typeof value, unknown>('=');
        }
      });

      test('should handle any type', () => {
        const value: any = [1, 2, 3] as const;

        if (isArray(value)) {
          expectType<typeof value, readonly unknown[]>('=');
        }
      });

      test('should work with nested arrays', () => {
        const nested: readonly (readonly number[])[] = [[1], [2], [3]] as const;

        if (isArray(nested)) {
          expectType<typeof nested, readonly (readonly number[])[]>('=');
        }
      });

      test('should distinguish between array and tuple types', () => {
        const tuple: readonly [1, 2, 3] = [1, 2, 3] as const;

        if (isArray(tuple)) {
          expectType<typeof tuple, readonly [1, 2, 3]>('=');
        }
      });

      test('should work with empty tuple type', () => {
        const emptyTuple: readonly [] = [] as const;

        if (isArray(emptyTuple)) {
          expectType<typeof emptyTuple, readonly []>('=');
        }
      });

      test('should handle union of array types', () => {
        type MixedArrayUnion =
          readonly string[] | readonly number[] | readonly boolean[];

        const mixedArray: MixedArrayUnion = [1, 2, 3] as const;

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
        type TaggedArray = readonly number[] & Readonly<{ tag: string }>;

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
          | Readonly<
              | { type: 'array'; data: readonly string[] }
              | { type: 'object'; data: ReadonlyRecord<string, unknown> }
            >
          | readonly number[]
          | string
          | null;

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
            Readonly<
              | { type: 'array'; data: readonly string[] }
              | { type: 'object'; data: ReadonlyRecord<string, unknown> }
            >
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
        const mixed: readonly (string | number | boolean)[] = [
          1,
          'two',
          true,
        ] as const;

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

  describe(every, () => {
    test('should return true when all elements satisfy predicate', () => {
      const evens = [2, 4, 6, 8] as const;

      const allEven = every(evens, (n) => n % 2 === 0);

      assert.isTrue(allEven);
    });

    test('should return false when not all elements satisfy predicate', () => {
      const mixed = [2, 3, 4, 6] as const;

      const allEven = every(mixed, (n) => n % 2 === 0);

      assert.isFalse(allEven);
    });

    test('should work as type guard', () => {
      const mixed: readonly (string | number)[] = ['hello', 'world'] as const;

      if (every(mixed, (x): x is string => typeof x === 'string')) {
        // TypeScript narrows mixed to readonly string[] here
        assert.isTrue(mixed.every((s) => typeof s === 'string'));
      }
    });

    test('should work with curried version', () => {
      const isPositive = (n: number): boolean => n > 0;

      const allPositive = every(isPositive);

      assert.isTrue(allPositive([1, 2, 3]));

      assert.isFalse(allPositive([1, -2, 3]));
    });

    test('should work with curried type guards', () => {
      const isString = (x: unknown): x is string => typeof x === 'string';

      const allStrings = every(isString);

      const data: readonly unknown[] = ['a', 'b', 'c'] as const;

      if (allStrings(data)) {
        // TypeScript narrows data to readonly string[] here
        expect(data.join('')).toBe('abc');
      }
    });

    test('should return true for empty array', () => {
      const empty: readonly number[] = [] as const;

      const result = every(empty, (n) => n > 0);

      assert.isTrue(result);
    });

    test('should pass index to predicate', () => {
      const numbers = [0, 1, 2, 3] as readonly number[];

      const indexMatchesValue = every(numbers, (val, idx) => val === idx);

      assert.isTrue(indexMatchesValue);
    });

    /* What `every` reports about the array it narrowed, across the shapes the
       two type-guard overloads have to cope with. It used to answer a bare
       `readonly S[]` for every one of them, dropping both the tuple length and
       the length-constraint brand. `assert.isTrue` narrows for the rest of the
       block, so each case checks the runtime answer and the narrowed type
       together. */
    describe('narrowing', () => {
      const isString = (x: string | number): x is string =>
        typeof x === 'string';

      const values: readonly (string | number)[] = [
        'Ada',
        'Grace',
        'Katherine',
      ] as const;

      test('should keep a plain array as a plain array', () => {
        const shapeArray: readonly (string | number)[] = values;

        assert.isTrue(every(shapeArray, isString));

        expectType<typeof shapeArray, readonly string[]>('~=');
      });

      test('should keep the length of a tuple', () => {
        const shapeTuple: FixedLengthTuple<2, string | number> = [
          'Ada',
          'Grace',
        ] as const;

        assert.isTrue(every(shapeTuple, isString));

        expectType<typeof shapeTuple, FixedLengthTuple<2, string>>('~=');

        expectType<(typeof shapeTuple)['length'], 2>('=');
      });

      test('should keep a MinLengthArray brand', () => {
        const shapeBranded = asMinLengthArray(3, values);

        assert.isTrue(every(shapeBranded, isString));

        expectType<typeof shapeBranded, MinLengthArray<3, string>>('~=');

        // The brand still rules out `undefined` below the minimum length.
        expectType<(typeof shapeBranded)[0], string>('=');
      });

      test('should keep a BoundedLengthArray brand', () => {
        const shapeBounded = asBoundedLengthArray(2, 5, values);

        assert.isTrue(every(shapeBounded, isString));

        expectType<typeof shapeBounded, BoundedLengthArray<2, 5, string>>('~=');
      });

      test('should keep a FixedLengthArray brand', () => {
        const shapeFixed = asFixedLengthArray(3, values);

        assert.isTrue(every(shapeFixed, isString));

        expectType<typeof shapeFixed, FixedLengthArray<3, string>>('~=');

        expectType<(typeof shapeFixed)['length'], 3>('=');
      });

      /* Brand intersected with an exact tuple — the shape the `as*` casts and
         the `is*` guards produce. Brand, length and positions all survive. */
      test('should keep brand, length and positions of a branded tuple', () => {
        const tuple: readonly [string, string | number] = [
          'Ada',
          'Grace',
        ] as const;

        const shapeBrandedTuple = asMinLengthArray(2, tuple);

        assert.isTrue(every(shapeBrandedTuple, isString));

        expectType<(typeof shapeBrandedTuple)[0], string>('=');

        expectType<(typeof shapeBrandedTuple)[1], string>('=');

        expectType<(typeof shapeBrandedTuple)['length'], 2>('=');
      });

      /* The curried form has to reach the same conclusions. Its two cases are
         overloads of the *returned* guard rather than of `every` itself, so a
         single `every(predicate)` value serves branded and unbranded arrays
         alike — spelled as two overloads of `every`, the branded one shadowed
         the other and passing a plain array to the result was an error. */
      describe('curried', () => {
        const allStrings = every(isString);

        test('should keep a plain array as a plain array', () => {
          const shapeArray: readonly (string | number)[] = values;

          assert.isTrue(allStrings(shapeArray));

          expectType<typeof shapeArray, readonly string[]>('~=');
        });

        test('should keep the length of a tuple', () => {
          const shapeTuple: FixedLengthTuple<2, string | number> = [
            'Ada',
            'Grace',
          ] as const;

          assert.isTrue(allStrings(shapeTuple));

          expectType<typeof shapeTuple, FixedLengthTuple<2, string>>('~=');

          expectType<(typeof shapeTuple)['length'], 2>('=');
        });

        test('should keep a MinLengthArray brand', () => {
          const shapeBranded = asMinLengthArray(3, values);

          assert.isTrue(allStrings(shapeBranded));

          expectType<typeof shapeBranded, MinLengthArray<3, string>>('~=');
        });

        test('should keep brand, length and positions of a branded tuple', () => {
          const tuple: readonly [string, string | number] = [
            'Ada',
            'Grace',
          ] as const;

          const shapeBrandedTuple = asMinLengthArray(2, tuple);

          assert.isTrue(allStrings(shapeBrandedTuple));

          expectType<(typeof shapeBrandedTuple)[0], string>('=');

          expectType<(typeof shapeBrandedTuple)['length'], 2>('=');
        });
      });
    });
  });

  describe(some, () => {
    test('should return true when at least one element satisfies predicate', () => {
      const numbers = [1, 3, 5, 8] as const;

      const hasEven = some(numbers, (n) => n % 2 === 0);

      assert.isTrue(hasEven);
    });

    test('should return false when no elements satisfy predicate', () => {
      const odds = [1, 3, 5, 7] as const;

      const hasEven = some(odds, (n) => n % 2 === 0);

      assert.isFalse(hasEven);
    });

    test('should work with curried version', () => {
      const isNegative = (n: number): boolean => n < 0;

      const hasNegative = some(isNegative);

      assert.isTrue(hasNegative([1, 2, -3]));

      assert.isFalse(hasNegative([1, 2, 3]));
    });

    test('should return false for empty array', () => {
      const empty: readonly number[] = [] as const;

      const result = some(empty, (n) => n > 0);

      assert.isFalse(result);
    });

    test('should pass index to predicate', () => {
      const numbers = [10, 10, 10, 30] as const;

      const hasValueMatchingIndex = some(
        numbers,
        (val, idx) => val === idx * 10,
      );

      assert.isTrue(hasValueMatchingIndex);
    });
  });

  describe(indexIsInRange, () => {
    test('should return true for valid indices', () => {
      const array = ['a', 'b', 'c'] as const;

      assert.isTrue(indexIsInRange(array, 0));

      assert.isTrue(indexIsInRange(array, 1));

      assert.isTrue(indexIsInRange(array, 2));
    });

    test('should return false for invalid indices', () => {
      const array = ['a', 'b', 'c'] as const;

      assert.isFalse(indexIsInRange(array, 3));

      assert.isFalse(indexIsInRange(array, 10));
    });

    test('should work with empty array', () => {
      const empty: readonly string[] = [] as const;

      assert.isFalse(indexIsInRange(empty, 0));

      // @ts-expect-error negative indices should not be allowed
      assert.isFalse(indexIsInRange(empty, -1));
    });

    test('should be type error with floating point indices', () => {
      const array = [1, 2, 3] as const;

      // @ts-expect-error floating point indices should not be allowed
      assert.isTrue(indexIsInRange(array, 1.5)); // JavaScript arrays accept floating point indices

      // @ts-expect-error floating point indices should not be allowed
      assert.isFalse(indexIsInRange(array, 3.1));
    });
  });
});
