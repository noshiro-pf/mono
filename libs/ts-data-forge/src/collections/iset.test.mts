import { expectType } from '../expect-type.mjs';
import { ISet } from './iset.mjs';

describe('ISet.create', () => {
  test('case 1', () => {
    const s0 = ISet.create(ISet.create(ISet.create([1, 2, 3] as const)));

    expectType<typeof s0, ISet<1 | 2 | 3>>('<=');
    expect(s0).toStrictEqual(ISet.create([1, 2, 3] as const));
  });

  test('should create empty set', () => {
    const set = ISet.create<string>([]);
    expect(set.size).toBe(0);
    expect(set.isEmpty).toBe(true);
  });

  test('should create set from array', () => {
    const set = ISet.create([1, 2, 3, 2, 1]);
    expect(set.size).toBe(3);
    expect(set.has(1)).toBe(true);
    expect(set.has(2)).toBe(true);
    expect(set.has(3)).toBe(true);
  });

  test('should create set from JavaScript Set', () => {
    const jsSet = new Set(['a', 'b', 'c']);
    const set = ISet.create(jsSet);
    expect(set.size).toBe(3);
    expect(set.has('a')).toBe(true);
    expect(set.has('b')).toBe(true);
    expect(set.has('c')).toBe(true);
  });

  test('should create set from another ISet', () => {
    const original = ISet.create([1, 2, 3]);
    const copy = ISet.create(original);
    expect(copy.size).toBe(3);
    expect(copy.has(1)).toBe(true);
    expect(copy.has(2)).toBe(true);
    expect(copy.has(3)).toBe(true);
  });
});

describe('ISet.size', () => {
  test('case 1', () => {
    const s0 = ISet.create([1, 2, 3] as const);

    expectType<typeof s0.size, number>('<=');
    expect(s0.size).toBe(3);
  });

  test('case 2', () => {
    const s0 = ISet.create<number>([]);

    expect(s0.size).toBe(0);
  });
});

describe('isEmpty property', () => {
  test('should return true for empty set', () => {
    const set = ISet.create<string>([]);
    expect(set.isEmpty).toBe(true);
  });

  test('should return false for non-empty set', () => {
    const set = ISet.create([1, 2, 3]);
    expect(set.isEmpty).toBe(false);
  });
});

describe('ISet.has', () => {
  test('case 1', () => {
    const s0 = ISet.create([1, 2, 3] as const);

    expectType<typeof s0.has, (value: 1 | 2 | 3) => boolean>('<=');
    expect(s0.has(2)).toBe(true);
  });

  test('case 2', () => {
    const s0 = ISet.create<number>([1, 2, 3]);

    expect(s0.has(4)).toBe(false);
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([]);

    expect(s0.has(1)).toBe(false);
  });

  test('case 4', () => {
    const s0 = ISet.create([1, 2, 3, Number.NaN] as const);

    expect(s0.has(Number.NaN)).toBe(true);
  });

  test('should handle boolean values', () => {
    const set = ISet.create([true, false]);
    expect(set.has(true)).toBe(true);
    expect(set.has(false)).toBe(true);
  });

  test('should handle null and undefined', () => {
    const set = ISet.create([null, undefined]);
    expect(set.has(null)).toBe(true);
    expect(set.has(undefined)).toBe(true);
  });
});

describe('ISet.every', () => {
  test('case 1', () => {
    const s0 = ISet.create([2, 4, 6] as const);

    expectType<
      typeof s0.every,
      (predicate: (value: 2 | 4 | 6) => boolean) => boolean
    >('<=');
    expect(s0.every((x) => x % 2 === 0)).toBe(true);
  });

  test('case 2', () => {
    const s0 = ISet.create([1, 2, 3] as const);

    expect(s0.every((x) => x % 2 === 0)).toBe(false);
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([]);

    expect(s0.every((x) => x % 2 === 0)).toBe(true);
  });

  test('should return true when all elements satisfy predicate', () => {
    const set = ISet.create([2, 4, 6, 8]);
    expect(set.every((x) => x % 2 === 0)).toBe(true);
  });

  test('should return false when some elements do not satisfy predicate', () => {
    const set = ISet.create([1, 2, 3, 4]);
    expect(set.every((x) => x % 2 === 0)).toBe(false);
  });

  test('should return true for empty set', () => {
    const set = ISet.create<number>([]);
    expect(set.every((x) => x > 0)).toBe(true);
  });
});

