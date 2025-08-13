import { type Type } from '../type.mjs';
import { createAssertFn } from './create-assert-fn.mjs';
import { createCastFn } from './create-cast-fn.mjs';
import { createIsFn } from './create-is-fn.mjs';

export const createType = <A,>({
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
  const is = createIsFn<A>(validate);

  return {
    typeName,
    defaultValue,
    validate,
    is,
    assertIs: createAssertFn(validate),
    fill: fill ?? ((a) => (is(a) ? a : defaultValue)),
    cast: createCastFn(validate),
  };
};
