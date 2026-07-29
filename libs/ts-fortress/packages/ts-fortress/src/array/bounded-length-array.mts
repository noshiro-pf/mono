import { Arr, asUint32, memoizeFunction, Result } from 'ts-data-forge';
import {
  type BoundedLengthArray,
  type MaxLengthArray,
  type MinLengthArray,
  type SupportedLength,
} from 'ts-type-forge';
import { type Type } from '../type.mjs';
import {
  createPrimitiveValidationError,
  type ValidationError,
} from '../utils/index.mjs';
import { buildType, validateElements } from './build-type.mjs';

export type { BoundedLengthArray } from 'ts-type-forge';

/**
 * Creates a `Type` for a readonly array whose length is within the inclusive
 * range `[min, max]`, typed as the branded {@link BoundedLengthArray} instead
 * of the union of tuple types produced by `boundedLengthTuple`.
 *
 * Because the length constraint lives only in the brand, no union of tuples
 * of the element type is ever constructed, which keeps type-checking cheap
 * even when `A` is a large type.
 */
export function boundedLengthArray<
  A,
  Min extends SupportedLength,
  Max extends SupportedLength,
>(
  min: Min,
  max: Max,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: BoundedLengthArray<Min, Max, A>;
    }>
  >,
): Type<BoundedLengthArray<Min, Max, A>>;

// Only the lower bound is in `SupportedLength`, so the upper bound is dropped from
// the result type and only the "at least `min`" guarantee is kept.
export function boundedLengthArray<A, Min extends SupportedLength>(
  min: Min,
  max: number,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: MinLengthArray<Min, A>;
    }>
  >,
): Type<MinLengthArray<Min, A>>;

// Only the upper bound is in `SupportedLength`, so the lower bound is dropped from
// the result type and only the "at most `max`" guarantee is kept.
export function boundedLengthArray<A, Max extends SupportedLength>(
  min: number,
  max: Max,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: MaxLengthArray<Max, A>;
    }>
  >,
): Type<MaxLengthArray<Max, A>>;

// Neither bound is in `SupportedLength`, so the result length is left unconstrained.
export function boundedLengthArray<A>(
  min: number,
  max: number,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: readonly A[];
    }>
  >,
): Type<readonly A[]>;

export function boundedLengthArray<A>(
  min: number,
  max: number,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: readonly A[];
    }>
  >,
): Type<readonly A[]> {
  type T = readonly A[];

  const typeName =
    options?.typeName ??
    `BoundedLengthArray<${min}, ${max}, ${elementType.typeName}>`;

  const getDefaultValue = memoizeFunction(
    (): T =>
      options?.defaultValue ??
      // An array of the minimum length is the shortest value within the range.
      Arr.create(asUint32(min), elementType.defaultValue),
  );

  const validate: Type<T>['validate'] = (a) => {
    if (!Arr.isArray(a)) {
      return Result.err([
        createPrimitiveValidationError({
          actualValue: a,
          expectedType: 'array',
          typeName,
          details: undefined,
        }),
      ]);
    }

    if (a.length < min || max < a.length) {
      return Result.err([
        {
          path: [],
          actualValue: a,
          expectedType: typeName,
          typeName,
          details: {
            kind: 'array-range-length',
            minLength: min,
            maxLength: max,
            actualLength: a.length,
          },
        } satisfies ValidationError,
      ]);
    }

    return validateElements(a, elementType);
  };

  const fill: Type<T>['fill'] = (a) => {
    if (!Arr.isArray(a)) {
      return getDefaultValue();
    }

    // Trim down to at most `max`, then pad up to at least `min`.
    const capped = Arr.take(a, asUint32(max));

    return capped.length >= min
      ? Arr.map(capped, (el) => elementType.fill(el) satisfies A)
      : Arr.map(
          Arr.seq(asUint32(min)),
          (i) => elementType.fill(capped[i]) satisfies A,
        );
  };

  return buildType({ typeName, getDefaultValue, validate, fill, elementType });
}
