import { pipe, Result } from 'ts-data-forge';
import { type Primitive, type StrictExtract } from 'ts-type-forge';
import {
  type ConstraintsCarrier,
  propagateConstraints,
  type WithConstraints,
} from '../constraints/index.mjs';
import { type Type } from '../type.mjs';
import {
  createPrimitiveValidationError,
  createType,
  type ValidationError,
  type ValidationErrorDetails,
} from '../utils/index.mjs';

/**
 * Narrows a primitive type by a predicate.
 *
 * The constraint values the base type carries (see
 * {@link WithConstraints}) are carried over to the refined type, so that
 * `t.refine({ baseType: t.number(0, { min: 0, max: 10 }), ... }).constraints`
 * still reads `min` and `max`. `C` is inferred from `baseType.constraints`;
 * refining a base type that carries none adds no `constraints` property.
 */
export const refine = <
  Base extends StrictExtract<Primitive, string | boolean | bigint | number>,
  R extends Base,
  const C = unknown,
>({
  baseType,
  is,
  defaultValue,
  typeName = `${baseType.typeName} refined`,
  getConstraintDetails,
}: Readonly<{
  baseType: Type<Base> & Partial<WithConstraints<C>>;
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
}>): Type<R> & ConstraintsCarrier<C> => {
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

  return propagateConstraints(
    createType({
      typeName,
      defaultValue,
      validate,
    }),
    baseType,
  );
};
