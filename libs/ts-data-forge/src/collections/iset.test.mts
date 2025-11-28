import { expectType } from '../expect-type.mjs';
import { isString } from '../guard/index.mjs';
import { ISet } from './iset.mjs';

describe('ISet.create', () => {
  test('case 1', () => {
    const s0 = ISet.create(ISet.create(ISet.create([1, 2, 3] as const)));

    expectType<typeof s0, ISet<1 | 2 | 3>>('<=');

    assert.deepStrictEqual(s0, ISet.create([1, 2, 3] as const));
  });

  test('should create empty set', () => {
    const set = ISet.create<string>([]);

    expect(set.size).toBe(0);

    assert.isTrue(set.isEmpty);
  });

  test('should create set from array', () => {
    const set = ISet.create([1, 2, 3, 2, 1]);

    expect(set.size).toBe(3);

    assert.isTrue(set.has(1));

    assert.isTrue(set.has(2));

    assert.isTrue(set.has(3));
  });

  test('should create set from JavaScript Set', () => {
    const jsSet = new Set(['a', 'b', 'c']);

    const set = ISet.create(jsSet);

    expect(set.size).toBe(3);

    assert.isTrue(set.has('a'));

    assert.isTrue(set.has('b'));

    assert.isTrue(set.has('c'));
  });

  test('should create set from another ISet', () => {
    const original = ISet.create([1, 2, 3]);

    const copy = ISet.create(original);

    expect(copy.size).toBe(3);

    assert.isTrue(copy.has(1));

    assert.isTrue(copy.has(2));

    assert.isTrue(copy.has(3));
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

    assert.isTrue(set.isEmpty);
  });

  test('should return false for non-empty set', () => {
    const set = ISet.create([1, 2, 3]);

    assert.isFalse(set.isEmpty);
  });
});

describe('ISet.has', () => {
  test('case 1', () => {
    const s0 = ISet.create([1, 2, 3] as const);

    expectType<typeof s0.has, (value: 1 | 2 | 3) => boolean>('<=');

    assert.isTrue(s0.has(2));
  });

  test('case 2', () => {
    const s0 = ISet.create<number>([1, 2, 3]);

    assert.isFalse(s0.has(4));
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([]);

    assert.isFalse(s0.has(1));
  });

  test('case 4', () => {
    const s0 = ISet.create([1, 2, 3, Number.NaN] as const);

    assert.isTrue(s0.has(Number.NaN));
  });

  test('should handle boolean values', () => {
    const set = ISet.create([true, false]);

    assert.isTrue(set.has(true));

    assert.isTrue(set.has(false));
  });

  test('should handle null and undefined', () => {
    const set = ISet.create([null, undefined]);

    assert.isTrue(set.has(null));

    assert.isTrue(set.has(undefined));
  });
});

describe('ISet.every', () => {
  test('case 1', () => {
    const s0 = ISet.create([2, 4, 6] as const);

    expectType<
      typeof s0.every,
      (predicate: (value: 2 | 4 | 6) => boolean) => boolean
    >('<=');

    assert.isTrue(s0.every((x) => x % 2 === 0));
  });

  test('case 2', () => {
    const s0 = ISet.create([1, 2, 3] as const);

    assert.isFalse(s0.every((x) => x % 2 === 0));
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([]);

    assert.isTrue(s0.every((x) => x % 2 === 0));
  });

  test('should return true when all elements satisfy predicate', () => {
    const set = ISet.create([2, 4, 6, 8]);

    assert.isTrue(set.every((x) => x % 2 === 0));
  });

  test('should return false when some elements do not satisfy predicate', () => {
    const set = ISet.create([1, 2, 3, 4]);

    assert.isFalse(set.every((x) => x % 2 === 0));
  });

  test('should return true for empty set', () => {
    const set = ISet.create<number>([]);

    assert.isTrue(set.every((x) => x > 0));
  });
});

describe('every method as type guard', () => {
  test('should narrow type when used as type guard', () => {
    const set = ISet.create<string | number>(['hello', 'world']);

    if (set.every((value): value is string => typeof value === 'string')) {
      // Type should be narrowed to ISet<string>
      const values = set.toArray();

      for (const value of values) {
        assert.isTrue(isString(value));
      }
    }
  });

  test('should work with mixed types that fail guard', () => {
    const set = ISet.create<string | number>(['hello', 42, 'world']);

    assert.isFalse(
      set.every((value): value is string => typeof value === 'string'),
    );
  });
});

