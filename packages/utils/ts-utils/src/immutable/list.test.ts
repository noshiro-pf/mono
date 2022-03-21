import { assertNotType, assertType } from '../types';
import { IMap } from './imap';
import { IList } from './list';

describe('IList.isEmpty', () => {
  const xs = [1, 2, 3] as const;
  const result = IList.isEmpty(xs);

  assertType<TypeEq<typeof result, boolean>>();

  test('case 1', () => {
    expect(result).toBe(false);
  });

  test('case 2', () => {
    expect(IList.isEmpty([])).toBe(true);
  });
});

describe('IList.isNonEmpty', () => {
  const xs = [1, 2, 3] as const;
  const result = IList.isNonEmpty(xs);

  assertType<TypeEq<typeof result, boolean>>();

  test('case 1', () => {
    expect(result).toBe(true);
  });

  test('case 2', () => {
    expect(IList.isNonEmpty([])).toBe(false);
  });
});

describe('IList.slice', () => {
  const list = [0, 1, 2, 3, 4] as const;

  for (const { testName, result, toBe } of [
    {
      testName: 'IList.slice',
      result: IList.slice(list, 0, 5),
      toBe: [0, 1, 2, 3, 4],
    }, // 正常
    {
      testName: 'IList.slice',
      result: IList.slice(list, 0, 6),
      toBe: [0, 1, 2, 3, 4],
    }, // 片方オーバー
    {
      testName: 'IList.slice',
      result: IList.slice(list, -1, 5),
      toBe: [0, 1, 2, 3, 4],
    }, // 片方オーバー
    {
      testName: 'IList.slice',
      result: IList.slice(list, -1, 6),
      toBe: [0, 1, 2, 3, 4],
    }, // 両方オーバー
    {
      testName: 'IList.slice',
      result: IList.slice(list, 0, 3),
      toBe: [0, 1, 2],
    }, // 正常
    {
      testName: 'IList.slice',
      result: IList.slice(list, 1, 3),
      toBe: [1, 2],
    }, // 正常
    {
      testName: 'IList.slice',
      result: IList.slice(list, -1, 3),
      toBe: [0, 1, 2],
    }, // 片方オーバー
    {
      testName: 'IList.slice',
      result: IList.slice(list, 3, 5),
      toBe: [3, 4],
    }, // 正常
    {
      testName: 'IList.slice',
      result: IList.slice(list, 3, 6),
      toBe: [3, 4],
    }, // 片方オーバー
    {
      testName: 'IList.slice',
      result: IList.slice(list, 4, 3),
      toBe: [],
    }, // start > end
    {
      testName: 'IList.slice',
      result: IList.slice(list, 0, -1),
      toBe: [],
    }, // start > end
    {
      testName: 'IList.slice',
      result: IList.slice(list, -1, -2),
      toBe: [],
    }, // start > end
    {
      testName: 'IList.slice',
      result: IList.slice(list, 6, 9),
      toBe: [],
    },
    {
      testName: 'IList.slice',
      result: IList.slice(list, 6, 3),
      toBe: [],
    },
  ]) {
    test(testName, () => {
      expect(result).toStrictEqual(toBe);
    });
  }
});

describe('IList.head', () => {
  {
    const xs = [1, 2, 3] as const;
    const head = IList.head(xs);

    assertType<TypeEq<typeof head, 1>>();

    test('case 1', () => {
      expect(head).toBe(1);
    });
  }
  {
    const xs: NonEmptyArray<number> = [1, 2, 3];
    const head = IList.head(xs);

    assertType<TypeEq<typeof head, number>>();

    test('case 2', () => {
      expect(head).toBe(1);
    });
  }
  {
    const mut_xs: number[] = [1, 2, 3];
    const head = IList.head(mut_xs);

    assertType<TypeEq<typeof head, number | undefined>>();

    test('case 3', () => {
      expect(head).toBe(1);
    });
  }
  {
    const xs = [] as const;
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    const head = IList.head(xs);

    assertType<TypeEq<typeof head, undefined>>();

    test('case 4', () => {
      expect(head).toBeUndefined();
    });
  }
});

describe('IList.last', () => {
  {
    const xs = [1, 2, 3] as const;
    const last = IList.last(xs);

    assertType<TypeEq<typeof last, 3>>();

    test('case 1', () => {
      expect(last).toBe(3);
    });
  }
  {
    const xs: NonEmptyArray<number> = [1, 2, 3];
    const last = IList.last(xs);

    assertType<TypeEq<typeof last, number>>();

    test('case 2', () => {
      expect(last).toBe(3);
    });
  }
  {
    const mut_xs: number[] = [1, 2, 3];
    const last = IList.last(mut_xs);

    assertType<TypeEq<typeof last, number | undefined>>();

    test('case 3', () => {
      expect(last).toBe(3);
    });
  }
  {
    const xs = [] as const;
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    const last = IList.last(xs);

    assertType<TypeEq<typeof last, undefined>>();

    test('case 4', () => {
      expect(last).toBeUndefined();
    });
  }
});

