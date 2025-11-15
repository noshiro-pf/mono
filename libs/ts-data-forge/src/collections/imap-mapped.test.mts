import { Optional } from '../functional/index.mjs';
import { IMapMapped } from './imap-mapped.mjs';

const toKey = (a: Readonly<{ v: number }>): number => a.v;

const fromKey = (k: number): Readonly<{ v: number }> => ({ v: k });

type TestKey = { id: number; type: string };

const testKeyToString = (key: Readonly<TestKey>): string =>
  `${key.type}_${key.id}`;

const stringToTestKey = (str: string): TestKey => {
  const [type, idStr] = str.split('_');

  return { type: type ?? '', id: Number(idStr ?? '0') };
};

describe('IMapMapped[Symbol.iterator]', () => {
  test('case 1', () => {
    const s0 = IMapMapped.create(
      IMapMapped.create(
        [
          [{ v: 1 }, '1'],
          [{ v: 2 }, '2'],
          [{ v: 3 }, '3'],
        ],
        toKey,
        fromKey,
      ),
      toKey,
      fromKey,
    );

    assert.deepStrictEqual(
      s0,
      IMapMapped.create(
        [
          [{ v: 1 }, '1'],
          [{ v: 2 }, '2'],
          [{ v: 3 }, '3'],
        ],
        toKey,
        fromKey,
      ),
    );
  });
});

describe('IMapMapped.create', () => {
  test('should create empty map', () => {
    const map = IMapMapped.create<TestKey, string, string>(
      [],
      testKeyToString,
      stringToTestKey,
    );

    expect(map.size).toBe(0);
  });

  test('should create map with initial entries', () => {
    const map = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    expect(map.size).toBe(2);

    expect(Optional.unwrap(map.get({ id: 1, type: 'user' }))).toBe('Alice');

    expect(Optional.unwrap(map.get({ id: 2, type: 'admin' }))).toBe('Bob');
  });

  test('should create map from another IMapMapped', () => {
    const original = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    const copy = IMapMapped.create(original, testKeyToString, stringToTestKey);

    expect(copy.size).toBe(2);

    expect(Optional.unwrap(copy.get({ id: 1, type: 'user' }))).toBe('Alice');

    expect(Optional.unwrap(copy.get({ id: 2, type: 'admin' }))).toBe('Bob');
  });

  test('should handle complex key transformations', () => {
    type ComplexKey = { nested: { id: number }; arr: number[] };

    const complexKeyToString = (
      key: DeepReadonly<{
        nested: { id: number };
        arr: number[];
      }>,
    ): string => `${key.nested.id}_${key.arr.join(',')}`;

    const stringToComplexKey = (str: string): ComplexKey => {
      const [idStr, arrStr] = str.split('_');

      return {
        nested: { id: Number(idStr ?? '0') },
        arr: (arrStr ?? '').split(',').map(Number),
      };
    };

    const map = IMapMapped.create<ComplexKey, string, string>(
      [[{ nested: { id: 1 }, arr: [1, 2, 3] }, 'test']],
      complexKeyToString,
      stringToComplexKey,
    );

    expect(map.size).toBe(1);

    expect(
      Optional.unwrap(map.get({ nested: { id: 1 }, arr: [1, 2, 3] })),
    ).toBe('test');
  });
});

describe('IMapMapped.equal', () => {
  test('should return true for equal maps', () => {
    const map1 = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    const map2 = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    // Test structural equality, not reference equality
    expect(map1.size).toBe(map2.size);

    expect(map1.has({ id: 1, type: 'user' })).toBe(true);

    expect(map2.has({ id: 1, type: 'user' })).toBe(true);

    expect(Optional.unwrap(map1.get({ id: 1, type: 'user' }))).toBe(
      Optional.unwrap(map2.get({ id: 1, type: 'user' })),
    );
  });

  test('should return false for maps with different values', () => {
    const map1 = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    const map2 = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Charlie'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    expect(IMapMapped.equal(map1, map2)).toBe(false);
  });

  test('should return false for maps with different keys', () => {
    const map1 = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    const map2 = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 3, type: 'guest' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    expect(IMapMapped.equal(map1, map2)).toBe(false);
  });

  test('should return true for empty maps', () => {
    const map1 = IMapMapped.create<TestKey, string, string>(
      [],
      testKeyToString,
      stringToTestKey,
    );

    const map2 = IMapMapped.create<TestKey, string, string>(
      [],
      testKeyToString,
      stringToTestKey,
    );

    expect(IMapMapped.equal(map1, map2)).toBe(true);
  });
});

describe('IMapMapped.size', () => {
  test('case 1', () => {
    const s0 = IMapMapped.create(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey,
    );

    expect(s0.size).toBe(3);
  });
});

