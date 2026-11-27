import { Arr, Result } from 'ts-data-forge';
import type { Uint32 } from 'ts-type-forge';
import type { Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  prependIndexToValidationErrors,
  type ValidationError,
} from '../utils/index.mjs';

/**
 * Validates each element of `a` against `elementType`, collecting any element
 * errors with their index prepended. Shared by the length-constrained array
 * validators.
 *
 * @internal Not part of the public package API.
 */
export const validateElements = <A,>(
  a: readonly unknown[],
  elementType: Type<A>,
): Result<readonly A[], readonly ValidationError[]> => {
  const errors: readonly ValidationError[] = Arr.generate(function* () {
    for (const [index, el] of a.entries()) {
      const res = elementType.validate(el);

      if (Result.isErr(res)) {
        yield* prependIndexToValidationErrors(res.value, index);
      }
    }
  });

  return Arr.isNonEmpty(errors)
    ? Result.err(errors)
    : // No errors, so the value is of the validated type.
      // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
      Result.ok(a as readonly A[]);
};

/**
 * What `fill` makes of an array input: a dense array of `elementType` cut to at
 * most `maxLength` elements and padded to at least `minLength`, each one
 * `elementType.fill` of the input's element at that index. Shared by the array
 * validators, which used to carry their own copies of it and drifted apart.
 *
 * The indices are walked rather than the input mapped, because `map` skips the
 * holes of a sparse array and would leave them in the result: a hole is not an
 * `A`, so it is filled like a missing element. The input's own `length` is used
 * as it is, since only a `Proxy` could report one that is not a length.
 *
 * @internal Not part of the public package API.
 */
export const fillElements = <A,>(
  a: readonly unknown[],
  elementType: Type<A>,
  {
    minLength,
    maxLength,
  }: Readonly<{
    minLength: Uint32 | undefined;
    maxLength: Uint32 | undefined;
  }>,
): readonly A[] => {
  const capped =
    maxLength === undefined ? a.length : Math.min(a.length, maxLength);

  const length = minLength === undefined ? capped : Math.max(capped, minLength);

  return Array.from({ length }, (_, i) => elementType.fill(a[i]) satisfies A);
};

/**
 * Assembles a structural `Type<readonly A[]>` from the length-specific pieces
 * (`typeName` / `getDefaultValue` / `validate` / `fill`). Shared internally by
 * the length-constrained array validators (`fixedLengthArray` etc.) and the
 * `nonEmptyArray` validator; their outer signatures narrow the structural
 * result to the branded array type.
 *
 * @internal Not part of the public package API.
 */
export const buildType = <Elm, T extends readonly Elm[] = readonly Elm[]>({
  typeName,
  getDefaultValue,
  validate,
  fill,
  elementType,
  minLength,
  maxLength,
}: Readonly<{
  typeName: string;
  getDefaultValue: () => readonly Elm[];
  validate: (a: unknown) => Result<readonly Elm[], readonly ValidationError[]>;
  fill: (a: unknown) => readonly Elm[];
  elementType: Type<Elm>;
  /** The bounds `validate` enforces, both inclusive, for the structure. */
  minLength: number | undefined;
  maxLength: number | undefined;
}>): Type<T> => {
  const base: Type<readonly Elm[]> = {
    typeName,
    get defaultValue() {
      return getDefaultValue();
    },
    fill,
    prune: (a) => a.map((el) => elementType.prune(el)),
    validate,
    is: createIsFn(validate),
    cast: createCastFn(validate),
    assertIs: createAssertFn(validate),
    structure: { kind: 'array', elementType, minLength, maxLength },
  } as const;

  // The branded output type `T` (e.g. `NonEmptyArray` / `FixedLengthArray`) is
  // a subtype of the structural `readonly Elm[]` the validator actually
  // produces. The brand is guaranteed by the caller's `validate` / `fill` but
  // cannot be proven structurally, so it is asserted here once, on behalf of
  // every length-constrained array validator, instead of at each call site.
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  return base as Type<T>;
};
