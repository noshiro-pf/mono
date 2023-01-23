import { Result } from '@noshiro/ts-utils';
import { type Type } from '../type';
import { createAssertFunction } from './create-assert-function';
import { validationErrorMessage } from './validation-error-message';

export const createPrimitiveType = <A>({
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
            `The value is expected to be <${typeName}>`
          ),
        ]);

  return {
    typeName,
    defaultValue,
    is,
    fill: (a) => (is(a) ? a : defaultValue),
    validate,
    assertIs: createAssertFunction(validate),
  };
};
