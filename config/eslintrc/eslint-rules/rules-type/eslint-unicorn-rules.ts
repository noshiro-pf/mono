/* cSpell:disable */
/* eslint-disable @typescript-eslint/sort-type-union-intersection-members */
import type { Linter } from 'eslint';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleLevel, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleLevel, ...T[1]] : T;

/**
 * @description Improve regexes by making them shorter, consistent, and safer.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/better-regex.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace BetterRegex {
  /**
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
   */
  export type Options = {
    readonly sortCharacterClasses?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce a specific parameter name in catch clauses.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/catch-error-name.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace CatchErrorName {
  /**
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
   */
  export type Options = {
    readonly name?: string;
    readonly ignore?: readonly unknown[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Use destructured variables over properties.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/consistent-destructuring.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace ConsistentDestructuring {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Move function definitions to the highest possible scope.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/consistent-function-scoping.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace ConsistentFunctionScoping {
  /**
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
   */
  export type Options = {
    readonly checkArrowFunctions?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce correct `Error` subclassing.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/custom-error-definition.md
 *
 *  | key     | value   |
 *  | :------ | :------ |
 *  | type    | problem |
 *  | fixable | code    |
 */
namespace CustomErrorDefinition {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce no spaces between braces.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/empty-brace-spaces.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | layout     |
 *  | fixable | whitespace |
 */
namespace EmptyBraceSpaces {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce passing a `message` value when creating a built-in error.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/error-message.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace ErrorMessage {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require escape sequences to use uppercase values.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/escape-case.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace EscapeCase {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Add expiration conditions to TODO comments.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/expiring-todo-comments.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace ExpiringTodoComments {
  /**
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
   *         "default": false
   *       },
   *       "date": {
   *         "type": "string",
   *         "format": "date"
   *       }
   *     }
   *   }
   * ]
   */
  export type Options = {
    readonly terms?: readonly string[];
    readonly ignore?: readonly unknown[];
    readonly ignoreDatesOnPullRequests?: boolean;
    readonly allowWarningComments?: boolean;
    readonly date?: string;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce explicitly comparing the `length` or `size` property of a value.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/explicit-length-check.md
 *
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 */
namespace ExplicitLengthCheck {
  /**
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
   */
  export type Options = {
    readonly 'non-zero'?: 'greater-than' | 'not-equal';
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce a case style for filenames.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/filename-case.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace FilenameCase {
  /**
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
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     ]
   *   }
   * ]
   */
  export type Options =
    | {
        readonly case?: 'camelCase' | 'snakeCase' | 'kebabCase' | 'pascalCase';
        readonly ignore?: readonly unknown[];
      }
    | {
        readonly cases?: {
          readonly camelCase?: boolean;
          readonly snakeCase?: boolean;
          readonly kebabCase?: boolean;
          readonly pascalCase?: boolean;
        };
        readonly ignore?: readonly unknown[];
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce importing index files with `.`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/import-index.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace ImportIndex {
  /**
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "ignoreImports": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     }
   *   }
   * ]
   */
  export type Options = {
    readonly ignoreImports?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce specific import styles per module.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/import-style.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace ImportStyle {
  /**
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
   *           "enum": [
   *             false
   *           ]
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
   */
  export type Options =
    | readonly []
    | readonly [
        {
          readonly checkImport?: boolean;
          readonly checkDynamicImport?: boolean;
          readonly checkExportFrom?: boolean;
          readonly checkRequire?: boolean;
          readonly extendDefaultStyles?: boolean;
          readonly styles?: ModuleStyles;
        }
      ];
  export type Styles = false | BooleanObject;

  export type ModuleStyles = Readonly<Record<string, Styles>>;
  export type BooleanObject = Readonly<Record<string, boolean>>;

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce the use of `new` for all builtins, except `String`, `Number`, `Boolean`, `Symbol` and `BigInt`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/new-for-builtins.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NewForBuiltins {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce specifying rules to disable in `eslint-disable` comments.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-abusive-eslint-disable.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoAbusiveEslintDisable {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent passing a function reference directly to iterator methods.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-array-callback-reference.md
 *
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | hasSuggestions | true    |
 */
namespace NoArrayCallbackReference {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `for…of` over `Array#forEach(…)`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-array-for-each.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NoArrayForEach {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow using the `this` argument in array methods.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-array-method-this-argument.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace NoArrayMethodThisArgument {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce combining multiple `Array#push()` into one call.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-array-push-push.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace NoArrayPushPush {
  /**
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
   */
  export type Options = {
    readonly ignore?: readonly unknown[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow `Array#reduce()` and `Array#reduceRight()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-array-reduce.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoArrayReduce {
  /**
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
   */
  export type Options = {
    readonly allowSimpleOperations?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Forbid member access from await expression.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-await-expression-member.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NoAwaitExpressionMember {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Do not use leading/trailing space between `console.log` parameters.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-console-spaces.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NoConsoleSpaces {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Do not use `document.cookie` directly.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-document-cookie.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace NoDocumentCookie {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow empty files.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-empty-file.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoEmptyFile {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Do not use a `for` loop that can be replaced with a `for-of` loop.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-for-loop.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NoForLoop {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce the use of Unicode escapes instead of hexadecimal escapes.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-hex-escape.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NoHexEscape {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require `Array.isArray()` instead of `instanceof Array`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-instanceof-array.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NoInstanceofArray {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent calling `EventTarget#removeEventListener()` with the result of an expression.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-invalid-remove-event-listener.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace NoInvalidRemoveEventListener {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow identifiers starting with `new` or `class`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-keyword-prefix.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoKeywordPrefix {
  /**
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
   */
  export type Options = {
    readonly disallowedPrefixes?: readonly [] | readonly [string];
    readonly checkProperties?: boolean;
    readonly onlyCamelCase?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow `if` statements as the only statement in `if` blocks without `else`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-lonely-if.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NoLonelyIf {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow nested ternary expressions.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-nested-ternary.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NoNestedTernary {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `new Array()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-new-array.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace NoNewArray {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce the use of `Buffer.from()` and `Buffer.alloc()` instead of the deprecated `new Buffer()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-new-buffer.md
 *
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 */
namespace NoNewBuffer {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow the use of the `null` literal.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-null.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace NoNull {
  /**
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
   */
  export type Options = {
    readonly checkStrictEquality?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow the use of objects as default parameters.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-object-as-default-parameter.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace NoObjectAsDefaultParameter {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `process.exit()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-process-exit.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoProcessExit {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Forbid classes that only have static members.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-static-only-class.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NoStaticOnlyClass {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `then` property.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-thenable.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace NoThenable {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow assigning `this` to a variable.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-this-assignment.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoThisAssignment {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow unreadable array destructuring.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-unreadable-array-destructuring.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NoUnreadableArrayDestructuring {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow unsafe regular expressions.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-unsafe-regex.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace NoUnsafeRegex {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow unused object properties.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-unused-properties.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoUnusedProperties {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Forbid useless fallback when spreading in object literals.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-useless-fallback-in-spread.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NoUselessFallbackInSpread {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow useless array length check.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-useless-length-check.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NoUselessLengthCheck {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow returning/yielding `Promise.resolve/reject()` in async functions or promise callbacks
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-useless-promise-resolve-reject.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NoUselessPromiseResolveReject {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow unnecessary spread.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-useless-spread.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NoUselessSpread {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow useless `undefined`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-useless-undefined.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NoUselessUndefined {
  /**
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "checkArguments": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   */
  export type Options = {
    readonly checkArguments?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow number literals with zero fractions or dangling dots.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/no-zero-fractions.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NoZeroFractions {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce proper case for numeric literals.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/number-literal-case.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NumberLiteralCase {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce the style of numeric separators by correctly grouping digits.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/numeric-separators-style.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NumericSeparatorsStyle {
  /**
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Prefer `.addEventListener()` and `.removeEventListener()` over `on`-functions.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-add-event-listener.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferAddEventListener {
  /**
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
   */
  export type Options = {
    readonly excludedPackages?: readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Prefer `.find(…)` over the first element from `.filter(…)`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-array-find.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace PreferArrayFind {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `.flatMap(…)` over `.map(…).flat()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-array-flat-map.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferArrayFlatMap {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `Array#flat()` over legacy techniques to flatten arrays.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-array-flat.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferArrayFlat {
  /**
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
   */
  export type Options = {
    readonly functions?: readonly unknown[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Prefer `Array#indexOf()` over `Array#findIndex()` when looking for the index of an item.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-array-index-of.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace PreferArrayIndexOf {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `.some(…)` over `.filter(…).length` check and `.find(…)`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-array-some.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace PreferArraySome {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `.at()` method for index access and `String#charAt()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-at.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace PreferAt {
  /**
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
   */
  export type Options = {
    readonly getLastElementFunctions?: readonly unknown[];
    readonly checkAllIndexAccess?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Prefer `String#codePointAt(…)` over `String#charCodeAt(…)` and `String.fromCodePoint(…)` over `String.fromCharCode(…)`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-code-point.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 */
namespace PreferCodePoint {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `Date.now()` to get the number of milliseconds since the Unix Epoch.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-date-now.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferDateNow {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer default parameters over reassignment.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-default-parameters.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace PreferDefaultParameters {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `Node#append()` over `Node#appendChild()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-dom-node-append.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferDomNodeAppend {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer using `.dataset` on DOM elements over calling attribute methods.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-dom-node-dataset.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferDomNodeDataset {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `childNode.remove()` over `parentNode.removeChild(childNode)`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-dom-node-remove.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace PreferDomNodeRemove {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `.textContent` over `.innerText`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-dom-node-text-content.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 */
namespace PreferDomNodeTextContent {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `export…from` when re-exporting.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-export-from.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace PreferExportFrom {
  /**
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
   */
  export type Options = {
    readonly ignoreUsedVariables?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Prefer `.includes()` over `.indexOf()` and `Array#some()` when checking for existence or non-existence.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-includes.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace PreferIncludes {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer reading a JSON file as a buffer.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-json-parse-buffer.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferJsonParseBuffer {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `KeyboardEvent#key` over `KeyboardEvent#keyCode`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-keyboard-event-key.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferKeyboardEventKey {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce the use of `Math.trunc` instead of bitwise operators.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-math-trunc.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace PreferMathTrunc {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `.before()` over `.insertBefore()`, `.replaceWith()` over `.replaceChild()`, prefer one of `.before()`, `.after()`, `.append()` or `.prepend()` over `insertAdjacentText()` and `insertAdjacentElement()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-modern-dom-apis.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferModernDomApis {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer JavaScript modules (ESM) over CommonJS.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-module.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace PreferModule {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer negative index over `.length - index` for `{String,Array,TypedArray}#slice()`, `Array#splice()` and `Array#at()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-negative-index.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferNegativeIndex {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer using the `node:` protocol when importing Node.js builtin modules.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-node-protocol.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferNodeProtocol {
  /**
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "checkRequire": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     }
   *   }
   * ]
   */
  export type Options = {
    readonly checkRequire?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Prefer `Number` static properties over global ones.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-number-properties.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace PreferNumberProperties {
  /**
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "checkInfinity": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     }
   *   }
   * ]
   */
  export type Options = {
    readonly checkInfinity?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Prefer using `Object.fromEntries(…)` to transform a list of key-value pairs into an object.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-object-from-entries.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferObjectFromEntries {
  /**
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
   */
  export type Options = {
    readonly functions?: readonly unknown[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Prefer omitting the `catch` binding parameter.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-optional-catch-binding.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferOptionalCatchBinding {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer borrowing methods from the prototype instead of the instance.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-prototype-methods.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferPrototypeMethods {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `.querySelector()` over `.getElementById()`, `.querySelectorAll()` over `.getElementsByClassName()` and `.getElementsByTagName()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-query-selector.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferQuerySelector {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `Reflect.apply()` over `Function#apply()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-reflect-apply.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferReflectApply {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `RegExp#test()` over `String#match()` and `RegExp#exec()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-regexp-test.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferRegexpTest {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `Set#has()` over `Array#includes()` when checking for existence or non-existence.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-set-has.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace PreferSetHas {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer the spread operator over `Array.from(…)`, `Array#concat(…)`, `Array#slice()` and `String#split('')`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-spread.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace PreferSpread {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `String#replaceAll()` over regex searches with the global flag.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-string-replace-all.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferStringReplaceAll {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `String#slice()` over `String#substr()` and `String#substring()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-string-slice.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferStringSlice {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `String#startsWith()` & `String#endsWith()` over `RegExp#test()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-string-starts-ends-with.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace PreferStringStartsEndsWith {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `String#trimStart()` / `String#trimEnd()` over `String#trimLeft()` / `String#trimRight()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-string-trim-start-end.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferStringTrimStartEnd {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer `switch` over multiple `else-if`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-switch.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferSwitch {
  /**
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
   */
  export type Options = {
    readonly minimumCases?: number;
    readonly emptyDefaultCase?:
      | 'no-default-comment'
      | 'do-nothing-comment'
      | 'no-default-case';
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Prefer ternary expressions over simple `if-else` statements.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-ternary.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferTernary {
  /**
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "only-single-line"
   *     ],
   *     "default": "always"
   *   }
   * ]
   */
  export type Options = 'always' | 'only-single-line';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Prefer top-level await over top-level promises and async function calls.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-top-level-await.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 */
namespace PreferTopLevelAwait {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce throwing `TypeError` in type checking conditions.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prefer-type-error.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreferTypeError {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent abbreviations.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/prevent-abbreviations.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace PreventAbbreviations {
  /**
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
   *           "type": [
   *             "boolean",
   *             "string"
   *           ],
   *           "pattern": "internal"
   *         },
   *         "checkShorthandImports": {
   *           "type": [
   *             "boolean",
   *             "string"
   *           ],
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
   *           "enum": [
   *             false
   *           ]
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
   */
  export type Options =
    | readonly []
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
        }
      ];
  export type Replacements = false | BooleanObject;

  export type Abbreviations = Readonly<Record<string, Replacements>>;
  export type BooleanObject = Readonly<Record<string, boolean>>;

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent relative URL style.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/relative-url-style.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace RelativeUrlStyle {
  /**
   * [
   *   {
   *     "enum": [
   *       "never",
   *       "always"
   *     ],
   *     "default": "never"
   *   }
   * ]
   */
  export type Options = 'never' | 'always';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce using the separator argument with `Array#join()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/require-array-join-separator.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace RequireArrayJoinSeparator {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce using the digits argument with `Number#toFixed()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/require-number-to-fixed-digits-argument.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace RequireNumberToFixedDigitsArgument {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce using the `targetOrigin` argument with `window.postMessage()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/require-post-message-target-origin.md
 *
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | hasSuggestions | true    |
 */
namespace RequirePostMessageTargetOrigin {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce better string content.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/string-content.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 */
namespace StringContent {
  /**
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Fix whitespace-insensitive template indentation.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/template-indent.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace TemplateIndent {
  /**
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
   */
  export type Options = {
    readonly indent?: string | number;
    readonly tags?: readonly string[];
    readonly functions?: readonly string[];
    readonly selectors?: readonly string[];
    readonly comments?: readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent case for text encoding identifiers.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/text-encoding-identifier-case.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 */
namespace TextEncodingIdentifierCase {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require `new` when throwing an error.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/rules/throw-new-error.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace ThrowNewError {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/deprecated-rules.md#no-array-instanceof
 *
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 */
namespace NoArrayInstanceof {
  export type RuleEntry = 'off';
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/deprecated-rules.md#no-fn-reference-in-iterator
 *
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 */
namespace NoFnReferenceInIterator {
  export type RuleEntry = 'off';
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/deprecated-rules.md#no-reduce
 *
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 */
namespace NoReduce {
  export type RuleEntry = 'off';
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/deprecated-rules.md#prefer-dataset
 *
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 */
namespace PreferDataset {
  export type RuleEntry = 'off';
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/deprecated-rules.md#prefer-event-key
 *
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 */
namespace PreferEventKey {
  export type RuleEntry = 'off';
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/deprecated-rules.md#prefer-exponentiation-operator
 *
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 */
namespace PreferExponentiationOperator {
  export type RuleEntry = 'off';
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/deprecated-rules.md#prefer-flat-map
 *
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 */
namespace PreferFlatMap {
  export type RuleEntry = 'off';
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/deprecated-rules.md#prefer-node-append
 *
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 */
namespace PreferNodeAppend {
  export type RuleEntry = 'off';
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/deprecated-rules.md#prefer-node-remove
 *
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 */
namespace PreferNodeRemove {
  export type RuleEntry = 'off';
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/deprecated-rules.md#prefer-object-has-own
 *
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 */
namespace PreferObjectHasOwn {
  export type RuleEntry = 'off';
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/deprecated-rules.md#prefer-replace-all
 *
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 */
namespace PreferReplaceAll {
  export type RuleEntry = 'off';
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/deprecated-rules.md#prefer-starts-ends-with
 *
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 */
namespace PreferStartsEndsWith {
  export type RuleEntry = 'off';
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/deprecated-rules.md#prefer-text-content
 *
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 */
namespace PreferTextContent {
  export type RuleEntry = 'off';
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/deprecated-rules.md#prefer-trim-start-end
 *
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 */
namespace PreferTrimStartEnd {
  export type RuleEntry = 'off';
}

/**
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v41.0.1/docs/deprecated-rules.md#regex-shorthand
 *
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 */
namespace RegexShorthand {
  export type RuleEntry = 'off';
}

export type EslintUnicornRules = {
  readonly 'unicorn/better-regex': BetterRegex.RuleEntry;
  readonly 'unicorn/catch-error-name': CatchErrorName.RuleEntry;
  readonly 'unicorn/consistent-destructuring': ConsistentDestructuring.RuleEntry;
  readonly 'unicorn/consistent-function-scoping': ConsistentFunctionScoping.RuleEntry;
  readonly 'unicorn/custom-error-definition': CustomErrorDefinition.RuleEntry;
  readonly 'unicorn/empty-brace-spaces': EmptyBraceSpaces.RuleEntry;
  readonly 'unicorn/error-message': ErrorMessage.RuleEntry;
  readonly 'unicorn/escape-case': EscapeCase.RuleEntry;
  readonly 'unicorn/expiring-todo-comments': ExpiringTodoComments.RuleEntry;
  readonly 'unicorn/explicit-length-check': ExplicitLengthCheck.RuleEntry;
  readonly 'unicorn/filename-case': FilenameCase.RuleEntry;
  readonly 'unicorn/import-index': ImportIndex.RuleEntry;
  readonly 'unicorn/import-style': ImportStyle.RuleEntry;
  readonly 'unicorn/new-for-builtins': NewForBuiltins.RuleEntry;
  readonly 'unicorn/no-abusive-eslint-disable': NoAbusiveEslintDisable.RuleEntry;
  readonly 'unicorn/no-array-callback-reference': NoArrayCallbackReference.RuleEntry;
  readonly 'unicorn/no-array-for-each': NoArrayForEach.RuleEntry;
  readonly 'unicorn/no-array-method-this-argument': NoArrayMethodThisArgument.RuleEntry;
  readonly 'unicorn/no-array-push-push': NoArrayPushPush.RuleEntry;
  readonly 'unicorn/no-array-reduce': NoArrayReduce.RuleEntry;
  readonly 'unicorn/no-await-expression-member': NoAwaitExpressionMember.RuleEntry;
  readonly 'unicorn/no-console-spaces': NoConsoleSpaces.RuleEntry;
  readonly 'unicorn/no-document-cookie': NoDocumentCookie.RuleEntry;
  readonly 'unicorn/no-empty-file': NoEmptyFile.RuleEntry;
  readonly 'unicorn/no-for-loop': NoForLoop.RuleEntry;
  readonly 'unicorn/no-hex-escape': NoHexEscape.RuleEntry;
  readonly 'unicorn/no-instanceof-array': NoInstanceofArray.RuleEntry;
  readonly 'unicorn/no-invalid-remove-event-listener': NoInvalidRemoveEventListener.RuleEntry;
  readonly 'unicorn/no-keyword-prefix': NoKeywordPrefix.RuleEntry;
  readonly 'unicorn/no-lonely-if': NoLonelyIf.RuleEntry;
  readonly 'unicorn/no-nested-ternary': NoNestedTernary.RuleEntry;
  readonly 'unicorn/no-new-array': NoNewArray.RuleEntry;
  readonly 'unicorn/no-new-buffer': NoNewBuffer.RuleEntry;
  readonly 'unicorn/no-null': NoNull.RuleEntry;
  readonly 'unicorn/no-object-as-default-parameter': NoObjectAsDefaultParameter.RuleEntry;
  readonly 'unicorn/no-process-exit': NoProcessExit.RuleEntry;
  readonly 'unicorn/no-static-only-class': NoStaticOnlyClass.RuleEntry;
  readonly 'unicorn/no-thenable': NoThenable.RuleEntry;
  readonly 'unicorn/no-this-assignment': NoThisAssignment.RuleEntry;
  readonly 'unicorn/no-unreadable-array-destructuring': NoUnreadableArrayDestructuring.RuleEntry;
  readonly 'unicorn/no-unsafe-regex': NoUnsafeRegex.RuleEntry;
  readonly 'unicorn/no-unused-properties': NoUnusedProperties.RuleEntry;
  readonly 'unicorn/no-useless-fallback-in-spread': NoUselessFallbackInSpread.RuleEntry;
  readonly 'unicorn/no-useless-length-check': NoUselessLengthCheck.RuleEntry;
  readonly 'unicorn/no-useless-promise-resolve-reject': NoUselessPromiseResolveReject.RuleEntry;
  readonly 'unicorn/no-useless-spread': NoUselessSpread.RuleEntry;
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
  readonly 'unicorn/prefer-code-point': PreferCodePoint.RuleEntry;
  readonly 'unicorn/prefer-date-now': PreferDateNow.RuleEntry;
  readonly 'unicorn/prefer-default-parameters': PreferDefaultParameters.RuleEntry;
  readonly 'unicorn/prefer-dom-node-append': PreferDomNodeAppend.RuleEntry;
  readonly 'unicorn/prefer-dom-node-dataset': PreferDomNodeDataset.RuleEntry;
  readonly 'unicorn/prefer-dom-node-remove': PreferDomNodeRemove.RuleEntry;
  readonly 'unicorn/prefer-dom-node-text-content': PreferDomNodeTextContent.RuleEntry;
  readonly 'unicorn/prefer-export-from': PreferExportFrom.RuleEntry;
  readonly 'unicorn/prefer-includes': PreferIncludes.RuleEntry;
  readonly 'unicorn/prefer-json-parse-buffer': PreferJsonParseBuffer.RuleEntry;
  readonly 'unicorn/prefer-keyboard-event-key': PreferKeyboardEventKey.RuleEntry;
  readonly 'unicorn/prefer-math-trunc': PreferMathTrunc.RuleEntry;
  readonly 'unicorn/prefer-modern-dom-apis': PreferModernDomApis.RuleEntry;
  readonly 'unicorn/prefer-module': PreferModule.RuleEntry;
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
  readonly 'unicorn/prefer-spread': PreferSpread.RuleEntry;
  readonly 'unicorn/prefer-string-replace-all': PreferStringReplaceAll.RuleEntry;
  readonly 'unicorn/prefer-string-slice': PreferStringSlice.RuleEntry;
  readonly 'unicorn/prefer-string-starts-ends-with': PreferStringStartsEndsWith.RuleEntry;
  readonly 'unicorn/prefer-string-trim-start-end': PreferStringTrimStartEnd.RuleEntry;
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
  readonly 'unicorn/template-indent': TemplateIndent.RuleEntry;
  readonly 'unicorn/text-encoding-identifier-case': TextEncodingIdentifierCase.RuleEntry;
  readonly 'unicorn/throw-new-error': ThrowNewError.RuleEntry;
  readonly 'unicorn/no-array-instanceof': NoArrayInstanceof.RuleEntry;
  readonly 'unicorn/no-fn-reference-in-iterator': NoFnReferenceInIterator.RuleEntry;
  readonly 'unicorn/no-reduce': NoReduce.RuleEntry;
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
