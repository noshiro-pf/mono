import { ISetMapped } from './iset-mapped';

const toKey = (a: Readonly<{ v: number }>): number => a.v;
const fromKey = (k: number): { v: number } => ({ v: k });

describe('ISetMapped[Symbol.iterator]', () => {
  test('case 1', () => {
    const s0 = ISetMapped.new(
      ISetMapped.new([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey),
      toKey,
      fromKey
    );
    expect(s0).toEqual(
      ISetMapped.new([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey)
    );
  });
});

describe('ISetMapped.size', () => {
  test('case 1', () => {
    const s0 = ISetMapped.new([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey);
    expect(s0.size).toBe(3);
  });
});

describe('ISetMapped.has', () => {
  test('case 1', () => {
    const s0 = ISetMapped.new([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey);
    expect(s0.has({ v: 3 })).toBeTruthy();
  });
  test('case 2', () => {
    const s0 = ISetMapped.new([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey);
    expect(s0.has({ v: 4 })).toBeFalsy();
  });
  test('case 3', () => {
    const s0 = ISetMapped.new<{ v: number }, number>([], toKey, fromKey);
    expect(s0.has({ v: 3 })).toBeFalsy();
  });
});

describe('ISetMapped.add', () => {
  test('case 1', () => {
    const s0 = ISetMapped.new([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey);
    expect(s0.add({ v: 5 })).toEqual(
      ISetMapped.new([{ v: 1 }, { v: 2 }, { v: 3 }, { v: 5 }], toKey, fromKey)
    );
    expect(s0).toEqual(
      ISetMapped.new([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey)
    );
  });
  test('case 2', () => {
    const s0 = ISetMapped.new([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey);
    expect(s0.add({ v: 3 })).toEqual(
      ISetMapped.new([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey)
    );
    expect(s0).toEqual(
      ISetMapped.new([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey)
    );
  });
  test('case 3', () => {
    const s0 = ISetMapped.new([], toKey, fromKey);
    expect(s0.add({ v: 1 })).toEqual(
      ISetMapped.new([{ v: 1 }], toKey, fromKey)
    );
    expect(s0).toEqual(ISetMapped.new([], toKey, fromKey));
  });
});

describe('ISetMapped.delete', () => {
  test('case 1', () => {
    const s0 = ISetMapped.new([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey);
    expect(s0.delete({ v: 10 })).toEqual(
      ISetMapped.new([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey)
    );
    expect(s0).toEqual(
      ISetMapped.new([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey)
    );
  });
  test('case 2', () => {
    const s0 = ISetMapped.new([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey);
    expect(s0.delete({ v: 3 })).toEqual(
      ISetMapped.new([{ v: 1 }, { v: 2 }], toKey, fromKey)
    );
    expect(s0).toEqual(
      ISetMapped.new([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey)
    );
  });
  test('case 3', () => {
    const s0 = ISetMapped.new([], toKey, fromKey);
    expect(s0.delete({ v: 1 })).toEqual(ISetMapped.new([], toKey, fromKey));
    expect(s0).toEqual(ISetMapped.new([], toKey, fromKey));
  });
});

describe('ISetMapped.forEach', () => {
  test('case 1', () => {
    const s0 = ISetMapped.new([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey);
    const xs = [{ v: 1 }, { v: 2 }, { v: 3 }];
    s0.forEach((a) => {
      expect(xs).toContainEqual(a);
    });
  });
});

describe('ISetMapped.keys', () => {
  test('case 1', () => {
    const s0 = ISetMapped.new([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey);
    const xs = [{ v: 1 }, { v: 2 }, { v: 3 }];
    for (const k of s0.keys()) {
      expect(xs).toContainEqual(k);
    }
  });
});

describe('ISetMapped.values', () => {
  test('case 1', () => {
    const s0 = ISetMapped.new([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey);
    const xs = [{ v: 1 }, { v: 2 }, { v: 3 }];
    for (const k of s0.values()) {
      expect(xs).toContainEqual(k);
    }
  });
});

describe('ISetMapped.entries', () => {
  test('case 1', () => {
    const s0 = ISetMapped.new([{ v: 1 }, { v: 2 }, { v: 3 }], toKey, fromKey);
    const xs = [{ v: 1 }, { v: 2 }, { v: 3 }];
    for (const [k, v] of s0.entries()) {
      expect(k).toBe(v);
      expect(xs).toContainEqual(k);
      expect(xs).toContainEqual(v);
    }
  });
});
