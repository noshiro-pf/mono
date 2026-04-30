import { Arr, memoizeFunction, Result } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  createPrimitiveValidationError,
  prependIndexToValidationErrors,
  type ValidationError,
} from '../utils/index.mjs';

export const arrayOfLength = <A, N extends SmallUint>(
  size: N,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: ArrayOfLength<N, A>;
    }>
  >,
): Type<ArrayOfLength<N, A>> => {
  type T = ArrayOfLength<N, A>;

  const typeName =
    options?.typeName ?? `ArrayOfLength<${size}, ${elementType.typeName}>`;

  const getDefaultValue = memoizeFunction(
    (): T =>
      options?.defaultValue ??
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (Arr.create(size, elementType.defaultValue) as T),
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

    if (!Arr.isArrayOfLength(a, size)) {
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

    return Result.ok(a);
  };

  const fill: Type<T>['fill'] = (a) =>
    !Arr.isArray(a)
      ? getDefaultValue()
      : // TODO: remove as
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (Arr.map(
          Arr.seq(size),
          (i) => elementType.fill(a[i]) satisfies A,
        ) as T);

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