describe('IList.tail', () => {
  const xs = [1, 2, 3] as const;
  const tail = IList.tail(xs);

  assertType<TypeEq<typeof tail, readonly [2, 3]>>();

  test('case 1', () => {
    expect(tail).toStrictEqual([2, 3]);
  });

  test('alias 1', () => {
    expect(IList.rest).toStrictEqual(IList.tail);
  });
  test('alias 2', () => {
    expect(IList.shift).toStrictEqual(IList.tail);
  });
});

describe('IList.butLast', () => {
  {
    const xs = [1, 2, 3] as const;
    const butLast = IList.butLast(xs);

    assertType<TypeEq<typeof butLast, readonly [1, 2]>>();

    test('case 1', () => {
      expect(butLast).toStrictEqual([1, 2]);
    });
  }
  {
    const xs: readonly number[] = [1, 2, 3];
    const butLast = IList.butLast(xs);

    assertType<TypeEq<typeof butLast, readonly number[]>>();

    test('case 2', () => {
      expect(butLast).toStrictEqual([1, 2]);
    });
  }

  test('alias', () => {
    expect(IList.pop).toStrictEqual(IList.butLast);
  });
});

describe('IList.take', () => {
  {
    const xs = [1, 2, 3] as const;
    const t = IList.take(xs, 2);

    assertType<TypeEq<typeof t, readonly [1, 2]>>();

    test('case 1', () => {
      expect(t).toStrictEqual([1, 2]);
    });
  }
  {
    const xs: readonly number[] = [1, 2, 3];
    const t = IList.take(xs, 2);

    assertType<TypeEq<typeof t, readonly number[]>>();

    test('case 2', () => {
      expect(t).toStrictEqual([1, 2]);
    });
  }
});

describe('IList.takeLast', () => {
  {
    const xs = [1, 2, 3] as const;
    const t = IList.takeLast(xs, 2);

    assertType<TypeEq<typeof t, readonly [2, 3]>>();

    test('case 1', () => {
      expect(t).toStrictEqual([2, 3]);
    });
  }
  {
    const xs: readonly number[] = [1, 2, 3];
    const t = IList.takeLast(xs, 2);

    assertType<TypeEq<typeof t, readonly number[]>>();

    test('case 2', () => {
      expect(t).toStrictEqual([2, 3]);
    });
  }
});

describe('IList.skip', () => {
  {
    const xs = [1, 2, 3] as const;
    const t = IList.skip(xs, 2);

    assertType<TypeEq<typeof t, readonly [3]>>();

    test('case 1', () => {
      expect(t).toStrictEqual([3]);
    });
  }
  {
    const xs: readonly number[] = [1, 2, 3];
    const t = IList.skip(xs, 2);

    assertType<TypeEq<typeof t, readonly number[]>>();

    test('case 2', () => {
      expect(t).toStrictEqual([3]);
    });
  }
});

describe('IList.skipLast', () => {
  {
    const xs = [1, 2, 3] as const;
    const t = IList.skipLast(xs, 2);

    assertType<TypeEq<typeof t, readonly [1]>>();

    test('case 1', () => {
      expect(t).toStrictEqual([1]);
    });
  }
  {
    const xs: readonly number[] = [1, 2, 3];
    const t = IList.skipLast(xs, 2);

    assertType<TypeEq<typeof t, readonly number[]>>();

    test('case 2', () => {
      expect(t).toStrictEqual([1]);
    });
  }
});

describe('IList.every', () => {
  const xs = [1, 2, 3] as const;

  if (IList.every(xs, (x): x is 1 => x === 1)) {
    assertType<TypeEq<typeof xs, readonly [1, 2, 3] & readonly 1[]>>();
  } else {
    assertNotType<TypeEq<typeof xs, readonly [1, 2, 3] & readonly 1[]>>();
  }

  test('case 1', () => {
    expect(IList.every(xs, (x): x is 1 => x === 1)).toBe(false);
  });

  test('case 2', () => {
    expect(IList.every(xs, (x) => 1 <= x && x <= 3)).toBe(true);
  });
});

describe('IList.some', () => {
  const xs = [1, 2, 3] as const;

  test('case 1', () => {
    expect(IList.some(xs, (x): x is 1 => x === 1)).toBe(true);
  });

  test('case 2', () => {
    expect(IList.some(xs, (x) => x <= 1 && 3 <= x)).toBe(false);
  });
});

describe('IList.map', () => {
  const xs = [1, 2, 3] as const;
  const mapped = IList.map(xs, (x, i): number => x * x * i);

  assertType<TypeEq<typeof mapped, ReadonlyArrayOfLength<3, number>>>();

  test('case 1', () => {
    expect(mapped).toStrictEqual([0, 4, 18]);
  });
});

describe('IList.flat', () => {
  const xs = [1, 2, [3, 4, [5, 6, [7, 8]]]] as const;
  const result = IList.flat(xs, 1);

  assertType<
    TypeEq<
      typeof result,
      readonly (readonly [5, 6, readonly [7, 8]] | 1 | 2 | 3 | 4)[]
    >
  >();

  test('case 1', () => {
    expect(result).toStrictEqual([1, 2, 3, 4, [5, 6, [7, 8]]]);
  });
});

