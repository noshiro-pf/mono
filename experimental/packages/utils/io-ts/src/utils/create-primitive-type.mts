import { Result } from '@noshiro/ts-utils';
import { type Type } from '../type.mjs';
import { createAssertFn } from './create-assert-fn.mjs';
import { createCastFn } from './create-cast-fn.mjs';
import { validationErrorMessage } from './validation-error-message.mjs';

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
          validationErrorMessage(
            a,
            `The value is expected to be <${typeName}>`,
          ),
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
