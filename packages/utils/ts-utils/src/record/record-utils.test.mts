import { expectType } from '../expect-type.mjs';
import { isNumber, isRecord } from '../index.mjs';
import { RecordUtils } from './record-utils.mjs';

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

describe('RecordUtils', () => {
  describe('get', () => {
    {
      const result = RecordUtils.get(rcd, 'x');

      expectType<typeof result, DeepReadonly<{ a: number; b: number }>>('=');

      test('case 1', () => {
        expect(result).toStrictEqual({ a: 1, b: 2 });
      });
    }
    {
      const result = RecordUtils.get(rcd, 'y');

      expectType<typeof result, DeepReadonly<{ c: { d: number; 4: number } }>>(
        '=',
      );

      test('case 2', () => {
        expect(result).toStrictEqual({ c: { d: 3, 4: 5 } });
      });
    }
  });

  describe('set', () => {
    {
      const result = RecordUtils.set(rcd, 'x', { a: 0, b: 0 });

      expectType<typeof result, R0>('=');

      test('case 1', () => {
        expect(result).toStrictEqual({
          x: { a: 0, b: 0 },
          y: { c: { d: 3, 4: 5 } },
          z: [1, 2, 4],
        });
      });
    }
    {
      const result = RecordUtils.set(rcd, 'y', { c: { d: 888, 4: 999 } });

      expectType<typeof result, R0>('=');

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
      const result = RecordUtils.update(rcd, 'x', (curr) => ({
        a: curr.a + 1,
        b: curr.b + 2,
      }));

      expectType<typeof result, R0>('=');

      test('case 1', () => {
        expect(result).toStrictEqual({
          x: { a: 2, b: 4 },
          y: { c: { d: 3, 4: 5 } },
          z: [1, 2, 4],
        });
      });
    }
    {
      const result = RecordUtils.update(rcd, 'y', () => ({
        c: { d: 888, 4: 999 },
      }));

      expectType<typeof result, R0>('=');

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
      const result = RecordUtils.getIn(rcd, []);

      expectType<typeof result, R0>('=');

      test('case 1', () => {
        expect(result).toStrictEqual({
          x: { a: 1, b: 2 },
          y: { c: { d: 3, 4: 5 } },
          z: [1, 2, 4],
        });
      });
    }
    {
      const result = RecordUtils.getIn(rcd, ['y', 'c', 'd']);

      expectType<typeof result, number>('=');

      test('case 2', () => {
        expect(result).toBe(3);
      });
    }
  });

  describe('setIn', () => {
    {
      const result = RecordUtils.setIn(rcd, [], {
        x: { a: 999, b: 999 },
        y: { c: { d: 999, 4: 999 } },
        z: [999, 999, 999],
      });

      expectType<typeof result, DeepReadonly<R0>>('=');

      test('case 1', () => {
        expect(result).toStrictEqual({
          x: { a: 999, b: 999 },
          y: { c: { d: 999, 4: 999 } },
          z: [999, 999, 999],
        });
      });
    }
    {
      const result = RecordUtils.setIn(rcd, ['y', 'c', 'd'], 999);

      expectType<typeof result, R0>('=');

      test('case 2', () => {
        expect(result).toStrictEqual({
          x: { a: 1, b: 2 },
          y: { c: { d: 999, 4: 5 } },
          z: [1, 2, 4],
        });
      });
    }
    {
      const result = RecordUtils.setIn(rcd, ['y', 'c'], { d: 999, 4: 999 });

      expectType<typeof result, R0>('=');

      test('case 3', () => {
        expect(result).toStrictEqual({
          x: { a: 1, b: 2 },
          y: { c: { d: 999, 4: 999 } },
          z: [1, 2, 4],
        });
      });
    }
    {
      const result = RecordUtils.setIn(rcd, ['z', 1], 999);

      expectType<typeof result, R0>('=');

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
      const result = RecordUtils.updateIn(rcd, [], (curr) => curr);

      expectType<typeof result, R0>('=');

      test('case 1', () => {
        expect(result).toStrictEqual(rcd);
      });
    }
    {
      const result = RecordUtils.updateIn(
        rcd,
        ['y', 'c', 'd'],
        (curr) => curr + 1000,
      );

      expectType<typeof result, R0>('=');

      test('case 2', () => {
        expect(result).toStrictEqual({
          x: { a: 1, b: 2 },
          y: { c: { d: 1003, 4: 5 } },
          z: [1, 2, 4],
        });
      });
    }
    {
      const result = RecordUtils.updateIn(rcd, ['y', 'c'], (curr) => ({
        d: curr.d + 1000,
        '4': curr[4] + 2000,
      }));

      expectType<typeof result, R0>('=');

      test('case 3', () => {
        expect(result).toStrictEqual({
          x: { a: 1, b: 2 },
          y: { c: { d: 1003, 4: 2005 } },
          z: [1, 2, 4],
        });
      });
    }
  });

  describe('pick', () => {
    {
      const result = RecordUtils.pick(rcd, ['x', 'y']);

      expectType<typeof result, Pick<R0, 'x' | 'y'>>('=');

      test('case 1', () => {
        expect(result).toStrictEqual({
          x: { a: 1, b: 2 },
          y: { c: { d: 3, 4: 5 } },
        });
      });
    }
  });

  describe('omit', () => {
    {
      const result = RecordUtils.omit(rcd, ['x']);

      expectType<typeof result, Omit<R0, 'x'>>('=');

      test('case 1', () => {
        expect(result).toStrictEqual({
          y: { c: { d: 3, 4: 5 } },
          z: [1, 2, 4],
        });
      });
    }
    {
      const result = RecordUtils.omit(rcd, ['y', 'z']);

      expectType<
        typeof result,
        DeepReadonly<{
          x: { a: number; b: number };
        }>
      >('=');

      test('case 2', () => {
        expect(result).toStrictEqual({
          x: { a: 1, b: 2 },
        });
      });
    }
  });

  describe('merge', () => {
    {
      const result = RecordUtils.merge(rcd, { a: 1, b: 2 });

      expectType<
        typeof result,
        DeepReadonly<{
          x: { a: number; b: number };
          y: { c: { d: number; 4: number } };
          z: [number, number, number];
          a: 1;
          b: 2;
        }>
      >('=');

      test('case 1', () => {
        expect(result).toStrictEqual({
          x: { a: 1, b: 2 },
          y: { c: { d: 3, 4: 5 } },
          z: [1, 2, 4],
          a: 1,
          b: 2,
        });
      });
    }
    {
      const result = RecordUtils.merge(rcd, {
        x: 1,
        y: { p: '3', q: '4' },
        a: 1,
      });

      expectType<
        typeof result,
        DeepReadonly<{
          x: 1;
          y: { p: '3'; q: '4' };
          z: [number, number, number];
          a: 1;
        }>
      >('=');

      test('case 2', () => {
        expect(result).toStrictEqual({
          x: 1,
          y: { p: '3', q: '4' },
          z: [1, 2, 4],
          a: 1,
        });
      });
    }
  });

  describe('keys', () => {
    test('case 1', () => {
      const keys = Object.keys({ x: 1, y: 2 });

      expectType<typeof keys, readonly ('x' | 'y' | (string & {}))[]>('=');

      expect(keys).toStrictEqual(['x', 'y']);
    });

    test('case 2', () => {
      const symb = Symbol();
      const keys = Object.keys({ x: 1, y: 2, z: '3', 3: 4, [symb]: 5 });

      expectType<
        typeof keys,
        readonly ('3' | 'x' | 'y' | 'z' | (string & {}))[]
      >('=');

      expect(keys).toStrictEqual(['3', 'x', 'y', 'z']);
    });
  });

  describe('values', () => {
    test('case 1', () => {
      const values = Object.values({ x: 1, y: 2 } as const);

      expectType<typeof values, readonly (1 | 2)[]>('=');

      expect(values).toStrictEqual([1, 2]);
    });
  });

  describe('fromEntries', () => {
    const entries: readonly (readonly ['x' | 'y' | 'z' | 4, 1 | 2 | 3])[] = [
      ['x', 1],
      ['y', 2],
      ['z', 3],
      [4, 3],
    ];

    const obj0 = Object.fromEntries(entries);

    expectType<typeof obj0, Partial<Record<'x' | 'y' | 'z' | 4, 1 | 2 | 3>>>(
      '=',
    );

    test('case 1', () => {
      expect(obj0).toStrictEqual({
        x: 1,
        y: 2,
        z: 3,
        4: 3,
      });
    });
  });

  describe('hasKeyValue', () => {
    type Point = { x: number; y: number };
    type Line = { begin: Point; end: Point };

    const isPoint = (a: unknown): a is Point =>
      isRecord(a) &&
      RecordUtils.hasKeyValue(a, 'x', isNumber) &&
      RecordUtils.hasKeyValue(a, 'y', isNumber);

    const isLine = (a: unknown): a is Line =>
      isRecord(a) &&
      RecordUtils.hasKeyValue(a, 'begin', isPoint) &&
      RecordUtils.hasKeyValue(a, 'end', isPoint);

    test('', () => {
      expect(
        isLine({
          begin: { x: 1, y: 1 },
          end: { x: 2, y: 3 },
        }),
      ).toBe(true);
    });
  });
});