describe('every method as type guard', () => {
  test('should narrow type when used as type guard', () => {
    const set = ISet.create<string | number>(['hello', 'world']);
    if (set.every((value): value is string => typeof value === 'string')) {
      // Type should be narrowed to ISet<string>
      const values = set.toArray();
      for (const value of values) {
        expect(typeof value).toBe('string');
      }
    }
  });

  test('should work with mixed types that fail guard', () => {
    const set = ISet.create<string | number>(['hello', 42, 'world']);
    expect(
      set.every((value): value is string => typeof value === 'string'),
    ).toBe(false);
  });
});

describe('ISet.some', () => {
  test('case 1', () => {
    const s0 = ISet.create([1, 3, 5] as const);

    expectType<
      typeof s0.some,
      (predicate: (value: 1 | 3 | 5) => boolean) => boolean
    >('<=');
    expect(s0.some((x) => x % 2 === 0)).toBe(false);
  });

  test('case 2', () => {
    const s0 = ISet.create([1, 2, 3] as const);

    expect(s0.some((x) => x % 2 === 0)).toBe(true);
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([]);

    expect(s0.some((x) => x % 2 === 0)).toBe(false);
  });

  test('should return true when at least one element satisfies predicate', () => {
    const set = ISet.create([1, 3, 5, 6]);
    expect(set.some((x) => x % 2 === 0)).toBe(true);
  });

  test('should return false when no elements satisfy predicate', () => {
    const set = ISet.create([1, 3, 5, 7]);
    expect(set.some((x) => x % 2 === 0)).toBe(false);
  });

  test('should return false for empty set', () => {
    const set = ISet.create<number>([]);
    expect(set.some((x) => x > 0)).toBe(false);
  });

  test('should work with complex predicates', () => {
    const set = ISet.create(['hello', 'world', 'test']);
    expect(set.some((str) => str.includes('o'))).toBe(true);
    expect(set.some((str) => str.includes('z'))).toBe(false);
  });
});

describe('ISet.add', () => {
  test('case 1', () => {
    const s0 = ISet.create<number>([1, 2, 3]);

    expectType<typeof s0.add, (value: number) => ISet<number>>('<=');
    const s1 = ISet.create<number>([1, 2, 3, 4]);
    expect(s0.add(4)).toStrictEqual(s1);
    expect(s0).toStrictEqual(ISet.create<number>([1, 2, 3]));
  });

  test('case 2', () => {
    const s0 = ISet.create([1, 2, 3]);

    expect(s0.add(2)).toStrictEqual(ISet.create([1, 2, 3]));
    expect(s0).toStrictEqual(ISet.create([1, 2, 3]));
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([]);

    expect(s0.add(1)).toStrictEqual(ISet.create([1]));
    expect(s0).toStrictEqual(ISet.create([]));
  });

  test('should add new elements and maintain immutability', () => {
    const original = ISet.create<number>([1, 2, 3]);
    const modified = original.add(4);

    expect(original.size).toBe(3);
    expect(modified.size).toBe(4);
    expect(original.has(4)).toBe(false);
    expect(modified.has(4)).toBe(true);
  });

  test('should return same instance when adding existing element', () => {
    const set = ISet.create([1, 2, 3]);
    const result = set.add(2);
    expect(result).toBe(set);
  });

  test('should handle special values', () => {
    const set = ISet.create<number | null | undefined>([]);
    const withNull = set.add(null);
    const withUndefined = withNull.add(undefined);
    const withNaN = withUndefined.add(Number.NaN);

    expect(withNaN.has(null)).toBe(true);
    expect(withNaN.has(undefined)).toBe(true);
    expect(withNaN.has(Number.NaN)).toBe(true);
  });
});

describe('ISet.delete', () => {
  test('case 1', () => {
    const s0 = ISet.create<number>([1, 2, 3]);

    expectType<typeof s0.delete, (value: number) => ISet<number>>('<=');
    expect(s0.delete(4)).toStrictEqual(ISet.create<number>([1, 2, 3]));
    expect(s0).toStrictEqual(ISet.create<number>([1, 2, 3]));
  });

  test('case 2', () => {
    const s0 = ISet.create([1, 2, 3]);

    expect(s0.delete(2)).toStrictEqual(ISet.create([1, 3]));
    expect(s0).toStrictEqual(ISet.create([1, 2, 3]));
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([]);

    expect(s0.delete(1)).toStrictEqual(ISet.create([]));
    expect(s0).toStrictEqual(ISet.create([]));
  });

  test('should delete existing elements and maintain immutability', () => {
    const original = ISet.create([1, 2, 3, 4]);
    const modified = original.delete(2);

    expect(original.size).toBe(4);
    expect(modified.size).toBe(3);
    expect(original.has(2)).toBe(true);
    expect(modified.has(2)).toBe(false);
  });

  test('should return same instance when deleting non-existent element', () => {
    const set = ISet.create<number>([1, 2, 3]);
    const result = set.delete(4);
    expect(result).toBe(set);
  });
});

