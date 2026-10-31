/* cSpell:disable */
import type { Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * @description Ensure all properties are destructured from an object when explicitly requested
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace CheckDestructuringCompleteness {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "alwaysCheckReactComponentProps": {
   *         "type": "boolean",
   *         "description": "Always check React component props destructuring without directive keyword"
   *       },
   *       "directiveKeyword": {
   *         "type": "string",
   *         "description": "Custom directive keyword to enable checking (default: \"@check-destructuring-completeness\")"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Always check React component props destructuring without directive keyword
     */
    alwaysCheckReactComponentProps?: boolean;
    /**
     * Custom directive keyword to enable checking (default: "@check-destructuring-completeness")
     */
    directiveKeyword?: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Require explicit type arguments on `new Set` / `new Map` / `new WeakSet` / `new WeakMap` called with no argument or an array literal
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace ExplicitCollectionTypeArguments {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Require a module's exported functions before its non-exported helpers, and a helper before the helpers that call it
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace FunctionOrder {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Require booleans on both sides of `&&` and `||` whose value is rendered or passed in JSX, and write the rest as a ternary (`{a && <X />}` → `{a ? <X /> : undefined}`).
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  | fixable    | code    |
 *  ```
 */
namespace JsxBooleanLogicalOperands {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Invert the operator of a negated comparison instead of negating it (`!(a === b)` → `a !== b`, `!(a < b)` → `a >= b` when no operand can be NaN).
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace NoNegatedComparison {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow a comment paragraph wrapped unevenly: a line with room for the first word of the line after it
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace NoRaggedCommentWrap {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "printWidth": {
   *         "type": "integer",
   *         "minimum": 1,
   *         "description": "The width to wrap comments at (default: the nearest JSON Prettier configuration's `printWidth`, else 80)"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * The width to wrap comments at (default: the nearest JSON Prettier configuration's `printWidth`, else 80)
     */
    printWidth?: number;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow type assertions with specified type names
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  | fixable    | code    |
 *  ```
 */
namespace NoRestrictedCastName {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "array",
   *     "items": {
   *       "oneOf": [
   *         {
   *           "type": "string"
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "name": {
   *               "type": "string"
   *             },
   *             "fixWith": {
   *               "type": "object",
   *               "oneOf": [
   *                 {
   *                   "type": "object",
   *                   "properties": {
   *                     "kind": {
   *                       "type": "string",
   *                       "enum": [
   *                         "type"
   *                       ]
   *                     },
   *                     "name": {
   *                       "type": "string"
   *                     }
   *                   },
   *                   "required": [
   *                     "kind",
   *                     "name"
   *                   ],
   *                   "additionalProperties": false
   *                 },
   *                 {
   *                   "type": "object",
   *                   "properties": {
   *                     "kind": {
   *                       "type": "string",
   *                       "enum": [
   *                         "function"
   *                       ]
   *                     },
   *                     "name": {
   *                       "type": "string"
   *                     }
   *                   },
   *                   "required": [
   *                     "kind",
   *                     "name"
   *                   ],
   *                   "additionalProperties": false
   *                 }
   *               ]
   *             }
   *           },
   *           "required": [
   *             "name"
   *           ],
   *           "additionalProperties": false
   *         }
   *       ]
   *     },
   *     "uniqueItems": true,
   *     "minItems": 0
   *   }
   * ]
   * ```
   */
  /**
   * @minItems 0
   */
  export type Options = readonly (
    | string
    | Readonly<{
        name: string;
        fixWith?: Readonly<
          | {
              kind: 'type';
              name: string;
            }
          | {
              kind: 'function';
              name: string;
            }
        >;
      }>
  )[];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow specified syntax
 * @link https://eslint.org/docs/latest/rules/no-restricted-syntax
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoRestrictedSyntax {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "array",
   *     "items": {
   *       "oneOf": [
   *         {
   *           "type": "string"
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "selector": {
   *               "type": "string"
   *             },
   *             "message": {
   *               "type": "string"
   *             }
   *           },
   *           "required": [
   *             "selector"
   *           ],
   *           "additionalProperties": false
   *         }
   *       ]
   *     },
   *     "uniqueItems": true,
   *     "minItems": 0
   *   }
   * ]
   * ```
   */
  /**
   * @minItems 0
   */
  export type Options = readonly (
    | string
    | Readonly<{
        selector: string;
        message?: string;
      }>
  )[];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow spreading a `string` (e.g. `[...str]`), which silently splits it into characters and yields a `string[]` indistinguishable from spreading an array
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoStringSpread {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow wrapping an array in `Array.from()` before a non-mutating array method (e.g. `Array.from(x).toSorted()`), since the method already returns a new array
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace NoUnnecessaryArrayFrom {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Require the left-hand side of `?? undefined` to include `null` in its type, and remove the redundant `?? undefined` otherwise
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace NoUnnecessaryCoalesceUndefined {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Replace a redundant arrow wrapper with the function itself (`(a) => f(a)` → `f`) or, when the callee has a curried version, its curried form (`(a) => f(a, ...rest)` → `f(...rest)`).
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferCurriedCall {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Require a string that spans source lines to be a tagged template (e.g. `` dedent`...` ``) rather than a bare multi-line template literal, whose value carries whatever indentation the source happens to have
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace PreferDedent {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `globalThis` over `window`, `self` and `global` (`unicorn/prefer-global-this`), except for members `typeof globalThis` lacks — under the strict standard library, a window's own globals such as `history`
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferGlobalThis {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Replace a ternary with one boolean literal branch by `&&` or `||` (`a ? false : b` → `!a && b`, `a ? true : b` → `a || b`).
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferLogicalOverBooleanTernary {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow calling a mutating array method on a defensive `Array.from()` copy of an array (e.g. `Array.from(x).sort()`); use the non-mutating counterpart on the original array instead (e.g. `x.toSorted()`)
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferNonMutatingArrayMethod {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce `??` over `||` (and `??=` over `||=`) for defaulting when the operand types prove the replacement cannot change the behavior (e.g. `<string | undefined> || ""`), and remove `|| <fallback>` entirely when a never-nullish left-hand side makes it redundant (e.g. `<string> || ""`)
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferNullishCoalescingWhenSafe {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Replace a ternary that yields `undefined` for a nullish value and an access on it otherwise by an optional chain (`x == null ? undefined : x.b` → `x?.b`).
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferOptionalChainOverTernary {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Write a range check in the order of the number line (`x >= min && max >= x` → `min <= x && x <= max`, `min > x || x > max` → `x < min || max < x`).
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferRangeInNumberLineOrder {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer ternary expressions over `if` statements, and chains of them, that only choose what to return or assign.
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferTernary {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "enum": [
   *       "always",
   *       "only-single-line"
   *     ],
   *     "description": "Whether to always prefer ternary, or only when every test and branch is on one line."
   *   }
   * ]
   * ```
   */
  /**
   * Whether to always prefer ternary, or only when every test and branch is on one line.
   */
  export type Options = 'always' | 'only-single-line';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

export type EslintTsRestrictionsRules = Readonly<{
  'ts-restrictions/check-destructuring-completeness': CheckDestructuringCompleteness.RuleEntry;
  'ts-restrictions/explicit-collection-type-arguments': ExplicitCollectionTypeArguments.RuleEntry;
  'ts-restrictions/function-order': FunctionOrder.RuleEntry;
  'ts-restrictions/jsx-boolean-logical-operands': JsxBooleanLogicalOperands.RuleEntry;
  'ts-restrictions/no-negated-comparison': NoNegatedComparison.RuleEntry;
  'ts-restrictions/no-ragged-comment-wrap': NoRaggedCommentWrap.RuleEntry;
  'ts-restrictions/no-restricted-cast-name': NoRestrictedCastName.RuleEntry;
  'ts-restrictions/no-restricted-syntax': NoRestrictedSyntax.RuleEntry;
  'ts-restrictions/no-string-spread': NoStringSpread.RuleEntry;
  'ts-restrictions/no-unnecessary-array-from': NoUnnecessaryArrayFrom.RuleEntry;
  'ts-restrictions/no-unnecessary-coalesce-undefined': NoUnnecessaryCoalesceUndefined.RuleEntry;
  'ts-restrictions/prefer-curried-call': PreferCurriedCall.RuleEntry;
  'ts-restrictions/prefer-dedent': PreferDedent.RuleEntry;
  'ts-restrictions/prefer-global-this': PreferGlobalThis.RuleEntry;
  'ts-restrictions/prefer-logical-over-boolean-ternary': PreferLogicalOverBooleanTernary.RuleEntry;
  'ts-restrictions/prefer-non-mutating-array-method': PreferNonMutatingArrayMethod.RuleEntry;
  'ts-restrictions/prefer-nullish-coalescing-when-safe': PreferNullishCoalescingWhenSafe.RuleEntry;
  'ts-restrictions/prefer-optional-chain-over-ternary': PreferOptionalChainOverTernary.RuleEntry;
  'ts-restrictions/prefer-range-in-number-line-order': PreferRangeInNumberLineOrder.RuleEntry;
  'ts-restrictions/prefer-ternary': PreferTernary.RuleEntry;
}>;

export type EslintTsRestrictionsRulesOption = Readonly<{
  'ts-restrictions/check-destructuring-completeness': CheckDestructuringCompleteness.Options;
  'ts-restrictions/no-ragged-comment-wrap': NoRaggedCommentWrap.Options;
  'ts-restrictions/no-restricted-cast-name': NoRestrictedCastName.Options;
  'ts-restrictions/no-restricted-syntax': NoRestrictedSyntax.Options;
  'ts-restrictions/prefer-ternary': PreferTernary.Options;
}>;
