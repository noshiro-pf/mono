import { expectType } from '../expect-type.mjs';
import { Optional } from '../functional/index.mjs';
import { Arr } from './array-utils.mjs';

describe('Arr slicing', () => {
  describe('head', () => {
    test('case 1', () => {
      const xs = [1, 2, 3] as const;
      const head = Arr.head(xs);

      expectType<typeof head, Optional.Some<1>>('=');

      expect(Optional.isSome(head)).toBe(true);
      if (Optional.isSome(head)) {
        expect(head.value).toBe(1);
      }
    });

    test('case 2', () => {
      const xs: MutableNonEmptyArray<number> = [1, 2, 3];
      const head = Arr.head(xs);

      expectType<typeof head, Optional.Some<number>>('=');

      expect(Optional.isSome(head)).toBe(true);
      if (Optional.isSome(head)) {
        expect(head.value).toBe(1);
      }
    });

    test('case 3', () => {
      const mut_xs: number[] = [1, 2, 3];
      const head = Arr.head(mut_xs);

      expectType<typeof head, Optional<number>>('=');

      expect(Optional.isSome(head)).toBe(true);
      if (Optional.isSome(head)) {
        expect(head.value).toBe(1);
      }
    });

    test('case 4', () => {
      const xs = [] as const;

      const head = Arr.head(xs);

      expectType<typeof head, Optional.None>('=');

      expect(Optional.isNone(head)).toBe(true);
    });

    test('should return none for empty array', () => {
      const result = Arr.head([]);
      expect(Optional.isNone(result)).toBe(true);
    });

    test('should work with single element array', () => {
      const result = Arr.head([42]);
      expect(Optional.isSome(result)).toBe(true);
      if (Optional.isSome(result)) {
        expect(result.value).toBe(42);
      }
    });
  });

  describe('last', () => {
    test('case 1', () => {
      const xs = [1, 2, 3] as const;
      const last = Arr.last(xs);

      expectType<typeof last, Optional.Some<3>>('=');

      expect(Optional.isSome(last)).toBe(true);
      if (Optional.isSome(last)) {
        expect(last.value).toBe(3);
      }
    });

    test('case 2', () => {
      const xs: MutableNonEmptyArray<number> = [1, 2, 3];
      const last = Arr.last(xs);

      expectType<typeof last, Optional.Some<number>>('=');

      expect(Optional.isSome(last)).toBe(true);
      if (Optional.isSome(last)) {
        expect(last.value).toBe(3);
      }
    });

    test('case 3', () => {
      const mut_xs: number[] = [1, 2, 3];
      const last = Arr.last(mut_xs);

      expectType<typeof last, Optional<number>>('=');

      expect(Optional.isSome(last)).toBe(true);
      if (Optional.isSome(last)) {
        expect(last.value).toBe(3);
      }
    });

    test('case 4', () => {
      const xs = [] as const;

      const last = Arr.last(xs);

      expectType<typeof last, Optional.None>('=');

      expect(Optional.isNone(last)).toBe(true);
    });

    test('should return none for empty array', () => {
      const result = Arr.last([]);
      expect(Optional.isNone(result)).toBe(true);
    });

    test('should work with single element array', () => {
      const result = Arr.last([42]);
      expect(Optional.isSome(result)).toBe(true);
      if (Optional.isSome(result)) {
        expect(result.value).toBe(42);
      }
    });
  });

  describe('tail', () => {
    test('should return all elements except the first', () => {
      const array = [1, 2, 3, 4] as const;
      const result = Arr.tail(array);
      expectType<typeof result, readonly [2, 3, 4]>('=');
      expect(result).toStrictEqual([2, 3, 4]);
    });

    test('should work with single element array', () => {
      const array = [1] as const;
      const result = Arr.tail(array);
      expectType<typeof result, readonly []>('=');
      expect(result).toStrictEqual([]);
    });

    test('should work with empty array', () => {
      const array = [] as const;
      const result = Arr.tail(array);
      expectType<typeof result, readonly []>('=');
      expect(result).toStrictEqual([]);
    });

    test('should return all elements except the first', () => {
      const array = [1, 2, 3, 4] as const;
      const result = Arr.tail(array);
      expectType<typeof result, readonly [2, 3, 4]>('=');
      expect(result).toStrictEqual([2, 3, 4]);
    });

    test('should work with single element array', () => {
      const array = [1] as const;
      const result = Arr.tail(array);
      expectType<typeof result, readonly []>('=');
      expect(result).toStrictEqual([]);
    });

    test('should work with empty array', () => {
      const array = [] as const;
      const result = Arr.tail(array);
      expectType<typeof result, readonly []>('=');
      expect(result).toStrictEqual([]);
    });
  });

  describe('butLast', () => {
    test('readonly number[] type', () => {
      const xs: readonly number[] = [1, 2, 3];
      const butLast = Arr.butLast(xs);

      expectType<typeof butLast, readonly number[]>('=');

      expect(butLast).toStrictEqual([1, 2]);
    });

    test('should return all elements except the last', () => {
      const array = [1, 2, 3, 4] as const;
      const result = Arr.butLast(array);
      expectType<typeof result, readonly [1, 2, 3]>('=');
      expect(result).toStrictEqual([1, 2, 3]);
    });

    test('should work with single element array', () => {
      const array = [1] as const;
      const result = Arr.butLast(array);
      expectType<typeof result, readonly []>('=');
      expect(result).toStrictEqual([]);
    });

    test('should work with empty array', () => {
      const array = [] as const;
      const result = Arr.butLast(array);
      expectType<typeof result, readonly []>('=');
      expect(result).toStrictEqual([]);
    });

    test('should return all elements except the last', () => {
      const array = [1, 2, 3, 4] as const;
      const result = Arr.butLast(array);
      expectType<typeof result, readonly [1, 2, 3]>('=');
      expect(result).toStrictEqual([1, 2, 3]);
    });

    test('should work with single element array', () => {
      const array = [1] as const;
      const result = Arr.butLast(array);
      expectType<typeof result, readonly []>('=');
      expect(result).toStrictEqual([]);
    });

    test('should work with empty array', () => {
      const array = [] as const;
      const result = Arr.butLast(array);
      expectType<typeof result, readonly []>('=');
      expect(result).toStrictEqual([]);
    });
  });

  describe('take', () => {
    {
      const xs = [1, 2, 3] as const;
      const t = Arr.take(xs, 2);

      expectType<typeof t, readonly [1, 2]>('=');

      test('case 1', () => {
        expect(t).toStrictEqual([1, 2]);
      });
    }
    {
      const xs: readonly number[] = [1, 2, 3];
      const t = Arr.take(xs, 2);

      expectType<typeof t, readonly number[]>('=');

      test('case 2', () => {
        expect(t).toStrictEqual([1, 2]);
      });
    }
  });

  describe('takeLast', () => {
    {
      const xs = [1, 2, 3] as const;
      const t = Arr.takeLast(xs, 2);

      expectType<typeof t, readonly [2, 3]>('=');

      test('case 1', () => {
        expect(t).toStrictEqual([2, 3]);
      });
    }
    {
      const xs: readonly number[] = [1, 2, 3];
      const t = Arr.takeLast(xs, 2);

      expectType<typeof t, readonly number[]>('=');

      test('case 2', () => {
        expect(t).toStrictEqual([2, 3]);
      });
    }
  });

  describe('skip', () => {
    {
      const xs = [1, 2, 3] as const;
      const t = Arr.skip(xs, 2);

      expectType<typeof t, readonly [3]>('=');

      test('case 1', () => {
        expect(t).toStrictEqual([3]);
      });
    }
    {
      const xs: readonly number[] = [1, 2, 3];
      const t = Arr.skip(xs, 2);

      expectType<typeof t, readonly number[]>('=');

      test('case 2', () => {
        expect(t).toStrictEqual([3]);
      });
    }
  });

  describe('skipLast', () => {
    {
      const xs = [1, 2, 3] as const;
      const t = Arr.skipLast(xs, 2);

      expectType<typeof t, readonly [1]>('=');

      test('case 1', () => {
        expect(t).toStrictEqual([1]);
      });
    }
    {
      const xs: readonly number[] = [1, 2, 3];
      const t = Arr.skipLast(xs, 2);

      expectType<typeof t, readonly number[]>('=');

      test('case 2', () => {
        expect(t).toStrictEqual([1]);
      });
    }
  });
});
