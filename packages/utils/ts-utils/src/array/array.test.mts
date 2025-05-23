import { expectType } from '../expect-type.mjs';

describe('Array.every', () => {
  const xs = [1, 2, 3] as const;

  if (xs.every((x): x is 1 => x === 1)) {
    expectType<typeof xs, readonly [1, 2, 3] & readonly 1[]>('=');
  } else {
    expectType<typeof xs, readonly [1, 2, 3] & readonly 1[]>('!=');
  }

  test('case 1', () => {
    expect(xs.every((x): x is 1 => x === 1)).toBe(false);
  });

  test('case 2', () => {
    expect(xs.every((x) => 1 <= x && x <= 3)).toBe(true);
  });
});

describe('Array.some', () => {
  const xs = [1, 2, 3] as const;

  test('case 1', () => {
    expect(xs.some((x): x is 1 => x === 1)).toBe(true);
  });

  test('case 2', () => {
    expect(xs.some((x) => x <= 1 && 3 <= x)).toBe(false);
  });
});

describe('Array.flat', () => {
  const xs = [1, 2, [3, 4, [5, 6, [7, 8]]]] as const;
  const result = xs.flat(1);

  expectType<
    typeof result,
    readonly (readonly [5, 6, readonly [7, 8]] | 1 | 2 | 3 | 4)[]
  >('=');

  test('case 1', () => {
    expect(result).toStrictEqual([1, 2, 3, 4, [5, 6, [7, 8]]]);
  });
});

describe('Array.includes', () => {
  {
    const xs = [2, 1, 3] as const;
    const result = xs.includes(2);

    expectType<typeof result, boolean>('=');

    test('case 1', () => {
      expect(result).toBe(true);
    });
  }
  {
    const xs: readonly number[] = [2, 1, 3];
    const result = xs.includes(4);

    expectType<typeof result, boolean>('=');

    test('case 2', () => {
      expect(result).toBe(false);
    });
  }
});

describe('Array.find', () => {
  {
    const xs = [{ v: 2 }, { v: 1 }, { v: 3 }] as const;
    const result = xs.find((x) => x.v === 1);

    expectType<
      typeof result,
      | Readonly<{
          v: 1;
        }>
      | undefined
    >('=');

    test('case 1', () => {
      expect(result).toStrictEqual({ v: 1 });
    });
  }
  {
    const xs: readonly Readonly<{
      v: 1 | 2 | 3;
    }>[] = [{ v: 2 }, { v: 1 }, { v: 3 }] as const;
    const result = xs.find((x) => x.v === 1);

    expectType<
      typeof result,
      | Readonly<{
          v: 1 | 2 | 3;
        }>
      | undefined
    >('=');

    test('case 2', () => {
      expect(result).toStrictEqual({ v: 1 });
    });
  }
});

describe('Array.findIndex', () => {
  {
    const xs = [{ v: 2 }, { v: 1 }, { v: 3 }] as const;
    const result = xs.findIndex((x) => x.v === 1);

    expectType<typeof result, NumberType.ArraySearchResult>('=');

    test('case 1', () => {
      expect(result).toBe(1);
    });
  }
  {
    const xs: readonly Readonly<{
      v: 1 | 2 | 3;
    }>[] = [{ v: 2 }, { v: 1 }, { v: 3 }] as const;
    const result = xs.findIndex((x) => x.v === 1);

    expectType<typeof result, NumberType.ArraySearchResult>('=');

    test('case 2', () => {
      expect(result).toBe(1);
    });
  }
});

describe('Array.filter', () => {
  {
    const xs = [1, 2, 3] as const;
    const filtered = xs.filter((x): x is 1 | 3 => x % 2 === 1);

    expectType<typeof filtered, readonly (1 | 3)[]>('=');

    test('case 1', () => {
      expect(filtered).toStrictEqual([1, 3]);
    });
  }

  {
    const xs = [1, 2, 3] as const;
    const filtered = xs.filter((x) => x % 2 === 1);

    expectType<typeof filtered, readonly (1 | 2 | 3)[]>('=');

    test('case 2', () => {
      expect(filtered).toStrictEqual([1, 3]);
    });
  }
});
