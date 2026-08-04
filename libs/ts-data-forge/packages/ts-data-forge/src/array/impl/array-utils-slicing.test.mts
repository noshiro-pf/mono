import { type MinLengthArray } from 'ts-type-forge';
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

/* Length-constrained inputs. `List.*` reports what it can see from a
   fixed-length tuple, and a branded array's `length` is `number`, so it handed
   the input type straight back — `tail` of an "at least 5" array claimed the
   four-element result was still at least five. Never called; see the note in
   `array-utils-modification.test.mts`. */
export const slicingTypeChecks = (
  brandedFive: MinLengthArray<5, string>,
  brandedAndTuple: MinLengthArray<3, number> & readonly [1, 2, 3, 4, 5],
): void => {
  // The bound is recomputed rather than passed through.
  const _tailed = tail(brandedFive);

  expectType<typeof _tailed, MinLengthArray<4, string>>('~=');

  const _butLasted = butLast(brandedFive);

  expectType<typeof _butLasted, MinLengthArray<4, string>>('~=');

  /* A brand intersected with an exact tuple keeps the positions too, so the
     result is exact on both counts. */
  const _tailedBoth = tail(brandedAndTuple);

  expectType<(typeof _tailedBoth)[0], 2>('=');

  expectType<(typeof _tailedBoth)['length'], 4>('=');

  /* `take` / `takeLast` / `skip` / `skipLast` stay on the `List.*` path and give
     a branded input the sound unconstrained answer instead of its stale brand.
     They cannot use `ConstrainedList.Take` and friends: those rebuild the bounds
     from `N` and cannot be instantiated against a still-generic `Ar` at all —
     even with a literal `N` the deferred result is a union too complex to
     represent. */
  const _taken = take(brandedFive, 2);

  expectType<typeof _taken, readonly string[]>('=');

  const _skipped = skip(brandedFive, 2);

  expectType<typeof _skipped, readonly string[]>('=');

  // Plain tuples keep mapping exactly as before.
  const _tailedTuple = tail([1, 2, 3] as const);

  expectType<typeof _tailedTuple, readonly [2, 3]>('=');

  const _butLastedTuple = butLast([1, 2, 3] as const);

  expectType<typeof _butLastedTuple, readonly [1, 2]>('=');

  const _takenTuple = take([1, 2, 3] as const, 2);

  expectType<typeof _takenTuple, readonly [1, 2]>('=');
};
