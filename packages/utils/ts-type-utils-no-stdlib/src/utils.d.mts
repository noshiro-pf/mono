// https://github.com/microsoft/TypeScript/issues/27024
// prettier-ignore
type TypeEq<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

type ExpectTrue<T extends true> = T;

type TypeExtends<A, B> = A extends B ? true : false;

/** Exclude from T those types that are assignable to U */
type RelaxedExclude<T, U> = T extends U ? never : T;

/** Construct a type with the properties of T except for those in type K. */
type RelaxedOmit<T, K extends keyof never> = Pick<
  T,
  RelaxedExclude<keyof T, K>
>;

/* type constants */

type Primitive = bigint | boolean | number | string | symbol | null | undefined;

/* JSONValue */

type MutableJSONValue =
  | MutableJSONValue[]
  | boolean
  | number
  | string
  | {
      [K in string]?: MutableJSONValue;
    }
  | null;

type JSONValue =
  | boolean
  | number
  | string
  | readonly JSONValue[]
  | {
      readonly [K in string]?: JSONValue;
    }
  | null;

type JSONType = Record<string, JSONValue>;

type MutableJSONType = MutableRecord<string, MutableJSONValue>;

/* Other Utilities */

type Reducer<S, A> = (state: S, action: A) => S;

type ToString<A> = A extends number ? `${A}` : A;

type ValueOf<T> = T[keyof T];

type UnionToIntersection<T> = (
  T extends unknown ? (arg: T) => void : never
) extends (arg: infer F) => void
  ? F
  : never;

type Writable<T> = { -readonly [P in keyof T]: T[P] };

type RecordKeyType = keyof never;

type MutableRecord<K extends RecordKeyType, V> = {
  [P in K]: V;
};

type RecordBase = Record<string, unknown>;

type FunctionType<A, B> = (value: A) => B;
type Fn<A, B> = (value: A) => B;

type MonoTypeFunction<X> = Fn<X, X>;

/* Array utilities */

type MutableNonEmptyArray<A> = [A, ...A[]];

type NonEmptyArray<A> = readonly [A, ...(readonly A[])];

type Length<T extends { length: number }> = T['length'];

type ArrayElement<S> = S extends readonly (infer T)[] ? T : never;

/* ArrayOfLength */

type ArrayOfLength<N extends number, Elm> = MakeTuple<Elm, N>;

type MutableArrayOfLength<N extends number, Elm> = Writable<
  ArrayOfLength<N, Elm>
>;

/* ArrayAtLeastLen */

// https://qiita.com/uhyo/items/80ce7c00f413c1d1be56

type MutableArrayOfLengthOrMore<N extends number, Elm> = MutableArrayAtLeastLen<
  N,
  Elm
>;
type MutableArrayAtLeastLen<N extends number, Elm> = Writable<
  ArrayAtLeastLen<N, Elm>
>;

type ArrayOfLengthOrMore<N extends number, Elm> = ArrayAtLeastLen<N, Elm>;
type ArrayAtLeastLen<N extends number, Elm> = readonly [
  ...MakeTuple<Elm, N>,
  ...Elm[],
];

// type ArrayAtLeastLen<N extends number, Elm> = ArrayAtLeastLenRec<
//   N,
//   Elm,
//   Elm[],
//   []
// >;

// /** @internal */
// type ArrayAtLeastLenRec<
//   Num,
//   Elm,
//   T extends readonly unknown[],
//   C extends readonly unknown[],
// > = C extends { length: Num }
//   ? T
//   : ArrayAtLeastLenRec<
//       Num,
//       Elm,
//       readonly [Elm, ...T],
//       readonly [unknown, ...C]
//     >;

type MergeIntersection<R extends Record<string, unknown>> = {
  [K in keyof R]: R[K];
};

/** @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods */
type HTTPRequestMethod =
  | 'CONNECT'
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'TRACE';
