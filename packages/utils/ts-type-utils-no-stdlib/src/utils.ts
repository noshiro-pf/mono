/* Type Test Utilities */

// https://github.com/microsoft/TypeScript/issues/27024
// prettier-ignore
export type TypeEq<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

export type ExpectTrue<T extends true> = T;

export type TypeExtends<A, B> = A extends B ? true : false;

/**
 * Exclude from T those types that are assignable to U
 */
export type RelaxedExclude<T, U> = T extends U ? never : T;

/**
 * Construct a type with the properties of T except for those in type K.
 */
export type RelaxedOmit<T, K extends keyof never> = Pick<
  T,
  RelaxedExclude<keyof T, K>
>;

/* type constants */

export type Primitive =
  | bigint
  | boolean
  | number
  | string
  | symbol
  | null
  | undefined;

/* JSONValue */

export type MutableJSONValue =
  | MutableJSONValue[]
  | boolean
  | number
  | string
  | {
      [K in string]?: MutableJSONValue;
    }
  | null;

export type JSONValue =
  | boolean
  | number
  | string
  | readonly JSONValue[]
  | {
      readonly [K in string]?: JSONValue;
    }
  | null;

export type JSONType = Record<string, JSONValue>;

export type MutableJSONType = MutableRecord<string, MutableJSONValue>;

/* Other Utilities */

export type Reducer<S, A> = (state: S, action: A) => S;

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
