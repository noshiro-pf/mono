/* Other Utilities */

/**
 * Converts a type `A` to its string representation if it's a number, otherwise returns `A`.
 * @template A - The type to convert.
 * @example
 * type Str = ToString<123>; // "123"
 * type Bool = ToString<boolean>; // boolean
 */
type ToString<A> = A extends number ? `${A}` : A;

// NOTE: This syntax requires TypeScript 4.8 or later
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-8.html#improved-inference-for-infer-types-in-template-string-types
/**
 * Converts a string literal type representing a number back to a number type.
 * Requires TypeScript 4.8+.
 * @template S - A string literal type that extends `${number}`.
 * @example
 * type Num = ToNumber<"456">; // 456
 */
type ToNumber<S extends `${number}`> = S extends `${infer N extends number}`
  ? N
  : never;

/**
 * Extracts the union of all value types from an object type `T`.
 * @template T - The object type.
 * @example
 * type Values = ValueOf<{ a: string; b: number }>; // string | number
 */
type ValueOf<T> = T[keyof T];

/**
 * Extracts the `length` property type from a type `T` that has a numeric `length` property.
 * Typically used for arrays and tuples.
 * @template T - A type with a `length: number` property (e.g., `readonly unknown[]`).
 * @returns The type of the `length` property (e.g., `number` for arrays, a number literal for tuples).
 * @example
 * type TupleLen = Length<[1, 2, 3]>; // 3
 * type ArrayLen = Length<string[]>; // number
 * type StringLen = Length<"abc">; // 3
 */
type Length<T extends Readonly<{ length: number }>> = T['length'];

/**
 * Represents a function type that takes an argument of type `A` and returns a value of type `B`.
 * Alias for `(arg: A) => B`.
 * @template A - The argument type.
 * @template B - The return type.
 */
type FunctionType<A, B> = (arg: A) => B;

/**
 * Represents a function type that takes an argument of type `A` and returns a value of type `B`.
 * Shorter alias for `(arg: A) => B`.
 * @template A - The argument type.
 * @template B - The return type.
 */
type Fn<A, B> = (arg: A) => B;

/**
 * Represents a function type where the argument and return types are the same (`X`).
 * @template X - The argument and return type.
 */
type MonoTypeFunction<X> = Fn<X, X>;

/**
 * Represents a reducer function type used typically in state management.
 * Takes the current state `S` and an action `A`, and returns the new state `S`.
 * @template S - The state type.
 * @template A - The action type.
 */
type Reducer<S, A> = (state: S, action: A) => S;

/**
 * Converts a union type `T` into an intersection type.
 * @template T - The union type.
 * @example
 * type Inter = UnionToIntersection<{ a: string } | { b: number }>; // { a: string } & { b: number }
 */
type UnionToIntersection<T> = (
  T extends unknown ? (arg: T) => void : never
) extends (arg: infer F) => void
  ? F
  : never;

/**
 * Merges an intersection of object types `R` into a single object type with combined properties.
 * Useful for making intersected types more readable in tooltips.
 * @template R - An intersection of record types.
 * @example
 * type Merged = MergeIntersection<{ a: string } & { b: number }>; // { a: string; b: number }
 */
type MergeIntersection<R extends UnknownRecord> = {
  [K in keyof R]: R[K];
};

/**
 * Excludes falsy values (false, 0, '', null, undefined) from type `A`.
 * Note: Does not exclude `NaN` as it's not representable as a literal type.
 * @template A - The type to filter.
 */
type ExcludeFalsyValue<A> = RelaxedExclude<A, FalsyValue>;

/**
 * Creates an intersection type from a tuple of types `Types`.
 * @template Types - A readonly tuple of types.
 * @example
 * type Inter = Intersection<[string, number, { a: boolean }]>; // string & number & { a: boolean }
 */
type Intersection<Types extends readonly unknown[]> =
  TSTypeForgeInternals.IntersectionImpl<Types>;

declare namespace TSTypeForgeInternals {
  /** @internal */
  export type IntersectionImpl<Types extends readonly unknown[]> =
    MergeIfRecords<IntersectionImplSub<Types>>;

  type IntersectionImplSub<Types extends readonly unknown[]> =
    Types extends readonly []
      ? unknown
      : Types extends readonly [infer Head, ...infer Tail]
        ? Head & IntersectionImplSub<Tail>
        : never;

  type MergeIfRecords<R> = [R] extends [UnknownRecord]
    ? MergeIntersection<R>
    : R;
}