describe('ISet.some', () => {
  test('case 1', () => {
    const s0 = ISet.create([1, 3, 5] as const);

    expectType<
      typeof s0.some,
      (predicate: (value: 1 | 3 | 5) => boolean) => boolean
    >('<=');

    assert.isFalse(s0.some((x) => x % 2 === 0));
  });

  test('case 2', () => {
    const s0 = ISet.create([1, 2, 3] as const);

    assert.isTrue(s0.some((x) => x % 2 === 0));
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([]);

    assert.isFalse(s0.some((x) => x % 2 === 0));
  });

  test('should return true when at least one element satisfies predicate', () => {
    const set = ISet.create([1, 3, 5, 6]);

    assert.isTrue(set.some((x) => x % 2 === 0));
  });

  test('should return false when no elements satisfy predicate', () => {
    const set = ISet.create([1, 3, 5, 7]);

    assert.isFalse(set.some((x) => x % 2 === 0));
  });

  test('should return false for empty set', () => {
    const set = ISet.create<number>([]);

    assert.isFalse(set.some((x) => x > 0));
  });

  test('should work with complex predicates', () => {
    const set = ISet.create(['hello', 'world', 'test']);

    assert.isTrue(set.some((str) => str.includes('o')));

    assert.isFalse(set.some((str) => str.includes('z')));
  });
});

describe('ISet.add', () => {
  test('case 1', () => {
    const s0 = ISet.create<number>([1, 2, 3]);

    expectType<typeof s0.add, (value: number) => ISet<number>>('<=');

    const s1 = ISet.create<number>([1, 2, 3, 4]);

    assert.deepStrictEqual(s0.add(4), s1);

    assert.deepStrictEqual(s0, ISet.create<number>([1, 2, 3]));
  });

  test('case 2', () => {
    const s0 = ISet.create<number>([1, 2, 3]);

    assert.deepStrictEqual(s0.add(2), ISet.create([1, 2, 3]));

    assert.deepStrictEqual(s0, ISet.create([1, 2, 3]));
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([]);

    assert.deepStrictEqual(s0.add(1), ISet.create([1]));

    assert.deepStrictEqual(s0, ISet.create<number>([]));
  });

  test('should add new elements and maintain immutability', () => {
    const original = ISet.create<number>([1, 2, 3]);

    const modified = original.add(4);

    expect(original.size).toBe(3);

    expect(modified.size).toBe(4);

    assert.isFalse(original.has(4));

    assert.isTrue(modified.has(4));
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

    assert.isTrue(withNaN.has(null));

    assert.isTrue(withNaN.has(undefined));

    assert.isTrue(withNaN.has(Number.NaN));
  });
});

