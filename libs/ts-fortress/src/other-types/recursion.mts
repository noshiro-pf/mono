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
  const mut_cache: {
    innerType: Type<A> | undefined;
    computedDefaultValue: A | undefined;
  } = {
    innerType: undefined as Type<A> | undefined,
    computedDefaultValue: undefined as A | undefined,
  };

  const getInnerType = (): Type<A> => {
    mut_cache.innerType ??= definition();

    return mut_cache.innerType;
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

      mut_cache.computedDefaultValue ??= getInnerType().defaultValue;

      return mut_cache.computedDefaultValue;
    },
    fill,
    validate,
    is,
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};
