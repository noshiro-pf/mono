import { Optional } from '../functional/index.mjs';
import { isString } from '../guard/index.mjs';
import { IMap } from './imap.mjs';

describe('IMap[Symbol.iterator]', () => {
  test('case 1', () => {
    const m0 = IMap.create(
      IMap.create([
        [1, 10],
        [2, 20],
        [3, 30],
      ] as const),
    );

    assert.deepStrictEqual(
      m0,
      IMap.create([
        [1, 10],
        [2, 20],
        [3, 30],
      ] as const),
    );
  });

  test('should work with for-of loops', () => {
    const map = IMap.create([
      ['a', 1],
      ['b', 2],
    ]);
    const mut_collected: (readonly [string, number])[] = [];

    for (const entry of map) {
      mut_collected.push(entry);
    }

    expect(mut_collected).toHaveLength(2);
    expect(mut_collected).toContainEqual(['a', 1]);
    expect(mut_collected).toContainEqual(['b', 2]);
  });

  test('should work with spread operator', () => {
    const map = IMap.create([
      ['a', 1],
      ['b', 2],
    ]);
    const entries = Array.from(map);

    expect(entries).toHaveLength(2);
    expect(entries).toContainEqual(['a', 1]);
    expect(entries).toContainEqual(['b', 2]);
  });

  test('should work with Array.from', () => {
    const map = IMap.create([
      ['a', 1],
      ['b', 2],
    ]);
    const entries = Array.from(map);

    expect(entries).toHaveLength(2);
    expect(entries).toContainEqual(['a', 1]);
    expect(entries).toContainEqual(['b', 2]);
  });
});

describe('IMap.create', () => {
  test('should create empty map', () => {
    const map = IMap.create<string, number>([]);

    expect(map.size).toBe(0);
  });

  test('should create map from JavaScript Map', () => {
    const jsMap = new Map([
      ['a', 1],
      ['b', 2],
    ]);
    const map = IMap.create(jsMap);

    expect(map.size).toBe(2);
    expect(Optional.unwrap(map.get('a'))).toBe(1);
    expect(Optional.unwrap(map.get('b'))).toBe(2);
  });

  test('should create map from another IMap', () => {
    const original = IMap.create([
      ['a', 1],
      ['b', 2],
    ]);
    const copy = IMap.create(original);

    expect(copy.size).toBe(2);
    expect(Optional.unwrap(copy.get('a'))).toBe(1);
    expect(Optional.unwrap(copy.get('b'))).toBe(2);
  });
});

describe('IMap.equal', () => {
  test('should return true for different maps', () => {
    const map1 = IMap.create([
      ['a', 1],
      ['b', 2],
    ]);
    const map2 = IMap.create([
      ['a', 1],
      ['b', 2],
    ]);

    expect(IMap.equal(map1, map2)).toBe(true);
  });

  test('should return true for different creation order', () => {
    const map1 = IMap.create([
      ['a', 1],
      ['b', 2],
    ]);
    const map2 = IMap.create([
      ['b', 2],
      ['a', 1],
    ]);

    expect(IMap.equal(map1, map2)).toBe(true);
  });

  test('should return false for maps with different sizes', () => {
    const map1 = IMap.create<'a' | 'b', number>([['a', 1]]);
    const map2 = IMap.create([
      ['a', 1],
      ['b', 2],
    ]);

    expect(IMap.equal(map1, map2)).toBe(false);
  });

  test('should return false for maps with different values', () => {
    const map1 = IMap.create([
      ['a', 1],
      ['b', 2],
    ]);
    const map2 = IMap.create([
      ['a', 1],
      ['b', 3],
    ]);

    expect(IMap.equal(map1, map2)).toBe(false);
  });

  test('should return false for maps with different keys', () => {
    const map1 = IMap.create<'a' | 'b' | 'c', number>([
      ['a', 1],
      ['b', 2],
    ]);
    const map2 = IMap.create<'a' | 'b' | 'c', number>([
      ['a', 1],
      ['c', 2],
    ]);

    expect(IMap.equal(map1, map2)).toBe(false);
  });

  test('should return true for empty maps', () => {
    const map1 = IMap.create<string, number>([]);
    const map2 = IMap.create<string, number>([]);

    expect(IMap.equal(map1, map2)).toBe(true);
  });
});

