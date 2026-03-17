import { type Type } from '../type.mjs';

/**
 * Converts a Type to an optional property type.
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
 * // When using optional fields in mutually recursive types,
 * // use forceUndefinedDefault to avoid infinite loops when accessing defaultValue
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
export const optional = <T extends Type<unknown>>(
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
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ({
    assertIs: t.assertIs,
    is: t.is,
    cast: t.cast,
    fill: t.fill,
    validate: t.validate,
    typeName: t.typeName,

    defaultValue:
      options?.forceUndefinedDefault === true
        ? // For recursive types: set defaultValue to undefined to avoid infinite loops
          undefined
        : // For normal types: preserve the original defaultValue
          t.defaultValue,

    optional: true,
  }) satisfies OptionalPropertyType<Type<unknown>> as OptionalPropertyType<T>;

export type OptionalPropertyType<T extends Type<unknown>> = T &
  Readonly<{ optional: true }>;

export type RequiredPropertyType<T extends Type<unknown>> =
  T extends OptionalPropertyType<T> ? StrictOmit<T, 'optional'> : T;

export const isOptionalProperty = <T extends Type<unknown>>(
  t: T,
): t is OptionalPropertyType<T> => t.optional === true;
