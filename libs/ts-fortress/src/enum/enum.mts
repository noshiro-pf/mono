import { ISet, isNonNullObject, isString, Result } from 'ts-data-forge';
import type { ArrayElement, NonEmptyTuple, Primitive } from 'ts-type-forge';
import type { Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  createPrimitiveType,
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
// other string, and at runtime the value is validated as a plain string: the
// string primitive under the enum's name, defaulting to the first member.
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
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  const firstValue = values[0] as ArrayElement<Values>;

  // The default given, else the first member. `Reflect.has` rather than `??`:
  // `null` and `undefined` are primitives an enum may list, and so may be the
  // default that is given, an explicit `defaultValue: undefined` included.
  // `Reflect.has` rather than an own-property test, so that a default the
  // options object inherits is still read. `isNonNullObject` because a
  // JavaScript caller may pass `null`. It is read once, when the type is built:
  // a getter that supplies it runs, or throws, in `enumType`, and a later
  // change to `options` does not reach the type.
  const givenDefault: unknown =
    isNonNullObject(options) && Reflect.has(options, 'defaultValue')
      ? options.defaultValue
      : firstValue;

  // `isString(values[0])` follows from `every`; it is there to narrow the first
  // member, which `every` does not. A binding of the first member would not do:
  // its type would take the `null` of `Primitive`, which Sumi rejects.
  if (
    options?.allowAnyString === true &&
    values.every(isString) &&
    isString(values[0])
  ) {
    // Built here rather than by `string(defaultValue)`: the name has to reach
    // the validation errors, which keep the name the primitive was created
    // with. It carries no `constraints`: `enumType` never typed them, and the
    // all-unset record `string()` attaches adds nothing to the schema.
    return createPrimitiveType({
      typeName: options.typeName ?? 'string',
      // A default that is not a string (an explicit `undefined`, or a value
      // past the types) gives way to the first member. Every member is a string
      // here, so `isString` keeps every default the enum lists.
      defaultValue: isString(givenDefault) ? givenDefault : values[0],
      is: isString,
      structure: { kind: 'string' },
    });
  }

  type T = ArrayElement<Values> | (string & {});

  const valueSet = ISet.create(values);

  const typeName = options?.typeName ?? 'enum';

  const validate: Type<T>['validate'] = (a) =>
    // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
    valueSet.has(a as Primitive)
      ? // `a` is one of `values` here.
        // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
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

  // A default the enum does not list (an explicit `undefined` it does not list,
  // or a value past the types) gives way to the first member, so that
  // `defaultValue` and `fill` always satisfy `is`.
  const defaultValue: T = is(givenDefault) ? givenDefault : firstValue;

  const fill: Type<T>['fill'] = (a) => (is(a) ? a : defaultValue);

  return {
    typeName,
    defaultValue,
    fill,
    prune: (a) => a,
    validate,
    is,
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
    structure: { kind: 'enum', values },
  };
}