describe('IMap.size', () => {
  test('case 1', () => {
    const m0 = IMap.create([
      [1, 10],
      [2, 20],
      [3, 30],
    ] as const);

    expect(m0.size).toBe(3);
  });
});

describe('IMap.has', () => {
  test('case 1', () => {
    const m0 = IMap.create([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ] as const);

    expect(m0.has(6)).toBe(true);
  });

  test('case 2', () => {
    const m0 = IMap.create<number, number>([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ]);

    expect(m0.has(8)).toBe(false);
  });

  test('case 3', () => {
    const m0 = IMap.create<number, number>([]);

    expect(m0.has(0)).toBe(false);
  });

  test('case 4', () => {
    const m0 = IMap.create<number, number>([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
      [Number.NaN, 0],
    ] as const);

    expect(m0.has(Number.NaN)).toBe(true);
  });

  test('should handle boolean keys', () => {
    const map = IMap.create([
      [true, 'yes'],
      [false, 'no'],
    ]);

    expect(map.has(true)).toBe(true);
    expect(map.has(false)).toBe(true);
  });

  test('should handle string number keys', () => {
    const map = IMap.create([
      ['1', 'one'],
      ['2', 'two'],
    ]);

    expect(map.has('1')).toBe(true);
    expect(map.has(String(1))).toBe(true);
  });
});

describe('IMap.get', () => {
  test('case 1', () => {
    const m0 = IMap.create([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ] as const);

    assert.deepStrictEqual(m0.get(6), Optional.some(60));
  });

  test('case 2', () => {
    const m0 = IMap.create<number, number>([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ]);

    assert.deepStrictEqual(m0.get(8), Optional.none);
  });

  test('case 3', () => {
    const m0 = IMap.create<number, number>([]);

    assert.deepStrictEqual(m0.get(0), Optional.none);
  });

  test('case 4', () => {
    const m0 = IMap.create<number, number>([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
      [Number.NaN, 100],
    ] as const);

    assert.deepStrictEqual(m0.get(Number.NaN), Optional.some(100));
  });

  test('should handle undefined and null values', () => {
    const map = IMap.create([
      ['undef', undefined],
      ['null', null],
    ]);

    expect(Optional.unwrap(map.get('undef'))).toBeUndefined();
    expect(Optional.unwrap(map.get('null'))).toBeNull();
  });
});

