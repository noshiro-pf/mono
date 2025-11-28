import { expectType } from '../../expect-type.mjs';
import { Optional } from '../../functional/index.mjs';
import { asInt32, asUint32 } from '../../number/index.mjs';
import { at, head, last } from './array-utils-element-access.mjs';

describe('Arr element access', () => {
  describe(at, () => {
    test('should handle very large positive indices', () => {
      const array = [1, 2, 3];

      const result = at(array, asUint32(1000));

      assert.isTrue(Optional.isNone(result));
    });

    test('should handle very large negative indices', () => {
      const array = [1, 2, 3];

      const result = at(array, asInt32(-1000));

      assert.isTrue(Optional.isNone(result));
    });

    test('should work with valid indices', () => {
      const array = [10, 20, 30];

      const result = at(array, 1);

      assert.isTrue(Optional.isSome(result));

      if (Optional.isSome(result)) {
        expect(result.value).toBe(20);
      }
    });

    test('should work with curried version', () => {
      const atIndex2 = at(2);

      const result = atIndex2([10, 20, 30, 40]);

      assert.isTrue(Optional.isSome(result));

      if (Optional.isSome(result)) {
        expect(result.value).toBe(30);
      }
    });
  });

  describe(head, () => {
    test('case 1', () => {
      const xs = [1, 2, 3] as const;

      const h = head(xs);

      expectType<typeof h, Some<1>>('=');

      assert.isTrue(Optional.isSome(h));

      if (Optional.isSome(h)) {
        expect(h.value).toBe(1);
      }
    });

    test('case 2', () => {
      const xs: MutableNonEmptyArray<number> = [1, 2, 3];

      const h = head(xs);

      expectType<typeof h, Some<number>>('=');

      assert.isTrue(Optional.isSome(h));

      if (Optional.isSome(h)) {
        expect(h.value).toBe(1);
      }
    });

    test('case 3', () => {
      const mut_xs: number[] = [1, 2, 3];

      const h = head(mut_xs);

      expectType<typeof h, Optional<number>>('=');

      assert.isTrue(Optional.isSome(h));

      if (Optional.isSome(h)) {
        expect(h.value).toBe(1);
      }
    });

    test('case 4', () => {
      const xs = [] as const;

      const h = head(xs);

      expectType<typeof h, None>('=');

      assert.isTrue(Optional.isNone(h));
    });

    test('should return none for empty array', () => {
      const result = head([]);

      assert.isTrue(Optional.isNone(result));
    });

    test('should work with single element array', () => {
      const result = head([42]);

      assert.isTrue(Optional.isSome(result));

      if (Optional.isSome(result)) {
        expect(result.value).toBe(42);
      }
    });
  });

  describe(last, () => {
    test('case 1', () => {
      const xs = [1, 2, 3] as const;

      const l = last(xs);

      expectType<typeof l, Some<3>>('=');

      assert.isTrue(Optional.isSome(l));

      if (Optional.isSome(l)) {
        expect(l.value).toBe(3);
      }
    });

    test('case 2', () => {
      const xs: MutableNonEmptyArray<number> = [1, 2, 3];

      const l = last(xs);

      expectType<typeof l, Some<number>>('=');

      assert.isTrue(Optional.isSome(l));

      if (Optional.isSome(l)) {
        expect(l.value).toBe(3);
      }
    });

    test('case 3', () => {
      const mut_xs: number[] = [1, 2, 3];

      const l = last(mut_xs);

      expectType<typeof l, Optional<number>>('=');

      assert.isTrue(Optional.isSome(l));

      if (Optional.isSome(l)) {
        expect(l.value).toBe(3);
      }
    });

    test('case 4', () => {
      const xs = [] as const;

      const l = last(xs);

      expectType<typeof l, None>('=');

      assert.isTrue(Optional.isNone(l));
    });

    test('should return none for empty array', () => {
      const result = last([]);

      assert.isTrue(Optional.isNone(result));
    });

    test('should work with single element array', () => {
      const result = last([42]);

      assert.isTrue(Optional.isSome(result));

      if (Optional.isSome(result)) {
        expect(result.value).toBe(42);
      }
    });
  });
});
