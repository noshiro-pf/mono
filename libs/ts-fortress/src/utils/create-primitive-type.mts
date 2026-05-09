import { Result } from 'ts-data-forge';
import { type Primitive } from 'ts-type-forge';
import { type Type } from '../type.mjs';
import { createAssertFn } from './create-assert-fn.mjs';
import { createCastFn } from './create-cast-fn.mjs';
import { createPrimitiveValidationError } from './validation-error.mjs';

export const createPrimitiveType = <A extends Primitive>({
  defaultValue,
  is,
  typeName,
}: Readonly<{
  typeName: string;
  defaultValue: A;
  is: (value: unknown) => value is A;
}>): Type<A> => {
  const validate: Type<A>['validate'] = (a) =>
    is(a)
      ? Result.ok(a)
      : Result.err([
          createPrimitiveValidationError({
            actualValue: a,
            expectedType: typeName,
            typeName,
            details: undefined,
          }),
        ]);

  return {
    typeName,
    defaultValue,
    is,
    fill: (a) => (is(a) ? a : defaultValue),
    validate,
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};
