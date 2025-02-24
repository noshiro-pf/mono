/* cSpell:disable */
import { type Linter } from 'eslint';
import { type RuleSeverityWithDefaultOption } from '../rule-severity-branded.mjs';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Prevent {...} as JSX prop value
 *
 * ```md
 * | key         | value |
 * | :---------- | :---- |
 * | deprecated  | false |
 * | recommended | true  |
 * ```
 */
namespace JsxNoNewObjectAsProp {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "nativeAllowList": {
   *         "oneOf": [
   *           {
   *             "enum": [
   *               "all"
   *             ]
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
   *             }
   *           }
   *         ]
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly nativeAllowList?: readonly string[] | 'all';
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Prevent [...] as JSX prop value
 *
 * ```md
 * | key         | value |
 * | :---------- | :---- |
 * | deprecated  | false |
 * | recommended | true  |
 * ```
 */
namespace JsxNoNewArrayAsProp {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "nativeAllowList": {
   *         "oneOf": [
   *           {
   *             "enum": [
   *               "all"
   *             ]
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
   *             }
   *           }
   *         ]
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly nativeAllowList?: readonly string[] | 'all';
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Prevent `function` as JSX prop value
 *
 * ```md
 * | key         | value |
 * | :---------- | :---- |
 * | deprecated  | false |
 * | recommended | true  |
 * ```
 */
namespace JsxNoNewFunctionAsProp {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "nativeAllowList": {
   *         "oneOf": [
   *           {
   *             "enum": [
   *               "all"
   *             ]
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
   *             }
   *           }
   *         ]
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly nativeAllowList?: readonly string[] | 'all';
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Prevent JSX as JSX prop value
 *
 * ```md
 * | key         | value |
 * | :---------- | :---- |
 * | deprecated  | false |
 * | recommended | true  |
 * ```
 */
namespace JsxNoJsxAsProp {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "nativeAllowList": {
   *         "oneOf": [
   *           {
   *             "enum": [
   *               "all"
   *             ]
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
   *             }
   *           }
   *         ]
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly nativeAllowList?: readonly string[] | 'all';
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

export type EslintReactPerfRules = {
  readonly 'react-perf/jsx-no-new-object-as-prop': JsxNoNewObjectAsProp.RuleEntry;
  readonly 'react-perf/jsx-no-new-array-as-prop': JsxNoNewArrayAsProp.RuleEntry;
  readonly 'react-perf/jsx-no-new-function-as-prop': JsxNoNewFunctionAsProp.RuleEntry;
  readonly 'react-perf/jsx-no-jsx-as-prop': JsxNoJsxAsProp.RuleEntry;
};

export type EslintReactPerfRulesOption = {
  readonly 'react-perf/jsx-no-new-object-as-prop': JsxNoNewObjectAsProp.Options;
  readonly 'react-perf/jsx-no-new-array-as-prop': JsxNoNewArrayAsProp.Options;
  readonly 'react-perf/jsx-no-new-function-as-prop': JsxNoNewFunctionAsProp.Options;
  readonly 'react-perf/jsx-no-jsx-as-prop': JsxNoJsxAsProp.Options;
};
