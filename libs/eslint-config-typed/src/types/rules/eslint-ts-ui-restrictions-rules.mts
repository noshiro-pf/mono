/* cSpell:disable */
import type { Linter } from 'eslint';

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
 *
 * @internal Reached by indexing the rules record by the rule's name.
 */
namespace JsxBooleanLogicalOperands {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Require a keyboard handler that compares `event.key` or `event.code` with `'Enter'` or `'Escape'` to check the same event for input method composition
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 *
 * @internal Reached by indexing the rules record by the rule's name.
 */
namespace RequireImeGuard {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "guardFunctions": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "description": "Names of functions that, called with the event, tell an input method's key down: the exported name for a named or namespace import, the name it is called by for anything else (default: `[\"isImeKeyDown\"]`)"
   *       },
   *       "keys": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "enum": [
   *             "Enter",
   *             "Escape"
   *           ]
   *         },
   *         "uniqueItems": true,
   *         "description": "The keys whose comparisons need the check (default: `[\"Enter\", \"Escape\"]`)"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Names of functions that, called with the event, tell an input method's key down: the exported name for a named or namespace import, the name it is called by for anything else (default: `["isImeKeyDown"]`)
     */
    guardFunctions?: readonly string[];
    /**
     * The keys whose comparisons need the check (default: `["Enter", "Escape"]`)
     */
    keys?: readonly ('Enter' | 'Escape')[];
  }>;

  export type RuleEntry =
    'off' | Linter.Severity | readonly [Linter.StringSeverity, Options];
}

export type EslintTsUiRestrictionsRules = Readonly<{
  'ts-ui-restrictions/jsx-boolean-logical-operands': JsxBooleanLogicalOperands.RuleEntry;
  'ts-ui-restrictions/require-ime-guard': RequireImeGuard.RuleEntry;
}>;

export type EslintTsUiRestrictionsRulesOption = Readonly<{
  'ts-ui-restrictions/require-ime-guard': RequireImeGuard.Options;
}>;
