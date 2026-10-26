import { Arr, memoizeFunction, Result } from 'ts-data-forge';
import type { Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  createPrimitiveValidationError,
  prependIndexToValidationErrors,
  type ValidationError,
} from '../utils/index.mjs';

/**
 * Creates a `Type` for a readonly array whose elements are of `elementType`.
 *
 * `onInvalidElement` decides what `fill` does with an element that is not of
 * `elementType`:
 *
 * - `'fill'` (default) — replace it with `elementType.fill(element)`.
 * - `'drop'` — remove it. Use this to repair stored data such as settings,
 *   where an element that no longer makes sense should disappear rather than
 *   turn into a default value unrelated to what was saved.
 *
 * Either way the elements that are kept go through `elementType.fill`, which
 * returns a valid element as it is apart from excess record properties, and a
 * non-array input becomes the default value. An element is judged as a whole
 * by `elementType.is`: a nested array or record with one wrong part is
 * dropped, not repaired.
 *
 * The option is a `fill` mode only. `prune` takes a value that is already of
 * the type, so it never meets an invalid element, and `is` / `validate` are
 * unaffected.
 */
export const array = <A,>(
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: readonly A[];
      onInvalidElement: 'fill' | 'drop';
    }>
  >,
): Type<readonly A[]> => {
  type T = readonly A[];

  const typeName = options?.typeName ?? `${elementType.typeName}[]`;

  const getDefaultValue = memoizeFunction((): T => options?.defaultValue ?? []);

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
        Result.ok(a as T);
  };

  const fill: Type<T>['fill'] = (a) =>
    !Arr.isArray(a)
      ? getDefaultValue()
      : options?.onInvalidElement === 'drop'
        ? a.filter((e) => elementType.is(e)).map((e) => elementType.fill(e))
        : a.map((e) => elementType.fill(e));

  const prune = (a: T): T => a.map((e) => elementType.prune(e));

  return {
    typeName,
    get defaultValue() {
      return getDefaultValue();
    },
    fill,
    prune,
    validate,
    is: createIsFn(validate),
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
    structure: {
      kind: 'array',
      elementType,
      minLength: undefined,
      maxLength: undefined,
    },
  };
};
