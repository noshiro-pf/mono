import { assertNotType, assertType } from '../assert-type';
import { IMap } from '../collections';
import { Result } from '../functional';
import { ArrayUtils } from './array-utils';

describe('ArrayUtils.isEmpty', () => {
  const xs = [1, 2, 3] as const;
  const result = ArrayUtils.isEmpty(xs);

  assertType<TypeEq<typeof result, boolean>>();

  test('case 1', () => {
    expect(result).toBe(false);
  });

  test('case 2', () => {
    expect(ArrayUtils.isEmpty([])).toBe(true);
  });
});

describe('ArrayUtils.zeros', () => {
  test('fixed length', () => {
    const result = ArrayUtils.zeros(3);

    assertType<TypeEq<typeof result, Result<readonly [0, 0, 0], string>>>();

    expect(result).toStrictEqual(Result.ok([0, 0, 0]));
  });

  test('fixed length (empty)', () => {
    const result = ArrayUtils.zeros(0);

    assertType<TypeEq<typeof result, Result<readonly [], string>>>();

    expect(result).toStrictEqual(Result.ok([]));
  });

  test('unknown length', () => {
    const n: number = (() => 3)();
    const result = ArrayUtils.zeros(n);

    assertType<TypeEq<typeof result, Result<readonly 0[], string>>>();

    expect(result).toStrictEqual(Result.ok([0, 0, 0]));
  });
});

