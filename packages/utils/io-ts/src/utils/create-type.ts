import { type Type } from '../type';
import { createAssertFn } from './create-assert-fn';
import { createCastFn } from './create-cast-fn';
import { createIsFn } from './create-is-fn';

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
