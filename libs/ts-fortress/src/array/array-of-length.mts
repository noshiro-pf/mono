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

  const {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    defaultValue = Arr.create(size, elementType.defaultValue) as T,
    typeName = `ArrayOfLength<${size}, ${elementType.typeName}>`,
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
    Arr.isArray(a)
      ? // TODO: remove as
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (Arr.map(Arr.seq(size), (i) => elementType.fill(a[i]) satisfies A) as T)
      : defaultValue;

  return {
    typeName,
    defaultValue,
    fill,
    validate,
    is: createIsFn(validate),
    cast: createCastFn(validate),
    assertIs: createAssertFn(validate),
  };
};
