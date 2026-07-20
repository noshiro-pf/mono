import { Arr, asUint32, memoizeFunction, Result } from 'ts-data-forge';
import { type FixedLengthArray, type SupportedLength } from 'ts-type-forge';
import { type Type } from '../type.mjs';
import {
  createPrimitiveValidationError,
  type ValidationError,
} from '../utils/index.mjs';
import { buildType, validateElements } from './build-type.mjs';

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
export function fixedLengthArray<A, N extends SupportedLength>(
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

  const typeName =
    options?.typeName ?? `FixedLengthArray<${size}, ${elementType.typeName}>`;

  const getDefaultValue = memoizeFunction(
    (): T =>
      options?.defaultValue ??
      Arr.create(asUint32(size), elementType.defaultValue),
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

    if (a.length !== size) {
      return Result.err([
        {
          path: [],
          actualValue: a,
          expectedType: typeName,
          typeName,
          details: {
            kind: 'array-length',
            expectedLength: size,
            actualLength: a.length,
          },
        } satisfies ValidationError,
      ]);
    }

    return validateElements(a, elementType);
  };

  const fill: Type<T>['fill'] = (a) =>
    Arr.isArray(a)
      ? Arr.map(
          Arr.seq(asUint32(size)),
          (i) => elementType.fill(a[i]) satisfies A,
        )
      : getDefaultValue();

  return buildType({ typeName, getDefaultValue, validate, fill, elementType });
}
