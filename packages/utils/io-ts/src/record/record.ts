import { hasKey, IRecord, isRecord, Result, tp } from '@noshiro/ts-utils';
import type { Type, TypeOf } from '../type';
import {
  createAssertFunction,
  createIsFnFromValidateFn,
  validationErrorMessage,
} from '../utils';

type RecordResultType<A extends ReadonlyRecord<string, Type<unknown>>> =
  Readonly<{ [key in keyof A]: TypeOf<A[key]> }>;

export const record = <A extends ReadonlyRecord<string, Type<unknown>>>(
  recordType: A,
  typeName?: string
): Type<RecordResultType<A>> => {
  type T = RecordResultType<A>;

  const typeNameFilled: string =
    typeName ??
    `{ ${IRecord.entries(recordType)
      .map(([k, v]) => `${k}: ${v.typeName}`)
      .join(', ')} }`;

  const defaultValue = IRecord.fromEntries(
    IRecord.entries(recordType).map(([key, value]) =>
      tp(key, value.defaultValue)
    )
  ) as T;

  const validate: Type<T>['validate'] = (a) => {
    if (!isRecord(a)) {
      return Result.err([
        validationErrorMessage(a, 'The value is expected to be a record'),
      ]);
    }

    for (const [k, valueType] of IRecord.entries(recordType)) {
      if (!hasKey(a, k)) {
        return Result.err([`The record is expected to have key "${k}".`]);
      }

      const v = a[k];
      const res = valueType.validate(v);

      if (Result.isErr(res)) {
        const message = validationErrorMessage(
          v,
          `The value at record key "${k}" is expected to be <${valueType.typeName}>`
        );

        return Result.err([message, ...res.value]);
      }
    }

    return Result.ok(undefined);
  };

  const fill: Type<T>['fill'] = (a) =>
    isRecord(a)
      ? (IRecord.fromEntries(
          IRecord.entries(recordType).map(([k, v]) =>
            tp(k, hasKey(a, k) ? v.fill(a[k]) : v.defaultValue)
          )
        ) as T)
      : defaultValue;

  return {
    typeName: typeNameFilled,
    defaultValue,
    fill,
    validate,
    is: createIsFnFromValidateFn(validate),
    assertIs: createAssertFunction(validate),
  };
};
