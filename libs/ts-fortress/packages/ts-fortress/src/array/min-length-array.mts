import { Arr, asUint32, memoizeFunction, Result } from 'ts-data-forge';
import { type MinLengthArray, type SupportedLength } from 'ts-type-forge';
import { type Type } from '../type.mjs';
import {
  createPrimitiveValidationError,
  type ValidationError,
} from '../utils/index.mjs';
import { buildType, validateElements } from './build-type.mjs';

export type { MinLengthArray } from 'ts-type-forge';

/**
 * Creates a `Type` for a readonly array with at least `minLength` elements,
 * typed as the branded {@link MinLengthArray} instead of the structural
 * `readonly [A, ..., A, ...A[]]` type produced by `minLengthTuple`.
 *
 * Because the length constraint lives only in the brand, the element type is
 * never expanded into tuple positions, which keeps type-checking cheap even
 * when `A` is a large type.
 */
export function minLengthArray<N extends SupportedLength, A>(
  minLength: N,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: MinLengthArray<N, A>;
    }>
  >,
): Type<MinLengthArray<N, A>>;

// For bounds outside `SupportedLength` (`0..2048`) the length cannot be encoded in the brand,
// so the result length is left unconstrained (`readonly A[]`).
export function minLengthArray<A>(
  minLength: number,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: readonly A[];
    }>
  >,
): Type<readonly A[]>;

export function minLengthArray<A>(
  minLength: number,
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
    `MinLengthArray<${minLength}, ${elementType.typeName}>`;

  const getDefaultValue = memoizeFunction(
    (): T =>
      options?.defaultValue ??
      // An array of `minLength` elements is the shortest value satisfying the bound.
      Arr.create(asUint32(minLength), elementType.defaultValue),
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

    if (a.length < minLength) {
      return Result.err([
        {
          path: [],
          actualValue: a,
          expectedType: typeName,
          typeName,
          details: {
            kind: 'array-min-length',
            minLength,
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

    // Keep the input if it is long enough; otherwise pad up to `minLength`.
    return a.length >= minLength
      ? Arr.map(a, (el) => elementType.fill(el) satisfies A)
      : Arr.map(
          Arr.seq(asUint32(minLength)),
          (i) => elementType.fill(a[i]) satisfies A,
        );
  };

  return buildType({ typeName, getDefaultValue, validate, fill, elementType });
}
