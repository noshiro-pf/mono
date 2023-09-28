import { isRecord, Result, tp } from '@noshiro/ts-utils';
import { type Type, type TypeOf } from '../type';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  validationErrorMessage,
} from '../utils';

type RecordResultType<A extends Record<string, Type<unknown>>> = Readonly<{
  [key in keyof A]: TypeOf<A[key]>;
}>;

export const record = <A extends Record<string, Type<unknown>>>(
  recordType: A,
  typeName?: string
): Type<RecordResultType<A>> => {
  type T = RecordResultType<A>;

  const typeNameFilled: string =
    typeName ??
    `{ ${Object.entries(recordType)
      .map(([k, v]) => `${k}: ${v.typeName}`)
      .join(', ')} }`;

  // eslint-disable-next-line no-restricted-syntax
  const defaultValue = Object.fromEntries(
    Object.entries(recordType).map(([key, value]) =>
      tp(key, value.defaultValue)
    )
  ) as T;

  const validate: Type<T>['validate'] = (a) => {
    if (!isRecord(a)) {
      return Result.err([
        validationErrorMessage(a, 'The value is expected to be a record'),
      ]);
    }

    for (const [k, valueType] of Object.entries(recordType)) {
      if (!Object.hasOwn(a, k)) {
        return Result.err([`The record is expected to have the key "${k}".`]);
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

    // eslint-disable-next-line no-restricted-syntax
    return Result.ok(a as T);
  };

  const fill: Type<T>['fill'] = (a) =>
    isRecord(a)
      ? // eslint-disable-next-line no-restricted-syntax
        (Object.fromEntries(
          Object.entries(recordType).map(([k, v]) =>
            tp(k, Object.hasOwn(a, k) ? v.fill(a[k]) : v.defaultValue)
          )
        ) as T)
      : defaultValue;

  return {
    typeName: typeNameFilled,
    defaultValue,
    fill,
    validate,
    is: createIsFn(validate),
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};
