import { expectType } from '../expect-type.mjs';
import { toUint32 } from '../index.mjs';
import { Arr } from './array-utils.mjs';

describe('ArrayUtils', () => {
  describe('set', () => {
    const xs = [1, 2, 3] as const;
    const result = Arr.set(xs, 1, 4 as const);

    expectType<typeof result, readonly (1 | 2 | 3 | 4)[]>('=');

    test('case 1', () => {
      expect(result).toStrictEqual([1, 4, 3]);
    });
  });

  describe('update', () => {
    const xs = [1, 2, 3] as const;
    const result = Arr.update(xs, 1, (x) => x + 2);

    expectType<typeof result, readonly number[]>('=');

    test('case 1', () => {
      expect(result).toStrictEqual([1, 4, 3]);
    });
  });

  describe('insert', () => {
    const xs = [1, 2, 3] as const;

    {
      const result = Arr.inserted(xs, 1, 5);

      expectType<typeof result, readonly (1 | 2 | 3 | 5)[]>('=');

      test('case 1', () => {
        expect(result).toStrictEqual([1, 5, 2, 3]);
      });
    }
    {
      const result = Arr.inserted(xs, 0, 5);

      expectType<typeof result, readonly (1 | 2 | 3 | 5)[]>('=');

      test('case 2 (insert head)', () => {
        expect(result).toStrictEqual([5, 1, 2, 3]);
      });
    }
    {
      const result = Arr.inserted(xs, 3, 5);

      expectType<typeof result, readonly (1 | 2 | 3 | 5)[]>('=');

      test('case 3 (insert tail)', () => {
        expect(result).toStrictEqual([1, 2, 3, 5]);
      });
    }
    {
      const result = Arr.inserted(xs, toUint32(999), 5);

      expectType<typeof result, readonly (1 | 2 | 3 | 5)[]>('=');

      test('case 4 (insert tail)', () => {
        expect(result).toStrictEqual([1, 2, 3, 5]);
      });
    }
  });

  describe('remove', () => {
    const xs = [1, 2, 3] as const;

    {
      const result = Arr.removed(xs, 1);

      expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

      test('case 1', () => {
        expect(result).toStrictEqual([1, 3]);
      });
    }
    {
      const result = Arr.removed(xs, 0);

      expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

      test('case 2 (remove head)', () => {
        expect(result).toStrictEqual([2, 3]);
      });
    }
    {
      const result = Arr.removed(xs, 2);

      expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

      test('case 3 (remove tail)', () => {
        expect(result).toStrictEqual([1, 2]);
      });
    }
    {
      const result = Arr.removed(xs, 3);

      expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

      test('case 3 (noop)', () => {
        expect(result).toStrictEqual([1, 2, 3]);
      });
    }
    {
      const result = Arr.removed(xs, 5);

      expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

      test('case 4 (noop)', () => {
        expect(result).toStrictEqual([1, 2, 3]);
      });
    }
  });

  describe('push', () => {
    const xs = [1, 2, 3] as const;
    const result = Arr.pushed(xs, 4 as const);

    expectType<typeof result, readonly [1, 2, 3, 4]>('=');

    test('case 1', () => {
      expect(result).toStrictEqual([1, 2, 3, 4]);
    });
  });

  describe('unshift', () => {
    const xs = [1, 2, 3] as const;
    const result = Arr.unshifted(xs, 4 as const);

    expectType<typeof result, readonly [4, 1, 2, 3]>('=');

    test('case 1', () => {
      expect(result).toStrictEqual([4, 1, 2, 3]);
    });
  });
});
