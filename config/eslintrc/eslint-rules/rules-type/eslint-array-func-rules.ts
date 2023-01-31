/* cSpell:disable */
/* eslint-disable @typescript-eslint/sort-type-constituents */
import { type Linter } from 'eslint';

/**
 * @description Prefer using the mapFn callback of Array.from over an immediate .map() call.
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 */
namespace FromMap {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Avoid the this parameter when providing arrow function as callback in array functions.
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 */
namespace NoUnnecessaryThisArg {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer using Array.from over spreading an iterable in an array literal. Using Array.from also preserves the original type of TypedArrays while mapping.
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | fixable     | code    |
 *  | recommended | true    |
 */
namespace PreferArrayFrom {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer methods operating from the right over reversing the array
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 */
namespace AvoidReverse {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer using the flatMap over an immediate .flat() call after a .map().
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 */
namespace PreferFlatMap {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer using .flat() over concatenating to flatten an array.
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 */
namespace PreferFlat {
  export type RuleEntry = Linter.RuleLevel;
}

export type EslintArrayFuncRules = {
  readonly 'array-func/from-map': FromMap.RuleEntry;
  readonly 'array-func/no-unnecessary-this-arg': NoUnnecessaryThisArg.RuleEntry;
  readonly 'array-func/prefer-array-from': PreferArrayFrom.RuleEntry;
  readonly 'array-func/avoid-reverse': AvoidReverse.RuleEntry;
  readonly 'array-func/prefer-flat-map': PreferFlatMap.RuleEntry;
  readonly 'array-func/prefer-flat': PreferFlat.RuleEntry;
};