describe('IList.flatMap', () => {
  const xs = [1, 2, 3] as const;
  const mapped = IList.flatMap(xs, (x, i) => [i, x * x]);

  assertType<TypeEq<typeof mapped, readonly number[]>>();

  test('case 1', () => {
    expect(mapped).toStrictEqual([0, 1, 1, 4, 2, 9]);
  });
});

describe('IList.zip', () => {
  {
    const xs = [1, 2, 3] as const;
    const ys = [4, 5, 6] as const;
    const zipped = IList.zip(xs, ys);

    assertType<
      TypeEq<
        typeof zipped,
        readonly [readonly [1, 4], readonly [2, 5], readonly [3, 6]]
      >
    >();

    test('case 1', () => {
      expect(zipped).toStrictEqual([
        [1, 4],
        [2, 5],
        [3, 6],
      ]);
    });
  }
  {
    const xs: readonly number[] = [1, 2, 3];
    const ys: readonly number[] = [4];
    const zipped = IList.zip(xs, ys);

    assertType<TypeEq<typeof zipped, readonly (readonly [number, number])[]>>();

    test('case 2', () => {
      expect(zipped).toStrictEqual([[1, 4]]);
    });
  }
  {
    const xs = [1] as const;
    const ys: readonly number[] = [4, 5, 6];
    const zipped = IList.zip(xs, ys);

    assertType<
      TypeEq<typeof zipped, readonly [readonly [1, number | undefined]]>
    >();

    test('case 3', () => {
      expect(zipped).toStrictEqual([[1, 4]]);
    });
  }

  // testArrayEquality({
  //   testName: 'zip',
  //   target: zip([0, 1, 2, 3, 4], [5, 6, 7, 8, 9]),
  //   toBe: [
  //     [0, 5],
  //     [1, 6],
  //     [2, 7],
  //     [3, 8],
  //     [4, 9],
  //   ],
  // });

  // testArrayEquality({
  //   testName: 'zipArrays 2 arrays',
  //   target: zipArrays([0, 1, 2, 3, 4], [5, 6, 7, 8, 9]),
  //   toBe: [
  //     [0, 5],
  //     [1, 6],
  //     [2, 7],
  //     [3, 8],
  //     [4, 9],
  //   ],
  // });

  // testArrayEquality({
  //   testName: 'zipArrays 3 arrays',
  //   target: zipArrays(
  //     [0, 1, 2, 3, 4],
  //     [5, 6, 7, 8, 9, 999, 999],
  //     [10, 11, 12, 13, 14, 999]
  //   ),
  //   toBe: [
  //     [0, 5, 10],
  //     [1, 6, 11],
  //     [2, 7, 12],
  //     [3, 8, 13],
  //     [4, 9, 14],
  //   ],
  // });
});

describe('IList.filter', () => {
  {
    const xs = [1, 2, 3] as const;
    const filtered = IList.filter(xs, (x): x is 1 | 3 => x % 2 === 1);

    assertType<TypeEq<typeof filtered, readonly (1 | 3)[]>>();

    test('case 1', () => {
      expect(filtered).toStrictEqual([1, 3]);
    });
  }
  {
    const xs = [1, 2, 3] as const;
    const filtered = IList.filter(xs, (x) => x % 2 === 1);

    assertType<TypeEq<typeof filtered, readonly (1 | 2 | 3)[]>>();

    test('case 2', () => {
      expect(filtered).toStrictEqual([1, 3]);
    });
  }
});

describe('IList.filterNot', () => {
  const xs = [1, 2, 3] as const;
  const filtered = IList.filterNot(xs, (x) => x % 2 === 0);

  assertType<TypeEq<typeof filtered, readonly (1 | 2 | 3)[]>>();

  test('case 1', () => {
    expect(filtered).toStrictEqual([1, 3]);
  });
});

describe('IList.set', () => {
  const xs = [1, 2, 3] as const;
  const result = IList.set(xs, 1, 4 as const);

  assertType<TypeEq<typeof result, readonly [1 | 4, 2 | 4, 3 | 4]>>();

  test('case 1', () => {
    expect(result).toStrictEqual([1, 4, 3]);
  });
});

describe('IList.update', () => {
  const xs = [1, 2, 3] as const;
  const result = IList.update(xs, 1, (x) => x + 2);

  assertType<TypeEq<typeof result, readonly [number, number, number]>>();

  test('case 1', () => {
    expect(result).toStrictEqual([1, 4, 3]);
  });
});

