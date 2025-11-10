import { expectType } from '../../expect-type.mjs';
import { Optional } from '../../functional/index.mjs';
import { asInt32, asUint32 } from '../../number/index.mjs';
import { at, head, last } from './array-utils-element-access.mjs';

describe('Arr element access', () => {
  describe(at, () => {
    test('should handle very large positive indices', () => {
      const array = [1, 2, 3];
      const result = at(array, asUint32(1000));

      expect(Optional.isNone(result)).toBe(true);
    });

    test('should handle very large negative indices', () => {
      const array = [1, 2, 3];
      const result = at(array, asInt32(-1000));

      expect(Optional.isNone(result)).toBe(true);
    });

    test('should work with valid indices', () => {
      const array = [10, 20, 30];
      const result = at(array, 1);

      expect(Optional.isSome(result)).toBe(true);

      if (Optional.isSome(result)) {
        expect(result.value).toBe(20);
      }
    });
  });

  describe(head, () => {
    test('case 1', () => {
      const xs = [1, 2, 3] as const;
      const h = head(xs);

      expectType<typeof h, Some<1>>('=');

      expect(Optional.isSome(h)).toBe(true);

      if (Optional.isSome(h)) {
        expect(h.value).toBe(1);
      }
    });

    test('case 2', () => {
      const xs: MutableNonEmptyArray<number> = [1, 2, 3];
      const h = head(xs);

      expectType<typeof h, Some<number>>('=');

      expect(Optional.isSome(h)).toBe(true);

      if (Optional.isSome(h)) {
        expect(h.value).toBe(1);
      }
    });

    test('case 3', () => {
      const mut_xs: number[] = [1, 2, 3];
      const h = head(mut_xs);

      expectType<typeof h, Optional<number>>('=');

      expect(Optional.isSome(h)).toBe(true);

      if (Optional.isSome(h)) {
        expect(h.value).toBe(1);
      }
    });

    test('case 4', () => {
      const xs = [] as const;

      const h = head(xs);

      expectType<typeof h, None>('=');

      expect(Optional.isNone(h)).toBe(true);
    });

    test('should return none for empty array', () => {
      const result = head([]);

      expect(Optional.isNone(result)).toBe(true);
    });

    test('should work with single element array', () => {
      const result = head([42]);

      expect(Optional.isSome(result)).toBe(true);

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

      expect(Optional.isSome(l)).toBe(true);

      if (Optional.isSome(l)) {
        expect(l.value).toBe(3);
      }
    });

    test('case 2', () => {
      const xs: MutableNonEmptyArray<number> = [1, 2, 3];
      const l = last(xs);

      expectType<typeof l, Some<number>>('=');

      expect(Optional.isSome(l)).toBe(true);

      if (Optional.isSome(l)) {
        expect(l.value).toBe(3);
      }
    });

    test('case 3', () => {
      const mut_xs: number[] = [1, 2, 3];
      const l = last(mut_xs);

      expectType<typeof l, Optional<number>>('=');

      expect(Optional.isSome(l)).toBe(true);

      if (Optional.isSome(l)) {
        expect(l.value).toBe(3);
      }
    });

    test('case 4', () => {
      const xs = [] as const;

      const l = last(xs);

      expectType<typeof l, None>('=');

      expect(Optional.isNone(l)).toBe(true);
    });

    test('should return none for empty array', () => {
      const result = last([]);

      expect(Optional.isNone(result)).toBe(true);
    });

    test('should work with single element array', () => {
      const result = last([42]);

      expect(Optional.isSome(result)).toBe(true);

      if (Optional.isSome(result)) {
        expect(result.value).toBe(42);
      }
    });
  });
});