describe('ISet.delete', () => {
  test('case 1', () => {
    const s0 = ISet.create<number>([1, 2, 3]);

    expectType<typeof s0.delete, (value: number) => ISet<number>>('<=');

    assert.deepStrictEqual(s0.delete(4), ISet.create<number>([1, 2, 3]));

    assert.deepStrictEqual(s0, ISet.create<number>([1, 2, 3]));
  });

  test('case 2', () => {
    const s0 = ISet.create([1, 2, 3]);

    assert.deepStrictEqual(s0.delete(2), ISet.create<1 | 2 | 3>([1, 3]));

    assert.deepStrictEqual(s0, ISet.create([1, 2, 3]));
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([]);

    assert.deepStrictEqual(s0.delete(1), ISet.create<number>([]));

    assert.deepStrictEqual(s0, ISet.create<number>([]));
  });

  test('should delete existing elements and maintain immutability', () => {
    const original = ISet.create([1, 2, 3, 4]);

    const modified = original.delete(2);

    expect(original.size).toBe(4);

    expect(modified.size).toBe(3);

    assert.isTrue(original.has(2));

    assert.isFalse(modified.has(2));
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

    assert.deepStrictEqual(
      s0.map((x) => x * 2),
      ISet.create<number>([2, 4, 6]),
    );
  });

  test('case 2', () => {
    const s0 = ISet.create<number>([]);

    assert.deepStrictEqual(
      s0.map((x) => x * 2),
      ISet.create<number>([]),
    );
  });

  test('should transform all elements', () => {
    const set = ISet.create([1, 2, 3]);

    const doubled = set.map((x) => x * 2);

    assert.deepStrictEqual(
      doubled.toArray().toSorted((a, b) => a - b),
      [2, 4, 6],
    );
  });

  test('should handle type transformations', () => {
    const set = ISet.create([1, 2, 3]);

    const strings = set.map((x) => x.toString());

    assert.isTrue(strings.has('1'));

    assert.isTrue(strings.has('2'));

    assert.isTrue(strings.has('3'));
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

    assert.deepStrictEqual(
      s0.filter((x) => x % 2 === 0),
      ISet.create<1 | 2 | 3 | 4 | 5>([2, 4]),
    );
  });

  test('case 2', () => {
    const s0 = ISet.create<number>([]);

    assert.deepStrictEqual(
      s0.filter((x) => x % 2 === 0),
      ISet.create<number>([]),
    );
  });

  test('should filter elements based on predicate', () => {
    const set = ISet.create([1, 2, 3, 4, 5, 6]);

    const evens = set.filter((x) => x % 2 === 0);

    expect(evens.size).toBe(3);

    assert.isTrue(evens.has(2));

    assert.isTrue(evens.has(4));

    assert.isTrue(evens.has(6));
  });

  test('should work as type guard', () => {
    const set = ISet.create<string | number>(['hello', 42, 'world', 123]);

    const strings = set.filter(
      (value): value is string => typeof value === 'string',
    );

    expect(strings.size).toBe(2);

    assert.isTrue(strings.has('hello'));

    assert.isTrue(strings.has('world'));
  });

  test('should return empty set when no elements match', () => {
    const set = ISet.create([1, 3, 5]);

    const evens = set.filter((x) => x % 2 === 0);

    expect(evens.size).toBe(0);

    assert.isTrue(evens.isEmpty);
  });
});

describe('ISet.filterNot', () => {
  test('should filter out elements that satisfy predicate', () => {
    const set = ISet.create([1, 2, 3, 4, 5, 6]);

    const odds = set.filterNot((x) => x % 2 === 0);

    expect(odds.size).toBe(3);

    assert.isTrue(odds.has(1));

    assert.isTrue(odds.has(3));

    assert.isTrue(odds.has(5));
  });

  test('should return same set when no elements satisfy predicate', () => {
    const set = ISet.create([1, 3, 5]);

    const nonEvens = set.filterNot((x) => x % 2 === 0);

    expect(nonEvens.size).toBe(3);

    assert.isTrue(ISet.equal(set, nonEvens));
  });

  test('should return empty set when all elements satisfy predicate', () => {
    const set = ISet.create([2, 4, 6]);

    const nonEvens = set.filterNot((x) => x % 2 === 0);

    assert.isTrue(nonEvens.isEmpty);
  });
});

describe('ISet.isSubsetOf', () => {
  test('case 1', () => {
    const s0 = ISet.create<number>([1, 2]);

    const s1 = ISet.create<number>([1, 2, 3]);

    expectType<typeof s0.isSubsetOf, (other: ISet<number>) => boolean>('<=');

    assert.isTrue(s0.isSubsetOf(s1));
  });

  test('case 2', () => {
    const s0 = ISet.create<number>([1, 2, 3]);

    const s1 = ISet.create<number>([1, 2]);

    assert.isFalse(s0.isSubsetOf(s1));
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([]);

    const s1 = ISet.create<number>([1, 2, 3]);

    assert.isTrue(s0.isSubsetOf(s1));
  });

  test('should return true for subset relationship', () => {
    const subset = ISet.create<number>([1, 2]);

    const superset = ISet.create<number>([1, 2, 3, 4]);

    assert.isTrue(subset.isSubsetOf(superset));
  });

  test('should return true for equal sets', () => {
    const set1 = ISet.create<number>([1, 2, 3]);

    const set2 = ISet.create<number>([1, 2, 3]);

    assert.isTrue(set1.isSubsetOf(set2));
  });

  test('should return false for non-subset', () => {
    const set1 = ISet.create<number>([1, 2, 5]);

    const set2 = ISet.create<number>([1, 2, 3, 4]);

    assert.isFalse(set1.isSubsetOf(set2));
  });
});

