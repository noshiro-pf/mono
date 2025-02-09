/* cSpell:disable */
import { type Linter } from 'eslint';

/**
 * Prefer using the mapFn callback of Array.from over an immediate .map() call.
 *
 * ```md
 * | key         | value      |
 * | :---------- | :--------- |
 * | type        | suggestion |
 * | fixable     | code       |
 * | recommended | true       |
 * ```
 */
namespace FromMap {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Avoid the this parameter when providing arrow function as callback in array
 * functions.
 *
 * ```md
 * | key         | value      |
 * | :---------- | :--------- |
 * | type        | suggestion |
 * | fixable     | code       |
 * | recommended | true       |
 * ```
 */
namespace NoUnnecessaryThisArg {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prefer using Array.from over spreading an iterable in an array literal. Using
 * Array.from also preserves the original type of TypedArrays while mapping.
 *
 * ```md
 * | key         | value   |
 * | :---------- | :------ |
 * | type        | problem |
 * | fixable     | code    |
 * | recommended | true    |
 * ```
 */
namespace PreferArrayFrom {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prefer methods operating from the right over reversing the array
 *
 * ```md
 * | key         | value      |
 * | :---------- | :--------- |
 * | type        | suggestion |
 * | fixable     | code       |
 * | recommended | true       |
 * ```
 */
namespace AvoidReverse {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prefer using the flatMap over an immediate .flat() call after a .map().
 *
 * ```md
 * | key         | value      |
 * | :---------- | :--------- |
 * | type        | suggestion |
 * | fixable     | code       |
 * | recommended | true       |
 * ```
 */
namespace PreferFlatMap {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prefer using .flat() over concatenating to flatten an array.
 *
 * ```md
 * | key         | value      |
 * | :---------- | :--------- |
 * | type        | suggestion |
 * | fixable     | code       |
 * | recommended | true       |
 * ```
 */
namespace PreferFlat {
  export type RuleEntry = Linter.StringSeverity;
}

export type EslintArrayFuncRules = {
  readonly 'array-func/from-map': FromMap.RuleEntry;
  readonly 'array-func/no-unnecessary-this-arg': NoUnnecessaryThisArg.RuleEntry;
  readonly 'array-func/prefer-array-from': PreferArrayFrom.RuleEntry;
  readonly 'array-func/avoid-reverse': AvoidReverse.RuleEntry;
  readonly 'array-func/prefer-flat-map': PreferFlatMap.RuleEntry;
  readonly 'array-func/prefer-flat': PreferFlat.RuleEntry;
};
