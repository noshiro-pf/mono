import { pipe, Result } from 'ts-data-forge';
import { type Primitive } from 'ts-type-forge';
import { type Type } from '../type.mjs';
import {
  createPrimitiveValidationError,
  createType,
  type ValidationError,
  type ValidationErrorDetails,
} from '../utils/index.mjs';

export const refine = <
  Base extends Extract<Primitive, string | boolean | bigint | number>,
  R extends Base,
>({
  baseType,
  is,
  defaultValue,
  typeName = `${baseType.typeName} refined`,
  getConstraintDetails,
}: Readonly<{
  baseType: Type<Base>;
  is: (a: Base) => a is R;
  defaultValue: R;
  typeName?: string;
  /**
   * Optional producer of structured error details for a value that passes the
   * base type but fails `is`. Used by the built-in constrained primitives
   * (`string` / `number` / `bigint`) to explain which constraint was violated;
   * user-defined refinements can omit it and fall back to a generic message.
   */
  getConstraintDetails?: (a: Base) => ValidationErrorDetails | undefined;
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
                  details: getConstraintDetails?.(res.value),
                }),
              ]),
      ).value;

  return createType({
    typeName,
    defaultValue,
    validate,
  });
};
