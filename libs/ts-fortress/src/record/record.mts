import {
  Arr,
  expectType,
  hasKey,
  isRecord,
  memoizeFunction,
  Result,
  tp,
} from 'ts-data-forge';
import {
  type ExcessPropertyOption,
  type RecordTypeInternals,
  type Type,
  type TypeOf,
  type UnknownShape,
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
  const S extends UnknownShape,
  const EP extends ExcessPropertyOption = 'allow',
>(
  shape: S,
  options?: Partial<
    Readonly<{
      typeName: string;

      /**
       * Controls how excess properties (keys not in shape) are handled.
       *
       * - `'allow'` (default) — accept excess properties
       * - `'reject'` — reject objects with excess properties
       */
      excessProperty: EP;
    }>
  >,
): Type<RecordTypeFromShape<S>> => {
  type V = RecordTypeFromShape<S>;

  const sourceKeys = new Set(Object.keys(shape));

  const typeNameFilled: string =
    options?.typeName ??
    `{ ${Object.entries(shape)
      .map(([k, v]) => `${k}: ${v.typeName}`)
      .join(', ')} }`;

  const ep: ExcessPropertyOption = options?.excessProperty ?? 'allow';

  const getDefaultValue = memoizeFunction(
    (): V =>
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      Object.fromEntries(
        Object.entries(shape).map(([key, value]) =>
          tp(key, value.defaultValue),
        ),
      ) as V,
  );

  const validate: Type<V>['validate'] = (a) => {
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
          if (!hasKey(a, k)) {
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

            // Skip validation for optional fields with undefined values
            if (valueType.optional === true && v === undefined) {
              continue;
            }

            const res = valueType.validate(v);

            if (Result.isErr(res)) {
              yield* prependPathToValidationErrors(res.value, k);
            }
          }
        }
      },
    );

    if (ep === 'reject') {
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
      const allErrors = [...defaultErrors, ...excessErrors] as const;

      return Arr.isNonEmpty(allErrors)
        ? Result.err(allErrors)
        : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          Result.ok(a as V);
    }

    // ep === 'allow'
    return Arr.isNonEmpty(defaultErrors)
      ? Result.err(defaultErrors)
      : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        Result.ok(a as V);
  };

  const fill = (a: unknown): V => {
    if (!isRecord(a)) {
      return getDefaultValue();
    }

    // fill always produces shape-only values (strips excess)
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return Object.fromEntries(
      Object.entries(shape).map(([k, v]) => {
        if (hasKey(a, k)) {
          const value = a[k];

          // For optional fields, if the value is undefined, keep it as undefined
          if (v.optional === true && value === undefined) {
            return tp(k, undefined);
          }

          return tp(k, v.fill(value));
        }

        return tp(k, v.defaultValue);
      }),
    ) as V;
  };

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return {
    typeName: typeNameFilled,
    get defaultValue() {
      return getDefaultValue();
    },
    fill,
    validate,
    is: createIsFn(validate),
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
    shapeStructure: { kind: 'simple', shape } as const,
    excessProperty: ep,
  } satisfies Type<V> & RecordTypeInternals as Type<V>;
};

/**
 * Creates a strict record type that rejects excess properties.
 * This is an alias for `record(shape, { excessProperty: 'reject' })`.
 */
export const strictRecord = <const S extends UnknownShape>(
  shape: S,
  options?: Partial<Readonly<{ typeName: string }>>,
): Type<RecordTypeFromShape<S>> =>
  record(shape, {
    typeName: options?.typeName,
    excessProperty: 'reject',
  });

// ---------------------------------------------------------------------------
// RecordTypeValue (internal — computes value type from shape)
// ---------------------------------------------------------------------------

/** @internal */
type RecordTypeFromShape<S extends UnknownShape> =
  TsFortressInternal.RecordTypeFromShapeImpl<S>;

namespace TsFortressInternal {
  export type RecordTypeFromShapeImpl<S extends UnknownShape> =
    RecordTypeFromShapeImplSub<S, OptionalTypeKeys<S>>;

  type RecordTypeFromShapeImplSub<
    S extends UnknownShape,
    OptionalKeys extends keyof S,
  > =
    TypeEq<OptionalKeys, never> extends true
      ? Readonly<{ [key in Exclude<keyof S, OptionalKeys>]: TypeOf<S[key]> }>
      : TypeEq<keyof S, OptionalKeys> extends true
        ? MergeIntersection<
            Readonly<{ [key in OptionalKeys]?: TypeOf<S[key]> }>
          >
        : MergeIntersection<
            Readonly<
              { [key in OptionalKeys]?: TypeOf<S[key]> } & {
                [key in Exclude<keyof S, OptionalKeys>]: TypeOf<S[key]>;
              }
            >
          >;

  type OptionalTypeKeys<S extends UnknownShape> = {
    [K in keyof S]: S[K] extends Readonly<{ optional: true }> ? K : never;
  }[keyof S];
}

// --- expectType assertions ---

expectType<
  RecordTypeFromShape<Readonly<{ a: Type<0>; b: Type<1>; c: Type<2> }>>,
  Readonly<{ a: 0; b: 1; c: 2 }>
>('=');

expectType<
  Type<RecordTypeFromShape<Readonly<{ a: Type<0> }>>>,
  Type<Readonly<{ a: 0 }>>
>('=');