describe('IMapMapped.has', () => {
  test('case 1', () => {
    const s0 = IMapMapped.create(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey,
    );

    expect(s0.has({ v: 3 })).toBe(true);
  });

  test('case 2', () => {
    const s0 = IMapMapped.create(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey,
    );

    expect(s0.has({ v: 4 })).toBe(false);
  });

  test('case 3', () => {
    const s0 = IMapMapped.create<Readonly<{ v: number }>, string, number>(
      [],
      toKey,
      fromKey,
    );

    expect(s0.has({ v: 3 })).toBe(false);
  });
});

describe('IMapMapped.get', () => {
  test('case 1', () => {
    const s0 = IMapMapped.create(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey,
    );

    assert.deepStrictEqual(s0.get({ v: 3 }), Optional.some('3'));
  });

  test('case 2', () => {
    const s0 = IMapMapped.create(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey,
    );

    assert.deepStrictEqual(s0.get({ v: 4 }), Optional.none);
  });

  test('case 3', () => {
    const s0 = IMapMapped.create<Readonly<{ v: number }>, string, number>(
      [],
      toKey,
      fromKey,
    );

    assert.deepStrictEqual(s0.get({ v: 3 }), Optional.none);
  });
});

describe('IMapMapped.set', () => {
  test('case 1', () => {
    const s0 = IMapMapped.create(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey,
    );

    assert.deepStrictEqual(
      s0.set({ v: 5 }, '5'),
      IMapMapped.create(
        [
          [{ v: 1 }, '1'],
          [{ v: 2 }, '2'],
          [{ v: 3 }, '3'],
          [{ v: 5 }, '5'],
        ],
        toKey,
        fromKey,
      ),
    );

    assert.deepStrictEqual(
      s0,
      IMapMapped.create(
        [
          [{ v: 1 }, '1'],
          [{ v: 2 }, '2'],
          [{ v: 3 }, '3'],
        ],
        toKey,
        fromKey,
      ),
    );
  });

  test('case 2', () => {
    const s0 = IMapMapped.create(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey,
    );

    assert.deepStrictEqual(
      s0.set({ v: 3 }, '3'),
      IMapMapped.create(
        [
          [{ v: 1 }, '1'],
          [{ v: 2 }, '2'],
          [{ v: 3 }, '3'],
        ],
        toKey,
        fromKey,
      ),
    );

    assert.deepStrictEqual(
      s0,
      IMapMapped.create(
        [
          [{ v: 1 }, '1'],
          [{ v: 2 }, '2'],
          [{ v: 3 }, '3'],
        ],
        toKey,
        fromKey,
      ),
    );
  });

  test('case 3', () => {
    const s0 = IMapMapped.create<Readonly<{ v: number }>, string, number>(
      [],
      toKey,
      fromKey,
    );

    assert.deepStrictEqual(
      s0.set({ v: 1 }, '1'),
      IMapMapped.create([[{ v: 1 }, '1']], toKey, fromKey),
    );

    assert.deepStrictEqual(s0, IMapMapped.create([], toKey, fromKey));
  });
});

describe('IMapMapped.update', () => {
  test('should update existing key', () => {
    const map = IMapMapped.create(
      [[{ id: 1, type: 'user' }, 'Alice']],
      testKeyToString,
      stringToTestKey,
    );

    const updated = map.update({ id: 1, type: 'user' }, (name) =>
      name.toUpperCase(),
    );

    expect(Optional.unwrap(updated.get({ id: 1, type: 'user' }))).toBe('ALICE');
  });

  test('should not update non-existent key', () => {
    const map = IMapMapped.create(
      [[{ id: 1, type: 'user' }, 'Alice']],
      testKeyToString,
      stringToTestKey,
    );

    const updated = map.update({ id: 2, type: 'user' }, (name) =>
      name.toUpperCase(),
    );

    expect(updated).toBe(map);

    expect(Optional.isNone(updated.get({ id: 2, type: 'user' }))).toBe(true);
  });
});

