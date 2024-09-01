import { ISet, Result } from '@noshiro/ts-utils';
import { type Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  validationErrorMessage,
} from '../utils/index.mjs';

export const enumType = <const Values extends NonEmptyArray<Primitive>>(
  values: Values,
  options?: Readonly<{
    typeName?: string;
    defaultValue?: ArrayElement<Values>;
  }>,
): Type<ArrayElement<Values>> => {
  type T = ArrayElement<Values>;

  const valueSet = ISet.new<unknown>(values);

  const defaultValueFilled =
    options?.defaultValue ??
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    (values[0] as ArrayElement<Values>);

  const validate: Type<T>['validate'] = (a) =>
    valueSet.has(a)
      ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        Result.ok(a as T)
      : Result.err([
          validationErrorMessage(
            a,
            `The value is expected to be one of the elements contained in { ${values.join(
              ', ',
            )} }`,
          ),
        ]);

  const is = createIsFn<T>(validate);

  const fill: Type<T>['fill'] = (a) => (is(a) ? a : defaultValueFilled);

  return {
    typeName: options?.typeName ?? 'enum',
    defaultValue: defaultValueFilled,
    fill,
    validate,
    is,
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};