describe('IMap.set', () => {
  test('case 1', () => {
    const m0 = IMap.create<number, number>([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ]);

    assert.deepStrictEqual(
      m0.set(9, 90),
      IMap.create([
        [1, 10],
        [3, 30],
        [5, 50],
        [6, 60],
        [7, 70],
        [9, 90],
      ]),
    );
    assert.deepStrictEqual(
      m0,
      IMap.create([
        [1, 10],
        [3, 30],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
  });

  test('case 2', () => {
    const m0 = IMap.create([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ]);

    assert.deepStrictEqual(
      m0.set(3, 40),
      IMap.create([
        [1, 10],
        [3, 40],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
    assert.deepStrictEqual(
      m0,
      IMap.create([
        [1, 10],
        [3, 30],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
  });

  test('case 3', () => {
    const m0 = IMap.create<number, number>([]);

    assert.deepStrictEqual(m0.set(1, 10), IMap.create([[1, 10]]));
    assert.deepStrictEqual(m0, IMap.create<number, number>([]));
  });

  test('should not create new instance when setting the same value', () => {
    const map = IMap.create([['a', 1]]);
    const updated = map.set('a', 1);

    expect(updated).toBe(map);
    expect(Optional.unwrap(updated.get('a'))).toBe(1);
  });

  test('should not create new instance even with same value', () => {
    const map = IMap.create([['a', 1]]);
    const curr = map.get('a');
    assert(Optional.isSome(curr));
    const updated = map.set('a', curr.value);

    expect(updated).toBe(map);
    expect(Optional.unwrap(updated.get('a'))).toBe(1);
  });

  test('should not modify original map when setting', () => {
    const original = IMap.create<string, number>([['a', 1]]);
    const modified = original.set('b', 2);

    expect(original.size).toBe(1);
    expect(modified.size).toBe(2);
    expect(original.has('b')).toBe(false);
    expect(modified.has('b')).toBe(true);
  });
});

describe('IMap.update', () => {
  test('case 1', () => {
    const m0 = IMap.create<number, number>([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ]);

    assert.deepStrictEqual(
      m0.update(9, (x) => 2 * x),
      IMap.create([
        [1, 10],
        [3, 30],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
    assert.deepStrictEqual(
      m0,
      IMap.create([
        [1, 10],
        [3, 30],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
  });

  test('case 2', () => {
    const m0 = IMap.create([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ]);

    assert.deepStrictEqual(
      m0.update(3, (x) => 2 * x),
      IMap.create([
        [1, 10],
        [3, 60],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
    assert.deepStrictEqual(
      m0,
      IMap.create([
        [1, 10],
        [3, 30],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
  });

  test('case 3', () => {
    const m0 = IMap.create<number, number>([]);

    assert.deepStrictEqual(
      m0.update(1, (x) => 2 * x),
      IMap.create([]),
    );
    assert.deepStrictEqual(m0, IMap.create<number, number>([]));
  });

  test('should not modify original map when updating', () => {
    const original = IMap.create([['a', 1]]);
    const modified = original.update('a', (x) => x * 2);

    expect(Optional.unwrap(original.get('a'))).toBe(1);
    expect(Optional.unwrap(modified.get('a'))).toBe(2);
  });
});

describe('IMap.delete', () => {
  test('case 1', () => {
    const m0 = IMap.create<number, number>([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ]);

    assert.deepStrictEqual(
      m0.delete(10),
      IMap.create([
        [1, 10],
        [3, 30],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
    assert.deepStrictEqual(
      m0,
      IMap.create([
        [1, 10],
        [3, 30],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
  });

  test('case 2', () => {
    const m0 = IMap.create([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ]);

    assert.deepStrictEqual(
      m0.delete(3),
      IMap.create<1 | 3 | 5 | 6 | 7, number>([
        [1, 10],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
    assert.deepStrictEqual(
      m0,
      IMap.create([
        [1, 10],
        [3, 30],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
  });

  test('case 3', () => {
    const m0 = IMap.create<number, number>([]);

    assert.deepStrictEqual(m0.delete(1), IMap.create([]));
    assert.deepStrictEqual(m0, IMap.create<number, number>([]));
  });

  test('should not modify original map when deleting', () => {
    const original = IMap.create([
      ['a', 1],
      ['b', 2],
    ]);
    const modified = original.delete('a');

    expect(original.size).toBe(2);
    expect(modified.size).toBe(1);
    expect(original.has('a')).toBe(true);
    expect(modified.has('a')).toBe(false);
  });
});

describe('IMap.every', () => {
  test('should return true when all elements satisfy predicate', () => {
    const map = IMap.create([
      ['a', 2],
      ['b', 4],
      ['c', 6],
    ]);

    expect(map.every((value) => value % 2 === 0)).toBe(true);
  });

  test('should return false when some elements do not satisfy predicate', () => {
    const map = IMap.create([
      ['a', 2],
      ['b', 3],
      ['c', 4],
    ]);

    expect(map.every((value) => value % 2 === 0)).toBe(false);
  });

  test('should return true for empty map', () => {
    const map = IMap.create<string, number>([]);

    expect(map.every((value) => value > 0)).toBe(true);
  });

  test('should work with key parameter', () => {
    const map = IMap.create([
      ['aa', 1],
      ['bb', 2],
      ['cc', 3],
    ]);

    expect(map.every((_value, key) => key.length === 2)).toBe(true);
  });

  test('should work as type guard', () => {
    const map = IMap.create<string, string | number>([
      ['a', 'hello'],
      ['b', 'world'],
    ]);
    if (map.every((value): value is string => typeof value === 'string')) {
      // Type should be narrowed to IMap<string, string>
      const firstValue = Optional.unwrap(map.get('a'));

      expect(isString(firstValue)).toBe(true);
    }
  });
});

describe('IMap.some', () => {
  test('should return true when at least one element satisfies predicate', () => {
    const map = IMap.create([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);

    expect(map.some((value) => value % 2 === 0)).toBe(true);
  });

  test('should return false when no elements satisfy predicate', () => {
    const map = IMap.create([
      ['a', 1],
      ['b', 3],
      ['c', 5],
    ]);

    expect(map.some((value) => value % 2 === 0)).toBe(false);
  });

  test('should return false for empty map', () => {
    const map = IMap.create<string, number>([]);

    expect(map.some((value) => value > 0)).toBe(false);
  });

  test('should work with key parameter', () => {
    const map = IMap.create([
      ['a', 1],
      ['bb', 2],
      ['c', 3],
    ]);

    expect(map.some((_value, key) => key.length > 1)).toBe(true);
  });
});

describe('IMap.withMutations', () => {
  test('should apply multiple mutations', () => {
    const map = IMap.create<string, number>([
      ['a', 1],
      ['b', 2],
    ]);

    const updated = map.withMutations([
      { type: 'set', key: 'c', value: 3 },
      { type: 'update', key: 'a', updater: (x: number) => x * 2 },
      { type: 'delete', key: 'b' },
    ]);

    expect(updated.size).toBe(2);
    expect(Optional.unwrap(updated.get('a'))).toBe(2);
    expect(Optional.unwrap(updated.get('c'))).toBe(3);
    expect(Optional.isNone(updated.get('b'))).toBe(true);
  });

  test('should handle empty mutations array', () => {
    const map = IMap.create([
      ['a', 1],
      ['b', 2],
    ]);
    const updated = map.withMutations([]);

    expect(updated.size).toBe(map.size);
    expect(Optional.unwrap(updated.get('a'))).toBe(1);
    expect(Optional.unwrap(updated.get('b'))).toBe(2);
  });

  test('should handle update on non-existent key', () => {
    const map = IMap.create<string, number>([['a', 1]]);
    const updated = map.withMutations([
      { type: 'update', key: 'nonexistent', updater: (x: number) => x * 2 },
    ]);

    expect(updated.size).toBe(map.size);
    expect(Optional.isNone(updated.get('nonexistent'))).toBe(true);
  });

  test('should handle mixed operations', () => {
    const map = IMap.create([['a', 1]]);
    const updated = map.withMutations([
      { type: 'set', key: 'a', value: 10 },
      { type: 'update', key: 'a', updater: (x: number) => x + 5 },
    ]);

    expect(Optional.unwrap(updated.get('a'))).toBe(15);
  });
});

describe('IMap.map', () => {
  test('should transform values', () => {
    const map = IMap.create([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);
    const doubled = map.map((value) => value * 2);

    expect(Optional.unwrap(doubled.get('a'))).toBe(2);
    expect(Optional.unwrap(doubled.get('b'))).toBe(4);
    expect(Optional.unwrap(doubled.get('c'))).toBe(6);
  });

  test('should work with key in mapping function', () => {
    const map = IMap.create([
      ['a', 1],
      ['b', 2],
    ]);
    const mapped = map.map((value, key) => `${key}-${value}`);

    expect(Optional.unwrap(mapped.get('a'))).toBe('a-1');
    expect(Optional.unwrap(mapped.get('b'))).toBe('b-2');
  });

  test('should change value types', () => {
    const map = IMap.create([
      ['a', 1],
      ['b', 2],
    ]);
    const stringified = map.map((value) => value.toString());

    expect(Optional.unwrap(stringified.get('a'))).toBe('1');
    expect(Optional.unwrap(stringified.get('b'))).toBe('2');
  });
});

describe('IMap.mapKeys', () => {
  test('should transform keys', () => {
    const map = IMap.create([
      ['a', 1],
      ['b', 2],
    ]);
    const mapped = map.mapKeys((key) => key.toUpperCase());

    expect(Optional.isNone(mapped.get('a'))).toBe(true);
    expect(Optional.unwrap(mapped.get('A'))).toBe(1);
    expect(Optional.unwrap(mapped.get('B'))).toBe(2);
  });

  test('should work with different key types', () => {
    const map = IMap.create([
      ['1', 'one'],
      ['2', 'two'],
    ]);
    const mapped = map.mapKeys((key) => Number.parseInt(key, 10));

    expect(Optional.unwrap(mapped.get(1))).toBe('one');
    expect(Optional.unwrap(mapped.get(2))).toBe('two');
  });
});

describe('IMap.mapEntries', () => {
  test('should transform both keys and values', () => {
    const map = IMap.create([
      ['a', 1],
      ['b', 2],
    ]);
    const mapped = map.mapEntries(([key, value]) => [
      key.toUpperCase(),
      value * 2,
    ]);

    expect(Optional.unwrap(mapped.get('A'))).toBe(2);
    expect(Optional.unwrap(mapped.get('B'))).toBe(4);
  });

  test('should work with type changes', () => {
    const map = IMap.create([
      ['a', 1],
      ['b', 2],
    ]);
    const mapped = map.mapEntries(([key, value]) => [value, key]);

    expect(Optional.unwrap(mapped.get(1))).toBe('a');
    expect(Optional.unwrap(mapped.get(2))).toBe('b');
  });
});

describe('IMap.forEach', () => {
  test('case 1', () => {
    const m0 = IMap.create([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ] as const);
    const keys = [1, 3, 5, 6, 7];
    const values = [10, 30, 50, 60, 70];

    for (const [key, value] of m0.entries()) {
      expect(keys).toContain(key);
      expect(values).toContain(value);
    }
  });

  test('should execute callback for each element', () => {
    const map = IMap.create([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);
    const mut_collected: [string, number][] = [];

    for (const [key, value] of map.entries()) {
      mut_collected.push([key, value]);
    }

    expect(mut_collected).toHaveLength(3);
    expect(mut_collected).toContainEqual(['a', 1]);
    expect(mut_collected).toContainEqual(['b', 2]);
    expect(mut_collected).toContainEqual(['c', 3]);
  });

  test('should work with empty map', () => {
    const map = IMap.create<string, number>([]);
    let mut_called = false;

    // eslint-disable-next-line unicorn/no-array-for-each
    map.forEach(() => {
      mut_called = true;
    });

    expect(mut_called).toBe(false);
  });
});

describe('IMap.keys', () => {
  test('case 1', () => {
    const m0 = IMap.create([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ] as const);
    const keys = [1, 3, 5, 6, 7];

    for (const k of m0.keys()) {
      expect(keys).toContain(k);
    }
  });
});

describe('IMap.values', () => {
  test('case 1', () => {
    const m0 = IMap.create([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ]);
    const values = [10, 30, 50, 60, 70];

    for (const v of m0.values()) {
      expect(values).toContain(v);
    }
  });
});

describe('IMap.entries', () => {
  test('case 1', () => {
    const m0 = IMap.create([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ]);
    const keys = [1, 3, 5, 6, 7];
    const values = [10, 30, 50, 60, 70];

    for (const [k, v] of m0.entries()) {
      expect(keys).toContain(k);
      expect(values).toContain(v);
    }
  });
});

describe('IMap.toKeysArray', () => {
  test('should return array of keys', () => {
    const map = IMap.create([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);
    const keys = map.toKeysArray();

    expect(keys).toHaveLength(3);
    expect(keys).toContain('a');
    expect(keys).toContain('b');
    expect(keys).toContain('c');
  });
});

describe('IMap.toValuesArray', () => {
  test('should return array of values', () => {
    const map = IMap.create([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);
    const values = map.toValuesArray();

    expect(values).toHaveLength(3);
    expect(values).toContain(1);
    expect(values).toContain(2);
    expect(values).toContain(3);
  });
});

describe('IMap.toEntriesArray', () => {
  test('should return array of entries', () => {
    const map = IMap.create([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);
    const entries = map.toEntriesArray();

    expect(entries).toHaveLength(3);
    expect(entries).toContainEqual(['a', 1]);
    expect(entries).toContainEqual(['b', 2]);
    expect(entries).toContainEqual(['c', 3]);
  });
});

describe('IMap.toArray', () => {
  test('should be alias for toEntriesArray', () => {
    const map = IMap.create([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);
    const entries = map.toArray();
    const entriesArray = map.toEntriesArray();

    assert.deepStrictEqual(entries, entriesArray);
  });
});

describe('IMap.toRawMap', () => {
  test('should return underlying ReadonlyMap', () => {
    const map = IMap.create([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);
    const rawMap = map.toRawMap();

    expect(rawMap.size).toBe(3);
    expect(rawMap.get('a')).toBe(1);
    expect(rawMap.get('b')).toBe(2);
    expect(rawMap.get('c')).toBe(3);
  });
});
