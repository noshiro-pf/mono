import { ISet, memoizeFunction, Result } from 'ts-data-forge';
import {
  type ArrayElement,
  type NonEmptyArray,
  type Primitive,
} from 'ts-type-forge';
import { type Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  type ValidationError,
} from '../utils/index.mjs';

export const enumType = <const Values extends NonEmptyArray<Primitive>>(
  values: Values,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: ArrayElement<Values>;
    }>
  >,
): Type<ArrayElement<Values>> => {
  type T = ArrayElement<Values>;

  const valueSet = ISet.create(values);

  const typeName = options?.typeName ?? 'enum';

  const getDefaultValue = memoizeFunction(
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    (): T => options?.defaultValue ?? (values[0] as ArrayElement<Values>),
  );

  const validate: Type<T>['validate'] = (a) =>
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    valueSet.has(a as Primitive)
      ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        Result.ok(a as T)
      : Result.err([
          {
            path: [],
            actualValue: a,
            expectedType: typeName,
            typeName,
            details: {
              kind: 'enum',
              values,
            },
          } satisfies ValidationError,
        ]);

  const is = createIsFn<T>(validate);

  const fill: Type<T>['fill'] = (a) => (is(a) ? a : getDefaultValue());

  return {
    typeName: options?.typeName ?? 'enum',
    get defaultValue() {
      return getDefaultValue();
    },
    fill,
    validate,
    is,
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};
