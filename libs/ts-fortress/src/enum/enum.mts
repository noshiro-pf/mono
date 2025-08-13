import { ISet, Result } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { createAssertFn, createCastFn, createIsFn } from '../utils/index.mjs';
import { type ValidationErrorWithMessage } from '../validation-error.mjs';

export const enumType = <const Values extends NonEmptyArray<Primitive>>(
  values: Values,
  options?: Readonly<{
    typeName?: string;
    defaultValue?: ArrayElement<Values>;
  }>,
): Type<ArrayElement<Values>> => {
  type T = ArrayElement<Values>;

  const valueSet = ISet.create(values);

  const defaultValueFilled =
    options?.defaultValue ??
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    (values[0] as ArrayElement<Values>);

  const validate: Type<T>['validate'] = (a) => {
    const typeNameFilled = options?.typeName ?? 'enum';
    return (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      valueSet.has(a as Primitive)
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          Result.ok(a as T)
        : Result.err([
            {
              path: [],
              actualValue: a,
              expectedType: typeNameFilled,
              message: `The value is expected to be one of the elements contained in { ${values.join(
                ', ',
              )} }`,
              typeName: typeNameFilled,
            } satisfies ValidationErrorWithMessage,
          ])
    );
  };

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
