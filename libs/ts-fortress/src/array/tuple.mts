import { Arr, memoizeFunction, Result } from 'ts-data-forge';
import { type Type, type TypeOf } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  createPrimitiveValidationError,
  prependIndexToValidationErrors,
  type ValidationError,
} from '../utils/index.mjs';

type MapTuple<T extends readonly Type<unknown>[]> = Readonly<{
  [K in keyof T]: TypeOf<T[K]>;
}>;

export const tuple = <const A extends readonly Type<unknown>[]>(
  types: A,
  options?: Partial<
    Readonly<{
      typeName: string;
    }>
  >,
): Type<MapTuple<A>> => {
  type T = MapTuple<A>;

  const typeName = options?.typeName ?? 'tuple';

  const getDefaultValue = memoizeFunction(
    (): MapTuple<A> => Arr.map(types, (t) => t.defaultValue),
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

    if (a.length !== types.length) {
      return Result.err([
        {
          path: [],
          actualValue: a,
          expectedType: typeName,
          typeName,
          details: {
            kind: 'tuple-length',
            expectedLength: types.length,
            actualLength: a.length,
          },
        } satisfies ValidationError,
      ]);
    }

    const errors: readonly ValidationError[] = Arr.generate(function* () {
      for (const [index, [typeDef, el]] of Arr.zip(types, a).entries()) {
        const res = typeDef.validate(el);

        if (Result.isErr(res)) {
          yield* prependIndexToValidationErrors(res.value, index);
        }
      }
    });

    if (Arr.isNonEmpty(errors)) {
      return Result.err(errors);
    }

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return Result.ok(a as T);
  };

  const fill: Type<T>['fill'] = (a) =>
    !Arr.isArray(a)
      ? getDefaultValue()
      : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (types.map((t, i) => t.fill(a[i])) as MapTuple<A>);

  return {
    typeName,
    get defaultValue() {
      return getDefaultValue();
    },
    fill,
    validate,
    is: createIsFn(validate),
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};
