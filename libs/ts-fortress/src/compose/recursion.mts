import { type Type } from '../type.mjs';
import { createAssertFn, createCastFn, createIsFn } from '../utils/index.mjs';

export const recursion = <A,>(
  typeName: string,
  definition: () => Type<A>,
  options?: Partial<
    Readonly<{
      defaultValue: A;
    }>
  >,
): Type<A> => {
  const cache: {
    innerType: Type<A> | undefined;
    computedDefaultValue: A | undefined;
  } = {
    innerType: undefined as Type<A> | undefined,
    computedDefaultValue: undefined as A | undefined,
  };

  const getInnerType = (): Type<A> => {
    // eslint-disable-next-line functional/immutable-data
    cache.innerType ??= definition();
    return cache.innerType;
  };

  const validate: Type<A>['validate'] = (a) => getInnerType().validate(a);

  const is = createIsFn<A>(validate);

  const fill: Type<A>['fill'] = (a) => getInnerType().fill(a);

  return {
    typeName,
    get defaultValue(): A {
      if (options?.defaultValue !== undefined) {
        return options.defaultValue;
      }
      // eslint-disable-next-line functional/immutable-data
      cache.computedDefaultValue ??= getInnerType().defaultValue;
      return cache.computedDefaultValue;
    },
    fill,
    validate,
    is,
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};
