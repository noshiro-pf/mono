import { expectType } from '../expect-type.mjs';
import { Arr } from './array-utils.mjs';
import { Tpl } from './tuple-utils.mjs';

describe('Tuple.map', () => {
  const xs = [1, 2, 3] as const;
  const mapped = Tpl.map(xs, (x, i): number => x * x * i);

  expectType<typeof mapped, ArrayOfLength<3, number>>('=');

  test('case 1', () => {
    expect(mapped).toStrictEqual([0, 4, 18]);
  });
});

describe('TupleUtils.set', () => {
  const xs = [1, 2, 3] as const;
  const result = Tpl.set(xs, 1, 4 as const);

  expectType<typeof result, readonly [1 | 4, 2 | 4, 3 | 4]>('=');

  test('case 1', () => {
    expect(result).toStrictEqual([1, 4, 3]);
  });
});

describe('TupleUtils.update', () => {
  const xs = [1, 2, 3] as const;
  const result = Tpl.update(xs, 1, (x) => x + 2);

  expectType<typeof result, readonly [number, number, number]>('=');

  test('case 1', () => {
    expect(result).toStrictEqual([1, 4, 3]);
  });
});

describe('TupleUtils.reverse', () => {
  {
    const xs = [1, 2, 3] as const;
    const result = Tpl.reversed(xs);

    expectType<typeof result, readonly [3, 2, 1]>('=');

    test('case 1', () => {
      expect(result).toStrictEqual([3, 2, 1]);
    });
  }
});

describe('TupleUtils.sorted', () => {
  {
    const xs = [2, 1, 3] as const;
    const result = Tpl.sorted(xs);

    expectType<typeof result, ArrayOfLength<3, 1 | 2 | 3>>('=');

    test('case 1', () => {
      expect(result).toStrictEqual([1, 2, 3]);
    });
  }
  {
    const xs = [2, 1, 3] as const;
    const result = Tpl.sorted(xs, (a, b) => a - b);

    expectType<typeof result, ArrayOfLength<3, 1 | 2 | 3>>('=');

    test('case 2', () => {
      expect(result).toStrictEqual([1, 2, 3]);
    });
  }
  {
    const xs = [2, 1, 3] as const;
    const result = Arr.sorted(xs, (a, b) => b - a);

    expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

    test('case 3', () => {
      expect(result).toStrictEqual([3, 2, 1]);
    });
  }
});

describe('TupleUtils.sortedBy', () => {
  {
    const xs = [{ v: 2 }, { v: 1 }, { v: 3 }] as const;
    const sorted = Tpl.sortedBy(xs, (x) => x.v);

    expectType<
      typeof sorted,
      ArrayOfLength<
        3,
        Readonly<{ v: 1 }> | Readonly<{ v: 2 }> | Readonly<{ v: 3 }>
      >
    >('=');

    test('case 1', () => {
      expect(sorted).toStrictEqual([{ v: 1 }, { v: 2 }, { v: 3 }]);
    });
  }
  {
    const xs = [{ v: 2 }, { v: 1 }, { v: 3 }] as const;
    const sorted = Tpl.sortedBy(
      xs,
      (x) => x.v,
      (a, b) => a - b,
    );

    expectType<
      typeof sorted,
      ArrayOfLength<
        3,
        Readonly<{ v: 1 }> | Readonly<{ v: 2 }> | Readonly<{ v: 3 }>
      >
    >('=');

    test('case 2', () => {
      expect(sorted).toStrictEqual([{ v: 1 }, { v: 2 }, { v: 3 }]);
    });
  }
});

describe('TupleUtils.findIndex', () => {
  {
    const xs = [{ v: 2 }, { v: 1 }, { v: 3 }] as const;
    const result = Tpl.findIndex(xs, (x) => x.v === 1);

    expectType<typeof result, -1 | 0 | 1 | 2>('=');

    test('case 1', () => {
      expect(result).toBe(1);
    });
  }
  {
    const xs: readonly Readonly<{ v: 1 | 2 | 3 }>[] = [
      { v: 2 },
      { v: 1 },
      { v: 3 },
    ] as const;
    const result = Tpl.findIndex(xs, (x) => x.v === 1);

    expectType<typeof result, NumberType.ArraySearchResult>('=');

    test('case 2', () => {
      expect(result).toBe(1);
    });
  }
});
