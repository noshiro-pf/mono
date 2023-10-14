import { describe, expect, test } from '@jest/globals';
import { tuple } from './tuple';

const testStrictEqual = <T>(a: T, b: T): void => {
  expect(a).toBe(b);
};

const testDeepEqual = <T>(a: T, b: T): void => {
  expect(a).toEqual(b);
};

test('includes', () => {
  const t = tuple(1, 'asdf', true);
  testStrictEqual(t.includes('asdf'), true);
  testStrictEqual(t.includes(false), false);
});

test('Symbol.iterator', () => {
  testDeepEqual(
    [2, 4, 6, 8],
    [...tuple(1, 2, 3, 4, 5, 6, 7, 8, 9).filter((x) => x % 2 === 0)],
  );

  const [a, b, c, ...rest] = tuple(1, 2, 3, 4, 5);
  testStrictEqual(a, 1);
  testStrictEqual(b, 2);
  testStrictEqual(c, 3);
  testDeepEqual(rest, [4, 5]);
});

describe('tuple basics', () => {
  test('should be defined and importable', () => {
    testStrictEqual(typeof tuple, 'function');
  });

  test('should support === deep equality', () => {
    testStrictEqual(tuple(1, 2, 3), tuple(1, 2, 3));
  });

  test('should support tuple.isTuple', () => {
    testStrictEqual(tuple.isTuple(tuple()), true);
    testStrictEqual(tuple.isTuple(tuple.prototype), true);
    testStrictEqual(tuple.isTuple(tuple('asdf', {})), true);
    testStrictEqual(tuple.isTuple(null), false);
  });

  test('should be usable as Map keys', () => {
    const map = new Map();

    testStrictEqual(map.has(tuple(1, tuple(2, 'buckle'), true)), false);
    map.set(tuple(1, tuple(2, 'buckle'), true), 'oh my');
    testStrictEqual(map.has(tuple(1, tuple(2, 'buckle'), true)), true);
    testStrictEqual(map.get(tuple(1, tuple(2, 'buckle'), true)), 'oh my');

    map.forEach((value, key) => {
      testStrictEqual(key, tuple(1, tuple(2, 'buckle'), true));
      testStrictEqual(value, 'oh my');
    });

    map.delete(tuple(1, tuple(2, 'buckle'), true));
    map.forEach(() => {
      throw new Error('unreached');
    });
  });

  test('should be storable in a Set', () => {
    const set = new Set([
      tuple(1, 2, tuple(3, 4), 5),
      tuple(1, 2, tuple(3, 4), 5),
    ]);

    testStrictEqual(set.size, 1);
  });
});

describe('Array methods', () => {
  test('concat', () => {
    testStrictEqual(
      tuple(1, 2, 3).concat(4, tuple(5, 6), 7),
      tuple(1, 2, 3, 4, 5, 6, 7),
    );
  });

  test('slice', () => {
    testStrictEqual(tuple(1, 2, 3, 4, 5).slice(2, 4), tuple(3, 4));

    testStrictEqual(tuple(1, 2, 3, 4, 5).slice(-3), tuple(3, 4, 5));
  });

  test('indexOf and lastIndexOf', () => {
    const t = tuple(1, 1, 2, 3, 5, 8, 13);
    testStrictEqual(t.indexOf(1), 0);
    testStrictEqual(t.lastIndexOf(1), 1);
    testStrictEqual(t.indexOf(4), -1);
    testStrictEqual(t.lastIndexOf(7), -1);
  });

  test('forEach', () => {
    const t = tuple('a', 'b', 'c', 'd');
    const output = {};
    t.forEach((item, i, obj) => {
      output[item] = i;
      testStrictEqual(obj, t);
    });
    testDeepEqual(output, {
      a: 0,
      b: 1,
      c: 2,
      d: 3,
    });
  });

  test('filter', () => {
    testStrictEqual(
      tuple(1, 2, 3, 4, 5, 6, 7, 8, 9).filter((x) => x % 2),
      tuple(1, 3, 5, 7, 9),
    );
  });

  test('map', () => {
    testStrictEqual(
      tuple(1, 2, 3, 4).map((x) => x + 1),
      tuple(2, 3, 4, 5),
    );
  });

  test('every', () => {
    testStrictEqual(
      tuple(2, 4, 6, 8).every((x) => x % 2 === 0),
      true,
    );
    testStrictEqual(
      tuple(2, 4, 6, 7).every((x) => x % 2 === 0),
      false,
    );
  });

  test('some', () => {
    testStrictEqual(
      tuple(1, 2, 3, 4).some((x) => x === 3),
      true,
    );
    testStrictEqual(
      tuple(1, 2, 3, 4).some((x) => x > 5),
      false,
    );
  });

  test('reduce', () => {
    testStrictEqual(
      tuple(1, 2, 3, 4, 5).reduce((x, sum) => x + sum, 0),
      15,
    );
  });

  test('reduceRight', () => {
    testStrictEqual(
      [tuple(0, 1), tuple(2, 3), tuple(4, 5)].reduceRight((previous, current) =>
        previous.concat(current),
      ),
      tuple(4, 5, 2, 3, 0, 1),
    );
  });

  test('toString', () => {
    testStrictEqual(tuple(1, 2, 3).toString(), [1, 2, 3].toString());
  });

  test('join', () => {
    testStrictEqual(tuple(1, 2, 3).join('|'), '1|2|3');
  });

  test('reverse', () => {
    testStrictEqual(tuple(1, 2, 3).reverse(), tuple(3, 2, 1));
  });

  test('sort', () => {
    testStrictEqual(
      tuple(4, 2, 7, 6, 9, 3, 1, 0, 3, 2, 7).sort(),
      tuple(0, 1, 2, 2, 3, 3, 4, 6, 7, 7, 9),
    );
  });

  test('find', () => {
    testDeepEqual(
      tuple({ foo: 1 }, { bar: 2 }, { baz: 3 }, { qux: 4 }).find((obj) => {
        return Object.keys(obj).some((key) => {
          return key.length === obj[key];
        });
      }),
      { baz: 3 },
    );
  });

  test('findIndex', () => {
    testDeepEqual(
      tuple({ foo: 1 }, { bar: 2 }, { baz: 3 }, { qux: 4 }).findIndex((obj) => {
        return Object.keys(obj).some((key) => {
          return key.length === obj[key];
        });
      }),
      2,
    );
  });
});

describe('performance', () => {
  const tupleCount = 100000;
  const elemCount = 10;

  test('can handle a lot of strings', () => {
    for (let i = 0; i < tupleCount; i += 1) {
      const elems = [];
      for (let j = 0; j < elemCount; j += 1) {
        elems.push(Math.random().toString(36).slice(2));
      }
      testDeepEqual(tuple.apply(null, elems), elems);
    }
  });

  test('can handle a lot of objects', () => {
    for (let i = 0; i < tupleCount; i += 1) {
      const elems: unknown[] = [];
      for (let j = 0; j < elemCount; j += 1) {
        elems.push({});
      }
      tuple.apply(null, elems).forEach((elem, i) => {
        testStrictEqual(elem, elems[i]);
      });
    }
  });
});
