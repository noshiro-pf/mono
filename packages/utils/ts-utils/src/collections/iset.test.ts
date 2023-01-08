import { assertType } from '../assert-type';
import { Num } from '../num';
import { ISet } from './iset';

describe('ISet[Symbol.iterator]', () => {
  test('case 1', () => {
    const s0 = ISet.new(ISet.new([1, 2, 3]));

    expect(s0).toStrictEqual(ISet.new([1, 2, 3]));
  });
});

describe('ISet.size', () => {
  test('case 1', () => {
    const s0 = ISet.new([1, 2, 3]);

    expect(s0.size).toBe(3);
  });
});

describe('ISet.has', () => {
  test('case 1', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);

    expect(s0.has(6)).toBe(true);
  });
  test('case 2', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);

    expect(s0.has(8)).toBe(false);
  });
  test('case 3', () => {
    const s0 = ISet.new<number>([]);

    expect(s0.has(0)).toBe(false);
  });
  test('case 4', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7, Num.NaN]);

    expect(s0.has(Num.NaN)).toBe(true);
  });
});

describe('ISet.every', () => {
  test('case 1', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);

    expect(s0.every((x) => 1 <= x && x <= 7)).toBe(true);
  });
  test('case 2', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);

    expect(s0.every((x) => 4 <= x && x <= 5)).toBe(false);
  });
  test('case 3', () => {
    const s0 = ISet.new<number>([]);

    expect(s0.every(() => false)).toBe(true);
  });
});

describe('ISet.some', () => {
  test('case 1', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);

    expect(s0).toContain(3);
  });
  test('case 2', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);

    expect(s0).not.toContain(999);
  });
  test('case 3', () => {
    const s0 = ISet.new<number>([]);

    expect(s0.some(() => true)).toBe(false);
  });
});

describe('ISet.add', () => {
  test('case 1', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);

    expect(s0.add(10)).toStrictEqual(ISet.new([1, 3, 5, 6, 7, 10]));
    expect(s0).toStrictEqual(ISet.new([1, 3, 5, 6, 7]));
  });
  test('case 2', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);

    expect(s0.add(3)).toStrictEqual(ISet.new([1, 3, 5, 6, 7]));
    expect(s0).toStrictEqual(ISet.new([1, 3, 5, 6, 7]));
  });
  test('case 3', () => {
    const s0 = ISet.new<number>([]);

    expect(s0.add(1)).toStrictEqual(ISet.new([1]));
    expect(s0).toStrictEqual(ISet.new<number>([]));
  });
  test('case 4', () => {
    const s0 = ISet.new([1, 2, 3, Num.NaN]);

    expect(s0.add(Num.NaN)).toStrictEqual(ISet.new([1, 2, 3, Num.NaN]));
    expect(s0).toStrictEqual(ISet.new([1, 2, 3, Num.NaN]));
  });
});

describe('ISet.delete', () => {
  test('case 1', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);

    expect(s0.delete(10)).toStrictEqual(ISet.new([1, 3, 5, 6, 7]));
    expect(s0).toStrictEqual(ISet.new([1, 3, 5, 6, 7]));
  });
  test('case 2', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);

    expect(s0.delete(3)).toStrictEqual(ISet.new([1, 5, 6, 7]));
    expect(s0).toStrictEqual(ISet.new([1, 3, 5, 6, 7]));
  });
  test('case 3', () => {
    const s0 = ISet.new<number>([]);

    expect(s0.delete(1)).toStrictEqual(ISet.new([]));
    expect(s0).toStrictEqual(ISet.new<number>([]));
  });
  test('case 4', () => {
    const s0 = ISet.new([1, 2, 3, Num.NaN]);

    expect(s0.delete(Num.NaN)).toStrictEqual(ISet.new([1, 2, 3]));
    expect(s0).toStrictEqual(ISet.new([1, 2, 3, Num.NaN]));
  });
});

describe('ISet.map', () => {
  test('case 1', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);
    const result = s0.map((x) => (x * 2).toString());

    assertType<TypeEq<typeof result, ISet<string>>>();
    expect(result).toStrictEqual(ISet.new(['2', '6', '10', '12', '14']));
    expect(s0).toStrictEqual(ISet.new([1, 3, 5, 6, 7]));
  });
});

describe('ISet.isSubsetOf', () => {
  test('case 1', () => {
    expect(ISet.new([1, 3]).isSubsetOf(ISet.new([1, 3, 5, 6, 7]))).toBe(true);
  });
  test('case 2', () => {
    expect(ISet.new([1, 2, 3]).isSubsetOf(ISet.new([1, 3, 5, 6, 7]))).toBe(
      false
    );
  });
});

describe('ISet.isSupersetOf', () => {
  test('case 1', () => {
    expect(ISet.new([1, 3, 5, 6, 7]).isSupersetOf(ISet.new([1, 3]))).toBe(true);
  });
  test('case 2', () => {
    expect(ISet.new([1, 3, 5, 6, 7]).isSupersetOf(ISet.new([1, 2, 3]))).toBe(
      false
    );
  });
});

describe('ISet.subtract', () => {
  test('case 1', () => {
    expect(ISet.new([1, 3, 5, 6, 7]).subtract(ISet.new([1, 3]))).toStrictEqual(
      ISet.new([5, 6, 7])
    );
  });
  test('case 2', () => {
    expect(
      ISet.new([1, 3, 5, 6, 7]).subtract(ISet.new([1, 2, 3]))
    ).toStrictEqual(ISet.new([5, 6, 7]));
  });
});

describe('ISet.intersection', () => {
  test('case 1', () => {
    expect(
      ISet.intersection(ISet.new([1, 3, 5, 6, 7]), ISet.new<number>([]))
    ).toStrictEqual(ISet.new([]));
  });
  test('case 2', () => {
    expect(
      ISet.intersection(ISet.new([1, 3, 5, 6, 7]), ISet.new([1, 2, 3]))
    ).toStrictEqual(ISet.new([1, 3]));
  });
});

describe('ISet.union', () => {
  test('case 1', () => {
    expect(
      ISet.union(ISet.new([1, 3, 5, 6, 7]), ISet.new<number>([]))
    ).toStrictEqual(ISet.new([1, 3, 5, 6, 7]));
  });
  test('case 2', () => {
    expect(
      // eslint-disable-next-line no-restricted-globals
      Array.from(
        ISet.union(ISet.new([1, 3, 5, 6, 7]), ISet.new([2, 4, 8])).toArray()
      ).sort((a, b) => a - b)
    ).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe('ISet.forEach', () => {
  test('case 1', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);
    const xs = [1, 3, 5, 6, 7];

    for (const a of s0) {
      expect(xs).toContain(a);
    }
  });
});

describe('ISet.keys', () => {
  test('case 1', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);
    const xs = [1, 3, 5, 6, 7];

    for (const k of s0.keys()) {
      expect(xs).toContain(k);
    }
  });
});

describe('ISet.values', () => {
  test('case 1', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);
    const xs = [1, 3, 5, 6, 7];

    for (const k of s0.values()) {
      expect(xs).toContain(k);
    }
  });
});

describe('ISet.entries', () => {
  test('case 1', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);
    const xs = [1, 3, 5, 6, 7];

    for (const [k, v] of s0.entries()) {
      expect(k).toBe(v);
      expect(xs).toContain(k);
      expect(xs).toContain(v);
    }
  });
});

describe('ISet.toArray', () => {
  test('case 1', () => {
    expect(ISet.new([1, 3, 5, 6, 7]).toArray()).toStrictEqual([1, 3, 5, 6, 7]);
  });
});
