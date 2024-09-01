import { isRecord, Result, tp } from '@noshiro/ts-utils';
import { type Type, type TypeOf } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  validationErrorMessage,
} from '../utils/index.mjs';

export const record = <const R extends Record<string, Type<unknown>>>(
  source: R,
  options?: Partial<
    Readonly<{
      typeName: string;
    }>
  >,
): Type<RecordTypeValue<R>> => {
  type T = RecordTypeValue<R>;

  const typeNameFilled: string =
    options?.typeName ??
    `{ ${Object.entries(source)
      .map(([k, v]) => `${k}: ${v.typeName}`)
      .join(', ')} }`;

  const defaultValue: Type<T>['defaultValue'] =
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    Object.fromEntries(
      Object.entries(source).map(([key, value]) => tp(key, value.defaultValue)),
    ) as T;

  const validate: Type<T>['validate'] = (a) => {
    if (!isRecord(a)) {
      return Result.err([
        validationErrorMessage(a, 'The value is expected to be a record'),
      ]);
    }

    for (const [k, valueType] of Object.entries(source)) {
      if (!Object.hasOwn(a, k)) {
        if (source[k]?.optional === true) continue;

        return Result.err([`The record is expected to have the key "${k}".`]);
      }

      const v = a[k];
      const res = valueType.validate(v);

      if (Result.isErr(res)) {
        const message = validationErrorMessage(
          v,
          `The value at record key "${k}" is expected to be <${valueType.typeName}>`,
        );

        return Result.err([message, ...res.value]);
      }
    }

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return Result.ok(a as T);
  };

  const fill: Type<T>['fill'] = (a) =>
    isRecord(a)
      ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (Object.fromEntries(
          Object.entries(source).map(([k, v]) =>
            tp(k, Object.hasOwn(a, k) ? v.fill(a[k]) : v.defaultValue),
          ),
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

type RecordTypeValue<R extends Record<string, Type<unknown>>> =
  IoTsInternal.RecordTypeValueImpl<R>;

namespace IoTsInternal {
  export type RecordTypeValueImpl<R extends Record<string, Type<unknown>>> =
    RecordTypeValueImplSub<R, OptionalTypeKeys<R>>;

  type RecordTypeValueImplSub<
    A extends Record<string, Type<unknown>>,
    OptionalKeys extends keyof A,
  > = Readonly<
    {
      [key in OptionalKeys]?: TypeOf<A[key]>;
    } & {
      [key in Exclude<keyof A, OptionalKeys>]: TypeOf<A[key]>;
    }
  >;

  type OptionalTypeKeys<A extends Record<string, Type<unknown>>> = {
    [K in keyof A]: A[K] extends { optional: true } ? K : never;
  }[keyof A];
}
