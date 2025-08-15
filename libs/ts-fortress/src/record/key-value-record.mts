import { Arr, isRecord, Result } from 'ts-data-forge';
import { type Type, type TypeOf } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  createPrimitiveValidationError,
  prependPathToValidationErrors,
  type ValidationError,
  type ValidationErrorWithMessage,
} from '../utils/index.mjs';

type RecordResultType<
  K extends Type<string>,
  V extends Type<unknown>,
> = ReadonlyRecord<TypeOf<K>, TypeOf<V>>;

export const keyValueRecord = <K extends Type<string>, V extends Type<unknown>>(
  keyType: K,
  valueType: V,
  options?: Readonly<{ typeName?: string }>,
): Type<RecordResultType<K, V>> => {
  type T = RecordResultType<K, V>;

  const typeName = options?.typeName ?? 'key-value-record';

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/consistent-type-assertions
  const defaultValue = {} as T;

  const validate: Type<T>['validate'] = (a) => {
    if (!isRecord(a)) {
      return Result.err([
        createPrimitiveValidationError({
          actualValue: a,
          expectedType: 'record',
          typeName,
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
              message: `The key of the record is expected to be <${keyType.typeName}>`,
              typeName,
            } satisfies ValidationErrorWithMessage;

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
              message: `The value of the record is expected to be <${valueType.typeName}>`,
              typeName,
            } satisfies ValidationErrorWithMessage;

            yield* prependPathToValidationErrors(res.value, k);
          }
        }
      }
    });

    if (errors.length > 0) {
      return Result.err(errors);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return Result.ok(a as T);
  };

  const fill: Type<T>['fill'] = (a) =>
    isRecord(a)
      ? // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        (Object.fromEntries(
          Object.entries(a).filter(
            ([k, v]) => keyType.is(k) && valueType.is(v),
          ),
        ) as T)
      : defaultValue;

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
