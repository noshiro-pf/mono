import { expectType } from '../expect-type.mjs';
import { pipe } from '../functional/index.mjs';
import { Arr } from './array-utils.mjs';

// Tests for ensuring type errors occur with incorrect usage of overloaded functions

describe('Array overloaded functions - type error validation', () => {
  const testArray = [1, 2, 3, 4, 5] as const;
  const predicate = (x: number): boolean => x > 3;

  describe('Arr.findIndex type safety', () => {
    test('findIndex with correct arguments should work', () => {
      // These should work fine
      const _result1 = Arr.findIndex(testArray, predicate);
      const _result2 = Arr.findIndex(predicate);
      const _result3 = Arr.findIndex(predicate)(testArray);

      expectType<typeof _result1, 0 | 1 | 2 | 3 | 4 | -1>('=');
      expectType<
        typeof _result2,
        (array: readonly number[]) => SizeType.Arr | -1
      >('=');
      expectType<typeof _result3, SizeType.Arr | -1>('=');
    });

    test('findIndex type constraints work correctly', () => {
      // Test that type constraints exist for predicate function
      // @ts-expect-error - Predicate should return boolean, not string
      Arr.findIndex(testArray, (x: number) => x.toString());

      // @ts-expect-error - Array element type should match predicate parameter
      Arr.findIndex(['a', 'b', 'c'], (x: number) => x > 0);

      expect(true).toBe(true);
    });
  });

  describe('Arr.filterNot type safety', () => {
    test('filterNot with correct arguments should work', () => {
      // These should work fine
      const _result1 = Arr.filterNot(testArray, predicate);
      const _result2 = Arr.filterNot(predicate);
      const _result3 = Arr.filterNot(predicate)(testArray);

      expectType<typeof _result1, readonly number[]>('<=');
      expectType<
        typeof _result2,
        (array: readonly number[]) => readonly number[]
      >('<=');
      expectType<typeof _result3, readonly number[]>('<=');
    });

    test('filterNot type constraints work correctly', () => {
      // @ts-expect-error - Predicate should return boolean, not string
      Arr.filterNot(testArray, (x: number) => x.toString());

      // @ts-expect-error - Array element type should match predicate parameter
      Arr.filterNot(['a', 'b', 'c'], (x: number) => x > 0);

      expect(true).toBe(true);
    });
  });

  describe('Arr.partition type safety', () => {
    test('partition with correct arguments should work', () => {
      // These should work fine
      const _result1 = Arr.partition(testArray, 2);
      const _result2 = Arr.partition(2);
      const _result3 = Arr.partition(2)(testArray);

      expectType<typeof _result1, readonly (readonly number[])[]>('<=');
      expectType<
        typeof _result2,
        <A>(array: readonly A[]) => readonly (readonly A[])[]
      >('<=');
      expectType<typeof _result3, readonly (readonly number[])[]>('<=');
    });

    test('partition type constraints work correctly', () => {
      // @ts-expect-error - Partition size should be number, not string
      expect(() => Arr.partition(testArray, 'invalid')).toThrow(
        'Expected a non-negative integer less than 2^32, got: NaN',
      );

      // @ts-expect-error - Negative partition size should not be allowed
      Arr.partition(testArray, -1);
    });
  });

  describe('Arr.range type safety', () => {
    test('range with correct arguments should work', () => {
      // These should work fine
      const _result1 = Arr.range(1, 5);
      const _result2 = Arr.range(1, 5, 1);

      expectType<typeof _result1, readonly [1, 2, 3, 4]>('=');
      expectType<typeof _result2, readonly [1, 2, 3, 4]>('=');
    });

    test('range type constraints work correctly', () => {
      // @ts-expect-error - Range bounds should be numbers, not strings
      expect(() => Arr.range('1', '5')).toThrow(
        'Expected a safe integer, got: 1',
      );

      // @ts-expect-error - Step should be number, not string
      Arr.range(1, 5, 'invalid');
    });
  });

  describe('Type-safe spread operations', () => {
    test('spread with correct tuple types should work', () => {
      // Correct usage with spread
      const correctArgs1 = [testArray, predicate] as const;
      const correctArgs2 = [predicate] as const;

      const _result1 = Arr.findIndex(...correctArgs1);
      const _result2 = Arr.findIndex(...correctArgs2);

      expectType<typeof _result1, 0 | 1 | 2 | 3 | 4 | -1>('<=');
      expectType<
        typeof _result2,
        (array: readonly number[]) => SizeType.Arr | -1
      >('<=');
    });

    test('spread with incorrect types should cause errors', () => {
      const invalidArgs: [string[], (x: string) => number] = [
        ['a'],
        (x) => x.length,
      ];

      // @ts-expect-error - Wrong types in tuple for spread
      Arr.findIndex(...invalidArgs);

      expect(true).toBe(true);
    });
  });

  describe('Function composition with overloaded functions', () => {
    test('composition should preserve type safety', () => {
      // This should work
      const findPositive = Arr.findIndex((x: number) => x > 0);
      const filterNegative = Arr.filterNot((x: number) => x < 0);

      const _composedResult = pipe(testArray)
        .map(filterNegative)
        .map(findPositive).value;

      expectType<typeof _composedResult, SizeType.Arr | -1>('=');
    });
  });
});
