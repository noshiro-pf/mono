/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Enforce consistent use of `output` assertions in rule tests
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/consistent-output.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace FixerReturn {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoDeprecatedContextMethods {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoDeprecatedReportApi {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | fixable     | code    |
 *  | recommended | true    |
 *  ```
 */
namespace NoIdenticalTests {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require suggestions to have different `messageId` than their parent report
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-matching-violation-suggest-message-ids.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoMatchingViolationSuggestMessageIds {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow using the `meta.replacedBy` rule property
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-meta-replaced-by.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoMetaReplacedBy {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow rules `meta.schema` properties to include defaults
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/no-meta-schema-default.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | true       |
 *  ```
 */
namespace NoMetaSchemaDefault {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoMissingMessageIds {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoMissingPlaceholders {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated     | false   |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace NoOnlyTests {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated           | false      |
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
  export type Options = Readonly<{
    /**
     * Any additional regular expressions to consider source files defining AST
     * Node types.
     */
    additionalNodeTypeFiles?: readonly unknown[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnusedMessageIds {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnusedPlaceholders {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoUselessTokenRange {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace PreferMessageIds {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferObjectRule {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferOutputNull {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferPlaceholders {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferReplaceText {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require only rules with options to implement a `meta.defaultOptions` property
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-default-options.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace RequireMetaDefaultOptions {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
  export type Options = Readonly<{
    /**
     * A regular expression that the description must match. Use `'.+'` to allow
     * anything.
     *
     * @default '^(enforce|require|disallow)'
     */
    pattern?: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require rules to implement a `meta.docs.recommended` property
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-meta-docs-recommended.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
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
  export type Options = Readonly<{
    /**
     * Whether to allow values of types other than boolean.
     *
     * @default false
     */
    allowNonBoolean?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
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
  export type Options = Readonly<{
    /**
     * A pattern to enforce rule's document URL. It replaces `{{name}}`
     * placeholder by each rule name. The rule name is the basename of each rule
     * file. Omitting this allows any URL.
     */
    pattern?: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
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
  export type Options = Readonly<{
    /**
     * Whether the rule should attempt to detect rules that do not have a fixer
     * but enable the `meta.fixable` property. This option is off by default
     * because it increases the chance of false positives since fixers can't
     * always be detected when helper functions are used.
     *
     * @default false
     */
    catchNoFixerButFixableProperty?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
 *  | fixable     | code    |
 *  | recommended | true    |
 *  ```
 */
namespace RequireMetaHasSuggestions {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | true       |
 *  ```
 */
namespace RequireMetaSchemaDescription {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
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
  export type Options = Readonly<{
    /**
     * Whether the rule should require the `meta.schema` property to be
     * specified (with `schema: []`) for rules that have no options.
     *
     * @default true
     */
    requireSchemaPropertyWhenOptionless?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace RequireMetaType {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require test cases to have a `name` property under certain conditions
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/require-test-case-name.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace RequireTestCaseName {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "require": {
   *         "description": "When should the name property be required on a test case object.",
   *         "enum": [
   *           "always",
   *           "objects",
   *           "objects-with-config"
   *         ]
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** When should the name property be required on a test case object. */
    require?: 'always' | 'objects' | 'objects-with-config';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
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
    | 'never'
    | 'consistent'
    | 'consistent-as-needed';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce that all test cases with names have unique names
 *
 * @link https://github.com/eslint-community/eslint-plugin-eslint-plugin/tree/HEAD/docs/rules/unique-test-case-names.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace UniqueTestCaseNames {
  export type RuleEntry = Linter.StringSeverity;
}

export type EslintPluginRules = Readonly<{
  'eslint-plugin/consistent-output': ConsistentOutput.RuleEntry;
  'eslint-plugin/fixer-return': FixerReturn.RuleEntry;
  'eslint-plugin/meta-property-ordering': MetaPropertyOrdering.RuleEntry;
  'eslint-plugin/no-deprecated-context-methods': NoDeprecatedContextMethods.RuleEntry;
  'eslint-plugin/no-deprecated-report-api': NoDeprecatedReportApi.RuleEntry;
  'eslint-plugin/no-identical-tests': NoIdenticalTests.RuleEntry;
  'eslint-plugin/no-matching-violation-suggest-message-ids': NoMatchingViolationSuggestMessageIds.RuleEntry;
  'eslint-plugin/no-meta-replaced-by': NoMetaReplacedBy.RuleEntry;
  'eslint-plugin/no-meta-schema-default': NoMetaSchemaDefault.RuleEntry;
  'eslint-plugin/no-missing-message-ids': NoMissingMessageIds.RuleEntry;
  'eslint-plugin/no-missing-placeholders': NoMissingPlaceholders.RuleEntry;
  'eslint-plugin/no-only-tests': NoOnlyTests.RuleEntry;
  'eslint-plugin/no-property-in-node': NoPropertyInNode.RuleEntry;
  'eslint-plugin/no-unused-message-ids': NoUnusedMessageIds.RuleEntry;
  'eslint-plugin/no-unused-placeholders': NoUnusedPlaceholders.RuleEntry;
  'eslint-plugin/no-useless-token-range': NoUselessTokenRange.RuleEntry;
  'eslint-plugin/prefer-message-ids': PreferMessageIds.RuleEntry;
  'eslint-plugin/prefer-object-rule': PreferObjectRule.RuleEntry;
  'eslint-plugin/prefer-output-null': PreferOutputNull.RuleEntry;
  'eslint-plugin/prefer-placeholders': PreferPlaceholders.RuleEntry;
  'eslint-plugin/prefer-replace-text': PreferReplaceText.RuleEntry;
  'eslint-plugin/report-message-format': ReportMessageFormat.RuleEntry;
  'eslint-plugin/require-meta-default-options': RequireMetaDefaultOptions.RuleEntry;
  'eslint-plugin/require-meta-docs-description': RequireMetaDocsDescription.RuleEntry;
  'eslint-plugin/require-meta-docs-recommended': RequireMetaDocsRecommended.RuleEntry;
  'eslint-plugin/require-meta-docs-url': RequireMetaDocsUrl.RuleEntry;
  'eslint-plugin/require-meta-fixable': RequireMetaFixable.RuleEntry;
  'eslint-plugin/require-meta-has-suggestions': RequireMetaHasSuggestions.RuleEntry;
  'eslint-plugin/require-meta-schema-description': RequireMetaSchemaDescription.RuleEntry;
  'eslint-plugin/require-meta-schema': RequireMetaSchema.RuleEntry;
  'eslint-plugin/require-meta-type': RequireMetaType.RuleEntry;
  'eslint-plugin/require-test-case-name': RequireTestCaseName.RuleEntry;
  'eslint-plugin/test-case-property-ordering': TestCasePropertyOrdering.RuleEntry;
  'eslint-plugin/test-case-shorthand-strings': TestCaseShorthandStrings.RuleEntry;
  'eslint-plugin/unique-test-case-names': UniqueTestCaseNames.RuleEntry;
}>;

export type EslintPluginRulesOption = Readonly<{
  'eslint-plugin/consistent-output': ConsistentOutput.Options;
  'eslint-plugin/meta-property-ordering': MetaPropertyOrdering.Options;
  'eslint-plugin/no-property-in-node': NoPropertyInNode.Options;
  'eslint-plugin/report-message-format': ReportMessageFormat.Options;
  'eslint-plugin/require-meta-docs-description': RequireMetaDocsDescription.Options;
  'eslint-plugin/require-meta-docs-recommended': RequireMetaDocsRecommended.Options;
  'eslint-plugin/require-meta-docs-url': RequireMetaDocsUrl.Options;
  'eslint-plugin/require-meta-fixable': RequireMetaFixable.Options;
  'eslint-plugin/require-meta-schema': RequireMetaSchema.Options;
  'eslint-plugin/require-test-case-name': RequireTestCaseName.Options;
  'eslint-plugin/test-case-property-ordering': TestCasePropertyOrdering.Options;
  'eslint-plugin/test-case-shorthand-strings': TestCaseShorthandStrings.Options;
}>;
