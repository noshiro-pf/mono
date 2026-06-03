import { Arr, memoizeFunction, Result } from 'ts-data-forge';
import { type ArrayAtMostLen, type SmallUint } from 'ts-type-forge';
import { type Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  createPrimitiveValidationError,
  prependIndexToValidationErrors,
  type ValidationError,
} from '../utils/index.mjs';

export type { ArrayAtMostLen } from 'ts-type-forge';

export const arrayAtMostLength = <A, N extends SmallUint>(
  size: N,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: ArrayAtMostLen<N, A>;
    }>
  >,
): Type<ArrayAtMostLen<N, A>> => {
  type T = ArrayAtMostLen<N, A>;

  const typeName =
    options?.typeName ?? `ArrayAtMostLen<${size}, ${elementType.typeName}>`;

  const getDefaultValue = memoizeFunction(
    (): T =>
      options?.defaultValue ??
      // The empty array is the shortest value satisfying `length <= size`.
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (Arr.create(0, elementType.defaultValue) as T),
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

    if (a.length > size) {
      return Result.err([
        {
          path: [],
          actualValue: a,
          expectedType: typeName,
          typeName,
          details: {
            kind: 'array-max-length',
            maxLength: size,
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

  const fill: Type<T>['fill'] = (a) =>
    Arr.isArray(a)
      ? // Keep the input but trim down to at most `size` elements.
        // TODO: remove as
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (Arr.map(
          Arr.take(a, size),
          (el) => elementType.fill(el) satisfies A,
        ) as T)
      : getDefaultValue();

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
