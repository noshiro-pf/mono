import { IRecord, isRecord, Result } from '@noshiro/ts-utils';
import type { Type, TypeOf } from '../type';
import {
  createAssertFunction,
  createIsFnFromValidateFn,
  validationErrorMessage,
} from '../utils';

type RecordResultType<
  K extends Type<string>,
  V extends Type<unknown>
> = Readonly<Record<TypeOf<K>, TypeOf<V>>>;

export const keyValueRecord = <K extends Type<string>, V extends Type<unknown>>(
  keyType: K,
  valueType: V,
  options?: Readonly<{ typeName?: string }>
): Type<RecordResultType<K, V>> => {
  type T = RecordResultType<K, V>;

  const { typeName = 'key-value-record' } = options ?? {};

  const defaultValue = {} as T;

  const validate: Type<T>['validate'] = (a) => {
    if (!isRecord(a)) {
      return Result.err([
        validationErrorMessage(a, 'The value is expected to be a record'),
      ]);
    }

    for (const [k, v] of IRecord.entries(a)) {
      {
        const res = keyType.validate(k);

        if (Result.isErr(res)) {
          const message = validationErrorMessage(
            k,
            `The key of the record is expected to be <${keyType.typeName}>`
          );

          return Result.err([message, ...res.value]);
        }
      }
      {
        const res = valueType.validate(v);

        if (Result.isErr(res)) {
          const message = validationErrorMessage(
            v,
            `The value of the record is expected to be <${valueType.typeName}>`
          );

          return Result.err([message, ...res.value]);
        }
      }
    }

    return Result.ok(a as T);
  };

  const fill: Type<T>['fill'] = (a) =>
    isRecord(a)
      ? (IRecord.fromEntries(
          IRecord.entries(a).filter(
            ([k, v]) => keyType.is(k) && valueType.is(v)
          )
        ) as T)
      : defaultValue;

  return {
    typeName,
    defaultValue,
    fill,
    validate,
    is: createIsFnFromValidateFn(validate),
    assertIs: createAssertFunction(validate),
  };
};