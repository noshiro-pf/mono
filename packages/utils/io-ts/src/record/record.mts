import { ISet, isRecord, Result, tp } from '@noshiro/ts-utils';
import { type Type, type TypeOf } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  validationErrorMessage,
} from '../utils/index.mjs';

export const record = <
  const A extends Record<string, Type<unknown>>,
  const OptionalKeyList extends readonly (keyof A)[] = [],
>(
  recordType: A,
  options?: Partial<
    Readonly<{
      typeName: string;
      optionalKeys: OptionalKeyList;
    }>
  >,
): Type<RecordResultType<A, OptionalKeyList>> => {
  type T = RecordResultType<A, OptionalKeyList>;

  const typeNameFilled: string =
    options?.typeName ??
    `{ ${Object.entries(recordType)
      .map(([k, v]) => `${k}: ${v.typeName}`)
      .join(', ')} }`;

  const defaultValue =
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    Object.fromEntries(
      Object.entries(recordType).map(([key, value]) =>
        tp(key, value.defaultValue),
      ),
    ) as T;

  const optionalKeys = ISet.new(options?.optionalKeys ?? []);

  const validate: Type<T>['validate'] = (a) => {
    if (!isRecord(a)) {
      return Result.err([
        validationErrorMessage(a, 'The value is expected to be a record'),
      ]);
    }

    for (const [k, valueType] of Object.entries(recordType)) {
      if (!Object.hasOwn(a, k)) {
        if (optionalKeys.has(k) || recordType[k]?.optional === true) continue;

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
          Object.entries(recordType).map(([k, v]) =>
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

type RecordResultType<
  A extends Record<string, Type<unknown>>,
  OptionalKeyList extends readonly (keyof A)[],
> = RecordResultTypeImpl<
  A,
  ArrayElement<OptionalKeyList> | OptionalTypeKeys<A>
>;

type RecordResultTypeImpl<
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