describe('ISet.map', () => {
  test('case 1', () => {
    const s0 = ISet.create([1, 2, 3] as const);

    expectType<
      typeof s0.map,
      <U extends MapSetKeyType>(mapper: (value: 1 | 2 | 3) => U) => ISet<U>
    >('<=');
    expect(s0.map((x) => x * 2)).toStrictEqual(ISet.create([2, 4, 6]));
  });

  test('case 2', () => {
    const s0 = ISet.create<number>([]);

    expect(s0.map((x) => x * 2)).toStrictEqual(ISet.create([]));
  });

  test('should transform all elements', () => {
    const set = ISet.create([1, 2, 3]);
    const doubled = set.map((x) => x * 2);

    expect(doubled.toArray().toSorted((a, b) => a - b)).toStrictEqual([
      2, 4, 6,
    ]);
  });

  test('should handle type transformations', () => {
    const set = ISet.create([1, 2, 3]);
    const strings = set.map((x) => x.toString());

    expect(strings.has('1')).toBe(true);
    expect(strings.has('2')).toBe(true);
    expect(strings.has('3')).toBe(true);
  });
});

describe('ISet.filter', () => {
  test('case 1', () => {
    const s0 = ISet.create([1, 2, 3, 4, 5] as const);

    expectType<
      typeof s0.filter,
      (
        predicate: (value: 1 | 2 | 3 | 4 | 5) => boolean,
      ) => ISet<1 | 2 | 3 | 4 | 5>
    >('<=');
    expect(s0.filter((x) => x % 2 === 0)).toStrictEqual(ISet.create([2, 4]));
  });

  test('case 2', () => {
    const s0 = ISet.create<number>([]);

    expect(s0.filter((x) => x % 2 === 0)).toStrictEqual(ISet.create([]));
  });

  test('should filter elements based on predicate', () => {
    const set = ISet.create([1, 2, 3, 4, 5, 6]);
    const evens = set.filter((x) => x % 2 === 0);

    expect(evens.size).toBe(3);
    expect(evens.has(2)).toBe(true);
    expect(evens.has(4)).toBe(true);
    expect(evens.has(6)).toBe(true);
  });

  test('should work as type guard', () => {
    const set = ISet.create<string | number>(['hello', 42, 'world', 123]);
    const strings = set.filter(
      (value): value is string => typeof value === 'string',
    );

    expect(strings.size).toBe(2);
    expect(strings.has('hello')).toBe(true);
    expect(strings.has('world')).toBe(true);
  });

  test('should return empty set when no elements match', () => {
    const set = ISet.create([1, 3, 5]);
    const evens = set.filter((x) => x % 2 === 0);

    expect(evens.size).toBe(0);
    expect(evens.isEmpty).toBe(true);
  });
});

describe('ISet.filterNot', () => {
  test('should filter out elements that satisfy predicate', () => {
    const set = ISet.create([1, 2, 3, 4, 5, 6]);
    const odds = set.filterNot((x) => x % 2 === 0);

    expect(odds.size).toBe(3);
    expect(odds.has(1)).toBe(true);
    expect(odds.has(3)).toBe(true);
    expect(odds.has(5)).toBe(true);
  });

  test('should return same set when no elements satisfy predicate', () => {
    const set = ISet.create([1, 3, 5]);
    const nonEvens = set.filterNot((x) => x % 2 === 0);
    expect(nonEvens.size).toBe(3);
    expect(ISet.equal(set, nonEvens)).toBe(true);
  });

  test('should return empty set when all elements satisfy predicate', () => {
    const set = ISet.create([2, 4, 6]);
    const nonEvens = set.filterNot((x) => x % 2 === 0);
    expect(nonEvens.isEmpty).toBe(true);
  });
});

