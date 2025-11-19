/* cSpell:disable */
import { type Linter } from 'eslint';

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
  export type Options = Readonly<{
    nativeAllowList?: 'all' | readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    nativeAllowList?: 'all' | readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    nativeAllowList?: 'all' | readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    nativeAllowList?: 'all' | readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

export type EslintReactPerfRules = Readonly<{
  'react-perf/jsx-no-new-object-as-prop': JsxNoNewObjectAsProp.RuleEntry;
  'react-perf/jsx-no-new-array-as-prop': JsxNoNewArrayAsProp.RuleEntry;
  'react-perf/jsx-no-new-function-as-prop': JsxNoNewFunctionAsProp.RuleEntry;
  'react-perf/jsx-no-jsx-as-prop': JsxNoJsxAsProp.RuleEntry;
}>;

export type EslintReactPerfRulesOption = Readonly<{
  'react-perf/jsx-no-new-object-as-prop': JsxNoNewObjectAsProp.Options;
  'react-perf/jsx-no-new-array-as-prop': JsxNoNewArrayAsProp.Options;
  'react-perf/jsx-no-new-function-as-prop': JsxNoNewFunctionAsProp.Options;
  'react-perf/jsx-no-jsx-as-prop': JsxNoJsxAsProp.Options;
}>;