describe('IList.insert', () => {
  const xs = [1, 2, 3] as const;

  {
    const result = IList.insert(xs, 1, 5);

    assertType<TypeEq<typeof result, readonly (1 | 2 | 3 | 5)[]>>();

    test('case 1', () => {
      expect(result).toStrictEqual([1, 5, 2, 3]);
    });
  }
  {
    const result = IList.insert(xs, 0, 5);

    assertType<TypeEq<typeof result, readonly (1 | 2 | 3 | 5)[]>>();

    test('case 2 (insert head)', () => {
      expect(result).toStrictEqual([5, 1, 2, 3]);
    });
  }
  {
    const result = IList.insert(xs, 3, 5);

    assertType<TypeEq<typeof result, readonly (1 | 2 | 3 | 5)[]>>();

    test('case 3 (insert tail)', () => {
      expect(result).toStrictEqual([1, 2, 3, 5]);
    });
  }
  {
    const result = IList.insert(xs, 999, 5);

    assertType<TypeEq<typeof result, readonly (1 | 2 | 3 | 5)[]>>();

    test('case 4 (insert tail)', () => {
      expect(result).toStrictEqual([1, 2, 3, 5]);
    });
  }
});

describe('IList.remove', () => {
  const xs = [1, 2, 3] as const;

  {
    const result = IList.remove(xs, 1);

    assertType<TypeEq<typeof result, readonly (1 | 2 | 3)[]>>();

    test('case 1', () => {
      expect(result).toStrictEqual([1, 3]);
    });
  }
  {
    const result = IList.remove(xs, 0);

    assertType<TypeEq<typeof result, readonly (1 | 2 | 3)[]>>();

    test('case 2 (remove head)', () => {
      expect(result).toStrictEqual([2, 3]);
    });
  }
  {
    const result = IList.remove(xs, 2);

    assertType<TypeEq<typeof result, readonly (1 | 2 | 3)[]>>();

    test('case 3 (remove tail)', () => {
      expect(result).toStrictEqual([1, 2]);
    });
  }
  {
    const result = IList.remove(xs, 3);

    assertType<TypeEq<typeof result, readonly (1 | 2 | 3)[]>>();

    test('case 3 (noop)', () => {
      expect(result).toStrictEqual([1, 2, 3]);
    });
  }
  {
    const result = IList.remove(xs, 5);

    assertType<TypeEq<typeof result, readonly (1 | 2 | 3)[]>>();

    test('case 4 (noop)', () => {
      expect(result).toStrictEqual([1, 2, 3]);
    });
  }
});

describe('IList.push', () => {
  const xs = [1, 2, 3] as const;
  const result = IList.push(xs, 4 as const);

  assertType<TypeEq<typeof result, readonly [1, 2, 3, 4]>>();

  test('case 1', () => {
    expect(result).toStrictEqual([1, 2, 3, 4]);
  });
});

describe('IList.unshift', () => {
  const xs = [1, 2, 3] as const;
  const result = IList.unshift(xs, 4 as const);

  assertType<TypeEq<typeof result, readonly [4, 1, 2, 3]>>();

  test('case 1', () => {
    expect(result).toStrictEqual([4, 1, 2, 3]);
  });
});

describe('IList.concat', () => {
  const xs = [1, 2, 3] as const;
  const ys = [4, 5] as const;
  const result = IList.concat(xs, ys);

  assertType<TypeEq<typeof result, readonly [1, 2, 3, 4, 5]>>();

  test('case 1', () => {
    expect(result).toStrictEqual([1, 2, 3, 4, 5]);
  });

  // testArrayEquality({
  //   testName: 'concat 2 arrays',
  //   target: concat([1, 2, 3], [4, 5, 6]),
  //   toBe: [1, 2, 3, 4, 5, 6],
  // });

  // testArrayEquality({
  //   testName: 'concat 2 arrays',
  //   target: concat([1, 2, 3], []),
  //   toBe: [1, 2, 3],
  // });

  // testArrayEquality({
  //   testName: 'concat 2 arrays',
  //   target: concat([], [4, 5, 6]),
  //   toBe: [4, 5, 6],
  // });

  // testArrayEquality({
  //   testName: 'concat 2 arrays',
  //   target: concat([], []),
  //   toBe: [],
  // });

  // testArrayEquality({
  //   testName: 'concat 2 arrays',
  //   target: concat(['1', '2', '3'], [4, 5, 6]),
  //   toBe: ['1', '2', '3', 4, 5, 6],
  // });
});

describe('IList.partition', () => {
  const xs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

  {
    const result = IList.partition(xs, 4);

    assertType<
      TypeEq<
        typeof result,
        readonly Readonly<
          ArrayOfLength<4, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
        >[]
      >
    >();

    test('case 1', () => {
      expect(result).toStrictEqual([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
      ]);
    });
  }

  {
    const result = IList.partition(xs, 3);

    assertType<
      TypeEq<
        typeof result,
        readonly Readonly<
          ArrayOfLength<3, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
        >[]
      >
    >();

    test('case 2', () => {
      expect(result).toStrictEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10, 11, 12],
      ]);
    });
  }
});

