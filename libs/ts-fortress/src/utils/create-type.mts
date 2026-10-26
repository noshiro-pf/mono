import type { Type, TypeStructure } from '../type.mjs';
import { createAssertFn } from './create-assert-fn.mjs';
import { createCastFn } from './create-cast-fn.mjs';
import { createIsFn } from './create-is-fn.mjs';

export const createType = <A,>({
  defaultValue,
  fill,
  prune,
  structure,
  typeName,
  validate,
}: Readonly<{
  typeName: string;
  defaultValue: A;
  validate: Type<A>['validate'];
  fill?: Type<A>['fill'];
  prune?: Type<A>['prune'];
  structure?: TypeStructure;
}>): Type<A> => {
  const is = createIsFn<A>(validate);

  return {
    typeName,
    defaultValue,
    validate,
    is,
    assertIs: createAssertFn(validate),
    fill: fill ?? ((a) => (is(a) ? a : defaultValue)),
    prune: prune ?? ((a) => a),
    cast: createCastFn(validate),
    ...(structure === undefined ? {} : { structure }),
  };
};
