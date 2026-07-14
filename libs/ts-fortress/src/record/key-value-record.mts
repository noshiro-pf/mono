import { Arr, isRecord, Result, tp } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { type AnyType, type Type, type TypeOf } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  createPrimitiveValidationError,
  prependPathToValidationErrors,
  type ValidationError,
} from '../utils/index.mjs';

type RecordResultType<
  K extends Type<string>,
  V extends AnyType,
> = ReadonlyRecord<TypeOf<K>, TypeOf<V>>;

export const keyValueRecord = <K extends Type<string>, V extends AnyType>(
  keyType: K,
  valueType: V,
  options?: Partial<
    Readonly<{
      typeName: string;
    }>
  >,
): Type<RecordResultType<K, V>> => {
  type T = RecordResultType<K, V>;

  const typeName = options?.typeName ?? 'key-value-record';

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const defaultValue = {} as T;

  const validate: Type<T>['validate'] = (a) => {
    if (!isRecord(a)) {
      return Result.err([
        createPrimitiveValidationError({
          actualValue: a,
          expectedType: 'record',
          typeName,
          details: undefined,
        }),
      ]);
    }

    const errors: readonly ValidationError[] = Arr.generate(function* () {
      for (const [k, v] of Object.entries(a)) {
        {
          const res = keyType.validate(k);

          if (Result.isErr(res)) {
            yield {
              path: [],
              actualValue: k,
              expectedType: typeName,
              typeName,
              details: {
                kind: 'record-entry',
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
                kind: 'record-entry',
                entry: 'value',
                expectedType: valueType.typeName,
              },
            } satisfies ValidationError;

            yield* prependPathToValidationErrors(res.value, k);
          }
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
    isRecord(a)
      ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (Object.fromEntries(
          Object.entries(a).filter(
            ([k, v]) => keyType.is(k) && valueType.is(v),
          ),
        ) as T)
      : defaultValue;

  // Keys not matching keyType are excess paths; values are pruned recursively.
  const prune = (a: T): T =>
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    Object.fromEntries(
      Object.entries(a)
        .filter(([k]) => keyType.is(k))
        .map(([k, v]) => tp(k, valueType.prune(v))),
    ) as T;

  return {
    typeName,
    defaultValue,
    fill,
    prune,
    validate,
    is: createIsFn(validate),
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};
