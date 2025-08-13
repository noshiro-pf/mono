import { isRecord, Result } from 'ts-data-forge';
import { type Type, type TypeOf } from '../type.mjs';
import { createAssertFn, createCastFn, createIsFn } from '../utils/index.mjs';
import {
  createPrimitiveValidationError,
  prependPathToValidationErrors,
  type ValidationError,
  type ValidationErrorWithMessage,
} from '../validation-error.mjs';

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

    const errors: readonly ValidationError[] = Object.entries(a).flatMap(
      ([k, v]) => {
        const keyErrors = (() => {
          const res = keyType.validate(k);
          return Result.isErr(res)
            ? [
                {
                  path: [],
                  actualValue: k,
                  expectedType: typeName,
                  message: `The key of the record is expected to be <${keyType.typeName}>`,
                  typeName,
                } satisfies ValidationErrorWithMessage,
                ...res.value,
              ]
            : [];
        })();

        const valueErrors = (() => {
          const res = valueType.validate(v);
          return Result.isErr(res)
            ? [
                {
                  path: [],
                  actualValue: v,
                  expectedType: typeName,
                  message: `The value of the record is expected to be <${valueType.typeName}>`,
                  typeName,
                } satisfies ValidationErrorWithMessage,
                ...prependPathToValidationErrors(res.value, k),
              ]
            : [];
        })();

        return [...keyErrors, ...valueErrors];
      },
    );

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
