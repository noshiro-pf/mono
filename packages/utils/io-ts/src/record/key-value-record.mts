import { isRecord, Result } from '@noshiro/ts-utils';
import { type Type, type TypeOf } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  validationErrorMessage,
} from '../utils/index.mjs';

type RecordResultType<K extends Type<string>, V extends Type<unknown>> = Record<
  TypeOf<K>,
  TypeOf<V>
>;

export const keyValueRecord = <K extends Type<string>, V extends Type<unknown>>(
  keyType: K,
  valueType: V,
  options?: Readonly<{ typeName?: string }>,
): Type<RecordResultType<K, V>> => {
  type T = RecordResultType<K, V>;

  const { typeName = 'key-value-record' } = options ?? {};

  // eslint-disable-next-line no-restricted-syntax
  const defaultValue = {} as T;

  const validate: Type<T>['validate'] = (a) => {
    if (!isRecord(a)) {
      return Result.err([
        validationErrorMessage(a, 'The value is expected to be a record'),
      ]);
    }

    for (const [k, v] of Object.entries(a)) {
      {
        const res = keyType.validate(k);

        if (Result.isErr(res)) {
          const message = validationErrorMessage(
            k,
            `The key of the record is expected to be <${keyType.typeName}>`,
          );

          return Result.err([message, ...res.value]);
        }
      }
      {
        const res = valueType.validate(v);

        if (Result.isErr(res)) {
          const message = validationErrorMessage(
            v,
            `The value of the record is expected to be <${valueType.typeName}>`,
          );

          return Result.err([message, ...res.value]);
        }
      }
    }

    // eslint-disable-next-line no-restricted-syntax
    return Result.ok(a as T);
  };

  const fill: Type<T>['fill'] = (a) =>
    isRecord(a)
      ? // eslint-disable-next-line no-restricted-syntax
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
