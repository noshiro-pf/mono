/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * @description Unify non-mutating array element addition/removal patterns (`slice` / `toSpliced` / `filter` / `concat` / spread) into the corresponding ts-data-forge functions: `Arr.tail`, `Arr.skip`, `Arr.take`, `Arr.butLast`, `Arr.skipLast`, `Arr.takeLast`, `Arr.toUnshifted`, `Arr.toPushed`.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferCanonicalArraySlicing {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Replace `xs.length >= n` with `Arr.isMinLengthArray(xs, n)` from ts-data-forge.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferArrIsMinLengthArray {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Replace `xs.length <= n` with `Arr.isMaxLengthArray(xs, n)` from ts-data-forge.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferArrIsMaxLengthArray {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Replace `xs.length >= min && xs.length <= max` with `Arr.isBoundedLengthArray(xs, min, max)` from ts-data-forge.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferArrIsBoundedLengthArray {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Replace `xs.length === n` with `Arr.isFixedLengthArray(xs, n)` from ts-data-forge.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferArrIsFixedLengthArray {
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

/**
 * @description Replace `parseInt(x, 10)` with `Result.unwrapOkOr(Num.safeParseInt(x), Number.NaN)` from ts-data-forge.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferNumSafeParseInt {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Replace `parseFloat(x)`, `Number.parseFloat(x)`, or `Number(x)` (when x is a string) with `Result.unwrapOkOr(Num.safeParseFloat(x), Number.NaN)` from ts-data-forge.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferNumSafeParseFloat {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Detect ts-data-forge type guard calls that perform no narrowing (the argument type already satisfies, or can never satisfy, the guard).
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace NoUnnecessaryTypeGuard {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignore": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "description": "Names of ts-data-forge guard functions to skip checking."
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Names of ts-data-forge guard functions to skip checking.
     */
    ignore?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer a direct `=== null` / `!== undefined` comparison over calling `isNull`, `isNotNull`, `isUndefined`, or `isNotUndefined` with an explicit argument (those guards are intended for point-free use such as `xs.filter(isNotUndefined)`).
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferComparisonOverNullishGuard {
  export type RuleEntry = Linter.StringSeverity;
}

export type EslintTsDataForgeRules = Readonly<{
  'ts-data-forge/prefer-canonical-array-slicing': PreferCanonicalArraySlicing.RuleEntry;
  'ts-data-forge/prefer-arr-is-min-length-array': PreferArrIsMinLengthArray.RuleEntry;
  'ts-data-forge/prefer-arr-is-max-length-array': PreferArrIsMaxLengthArray.RuleEntry;
  'ts-data-forge/prefer-arr-is-bounded-length-array': PreferArrIsBoundedLengthArray.RuleEntry;
  'ts-data-forge/prefer-arr-is-fixed-length-array': PreferArrIsFixedLengthArray.RuleEntry;
  'ts-data-forge/prefer-arr-is-array': PreferArrIsArray.RuleEntry;
  'ts-data-forge/prefer-arr-is-non-empty': PreferArrIsNonEmpty.RuleEntry;
  'ts-data-forge/prefer-arr-sum': PreferArrSum.RuleEntry;
  'ts-data-forge/prefer-as-int': PreferAsInt.RuleEntry;
  'ts-data-forge/prefer-is-non-null-object': PreferIsNonNullObject.RuleEntry;
  'ts-data-forge/prefer-range-for-loop': PreferRangeForLoop.RuleEntry;
  'ts-data-forge/prefer-is-record-and-has-key': PreferIsRecordAndHasKey.RuleEntry;
  'ts-data-forge/prefer-num-safe-parse-int': PreferNumSafeParseInt.RuleEntry;
  'ts-data-forge/prefer-num-safe-parse-float': PreferNumSafeParseFloat.RuleEntry;
  'ts-data-forge/no-unnecessary-type-guard': NoUnnecessaryTypeGuard.RuleEntry;
  'ts-data-forge/prefer-comparison-over-nullish-guard': PreferComparisonOverNullishGuard.RuleEntry;
}>;

export type EslintTsDataForgeRulesOption = Readonly<{
  'ts-data-forge/no-unnecessary-type-guard': NoUnnecessaryTypeGuard.Options;
}>;
