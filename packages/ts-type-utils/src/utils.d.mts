/* eslint-disable @typescript-eslint/no-restricted-types */
/* eslint-disable no-restricted-globals */
// https://github.com/microsoft/TypeScript/issues/27024
// prettier-ignore
type TypeEq<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

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

/* JSON */

type JsonPrimitive = boolean | number | string | null;

type MutableJsonValue =
  | JsonPrimitive
  | MutableJsonValue[]
  | {
      [k: string]: MutableJsonValue;
    };

type JsonValue =
  | JsonPrimitive
  | Readonly<{
      [k: string]: JsonValue;
    }>
  | readonly JsonValue[];

type JsonObject = Record<string, JsonValue>;

type MutableJsonObject = MutableRecord<string, MutableJsonValue>;

/* Other Utilities */

type Reducer<S, A> = (state: S, action: A) => S;

type ToString<A> = A extends number ? `${A}` : A;

type ValueOf<T> = T[keyof T];

type UnionToIntersection<T> = (
  T extends unknown ? (arg: T) => void : never
) extends (arg: infer F) => void
  ? F
  : never;

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToMutableMap<T extends ReadonlyMap<any, any>> =
  T extends ReadonlyMap<infer K, infer V> ? Map<K, V> : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToMutableSet<T extends ReadonlySet<any>> =
  T extends ReadonlySet<infer V> ? Set<V> : never;

type DeepReadonly<T> = T extends Primitive
  ? T
  : // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    T extends Function
    ? T
    : T extends MutableMap<infer K, infer V>
      ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
      : T extends MutableSet<infer V>
        ? ReadonlySet<DeepReadonly<V>>
        : T extends object | readonly unknown[]
          ? {
              readonly [K in keyof T]: DeepReadonly<T[K]>;
            }
          : T;

type MutableSet<K> = Set<K>;

type MutableMap<K, V> = Map<K, V>;

type DeepMutable<T> = T extends Primitive
  ? T
  : // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    T extends Function
    ? T
    : T extends ReadonlyMap<infer K, infer V>
      ? MutableMap<DeepMutable<K>, DeepMutable<V>>
      : T extends ReadonlySet<infer V>
        ? MutableSet<DeepMutable<V>>
        : T extends object | readonly unknown[]
          ? {
              -readonly [K in keyof T]: DeepMutable<T[K]>;
            }
          : T;

type DeepPartial<T> = T extends Primitive
  ? T
  : // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    T extends Function
    ? T
    : T extends MutableMap<infer K, infer V>
      ? ReadonlyMap<DeepPartial<K>, DeepPartial<V>>
      : T extends MutableSet<infer V>
        ? ReadonlySet<DeepPartial<V>>
        : T extends object | readonly unknown[]
          ? {
              [K in keyof T]?: DeepPartial<T[K]>;
            }
          : T;

type RecordKeyType = keyof never;

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
type MutableRecord<K extends RecordKeyType, V> = {
  [P in K]: V;
};

type UnknownRecord = Record<string, unknown>;

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

type MutableArrayOfLength<N extends number, Elm> = Mutable<
  ArrayOfLength<N, Elm>
>;

/* ArrayAtLeastLen */

// https://qiita.com/uhyo/items/80ce7c00f413c1d1be56

type MutableArrayOfLengthOrMore<N extends number, Elm> = MutableArrayAtLeastLen<
  N,
  Elm
>;
type MutableArrayAtLeastLen<N extends number, Elm> = Mutable<
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

type MergeIntersection<R extends UnknownRecord> = {
  [K in keyof R]: R[K];
};

type PartiallyPartial<T, K extends keyof T> = MergeIntersection<
  Omit<T, K> & Partial<Pick<T, K>>
>;

type PartiallyNullable<T, K extends keyof T> = MergeIntersection<
  Omit<T, K> & { [P in K]: T[P] | undefined }
>;

// eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
type FalsyValue = -0 | '' | 0 | 0n | false | null | undefined;

/** 注：NaN は型で除外できていない。 */
type ExcludeFalsyValue<A> = RelaxedExclude<A, FalsyValue>;

type PickUndefined<Obj> = {
  [K in keyof Obj]-?: undefined extends Obj[K] ? K : never;
}[keyof Obj];

type MapToNever<Obj> = {
  [K in keyof Obj]: never;
};

/**
 * `Obj` のうち optional なキーを union として返す。
 *
 * ```ts
 * type K = OptionalKeys<{
 *   a?: 0;
 *   b?: 0 | undefined;
 *   c?: undefined;
 *   d: 0;
 *   e: undefined;
 *   f: 0 | undefined;
 * }>; // 'a' | 'b' | 'c'
 * ```
 */
type OptionalKeys<Obj> = PickUndefined<MapToNever<Obj>>;

/**
 * `Obj` のうち optional でないキーを union として返す。
 *
 * ```ts
 * type K = RequiredKeys<{
 *   a?: 0;
 *   b?: 0 | undefined;
 *   c?: undefined;
 *   d: 0;
 *   e: undefined;
 *   f: 0 | undefined;
 * }>; // 'd' | 'e' | 'f'
 * ```
 */
type RequiredKeys<Obj> = Exclude<keyof Obj, OptionalKeys<Obj>>;

type PartiallyOptional<T, K extends keyof T> = MergeIntersection<
  Omit<T, K> & Partial<Pick<T, K>>
>;

type PartiallyRequired<T, K extends keyof T> = MergeIntersection<
  Omit<T, K> & Required<Pick<T, K>>
>;

type Intersection<Types extends readonly unknown[]> =
  TSTypeUtilsInternals.Intersection<Types>;

declare namespace TSTypeUtilsInternals {
  export type Intersection<Types extends readonly unknown[]> = MergeIfRecords<
    IntersectionImpl<Types>
  >;

  type IntersectionImpl<Types extends readonly unknown[]> =
    Types extends readonly []
      ? unknown
      : Types extends readonly [infer Head, ...infer Tail]
        ? Head & IntersectionImpl<Tail>
        : never;

  type MergeIfRecords<R> = [R] extends [UnknownRecord]
    ? MergeIntersection<R>
    : R;
}
