import type { StrictOmit } from 'ts-type-forge';
import { copyTypeByDescriptors, type UnknownType } from '../type.mjs';

/**
 * Converts a Type to an optional property type.
 *
 * The result keeps every property of `t` — a record's `shape`, a constrained
 * type's `constraints` — and adds `optional: true`.
 *
 * @template T - The Type to make optional
 * @param t - The Type to make optional
 * @param options - Optional configuration
 * @param options.forceUndefinedDefault - If true, forces defaultValue to be undefined.
 *                                        Use this for recursive types to avoid infinite loops.
 *
 * @returns An OptionalPropertyType that can be used in record definitions
 *
 * @example
 * ```ts
 * import * as t from 'ts-fortress';
 *
 * type EvenNumber = Readonly<{ type: 'even'; next?: OddNumber }>;
 *
 * type OddNumber = Readonly<{ type: 'odd'; next?: EvenNumber }>;
 *
 * // When using optional fields in mutually recursive types, use
 * // forceUndefinedDefault to avoid infinite loops when accessing defaultValue
 * const EvenNumber: t.Type<EvenNumber> = t.recursion('EvenNumber', () =>
 *   t.record({
 *     type: t.literal('even'),
 *     next: t.optional(OddNumber, { forceUndefinedDefault: true }),
 *   }),
 * );
 *
 * const OddNumber: t.Type<OddNumber> = t.recursion('OddNumber', () =>
 *   t.record({
 *     type: t.literal('odd'),
 *     next: t.optional(EvenNumber, { forceUndefinedDefault: true }),
 *   }),
 * );
 * ```
 */
export const optional = <T extends UnknownType>(
  t: T,
  options?: Partial<
    Readonly<{
      /**
       * If true, forces defaultValue to be undefined.
       * Use this for recursive types to avoid infinite loops.
       * @default false
       */
      forceUndefinedDefault: boolean;
    }>
  >,
): OptionalPropertyType<T> =>
  // `OptionalPropertyType<T>` is `T & { optional: true }`, so every property of
  // `t` is carried over — a record's `shape`, a constrained type's
  // `constraints`, and whatever else a wrapper attached. Property descriptors
  // rather than a spread: a spread would call the lazy `defaultValue` getter of
  // a record, union or recursion here, which for a recursive type still being
  // defined never terminates.
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  copyTypeByDescriptors(t, {
    ...(options?.forceUndefinedDefault === true
      ? // For recursive types: set defaultValue to undefined to avoid infinite loops
        { defaultValue: { value: undefined, enumerable: true } }
      : {}),
    optional: { value: true, enumerable: true },
  }) as OptionalPropertyType<T>;

export type OptionalPropertyType<T extends UnknownType> = ((T) & Readonly<({ optional: true })>);

export type RequiredPropertyType<T extends UnknownType> =
  T extends OptionalPropertyType<T> ? StrictOmit<T, 'optional'> : T;

export const isOptionalProperty = <T extends UnknownType>(
  t: T,
): t is OptionalPropertyType<T> => t.optional === true;
