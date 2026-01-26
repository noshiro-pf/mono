import { ISetMapped } from './iset-mapped.mjs';

const toKey = (a: Readonly<{ v: number }>): number => a.v;

const fromKey = (k: number): Readonly<{ v: number }> => ({ v: k });

// Test types for additional functionality
type TestElement = Readonly<{ id: number; type: string }>;

const testElementToString = (el: Readonly<TestElement>): string =>
  `${el.type}_${el.id}`;

const stringToTestElement = (str: string): TestElement => {
  const [type, idStr] = str.split('_');

  return { type: type ?? '', id: Number(idStr ?? '0') };
};

describe('ISetMapped[Symbol.iterator]', () => {
  test('case 1', () => {
    const s0 = ISetMapped.create(
      ISetMapped.create([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey),
      toKey,
      fromKey,
    );

    assert.deepStrictEqual(
      s0,
      ISetMapped.create([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey),
    );
  });
});

describe('ISetMapped.size', () => {
  test('case 1', () => {
    const s0 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    expect(s0.size).toBe(3);
  });
});

describe('ISetMapped.has', () => {
  test('case 1', () => {
    const s0 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    assert.isTrue(s0.has({ v: 3 }));
  });

  test('case 2', () => {
    const s0 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    assert.isFalse(s0.has({ v: 4 }));
  });

  test('case 3', () => {
    const s0 = ISetMapped.create<Readonly<{ v: number }>, number>(
      [],
      toKey,
      fromKey,
    );

    assert.isFalse(s0.has({ v: 3 }));
  });
});

describe('ISetMapped.add', () => {
  test('case 1', () => {
    const s0 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    assert.deepStrictEqual(
      s0.add({ v: 5 }),
      ISetMapped.create(
        [{ v: 1 }, { v: 2 }, { v: 3 }, { v: 5 }],
        toKey,
        fromKey,
      ),
    );

    assert.deepStrictEqual(
      s0,
      ISetMapped.create([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey),
    );
  });

  test('case 2', () => {
    const s0 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    assert.deepStrictEqual(
      s0.add({ v: 3 }),
      ISetMapped.create([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey),
    );

    assert.deepStrictEqual(
      s0,
      ISetMapped.create([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey),
    );
  });

  test('case 3', () => {
    const s0 = ISetMapped.create([], toKey, fromKey);

    assert.deepStrictEqual(
      s0.add({ v: 1 }),
      ISetMapped.create([{ v: 1 }], toKey, fromKey),
    );

    assert.deepStrictEqual(s0, ISetMapped.create([], toKey, fromKey));
  });
});

describe('ISetMapped.delete', () => {
  test('case 1', () => {
    const s0 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    assert.deepStrictEqual(
      s0.delete({ v: 10 }),
      ISetMapped.create([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey),
    );

    assert.deepStrictEqual(
      s0,
      ISetMapped.create([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey),
    );
  });

  test('case 2', () => {
    const s0 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    assert.deepStrictEqual(
      s0.delete({ v: 3 }),
      ISetMapped.create([{ v: 1 }, { v: 2 }], toKey, fromKey),
    );

    assert.deepStrictEqual(
      s0,
      ISetMapped.create([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey),
    );
  });

  test('case 3', () => {
    const s0 = ISetMapped.create([], toKey, fromKey);

    assert.deepStrictEqual(
      s0.delete({ v: 1 }),
      ISetMapped.create([], toKey, fromKey),
    );

    assert.deepStrictEqual(s0, ISetMapped.create([], toKey, fromKey));
  });
});

describe('ISetMapped.forEach', () => {
  test('case 1', () => {
    const s0 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    const elements = [{ v: 1 }, { v: 2 }, { v: 3 }];

    for (const el of s0) {
      expect(elements).toContainEqual(el);
    }
  });
});

describe('ISetMapped.keys', () => {
  test('case 1', () => {
    const s0 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    const elements = [{ v: 1 }, { v: 2 }, { v: 3 }];

    for (const k of s0.keys()) {
      expect(elements).toContainEqual(k);
    }
  });
});

describe('ISetMapped.values', () => {
  test('case 1', () => {
    const s0 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    const elements = [{ v: 1 }, { v: 2 }, { v: 3 }];

    for (const v of s0.values()) {
      expect(elements).toContainEqual(v);
    }
  });
});

describe('ISetMapped.entries', () => {
  test('case 1', () => {
    const s0 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    const elements = [{ v: 1 }, { v: 2 }, { v: 3 }];

    for (const [k, v] of s0.entries()) {
      expect(elements).toContainEqual(k);

      expect(elements).toContainEqual(v);

      assert.deepStrictEqual(k, v);
    }
  });
});

describe('ISetMapped.subtract', () => {
  test('case 1', () => {
    const s0 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    const s1 = ISetMapped.create([{ v: 2 }, { v: 4 }], toKey, fromKey);

    assert.deepStrictEqual(
      s0.subtract(s1),
      ISetMapped.create([{ v: 1 }, { v: 3 }], toKey, fromKey),
    );
  });

  test('case 2', () => {
    const s0 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    const s1 = ISetMapped.create([], toKey, fromKey);

    assert.deepStrictEqual(
      s0.subtract(s1),
      ISetMapped.create([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey),
    );
  });

  test('case 3', () => {
    const s0 = ISetMapped.create([], toKey, fromKey);

    const s1 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    assert.deepStrictEqual(
      s0.subtract(s1),
      ISetMapped.create([], toKey, fromKey),
    );
  });
});

describe('ISetMapped.diff', () => {
  test('case 1', () => {
    const s0 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    const s1 = ISetMapped.create(
      [{ v: 2 }, { v: 3 }, { v: 4 }],
      toKey,
      fromKey,
    );

    const diff = ISetMapped.diff(s0, s1);

    assert.deepStrictEqual(
      diff.deleted,
      ISetMapped.create([{ v: 1 }], toKey, fromKey),
    );

    assert.deepStrictEqual(
      diff.added,
      ISetMapped.create([{ v: 4 }], toKey, fromKey),
    );
  });

  test('case 2', () => {
    const s0 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    const s1 = ISetMapped.create([], toKey, fromKey);

    const diff = ISetMapped.diff(s0, s1);

    assert.deepStrictEqual(
      diff.deleted,
      ISetMapped.create([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey),
    );

    assert.deepStrictEqual(diff.added, ISetMapped.create([], toKey, fromKey));
  });

  test('case 3', () => {
    const s0 = ISetMapped.create([], toKey, fromKey);

    const s1 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    const diff = ISetMapped.diff(s0, s1);

    assert.deepStrictEqual(diff.deleted, ISetMapped.create([], toKey, fromKey));

    assert.deepStrictEqual(
      diff.added,
      ISetMapped.create([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey),
    );
  });
});

describe('ISetMapped.union', () => {
  test('case 1', () => {
    const s0 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    const s1 = ISetMapped.create(
      [{ v: 3 }, { v: 4 }, { v: 5 }],
      toKey,
      fromKey,
    );

    assert.deepStrictEqual(
      ISetMapped.union(s0, s1),
      ISetMapped.create(
        [{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }, { v: 5 }],
        toKey,
        fromKey,
      ),
    );
  });

  test('case 2', () => {
    const s0 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    const s1 = ISetMapped.create([], toKey, fromKey);

    assert.deepStrictEqual(
      ISetMapped.union(s0, s1),
      ISetMapped.create([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey),
    );
  });

  test('case 3', () => {
    const s0 = ISetMapped.create([], toKey, fromKey);

    const s1 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    assert.deepStrictEqual(
      ISetMapped.union(s0, s1),
      ISetMapped.create([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey),
    );
  });
});

describe('ISetMapped.intersection', () => {
  test('case 1', () => {
    const s0 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    const s1 = ISetMapped.create(
      [{ v: 2 }, { v: 3 }, { v: 4 }],
      toKey,
      fromKey,
    );

    assert.deepStrictEqual(
      ISetMapped.intersection(s0, s1),
      ISetMapped.create([{ v: 2 }, { v: 3 }], toKey, fromKey),
    );
  });

  test('case 2', () => {
    const s0 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    const s1 = ISetMapped.create([], toKey, fromKey);

    assert.deepStrictEqual(
      ISetMapped.intersection(s0, s1),
      ISetMapped.create([], toKey, fromKey),
    );
  });

  test('case 3', () => {
    const s0 = ISetMapped.create([], toKey, fromKey);

    const s1 = ISetMapped.create(
      [{ v: 1 }, { v: 2 }, { v: 3 }],
      toKey,
      fromKey,
    );

    assert.deepStrictEqual(
      ISetMapped.intersection(s0, s1),
      ISetMapped.create([], toKey, fromKey),
    );
  });
});

describe('ISetMapped additional functionality with complex types', () => {
  describe('ISetMapped.create', () => {
    test('should create empty set', () => {
      const set = ISetMapped.create<TestElement, string>(
        [],
        testElementToString,
        stringToTestElement,
      );

      expect(set.size).toBe(0);
    });

    test('should create set with initial elements', () => {
      const set = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      expect(set.size).toBe(2);

      assert.isTrue(set.has({ id: 1, type: 'user' }));

      assert.isTrue(set.has({ id: 2, type: 'admin' }));
    });

    test('should handle duplicate elements based on mapping', () => {
      const set = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 1, type: 'user' }, // Duplicate
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      expect(set.size).toBe(2);
    });
  });

  describe('ISetMapped.equal', () => {
    test('should return true for equal sets', () => {
      const set1 = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const set2 = ISetMapped.create(
        [
          { id: 2, type: 'admin' },
          { id: 1, type: 'user' },
        ],
        testElementToString,
        stringToTestElement,
      );

      assert.isTrue(ISetMapped.equal(set1, set2));
    });

    test('should return false for sets with different elements', () => {
      const set1 = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const set2 = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 3, type: 'guest' },
        ],
        testElementToString,
        stringToTestElement,
      );

      assert.isFalse(ISetMapped.equal(set1, set2));
    });

    test('should return true for empty sets', () => {
      const set1 = ISetMapped.create<TestElement, string>(
        [],
        testElementToString,
        stringToTestElement,
      );

      const set2 = ISetMapped.create<TestElement, string>(
        [],
        testElementToString,
        stringToTestElement,
      );

      assert.isTrue(ISetMapped.equal(set1, set2));
    });
  });

  describe('diff method with complex types', () => {
    test('should compute differences correctly', () => {
      const oldSet = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
          { id: 3, type: 'guest' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const newSet = ISetMapped.create(
        [
          { id: 2, type: 'admin' },
          { id: 3, type: 'guest' },
          { id: 4, type: 'user' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const diff = ISetMapped.diff(oldSet, newSet);

      expect(diff.deleted.size).toBe(1);

      assert.isTrue(diff.deleted.has({ id: 1, type: 'user' }));

      expect(diff.added.size).toBe(1);

      assert.isTrue(diff.added.has({ id: 4, type: 'user' }));
    });

    test('should handle no changes', () => {
      const set1 = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const set2 = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const diff = ISetMapped.diff(set1, set2);

      expect(diff.deleted.size).toBe(0);

      expect(diff.added.size).toBe(0);
    });
  });

  describe('intersection and union with complex types', () => {
    test('should compute intersection correctly', () => {
      const set1 = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
          { id: 3, type: 'guest' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const set2 = ISetMapped.create(
        [
          { id: 2, type: 'admin' },
          { id: 3, type: 'guest' },
          { id: 4, type: 'user' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const intersection = ISetMapped.intersection(set1, set2);

      expect(intersection.size).toBe(2);

      assert.isTrue(intersection.has({ id: 2, type: 'admin' }));

      assert.isTrue(intersection.has({ id: 3, type: 'guest' }));
    });

    test('should compute union correctly', () => {
      const set1 = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const set2 = ISetMapped.create(
        [
          { id: 3, type: 'guest' },
          { id: 4, type: 'user' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const union = ISetMapped.union(set1, set2);

      expect(union.size).toBe(4);

      assert.isTrue(union.has({ id: 1, type: 'user' }));

      assert.isTrue(union.has({ id: 2, type: 'admin' }));

      assert.isTrue(union.has({ id: 3, type: 'guest' }));

      assert.isTrue(union.has({ id: 4, type: 'user' }));
    });
  });

  describe('every method', () => {
    test('should return true when all elements satisfy predicate', () => {
      const set = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'user' },
        ],
        testElementToString,
        stringToTestElement,
      );

      assert.isTrue(set.every((el) => el.type === 'user'));
    });

    test('should return false when some elements do not satisfy predicate', () => {
      const set = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      assert.isFalse(set.every((el) => el.type === 'user'));
    });
  });

  describe('some method', () => {
    test('should return true when at least one element satisfies predicate', () => {
      const set = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      assert.isTrue(set.some((el) => el.type === 'admin'));
    });

    test('should return false when no elements satisfy predicate', () => {
      const set = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'user' },
        ],
        testElementToString,
        stringToTestElement,
      );

      assert.isFalse(set.some((el) => el.type === 'admin'));
    });
  });

  describe('add method', () => {
    test('should add new element', () => {
      const set = ISetMapped.create(
        [{ id: 1, type: 'user' }],
        testElementToString,
        stringToTestElement,
      );

      const updated = set.add({ id: 2, type: 'admin' });

      expect(updated.size).toBe(2);

      assert.isTrue(updated.has({ id: 1, type: 'user' }));

      assert.isTrue(updated.has({ id: 2, type: 'admin' }));
    });

    test('should return same instance when adding existing element', () => {
      const set = ISetMapped.create(
        [{ id: 1, type: 'user' }],
        testElementToString,
        stringToTestElement,
      );

      const updated = set.add({ id: 1, type: 'user' });

      expect(updated).toBe(set);
    });
  });

  describe('delete method', () => {
    test('should delete existing element', () => {
      const set = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const updated = set.delete({ id: 1, type: 'user' });

      expect(updated.size).toBe(1);

      assert.isFalse(updated.has({ id: 1, type: 'user' }));

      assert.isTrue(updated.has({ id: 2, type: 'admin' }));
    });

    test('should return same instance when deleting non-existent element', () => {
      const set = ISetMapped.create(
        [{ id: 1, type: 'user' }],
        testElementToString,
        stringToTestElement,
      );

      const updated = set.delete({ id: 2, type: 'admin' });

      expect(updated).toBe(set);
    });
  });

  describe('withMutations method', () => {
    test('should apply multiple mutations', () => {
      const set = ISetMapped.create<TestElement, string>(
        [{ id: 1, type: 'user' }],
        testElementToString,
        stringToTestElement,
      );

      const updated = set.withMutations([
        { type: 'add', key: { id: 2, type: 'admin' } },
        { type: 'delete', key: { id: 1, type: 'user' } },
        { type: 'add', key: { id: 3, type: 'guest' } },
      ]);

      expect(updated.size).toBe(2);

      assert.isFalse(updated.has({ id: 1, type: 'user' }));

      assert.isTrue(updated.has({ id: 2, type: 'admin' }));

      assert.isTrue(updated.has({ id: 3, type: 'guest' }));
    });

    test('should handle empty mutations array', () => {
      const set = ISetMapped.create(
        [{ id: 1, type: 'user' }],
        testElementToString,
        stringToTestElement,
      );

      const updated = set.withMutations([]);

      expect(updated.size).toBe(1);

      assert.isTrue(ISetMapped.equal(set, updated));
    });
  });

  describe('map method', () => {
    test('should transform elements', () => {
      const set = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const transformed = set.map((el) => ({
        ...el,
        type: el.type.toUpperCase(),
      }));

      expect(transformed.size).toBe(2);

      assert.isTrue(transformed.has({ id: 1, type: 'USER' }));

      assert.isTrue(transformed.has({ id: 2, type: 'ADMIN' }));
    });
  });

  describe('filter method', () => {
    test('should filter elements', () => {
      const set = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
          { id: 3, type: 'user' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const filtered = set.filter((el) => el.type === 'user');

      expect(filtered.size).toBe(2);

      assert.isTrue(filtered.has({ id: 1, type: 'user' }));

      assert.isTrue(filtered.has({ id: 3, type: 'user' }));

      assert.isFalse(filtered.has({ id: 2, type: 'admin' }));
    });
  });

  describe('filterNot method', () => {
    test('should filter out elements that satisfy predicate', () => {
      const set = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
          { id: 3, type: 'user' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const filtered = set.filterNot((el) => el.type === 'user');

      expect(filtered.size).toBe(1);

      assert.isTrue(filtered.has({ id: 2, type: 'admin' }));

      assert.isFalse(filtered.has({ id: 1, type: 'user' }));

      assert.isFalse(filtered.has({ id: 3, type: 'user' }));
    });
  });

  describe('forEach method', () => {
    test('should execute callback for each element', () => {
      const set = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const mut_collected: TestElement[] = [];

      for (const el of set) {
        mut_collected.push(el);
      }

      expect(mut_collected).toHaveLength(2);

      expect(mut_collected).toContainEqual({ id: 1, type: 'user' });

      expect(mut_collected).toContainEqual({ id: 2, type: 'admin' });
    });
  });

  describe('isSubsetOf method', () => {
    test('should return true for subset', () => {
      const subset = ISetMapped.create(
        [{ id: 1, type: 'user' }],
        testElementToString,
        stringToTestElement,
      );

      const superset = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      assert.isTrue(subset.isSubsetOf(superset));
    });

    test('should return false for non-subset', () => {
      const set1 = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 3, type: 'guest' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const set2 = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      assert.isFalse(set1.isSubsetOf(set2));
    });
  });

  describe('isSupersetOf method', () => {
    test('should return true for superset', () => {
      const superset = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const subset = ISetMapped.create(
        [{ id: 1, type: 'user' }],
        testElementToString,
        stringToTestElement,
      );

      assert.isTrue(superset.isSupersetOf(subset));
    });

    test('should return false for non-superset', () => {
      const set1 = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const set2 = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 3, type: 'guest' },
        ],
        testElementToString,
        stringToTestElement,
      );

      assert.isFalse(set1.isSupersetOf(set2));
    });
  });

  describe('subtract method', () => {
    test('should return elements in first set but not in second', () => {
      const set1 = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
          { id: 3, type: 'guest' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const set2 = ISetMapped.create(
        [
          { id: 2, type: 'admin' },
          { id: 4, type: 'user' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const result = set1.subtract(set2);

      expect(result.size).toBe(2);

      assert.isTrue(result.has({ id: 1, type: 'user' }));

      assert.isTrue(result.has({ id: 3, type: 'guest' }));

      assert.isFalse(result.has({ id: 2, type: 'admin' }));
    });
  });

  describe('intersect method', () => {
    test('should return common elements', () => {
      const set1 = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
          { id: 3, type: 'guest' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const set2 = ISetMapped.create(
        [
          { id: 2, type: 'admin' },
          { id: 3, type: 'guest' },
          { id: 4, type: 'user' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const result = set1.intersect(set2);

      expect(result.size).toBe(2);

      assert.isTrue(result.has({ id: 2, type: 'admin' }));

      assert.isTrue(result.has({ id: 3, type: 'guest' }));

      assert.isFalse(result.has({ id: 1, type: 'user' }));
    });
  });

  describe('union method', () => {
    test('should return combined elements', () => {
      const set1 = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const set2 = ISetMapped.create(
        [
          { id: 3, type: 'guest' },
          { id: 4, type: 'user' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const result = set1.union(set2);

      expect(result.size).toBe(4);

      assert.isTrue(result.has({ id: 1, type: 'user' }));

      assert.isTrue(result.has({ id: 2, type: 'admin' }));

      assert.isTrue(result.has({ id: 3, type: 'guest' }));

      assert.isTrue(result.has({ id: 4, type: 'user' }));
    });
  });

  describe('iteration methods', () => {
    test('should work with keys()', () => {
      const set = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const keys = Array.from(set.keys());

      expect(keys).toHaveLength(2);

      expect(keys).toContainEqual({ id: 1, type: 'user' });

      expect(keys).toContainEqual({ id: 2, type: 'admin' });
    });

    test('should work with values()', () => {
      const set = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const values = Array.from(set.values());

      expect(values).toHaveLength(2);

      expect(values).toContainEqual({ id: 1, type: 'user' });

      expect(values).toContainEqual({ id: 2, type: 'admin' });
    });

    test('should work with entries()', () => {
      const set = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const entries = Array.from(set.entries());

      expect(entries).toHaveLength(2);

      for (const [key, value] of entries) {
        assert.deepStrictEqual(key, value);
      }
    });

    test('should work with for-of loop', () => {
      const set = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const mut_collected: TestElement[] = [];

      for (const element of set) {
        mut_collected.push(element);
      }

      expect(mut_collected).toHaveLength(2);

      expect(mut_collected).toContainEqual({ id: 1, type: 'user' });

      expect(mut_collected).toContainEqual({ id: 2, type: 'admin' });
    });
  });

  describe('conversion methods', () => {
    test('should convert to array', () => {
      const set = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const array = set.toArray();

      expect(array).toHaveLength(2);

      expect(array).toContainEqual({ id: 1, type: 'user' });

      expect(array).toContainEqual({ id: 2, type: 'admin' });
    });

    test('should convert to raw set', () => {
      const set = ISetMapped.create(
        [
          { id: 1, type: 'user' },
          { id: 2, type: 'admin' },
        ],
        testElementToString,
        stringToTestElement,
      );

      const rawSet = set.toRawSet();

      expect(rawSet.size).toBe(2);

      assert.isTrue(rawSet.has('user_1'));

      assert.isTrue(rawSet.has('admin_2'));
    });
  });
});