describe('ISet.isSubsetOf', () => {
  test('case 1', () => {
    const s0 = ISet.create<number>([1, 2]);
    const s1 = ISet.create<number>([1, 2, 3]);

    expectType<typeof s0.isSubsetOf, (other: ISet<number>) => boolean>('<=');
    expect(s0.isSubsetOf(s1)).toBe(true);
  });

  test('case 2', () => {
    const s0 = ISet.create<number>([1, 2, 3]);
    const s1 = ISet.create<number>([1, 2]);

    expect(s0.isSubsetOf(s1)).toBe(false);
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([]);
    const s1 = ISet.create<number>([1, 2, 3]);

    expect(s0.isSubsetOf(s1)).toBe(true);
  });

  test('should return true for subset relationship', () => {
    const subset = ISet.create<number>([1, 2]);
    const superset = ISet.create<number>([1, 2, 3, 4]);
    expect(subset.isSubsetOf(superset)).toBe(true);
  });

  test('should return true for equal sets', () => {
    const set1 = ISet.create<number>([1, 2, 3]);
    const set2 = ISet.create<number>([1, 2, 3]);
    expect(set1.isSubsetOf(set2)).toBe(true);
  });

  test('should return false for non-subset', () => {
    const set1 = ISet.create<number>([1, 2, 5]);
    const set2 = ISet.create<number>([1, 2, 3, 4]);
    expect(set1.isSubsetOf(set2)).toBe(false);
  });
});

describe('ISet.isSupersetOf', () => {
  test('case 1', () => {
    const s0 = ISet.create<number>([1, 2, 3]);
    const s1 = ISet.create<number>([1, 2]);

    expectType<typeof s0.isSupersetOf, (other: ISet<number>) => boolean>('<=');
    expect(s0.isSupersetOf(s1)).toBe(true);
  });

  test('case 2', () => {
    const s0 = ISet.create<number>([1, 2]);
    const s1 = ISet.create<number>([1, 2, 3]);

    expect(s0.isSupersetOf(s1)).toBe(false);
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([1, 2, 3]);
    const s1 = ISet.create<number>([]);

    expect(s0.isSupersetOf(s1)).toBe(true);
  });

  test('should return true for superset relationship', () => {
    const superset = ISet.create<number>([1, 2, 3, 4]);
    const subset = ISet.create<number>([1, 2]);
    expect(superset.isSupersetOf(subset)).toBe(true);
  });

  test('should return true for equal sets', () => {
    const set1 = ISet.create<number>([1, 2, 3]);
    const set2 = ISet.create<number>([1, 2, 3]);
    expect(set1.isSupersetOf(set2)).toBe(true);
  });

  test('should return false for non-superset', () => {
    const set1 = ISet.create<number>([1, 2, 3]);
    const set2 = ISet.create<number>([1, 2, 3, 4]);
    expect(set1.isSupersetOf(set2)).toBe(false);
  });
});

describe('ISet.subtract', () => {
  test('case 1', () => {
    const s0 = ISet.create<number>([1, 2, 3]);
    const s1 = ISet.create<number>([2, 4]);

    expectType<typeof s0.subtract, (other: ISet<number>) => ISet<number>>('<=');
    expect(s0.subtract(s1)).toStrictEqual(ISet.create<number>([1, 3]));
  });

  test('case 2', () => {
    const s0 = ISet.create<number>([1, 2, 3]);
    const s1 = ISet.create<number>([]);

    expect(s0.subtract(s1)).toStrictEqual(ISet.create<number>([1, 2, 3]));
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([]);
    const s1 = ISet.create<number>([1, 2, 3]);

    expect(s0.subtract(s1)).toStrictEqual(ISet.create<number>([]));
  });

  test('should return elements in first set but not in second', () => {
    const set1 = ISet.create<number>([1, 2, 3, 4, 5]);
    const set2 = ISet.create<number>([3, 4, 5, 6, 7]);
    const result = set1.subtract(set2);

    expect(result.size).toBe(2);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
  });

  test('should return empty set when all elements are removed', () => {
    const set1 = ISet.create<number>([1, 2, 3]);
    const set2 = ISet.create<number>([1, 2, 3, 4, 5]);
    const result = set1.subtract(set2);

    expect(result.isEmpty).toBe(true);
  });
});

