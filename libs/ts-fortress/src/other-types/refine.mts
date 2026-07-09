import { pipe, Result } from 'ts-data-forge';
import { type Primitive } from 'ts-type-forge';
import { type Type } from '../type.mjs';
import {
  createPrimitiveValidationError,
  createType,
  type ValidationError,
} from '../utils/index.mjs';

export const refine = <
  Base extends Extract<Primitive, string | boolean | bigint | number>,
  R extends Base,
>({
  baseType,
  is,
  defaultValue,
  typeName = `${baseType.typeName} refined`,
}: Readonly<{
  baseType: Type<Base>;
  is: (a: Base) => a is R;
  defaultValue: R;
  typeName?: string;
}>): Type<R> => {
  const validate: Type<R>['validate'] = (a) =>
    pipe(a)
      .map(baseType.validate)
      .map((res): Result<R, readonly ValidationError[]> =>
        Result.isErr(res)
          ? res
          : is(res.value)
            ? Result.ok(res.value)
            : Result.err([
                createPrimitiveValidationError({
                  actualValue: a,
                  expectedType: typeName,
                  typeName,
                  details: undefined,
                }),
              ]),
      ).value;

  return createType({
    typeName,
    defaultValue,
    validate,
  });
};