describe('ISet.isSupersetOf', () => {
  test('case 1', () => {
    const s0 = ISet.create<number>([1, 2, 3]);

    const s1 = ISet.create<number>([1, 2]);

    expectType<typeof s0.isSupersetOf, (other: ISet<number>) => boolean>('<=');

    assert.isTrue(s0.isSupersetOf(s1));
  });

  test('case 2', () => {
    const s0 = ISet.create<number>([1, 2]);

    const s1 = ISet.create<number>([1, 2, 3]);

    assert.isFalse(s0.isSupersetOf(s1));
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([1, 2, 3]);

    const s1 = ISet.create<number>([]);

    assert.isTrue(s0.isSupersetOf(s1));
  });

  test('should return true for superset relationship', () => {
    const superset = ISet.create<number>([1, 2, 3, 4]);

    const subset = ISet.create<number>([1, 2]);

    assert.isTrue(superset.isSupersetOf(subset));
  });

  test('should return true for equal sets', () => {
    const set1 = ISet.create<number>([1, 2, 3]);

    const set2 = ISet.create<number>([1, 2, 3]);

    assert.isTrue(set1.isSupersetOf(set2));
  });

  test('should return false for non-superset', () => {
    const set1 = ISet.create<number>([1, 2, 3]);

    const set2 = ISet.create<number>([1, 2, 3, 4]);

    assert.isFalse(set1.isSupersetOf(set2));
  });
});

describe('ISet.subtract', () => {
  test('case 1', () => {
    const s0 = ISet.create<number>([1, 2, 3]);

    const s1 = ISet.create<number>([2, 4]);

    expectType<typeof s0.subtract, (other: ISet<number>) => ISet<number>>('<=');

    assert.deepStrictEqual(s0.subtract(s1), ISet.create<number>([1, 3]));
  });

  test('case 2', () => {
    const s0 = ISet.create<number>([1, 2, 3]);

    const s1 = ISet.create<number>([]);

    assert.deepStrictEqual(s0.subtract(s1), ISet.create<number>([1, 2, 3]));
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([]);

    const s1 = ISet.create<number>([1, 2, 3]);

    assert.deepStrictEqual(s0.subtract(s1), ISet.create<number>([]));
  });

  test('should return elements in first set but not in second', () => {
    const set1 = ISet.create<number>([1, 2, 3, 4, 5]);

    const set2 = ISet.create<number>([3, 4, 5, 6, 7]);

    const result = set1.subtract(set2);

    expect(result.size).toBe(2);

    assert.isTrue(result.has(1));

    assert.isTrue(result.has(2));
  });

  test('should return empty set when all elements are removed', () => {
    const set1 = ISet.create<number>([1, 2, 3]);

    const set2 = ISet.create<number>([1, 2, 3, 4, 5]);

    const result = set1.subtract(set2);

    assert.isTrue(result.isEmpty);
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

    assert.deepStrictEqual(
      ISet.intersection(s0, s1),
      ISet.create<number>([2, 3]),
    );
  });

  test('case 2', () => {
    const s0 = ISet.create<number>([1, 2, 3]);

    const s1 = ISet.create<number>([]);

    assert.deepStrictEqual(ISet.intersection(s0, s1), ISet.create<number>([]));
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([]);

    const s1 = ISet.create<number>([1, 2, 3]);

    assert.deepStrictEqual(ISet.intersection(s0, s1), ISet.create<number>([]));
  });

  test('should return common elements', () => {
    const set1 = ISet.create<number>([1, 2, 3, 4]);

    const set2 = ISet.create<number>([3, 4, 5, 6]);

    const result = ISet.intersection(set1, set2);

    expect(result.size).toBe(2);

    assert.isTrue(result.has(3));

    assert.isTrue(result.has(4));
  });

  test('should return empty set when no common elements', () => {
    const set1 = ISet.create<number>([1, 2]);

    const set2 = ISet.create<number>([3, 4]);

    const result = ISet.intersection(set1, set2);

    assert.isTrue(result.isEmpty);
  });
});

