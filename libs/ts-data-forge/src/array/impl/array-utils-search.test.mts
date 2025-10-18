import { expectType } from '../../expect-type.mjs';
import { Optional } from '../../functional/index.mjs';
import {
  find,
  findIndex,
  findLast,
  findLastIndex,
  indexOf,
  indexOfFrom,
  lastIndexOf,
  lastIndexOfFrom,
} from './array-utils-search.mjs';

describe('Arr search operations', () => {
  describe('find', () => {
    test('should find first element matching predicate', () => {
      const numbers = [1, 2, 3, 4, 5];
      const firstEven = find(numbers, (n) => n % 2 === 0);
      expect(Optional.isSome(firstEven)).toBe(true);
      expect(Optional.unwrap(firstEven)).toBe(2);
    });

    test('should return None when no element matches', () => {
      const odds = [1, 3, 5];
      const firstEven = find(odds, (n) => n % 2 === 0);
      expect(Optional.isNone(firstEven)).toBe(true);
    });

    test('should work with curried version', () => {
      const isEven = (n: number): boolean => n % 2 === 0;
      const findEven = find<number>(isEven);

      const result1 = findEven([1, 2, 3]);
      const result2 = findEven([1, 3, 5]);

      expect(Optional.isSome(result1)).toBe(true);
      expect(Optional.unwrap(result1)).toBe(2);
      expect(Optional.isNone(result2)).toBe(true);
    });

    test('should work with type guard predicate', () => {
      const values: readonly (string | number)[] = [1, 'a', 2, 'b'];
      const firstString = find(
        values,
        (x): x is string => typeof x === 'string',
      );

      expectType<typeof firstString, Optional<string>>('=');
      expect(Optional.isSome(firstString)).toBe(true);
      expect(Optional.unwrap(firstString)).toBe('a');
    });

    test('should provide index and array to predicate', () => {
      const numbers = [10, 20, 30];
      const foundWithIndex = find(numbers, (value, index, arr) => {
        expect(arr).toBe(numbers);
        return index === 1 && value === 20;
      });

      expect(Optional.unwrap(foundWithIndex)).toBe(20);
    });

    test('should return first match when multiple elements match', () => {
      const numbers = [2, 4, 6, 8];
      const firstEven = find(numbers, (n) => n % 2 === 0);
      expect(Optional.unwrap(firstEven)).toBe(2);
    });

    test('should work with empty array', () => {
      const empty: readonly number[] = [];
      const result = find(empty, () => true);
      expect(Optional.isNone(result)).toBe(true);
    });
  });

  describe('findLast', () => {
    test('should find last element matching predicate', () => {
      const numbers = [1, 2, 3, 4, 5];
      const lastEven = findLast(numbers, (n) => n % 2 === 0);
      expect(Optional.isSome(lastEven)).toBe(true);
      expect(Optional.unwrap(lastEven)).toBe(4);
    });

    test('should return None when no element matches', () => {
      const odds = [1, 3, 5];
      const lastEven = findLast(odds, (n) => n % 2 === 0);
      expect(Optional.isNone(lastEven)).toBe(true);
    });

    test('should work with curried version', () => {
      const isPositive = (n: number): boolean => n > 0;
      const findLastPositive = findLast(isPositive);
      const result = findLastPositive([-1, 2, -3, 4]);
      expect(Optional.isSome(result)).toBe(true);
      expect(Optional.unwrap(result)).toBe(4);
    });

    test('should work with empty array', () => {
      const empty: number[] = [];
      const result = findLast(empty, (n) => n > 0);
      expect(Optional.isNone(result)).toBe(true);
    });

    test('should pass index and array to predicate', () => {
      const numbers = [10, 20, 30, 40];
      const lastWithIndex2 = findLast(numbers, (_, idx, arr) => {
        expect(arr).toBe(numbers);
        return idx === 2;
      });
      expect(Optional.unwrap(lastWithIndex2)).toBe(30);
    });

    test('should find last occurrence', () => {
      const numbers = [1, 2, 2, 3, 2, 4];
      const lastTwo = findLast(numbers, (n) => n === 2);
      expect(Optional.unwrap(lastTwo)).toBe(2);

      // Verify it's actually the last occurrence by checking behavior
      const index = numbers.lastIndexOf(2);
      expect(index).toBe(4); // Last 2 is at index 4
    });
  });

  describe('findIndex', () => {
    test('should find index of matching element', () => {
      const arr = ['a', 'b', 'c'];
      const result = findIndex(arr, (x) => x === 'b');

      expect(result).toBeGreaterThanOrEqual(0);
      expectType<typeof result, SizeType.Arr | -1>('=');
      expect(result).toBe(1);
    });

    test('should return None for no match', () => {
      const arr = ['a', 'b', 'c'];
      const result = findIndex(arr, (x) => x === 'd');

      expect(result).toBe(-1);
    });
  });

  describe('findLastIndex', () => {
    test('should find last index matching predicate', () => {
      const numbers = [1, 2, 3, 4, 2, 5];
      const lastTwoIndex = findLastIndex(numbers, (n) => n === 2);
      expect(lastTwoIndex).toBe(4);
    });

    test('should return -1 when no element matches', () => {
      const odds = [1, 3, 5];
      const lastEvenIndex = findLastIndex(odds, (n) => n % 2 === 0);
      expect(lastEvenIndex).toBe(-1);
    });

    test('should work with curried version', () => {
      const isPositive = (n: number): boolean => n > 0;
      const findLastPositiveIndex = findLastIndex(isPositive);
      const result = findLastPositiveIndex([-1, 2, -3, 4, -5]);
      expect(result).toBe(3); // index of last positive number (4)
    });

    test('should work with empty array', () => {
      const empty: number[] = [];
      const result = findLastIndex(empty, (n) => n > 0);
      expect(result).toBe(-1);
    });

    test('should pass index and array to predicate', () => {
      const numbers = [10, 20, 30, 40];
      const lastWithIndex2OrHigher = findLastIndex(numbers, (_, idx, arr) => {
        expect(arr).toBe(numbers);
        return idx >= 2;
      });
      expect(lastWithIndex2OrHigher).toBe(3); // last index >= 2
    });

    test('should find last occurrence with complex conditions', () => {
      const data = [
        { id: 1, active: true },
        { id: 2, active: false },
        { id: 3, active: true },
        { id: 4, active: false },
        { id: 5, active: true },
      ];
      const lastActiveIndex = findLastIndex(data, (item) => item.active);
      expect(lastActiveIndex).toBe(4); // last active item
    });

    test('should work with tuples', () => {
      const tuple = [10, 20, 30, 20, 40] as const;
      const lastTwentyIndex = findLastIndex(tuple, (x) => x === 20);
      expect(lastTwentyIndex).toBe(3); // last occurrence of 20
    });

    test('should search from end to beginning', () => {
      // Verify search order by using side effects
      const numbers = [1, 2, 3, 4, 5];
      const mut_searchOrder: number[] = [];

      findLastIndex(numbers, (val, idx) => {
        mut_searchOrder.push(idx);
        return val === 3;
      });

      // Should search from end: 4, 3, 2 (stops at 2 when found)
      expect(mut_searchOrder).toStrictEqual([4, 3, 2]);
    });

    test('should handle single element array', () => {
      const single = [42];
      const foundIndex = findLastIndex(single, (n) => n === 42);
      const notFoundIndex = findLastIndex(single, (n) => n === 0);

      expect(foundIndex).toBe(0);
      expect(notFoundIndex).toBe(-1);
    });

    test('should work with string arrays', () => {
      const words = ['hello', 'world', 'test', 'hello', 'end'];
      const lastHelloIndex = findLastIndex(words, (word) => word === 'hello');
      expect(lastHelloIndex).toBe(3);
    });
  });

  describe('indexOf', () => {
    test('should find index of element', () => {
      const arr = ['a', 'b', 'c', 'b'];
      const result = indexOf(arr, 'b');

      expect(result).toBeGreaterThanOrEqual(0);
      if (result !== -1) {
        expectType<typeof result, SizeType.Arr>('=');
        expect(result).toBe(1);
      }
    });

    test('should return -1 for non-existent element', () => {
      const arr = ['a', 'b', 'c'];
      const result = indexOf(arr, 'd');

      expect(result).toBe(-1);
    });
  });

  describe('indexOfFrom', () => {
    test('should find index of element from specified index', () => {
      const arr = ['a', 'b', 'c', 'b'];
      const result = indexOfFrom(arr, 'b', 2);

      expect(result).toBeGreaterThanOrEqual(0);
      if (result !== -1) {
        expectType<typeof result, SizeType.Arr>('=');
        expect(result).toBe(3);
      }
    });

    test('should return -1 when element not found from index', () => {
      const arr = ['a', 'b', 'c', 'b'];
      const result = indexOfFrom(arr, 'a', 1);

      expect(result).toBe(-1);
    });

    test('should find first occurrence when fromIndex is 0', () => {
      const arr = ['a', 'b', 'c', 'b'];
      const result = indexOfFrom(arr, 'b', 0);

      expect(result).toBe(1);
    });

    test('should handle negative fromIndex', () => {
      const arr = ['a', 'b', 'c', 'b'];
      const result = indexOfFrom(arr, 'b', -2);

      expect(result).toBe(3);
    });

    test('should handle fromIndex beyond array length', () => {
      const arr = ['a', 'b', 'c'];
      const result = indexOfFrom(arr, 'a', 10);

      expect(result).toBe(-1);
    });
  });

  describe('lastIndexOf', () => {
    test('should find last index of element', () => {
      const arr = ['a', 'b', 'c', 'b'];
      const result = lastIndexOf(arr, 'b');

      expect(result).toBeGreaterThanOrEqual(0);
      if (result !== -1) {
        expectType<typeof result, SizeType.Arr>('=');
        expect(result).toBe(3);
      }
    });

    test('should return -1 for non-existent element', () => {
      const arr = ['a', 'b', 'c'];
      const result = lastIndexOf(arr, 'd');

      expect(result).toBe(-1);
    });
  });

  describe('lastIndexOfFrom', () => {
    test('should find last index of element from specified index', () => {
      const arr = ['a', 'b', 'c', 'b', 'e'];
      const result = lastIndexOfFrom(arr, 'b', 2);

      expect(result).toBeGreaterThanOrEqual(0);
      if (result !== -1) {
        expectType<typeof result, SizeType.Arr>('=');
        expect(result).toBe(1);
      }
    });

    test('should return -1 when element not found before index', () => {
      const arr = ['a', 'b', 'c', 'b'];
      const result = lastIndexOfFrom(arr, 'b', 0);

      expect(result).toBe(-1);
    });

    test('should find last occurrence when fromIndex covers all elements', () => {
      const arr = ['a', 'b', 'c', 'b'];
      const result = lastIndexOfFrom(arr, 'b', 10);

      expect(result).toBe(3);
    });

    test('should handle negative fromIndex', () => {
      const arr = ['a', 'b', 'c', 'b'];
      const result = lastIndexOfFrom(arr, 'b', -1);

      expect(result).toBe(3);
    });

    test('should handle fromIndex of 0', () => {
      const arr = ['a', 'b', 'c', 'b'];
      const result = lastIndexOfFrom(arr, 'a', 0);

      expect(result).toBe(0);
    });
  });
});
