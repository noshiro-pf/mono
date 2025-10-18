import { expectType } from '../../expect-type.mjs';
import {
  butLast,
  skip,
  skipLast,
  tail,
  take,
  takeLast,
} from './array-utils-slicing.mjs';

describe('Arr slicing', () => {
  describe('tail', () => {
    test('should return all elements except the first', () => {
      const array = [1, 2, 3, 4] as const;
      const result = tail(array);
      expectType<typeof result, readonly [2, 3, 4]>('=');
      expect(result).toStrictEqual([2, 3, 4]);
    });

    test('should work with single element array', () => {
      const array = [1] as const;
      const result = tail(array);
      expectType<typeof result, readonly []>('=');
      expect(result).toStrictEqual([]);
    });

    test('should work with empty array', () => {
      const array = [] as const;
      const result = tail(array);
      expectType<typeof result, readonly []>('=');
      expect(result).toStrictEqual([]);
    });
  });

  describe('butLast', () => {
    test('readonly number[] type', () => {
      const xs: readonly number[] = [1, 2, 3];
      const bl = butLast(xs);

      expectType<typeof bl, readonly number[]>('=');

      expect(bl).toStrictEqual([1, 2]);
    });

    test('should return all elements except the last', () => {
      const array = [1, 2, 3, 4] as const;
      const result = butLast(array);
      expectType<typeof result, readonly [1, 2, 3]>('=');
      expect(result).toStrictEqual([1, 2, 3]);
    });

    test('should work with single element array', () => {
      const array = [1] as const;
      const result = butLast(array);
      expectType<typeof result, readonly []>('=');
      expect(result).toStrictEqual([]);
    });

    test('should work with empty array', () => {
      const array = [] as const;
      const result = butLast(array);
      expectType<typeof result, readonly []>('=');
      expect(result).toStrictEqual([]);
    });
  });

  describe('take', () => {
    {
      const xs = [1, 2, 3] as const;
      const t = take(xs, 2);

      expectType<typeof t, readonly [1, 2]>('=');

      test('case 1', () => {
        expect(t).toStrictEqual([1, 2]);
      });
    }
    {
      const xs: readonly number[] = [1, 2, 3];
      const t = take(xs, 2);

      expectType<typeof t, readonly number[]>('=');

      test('case 2', () => {
        expect(t).toStrictEqual([1, 2]);
      });
    }
  });

  describe('takeLast', () => {
    {
      const xs = [1, 2, 3] as const;
      const t = takeLast(xs, 2);

      expectType<typeof t, readonly [2, 3]>('=');

      test('case 1', () => {
        expect(t).toStrictEqual([2, 3]);
      });
    }
    {
      const xs: readonly number[] = [1, 2, 3];
      const t = takeLast(xs, 2);

      expectType<typeof t, readonly number[]>('=');

      test('case 2', () => {
        expect(t).toStrictEqual([2, 3]);
      });
    }
  });

  describe('skip', () => {
    {
      const xs = [1, 2, 3] as const;
      const t = skip(xs, 2);

      expectType<typeof t, readonly [3]>('=');

      test('case 1', () => {
        expect(t).toStrictEqual([3]);
      });
    }
    {
      const xs: readonly number[] = [1, 2, 3];
      const t = skip(xs, 2);

      expectType<typeof t, readonly number[]>('=');

      test('case 2', () => {
        expect(t).toStrictEqual([3]);
      });
    }
  });

  describe('skipLast', () => {
    {
      const xs = [1, 2, 3] as const;
      const t = skipLast(xs, 2);

      expectType<typeof t, readonly [1]>('=');

      test('case 1', () => {
        expect(t).toStrictEqual([1]);
      });
    }
    {
      const xs: readonly number[] = [1, 2, 3];
      const t = skipLast(xs, 2);

      expectType<typeof t, readonly number[]>('=');

      test('case 2', () => {
        expect(t).toStrictEqual([1]);
      });
    }
  });
});