describe('ISet.intersection', () => {
  test('case 1', () => {
    const s0 = ISet.create<number>([1, 2, 3]);
    const s1 = ISet.create<number>([2, 3, 4]);

    expectType<
      typeof ISet.intersection,
      <T extends Primitive>(a: ISet<T>, b: ISet<T>) => ISet<T>
    >('<=');
    expect(ISet.intersection(s0, s1)).toStrictEqual(
      ISet.create<number>([2, 3]),
    );
  });

  test('case 2', () => {
    const s0 = ISet.create<number>([1, 2, 3]);
    const s1 = ISet.create<number>([]);

    expect(ISet.intersection(s0, s1)).toStrictEqual(ISet.create<number>([]));
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([]);
    const s1 = ISet.create<number>([1, 2, 3]);

    expect(ISet.intersection(s0, s1)).toStrictEqual(ISet.create<number>([]));
  });

  test('should return common elements', () => {
    const set1 = ISet.create<number>([1, 2, 3, 4]);
    const set2 = ISet.create<number>([3, 4, 5, 6]);
    const result = ISet.intersection(set1, set2);

    expect(result.size).toBe(2);
    expect(result.has(3)).toBe(true);
    expect(result.has(4)).toBe(true);
  });

  test('should return empty set when no common elements', () => {
    const set1 = ISet.create<number>([1, 2]);
    const set2 = ISet.create<number>([3, 4]);
    const result = ISet.intersection(set1, set2);

    expect(result.isEmpty).toBe(true);
  });
});

describe('ISet.intersect', () => {
  test('case 1', () => {
    const s0 = ISet.create<number>([1, 2, 3]);
    const s1 = ISet.create<number>([2, 3, 4]);

    expectType<typeof s0.intersect, (other: ISet<number>) => ISet<number>>(
      '<=',
    );
    expect(s0.intersect(s1)).toStrictEqual(ISet.create<number>([2, 3]));
  });

  test('case 2', () => {
    const s0 = ISet.create<number>([1, 2, 3]);
    const s1 = ISet.create<number>([]);

    expect(s0.intersect(s1)).toStrictEqual(ISet.create<number>([]));
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([]);
    const s1 = ISet.create<number>([1, 2, 3]);

    expect(s0.intersect(s1)).toStrictEqual(ISet.create<number>([]));
  });

  test('should return common elements using instance method', () => {
    const set1 = ISet.create<number>([1, 2, 3, 4]);
    const set2 = ISet.create<number>([3, 4, 5, 6]);
    const result = set1.intersect(set2);

    expect(result.size).toBe(2);
    expect(result.has(3)).toBe(true);
    expect(result.has(4)).toBe(true);
  });
});

describe('ISet.union', () => {
  test('case 1', () => {
    const s0 = ISet.create<number>([1, 2, 3]);
    const s1 = ISet.create<number>([3, 4, 5]);

    expectType<
      typeof ISet.union,
      <T extends Primitive>(a: ISet<T>, b: ISet<T>) => ISet<T>
    >('!=');
    expect(ISet.union(s0, s1)).toStrictEqual(
      ISet.create<number>([1, 2, 3, 4, 5]),
    );
  });

  test('case 2', () => {
    const s0 = ISet.create([1, 2, 3]);
    const s1 = ISet.create<number>([]);

    expect(ISet.union(s0, s1)).toStrictEqual(ISet.create([1, 2, 3]));
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([]);
    const s1 = ISet.create([1, 2, 3]);

    expect(ISet.union(s0, s1)).toStrictEqual(ISet.create([1, 2, 3]));
  });

  test('should return combined elements using static method', () => {
    const set1 = ISet.create([1, 2, 3]);
    const set2 = ISet.create([3, 4, 5]);
    const result = ISet.union(set1, set2);

    expect(result.size).toBe(5);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
    expect(result.has(3)).toBe(true);
    expect(result.has(4)).toBe(true);
    expect(result.has(5)).toBe(true);
  });

  describe('instance method', () => {
    test('case 1', () => {
      const s0 = ISet.create([1, 2, 3] as const);
      const s1 = ISet.create([3, 4, 5] as const);

      expectType<typeof s0.union, (other: ISet<number>) => ISet<number>>('<=');
      expect(s0.union(s1)).toStrictEqual(ISet.create([1, 2, 3, 4, 5]));
    });

    test('case 2', () => {
      const s0 = ISet.create([1, 2, 3]);
      const s1 = ISet.create<number>([]);

      expect(s0.union(s1)).toStrictEqual(ISet.create([1, 2, 3]));
    });

    test('case 3', () => {
      const s0 = ISet.create<number>([]);
      const s1 = ISet.create([1, 2, 3]);

      expect(s0.union(s1)).toStrictEqual(ISet.create([1, 2, 3]));
    });

    test('should return combined elements using instance method', () => {
      const set1 = ISet.create([1, 2, 3]);
      const set2 = ISet.create([3, 4, 5]);
      const result = set1.union(set2);

      expect(result.size).toBe(5);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
      expect(result.has(3)).toBe(true);
      expect(result.has(4)).toBe(true);
      expect(result.has(5)).toBe(true);
    });
  });
});

