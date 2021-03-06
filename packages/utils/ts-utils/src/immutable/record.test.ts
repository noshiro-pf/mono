import type { DeepReadonly, TypeEq } from '../types';
import { assertType } from '../types';
import { IRecord } from './record';

type R0 = DeepReadonly<{
  x: { a: number; b: number };
  y: { c: { d: number; 4: number } };
  z: [number, number, number];
}>;

const rcd: R0 = {
  x: { a: 1, b: 2 },
  y: { c: { d: 3, 4: 5 } },
  z: [1, 2, 4],
} as const;

describe('get', () => {
  {
    const result = IRecord.get(rcd, 'x');
    assertType<TypeEq<typeof result, DeepReadonly<{ a: number; b: number }>>>();

    test('case 1', () => {
      expect(result).toStrictEqual({ a: 1, b: 2 });
    });
  }
  {
    const result = IRecord.get(rcd, 'y');
    assertType<
      TypeEq<typeof result, DeepReadonly<{ c: { d: number; 4: number } }>>
    >();

    test('case 2', () => {
      expect(result).toStrictEqual({ c: { d: 3, 4: 5 } });
    });
  }
});

describe('set', () => {
  {
    const result = IRecord.set(rcd, 'x', { a: 0, b: 0 } as const);
    assertType<TypeEq<typeof result, R0>>();

    test('case 1', () => {
      expect(result).toStrictEqual({
        x: { a: 0, b: 0 },
        y: { c: { d: 3, 4: 5 } },
        z: [1, 2, 4],
      });
    });
  }
  {
    const result = IRecord.set(rcd, 'y', { c: { d: 888, 4: 999 } });
    assertType<TypeEq<typeof result, R0>>();

    test('case 2', () => {
      expect(result).toStrictEqual({
        x: { a: 1, b: 2 },
        y: { c: { d: 888, 4: 999 } },
        z: [1, 2, 4],
      });
    });
  }
});

describe('update', () => {
  {
    const result = IRecord.update(
      rcd,
      'x',
      (curr) => ({ a: curr.a + 1, b: curr.b + 2 } as const)
    );
    assertType<TypeEq<typeof result, R0>>();

    test('case 1', () => {
      expect(result).toStrictEqual({
        x: { a: 2, b: 4 },
        y: { c: { d: 3, 4: 5 } },
        z: [1, 2, 4],
      });
    });
  }
  {
    const result = IRecord.update(rcd, 'y', () => ({ c: { d: 888, 4: 999 } }));
    assertType<TypeEq<typeof result, R0>>();

    test('case 2', () => {
      expect(result).toStrictEqual({
        x: { a: 1, b: 2 },
        y: { c: { d: 888, 4: 999 } },
        z: [1, 2, 4],
      });
    });
  }
});

describe('getIn', () => {
  {
    const result = IRecord.getIn(rcd, [] as const);
    assertType<TypeEq<typeof result, R0>>();

    test('case 1', () => {
      expect(result).toStrictEqual({
        x: { a: 1, b: 2 },
        y: { c: { d: 3, 4: 5 } },
        z: [1, 2, 4],
      });
    });
  }
  {
    const result = IRecord.getIn(rcd, ['y', 'c', 'd'] as const);
    assertType<TypeEq<typeof result, number>>();

    test('case 2', () => {
      expect(result).toStrictEqual(3);
    });
  }
});

describe('setIn', () => {
  {
    const result = IRecord.setIn(rcd, [], {
      x: { a: 999, b: 999 },
      y: { c: { d: 999, 4: 999 } },
      z: [999, 999, 999],
    });
    assertType<TypeEq<typeof result, DeepReadonly<R0>>>();

    test('case 1', () => {
      expect(result).toStrictEqual({
        x: { a: 999, b: 999 },
        y: { c: { d: 999, 4: 999 } },
        z: [999, 999, 999],
      });
    });
  }
  {
    const result = IRecord.setIn(rcd, ['y', 'c', 'd'], 999);
    assertType<TypeEq<typeof result, R0>>();

    test('case 2', () => {
      expect(result).toStrictEqual({
        x: { a: 1, b: 2 },
        y: { c: { d: 999, 4: 5 } },
        z: [1, 2, 4],
      });
    });
  }
  {
    const result = IRecord.setIn(rcd, ['y', 'c'], { d: 999, 4: 999 });
    assertType<TypeEq<typeof result, R0>>();

    test('case 3', () => {
      expect(result).toStrictEqual({
        x: { a: 1, b: 2 },
        y: { c: { d: 999, 4: 999 } },
        z: [1, 2, 4],
      });
    });
  }
  {
    const result = IRecord.setIn(rcd, ['z', 1], 999);
    assertType<TypeEq<typeof result, R0>>();

    test('case 4', () => {
      expect(result).toStrictEqual({
        x: { a: 1, b: 2 },
        y: { c: { d: 3, 4: 5 } },
        z: [1, 999, 4],
      });
    });
  }
});

describe('updateIn', () => {
  {
    const result = IRecord.updateIn(rcd, [] as const, (curr) => curr);
    assertType<TypeEq<typeof result, R0>>();

    test('case 1', () => {
      expect(result).toStrictEqual(rcd);
    });
  }
  {
    const result = IRecord.updateIn(
      rcd,
      ['y', 'c', 'd'] as const,
      (curr) => curr + 1000
    );
    assertType<TypeEq<typeof result, R0>>();

    test('case 2', () => {
      expect(result).toStrictEqual({
        x: { a: 1, b: 2 },
        y: { c: { d: 1003, 4: 5 } },
        z: [1, 2, 4],
      });
    });
  }
  {
    const result = IRecord.updateIn(rcd, ['y', 'c'] as const, (curr) => ({
      d: curr.d + 1000,
      '4': curr[4] + 2000,
    }));
    assertType<TypeEq<typeof result, R0>>();

    test('case 3', () => {
      expect(result).toStrictEqual({
        x: { a: 1, b: 2 },
        y: { c: { d: 1003, 4: 2005 } },
        z: [1, 2, 4],
      });
    });
  }
});
