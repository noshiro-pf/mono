import { expectType } from '../expect-type.mjs';
import { asNonZeroSafeInt, asUint32 } from '../number/index.mjs';
import { Arr } from './array-utils.mjs';

describe('Arr creations', () => {
  describe('zeros', () => {
    test('fixed length', () => {
      const result = Arr.zeros(3);
      expectType<typeof result, readonly [0, 0, 0]>('=');
      expect(result).toStrictEqual([0, 0, 0]);
    });

    test('fixed length (empty)', () => {
      const result = Arr.zeros(0);
      expectType<typeof result, readonly []>('=');
      expect(result).toStrictEqual([]);
    });

    test('unknown length', () => {
      const n: number = 3;
      const result = Arr.zeros(asUint32(n));
      expectType<typeof result, readonly 0[]>('=');
      expect(result).toStrictEqual([0, 0, 0]);
    });

    test('should create array with zero length', () => {
      const result = Arr.zeros(0);
      expect(result).toStrictEqual([]);
      expect(result.length).toBe(0);
    });

    test('should create large arrays', () => {
      const result = Arr.zeros(asUint32(1000));
      expect(result).toHaveLength(1000);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      expect(result.every((x) => x === 0)).toBe(true);
    });

    test('should work with curried version', () => {
      const createTenZeros = Arr.zeros(10);
      expect(createTenZeros).toStrictEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    });
  });

  describe('seq', () => {
    test('fixed length', () => {
      const result = Arr.seq(5);
      expectType<typeof result, readonly [0, 1, 2, 3, 4]>('=');
      expect(result).toStrictEqual([0, 1, 2, 3, 4]);
    });

    test('fixed length (empty)', () => {
      const result = Arr.seq(0);
      expectType<typeof result, readonly []>('=');
      expect(result).toStrictEqual([]);
    });

    test('unknown length', () => {
      const n: number = 3;
      const result = Arr.seq(asUint32(n));
      expectType<typeof result, readonly SizeType.Arr[]>('=');
      expect(result).toStrictEqual([0, 1, 2]);
    });

    test('should create sequence with zero length', () => {
      const result = Arr.seq(0);
      expect(result).toStrictEqual([]);
    });

    test('should create sequence with large length', () => {
      const result = Arr.seq(asUint32(100));
      expect(result).toHaveLength(100);
      expect(result[0]).toBe(0);
      expect(result[99]).toBe(99);
    });

    test('should work with curried version', () => {
      const createFiveSeq = Arr.seq(5);
      expect(createFiveSeq).toStrictEqual([0, 1, 2, 3, 4]);
    });
  });

  describe('create', () => {
    test('fixed length with primitive value', () => {
      const result = Arr.create(3, 'a');
      expectType<typeof result, readonly ['a', 'a', 'a']>('=');
      expect(result).toStrictEqual(['a', 'a', 'a']);
    });

    test('fixed length with null', () => {
      const result = Arr.create(2, null);
      expectType<typeof result, readonly [null, null]>('=');
      expect(result).toStrictEqual([null, null]);
    });

    test('fixed length with object (shallow copy)', () => {
      const obj = { id: 1 };
      const result = Arr.create(2, obj);
      expectType<typeof result, readonly [{ id: number }, { id: number }]>(
        '~=',
      );
      expect(result).toStrictEqual([obj, obj]);
      expect(result[0]).toBe(obj);
      expect(result[1]).toBe(obj);
    });

    test('fixed length (empty)', () => {
      const result = Arr.create(0, 123);
      expectType<typeof result, readonly []>('=');
      expect(result).toStrictEqual([]);
    });

    test('unknown length', () => {
      const n: number = 2;
      const result = Arr.create(asUint32(n), true);
      expectType<typeof result, readonly true[]>('=');
      expect(result).toStrictEqual([true, true]);
    });

    test('should create array with function values', () => {
      const fn = (): string => 'test';
      const result = Arr.create(3, fn);
      expect(result).toStrictEqual([fn, fn, fn]);
      expect(result[0]).toBe(fn);
    });

    test('should create array with object values', () => {
      const obj = { a: 1 };
      const result = Arr.create(2, obj);
      expect(result).toStrictEqual([obj, obj]);
      expect(result[0]).toBe(obj); // Same reference
    });

    test('should create empty array when length is 0', () => {
      const result = Arr.create(0, 'value');
      expect(result).toStrictEqual([]);
    });

    test('newArray is alias for create', () => {
      const created1 = Arr.create(3, 'test');
      const created2 = Arr.newArray(3, 'test');
      expect(created1).toStrictEqual(created2);
      expect(created1).toStrictEqual(['test', 'test', 'test']);
    });
  });

  describe('copy', () => {
    test('should create a shallow copy of an array of primitives', () => {
      const original = [1, 2, 3] as const;
      const copied = Arr.copy(original);
      expectType<typeof copied, readonly [1, 2, 3]>('=');
      expect(copied).toStrictEqual(original);
      expect(copied).not.toBe(original);
    });

    test('should create a shallow copy of an array of objects', () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      const original = [obj1, obj2] as const;
      const copied = Arr.copy(original);

      expectType<typeof copied, readonly [{ id: number }, { id: number }]>('=');
      expect(copied).toStrictEqual(original);
      expect(copied).not.toBe(original);
      expect(copied[0]).toBe(original[0]); // Object references are the same
      expect(copied[1]).toBe(original[1]);
    });

    test('should create a copy of an empty array', () => {
      const original = [] as const;
      const copied = Arr.copy(original);
      expectType<typeof copied, readonly []>('=');
      expect(copied).toStrictEqual(original);
      expect(copied).not.toBe(original);
    });

    test('should create a copy of an array with mixed types', () => {
      const original = [1, 'hello', true, null, undefined] as const;
      const copied = Arr.copy(original);
      expectType<typeof copied, readonly [1, 'hello', true, null, undefined]>(
        '=',
      );
      expect(copied).toStrictEqual(original);
      expect(copied).not.toBe(original);
    });

    test('should handle unknown array type', () => {
      const original: number[] = [1, 2, 3];
      const copied = Arr.copy(original);
      expectType<typeof copied, number[]>('=');
      expect(copied).toStrictEqual(original);
      expect(copied).not.toBe(original);
      // Modify original to ensure copy is shallow
      original.push(4);
      expect(original).toStrictEqual([1, 2, 3, 4]);
      expect(copied).toStrictEqual([1, 2, 3]);
    });

    test('should create shallow copy of array', () => {
      const original = [1, 2, 3] as const;
      const copied = Arr.copy(original);
      expectType<typeof copied, readonly [1, 2, 3]>('=');
      expect(copied).toStrictEqual(original);
      expect(copied).not.toBe(original);
    });

    test('should work with empty array', () => {
      const empty = [] as const;
      const copied = Arr.copy(empty);
      expect(copied).toStrictEqual([]);
      expect(copied).not.toBe(empty);
    });

    test('should preserve array type', () => {
      const mixed = [1, 'hello', true] as const;
      const copied = Arr.copy(mixed);
      expectType<typeof copied, readonly [1, 'hello', true]>('=');
      expect(copied).toStrictEqual([1, 'hello', true]);
    });
  });

  describe('range', () => {
    test('start < end, step = 1 (default)', () => {
      const result = Arr.range(1, 5);
      expectType<typeof result, readonly [1, 2, 3, 4]>('=');
      expect(result).toStrictEqual([1, 2, 3, 4]);
    });

    test('start === end, step = 1 (default)', () => {
      const result = Arr.range(3, 3);
      expectType<typeof result, readonly []>('=');
      expect(result).toStrictEqual([]);
    });

    test('start > end, step = 1 (default)', () => {
      const result = Arr.range(5, 1);
      expectType<typeof result, readonly []>('=');
      expect(result).toStrictEqual([]);
    });

    test('start < end, step > 1', () => {
      const result = Arr.range(0, 6, 2);
      expectType<typeof result, readonly SafeUint[]>('='); // Type is less specific with explicit step
      expect(result).toStrictEqual([0, 2, 4]);
    });

    test('start < end, step > 1, not reaching end', () => {
      const result = Arr.range(0, 5, 2);
      expect(result).toStrictEqual([0, 2, 4]);
    });

    test('start > end, step < 0', () => {
      const result = Arr.range(5, 0, -1);
      expect(result).toStrictEqual([5, 4, 3, 2, 1]);
    });

    test('start > end, step < 0, not reaching end', () => {
      const result = Arr.range(5, 1, -2);
      expect(result).toStrictEqual([5, 3]);
    });

    test('start < end, step < 0 (empty result)', () => {
      const result = Arr.range(1, 5, -1);
      expect(result).toStrictEqual([]);
    });

    test('start > end, step > 0 (empty result)', () => {
      const result = Arr.range(5, 1, 1);
      expect(result).toStrictEqual([]);
    });

    test('unknown start/end/step', () => {
      const start: number = 1;
      const end: number = 4;
      const step: number = 1;
      const result = Arr.range(
        asUint32(start),
        asUint32(end),
        asNonZeroSafeInt(step),
      );
      expectType<typeof result, readonly SafeInt[]>('=');
      expect(result).toStrictEqual([1, 2, 3]);
    });

    test('range(1, 3)', () => {
      const result = Arr.range(1, 3);

      expectType<typeof result, readonly [1, 2]>('=');

      expect(result).toStrictEqual([1, 2]);
    });

    test('range(1, 3, 1)', () => {
      const result = Arr.range(1, 3, 1);

      expectType<typeof result, readonly [1, 2]>('=');

      expect(result).toStrictEqual([1, 2]);
    });

    test('range(0, 0)', () => {
      const result = Arr.range(0, 0);

      expectType<typeof result, readonly []>('=');

      expect(result).toStrictEqual([]);
    });

    test('range(0, 1)', () => {
      const result = Arr.range(0, 1);

      expectType<typeof result, readonly [0]>('=');

      expect(result).toStrictEqual([0]);
    });

    test('range(0, -1)', () => {
      const result = Arr.range(0, -1);

      expectType<typeof result, readonly SafeInt[]>('=');

      expect(result).toStrictEqual([]);
    });

    test('range(SmallUint, SmallUint)', () => {
      const result = Arr.range<SmallUint, SmallUint>(0, 1);

      expectType<
        typeof result,
        readonly (
          | 0
          | 1
          | 2
          | 3
          | 4
          | 5
          | 6
          | 7
          | 8
          | 9
          | 10
          | 11
          | 12
          | 13
          | 14
          | 15
          | 16
          | 17
          | 18
          | 19
          | 20
          | 21
          | 22
          | 23
          | 24
          | 25
          | 26
          | 27
          | 28
          | 29
          | 30
          | 31
          | 32
          | 33
          | 34
          | 35
          | 36
          | 37
          | 38
        )[]
      >('=');

      expect(result).toStrictEqual([0]);
    });

    test('range(0 | 1 | 2, 1 | 2 | 3)', () => {
      const result = Arr.range<0 | 1 | 2, 1 | 2 | 3>(0, 1);

      expectType<typeof result, readonly (0 | 1 | 2)[]>('=');

      expect(result).toStrictEqual([0]);
    });

    test('range(2|3, 5|6|7)', () => {
      const result = Arr.range<2 | 3, 5 | 6 | 7>(2, 5);

      expectType<typeof result, readonly (2 | 3 | 4 | 5 | 6)[]>('=');

      expect(result).toStrictEqual([2, 3, 4]);
    });

    test('range(0, 10, 2)', () => {
      const result = Arr.range(0, 10, 2);

      expectType<typeof result, readonly SafeUint[]>('=');

      expect(result).toStrictEqual([0, 2, 4, 6, 8]);
    });

    test('range(0, 11, 2)', () => {
      const result = Arr.range(0, 11, 2);

      expectType<typeof result, readonly SafeUint[]>('=');

      expect(result).toStrictEqual([0, 2, 4, 6, 8, 10]);
    });

    test('range(1, 12, 2)', () => {
      const result = Arr.range(1, 12, 2);

      expectType<typeof result, readonly SafeUint[]>('=');

      expect(result).toStrictEqual([1, 3, 5, 7, 9, 11]);
    });

    // Note: These tests were removed as the range function doesn't return Result type
    // and doesn't validate inputs in this way

    test('should handle range with step larger than difference', () => {
      const result = Arr.range(0, 5, 10);
      expect(result).toStrictEqual([0]);
    });

    test('should handle negative step with increasing range', () => {
      const result = Arr.range(0, 5, -1);
      expect(result).toStrictEqual([]); // Should be empty when step direction conflicts
    });

    test('should work with basic range functionality', () => {
      // Test basic range functionality without currying assumptions
      const result = Arr.range(0, 5, 1);
      expect(result).toStrictEqual([0, 1, 2, 3, 4]);
    });
  });

  describe('size/length', () => {
    test('length should be alias for size', () => {
      const array = [1, 2, 3];
      expect(Arr.length(array)).toBe(Arr.size(array));
      expect(Arr.length(array)).toBe(3);
    });
  });
});
