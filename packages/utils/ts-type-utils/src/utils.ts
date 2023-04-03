export type TimerId = ReturnType<typeof setTimeout>; // NodeJS.Timeout or number

export type ToString<A> = A extends number ? `${A}` : A;

export type ValueOf<T> = T[keyof T];

export type UnionToIntersection<T> = (
  T extends unknown ? (arg: T) => void : never
) extends (arg: infer F) => void
  ? F
  : never;

export type Writable<T> = { -readonly [P in keyof T]: T[P] };

export type RecordKeyType = keyof never;

export type MutableRecord<K extends RecordKeyType, V> = {
  [P in K]: V;
};

export type RecordBase = Record<RecordKeyType, unknown>;

export type FunctionType<A, B> = (value: A) => B;

export type MonoTypeFunction<X> = (value: X) => X;

/* Array utilities */

export type MutableNonEmptyArray<A> = [A, ...A[]];

export type NonEmptyArray<A> = readonly [A, ...(readonly A[])];

export type Length<T extends { length: number }> = T['length'];

export type ArrayElement<S> = S extends readonly (infer T)[] ? T : never;

/* ArrayOfLength */

export type ArrayOfLength<N extends number, T> = _ArrayOfLengthRec<
  N,
  T,
  readonly []
>;

export type MutableArrayOfLength<N extends number, T> = Writable<
  ArrayOfLength<N, T>
>;

/** @internal */
type _ArrayOfLengthRec<Num, Elm, T extends readonly unknown[]> = {
  0: T;
  1: _ArrayOfLengthRec<Num, Elm, readonly [Elm, ...T]>;
}[T extends { length: Num } ? 0 : 1];

/* ArrayAtLeastLen */

// https://qiita.com/uhyo/items/80ce7c00f413c1d1be56

export type MutableArrayAtLeastLen<
  N extends number,
  T
> = MutableArrayAtLeastLenRec<N, T, T[], []>;

export type ArrayAtLeastLen<N extends number, T> = Readonly<
  MutableArrayAtLeastLen<N, T>
>;

/** @internal */
type MutableArrayAtLeastLenRec<
  Num,
  Elm,
  T extends unknown[],
  C extends unknown[]
> = {
  0: T;
  1: MutableArrayAtLeastLenRec<Num, Elm, [Elm, ...T], [unknown, ...C]>;
}[C extends { length: Num } ? 0 : 1];

export type MergeIntersection<R extends Record<string, unknown>> = {
  [K in keyof R]: R[K];
};

export type Reducer<S, A> = (state: S, action: A) => S;
