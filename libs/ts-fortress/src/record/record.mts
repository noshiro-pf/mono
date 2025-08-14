import { isRecord, Result, tp } from 'ts-data-forge';
import { type Type, type TypeOf } from '../type.mjs';
import { createAssertFn, createCastFn, createIsFn } from '../utils/index.mjs';
import {
  createPrimitiveValidationError,
  prependPathToValidationErrors,
  type ValidationError,
  type ValidationErrorWithMessage,
} from '../validation-error.mjs';

export const record = <const R extends ReadonlyRecord<string, Type<unknown>>>(
  source: R,
  options?: Partial<
    Readonly<{
      typeName: string;

      /** @default true */
      allowExcessProperties: boolean;
    }>
  >,
): Type<RecordTypeValue<R>> => {
  type T = RecordTypeValue<R>;

  const sourceKeys = new Set(Object.keys(source));

  const typeNameFilled: string =
    options?.typeName ??
    `{ ${Object.entries(source)
      .map(([k, v]) => `${k}: ${v.typeName}`)
      .join(', ')} }`;

  const allowExcessProperties = options?.allowExcessProperties ?? true;

  const defaultValue: Type<T>['defaultValue'] =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    Object.fromEntries(
      Object.entries(source).map(([key, value]) => tp(key, value.defaultValue)),
    ) as T;

  const validate: Type<T>['validate'] = (a) => {
    if (!isRecord(a)) {
      return Result.err([
        createPrimitiveValidationError({
          actualValue: a,
          expectedType: 'record',
          typeName: typeNameFilled,
        }),
      ]);
    }

    const defaultErrors: readonly ValidationError[] = Object.entries(
      source,
    ).flatMap(([k, valueType]) => {
      if (!Object.hasOwn(a, k)) {
        if (source[k]?.optional === true) return [];

        return [
          {
            path: [k],
            actualValue: a,
            typeName: typeNameFilled,
            expectedType: typeNameFilled,
            message: `Missing required key "${k}"`,
          } satisfies ValidationErrorWithMessage,
        ];
      }

      const v = a[k];
      const res = valueType.validate(v);

      if (Result.isErr(res)) {
        return prependPathToValidationErrors(res.value, k);
      }

      return [];
    });

    // Check for excess properties if allowExcessProperties is false
    if (!allowExcessProperties) {
      const excessKeys = Object.keys(a).filter((key) => !sourceKeys.has(key));

      if (excessKeys.length > 0) {
        const excessErrors: readonly ValidationError[] = excessKeys.map(
          (key) =>
            ({
              path: [key],
              actualValue: a[key],
              typeName: typeNameFilled,
              expectedType: typeNameFilled,
              message: `Excess property "${key}" is not allowed`,
            }) satisfies ValidationErrorWithMessage,
        );

        return Result.err([...defaultErrors, ...excessErrors]);
      }
    }

    if (defaultErrors.length > 0) {
      return Result.err(defaultErrors);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return Result.ok(a as T);
  };

  const fill: Type<T>['fill'] = (a) =>
    isRecord(a)
      ? // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
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

type RecordTypeValue<R extends ReadonlyRecord<string, Type<unknown>>> =
  TsFortressInternal.RecordTypeValueImpl<R>;

namespace TsFortressInternal {
  export type RecordTypeValueImpl<
    R extends ReadonlyRecord<string, Type<unknown>>,
  > = RecordTypeValueImplSub<R, OptionalTypeKeys<R>>;

  type RecordTypeValueImplSub<
    A extends ReadonlyRecord<string, Type<unknown>>,
    OptionalKeys extends keyof A,
  > = Readonly<
    {
      [key in OptionalKeys]?: TypeOf<A[key]>;
    } & {
      [key in Exclude<keyof A, OptionalKeys>]: TypeOf<A[key]>;
    }
  >;

  type OptionalTypeKeys<A extends ReadonlyRecord<string, Type<unknown>>> = {
    [K in keyof A]: A[K] extends { optional: true } ? K : never;
  }[keyof A];
}

/**
 * Creates a strict record type that does not allow excess properties.
 * This is an alias for `record(source, { allowExcessProperties: false })`.
 *
 * @param source - The record schema definition
 * @param options - Optional configuration (allowExcessProperties will be overridden to false)
 * @returns A Type that validates records without allowing excess properties
 *
 * @example
 * ```typescript
 * import { strictRecord, string, number } from 'ts-fortress';
 *
 * const User = strictRecord({
 *   name: string(),
 *   age: number()
 * });
 *
 * User.is({ name: "John", age: 30 }); // true
 * User.is({ name: "John", age: 30, extra: "not allowed" }); // false
 * ```
 */
export const strictRecord = <
  const R extends ReadonlyRecord<string, Type<unknown>>,
>(
  source: R,
  options?: Partial<
    Readonly<{
      typeName: string;
    }>
  >,
): Type<RecordTypeValue<R>> =>
  record(source, { ...options, allowExcessProperties: false });