describe('IList.reverse', () => {
  {
    const xs = [1, 2, 3] as const;
    const result = IList.reverse(xs);

    assertType<TypeEq<typeof result, readonly [3, 2, 1]>>();

    test('case 1', () => {
      expect(result).toStrictEqual([3, 2, 1]);
    });
  }
  {
    const xs: readonly number[] = [4, 5, 6];
    const result = IList.reverse(xs);

    assertType<TypeEq<typeof result, readonly number[]>>();

    test('case 2', () => {
      expect(result).toStrictEqual([6, 5, 4]);
    });
  }
});

describe('IList.sort', () => {
  {
    const xs = [2, 1, 3] as const;
    const result = IList.sort(xs);

    assertType<TypeEq<typeof result, ReadonlyArrayOfLength<3, 1 | 2 | 3>>>();

    test('case 1', () => {
      expect(result).toStrictEqual([1, 2, 3]);
    });
  }
  {
    const xs = [2, 1, 3] as const;
    const result = IList.sort(xs, (a, b) => a - b);

    assertType<TypeEq<typeof result, ReadonlyArrayOfLength<3, 1 | 2 | 3>>>();

    test('case 2', () => {
      expect(result).toStrictEqual([1, 2, 3]);
    });
  }
  {
    const xs = [2, 1, 3] as const;
    const result = IList.sort(xs, (a, b) => b - a);

    assertType<TypeEq<typeof result, ReadonlyArrayOfLength<3, 1 | 2 | 3>>>();

    test('case 3', () => {
      expect(result).toStrictEqual([3, 2, 1]);
    });
  }
});

describe('IList.sortBy', () => {
  {
    const xs = [{ v: 2 }, { v: 1 }, { v: 3 }] as const;
    const sorted = IList.sortBy(xs, (x) => x.v);

    assertType<
      TypeEq<
        typeof sorted,
        ReadonlyArrayOfLength<
          3,
          { readonly v: 1 } | { readonly v: 2 } | { readonly v: 3 }
        >
      >
    >();

    test('case 1', () => {
      expect(sorted).toStrictEqual([{ v: 1 }, { v: 2 }, { v: 3 }]);
    });
  }
  {
    const xs = [{ v: 2 }, { v: 1 }, { v: 3 }] as const;
    const sorted = IList.sortBy(
      xs,
      (x) => x.v,
      (a, b) => a - b
    );

    assertType<
      TypeEq<
        typeof sorted,
        ReadonlyArrayOfLength<
          3,
          { readonly v: 1 } | { readonly v: 2 } | { readonly v: 3 }
        >
      >
    >();

    test('case 2', () => {
      expect(sorted).toStrictEqual([{ v: 1 }, { v: 2 }, { v: 3 }]);
    });
  }
});

describe('IList.includes', () => {
  {
    const xs = [2, 1, 3] as const;
    const result = IList.includes(xs, 2);

    assertType<TypeEq<typeof result, boolean>>();

    test('case 1', () => {
      expect(result).toBe(true);
    });
  }
  {
    const xs: readonly number[] = [2, 1, 3];
    const result = IList.includes(xs, 4);

    assertType<TypeEq<typeof result, boolean>>();

    test('case 2', () => {
      expect(result).toBe(false);
    });
  }
});

describe('IList.find', () => {
  {
    const xs = [{ v: 2 }, { v: 1 }, { v: 3 }] as const;
    const result = IList.find(xs, (x) => x.v === 1);

    assertType<
      TypeEq<
        typeof result,
        { readonly v: 1 } | { readonly v: 2 } | { readonly v: 3 } | undefined
      >
    >();

    test('case 1', () => {
      expect(result).toStrictEqual({ v: 1 });
    });
  }
  {
    const xs: readonly { readonly v: 1 | 2 | 3 }[] = [
      { v: 2 },
      { v: 1 },
      { v: 3 },
    ] as const;
    const result = IList.find(xs, (x) => x.v === 1);

    assertType<TypeEq<typeof result, { readonly v: 1 | 2 | 3 } | undefined>>();

    test('case 2', () => {
      expect(result).toStrictEqual({ v: 1 });
    });
  }
});

describe('IList.min', () => {
  {
    const xs = [3, 5, 4] as const;
    const result = IList.min(xs);

    assertType<TypeEq<typeof result, 3 | 4 | 5>>();

    test('case 1', () => {
      expect(result).toBe(3);
    });
  }
  {
    const xs = [3, 5, 4] as const;
    const result = IList.min(xs, (a, b) => a - b);

    assertType<TypeEq<typeof result, 3 | 4 | 5>>();

    test('case 2', () => {
      expect(result).toBe(3);
    });
  }
  {
    const xs: readonly (3 | 4 | 5)[] = [3, 5, 4] as const;
    const result = IList.min(xs, (a, b) => a - b);

    assertType<TypeEq<typeof result, 3 | 4 | 5 | undefined>>();

    test('case 3', () => {
      expect(result).toBe(3);
    });
  }
});

describe('IList.max', () => {
  const xs = [3, 5, 4] as const;
  const result = IList.max(xs, (a, b) => a - b);

  assertType<TypeEq<typeof result, 3 | 4 | 5>>();

  test('case 1', () => {
    expect(result).toBe(5);
  });
});