describe('ISet.forEach', () => {
  test('case 1', () => {
    const s0 = ISet.create([1, 2, 3] as const);

    expectType<
      typeof s0.forEach,
      (callback: (value: 1 | 2 | 3) => void) => void
    >('<=');

    const mut_result: (1 | 2 | 3)[] = [];
    for (const x of s0) {
      mut_result.push(x);
    }

    expect(mut_result.toSorted((a, b) => a - b)).toStrictEqual([1, 2, 3]);
  });

  test('should execute callback for each element', () => {
    const set = ISet.create([1, 2, 3]);
    const mut_collected: number[] = [];

    for (const value of set) {
      mut_collected.push(value);
    }

    expect(mut_collected.toSorted((a, b) => a - b)).toStrictEqual([1, 2, 3]);
  });

  test('should not call callback for empty set', () => {
    const set = ISet.create<number>([]);
    let mut_callCount = 0;

    // eslint-disable-next-line unicorn/no-array-for-each
    set.forEach(() => {
      mut_callCount += 1;
    });

    expect(mut_callCount).toBe(0);
  });
});

describe('ISet.keys', () => {
  test('case 1', () => {
    const s0 = ISet.create([1, 2, 3] as const);

    expectType<typeof s0.keys, () => IterableIterator<1 | 2 | 3>>('<=');

    const mut_result: (1 | 2 | 3)[] = [];
    for (const x of s0.keys()) {
      mut_result.push(x);
    }

    expect(mut_result.toSorted((a, b) => a - b)).toStrictEqual([1, 2, 3]);
  });
});

describe('ISet.values', () => {
  test('case 1', () => {
    const s0 = ISet.create([1, 2, 3] as const);

    expectType<typeof s0.values, () => IterableIterator<1 | 2 | 3>>('<=');

    const mut_result: (1 | 2 | 3)[] = [];
    for (const x of s0.values()) {
      mut_result.push(x);
    }

    expect(mut_result.toSorted((a, b) => a - b)).toStrictEqual([1, 2, 3]);
  });
});

describe('ISet.entries', () => {
  test('case 1', () => {
    const s0 = ISet.create([1, 2, 3] as const);

    expectType<
      typeof s0.entries,
      () => IterableIterator<readonly [1 | 2 | 3, 1 | 2 | 3]>
    >('<=');

    const mut_result: [1 | 2 | 3, 1 | 2 | 3][] = [];
    for (const x of s0.entries()) {
      mut_result.push([x[0], x[1]]);
    }

    expect(mut_result.toSorted((a, b) => a[0] - b[0])).toStrictEqual([
      [1, 1],
      [2, 2],
      [3, 3],
    ]);
  });
});

describe('ISet.toArray', () => {
  test('case 1', () => {
    const s0 = ISet.create([1, 2, 3] as const);

    expectType<typeof s0.toArray, () => readonly (1 | 2 | 3)[]>('<=');
    expect(Array.from(s0.toArray()).toSorted((a, b) => a - b)).toStrictEqual([
      1, 2, 3,
    ]);
  });

  test('case 2', () => {
    const s0 = ISet.create<number>([]);

    expect(s0.toArray()).toStrictEqual([]);
  });

  test('should convert set to array', () => {
    const set = ISet.create([1, 3, 2]);
    const array = set.toArray();

    expect(array).toHaveLength(3);
    expect(Array.from(array).toSorted((a, b) => a - b)).toStrictEqual([
      1, 2, 3,
    ]);
  });
});

describe('ISet.toRawSet', () => {
  test('should return underlying ReadonlySet', () => {
    const set = ISet.create([1, 2, 3]);
    const rawSet = set.toRawSet();

    expect(rawSet.size).toBe(3);
    expect(rawSet.has(1)).toBe(true);
    expect(rawSet.has(2)).toBe(true);
    expect(rawSet.has(3)).toBe(true);
  });

  test('should return empty ReadonlySet for empty ISet', () => {
    const set = ISet.create<number>([]);
    const rawSet = set.toRawSet();

    expect(rawSet.size).toBe(0);
  });
});

