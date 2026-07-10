import { isMap } from '@sindresorhus/is';
import {
  Arr,
  memoizeFunction,
  Result,
  tp,
  unknownToString,
} from 'ts-data-forge';
import { type Type, type TypeOf } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  createPrimitiveValidationError,
  prependPathToValidationErrors,
  type ValidationError,
} from '../utils/index.mjs';

type MapResultType<
  K extends Type<unknown>,
  V extends Type<unknown>,
> = ReadonlyMap<TypeOf<K>, TypeOf<V>>;

export const MapType = <K extends Type<unknown>, V extends Type<unknown>>(
  keyType: K,
  valueType: V,
  options?: Partial<
    Readonly<{
      typeName: string;
    }>
  >,
): Type<MapResultType<K, V>> => {
  type M = MapResultType<K, V>;

  const typeName = options?.typeName ?? 'Map';

  const getDefaultValue = memoizeFunction((): M => new Map());

  const validate: Type<M>['validate'] = (a) => {
    if (!isMap(a)) {
      return Result.err([
        createPrimitiveValidationError({
          actualValue: a,
          expectedType: 'Map',
          typeName,
          details: undefined,
        }),
      ]);
    }

    const errors: readonly ValidationError[] = Arr.generate(function* () {
      for (const [k, v] of a) {
        {
          const res = keyType.validate(k);

          if (Result.isErr(res)) {
            yield {
              path: [],
              actualValue: k,
              expectedType: typeName,
              typeName,
              details: {
                kind: 'map-entry',
                entry: 'key',
                expectedType: keyType.typeName,
              },
            } satisfies ValidationError;

            yield* res.value;
          }
        }

        {
          const res = valueType.validate(v);

          if (Result.isErr(res)) {
            yield {
              path: [],
              actualValue: v,
              expectedType: typeName,
              typeName,
              details: {
                kind: 'map-entry',
                entry: 'value',
                expectedType: valueType.typeName,
              },
            } satisfies ValidationError;

            yield* prependPathToValidationErrors(res.value, unknownToString(k));
          }
        }
      }
    });

    if (Arr.isNonEmpty(errors)) {
      return Result.err(errors);
    }

    return Result.ok(a);
  };

  const fill: Type<M>['fill'] = (a) =>
    !isMap(a)
      ? getDefaultValue()
      : new Map(
          Array.from(a).filter(([k, v]) => keyType.is(k) && valueType.is(v)),
        );

  const prune = (a: M): M =>
    new Map(
      Array.from(a, ([k, v]) => tp(keyType.prune(k), valueType.prune(v))),
    );

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
