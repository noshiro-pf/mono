import { Arr, memoizeFunction, Result } from 'ts-data-forge';
import { type NonEmptyArray } from 'ts-type-forge';
import { type Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  createPrimitiveValidationError,
  prependIndexToValidationErrors,
  type ValidationError,
} from '../utils/index.mjs';

export type { NonEmptyArray } from 'ts-type-forge';

export const nonEmptyArray = <A,>(
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: NonEmptyArray<A>;
    }>
  >,
): Type<NonEmptyArray<A>> => {
  type T = NonEmptyArray<A>;

  const typeName =
    options?.typeName ?? `NonEmptyArray<${elementType.typeName}>`;

  const getDefaultValue = memoizeFunction(
    (): T => options?.defaultValue ?? Arr.newArray(1, elementType.defaultValue),
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

    if (Arr.isNonEmpty(errors)) {
      return Result.err(errors);
    }

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return Result.ok(a as unknown as T);
  };

  const fill: Type<T>['fill'] = (a) =>
    Arr.isArray(a) && Arr.isNonEmpty(a)
      ? Arr.map(a, (e) => elementType.fill(e))
      : getDefaultValue();

  const prune = (a: T): T => Arr.map(a, (e) => elementType.prune(e));

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
  };
};
