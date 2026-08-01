import { type Primitive } from '../constants/index.mjs';
import {
  type AnyFn,
  type MutableMap,
  type MutableSet,
} from '../others/index.mjs';

/**
 * Recursively applies the `readonly` modifier to all properties of an object, array, Map, or Set.
 * Primitives and functions are returned as is.
 * Note: passing `any` yields a union of both conditional branches
 * (standard TypeScript behavior for `any` in conditional types).
 * A length-constrained array keeps its constraint and stays an array — see the
 * note on brand-carrying arrays at the bottom of this module.
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
export type DeepReadonly<T> = T extends Primitive
  ? T
  : T extends AnyFn
    ? T
    : T extends MutableMap<infer K, infer V>
      ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
      : T extends ReadonlyMap<infer K, infer V>
        ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
        : T extends MutableSet<infer V>
          ? ReadonlySet<DeepReadonly<V>>
          : T extends ReadonlySet<infer V>
            ? ReadonlySet<DeepReadonly<V>>
            : T extends readonly unknown[]
              ? DeepReadonlyArray<T>
              : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                T extends Record<string, any>
                ? {
                    readonly [K in keyof T]: DeepReadonly<T[K]>;
                  }
                : T;

/**
 * Recursively removes the `readonly` modifier from all properties of an object, array, Map, or Set.
 * Primitives and functions are returned as is.
 * Note: passing `any` yields a union of both conditional branches
 * (standard TypeScript behavior for `any` in conditional types).
 * A length-constrained array keeps its constraint and stays an array — see the
 * note on brand-carrying arrays at the bottom of this module.
 * @template T - The type to make deeply mutable.
 * @returns A new type with all nested `readonly` modifiers removed.
 * @example
 * type ReadonlyData = { readonly a: number; readonly b: { readonly c: readonly string[] } };
 * type MutableData = DeepMutable<ReadonlyData>;
 * // Result: { a: number; b: { c: string[] } }
 */
export type DeepMutable<T> = T extends Primitive
  ? T
  : T extends AnyFn
    ? T
    : T extends MutableMap<infer K, infer V>
      ? MutableMap<DeepMutable<K>, DeepMutable<V>>
      : T extends ReadonlyMap<infer K, infer V>
        ? MutableMap<DeepMutable<K>, DeepMutable<V>>
        : T extends MutableSet<infer V>
          ? MutableSet<DeepMutable<V>>
          : T extends ReadonlySet<infer V>
            ? MutableSet<DeepMutable<V>>
            : T extends readonly unknown[]
              ? DeepMutableArray<T>
              : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                T extends Record<string, any>
                ? {
                    -readonly [K in keyof T]: DeepMutable<T[K]>;
                  }
                : T;

/**
 * Recursively applies the `?` optional modifier to all properties of an UnknownRecord or array.
 * Handles Map and Set types by applying `DeepPartial` to their keys/values.
 * Primitives and functions are returned as is.
 * Note: passing `any` yields a union of both conditional branches
 * (standard TypeScript behavior for `any` in conditional types).
 * A length-constrained array keeps its constraint and stays an array — see the
 * note on brand-carrying arrays at the bottom of this module.
 * @template T - The type to make deeply partial.
 * @returns A new type with all nested properties marked as optional.
 * @example
 * type Data = { a: number; b: { c: string[]; d: Map<number, boolean> } };
 * type PartialData = DeepPartial<Data>;
 * // Result: {
 * //   a?: number;
 * //   b?: {
 * //     c?: (string | undefined)[] | undefined;
 * //     d?: ReadonlyMap<number | undefined, boolean | undefined> | undefined;
 * //   } | undefined;
 * // }
 */
export type DeepPartial<T> = T extends Primitive
  ? T
  : T extends AnyFn
    ? T
    : T extends MutableMap<infer K, infer V>
      ? MutableMap<DeepPartial<K>, DeepPartial<V>>
      : T extends ReadonlyMap<infer K, infer V>
        ? ReadonlyMap<DeepPartial<K>, DeepPartial<V>>
        : T extends MutableSet<infer V>
          ? MutableSet<DeepPartial<V>>
          : T extends ReadonlySet<infer V>
            ? ReadonlySet<DeepPartial<V>>
            : T extends readonly unknown[]
              ? DeepPartialArray<T>
              : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                T extends Record<string, any>
                ? {
                    [K in keyof T]?: DeepPartial<T[K]>;
                  }
                : T;

/**
 * Recursively removes the `?` optional modifier from all properties of an object or array.
 * Handles Map and Set types by applying `DeepRequired` to their keys/values.
 * Primitives and functions are returned as is.
 * Note: passing `any` yields a union of both conditional branches
 * (standard TypeScript behavior for `any` in conditional types).
 * A length-constrained array keeps its constraint and stays an array — see the
 * note on brand-carrying arrays at the bottom of this module.
 * @template T - The type to make deeply required.
 * @returns A new type with all nested properties marked as required.
 * @example
 * type PartialData = { a?: number; b?: { c?: string[] } };
 * type RequiredData = DeepRequired<PartialData>;
 * // Result: { a: number; b: { c: string[] } }
 */
