import { IMap } from '../collections/index.mjs';
import { expectType } from '../expect-type.mjs';
import { toSafeUint } from '../num/index.mjs';
import { Arr } from './array-utils.mjs';

describe('ArrayUtils.isEmpty', () => {
  const xs = [1, 2, 3] as const;
  const result = Arr.isEmpty(xs);

  expectType<typeof result, boolean>('=');

  test('case 1', () => {
    expect(result).toBe(false);
  });

  test('case 2', () => {
    expect(Arr.isEmpty([])).toBe(true);
  });
});

describe('ArrayUtils.isNonEmpty', () => {
  const xs = [1, 2, 3] as const;
  const result = Arr.isNonEmpty(xs);

  expectType<typeof result, boolean>('=');

  test('case 1', () => {
    expect(result).toBe(true);
  });

  test('case 2', () => {
    expect(Arr.isNonEmpty([])).toBe(false);
  });
});

describe('ArrayUtils.zeros', () => {
  test('fixed length', () => {
    const result = Arr.zeros(3);

    expectType<typeof result, readonly [0, 0, 0]>('=');

    expect(result).toStrictEqual([0, 0, 0]);
  });

  test('fixed length (empty)', () => {
    const result = Arr.zeros(0);

    expectType<typeof result, readonly []>('=');

    expect(result).toStrictEqual([]);
  });

  test('unknown length', () => {
    const n: SafeUint = toSafeUint(3);
    const result = Arr.zeros(n);

    expectType<typeof result, readonly 0[]>('=');

    expect(result).toStrictEqual([0, 0, 0]);
  });
});

