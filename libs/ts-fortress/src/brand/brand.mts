import { pipe, Result } from 'ts-data-forge';
import { type Brand, type Primitive, type StrictExtract } from 'ts-type-forge';
import {
  type ConstraintsCarrier,
  propagateConstraints,
  type WithConstraints,
} from '../constraints/index.mjs';
import { type Type } from '../type.mjs';
import { createType, type ValidationError } from '../utils/index.mjs';

export type { Brand } from 'ts-type-forge';

type ArrayToUnion<A extends readonly unknown[]> = A extends readonly []
  ? never
  : A[number];

/**
 * Brands a primitive type.
 *
 * The constraint values the base type carries (see {@link WithConstraints})
 * are carried over to the branded type, so that
 * `t.brand({ baseType: t.number(0, { min: 0, max: 10 }), ... }).constraints`
 * still reads `min` and `max`. `C` is inferred from `baseType.constraints`;
 * branding a base type that carries none adds no `constraints` property.
 */
export const brand = <
  const A extends StrictExtract<Primitive, string | number | bigint | boolean>,
  const BrandTrueKeys extends readonly string[],
  const BrandFalseKeys extends readonly string[] = readonly [],
  const C = unknown,
>({
  baseType,
  brandFalseKeys,
  brandKeys,
  defaultValue: defaultValue_,
  is: is_,
  typeName,
}: Readonly<{
  baseType: Type<A> & Partial<WithConstraints<C>>;
  is?: (
    a: A,
  ) => a is Brand<A, ArrayToUnion<BrandTrueKeys>, ArrayToUnion<BrandFalseKeys>>;
  defaultValue?: A;
  typeName?: string;
  brandKeys: BrandTrueKeys;
  brandFalseKeys?: BrandFalseKeys;
}>): Type<Brand<A, ArrayToUnion<BrandTrueKeys>, ArrayToUnion<BrandFalseKeys>>> &
  ConstraintsCarrier<C> => {
  type T = Brand<A, ArrayToUnion<BrandTrueKeys>, ArrayToUnion<BrandFalseKeys>>;

  const is: (a: A) => a is T = is_ ?? ((_a): _a is T => true);

  const defaultValue: A = defaultValue_ ?? baseType.defaultValue;

  if (!is(defaultValue)) {
    throw new Error(
      `defaultValue ${defaultValue} doesn't pass \`is\` function`,
    );
  }

  const brandKeysStr = [
    ...brandKeys.map((s) => `"${s}"`),
    ...(brandFalseKeys?.map((s) => `not("${s}")`) ?? []),
  ].join(' & ');

  const typeNameFilled = typeName ?? brandKeysStr;

  const validate: Type<T>['validate'] = (a) =>
    pipe(a)
      .map(baseType.validate)
      .map((res): Result<T, readonly ValidationError[]> =>
        Result.isErr(res)
          ? res
          : is(res.value)
            ? Result.ok(res.value satisfies T)
            : Result.err([
                {
                  path: [],
                  actualValue: res.value,
                  expectedType: typeNameFilled,
                  typeName: typeNameFilled,
                  details:
                    // If typeName is specified, it will be used in the error message, so no further information is required.
                    typeName === undefined
                      ? {
                          kind: 'brand' as const,
                          description: brandKeysStr,
                        }
                      : undefined,
                } satisfies ValidationError,
              ]),
      ).value;

  return propagateConstraints(
    createType({
      typeName: typeNameFilled,
      defaultValue,
      validate,
    }),
    baseType,
  );
};
