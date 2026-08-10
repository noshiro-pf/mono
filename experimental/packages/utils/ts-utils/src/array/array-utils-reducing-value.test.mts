import { IMap } from '../collections/index.mjs';
import { expectType } from '../expect-type.mjs';
import { Arr } from './array-utils.mjs';

describe('Arr', () => {
  describe('min', () => {
    {
      const xs = [3, 5, 4] as const;
      const result = Arr.min(xs);

      expectType<typeof result, 3 | 4 | 5>('=');

      test('case 1', () => {
        expect(result).toBe(3);
      });
    }
    {
      const xs = [3, 5, 4] as const;
      const result = Arr.min(xs, (a, b) => a - b);

      expectType<typeof result, 3 | 4 | 5>('=');

      test('case 2', () => {
        expect(result).toBe(3);
      });
    }
    {
      const xs: readonly (3 | 4 | 5)[] = [3, 5, 4] as const;
      const result = Arr.min(xs, (a, b) => a - b);

      expectType<typeof result, 3 | 4 | 5 | undefined>('=');

      test('case 3', () => {
        expect(result).toBe(3);
      });
    }
  });

  describe('max', () => {
    const xs = [3, 5, 4] as const;
    const result = Arr.max(xs, (a, b) => a - b);

    expectType<typeof result, 3 | 4 | 5>('=');

    test('case 1', () => {
      expect(result).toBe(5);
    });
  });

  describe('minBy', () => {
    const xs: NonEmptyArray<
      | Readonly<{ x: 1; y: 2 }>
      | Readonly<{ x: 2; y: 3 }>
      | Readonly<{ x: 3; y: 2 }>
      | Readonly<{ x: 4; y: 1 }>
      | Readonly<{ x: 5; y: 1 }>
      | Readonly<{ x: 6; y: 1 }>
    > = [
      { x: 5, y: 1 },
      { x: 4, y: 1 },
      { x: 6, y: 1 },
      { x: 3, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 3 },
    ] as const;

    const result = Arr.minBy(xs, (a) => a.x);

    expectType<
      typeof result,
      | Readonly<{ x: 1; y: 2 }>
      | Readonly<{ x: 2; y: 3 }>
      | Readonly<{ x: 3; y: 2 }>
      | Readonly<{ x: 4; y: 1 }>
      | Readonly<{ x: 5; y: 1 }>
      | Readonly<{ x: 6; y: 1 }>
    >('=');

    test('case 1', () => {
      expect(result).toStrictEqual({ x: 1, y: 2 });
    });
  });

  describe('maxBy', () => {
    const xs: NonEmptyArray<
      | Readonly<{ x: 1; y: 2 }>
      | Readonly<{ x: 2; y: 3 }>
      | Readonly<{ x: 3; y: 2 }>
      | Readonly<{ x: 4; y: 1 }>
      | Readonly<{ x: 5; y: 1 }>
      | Readonly<{ x: 6; y: 1 }>
    > = [
      { x: 5, y: 1 },
      { x: 4, y: 1 },
      { x: 6, y: 1 },
      { x: 3, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 3 },
    ] as const;

    const result = Arr.maxBy(xs, (a) => a.x);

    expectType<
      typeof result,
      | Readonly<{ x: 1; y: 2 }>
      | Readonly<{ x: 2; y: 3 }>
      | Readonly<{ x: 3; y: 2 }>
      | Readonly<{ x: 4; y: 1 }>
      | Readonly<{ x: 5; y: 1 }>
      | Readonly<{ x: 6; y: 1 }>
    >('=');

    test('case 1', () => {
      expect(result).toStrictEqual({ x: 6, y: 1 });
    });
  });

  describe('count', () => {
    const xs = [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 1, y: 3 },
    ] as const;

    const result = Arr.count(xs, (a) => a.x === 2);

    expectType<typeof result, NumberType.ArraySize>('=');

    test('case 1', () => {
      expect(result).toBe(2);
    });
  });

  describe('countBy', () => {
    const xs = [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 1, y: 3 },
    ] as const;

    const result = Arr.countBy(xs, (a) => a.x);

    expectType<typeof result, IMap<1 | 2 | 3, NumberType.ArraySize>>('=');

    test('case 1', () => {
      expect(result).toStrictEqual(
        IMap.new<1 | 2 | 3, number>([
          [1, 3],
          [2, 2],
          [3, 1],
        ]),
      );
    });
  });
});
