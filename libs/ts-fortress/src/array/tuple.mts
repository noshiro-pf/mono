import { Arr, Result } from 'ts-data-forge';
import { type Type, type TypeOf } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  createPrimitiveValidationError,
  prependIndexToValidationErrors,
  type ValidationError,
  type ValidationErrorWithMessage,
} from '../utils/index.mjs';

type MapTuple<T extends readonly Type<unknown>[]> = {
  readonly [K in keyof T]: TypeOf<T[K]>;
};

export const tuple = <const A extends readonly Type<unknown>[]>(
  types: A,
  options?: Partial<Readonly<{ typeName?: string }>>,
): Type<MapTuple<A>> => {
  type T = MapTuple<A>;

  const { typeName = 'tuple' } = options ?? {};

  const defaultValue = Arr.map(
    types,
    (t) => t.defaultValue,
  ) satisfies MapTuple<A>;

  const validate: Type<T>['validate'] = (a) => {
    if (!Arr.isArray(a)) {
      return Result.err([
        createPrimitiveValidationError({
          actualValue: a,
          expectedType: 'array',
          typeName,
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
          message: `The length of tuple is expected to be ${types.length}, but it is actually ${a.length}`,
        } satisfies ValidationErrorWithMessage,
      ]);
    }

    const errors: readonly ValidationError[] = Arr.zip(types, a).flatMap(
      ([typeDef, el], index) => {
        const res = typeDef.validate(el);
        return Result.isErr(res)
          ? prependIndexToValidationErrors(res.value, index)
          : [];
      },
    );

    if (errors.length > 0) {
      return Result.err(errors);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return Result.ok(a as T);
  };

  const fill: Type<T>['fill'] = (a) =>
    !Arr.isArray(a)
      ? defaultValue
      : // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        (types.map((t, i) => t.fill(a[i])) as MapTuple<A>);

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
