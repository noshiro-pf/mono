import { assertType } from '../types';
import { ISet } from './iset';
import { IList } from './list';

describe('ISet[Symbol.iterator]', () => {
  test('case 1', () => {
    const s0 = ISet.new(ISet.new([1, 2, 3]));
    expect(s0).toEqual(ISet.new([1, 2, 3]));
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
    expect(s0.has(6)).toBeTruthy();
  });
  test('case 2', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);
    expect(s0.has(8)).toBeFalsy();
  });
  test('case 3', () => {
    const s0 = ISet.new<number>([]);
    expect(s0.has(0)).toBeFalsy();
  });
  test('case 4', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7, Number.NaN]);
    expect(s0.has(Number.NaN)).toBeTruthy();
  });
});

describe('ISet.every', () => {
  test('case 1', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);
    expect(s0.every((x) => 1 <= x && x <= 7)).toBeTruthy();
  });
  test('case 2', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);
    expect(s0.every((x) => 4 <= x && x <= 5)).toBeFalsy();
  });
  test('case 3', () => {
    const s0 = ISet.new<number>([]);
    expect(s0.every(() => false)).toBeTruthy();
  });
});

describe('ISet.some', () => {
  test('case 1', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);
    expect(s0.some((x) => x === 3)).toBeTruthy();
  });
  test('case 2', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);
    expect(s0.some((x) => x === 999)).toBeFalsy();
  });
  test('case 3', () => {
    const s0 = ISet.new<number>([]);
    expect(s0.some(() => true)).toBeFalsy();
  });
});

describe('ISet.add', () => {
  test('case 1', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);
    expect(s0.add(10)).toEqual(ISet.new([1, 3, 5, 6, 7, 10]));
    expect(s0).toEqual(ISet.new([1, 3, 5, 6, 7]));
  });
  test('case 2', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);
    expect(s0.add(3)).toEqual(ISet.new([1, 3, 5, 6, 7]));
    expect(s0).toEqual(ISet.new([1, 3, 5, 6, 7]));
  });
  test('case 3', () => {
    const s0 = ISet.new<number>([]);
    expect(s0.add(1)).toEqual(ISet.new([1]));
    expect(s0).toEqual(ISet.new<number>([]));
  });
  test('case 4', () => {
    const s0 = ISet.new([1, 2, 3, Number.NaN]);
    expect(s0.add(Number.NaN)).toEqual(ISet.new([1, 2, 3, Number.NaN]));
    expect(s0).toEqual(ISet.new([1, 2, 3, Number.NaN]));
  });
});

describe('ISet.delete', () => {
  test('case 1', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);
    expect(s0.delete(10)).toEqual(ISet.new([1, 3, 5, 6, 7]));
    expect(s0).toEqual(ISet.new([1, 3, 5, 6, 7]));
  });
  test('case 2', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);
    expect(s0.delete(3)).toEqual(ISet.new([1, 5, 6, 7]));
    expect(s0).toEqual(ISet.new([1, 3, 5, 6, 7]));
  });
  test('case 3', () => {
    const s0 = ISet.new<number>([]);
    expect(s0.delete(1)).toEqual(ISet.new([]));
    expect(s0).toEqual(ISet.new<number>([]));
  });
  test('case 4', () => {
    const s0 = ISet.new([1, 2, 3, Number.NaN]);
    expect(s0.delete(Number.NaN)).toEqual(ISet.new([1, 2, 3]));
    expect(s0).toEqual(ISet.new([1, 2, 3, Number.NaN]));
  });
});

describe('ISet.map', () => {
  test('case 1', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);
    const result = s0.map((x) => (x * 2).toString());
    assertType<TypeEq<typeof result, ISet<string>>>();
    expect(result).toEqual(ISet.new(['2', '6', '10', '12', '14']));
    expect(s0).toEqual(ISet.new([1, 3, 5, 6, 7]));
  });
});

describe('ISet.isSubsetOf', () => {
  test('case 1', () => {
    expect(ISet.new([1, 3]).isSubsetOf(ISet.new([1, 3, 5, 6, 7]))).toBeTruthy();
  });
  test('case 2', () => {
    expect(
      ISet.new([1, 2, 3]).isSubsetOf(ISet.new([1, 3, 5, 6, 7]))
    ).toBeFalsy();
  });
});

describe('ISet.isSupersetOf', () => {
  test('case 1', () => {
    expect(
      ISet.new([1, 3, 5, 6, 7]).isSupersetOf(ISet.new([1, 3]))
    ).toBeTruthy();
  });
  test('case 2', () => {
    expect(
      ISet.new([1, 3, 5, 6, 7]).isSupersetOf(ISet.new([1, 2, 3]))
    ).toBeFalsy();
  });
});

describe('ISet.subtract', () => {
  test('case 1', () => {
    expect(ISet.new([1, 3, 5, 6, 7]).subtract(ISet.new([1, 3]))).toEqual(
      ISet.new([5, 6, 7])
    );
  });
  test('case 2', () => {
    expect(ISet.new([1, 3, 5, 6, 7]).subtract(ISet.new([1, 2, 3]))).toEqual(
      ISet.new([5, 6, 7])
    );
  });
});

describe('ISet.intersection', () => {
  test('case 1', () => {
    expect(
      ISet.intersection(ISet.new([1, 3, 5, 6, 7]), ISet.new<number>([]))
    ).toEqual(ISet.new([]));
  });
  test('case 2', () => {
    expect(
      ISet.intersection(ISet.new([1, 3, 5, 6, 7]), ISet.new([1, 2, 3]))
    ).toEqual(ISet.new([1, 3]));
  });
});

describe('ISet.union', () => {
  test('case 1', () => {
    expect(ISet.union(ISet.new([1, 3, 5, 6, 7]), ISet.new<number>([]))).toEqual(
      ISet.new([1, 3, 5, 6, 7])
    );
  });
  test('case 2', () => {
    expect(
      IList.sort(
        ISet.union(ISet.new([1, 3, 5, 6, 7]), ISet.new([2, 4, 8])).toArray()
      )
    ).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe('ISet.forEach', () => {
  test('case 1', () => {
    const s0 = ISet.new([1, 3, 5, 6, 7]);
    const xs = [1, 3, 5, 6, 7];
    s0.forEach((a) => {
      expect(xs).toContain(a);
    });
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
    expect(ISet.new([1, 3, 5, 6, 7]).toArray()).toEqual([1, 3, 5, 6, 7]);
  });
});
