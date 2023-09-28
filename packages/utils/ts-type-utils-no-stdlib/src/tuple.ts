import { type NonEmptyArray } from './utils';

export namespace Tuple {
  export type Head<
    T extends readonly unknown[],
    D = never
  > = T extends readonly [infer X, ...(readonly unknown[])] ? X : D;

  export type Last<T extends readonly unknown[]> = T extends readonly []
    ? never
    : T extends readonly [unknown]
    ? Head<T>
    : Last<Tail<T>>;

  export type ButLast<A extends readonly unknown[]> = A extends readonly []
    ? readonly []
    : A extends readonly [...infer R, unknown]
    ? Readonly<R>
    : Readonly<A>;

  export type Tail<A extends readonly unknown[]> = A extends readonly []
    ? readonly []
    : A extends readonly [unknown, ...infer R]
    ? Readonly<R>
    : Readonly<A>;

  /** @internal */
  type _ReverseImpl<
    L extends readonly unknown[],
    X extends readonly unknown[]
  > = L extends readonly []
    ? X
    : _ReverseImpl<Tail<L>, readonly [Head<L>, ...X]>;

  export type Reverse<L extends readonly unknown[]> = _ReverseImpl<
    L,
    readonly []
  >;

  // export type Rest<T extends unknown[]> = ((...x: T) => void) extends (
  //   x: T[0],
  //   ...xs: infer XS
  // ) => void
  //   ? XS
  //   : never;

  /** @internal */
  type _TakeImpl<
    N extends number,
    T extends readonly unknown[],
    R extends readonly unknown[]
  > = {
    0: Reverse<R>;
    1: _TakeImpl<N, Tail<T>, readonly [Head<T>, ...R]>;
  }[T extends readonly [] ? 0 : R['length'] extends N ? 0 : 1];

  export type Take<N extends number, T extends readonly unknown[]> = _TakeImpl<
    N,
    T,
    readonly []
  >;

  /** @internal */
  type _SkipImpl<
    N extends number,
    T extends readonly unknown[],
    R extends readonly unknown[]
  > = T extends readonly []
    ? T
    : R['length'] extends N
    ? T
    : _SkipImpl<N, Tail<T>, readonly [Head<T>, ...R]>;

  export type Skip<N extends number, T extends readonly unknown[]> = _SkipImpl<
    N,
    T,
    readonly []
  >;

  /** @internal */
  type _TakeLastImpl<
    N extends number,
    T extends readonly unknown[],
    R extends readonly unknown[]
  > = T extends readonly []
    ? R
    : R['length'] extends N
    ? R
    : _TakeLastImpl<N, ButLast<T>, readonly [Last<T>, ...R]>;

  export type TakeLast<
    N extends number,
    T extends readonly unknown[]
  > = _TakeLastImpl<N, T, readonly []>;

  /** @internal */
  type _SkipLastImpl<
    N extends number,
    T extends readonly unknown[],
    R extends readonly unknown[]
  > = T extends readonly []
    ? T
    : R['length'] extends N
    ? T
    : _SkipLastImpl<N, ButLast<T>, readonly [Last<T>, ...R]>;

  export type SkipLast<
    N extends number,
    T extends readonly unknown[]
  > = _SkipLastImpl<N, T, readonly []>;

  /** @internal */
  type _SetAtImpl<
    T extends readonly unknown[],
    I extends number,
    V,
    ACC extends readonly unknown[]
  > = {
    end: Reverse<ACC>;
    next: _SetAtImpl<Tail<T>, I, V, readonly [Head<T>, ...ACC]>;
    setValue: _SetAtImpl<Tail<T>, I, V, readonly [V, ...ACC]>;
  }[T extends readonly []
    ? 'end'
    : ACC['length'] extends I
    ? 'setValue'
    : 'next'];

  export type SetAt<
    T extends readonly unknown[],
    I extends number,
    V
  > = _SetAtImpl<T, I, V, readonly []>;

  /** @internal */
  type _FlattenImpl<
    T extends readonly (readonly unknown[])[],
    R1 extends readonly unknown[],
    R2 extends readonly unknown[]
  > = T extends readonly []
    ? R1 extends readonly []
      ? Reverse<R2>
      : _FlattenImpl<T, Tail<R1>, readonly [Head<R1>, ...R2]>
    : R1 extends readonly []
    ? _FlattenImpl<Tail<T>, Head<T, []>, R2>
    : _FlattenImpl<T, Tail<R1>, readonly [Head<R1>, ...R2]>;

  export type Flatten<T extends readonly (readonly unknown[])[]> = _FlattenImpl<
    T,
    readonly [],
    readonly []
  >;

  /** @internal */
  type _ConcatImpl<
    A extends readonly unknown[],
    B extends readonly unknown[],
    R extends readonly unknown[]
  > = A extends readonly []
    ? B extends readonly []
      ? Reverse<R>
      : _ConcatImpl<A, Tail<B>, readonly [Head<B>, ...R]>
    : _ConcatImpl<Tail<A>, B, readonly [Head<A>, ...R]>;

  export type Concat<
    A extends readonly unknown[],
    B extends readonly unknown[]
  > = _ConcatImpl<A, B, readonly []>;

  export type Zip<
    A extends readonly unknown[],
    B extends readonly unknown[]
  > = A extends NonEmptyArray<unknown>
    ? B extends NonEmptyArray<unknown>
      ? readonly [readonly [Head<A>, Head<B>], ...Zip<Tail<A>, Tail<B>>] // both A and B has at least 1 element
      : readonly []
    : readonly [];

  /** @internal */
  type _PartitionImpl<
    N extends number,
    T extends readonly unknown[],
    R1 extends readonly unknown[],
    R2 extends readonly unknown[]
  > = T extends readonly []
    ? R1 extends readonly []
      ? Reverse<R2>
      : _PartitionImpl<N, T, readonly [], readonly [Reverse<R1>, ...R2]>
    : R1['length'] extends N
    ? _PartitionImpl<N, T, readonly [], readonly [Reverse<R1>, ...R2]>
    : _PartitionImpl<N, Tail<T>, readonly [Head<T>, ...R1], R2>;

  export type Partition<
    N extends number,
    T extends readonly unknown[]
  > = _PartitionImpl<N, T, readonly [], readonly []>;
}
