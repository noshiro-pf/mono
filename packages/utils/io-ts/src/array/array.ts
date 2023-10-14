import { Result } from '@noshiro/ts-utils';
import { type Type } from '../type';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  validationErrorMessage,
} from '../utils';

export const array = <A>(
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: readonly A[];
    }>
  >,
): Type<readonly A[]> => {
  type T = readonly A[];

  const { typeName, defaultValue = [] } = options ?? {};

  const typeNameFilled: string = typeName ?? `(${elementType.typeName})[]`;

  const validate: Type<T>['validate'] = (a) => {
    if (!Array.isArray(a)) {
      return Result.err([
        validationErrorMessage(a, 'The value is expected to be an array'),
      ]);
    }

    for (const [index, el] of a.entries()) {
      const res = elementType.validate(el);

      if (Result.isErr(res)) {
        const message = validationErrorMessage(
          el,
          `The array element is expected to be <${elementType.typeName}>`,
          (str) => `but the actual value at index ${index} is '${str}'`,
        );

        return Result.err([message, ...res.value]);
      }
    }

    // eslint-disable-next-line no-restricted-syntax
    return Result.ok(a as T);
  };

  const fill: Type<T>['fill'] = (a) =>
    Array.isArray(a) ? a.map((e) => elementType.fill(e)) : defaultValue;

  return {
    typeName: typeNameFilled,
    defaultValue,
    fill,
    validate,
    is: createIsFn(validate),
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};