describe('IMapMapped.delete', () => {
  test('case 1', () => {
    const s0 = IMapMapped.create(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey,
    );

    assert.deepStrictEqual(
      s0.delete({ v: 10 }),
      IMapMapped.create(
        [
          [{ v: 1 }, '1'],
          [{ v: 2 }, '2'],
          [{ v: 3 }, '3'],
        ],
        toKey,
        fromKey,
      ),
    );

    assert.deepStrictEqual(
      s0,
      IMapMapped.create(
        [
          [{ v: 1 }, '1'],
          [{ v: 2 }, '2'],
          [{ v: 3 }, '3'],
        ],
        toKey,
        fromKey,
      ),
    );
  });

  test('case 2', () => {
    const s0 = IMapMapped.create(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey,
    );

    assert.deepStrictEqual(
      s0.delete({ v: 3 }),
      IMapMapped.create(
        [
          [{ v: 1 }, '1'],
          [{ v: 2 }, '2'],
        ],
        toKey,
        fromKey,
      ),
    );

    assert.deepStrictEqual(
      s0,
      IMapMapped.create(
        [
          [{ v: 1 }, '1'],
          [{ v: 2 }, '2'],
          [{ v: 3 }, '3'],
        ],
        toKey,
        fromKey,
      ),
    );
  });

  test('case 3', () => {
    const s0 = IMapMapped.create([], toKey, fromKey);

    assert.deepStrictEqual(
      s0.delete({ v: 1 }),
      IMapMapped.create([], toKey, fromKey),
    );

    assert.deepStrictEqual(s0, IMapMapped.create([], toKey, fromKey));
  });

  test('should delete entry if it exists', () => {
    const map = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    const updated = map.delete({ id: 2, type: 'admin' });

    expect(updated).not.toBe(map); // Should return new instance

    expect(updated.size).toBe(1);

    expect(map.size).toBe(2); // Original unchanged
  });
});

describe('IMapMapped.every', () => {
  test('should return true when all values satisfy predicate', () => {
    const map = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    expect(map.every((value) => typeof value === 'string')).toBe(true);
  });

  test('should return false when some values do not satisfy predicate', () => {
    const map = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    expect(map.every((value) => value.length > 5)).toBe(false);
  });

  test('should return true for empty map', () => {
    const map = IMapMapped.create<TestKey, string, string>(
      [],
      testKeyToString,
      stringToTestKey,
    );

    expect(map.every((value) => value.length > 0)).toBe(true);
  });
});

describe('IMapMapped.some', () => {
  test('should return true when at least one value satisfies predicate', () => {
    const map = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    // eslint-disable-next-line unicorn/prefer-includes
    expect(map.some((value) => value === 'Alice')).toBe(true);
  });

  test('should return false when no values satisfy predicate', () => {
    const map = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    // eslint-disable-next-line unicorn/prefer-includes
    expect(map.some((value) => value === 'Charlie')).toBe(false);
  });

  test('should return false for empty map', () => {
    const map = IMapMapped.create<TestKey, string, string>(
      [],
      testKeyToString,
      stringToTestKey,
    );

    expect(map.some((value) => value.length > 0)).toBe(false);
  });
});

describe('IMapMapped.withMutations', () => {
  test('should apply multiple mutations', () => {
    const map = IMapMapped.create<TestKey, string, string>(
      [[{ id: 1, type: 'user' }, 'Alice']],
      testKeyToString,
      stringToTestKey,
    );

    const updated = map.withMutations([
      { type: 'set', key: { id: 2, type: 'admin' }, value: 'Bob' },
      {
        type: 'update',
        key: { id: 1, type: 'user' },
        updater: (x) => x.toUpperCase(),
      },
      { type: 'delete', key: { id: 3, type: 'guest' } },
    ]);

    expect(updated.size).toBe(2);

    expect(Optional.unwrap(updated.get({ id: 1, type: 'user' }))).toBe('ALICE');

    expect(Optional.unwrap(updated.get({ id: 2, type: 'admin' }))).toBe('Bob');
  });

  test('should handle empty mutations array', () => {
    const map = IMapMapped.create(
      [[{ id: 1, type: 'user' }, 'Alice']],
      testKeyToString,
      stringToTestKey,
    );

    const updated = map.withMutations([]);

    expect(updated.size).toBe(1);

    expect(Optional.unwrap(updated.get({ id: 1, type: 'user' }))).toBe('Alice');
  });
});

describe('IMapMapped.map', () => {
  test('should transform values', () => {
    const map = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    const transformed = map.map((value) => value.toUpperCase());

    expect(Optional.unwrap(transformed.get({ id: 1, type: 'user' }))).toBe(
      'ALICE',
    );

    expect(Optional.unwrap(transformed.get({ id: 2, type: 'admin' }))).toBe(
      'BOB',
    );
  });

  test('should work with key parameter', () => {
    const map = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    const transformed = map.map((value, key) => `${key.type}:${value}`);

    expect(Optional.unwrap(transformed.get({ id: 1, type: 'user' }))).toBe(
      'user:Alice',
    );

    expect(Optional.unwrap(transformed.get({ id: 2, type: 'admin' }))).toBe(
      'admin:Bob',
    );
  });
});

