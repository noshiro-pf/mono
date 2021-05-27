import type { ReadonlyArrayOfLength, TypeEq, uint32 } from '../types';
import { assertNotType, assertType } from '../types';
import { IList } from './list';

describe('iList.isEmpty', () => {
  const xs = [1, 2, 3] as const;
  const result = IList.isEmpty(xs);

  assertType<TypeEq<typeof result, boolean>>();

  test('case 1', () => {
    expect(result).toBe(false);
  });
});

describe('iList.slice', () => {
  const list = [0, 1, 2, 3, 4] as const;
  [
    {
      testName: 'iList.slice',
      result: IList.slice(list, 0 as uint32, 5 as uint32),
      toBe: [0, 1, 2, 3, 4],
    }, // 正常
    {
      testName: 'iList.slice',
      result: IList.slice(list, 0 as uint32, 6 as uint32),
      toBe: [0, 1, 2, 3, 4],
    }, // 片方オーバー
    {
      testName: 'iList.slice',
      result: IList.slice(list, -1 as uint32, 5 as uint32),
      toBe: [0, 1, 2, 3, 4],
    }, // 片方オーバー
    {
      testName: 'iList.slice',
      result: IList.slice(list, -1 as uint32, 6 as uint32),
      toBe: [0, 1, 2, 3, 4],
    }, // 両方オーバー
    {
      testName: 'iList.slice',
      result: IList.slice(list, 0 as uint32, 3 as uint32),
      toBe: [0, 1, 2],
    }, // 正常
    {
      testName: 'iList.slice',
      result: IList.slice(list, 1 as uint32, 3 as uint32),
      toBe: [1, 2],
    }, // 正常
    {
      testName: 'iList.slice',
      result: IList.slice(list, -1 as uint32, 3 as uint32),
      toBe: [0, 1, 2],
    }, // 片方オーバー
    {
      testName: 'iList.slice',
      result: IList.slice(list, 3 as uint32, 5 as uint32),
      toBe: [3, 4],
    }, // 正常
    {
      testName: 'iList.slice',
      result: IList.slice(list, 3 as uint32, 6 as uint32),
      toBe: [3, 4],
    }, // 片方オーバー
    {
      testName: 'iList.slice',
      result: IList.slice(list, 4 as uint32, 3 as uint32),
      toBe: [],
    }, // start > end
    {
      testName: 'iList.slice',
      result: IList.slice(list, 0 as uint32, -1 as uint32),
      toBe: [],
    }, // start > end
    {
      testName: 'iList.slice',
      result: IList.slice(list, -1 as uint32, -2 as uint32),
      toBe: [],
    }, // start > end
    {
      testName: 'iList.slice',
      result: IList.slice(list, 6 as uint32, 9 as uint32),
      toBe: [],
    },
    {
      testName: 'iList.slice',
      result: IList.slice(list, 6 as uint32, 3 as uint32),
      toBe: [],
    },
  ].forEach(({ testName, result, toBe }) => {
    test(testName, () => {
      expect(result).toStrictEqual(toBe);
    });
  });
});

describe('iList.head', () => {
  const xs = [1, 2, 3] as const;
  const head = IList.head(xs);

  assertType<TypeEq<typeof head, 1>>();

  test('case 1', () => {
    expect(head).toBe(1);
  });

  test('alias', () => {
    expect(IList.head).toEqual(IList.first);
  });
});

describe('iList.last', () => {
  const xs = [1, 2, 3] as const;
  const last = IList.last(xs);

  assertType<TypeEq<typeof last, 3>>();

  test('case 1', () => {
    expect(last).toBe(3);
  });
});

describe('iList.tail', () => {
  const xs = [1, 2, 3] as const;
  const tail = IList.tail(xs);

  assertType<TypeEq<typeof tail, readonly [2, 3]>>();

  test('case 1', () => {
    expect(tail).toStrictEqual([2, 3]);
  });

  test('alias 1', () => {
    expect(IList.rest).toEqual(IList.tail);
  });
  test('alias 2', () => {
    expect(IList.shift).toEqual(IList.tail);
  });
});

describe('iList.butLast', () => {
  const xs = [1, 2, 3] as const;
  const butLast = IList.butLast(xs);

  assertType<TypeEq<typeof butLast, readonly [1, 2]>>();

  test('case 1', () => {
    expect(butLast).toStrictEqual([1, 2]);
  });

  test('alias', () => {
    expect(IList.pop).toEqual(IList.butLast);
  });
});