describe('IList.minBy', () => {
  const xs = [
    { x: 5, y: 1 },
    { x: 4, y: 1 },
    { x: 6, y: 1 },
    { x: 3, y: 2 },
    { x: 1, y: 2 },
    { x: 2, y: 3 },
  ] as const;

  const result = IList.minBy(xs, (a) => a.x);

  assertType<
    TypeEq<
      typeof result,
      | { readonly x: 1; readonly y: 2 }
      | { readonly x: 2; readonly y: 3 }
      | { readonly x: 3; readonly y: 2 }
      | { readonly x: 4; readonly y: 1 }
      | { readonly x: 5; readonly y: 1 }
      | { readonly x: 6; readonly y: 1 }
    >
  >();

  test('case 1', () => {
    expect(result).toStrictEqual({ x: 1, y: 2 });
  });
});

describe('IList.maxBy', () => {
  const xs = [
    { x: 5, y: 1 },
    { x: 4, y: 1 },
    { x: 6, y: 1 },
    { x: 3, y: 2 },
    { x: 1, y: 2 },
    { x: 2, y: 3 },
  ] as const;

  const result = IList.maxBy(xs, (a) => a.x);

  assertType<
    TypeEq<
      typeof result,
      | { readonly x: 1; readonly y: 2 }
      | { readonly x: 2; readonly y: 3 }
      | { readonly x: 3; readonly y: 2 }
      | { readonly x: 4; readonly y: 1 }
      | { readonly x: 5; readonly y: 1 }
      | { readonly x: 6; readonly y: 1 }
    >
  >();

  test('case 1', () => {
    expect(result).toStrictEqual({ x: 6, y: 1 });
  });
});

describe('IList.count', () => {
  const xs = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 3 },
  ] as const;

  const result = IList.count(xs, (a) => a.x === 2);

  assertType<TypeEq<typeof result, number>>();

  test('case 1', () => {
    expect(result).toBe(2);
  });
});

describe('IList.countBy', () => {
  const xs = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 3 },
  ] as const;

  const result = IList.countBy(xs, (a) => a.x);

  assertType<TypeEq<typeof result, IMap<1 | 2 | 3, number>>>();

  test('case 1', () => {
    expect(result).toStrictEqual(
      IMap.new<1 | 2 | 3, number>([
        [1, 3],
        [2, 2],
        [3, 1],
      ])
    );
  });
});

describe('IList.groupBy', () => {
  const xs = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 3 },
  ] as const;

  const result = IList.groupBy(xs, (a) => a.x);

  assertType<
    TypeEq<
      typeof result,
      IMap<
        1 | 2 | 3,
        readonly (
          | { readonly x: 1; readonly y: 1 }
          | { readonly x: 1; readonly y: 2 }
          | { readonly x: 1; readonly y: 3 }
          | { readonly x: 2; readonly y: 1 }
          | { readonly x: 2; readonly y: 2 }
          | { readonly x: 3; readonly y: 1 }
        )[]
      >
    >
  >();

  test('case 1', () => {
    expect(result).toStrictEqual(
      IMap.new<
        1 | 2 | 3,
        readonly (
          | { readonly x: 1; readonly y: 1 }
          | { readonly x: 1; readonly y: 2 }
          | { readonly x: 1; readonly y: 3 }
          | { readonly x: 2; readonly y: 1 }
          | { readonly x: 2; readonly y: 2 }
          | { readonly x: 3; readonly y: 1 }
        )[]
      >([
        [
          1,
          [
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 3 },
          ],
        ],
        [
          2,
          [
            { x: 2, y: 1 },
            { x: 2, y: 2 },
          ],
        ],
        [3, [{ x: 3, y: 1 }]],
      ])
    );
  });
});

describe('IList.isSubset', () => {
  {
    const xs = [1, 2, 3] as const;
    const ys = [3, 2] as const;

    const result = IList.isSubset(ys, xs);

    assertType<TypeEq<typeof result, boolean>>();

    test('case 1', () => {
      expect(result).toBe(true);
    });
  }
  {
    const xs = [1, 2, 3] as const;
    const ys = [3, 2, 4] as const;

    const result = IList.isSubset(ys, xs);

    assertType<TypeEq<typeof result, boolean>>();

    test('case 2', () => {
      expect(result).toBe(false);
    });
  }
});

describe('IList.isSuperset', () => {
  {
    const xs = [1, 2, 3] as const;
    const ys = [3, 2] as const;

    const result = IList.isSuperset(ys, xs);

    assertType<TypeEq<typeof result, boolean>>();

    test('case 1', () => {
      expect(result).toBe(false);
    });

    const result2 = IList.isSuperset(xs, ys);

    test('case 2', () => {
      expect(result2).toBe(true);
    });
  }
  {
    const xs = [1, 2, 3] as const;
    const ys = [3, 2, 4] as const;

    const result = IList.isSuperset(ys, xs);

    assertType<TypeEq<typeof result, boolean>>();

    test('case 3', () => {
      expect(result).toBe(false);
    });
  }
});

