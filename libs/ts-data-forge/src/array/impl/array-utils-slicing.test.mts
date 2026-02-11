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
  describe(tail, () => {
    test('should return all elements except the first', () => {
      const array = [1, 2, 3, 4] as const;

      const result = tail(array);

      expectType<typeof result, readonly [2, 3, 4]>('=');

      assert.deepStrictEqual(result, [2, 3, 4]);
    });

    test('should work with single element array', () => {
      const array = [1] as const;

      const result = tail(array);

      expectType<typeof result, readonly []>('=');

      assert.deepStrictEqual(result, []);
    });

    test('should work with empty array', () => {
      const array = [] as const;

      const result = tail(array);

      expectType<typeof result, readonly []>('=');

      assert.deepStrictEqual(result, []);
    });
  });

  describe(butLast, () => {
    test('readonly number[] type', () => {
      const xs: readonly number[] = [1, 2, 3] as const;

      const bl = butLast(xs);

      expectType<typeof bl, readonly number[]>('=');

      assert.deepStrictEqual(bl, [1, 2]);
    });

    test('should return all elements except the last', () => {
      const array = [1, 2, 3, 4] as const;

      const result = butLast(array);

      expectType<typeof result, readonly [1, 2, 3]>('=');

      assert.deepStrictEqual(result, [1, 2, 3]);
    });

    test('should work with single element array', () => {
      const array = [1] as const;

      const result = butLast(array);

      expectType<typeof result, readonly []>('=');

      assert.deepStrictEqual(result, []);
    });

    test('should work with empty array', () => {
      const array = [] as const;

      const result = butLast(array);

      expectType<typeof result, readonly []>('=');

      assert.deepStrictEqual(result, []);
    });
  });

  describe(take, () => {
    {
      const xs = [1, 2, 3] as const;

      const t = take(xs, 2);

      expectType<typeof t, readonly [1, 2]>('=');

      test('case 1', () => {
        assert.deepStrictEqual(t, [1, 2]);
      });
    }

    {
      const xs: readonly number[] = [1, 2, 3] as const;

      const t = take(xs, 2);

      expectType<typeof t, readonly number[]>('=');

      test('case 2', () => {
        assert.deepStrictEqual(t, [1, 2]);
      });
    }

    test('should work with curried version', () => {
      const takeTwo = take(2);

      const result = takeTwo([1, 2, 3, 4, 5]);

      assert.deepStrictEqual(result, [1, 2]);
    });
  });

  describe(takeLast, () => {
    {
      const xs = [1, 2, 3] as const;

      const t = takeLast(xs, 2);

      expectType<typeof t, readonly [2, 3]>('=');

      test('case 1', () => {
        assert.deepStrictEqual(t, [2, 3]);
      });
    }

    {
      const xs: readonly number[] = [1, 2, 3] as const;

      const t = takeLast(xs, 2);

      expectType<typeof t, readonly number[]>('=');

      test('case 2', () => {
        assert.deepStrictEqual(t, [2, 3]);
      });
    }

    test('should work with curried version', () => {
      const takeLastThree = takeLast(3);

      const result = takeLastThree([1, 2, 3, 4, 5]);

      assert.deepStrictEqual(result, [3, 4, 5]);
    });
  });

  describe(skip, () => {
    {
      const xs = [1, 2, 3] as const;

      const t = skip(xs, 2);

      expectType<typeof t, readonly [3]>('=');

      test('case 1', () => {
        assert.deepStrictEqual(t, [3]);
      });
    }

    {
      const xs: readonly number[] = [1, 2, 3] as const;

      const t = skip(xs, 2);

      expectType<typeof t, readonly number[]>('=');

      test('case 2', () => {
        assert.deepStrictEqual(t, [3]);
      });
    }

    test('should work with curried version', () => {
      const skipTwo = skip(2);

      const result = skipTwo([1, 2, 3, 4, 5]);

      assert.deepStrictEqual(result, [3, 4, 5]);
    });
  });

  describe(skipLast, () => {
    {
      const xs = [1, 2, 3] as const;

      const t = skipLast(xs, 2);

      expectType<typeof t, readonly [1]>('=');

      test('case 1', () => {
        assert.deepStrictEqual(t, [1]);
      });
    }

    {
      const xs: readonly number[] = [1, 2, 3] as const;

      const t = skipLast(xs, 2);

      expectType<typeof t, readonly number[]>('=');

      test('case 2', () => {
        assert.deepStrictEqual(t, [1]);
      });
    }

    test('should work with curried version', () => {
      const skipLastTwo = skipLast(2);

      const result = skipLastTwo([1, 2, 3, 4, 5]);

      assert.deepStrictEqual(result, [1, 2, 3]);
    });
  });
});
