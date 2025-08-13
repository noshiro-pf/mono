import { Result } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { createPrimitiveValidationError } from '../validation-error.mjs';
import { createAssertFn } from './create-assert-fn.mjs';
import { createCastFn } from './create-cast-fn.mjs';

export const createPrimitiveType = <A extends Primitive>({
  typeName,
  defaultValue,
  is,
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