// testArrayEquality({
//   testName: 'zeros 1',
//   target: zeros(3),
//   toBe: [0, 0, 0],
// });

// testArrayEquality({
//   testName: 'zeros 2',
//   target: zeros(0),
//   toBe: [],
// });

// testArrayEquality({
//   testName: 'zeros 3',
//   target: zeros(1),
//   toBe: [0],
// });

// testArrayEquality({
//   testName: 'seq 1',
//   target: seq(3),
//   toBe: [0, 1, 2],
// });
// testArrayEquality({
//   testName: 'seq 2',
//   target: seq(0),
//   toBe: [],
// });
// testArrayEquality({
//   testName: 'seq 3',
//   target: seq(1),
//   toBe: [0],
// });

// testArrayEquality({
//   testName: 'range(1, 3)',
//   target: range((1), (3)),
//   toBe: [1, 2],
// });

// testArrayEquality({
//   testName: 'range(0, 0)',
//   target: range((0), (0)),
//   toBe: [],
// });

// testArrayEquality({
//   testName: 'range 3',
//   target: range((0), (1)),
//   toBe: [0],
// });

// const array1 = newArray((3), 0);
// assertType<TypeEq<typeof array1, number[]>>();

// const array2 = newArray(3, 0);
// assertType<TypeEq<typeof array2, number[] | undefined>>();

// testArrayEquality({
//   testName: 'newArray 1',
//   target: newArray((3), 0),
//   toBe: [0, 0, 0],
// });

// testArrayEquality({
//   testName: 'newArray 1',
//   target: newArray((3), 1),
//   toBe: [1, 1, 1],
// });

// testArrayEquality({
//   testName: 'newArray 2',
//   target: newArray((0), 0),
//   toBe: [],
// });

// testArrayEquality({
//   testName: 'newArray 3',
//   target: newArray((1), 0),
//   toBe: [0],
// });

// testArrayEquality({
//   testName: 'newArray 4',
//   target: newArray(1.5, 0),
//   toBe: undefined,
// });

// testArrayEquality({
//   testName: 'newArray 4',
//   target: newArray(-1.5, 0),
//   toBe: undefined,
// });

// const target = [0, 1, 2, 3, 4];

// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, (0), (5)),
//   toBe: target,
// }); // 正常
// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, (0), (6)),
//   toBe: target,
// }); // 片方オーバー
// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, (-1), (5)),
//   toBe: target,
// }); // 片方オーバー
// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, (-1), (6)),
//   toBe: target,
// }); // 両方オーバー
// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, (0), (3)),
//   toBe: [0, 1, 2],
// }); // 正常
// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, (-1), (3)),
//   toBe: [0, 1, 2],
// }); // 片方オーバー
// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, (3), (5)),
//   toBe: [3, 4],
// }); // 正常
// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, (3), (6)),
//   toBe: [3, 4],
// }); // 片方オーバー
// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, (4), (3)),
//   toBe: [],
// }); // start > end
// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, (0), (-1)),
//   toBe: [],
// }); // start > end
// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, (-1), (-2)),
//   toBe: [],
// }); // start > end

// testArrayEquality({
//   testName: 'take',
//   target: take([1, 2, 3, 4, 5], (3)),
//   toBe: [1, 2, 3],
// });
// testArrayEquality({
//   testName: 'take',
//   target: take([1, 2, 3, 4, 5], (0)),
//   toBe: [],
// });
// testArrayEquality({
//   testName: 'take',
//   target: take([1, 2, 3, 4, 5], (-1)),
//   toBe: [],
// });
// testArrayEquality({
//   testName: 'take',
//   target: take([1, 2, 3, 4, 5], (5)),
//   toBe: [1, 2, 3, 4, 5],
// });
// testArrayEquality({
//   testName: 'take',
//   target: take([1, 2, 3, 4, 5], (6)),
//   toBe: [1, 2, 3, 4, 5],
// });

// testArrayEquality({
//   testName: 'takeLast',
//   target: takeLast([1, 2, 3, 4, 5], (3)),
//   toBe: [3, 4, 5],
// });

// testArrayEquality({
//   testName: 'takeLast',
//   target: takeLast([1, 2, 3, 4, 5], (0)),
//   toBe: [],
// });

// testArrayEquality({
//   testName: 'takeLast',
//   target: takeLast([1, 2, 3, 4, 5], (-1)),
//   toBe: [],
// });

// testArrayEquality({
//   testName: 'takeLast',
//   target: takeLast([1, 2, 3, 4, 5], (5)),
//   toBe: [1, 2, 3, 4, 5],
// });

// testArrayEquality({
//   testName: 'takeLast',
//   target: takeLast([1, 2, 3, 4, 5], (6)),
//   toBe: [1, 2, 3, 4, 5],
// });

// testArrayEquality({
//   testName: 'skipLast',
//   target: skip([1, 2, 3, 4, 5], (3)),
//   toBe: [4, 5],
// });

