import { expectType } from '@noshiro/ts-utils';

export type ShiftZip<T extends readonly unknown[]> = ListType.Zip<
  T,
  ListType.Tail<T>
>;

{
  expectType<ShiftZip<[1, 2, 3]>, DeepReadonly<[[1, 2], [2, 3]]>>('=');

  expectType<ShiftZip<[1, 2, 3, 4]>, DeepReadonly<[[1, 2], [2, 3], [3, 4]]>>(
    '=',
  );
}

export type Tuple2Fn<T> = T extends readonly [infer A, infer B]
  ? (x: A) => B
  : never;

{
  expectType<Tuple2Fn<[1, 2]>, (x: 1) => 2>('=');
  expectType<Tuple2Fn<[3, 4]>, (x: 3) => 4>('=');
}

export type Fn2Tuple2<T> = T extends (x: infer A) => infer B
  ? readonly [A, B]
  : never;

{
  expectType<Fn2Tuple2<(x: 1) => 2>, readonly [1, 2]>('=');
  expectType<Fn2Tuple2<(x: 3) => 4>, readonly [3, 4]>('=');
}

export type MapTuplesToFns<T extends readonly unknown[]> = {
  readonly [P in keyof T]: Tuple2Fn<T[P]>;
};

{
  expectType<
    MapTuplesToFns<[[1, 2], [2, 3]]>,
    readonly [(x: 1) => 2, (x: 2) => 3]
  >('=');
}

export type ComposeArg<T extends readonly unknown[]> = MapTuplesToFns<
  ShiftZip<T>
>;

{
  expectType<ComposeArg<[1, 2, 3]>, readonly [(x: 1) => 2, (x: 2) => 3]>('=');
}

// type UnknownFn = (...args: readonly never[]) => unknown;

// type Cast1<T> = T extends readonly UnknownFn[] ? T : never;

// type Cast2<T> = T extends UnknownFn ? T : never;

// type ComposeFn<
//   Ret extends readonly unknown[],
//   Fns extends Cast1<ComposeArg<Ret>>,
// > = (...f: Fns) => (
//   x: Parameters<Cast2<ListType.Head<Fns>>>[0],
//   // @ts-expect-error infinite loop
// ) => ReturnType<Cast2<ListType.Last<Fns>>>;

// type ComposeResult<
//   Ret extends readonly unknown[],
//   Fns extends Cast1<ComposeArg<Ret>>,
// > = (
//   x: Parameters<Cast2<ListType.Head<Fns>>>[0],
//   // @ts-expect-error infinite loop
// ) => ReturnType<Cast2<ListType.Last<Fns>>>;

// {
//   expectType<Parameters<ListType.Head<[(x: 1) => 2, (x: 2) => 3]>>[0], 1>('=');

//   expectType<
//     ReturnType<ComposeFn<[1, 2, 3], [(x: 1) => 2, (x: 2) => 3]>>,
//     (x: 1) => 3
//   >('=');

//   expectType<ComposeResult<[1, 2, 3], [(x: 1) => 2, (x: 2) => 3]>, (x: 1) => 3>(
//     '=',
//   );
// }

// export const compose = <
//   // T extends readonly unknown[],
//   Fns extends readonly UnknownFn[],
// >(
//   // p: Parameters<Cast2<ListType.Head<Fns>>>[0],
//   // ...fns: Cast1<ComposeArg<T>>
//   ...fns: Fns
// ) =>
//   ((x: ListType.Head<T>) =>
//     fns.reduce((acc, fn) => fn(acc as never) as any, x)) as unknown as Tuple2Fn<
//     [ListType.Head<T>, ListType.Last<T>]
//   >;

// {
//   const fn1 = (_x: 1): 2 => 2;
//   const fn2 = (_x: 2): 3 => 3;

//   const fn = compose(fn1, fn2);
// }

// https://qiita.com/kgtkr/items/11c8dceae012ae306abe#%E5%AE%9F%E8%B7%B5%E7%B7%A8pipe%E9%96%A2%E6%95%B0%E3%81%AB%E5%9E%8B%E4%BB%98%E3%81%91%E3%82%92%E3%81%97%E3%82%88%E3%81%86
