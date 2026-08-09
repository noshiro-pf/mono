import { Arr, memoizeFunction, Result } from 'ts-data-forge';
import {
  type AnyType,
  type TupleTypeInternals,
  type Type,
  type TypeOf,
} from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  createPrimitiveValidationError,
  prependIndexToValidationErrors,
  type ValidationError,
} from '../utils/index.mjs';

type MapTuple<T extends readonly AnyType[]> = Readonly<{
  [K in keyof T]: TypeOf<T[K]>;
}>;

export const tuple = <const A extends readonly AnyType[]>(
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
    // `types` is bound by `AnyType` (payload `any`), so element accessors are
    // typed `any` inside this generic body; the outer signature keeps it precise.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
      for (const [index, typeDef] of types.entries()) {
        const res = typeDef.validate(a[index]);

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
      : // eslint-disable-next-line total-functions/no-unsafe-type-assertion, @typescript-eslint/no-unsafe-return
        (types.map((t, i) => t.fill(a[i])) as MapTuple<A>);

  const prune = (a: T): T =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    Arr.map(types, (t, i) => t.prune(a[i]));

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
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
    // Retain the element types so that `at(tupleType, index)` can recover the
    // Type at a given position.
    elementTypes: types,
  } satisfies Type<T> & TupleTypeInternals as Type<T>;
};