// testArrayEquality({
//   testName: 'skip',
//   target: skip([1, 2, 3, 4, 5], (0)),
//   toBe: [1, 2, 3, 4, 5],
// });

// testArrayEquality({
//   testName: 'skip',
//   target: skip([1, 2, 3, 4, 5], (-1)),
//   toBe: [1, 2, 3, 4, 5],
// });

// testArrayEquality({
//   testName: 'skip',
//   target: skip([1, 2, 3, 4, 5], (5)),
//   toBe: [],
// });

// testArrayEquality({
//   testName: 'skip',
//   target: skip([1, 2, 3, 4, 5], (6)),
//   toBe: [],
// });

// testArrayEquality({
//   testName: 'skipLast',
//   target: skipLast([1, 2, 3, 4, 5], (3)),
//   toBe: [1, 2],
// });

// testArrayEquality({
//   testName: 'skipLast',
//   target: skipLast([1, 2, 3, 4, 5], (0)),
//   toBe: [1, 2, 3, 4, 5],
// });

// testArrayEquality({
//   testName: 'skipLast',
//   target: skipLast([1, 2, 3, 4, 5], (-1)),
//   toBe: [1, 2, 3, 4, 5],
// });

// testArrayEquality({
//   testName: 'skipLast',
//   target: skipLast([1, 2, 3, 4, 5], (5)),
//   toBe: [],
// });

// testArrayEquality({
//   testName: 'skipLast',
//   target: skipLast([1, 2, 3, 4, 5], (6)),
//   toBe: [],
// });

// testArrayEquality({
//   testName: 'uniq',
//   target: uniq([1, 2, 3, 2, 2, 2, 3, 4, 5, 5, 3, 2, 1, 3, 4, 1, 2]),
//   toBe: [1, 2, 3, 4, 5],
// });

// testArrayEquality({
//   testName: 'uniq',
//   target: uniq([1]),
//   toBe: [1],
// });

// testArrayEquality({
//   testName: 'uniq',
//   target: uniq([]),
//   toBe: [],
// });

// testArrayEquality({
//   testName: 'uniqBy',
//   target: uniqBy([1, 2, 3, 4, 5, 6], (a: number) => a % 3),
//   toBe: [1, 2, 3],
// });

// const cmp = (a: number, b: number): number => a - b;

// testArrayEquality({
//   testName: 'sort',
//   target: sort(cmp)([3, 4, 1, 2]),
//   toBe: [1, 2, 3, 4],
// });

// testArrayEquality({
//   testName: 'sort',
//   target: sort(cmp)([]),
//   toBe: [],
// });

// testArrayEquality({
//   testName: 'sort',
//   target: sort(cmp)([2, 2, 2]),
//   toBe: [2, 2, 2],
// });

// const array: ReadonlyNonEmptyArray<number> = [1, 2, 3] as const;
// const sorted = sort(cmp)(array);
// assertType<TypeEq<typeof sorted, ReadonlyNonEmptyArray<number>>>();

// const array2: ReadonlyNonEmptyArray<1 | 2 | 3> = [1, 2, 3] as const;
// const sorted2 = sort(cmp)(array2);
// assertType<TypeEq<typeof sorted2, ReadonlyNonEmptyArray<1 | 2 | 3>>>();

// const tuple = [1, 2, 3] as const;
// const sorted3 = sort(cmp)(tuple);
// assertType<
//   TypeEq<typeof sorted3, readonly [1 | 2 | 3, 1 | 2 | 3, 1 | 2 | 3]>
// >();

// const add = (x: number, y: number): number => x + y;

// testArrayEquality({
//   testName: 'scan',
//   target: scan(add, 0)([1, 2, 3]),
//   toBe: [0, 1, 3, 6],
// });

// testArrayEquality({
//   testName: 'scan',
//   target: scan(add, 1)([1, 2, 3]),
//   toBe: [1, 2, 4, 7],
// });

// testArrayEquality({
//   testName: 'map',
//   target: map((x: number) => x * x)([1, 2, 3]),
//   toBe: [1, 4, 9],
// });

// const array: ReadonlyNonEmptyArray<number> = [1, 2, 3] as const;
// const mapped = map((x: number) => x * x)(array);
// assertType<TypeEq<typeof mapped, ReadonlyNonEmptyArray<number>>>();

// const array2: ReadonlyNonEmptyArray<number> = [1, 2, 3] as const;
// const mapped2 = map((x: number, i) => x * x * i)(array2);
// assertType<TypeEq<typeof mapped2, ReadonlyNonEmptyArray<number>>>();

// test('sum', () => {
//   expect(sum([1, 2, 3])).toBe(6);
// });

// test('sum', () => {
//   expect(sum([])).toBe(0);
// });

// test('sum', () => {
//   expect(sum([1, 2, 3, 4])).toBe(10);
// });

// const xs = [1, 2, 3] as number[];
// const s = sum(xs);
// assertType<TypeEq<typeof s, number>>();

// const ys = [1, 2, 3] as const;
// const s2 = sum(ys);
// assertType<TypeEq<typeof s2, number>>();
