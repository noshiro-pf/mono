/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleSeverity, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleSeverity, ...T[1]] : T;

/**
 * Improve regexes by making them shorter, consistent, and safer.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/better-regex.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace BetterRegex {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "sortCharacterClasses": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly sortCharacterClasses?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce a specific parameter name in catch clauses.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/catch-error-name.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace CatchErrorName {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "name": {
   *         "type": "string"
   *       },
   *       "ignore": {
   *         "type": "array",
   *         "uniqueItems": true
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly name?: string;
    readonly ignore?: readonly unknown[];
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Use destructured variables over properties.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/consistent-destructuring.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 *  ```
 */
namespace ConsistentDestructuring {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer consistent types when spreading a ternary in an array literal.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/consistent-empty-array-spread.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace ConsistentEmptyArraySpread {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce consistent style for element existence checks with `indexOf()`,
 * `lastIndexOf()`, `findIndex()`, and `findLastIndex()`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/consistent-existence-index-check.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | fixable     | code    |
 *  | recommended | true    |
 *  ```
 */
namespace ConsistentExistenceIndexCheck {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Move function definitions to the highest possible scope.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/consistent-function-scoping.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace ConsistentFunctionScoping {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "checkArrowFunctions": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly checkArrowFunctions?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce correct `Error` subclassing.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/custom-error-definition.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | fixable     | code    |
 *  | recommended | false   |
 *  ```
 */
namespace CustomErrorDefinition {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce no spaces between braces.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/empty-brace-spaces.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | true       |
 *  ```
 */
namespace EmptyBraceSpaces {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce passing a `message` value when creating a built-in error.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/error-message.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace ErrorMessage {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require escape sequences to use uppercase values.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/escape-case.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace EscapeCase {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Add expiration conditions to TODO comments.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/expiring-todo-comments.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace ExpiringTodoComments {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "terms": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "ignore": {
   *         "type": "array",
   *         "uniqueItems": true
   *       },
   *       "ignoreDatesOnPullRequests": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "allowWarningComments": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "date": {
   *         "type": "string",
   *         "format": "date"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly terms?: readonly string[];
    readonly ignore?: readonly unknown[];
    readonly ignoreDatesOnPullRequests?: boolean;
    readonly allowWarningComments?: boolean;
    readonly date?: string;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce explicitly comparing the `length` or `size` property of a value.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/explicit-length-check.md
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace ExplicitLengthCheck {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "non-zero": {
   *         "enum": [
   *           "greater-than",
   *           "not-equal"
   *         ],
   *         "default": "greater-than"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly 'non-zero'?: 'greater-than' | 'not-equal';
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce a case style for filenames.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/filename-case.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace FilenameCase {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "properties": {
   *           "case": {
   *             "enum": [
   *               "camelCase",
   *               "snakeCase",
   *               "kebabCase",
   *               "pascalCase"
   *             ]
   *           },
   *           "ignore": {
   *             "type": "array",
   *             "uniqueItems": true
   *           },
   *           "multipleFileExtensions": {
   *             "type": "boolean"
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       {
   *         "properties": {
   *           "cases": {
   *             "properties": {
   *               "camelCase": {
   *                 "type": "boolean"
   *               },
   *               "snakeCase": {
   *                 "type": "boolean"
   *               },
   *               "kebabCase": {
   *                 "type": "boolean"
   *               },
   *               "pascalCase": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "ignore": {
   *             "type": "array",
   *             "uniqueItems": true
   *           },
   *           "multipleFileExtensions": {
   *             "type": "boolean"
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options =
    | {
        readonly case?: 'camelCase' | 'kebabCase' | 'pascalCase' | 'snakeCase';
        readonly ignore?: readonly unknown[];
        readonly multipleFileExtensions?: boolean;
      }
    | {
        readonly cases?: {
          readonly camelCase?: boolean;
          readonly snakeCase?: boolean;
          readonly kebabCase?: boolean;
          readonly pascalCase?: boolean;
        };
        readonly ignore?: readonly unknown[];
        readonly multipleFileExtensions?: boolean;
      };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce specific import styles per module.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/import-style.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace ImportStyle {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "type": "array",
   *   "additionalItems": false,
   *   "items": [
   *     {
   *       "type": "object",
   *       "additionalProperties": false,
   *       "properties": {
   *         "checkImport": {
   *           "type": "boolean"
   *         },
   *         "checkDynamicImport": {
   *           "type": "boolean"
   *         },
   *         "checkExportFrom": {
   *           "type": "boolean"
   *         },
   *         "checkRequire": {
   *           "type": "boolean"
   *         },
   *         "extendDefaultStyles": {
   *           "type": "boolean"
   *         },
   *         "styles": {
   *           "$ref": "#/definitions/moduleStyles"
   *         }
   *       }
   *     }
   *   ],
   *   "definitions": {
   *     "moduleStyles": {
   *       "type": "object",
   *       "additionalProperties": {
   *         "$ref": "#/definitions/styles"
   *       }
   *     },
   *     "styles": {
   *       "anyOf": [
   *         {
   *           "enum": [false]
   *         },
   *         {
   *           "$ref": "#/definitions/booleanObject"
   *         }
   *       ]
   *     },
   *     "booleanObject": {
   *       "type": "object",
   *       "additionalProperties": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * }
   * ```
   */
  export type Options =
    | readonly [
        {
          readonly checkImport?: boolean;
          readonly checkDynamicImport?: boolean;
          readonly checkExportFrom?: boolean;
          readonly checkRequire?: boolean;
          readonly extendDefaultStyles?: boolean;
          readonly styles?: ModuleStyles;
        },
      ]
    | readonly [];
  export type Styles = BooleanObject | false;

