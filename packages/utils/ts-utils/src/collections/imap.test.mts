import { IMap } from './imap.mjs';

describe('IMap[Symbol.iterator]', () => {
  test('case 1', () => {
    const m0 = IMap.new(
      IMap.new([
        [1, 10],
        [2, 20],
        [3, 30],
      ] as const),
    );

    expect(m0).toStrictEqual(
      IMap.new([
        [1, 10],
        [2, 20],
        [3, 30],
      ] as const),
    );
  });
});

describe('IMap.size', () => {
  test('case 1', () => {
    const m0 = IMap.new([
      [1, 10],
      [2, 20],
      [3, 30],
    ] as const);

    expect(m0.size).toBe(3);
  });
});

describe('IMap.has', () => {
  test('case 1', () => {
    const m0 = IMap.new([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ] as const);

    expect(m0.has(6)).toBe(true);
  });
  test('case 2', () => {
    const m0 = IMap.new<number, number>([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ]);

    expect(m0.has(8)).toBe(false);
  });
  test('case 3', () => {
    const m0 = IMap.new<number, number>([]);

    expect(m0.has(0)).toBe(false);
  });
  test('case 4', () => {
    const m0 = IMap.new<number, number>([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
      [Number.NaN, 0],
    ] as const);

    expect(m0.has(Number.NaN)).toBe(true);
  });
});

describe('IMap.get', () => {
  test('case 1', () => {
    const m0 = IMap.new([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ] as const);

    expect(m0.get(6)).toBe(60);
  });
  test('case 2', () => {
    const m0 = IMap.new<number, number>([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ]);

    expect(m0.get(8)).toBeUndefined();
  });
  test('case 3', () => {
    const m0 = IMap.new<number, number>([]);

    expect(m0.get(0)).toBeUndefined();
  });
  test('case 4', () => {
    const m0 = IMap.new<number, number>([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
      [Number.NaN, 100],
    ] as const);

    expect(m0.get(Number.NaN)).toBe(100);
  });
});

describe('IMap.set', () => {
  test('case 1', () => {
    const m0 = IMap.new<number, number>([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ]);

    expect(m0.set(9, 90)).toStrictEqual(
      IMap.new([
        [1, 10],
        [3, 30],
        [5, 50],
        [6, 60],
        [7, 70],
        [9, 90],
      ]),
    );
    expect(m0).toStrictEqual(
      IMap.new([
        [1, 10],
        [3, 30],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
  });
  test('case 2', () => {
    const m0 = IMap.new([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ]);

    expect(m0.set(3, 40)).toStrictEqual(
      IMap.new([
        [1, 10],
        [3, 40],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
    expect(m0).toStrictEqual(
      IMap.new([
        [1, 10],
        [3, 30],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
  });
  test('case 3', () => {
    const m0 = IMap.new<number, number>([]);

    expect(m0.set(1, 10)).toStrictEqual(IMap.new([[1, 10]]));
    expect(m0).toStrictEqual(IMap.new<number, number>([]));
  });
});

describe('IMap.update', () => {
  test('case 1', () => {
    const m0 = IMap.new<number, number>([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ]);

    expect(m0.update(9, (x) => 2 * x)).toStrictEqual(
      IMap.new([
        [1, 10],
        [3, 30],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
    expect(m0).toStrictEqual(
      IMap.new([
        [1, 10],
        [3, 30],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
  });
  test('case 2', () => {
    const m0 = IMap.new([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ]);

    expect(m0.update(3, (x) => 2 * x)).toStrictEqual(
      IMap.new([
        [1, 10],
        [3, 60],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
    expect(m0).toStrictEqual(
      IMap.new([
        [1, 10],
        [3, 30],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
  });
  test('case 3', () => {
    const m0 = IMap.new<number, number>([]);

    expect(m0.update(1, (x) => 2 * x)).toStrictEqual(IMap.new([]));
    expect(m0).toStrictEqual(IMap.new<number, number>([]));
  });
});

describe('IMap.delete', () => {
  test('case 1', () => {
    const m0 = IMap.new<number, number>([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ]);

    expect(m0.delete(10)).toStrictEqual(
      IMap.new([
        [1, 10],
        [3, 30],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
    expect(m0).toStrictEqual(
      IMap.new([
        [1, 10],
        [3, 30],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
  });
  test('case 2', () => {
    const m0 = IMap.new([
      [1, 10],
      [3, 30],
      [5, 50],
      [6, 60],
      [7, 70],
    ]);

    expect(m0.delete(3)).toStrictEqual(
      IMap.new([
        [1, 10],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
    expect(m0).toStrictEqual(
      IMap.new([
        [1, 10],
        [3, 30],
        [5, 50],
        [6, 60],
        [7, 70],
      ]),
    );
  });
  test('case 3', () => {
    const m0 = IMap.new<number, number>([]);

    expect(m0.delete(1)).toStrictEqual(IMap.new([]));
    expect(m0).toStrictEqual(IMap.new<number, number>([]));
  });
});

describe('IMap.forEach', () => {
  test('case 1', () => {
    const m0 = IMap.new([
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
});

describe('IMap.keys', () => {
  test('case 1', () => {
    const m0 = IMap.new([
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
    const m0 = IMap.new([
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
    const m0 = IMap.new([
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
