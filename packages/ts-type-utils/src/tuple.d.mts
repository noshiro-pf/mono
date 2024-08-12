declare namespace Tuple {
  type Head<T extends readonly unknown[], D = never> = T extends readonly [
    infer X,
    ...(readonly unknown[]),
  ]
    ? X
    : D;

  type Last<T extends readonly unknown[]> = T extends readonly []
    ? never
    : T extends readonly [unknown]
      ? Head<T>
      : Last<Tail<T>>;

  type ButLast<A extends readonly unknown[]> = A extends readonly []
    ? readonly []
    : A extends readonly [...infer R, unknown]
      ? Readonly<R>
      : Readonly<A>;

  type Tail<A extends readonly unknown[]> = A extends readonly []
    ? readonly []
    : A extends readonly [unknown, ...infer R]
      ? Readonly<R>
      : Readonly<A>;

  type Reverse<L extends readonly unknown[]> = TSTypeUtilsInternals.ReverseImpl<
    L,
    readonly []
  >;

  // type Rest<T extends unknown[]> = ((...x: T) => void) extends (
  //   x: T[0],
  //   ...xs: infer XS
  // ) => void
  //   ? XS
  //   : never;

  type Take<
    N extends number,
    T extends readonly unknown[],
  > = TSTypeUtilsInternals.TakeImpl<N, T, readonly []>;

  type Skip<
    N extends number,
    T extends readonly unknown[],
  > = TSTypeUtilsInternals.SkipImpl<N, T, readonly []>;

  type TakeLast<
    N extends number,
    T extends readonly unknown[],
  > = TSTypeUtilsInternals.TakeLastImpl<N, T, readonly []>;

  type SkipLast<
    N extends number,
    T extends readonly unknown[],
  > = TSTypeUtilsInternals.SkipLastImpl<N, T, readonly []>;

  type SetAt<
    T extends readonly unknown[],
    I extends number,
    V,
  > = TSTypeUtilsInternals.SetAtImpl<T, I, V, readonly []>;

  type Flatten<T extends readonly (readonly unknown[])[]> =
    TSTypeUtilsInternals.FlattenImpl<T, readonly [], readonly []>;

  type Concat<
    A extends readonly unknown[],
    B extends readonly unknown[],
  > = TSTypeUtilsInternals.ConcatImpl<A, B, readonly []>;

  type Zip<A extends readonly unknown[], B extends readonly unknown[]> =
    A extends NonEmptyArray<unknown>
      ? B extends NonEmptyArray<unknown>
        ? readonly [readonly [Head<A>, Head<B>], ...Zip<Tail<A>, Tail<B>>] // both A and B has at least 1 element
        : readonly []
      : readonly [];

  type Partition<
    N extends number,
    T extends readonly unknown[],
  > = TSTypeUtilsInternals.PartitionImpl<N, T, readonly [], readonly []>;

  /** @internal */
  namespace TSTypeUtilsInternals {
    type ReverseImpl<
      L extends readonly unknown[],
      X extends readonly unknown[],
    > = L extends readonly []
      ? X
      : ReverseImpl<Tail<L>, readonly [Head<L>, ...X]>;

    type TakeImpl<
      N extends number,
      T extends readonly unknown[],
      R extends readonly unknown[],
    > = {
      0: Reverse<R>;
      1: TakeImpl<N, Tail<T>, readonly [Head<T>, ...R]>;
    }[T extends readonly [] ? 0 : R['length'] extends N ? 0 : 1];

    type SkipImpl<
      N extends number,
      T extends readonly unknown[],
      R extends readonly unknown[],
    > = T extends readonly []
      ? T
      : R['length'] extends N
        ? T
        : SkipImpl<N, Tail<T>, readonly [Head<T>, ...R]>;

    type TakeLastImpl<
      N extends number,
      T extends readonly unknown[],
      R extends readonly unknown[],
    > = T extends readonly []
      ? R
      : R['length'] extends N
        ? R
        : TakeLastImpl<N, ButLast<T>, readonly [Last<T>, ...R]>;

    type SkipLastImpl<
      N extends number,
      T extends readonly unknown[],
      R extends readonly unknown[],
    > = T extends readonly []
      ? T
      : R['length'] extends N
        ? T
        : SkipLastImpl<N, ButLast<T>, readonly [Last<T>, ...R]>;

    type SetAtImpl<
      T extends readonly unknown[],
      I extends number,
      V,
      ACC extends readonly unknown[],
    > = {
      end: Reverse<ACC>;
      next: SetAtImpl<Tail<T>, I, V, readonly [Head<T>, ...ACC]>;
      setValue: SetAtImpl<Tail<T>, I, V, readonly [V, ...ACC]>;
    }[T extends readonly []
      ? 'end'
      : ACC['length'] extends I
        ? 'setValue'
        : 'next'];

    type FlattenImpl<
      T extends readonly (readonly unknown[])[],
      R1 extends readonly unknown[],
      R2 extends readonly unknown[],
    > = T extends readonly []
      ? R1 extends readonly []
        ? Reverse<R2>
        : FlattenImpl<T, Tail<R1>, readonly [Head<R1>, ...R2]>
      : R1 extends readonly []
        ? FlattenImpl<Tail<T>, Head<T, []>, R2>
        : FlattenImpl<T, Tail<R1>, readonly [Head<R1>, ...R2]>;

    type ConcatImpl<
      A extends readonly unknown[],
      B extends readonly unknown[],
      R extends readonly unknown[],
    > = A extends readonly []
      ? B extends readonly []
        ? Reverse<R>
        : ConcatImpl<A, Tail<B>, readonly [Head<B>, ...R]>
      : ConcatImpl<Tail<A>, B, readonly [Head<A>, ...R]>;

    type PartitionImpl<
      N extends number,
      T extends readonly unknown[],
      R1 extends readonly unknown[],
      R2 extends readonly unknown[],
    > = T extends readonly []
      ? R1 extends readonly []
        ? Reverse<R2>
        : PartitionImpl<N, T, readonly [], readonly [Reverse<R1>, ...R2]>
      : R1['length'] extends N
        ? PartitionImpl<N, T, readonly [], readonly [Reverse<R1>, ...R2]>
        : PartitionImpl<N, Tail<T>, readonly [Head<T>, ...R1], R2>;
  }
}
