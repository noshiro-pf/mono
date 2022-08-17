import { IList, Result } from '@noshiro/ts-utils';
import type { Type } from '../type';
import {
  createAssertFunction,
  createIsFnFromValidateFn,
  validationErrorMessage,
} from '../utils';

export const array = <A>({
  typeName,
  elementType,
  defaultValue = [],
}: Readonly<{
  typeName?: string;
  elementType: Type<A>;
  defaultValue?: readonly A[];
}>): Type<readonly A[]> => {
  type T = readonly A[];

  const typeNameFilled: string = typeName ?? `${elementType.typeName}[]`;

  const validate: Type<T>['validate'] = (a) => {
    if (!IList.isArray(a)) {
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
          (str) => `but the actual value at index ${index} is '${str}'`
        );

        return Result.err([message, ...res.value]);
      }
    }

    return Result.ok(undefined);
  };

  const fill: Type<T>['fill'] = (a) =>
    IList.isArray(a) ? IList.map(a, (e) => elementType.fill(e)) : defaultValue;

  return {
    typeName: typeNameFilled,
    defaultValue,
    fill,
    validate,
    is: createIsFnFromValidateFn(validate),
    assertIs: createAssertFunction(validate),
  };
};
