import { Arr, Result } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  createPrimitiveValidationError,
  prependIndexToValidationErrors,
  type ValidationError,
} from '../utils/index.mjs';

export const nonEmptyArray = <A,>(
  elementType: Type<A>,
  options?: PartialReadonly<{
    typeName: string;
    defaultValue: NonEmptyArray<A>;
  }>,
): Type<NonEmptyArray<A>> => {
  type T = NonEmptyArray<A>;

  const {
    defaultValue = Arr.newArray(1, elementType.defaultValue),
    typeName = `NonEmptyArray<${elementType.typeName}>`,
  } = options ?? {};

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

    if (Arr.isEmpty(a)) {
      return Result.err([
        {
          path: [],
          actualValue: a,
          expectedType: typeName,
          typeName,
          details: {
            kind: 'non-empty-array',
          },
        } satisfies ValidationError,
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

    if (errors.length > 0) {
      return Result.err(errors);
    }

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return Result.ok(a as unknown as T);
  };

  const fill: Type<T>['fill'] = (a) =>
    Arr.isArray(a) && Arr.isNonEmpty(a)
      ? Arr.map(a, (e) => elementType.fill(e))
      : defaultValue;

  return {
    typeName,
    defaultValue,
    fill,
    validate,
    is: createIsFn(validate),
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};
