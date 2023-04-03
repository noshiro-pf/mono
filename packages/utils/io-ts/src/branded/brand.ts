import { pipe, Result } from '@noshiro/ts-utils';
import { type Type } from '../type';
import { createType, validationErrorMessage } from '../utils';

export const brand = <A extends Primitive, S extends readonly string[]>({
  codec,
  is,
  brandKeys,
  defaultValue,
}: Readonly<{
  codec: Type<A>;
  is: (a: A) => a is Brand<A, S[number]>;
  brandKeys: S;
  defaultValue: Brand<A, S[number]>;
}>): Type<Brand<A, S[number]>> => {
  type T = Brand<A, S[number]>;

  const validate: Type<T>['validate'] = (a) =>
    pipe(a)
      .chain(codec.validate)
      .chain((v): Result<Brand<A, S[number]>, readonly string[]> => {
        if (Result.isErr(v)) return v;

        if (is(v.value)) {
          return Result.ok(v.value);
        } else {
          return Result.err([
            validationErrorMessage(
              v.value,
              `The value must satisfy the constraint corresponding to the brand keys: <${brandKeys.join(
                ' & '
              )}>`
            ),
          ]);
        }
      }).value;

  const fill: Type<T>['fill'] = (a) =>
    pipe(a)
      .chain(validate)
      .chain((result) => Result.unwrapOkOr(result, defaultValue)).value;

  return createType({
    typeName: brandKeys.join(' & '),
    defaultValue,
    validate,
    fill,
  });
};
