import { Arr, asUint32, memoizeFunction, Result } from 'ts-data-forge';
import type { MaxLengthArray, SupportedLength } from 'ts-type-forge';
import type { Type } from '../type.mjs';
import {
  createPrimitiveValidationError,
  type ValidationError,
} from '../utils/index.mjs';
import { buildType, fillElements, validateElements } from './build-type.mjs';

export type { MaxLengthArray } from 'ts-type-forge';

/**
 * Creates a `Type` for a readonly array with at most `maxLength` elements,
 * typed as the branded {@link MaxLengthArray} instead of the union of tuple
 * types produced by `maxLengthTuple`.
 *
 * Because the length constraint lives only in the brand, no union of tuples of
 * the element type is ever constructed, which keeps type-checking cheap even
 * when `A` is a large type.
 */
export function maxLengthArray<N extends SupportedLength, A>(
  maxLength: N,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: MaxLengthArray<N, A>;
    }>
  >,
): Type<MaxLengthArray<N, A>>;

// For bounds outside `SupportedLength` (`0..2048`) the length cannot be encoded in the brand,
// so the result length is left unconstrained (`readonly A[]`).
// A length inside the supported range is also a `number`: nothing at run time
// tells the clauses apart, so the set only refines the return type (#1952).
// @sumi-expect-error functions/no-refinement-overload
export function maxLengthArray<A>(
  maxLength: number,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: readonly A[];
    }>
  >,
): Type<readonly A[]>;

export function maxLengthArray<A>(
  size: number,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: readonly A[];
    }>
  >,
): Type<readonly A[]> {
  type T = readonly A[];

  // Converted once, so that a size that is not a length throws here, at the
  // call that passed it, rather than from some calls of `fill`.
  const maxLength = asUint32(size);

  const typeName =
    options?.typeName ??
    `MaxLengthArray<${maxLength}, ${elementType.typeName}>`;

  const getDefaultValue = memoizeFunction(
    (): T =>
      options?.defaultValue ??
      // The empty array is the shortest value satisfying `length <= maxLength`.
      Arr.create(0, elementType.defaultValue),
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

    if (a.length > maxLength) {
      return Result.err([
        {
          path: [],
          actualValue: a,
          expectedType: typeName,
          typeName,
          details: {
            kind: 'array-max-length',
            maxLength,
            actualLength: a.length,
          },
        } satisfies ValidationError,
      ]);
    }

    return validateElements(a, elementType);
  };

  const fill: Type<T>['fill'] = (a) =>
    Arr.isArray(a)
      ? fillElements(a, elementType, { minLength: undefined, maxLength })
      : getDefaultValue();

  return buildType({
    typeName,
    getDefaultValue,
    validate,
    fill,
    elementType,
    minLength: undefined,
    maxLength,
  });
}
