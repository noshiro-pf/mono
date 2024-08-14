import { ISet, Result } from '@noshiro/ts-utils';
import { type Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  validationErrorMessage,
} from '../utils/index.mjs';

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

  const valueSet = ISet.new<unknown>(values);

  const validate: Type<T>['validate'] = (a) =>
    valueSet.has(a)
      ? Result.ok(
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          a as T,
        )
      : Result.err([
          validationErrorMessage(
            a,
            `The value is expected to be one of the elements contained in { ${values.join(
              ', ',
            )} }`,
          ),
        ]);

  const is = createIsFn<T>(validate);

  const fill: Type<T>['fill'] = (a) => (is(a) ? a : defaultValue);

  return {
    typeName,
    defaultValue,
    fill,
    validate,
    is,
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};
