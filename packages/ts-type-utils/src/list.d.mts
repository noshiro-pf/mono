declare namespace ListType {
  type Head<T extends readonly unknown[], D = never> = Tuple.Head<T, D>;

  type Last<T extends readonly unknown[]> = T extends readonly []
    ? never
    : T extends readonly [unknown]
      ? Head<T>
      : Last<Tail<T>>;

  type ButLast<A extends readonly unknown[]> = Tuple.ButLast<A>;

  type Tail<A extends readonly unknown[]> = Tuple.Tail<A>;

  type Reverse<L extends readonly unknown[]> = L extends readonly []
    ? readonly []
    : IsFixedLengthList<L> extends true
      ? Tuple.Reverse<L>
      : L extends readonly [unknown, ...(readonly unknown[])]
        ? readonly [...Reverse<Tail<L>>, Head<L>]
        : Readonly<L>;

  type Take<N extends number, T extends readonly unknown[]> =
    IsFixedLengthList<T> extends true ? Tuple.Take<N, T> : T;

  type Skip<N extends number, T extends readonly unknown[]> =
    IsFixedLengthList<T> extends true ? Tuple.Skip<N, T> : T;

  type TakeLast<N extends number, T extends readonly unknown[]> =
    IsFixedLengthList<T> extends true ? Tuple.TakeLast<N, T> : T;

  type SkipLast<N extends number, T extends readonly unknown[]> =
    IsFixedLengthList<T> extends true ? Tuple.SkipLast<N, T> : T;

  type SetAt<T extends readonly unknown[], I extends number, V> =
    IsFixedLengthList<T> extends true
      ? Tuple.SetAt<T, I, V>
      : readonly (T[number] | V)[];

  type Flatten<T extends readonly (readonly unknown[])[]> = Tuple.Flatten<T>;

  type Concat<
    A extends readonly unknown[],
    B extends readonly unknown[],
  > = Tuple.Concat<A, B>;

  type Zip<
    A extends readonly unknown[],
    B extends readonly unknown[],
  > = A extends readonly []
    ? readonly []
    : B extends readonly []
      ? readonly []
      : A extends NonEmptyArray<unknown>
        ? B extends NonEmptyArray<unknown>
          ? readonly [readonly [Head<A>, Head<B>], ...Zip<Tail<A>, Tail<B>>] // both A and B has at least 1 element
          : readonly [readonly [Head<A>, B[number]], ...Zip<Tail<A>, Tail<B>>] // A has at least 1 element but B has at least 0 element
        : B extends NonEmptyArray<unknown>
          ? readonly [readonly [A[number], Head<B>], ...Zip<Tail<A>, Tail<B>>] // B has at least 1 element but A has at least 0 element
          : readonly (readonly [A[number], B[number]])[];

  type Partition<
    N extends number,
    T extends readonly unknown[],
  > = Tuple.Partition<N, T>;
}