describe('ISet.equal', () => {
  test('should return true for equal sets', () => {
    const set1 = ISet.create([1, 2, 3]);
    const set2 = ISet.create([3, 2, 1]); // Different order
    expect(ISet.equal(set1, set2)).toBe(true);
  });

  test('should return false for sets with different sizes', () => {
    const set1 = ISet.create<'a' | 'b' | 'c' | 'd'>(['a', 'b']);
    const set2 = ISet.create<'a' | 'b' | 'c' | 'd'>(['a', 'b', 'c']);
    expect(ISet.equal(set1, set2)).toBe(false);
  });

  test('should return false for sets with different elements', () => {
    const set1 = ISet.create<'a' | 'b' | 'c' | 'd'>(['a', 'b', 'c']);
    const set2 = ISet.create<'a' | 'b' | 'c' | 'd'>(['a', 'b', 'd']);
    expect(ISet.equal(set1, set2)).toBe(false);
  });

  test('should return true for empty sets', () => {
    const set1 = ISet.create<string>([]);
    const set2 = ISet.create<string>([]);
    expect(ISet.equal(set1, set2)).toBe(true);
  });

  test('should handle sets with special values', () => {
    const set1 = ISet.create([Number.NaN, null, undefined]);
    const set2 = ISet.create([undefined, Number.NaN, null]);
    expect(ISet.equal(set1, set2)).toBe(true);
  });
});

describe('ISet.diff', () => {
  test('should compute differences between sets', () => {
    const oldSet = ISet.create<'a' | 'b' | 'c' | 'd'>(['a', 'b', 'c']);
    const newSet = ISet.create<'a' | 'b' | 'c' | 'd'>(['b', 'c', 'd']);

    const diff = ISet.diff(oldSet, newSet);

    expect(diff.deleted.size).toBe(1);
    expect(diff.deleted.has('a')).toBe(true);

    expect(diff.added.size).toBe(1);
    expect(diff.added.has('d')).toBe(true);
  });

  test('should handle no changes', () => {
    const set1 = ISet.create(['a', 'b', 'c']);
    const set2 = ISet.create(['a', 'b', 'c']);

    const diff = ISet.diff(set1, set2);

    expect(diff.deleted.isEmpty).toBe(true);
    expect(diff.added.isEmpty).toBe(true);
  });

  test('should handle complete replacement', () => {
    const oldSet = ISet.create<'a' | 'b' | 'c' | 'd'>(['a', 'b']);
    const newSet = ISet.create<'a' | 'b' | 'c' | 'd'>(['c', 'd']);

    const diff = ISet.diff(oldSet, newSet);

    expect(diff.deleted.size).toBe(2);
    expect(diff.deleted.has('a')).toBe(true);
    expect(diff.deleted.has('b')).toBe(true);

    expect(diff.added.size).toBe(2);
    expect(diff.added.has('c')).toBe(true);
    expect(diff.added.has('d')).toBe(true);
  });

  test('should handle empty sets', () => {
    const emptySet = ISet.create<string>([]);
    const nonEmptySet = ISet.create<string>(['a', 'b']);

    const diff1 = ISet.diff(emptySet, nonEmptySet);
    expect(diff1.deleted.isEmpty).toBe(true);
    expect(diff1.added.size).toBe(2);

    const diff2 = ISet.diff(nonEmptySet, emptySet);
    expect(diff2.deleted.size).toBe(2);
    expect(diff2.added.isEmpty).toBe(true);
  });
});

describe('ISet.withMutations', () => {
  test('should apply multiple mutations', () => {
    const set = ISet.create<string>(['a', 'b']);

    const updated = set.withMutations([
      { type: 'add', key: 'c' },
      { type: 'delete', key: 'a' },
      { type: 'add', key: 'd' },
    ]);

    expect(updated.size).toBe(3);
    expect(updated.has('b')).toBe(true);
    expect(updated.has('c')).toBe(true);
    expect(updated.has('d')).toBe(true);
    expect(updated.has('a')).toBe(false);
  });

  test('should handle empty mutations array', () => {
    const set = ISet.create(['a', 'b', 'c']);
    const updated = set.withMutations([]);
    expect(updated.size).toBe(set.size);
    expect(ISet.equal(set, updated)).toBe(true);
  });

  test('should handle duplicate operations', () => {
    const set = ISet.create<'a' | 'b'>(['a']);
    const updated = set.withMutations([
      { type: 'add', key: 'a' }, // Already exists
      { type: 'delete', key: 'b' }, // Doesn't exist
      { type: 'add', key: 'b' },
    ]);
    expect(updated.size).toBe(2);
    expect(updated.has('a')).toBe(true);
    expect(updated.has('b')).toBe(true);
  });
});