describe('ISet.intersect', () => {
  test('case 1', () => {
    const s0 = ISet.create<number>([1, 2, 3]);

    const s1 = ISet.create<number>([2, 3, 4]);

    expectType<typeof s0.intersect, (other: ISet<number>) => ISet<number>>(
      '<=',
    );

    assert.deepStrictEqual(s0.intersect(s1), ISet.create<number>([2, 3]));
  });

  test('case 2', () => {
    const s0 = ISet.create<number>([1, 2, 3]);

    const s1 = ISet.create<number>([]);

    assert.deepStrictEqual(s0.intersect(s1), ISet.create<number>([]));
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([]);

    const s1 = ISet.create<number>([1, 2, 3]);

    assert.deepStrictEqual(s0.intersect(s1), ISet.create<number>([]));
  });

  test('should return common elements using instance method', () => {
    const set1 = ISet.create<number>([1, 2, 3, 4]);

    const set2 = ISet.create<number>([3, 4, 5, 6]);

    const result = set1.intersect(set2);

    expect(result.size).toBe(2);

    assert.isTrue(result.has(3));

    assert.isTrue(result.has(4));
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

    assert.deepStrictEqual(
      ISet.union(s0, s1),
      ISet.create<number>([1, 2, 3, 4, 5]),
    );
  });

  test('case 2', () => {
    const s0 = ISet.create([1, 2, 3]);

    const s1 = ISet.create<number>([]);

    assert.deepStrictEqual(ISet.union(s0, s1), ISet.create<number>([1, 2, 3]));
  });

  test('case 3', () => {
    const s0 = ISet.create<number>([]);

    const s1 = ISet.create<number>([1, 2, 3]);

    assert.deepStrictEqual(ISet.union(s0, s1), ISet.create<number>([1, 2, 3]));
  });

  test('should return combined elements using static method', () => {
    const set1 = ISet.create<number>([1, 2, 3]);

    const set2 = ISet.create<number>([3, 4, 5]);

    const result = ISet.union(set1, set2);

    expect(result.size).toBe(5);

    assert.isTrue(result.has(1));

    assert.isTrue(result.has(2));

    assert.isTrue(result.has(3));

    assert.isTrue(result.has(4));

    assert.isTrue(result.has(5));
  });

  describe('instance method', () => {
    test('case 1', () => {
      const s0 = ISet.create([1, 2, 3] as const);

      const s1 = ISet.create([3, 4, 5] as const);

      expectType<typeof s0.union, (other: ISet<number>) => ISet<number>>('<=');

      assert.deepStrictEqual(
        s0.union(s1),
        ISet.create<1 | 2 | 3 | 4 | 5>([1, 2, 3, 4, 5]),
      );
    });

    test('case 2', () => {
      const s0 = ISet.create<number>([1, 2, 3]);

      const s1 = ISet.create<number>([]);

      assert.deepStrictEqual(s0.union(s1), ISet.create<number>([1, 2, 3]));
    });

    test('case 3', () => {
      const s0 = ISet.create<number>([]);

      const s1 = ISet.create<number>([1, 2, 3]);

      assert.deepStrictEqual(s0.union(s1), ISet.create<number>([1, 2, 3]));
    });

    test('should return combined elements using instance method', () => {
      const set1 = ISet.create<number>([1, 2, 3]);

      const set2 = ISet.create<number>([3, 4, 5]);

      const result = set1.union(set2);

      expect(result.size).toBe(5);

      assert.isTrue(result.has(1));

      assert.isTrue(result.has(2));

      assert.isTrue(result.has(3));

      assert.isTrue(result.has(4));

      assert.isTrue(result.has(5));
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

    assert.deepStrictEqual(
      mut_result.toSorted((a, b) => a - b),
      [1, 2, 3],
    );
  });

  test('should execute callback for each element', () => {
    const set = ISet.create([1, 2, 3]);

    const mut_collected: number[] = [];

    for (const value of set) {
      mut_collected.push(value);
    }

    assert.deepStrictEqual(
      mut_collected.toSorted((a, b) => a - b),
      [1, 2, 3],
    );
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

    assert.deepStrictEqual(
      mut_result.toSorted((a, b) => a - b),
      [1, 2, 3],
    );
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

    assert.deepStrictEqual(
      mut_result.toSorted((a, b) => a - b),
      [1, 2, 3],
    );
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

    assert.deepStrictEqual(
      mut_result.toSorted((a, b) => a[0] - b[0]),
      [
        [1, 1],
        [2, 2],
        [3, 3],
      ],
    );
  });
});

describe('ISet.toArray', () => {
  test('case 1', () => {
    const s0 = ISet.create([1, 2, 3] as const);

    expectType<typeof s0.toArray, () => readonly (1 | 2 | 3)[]>('<=');

    assert.deepStrictEqual(
      Array.from(s0.toArray()).toSorted((a, b) => a - b),
      [1, 2, 3],
    );
  });

  test('case 2', () => {
    const s0 = ISet.create<number>([]);

    assert.deepStrictEqual(s0.toArray(), []);
  });

  test('should convert set to array', () => {
    const set = ISet.create([1, 3, 2]);

    const array = set.toArray();

    expect(array).toHaveLength(3);

    assert.deepStrictEqual(
      Array.from(array).toSorted((a, b) => a - b),
      [1, 2, 3],
    );
  });
});

describe('ISet.toRawSet', () => {
  test('should return underlying ReadonlySet', () => {
    const set = ISet.create([1, 2, 3]);

    const rawSet = set.toRawSet();

    expect(rawSet.size).toBe(3);

    assert.isTrue(rawSet.has(1));

    assert.isTrue(rawSet.has(2));

    assert.isTrue(rawSet.has(3));
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

    assert.isTrue(ISet.equal(set1, set2));
  });

  test('should return false for sets with different sizes', () => {
    const set1 = ISet.create<'a' | 'b' | 'c' | 'd'>(['a', 'b']);

    const set2 = ISet.create<'a' | 'b' | 'c' | 'd'>(['a', 'b', 'c']);

    assert.isFalse(ISet.equal(set1, set2));
  });

  test('should return false for sets with different elements', () => {
    const set1 = ISet.create<'a' | 'b' | 'c' | 'd'>(['a', 'b', 'c']);

    const set2 = ISet.create<'a' | 'b' | 'c' | 'd'>(['a', 'b', 'd']);

    assert.isFalse(ISet.equal(set1, set2));
  });

  test('should return true for empty sets', () => {
    const set1 = ISet.create<string>([]);

    const set2 = ISet.create<string>([]);

    assert.isTrue(ISet.equal(set1, set2));
  });

  test('should handle sets with special values', () => {
    const set1 = ISet.create([Number.NaN, null, undefined]);

    const set2 = ISet.create([undefined, Number.NaN, null]);

    assert.isTrue(ISet.equal(set1, set2));
  });
});

describe('ISet.diff', () => {
  test('should compute differences between sets', () => {
    const oldSet = ISet.create<'a' | 'b' | 'c' | 'd'>(['a', 'b', 'c']);

    const newSet = ISet.create<'a' | 'b' | 'c' | 'd'>(['b', 'c', 'd']);

    const diff = ISet.diff(oldSet, newSet);

    expect(diff.deleted.size).toBe(1);

    assert.isTrue(diff.deleted.has('a'));

    expect(diff.added.size).toBe(1);

    assert.isTrue(diff.added.has('d'));
  });

  test('should handle no changes', () => {
    const set1 = ISet.create(['a', 'b', 'c']);

    const set2 = ISet.create(['a', 'b', 'c']);

    const diff = ISet.diff(set1, set2);

    assert.isTrue(diff.deleted.isEmpty);

    assert.isTrue(diff.added.isEmpty);
  });

  test('should handle complete replacement', () => {
    const oldSet = ISet.create<'a' | 'b' | 'c' | 'd'>(['a', 'b']);

    const newSet = ISet.create<'a' | 'b' | 'c' | 'd'>(['c', 'd']);

    const diff = ISet.diff(oldSet, newSet);

    expect(diff.deleted.size).toBe(2);

    assert.isTrue(diff.deleted.has('a'));

    assert.isTrue(diff.deleted.has('b'));

    expect(diff.added.size).toBe(2);

    assert.isTrue(diff.added.has('c'));

    assert.isTrue(diff.added.has('d'));
  });

  test('should handle empty sets', () => {
    const emptySet = ISet.create<string>([]);

    const nonEmptySet = ISet.create<string>(['a', 'b']);

    const diff1 = ISet.diff(emptySet, nonEmptySet);

    assert.isTrue(diff1.deleted.isEmpty);

    expect(diff1.added.size).toBe(2);

    const diff2 = ISet.diff(nonEmptySet, emptySet);

    expect(diff2.deleted.size).toBe(2);

    assert.isTrue(diff2.added.isEmpty);
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

    assert.isTrue(updated.has('b'));

    assert.isTrue(updated.has('c'));

    assert.isTrue(updated.has('d'));

    assert.isFalse(updated.has('a'));
  });

  test('should handle empty mutations array', () => {
    const set = ISet.create(['a', 'b', 'c']);

    const updated = set.withMutations([]);

    expect(updated.size).toBe(set.size);

    assert.isTrue(ISet.equal(set, updated));
  });

  test('should handle duplicate operations', () => {
    const set = ISet.create<'a' | 'b'>(['a']);

    const updated = set.withMutations([
      { type: 'add', key: 'a' }, // Already exists
      { type: 'delete', key: 'b' }, // Doesn't exist
      { type: 'add', key: 'b' },
    ]);

    expect(updated.size).toBe(2);

    assert.isTrue(updated.has('a'));

    assert.isTrue(updated.has('b'));
  });
});

describe('iterable functionality', () => {
  test('should work with for-of loops', () => {
    const set = ISet.create([1, 2, 3]);

    const mut_collected: number[] = [];

    for (const value of set) {
      mut_collected.push(value);
    }

    assert.deepStrictEqual(
      mut_collected.toSorted((a, b) => a - b),
      [1, 2, 3],
    );
  });

  test('should work with spread operator', () => {
    const set = ISet.create([1, 2, 3]);

    const array = Array.from(set);

    assert.deepStrictEqual(
      Array.from(array).toSorted((a, b) => a - b),
      [1, 2, 3],
    );
  });

  test('should work with Array.from', () => {
    const set = ISet.create([1, 2, 3]);

    const array = Array.from(set);

    assert.deepStrictEqual(
      Array.from(array).toSorted((a, b) => a - b),
      [1, 2, 3],
    );
  });

  test('should work with destructuring', () => {
    const set = ISet.create([1, 2]);

    const values = Array.from(set);

    assert.deepStrictEqual(
      values.toSorted((a, b) => a - b),
      [1, 2],
    );
  });
});

describe('edge cases', () => {
  test('should handle NaN correctly', () => {
    const set = ISet.create([Number.NaN, 1, 2]);

    assert.isTrue(set.has(Number.NaN));

    expect(set.size).toBe(3);
  });

  test('should handle boolean values', () => {
    const set = ISet.create([true, false, true]);

    expect(set.size).toBe(2);

    assert.isTrue(set.has(true));

    assert.isTrue(set.has(false));
  });

  test('should handle null and undefined', () => {
    const set = ISet.create([null, undefined, null]);

    expect(set.size).toBe(2);

    assert.isTrue(set.has(null));

    assert.isTrue(set.has(undefined));
  });

  test('should handle symbols by reference', () => {
    const sym1 = Symbol('test');

    const sym2 = Symbol('test'); // Different symbol, same description

    const set = ISet.create([sym1, sym2]);

    expect(set.size).toBe(2);

    assert.isTrue(set.has(sym1));

    assert.isTrue(set.has(sym2));

    assert.isFalse(set.has(Symbol('test'))); // Different symbol
  });
});

describe('immutability', () => {
  test('should not modify original set when adding', () => {
    const original = ISet.create<number>([1, 2, 3]);

    const modified = original.add(4);

    expect(original.size).toBe(3);

    expect(modified.size).toBe(4);

    assert.isFalse(original.has(4));

    assert.isTrue(modified.has(4));
  });

  test('should not modify original set when deleting', () => {
    const original = ISet.create([1, 2, 3]);

    const modified = original.delete(2);

    expect(original.size).toBe(3);

    expect(modified.size).toBe(2);

    assert.isTrue(original.has(2));

    assert.isFalse(modified.has(2));
  });

  test('should not modify original set when filtering', () => {
    const original = ISet.create([1, 2, 3, 4, 5]);

    const filtered = original.filter((x) => x % 2 === 0);

    expect(original.size).toBe(5);

    expect(filtered.size).toBe(2);

    assert.isTrue(original.has(1));

    assert.isFalse(filtered.has(1));
  });

  test('should not modify original set when mapping', () => {
    const original = ISet.create([1, 2, 3]);

    const mapped = original.map((x) => x * 2);

    expect(original.size).toBe(3);

    expect(mapped.size).toBe(3);

    assert.isTrue(original.has(1));

    assert.isFalse(mapped.has(1));

    assert.isTrue(mapped.has(2));
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
