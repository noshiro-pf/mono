import type { Type } from '../type';
import { createAssertFunction } from './create-assert-function';
import { createIsFnFromValidateFn } from './create-is-fn-from-validate-fn';

export const createType = <A>({
  typeName,
  defaultValue,
  validate,
  fill,
}: Readonly<{
  typeName: string;
  defaultValue: A;
  validate: Type<A>['validate'];
  fill?: Type<A>['fill'];
}>): Type<A> => {
  const is = createIsFnFromValidateFn<A>(validate);

  return {
    typeName,
    defaultValue,
    validate,
    is,
    assertIs: createAssertFunction(validate),
    fill: fill ?? ((a) => (is(a) ? a : defaultValue)),
  };
};