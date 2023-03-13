import { pipe, Result } from '@noshiro/ts-utils';
import { type Type } from '../type';
import { createType, validationErrorMessage } from '../utils';

export const brand = <A extends Primitive, S extends string>({
  codec,
  is,
  typeName,
  defaultValue,
}: Readonly<{
  codec: Type<A>;
  is: (a: A) => a is Phantomic<A, S>;
  typeName: S;
  defaultValue: Phantomic<A, S>;
}>): Type<Phantomic<A, S>> => {
  type T = Phantomic<A, S>;

  const validate: Type<T>['validate'] = (a) =>
    pipe(a)
      .chain(codec.validate)
      .chain((v): Result<Phantomic<A, S>, readonly string[]> => {
        if (Result.isErr(v)) return v;

        if (is(v.value)) {
          return Result.ok(v.value);
        } else {
          return Result.err([
            validationErrorMessage(
              v.value,
              `The value is expected to be <${typeName}>`
            ),
          ]);
        }
      }).value;

  const fill: Type<T>['fill'] = (a) =>
    pipe(a)
      .chain(validate)
      .chain((result) => Result.unwrapOkOr(result, defaultValue)).value;

  return createType({
    typeName,
    defaultValue,
    validate,
    fill,
  });
};