describe('ArrayUtils.seq', () => {
  test('fixed length', () => {
    const result = Arr.seq(10);

    expectType<typeof result, readonly [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]>('=');

    expect(result).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  test('fixed length (empty)', () => {
    const result = Arr.seq(0);

    expectType<typeof result, readonly []>('=');

    expect(result).toStrictEqual([]);
  });

  test('unknown length', () => {
    const n: SafeUint = toSafeUint(3);
    const result = Arr.seq(n);

    expectType<typeof result, readonly SafeUint[]>('=');

    expect(result).toStrictEqual([0, 1, 2]);
  });
});

{
  const list = [0, 1, 2, 3, 4] as const;

  describe.each([
    {
      testName: 'ArrayUtils.slice',
      result: Arr.sliceClamped(list, 0, 5),
      toBe: [0, 1, 2, 3, 4],
    }, // 正常
    {
      testName: 'ArrayUtils.slice',
      result: Arr.sliceClamped(list, 0, 6),
      toBe: [0, 1, 2, 3, 4],
    }, // 片方オーバー
    {
      testName: 'ArrayUtils.slice',
      result: Arr.sliceClamped(list, -1, 5),
      toBe: [0, 1, 2, 3, 4],
    }, // 片方オーバー
    {
      testName: 'ArrayUtils.slice',
      result: Arr.sliceClamped(list, -1, 6),
      toBe: [0, 1, 2, 3, 4],
    }, // 両方オーバー
    {
      testName: 'ArrayUtils.slice',
      result: Arr.sliceClamped(list, 0, 3),
      toBe: [0, 1, 2],
    }, // 正常
    {
      testName: 'ArrayUtils.slice',
      result: Arr.sliceClamped(list, 1, 3),
      toBe: [1, 2],
    }, // 正常
    {
      testName: 'ArrayUtils.slice',
      result: Arr.sliceClamped(list, -1, 3),
      toBe: [0, 1, 2],
    }, // 片方オーバー
    {
      testName: 'ArrayUtils.slice',
      result: Arr.sliceClamped(list, 3, 5),
      toBe: [3, 4],
    }, // 正常
    {
      testName: 'ArrayUtils.slice',
      result: Arr.sliceClamped(list, 3, 6),
      toBe: [3, 4],
    }, // 片方オーバー
    {
      testName: 'ArrayUtils.slice',
      result: Arr.sliceClamped(list, 4, 3),
      toBe: [],
    }, // start > end
    {
      testName: 'ArrayUtils.slice',
      result: Arr.sliceClamped(list, 0, -1),
      toBe: [],
    }, // start > end
    {
      testName: 'ArrayUtils.slice',
      result: Arr.sliceClamped(list, -1, -2),
      toBe: [],
    }, // start > end
    {
      testName: 'ArrayUtils.slice',
      result: Arr.sliceClamped(list, 6, 9),
      toBe: [],
    },
    {
      testName: 'ArrayUtils.slice',
      result: Arr.sliceClamped(list, 6, 3),
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

describe('ArrayUtils.last', () => {
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

describe('ArrayUtils.tail', () => {
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

describe('ArrayUtils.butLast', () => {
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

describe('ArrayUtils.take', () => {
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

describe('ArrayUtils.takeLast', () => {
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

describe('ArrayUtils.skip', () => {
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

describe('ArrayUtils.skipLast', () => {
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

describe('ArrayUtils.flatMap', () => {
  const xs = [1, 2, 3] as const;
  const mapped = Arr.flatMap(xs, (x, i) => [i, x * x]);

  expectType<typeof mapped, readonly number[]>('=');

  test('case 1', () => {
    expect(mapped).toStrictEqual([0, 1, 1, 4, 2, 9]);
  });
});

describe('ArrayUtils.zip', () => {
  {
    const xs = [1, 2, 3] as const;
    const ys = [4, 5, 6] as const;
    const zipped = Arr.zip(xs, ys);

    expectType<
      typeof zipped,
      readonly [readonly [1, 4], readonly [2, 5], readonly [3, 6]]
    >('=');

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
    const zipped = Arr.zip(xs, ys);

    expectType<typeof zipped, readonly (readonly [number, number])[]>('=');

    test('case 2', () => {
      expect(zipped).toStrictEqual([[1, 4]]);
    });
  }
  {
    const xs = [1] as const;
    const ys: readonly number[] = [4, 5, 6];
    const zipped = Arr.zip(xs, ys);

    expectType<typeof zipped, readonly [readonly [1, number | undefined]]>('=');

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

describe('ArrayUtils.filterNot', () => {
  const xs = [1, 2, 3] as const;
  const filtered = Arr.filterNot(xs, (x) => x % 2 === 0);

  expectType<typeof filtered, readonly (1 | 2 | 3)[]>('=');

  test('case 1', () => {
    expect(filtered).toStrictEqual([1, 3]);
  });
});

describe('ArrayUtils.set', () => {
  const xs = [1, 2, 3] as const;
  const result = Arr.set(xs, 1, 4 as const);

  expectType<typeof result, readonly (1 | 2 | 3 | 4)[]>('=');

  test('case 1', () => {
    expect(result).toStrictEqual([1, 4, 3]);
  });
});

describe('ArrayUtils.update', () => {
  const xs = [1, 2, 3] as const;
  const result = Arr.update(xs, 1, (x) => x + 2);

  expectType<typeof result, readonly number[]>('=');

  test('case 1', () => {
    expect(result).toStrictEqual([1, 4, 3]);
  });
});

describe('ArrayUtils.insert', () => {
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
    const result = Arr.inserted(xs, toSafeUint(999), 5);

    expectType<typeof result, readonly (1 | 2 | 3 | 5)[]>('=');

    test('case 4 (insert tail)', () => {
      expect(result).toStrictEqual([1, 2, 3, 5]);
    });
  }
});

describe('ArrayUtils.remove', () => {
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

describe('ArrayUtils.push', () => {
  const xs = [1, 2, 3] as const;
  const result = Arr.pushed(xs, 4 as const);

  expectType<typeof result, readonly [1, 2, 3, 4]>('=');

  test('case 1', () => {
    expect(result).toStrictEqual([1, 2, 3, 4]);
  });
});

describe('ArrayUtils.unshift', () => {
  const xs = [1, 2, 3] as const;
  const result = Arr.unshifted(xs, 4 as const);

  expectType<typeof result, readonly [4, 1, 2, 3]>('=');

  test('case 1', () => {
    expect(result).toStrictEqual([4, 1, 2, 3]);
  });
});

describe('ArrayUtils.concat', () => {
  const xs = [1, 2, 3] as const;
  const ys = [4, 5] as const;
  const result = Arr.concat(xs, ys);

  expectType<typeof result, readonly [1, 2, 3, 4, 5]>('=');

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
    const result = Arr.partition(xs, 4);

    expectType<
      typeof result,
      readonly ArrayOfLength<
        4,
        1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
      >[]
    >('=');

    test('case 1', () => {
      expect(result).toStrictEqual([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
      ]);
    });
  }

  {
    const result = Arr.partition(xs, 3);

    expectType<
      typeof result,
      readonly ArrayOfLength<
        3,
        1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
      >[]
    >('=');

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

describe('ArrayUtils.reversed', () => {
  {
    const xs = [1, 2, 3] as const;
    const result = Arr.reversed(xs);

    expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

    test('case 1', () => {
      expect(result).toStrictEqual([3, 2, 1]);
    });
  }
});

describe('ArrayUtils.sorted', () => {
  {
    const xs = [2, 1, 3] as const;
    const result = Arr.sorted(xs);

    expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

    test('case 1', () => {
      expect(result).toStrictEqual([1, 2, 3]);
    });
  }
  {
    const xs = [2, 1, 3] as const;
    const result = Arr.sorted(xs, (a, b) => a - b);

    expectType<typeof result, readonly (1 | 2 | 3)[]>('=');

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

describe('ArrayUtils.sortedBy', () => {
  {
    const xs = [{ v: 2 }, { v: 1 }, { v: 3 }] as const;
    const sorted = Arr.sortedBy(xs, (x) => x.v);

    expectType<
      typeof sorted,
      readonly (Readonly<{ v: 1 }> | Readonly<{ v: 2 }> | Readonly<{ v: 3 }>)[]
    >('=');

    test('case 1', () => {
      expect(sorted).toStrictEqual([{ v: 1 }, { v: 2 }, { v: 3 }]);
    });
  }
  {
    const xs = [{ v: 2 }, { v: 1 }, { v: 3 }] as const;
    const sorted = Arr.sortedBy(
      xs,
      (x) => x.v,
      (a, b) => a - b,
    );

    expectType<
      typeof sorted,
      readonly (Readonly<{ v: 1 }> | Readonly<{ v: 2 }> | Readonly<{ v: 3 }>)[]
    >('=');

    test('case 2', () => {
      expect(sorted).toStrictEqual([{ v: 1 }, { v: 2 }, { v: 3 }]);
    });
  }
});

describe('ArrayUtils.min', () => {
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

describe('ArrayUtils.max', () => {
  const xs = [3, 5, 4] as const;
  const result = Arr.max(xs, (a, b) => a - b);

  expectType<typeof result, 3 | 4 | 5>('=');

  test('case 1', () => {
    expect(result).toBe(5);
  });
});

describe('ArrayUtils.minBy', () => {
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

describe('ArrayUtils.maxBy', () => {
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

describe('ArrayUtils.count', () => {
  const xs = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 3 },
  ] as const;

  const result = Arr.count(xs, (a) => a.x === 2);

  expectType<typeof result, SafeUint>('=');

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

  const result = Arr.countBy(xs, (a) => a.x);

  expectType<typeof result, IMap<1 | 2 | 3, SafeUint>>('=');

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

describe('ArrayUtils.groupBy', () => {
  const xs = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 3 },
  ] as const;

  const result = Arr.groupBy(xs, (a) => a.x);

  expectType<
    typeof result,
    IMap<
      1 | 2 | 3,
      readonly (
        | Readonly<{ x: 1; y: 1 }>
        | Readonly<{ x: 1; y: 2 }>
        | Readonly<{ x: 1; y: 3 }>
        | Readonly<{ x: 2; y: 1 }>
        | Readonly<{ x: 2; y: 2 }>
        | Readonly<{ x: 3; y: 1 }>
      )[]
    >
  >('=');

  test('case 1', () => {
    expect(result).toStrictEqual(
      IMap.new<
        1 | 2 | 3,
        readonly (
          | Readonly<{ x: 1; y: 1 }>
          | Readonly<{ x: 1; y: 2 }>
          | Readonly<{ x: 1; y: 3 }>
          | Readonly<{ x: 2; y: 1 }>
          | Readonly<{ x: 2; y: 2 }>
          | Readonly<{ x: 3; y: 1 }>
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
      ]),
    );
  });
});

describe('ArrayUtils.isSubset', () => {
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

describe('ArrayUtils.isSuperset', () => {
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

describe('ArrayUtils.copy', () => {
  const xs = [1, 2, 3] as const;
  const result = Arr.copy(xs);

  expectType<typeof result, readonly [1, 2, 3]>('=');

  test('case 1', () => {
    expect(result).toStrictEqual([1, 2, 3]);
  });
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

describe('ArrayUtils.range', () => {
  test('range(1, 3)', () => {
    const result = Arr.range(1, 3);

    expectType<typeof result, readonly [1, 2]>('=');

    expect(result).toStrictEqual([1, 2]);
  });

  test('range(1, 3, 1)', () => {
    const result = Arr.range(1, 3, 1);

    expectType<typeof result, readonly [1, 2]>('=');

    expect(result).toStrictEqual([1, 2]);
  });

  test('range(0, 0)', () => {
    const result = Arr.range(0, 0);

    expectType<typeof result, readonly []>('=');

    expect(result).toStrictEqual([]);
  });

  test('range(0, 1)', () => {
    const result = Arr.range(0, 1);

    expectType<typeof result, readonly [0]>('=');

    expect(result).toStrictEqual([0]);
  });

  test('range(0, -1)', () => {
    const result = Arr.range(0, -1);

    expectType<typeof result, readonly SafeInt[]>('=');

    expect(result).toStrictEqual([]);
  });

  test('range(SmallUint, SmallUint)', () => {
    const result = Arr.range<SmallUint, SmallUint>(0, 1);

    expectType<typeof result, readonly Exclude<SmallUint, 511>[]>('=');

    expect(result).toStrictEqual([0]);
  });

  test('range(0 | 1 | 2, 1 | 2 | 3)', () => {
    const result = Arr.range<0 | 1 | 2, 1 | 2 | 3>(0, 1);

    expectType<typeof result, readonly (0 | 1 | 2)[]>('=');

    expect(result).toStrictEqual([0]);
  });

  test('range(2|3, 5|6|7)', () => {
    const result = Arr.range<2 | 3, 5 | 6 | 7>(2, 5);

    expectType<typeof result, readonly (2 | 3 | 4 | 5 | 6)[]>('=');

    expect(result).toStrictEqual([2, 3, 4]);
  });

  test('range(0, 10, 2)', () => {
    const result = Arr.range(0, 10, 2);

    expectType<typeof result, readonly SafeUint[]>('=');

    expect(result).toStrictEqual([0, 2, 4, 6, 8]);
  });

  test('range(0, 11, 2)', () => {
    const result = Arr.range(0, 11, 2);

    expectType<typeof result, readonly SafeUint[]>('=');

    expect(result).toStrictEqual([0, 2, 4, 6, 8, 10]);
  });

  test('range(1, 12, 2)', () => {
    const result = Arr.range(1, 12, 2);

    expectType<typeof result, readonly SafeUint[]>('=');

    expect(result).toStrictEqual([1, 3, 5, 7, 9, 11]);
  });
});

// const array1 = newArray(3, 0);
// expectType<typeof array1, number[]>('=');

// const array2 = newArray(3, 0);
// expectType<typeof array2, number[] | undefined>('=');

// testArrayEquality({
//   testName: 'newArray 1',
//   target: newArray(3, 0),
//   toBe: [0, 0, 0],
// });

// testArrayEquality({
//   testName: 'newArray 1',
//   target: newArray(3, 1),
//   toBe: [1, 1, 1],
// });

// testArrayEquality({
//   testName: 'newArray 2',
//   target: newArray(0, 0),
//   toBe: [],
// });

// testArrayEquality({
//   testName: 'newArray 3',
//   target: newArray(1, 0),
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
//   target: safeSlice(target, 0, 5),
//   toBe: target,
// }); // 正常
// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, 0, 6),
//   toBe: target,
// }); // 片方オーバー
// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, -1, 5),
//   toBe: target,
// }); // 片方オーバー
// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, -1, 6),
//   toBe: target,
// }); // 両方オーバー
// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, 0, 3),
//   toBe: [0, 1, 2],
// }); // 正常
// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, -1, 3),
//   toBe: [0, 1, 2],
// }); // 片方オーバー
// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, 3, 5),
//   toBe: [3, 4],
// }); // 正常
// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, 3, 6),
//   toBe: [3, 4],
// }); // 片方オーバー
// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, 4, 3),
//   toBe: [],
// }); // start > end
// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, 0, -1),
//   toBe: [],
// }); // start > end
// testArrayEquality({
//   testName: 'safeSlice',
//   target: safeSlice(target, -1, -2),
//   toBe: [],
// }); // start > end

// testArrayEquality({
//   testName: 'take',
//   target: take([1, 2, 3, 4, 5], 3),
//   toBe: [1, 2, 3],
// });
// testArrayEquality({
//   testName: 'take',
//   target: take([1, 2, 3, 4, 5], 0),
//   toBe: [],
// });
// testArrayEquality({
//   testName: 'take',
//   target: take([1, 2, 3, 4, 5], -1),
//   toBe: [],
// });
// testArrayEquality({
//   testName: 'take',
//   target: take([1, 2, 3, 4, 5], 5),
//   toBe: [1, 2, 3, 4, 5],
// });
// testArrayEquality({
//   testName: 'take',
//   target: take([1, 2, 3, 4, 5], 6),
//   toBe: [1, 2, 3, 4, 5],
// });

// testArrayEquality({
//   testName: 'takeLast',
//   target: takeLast([1, 2, 3, 4, 5], 3),
//   toBe: [3, 4, 5],
// });

// testArrayEquality({
//   testName: 'takeLast',
//   target: takeLast([1, 2, 3, 4, 5], 0),
//   toBe: [],
// });

// testArrayEquality({
//   testName: 'takeLast',
//   target: takeLast([1, 2, 3, 4, 5], -1),
//   toBe: [],
// });

// testArrayEquality({
//   testName: 'takeLast',
//   target: takeLast([1, 2, 3, 4, 5], 5),
//   toBe: [1, 2, 3, 4, 5],
// });

// testArrayEquality({
//   testName: 'takeLast',
//   target: takeLast([1, 2, 3, 4, 5], 6),
//   toBe: [1, 2, 3, 4, 5],
// });

// testArrayEquality({
//   testName: 'skipLast',
//   target: skip([1, 2, 3, 4, 5], 3),
//   toBe: [4, 5],
// });

// testArrayEquality({
//   testName: 'skip',
//   target: skip([1, 2, 3, 4, 5], 0),
//   toBe: [1, 2, 3, 4, 5],
// });

// testArrayEquality({
//   testName: 'skip',
//   target: skip([1, 2, 3, 4, 5], -1),
//   toBe: [1, 2, 3, 4, 5],
// });

// testArrayEquality({
//   testName: 'skip',
//   target: skip([1, 2, 3, 4, 5], 5),
//   toBe: [],
// });

// testArrayEquality({
//   testName: 'skip',
//   target: skip([1, 2, 3, 4, 5], 6),
//   toBe: [],
// });

// testArrayEquality({
//   testName: 'skipLast',
//   target: skipLast([1, 2, 3, 4, 5], 3),
//   toBe: [1, 2],
// });

// testArrayEquality({
//   testName: 'skipLast',
//   target: skipLast([1, 2, 3, 4, 5], 0),
//   toBe: [1, 2, 3, 4, 5],
// });

// testArrayEquality({
//   testName: 'skipLast',
//   target: skipLast([1, 2, 3, 4, 5], -1),
//   toBe: [1, 2, 3, 4, 5],
// });

// testArrayEquality({
//   testName: 'skipLast',
//   target: skipLast([1, 2, 3, 4, 5], 5),
//   toBe: [],
// });

// testArrayEquality({
//   testName: 'skipLast',
//   target: skipLast([1, 2, 3, 4, 5], 6),
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
// expectType<typeof sorted, NonEmptyArray<number>>('=');

// const array2: NonEmptyArray<1 | 2 | 3> = [1, 2, 3] as const;
// const sorted2 = sort(cmp)(array2);
// expectType<typeof sorted2, NonEmptyArray<1 | 2 | 3>>('=');

// const tuple = [1, 2, 3] as const;
// const sorted3 = sort(cmp)(tuple);
// expectType<typeof sorted3, readonly [1 | 2 | 3, 1 | 2 | 3, 1 | 2 | 3]>('=');

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
// expectType<typeof mapped, NonEmptyArray<number>>('=');

// const array2: NonEmptyArray<number> = [1, 2, 3] as const;
// const mapped2 = map((x: number, i) => x * x * i)(array2);
// expectType<typeof mapped2, NonEmptyArray<number>>('=');

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
// expectType<typeof s, number>('=');

// const ys = [1, 2, 3] as const;
// const s2 = sum(ys);
// expectType<typeof s2, number>('=');