describe('IMapMapped.mapKeys', () => {
  test('should transform keys', () => {
    const map = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    const transformed = map.mapKeys((key) => ({ ...key, id: key.id * 10 }));

    expect(Optional.isNone(transformed.get({ id: 1, type: 'user' }))).toBe(
      true,
    );

    expect(Optional.unwrap(transformed.get({ id: 10, type: 'user' }))).toBe(
      'Alice',
    );

    expect(Optional.unwrap(transformed.get({ id: 20, type: 'admin' }))).toBe(
      'Bob',
    );
  });
});

describe('IMapMapped.mapEntries', () => {
  test('should transform both keys and values', () => {
    const map = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    const transformed = map.mapEntries(([key, value]) => [
      { ...key, id: key.id * 10 },
      value.toUpperCase(),
    ]);

    expect(Optional.unwrap(transformed.get({ id: 10, type: 'user' }))).toBe(
      'ALICE',
    );

    expect(Optional.unwrap(transformed.get({ id: 20, type: 'admin' }))).toBe(
      'BOB',
    );
  });
});

describe('IMapMapped.forEach', () => {
  test('case 1', () => {
    const s0 = IMapMapped.create(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey,
    );

    const keys = [{ v: 1 }, { v: 2 }, { v: 3 }];

    const values = ['1', '2', '3'];

    for (const [key, value] of s0.entries()) {
      expect(keys).toContainEqual(key);

      expect(values).toContainEqual(value);
    }
  });

  test('should execute callback for each element', () => {
    const map = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    const mut_collected: [TestKey, string][] = [];

    for (const [key, value] of map.entries()) {
      mut_collected.push([key, value]);
    }

    expect(mut_collected).toHaveLength(2);

    expect(mut_collected).toContainEqual([{ id: 1, type: 'user' }, 'Alice']);

    expect(mut_collected).toContainEqual([{ id: 2, type: 'admin' }, 'Bob']);
  });
});

describe('IMapMapped.keys', () => {
  test('case 1', () => {
    const s0 = IMapMapped.create(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey,
    );

    const keys = [{ v: 1 }, { v: 2 }, { v: 3 }];

    for (const k of s0.keys()) {
      expect(keys).toContainEqual(k);
    }
  });
});

describe('IMapMapped.values', () => {
  test('case 1', () => {
    const s0 = IMapMapped.create(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey,
    );

    const values = ['1', '2', '3'];

    for (const v of s0.values()) {
      expect(values).toContainEqual(v);
    }
  });
});

describe('IMapMapped.entries', () => {
  test('case 1', () => {
    const s0 = IMapMapped.create(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey,
    );

    const keys = [{ v: 1 }, { v: 2 }, { v: 3 }];

    const values = ['1', '2', '3'];

    for (const [k, v] of s0.entries()) {
      expect(keys).toContainEqual(k);

      expect(values).toContainEqual(v);
    }
  });
});

describe('IMapMapped.toKeysArray', () => {
  test('should return array of original keys', () => {
    const map = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    const keys = map.toKeysArray();

    expect(keys).toHaveLength(2);

    expect(keys).toContainEqual({ id: 1, type: 'user' });

    expect(keys).toContainEqual({ id: 2, type: 'admin' });
  });
});

describe('IMapMapped.toValuesArray', () => {
  test('should return array of values', () => {
    const map = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    const values = map.toValuesArray();

    expect(values).toHaveLength(2);

    expect(values).toContain('Alice');

    expect(values).toContain('Bob');
  });
});

describe('IMapMapped.toEntriesArray', () => {
  test('should return array of entries', () => {
    const map = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    const entries = map.toEntriesArray();

    expect(entries).toHaveLength(2);

    expect(entries).toContainEqual([{ id: 1, type: 'user' }, 'Alice']);

    expect(entries).toContainEqual([{ id: 2, type: 'admin' }, 'Bob']);
  });
});

describe('IMapMapped.toArray', () => {
  test('should be alias for toEntriesArray', () => {
    const map = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    const entries = map.toArray();

    const entriesArray = map.toEntriesArray();

    assert.deepStrictEqual(entries, entriesArray);
  });
});

describe('IMapMapped.toRawMap', () => {
  test('should return underlying map with transformed keys', () => {
    const map = IMapMapped.create(
      [
        [{ id: 1, type: 'user' }, 'Alice'],
        [{ id: 2, type: 'admin' }, 'Bob'],
      ],
      testKeyToString,
      stringToTestKey,
    );

    const rawMap = map.toRawMap();

    expect(rawMap.size).toBe(2);

    expect(rawMap.get('user_1')).toBe('Alice');

    expect(rawMap.get('admin_2')).toBe('Bob');
  });
});