  export type ModuleStyles = Readonly<Record<string, Styles>>;
  export type BooleanObject = Readonly<
    Partial<Record<'default' | 'named' | 'namespace' | 'unassigned', boolean>>
  >;

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce the use of `new` for all builtins, except `String`, `Number`,
 * `Boolean`, `Symbol` and `BigInt`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/new-for-builtins.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NewForBuiltins {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce specifying rules to disable in `eslint-disable` comments.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-abusive-eslint-disable.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace NoAbusiveEslintDisable {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow anonymous functions and classes as the default export.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-anonymous-default-export.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoAnonymousDefaultExport {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prevent passing a function reference directly to iterator methods.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-array-callback-reference.md
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace NoArrayCallbackReference {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `for…of` over the `forEach` method.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-array-for-each.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoArrayForEach {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow using the `this` argument in array methods.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-array-method-this-argument.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoArrayMethodThisArgument {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce combining multiple `Array#push()` into one call.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-array-push-push.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoArrayPushPush {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "ignore": {
   *         "type": "array",
   *         "uniqueItems": true
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly ignore?: readonly unknown[];
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow `Array#reduce()` and `Array#reduceRight()`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-array-reduce.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace NoArrayReduce {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowSimpleOperations": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowSimpleOperations?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow member access from await expression.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-await-expression-member.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoAwaitExpressionMember {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow using `await` in `Promise` method parameters.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-await-in-promise-methods.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoAwaitInPromiseMethods {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Do not use leading/trailing space between `console.log` parameters.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-console-spaces.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoConsoleSpaces {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Do not use `document.cookie` directly.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-document-cookie.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoDocumentCookie {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow empty files.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-empty-file.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace NoEmptyFile {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Do not use a `for` loop that can be replaced with a `for-of` loop.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-for-loop.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoForLoop {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce the use of Unicode escapes instead of hexadecimal escapes.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-hex-escape.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoHexEscape {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require `Array.isArray()` instead of `instanceof Array`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-instanceof-array.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoInstanceofArray {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow invalid options in `fetch()` and `new Request()`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-invalid-fetch-options.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoInvalidFetchOptions {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prevent calling `EventTarget#removeEventListener()` with the result of an
 * expression.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-invalid-remove-event-listener.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoInvalidRemoveEventListener {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow identifiers starting with `new` or `class`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-keyword-prefix.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoKeywordPrefix {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "disallowedPrefixes": {
   *         "type": "array",
   *         "items": [
   *           {
   *             "type": "string"
   *           }
   *         ],
   *         "minItems": 0,
   *         "uniqueItems": true
   *       },
   *       "checkProperties": {
   *         "type": "boolean"
   *       },
   *       "onlyCamelCase": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    /** @minItems 0 */
    readonly disallowedPrefixes?: readonly [] | readonly [string];
    readonly checkProperties?: boolean;
    readonly onlyCamelCase?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow using `.length` as the `end` argument of
 * `{Array,String,TypedArray}#slice()`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-length-as-slice-end.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoLengthAsSliceEnd {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow `if` statements as the only statement in `if` blocks without `else`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-lonely-if.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoLonelyIf {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow a magic number as the `depth` argument in `Array#flat(…).`
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-magic-array-flat-depth.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace NoMagicArrayFlatDepth {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow negated conditions.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-negated-condition.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoNegatedCondition {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow negated expression in equality check.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-negation-in-equality-check.md
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace NoNegationInEqualityCheck {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow nested ternary expressions.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-nested-ternary.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoNestedTernary {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow `new Array()`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-new-array.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoNewArray {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce the use of `Buffer.from()` and `Buffer.alloc()` instead of the
 * deprecated `new Buffer()`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-new-buffer.md
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace NoNewBuffer {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow the use of the `null` literal.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-null.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoNull {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "checkStrictEquality": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly checkStrictEquality?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow the use of objects as default parameters.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-object-as-default-parameter.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoObjectAsDefaultParameter {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow `process.exit()`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-process-exit.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace NoProcessExit {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow passing single-element arrays to `Promise` methods.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-single-promise-in-promise-methods.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoSinglePromiseInPromiseMethods {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow classes that only have static members.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-static-only-class.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoStaticOnlyClass {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow `then` property.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-thenable.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoThenable {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow assigning `this` to a variable.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-this-assignment.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace NoThisAssignment {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow comparing `undefined` using `typeof`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-typeof-undefined.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoTypeofUndefined {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "checkGlobalVariables": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly checkGlobalVariables?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow awaiting non-promise values.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-unnecessary-await.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoUnnecessaryAwait {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce the use of built-in methods instead of unnecessary polyfills.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-unnecessary-polyfills.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace NoUnnecessaryPolyfills {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "required": [
   *       "targets"
   *     ],
   *     "properties": {
   *       "targets": {
   *         "oneOf": [
   *           {
   *             "type": "string"
   *           },
   *           {
   *             "type": "array"
   *           },
   *           {
   *             "type": "object"
   *           }
   *         ]
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly targets: UnknownRecord | string | readonly unknown[];
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow unreadable array destructuring.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-unreadable-array-destructuring.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoUnreadableArrayDestructuring {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow unreadable IIFEs.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-unreadable-iife.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | false      |
 *  | recommended    | true       |
 *  ```
 */
namespace NoUnreadableIife {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow unused object properties.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-unused-properties.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoUnusedProperties {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow useless fallback when spreading in object literals.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-useless-fallback-in-spread.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoUselessFallbackInSpread {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow useless array length check.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-useless-length-check.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoUselessLengthCheck {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow returning/yielding `Promise.resolve/reject()` in async functions or
 * promise callbacks
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-useless-promise-resolve-reject.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoUselessPromiseResolveReject {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow unnecessary spread.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-useless-spread.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoUselessSpread {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow useless case in switch statements.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-useless-switch-case.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoUselessSwitchCase {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow useless `undefined`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-useless-undefined.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoUselessUndefined {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "checkArguments": {
   *         "type": "boolean"
   *       },
   *       "checkArrowFunctionBody": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly checkArguments?: boolean;
    readonly checkArrowFunctionBody?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow number literals with zero fractions or dangling dots.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/no-zero-fractions.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoZeroFractions {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce proper case for numeric literals.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/number-literal-case.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NumberLiteralCase {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce the style of numeric separators by correctly grouping digits.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/numeric-separators-style.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NumericSeparatorsStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "binary": {
   *         "type": "object",
   *         "additionalProperties": false,
   *         "properties": {
   *           "onlyIfContainsSeparator": {
   *             "type": "boolean"
   *           },
   *           "minimumDigits": {
   *             "type": "integer",
   *             "minimum": 0,
   *             "default": 0
   *           },
   *           "groupLength": {
   *             "type": "integer",
   *             "minimum": 1,
   *             "default": 4
   *           }
   *         }
   *       },
   *       "octal": {
   *         "type": "object",
   *         "additionalProperties": false,
   *         "properties": {
   *           "onlyIfContainsSeparator": {
   *             "type": "boolean"
   *           },
   *           "minimumDigits": {
   *             "type": "integer",
   *             "minimum": 0,
   *             "default": 0
   *           },
   *           "groupLength": {
   *             "type": "integer",
   *             "minimum": 1,
   *             "default": 4
   *           }
   *         }
   *       },
   *       "hexadecimal": {
   *         "type": "object",
   *         "additionalProperties": false,
   *         "properties": {
   *           "onlyIfContainsSeparator": {
   *             "type": "boolean"
   *           },
   *           "minimumDigits": {
   *             "type": "integer",
   *             "minimum": 0,
   *             "default": 0
   *           },
   *           "groupLength": {
   *             "type": "integer",
   *             "minimum": 1,
   *             "default": 2
   *           }
   *         }
   *       },
   *       "number": {
   *         "type": "object",
   *         "additionalProperties": false,
   *         "properties": {
   *           "onlyIfContainsSeparator": {
   *             "type": "boolean"
   *           },
   *           "minimumDigits": {
   *             "type": "integer",
   *             "minimum": 0,
   *             "default": 5
   *           },
   *           "groupLength": {
   *             "type": "integer",
   *             "minimum": 1,
   *             "default": 3
   *           }
   *         }
   *       },
   *       "onlyIfContainsSeparator": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly binary?: {
      readonly onlyIfContainsSeparator?: boolean;
      readonly minimumDigits?: number;
      readonly groupLength?: number;
    };
    readonly octal?: {
      readonly onlyIfContainsSeparator?: boolean;
      readonly minimumDigits?: number;
      readonly groupLength?: number;
    };
    readonly hexadecimal?: {
      readonly onlyIfContainsSeparator?: boolean;
      readonly minimumDigits?: number;
      readonly groupLength?: number;
    };
    readonly number?: {
      readonly onlyIfContainsSeparator?: boolean;
      readonly minimumDigits?: number;
      readonly groupLength?: number;
    };
    readonly onlyIfContainsSeparator?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Prefer `.addEventListener()` and `.removeEventListener()` over
 * `on`-functions.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-add-event-listener.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferAddEventListener {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "excludedPackages": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly excludedPackages?: readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Prefer `.find(…)` and `.findLast(…)` over the first or last element from
 * `.filter(…)`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-array-find.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferArrayFind {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "checkFromLast": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly checkFromLast?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Prefer `.flatMap(…)` over `.map(…).flat()`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-array-flat-map.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferArrayFlatMap {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `Array#flat()` over legacy techniques to flatten arrays.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-array-flat.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferArrayFlat {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "functions": {
   *         "type": "array",
   *         "uniqueItems": true
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly functions?: readonly unknown[];
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Prefer `Array#{indexOf,lastIndexOf}()` over
 * `Array#{findIndex,findLastIndex}()` when looking for the index of an item.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-array-index-of.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferArrayIndexOf {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `.some(…)` over `.filter(…).length` check and
 * `.{find,findLast,findIndex,findLastIndex}(…)`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-array-some.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferArraySome {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `.at()` method for index access and `String#charAt()`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-at.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferAt {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "getLastElementFunctions": {
   *         "type": "array",
   *         "uniqueItems": true
   *       },
   *       "checkAllIndexAccess": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly getLastElementFunctions?: readonly unknown[];
    readonly checkAllIndexAccess?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Prefer `Blob#arrayBuffer()` over `FileReader#readAsArrayBuffer(…)` and
 * `Blob#text()` over `FileReader#readAsText(…)`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-blob-reading-methods.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace PreferBlobReadingMethods {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `String#codePointAt(…)` over `String#charCodeAt(…)` and
 * `String.fromCodePoint(…)` over `String.fromCharCode(…)`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-code-point.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferCodePoint {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `Date.now()` to get the number of milliseconds since the Unix Epoch.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-date-now.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferDateNow {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer default parameters over reassignment.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-default-parameters.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferDefaultParameters {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `Node#append()` over `Node#appendChild()`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-dom-node-append.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferDomNodeAppend {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer using `.dataset` on DOM elements over calling attribute methods.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-dom-node-dataset.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferDomNodeDataset {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `childNode.remove()` over `parentNode.removeChild(childNode)`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-dom-node-remove.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferDomNodeRemove {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `.textContent` over `.innerText`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-dom-node-text-content.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferDomNodeTextContent {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `EventTarget` over `EventEmitter`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-event-target.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace PreferEventTarget {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `export…from` when re-exporting.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-export-from.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferExportFrom {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "ignoreUsedVariables": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly ignoreUsedVariables?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Prefer `globalThis` over `window`, `self`, and `global`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-global-this.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | false      |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferGlobalThis {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `.includes()` over `.indexOf()`, `.lastIndexOf()`, and `Array#some()`
 * when checking for existence or non-existence.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-includes.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferIncludes {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer reading a JSON file as a buffer.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-json-parse-buffer.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferJsonParseBuffer {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `KeyboardEvent#key` over `KeyboardEvent#keyCode`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-keyboard-event-key.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferKeyboardEventKey {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer using a logical operator over a ternary.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-logical-operator-over-ternary.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferLogicalOperatorOverTernary {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `Math.min()` and `Math.max()` over ternaries for simple comparisons.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-math-min-max.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | fixable     | code    |
 *  | recommended | true    |
 *  ```
 */
namespace PreferMathMinMax {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce the use of `Math.trunc` instead of bitwise operators.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-math-trunc.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferMathTrunc {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `.before()` over `.insertBefore()`, `.replaceWith()` over
 * `.replaceChild()`, prefer one of `.before()`, `.after()`, `.append()` or
 * `.prepend()` over `insertAdjacentText()` and `insertAdjacentElement()`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-modern-dom-apis.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferModernDomApis {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer modern `Math` APIs over legacy patterns.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-modern-math-apis.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferModernMathApis {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer JavaScript modules (ESM) over CommonJS.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-module.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferModule {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer using `String`, `Number`, `BigInt`, `Boolean`, and `Symbol` directly.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-native-coercion-functions.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferNativeCoercionFunctions {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer negative index over `.length - index` when possible.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-negative-index.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferNegativeIndex {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer using the `node:` protocol when importing Node.js builtin modules.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-node-protocol.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferNodeProtocol {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `Number` static properties over global ones.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-number-properties.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferNumberProperties {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "checkInfinity": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "checkNaN": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly checkInfinity?: boolean;
    readonly checkNaN?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Prefer using `Object.fromEntries(…)` to transform a list of key-value pairs
 * into an object.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-object-from-entries.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferObjectFromEntries {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "functions": {
   *         "type": "array",
   *         "uniqueItems": true
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly functions?: readonly unknown[];
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Prefer omitting the `catch` binding parameter.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-optional-catch-binding.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferOptionalCatchBinding {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer borrowing methods from the prototype instead of the instance.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-prototype-methods.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferPrototypeMethods {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `.querySelector()` over `.getElementById()`, `.querySelectorAll()`
 * over `.getElementsByClassName()` and `.getElementsByTagName()` and
 * `.getElementsByName()`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-query-selector.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferQuerySelector {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `Reflect.apply()` over `Function#apply()`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-reflect-apply.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferReflectApply {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `RegExp#test()` over `String#match()` and `RegExp#exec()`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-regexp-test.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferRegexpTest {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `Set#has()` over `Array#includes()` when checking for existence or
 * non-existence.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-set-has.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferSetHas {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer using `Set#size` instead of `Array#length`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-set-size.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferSetSize {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer the spread operator over `Array.from(…)`, `Array#concat(…)`,
 * `Array#{slice,toSpliced}()` and `String#split('')`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-spread.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferSpread {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer using the `String.raw` tag to avoid escaping `\`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-string-raw.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferStringRaw {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `String#replaceAll()` over regex searches with the global flag.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-string-replace-all.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferStringReplaceAll {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `String#slice()` over `String#substr()` and `String#substring()`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-string-slice.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferStringSlice {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `String#startsWith()` & `String#endsWith()` over `RegExp#test()`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-string-starts-ends-with.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferStringStartsEndsWith {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer `String#trimStart()` / `String#trimEnd()` over `String#trimLeft()` /
 * `String#trimRight()`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-string-trim-start-end.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferStringTrimStartEnd {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prefer using `structuredClone` to create a deep clone.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-structured-clone.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferStructuredClone {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "functions": {
   *         "type": "array",
   *         "uniqueItems": true
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly functions?: readonly unknown[];
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Prefer `switch` over multiple `else-if`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-switch.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferSwitch {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "minimumCases": {
   *         "type": "integer",
   *         "minimum": 2,
   *         "default": 3
   *       },
   *       "emptyDefaultCase": {
   *         "enum": [
   *           "no-default-comment",
   *           "do-nothing-comment",
   *           "no-default-case"
   *         ],
   *         "default": "no-default-comment"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly minimumCases?: number;
    readonly emptyDefaultCase?:
      | 'do-nothing-comment'
      | 'no-default-case'
      | 'no-default-comment';
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Prefer ternary expressions over simple `if-else` statements.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-ternary.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferTernary {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "only-single-line"
   *     ],
   *     "default": "always"
   *   }
   * ]
   * ```
   */
  export type Options = 'always' | 'only-single-line';

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Prefer top-level await over top-level promises and async function calls.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-top-level-await.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferTopLevelAwait {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce throwing `TypeError` in type checking conditions.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prefer-type-error.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreferTypeError {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Prevent abbreviations.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/prevent-abbreviations.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace PreventAbbreviations {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "type": "array",
   *   "additionalItems": false,
   *   "items": [
   *     {
   *       "type": "object",
   *       "additionalProperties": false,
   *       "properties": {
   *         "checkProperties": {
   *           "type": "boolean"
   *         },
   *         "checkVariables": {
   *           "type": "boolean"
   *         },
   *         "checkDefaultAndNamespaceImports": {
   *           "type": ["boolean", "string"],
   *           "pattern": "internal"
   *         },
   *         "checkShorthandImports": {
   *           "type": ["boolean", "string"],
   *           "pattern": "internal"
   *         },
   *         "checkShorthandProperties": {
   *           "type": "boolean"
   *         },
   *         "checkFilenames": {
   *           "type": "boolean"
   *         },
   *         "extendDefaultReplacements": {
   *           "type": "boolean"
   *         },
   *         "replacements": {
   *           "$ref": "#/definitions/abbreviations"
   *         },
   *         "extendDefaultAllowList": {
   *           "type": "boolean"
   *         },
   *         "allowList": {
   *           "$ref": "#/definitions/booleanObject"
   *         },
   *         "ignore": {
   *           "type": "array",
   *           "uniqueItems": true
   *         }
   *       }
   *     }
   *   ],
   *   "definitions": {
   *     "abbreviations": {
   *       "type": "object",
   *       "additionalProperties": {
   *         "$ref": "#/definitions/replacements"
   *       }
   *     },
   *     "replacements": {
   *       "anyOf": [
   *         {
   *           "enum": [false]
   *         },
   *         {
   *           "$ref": "#/definitions/booleanObject"
   *         }
   *       ]
   *     },
   *     "booleanObject": {
   *       "type": "object",
   *       "additionalProperties": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * }
   * ```
   */
  export type Options =
    | readonly [
        {
          readonly checkProperties?: boolean;
          readonly checkVariables?: boolean;
          readonly checkDefaultAndNamespaceImports?: boolean | string;
          readonly checkShorthandImports?: boolean | string;
          readonly checkShorthandProperties?: boolean;
          readonly checkFilenames?: boolean;
          readonly extendDefaultReplacements?: boolean;
          readonly replacements?: Abbreviations;
          readonly extendDefaultAllowList?: boolean;
          readonly allowList?: BooleanObject;
          readonly ignore?: readonly unknown[];
        },
      ]
    | readonly [];
  export type Replacements = BooleanObject | false;

  export type Abbreviations = Readonly<Record<string, Replacements>>;
  export type BooleanObject = Readonly<Record<string, boolean>>;

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce consistent relative URL style.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/relative-url-style.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace RelativeUrlStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "never",
   *       "always"
   *     ],
   *     "default": "never"
   *   }
   * ]
   * ```
   */
  export type Options = 'always' | 'never';

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce using the separator argument with `Array#join()`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/require-array-join-separator.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace RequireArrayJoinSeparator {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce using the digits argument with `Number#toFixed()`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/require-number-to-fixed-digits-argument.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace RequireNumberToFixedDigitsArgument {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce using the `targetOrigin` argument with `window.postMessage()`.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/require-post-message-target-origin.md
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | hasSuggestions | true    |
 *  | recommended    | false   |
 *  ```
 */
namespace RequirePostMessageTargetOrigin {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce better string content.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/string-content.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 *  ```
 */
namespace StringContent {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "patterns": {
   *         "type": "object",
   *         "additionalProperties": {
   *           "anyOf": [
   *             {
   *               "type": "string"
   *             },
   *             {
   *               "type": "object",
   *               "required": [
   *                 "suggest"
   *               ],
   *               "properties": {
   *                 "suggest": {
   *                   "type": "string"
   *                 },
   *                 "fix": {
   *                   "type": "boolean"
   *                 },
   *                 "message": {
   *                   "type": "string"
   *                 }
   *               },
   *               "additionalProperties": false
   *             }
   *           ]
   *         }
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly patterns?: Record<
      string,
      | string
      | {
          readonly suggest: string;
          readonly fix?: boolean;
          readonly message?: string;
        }
    >;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce consistent brace style for `case` clauses.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/switch-case-braces.md
 *
 *  ```md
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | fixable     | code   |
 *  | recommended | true   |
 *  ```
 */
namespace SwitchCaseBraces {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "avoid"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'always' | 'avoid';

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Fix whitespace-insensitive template indentation.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/template-indent.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace TemplateIndent {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "indent": {
   *         "oneOf": [
   *           {
   *             "type": "string",
   *             "pattern": "^\\s+$"
   *           },
   *           {
   *             "type": "integer",
   *             "minimum": 1
   *           }
   *         ]
   *       },
   *       "tags": {
   *         "type": "array",
   *         "uniqueItems": true,
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "functions": {
   *         "type": "array",
   *         "uniqueItems": true,
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "selectors": {
   *         "type": "array",
   *         "uniqueItems": true,
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "comments": {
   *         "type": "array",
   *         "uniqueItems": true,
   *         "items": {
   *           "type": "string"
   *         }
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly indent?: number | string;
    readonly tags?: readonly string[];
    readonly functions?: readonly string[];
    readonly selectors?: readonly string[];
    readonly comments?: readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce consistent case for text encoding identifiers.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/text-encoding-identifier-case.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace TextEncodingIdentifierCase {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require `new` when creating an error.
 *
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/rules/throw-new-error.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace ThrowNewError {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/deprecated-rules.md#import-index
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace ImportIndex {
  export type RuleEntry = 0;
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/deprecated-rules.md#no-array-instanceof
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace NoArrayInstanceof {
  export type RuleEntry = 0;
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/deprecated-rules.md#no-fn-reference-in-iterator
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace NoFnReferenceInIterator {
  export type RuleEntry = 0;
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/deprecated-rules.md#no-reduce
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace NoReduce {
  export type RuleEntry = 0;
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/deprecated-rules.md#no-unsafe-regex
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace NoUnsafeRegex {
  export type RuleEntry = 0;
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/deprecated-rules.md#prefer-dataset
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace PreferDataset {
  export type RuleEntry = 0;
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/deprecated-rules.md#prefer-event-key
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace PreferEventKey {
  export type RuleEntry = 0;
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/deprecated-rules.md#prefer-exponentiation-operator
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace PreferExponentiationOperator {
  export type RuleEntry = 0;
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/deprecated-rules.md#prefer-flat-map
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace PreferFlatMap {
  export type RuleEntry = 0;
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/deprecated-rules.md#prefer-node-append
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace PreferNodeAppend {
  export type RuleEntry = 0;
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/deprecated-rules.md#prefer-node-remove
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace PreferNodeRemove {
  export type RuleEntry = 0;
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/deprecated-rules.md#prefer-object-has-own
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace PreferObjectHasOwn {
  export type RuleEntry = 0;
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/deprecated-rules.md#prefer-replace-all
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace PreferReplaceAll {
  export type RuleEntry = 0;
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/deprecated-rules.md#prefer-starts-ends-with
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace PreferStartsEndsWith {
  export type RuleEntry = 0;
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/deprecated-rules.md#prefer-text-content
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace PreferTextContent {
  export type RuleEntry = 0;
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/deprecated-rules.md#prefer-trim-start-end
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace PreferTrimStartEnd {
  export type RuleEntry = 0;
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v56.0.1/docs/deprecated-rules.md#regex-shorthand
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace RegexShorthand {
  export type RuleEntry = 0;
}

export type EslintUnicornRules = {
  readonly 'unicorn/better-regex': BetterRegex.RuleEntry;
  readonly 'unicorn/catch-error-name': CatchErrorName.RuleEntry;
  readonly 'unicorn/consistent-destructuring': ConsistentDestructuring.RuleEntry;
  readonly 'unicorn/consistent-empty-array-spread': ConsistentEmptyArraySpread.RuleEntry;
  readonly 'unicorn/consistent-existence-index-check': ConsistentExistenceIndexCheck.RuleEntry;
  readonly 'unicorn/consistent-function-scoping': ConsistentFunctionScoping.RuleEntry;
  readonly 'unicorn/custom-error-definition': CustomErrorDefinition.RuleEntry;
  readonly 'unicorn/empty-brace-spaces': EmptyBraceSpaces.RuleEntry;
  readonly 'unicorn/error-message': ErrorMessage.RuleEntry;
  readonly 'unicorn/escape-case': EscapeCase.RuleEntry;
  readonly 'unicorn/expiring-todo-comments': ExpiringTodoComments.RuleEntry;
  readonly 'unicorn/explicit-length-check': ExplicitLengthCheck.RuleEntry;
  readonly 'unicorn/filename-case': FilenameCase.RuleEntry;
  readonly 'unicorn/import-style': ImportStyle.RuleEntry;
  readonly 'unicorn/new-for-builtins': NewForBuiltins.RuleEntry;
  readonly 'unicorn/no-abusive-eslint-disable': NoAbusiveEslintDisable.RuleEntry;
  readonly 'unicorn/no-anonymous-default-export': NoAnonymousDefaultExport.RuleEntry;
  readonly 'unicorn/no-array-callback-reference': NoArrayCallbackReference.RuleEntry;
  readonly 'unicorn/no-array-for-each': NoArrayForEach.RuleEntry;
  readonly 'unicorn/no-array-method-this-argument': NoArrayMethodThisArgument.RuleEntry;
  readonly 'unicorn/no-array-push-push': NoArrayPushPush.RuleEntry;
  readonly 'unicorn/no-array-reduce': NoArrayReduce.RuleEntry;
  readonly 'unicorn/no-await-expression-member': NoAwaitExpressionMember.RuleEntry;
  readonly 'unicorn/no-await-in-promise-methods': NoAwaitInPromiseMethods.RuleEntry;
  readonly 'unicorn/no-console-spaces': NoConsoleSpaces.RuleEntry;
  readonly 'unicorn/no-document-cookie': NoDocumentCookie.RuleEntry;
  readonly 'unicorn/no-empty-file': NoEmptyFile.RuleEntry;
  readonly 'unicorn/no-for-loop': NoForLoop.RuleEntry;
  readonly 'unicorn/no-hex-escape': NoHexEscape.RuleEntry;
  readonly 'unicorn/no-instanceof-array': NoInstanceofArray.RuleEntry;
  readonly 'unicorn/no-invalid-fetch-options': NoInvalidFetchOptions.RuleEntry;
  readonly 'unicorn/no-invalid-remove-event-listener': NoInvalidRemoveEventListener.RuleEntry;
  readonly 'unicorn/no-keyword-prefix': NoKeywordPrefix.RuleEntry;
  readonly 'unicorn/no-length-as-slice-end': NoLengthAsSliceEnd.RuleEntry;
  readonly 'unicorn/no-lonely-if': NoLonelyIf.RuleEntry;
  readonly 'unicorn/no-magic-array-flat-depth': NoMagicArrayFlatDepth.RuleEntry;
  readonly 'unicorn/no-negated-condition': NoNegatedCondition.RuleEntry;
  readonly 'unicorn/no-negation-in-equality-check': NoNegationInEqualityCheck.RuleEntry;
  readonly 'unicorn/no-nested-ternary': NoNestedTernary.RuleEntry;
  readonly 'unicorn/no-new-array': NoNewArray.RuleEntry;
  readonly 'unicorn/no-new-buffer': NoNewBuffer.RuleEntry;
  readonly 'unicorn/no-null': NoNull.RuleEntry;
  readonly 'unicorn/no-object-as-default-parameter': NoObjectAsDefaultParameter.RuleEntry;
  readonly 'unicorn/no-process-exit': NoProcessExit.RuleEntry;
  readonly 'unicorn/no-single-promise-in-promise-methods': NoSinglePromiseInPromiseMethods.RuleEntry;
  readonly 'unicorn/no-static-only-class': NoStaticOnlyClass.RuleEntry;
  readonly 'unicorn/no-thenable': NoThenable.RuleEntry;
  readonly 'unicorn/no-this-assignment': NoThisAssignment.RuleEntry;
  readonly 'unicorn/no-typeof-undefined': NoTypeofUndefined.RuleEntry;
  readonly 'unicorn/no-unnecessary-await': NoUnnecessaryAwait.RuleEntry;
  readonly 'unicorn/no-unnecessary-polyfills': NoUnnecessaryPolyfills.RuleEntry;
  readonly 'unicorn/no-unreadable-array-destructuring': NoUnreadableArrayDestructuring.RuleEntry;
  readonly 'unicorn/no-unreadable-iife': NoUnreadableIife.RuleEntry;
  readonly 'unicorn/no-unused-properties': NoUnusedProperties.RuleEntry;
  readonly 'unicorn/no-useless-fallback-in-spread': NoUselessFallbackInSpread.RuleEntry;
  readonly 'unicorn/no-useless-length-check': NoUselessLengthCheck.RuleEntry;
  readonly 'unicorn/no-useless-promise-resolve-reject': NoUselessPromiseResolveReject.RuleEntry;
  readonly 'unicorn/no-useless-spread': NoUselessSpread.RuleEntry;
  readonly 'unicorn/no-useless-switch-case': NoUselessSwitchCase.RuleEntry;
  readonly 'unicorn/no-useless-undefined': NoUselessUndefined.RuleEntry;
  readonly 'unicorn/no-zero-fractions': NoZeroFractions.RuleEntry;
  readonly 'unicorn/number-literal-case': NumberLiteralCase.RuleEntry;
  readonly 'unicorn/numeric-separators-style': NumericSeparatorsStyle.RuleEntry;
  readonly 'unicorn/prefer-add-event-listener': PreferAddEventListener.RuleEntry;
  readonly 'unicorn/prefer-array-find': PreferArrayFind.RuleEntry;
  readonly 'unicorn/prefer-array-flat-map': PreferArrayFlatMap.RuleEntry;
  readonly 'unicorn/prefer-array-flat': PreferArrayFlat.RuleEntry;
  readonly 'unicorn/prefer-array-index-of': PreferArrayIndexOf.RuleEntry;
  readonly 'unicorn/prefer-array-some': PreferArraySome.RuleEntry;
  readonly 'unicorn/prefer-at': PreferAt.RuleEntry;
  readonly 'unicorn/prefer-blob-reading-methods': PreferBlobReadingMethods.RuleEntry;
  readonly 'unicorn/prefer-code-point': PreferCodePoint.RuleEntry;
  readonly 'unicorn/prefer-date-now': PreferDateNow.RuleEntry;
  readonly 'unicorn/prefer-default-parameters': PreferDefaultParameters.RuleEntry;
  readonly 'unicorn/prefer-dom-node-append': PreferDomNodeAppend.RuleEntry;
  readonly 'unicorn/prefer-dom-node-dataset': PreferDomNodeDataset.RuleEntry;
  readonly 'unicorn/prefer-dom-node-remove': PreferDomNodeRemove.RuleEntry;
  readonly 'unicorn/prefer-dom-node-text-content': PreferDomNodeTextContent.RuleEntry;
  readonly 'unicorn/prefer-event-target': PreferEventTarget.RuleEntry;
  readonly 'unicorn/prefer-export-from': PreferExportFrom.RuleEntry;
  readonly 'unicorn/prefer-global-this': PreferGlobalThis.RuleEntry;
  readonly 'unicorn/prefer-includes': PreferIncludes.RuleEntry;
  readonly 'unicorn/prefer-json-parse-buffer': PreferJsonParseBuffer.RuleEntry;
  readonly 'unicorn/prefer-keyboard-event-key': PreferKeyboardEventKey.RuleEntry;
  readonly 'unicorn/prefer-logical-operator-over-ternary': PreferLogicalOperatorOverTernary.RuleEntry;
  readonly 'unicorn/prefer-math-min-max': PreferMathMinMax.RuleEntry;
  readonly 'unicorn/prefer-math-trunc': PreferMathTrunc.RuleEntry;
  readonly 'unicorn/prefer-modern-dom-apis': PreferModernDomApis.RuleEntry;
  readonly 'unicorn/prefer-modern-math-apis': PreferModernMathApis.RuleEntry;
  readonly 'unicorn/prefer-module': PreferModule.RuleEntry;
  readonly 'unicorn/prefer-native-coercion-functions': PreferNativeCoercionFunctions.RuleEntry;
  readonly 'unicorn/prefer-negative-index': PreferNegativeIndex.RuleEntry;
  readonly 'unicorn/prefer-node-protocol': PreferNodeProtocol.RuleEntry;
  readonly 'unicorn/prefer-number-properties': PreferNumberProperties.RuleEntry;
  readonly 'unicorn/prefer-object-from-entries': PreferObjectFromEntries.RuleEntry;
  readonly 'unicorn/prefer-optional-catch-binding': PreferOptionalCatchBinding.RuleEntry;
  readonly 'unicorn/prefer-prototype-methods': PreferPrototypeMethods.RuleEntry;
  readonly 'unicorn/prefer-query-selector': PreferQuerySelector.RuleEntry;
  readonly 'unicorn/prefer-reflect-apply': PreferReflectApply.RuleEntry;
  readonly 'unicorn/prefer-regexp-test': PreferRegexpTest.RuleEntry;
  readonly 'unicorn/prefer-set-has': PreferSetHas.RuleEntry;
  readonly 'unicorn/prefer-set-size': PreferSetSize.RuleEntry;
  readonly 'unicorn/prefer-spread': PreferSpread.RuleEntry;
  readonly 'unicorn/prefer-string-raw': PreferStringRaw.RuleEntry;
  readonly 'unicorn/prefer-string-replace-all': PreferStringReplaceAll.RuleEntry;
  readonly 'unicorn/prefer-string-slice': PreferStringSlice.RuleEntry;
  readonly 'unicorn/prefer-string-starts-ends-with': PreferStringStartsEndsWith.RuleEntry;
  readonly 'unicorn/prefer-string-trim-start-end': PreferStringTrimStartEnd.RuleEntry;
  readonly 'unicorn/prefer-structured-clone': PreferStructuredClone.RuleEntry;
  readonly 'unicorn/prefer-switch': PreferSwitch.RuleEntry;
  readonly 'unicorn/prefer-ternary': PreferTernary.RuleEntry;
  readonly 'unicorn/prefer-top-level-await': PreferTopLevelAwait.RuleEntry;
  readonly 'unicorn/prefer-type-error': PreferTypeError.RuleEntry;
  readonly 'unicorn/prevent-abbreviations': PreventAbbreviations.RuleEntry;
  readonly 'unicorn/relative-url-style': RelativeUrlStyle.RuleEntry;
  readonly 'unicorn/require-array-join-separator': RequireArrayJoinSeparator.RuleEntry;
  readonly 'unicorn/require-number-to-fixed-digits-argument': RequireNumberToFixedDigitsArgument.RuleEntry;
  readonly 'unicorn/require-post-message-target-origin': RequirePostMessageTargetOrigin.RuleEntry;
  readonly 'unicorn/string-content': StringContent.RuleEntry;
  readonly 'unicorn/switch-case-braces': SwitchCaseBraces.RuleEntry;
  readonly 'unicorn/template-indent': TemplateIndent.RuleEntry;
  readonly 'unicorn/text-encoding-identifier-case': TextEncodingIdentifierCase.RuleEntry;
  readonly 'unicorn/throw-new-error': ThrowNewError.RuleEntry;

  // deprecated
  readonly 'unicorn/import-index': ImportIndex.RuleEntry;
  readonly 'unicorn/no-array-instanceof': NoArrayInstanceof.RuleEntry;
  readonly 'unicorn/no-fn-reference-in-iterator': NoFnReferenceInIterator.RuleEntry;
  readonly 'unicorn/no-reduce': NoReduce.RuleEntry;
  readonly 'unicorn/no-unsafe-regex': NoUnsafeRegex.RuleEntry;
  readonly 'unicorn/prefer-dataset': PreferDataset.RuleEntry;
  readonly 'unicorn/prefer-event-key': PreferEventKey.RuleEntry;
  readonly 'unicorn/prefer-exponentiation-operator': PreferExponentiationOperator.RuleEntry;
  readonly 'unicorn/prefer-flat-map': PreferFlatMap.RuleEntry;
  readonly 'unicorn/prefer-node-append': PreferNodeAppend.RuleEntry;
  readonly 'unicorn/prefer-node-remove': PreferNodeRemove.RuleEntry;
  readonly 'unicorn/prefer-object-has-own': PreferObjectHasOwn.RuleEntry;
  readonly 'unicorn/prefer-replace-all': PreferReplaceAll.RuleEntry;
  readonly 'unicorn/prefer-starts-ends-with': PreferStartsEndsWith.RuleEntry;
  readonly 'unicorn/prefer-text-content': PreferTextContent.RuleEntry;
  readonly 'unicorn/prefer-trim-start-end': PreferTrimStartEnd.RuleEntry;
  readonly 'unicorn/regex-shorthand': RegexShorthand.RuleEntry;
};

export type EslintUnicornRulesOption = {
  readonly 'unicorn/better-regex': BetterRegex.Options;
  readonly 'unicorn/catch-error-name': CatchErrorName.Options;
  readonly 'unicorn/consistent-function-scoping': ConsistentFunctionScoping.Options;
  readonly 'unicorn/expiring-todo-comments': ExpiringTodoComments.Options;
  readonly 'unicorn/explicit-length-check': ExplicitLengthCheck.Options;
  readonly 'unicorn/filename-case': FilenameCase.Options;
  readonly 'unicorn/import-style': ImportStyle.Options;
  readonly 'unicorn/no-array-push-push': NoArrayPushPush.Options;
  readonly 'unicorn/no-array-reduce': NoArrayReduce.Options;
  readonly 'unicorn/no-keyword-prefix': NoKeywordPrefix.Options;
  readonly 'unicorn/no-null': NoNull.Options;
  readonly 'unicorn/no-typeof-undefined': NoTypeofUndefined.Options;
  readonly 'unicorn/no-unnecessary-polyfills': NoUnnecessaryPolyfills.Options;
  readonly 'unicorn/no-useless-undefined': NoUselessUndefined.Options;
  readonly 'unicorn/numeric-separators-style': NumericSeparatorsStyle.Options;
  readonly 'unicorn/prefer-add-event-listener': PreferAddEventListener.Options;
  readonly 'unicorn/prefer-array-find': PreferArrayFind.Options;
  readonly 'unicorn/prefer-array-flat': PreferArrayFlat.Options;
  readonly 'unicorn/prefer-at': PreferAt.Options;
  readonly 'unicorn/prefer-export-from': PreferExportFrom.Options;
  readonly 'unicorn/prefer-number-properties': PreferNumberProperties.Options;
  readonly 'unicorn/prefer-object-from-entries': PreferObjectFromEntries.Options;
  readonly 'unicorn/prefer-structured-clone': PreferStructuredClone.Options;
  readonly 'unicorn/prefer-switch': PreferSwitch.Options;
  readonly 'unicorn/prefer-ternary': PreferTernary.Options;
  readonly 'unicorn/prevent-abbreviations': PreventAbbreviations.Options;
  readonly 'unicorn/relative-url-style': RelativeUrlStyle.Options;
  readonly 'unicorn/string-content': StringContent.Options;
  readonly 'unicorn/switch-case-braces': SwitchCaseBraces.Options;
  readonly 'unicorn/template-indent': TemplateIndent.Options;
};
