import { Arr, asUint32, memoizeFunction, Result } from 'ts-data-forge';
import type { FixedLengthArray, SupportedLength } from 'ts-type-forge';
import type { Type } from '../type.mjs';
import {
  createPrimitiveValidationError,
  type ValidationError,
} from '../utils/index.mjs';
import { buildType, fillElements, validateElements } from './build-type.mjs';

export type { FixedLengthArray } from 'ts-type-forge';

/**
 * Creates a `Type` for a readonly array with exactly `size` elements, typed as
 * the branded {@link FixedLengthArray} instead of the structural tuple type
 * produced by `fixedLengthTuple`.
 *
 * Because the length constraint lives only in the brand, the element type is
 * never expanded into tuple positions, which keeps type-checking cheap even
 * when `A` is a large type. Prefer this over `fixedLengthTuple` when `A` is
 * large; prefer `fixedLengthTuple` when positional element types or a literal
 * `length` are needed.
 */
export function fixedLengthArray<N extends SupportedLength, A>(
  size: N,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: FixedLengthArray<N, A>;
    }>
  >,
): Type<FixedLengthArray<N, A>>;

// For sizes outside `SupportedLength` (`0..2048`) the length cannot be encoded in the brand,
// so the result length is left unconstrained (`readonly A[]`).
// A length inside the supported range is also a `number`: nothing at run time
// tells the clauses apart, so the set only refines the return type (#1952).
// @sumi-expect-error functions/no-refinement-overload
export function fixedLengthArray<A>(
  size: number,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: readonly A[];
    }>
  >,
): Type<readonly A[]>;

export function fixedLengthArray<A>(
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
  const length = asUint32(size);

  const typeName =
    options?.typeName ?? `FixedLengthArray<${size}, ${elementType.typeName}>`;

  const getDefaultValue = memoizeFunction(
    (): T =>
      options?.defaultValue ?? Arr.create(length, elementType.defaultValue),
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

    if (a.length !== length) {
      return Result.err([
        {
          path: [],
          actualValue: a,
          expectedType: typeName,
          typeName,
          details: {
            kind: 'array-length',
            expectedLength: length,
            actualLength: a.length,
          },
        } satisfies ValidationError,
      ]);
    }

    return validateElements(a, elementType);
  };

  const fill: Type<T>['fill'] = (a) =>
    Arr.isArray(a)
      ? fillElements(a, elementType, { minLength: length, maxLength: length })
      : getDefaultValue();

  return buildType({
    typeName,
    getDefaultValue,
    validate,
    fill,
    elementType,
    minLength: length,
    maxLength: length,
  });
}
