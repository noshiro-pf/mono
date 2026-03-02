/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * @description Improve regexes by making them shorter, consistent, and safer.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/better-regex.md
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
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    sortCharacterClasses?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce a specific parameter name in catch clauses.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/catch-error-name.md
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
  export type Options = Readonly<{
    name?: string;
    ignore?: readonly unknown[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce consistent assertion style with `node:assert`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/consistent-assert.md
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
namespace ConsistentAssert {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer passing `Date` directly to the constructor when cloning.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/consistent-date-clone.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace ConsistentDateClone {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Use destructured variables over properties.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/consistent-destructuring.md
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
namespace ConsistentDestructuring {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer consistent types when spreading a ternary in an array literal.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/consistent-empty-array-spread.md
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
namespace ConsistentEmptyArraySpread {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce consistent style for element existence checks with `indexOf()`, `lastIndexOf()`, `findIndex()`, and `findLastIndex()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/consistent-existence-index-check.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | problem       |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace ConsistentExistenceIndexCheck {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Move function definitions to the highest possible scope.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/consistent-function-scoping.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    checkArrowFunctions?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce correct `Error` subclassing.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/custom-error-definition.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | fixable     | code    |
 *  | recommended | false   |
 *  ```
 */
namespace CustomErrorDefinition {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce no spaces between braces.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/empty-brace-spaces.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | false      |
 *  | fixable     | whitespace |
 *  | recommended | true       |
 *  ```
 */
namespace EmptyBraceSpaces {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce passing a `message` value when creating a built-in error.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/error-message.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | problem       |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace ErrorMessage {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Require escape sequences to use uppercase or lowercase values.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/escape-case.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace EscapeCase {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "uppercase",
   *       "lowercase"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'uppercase' | 'lowercase';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Add expiration conditions to TODO comments.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/expiring-todo-comments.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
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
   *         "type": "boolean"
   *       },
   *       "allowWarningComments": {
   *         "type": "boolean"
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
  export type Options = Readonly<{
    terms?: readonly string[];
    ignore?: readonly unknown[];
    ignoreDatesOnPullRequests?: boolean;
    allowWarningComments?: boolean;
    date?: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce explicitly comparing the `length` or `size` property of a value.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/explicit-length-check.md
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
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
  export type Options = Readonly<{
    /**
     * @default "greater-than"
     */
    'non-zero'?: 'greater-than' | 'not-equal';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce a case style for filenames.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/filename-case.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
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
  export type Options = Readonly<
    | {
        case?: 'camelCase' | 'snakeCase' | 'kebabCase' | 'pascalCase';
        ignore?: readonly unknown[];
        multipleFileExtensions?: boolean;
      }
    | {
        cases?: Readonly<{
          camelCase?: boolean;
          snakeCase?: boolean;
          kebabCase?: boolean;
          pascalCase?: boolean;
        }>;
        ignore?: readonly unknown[];
        multipleFileExtensions?: boolean;
      }
  >;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce specific import styles per module.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/import-style.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | problem       |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace ImportStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "array",
   *     "additionalItems": false,
   *     "items": [
   *       {
   *         "type": "object",
   *         "additionalProperties": false,
   *         "properties": {
   *           "checkImport": {
   *             "type": "boolean"
   *           },
   *           "checkDynamicImport": {
   *             "type": "boolean"
   *           },
   *           "checkExportFrom": {
   *             "type": "boolean"
   *           },
   *           "checkRequire": {
   *             "type": "boolean"
   *           },
   *           "extendDefaultStyles": {
   *             "type": "boolean"
   *           },
   *           "styles": {
   *             "$ref": "#/definitions/moduleStyles"
   *           }
   *         }
   *       }
   *     ],
   *     "definitions": {
   *       "moduleStyles": {
   *         "type": "object",
   *         "additionalProperties": {
   *           "$ref": "#/definitions/styles"
   *         }
   *       },
   *       "styles": {
   *         "anyOf": [
   *           {
   *             "enum": [
   *               false
   *             ]
   *           },
   *           {
   *             "$ref": "#/definitions/booleanObject"
   *           }
   *         ]
   *       },
   *       "booleanObject": {
   *         "type": "object",
   *         "properties": {
   *           "default": {
   *             "type": "boolean"
   *           },
   *           "named": {
   *             "type": "boolean"
   *           },
   *           "namespace": {
   *             "type": "boolean"
   *           },
   *           "unassigned": {
   *             "type": "boolean"
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options =
    | readonly []
    | readonly [
        Readonly<{
          checkImport?: boolean;
          checkDynamicImport?: boolean;
          checkExportFrom?: boolean;
          checkRequire?: boolean;
          extendDefaultStyles?: boolean;
          styles?: ModuleStyles;
        }>,
      ];

  export type Styles = false | BooleanObject;

  export type ModuleStyles = Readonly<Record<string, Styles>>;

  export type BooleanObject = Readonly<{
    default?: boolean;
    named?: boolean;
    namespace?: boolean;
    unassigned?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prevent usage of variables from outside the scope of isolated functions.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/isolated-functions.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace IsolatedFunctions {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "overrideGlobals": {
   *         "additionalProperties": {
   *           "anyOf": [
   *             {
   *               "type": "boolean"
   *             },
   *             {
   *               "type": "string",
   *               "enum": [
   *                 "readonly",
   *                 "writable",
   *                 "writeable",
   *                 "off"
   *               ]
   *             }
   *           ]
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
  export type Options = Readonly<{
    overrideGlobals?: Readonly<
      Record<string, boolean | ('readonly' | 'writable' | 'writeable' | 'off')>
    >;
    functions?: readonly string[];
    selectors?: readonly string[];
    comments?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce the use of `new` for all builtins, except `String`, `Number`, `Boolean`, `Symbol` and `BigInt`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/new-for-builtins.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace NewForBuiltins {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce specifying rules to disable in `eslint-disable` comments.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-abusive-eslint-disable.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoAbusiveEslintDisable {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow recursive access to `this` within getters and setters.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-accessor-recursion.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | problem       |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoAccessorRecursion {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow anonymous functions and classes as the default export.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-anonymous-default-export.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace NoAnonymousDefaultExport {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prevent passing a function reference directly to iterator methods.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-array-callback-reference.md
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
namespace NoArrayCallbackReference {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `for…of` over the `forEach` method.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-array-for-each.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace NoArrayForEach {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow using the `this` argument in array methods.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-array-method-this-argument.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace NoArrayMethodThisArgument {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow `Array#reduce()` and `Array#reduceRight()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-array-reduce.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowSimpleOperations?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `Array#toReversed()` over `Array#reverse()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-array-reverse.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace NoArrayReverse {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowExpressionStatement": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowExpressionStatement?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `Array#toSorted()` over `Array#sort()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-array-sort.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace NoArraySort {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowExpressionStatement": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowExpressionStatement?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow member access from await expression.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-await-expression-member.md
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
namespace NoAwaitExpressionMember {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow using `await` in `Promise` method parameters.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-await-in-promise-methods.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace NoAwaitInPromiseMethods {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Do not use leading/trailing space between `console.log` parameters.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-console-spaces.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoConsoleSpaces {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Do not use `document.cookie` directly.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-document-cookie.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | problem       |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoDocumentCookie {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow empty files.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-empty-file.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoEmptyFile {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Do not use a `for` loop that can be replaced with a `for-of` loop.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-for-loop.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoForLoop {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce the use of Unicode escapes instead of hexadecimal escapes.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-hex-escape.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoHexEscape {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow immediate mutation after variable assignment.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-immediate-mutation.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoImmediateMutation {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow `instanceof` with built-in objects
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-instanceof-builtins.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | problem       |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace NoInstanceofBuiltins {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "useErrorIsError": {
   *         "type": "boolean"
   *       },
   *       "strategy": {
   *         "enum": [
   *           "loose",
   *           "strict"
   *         ]
   *       },
   *       "include": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "exclude": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    useErrorIsError?: boolean;
    strategy?: 'loose' | 'strict';
    include?: readonly string[];
    exclude?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow invalid options in `fetch()` and `new Request()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-invalid-fetch-options.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | problem       |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoInvalidFetchOptions {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prevent calling `EventTarget#removeEventListener()` with the result of an expression.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-invalid-remove-event-listener.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | problem       |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoInvalidRemoveEventListener {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow identifiers starting with `new` or `class`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-keyword-prefix.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
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
   *         "minItems": 0,
   *         "uniqueItems": true,
   *         "items": {
   *           "type": "string"
   *         }
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
  export type Options = Readonly<{
    /**
     * @minItems 0
     */
    disallowedPrefixes?: readonly string[];
    checkProperties?: boolean;
    onlyCamelCase?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow `if` statements as the only statement in `if` blocks without `else`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-lonely-if.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoLonelyIf {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow a magic number as the `depth` argument in `Array#flat(…).`
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-magic-array-flat-depth.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoMagicArrayFlatDepth {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow named usage of default import and export.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-named-default.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoNamedDefault {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow negated conditions.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-negated-condition.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoNegatedCondition {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow negated expression in equality check.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-negation-in-equality-check.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | problem       |
 *  | deprecated     | false         |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace NoNegationInEqualityCheck {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow nested ternary expressions.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-nested-ternary.md
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
namespace NoNestedTernary {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow `new Array()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-new-array.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace NoNewArray {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce the use of `Buffer.from()` and `Buffer.alloc()` instead of the deprecated `new Buffer()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-new-buffer.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | problem       |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace NoNewBuffer {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow the use of the `null` literal.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-null.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
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
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    checkStrictEquality?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow the use of objects as default parameters.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-object-as-default-parameter.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | problem       |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoObjectAsDefaultParameter {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow `process.exit()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-process-exit.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoProcessExit {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow passing single-element arrays to `Promise` methods.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-single-promise-in-promise-methods.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace NoSinglePromiseInPromiseMethods {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow classes that only have static members.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-static-only-class.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoStaticOnlyClass {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow `then` property.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-thenable.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | problem       |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoThenable {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow assigning `this` to a variable.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-this-assignment.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoThisAssignment {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow comparing `undefined` using `typeof`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-typeof-undefined.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
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
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    checkGlobalVariables?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow using `1` as the `depth` argument of `Array#flat()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-unnecessary-array-flat-depth.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoUnnecessaryArrayFlatDepth {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow using `.length` or `Infinity` as the `deleteCount` or `skipCount` argument of `Array#{splice,toSpliced}()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-unnecessary-array-splice-count.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoUnnecessaryArraySpliceCount {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow awaiting non-promise values.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-unnecessary-await.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoUnnecessaryAwait {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce the use of built-in methods instead of unnecessary polyfills.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-unnecessary-polyfills.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
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
  export type Options = Readonly<{
    targets: string | readonly unknown[] | Readonly<Record<string, unknown>>;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow using `.length` or `Infinity` as the `end` argument of `{Array,String,TypedArray}#slice()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-unnecessary-slice-end.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoUnnecessarySliceEnd {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow unreadable array destructuring.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-unreadable-array-destructuring.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoUnreadableArrayDestructuring {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow unreadable IIFEs.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-unreadable-iife.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | hasSuggestions | false         |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace NoUnreadableIife {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow unused object properties.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-unused-properties.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoUnusedProperties {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow useless values or fallbacks in `Set`, `Map`, `WeakSet`, or `WeakMap`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-useless-collection-argument.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace NoUselessCollectionArgument {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow unnecessary `Error.captureStackTrace(…)`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-useless-error-capture-stack-trace.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoUselessErrorCaptureStackTrace {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow useless fallback when spreading in object literals.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-useless-fallback-in-spread.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoUselessFallbackInSpread {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow useless array length check.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-useless-length-check.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoUselessLengthCheck {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow returning/yielding `Promise.resolve/reject()` in async functions or promise callbacks
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-useless-promise-resolve-reject.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoUselessPromiseResolveReject {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow unnecessary spread.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-useless-spread.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoUselessSpread {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow useless case in switch statements.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-useless-switch-case.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace NoUselessSwitchCase {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow useless `undefined`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-useless-undefined.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
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
  export type Options = Readonly<{
    checkArguments?: boolean;
    checkArrowFunctionBody?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow number literals with zero fractions or dangling dots.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/no-zero-fractions.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoZeroFractions {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce proper case for numeric literals.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/number-literal-case.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NumberLiteralCase {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "hexadecimalValue": {
   *         "enum": [
   *           "uppercase",
   *           "lowercase"
   *         ]
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    hexadecimalValue?: 'uppercase' | 'lowercase';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce the style of numeric separators by correctly grouping digits.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/numeric-separators-style.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
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
   *             "minimum": 0
   *           },
   *           "groupLength": {
   *             "type": "integer",
   *             "minimum": 1
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
   *             "minimum": 0
   *           },
   *           "groupLength": {
   *             "type": "integer",
   *             "minimum": 1
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
   *             "minimum": 0
   *           },
   *           "groupLength": {
   *             "type": "integer",
   *             "minimum": 1
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
   *             "minimum": 0
   *           },
   *           "groupLength": {
   *             "type": "integer",
   *             "minimum": 1
   *           }
   *         }
   *       },
   *       "onlyIfContainsSeparator": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    binary?: Readonly<{
      onlyIfContainsSeparator?: boolean;
      minimumDigits?: number;
      groupLength?: number;
    }>;
    octal?: Readonly<{
      onlyIfContainsSeparator?: boolean;
      minimumDigits?: number;
      groupLength?: number;
    }>;
    hexadecimal?: Readonly<{
      onlyIfContainsSeparator?: boolean;
      minimumDigits?: number;
      groupLength?: number;
    }>;
    number?: Readonly<{
      onlyIfContainsSeparator?: boolean;
      minimumDigits?: number;
      groupLength?: number;
    }>;
    onlyIfContainsSeparator?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `.addEventListener()` and `.removeEventListener()` over `on`-functions.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-add-event-listener.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
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
  export type Options = Readonly<{
    excludedPackages?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `.find(…)` and `.findLast(…)` over the first or last element from `.filter(…)`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-array-find.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
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
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    checkFromLast?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `Array#flat()` over legacy techniques to flatten arrays.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-array-flat.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
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
  export type Options = Readonly<{
    functions?: readonly unknown[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `.flatMap(…)` over `.map(…).flat()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-array-flat-map.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferArrayFlatMap {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `Array#{indexOf,lastIndexOf}()` over `Array#{findIndex,findLastIndex}()` when looking for the index of an item.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-array-index-of.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace PreferArrayIndexOf {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `.some(…)` over `.filter(…).length` check and `.{find,findLast,findIndex,findLastIndex}(…)`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-array-some.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace PreferArraySome {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `.at()` method for index access and `String#charAt()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-at.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
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
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    getLastElementFunctions?: readonly unknown[];
    checkAllIndexAccess?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `BigInt` literals over the constructor.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-bigint-literals.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace PreferBigintLiterals {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `Blob#arrayBuffer()` over `FileReader#readAsArrayBuffer(…)` and `Blob#text()` over `FileReader#readAsText(…)`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-blob-reading-methods.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferBlobReadingMethods {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer class field declarations over `this` assignments in constructors.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-class-fields.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace PreferClassFields {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer using `Element#classList.toggle()` to toggle class names.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-classlist-toggle.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace PreferClasslistToggle {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `String#codePointAt(…)` over `String#charCodeAt(…)` and `String.fromCodePoint(…)` over `String.fromCharCode(…)`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-code-point.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace PreferCodePoint {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `Date.now()` to get the number of milliseconds since the Unix Epoch.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-date-now.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferDateNow {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer default parameters over reassignment.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-default-parameters.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace PreferDefaultParameters {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `Node#append()` over `Node#appendChild()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-dom-node-append.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferDomNodeAppend {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer using `.dataset` on DOM elements over calling attribute methods.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-dom-node-dataset.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferDomNodeDataset {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `childNode.remove()` over `parentNode.removeChild(childNode)`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-dom-node-remove.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace PreferDomNodeRemove {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `.textContent` over `.innerText`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-dom-node-text-content.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace PreferDomNodeTextContent {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `EventTarget` over `EventEmitter`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-event-target.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferEventTarget {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `export…from` when re-exporting.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-export-from.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
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
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    ignoreUsedVariables?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `globalThis` over `window`, `self`, and `global`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-global-this.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | false         |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace PreferGlobalThis {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `import.meta.{dirname,filename}` over legacy techniques for getting file paths.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-import-meta-properties.md
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
namespace PreferImportMetaProperties {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `.includes()` over `.indexOf()`, `.lastIndexOf()`, and `Array#some()` when checking for existence or non-existence.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-includes.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace PreferIncludes {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer reading a JSON file as a buffer.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-json-parse-buffer.md
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
namespace PreferJsonParseBuffer {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `KeyboardEvent#key` over `KeyboardEvent#keyCode`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-keyboard-event-key.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferKeyboardEventKey {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer using a logical operator over a ternary.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-logical-operator-over-ternary.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace PreferLogicalOperatorOverTernary {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `Math.min()` and `Math.max()` over ternaries for simple comparisons.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-math-min-max.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | problem       |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferMathMinMax {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce the use of `Math.trunc` instead of bitwise operators.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-math-trunc.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace PreferMathTrunc {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `.before()` over `.insertBefore()`, `.replaceWith()` over `.replaceChild()`, prefer one of `.before()`, `.after()`, `.append()` or `.prepend()` over `insertAdjacentText()` and `insertAdjacentElement()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-modern-dom-apis.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferModernDomApis {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer modern `Math` APIs over legacy patterns.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-modern-math-apis.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferModernMathApis {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer JavaScript modules (ESM) over CommonJS.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-module.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace PreferModule {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer using `String`, `Number`, `BigInt`, `Boolean`, and `Symbol` directly.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-native-coercion-functions.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferNativeCoercionFunctions {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer negative index over `.length - index` when possible.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-negative-index.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferNegativeIndex {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer using the `node:` protocol when importing Node.js builtin modules.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-node-protocol.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferNodeProtocol {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `Number` static properties over global ones.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-number-properties.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
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
   *         "type": "boolean"
   *       },
   *       "checkNaN": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    checkInfinity?: boolean;
    checkNaN?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer using `Object.fromEntries(…)` to transform a list of key-value pairs into an object.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-object-from-entries.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
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
  export type Options = Readonly<{
    functions?: readonly unknown[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer omitting the `catch` binding parameter.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-optional-catch-binding.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferOptionalCatchBinding {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer borrowing methods from the prototype instead of the instance.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-prototype-methods.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferPrototypeMethods {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `.querySelector()` over `.getElementById()`, `.querySelectorAll()` over `.getElementsByClassName()` and `.getElementsByTagName()` and `.getElementsByName()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-query-selector.md
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
namespace PreferQuerySelector {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `Reflect.apply()` over `Function#apply()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-reflect-apply.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferReflectApply {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `RegExp#test()` over `String#match()` and `RegExp#exec()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-regexp-test.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace PreferRegexpTest {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `Response.json()` over `new Response(JSON.stringify())`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-response-static-json.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferResponseStaticJson {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `Set#has()` over `Array#includes()` when checking for existence or non-existence.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-set-has.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace PreferSetHas {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer using `Set#size` instead of `Array#length`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-set-size.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferSetSize {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce combining multiple `Array#push()`, `Element#classList.{add,remove}()`, and `importScripts()` into one call.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-single-call.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace PreferSingleCall {
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
  export type Options = Readonly<{
    ignore?: readonly unknown[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer the spread operator over `Array.from(…)`, `Array#concat(…)`, `Array#{slice,toSpliced}()` and `String#split('')`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-spread.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace PreferSpread {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer using the `String.raw` tag to avoid escaping `\`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-string-raw.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferStringRaw {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `String#replaceAll()` over regex searches with the global flag.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-string-replace-all.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferStringReplaceAll {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `String#slice()` over `String#substr()` and `String#substring()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-string-slice.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferStringSlice {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `String#startsWith()` & `String#endsWith()` over `RegExp#test()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-string-starts-ends-with.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace PreferStringStartsEndsWith {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `String#trimStart()` / `String#trimEnd()` over `String#trimLeft()` / `String#trimRight()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-string-trim-start-end.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferStringTrimStartEnd {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer using `structuredClone` to create a deep clone.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-structured-clone.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
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
  export type Options = Readonly<{
    functions?: readonly unknown[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `switch` over multiple `else-if`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-switch.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
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
   *         "minimum": 2
   *       },
   *       "emptyDefaultCase": {
   *         "enum": [
   *           "no-default-comment",
   *           "do-nothing-comment",
   *           "no-default-case"
   *         ]
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    minimumCases?: number;
    emptyDefaultCase?:
      | 'no-default-comment'
      | 'do-nothing-comment'
      | 'no-default-case';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer ternary expressions over simple `if-else` statements.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-ternary.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
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
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'always' | 'only-single-line';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer top-level await over top-level promises and async function calls.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-top-level-await.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace PreferTopLevelAwait {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce throwing `TypeError` in type checking conditions.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prefer-type-error.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferTypeError {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prevent abbreviations.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/prevent-abbreviations.md
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
namespace PreventAbbreviations {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "array",
   *     "additionalItems": false,
   *     "items": [
   *       {
   *         "type": "object",
   *         "additionalProperties": false,
   *         "properties": {
   *           "checkProperties": {
   *             "type": "boolean"
   *           },
   *           "checkVariables": {
   *             "type": "boolean"
   *           },
   *           "checkDefaultAndNamespaceImports": {
   *             "type": [
   *               "boolean",
   *               "string"
   *             ],
   *             "pattern": "internal"
   *           },
   *           "checkShorthandImports": {
   *             "type": [
   *               "boolean",
   *               "string"
   *             ],
   *             "pattern": "internal"
   *           },
   *           "checkShorthandProperties": {
   *             "type": "boolean"
   *           },
   *           "checkFilenames": {
   *             "type": "boolean"
   *           },
   *           "extendDefaultReplacements": {
   *             "type": "boolean"
   *           },
   *           "replacements": {
   *             "$ref": "#/definitions/abbreviations"
   *           },
   *           "extendDefaultAllowList": {
   *             "type": "boolean"
   *           },
   *           "allowList": {
   *             "$ref": "#/definitions/booleanObject"
   *           },
   *           "ignore": {
   *             "type": "array",
   *             "uniqueItems": true
   *           }
   *         }
   *       }
   *     ],
   *     "definitions": {
   *       "abbreviations": {
   *         "type": "object",
   *         "additionalProperties": {
   *           "$ref": "#/definitions/replacements"
   *         }
   *       },
   *       "replacements": {
   *         "anyOf": [
   *           {
   *             "enum": [
   *               false
   *             ]
   *           },
   *           {
   *             "$ref": "#/definitions/booleanObject"
   *           }
   *         ]
   *       },
   *       "booleanObject": {
   *         "type": "object",
   *         "additionalProperties": {
   *           "type": "boolean"
   *         }
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options =
    | readonly []
    | readonly [
        Readonly<{
          checkProperties?: boolean;
          checkVariables?: boolean;
          checkDefaultAndNamespaceImports?: boolean | string;
          checkShorthandImports?: boolean | string;
          checkShorthandProperties?: boolean;
          checkFilenames?: boolean;
          extendDefaultReplacements?: boolean;
          replacements?: Abbreviations;
          extendDefaultAllowList?: boolean;
          allowList?: BooleanObject;
          ignore?: readonly unknown[];
        }>,
      ];

  export type Replacements = false | BooleanObject;

  export type Abbreviations = Readonly<Record<string, Replacements>>;

  export type BooleanObject = Readonly<Record<string, boolean>>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce consistent relative URL style.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/relative-url-style.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
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
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'never' | 'always';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce using the separator argument with `Array#join()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/require-array-join-separator.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace RequireArrayJoinSeparator {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Require non-empty module attributes for imports and exports
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/require-module-attributes.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace RequireModuleAttributes {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Require non-empty specifier list in import and export statements.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/require-module-specifiers.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace RequireModuleSpecifiers {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce using the digits argument with `Number#toFixed()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/require-number-to-fixed-digits-argument.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace RequireNumberToFixedDigitsArgument {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce using the `targetOrigin` argument with `window.postMessage()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/require-post-message-target-origin.md
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | hasSuggestions | true    |
 *  | recommended    | false   |
 *  ```
 */
namespace RequirePostMessageTargetOrigin {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce better string content.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/string-content.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
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
  export type Options = Readonly<{
    patterns?: Readonly<
      Record<
        string,
        | string
        | Readonly<{
            suggest: string;
            fix?: boolean;
            message?: string;
          }>
      >
    >;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce consistent brace style for `case` clauses.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/switch-case-braces.md
 *
 *  ```md
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | deprecated  | false  |
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Fix whitespace-insensitive template indentation.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/template-indent.md
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
  export type Options = Readonly<{
    indent?: string | number;
    tags?: readonly string[];
    functions?: readonly string[];
    selectors?: readonly string[];
    comments?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce consistent case for text encoding identifiers.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/text-encoding-identifier-case.md
 *
 *  ```md
 *  | key            | value         |
 *  | :------------- | :------------ |
 *  | type           | suggestion    |
 *  | deprecated     | false         |
 *  | fixable        | code          |
 *  | hasSuggestions | true          |
 *  | recommended    | unopinionated |
 *  ```
 */
namespace TextEncodingIdentifierCase {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "withDash": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    withDash?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Require `new` when creating an error.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/rules/throw-new-error.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | fixable     | code          |
 *  | recommended | unopinionated |
 *  ```
 */
namespace ThrowNewError {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Replaced by `unicorn/no-instanceof-builtins` which covers more cases.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/deleted-and-deprecated-rules.md#no-instanceof-array
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace NoInstanceofArray {
  export type RuleEntry = 0;
}

/**
 * @description Replaced by `unicorn/no-unnecessary-slice-end` which covers more cases.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/deleted-and-deprecated-rules.md#no-length-as-slice-end
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace NoLengthAsSliceEnd {
  export type RuleEntry = 0;
}

/**
 * @description Replaced by `unicorn/prefer-single-call` which covers more cases.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v63.0.0/docs/deleted-and-deprecated-rules.md#no-array-push-push
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace NoArrayPushPush {
  export type RuleEntry = 0;
}

export type EslintUnicornRules = Readonly<{
  'unicorn/better-regex': BetterRegex.RuleEntry;
  'unicorn/catch-error-name': CatchErrorName.RuleEntry;
  'unicorn/consistent-assert': ConsistentAssert.RuleEntry;
  'unicorn/consistent-date-clone': ConsistentDateClone.RuleEntry;
  'unicorn/consistent-destructuring': ConsistentDestructuring.RuleEntry;
  'unicorn/consistent-empty-array-spread': ConsistentEmptyArraySpread.RuleEntry;
  'unicorn/consistent-existence-index-check': ConsistentExistenceIndexCheck.RuleEntry;
  'unicorn/consistent-function-scoping': ConsistentFunctionScoping.RuleEntry;
  'unicorn/custom-error-definition': CustomErrorDefinition.RuleEntry;
  'unicorn/empty-brace-spaces': EmptyBraceSpaces.RuleEntry;
  'unicorn/error-message': ErrorMessage.RuleEntry;
  'unicorn/escape-case': EscapeCase.RuleEntry;
  'unicorn/expiring-todo-comments': ExpiringTodoComments.RuleEntry;
  'unicorn/explicit-length-check': ExplicitLengthCheck.RuleEntry;
  'unicorn/filename-case': FilenameCase.RuleEntry;
  'unicorn/import-style': ImportStyle.RuleEntry;
  'unicorn/isolated-functions': IsolatedFunctions.RuleEntry;
  'unicorn/new-for-builtins': NewForBuiltins.RuleEntry;
  'unicorn/no-abusive-eslint-disable': NoAbusiveEslintDisable.RuleEntry;
  'unicorn/no-accessor-recursion': NoAccessorRecursion.RuleEntry;
  'unicorn/no-anonymous-default-export': NoAnonymousDefaultExport.RuleEntry;
  'unicorn/no-array-callback-reference': NoArrayCallbackReference.RuleEntry;
  'unicorn/no-array-for-each': NoArrayForEach.RuleEntry;
  'unicorn/no-array-method-this-argument': NoArrayMethodThisArgument.RuleEntry;
  'unicorn/no-array-reduce': NoArrayReduce.RuleEntry;
  'unicorn/no-array-reverse': NoArrayReverse.RuleEntry;
  'unicorn/no-array-sort': NoArraySort.RuleEntry;
  'unicorn/no-await-expression-member': NoAwaitExpressionMember.RuleEntry;
  'unicorn/no-await-in-promise-methods': NoAwaitInPromiseMethods.RuleEntry;
  'unicorn/no-console-spaces': NoConsoleSpaces.RuleEntry;
  'unicorn/no-document-cookie': NoDocumentCookie.RuleEntry;
  'unicorn/no-empty-file': NoEmptyFile.RuleEntry;
  'unicorn/no-for-loop': NoForLoop.RuleEntry;
  'unicorn/no-hex-escape': NoHexEscape.RuleEntry;
  'unicorn/no-immediate-mutation': NoImmediateMutation.RuleEntry;
  'unicorn/no-instanceof-builtins': NoInstanceofBuiltins.RuleEntry;
  'unicorn/no-invalid-fetch-options': NoInvalidFetchOptions.RuleEntry;
  'unicorn/no-invalid-remove-event-listener': NoInvalidRemoveEventListener.RuleEntry;
  'unicorn/no-keyword-prefix': NoKeywordPrefix.RuleEntry;
  'unicorn/no-lonely-if': NoLonelyIf.RuleEntry;
  'unicorn/no-magic-array-flat-depth': NoMagicArrayFlatDepth.RuleEntry;
  'unicorn/no-named-default': NoNamedDefault.RuleEntry;
  'unicorn/no-negated-condition': NoNegatedCondition.RuleEntry;
  'unicorn/no-negation-in-equality-check': NoNegationInEqualityCheck.RuleEntry;
  'unicorn/no-nested-ternary': NoNestedTernary.RuleEntry;
  'unicorn/no-new-array': NoNewArray.RuleEntry;
  'unicorn/no-new-buffer': NoNewBuffer.RuleEntry;
  'unicorn/no-null': NoNull.RuleEntry;
  'unicorn/no-object-as-default-parameter': NoObjectAsDefaultParameter.RuleEntry;
  'unicorn/no-process-exit': NoProcessExit.RuleEntry;
  'unicorn/no-single-promise-in-promise-methods': NoSinglePromiseInPromiseMethods.RuleEntry;
  'unicorn/no-static-only-class': NoStaticOnlyClass.RuleEntry;
  'unicorn/no-thenable': NoThenable.RuleEntry;
  'unicorn/no-this-assignment': NoThisAssignment.RuleEntry;
  'unicorn/no-typeof-undefined': NoTypeofUndefined.RuleEntry;
  'unicorn/no-unnecessary-array-flat-depth': NoUnnecessaryArrayFlatDepth.RuleEntry;
  'unicorn/no-unnecessary-array-splice-count': NoUnnecessaryArraySpliceCount.RuleEntry;
  'unicorn/no-unnecessary-await': NoUnnecessaryAwait.RuleEntry;
  'unicorn/no-unnecessary-polyfills': NoUnnecessaryPolyfills.RuleEntry;
  'unicorn/no-unnecessary-slice-end': NoUnnecessarySliceEnd.RuleEntry;
  'unicorn/no-unreadable-array-destructuring': NoUnreadableArrayDestructuring.RuleEntry;
  'unicorn/no-unreadable-iife': NoUnreadableIife.RuleEntry;
  'unicorn/no-unused-properties': NoUnusedProperties.RuleEntry;
  'unicorn/no-useless-collection-argument': NoUselessCollectionArgument.RuleEntry;
  'unicorn/no-useless-error-capture-stack-trace': NoUselessErrorCaptureStackTrace.RuleEntry;
  'unicorn/no-useless-fallback-in-spread': NoUselessFallbackInSpread.RuleEntry;
  'unicorn/no-useless-length-check': NoUselessLengthCheck.RuleEntry;
  'unicorn/no-useless-promise-resolve-reject': NoUselessPromiseResolveReject.RuleEntry;
  'unicorn/no-useless-spread': NoUselessSpread.RuleEntry;
  'unicorn/no-useless-switch-case': NoUselessSwitchCase.RuleEntry;
  'unicorn/no-useless-undefined': NoUselessUndefined.RuleEntry;
  'unicorn/no-zero-fractions': NoZeroFractions.RuleEntry;
  'unicorn/number-literal-case': NumberLiteralCase.RuleEntry;
  'unicorn/numeric-separators-style': NumericSeparatorsStyle.RuleEntry;
  'unicorn/prefer-add-event-listener': PreferAddEventListener.RuleEntry;
  'unicorn/prefer-array-find': PreferArrayFind.RuleEntry;
  'unicorn/prefer-array-flat': PreferArrayFlat.RuleEntry;
  'unicorn/prefer-array-flat-map': PreferArrayFlatMap.RuleEntry;
  'unicorn/prefer-array-index-of': PreferArrayIndexOf.RuleEntry;
  'unicorn/prefer-array-some': PreferArraySome.RuleEntry;
  'unicorn/prefer-at': PreferAt.RuleEntry;
  'unicorn/prefer-bigint-literals': PreferBigintLiterals.RuleEntry;
  'unicorn/prefer-blob-reading-methods': PreferBlobReadingMethods.RuleEntry;
  'unicorn/prefer-class-fields': PreferClassFields.RuleEntry;
  'unicorn/prefer-classlist-toggle': PreferClasslistToggle.RuleEntry;
  'unicorn/prefer-code-point': PreferCodePoint.RuleEntry;
  'unicorn/prefer-date-now': PreferDateNow.RuleEntry;
  'unicorn/prefer-default-parameters': PreferDefaultParameters.RuleEntry;
  'unicorn/prefer-dom-node-append': PreferDomNodeAppend.RuleEntry;
  'unicorn/prefer-dom-node-dataset': PreferDomNodeDataset.RuleEntry;
  'unicorn/prefer-dom-node-remove': PreferDomNodeRemove.RuleEntry;
  'unicorn/prefer-dom-node-text-content': PreferDomNodeTextContent.RuleEntry;
  'unicorn/prefer-event-target': PreferEventTarget.RuleEntry;
  'unicorn/prefer-export-from': PreferExportFrom.RuleEntry;
  'unicorn/prefer-global-this': PreferGlobalThis.RuleEntry;
  'unicorn/prefer-import-meta-properties': PreferImportMetaProperties.RuleEntry;
  'unicorn/prefer-includes': PreferIncludes.RuleEntry;
  'unicorn/prefer-json-parse-buffer': PreferJsonParseBuffer.RuleEntry;
  'unicorn/prefer-keyboard-event-key': PreferKeyboardEventKey.RuleEntry;
  'unicorn/prefer-logical-operator-over-ternary': PreferLogicalOperatorOverTernary.RuleEntry;
  'unicorn/prefer-math-min-max': PreferMathMinMax.RuleEntry;
  'unicorn/prefer-math-trunc': PreferMathTrunc.RuleEntry;
  'unicorn/prefer-modern-dom-apis': PreferModernDomApis.RuleEntry;
  'unicorn/prefer-modern-math-apis': PreferModernMathApis.RuleEntry;
  'unicorn/prefer-module': PreferModule.RuleEntry;
  'unicorn/prefer-native-coercion-functions': PreferNativeCoercionFunctions.RuleEntry;
  'unicorn/prefer-negative-index': PreferNegativeIndex.RuleEntry;
  'unicorn/prefer-node-protocol': PreferNodeProtocol.RuleEntry;
  'unicorn/prefer-number-properties': PreferNumberProperties.RuleEntry;
  'unicorn/prefer-object-from-entries': PreferObjectFromEntries.RuleEntry;
  'unicorn/prefer-optional-catch-binding': PreferOptionalCatchBinding.RuleEntry;
  'unicorn/prefer-prototype-methods': PreferPrototypeMethods.RuleEntry;
  'unicorn/prefer-query-selector': PreferQuerySelector.RuleEntry;
  'unicorn/prefer-reflect-apply': PreferReflectApply.RuleEntry;
  'unicorn/prefer-regexp-test': PreferRegexpTest.RuleEntry;
  'unicorn/prefer-response-static-json': PreferResponseStaticJson.RuleEntry;
  'unicorn/prefer-set-has': PreferSetHas.RuleEntry;
  'unicorn/prefer-set-size': PreferSetSize.RuleEntry;
  'unicorn/prefer-single-call': PreferSingleCall.RuleEntry;
  'unicorn/prefer-spread': PreferSpread.RuleEntry;
  'unicorn/prefer-string-raw': PreferStringRaw.RuleEntry;
  'unicorn/prefer-string-replace-all': PreferStringReplaceAll.RuleEntry;
  'unicorn/prefer-string-slice': PreferStringSlice.RuleEntry;
  'unicorn/prefer-string-starts-ends-with': PreferStringStartsEndsWith.RuleEntry;
  'unicorn/prefer-string-trim-start-end': PreferStringTrimStartEnd.RuleEntry;
  'unicorn/prefer-structured-clone': PreferStructuredClone.RuleEntry;
  'unicorn/prefer-switch': PreferSwitch.RuleEntry;
  'unicorn/prefer-ternary': PreferTernary.RuleEntry;
  'unicorn/prefer-top-level-await': PreferTopLevelAwait.RuleEntry;
  'unicorn/prefer-type-error': PreferTypeError.RuleEntry;
  'unicorn/prevent-abbreviations': PreventAbbreviations.RuleEntry;
  'unicorn/relative-url-style': RelativeUrlStyle.RuleEntry;
  'unicorn/require-array-join-separator': RequireArrayJoinSeparator.RuleEntry;
  'unicorn/require-module-attributes': RequireModuleAttributes.RuleEntry;
  'unicorn/require-module-specifiers': RequireModuleSpecifiers.RuleEntry;
  'unicorn/require-number-to-fixed-digits-argument': RequireNumberToFixedDigitsArgument.RuleEntry;
  'unicorn/require-post-message-target-origin': RequirePostMessageTargetOrigin.RuleEntry;
  'unicorn/string-content': StringContent.RuleEntry;
  'unicorn/switch-case-braces': SwitchCaseBraces.RuleEntry;
  'unicorn/template-indent': TemplateIndent.RuleEntry;
  'unicorn/text-encoding-identifier-case': TextEncodingIdentifierCase.RuleEntry;
  'unicorn/throw-new-error': ThrowNewError.RuleEntry;

  // deprecated
  'unicorn/no-instanceof-array': NoInstanceofArray.RuleEntry;
  'unicorn/no-length-as-slice-end': NoLengthAsSliceEnd.RuleEntry;
  'unicorn/no-array-push-push': NoArrayPushPush.RuleEntry;
}>;

export type EslintUnicornRulesOption = Readonly<{
  'unicorn/better-regex': BetterRegex.Options;
  'unicorn/catch-error-name': CatchErrorName.Options;
  'unicorn/consistent-function-scoping': ConsistentFunctionScoping.Options;
  'unicorn/escape-case': EscapeCase.Options;
  'unicorn/expiring-todo-comments': ExpiringTodoComments.Options;
  'unicorn/explicit-length-check': ExplicitLengthCheck.Options;
  'unicorn/filename-case': FilenameCase.Options;
  'unicorn/import-style': ImportStyle.Options;
  'unicorn/isolated-functions': IsolatedFunctions.Options;
  'unicorn/no-array-reduce': NoArrayReduce.Options;
  'unicorn/no-array-reverse': NoArrayReverse.Options;
  'unicorn/no-array-sort': NoArraySort.Options;
  'unicorn/no-instanceof-builtins': NoInstanceofBuiltins.Options;
  'unicorn/no-keyword-prefix': NoKeywordPrefix.Options;
  'unicorn/no-null': NoNull.Options;
  'unicorn/no-typeof-undefined': NoTypeofUndefined.Options;
  'unicorn/no-unnecessary-polyfills': NoUnnecessaryPolyfills.Options;
  'unicorn/no-useless-undefined': NoUselessUndefined.Options;
  'unicorn/number-literal-case': NumberLiteralCase.Options;
  'unicorn/numeric-separators-style': NumericSeparatorsStyle.Options;
  'unicorn/prefer-add-event-listener': PreferAddEventListener.Options;
  'unicorn/prefer-array-find': PreferArrayFind.Options;
  'unicorn/prefer-array-flat': PreferArrayFlat.Options;
  'unicorn/prefer-at': PreferAt.Options;
  'unicorn/prefer-export-from': PreferExportFrom.Options;
  'unicorn/prefer-number-properties': PreferNumberProperties.Options;
  'unicorn/prefer-object-from-entries': PreferObjectFromEntries.Options;
  'unicorn/prefer-single-call': PreferSingleCall.Options;
  'unicorn/prefer-structured-clone': PreferStructuredClone.Options;
  'unicorn/prefer-switch': PreferSwitch.Options;
  'unicorn/prefer-ternary': PreferTernary.Options;
  'unicorn/prevent-abbreviations': PreventAbbreviations.Options;
  'unicorn/relative-url-style': RelativeUrlStyle.Options;
  'unicorn/string-content': StringContent.Options;
  'unicorn/switch-case-braces': SwitchCaseBraces.Options;
  'unicorn/template-indent': TemplateIndent.Options;
  'unicorn/text-encoding-identifier-case': TextEncodingIdentifierCase.Options;
}>;
