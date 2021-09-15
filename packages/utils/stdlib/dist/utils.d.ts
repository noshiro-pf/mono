/* eslint-disable no-lone-blocks */

/* Type Test Utilities */

// https://github.com/microsoft/TypeScript/issues/27024
type TypeEq<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B
  ? 1
  : 2
  ? true
  : false;

type ExpectTrue<T extends true> = T;

type TypeExtends<A, B> = A extends B ? true : false;

/* improved standard type utilities */

type StrictExclude<T, U extends T> = T extends U ? never : T;
type RelaxedExclude<T, U> = T extends U ? never : T;

type StrictOmit<T, K extends keyof T> = Pick<T, StrictExclude<keyof T, K>>;
type RelaxedOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

/* type constants */

type Primitive = bigint | boolean | number | string | symbol | null | undefined;

/* JSONValue */

type JSONValue =
  | JSONValue[]
  | boolean
  | number
  | string
  | {
      [K in string]?: JSONValue;
    }
  | null;

type ReadonlyJSONValue =
  | boolean
  | number
  | string
  | readonly ReadonlyJSONValue[]
  | {
      readonly [K in string]?: ReadonlyJSONValue;
    }
  | null;

type JSONType = Readonly<Record<string, JsonValueType>>;

/* Other Utilities */

type ReducerType<State, Action> = (state: State, action: Action) => State;

type TimerId = ReturnType<typeof setTimeout>; // NodeJS.Timeout or number

type ToString<A> = A extends number ? `${A}` : A;

type ValueOf<T> = T[keyof T];

type UnionToIntersection<T> = (
  T extends unknown ? (arg: T) => void : never
) extends (arg: infer F) => void
  ? F
  : unknown;

type Writable<T> = { -readonly [P in keyof T]: T[P] };

type RecordKeyType = keyof never;

{
  /** @deprecated @internal */
  type TestCases = [
    ExpectTrue<TypeEq<keyof never, keyof any>>,
    ExpectTrue<TypeEq<keyof never, keyof unknown>>,
    ExpectTrue<TypeEq<keyof never, PropertyKey>>
  ];
}

type ReadonlyRecord<K extends RecordKeyType, V> = Readonly<Record<K, V>>;

type ReadonlyRecordBase = ReadonlyRecord<RecordKeyType, unknown>

type FunctionType<A, B> = (value: A) => B;

type MonoTypeFunction<X> = (value: X) => X;

type ReadonlyDate = Readonly<Date>;


/* Array utilities */

type NonEmptyArray<A> = [A, ...A[]];

type ReadonlyNonEmptyArray<A> = readonly [A, ...(readonly A[])];


type Length<T extends { length: number }> = T['length'];

type ArrayElement<S> = S extends readonly (infer T)[] ? T : never;

{
  /** @deprecated @internal */
  type TestCases = [ExpectTrue<TypeEq<Length<readonly [1, 2, 3]>, 3>>];
}

/* ArrayOfLength */

type ArrayOfLength<N extends number, T> = ArrayOfLengthRec<N, T, []>;

type ReadonlyArrayOfLength<N extends number, T> = Readonly<ArrayOfLength<N, T>>;

/** @deprecated @internal */
type ArrayOfLengthRec<Num, Elm, T extends unknown[]> = {
  0: T;
  1: ArrayOfLengthRec<Num, Elm, [Elm, ...T]>;
}[T extends { length: Num } ? 0 : 1];

{
  /** @deprecated @internal */
  type TestCases = [
    TypeEq<[0, 0], ArrayOfLength<2, 0>>,
    TypeEq<[0, 0, 0], ArrayOfLength<3, 0>>,
    TypeEq<[0, 0, 0, 0], ArrayOfLength<4, 0>>,
    TypeEq<[0, 0, 0, 0, 0], ArrayOfLength<5, 0>>,
    TypeEq<readonly [0, 0], ReadonlyArrayOfLength<2, 0>>,
    TypeEq<readonly [0, 0, 0], ReadonlyArrayOfLength<3, 0>>,
    TypeEq<readonly [0, 0, 0, 0], ReadonlyArrayOfLength<4, 0>>,
    TypeEq<readonly [0, 0, 0, 0, 0], ReadonlyArrayOfLength<5, 0>>
  ];
}

