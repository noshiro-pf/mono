import type { DeepReadonly } from '../deep';
import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { Paths, PathsWithIndex } from './record-paths';

export type RecordValueAtPath<R, Path extends Paths<R>> =
  Path extends readonly [infer Head, ...infer Rest]
    ? Head extends keyof R
      ? Rest extends Paths<R[Head]>
        ? RecordValueAtPath<R[Head], Rest>
        : never
      : never
    : R;

export type RecordValueAtPathWithIndex<R, Path extends PathsWithIndex<R>> =
  RecordValueAtPathWithIndexImpl<R, Path>;

type RecordValueAtPathWithIndexImpl<
  R,
  Path extends PathsWithIndex<R>,
  LastPathElement = never
> = Path extends readonly [infer Head, ...infer Rest]
  ? Head extends keyof R
    ? Rest extends PathsWithIndex<R[Head]>
      ? RecordValueAtPathWithIndexImpl<R[Head], Rest, Head>
      : never
    : never
  : number extends LastPathElement
  ? R | undefined
  : string extends LastPathElement
  ? R | undefined
  : R;

type R1 = DeepReadonly<{
  x: {
    a: 1;
    b: { x: [number, ...string[]] }[];
  };
  y: {
    c: {
      d: { x: number }[];
      4: 5;
    };
    g: [{ x: number }, ...{ y: string[] }[]];
  };
  z: [1, 2, { e: 3; f: [6, 7] }];
}>;

type TestCases = [
  [0, readonly [], R1],
  [
    1,
    readonly ['x'],
    DeepReadonly<{ a: 1; b: { x: [number, ...string[]] }[] }>
  ],
  [2, readonly ['x', 'a'], 1],
  [3, readonly ['x', 'b'], DeepReadonly<{ x: [number, ...string[]] }[]>],
  [
    4,
    readonly ['x', 'b', number],
    DeepReadonly<{ x: [number, ...string[]] }> | undefined
  ],
  [5, readonly ['x', 'b', number, 'x'], DeepReadonly<[number, ...string[]]>],
  [6, readonly ['x', 'b', number, 'x', number], number | string | undefined],
  [
    7,
    readonly ['y'],
    DeepReadonly<{
      c: {
        d: { x: number }[];
        4: 5;
      };
      g: [{ x: number }, ...{ y: string[] }[]];
    }>
  ],
  [
    8,
    readonly ['y', 'c'],
    DeepReadonly<{
      d: { x: number }[];
      4: 5;
    }>
  ],
  [9, readonly ['y', 'c', 'd'], DeepReadonly<{ x: number }[]>],
  [
    10,
    readonly ['y', 'c', 'd', number],
    DeepReadonly<{ x: number }> | undefined
  ],
  [11, readonly ['y', 'c', 'd', number, 'x'], number],
  [12, readonly ['y', 'c', 4], 5],
  [
    13,
    readonly ['y', 'g'],
    DeepReadonly<[{ x: number }, ...{ y: string[] }[]]>
  ],
  [
    14,
    readonly ['y', 'g', number],
    DeepReadonly<{ x: number } | { y: string[] }> | undefined
  ],
  [15, readonly ['y', 'g', 0, 'x'], number],
  [16, readonly ['y', 'g', 1, 'y'], readonly string[]],
  [17, readonly ['y', 'g', 1, 'y', number], string | undefined],
  [18, readonly ['z'], DeepReadonly<[1, 2, { e: 3; f: [6, 7] }]>],
  [19, readonly ['z', 0], 1],
  [20, readonly ['z', 1], 2],
  [21, readonly ['z', 2], DeepReadonly<{ e: 3; f: [6, 7] }>],
  [22, readonly ['z', 2, 'e'], 3],
  [23, readonly ['z', 2, 'f'], readonly [6, 7]],
  [24, readonly ['z', 2, 'f', 0], 6],
  [25, readonly ['z', 2, 'f', 1], 7]
];

assertType<TypeEq<RecordValueAtPath<R1, TestCases[0][1]>, TestCases[0][2]>>();
assertType<TypeEq<RecordValueAtPath<R1, TestCases[1][1]>, TestCases[1][2]>>();
assertType<TypeEq<RecordValueAtPath<R1, TestCases[2][1]>, TestCases[2][2]>>();
assertType<TypeEq<RecordValueAtPath<R1, TestCases[3][1]>, TestCases[3][2]>>();
assertType<TypeEq<RecordValueAtPath<R1, TestCases[7][1]>, TestCases[7][2]>>();
assertType<TypeEq<RecordValueAtPath<R1, TestCases[8][1]>, TestCases[8][2]>>();
assertType<TypeEq<RecordValueAtPath<R1, TestCases[9][1]>, TestCases[9][2]>>();
assertType<TypeEq<RecordValueAtPath<R1, TestCases[12][1]>, TestCases[12][2]>>();
assertType<TypeEq<RecordValueAtPath<R1, TestCases[13][1]>, TestCases[13][2]>>();
assertType<TypeEq<RecordValueAtPath<R1, TestCases[18][1]>, TestCases[18][2]>>();
assertType<TypeEq<RecordValueAtPath<R1, TestCases[19][1]>, TestCases[19][2]>>();
assertType<TypeEq<RecordValueAtPath<R1, TestCases[20][1]>, TestCases[20][2]>>();
assertType<TypeEq<RecordValueAtPath<R1, TestCases[21][1]>, TestCases[21][2]>>();
assertType<TypeEq<RecordValueAtPath<R1, TestCases[22][1]>, TestCases[22][2]>>();
assertType<TypeEq<RecordValueAtPath<R1, TestCases[23][1]>, TestCases[23][2]>>();
assertType<TypeEq<RecordValueAtPath<R1, TestCases[24][1]>, TestCases[24][2]>>();
assertType<TypeEq<RecordValueAtPath<R1, TestCases[25][1]>, TestCases[25][2]>>();

assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[0][1]>, TestCases[0][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[1][1]>, TestCases[1][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[2][1]>, TestCases[2][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[3][1]>, TestCases[3][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[4][1]>, TestCases[4][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[5][1]>, TestCases[5][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[6][1]>, TestCases[6][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[7][1]>, TestCases[7][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[8][1]>, TestCases[8][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[9][1]>, TestCases[9][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[10][1]>, TestCases[10][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[11][1]>, TestCases[11][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[12][1]>, TestCases[12][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[13][1]>, TestCases[13][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[14][1]>, TestCases[14][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[15][1]>, TestCases[15][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[16][1]>, TestCases[16][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[17][1]>, TestCases[17][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[18][1]>, TestCases[18][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[19][1]>, TestCases[19][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[20][1]>, TestCases[20][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[21][1]>, TestCases[21][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[22][1]>, TestCases[22][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[23][1]>, TestCases[23][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[24][1]>, TestCases[24][2]>
>();
assertType<
  TypeEq<RecordValueAtPathWithIndex<R1, TestCases[25][1]>, TestCases[25][2]>
>();
