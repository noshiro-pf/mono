import { expectType } from '../expect-type.mjs';
import { Tpl } from './tuple-utils.mjs';

describe('Tuple.map', () => {
  const mapped = Tpl.map([1, 2, 3], (x, i): number => x * x * i);

  expectType<typeof mapped, ArrayOfLength<3, number>>('=');

  test('case 1', () => {
    expect(mapped).toStrictEqual([0, 4, 18]);
  });
});

describe('Tpl.set', () => {
  const result = Tpl.set([1, 2, 3], 1, 4);

  expectType<typeof result, readonly [1 | 4, 2 | 4, 3 | 4]>('=');

  test('case 1', () => {
    expect(result).toStrictEqual([1, 4, 3]);
  });
});

describe('Tpl.update', () => {
  const result = Tpl.update([1, 2, 3], 1, (x) => x + 2);

  expectType<typeof result, readonly [number, number, number]>('=');

  test('case 1', () => {
    expect(result).toStrictEqual([1, 4, 3]);
  });
});

describe('Tpl.reverse', () => {
  {
    const result = Tpl.reversed([1, 2, 3]);

    expectType<typeof result, readonly [3, 2, 1]>('=');

    test('case 1', () => {
      expect(result).toStrictEqual([3, 2, 1]);
    });
  }
});

describe('Tpl.sorted', () => {
  {
    // as const 無しでも動くこと
    const result = Tpl.sorted([2, 1, 3]);

    expectType<typeof result, ArrayOfLength<3, 1 | 2 | 3>>('=');

    test('case 1', () => {
      expect(result).toStrictEqual([1, 2, 3]);
    });
  }
  {
    // as const 無しでも動くこと
    const result = Tpl.sorted([2, 1, 3], (a, b) => a - b);

    expectType<typeof result, ArrayOfLength<3, 1 | 2 | 3>>('=');

    test('case 2', () => {
      expect(result).toStrictEqual([1, 2, 3]);
    });
  }
  {
    const xs = [2, 1, 3] as const;
    const result = xs.toSorted((a, b) => b - a);

    expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

    test('case 3', () => {
      expect(result).toStrictEqual([3, 2, 1]);
    });
  }
});

describe('Tpl.sortedBy', () => {
  {
    const sorted = Tpl.sortedBy([{ v: 2 }, { v: 1 }, { v: 3 }], (x) => x.v);

    expectType<
      typeof sorted,
      ArrayOfLength<
        3,
        Readonly<
          | {
              v: 1;
            }
          | {
              v: 2;
            }
          | {
              v: 3;
            }
        >
      >
    >('=');

    test('case 1', () => {
      expect(sorted).toStrictEqual([{ v: 1 }, { v: 2 }, { v: 3 }]);
    });
  }
  {
    const sorted = Tpl.sortedBy(
      [{ v: 2 }, { v: 1 }, { v: 3 }],
      (x) => x.v,
      (a, b) => a - b,
    );

    expectType<
      typeof sorted,
      ArrayOfLength<
        3,
        Readonly<
          | {
              v: 1;
            }
          | {
              v: 2;
            }
          | {
              v: 3;
            }
        >
      >
    >('=');

    test('case 2', () => {
      expect(sorted).toStrictEqual([{ v: 1 }, { v: 2 }, { v: 3 }]);
    });
  }
});

describe('Tpl.findIndex', () => {
  {
    const result = Tpl.findIndex(
      [{ v: 2 }, { v: 1 }, { v: 3 }],
      (x) => x.v === 1,
    );

    expectType<typeof result, -1 | 0 | 1 | 2>('=');

    test('case 1', () => {
      expect(result).toBe(1);
    });
  }
  {
    const xs: readonly Readonly<{
      v: 1 | 2 | 3;
    }>[] = [{ v: 2 }, { v: 1 }, { v: 3 }] as const;

    const result = Tpl.findIndex(xs, (x) => x.v === 1);

    expectType<typeof result, NumberType.ArraySearchResult>('=');

    test('case 2', () => {
      expect(result).toBe(1);
    });
  }
});