/* ArrayAtLeastLen */

// https://qiita.com/uhyo/items/80ce7c00f413c1d1be56

type ArrayAtLeastLen<N extends number, T> = ArrayAtLeastLenRec<N, T, T[], []>;

type ReadonlyArrayAtLeastLen<N extends number, T> = Readonly<
  ArrayAtLeastLen<N, T>
>;

/** @deprecated @internal */
type ArrayAtLeastLenRec<Num, Elm, T extends unknown[], C extends unknown[]> = {
  0: T;
  1: ArrayAtLeastLenRec<Num, Elm, [Elm, ...T], [unknown, ...C]>;
}[C extends { length: Num } ? 0 : 1];

/* Deep Wrapper Types */

// eslint-disable-next-line @typescript-eslint/ban-types
type DeepReadonly<T> = T extends Function | Primitive
  ? T
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends Set<infer V>
  ? ReadonlySet<DeepReadonly<V>>
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends object | readonly unknown[]
  ? {
      readonly [K in keyof T]: DeepReadonly<T[K]>;
    }
  : T;

{
  /** @deprecated @internal */
  type TestCases = [
    ExpectTrue<
      TypeEq<
        DeepReadonly<{ a: { b: { c: number[]; 1: 2 } } }>,
        {
          readonly a: {
            readonly b: {
              readonly c: readonly number[];
              readonly 1: 2;
            };
          };
        }
      >
    >,
    ExpectTrue<
      TypeEq<
        DeepReadonly<{ a: { b: { c: [1, 2, 5] } } }>,
        {
          readonly a: {
            readonly b: {
              readonly c: readonly [1, 2, 5];
            };
          };
        }
      >
    >
  ];
}

// eslint-disable-next-line @typescript-eslint/ban-types
type DeepWritable<T> = T extends Function | Primitive
  ? T
  : T extends Map<infer K, infer V>
  ? Map<DeepWritable<K>, DeepWritable<V>>
  : T extends Set<infer V>
  ? Set<DeepWritable<V>>
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends object | readonly unknown[]
  ? {
      -readonly [K in keyof T]: DeepWritable<T[K]>;
    }
  : T;

{
  /** @deprecated @internal */
  type TestCases = [
    ExpectTrue<
      TypeEq<
        DeepWritable<{
          readonly a: {
            readonly b: {
              readonly c: [1, 2, 3];
              readonly d: (xs: readonly number[]) => number;
              readonly 1: 2;
            };
          };
        }>,
        {
          a: {
            b: {
              c: [1, 2, 3];
              d: (xs: readonly number[]) => number;
              1: 2;
            };
          };
        }
      >
    >,
    ExpectTrue<
      TypeEq<
        DeepWritable<{
          readonly a: { readonly b: { readonly c: readonly [1, 2, 5] } };
        }>,
        {
          a: {
            b: {
              c: [1, 2, 5];
            };
          };
        }
      >
    >
  ];
}

// eslint-disable-next-line @typescript-eslint/ban-types
type DeepPartial<T> = T extends Function | Primitive
  ? T
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<DeepPartial<K>, DeepPartial<V>>
  : T extends Set<infer V>
  ? ReadonlySet<DeepPartial<V>>
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends object | readonly unknown[]
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;

{
  /** @deprecated @internal */
  type TestCases = [
    ExpectTrue<
      TypeEq<
        DeepPartial<{ a: { b: { c: number[]; 1: 2 } } }>,
        {
          a?: {
            b?: {
              c?: (number | undefined)[];
              1?: 2;
            };
          };
        }
      >
    >,
    ExpectTrue<
      TypeEq<
        DeepPartial<{ a: { b: { c: [1, 2, 5] } } }>,
        {
          a?: {
            b?: {
              c?:
                | [(1 | undefined)?, (2 | undefined)?, (5 | undefined)?]
                | undefined;
            };
          };
        }
      >
    >
  ];
}

type MergeIntersection<R extends Record<string, unknown>> = {
  [K in keyof R]: R[K];
};
