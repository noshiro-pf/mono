import { expectType } from '../expect-type.mjs';
import { Arr } from './array-utils.mjs';

describe('ArrayUtils', () => {
  describe('head', () => {
    {
      const xs = [1, 2, 3] as const;
      const head = Arr.head(xs);

      expectType<typeof head, 1>('=');

      test('case 1', () => {
        expect(head).toBe(1);
      });
    }
    {
      const xs: MutableNonEmptyArray<number> = [1, 2, 3];
      const head = Arr.head(xs);

      expectType<typeof head, number>('=');

      test('case 2', () => {
        expect(head).toBe(1);
      });
    }
    {
      const mut_xs: number[] = [1, 2, 3];
      const head = Arr.head(mut_xs);

      expectType<typeof head, number | undefined>('=');

      test('case 3', () => {
        expect(head).toBe(1);
      });
    }
    {
      const xs = [] as const;
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      const head = Arr.head(xs);

      expectType<typeof head, undefined>('=');

      test('case 4', () => {
        expect(head).toBeUndefined();
      });
    }
  });

  describe('last', () => {
    {
      const xs = [1, 2, 3] as const;
      const last = Arr.last(xs);

      expectType<typeof last, 3>('=');

      test('case 1', () => {
        expect(last).toBe(3);
      });
    }
    {
      const xs: MutableNonEmptyArray<number> = [1, 2, 3];
      const last = Arr.last(xs);

      expectType<typeof last, number>('=');

      test('case 2', () => {
        expect(last).toBe(3);
      });
    }
    {
      const mut_xs: number[] = [1, 2, 3];
      const last = Arr.last(mut_xs);

      expectType<typeof last, number | undefined>('=');

      test('case 3', () => {
        expect(last).toBe(3);
      });
    }
    {
      const xs = [] as const;
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      const last = Arr.last(xs);

      expectType<typeof last, undefined>('=');

      test('case 4', () => {
        expect(last).toBeUndefined();
      });
    }
  });

  describe('tail', () => {
    const xs = [1, 2, 3] as const;
    const tail = Arr.tail(xs);

    expectType<typeof tail, readonly [2, 3]>('=');

    test('case 1', () => {
      expect(tail).toStrictEqual([2, 3]);
    });

    test('alias 1', () => {
      expect(Arr.rest).toStrictEqual(Arr.tail);
    });
    test('alias 2', () => {
      expect(Arr.shift).toStrictEqual(Arr.tail);
    });
  });

  describe('butLast', () => {
    {
      const xs = [1, 2, 3] as const;
      const butLast = Arr.butLast(xs);

      expectType<typeof butLast, readonly [1, 2]>('=');

      test('case 1', () => {
        expect(butLast).toStrictEqual([1, 2]);
      });
    }
    {
      const xs: readonly number[] = [1, 2, 3];
      const butLast = Arr.butLast(xs);

      expectType<typeof butLast, readonly number[]>('=');

      test('case 2', () => {
        expect(butLast).toStrictEqual([1, 2]);
      });
    }

    test('alias', () => {
      expect(Arr.pop).toStrictEqual(Arr.butLast);
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
