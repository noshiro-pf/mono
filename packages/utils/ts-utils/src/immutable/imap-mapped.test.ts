import { IMapMapped } from './imap-mapped';

const toKey = (a: Readonly<{ v: number }>): number => a.v;
const fromKey = (k: number): { v: number } => ({ v: k });

describe('IMapMapped[Symbol.iterator]', () => {
  test('case 1', () => {
    const s0 = IMapMapped.new(
      IMapMapped.new(
        [
          [{ v: 1 }, '1'],
          [{ v: 2 }, '2'],
          [{ v: 3 }, '3'],
        ],
        toKey,
        fromKey
      ),
      toKey,
      fromKey
    );
    expect(s0).toEqual(
      IMapMapped.new(
        [
          [{ v: 1 }, '1'],
          [{ v: 2 }, '2'],
          [{ v: 3 }, '3'],
        ],
        toKey,
        fromKey
      )
    );
  });
});

describe('IMapMapped.size', () => {
  test('case 1', () => {
    const s0 = IMapMapped.new(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey
    );
    expect(s0.size).toBe(3);
  });
});

describe('IMapMapped.has', () => {
  test('case 1', () => {
    const s0 = IMapMapped.new(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey
    );
    expect(s0.has({ v: 3 })).toBeTruthy();
  });
  test('case 2', () => {
    const s0 = IMapMapped.new(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey
    );
    expect(s0.has({ v: 4 })).toBeFalsy();
  });
  test('case 3', () => {
    const s0 = IMapMapped.new<{ v: number }, string, number>(
      [],
      toKey,
      fromKey
    );
    expect(s0.has({ v: 3 })).toBeFalsy();
  });
});

describe('IMapMapped.get', () => {
  test('case 1', () => {
    const s0 = IMapMapped.new(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey
    );
    expect(s0.get({ v: 3 })).toBe('3');
  });
  test('case 2', () => {
    const s0 = IMapMapped.new(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey
    );
    expect(s0.get({ v: 4 })).toBeUndefined();
  });
  test('case 3', () => {
    const s0 = IMapMapped.new<{ v: number }, string, number>(
      [],
      toKey,
      fromKey
    );
    expect(s0.get({ v: 3 })).toBeUndefined();
  });
});

describe('IMapMapped.set', () => {
  test('case 1', () => {
    const s0 = IMapMapped.new(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey
    );
    expect(s0.set({ v: 5 }, '5')).toEqual(
      IMapMapped.new(
        [
          [{ v: 1 }, '1'],
          [{ v: 2 }, '2'],
          [{ v: 3 }, '3'],
          [{ v: 5 }, '5'],
        ],
        toKey,
        fromKey
      )
    );
    expect(s0).toEqual(
      IMapMapped.new(
        [
          [{ v: 1 }, '1'],
          [{ v: 2 }, '2'],
          [{ v: 3 }, '3'],
        ],
        toKey,
        fromKey
      )
    );
  });
  test('case 2', () => {
    const s0 = IMapMapped.new(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey
    );
    expect(s0.set({ v: 3 }, '3')).toEqual(
      IMapMapped.new(
        [
          [{ v: 1 }, '1'],
          [{ v: 2 }, '2'],
          [{ v: 3 }, '3'],
        ],
        toKey,
        fromKey
      )
    );
    expect(s0).toEqual(
      IMapMapped.new(
        [
          [{ v: 1 }, '1'],
          [{ v: 2 }, '2'],
          [{ v: 3 }, '3'],
        ],
        toKey,
        fromKey
      )
    );
  });
  test('case 3', () => {
    const s0 = IMapMapped.new([], toKey, fromKey);
    expect(s0.set({ v: 1 }, '1')).toEqual(
      IMapMapped.new([[{ v: 1 }, '1']], toKey, fromKey)
    );
    expect(s0).toEqual(IMapMapped.new([], toKey, fromKey));
  });
});

describe('IMapMapped.delete', () => {
  test('case 1', () => {
    const s0 = IMapMapped.new(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey
    );
    expect(s0.delete({ v: 10 })).toEqual(
      IMapMapped.new(
        [
          [{ v: 1 }, '1'],
          [{ v: 2 }, '2'],
          [{ v: 3 }, '3'],
        ],
        toKey,
        fromKey
      )
    );
    expect(s0).toEqual(
      IMapMapped.new(
        [
          [{ v: 1 }, '1'],
          [{ v: 2 }, '2'],
          [{ v: 3 }, '3'],
        ],
        toKey,
        fromKey
      )
    );
  });
  test('case 2', () => {
    const s0 = IMapMapped.new(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey
    );
    expect(s0.delete({ v: 3 })).toEqual(
      IMapMapped.new(
        [
          [{ v: 1 }, '1'],
          [{ v: 2 }, '2'],
        ],
        toKey,
        fromKey
      )
    );
    expect(s0).toEqual(
      IMapMapped.new(
        [
          [{ v: 1 }, '1'],
          [{ v: 2 }, '2'],
          [{ v: 3 }, '3'],
        ],
        toKey,
        fromKey
      )
    );
  });
  test('case 3', () => {
    const s0 = IMapMapped.new([], toKey, fromKey);
    expect(s0.delete({ v: 1 })).toEqual(IMapMapped.new([], toKey, fromKey));
    expect(s0).toEqual(IMapMapped.new([], toKey, fromKey));
  });
});

describe('IMapMapped.forEach', () => {
  test('case 1', () => {
    const s0 = IMapMapped.new(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey
    );
    const keys = [{ v: 1 }, { v: 2 }, { v: 3 }];
    const values = ['1', '2', '3'];
    s0.forEach((value, key) => {
      expect(keys).toContainEqual(key);
      expect(values).toContainEqual(value);
    });
  });
});

describe('IMapMapped.keys', () => {
  test('case 1', () => {
    const s0 = IMapMapped.new(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey
    );
    const keys = [{ v: 1 }, { v: 2 }, { v: 3 }];
    for (const k of s0.keys()) {
      expect(keys).toContainEqual(k);
    }
  });
});

describe('IMapMapped.values', () => {
  test('case 1', () => {
    const s0 = IMapMapped.new(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey
    );
    const values = ['1', '2', '3'];
    for (const v of s0.values()) {
      expect(values).toContainEqual(v);
    }
  });
});

describe('IMapMapped.entries', () => {
  test('case 1', () => {
    const s0 = IMapMapped.new(
      [
        [{ v: 1 }, '1'],
        [{ v: 2 }, '2'],
        [{ v: 3 }, '3'],
      ],
      toKey,
      fromKey
    );
    const keys = [{ v: 1 }, { v: 2 }, { v: 3 }];
    const values = ['1', '2', '3'];
    for (const [k, v] of s0.entries()) {
      expect(keys).toContainEqual(k);
      expect(values).toContainEqual(v);
    }
  });
});
