import { IList, Result } from '@noshiro/ts-utils';
import type { Type } from '../type';
import {
  createAssertFunction,
  createIsFnFromValidateFn,
  validationErrorMessage,
} from '../utils';

export const nonEmptyArray = <A>({
  typeName,
  elementType,
  defaultValue,
}: Readonly<{
  typeName?: string;
  elementType: Type<A>;
  defaultValue: NonEmptyArray<A>;
}>): Type<NonEmptyArray<A>> => {
  type T = NonEmptyArray<A>;

  const typeNameFilled: string =
    typeName ?? `NonEmptyArray<${elementType.typeName}>`;

  const validate: Type<T>['validate'] = (a) => {
    if (!IList.isArray(a)) {
      return Result.err([
        validationErrorMessage(a, 'The value is expected to be an array'),
      ]);
    }

    if (IList.isEmpty(a)) {
      return Result.err([
        'The value is expected to be a non-empty array, but it is empty.',
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
    IList.isArray(a) && IList.isNonEmpty(a)
      ? IList.map(a, (e) => elementType.fill(e))
      : defaultValue;

  return {
    typeName: typeNameFilled,
    defaultValue,
    fill,
    validate,
    is: createIsFnFromValidateFn(validate),
    assertIs: createAssertFunction(validate),
  };
};
