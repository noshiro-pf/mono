/**
 * Recursively applies the `readonly` modifier to all properties of an object, array, Map, or Set.
 * Primitives and functions are returned as is.
 * @template T - The type to make deeply readonly.
 * @returns A new type with all nested properties marked as readonly.
 * @example
 * type Data = { a: number; b: { c: string[]; d: Map<number, boolean> } };
 * type ReadonlyData = DeepReadonly<Data>;
 * // Result: {
 * //   readonly a: number;
 * //   readonly b: {
 * //     readonly c: readonly string[];
 * //     readonly d: ReadonlyMap<number, boolean>;
 * //   };
 * // }
 */
type DeepReadonly<T> = T extends Primitive
  ? T
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends (...args: readonly any[]) => any
    ? T
    : T extends MutableMap<infer K, infer V>
      ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
      : T extends ReadonlyMap<infer K, infer V>
        ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
        : T extends MutableSet<infer V>
          ? ReadonlySet<DeepReadonly<V>>
          : T extends ReadonlySet<infer V>
            ? ReadonlySet<DeepReadonly<V>>
            : T extends UnknownRecord | readonly unknown[]
              ? {
                  readonly [K in keyof T]: DeepReadonly<T[K]>;
                }
              : T;

/**
 * Recursively removes the `readonly` modifier from all properties of an object, array, Map, or Set.
 * Primitives and functions are returned as is.
 * @template T - The type to make deeply mutable.
 * @returns A new type with all nested `readonly` modifiers removed.
 * @example
 * type ReadonlyData = { readonly a: number; readonly b: { readonly c: readonly string[] } };
 * type MutableData = DeepMutable<ReadonlyData>;
 * // Result: { a: number; b: { c: string[] } }
 */
type DeepMutable<T> = T extends Primitive
  ? T
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends (...args: readonly any[]) => any
    ? T
    : T extends MutableMap<infer K, infer V>
      ? MutableMap<DeepMutable<K>, DeepMutable<V>>
      : T extends ReadonlyMap<infer K, infer V>
        ? MutableMap<DeepMutable<K>, DeepMutable<V>>
        : T extends MutableSet<infer V>
          ? MutableSet<DeepMutable<V>>
          : T extends ReadonlySet<infer V>
            ? MutableSet<DeepMutable<V>>
            : T extends UnknownRecord | readonly unknown[]
              ? {
                  -readonly [K in keyof T]: DeepMutable<T[K]>;
                }
              : T;

/**
 * Recursively applies the `?` optional modifier to all properties of an UnknownRecord or array.
 * Handles Map and Set types by applying `DeepPartial` to their keys/values.
 * Primitives and functions are returned as is.
 * @template T - The type to make deeply partial.
 * @returns A new type with all nested properties marked as optional.
 * @example
 * type Data = { a: number; b: { c: string[]; d: Map<number, boolean> } };
 * type PartialData = DeepPartial<Data>;
 * // Result: {
 * //   a?: number | undefined;
 * //   b?: {
 * //     c?: (string | undefined)[] | undefined;
 * //     d?: ReadonlyMap<number | undefined, boolean | undefined> | undefined;
 * //   } | undefined;
 * // }
 */
type DeepPartial<T> = T extends Primitive
  ? T
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends (...args: readonly any[]) => any
    ? T
    : T extends MutableMap<infer K, infer V>
      ? MutableMap<DeepPartial<K>, DeepPartial<V>>
      : T extends ReadonlyMap<infer K, infer V>
        ? ReadonlyMap<DeepPartial<K>, DeepPartial<V>>
        : T extends MutableSet<infer V>
          ? MutableSet<DeepPartial<V>>
          : T extends ReadonlySet<infer V>
            ? ReadonlySet<DeepPartial<V>>
            : T extends UnknownRecord | readonly unknown[]
              ? {
                  [K in keyof T]?: DeepPartial<T[K]>;
                }
              : T;

/**
 * Recursively removes the `?` optional modifier from all properties of an object or array.
 * Handles Map and Set types by applying `DeepRequired` to their keys/values.
 * Primitives and functions are returned as is.
 * @template T - The type to make deeply required.
 * @returns A new type with all nested properties marked as required.
 * @example
 * type PartialData = { a?: number; b?: { c?: string[] } };
 * type RequiredData = DeepRequired<PartialData>;
 * // Result: { a: number; b: { c: string[] } }
 */
type DeepRequired<T> = T extends Primitive
  ? T
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends (...args: readonly any[]) => any
    ? T
    : T extends MutableMap<infer K, infer V>
      ? MutableMap<DeepRequired<K>, DeepRequired<V>>
      : T extends ReadonlyMap<infer K, infer V>
        ? ReadonlyMap<DeepRequired<K>, DeepRequired<V>>
        : T extends MutableSet<infer V>
          ? MutableSet<DeepRequired<V>>
          : T extends ReadonlySet<infer V>
            ? ReadonlySet<DeepRequired<V>>
            : T extends UnknownRecord | readonly unknown[]
              ? {
                  [K in keyof T]-?: DeepRequired<T[K]>;
                }
              : T;