describe('iList.every', () => {
  const xs = [1, 2, 3] as const;

  if (IList.every(xs, (x): x is 1 => x === 1)) {
    assertType<TypeEq<typeof xs, readonly [1, 2, 3] & readonly 1[]>>();
  } else {
    assertNotType<TypeEq<typeof xs, readonly [1, 2, 3] & readonly 1[]>>();
  }

  test('case 1', () => {
    expect(IList.every(xs, (x): x is 1 => x === 1)).toBeFalsy();
  });

  test('case 2', () => {
    expect(IList.every(xs, (x) => 1 <= x && x <= 3)).toBeTruthy();
  });
});

describe('iList.some', () => {
  const xs = [1, 2, 3] as const;

  test('case 1', () => {
    expect(IList.some(xs, (x): x is 1 => x === 1)).toBeTruthy();
  });

  test('case 2', () => {
    expect(IList.some(xs, (x) => x <= 1 && 3 <= x)).toBeFalsy();
  });
});

describe('iList.map', () => {
  const xs = [1, 2, 3] as const;
  const mapped = IList.map(xs, (x, i): number => x * x * i);

  assertType<TypeEq<typeof mapped, ReadonlyArrayOfLength<3, number>>>();

  test('case 1', () => {
    expect(mapped).toStrictEqual([0, 4, 18]);
  });
});

