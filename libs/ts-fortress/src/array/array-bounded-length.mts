import { Arr, memoizeFunction, Result } from 'ts-data-forge';
import { type ArrayBoundedLen, type SmallUint } from 'ts-type-forge';
import { type Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  createPrimitiveValidationError,
  prependIndexToValidationErrors,
  type ValidationError,
} from '../utils/index.mjs';

export type { ArrayBoundedLen } from 'ts-type-forge';

export const arrayBoundedLength = <
  A,
  Min extends SmallUint,
  Max extends SmallUint,
>(
  min: Min,
  max: Max,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: ArrayBoundedLen<Min, Max, A>;
    }>
  >,
): Type<ArrayBoundedLen<Min, Max, A>> => {
  type T = ArrayBoundedLen<Min, Max, A>;

  const typeName =
    options?.typeName ??
    `ArrayBoundedLen<${min}, ${max}, ${elementType.typeName}>`;

  const getDefaultValue = memoizeFunction(
    (): T =>
      options?.defaultValue ??
      // An array of the minimum length is the shortest value within the range.
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (Arr.create(min, elementType.defaultValue) as T),
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

  const fill: Type<T>['fill'] = (a) => {
    if (!Arr.isArray(a)) {
      return getDefaultValue();
    }

    // Trim down to at most `max`, then pad up to at least `min`.
    const capped = Arr.take(a, max);

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return (
      capped.length >= min
        ? Arr.map(capped, (el) => elementType.fill(el) satisfies A)
        : Arr.map(Arr.seq(min), (i) => elementType.fill(capped[i]) satisfies A)
    ) as T;
  };

  return {
    typeName,
    get defaultValue() {
      return getDefaultValue();
    },
    fill,
    validate,
    is: createIsFn(validate),
    cast: createCastFn(validate),
    assertIs: createAssertFn(validate),
  };
};
