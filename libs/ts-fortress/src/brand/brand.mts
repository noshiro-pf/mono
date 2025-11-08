import { pipe, Result } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { createType, type ValidationError } from '../utils/index.mjs';

type ArrayToUnion<A extends readonly unknown[]> = A extends readonly []
  ? never
  : A[number];

export const brand = <
  const A extends StrictExtract<Primitive, string | number | bigint | boolean>,
  const BrandTrueKeys extends readonly string[],
  const BrandFalseKeys extends readonly string[] = [],
>({
  baseType,
  brandFalseKeys,
  brandKeys,
  defaultValue,
  is,
  typeName,
}: Readonly<{
  baseType: Type<A>;
  is: (
    a: A,
  ) => a is Brand<A, ArrayToUnion<BrandTrueKeys>, ArrayToUnion<BrandFalseKeys>>;
  defaultValue: A;
  typeName?: string;
  brandKeys: BrandTrueKeys;
  brandFalseKeys?: BrandFalseKeys;
}>): Type<
  Brand<A, ArrayToUnion<BrandTrueKeys>, ArrayToUnion<BrandFalseKeys>>
> => {
  type T = Brand<A, ArrayToUnion<BrandTrueKeys>, ArrayToUnion<BrandFalseKeys>>;

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
      .map(
        (res): Result<T, readonly ValidationError[]> =>
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

  return createType({
    typeName: brandKeysStr,
    defaultValue,
    validate,
  });
};
