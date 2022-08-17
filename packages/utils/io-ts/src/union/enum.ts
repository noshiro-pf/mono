import { ISet, Result } from '@noshiro/ts-utils';
import type { Type } from '../type';
import {
  createAssertFunction,
  createIsFnFromValidateFn,
  validationErrorMessage,
} from '../utils';

export const enumType = <Values extends readonly Primitive[]>({
  typeName = 'enum',
  values,
  defaultValue,
}: Readonly<{
  typeName?: string;
  values: Values;
  defaultValue: ArrayElement<Values>;
}>): Type<ArrayElement<Values>> => {
  type T = ArrayElement<Values>;

  const valueSet = ISet.new(values) as ISet<unknown>;

  const validate: Type<T>['validate'] = (a) => {
    if (!valueSet.has(a)) {
      const valuesStr = values.join(', ');

      return Result.err([
        validationErrorMessage(
          a,
          `The value is expected to be one of the elements contained in { ${valuesStr} }`
        ),
      ]);
    }

    return Result.ok(undefined);
  };

  const is = createIsFnFromValidateFn<T>(validate);

  const fill: Type<T>['fill'] = (a) => (is(a) ? a : defaultValue);

  return {
    typeName,
    defaultValue,
    fill,
    validate,
    is,
    assertIs: createAssertFunction(validate),
  };
};
