import { Arr, Result } from 'ts-data-forge';
import { type Type } from '../type.mjs';
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

  if (Arr.isNonEmpty(errors)) {
    return Result.err(errors);
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return Result.ok(a as readonly A[]);
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
}: Readonly<{
  typeName: string;
  getDefaultValue: () => readonly Elm[];
  validate: (a: unknown) => Result<readonly Elm[], readonly ValidationError[]>;
  fill: (a: unknown) => readonly Elm[];
  elementType: Type<Elm>;
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
  } as const;

  // The branded output type `T` (e.g. `NonEmptyArray` / `FixedLengthArray`) is
  // a subtype of the structural `readonly Elm[]` the validator actually
  // produces. The brand is guaranteed by the caller's `validate` / `fill` but
  // cannot be proven structurally, so it is asserted here once, on behalf of
  // every length-constrained array validator, instead of at each call site.
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return base as Type<T>;
};
