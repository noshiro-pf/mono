/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleSeverity, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleSeverity, ...T[1]] : T;

/**
 * Enforce consistent use of `output` assertions in rule tests
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/consistent-output.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | category    | Tests      |
 *  | recommended | false      |
 *  ```
 */
namespace ConsistentOutput {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "description": "Whether to enforce having output assertions 'always' or to be 'consistent' when some cases have them.",
   *     "enum": [
   *       "always",
   *       "consistent"
   *     ],
   *     "default": "consistent"
   *   }
   * ]
   * ```
   */
  /**
   * Whether to enforce having output assertions 'always' or to be 'consistent'
   * when some cases have them.
   */
  export type Options = 'always' | 'consistent';

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require fixer functions to return a fix
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/fixer-return.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | category    | Rules   |
 *  | recommended | true    |
 *  ```
 */
namespace FixerReturn {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce the order of meta properties
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/meta-property-ordering.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | category    | Rules      |
 *  | recommended | false      |
 *  ```
 */
namespace MetaPropertyOrdering {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "array",
   *     "description": "What order to enforce for meta properties.",
   *     "elements": {
   *       "type": "string"
   *     }
   *   }
   * ]
   * ```
   */
  /** What order to enforce for meta properties. */
  export type Options = readonly unknown[];

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow usage of deprecated methods on rule context objects
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-deprecated-context-methods.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | category    | Rules      |
 *  | recommended | true       |
 *  ```
 */
namespace NoDeprecatedContextMethods {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow the version of `context.report()` with multiple arguments
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-deprecated-report-api.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | category    | Rules      |
 *  | recommended | true       |
 *  ```
 */
namespace NoDeprecatedReportApi {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow identical tests
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-identical-tests.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | fixable     | code    |
 *  | category    | Tests   |
 *  | recommended | true    |
 *  ```
 */
namespace NoIdenticalTests {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow `messageId`s that are missing from `meta.messages`
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-missing-message-ids.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | category    | Rules   |
 *  | recommended | true    |
 *  ```
 */
namespace NoMissingMessageIds {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow missing placeholders in rule report messages
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-missing-placeholders.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | category    | Rules   |
 *  | recommended | true    |
 *  ```
 */
namespace NoMissingPlaceholders {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow the test case property `only`
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-only-tests.md
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | hasSuggestions | true    |
 *  | category       | Tests   |
 *  | recommended    | true    |
 *  ```
 */
namespace NoOnlyTests {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow using `in` to narrow node types instead of looking at properties
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-property-in-node.md
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | category             | Rules      |
 *  | recommended          | false      |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace NoPropertyInNode {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "additionalNodeTypeFiles": {
   *         "description": "Any additional regular expressions to consider source files defining AST Node types.",
   *         "elements": {
   *           "type": "string"
   *         },
   *         "type": "array"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Any additional regular expressions to consider source files defining AST
     * Node types.
     */
    readonly additionalNodeTypeFiles?: readonly unknown[];
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow unused `messageId`s in `meta.messages`
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-unused-message-ids.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | category    | Rules   |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnusedMessageIds {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow unused placeholders in rule report messages
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-unused-placeholders.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | category    | Rules   |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnusedPlaceholders {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow unnecessary calls to `sourceCode.getFirstToken()` and
 * `sourceCode.getLastToken()`
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-useless-token-range.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | category    | Rules      |
 *  | recommended | true       |
 *  ```
 */
namespace NoUselessTokenRange {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require using `messageId` instead of `message` or `desc` to report rule
 * violations
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/prefer-message-ids.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | category    | Rules   |
 *  | recommended | true    |
 *  ```
 */
namespace PreferMessageIds {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow function-style rules
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/prefer-object-rule.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | category    | Rules      |
 *  | recommended | true       |
 *  ```
 */
namespace PreferObjectRule {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow invalid RuleTester test cases where the `output` matches the `code`
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/prefer-output-null.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | category    | Tests      |
 *  | recommended | true       |
 *  ```
 */
namespace PreferOutputNull {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require using placeholders for dynamic report messages
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/prefer-placeholders.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | category    | Rules      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferPlaceholders {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require using `replaceText()` instead of `replaceTextRange()`
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/prefer-replace-text.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | category    | Rules      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferReplaceText {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce a consistent format for rule report messages
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/report-message-format.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | category    | Rules      |
 *  | recommended | false      |
 *  ```
 */
namespace ReportMessageFormat {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "description": "Format that all report messages must match.",
   *     "type": "string"
   *   }
   * ]
   * ```
   */
  /** Format that all report messages must match. */
  export type Options = string;

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require rules to implement a `meta.docs.description` property with the
 * correct format
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-docs-description.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | category    | Rules      |
 *  | recommended | false      |
 *  ```
 */
namespace RequireMetaDocsDescription {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "pattern": {
   *         "type": "string",
   *         "description": "A regular expression that the description must match. Use `'.+'` to allow anything.",
   *         "default": "^(enforce|require|disallow)"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * A regular expression that the description must match. Use `'.+'` to allow
     * anything.
     */
    readonly pattern?: string;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require rules to implement a `meta.docs.recommended` property
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-docs-recommended.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | category    | Rules      |
 *  | recommended | false      |
 *  ```
 */
namespace RequireMetaDocsRecommended {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowNonBoolean": {
   *         "default": false,
   *         "description": "Whether to allow values of types other than boolean.",
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    /** Whether to allow values of types other than boolean. */
    readonly allowNonBoolean?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require rules to implement a `meta.docs.url` property
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-docs-url.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | category    | Rules      |
 *  | recommended | false      |
 *  ```
 */
namespace RequireMetaDocsUrl {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "pattern": {
   *         "type": "string",
   *         "description": "A pattern to enforce rule's document URL. It replaces `{{name}}` placeholder by each rule name. The rule name is the basename of each rule file. Omitting this allows any URL."
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * A pattern to enforce rule's document URL. It replaces `{{name}}`
     * placeholder by each rule name. The rule name is the basename of each rule
     * file. Omitting this allows any URL.
     */
    readonly pattern?: string;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require rules to implement a `meta.fixable` property
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-fixable.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | category    | Rules   |
 *  | recommended | true    |
 *  ```
 */
namespace RequireMetaFixable {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "catchNoFixerButFixableProperty": {
   *         "type": "boolean",
   *         "default": false,
   *         "description": "Whether the rule should attempt to detect rules that do not have a fixer but enable the `meta.fixable` property. This option is off by default because it increases the chance of false positives since fixers can't always be detected when helper functions are used."
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether the rule should attempt to detect rules that do not have a fixer
     * but enable the `meta.fixable` property. This option is off by default
     * because it increases the chance of false positives since fixers can't
     * always be detected when helper functions are used.
     */
    readonly catchNoFixerButFixableProperty?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require suggestable rules to implement a `meta.hasSuggestions` property
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-has-suggestions.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | fixable     | code    |
 *  | category    | Rules   |
 *  | recommended | true    |
 *  ```
 */
namespace RequireMetaHasSuggestions {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require rules `meta.schema` properties to include descriptions
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-schema-description.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | category    | Rules      |
 *  | recommended | false      |
 *  ```
 */
namespace RequireMetaSchemaDescription {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require rules to implement a `meta.schema` property
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-schema.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | category       | Rules      |
 *  | recommended    | true       |
 *  ```
 */
namespace RequireMetaSchema {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "requireSchemaPropertyWhenOptionless": {
   *         "type": "boolean",
   *         "default": true,
   *         "description": "Whether the rule should require the `meta.schema` property to be specified (with `schema: []`) for rules that have no options."
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether the rule should require the `meta.schema` property to be
     * specified (with `schema: []`) for rules that have no options.
     */
    readonly requireSchemaPropertyWhenOptionless?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require rules to implement a `meta.type` property
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-type.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | category    | Rules   |
 *  | recommended | true    |
 *  ```
 */
namespace RequireMetaType {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require the properties of a test case to be placed in a consistent order
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/test-case-property-ordering.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | category    | Tests      |
 *  | recommended | false      |
 *  ```
 */
namespace TestCasePropertyOrdering {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "array",
   *     "description": "What order to enforce for test case properties.",
   *     "elements": {
   *       "type": "string"
   *     }
   *   }
   * ]
   * ```
   */
  /** What order to enforce for test case properties. */
  export type Options = readonly unknown[];

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce consistent usage of shorthand strings for test cases with no options
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/test-case-shorthand-strings.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | category    | Tests      |
 *  | recommended | false      |
 *  ```
 */
namespace TestCaseShorthandStrings {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "description": "What behavior to enforce of when shorthand strings should be banned or required.",
   *     "enum": [
   *       "as-needed",
   *       "never",
   *       "consistent",
   *       "consistent-as-needed"
   *     ]
   *   }
   * ]
   * ```
   */
  /**
   * What behavior to enforce of when shorthand strings should be banned or
   * required.
   */
  export type Options =
    | 'as-needed'
    | 'consistent-as-needed'
    | 'consistent'
    | 'never';

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

export type EslintPluginRules = {
  readonly 'eslint-plugin/consistent-output': ConsistentOutput.RuleEntry;
  readonly 'eslint-plugin/fixer-return': FixerReturn.RuleEntry;
  readonly 'eslint-plugin/meta-property-ordering': MetaPropertyOrdering.RuleEntry;
  readonly 'eslint-plugin/no-deprecated-context-methods': NoDeprecatedContextMethods.RuleEntry;
  readonly 'eslint-plugin/no-deprecated-report-api': NoDeprecatedReportApi.RuleEntry;
  readonly 'eslint-plugin/no-identical-tests': NoIdenticalTests.RuleEntry;
  readonly 'eslint-plugin/no-missing-message-ids': NoMissingMessageIds.RuleEntry;
  readonly 'eslint-plugin/no-missing-placeholders': NoMissingPlaceholders.RuleEntry;
  readonly 'eslint-plugin/no-only-tests': NoOnlyTests.RuleEntry;
  readonly 'eslint-plugin/no-property-in-node': NoPropertyInNode.RuleEntry;
  readonly 'eslint-plugin/no-unused-message-ids': NoUnusedMessageIds.RuleEntry;
  readonly 'eslint-plugin/no-unused-placeholders': NoUnusedPlaceholders.RuleEntry;
  readonly 'eslint-plugin/no-useless-token-range': NoUselessTokenRange.RuleEntry;
  readonly 'eslint-plugin/prefer-message-ids': PreferMessageIds.RuleEntry;
  readonly 'eslint-plugin/prefer-object-rule': PreferObjectRule.RuleEntry;
  readonly 'eslint-plugin/prefer-output-null': PreferOutputNull.RuleEntry;
  readonly 'eslint-plugin/prefer-placeholders': PreferPlaceholders.RuleEntry;
  readonly 'eslint-plugin/prefer-replace-text': PreferReplaceText.RuleEntry;
  readonly 'eslint-plugin/report-message-format': ReportMessageFormat.RuleEntry;
  readonly 'eslint-plugin/require-meta-docs-description': RequireMetaDocsDescription.RuleEntry;
  readonly 'eslint-plugin/require-meta-docs-recommended': RequireMetaDocsRecommended.RuleEntry;
  readonly 'eslint-plugin/require-meta-docs-url': RequireMetaDocsUrl.RuleEntry;
  readonly 'eslint-plugin/require-meta-fixable': RequireMetaFixable.RuleEntry;
  readonly 'eslint-plugin/require-meta-has-suggestions': RequireMetaHasSuggestions.RuleEntry;
  readonly 'eslint-plugin/require-meta-schema-description': RequireMetaSchemaDescription.RuleEntry;
  readonly 'eslint-plugin/require-meta-schema': RequireMetaSchema.RuleEntry;
  readonly 'eslint-plugin/require-meta-type': RequireMetaType.RuleEntry;
  readonly 'eslint-plugin/test-case-property-ordering': TestCasePropertyOrdering.RuleEntry;
  readonly 'eslint-plugin/test-case-shorthand-strings': TestCaseShorthandStrings.RuleEntry;
};

export type EslintPluginRulesOption = {
  readonly 'eslint-plugin/consistent-output': ConsistentOutput.Options;
  readonly 'eslint-plugin/meta-property-ordering': MetaPropertyOrdering.Options;
  readonly 'eslint-plugin/no-property-in-node': NoPropertyInNode.Options;
  readonly 'eslint-plugin/report-message-format': ReportMessageFormat.Options;
  readonly 'eslint-plugin/require-meta-docs-description': RequireMetaDocsDescription.Options;
  readonly 'eslint-plugin/require-meta-docs-recommended': RequireMetaDocsRecommended.Options;
  readonly 'eslint-plugin/require-meta-docs-url': RequireMetaDocsUrl.Options;
  readonly 'eslint-plugin/require-meta-fixable': RequireMetaFixable.Options;
  readonly 'eslint-plugin/require-meta-schema': RequireMetaSchema.Options;
  readonly 'eslint-plugin/test-case-property-ordering': TestCasePropertyOrdering.Options;
  readonly 'eslint-plugin/test-case-shorthand-strings': TestCaseShorthandStrings.Options;
};
