/* cSpell:disable */
import { type Linter } from 'eslint';

/**
 * @description Replace `xs.length >= n` with `Arr.isArrayAtLeastLength(xs, n)` from ts-data-forge.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferArrIsArrayAtLeastLength {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Replace `xs.length === n` with `Arr.isArrayOfLength(xs, n)` from ts-data-forge.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferArrIsArrayOfLength {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Replace `Array.isArray` with `Arr.isArray` from ts-data-forge.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferArrIsArray {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Replace `xs.length > 0` with `Arr.isNonEmpty(xs)` from ts-data-forge.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferArrIsNonEmpty {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Replace `xs.reduce((a, b) => a + b, 0)` with `Arr.sum(xs)` or `Arr.sumBy(xs, fn)` from ts-data-forge.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferArrSum {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Replace branded number type assertions (e.g., `as Int`) with corresponding functions (e.g., `asInt()`) from ts-data-forge.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferAsInt {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Replace `typeof u === "object" && u !== null` with `isNonNullObject(u)` from ts-data-forge.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferIsNonNullObject {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Replace `for (let i = begin; i < end; ++i)` with `for (const i of range(begin, end))` from ts-data-forge.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferRangeForLoop {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Replace `Object.hasOwn(obj, key)` or `key in obj` with `isRecord(obj) && hasKey(obj, key)` from ts-data-forge
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferIsRecordAndHasKey {
  export type RuleEntry = Linter.StringSeverity;
}

export type EslintTsDataForgeRules = Readonly<{
  'ts-data-forge/prefer-arr-is-array-at-least-length': PreferArrIsArrayAtLeastLength.RuleEntry;
  'ts-data-forge/prefer-arr-is-array-of-length': PreferArrIsArrayOfLength.RuleEntry;
  'ts-data-forge/prefer-arr-is-array': PreferArrIsArray.RuleEntry;
  'ts-data-forge/prefer-arr-is-non-empty': PreferArrIsNonEmpty.RuleEntry;
  'ts-data-forge/prefer-arr-sum': PreferArrSum.RuleEntry;
  'ts-data-forge/prefer-as-int': PreferAsInt.RuleEntry;
  'ts-data-forge/prefer-is-non-null-object': PreferIsNonNullObject.RuleEntry;
  'ts-data-forge/prefer-range-for-loop': PreferRangeForLoop.RuleEntry;
  'ts-data-forge/prefer-is-record-and-has-key': PreferIsRecordAndHasKey.RuleEntry;
}>;