describe('ArrayUtils.seq', () => {
  test('fixed length', () => {
    const result = ArrayUtils.seq(10);

    assertType<
      TypeEq<
        typeof result,
        Result<readonly [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], string>
      >
    >();

    expect(result).toStrictEqual(Result.ok([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
  });

  test('fixed length (empty)', () => {
    const result = ArrayUtils.seq(0);

    assertType<TypeEq<typeof result, Result<readonly [], string>>>();

    expect(result).toStrictEqual(Result.ok([]));
  });

  test('unknown length', () => {
    const n: number = (() => 3)();
    const result = ArrayUtils.seq(n);

    assertType<TypeEq<typeof result, Result<readonly number[], string>>>();

    expect(result).toStrictEqual(Result.ok([0, 1, 2]));
  });
});

describe('ArrayUtils.isNonEmpty', () => {
  const xs = [1, 2, 3] as const;
  const result = ArrayUtils.isNonEmpty(xs);

  assertType<TypeEq<typeof result, boolean>>();

  test('case 1', () => {
    expect(result).toBe(true);
  });

  test('case 2', () => {
    expect(ArrayUtils.isNonEmpty([])).toBe(false);
  });
});

{
  const list = [0, 1, 2, 3, 4] as const;

  describe.each([
    {
      testName: 'ArrayUtils.slice',
      result: ArrayUtils.slice(list, 0, 5),
      toBe: [0, 1, 2, 3, 4],
    }, // 正常
    {
      testName: 'ArrayUtils.slice',
      result: ArrayUtils.slice(list, 0, 6),
      toBe: [0, 1, 2, 3, 4],
    }, // 片方オーバー
    {
      testName: 'ArrayUtils.slice',
      result: ArrayUtils.slice(list, -1, 5),
      toBe: [0, 1, 2, 3, 4],
    }, // 片方オーバー
    {
      testName: 'ArrayUtils.slice',
      result: ArrayUtils.slice(list, -1, 6),
      toBe: [0, 1, 2, 3, 4],
    }, // 両方オーバー
    {
      testName: 'ArrayUtils.slice',
      result: ArrayUtils.slice(list, 0, 3),
      toBe: [0, 1, 2],
    }, // 正常
    {
      testName: 'ArrayUtils.slice',
      result: ArrayUtils.slice(list, 1, 3),
      toBe: [1, 2],
    }, // 正常
    {
      testName: 'ArrayUtils.slice',
      result: ArrayUtils.slice(list, -1, 3),
      toBe: [0, 1, 2],
    }, // 片方オーバー
    {
      testName: 'ArrayUtils.slice',
      result: ArrayUtils.slice(list, 3, 5),
      toBe: [3, 4],
    }, // 正常
    {
      testName: 'ArrayUtils.slice',
      result: ArrayUtils.slice(list, 3, 6),
      toBe: [3, 4],
    }, // 片方オーバー
    {
      testName: 'ArrayUtils.slice',
      result: ArrayUtils.slice(list, 4, 3),
      toBe: [],
    }, // start > end
    {
      testName: 'ArrayUtils.slice',
      result: ArrayUtils.slice(list, 0, -1),
      toBe: [],
    }, // start > end
    {
      testName: 'ArrayUtils.slice',
      result: ArrayUtils.slice(list, -1, -2),
      toBe: [],
    }, // start > end
    {
      testName: 'ArrayUtils.slice',
      result: ArrayUtils.slice(list, 6, 9),
      toBe: [],
    },
    {
      testName: 'ArrayUtils.slice',
      result: ArrayUtils.slice(list, 6, 3),
      toBe: [],
    },
  ])('ArrayUtils.slice', ({ result, testName, toBe }) => {
    test(testName, () => {
      expect(result).toStrictEqual(toBe);
    });
  });
}

describe('ArrayUtils.head', () => {
  {
    const xs = [1, 2, 3] as const;
    const head = ArrayUtils.head(xs);

    assertType<TypeEq<typeof head, 1>>();

    test('case 1', () => {
      expect(head).toBe(1);
    });
  }
  {
    const xs: MutableNonEmptyArray<number> = [1, 2, 3];
    const head = ArrayUtils.head(xs);

    assertType<TypeEq<typeof head, number>>();

    test('case 2', () => {
      expect(head).toBe(1);
    });
  }
  {
    const mut_xs: number[] = [1, 2, 3];
    const head = ArrayUtils.head(mut_xs);

    assertType<TypeEq<typeof head, number | undefined>>();

    test('case 3', () => {
      expect(head).toBe(1);
    });
  }
  {
    const xs = [] as const;
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    const head = ArrayUtils.head(xs);

    assertType<TypeEq<typeof head, undefined>>();

    test('case 4', () => {
      expect(head).toBeUndefined();
    });
  }
});

describe('ArrayUtils.last', () => {
  {
    const xs = [1, 2, 3] as const;
    const last = ArrayUtils.last(xs);

    assertType<TypeEq<typeof last, 3>>();

    test('case 1', () => {
      expect(last).toBe(3);
    });
  }
  {
    const xs: MutableNonEmptyArray<number> = [1, 2, 3];
    const last = ArrayUtils.last(xs);

    assertType<TypeEq<typeof last, number>>();

    test('case 2', () => {
      expect(last).toBe(3);
    });
  }
  {
    const mut_xs: number[] = [1, 2, 3];
    const last = ArrayUtils.last(mut_xs);

    assertType<TypeEq<typeof last, number | undefined>>();

    test('case 3', () => {
      expect(last).toBe(3);
    });
  }
  {
    const xs = [] as const;
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    const last = ArrayUtils.last(xs);

    assertType<TypeEq<typeof last, undefined>>();

    test('case 4', () => {
      expect(last).toBeUndefined();
    });
  }
});

describe('ArrayUtils.tail', () => {
  const xs = [1, 2, 3] as const;
  const tail = ArrayUtils.tail(xs);

  assertType<TypeEq<typeof tail, readonly [2, 3]>>();

  test('case 1', () => {
    expect(tail).toStrictEqual([2, 3]);
  });

  test('alias 1', () => {
    expect(ArrayUtils.rest).toStrictEqual(ArrayUtils.tail);
  });
  test('alias 2', () => {
    expect(ArrayUtils.shift).toStrictEqual(ArrayUtils.tail);
  });
});

describe('ArrayUtils.butLast', () => {
  {
    const xs = [1, 2, 3] as const;
    const butLast = ArrayUtils.butLast(xs);

    assertType<TypeEq<typeof butLast, readonly [1, 2]>>();

    test('case 1', () => {
      expect(butLast).toStrictEqual([1, 2]);
    });
  }
  {
    const xs: readonly number[] = [1, 2, 3];
    const butLast = ArrayUtils.butLast(xs);

    assertType<TypeEq<typeof butLast, readonly number[]>>();

    test('case 2', () => {
      expect(butLast).toStrictEqual([1, 2]);
    });
  }

  test('alias', () => {
    expect(ArrayUtils.pop).toStrictEqual(ArrayUtils.butLast);
  });
});

describe('ArrayUtils.take', () => {
  {
    const xs = [1, 2, 3] as const;
    const t = ArrayUtils.take(xs, 2);

    assertType<TypeEq<typeof t, readonly [1, 2]>>();

    test('case 1', () => {
      expect(t).toStrictEqual([1, 2]);
    });
  }
  {
    const xs: readonly number[] = [1, 2, 3];
    const t = ArrayUtils.take(xs, 2);

    assertType<TypeEq<typeof t, readonly number[]>>();

    test('case 2', () => {
      expect(t).toStrictEqual([1, 2]);
    });
  }
});

describe('ArrayUtils.takeLast', () => {
  {
    const xs = [1, 2, 3] as const;
    const t = ArrayUtils.takeLast(xs, 2);

    assertType<TypeEq<typeof t, readonly [2, 3]>>();

    test('case 1', () => {
      expect(t).toStrictEqual([2, 3]);
    });
  }
  {
    const xs: readonly number[] = [1, 2, 3];
    const t = ArrayUtils.takeLast(xs, 2);

    assertType<TypeEq<typeof t, readonly number[]>>();

    test('case 2', () => {
      expect(t).toStrictEqual([2, 3]);
    });
  }
});

describe('ArrayUtils.skip', () => {
  {
    const xs = [1, 2, 3] as const;
    const t = ArrayUtils.skip(xs, 2);

    assertType<TypeEq<typeof t, readonly [3]>>();

    test('case 1', () => {
      expect(t).toStrictEqual([3]);
    });
  }
  {
    const xs: readonly number[] = [1, 2, 3];
    const t = ArrayUtils.skip(xs, 2);

    assertType<TypeEq<typeof t, readonly number[]>>();

    test('case 2', () => {
      expect(t).toStrictEqual([3]);
    });
  }
});

describe('ArrayUtils.skipLast', () => {
  {
    const xs = [1, 2, 3] as const;
    const t = ArrayUtils.skipLast(xs, 2);

    assertType<TypeEq<typeof t, readonly [1]>>();

    test('case 1', () => {
      expect(t).toStrictEqual([1]);
    });
  }
  {
    const xs: readonly number[] = [1, 2, 3];
    const t = ArrayUtils.skipLast(xs, 2);

    assertType<TypeEq<typeof t, readonly number[]>>();

    test('case 2', () => {
      expect(t).toStrictEqual([1]);
    });
  }
});

describe('ArrayUtils.every', () => {
  const xs = [1, 2, 3] as const;

  if (ArrayUtils.every(xs, (x): x is 1 => x === 1)) {
    assertType<TypeEq<typeof xs, readonly [1, 2, 3] & readonly 1[]>>();
  } else {
    assertNotType<TypeEq<typeof xs, readonly [1, 2, 3] & readonly 1[]>>();
  }

  test('case 1', () => {
    expect(ArrayUtils.every(xs, (x): x is 1 => x === 1)).toBe(false);
  });

  test('case 2', () => {
    expect(ArrayUtils.every(xs, (x) => 1 <= x && x <= 3)).toBe(true);
  });
});

describe('ArrayUtils.some', () => {
  const xs = [1, 2, 3] as const;

  test('case 1', () => {
    expect(ArrayUtils.some(xs, (x): x is 1 => x === 1)).toBe(true);
  });

  test('case 2', () => {
    expect(ArrayUtils.some(xs, (x) => x <= 1 && 3 <= x)).toBe(false);
  });
});

describe('ArrayUtils.map', () => {
  const xs = [1, 2, 3] as const;
  const mapped = ArrayUtils.map(xs, (x, i): number => x * x * i);

  assertType<TypeEq<typeof mapped, ArrayOfLength<3, number>>>();

  test('case 1', () => {
    expect(mapped).toStrictEqual([0, 4, 18]);
  });
});

describe('ArrayUtils.flat', () => {
  const xs = [1, 2, [3, 4, [5, 6, [7, 8]]]] as const;
  const result = ArrayUtils.flat(xs, 1);

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

describe('ArrayUtils.flatMap', () => {
  const xs = [1, 2, 3] as const;
  const mapped = ArrayUtils.flatMap(xs, (x, i) => [i, x * x]);

  assertType<TypeEq<typeof mapped, readonly number[]>>();

  test('case 1', () => {
    expect(mapped).toStrictEqual([0, 1, 1, 4, 2, 9]);
  });
});

describe('ArrayUtils.zip', () => {
  {
    const xs = [1, 2, 3] as const;
    const ys = [4, 5, 6] as const;
    const zipped = ArrayUtils.zip(xs, ys);

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
    const zipped = ArrayUtils.zip(xs, ys);

    assertType<TypeEq<typeof zipped, readonly (readonly [number, number])[]>>();

    test('case 2', () => {
      expect(zipped).toStrictEqual([[1, 4]]);
    });
  }
  {
    const xs = [1] as const;
    const ys: readonly number[] = [4, 5, 6];
    const zipped = ArrayUtils.zip(xs, ys);

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

describe('ArrayUtils.filter', () => {
  {
    const xs = [1, 2, 3] as const;
    const filtered = ArrayUtils.filter(xs, (x): x is 1 | 3 => x % 2 === 1);

    assertType<TypeEq<typeof filtered, readonly (1 | 3)[]>>();

    test('case 1', () => {
      expect(filtered).toStrictEqual([1, 3]);
    });
  }
  {
    const xs = [1, 2, 3] as const;
    const filtered = ArrayUtils.filter(xs, (x) => x % 2 === 1);

    assertType<TypeEq<typeof filtered, readonly (1 | 2 | 3)[]>>();

    test('case 2', () => {
      expect(filtered).toStrictEqual([1, 3]);
    });
  }
});

describe('ArrayUtils.filterNot', () => {
  const xs = [1, 2, 3] as const;
  const filtered = ArrayUtils.filterNot(xs, (x) => x % 2 === 0);

  assertType<TypeEq<typeof filtered, readonly (1 | 2 | 3)[]>>();

  test('case 1', () => {
    expect(filtered).toStrictEqual([1, 3]);
  });
});

describe('ArrayUtils.set', () => {
  const xs = [1, 2, 3] as const;
  const result = ArrayUtils.set(xs, 1, 4 as const);

  assertType<TypeEq<typeof result, readonly [1 | 4, 2 | 4, 3 | 4]>>();

  test('case 1', () => {
    expect(result).toStrictEqual([1, 4, 3]);
  });
});

describe('ArrayUtils.update', () => {
  const xs = [1, 2, 3] as const;
  const result = ArrayUtils.update(xs, 1, (x) => x + 2);

  assertType<TypeEq<typeof result, readonly [number, number, number]>>();

  test('case 1', () => {
    expect(result).toStrictEqual([1, 4, 3]);
  });
});

describe('ArrayUtils.insert', () => {
  const xs = [1, 2, 3] as const;

  {
    const result = ArrayUtils.insert(xs, 1, 5);

    assertType<TypeEq<typeof result, readonly (1 | 2 | 3 | 5)[]>>();

    test('case 1', () => {
      expect(result).toStrictEqual([1, 5, 2, 3]);
    });
  }
  {
    const result = ArrayUtils.insert(xs, 0, 5);

    assertType<TypeEq<typeof result, readonly (1 | 2 | 3 | 5)[]>>();

    test('case 2 (insert head)', () => {
      expect(result).toStrictEqual([5, 1, 2, 3]);
    });
  }
  {
    const result = ArrayUtils.insert(xs, 3, 5);

    assertType<TypeEq<typeof result, readonly (1 | 2 | 3 | 5)[]>>();

    test('case 3 (insert tail)', () => {
      expect(result).toStrictEqual([1, 2, 3, 5]);
    });
  }
  {
    const result = ArrayUtils.insert(xs, 999, 5);

    assertType<TypeEq<typeof result, readonly (1 | 2 | 3 | 5)[]>>();

    test('case 4 (insert tail)', () => {
      expect(result).toStrictEqual([1, 2, 3, 5]);
    });
  }
});

describe('ArrayUtils.remove', () => {
  const xs = [1, 2, 3] as const;

  {
    const result = ArrayUtils.remove(xs, 1);

    assertType<TypeEq<typeof result, readonly (1 | 2 | 3)[]>>();

    test('case 1', () => {
      expect(result).toStrictEqual([1, 3]);
    });
  }
  {
    const result = ArrayUtils.remove(xs, 0);

    assertType<TypeEq<typeof result, readonly (1 | 2 | 3)[]>>();

    test('case 2 (remove head)', () => {
      expect(result).toStrictEqual([2, 3]);
    });
  }
  {
    const result = ArrayUtils.remove(xs, 2);

    assertType<TypeEq<typeof result, readonly (1 | 2 | 3)[]>>();

    test('case 3 (remove tail)', () => {
      expect(result).toStrictEqual([1, 2]);
    });
  }
  {
    const result = ArrayUtils.remove(xs, 3);

    assertType<TypeEq<typeof result, readonly (1 | 2 | 3)[]>>();

    test('case 3 (noop)', () => {
      expect(result).toStrictEqual([1, 2, 3]);
    });
  }
  {
    const result = ArrayUtils.remove(xs, 5);

    assertType<TypeEq<typeof result, readonly (1 | 2 | 3)[]>>();

    test('case 4 (noop)', () => {
      expect(result).toStrictEqual([1, 2, 3]);
    });
  }
});

describe('ArrayUtils.push', () => {
  const xs = [1, 2, 3] as const;
  const result = ArrayUtils.push(xs, 4 as const);

  assertType<TypeEq<typeof result, readonly [1, 2, 3, 4]>>();

  test('case 1', () => {
    expect(result).toStrictEqual([1, 2, 3, 4]);
  });
});

describe('ArrayUtils.unshift', () => {
  const xs = [1, 2, 3] as const;
  const result = ArrayUtils.unshift(xs, 4 as const);

  assertType<TypeEq<typeof result, readonly [4, 1, 2, 3]>>();

  test('case 1', () => {
    expect(result).toStrictEqual([4, 1, 2, 3]);
  });
});

describe('ArrayUtils.concat', () => {
  const xs = [1, 2, 3] as const;
  const ys = [4, 5] as const;
  const result = ArrayUtils.concat(xs, ys);

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

describe('ArrayUtils.partition', () => {
  const xs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

  {
    const result = ArrayUtils.partition(xs, 4);

    assertType<
      TypeEq<
        typeof result,
        readonly ArrayOfLength<
          4,
          1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
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
    const result = ArrayUtils.partition(xs, 3);

    assertType<
      TypeEq<
        typeof result,
        readonly ArrayOfLength<
          3,
          1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
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

describe('ArrayUtils.reverse', () => {
  {
    const xs = [1, 2, 3] as const;
    const result = ArrayUtils.reverse(xs);

    assertType<TypeEq<typeof result, readonly [3, 2, 1]>>();

    test('case 1', () => {
      expect(result).toStrictEqual([3, 2, 1]);
    });
  }
  {
    const xs: readonly number[] = [4, 5, 6];
    const result = ArrayUtils.reverse(xs);

    assertType<TypeEq<typeof result, readonly number[]>>();

    test('case 2', () => {
      expect(result).toStrictEqual([6, 5, 4]);
    });
  }
});

describe('ArrayUtils.sort', () => {
  {
    const xs = [2, 1, 3] as const;
    const result = ArrayUtils.sort(xs);

    assertType<TypeEq<typeof result, ArrayOfLength<3, 1 | 2 | 3>>>();

    test('case 1', () => {
      expect(result).toStrictEqual([1, 2, 3]);
    });
  }
  {
    const xs = [2, 1, 3] as const;
    const result = ArrayUtils.sort(xs, (a, b) => a - b);

    assertType<TypeEq<typeof result, ArrayOfLength<3, 1 | 2 | 3>>>();

    test('case 2', () => {
      expect(result).toStrictEqual([1, 2, 3]);
    });
  }
  {
    const xs = [2, 1, 3] as const;
    const result = ArrayUtils.sort(xs, (a, b) => b - a);

    assertType<TypeEq<typeof result, ArrayOfLength<3, 1 | 2 | 3>>>();

    test('case 3', () => {
      expect(result).toStrictEqual([3, 2, 1]);
    });
  }
});

describe('ArrayUtils.sortBy', () => {
  {
    const xs = [{ v: 2 }, { v: 1 }, { v: 3 }] as const;
    const sorted = ArrayUtils.sortBy(xs, (x) => x.v);

    assertType<
      TypeEq<
        typeof sorted,
        ArrayOfLength<
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
    const sorted = ArrayUtils.sortBy(
      xs,
      (x) => x.v,
      (a, b) => a - b
    );

    assertType<
      TypeEq<
        typeof sorted,
        ArrayOfLength<
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

describe('ArrayUtils.includes', () => {
  {
    const xs = [2, 1, 3] as const;
    const result = ArrayUtils.includes(xs, 2);

    assertType<TypeEq<typeof result, boolean>>();

    test('case 1', () => {
      expect(result).toBe(true);
    });
  }
  {
    const xs: readonly number[] = [2, 1, 3];
    const result = ArrayUtils.includes(xs, 4);

    assertType<TypeEq<typeof result, boolean>>();

    test('case 2', () => {
      expect(result).toBe(false);
    });
  }
});

describe('ArrayUtils.find', () => {
  {
    const xs = [{ v: 2 }, { v: 1 }, { v: 3 }] as const;
    const result = ArrayUtils.find(xs, (x) => x.v === 1);

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
    const result = ArrayUtils.find(xs, (x) => x.v === 1);

    assertType<TypeEq<typeof result, { readonly v: 1 | 2 | 3 } | undefined>>();

    test('case 2', () => {
      expect(result).toStrictEqual({ v: 1 });
    });
  }
});

describe('ArrayUtils.min', () => {
  {
    const xs = [3, 5, 4] as const;
    const result = ArrayUtils.min(xs);

    assertType<TypeEq<typeof result, 3 | 4 | 5>>();

    test('case 1', () => {
      expect(result).toBe(3);
    });
  }
  {
    const xs = [3, 5, 4] as const;
    const result = ArrayUtils.min(xs, (a, b) => a - b);

    assertType<TypeEq<typeof result, 3 | 4 | 5>>();

    test('case 2', () => {
      expect(result).toBe(3);
    });
  }
  {
    const xs: readonly (3 | 4 | 5)[] = [3, 5, 4] as const;
    const result = ArrayUtils.min(xs, (a, b) => a - b);

    assertType<TypeEq<typeof result, 3 | 4 | 5 | undefined>>();

    test('case 3', () => {
      expect(result).toBe(3);
    });
  }
});

describe('ArrayUtils.max', () => {
  const xs = [3, 5, 4] as const;
  const result = ArrayUtils.max(xs, (a, b) => a - b);

  assertType<TypeEq<typeof result, 3 | 4 | 5>>();

  test('case 1', () => {
    expect(result).toBe(5);
  });
});

describe('ArrayUtils.minBy', () => {
  const xs = [
    { x: 5, y: 1 },
    { x: 4, y: 1 },
    { x: 6, y: 1 },
    { x: 3, y: 2 },
    { x: 1, y: 2 },
    { x: 2, y: 3 },
  ] as const;

  const result = ArrayUtils.minBy(xs, (a) => a.x);

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

describe('ArrayUtils.maxBy', () => {
  const xs = [
    { x: 5, y: 1 },
    { x: 4, y: 1 },
    { x: 6, y: 1 },
    { x: 3, y: 2 },
    { x: 1, y: 2 },
    { x: 2, y: 3 },
  ] as const;

  const result = ArrayUtils.maxBy(xs, (a) => a.x);

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

describe('ArrayUtils.count', () => {
  const xs = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 3 },
  ] as const;

  const result = ArrayUtils.count(xs, (a) => a.x === 2);

  assertType<TypeEq<typeof result, number>>();

  test('case 1', () => {
    expect(result).toBe(2);
  });
});

describe('ArrayUtils.countBy', () => {
  const xs = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 3 },
  ] as const;

  const result = ArrayUtils.countBy(xs, (a) => a.x);

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

describe('ArrayUtils.groupBy', () => {
  const xs = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 3 },
  ] as const;

  const result = ArrayUtils.groupBy(xs, (a) => a.x);

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

describe('ArrayUtils.isSubset', () => {
  {
    const xs = [1, 2, 3] as const;
    const ys = [3, 2] as const;

    const result = ArrayUtils.isSubset(ys, xs);

    assertType<TypeEq<typeof result, boolean>>();

    test('case 1', () => {
      expect(result).toBe(true);
    });
  }
  {
    const xs = [1, 2, 3] as const;
    const ys = [3, 2, 4] as const;

    const result = ArrayUtils.isSubset(ys, xs);

    assertType<TypeEq<typeof result, boolean>>();

    test('case 2', () => {
      expect(result).toBe(false);
    });
  }
});

describe('ArrayUtils.isSuperset', () => {
  {
    const xs = [1, 2, 3] as const;
    const ys = [3, 2] as const;

    const result = ArrayUtils.isSuperset(ys, xs);

    assertType<TypeEq<typeof result, boolean>>();

    test('case 1', () => {
      expect(result).toBe(false);
    });

    const result2 = ArrayUtils.isSuperset(xs, ys);

    test('case 2', () => {
      expect(result2).toBe(true);
    });
  }
  {
    const xs = [1, 2, 3] as const;
    const ys = [3, 2, 4] as const;

    const result = ArrayUtils.isSuperset(ys, xs);

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

// const array: NonEmptyArray<number> = [1, 2, 3] as const;
// const sorted = sort(cmp)(array);
// assertType<TypeEq<typeof sorted, NonEmptyArray<number>>>();

// const array2: NonEmptyArray<1 | 2 | 3> = [1, 2, 3] as const;
// const sorted2 = sort(cmp)(array2);
// assertType<TypeEq<typeof sorted2, NonEmptyArray<1 | 2 | 3>>>();

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

// const array: NonEmptyArray<number> = [1, 2, 3] as const;
// const mapped = map((x: number) => x * x)(array);
// assertType<TypeEq<typeof mapped, NonEmptyArray<number>>>();

// const array2: NonEmptyArray<number> = [1, 2, 3] as const;
// const mapped2 = map((x: number, i) => x * x * i)(array2);
// assertType<TypeEq<typeof mapped2, NonEmptyArray<number>>>();

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
