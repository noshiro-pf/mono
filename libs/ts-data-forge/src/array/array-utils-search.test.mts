import { expectType } from '../expect-type.mjs';
import { Optional } from '../functional/index.mjs';
import { asInt32, asUint32 } from '../number/index.mjs';
import { Arr } from './array-utils.mjs';

describe('Arr search operations', () => {
  describe('findIndex', () => {
    test('should find index of matching element', () => {
      const arr = ['a', 'b', 'c'];
      const result = Arr.findIndex(arr, (x) => x === 'b');

      expect(result).toBeGreaterThanOrEqual(0);
      expectType<typeof result, SizeType.Arr | -1>('=');
      expect(result).toBe(1);
    });

    test('should return None for no match', () => {
      const arr = ['a', 'b', 'c'];
      const result = Arr.findIndex(arr, (x) => x === 'd');

      expect(result).toBe(-1);
    });
  });

  describe('indexOf', () => {
    test('should find index of element', () => {
      const arr = ['a', 'b', 'c', 'b'];
      const result = Arr.indexOf(arr, 'b');

      expect(result).toBeGreaterThanOrEqual(0);
      if (result !== -1) {
        expectType<typeof result, SizeType.Arr>('=');
        expect(result).toBe(1);
      }
    });

    test('should return -1 for non-existent element', () => {
      const arr = ['a', 'b', 'c'];
      const result = Arr.indexOf(arr, 'd');

      expect(result).toBe(-1);
    });
  });

  describe('indexOfFrom', () => {
    test('should find index of element from specified index', () => {
      const arr = ['a', 'b', 'c', 'b'];
      const result = Arr.indexOfFrom(arr, 'b', 2);

      expect(result).toBeGreaterThanOrEqual(0);
      if (result !== -1) {
        expectType<typeof result, SizeType.Arr>('=');
        expect(result).toBe(3);
      }
    });

    test('should return -1 when element not found from index', () => {
      const arr = ['a', 'b', 'c', 'b'];
      const result = Arr.indexOfFrom(arr, 'a', 1);

      expect(result).toBe(-1);
    });

    test('should find first occurrence when fromIndex is 0', () => {
      const arr = ['a', 'b', 'c', 'b'];
      const result = Arr.indexOfFrom(arr, 'b', 0);

      expect(result).toBe(1);
    });

    test('should handle negative fromIndex', () => {
      const arr = ['a', 'b', 'c', 'b'];
      const result = Arr.indexOfFrom(arr, 'b', -2);

      expect(result).toBe(3);
    });

    test('should handle fromIndex beyond array length', () => {
      const arr = ['a', 'b', 'c'];
      const result = Arr.indexOfFrom(arr, 'a', 10);

      expect(result).toBe(-1);
    });
  });

  describe('lastIndexOf', () => {
    test('should find last index of element', () => {
      const arr = ['a', 'b', 'c', 'b'];
      const result = Arr.lastIndexOf(arr, 'b');

      expect(result).toBeGreaterThanOrEqual(0);
      if (result !== -1) {
        expectType<typeof result, SizeType.Arr>('=');
        expect(result).toBe(3);
      }
    });

    test('should return -1 for non-existent element', () => {
      const arr = ['a', 'b', 'c'];
      const result = Arr.lastIndexOf(arr, 'd');

      expect(result).toBe(-1);
    });
  });

  describe('lastIndexOfFrom', () => {
    test('should find last index of element from specified index', () => {
      const arr = ['a', 'b', 'c', 'b', 'e'];
      const result = Arr.lastIndexOfFrom(arr, 'b', 2);

      expect(result).toBeGreaterThanOrEqual(0);
      if (result !== -1) {
        expectType<typeof result, SizeType.Arr>('=');
        expect(result).toBe(1);
      }
    });

    test('should return -1 when element not found before index', () => {
      const arr = ['a', 'b', 'c', 'b'];
      const result = Arr.lastIndexOfFrom(arr, 'b', 0);

      expect(result).toBe(-1);
    });

    test('should find last occurrence when fromIndex covers all elements', () => {
      const arr = ['a', 'b', 'c', 'b'];
      const result = Arr.lastIndexOfFrom(arr, 'b', 10);

      expect(result).toBe(3);
    });

    test('should handle negative fromIndex', () => {
      const arr = ['a', 'b', 'c', 'b'];
      const result = Arr.lastIndexOfFrom(arr, 'b', -1);

      expect(result).toBe(3);
    });

    test('should handle fromIndex of 0', () => {
      const arr = ['a', 'b', 'c', 'b'];
      const result = Arr.lastIndexOfFrom(arr, 'a', 0);

      expect(result).toBe(0);
    });
  });

  describe('at', () => {
    test('should handle very large positive indices', () => {
      const array = [1, 2, 3];
      const result = Arr.at(array, asUint32(1000));
      expect(Optional.isNone(result)).toBe(true);
    });

    test('should handle very large negative indices', () => {
      const array = [1, 2, 3];
      const result = Arr.at(array, asInt32(-1000));
      expect(Optional.isNone(result)).toBe(true);
    });

    test('should work with valid indices', () => {
      const array = [10, 20, 30];
      const result = Arr.at(array, 1);
      expect(Optional.isSome(result)).toBe(true);
      if (Optional.isSome(result)) {
        expect(result.value).toBe(20);
      }
    });
  });
});
