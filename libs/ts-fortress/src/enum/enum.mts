import { ISet, isString, memoizeFunction, Result } from 'ts-data-forge';
import {
  type ArrayElement,
  type NonEmptyTuple,
  type Primitive,
} from 'ts-type-forge';
import { string } from '../primitives/index.mjs';
import { type Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  type ValidationError,
} from '../utils/index.mjs';

export function enumType<const Values extends NonEmptyTuple<Primitive>>(
  values: Values,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: ArrayElement<Values>;
      allowAnyString: false;
    }>
  >,
): Type<ArrayElement<Values>>;

// When `allowAnyString` is on, the result type keeps autocomplete for the
// listed members via the `T | (string & {})` idiom while still accepting any
// other string, and at runtime the value is validated as a plain string
// (i.e. it behaves like `string()`).
export function enumType<const Values extends NonEmptyTuple<string>>(
  values: Values,
  options: Readonly<{
    allowAnyString: true;
    typeName?: string;
    defaultValue?: ArrayElement<Values> | (string & {});
  }>,
): Type<ArrayElement<Values> | (string & {})>;

export function enumType<const Values extends NonEmptyTuple<Primitive>>(
  values: Values,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: ArrayElement<Values> | (string & {});
      allowAnyString: boolean;
    }>
  >,
): Type<ArrayElement<Values> | (string & {})> {
  if (
    options?.allowAnyString === true &&
    values.every(isString) &&
    isString(options.defaultValue)
  ) {
    return string(options.defaultValue);
  }

  type T = ArrayElement<Values> | (string & {});

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
    typeName,
    get defaultValue() {
      return getDefaultValue();
    },
    fill,
    prune: (a) => a,
    validate,
    is,
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
}
