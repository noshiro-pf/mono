import { pipe, Result } from '@noshiro/ts-utils';
import { type Type } from '../type.mjs';
import { createType, validationErrorMessage } from '../utils/index.mjs';

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
  brandKeys,
  brandFalseKeys,
  defaultValue,
}: Readonly<{
  codec: Type<A>;
  is: (
    a: A,
  ) => a is Brand<A, ArrayToUnion<BrandTrueKeys>, ArrayToUnion<BrandFalseKeys>>;
  brandKeys: BrandTrueKeys;
  brandFalseKeys?: BrandFalseKeys;
  defaultValue: Brand<
    A,
    ArrayToUnion<BrandTrueKeys>,
    ArrayToUnion<BrandFalseKeys>
  >;
}>): Type<
  Brand<A, ArrayToUnion<BrandTrueKeys>, ArrayToUnion<BrandFalseKeys>>
> => {
  type T = Brand<A, ArrayToUnion<BrandTrueKeys>, ArrayToUnion<BrandFalseKeys>>;

  const brandKeysStr = [
    ...brandKeys,
    ...(brandFalseKeys?.map((s) => `not(${s})`) ?? []),
  ].join(' & ');

  const validate: Type<T>['validate'] = (a) =>
    pipe(a)
      .chain(codec.validate)
      .chain(
        (v): Result<T, readonly string[]> =>
          Result.isErr(v)
            ? v
            : is(v.value)
              ? Result.ok(v.value)
              : Result.err([
                  validationErrorMessage(
                    v.value,
                    `The value must satisfy the constraint corresponding to the brand keys: <${brandKeysStr}>`,
                  ),
                ]),
      ).value;

  const fill: Type<T>['fill'] = (a) =>
    pipe(a)
      .chain(validate)
      .chain((result) => Result.unwrapOkOr(result, defaultValue)).value;

  return createType({
    typeName: brandKeysStr,
    defaultValue,
    validate,
    fill,
  });
};