describe('iterable functionality', () => {
  test('should work with for-of loops', () => {
    const set = ISet.create([1, 2, 3]);
    const mut_collected: number[] = [];

    for (const value of set) {
      mut_collected.push(value);
    }

    expect(mut_collected.toSorted((a, b) => a - b)).toStrictEqual([1, 2, 3]);
  });

  test('should work with spread operator', () => {
    const set = ISet.create([1, 2, 3]);
    const array = Array.from(set);

    expect(Array.from(array).toSorted((a, b) => a - b)).toStrictEqual([
      1, 2, 3,
    ]);
  });

  test('should work with Array.from', () => {
    const set = ISet.create([1, 2, 3]);
    const array = Array.from(set);

    expect(Array.from(array).toSorted((a, b) => a - b)).toStrictEqual([
      1, 2, 3,
    ]);
  });

  test('should work with destructuring', () => {
    const set = ISet.create([1, 2]);
    const values = Array.from(set);

    expect(values.toSorted((a, b) => a - b)).toStrictEqual([1, 2]);
  });
});

describe('edge cases', () => {
  test('should handle NaN correctly', () => {
    const set = ISet.create([Number.NaN, 1, 2]);
    expect(set.has(Number.NaN)).toBe(true);
    expect(set.size).toBe(3);
  });

  test('should handle boolean values', () => {
    const set = ISet.create([true, false, true]);
    expect(set.size).toBe(2);
    expect(set.has(true)).toBe(true);
    expect(set.has(false)).toBe(true);
  });

  test('should handle null and undefined', () => {
    const set = ISet.create([null, undefined, null]);
    expect(set.size).toBe(2);
    expect(set.has(null)).toBe(true);
    expect(set.has(undefined)).toBe(true);
  });

  test('should handle symbols by reference', () => {
    const sym1 = Symbol('test');
    const sym2 = Symbol('test'); // Different symbol, same description
    const set = ISet.create([sym1, sym2]);

    expect(set.size).toBe(2);
    expect(set.has(sym1)).toBe(true);
    expect(set.has(sym2)).toBe(true);
    expect(set.has(Symbol('test'))).toBe(false); // Different symbol
  });
});

describe('immutability', () => {
  test('should not modify original set when adding', () => {
    const original = ISet.create<number>([1, 2, 3]);
    const modified = original.add(4);

    expect(original.size).toBe(3);
    expect(modified.size).toBe(4);
    expect(original.has(4)).toBe(false);
    expect(modified.has(4)).toBe(true);
  });

  test('should not modify original set when deleting', () => {
    const original = ISet.create([1, 2, 3]);
    const modified = original.delete(2);

    expect(original.size).toBe(3);
    expect(modified.size).toBe(2);
    expect(original.has(2)).toBe(true);
    expect(modified.has(2)).toBe(false);
  });

  test('should not modify original set when filtering', () => {
    const original = ISet.create([1, 2, 3, 4, 5]);
    const filtered = original.filter((x) => x % 2 === 0);

    expect(original.size).toBe(5);
    expect(filtered.size).toBe(2);
    expect(original.has(1)).toBe(true);
    expect(filtered.has(1)).toBe(false);
  });

  test('should not modify original set when mapping', () => {
    const original = ISet.create([1, 2, 3]);
    const mapped = original.map((x) => x * 2);

    expect(original.size).toBe(3);
    expect(mapped.size).toBe(3);
    expect(original.has(1)).toBe(true);
    expect(mapped.has(1)).toBe(false);
    expect(mapped.has(2)).toBe(true);
  });

  test('should not modify original sets during set operations', () => {
    const set1 = ISet.create<number>([1, 2, 3]);
    const set2 = ISet.create<number>([3, 4, 5]);

    const union = set1.union(set2);
    const intersection = set1.intersect(set2);
    const difference = set1.subtract(set2);

    expect(set1.size).toBe(3);
    expect(set2.size).toBe(3);
    expect(union.size).toBe(5);
    expect(intersection.size).toBe(1);
    expect(difference.size).toBe(2);
  });
});
