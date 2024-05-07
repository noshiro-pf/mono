import { expectType } from '../expect-type.mjs';
import { toUint32 } from '../index.mjs';
import { Arr } from './array-utils.mjs';

describe('ArrayUtils', () => {
  describe('zeros', () => {
    test('fixed length', () => {
      const result = Arr.zeros(3);

      expectType<typeof result, readonly [0, 0, 0]>('=');

      expect(result).toStrictEqual([0, 0, 0]);
    });

    test('fixed length (empty)', () => {
      const result = Arr.zeros(0);

      expectType<typeof result, readonly []>('=');

      expect(result).toStrictEqual([]);
    });

    test('unknown length', () => {
      const n: NumberType.ArraySize = toUint32(3);
      const result = Arr.zeros(n);

      expectType<typeof result, readonly 0[]>('=');

      expect(result).toStrictEqual([0, 0, 0]);
    });
  });

  describe('seq', () => {
    test('fixed length', () => {
      const result = Arr.seq(10);

      expectType<typeof result, readonly [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]>('=');

      expect(result).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    test('fixed length (empty)', () => {
      const result = Arr.seq(0);

      expectType<typeof result, readonly []>('=');

      expect(result).toStrictEqual([]);
    });

    test('unknown length', () => {
      const n: NumberType.ArraySize = toUint32(3);
      const result = Arr.seq(n);

      expectType<typeof result, readonly NumberType.ArraySize[]>('=');

      expect(result).toStrictEqual([0, 1, 2]);
    });
  });

  // testArrayEquality({
  //   testName: 'zeros 1',
  //   target: zeros(3),
  //   toBe: [0, 0, 0],
  // });

  // testArrayEquality({
  //   testName: 'zeros 2',
  //   target: zeros(0),
  //   toBe: [],
  // });

  // testArrayEquality({
  //   testName: 'zeros 3',
  //   target: zeros(1),
  //   toBe: [0],
  // });

  // testArrayEquality({
  //   testName: 'seq 1',
  //   target: seq(3),
  //   toBe: [0, 1, 2],
  // });
  // testArrayEquality({
  //   testName: 'seq 2',
  //   target: seq(0),
  //   toBe: [],
  // });
  // testArrayEquality({
  //   testName: 'seq 3',
  //   target: seq(1),
  //   toBe: [0],
  // });

  // const array1 = newArray(3, 0);
  // expectType<typeof array1, number[]>('=');

  // const array2 = newArray(3, 0);
  // expectType<typeof array2, number[] | undefined>('=');

  // testArrayEquality({
  //   testName: 'newArray 1',
  //   target: newArray(3, 0),
  //   toBe: [0, 0, 0],
  // });

  // testArrayEquality({
  //   testName: 'newArray 1',
  //   target: newArray(3, 1),
  //   toBe: [1, 1, 1],
  // });

  // testArrayEquality({
  //   testName: 'newArray 2',
  //   target: newArray(0, 0),
  //   toBe: [],
  // });

  // testArrayEquality({
  //   testName: 'newArray 3',
  //   target: newArray(1, 0),
  //   toBe: [0],
  // });

  // testArrayEquality({
  //   testName: 'newArray 4',
  //   target: newArray(1.5, 0),
  //   toBe: undefined,
  // });

  // testArrayEquality({
  //   testName: 'newArray 4',
  //   target: newArray(-1.5, 0),
  //   toBe: undefined,
  // });

  // const target = [0, 1, 2, 3, 4];

  // testArrayEquality({
  //   testName: 'safeSlice',
  //   target: safeSlice(target, 0, 5),
  //   toBe: target,
  // }); // 正常
  // testArrayEquality({
  //   testName: 'safeSlice',
  //   target: safeSlice(target, 0, 6),
  //   toBe: target,
  // }); // 片方オーバー
  // testArrayEquality({
  //   testName: 'safeSlice',
  //   target: safeSlice(target, -1, 5),
  //   toBe: target,
  // }); // 片方オーバー
  // testArrayEquality({
  //   testName: 'safeSlice',
  //   target: safeSlice(target, -1, 6),
  //   toBe: target,
  // }); // 両方オーバー
  // testArrayEquality({
  //   testName: 'safeSlice',
  //   target: safeSlice(target, 0, 3),
  //   toBe: [0, 1, 2],
  // }); // 正常
  // testArrayEquality({
  //   testName: 'safeSlice',
  //   target: safeSlice(target, -1, 3),
  //   toBe: [0, 1, 2],
  // }); // 片方オーバー
  // testArrayEquality({
  //   testName: 'safeSlice',
  //   target: safeSlice(target, 3, 5),
  //   toBe: [3, 4],
  // }); // 正常
  // testArrayEquality({
  //   testName: 'safeSlice',
  //   target: safeSlice(target, 3, 6),
  //   toBe: [3, 4],
  // }); // 片方オーバー
  // testArrayEquality({
  //   testName: 'safeSlice',
  //   target: safeSlice(target, 4, 3),
  //   toBe: [],
  // }); // start > end
  // testArrayEquality({
  //   testName: 'safeSlice',
  //   target: safeSlice(target, 0, -1),
  //   toBe: [],
  // }); // start > end
  // testArrayEquality({
  //   testName: 'safeSlice',
  //   target: safeSlice(target, -1, -2),
  //   toBe: [],
  // }); // start > end

  // testArrayEquality({
  //   testName: 'take',
  //   target: take([1, 2, 3, 4, 5], 3),
  //   toBe: [1, 2, 3],
  // });
  // testArrayEquality({
  //   testName: 'take',
  //   target: take([1, 2, 3, 4, 5], 0),
  //   toBe: [],
  // });
  // testArrayEquality({
  //   testName: 'take',
  //   target: take([1, 2, 3, 4, 5], -1),
  //   toBe: [],
  // });
  // testArrayEquality({
  //   testName: 'take',
  //   target: take([1, 2, 3, 4, 5], 5),
  //   toBe: [1, 2, 3, 4, 5],
  // });
  // testArrayEquality({
  //   testName: 'take',
  //   target: take([1, 2, 3, 4, 5], 6),
  //   toBe: [1, 2, 3, 4, 5],
  // });

  // testArrayEquality({
  //   testName: 'takeLast',
  //   target: takeLast([1, 2, 3, 4, 5], 3),
  //   toBe: [3, 4, 5],
  // });

  // testArrayEquality({
  //   testName: 'takeLast',
  //   target: takeLast([1, 2, 3, 4, 5], 0),
  //   toBe: [],
  // });

  // testArrayEquality({
  //   testName: 'takeLast',
  //   target: takeLast([1, 2, 3, 4, 5], -1),
  //   toBe: [],
  // });

  // testArrayEquality({
  //   testName: 'takeLast',
  //   target: takeLast([1, 2, 3, 4, 5], 5),
  //   toBe: [1, 2, 3, 4, 5],
  // });

  // testArrayEquality({
  //   testName: 'takeLast',
  //   target: takeLast([1, 2, 3, 4, 5], 6),
  //   toBe: [1, 2, 3, 4, 5],
  // });

  // testArrayEquality({
  //   testName: 'skipLast',
  //   target: skip([1, 2, 3, 4, 5], 3),
  //   toBe: [4, 5],
  // });

  // testArrayEquality({
  //   testName: 'skip',
  //   target: skip([1, 2, 3, 4, 5], 0),
  //   toBe: [1, 2, 3, 4, 5],
  // });

  // testArrayEquality({
  //   testName: 'skip',
  //   target: skip([1, 2, 3, 4, 5], -1),
  //   toBe: [1, 2, 3, 4, 5],
  // });

  // testArrayEquality({
  //   testName: 'skip',
  //   target: skip([1, 2, 3, 4, 5], 5),
  //   toBe: [],
  // });

  // testArrayEquality({
  //   testName: 'skip',
  //   target: skip([1, 2, 3, 4, 5], 6),
  //   toBe: [],
  // });

  // testArrayEquality({
  //   testName: 'skipLast',
  //   target: skipLast([1, 2, 3, 4, 5], 3),
  //   toBe: [1, 2],
  // });

  // testArrayEquality({
  //   testName: 'skipLast',
  //   target: skipLast([1, 2, 3, 4, 5], 0),
  //   toBe: [1, 2, 3, 4, 5],
  // });

  // testArrayEquality({
  //   testName: 'skipLast',
  //   target: skipLast([1, 2, 3, 4, 5], -1),
  //   toBe: [1, 2, 3, 4, 5],
  // });

  // testArrayEquality({
  //   testName: 'skipLast',
  //   target: skipLast([1, 2, 3, 4, 5], 5),
  //   toBe: [],
  // });

  // testArrayEquality({
  //   testName: 'skipLast',
  //   target: skipLast([1, 2, 3, 4, 5], 6),
  //   toBe: [],
  // });

  // testArrayEquality({
  //   testName: 'uniq',
  //   target: uniq([1, 2, 3, 2, 2, 2, 3, 4, 5, 5, 3, 2, 1, 3, 4, 1, 2]),
  //   toBe: [1, 2, 3, 4, 5],
  // });

  // testArrayEquality({
  //   testName: 'uniq',
  //   target: uniq([1]),
  //   toBe: [1],
  // });

  // testArrayEquality({
  //   testName: 'uniq',
  //   target: uniq([]),
  //   toBe: [],
  // });

  // testArrayEquality({
  //   testName: 'uniqBy',
  //   target: uniqBy([1, 2, 3, 4, 5, 6], (a: number) => a % 3),
  //   toBe: [1, 2, 3],
  // });

  // const cmp = (a: number, b: number): number => a - b;

  // testArrayEquality({
  //   testName: 'sort',
  //   target: sort(cmp)([3, 4, 1, 2]),
  //   toBe: [1, 2, 3, 4],
  // });

  // testArrayEquality({
  //   testName: 'sort',
  //   target: sort(cmp)([]),
  //   toBe: [],
  // });

  // testArrayEquality({
  //   testName: 'sort',
  //   target: sort(cmp)([2, 2, 2]),
  //   toBe: [2, 2, 2],
  // });

  // const array: NonEmptyArray<number> = [1, 2, 3] as const;
  // const sorted = sort(cmp)(array);
  // expectType<typeof sorted, NonEmptyArray<number>>('=');

  // const array2: NonEmptyArray<1 | 2 | 3> = [1, 2, 3] as const;
  // const sorted2 = sort(cmp)(array2);
  // expectType<typeof sorted2, NonEmptyArray<1 | 2 | 3>>('=');

  // const tuple = [1, 2, 3] as const;
  // const sorted3 = sort(cmp)(tuple);
  // expectType<typeof sorted3, readonly [1 | 2 | 3, 1 | 2 | 3, 1 | 2 | 3]>('=');

  // const add = (x: number, y: number): number => x + y;

  // testArrayEquality({
  //   testName: 'scan',
  //   target: scan(add, 0)([1, 2, 3]),
  //   toBe: [0, 1, 3, 6],
  // });

  // testArrayEquality({
  //   testName: 'scan',
  //   target: scan(add, 1)([1, 2, 3]),
  //   toBe: [1, 2, 4, 7],
  // });

  // testArrayEquality({
  //   testName: 'map',
  //   target: map((x: number) => x * x)([1, 2, 3]),
  //   toBe: [1, 4, 9],
  // });

  // const array: NonEmptyArray<number> = [1, 2, 3] as const;
  // const mapped = map((x: number) => x * x)(array);
  // expectType<typeof mapped, NonEmptyArray<number>>('=');

  // const array2: NonEmptyArray<number> = [1, 2, 3] as const;
  // const mapped2 = map((x: number, i) => x * x * i)(array2);
  // expectType<typeof mapped2, NonEmptyArray<number>>('=');

  // test('sum', () => {
  //   expect(sum([1, 2, 3])).toBe(6);
  // });

  // test('sum', () => {
  //   expect(sum([])).toBe(0);
  // });

  // test('sum', () => {
  //   expect(sum([1, 2, 3, 4])).toBe(10);
  // });

  // const xs = [1, 2, 3] as number[];
  // const s = sum(xs);
  // expectType<typeof s, number>('=');

  // const ys = [1, 2, 3] as const;
  // const s2 = sum(ys);
  // expectType<typeof s2, number>('=');
});
