/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-restricted-types */
/* eslint-disable @typescript-eslint/consistent-type-imports */

// Copied from https://github.com/vitest-dev/vitest/blob/v4.0.14/packages/vitest/globals.d.ts and replaced `assert`

declare global {
  const assert: OverriddenAssert;

  const suite: (typeof import('vitest'))['suite'];

  const test: (typeof import('vitest'))['test'];

  const chai: (typeof import('vitest'))['chai'];

  const describe: (typeof import('vitest'))['describe'];

  const it: (typeof import('vitest'))['it'];

  const expectTypeOf: (typeof import('vitest'))['expectTypeOf'];

  const assertType: (typeof import('vitest'))['assertType'];

  const expect: (typeof import('vitest'))['expect'];

  const vitest: (typeof import('vitest'))['vitest'];

  const vi: (typeof import('vitest'))['vitest'];

  const beforeAll: (typeof import('vitest'))['beforeAll'];

  const afterAll: (typeof import('vitest'))['afterAll'];

  const beforeEach: (typeof import('vitest'))['beforeEach'];

  const afterEach: (typeof import('vitest'))['afterEach'];

  const onTestFailed: (typeof import('vitest'))['onTestFailed'];

  const onTestFinished: (typeof import('vitest'))['onTestFinished'];
}

// eslint-disable-next-line unicorn/require-module-specifiers
export {};

type Constructor<T> = Chai.Constructor<T>;

type Operator = Chai.Operator;

type OperatorComparable = Chai.OperatorComparable;

