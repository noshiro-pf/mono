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

/* improved standard type utilities */

export type StrictExclude<T, U extends T> = T extends U ? never : T;

export type StrictOmit<T, K extends keyof T> = Pick<
  T,
  StrictExclude<keyof T, K>
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

export type JSONValue =
  | JSONValue[]
  | boolean
  | number
  | string
  | {
      [K in string]?: JSONValue;
    }
  | null;

export type ReadonlyJSONValue =
  | boolean
  | number
  | string
  | readonly ReadonlyJSONValue[]
  | {
      readonly [K in string]?: ReadonlyJSONValue;
    }
  | null;

export type ReadonlyJSONType = ReadonlyRecord<string, ReadonlyJSONValue>;

export type JSONType = ReadonlyRecord<string, JSONValue>;

/* Other Utilities */

export type ReducerType<State, Action> = (
  state: State,
  action: Action
) => State;

export type TimerId = ReturnType<typeof setTimeout>; // NodeJS.Timeout or number

export type ToString<A> = A extends number ? `${A}` : A;

export type ValueOf<T> = T[keyof T];

export type UnionToIntersection<T> = (
  T extends unknown ? (arg: T) => void : never
) extends (arg: infer F) => void
  ? F
  : unknown;

export type Writable<T> = { -readonly [P in keyof T]: T[P] };

export type RecordKeyType = keyof never;

export type ReadonlyRecord<K extends RecordKeyType, V> = Readonly<Record<K, V>>;

export type ReadonlyRecordBase = ReadonlyRecord<RecordKeyType, unknown>;

export type FunctionType<A, B> = (value: A) => B;

export type MonoTypeFunction<X> = (value: X) => X;

/* Array utilities */

export type MutableNonEmptyArray<A> = [A, ...A[]];

export type NonEmptyArray<A> = readonly [A, ...(readonly A[])];

export type Length<T extends { length: number }> = T['length'];

export type ArrayElement<S> = S extends readonly (infer T)[] ? T : never;

/* ArrayOfLength */

export type MutableArrayOfLength<N extends number, T> = MutableArrayOfLengthRec<
  N,
  T,
  []
>;

export type ArrayOfLength<N extends number, T> = Readonly<
  MutableArrayOfLength<N, T>
>;

/** @internal */
type MutableArrayOfLengthRec<Num, Elm, T extends unknown[]> = {
  0: T;
  1: MutableArrayOfLengthRec<Num, Elm, [Elm, ...T]>;
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
