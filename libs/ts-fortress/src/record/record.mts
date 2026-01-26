import { Arr, isRecord, Result, tp } from 'ts-data-forge';
import {
  type ExcessPropertyBehavior,
  type ExcessPropertyFillBehavior,
  type RecordType,
  type TsFortressInternal,
  type Type,
} from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  createPrimitiveValidationError,
  prependPathToValidationErrors,
  type ValidationError,
} from '../utils/index.mjs';

export const record = <
  const R extends ReadonlyRecord<string, Type<unknown>>,
  const ExcessValidation extends ExcessPropertyBehavior = 'strip',
>(
  shape: R,
  options?: Partial<
    Readonly<{
      typeName: string;

      /**
       * Behavior when validating objects with excess properties.
       * - 'allow': Accept excess properties
       * - 'strip': Remove excess properties from the result (default)
       * - 'error': Reject objects with excess properties
       * @default 'strip'
       */
      excessPropertyValidation: ExcessValidation;

      /**
       * Behavior when filling objects with excess properties.
       * - 'allow': Keep excess properties in the result
       * - 'strip': Remove excess properties from the result (default)
       * @default 'strip'
       */
      excessPropertyFill: ExcessPropertyFillBehavior;
    }>
  >,
): RecordType<R, ExcessValidation> => {
  type T = ExcessValidation extends 'allow'
    ? TsFortressInternal.RecordTypeValue<R> | UnknownRecord
    : TsFortressInternal.RecordTypeValue<R>;

  const sourceKeys = new Set(Object.keys(shape));

  const typeNameFilled: string =
    options?.typeName ??
    `{ ${Object.entries(shape)
      .map(([k, v]) => `${k}: ${v.typeName}`)
      .join(', ')} }`;

  const excessPropertyValidation = options?.excessPropertyValidation ?? 'strip';

  const excessPropertyFill = options?.excessPropertyFill ?? 'strip';

  const defaultValue: Type<T>['defaultValue'] =
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    Object.fromEntries(
      Object.entries(shape).map(([key, value]) => tp(key, value.defaultValue)),
    ) as T;

  const stripExcessProperties = (obj: ReadonlyRecord<string, unknown>): T =>
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    Object.fromEntries(
      Object.entries(obj).filter(([key]) => sourceKeys.has(key)),
    ) as T;

  const validate: Type<T>['validate'] = (a) => {
    if (!isRecord(a)) {
      return Result.err([
        createPrimitiveValidationError({
          actualValue: a,
          expectedType: 'record',
          typeName: typeNameFilled,
          details: undefined,
        }),
      ]);
    }

    const defaultErrors: readonly ValidationError[] = Arr.generate(
      function* () {
        for (const [k, valueType] of Object.entries(shape)) {
          if (!Object.hasOwn(a, k)) {
            if (shape[k]?.optional !== true) {
              yield {
                path: [k],
                actualValue: a,
                typeName: typeNameFilled,
                expectedType: typeNameFilled,
                details: {
                  kind: 'missing-key',
                  key: k,
                },
              } satisfies ValidationError;
            }
          } else {
            // The case where the key exists in the object
            const v = a[k];

            const res = valueType.validate(v);

            if (Result.isErr(res)) {
              yield* prependPathToValidationErrors(res.value, k);
            }
          }
        }
      },
    );

    switch (excessPropertyValidation) {
      case 'allow':
        return defaultErrors.length > 0
          ? Result.err(defaultErrors)
          : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            Result.ok(a as T);

      case 'strip':
        return defaultErrors.length > 0
          ? Result.err(defaultErrors)
          : Result.ok(stripExcessProperties(a));

      case 'error': {
        const excessKeys = Object.keys(a).filter((key) => !sourceKeys.has(key));

        const excessErrors: readonly ValidationError[] = excessKeys.map(
          (key) =>
            ({
              path: [key],
              actualValue: a[key],
              typeName: typeNameFilled,
              expectedType: typeNameFilled,
              details: {
                kind: 'excess-key',
                key,
              },
            }) satisfies ValidationError,
        );

        // Combine all errors
        const allErrors = [...defaultErrors, ...excessErrors];

        return allErrors.length > 0
          ? Result.err(allErrors)
          : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            Result.ok(a as T);
      }
    }
  };

  const fill: Type<T>['fill'] = (a) => {
    if (!isRecord(a)) {
      return defaultValue;
    }

    // Handle excess properties based on fill option
    switch (excessPropertyFill) {
      case 'allow': {
        const excessEntries = Object.entries(a).filter(
          ([key]) => !sourceKeys.has(key),
        );

        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        return Object.fromEntries([
          ...Object.entries(shape).map(([k, v]) =>
            tp(k, Object.hasOwn(a, k) ? v.fill(a[k]) : v.defaultValue),
          ),
          ...excessEntries,
        ]) as T;
      }

      case 'strip': {
        // For 'strip' or 'error' (treated as 'strip' for fill), return only defined keys
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        return Object.fromEntries(
          Object.entries(shape).map(([k, v]) =>
            tp(k, Object.hasOwn(a, k) ? v.fill(a[k]) : v.defaultValue),
          ),
        ) as T;
      }
    }
  };

  return {
    typeName: typeNameFilled,
    defaultValue,
    fill,
    validate,
    is: createIsFn(validate),
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
    shape,
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    excessPropertyValidation: excessPropertyValidation as ExcessValidation,
    excessPropertyFill,
  };
};

/**
 * Creates a strict record type that does not allow excess properties.
 * This is an alias for `record(source, { excessPropertyValidation: 'error' })`.
 *
 * @param source - The record schema definition
 * @param options - Optional configuration
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
      excessPropertyFill: Extract<ExcessPropertyBehavior, 'allow' | 'strip'>;
    }>
  >,
): RecordType<R, 'error'> =>
  record(source, { ...options, excessPropertyValidation: 'error' });
