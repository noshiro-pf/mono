import { expectType } from '../expect-type.mjs';
import { Arr } from './array-utils.mjs';

describe('ArrayUtils', () => {
  describe('isSubset', () => {
    {
      const xs = [1, 2, 3] as const;
      const ys = [3, 2] as const;

      const result = Arr.isSubset(ys, xs);

      expectType<typeof result, boolean>('=');

      test('case 1', () => {
        expect(result).toBe(true);
      });
    }
    {
      const xs = [1, 2, 3] as const;
      const ys = [3, 2, 4] as const;

      const result = Arr.isSubset(ys, xs);

      expectType<typeof result, boolean>('=');

      test('case 2', () => {
        expect(result).toBe(false);
      });
    }
  });

  describe('isSuperset', () => {
    {
      const xs = [1, 2, 3] as const;
      const ys = [3, 2] as const;

      const result = Arr.isSuperset(ys, xs);

      expectType<typeof result, boolean>('=');

      test('case 1', () => {
        expect(result).toBe(false);
      });

      const result2 = Arr.isSuperset(xs, ys);

      test('case 2', () => {
        expect(result2).toBe(true);
      });
    }
    {
      const xs = [1, 2, 3] as const;
      const ys = [3, 2, 4] as const;

      const result = Arr.isSuperset(ys, xs);

      expectType<typeof result, boolean>('=');

      test('case 3', () => {
        expect(result).toBe(false);
      });
    }
  });
});