describe('iList.flat', () => {
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

describe('iList.flatMap', () => {
  const xs = [1, 2, 3] as const;
  const mapped = IList.flatMap(xs, (x, i) => [i, x * x]);

  assertType<TypeEq<typeof mapped, readonly number[]>>();

  test('case 1', () => {
    expect(mapped).toStrictEqual([0, 1, 1, 4, 2, 9]);
  });
});

describe('iList.zip', () => {
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
});

describe('iList.filter', () => {
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

describe('iList.filterNot', () => {
  const xs = [1, 2, 3] as const;
  const filtered = IList.filterNot(xs, (x) => x % 2 === 0);

  assertType<TypeEq<typeof filtered, readonly (1 | 2 | 3)[]>>();

  test('case 1', () => {
    expect(filtered).toStrictEqual([1, 3]);
  });
});

describe('iList.set', () => {
  const xs = [1, 2, 3] as const;
  const result = IList.set(xs, 1 as uint32, 4 as const);

  assertType<TypeEq<typeof result, readonly [1 | 4, 2 | 4, 3 | 4]>>();

  test('case 1', () => {
    expect(result).toStrictEqual([1, 4, 3]);
  });
});

describe('iList.update', () => {
  const xs = [1, 2, 3] as const;
  const result = IList.update(xs, 1 as uint32, (x) => x + 2);

  assertType<TypeEq<typeof result, readonly [number, number, number]>>();

  test('case 1', () => {
    expect(result).toStrictEqual([1, 4, 3]);
  });
});

describe('iList.insert', () => {
  const xs = [1, 2, 3] as const;
  const result = IList.insert(xs, 1 as uint32, 5);

  assertType<TypeEq<typeof result, readonly (1 | 2 | 3 | 5)[]>>();

  test('case 1', () => {
    expect(result).toStrictEqual([1, 5, 2, 3]);
  });
});

describe('iList.remove', () => {
  const xs = [1, 2, 3] as const;
  const result = IList.remove(xs, 1 as uint32);

  assertType<TypeEq<typeof result, readonly (1 | 2 | 3)[]>>();

  test('case 1', () => {
    expect(result).toStrictEqual([1, 3]);
  });
});

describe('iList.push', () => {
  const xs = [1, 2, 3] as const;
  const result = IList.push(xs, 4 as const);

  assertType<TypeEq<typeof result, readonly [1, 2, 3, 4]>>();

  test('case 1', () => {
    expect(result).toStrictEqual([1, 2, 3, 4]);
  });
});

describe('iList.unshift', () => {
  const xs = [1, 2, 3] as const;
  const result = IList.unshift(xs, 4 as const);

  assertType<TypeEq<typeof result, readonly [4, 1, 2, 3]>>();

  test('case 1', () => {
    expect(result).toStrictEqual([4, 1, 2, 3]);
  });
});

describe('iList.concat', () => {
  const xs = [1, 2, 3] as const;
  const ys = [4, 5] as const;
  const result = IList.concat(xs, ys);

  assertType<TypeEq<typeof result, readonly [1, 2, 3, 4, 5]>>();

  test('case 1', () => {
    expect(result).toStrictEqual([1, 2, 3, 4, 5]);
  });
});

describe('iList.reverse', () => {
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

describe('iList.sort', () => {
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

describe('iList.sortBy', () => {
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

describe('iList.includes', () => {
  {
    const xs = [2, 1, 3] as const;
    const result = IList.includes(xs, 2);

    assertType<TypeEq<typeof result, boolean>>();

    test('case 1', () => {
      expect(result).toStrictEqual(true);
    });
  }
  {
    const xs: readonly number[] = [2, 1, 3];
    const result = IList.includes(xs, 4);

    assertType<TypeEq<typeof result, boolean>>();

    test('case 1', () => {
      expect(result).toStrictEqual(false);
    });
  }
});

describe('iList.find', () => {
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

    test('case 1', () => {
      expect(result).toStrictEqual({ v: 1 });
    });
  }
});

describe('iList.min', () => {
  {
    const xs = [3, 5, 4] as const;
    const result = IList.min(xs);

    assertType<TypeEq<typeof result, 3 | 4 | 5>>();

    test('case 1', () => {
      expect(result).toStrictEqual(3);
    });
  }
  {
    const xs = [3, 5, 4] as const;
    const result = IList.min(xs, (a, b) => a - b);

    assertType<TypeEq<typeof result, 3 | 4 | 5>>();

    test('case 2', () => {
      expect(result).toStrictEqual(3);
    });
  }
  {
    const xs: readonly (3 | 4 | 5)[] = [3, 5, 4] as const;
    const result = IList.min(xs, (a, b) => a - b);

    assertType<TypeEq<typeof result, 3 | 4 | 5 | undefined>>();

    test('case 3', () => {
      expect(result).toStrictEqual(3);
    });
  }
});

describe('iList.max', () => {
  const xs = [3, 5, 4] as const;
  const result = IList.max(xs, (a, b) => a - b);

  assertType<TypeEq<typeof result, 3 | 4 | 5>>();

  test('case 1', () => {
    expect(result).toStrictEqual(5);
  });
});

describe('iList.minBy', () => {
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

describe('iList.maxBy', () => {
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

describe('iList.count', () => {
  const xs = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 3 },
  ] as const;

  const result = IList.count(xs, (a) => a.x === 2);

  assertType<TypeEq<typeof result, uint32>>();

  test('case 1', () => {
    expect(result).toStrictEqual(2);
  });
});

describe('iList.countBy', () => {
  const xs = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 3 },
  ] as const;

  const result = IList.countBy(xs, (a) => a.x);

  assertType<TypeEq<typeof result, ReadonlyMap<1 | 2 | 3, uint32>>>();

  test('case 1', () => {
    expect(result).toStrictEqual(
      new Map<1 | 2 | 3, uint32>([
        [1, 3 as uint32],
        [2, 2 as uint32],
        [3, 1 as uint32],
      ])
    );
  });
});

describe('iList.groupBy', () => {
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
      ReadonlyMap<
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
      new Map<
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

describe('iList.isSubset', () => {
  {
    const xs = [1, 2, 3] as const;
    const ys = [3, 2] as const;

    const result = IList.isSubset(ys, xs);

    assertType<TypeEq<typeof result, boolean>>();

    test('case 1', () => {
      expect(result).toBeTruthy();
    });
  }
  {
    const xs = [1, 2, 3] as const;
    const ys = [3, 2, 4] as const;

    const result = IList.isSubset(ys, xs);

    assertType<TypeEq<typeof result, boolean>>();

    test('case 2', () => {
      expect(result).toBeFalsy();
    });
  }
});

describe('iList.isSuperset', () => {
  {
    const xs = [1, 2, 3] as const;
    const ys = [3, 2] as const;

    const result = IList.isSuperset(ys, xs);

    assertType<TypeEq<typeof result, boolean>>();

    test('case 1', () => {
      expect(result).toBeFalsy();
    });

    const result2 = IList.isSuperset(xs, ys);

    test('case 2', () => {
      expect(result2).toBeTruthy();
    });
  }
  {
    const xs = [1, 2, 3] as const;
    const ys = [3, 2, 4] as const;

    const result = IList.isSuperset(ys, xs);

    assertType<TypeEq<typeof result, boolean>>();

    test('case 3', () => {
      expect(result).toBeFalsy();
    });
  }
});
