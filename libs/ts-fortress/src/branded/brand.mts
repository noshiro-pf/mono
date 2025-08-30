import { pipe, Result } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { createType, type ValidationError } from '../utils/index.mjs';

type ArrayToUnion<A extends readonly unknown[]> = A extends readonly []
  ? never
  : A[number];

export const brand = <
  const A extends Primitive,
  const BrandTrueKeys extends readonly string[],
  const BrandFalseKeys extends readonly string[] = [],
>({
  codec,
  is,
  defaultValue,
  typeName,
  brandKeys,
  brandFalseKeys,
}: Readonly<{
  codec: Type<A>;
  is: (
    a: A,
  ) => a is Brand<A, ArrayToUnion<BrandTrueKeys>, ArrayToUnion<BrandFalseKeys>>;
  defaultValue: Brand<
    A,
    ArrayToUnion<BrandTrueKeys>,
    ArrayToUnion<BrandFalseKeys>
  >;
  typeName?: string;
  brandKeys: BrandTrueKeys;
  brandFalseKeys?: BrandFalseKeys;
}>): Type<
  Brand<A, ArrayToUnion<BrandTrueKeys>, ArrayToUnion<BrandFalseKeys>>
> => {
  type T = Brand<A, ArrayToUnion<BrandTrueKeys>, ArrayToUnion<BrandFalseKeys>>;

  const brandKeysStr = [
    ...brandKeys.map((s) => `"${s}"`),
    ...(brandFalseKeys?.map((s) => `not("${s}")`) ?? []),
  ].join(' & ');

  const typeNameFilled = typeName ?? brandKeysStr;

  const validate: Type<T>['validate'] = (a) =>
    pipe(a)
      .map(codec.validate)
      .map(
        (v): Result<T, readonly ValidationError[]> =>
          Result.isErr(v)
            ? v
            : is(v.value)
              ? Result.ok(v.value)
              : Result.err([
                  {
                    path: [],
                    actualValue: v.value,
                    expectedType: typeNameFilled,
                    typeName: brandKeysStr,
                    message:
                      typeName === undefined
                        ? `The value must satisfy the constraint corresponding to the brand keys: <${brandKeysStr}>`
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