type OverriddenAssert = Readonly<{
  /**
   * Asserts that value is true.
   *
   * @param value   Actual value.
   */
  isTrue: (value: boolean) => asserts value;

  /**
   * Asserts that value is false.
   *
   * @param value   Actual value.
   */
  isFalse: (value: boolean) => asserts value is false;

  // ModifiedChai.Assert
  //
  // - Removed optional `message` arg
  // - Convert arg types to be readonly
  // - Replace `Object` with `object`
  // - Removed the call signature
  // - Removed deepEqual, equal, notEqual, ok, notOk, isOk, isNotOk, isTrue, isFalse
  //    - deepEqual // Removed in favor of assert.deepStrictEqual
  //    - equal     // Removed in favor of assert.strictEqual
  //    - notEqual  // Removed in favor of assert.notStrictEqual
  //    - ok        // Removed in favor of assert.isTrue
  //    - notOk     // Removed in favor of assert.isFalse
  //    - isOk      // Removed in favor of assert.isTrue
  //    - isNotOk   // Removed in favor of assert.isFalse
  //    - isTrue    // Overridden with OverriddenAssert
  //    - isFalse   // Overridden with OverriddenAssert

  // /**
  //  * @param expression    Expression to test for truthiness.
  //  */
  // (expression: unknown): asserts expression;

  /**
   * Throws a failure.
   *
   * @remarks Node.js assert module-compatible.
   */
  fail: (() => never) &
    (<T>(actual: T, expected: T, operator?: Operator) => never);

  // /**
  //  * Asserts that object is truthy.
  //  *
  //  * @param object   Object to test.
  //  */
  // isOk: (value: unknown) => asserts value;

  // /**
  //  * Asserts that object is truthy.
  //  *
  //  * @param object   Object to test.
  //  */
  // ok: (value: unknown) => asserts value;

  // /**
  //  * Asserts that object is falsy.
  //  *
  //  * T   Type of object.
  //  * @param object   Object to test.
  //  */
  // isNotOk: <T>(value: T) => void;

  // /**
  //  * Asserts that object is falsy.
  //  *
  //  * T   Type of object.
  //  * @param object   Object to test.
  //  */
  // notOk: <T>(value: T) => void;

  // /**
  //  * Asserts non-strict equality (==) of actual and expected.
  //  *
  //  * T   Type of the objects.
  //  * @param actual   Actual value.
  //  * @param expected   Potential expected value.
  //  */
  // equal: <T>(actual: T, expected: T) => void;

  // /**
  //  * Asserts non-strict inequality (!=) of actual and expected.
  //  *
  //  * T   Type of the objects.
  //  * @param actual   Actual value.
  //  * @param expected   Potential expected value.
  //  */
  // notEqual: <T>(actual: T, expected: T) => void;

  /**
   * Asserts strict equality (===) of actual and expected.
   *
   * T   Type of the objects.
   * @param actual   Actual value.
   * @param expected   Potential expected value.
   */
  strictEqual: <T>(actual: T, expected: T) => void;

  /**
   * Asserts strict inequality (!==) of actual and expected.
   *
   * T   Type of the objects.
   * @param actual   Actual value.
   * @param expected   Potential expected value.
   */
  notStrictEqual: <T>(actual: T, expected: T) => void;

  // /**
  //  * Asserts that actual is deeply equal to expected.
  //  *
  //  * T   Type of the objects.
  //  * @param actual   Actual value.
  //  * @param expected   Potential expected value.
  //  */
  // deepEqual: <T>(actual: T, expected: T) => void;

  /**
   * Asserts that actual is not deeply equal to expected.
   *
   * T   Type of the objects.
   * @param actual   Actual value.
   * @param expected   Potential expected value.
   */
  notDeepEqual: <T>(actual: T, expected: T) => void;

  /**
   * Alias to deepEqual
   *
   * T   Type of the objects.
   * @param actual   Actual value.
   * @param expected   Potential expected value.
   */
  deepStrictEqual: <T>(actual: T, expected: T) => void;

  /**
   * Partially matches actual and expected.
   *
   * @param actual   Actual value.
   * @param expected   Potential subset of the value.
   */
  containSubset: (val: unknown, exp: unknown, msg?: string) => void;

  /**
   * Partially matches actual and expected.
   *
   * @param actual   Actual value.
   * @param expected   Potential subset of the value.
   */
  containsSubset: (val: unknown, exp: unknown, msg?: string) => void;

  /**
   * No partial match between actual and expected exists.
   *
   * @param actual   Actual value.
   * @param expected   Potential subset of the value.
   */
  doesNotContainSubset: (val: unknown, exp: unknown, msg?: string) => void;

  /**
   * Asserts valueToCheck is strictly greater than (>) valueToBeAbove.
   *
   * @param valueToCheck   Actual value.
   * @param valueToBeAbove   Minimum Potential expected value.
   */
  isAbove: (valueToCheck: number, valueToBeAbove: number) => void;

  /**
   * Asserts valueToCheck is greater than or equal to (>=) valueToBeAtLeast.
   *
   * @param valueToCheck   Actual value.
   * @param valueToBeAtLeast   Minimum Potential expected value.
   */
  isAtLeast: (valueToCheck: number, valueToBeAtLeast: number) => void;

  /**
   * Asserts valueToCheck is strictly less than (<) valueToBeBelow.
   *
   * @param valueToCheck   Actual value.
   * @param valueToBeBelow   Minimum Potential expected value.
   */
  isBelow: (valueToCheck: number, valueToBeBelow: number) => void;

  /**
   * Asserts valueToCheck is less than or equal to (<=) valueToBeAtMost.
   *
   * @param valueToCheck   Actual value.
   * @param valueToBeAtMost   Minimum Potential expected value.
   */
  isAtMost: (valueToCheck: number, valueToBeAtMost: number) => void;

  // /**
  //  * Asserts that value is true.
  //  *
  //  * @param value   Actual value.
  //  */
  // isTrue: (value: unknown) => asserts value is true;

  // /**
  //  * Asserts that value is false.
  //  *
  //  * @param value   Actual value.
  //  */
  // isFalse: (value: unknown) => asserts value is false;

  /**
   * Asserts that value is not true.
   *
   * T   Type of value.
   * @param value   Actual value.
   */
  isNotTrue: <T>(value: T) => asserts value is Exclude<T, true>;

  /**
   * Asserts that value is not false.
   *
   * @param value   Actual value.
   */
  isNotFalse: <T>(value: T) => asserts value is Exclude<T, false>;

  /**
   * Asserts that value is null.
   *
   * @param value   Actual value.
   */
  isNull: (value: unknown) => asserts value is null;

  /**
   * Asserts that value is not null.
   *
   * T   Type of value.
   * @param value   Actual value.
   */
  isNotNull: <T>(value: T) => asserts value is Exclude<T, null>;

  /**
   * Asserts that value is NaN.
   *
   * T   Type of value.
   * @param value   Actual value.
   */
  isNaN: <T>(value: T) => void;

  /**
   * Asserts that value is not NaN.
   *
   * T   Type of value.
   * @param value   Actual value.
   */
  isNotNaN: <T>(value: T) => void;

  /**
   * Asserts that the target is neither null nor undefined.
   *
   * T   Type of value.
   * @param value   Actual value.
   */
  exists: <T>(value: T) => asserts value is NonNullable<T>;

  /**
   * Asserts that the target is either null or undefined.
   *
   * @param value   Actual value.
   */
  notExists: (value: unknown) => asserts value is null | undefined;

  /**
   * Asserts that value is undefined.
   *
   * @param value   Actual value.
   */
  isUndefined: (value: unknown) => asserts value is undefined;

  /**
   * Asserts that value is not undefined.
   *
   * T   Type of value.
   * @param value   Actual value.
   */
  isDefined: <T>(value: T) => asserts value is Exclude<T, undefined>;

  /**
   * Asserts that value is a function.
   *
   * T   Type of value.
   * @param value   Actual value.
   */
  isFunction: <T>(value: T) => void;

  /**
   * Asserts that value is not a function.
   *
   * T   Type of value.
   * @param value   Actual value.
   */
  isNotFunction: <T>(value: T) => void;

  /**
   * Asserts that value is an object of type 'Object'
   * (as revealed by Object.prototype.toString).
   *
   * T   Type of value.
   * @param value   Actual value.
   * @remarks The assertion does not match subclassed objects.
   */
  isObject: <T>(value: T) => void;

  /**
   * Asserts that value is not an object of type 'Object'
   * (as revealed by Object.prototype.toString).
   *
   * T   Type of value.
   * @param value   Actual value.
   */
  isNotObject: <T>(value: T) => void;

  /**
   * Asserts that value is an array.
   *
   * T   Type of value.
   * @param value   Actual value.
   */
  isArray: <T>(value: T) => void;

  /**
   * Asserts that value is not an array.
   *
   * T   Type of value.
   * @param value   Actual value.
   */
  isNotArray: <T>(value: T) => void;

  /**
   * Asserts that value is a string.
   *
   * T   Type of value.
   * @param value   Actual value.
   */
  isString: <T>(value: T) => void;

  /**
   * Asserts that value is not a string.
   *
   * T   Type of value.
   * @param value   Actual value.
   */
  isNotString: <T>(value: T) => void;

  /**
   * Asserts that value is a number.
   *
   * T   Type of value.
   * @param value   Actual value.
   */
  isNumber: <T>(value: T) => void;

  /**
   * Asserts that value is not a number.
   *
   * T   Type of value.
   * @param value   Actual value.
   */
  isNotNumber: <T>(value: T) => void;

  /**
   * Asserts that value is a finite number.
   * Unlike `.isNumber`, this will fail for `NaN` and `Infinity`.
   *
   * T   Type of value
   * @param value    Actual value
   */
  isFinite: <T>(value: T) => void;

  /**
   * Asserts that value is a boolean.
   *
   * T   Type of value.
   * @param value   Actual value.
   */
  isBoolean: <T>(value: T) => void;

  /**
   * Asserts that value is not a boolean.
   *
   * T   Type of value.
   * @param value   Actual value.
   */
  isNotBoolean: <T>(value: T) => void;

  /**
   * Asserts that value's type is name, as determined by Object.prototype.toString.
   *
   * T   Type of value.
   * @param value   Actual value.
   * @param name   Potential expected type name of value.
   */
  typeOf: <T>(value: T, name: string) => void;

  /**
   * Asserts that value's type is not name, as determined by Object.prototype.toString.
   *
   * T   Type of value.
   * @param value   Actual value.
   * @param name   Potential expected type name of value.
   */
  notTypeOf: <T>(value: T, name: string) => void;

  /**
   * Asserts that value is an instance of constructor.
   *
   * T   Expected type of value.
   * @param value   Actual value.
   * @param ctor   Potential expected constructor of value.
   */
  instanceOf: <T>(value: unknown, ctor: Constructor<T>) => asserts value is T;

  /**
   * Asserts that value is not an instance of constructor.
   *
   * T   Type of value.
   * U   Type that value shouldn't be an instance of.
   * @param value   Actual value.
   * @param ctor   Potential expected constructor of value.
   */
  notInstanceOf: <T, U>(
    value: T,
    ctor: Constructor<U>,
  ) => asserts value is Exclude<T, U>;

  /**
   * Asserts that haystack includes needle.
   *
   * @param haystack   Container string.
   * @param needle   Potential substring of haystack.
   */
  include: ((haystack: string, needle: string) => void) &
    (<T>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      haystack: readonly T[] | ReadonlySet<T> | ReadonlyMap<any, T>,
      needle: T,
    ) => void) &
    (<T extends object>(haystack: WeakSet<T>, needle: T) => void) &
    (<T>(haystack: T, needle: Partial<T>) => void);

  /**
   * Asserts that haystack does not include needle.
   *
   * @param haystack   Container string.
   * @param needle   Potential substring of haystack.
   */
  notInclude: ((haystack: string, needle: string) => void) &
    (<T>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      haystack: readonly T[] | ReadonlySet<T> | ReadonlyMap<any, T>,
      needle: T,
    ) => void) &
    (<T extends object>(haystack: WeakSet<T>, needle: T) => void) &
    (<T>(haystack: T, needle: Partial<T>) => void);

  /**
   * Asserts that haystack includes needle. Deep equality is used.
   *
   * @param haystack   Container string.
   * @param needle   Potential substring of haystack.
   *
   * @deprecated Does not have any effect on string. Use {@link Assert#include} instead.
   */
  deepInclude: ((haystack: string, needle: string) => void) &
    (<T>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      haystack: readonly T[] | ReadonlySet<T> | ReadonlyMap<any, T>,
      needle: T,
    ) => void) &
    (<T>(
      haystack: T,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      needle: T extends WeakSet<any> ? never : Partial<T>,
    ) => void);

  /**
   * Asserts that haystack does not include needle. Deep equality is used.
   *
   * @param haystack   Container string.
   * @param needle   Potential substring of haystack.
   *
   * @deprecated Does not have any effect on string. Use {@link Assert#notInclude} instead.
   */
  notDeepInclude: ((haystack: string, needle: string) => void) &
    (<T>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      haystack: readonly T[] | ReadonlySet<T> | ReadonlyMap<any, T>,
      needle: T,
    ) => void) &
    (<T>(
      haystack: T,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      needle: T extends WeakSet<any> ? never : Partial<T>,
    ) => void);

  /**
   * Asserts that ‘haystack’ includes ‘needle’. Can be used to assert the inclusion of a subset of properties in an object.
   *
   * Enables the use of dot- and bracket-notation for referencing nested properties.
   * ‘[]’ and ‘.’ in property names can be escaped using double backslashes.Asserts that ‘haystack’ includes ‘needle’.
   * Can be used to assert the inclusion of a subset of properties in an object.
   * Enables the use of dot- and bracket-notation for referencing nested properties.
   * ‘[]’ and ‘.’ in property names can be escaped using double backslashes.
   *
   * @param haystack
   * @param needle
   */
  nestedInclude: (haystack: unknown, needle: unknown) => void;

  /**
   * Asserts that ‘haystack’ does not include ‘needle’. Can be used to assert the absence of a subset of properties in an object.
   *
   * Enables the use of dot- and bracket-notation for referencing nested properties.
   * ‘[]’ and ‘.’ in property names can be escaped using double backslashes.Asserts that ‘haystack’ includes ‘needle’.
   * Can be used to assert the inclusion of a subset of properties in an object.
   * Enables the use of dot- and bracket-notation for referencing nested properties.
   * ‘[]’ and ‘.’ in property names can be escaped using double backslashes.
   *
   * @param haystack
   * @param needle
   */
  notNestedInclude: (haystack: unknown, needle: unknown) => void;

  /**
   * Asserts that ‘haystack’ includes ‘needle’. Can be used to assert the inclusion of a subset of properties in an object while checking for deep equality
   *
   * Enables the use of dot- and bracket-notation for referencing nested properties.
   * ‘[]’ and ‘.’ in property names can be escaped using double backslashes.Asserts that ‘haystack’ includes ‘needle’.
   * Can be used to assert the inclusion of a subset of properties in an object.
   * Enables the use of dot- and bracket-notation for referencing nested properties.
   * ‘[]’ and ‘.’ in property names can be escaped using double backslashes.
   *
   * @param haystack
   * @param needle
   */
  deepNestedInclude: (haystack: unknown, needle: unknown) => void;

  /**
   * Asserts that ‘haystack’ does not include ‘needle’. Can be used to assert the absence of a subset of properties in an object while checking for deep equality.
   *
   * Enables the use of dot- and bracket-notation for referencing nested properties.
   * ‘[]’ and ‘.’ in property names can be escaped using double backslashes.Asserts that ‘haystack’ includes ‘needle’.
   * Can be used to assert the inclusion of a subset of properties in an object.
   * Enables the use of dot- and bracket-notation for referencing nested properties.
   * ‘[]’ and ‘.’ in property names can be escaped using double backslashes.
   *
   * @param haystack
   * @param needle
   */
  notDeepNestedInclude: (haystack: unknown, needle: unknown) => void;

  /**
   * Asserts that ‘haystack’ includes ‘needle’. Can be used to assert the inclusion of a subset of properties in an object while ignoring inherited properties.
   *
   * @param haystack
   * @param needle
   */
  ownInclude: (haystack: unknown, needle: unknown) => void;

  /**
   * Asserts that ‘haystack’ includes ‘needle’. Can be used to assert the absence of a subset of properties in an object while ignoring inherited properties.
   *
   * @param haystack
   * @param needle
   */
  notOwnInclude: (haystack: unknown, needle: unknown) => void;

  /**
   * Asserts that ‘haystack’ includes ‘needle’. Can be used to assert the inclusion of a subset of properties in an object while ignoring inherited properties and checking for deep
   *
   * @param haystack
   * @param needle
   */
  deepOwnInclude: (haystack: unknown, needle: unknown) => void;

  /**
   * Asserts that ‘haystack’ includes ‘needle’. Can be used to assert the absence of a subset of properties in an object while ignoring inherited properties and checking for deep equality.
   *
   * @param haystack
   * @param needle
   */
  notDeepOwnInclude: (haystack: unknown, needle: unknown) => void;

  /**
   * Asserts that value matches the regular expression regexp.
   *
   * @param value   Actual value.
   * @param regexp   Potential match of value.
   */
  match: (value: string, regexp: RegExp) => void;

  /**
   * Asserts that value does not match the regular expression regexp.
   *
   * @param value   Actual value.
   * @param regexp   Potential match of value.
   */
  notMatch: (expected: unknown, regexp: RegExp) => void;

  /**
   * Asserts that object has a property named by property.
   *
   * T   Type of object.
   * @param object   Container object.
   * @param property   Potential contained property of object.
   */
  property: <T>(object: T, property: string /* keyof T */) => void;

  /**
   * Asserts that object does not have a property named by property.
   *
   * T   Type of object.
   * @param object   Container object.
   * @param property   Potential contained property of object.
   */
  notProperty: <T>(object: T, property: string /* keyof T */) => void;

  /**
   * Asserts that object has a property named by property, which can be a string
   * using dot- and bracket-notation for deep reference.
   *
   * T   Type of object.
   * @param object   Container object.
   * @param property   Potential contained property of object.
   */
  deepProperty: <T>(object: T, property: string) => void;

  /**
   * Asserts that object does not have a property named by property, which can be a
   * string using dot- and bracket-notation for deep reference.
   *
   * T   Type of object.
   * @param object   Container object.
   * @param property   Potential contained property of object.
   */
  notDeepProperty: <T>(object: T, property: string) => void;

  /**
   * Asserts that object has a property named by property with value given by value.
   *
   * T   Type of object.
   * V   Type of value.
   * @param object   Container object.
   * @param property   Potential contained property of object.
   * @param value   Potential expected property value.
   */
  propertyVal: <T, V>(
    object: T,
    property: string /* keyof T */,
    value: V,
  ) => void;

  /**
   * Asserts that object has a property named by property with value given by value.
   *
   * T   Type of object.
   * V   Type of value.
   * @param object   Container object.
   * @param property   Potential contained property of object.
   * @param value   Potential expected property value.
   */
  notPropertyVal: <T, V>(
    object: T,
    property: string /* keyof T */,
    value: V,
  ) => void;

  /**
   * Asserts that object has a property named by property, which can be a string
   * using dot- and bracket-notation for deep reference.
   *
   * T   Type of object.
   * V   Type of value.
   * @param object   Container object.
   * @param property   Potential contained property of object.
   * @param value   Potential expected property value.
   */
  deepPropertyVal: <T, V>(object: T, property: string, value: V) => void;

  /**
   * Asserts that object does not have a property named by property, which can be a
   * string using dot- and bracket-notation for deep reference.
   *
   * T   Type of object.
   * V   Type of value.
   * @param object   Container object.
   * @param property   Potential contained property of object.
   * @param value   Potential expected property value.
   */
  notDeepPropertyVal: <T, V>(object: T, property: string, value: V) => void;

  /**
   * Asserts that object has a length property with the expected value.
   *
   * T   Type of object.
   * @param object   Container object.
   * @param length   Potential expected length of object.
   */
  lengthOf: <
    T extends
      | Readonly<{ length?: number | undefined }>
      | Readonly<{ size?: number | undefined }>,
  >(
    object: T,
    length: number,
  ) => void;

  /**
   * Asserts that fn will throw an error.
   *
   * @param fn   Function that may throw.
   * @param errMsgMatcher   Expected error message matcher.
   * @param ignored   Ignored parameter.
   */
  throw: ((
    fn: () => void,
    errMsgMatcher?: RegExp | string,
    ignored?: unknown,
  ) => void) &
    ((
      fn: () => void,
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      errorLike?: ErrorConstructor | Error | null,
      errMsgMatcher?: RegExp | string | null,
    ) => void);

  /**
   * Asserts that fn will throw an error.
   *
   * @param fn   Function that may throw.
   * @param errMsgMatcher   Expected error message matcher.
   * @param ignored   Ignored parameter.
   */
  throws: ((
    fn: () => void,
    errMsgMatcher?: RegExp | string,
    ignored?: unknown,
  ) => void) &
    ((
      fn: () => void,
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      errorLike?: ErrorConstructor | Error | null,
      errMsgMatcher?: RegExp | string | null,
    ) => void);

  /**
   * Asserts that fn will throw an error.
   *
   * @param fn   Function that may throw.
   * @param errMsgMatcher   Expected error message matcher.
   * @param ignored   Ignored parameter.
   */
  Throw: ((
    fn: () => void,
    errMsgMatcher?: RegExp | string,
    ignored?: unknown,
  ) => void) &
    ((
      fn: () => void,
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      errorLike?: ErrorConstructor | Error | null,
      errMsgMatcher?: RegExp | string | null,
    ) => void);

  /**
   * Asserts that fn will not throw an error.
   *
   * @param fn   Function that may throw.
   * @param errMsgMatcher   Expected error message matcher.
   * @param ignored   Ignored parameter.
   */
  doesNotThrow: ((
    fn: () => void,
    errMsgMatcher?: RegExp | string,
    ignored?: unknown,
  ) => void) &
    ((
      fn: () => void,
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      errorLike?: ErrorConstructor | Error | null,
      errMsgMatcher?: RegExp | string | null,
    ) => void);

  /**
   * Compares two values using operator.
   *
   * @param val1   Left value during comparison.
   * @param operator   Comparison operator.
   * @param val2   Right value during comparison.
   */
  operator: (
    val1: OperatorComparable,
    operator: Operator,
    val2: OperatorComparable,
  ) => void;

  /**
   * Asserts that the target is equal to expected, to within a +/- delta range.
   *
   * @param actual   Actual value
   * @param expected   Potential expected value.
   * @param delta   Maximum difference between values.
   */
  closeTo: (actual: number, expected: number, delta: number) => void;

  /**
   * Asserts that the target is equal to expected, to within a +/- delta range.
   *
   * @param actual   Actual value
   * @param expected   Potential expected value.
   * @param delta   Maximum difference between values.
   */
  approximately: (act: number, exp: number, delta: number) => void;

  /**
   * Asserts that set1 and set2 have the same members. Order is not take into account.
   *
   * T   Type of set values.
   * @param set1   Actual set of values.
   * @param set2   Potential expected set of values.
   */
  sameMembers: <T>(set1: readonly T[], set2: readonly T[]) => void;

  /**
   * Asserts that set1 and set2 have the same members using deep equality checking.
   * Order is not take into account.
   *
   * T   Type of set values.
   * @param set1   Actual set of values.
   * @param set2   Potential expected set of values.
   */
  sameDeepMembers: <T>(set1: readonly T[], set2: readonly T[]) => void;

  /**
   * Asserts that `set1` and `set2` don't have the same members in any order.
   * Uses a deep equality check.
   *
   *  T   Type of set values.
   * @param set1
   * @param set2
   */
  notSameDeepMembers: <T>(set1: readonly T[], set2: readonly T[]) => void;

  /**
   * Asserts that set1 and set2 have the same members in the same order.
   * Uses a strict equality check (===).
   *
   * T   Type of set values.
   * @param set1   Actual set of values.
   * @param set2   Potential expected set of values.
   */
  sameOrderedMembers: <T>(set1: readonly T[], set2: readonly T[]) => void;

  /**
   * Asserts that set1 and set2 don’t have the same members in the same order.
   * Uses a strict equality check (===).
   *
   * T   Type of set values.
   * @param set1   Actual set of values.
   * @param set2   Potential expected set of values.
   */
  notSameOrderedMembers: <T>(set1: readonly T[], set2: readonly T[]) => void;

  /**
   * Asserts that set1 and set2 have the same members in the same order.
   * Uses a deep equality check.
   *
   * T   Type of set values.
   * @param set1   Actual set of values.
   * @param set2   Potential expected set of values.
   */
  sameDeepOrderedMembers: <T>(set1: readonly T[], set2: readonly T[]) => void;

  /**
   * Asserts that set1 and set2 don’t have the same members in the same order.
   * Uses a deep equality check.
   *
   * T   Type of set values.
   * @param set1   Actual set of values.
   * @param set2   Potential expected set of values.
   */
  notSameDeepOrderedMembers: <T>(
    set1: readonly T[],
    set2: readonly T[],
  ) => void;

  /**
   * Asserts that subset is included in superset in the same order beginning with the first element in superset.
   * Uses a strict equality check (===).
   *
   * T   Type of set values.
   * @param superset   Actual set of values.
   * @param subset   Potential contained set of values.
   */
  includeOrderedMembers: <T>(
    superset: readonly T[],
    subset: readonly T[],
  ) => void;

  /**
   * Asserts that subset isn’t included in superset in the same order beginning with the first element in superset.
   * Uses a strict equality check (===).
   *
   * T   Type of set values.
   * @param superset   Actual set of values.
   * @param subset   Potential contained set of values.
   */
  notIncludeOrderedMembers: <T>(
    superset: readonly T[],
    subset: readonly T[],
  ) => void;

  /**
   * Asserts that subset is included in superset in the same order beginning with the first element in superset.
   * Uses a deep equality check.
   *
   * T   Type of set values.
   * @param superset   Actual set of values.
   * @param subset   Potential contained set of values.
   */
  includeDeepOrderedMembers: <T>(
    superset: readonly T[],
    subset: readonly T[],
  ) => void;

  /**
   * Asserts that subset isn’t included in superset in the same order beginning with the first element in superset.
   * Uses a deep equality check.
   *
   * T   Type of set values.
   * @param superset   Actual set of values.
   * @param subset   Potential contained set of values.
   */
  notIncludeDeepOrderedMembers: <T>(
    superset: readonly T[],
    subset: readonly T[],
  ) => void;

  /**
   * Asserts that subset is included in superset. Order is not take into account.
   *
   * T   Type of set values.
   * @param superset   Actual set of values.
   * @param subset   Potential contained set of values.
   */
  includeMembers: <T>(superset: readonly T[], subset: readonly T[]) => void;

  /**
   * Asserts that subset isn’t included in superset in any order.
   * Uses a strict equality check (===). Duplicates are ignored.
   *
   * T   Type of set values.
   * @param superset   Actual set of values.
   * @param subset   Potential not contained set of values.
   */
  notIncludeMembers: <T>(superset: readonly T[], subset: readonly T[]) => void;

  /**
   * Asserts that subset is included in superset using deep equality checking.
   * Order is not take into account.
   *
   * T   Type of set values.
   * @param superset   Actual set of values.
   * @param subset   Potential contained set of values.
   */
  includeDeepMembers: <T>(superset: readonly T[], subset: readonly T[]) => void;

  /**
   * Asserts that `subset` isn't included in `superset` in any order. Uses a
   * deep equality check. Duplicates are ignored.
   *
   * assert.notIncludeDeepMembers([ { a: 1 }, { b: 2 }, { c: 3 } ], [ { b: 2 }, { f: 5 } ], 'not include deep members');
   *
   * T   Type of set values.
   * @param superset   Actual set of values.
   * @param subset   Potential contained set of values.
   */
  notIncludeDeepMembers: <T>(
    superset: readonly T[],
    subset: readonly T[],
  ) => void;

  /**
   * Asserts that non-object, non-array value inList appears in the flat array list.
   *
   * T   Type of list values.
   * @param inList   Value expected to be in the list.
   * @param list   List of values.
   */
  oneOf: <T>(inList: T, list: readonly T[]) => void;

  /**
   * Asserts that a function changes the value of a property.
   *
   * T   Type of object.
   * @param modifier   Function to run.
   * @param object   Container object.
   * @param property   Property of object expected to be modified.
   */
  changes: <T>(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    modifier: Function,
    object: T,
    property: string /* keyof T */,
  ) => void;

  /**
   * Asserts that a function changes the value of a property by an amount (delta).
   *
   * @param modifier function
   * @param object or getter function
   * @param property name _optional_
   * @param change amount (delta)
   */
  changesBy: (<T>(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    modifier: Function,
    object: T,
    property: string /* keyof T */,
    change: number,
  ) => void) &
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    (<T>(modifier: Function, object: T, change: number) => void);

  /**
   * Asserts that a function does not change the value of a property.
   *
   * T   Type of object.
   * @param modifier   Function to run.
   * @param object   Container object.
   * @param property   Property of object expected not to be modified.
   */
  doesNotChange: <T>(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    modifier: Function,
    object: T,
    property: string /* keyof T */,
  ) => void;

  /**
   * Asserts that a function increases an object property.
   *
   * T   Type of object.
   * @param modifier   Function to run.
   * @param object   Container object.
   * @param property   Property of object expected to be increased.
   */
  increases: <T>(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    modifier: Function,
    object: T,
    property: string /* keyof T */,
  ) => void;

  /**
   * Asserts that a function increases a numeric object property or a function's return value by an amount (delta).
   *
   * T   Type of object or function.
   * @param modifier function
   * @param object or getter function
   * @param property name _optional_
   * @param change amount (delta)
   */
  increasesBy: (<T>(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    modifier: Function,
    object: T,
    property: string /* keyof T */,
    change: number,
  ) => void) &
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    (<T>(modifier: Function, object: T, change: number) => void);

  /**
   * Asserts that a function does not increase an object property.
   *
   * T   Type of object.
   * @param modifier   Function to run.
   * @param object   Container object.
   * @param property   Property of object expected not to be increased.
   */
  doesNotIncrease: <T>(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    modifier: Function,
    object: T,
    property: string /* keyof T */,
  ) => void;

  /**
   * Asserts that a function does not increase a numeric object property or function's return value by an amount (delta).
   *
   * T   Type of object or function.
   * @param modifier function
   * @param object or getter function
   * @param property name _optional_
   * @param change amount (delta)
   */

  increasesButNotBy: (<T>(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    modifier: Function,
    object: T,
    property: string /* keyof T */,
    change: number,
  ) => void) &
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    (<T>(modifier: Function, object: T, change: number) => void);

  /**
   * Asserts that a function decreases an object property.
   *
   * T   Type of object.
   * @param modifier   Function to run.
   * @param object   Container object.
   * @param property   Property of object expected to be decreased.
   */
  decreases: <T>(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    modifier: Function,
    object: T,
    property: string /* keyof T */,
  ) => void;

  /**
   * Asserts that a function decreases a numeric object property or a function's return value by an amount (delta)
   *
   * T   Type of object or function.
   * @param modifier function
   * @param object or getter function
   * @param property name _optional_
   * @param change amount (delta)
   */

  decreasesBy: (<T>(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    modifier: Function,
    object: T,
    property: string /* keyof T */,
    change: number,
  ) => void) &
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    (<T>(modifier: Function, object: T, change: number) => void);

  /**
   * Asserts that a function does not decrease an object property.
   *
   * T   Type of object.
   * @param modifier   Function to run.
   * @param object   Container object.
   * @param property   Property of object expected not to be decreased.
   */
  doesNotDecrease: <T>(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    modifier: Function,
    object: T,
    property: string /* keyof T */,
  ) => void;

  /**
   * Asserts that a function does not decreases a numeric object property or a function's return value by an amount (delta)
   *
   * T   Type of object or function.
   * @param modifier function
   * @param object or getter function
   * @param property name _optional_
   * @param change amount (delta)
   */

  doesNotDecreaseBy: (<T>(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    modifier: Function,
    object: T,
    property: string /* keyof T */,
    change: number,
  ) => void) &
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    (<T>(modifier: Function, object: T, change: number) => void);

  /**
   * Asserts that a function does not decreases a numeric object property or a function's return value by an amount (delta)
   *
   * T   Type of object or function.
   * @param modifier function
   * @param object or getter function
   * @param property name _optional_
   * @param change amount (delta)
   */

  decreasesButNotBy: (<T>(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    modifier: Function,
    object: T,
    property: string /* keyof T */,
    change: number,
  ) => void) &
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    (<T>(modifier: Function, object: T, change: number) => void);

  /**
   * Asserts if value is not a false value, and throws if it is a true value.
   *
   * T   Type of object.
   * @param object   Actual value.
   * @remarks This is added to allow for chai to be a drop-in replacement for
   *          Node’s assert class.
   */
  ifError: <T>(object: T) => void;

  /**
   * Asserts that object is extensible (can have new properties added to it).
   *
   * T   Type of object
   * @param object   Actual value.
   */
  isExtensible: <T>(object: T) => void;

  /**
   * Asserts that object is extensible (can have new properties added to it).
   *
   * T   Type of object
   * @param object   Actual value.
   */
  extensible: <T>(object: T) => void;

  /**
   * Asserts that object is not extensible.
   *
   * T   Type of object
   * @param object   Actual value.
   */
  isNotExtensible: <T>(object: T) => void;

  /**
   * Asserts that object is not extensible.
   *
   * T   Type of object
   * @param object   Actual value.
   */
  notExtensible: <T>(object: T) => void;

  /**
   * Asserts that object is sealed (can have new properties added to it
   * and its existing properties cannot be removed).
   *
   * T   Type of object
   * @param object   Actual value.
   */
  isSealed: <T>(object: T) => void;

  /**
   * Asserts that object is sealed (can have new properties added to it
   * and its existing properties cannot be removed).
   *
   * T   Type of object
   * @param object   Actual value.
   */
  sealed: <T>(object: T) => void;

  /**
   * Asserts that object is not sealed.
   *
   * T   Type of object
   * @param object   Actual value.
   */
  isNotSealed: <T>(object: T) => void;

  /**
   * Asserts that object is not sealed.
   *
   * T   Type of object
   * @param object   Actual value.
   */
  notSealed: <T>(object: T) => void;

  /**
   * Asserts that object is frozen (cannot have new properties added to it
   * and its existing properties cannot be removed).
   *
   * T   Type of object
   * @param object   Actual value.
   */
  isFrozen: <T>(object: T) => void;

  /**
   * Asserts that object is frozen (cannot have new properties added to it
   * and its existing properties cannot be removed).
   *
   * T   Type of object
   * @param object   Actual value.
   */
  frozen: <T>(object: T) => void;

  /**
   * Asserts that object is not frozen (cannot have new properties added to it
   * and its existing properties cannot be removed).
   *
   * T   Type of object
   * @param object   Actual value.
   */
  isNotFrozen: <T>(object: T) => void;

  /**
   * Asserts that object is not frozen (cannot have new properties added to it
   * and its existing properties cannot be removed).
   *
   * T   Type of object
   * @param object   Actual value.
   */
  notFrozen: <T>(object: T) => void;

  /**
   * Asserts that the target does not contain any values. For arrays and
   * strings, it checks the length property. For Map and Set instances, it
   * checks the size property. For non-function objects, it gets the count
   * of own enumerable string keys.
   *
   * T   Type of object
   * @param object   Actual value.
   */
  isEmpty: <T>(object: T) => void;

  /**
   * Asserts that the target contains values. For arrays and strings, it checks
   * the length property. For Map and Set instances, it checks the size property.
   * For non-function objects, it gets the count of own enumerable string keys.
   *
   * T   Type of object.
   * @param object   Object to test.
   */
  isNotEmpty: <T>(object: T) => void;

  /**
   * Asserts that `object` has at least one of the `keys` provided.
   * You can also provide a single object instead of a `keys` array and its keys
   * will be used as the expected set of keys.
   *
   * T   Type of object.
   * @param object   Object to test.
   * @param keys   Keys to check
   */
  hasAnyKeys: <T>(
    object: T,
    keys: readonly (object | string)[] | Readonly<Record<string, unknown>>,
  ) => void;

  /**
   * Asserts that `object` has all and only all of the `keys` provided.
   * You can also provide a single object instead of a `keys` array and its keys
   * will be used as the expected set of keys.
   *
   * T   Type of object.
   * @param object   Object to test.
   * @param keys   Keys to check
   */
  hasAllKeys: <T>(
    object: T,
    keys: readonly (object | string)[] | Readonly<Record<string, unknown>>,
  ) => void;

  /**
   * Asserts that `object` has all of the `keys` provided but may have more keys not listed.
   * You can also provide a single object instead of a `keys` array and its keys
   * will be used as the expected set of keys.
   *
   * T   Type of object.
   * @param object   Object to test.
   * @param keys   Keys to check
   */
  containsAllKeys: <T>(
    object: T,
    keys: readonly (object | string)[] | Readonly<Record<string, unknown>>,
  ) => void;

  /**
   * Asserts that `object` has none of the `keys` provided.
   * You can also provide a single object instead of a `keys` array and its keys
   * will be used as the expected set of keys.
   *
   * T   Type of object.
   * @param object   Object to test.
   * @param keys   Keys to check
   */
  doesNotHaveAnyKeys: <T>(
    object: T,
    keys: readonly (object | string)[] | Readonly<Record<string, unknown>>,
  ) => void;

  /**
   * Asserts that `object` does not have at least one of the `keys` provided.
   * You can also provide a single object instead of a `keys` array and its keys
   * will be used as the expected set of keys.
   *
   * T   Type of object.
   * @param object   Object to test.
   * @param keys   Keys to check
   */
  doesNotHaveAllKeys: <T>(
    object: T,
    keys: readonly (object | string)[] | Readonly<Record<string, unknown>>,
  ) => void;

  /**
   * Asserts that `object` has at least one of the `keys` provided.
   * Since Sets and Maps can have objects as keys you can use this assertion to perform
   * a deep comparison.
   * You can also provide a single object instead of a `keys` array and its keys
   * will be used as the expected set of keys.
   *
   * T   Type of object.
   * @param object   Object to test.
   * @param keys   Keys to check
   */
  hasAnyDeepKeys: <T>(
    object: T,
    keys: readonly (object | string)[] | Readonly<Record<string, unknown>>,
  ) => void;

  /**
   * Asserts that `object` has all and only all of the `keys` provided.
   * Since Sets and Maps can have objects as keys you can use this assertion to perform
   * a deep comparison.
   * You can also provide a single object instead of a `keys` array and its keys
   * will be used as the expected set of keys.
   *
   * T   Type of object.
   * @param object   Object to test.
   * @param keys   Keys to check
   */
  hasAllDeepKeys: <T>(
    object: T,
    keys: readonly (object | string)[] | Readonly<Record<string, unknown>>,
  ) => void;

  /**
   * Asserts that `object` contains all of the `keys` provided.
   * Since Sets and Maps can have objects as keys you can use this assertion to perform
   * a deep comparison.
   * You can also provide a single object instead of a `keys` array and its keys
   * will be used as the expected set of keys.
   *
   * T   Type of object.
   * @param object   Object to test.
   * @param keys   Keys to check
   */
  containsAllDeepKeys: <T>(
    object: T,
    keys: readonly (object | string)[] | Readonly<Record<string, unknown>>,
  ) => void;

  /**
   * Asserts that `object` contains all of the `keys` provided.
   * Since Sets and Maps can have objects as keys you can use this assertion to perform
   * a deep comparison.
   * You can also provide a single object instead of a `keys` array and its keys
   * will be used as the expected set of keys.
   *
   * T   Type of object.
   * @param object   Object to test.
   * @param keys   Keys to check
   */
  doesNotHaveAnyDeepKeys: <T>(
    object: T,
    keys: readonly (object | string)[] | Readonly<Record<string, unknown>>,
  ) => void;

  /**
   * Asserts that `object` contains all of the `keys` provided.
   * Since Sets and Maps can have objects as keys you can use this assertion to perform
   * a deep comparison.
   * You can also provide a single object instead of a `keys` array and its keys
   * will be used as the expected set of keys.
   *
   * T   Type of object.
   * @param object   Object to test.
   * @param keys   Keys to check
   */
  doesNotHaveAllDeepKeys: <T>(
    object: T,
    keys: readonly (object | string)[] | Readonly<Record<string, unknown>>,
  ) => void;

  /**
   * Asserts that object has a direct or inherited property named by property,
   * which can be a string using dot- and bracket-notation for nested reference.
   *
   * T   Type of object.
   * @param object   Object to test.
   * @param property    Property to test.
   */
  nestedProperty: <T>(object: T, property: string) => void;

  /**
   * Asserts that object does not have a property named by property,
   * which can be a string using dot- and bracket-notation for nested reference.
   * The property cannot exist on the object nor anywhere in its prototype chain.
   *
   * T   Type of object.
   * @param object   Object to test.
   * @param property    Property to test.
   */
  notNestedProperty: <T>(object: T, property: string) => void;

  /**
   * Asserts that object has a property named by property with value given by value.
   * property can use dot- and bracket-notation for nested reference. Uses a strict equality check (===).
   *
   * T   Type of object.
   * @param object   Object to test.
   * @param property    Property to test.
   * @param value    Value to test.
   */
  nestedPropertyVal: <T>(object: T, property: string, value: unknown) => void;

  /**
   * Asserts that object does not have a property named by property with value given by value.
   * property can use dot- and bracket-notation for nested reference. Uses a strict equality check (===).
   *
   * T   Type of object.
   * @param object   Object to test.
   * @param property    Property to test.
   * @param value    Value to test.
   */
  notNestedPropertyVal: <T>(
    object: T,
    property: string,
    value: unknown,
  ) => void;

  /**
   * Asserts that object has a property named by property with a value given by value.
   * property can use dot- and bracket-notation for nested reference. Uses a deep equality check.
   *
   * T   Type of object.
   * @param object   Object to test.
   * @param property    Property to test.
   * @param value    Value to test.
   */
  deepNestedPropertyVal: <T>(
    object: T,
    property: string,
    value: unknown,
  ) => void;

  /**
   * Asserts that object does not have a property named by property with value given by value.
   * property can use dot- and bracket-notation for nested reference. Uses a deep equality check.
   *
   * T   Type of object.
   * @param object   Object to test.
   * @param property    Property to test.
   * @param value    Value to test.
   */
  notDeepNestedPropertyVal: <T>(
    object: T,
    property: string,
    value: unknown,
  ) => void;
}>;
