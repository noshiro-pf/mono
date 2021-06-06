import type { DeepReadonly, TypeEq } from '../types';
import { assertType } from '../types';
import { IRecord } from './record';

const rcd = {
  x: {
    a: 1,
    b: 2,
  },
  y: {
    c: {
      d: 3,
      4: 5,
    },
  },
  z: [1, 2, 4],
} as const;

describe('get', () => {
  {
    const result = IRecord.get(rcd, 'x');
    assertType<TypeEq<typeof result, DeepReadonly<{ a: 1; b: 2 }>>>();

    test('case 1', () => {
      expect(result).toStrictEqual({ a: 1, b: 2 });
    });
  }
  {
    const result = IRecord.get(rcd, 'y');
    assertType<TypeEq<typeof result, DeepReadonly<{ c: { d: 3; 4: 5 } }>>>();

    test('case 2', () => {
      expect(result).toStrictEqual({ c: { d: 3, 4: 5 } });
    });
  }
});

describe('set', () => {
  {
    const result = IRecord.set(rcd, 'x', { a: 0, b: 0 } as const);
    assertType<
      TypeEq<
        typeof result,
        DeepReadonly<{
          x: { a: 0; b: 0 };
          y: {
            c: {
              d: 3;
              4: 5;
            };
          };
          z: [1, 2, 4];
        }>
      >
    >();

    test('case 1', () => {
      expect(result).toStrictEqual({
        x: { a: 0, b: 0 },
        y: {
          c: {
            d: 3,
            4: 5,
          },
        },
        z: [1, 2, 4],
      });
    });
  }
  {
    const result = IRecord.set(rcd, 'y', [] as const);
    assertType<
      TypeEq<
        typeof result,
        DeepReadonly<{
          x: { a: 1; b: 2 };
          y: [];
          z: [1, 2, 4];
        }>
      >
    >();

    test('case 2', () => {
      expect(result).toStrictEqual({
        x: { a: 1, b: 2 },
        y: [],
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
    assertType<
      TypeEq<
        typeof result,
        DeepReadonly<{
          x: { a: number; b: number };
          y: {
            c: {
              d: 3;
              4: 5;
            };
          };
          z: [1, 2, 4];
        }>
      >
    >();

    test('case 1', () => {
      expect(result).toStrictEqual({
        x: { a: 2, b: 4 },
        y: {
          c: {
            d: 3,
            4: 5,
          },
        },
        z: [1, 2, 4],
      });
    });
  }
  {
    const result = IRecord.update(rcd, 'y', () => [] as const);
    assertType<
      TypeEq<
        typeof result,
        DeepReadonly<{
          x: { a: 1; b: 2 };
          y: [];
          z: [1, 2, 4];
        }>
      >
    >();

    test('case 2', () => {
      expect(result).toStrictEqual({
        x: { a: 1, b: 2 },
        y: [],
        z: [1, 2, 4],
      });
    });
  }
});

describe('getIn', () => {
  {
    const result = IRecord.getIn(rcd, [] as const);
    assertType<
      TypeEq<
        typeof result,
        DeepReadonly<{
          x: {
            a: 1;
            b: 2;
          };
          y: {
            c: {
              d: 3;
              4: 5;
            };
          };
          z: [1, 2, 4];
        }>
      >
    >();

    test('case 1', () => {
      expect(result).toStrictEqual({
        x: {
          a: 1,
          b: 2,
        },
        y: {
          c: {
            d: 3,
            4: 5,
          },
        },
        z: [1, 2, 4],
      });
    });
  }
  {
    const result = IRecord.getIn(rcd, ['y', 'c', 'd'] as const);
    assertType<TypeEq<typeof result, 3>>();

    test('case 2', () => {
      expect(result).toStrictEqual(3);
    });
  }
});

describe('setIn', () => {
  {
    const result = IRecord.setIn(rcd, [] as const, { a: 0, b: 0 } as const);
    assertType<TypeEq<typeof result, DeepReadonly<{ a: 0; b: 0 }>>>();

    test('case 1', () => {
      expect(result).toStrictEqual({ a: 0, b: 0 });
    });
  }
  {
    const result = IRecord.setIn(rcd, ['y', 'c', 'd'] as const, 4);
    assertType<
      TypeEq<
        typeof result,
        DeepReadonly<{
          x: {
            a: 1;
            b: 2;
          };
          y: {
            c: {
              d: 4;
              4: 5;
            };
          };
          z: [1, 2, 4];
        }>
      >
    >();

    test('case 2', () => {
      expect(result).toStrictEqual({
        x: {
          a: 1,
          b: 2,
        },
        y: {
          c: {
            d: 4,
            4: 5,
          },
        },
        z: [1, 2, 4],
      });
    });
  }
  {
    const result = IRecord.setIn(rcd, ['y', 'c'] as const, 3);
    assertType<
      TypeEq<
        typeof result,
        DeepReadonly<{
          x: {
            a: 1;
            b: 2;
          };
          y: {
            c: 3;
          };
          z: [1, 2, 4];
        }>
      >
    >();

    test('case 3', () => {
      expect(result).toStrictEqual({
        x: {
          a: 1,
          b: 2,
        },
        y: {
          c: 3,
        },
        z: [1, 2, 4],
      });
    });
  }
});

describe('updateIn', () => {
  {
    const result = IRecord.updateIn(rcd, [] as const, (curr) => curr.x);
    assertType<TypeEq<typeof result, DeepReadonly<{ a: 1; b: 2 }>>>();

    test('case 1', () => {
      expect(result).toStrictEqual({ a: 1, b: 2 });
    });
  }
  {
    const result = IRecord.updateIn(
      rcd,
      ['y', 'c', 'd'] as const,
      (curr) => curr + 1
    );
    assertType<
      TypeEq<
        typeof result,
        DeepReadonly<{
          x: {
            a: 1;
            b: 2;
          };
          y: {
            c: {
              d: number;
              4: 5;
            };
          };
          z: [1, 2, 4];
        }>
      >
    >();

    test('case 2', () => {
      expect(result).toStrictEqual({
        x: {
          a: 1,
          b: 2,
        },
        y: {
          c: {
            d: 4,
            4: 5,
          },
        },
        z: [1, 2, 4],
      });
    });
  }
  {
    const result = IRecord.updateIn(
      rcd,
      ['y', 'c'] as const,
      (curr) => curr[4] + 1
    );
    assertType<
      TypeEq<
        typeof result,
        DeepReadonly<{
          x: {
            a: 1;
            b: 2;
          };
          y: {
            c: number;
          };
          z: [1, 2, 4];
        }>
      >
    >();

    test('case 3', () => {
      expect(result).toStrictEqual({
        x: {
          a: 1,
          b: 2,
        },
        y: {
          c: 6,
        },
        z: [1, 2, 4],
      });
    });
  }
});