export type DeepRequired<T> = T extends Primitive
  ? T
  : T extends AnyFn
    ? T
    : T extends MutableMap<infer K, infer V>
      ? MutableMap<DeepRequired<K>, DeepRequired<V>>
      : T extends ReadonlyMap<infer K, infer V>
        ? ReadonlyMap<DeepRequired<K>, DeepRequired<V>>
        : T extends MutableSet<infer V>
          ? MutableSet<DeepRequired<V>>
          : T extends ReadonlySet<infer V>
            ? ReadonlySet<DeepRequired<V>>
            : T extends readonly unknown[]
              ? DeepRequiredArray<T>
              : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                T extends Record<string, any>
                ? {
                    [K in keyof T]-?: DeepRequired<T[K]>;
                  }
                : T;

/*
 * Brand-carrying arrays.
 *
 * A length-constrained array — anything from the `MinLengthArray` /
 * `MaxLengthArray` / `BoundedLengthArray` / `FixedLengthArray` family — is an
 * *intersection* of a tuple and a brand object, and TypeScript does not treat
 * such an intersection as an array type. Mapping over `keyof T` therefore maps
 * `length`, every `Array.prototype` method and the brand keys as ordinary
 * properties, and the result is a large non-array object rather than an array:
 *
 *   DeepReadonly<MinLengthArray<3, { a: number[] }>>
 *   // was: { readonly length: number; readonly map: <U>(...) => U[]; ... }
 *
 * The mapped type is exactly right for a plain array or tuple, where it keeps
 * element positions distinct, so each helper below applies it unchanged in that
 * case and only diverges once extra keys are present. In that case it rebuilds
 * an array of the transformed element type and intersects the extra keys back
 * on, which keeps both the array-ness and the brand.
 *
 * The rebuild deliberately does *not* go through `ChangeArrayElement`, which
 * would additionally restore the structural minimum-length prefix. Recovering
 * the bounds is linear in the bound, and paying that for every array reached by
 * an already deeply recursive transform pushes realistic inputs over the
 * instantiation-depth limit — `DeepReadonly<ExecOptions>` in this module's own
 * tests is enough to trigger TS2589. So the brand is carried over but the
 * prefix is not: `MinLengthOf` and `HasLengthConstraint` still report the
 * constraint, while indexed access needs a guard again. Reach for
 * `ChangeArrayElement` directly when a single array needs the exact shape back.
 *
 * The keys are collected by subtracting both array key sets, not just the
 * readonly one: a mutable array carries `push` / `pop` / `splice` and the rest
 * of the mutating methods, which `keyof (readonly unknown[])` does not mention,
 * so subtracting only that set reports every mutable array as brand-carrying.
 * This path therefore also catches an array intersected with a hand-written
 * object type, which fails in exactly the same way, and leaves a plain mutable
 * array alone.
 *
 * `DeepMutable` is the one that cannot fully deliver on its name here: the
 * family's structural part is a readonly tuple, so a mutable array carrying a
 * length-constraint brand is not expressible with these types at all. It deep-
 * mutates the element type and leaves the array itself readonly and branded,
 * which is the closest thing to the request that stays within the family.
 */

/** @internal The array branch of {@link DeepReadonly}. */
type DeepReadonlyArray<T extends readonly unknown[]> = [
  ExtraKeysOf<T>,
] extends [never]
  ? {
      readonly [K in keyof T]: DeepReadonly<T[K]>;
    }
  : readonly DeepReadonly<T[number]>[] & Pick<T, ExtraKeysOf<T>>;

/** @internal The array branch of {@link DeepMutable}. */
type DeepMutableArray<T extends readonly unknown[]> = [ExtraKeysOf<T>] extends [
  never,
]
  ? {
      -readonly [K in keyof T]: DeepMutable<T[K]>;
    }
  : readonly DeepMutable<T[number]>[] & Pick<T, ExtraKeysOf<T>>;

/** @internal The array branch of {@link DeepPartial}. */
type DeepPartialArray<T extends readonly unknown[]> = [ExtraKeysOf<T>] extends [
  never,
]
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : readonly DeepPartial<T[number]>[] & Pick<T, ExtraKeysOf<T>>;

/** @internal The array branch of {@link DeepRequired}. */
type DeepRequiredArray<T extends readonly unknown[]> = [
  ExtraKeysOf<T>,
] extends [never]
  ? {
      [K in keyof T]-?: DeepRequired<T[K]>;
    }
  : readonly DeepRequired<T[number]>[] & Pick<T, ExtraKeysOf<T>>;

/**
 * @internal The members of `T` that are neither array members nor tuple
 * indices — for the length-constraint family, exactly its brand.
 */
type ExtraKeysOf<T extends readonly unknown[]> = Exclude<
  keyof T,
  keyof unknown[] | keyof (readonly unknown[]) | `${number}`
>;
