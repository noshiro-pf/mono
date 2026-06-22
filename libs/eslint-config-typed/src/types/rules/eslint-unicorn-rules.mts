/* cSpell:disable */
import { type Linter } from 'eslint';
import { type UnknownRecord } from 'ts-type-forge';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * @description Prefer better DOM traversal APIs.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/better-dom-traversing.md
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
namespace BetterDomTraversing {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce a specific parameter name in catch clauses.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/catch-error-name.md
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
   *         "type": "string",
   *         "description": "The expected name for the error variable."
   *       },
   *       "ignore": {
   *         "type": "array",
   *         "uniqueItems": true,
   *         "description": "Patterns to ignore."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * The expected name for the error variable.
     */
    name?: string;
    /**
     * Patterns to ignore.
     */
    ignore?: readonly unknown[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce consistent class references in static methods.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/class-reference-in-static-methods.md
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
namespace ClassReferenceInStaticMethods {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "preferThis": {
   *         "type": "boolean",
   *         "description": "Prefer `this` over the current class name in static methods."
   *       },
   *       "preferSuper": {
   *         "type": "boolean",
   *         "description": "Prefer `super` over the superclass name in static methods."
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Prefer `this` over the current class name in static methods.
     */
    preferThis?: boolean;
    /**
     * Prefer `super` over the superclass name in static methods.
     */
    preferSuper?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce better comment content.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/comment-content.md
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
namespace CommentContent {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "extendDefaultReplacements": {
   *         "type": "boolean",
   *         "description": "Whether to extend the default replacements."
   *       },
   *       "replacements": {
   *         "type": "object",
   *         "propertyNames": {
   *           "minLength": 1
   *         },
   *         "additionalProperties": {
   *           "anyOf": [
   *             {
   *               "enum": [
   *                 false
   *               ]
   *             },
   *             {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             {
   *               "type": "object",
   *               "required": [
   *                 "replacement"
   *               ],
   *               "properties": {
   *                 "replacement": {
   *                   "type": "string",
   *                   "minLength": 1
   *                 },
   *                 "caseSensitive": {
   *                   "type": "boolean"
   *                 }
   *               },
   *               "additionalProperties": false
   *             }
   *           ]
   *         },
   *         "description": "Custom comment content replacements."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to extend the default replacements.
     */
    extendDefaultReplacements?: boolean;
    /**
     * Custom comment content replacements.
     */
    replacements?: Readonly<
      Record<
        string,
        | false
        | string
        | Readonly<{
            replacement: string;
            caseSensitive?: boolean;
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
 * @description Enforce consistent assertion style with `node:assert`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/consistent-assert.md
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
 * @description Enforce consistent class member order.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/consistent-class-member-order.md
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
namespace ConsistentClassMemberOrder {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "order": {
   *         "type": "array",
   *         "description": "The class member group order.",
   *         "items": {
   *           "enum": [
   *             "static-field",
   *             "static-block",
   *             "private-field",
   *             "public-field",
   *             "constructor",
   *             "static-method",
   *             "private-method",
   *             "public-method"
   *           ]
   *         },
   *         "minItems": 8,
   *         "maxItems": 8,
   *         "uniqueItems": true
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * The class member group order.
     *
     * @minItems 8
     * @maxItems 8
     */
    order?: readonly [
      (
        | 'static-field'
        | 'static-block'
        | 'private-field'
        | 'public-field'
        | 'constructor'
        | 'static-method'
        | 'private-method'
        | 'public-method'
      ),
      (
        | 'static-field'
        | 'static-block'
        | 'private-field'
        | 'public-field'
        | 'constructor'
        | 'static-method'
        | 'private-method'
        | 'public-method'
      ),
      (
        | 'static-field'
        | 'static-block'
        | 'private-field'
        | 'public-field'
        | 'constructor'
        | 'static-method'
        | 'private-method'
        | 'public-method'
      ),
      (
        | 'static-field'
        | 'static-block'
        | 'private-field'
        | 'public-field'
        | 'constructor'
        | 'static-method'
        | 'private-method'
        | 'public-method'
      ),
      (
        | 'static-field'
        | 'static-block'
        | 'private-field'
        | 'public-field'
        | 'constructor'
        | 'static-method'
        | 'private-method'
        | 'public-method'
      ),
      (
        | 'static-field'
        | 'static-block'
        | 'private-field'
        | 'public-field'
        | 'constructor'
        | 'static-method'
        | 'private-method'
        | 'public-method'
      ),
      (
        | 'static-field'
        | 'static-block'
        | 'private-field'
        | 'public-field'
        | 'constructor'
        | 'static-method'
        | 'private-method'
        | 'public-method'
      ),
      (
        | 'static-field'
        | 'static-block'
        | 'private-field'
        | 'public-field'
        | 'constructor'
        | 'static-method'
        | 'private-method'
        | 'public-method'
      ),
    ];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce consistent spelling of compound words in identifiers.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/consistent-compound-words.md
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
namespace ConsistentCompoundWords {
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
   *             "type": "boolean",
   *             "description": "Whether to check property names."
   *           },
   *           "checkVariables": {
   *             "type": "boolean",
   *             "description": "Whether to check variable names."
   *           },
   *           "checkDefaultAndNamespaceImports": {
   *             "anyOf": [
   *               {
   *                 "type": "boolean"
   *               },
   *               {
   *                 "enum": [
   *                   "internal"
   *                 ]
   *               }
   *             ],
   *             "description": "Whether to check default and namespace import names."
   *           },
   *           "checkShorthandImports": {
   *             "anyOf": [
   *               {
   *                 "type": "boolean"
   *               },
   *               {
   *                 "enum": [
   *                   "internal"
   *                 ]
   *               }
   *             ],
   *             "description": "Whether to check shorthand import names."
   *           },
   *           "checkShorthandProperties": {
   *             "type": "boolean",
   *             "description": "Whether to check shorthand property names."
   *           },
   *           "extendDefaultReplacements": {
   *             "type": "boolean",
   *             "description": "Whether to extend the default replacements."
   *           },
   *           "replacements": {
   *             "$ref": "#/definitions/replacements",
   *             "description": "Custom compound word replacements."
   *           },
   *           "allowList": {
   *             "$ref": "#/definitions/trueObject",
   *             "description": "Custom allow list of names."
   *           }
   *         }
   *       }
   *     ],
   *     "definitions": {
   *       "replacements": {
   *         "type": "object",
   *         "propertyNames": {
   *           "minLength": 1
   *         },
   *         "additionalProperties": {
   *           "anyOf": [
   *             {
   *               "enum": [
   *                 false
   *               ]
   *             },
   *             {
   *               "type": "string",
   *               "minLength": 1
   *             }
   *           ]
   *         }
   *       },
   *       "trueObject": {
   *         "type": "object",
   *         "propertyNames": {
   *           "minLength": 1
   *         },
   *         "additionalProperties": {
   *           "enum": [
   *             true
   *           ]
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
          /**
           * Whether to check property names.
           */
          checkProperties?: boolean;
          /**
           * Whether to check variable names.
           */
          checkVariables?: boolean;
          /**
           * Whether to check default and namespace import names.
           */
          checkDefaultAndNamespaceImports?: boolean | 'internal';
          /**
           * Whether to check shorthand import names.
           */
          checkShorthandImports?: boolean | 'internal';
          /**
           * Whether to check shorthand property names.
           */
          checkShorthandProperties?: boolean;
          /**
           * Whether to extend the default replacements.
           */
          extendDefaultReplacements?: boolean;
          replacements?: Replacements;
          allowList?: TrueObject;
        }>,
      ];

  /**
   * Custom compound word replacements.
   */
  export type Replacements = Readonly<Record<string, false | string>>;

  /**
   * Custom allow list of names.
   */
  export type TrueObject = Readonly<Record<string, true>>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer passing `Date` directly to the constructor when cloning.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/consistent-date-clone.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/consistent-destructuring.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/consistent-empty-array-spread.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/consistent-existence-index-check.md
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
 * @description Enforce consistent decorator position on exported classes.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/consistent-export-decorator-position.md
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
namespace ConsistentExportDecoratorPosition {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "above",
   *       "before",
   *       "after"
   *     ],
   *     "description": "Decorator position relative to the export declaration."
   *   }
   * ]
   * ```
   */
  /**
   * Decorator position relative to the export declaration.
   */
  export type Options = 'above' | 'before' | 'after';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Move function definitions to the highest possible scope.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/consistent-function-scoping.md
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
   *         "type": "boolean",
   *         "description": "Whether to check arrow functions."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to check arrow functions.
     */
    checkArrowFunctions?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce function syntax by role.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/consistent-function-style.md
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
namespace ConsistentFunctionStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "default": {
   *         "enum": [
   *           "declaration",
   *           "function-expression",
   *           "arrow-function",
   *           "ignore"
   *         ]
   *       },
   *       "namedFunctions": {
   *         "enum": [
   *           "declaration",
   *           "function-expression",
   *           "arrow-function",
   *           "ignore"
   *         ]
   *       },
   *       "namedExports": {
   *         "enum": [
   *           "declaration",
   *           "function-expression",
   *           "arrow-function",
   *           "ignore"
   *         ]
   *       },
   *       "callbacks": {
   *         "enum": [
   *           "function-expression",
   *           "arrow-function",
   *           "ignore"
   *         ]
   *       },
   *       "objectProperties": {
   *         "enum": [
   *           "method",
   *           "function-expression",
   *           "arrow-function",
   *           "ignore"
   *         ]
   *       },
   *       "reassignedVariables": {
   *         "enum": [
   *           "function-expression",
   *           "arrow-function",
   *           "ignore"
   *         ]
   *       },
   *       "typedVariables": {
   *         "enum": [
   *           "function-expression",
   *           "arrow-function",
   *           "ignore"
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    default?:
      | 'declaration'
      | 'function-expression'
      | 'arrow-function'
      | 'ignore';
    namedFunctions?:
      | 'declaration'
      | 'function-expression'
      | 'arrow-function'
      | 'ignore';
    namedExports?:
      | 'declaration'
      | 'function-expression'
      | 'arrow-function'
      | 'ignore';
    callbacks?: 'function-expression' | 'arrow-function' | 'ignore';
    objectProperties?:
      | 'method'
      | 'function-expression'
      | 'arrow-function'
      | 'ignore';
    reassignedVariables?: 'function-expression' | 'arrow-function' | 'ignore';
    typedVariables?: 'function-expression' | 'arrow-function' | 'ignore';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce consistent JSON file reads before `JSON.parse()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/consistent-json-file-read.md
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
namespace ConsistentJsonFileRead {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "string",
   *       "buffer"
   *     ],
   *     "description": "Whether to prefer reading JSON files as strings or buffers before passing them to `JSON.parse()`."
   *   }
   * ]
   * ```
   */
  /**
   * Whether to prefer reading JSON files as strings or buffers before passing them to `JSON.parse()`.
   */
  export type Options = 'string' | 'buffer';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce consistent optional chaining for same-base member access.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/consistent-optional-chaining.md
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
namespace ConsistentOptionalChaining {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce consistent style for escaping `${` in template literals.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/consistent-template-literal-escape.md
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
namespace ConsistentTemplateLiteralEscape {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce correct `Error` subclassing.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/custom-error-definition.md
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
 * @description Enforce consistent style for DOM element dataset access.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/dom-node-dataset.md
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
namespace DomNodeDataset {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "preferAttributes": {
   *         "type": "boolean",
   *         "description": "Prefer attribute methods over named `.dataset` access."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Prefer attribute methods over named `.dataset` access.
     */
    preferAttributes?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce no spaces between braces.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/empty-brace-spaces.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/error-message.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/escape-case.md
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
   *     ],
   *     "description": "The case style for escape sequences."
   *   }
   * ]
   * ```
   */
  /**
   * The case style for escape sequences.
   */
  export type Options = 'uppercase' | 'lowercase';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Add expiration conditions to TODO comments.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/expiring-todo-comments.md
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
   *         },
   *         "description": "Comment terms to check."
   *       },
   *       "ignore": {
   *         "type": "array",
   *         "uniqueItems": true,
   *         "description": "Patterns to ignore."
   *       },
   *       "checkDates": {
   *         "type": "boolean",
   *         "description": "Whether to check expiration dates."
   *       },
   *       "checkDatesOnPullRequests": {
   *         "type": "boolean",
   *         "description": "Whether to check expiration dates on pull requests."
   *       },
   *       "allowWarningComments": {
   *         "type": "boolean",
   *         "description": "Whether to allow warning comments."
   *       },
   *       "date": {
   *         "type": "string",
   *         "format": "date",
   *         "description": "The reference date."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Comment terms to check.
     */
    terms?: readonly string[];
    /**
     * Patterns to ignore.
     */
    ignore?: readonly unknown[];
    /**
     * Whether to check expiration dates.
     */
    checkDates?: boolean;
    /**
     * Whether to check expiration dates on pull requests.
     */
    checkDatesOnPullRequests?: boolean;
    /**
     * Whether to allow warning comments.
     */
    allowWarningComments?: boolean;
    /**
     * The reference date.
     */
    date?: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce explicitly comparing the `length` or `size` property of a value.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/explicit-length-check.md
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
 * @description Enforce or disallow explicit `delay` argument for `setTimeout()` and `setInterval()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/explicit-timer-delay.md
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
namespace ExplicitTimerDelay {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ],
   *     "description": "Whether to always require an explicit `delay` argument, or disallow an explicit `0` delay."
   *   }
   * ]
   * ```
   */
  /**
   * Whether to always require an explicit `delay` argument, or disallow an explicit `0` delay.
   */
  export type Options = 'always' | 'never';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce a case style for filenames and directory names.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/filename-case.md
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
   *     "description": "The rule options.",
   *     "anyOf": [
   *       {
   *         "properties": {
   *           "case": {
   *             "enum": [
   *               "camelCase",
   *               "camelCaseWithAcronyms",
   *               "snakeCase",
   *               "kebabCase",
   *               "pascalCase"
   *             ],
   *             "description": "The filename and directory name case style."
   *           },
   *           "ignore": {
   *             "type": "array",
   *             "uniqueItems": true,
   *             "description": "Path segment patterns to ignore."
   *           },
   *           "multipleFileExtensions": {
   *             "type": "boolean",
   *             "description": "Whether to treat additional, dot-separated parts of a filename as file extensions."
   *           },
   *           "checkDirectories": {
   *             "type": "boolean",
   *             "description": "Whether to check directory names."
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       {
   *         "properties": {
   *           "cases": {
   *             "properties": {
   *               "camelCase": {
   *                 "type": "boolean",
   *                 "description": "Whether to allow camelCase filenames and directory names."
   *               },
   *               "camelCaseWithAcronyms": {
   *                 "type": "boolean",
   *                 "description": "Whether to allow camelCase filenames and directory names with acronym segments."
   *               },
   *               "snakeCase": {
   *                 "type": "boolean",
   *                 "description": "Whether to allow snake_case filenames and directory names."
   *               },
   *               "kebabCase": {
   *                 "type": "boolean",
   *                 "description": "Whether to allow kebab-case filenames and directory names."
   *               },
   *               "pascalCase": {
   *                 "type": "boolean",
   *                 "description": "Whether to allow PascalCase filenames and directory names."
   *               }
   *             },
   *             "additionalProperties": false,
   *             "description": "The allowed filename and directory name case styles."
   *           },
   *           "ignore": {
   *             "type": "array",
   *             "uniqueItems": true,
   *             "description": "Path segment patterns to ignore."
   *           },
   *           "multipleFileExtensions": {
   *             "type": "boolean",
   *             "description": "Whether to treat additional, dot-separated parts of a filename as file extensions."
   *           },
   *           "checkDirectories": {
   *             "type": "boolean",
   *             "description": "Whether to check directory names."
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  /**
   * The rule options.
   */
  export type Options = Readonly<
    | {
        /**
         * The filename and directory name case style.
         */
        case?:
          | 'camelCase'
          | 'camelCaseWithAcronyms'
          | 'snakeCase'
          | 'kebabCase'
          | 'pascalCase';
        /**
         * Path segment patterns to ignore.
         */
        ignore?: readonly unknown[];
        /**
         * Whether to treat additional, dot-separated parts of a filename as file extensions.
         */
        multipleFileExtensions?: boolean;
        /**
         * Whether to check directory names.
         */
        checkDirectories?: boolean;
      }
    | {
        /**
         * The allowed filename and directory name case styles.
         */
        cases?: Readonly<{
          /**
           * Whether to allow camelCase filenames and directory names.
           */
          camelCase?: boolean;
          /**
           * Whether to allow camelCase filenames and directory names with acronym segments.
           */
          camelCaseWithAcronyms?: boolean;
          /**
           * Whether to allow snake_case filenames and directory names.
           */
          snakeCase?: boolean;
          /**
           * Whether to allow kebab-case filenames and directory names.
           */
          kebabCase?: boolean;
          /**
           * Whether to allow PascalCase filenames and directory names.
           */
          pascalCase?: boolean;
        }>;
        /**
         * Path segment patterns to ignore.
         */
        ignore?: readonly unknown[];
        /**
         * Whether to treat additional, dot-separated parts of a filename as file extensions.
         */
        multipleFileExtensions?: boolean;
        /**
         * Whether to check directory names.
         */
        checkDirectories?: boolean;
      }
  >;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Require identifiers to match a specified regular expression.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/id-match.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace IdMatch {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string"
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "properties": {
   *         "type": "boolean"
   *       },
   *       "classFields": {
   *         "type": "boolean"
   *       },
   *       "onlyDeclarations": {
   *         "type": "boolean"
   *       },
   *       "ignoreDestructuring": {
   *         "type": "boolean"
   *       },
   *       "checkNamedSpecifiers": {
   *         "type": "boolean",
   *         "description": "Whether to check named import specifiers and external named export specifiers."
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options0 = string;

  export type Options1 = Readonly<{
    properties?: boolean;
    classFields?: boolean;
    onlyDeclarations?: boolean;
    ignoreDestructuring?: boolean;
    /**
     * Whether to check named import specifiers and external named export specifiers.
     */
    checkNamedSpecifiers?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
}

/**
 * @description Enforce specific import styles per module.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/import-style.md
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
   *             "type": "boolean",
   *             "description": "Whether to check `import` statements."
   *           },
   *           "checkDynamicImport": {
   *             "type": "boolean",
   *             "description": "Whether to check dynamic `import()` expressions."
   *           },
   *           "checkExportFrom": {
   *             "type": "boolean",
   *             "description": "Whether to check `export … from` statements."
   *           },
   *           "checkRequire": {
   *             "type": "boolean",
   *             "description": "Whether to check `require()` calls."
   *           },
   *           "extendDefaultStyles": {
   *             "type": "boolean",
   *             "description": "Whether to extend the default styles."
   *           },
   *           "styles": {
   *             "$ref": "#/definitions/moduleStyles",
   *             "description": "Module import styles."
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
          /**
           * Whether to check `import` statements.
           */
          checkImport?: boolean;
          /**
           * Whether to check dynamic `import()` expressions.
           */
          checkDynamicImport?: boolean;
          /**
           * Whether to check `export … from` statements.
           */
          checkExportFrom?: boolean;
          /**
           * Whether to check `require()` calls.
           */
          checkRequire?: boolean;
          /**
           * Whether to extend the default styles.
           */
          extendDefaultStyles?: boolean;
          styles?: ModuleStyles;
        }>,
      ];

  export type Styles = false | BooleanObject;

  /**
   * Module import styles.
   */
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/isolated-functions.md
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
   *         },
   *         "description": "Override which global variables are allowed inside isolated scopes."
   *       },
   *       "functions": {
   *         "type": "array",
   *         "uniqueItems": true,
   *         "items": {
   *           "type": "string"
   *         },
   *         "description": "Function names that mark a scope as isolated."
   *       },
   *       "selectors": {
   *         "type": "array",
   *         "uniqueItems": true,
   *         "items": {
   *           "type": "string"
   *         },
   *         "description": "AST selectors that mark a scope as isolated."
   *       },
   *       "comments": {
   *         "type": "array",
   *         "uniqueItems": true,
   *         "items": {
   *           "type": "string"
   *         },
   *         "description": "Comment patterns that mark a scope as isolated."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Override which global variables are allowed inside isolated scopes.
     */
    overrideGlobals?: Readonly<
      Record<string, boolean | ('readonly' | 'writable' | 'writeable' | 'off')>
    >;
    /**
     * Function names that mark a scope as isolated.
     */
    functions?: readonly string[];
    /**
     * AST selectors that mark a scope as isolated.
     */
    selectors?: readonly string[];
    /**
     * Comment patterns that mark a scope as isolated.
     */
    comments?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Limit the depth of nested calls.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/max-nested-calls.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | true       |
 *  ```
 */
namespace MaxNestedCalls {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "max": {
   *         "type": "integer",
   *         "minimum": 1,
   *         "description": "The maximum allowed nested call depth."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * The maximum allowed nested call depth.
     */
    max?: number;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce the use of `new` for all builtins, except `String`, `Number`, `Boolean`, `Symbol` and `BigInt`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/new-for-builtins.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-abusive-eslint-disable.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-accessor-recursion.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-anonymous-default-export.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-array-callback-reference.md
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
   *         "uniqueItems": true,
   *         "items": {
   *           "type": "string"
   *         },
   *         "description": "Callees to ignore."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Callees to ignore.
     */
    ignore?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow using reference values as `Array#fill()` values.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-array-fill-with-reference-type.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | problem       |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoArrayFillWithReferenceType {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow `.fill()` after `Array.from({length: …})`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-array-from-fill.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoArrayFromFill {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow using the `this` argument in array methods.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-array-method-this-argument.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-array-reduce.md
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
   *         "description": "Whether to allow simple reduce operations whose callback body is a single binary expression."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to allow simple reduce operations whose callback body is a single binary expression.
     */
    allowSimpleOperations?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `Array#toReversed()` over `Array#reverse()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-array-reverse.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-array-sort.md
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
 * @description Disallow asterisk prefixes in documentation comments.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-asterisk-prefix-in-documentation-comments.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | false      |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace NoAsteriskPrefixInDocumentationComments {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow member access from await expression.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-await-expression-member.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-await-in-promise-methods.md
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
 * @description Disallow unnecessary `Blob` to `File` conversion.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-blob-to-file.md
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
namespace NoBlobToFile {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow `break` and `continue` in nested loops and switches inside loops.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-break-in-nested-loop.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | true       |
 *  ```
 */
namespace NoBreakInNestedLoop {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer drawing canvases directly instead of converting them to images.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-canvas-to-image.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoCanvasToImage {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow dynamic object property existence checks.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-computed-property-existence-check.md
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
namespace NoComputedPropertyExistenceCheck {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow confusing uses of `Array#{splice,toSpliced}()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-confusing-array-splice.md
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
namespace NoConfusingArraySplice {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow confusing uses of `Array#with()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-confusing-array-with.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | true       |
 *  ```
 */
namespace NoConfusingArrayWith {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Do not use leading/trailing space between `console.log` parameters.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-console-spaces.md
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
 * @description Disallow declarations before conditional early exits when they are only used after the exit.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-declarations-before-early-exit.md
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
namespace NoDeclarationsBeforeEarlyExit {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Do not use `document.cookie` directly.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-document-cookie.md
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
 * @description Disallow `.map()` and `.filter()` in `for…of` and `for await…of` loop headers.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-duplicate-loops.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | true       |
 *  ```
 */
namespace NoDuplicateLoops {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow duplicate values in `Set` constructor array literals.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-duplicate-set-values.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | true       |
 *  ```
 */
namespace NoDuplicateSetValues {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow empty files.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-empty-file.md
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
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowComments": {
   *         "type": "boolean",
   *         "description": "Whether to allow files that only contain comments."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to allow files that only contain comments.
     */
    allowComments?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow assigning to built-in error properties.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-error-property-assignment.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | problem       |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoErrorPropertyAssignment {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow exports in scripts.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-exports-in-scripts.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoExportsInScripts {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `for…of` over the `forEach` method.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-for-each.md
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
namespace NoForEach {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Do not use a `for` loop that can be replaced with a `for-of` loop.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-for-loop.md
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
namespace NoForLoop {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow assigning properties on the global object.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-global-object-property-assignment.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | problem       |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoGlobalObjectPropertyAssignment {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow immediate mutation after variable assignment.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-immediate-mutation.md
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
 * @description Disallow incorrect `querySelector()` and `querySelectorAll()` usage.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-incorrect-query-selector.md
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
namespace NoIncorrectQuerySelector {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow incorrect template literal interpolation syntax.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-incorrect-template-string-interpolation.md
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
namespace NoIncorrectTemplateStringInterpolation {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow `instanceof` with built-in objects
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-instanceof-builtins.md
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
 * @description Disallow calling functions with an invalid number of arguments.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-invalid-argument-count.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | problem       |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoInvalidArgumentCount {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow invalid options in `fetch()` and `new Request()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-invalid-fetch-options.md
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
 * @description Disallow invalid `accept` values on file inputs.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-invalid-file-input-accept.md
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
namespace NoInvalidFileInputAccept {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prevent calling `EventTarget#removeEventListener()` with the result of an expression.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-invalid-remove-event-listener.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-keyword-prefix.md
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
   *         "description": "The prefixes to disallow.",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "checkProperties": {
   *         "type": "boolean",
   *         "description": "Whether to check property names."
   *       },
   *       "onlyCamelCase": {
   *         "type": "boolean",
   *         "description": "Whether to only check camelCase names."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * The prefixes to disallow.
     *
     * @minItems 0
     */
    disallowedPrefixes?: readonly string[];
    /**
     * Whether to check property names.
     */
    checkProperties?: boolean;
    /**
     * Whether to only check camelCase names.
     */
    onlyCamelCase?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow accessing `event.currentTarget` after the synchronous event dispatch has finished.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-late-current-target-access.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoLateCurrentTargetAccess {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow `if` statements as the only statement in `if` blocks without `else`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-lonely-if.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-magic-array-flat-depth.md
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
 * @description Disallow manually wrapped comments.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-manually-wrapped-comments.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | false      |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace NoManuallyWrappedComments {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow checking a Map key before accessing a different key.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-mismatched-map-key.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoMismatchedMapKey {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow named usage of default import and export.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-named-default.md
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
 * @description Disallow negated array predicate calls.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-negated-array-predicate.md
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
namespace NoNegatedArrayPredicate {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow negated comparisons.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-negated-comparison.md
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
namespace NoNegatedComparison {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "checkLogicalExpressions": {
   *         "type": "boolean",
   *         "description": "Check logical expressions that only contain comparisons."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Check logical expressions that only contain comparisons.
     */
    checkLogicalExpressions?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow negated conditions.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-negated-condition.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-negation-in-equality-check.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-nested-ternary.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-new-array.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-new-buffer.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-null.md
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
   *       "checkArguments": {
   *         "type": "boolean",
   *         "description": "Whether to check `null` used as a direct function call or constructor argument."
   *       },
   *       "checkStrictEquality": {
   *         "type": "boolean",
   *         "description": "Whether to check strict equality comparisons against `null`."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to check `null` used as a direct function call or constructor argument.
     */
    checkArguments?: boolean;
    /**
     * Whether to check strict equality comparisons against `null`.
     */
    checkStrictEquality?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow the use of objects as default parameters.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-object-as-default-parameter.md
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
 * @description Disallow `Object` methods with `Map` or `Set`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-object-methods-with-collections.md
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
namespace NoObjectMethodsWithCollections {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow optional chaining on undeclared variables.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-optional-chaining-on-undeclared-variable.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoOptionalChainingOnUndeclaredVariable {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow `process.exit()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-process-exit.md
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
 * @description Disallow comparisons made redundant by an equality check in the same logical AND.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-redundant-comparison.md
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
namespace NoRedundantComparison {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow returning the result of `Array#push()` with arguments.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-return-array-push.md
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
namespace NoReturnArrayPush {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow passing single-element arrays to `Promise` methods.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-single-promise-in-promise-methods.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-static-only-class.md
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
 * @description Prefer comparing values directly over subtracting and comparing to `0`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-subtraction-comparison.md
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
namespace NoSubtractionComparison {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow `then` property.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-thenable.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-this-assignment.md
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
 * @description Disallow `this` outside of classes.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-this-outside-of-class.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoThisOutsideOfClass {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow top-level side effects in exported modules.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-top-level-side-effects.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | problem       |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoTopLevelSideEffects {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow comparing `undefined` using `typeof`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-typeof-undefined.md
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
   *         "type": "boolean",
   *         "description": "Whether to also check `typeof` comparisons against global variables."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to also check `typeof` comparisons against global variables.
     */
    checkGlobalVariables?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Require class members to be declared.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-undeclared-class-members.md
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
namespace NoUndeclaredClassMembers {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow using `1` as the `depth` argument of `Array#flat()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-unnecessary-array-flat-depth.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-unnecessary-array-splice-count.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-unnecessary-await.md
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
 * @description Disallow unnecessary `globalThis` references.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-unnecessary-global-this.md
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
namespace NoUnnecessaryGlobalThis {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow unnecessary nested ternary expressions.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-unnecessary-nested-ternary.md
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
namespace NoUnnecessaryNestedTernary {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce the use of built-in methods instead of unnecessary polyfills.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-unnecessary-polyfills.md
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
   *     "properties": {
   *       "targets": {
   *         "oneOf": [
   *           {
   *             "type": "string",
   *             "description": "A browserslist query string."
   *           },
   *           {
   *             "type": "array",
   *             "description": "An array of browserslist query strings."
   *           },
   *           {
   *             "type": "object",
   *             "description": "A browserslist targets object."
   *           }
   *         ],
   *         "description": "The target environments."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * The target environments.
     */
    targets?: string | readonly unknown[] | UnknownRecord;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow using `.length` or `Infinity` as the `end` argument of `{Array,String,TypedArray}#slice()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-unnecessary-slice-end.md
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
 * @description Disallow `Array#splice()` when simpler alternatives exist.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-unnecessary-splice.md
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
namespace NoUnnecessarySplice {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow unreadable array destructuring.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-unreadable-array-destructuring.md
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
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "maximumIgnoredElements": {
   *         "type": "integer",
   *         "minimum": 0,
   *         "description": "Maximum number of consecutive ignored elements allowed."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Maximum number of consecutive ignored elements allowed.
     */
    maximumIgnoredElements?: number;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow unreadable IIFEs.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-unreadable-iife.md
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
namespace NoUnreadableIife {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow unreadable `new` expressions.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-unreadable-new-expression.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | true       |
 *  ```
 */
namespace NoUnreadableNewExpression {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow unreadable object destructuring.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-unreadable-object-destructuring.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoUnreadableObjectDestructuring {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prevent unsafe use of ArrayBuffer view `.buffer`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-unsafe-buffer-conversion.md
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
namespace NoUnsafeBufferConversion {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow unsafe DOM HTML APIs.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-unsafe-dom-html.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | false   |
 *  ```
 */
namespace NoUnsafeDomHtml {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow unsafe values as property keys.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-unsafe-property-key.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnsafePropertyKey {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow non-literal replacement values in `String#replace()` and `String#replaceAll()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-unsafe-string-replacement.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnsafeStringReplacement {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow ignoring the return value of selected array methods.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-unused-array-method-return.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace NoUnusedArrayMethodReturn {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow unused object properties.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-unused-properties.md
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
 * @description Disallow unnecessary `Boolean()` casts in array predicate callbacks.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-useless-boolean-cast.md
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
namespace NoUselessBooleanCast {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow useless values or fallbacks in `Set`, `Map`, `WeakSet`, or `WeakMap`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-useless-collection-argument.md
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
 * @description Disallow useless concatenation of literals.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-useless-concat.md
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
namespace NoUselessConcat {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow `else` after a statement that exits.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-useless-else.md
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
namespace NoUselessElse {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow unnecessary `Error.captureStackTrace(…)`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-useless-error-capture-stack-trace.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-useless-fallback-in-spread.md
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
 * @description Disallow unnecessary `.toArray()` on iterators.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-useless-iterator-to-array.md
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
namespace NoUselessIteratorToArray {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow useless array length check.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-useless-length-check.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-useless-promise-resolve-reject.md
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
 * @description Disallow simple recursive function calls that can be replaced with a loop.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-useless-recursion.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | true       |
 *  ```
 */
namespace NoUselessRecursion {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow unnecessary spread.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-useless-spread.md
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
namespace NoUselessSpread {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow useless case in switch statements.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-useless-switch-case.md
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
 * @description Disallow useless template literal expressions.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-useless-template-literals.md
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
namespace NoUselessTemplateLiterals {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow useless `undefined`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-useless-undefined.md
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
   *         "type": "boolean",
   *         "description": "Whether to check function arguments."
   *       },
   *       "checkArrowFunctionBody": {
   *         "type": "boolean",
   *         "description": "Whether to check arrow function bodies."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to check function arguments.
     */
    checkArguments?: boolean;
    /**
     * Whether to check arrow function bodies.
     */
    checkArrowFunctionBody?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow number literals with zero fractions or dangling dots.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/no-zero-fractions.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/number-literal-case.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/numeric-separators-style.md
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
   *             "type": "boolean",
   *             "description": "Whether to only enforce the style if the number already contains a separator."
   *           },
   *           "minimumDigits": {
   *             "type": "integer",
   *             "minimum": 0,
   *             "description": "The minimum number of digits before separators are enforced."
   *           },
   *           "groupLength": {
   *             "type": "integer",
   *             "minimum": 1,
   *             "description": "The number of digits in each group."
   *           }
   *         }
   *       },
   *       "octal": {
   *         "type": "object",
   *         "additionalProperties": false,
   *         "properties": {
   *           "onlyIfContainsSeparator": {
   *             "type": "boolean",
   *             "description": "Whether to only enforce the style if the number already contains a separator."
   *           },
   *           "minimumDigits": {
   *             "type": "integer",
   *             "minimum": 0,
   *             "description": "The minimum number of digits before separators are enforced."
   *           },
   *           "groupLength": {
   *             "type": "integer",
   *             "minimum": 1,
   *             "description": "The number of digits in each group."
   *           }
   *         }
   *       },
   *       "hexadecimal": {
   *         "type": "object",
   *         "additionalProperties": false,
   *         "properties": {
   *           "onlyIfContainsSeparator": {
   *             "type": "boolean",
   *             "description": "Whether to only enforce the style if the number already contains a separator."
   *           },
   *           "minimumDigits": {
   *             "type": "integer",
   *             "minimum": 0,
   *             "description": "The minimum number of digits before separators are enforced."
   *           },
   *           "groupLength": {
   *             "type": "integer",
   *             "minimum": 1,
   *             "description": "The number of digits in each group."
   *           }
   *         }
   *       },
   *       "number": {
   *         "type": "object",
   *         "additionalProperties": false,
   *         "properties": {
   *           "onlyIfContainsSeparator": {
   *             "type": "boolean",
   *             "description": "Whether to only enforce the style if the number already contains a separator."
   *           },
   *           "minimumDigits": {
   *             "type": "integer",
   *             "minimum": 0,
   *             "description": "The minimum number of digits before separators are enforced."
   *           },
   *           "groupLength": {
   *             "type": "integer",
   *             "minimum": 1,
   *             "description": "The number of digits in each group."
   *           },
   *           "fractionGroupLength": {
   *             "type": "integer",
   *             "minimum": 1,
   *             "description": "The number of digits in each group after the decimal point. Defaults to no grouping."
   *           }
   *         }
   *       },
   *       "onlyIfContainsSeparator": {
   *         "type": "boolean",
   *         "description": "Whether to only enforce the style if the number already contains a separator."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    binary?: Readonly<{
      /**
       * Whether to only enforce the style if the number already contains a separator.
       */
      onlyIfContainsSeparator?: boolean;
      /**
       * The minimum number of digits before separators are enforced.
       */
      minimumDigits?: number;
      /**
       * The number of digits in each group.
       */
      groupLength?: number;
    }>;
    octal?: Readonly<{
      /**
       * Whether to only enforce the style if the number already contains a separator.
       */
      onlyIfContainsSeparator?: boolean;
      /**
       * The minimum number of digits before separators are enforced.
       */
      minimumDigits?: number;
      /**
       * The number of digits in each group.
       */
      groupLength?: number;
    }>;
    hexadecimal?: Readonly<{
      /**
       * Whether to only enforce the style if the number already contains a separator.
       */
      onlyIfContainsSeparator?: boolean;
      /**
       * The minimum number of digits before separators are enforced.
       */
      minimumDigits?: number;
      /**
       * The number of digits in each group.
       */
      groupLength?: number;
    }>;
    number?: Readonly<{
      /**
       * Whether to only enforce the style if the number already contains a separator.
       */
      onlyIfContainsSeparator?: boolean;
      /**
       * The minimum number of digits before separators are enforced.
       */
      minimumDigits?: number;
      /**
       * The number of digits in each group.
       */
      groupLength?: number;
      /**
       * The number of digits in each group after the decimal point. Defaults to no grouping.
       */
      fractionGroupLength?: number;
    }>;
    /**
     * Whether to only enforce the style if the number already contains a separator.
     */
    onlyIfContainsSeparator?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `.addEventListener()` and `.removeEventListener()` over `on`-functions.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-add-event-listener.md
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
   *         "uniqueItems": true,
   *         "description": "Packages to exclude from checking."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Packages to exclude from checking.
     */
    excludedPackages?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer an options object over a boolean in `.addEventListener()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-add-event-listener-options.md
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
namespace PreferAddEventListenerOptions {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `.find(…)` and `.findLast(…)` over the first or last element from `.filter(…)`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-array-find.md
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
   *         "type": "boolean",
   *         "description": "Whether to also check for patterns that can be replaced with `findLast()`."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to also check for patterns that can be replaced with `findLast()`.
     */
    checkFromLast?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `Array#flat()` over legacy techniques to flatten arrays.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-array-flat.md
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
   *         "uniqueItems": true,
   *         "description": "Additional functions to check."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Additional functions to check.
     */
    functions?: readonly unknown[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `.flatMap(…)` over `.map(…).flat()` and `.filter(…).flatMap(…)`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-array-flat-map.md
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
namespace PreferArrayFlatMap {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer using the `Array.from()` mapping function argument.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-array-from-map.md
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
namespace PreferArrayFromMap {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `Array#{indexOf,lastIndexOf}()` over `Array#{findIndex,findLastIndex}()` when looking for the index of an item.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-array-index-of.md
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
 * @description Prefer last-oriented array methods over `Array#reverse()` or `Array#toReversed()` followed by a method.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-array-last-methods.md
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
namespace PreferArrayLastMethods {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `.some(…)` over `.filter(…).length` check and `.{find,findLast,findIndex,findLastIndex}(…)`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-array-some.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-at.md
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
   *         "uniqueItems": true,
   *         "description": "Additional functions that return the last element."
   *       },
   *       "checkAllIndexAccess": {
   *         "type": "boolean",
   *         "description": "Whether to also check positive integer index access."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Additional functions that return the last element.
     */
    getLastElementFunctions?: readonly unknown[];
    /**
     * Whether to also check positive integer index access.
     */
    checkAllIndexAccess?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `await` over promise chaining.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-await.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferAwait {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `BigInt` literals over the constructor.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-bigint-literals.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-blob-reading-methods.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-class-fields.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-classlist-toggle.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-code-point.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-date-now.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-default-parameters.md
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
 * @description Prefer direct iteration over default iterator method calls.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-direct-iteration.md
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
namespace PreferDirectIteration {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer using `using`/`await using` over manual `try`/`finally` resource disposal.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-dispose.md
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
namespace PreferDispose {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `Element#append()` over `Node#appendChild()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-dom-node-append.md
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
 * @description Prefer `.getHTML()` and `.setHTML()` over `.innerHTML`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-dom-node-html-methods.md
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
namespace PreferDomNodeHtmlMethods {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `childNode.remove()` over `parentNode.removeChild(childNode)`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-dom-node-remove.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-dom-node-text-content.md
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
 * @description Prefer early returns over full-function conditional wrapping.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-early-return.md
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
namespace PreferEarlyReturn {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "maximumStatements": {
   *         "type": "integer",
   *         "minimum": 0,
   *         "description": "Maximum number of statements allowed in a whole-function conditional wrapper."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Maximum number of statements allowed in a whole-function conditional wrapper.
     */
    maximumStatements?: number;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `EventTarget` over `EventEmitter`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-event-target.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-export-from.md
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
   *       "checkUsedVariables": {
   *         "type": "boolean",
   *         "description": "Whether to check variables that are used in the module."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to check variables that are used in the module.
     */
    checkUsedVariables?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `.getOrInsertComputed()` when the default value has side effects.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-get-or-insert-computed.md
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
namespace PreferGetOrInsertComputed {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer global numeric constants over `Number` static properties.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-global-number-constants.md
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
namespace PreferGlobalNumberConstants {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `globalThis` over `window`, `self`, and `global`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-global-this.md
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
 * @description Prefer HTTPS over HTTP.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-https.md
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
namespace PreferHttps {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer identifiers over string literals in import and export specifiers.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-identifier-import-export-specifiers.md
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
namespace PreferIdentifierImportExportSpecifiers {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `import.meta.{dirname,filename}` over legacy techniques for getting file paths.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-import-meta-properties.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-includes.md
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
 * @description Prefer `.includes()` over repeated equality comparisons.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-includes-over-repeated-comparisons.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | true       |
 *  ```
 */
namespace PreferIncludesOverRepeatedComparisons {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "minimumComparisons": {
   *         "type": "integer",
   *         "minimum": 2,
   *         "description": "The minimum number of equality comparisons before reporting."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * The minimum number of equality comparisons before reporting.
     */
    minimumComparisons?: number;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer passing iterables directly to constructors instead of filling empty collections.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-iterable-in-constructor.md
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
namespace PreferIterableInConstructor {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `Iterator.concat(…)` over temporary spread arrays.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-iterator-concat.md
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
namespace PreferIteratorConcat {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `Iterator#toArray()` over temporary arrays from iterator spreads.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-iterator-to-array.md
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
namespace PreferIteratorToArray {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer moving `.toArray()` to the end of iterator helper chains.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-iterator-to-array-at-end.md
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
namespace PreferIteratorToArrayAtEnd {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `KeyboardEvent#key` over deprecated keyboard event properties.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-keyboard-event-key.md
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
namespace PreferKeyboardEventKey {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `location.assign()` over assigning to `location.href`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-location-assign.md
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
namespace PreferLocationAssign {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer using a logical operator over a ternary.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-logical-operator-over-ternary.md
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
 * @description Prefer `Math.abs()` over manual absolute value expressions and symmetric range checks.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-math-abs.md
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
namespace PreferMathAbs {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `Math.min()` and `Math.max()` over ternaries for simple comparisons.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-math-min-max.md
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
 * @description Prefer `Math.trunc()` for truncating numbers.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-math-trunc.md
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
 * @description Prefer moving ternaries into the minimal varying part of an expression.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-minimal-ternary.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferMinimalTernary {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer modern DOM APIs.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-modern-dom-apis.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-modern-math-apis.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-module.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-native-coercion-functions.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-negative-index.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-node-protocol.md
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
 * @description Prefer `Number()` over `parseFloat()` and base-10 `parseInt()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-number-coercion.md
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
namespace PreferNumberCoercion {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `Number.isSafeInteger()` over integer checks.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-number-is-safe-integer.md
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
namespace PreferNumberIsSafeInteger {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `Number` static methods over global functions and optionally static properties over global constants.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-number-properties.md
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
   *         "type": "boolean",
   *         "description": "Whether to check usage of the global `Infinity`."
   *       },
   *       "checkNaN": {
   *         "type": "boolean",
   *         "description": "Whether to check usage of the global `NaN`."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to check usage of the global `Infinity`.
     */
    checkInfinity?: boolean;
    /**
     * Whether to check usage of the global `NaN`.
     */
    checkNaN?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `Object.defineProperties()` over multiple `Object.defineProperty()` calls.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-object-define-properties.md
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
namespace PreferObjectDefineProperties {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer object destructuring defaults over default object literals with spread.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-object-destructuring-defaults.md
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
namespace PreferObjectDestructuringDefaults {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer using `Object.fromEntries(…)` to transform a list of key-value pairs into an object.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-object-from-entries.md
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
   *         "uniqueItems": true,
   *         "description": "Additional functions to check."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Additional functions to check.
     */
    functions?: readonly unknown[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer the most specific `Object` iterable method.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-object-iterable-methods.md
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
namespace PreferObjectIterableMethods {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer omitting the `catch` binding parameter.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-optional-catch-binding.md
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
 * @description Prefer `Path2D` for repeatedly drawn canvas paths.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-path2d.md
 *
 *  ```md
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | deprecated  | false         |
 *  | recommended | unopinionated |
 *  ```
 */
namespace PreferPath2d {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer private class fields over the underscore-prefix convention.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-private-class-fields.md
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
namespace PreferPrivateClassFields {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer borrowing methods from the prototype instead of the instance.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-prototype-methods.md
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
 * @description Prefer `.querySelector()` and `.querySelectorAll()` over older DOM query methods.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-query-selector.md
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
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowWithVariables": {
   *         "type": "boolean",
   *         "description": "Allow using the old APIs when called with non-literal arguments (variables, expressions, etc.)."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Allow using the old APIs when called with non-literal arguments (variables, expressions, etc.).
     */
    allowWithVariables?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `queueMicrotask()` over `process.nextTick()`, `setImmediate()`, and `setTimeout(…, 0)`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-queue-microtask.md
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
namespace PreferQueueMicrotask {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "checkSetImmediate": {
   *         "type": "boolean",
   *         "description": "Whether to also check `setImmediate()`."
   *       },
   *       "checkSetTimeout": {
   *         "type": "boolean",
   *         "description": "Whether to also check `setTimeout(…, 0)`."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to also check `setImmediate()`.
     */
    checkSetImmediate?: boolean;
    /**
     * Whether to also check `setTimeout(…, 0)`.
     */
    checkSetTimeout?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `Reflect.apply()` over `Function#apply()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-reflect-apply.md
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
 * @description Prefer `RegExp#test()` over `String#match()`, `String#search()`, and `RegExp#exec()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-regexp-test.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-response-static-json.md
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
 * @description Prefer `:scope` when using element query selector methods.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-scoped-selector.md
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
namespace PreferScopedSelector {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `Set#has()` over `Array#includes()` when checking for existence or non-existence.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-set-has.md
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
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "minimumItems": {
   *         "type": "integer",
   *         "minimum": 0,
   *         "description": "The minimum known array size before `Set#has()` is enforced."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * The minimum known array size before `Set#has()` is enforced.
     */
    minimumItems?: number;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer using `Set#size` instead of `Array#length`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-set-size.md
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
 * @description Prefer arrow function properties over methods with a single return.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-short-arrow-method.md
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
namespace PreferShortArrowMethod {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer simple conditions first in logical expressions.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-simple-condition-first.md
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
namespace PreferSimpleConditionFirst {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer a simple comparison function for `Array#sort()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-simple-sort-comparator.md
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
namespace PreferSimpleSortComparator {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer a single `Array#some()` or `Array#every()` with a combined predicate.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-single-array-predicate.md
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
namespace PreferSingleArrayPredicate {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce combining multiple `Array#{push,unshift}()`, `Element#classList.{add,remove}()`, and `importScripts()` into one call.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-single-call.md
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
   *         "uniqueItems": true,
   *         "description": "Methods to ignore."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Methods to ignore.
     */
    ignore?: readonly unknown[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer a single object destructuring declaration per local const source.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-single-object-destructuring.md
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
namespace PreferSingleObjectDestructuring {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer declaring variables in the smallest possible scope.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-smaller-scope.md
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
namespace PreferSmallerScope {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `String#split()` with a limit.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-split-limit.md
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
namespace PreferSplitLimit {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer the spread operator over `Array.from(…)`, `Array#concat(…)`, `Array#{slice,toSpliced}()`, and trivial `for…of` copies.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-spread.md
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
 * @description Prefer `String#matchAll()` over `RegExp#exec()` loops.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-string-match-all.md
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
namespace PreferStringMatchAll {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `String#padStart()` and `String#padEnd()` over manual string padding.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-string-pad-start-end.md
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
namespace PreferStringPadStartEnd {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer using the `String.raw` tag to avoid escaping `\`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-string-raw.md
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
 * @description Prefer `String#repeat()` for repeated whitespace.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-string-repeat.md
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
namespace PreferStringRepeat {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "minimumRepetitions": {
   *         "type": "integer",
   *         "minimum": 2,
   *         "description": "The minimum number of repeated whitespace characters before `String#repeat()` is enforced."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * The minimum number of repeated whitespace characters before `String#repeat()` is enforced.
     */
    minimumRepetitions?: number;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `String#replaceAll()` over regex searches with the global flag and `String#split().join()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-string-replace-all.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-string-slice.md
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
 * @description Prefer `String#startsWith()` & `String#endsWith()` over `RegExp#test()` and `String#indexOf() === 0`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-string-starts-ends-with.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-string-trim-start-end.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-structured-clone.md
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
   *         "uniqueItems": true,
   *         "description": "Additional functions to check."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Additional functions to check.
     */
    functions?: readonly unknown[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `switch` over multiple `else-if`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-switch.md
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
   *         "minimum": 2,
   *         "description": "The minimum number of `if`/`else if` cases before suggesting a `switch` statement."
   *       },
   *       "emptyDefaultCase": {
   *         "enum": [
   *           "no-default-comment",
   *           "do-nothing-comment",
   *           "no-default-case"
   *         ],
   *         "description": "How to handle an empty `default` case."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * The minimum number of `if`/`else if` cases before suggesting a `switch` statement.
     */
    minimumCases?: number;
    /**
     * How to handle an empty `default` case.
     */
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
 * @description Prefer `Temporal` over `Date`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-temporal.md
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
namespace PreferTemporal {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "checkDateNow": {
   *         "type": "boolean",
   *         "description": "Whether to also flag `Date.now()`."
   *       },
   *       "checkReferences": {
   *         "type": "boolean",
   *         "description": "Whether to also flag bare references to `Date`, such as `x instanceof Date`."
   *       },
   *       "checkMethods": {
   *         "type": "boolean",
   *         "description": "Whether to also flag methods called on `Date` instances, such as `date.getFullYear()`. Requires TypeScript type information."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to also flag `Date.now()`.
     */
    checkDateNow?: boolean;
    /**
     * Whether to also flag bare references to `Date`, such as `x instanceof Date`.
     */
    checkReferences?: boolean;
    /**
     * Whether to also flag methods called on `Date` instances, such as `date.getFullYear()`. Requires TypeScript type information.
     */
    checkMethods?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer ternary expressions over simple `if-else` statements that return or assign values.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-ternary.md
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
   *     "description": "Whether to always prefer ternary, or only for single-line expressions."
   *   }
   * ]
   * ```
   */
  /**
   * Whether to always prefer ternary, or only for single-line expressions.
   */
  export type Options = 'always' | 'only-single-line';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer top-level await over top-level promises and async function calls.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-top-level-await.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-type-error.md
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
 * @description Require type literals to be last in union and intersection types.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-type-literal-last.md
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
namespace PreferTypeLiteralLast {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `Uint8Array#toBase64()` and `Uint8Array.fromBase64()` over `atob()`, `btoa()`, and `Buffer` base64 conversions.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-uint8array-base64.md
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
namespace PreferUint8arrayBase64 {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer Unicode code point escapes over legacy escape sequences.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-unicode-code-point-escapes.md
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
namespace PreferUnicodeCodePointEscapes {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `URL#href` over stringifying a `URL`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prefer-url-href.md
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
namespace PreferUrlHref {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prevent abbreviations.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/prevent-abbreviations.md
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
   *             "type": "boolean",
   *             "description": "Whether to check property names."
   *           },
   *           "checkVariables": {
   *             "type": "boolean",
   *             "description": "Whether to check variable names."
   *           },
   *           "checkDefaultAndNamespaceImports": {
   *             "type": [
   *               "boolean",
   *               "string"
   *             ],
   *             "pattern": "internal",
   *             "description": "Whether to check default and namespace import names."
   *           },
   *           "checkShorthandImports": {
   *             "type": [
   *               "boolean",
   *               "string"
   *             ],
   *             "pattern": "internal",
   *             "description": "Whether to check shorthand import names."
   *           },
   *           "checkShorthandProperties": {
   *             "type": "boolean",
   *             "description": "Whether to check shorthand property names."
   *           },
   *           "checkFilenames": {
   *             "type": "boolean",
   *             "description": "Whether to check filenames."
   *           },
   *           "extendDefaultReplacements": {
   *             "type": "boolean",
   *             "description": "Whether to extend the default replacements."
   *           },
   *           "replacements": {
   *             "$ref": "#/definitions/abbreviations",
   *             "description": "Custom abbreviation replacements."
   *           },
   *           "extendDefaultAllowList": {
   *             "type": "boolean",
   *             "description": "Whether to extend the default allow list."
   *           },
   *           "allowList": {
   *             "$ref": "#/definitions/booleanObject",
   *             "description": "Custom allow list of names."
   *           },
   *           "ignore": {
   *             "type": "array",
   *             "uniqueItems": true,
   *             "description": "Patterns to ignore."
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
          /**
           * Whether to check property names.
           */
          checkProperties?: boolean;
          /**
           * Whether to check variable names.
           */
          checkVariables?: boolean;
          /**
           * Whether to check default and namespace import names.
           */
          checkDefaultAndNamespaceImports?: boolean | string;
          /**
           * Whether to check shorthand import names.
           */
          checkShorthandImports?: boolean | string;
          /**
           * Whether to check shorthand property names.
           */
          checkShorthandProperties?: boolean;
          /**
           * Whether to check filenames.
           */
          checkFilenames?: boolean;
          /**
           * Whether to extend the default replacements.
           */
          extendDefaultReplacements?: boolean;
          replacements?: Abbreviations;
          /**
           * Whether to extend the default allow list.
           */
          extendDefaultAllowList?: boolean;
          allowList?: BooleanObject1;
          /**
           * Patterns to ignore.
           */
          ignore?: readonly unknown[];
        }>,
      ];

  export type Replacements = false | BooleanObject;

  /**
   * Custom abbreviation replacements.
   */
  export type Abbreviations = Readonly<Record<string, Replacements>>;

  export type BooleanObject = Readonly<Record<string, boolean>>;

  /**
   * Custom allow list of names.
   */
  export type BooleanObject1 = Readonly<Record<string, boolean>>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce consistent relative URL style.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/relative-url-style.md
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
   *     ],
   *     "description": "Whether to never or always use a leading `./` for relative URLs."
   *   }
   * ]
   * ```
   */
  /**
   * Whether to never or always use a leading `./` for relative URLs.
   */
  export type Options = 'never' | 'always';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce using the separator argument with `Array#join()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/require-array-join-separator.md
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
 * @description Require a compare function when calling `Array#sort()` or `Array#toSorted()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/require-array-sort-compare.md
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
namespace RequireArraySortCompare {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Require `CSS.escape()` for interpolated values in CSS selectors.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/require-css-escape.md
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
namespace RequireCssEscape {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "checkAllSelectors": {
   *         "type": "boolean",
   *         "description": "Check all selector interpolations instead of only attribute selector interpolations."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Check all selector interpolations instead of only attribute selector interpolations.
     */
    checkAllSelectors?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Require non-empty module attributes for imports and exports
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/require-module-attributes.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/require-module-specifiers.md
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/require-number-to-fixed-digits-argument.md
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
 * @description Require passive event listeners for high-frequency events.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/require-passive-events.md
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
namespace RequirePassiveEvents {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce using the `targetOrigin` argument with `window.postMessage()`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/require-post-message-target-origin.md
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
 * @description Require boolean-returning Proxy traps to return booleans.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/require-proxy-trap-boolean-return.md
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
namespace RequireProxyTrapBooleanReturn {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce better string content.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/string-content.md
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
   *         "description": "Patterns to replace in string content.",
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
   *                 "caseSensitive": {
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
   *       },
   *       "selectors": {
   *         "type": "array",
   *         "uniqueItems": true,
   *         "items": {
   *           "type": "string"
   *         },
   *         "description": "AST selectors for string nodes to check."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Patterns to replace in string content.
     */
    patterns?: Readonly<
      Record<
        string,
        | string
        | Readonly<{
            suggest: string;
            fix?: boolean;
            caseSensitive?: boolean;
            message?: string;
          }>
      >
    >;
    /**
     * AST selectors for string nodes to check.
     */
    selectors?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce consistent brace style for `case` clauses.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/switch-case-braces.md
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
   *       "avoid",
   *       "single-statement"
   *     ],
   *     "description": "Whether to always require braces, avoid them when possible, or require one statement per case."
   *   }
   * ]
   * ```
   */
  /**
   * Whether to always require braces, avoid them when possible, or require one statement per case.
   */
  export type Options = 'always' | 'avoid' | 'single-statement';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce consistent `break`/`return`/`continue`/`throw` position in `case` clauses.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/switch-case-break-position.md
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
namespace SwitchCaseBreakPosition {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Fix whitespace-insensitive template indentation.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/template-indent.md
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
   *             "pattern": "^\\s+$",
   *             "description": "Whitespace string to use as indentation."
   *           },
   *           {
   *             "type": "integer",
   *             "minimum": 1,
   *             "description": "Number of spaces to use as indentation."
   *           }
   *         ],
   *         "description": "The indentation to use inside the template literal."
   *       },
   *       "tags": {
   *         "type": "array",
   *         "uniqueItems": true,
   *         "items": {
   *           "type": "string"
   *         },
   *         "description": "Tagged template names to check."
   *       },
   *       "functions": {
   *         "type": "array",
   *         "uniqueItems": true,
   *         "items": {
   *           "type": "string"
   *         },
   *         "description": "Function names whose template literal arguments to check."
   *       },
   *       "selectors": {
   *         "type": "array",
   *         "uniqueItems": true,
   *         "items": {
   *           "type": "string"
   *         },
   *         "description": "AST selectors for template literals to check."
   *       },
   *       "comments": {
   *         "type": "array",
   *         "uniqueItems": true,
   *         "items": {
   *           "type": "string"
   *         },
   *         "description": "Comment patterns to mark template literals for checking."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * The indentation to use inside the template literal.
     */
    indent?: string | number;
    /**
     * Tagged template names to check.
     */
    tags?: readonly string[];
    /**
     * Function names whose template literal arguments to check.
     */
    functions?: readonly string[];
    /**
     * AST selectors for template literals to check.
     */
    selectors?: readonly string[];
    /**
     * Comment patterns to mark template literals for checking.
     */
    comments?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce consistent case for text encoding identifiers.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/text-encoding-identifier-case.md
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
   *         "type": "boolean",
   *         "description": "Whether to prefer identifiers with a dash, like `utf-8` instead of `utf8`."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to prefer identifiers with a dash, like `utf-8` instead of `utf8`.
     */
    withDash?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Require `new` when creating an error.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/throw-new-error.md
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
 * @description Limit the complexity of `try` blocks.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/rules/try-complexity.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace TryComplexity {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "max": {
   *         "type": "integer",
   *         "minimum": 1,
   *         "description": "The maximum allowed complexity of a `try` block."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * The maximum allowed complexity of a `try` block.
     */
    max?: number;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Removed. Prefer `eslint-plugin-regexp`
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/deleted-and-deprecated-rules.md#better-regex
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace BetterRegex {
  export type RuleEntry = 0;
}

/**
 * @description Replaced by `unicorn/no-instanceof-builtins` which covers more cases.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/deleted-and-deprecated-rules.md#no-instanceof-array
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
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/deleted-and-deprecated-rules.md#no-length-as-slice-end
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
 * @description Replaced by `unicorn/prefer-unicode-code-point-escapes` which covers more cases.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/deleted-and-deprecated-rules.md#no-hex-escape
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace NoHexEscape {
  export type RuleEntry = 0;
}

/**
 * @description Replaced by `unicorn/prefer-single-call` which covers more cases.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/deleted-and-deprecated-rules.md#no-array-push-push
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

/**
 * @description Renamed to `unicorn/consistent-json-file-read`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/deleted-and-deprecated-rules.md#prefer-json-parse-buffer
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace PreferJsonParseBuffer {
  export type RuleEntry = 0;
}

/**
 * @description Renamed to `unicorn/dom-node-dataset`.
 * @link https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v66.0.0/docs/deleted-and-deprecated-rules.md#prefer-dom-node-dataset
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace PreferDomNodeDataset {
  export type RuleEntry = 0;
}

export type EslintUnicornRules = Readonly<{
  'unicorn/better-dom-traversing': BetterDomTraversing.RuleEntry;
  'unicorn/catch-error-name': CatchErrorName.RuleEntry;
  'unicorn/class-reference-in-static-methods': ClassReferenceInStaticMethods.RuleEntry;
  'unicorn/comment-content': CommentContent.RuleEntry;
  'unicorn/consistent-assert': ConsistentAssert.RuleEntry;
  'unicorn/consistent-class-member-order': ConsistentClassMemberOrder.RuleEntry;
  'unicorn/consistent-compound-words': ConsistentCompoundWords.RuleEntry;
  'unicorn/consistent-date-clone': ConsistentDateClone.RuleEntry;
  'unicorn/consistent-destructuring': ConsistentDestructuring.RuleEntry;
  'unicorn/consistent-empty-array-spread': ConsistentEmptyArraySpread.RuleEntry;
  'unicorn/consistent-existence-index-check': ConsistentExistenceIndexCheck.RuleEntry;
  'unicorn/consistent-export-decorator-position': ConsistentExportDecoratorPosition.RuleEntry;
  'unicorn/consistent-function-scoping': ConsistentFunctionScoping.RuleEntry;
  'unicorn/consistent-function-style': ConsistentFunctionStyle.RuleEntry;
  'unicorn/consistent-json-file-read': ConsistentJsonFileRead.RuleEntry;
  'unicorn/consistent-optional-chaining': ConsistentOptionalChaining.RuleEntry;
  'unicorn/consistent-template-literal-escape': ConsistentTemplateLiteralEscape.RuleEntry;
  'unicorn/custom-error-definition': CustomErrorDefinition.RuleEntry;
  'unicorn/dom-node-dataset': DomNodeDataset.RuleEntry;
  'unicorn/empty-brace-spaces': EmptyBraceSpaces.RuleEntry;
  'unicorn/error-message': ErrorMessage.RuleEntry;
  'unicorn/escape-case': EscapeCase.RuleEntry;
  'unicorn/expiring-todo-comments': ExpiringTodoComments.RuleEntry;
  'unicorn/explicit-length-check': ExplicitLengthCheck.RuleEntry;
  'unicorn/explicit-timer-delay': ExplicitTimerDelay.RuleEntry;
  'unicorn/filename-case': FilenameCase.RuleEntry;
  'unicorn/id-match': IdMatch.RuleEntry;
  'unicorn/import-style': ImportStyle.RuleEntry;
  'unicorn/isolated-functions': IsolatedFunctions.RuleEntry;
  'unicorn/max-nested-calls': MaxNestedCalls.RuleEntry;
  'unicorn/new-for-builtins': NewForBuiltins.RuleEntry;
  'unicorn/no-abusive-eslint-disable': NoAbusiveEslintDisable.RuleEntry;
  'unicorn/no-accessor-recursion': NoAccessorRecursion.RuleEntry;
  'unicorn/no-anonymous-default-export': NoAnonymousDefaultExport.RuleEntry;
  'unicorn/no-array-callback-reference': NoArrayCallbackReference.RuleEntry;
  'unicorn/no-array-fill-with-reference-type': NoArrayFillWithReferenceType.RuleEntry;
  'unicorn/no-array-from-fill': NoArrayFromFill.RuleEntry;
  'unicorn/no-array-method-this-argument': NoArrayMethodThisArgument.RuleEntry;
  'unicorn/no-array-reduce': NoArrayReduce.RuleEntry;
  'unicorn/no-array-reverse': NoArrayReverse.RuleEntry;
  'unicorn/no-array-sort': NoArraySort.RuleEntry;
  'unicorn/no-asterisk-prefix-in-documentation-comments': NoAsteriskPrefixInDocumentationComments.RuleEntry;
  'unicorn/no-await-expression-member': NoAwaitExpressionMember.RuleEntry;
  'unicorn/no-await-in-promise-methods': NoAwaitInPromiseMethods.RuleEntry;
  'unicorn/no-blob-to-file': NoBlobToFile.RuleEntry;
  'unicorn/no-break-in-nested-loop': NoBreakInNestedLoop.RuleEntry;
  'unicorn/no-canvas-to-image': NoCanvasToImage.RuleEntry;
  'unicorn/no-computed-property-existence-check': NoComputedPropertyExistenceCheck.RuleEntry;
  'unicorn/no-confusing-array-splice': NoConfusingArraySplice.RuleEntry;
  'unicorn/no-confusing-array-with': NoConfusingArrayWith.RuleEntry;
  'unicorn/no-console-spaces': NoConsoleSpaces.RuleEntry;
  'unicorn/no-declarations-before-early-exit': NoDeclarationsBeforeEarlyExit.RuleEntry;
  'unicorn/no-document-cookie': NoDocumentCookie.RuleEntry;
  'unicorn/no-duplicate-loops': NoDuplicateLoops.RuleEntry;
  'unicorn/no-duplicate-set-values': NoDuplicateSetValues.RuleEntry;
  'unicorn/no-empty-file': NoEmptyFile.RuleEntry;
  'unicorn/no-error-property-assignment': NoErrorPropertyAssignment.RuleEntry;
  'unicorn/no-exports-in-scripts': NoExportsInScripts.RuleEntry;
  'unicorn/no-for-each': NoForEach.RuleEntry;
  'unicorn/no-for-loop': NoForLoop.RuleEntry;
  'unicorn/no-global-object-property-assignment': NoGlobalObjectPropertyAssignment.RuleEntry;
  'unicorn/no-immediate-mutation': NoImmediateMutation.RuleEntry;
  'unicorn/no-incorrect-query-selector': NoIncorrectQuerySelector.RuleEntry;
  'unicorn/no-incorrect-template-string-interpolation': NoIncorrectTemplateStringInterpolation.RuleEntry;
  'unicorn/no-instanceof-builtins': NoInstanceofBuiltins.RuleEntry;
  'unicorn/no-invalid-argument-count': NoInvalidArgumentCount.RuleEntry;
  'unicorn/no-invalid-fetch-options': NoInvalidFetchOptions.RuleEntry;
  'unicorn/no-invalid-file-input-accept': NoInvalidFileInputAccept.RuleEntry;
  'unicorn/no-invalid-remove-event-listener': NoInvalidRemoveEventListener.RuleEntry;
  'unicorn/no-keyword-prefix': NoKeywordPrefix.RuleEntry;
  'unicorn/no-late-current-target-access': NoLateCurrentTargetAccess.RuleEntry;
  'unicorn/no-lonely-if': NoLonelyIf.RuleEntry;
  'unicorn/no-magic-array-flat-depth': NoMagicArrayFlatDepth.RuleEntry;
  'unicorn/no-manually-wrapped-comments': NoManuallyWrappedComments.RuleEntry;
  'unicorn/no-mismatched-map-key': NoMismatchedMapKey.RuleEntry;
  'unicorn/no-named-default': NoNamedDefault.RuleEntry;
  'unicorn/no-negated-array-predicate': NoNegatedArrayPredicate.RuleEntry;
  'unicorn/no-negated-comparison': NoNegatedComparison.RuleEntry;
  'unicorn/no-negated-condition': NoNegatedCondition.RuleEntry;
  'unicorn/no-negation-in-equality-check': NoNegationInEqualityCheck.RuleEntry;
  'unicorn/no-nested-ternary': NoNestedTernary.RuleEntry;
  'unicorn/no-new-array': NoNewArray.RuleEntry;
  'unicorn/no-new-buffer': NoNewBuffer.RuleEntry;
  'unicorn/no-null': NoNull.RuleEntry;
  'unicorn/no-object-as-default-parameter': NoObjectAsDefaultParameter.RuleEntry;
  'unicorn/no-object-methods-with-collections': NoObjectMethodsWithCollections.RuleEntry;
  'unicorn/no-optional-chaining-on-undeclared-variable': NoOptionalChainingOnUndeclaredVariable.RuleEntry;
  'unicorn/no-process-exit': NoProcessExit.RuleEntry;
  'unicorn/no-redundant-comparison': NoRedundantComparison.RuleEntry;
  'unicorn/no-return-array-push': NoReturnArrayPush.RuleEntry;
  'unicorn/no-single-promise-in-promise-methods': NoSinglePromiseInPromiseMethods.RuleEntry;
  'unicorn/no-static-only-class': NoStaticOnlyClass.RuleEntry;
  'unicorn/no-subtraction-comparison': NoSubtractionComparison.RuleEntry;
  'unicorn/no-thenable': NoThenable.RuleEntry;
  'unicorn/no-this-assignment': NoThisAssignment.RuleEntry;
  'unicorn/no-this-outside-of-class': NoThisOutsideOfClass.RuleEntry;
  'unicorn/no-top-level-side-effects': NoTopLevelSideEffects.RuleEntry;
  'unicorn/no-typeof-undefined': NoTypeofUndefined.RuleEntry;
  'unicorn/no-undeclared-class-members': NoUndeclaredClassMembers.RuleEntry;
  'unicorn/no-unnecessary-array-flat-depth': NoUnnecessaryArrayFlatDepth.RuleEntry;
  'unicorn/no-unnecessary-array-splice-count': NoUnnecessaryArraySpliceCount.RuleEntry;
  'unicorn/no-unnecessary-await': NoUnnecessaryAwait.RuleEntry;
  'unicorn/no-unnecessary-global-this': NoUnnecessaryGlobalThis.RuleEntry;
  'unicorn/no-unnecessary-nested-ternary': NoUnnecessaryNestedTernary.RuleEntry;
  'unicorn/no-unnecessary-polyfills': NoUnnecessaryPolyfills.RuleEntry;
  'unicorn/no-unnecessary-slice-end': NoUnnecessarySliceEnd.RuleEntry;
  'unicorn/no-unnecessary-splice': NoUnnecessarySplice.RuleEntry;
  'unicorn/no-unreadable-array-destructuring': NoUnreadableArrayDestructuring.RuleEntry;
  'unicorn/no-unreadable-iife': NoUnreadableIife.RuleEntry;
  'unicorn/no-unreadable-new-expression': NoUnreadableNewExpression.RuleEntry;
  'unicorn/no-unreadable-object-destructuring': NoUnreadableObjectDestructuring.RuleEntry;
  'unicorn/no-unsafe-buffer-conversion': NoUnsafeBufferConversion.RuleEntry;
  'unicorn/no-unsafe-dom-html': NoUnsafeDomHtml.RuleEntry;
  'unicorn/no-unsafe-property-key': NoUnsafePropertyKey.RuleEntry;
  'unicorn/no-unsafe-string-replacement': NoUnsafeStringReplacement.RuleEntry;
  'unicorn/no-unused-array-method-return': NoUnusedArrayMethodReturn.RuleEntry;
  'unicorn/no-unused-properties': NoUnusedProperties.RuleEntry;
  'unicorn/no-useless-boolean-cast': NoUselessBooleanCast.RuleEntry;
  'unicorn/no-useless-collection-argument': NoUselessCollectionArgument.RuleEntry;
  'unicorn/no-useless-concat': NoUselessConcat.RuleEntry;
  'unicorn/no-useless-else': NoUselessElse.RuleEntry;
  'unicorn/no-useless-error-capture-stack-trace': NoUselessErrorCaptureStackTrace.RuleEntry;
  'unicorn/no-useless-fallback-in-spread': NoUselessFallbackInSpread.RuleEntry;
  'unicorn/no-useless-iterator-to-array': NoUselessIteratorToArray.RuleEntry;
  'unicorn/no-useless-length-check': NoUselessLengthCheck.RuleEntry;
  'unicorn/no-useless-promise-resolve-reject': NoUselessPromiseResolveReject.RuleEntry;
  'unicorn/no-useless-recursion': NoUselessRecursion.RuleEntry;
  'unicorn/no-useless-spread': NoUselessSpread.RuleEntry;
  'unicorn/no-useless-switch-case': NoUselessSwitchCase.RuleEntry;
  'unicorn/no-useless-template-literals': NoUselessTemplateLiterals.RuleEntry;
  'unicorn/no-useless-undefined': NoUselessUndefined.RuleEntry;
  'unicorn/no-zero-fractions': NoZeroFractions.RuleEntry;
  'unicorn/number-literal-case': NumberLiteralCase.RuleEntry;
  'unicorn/numeric-separators-style': NumericSeparatorsStyle.RuleEntry;
  'unicorn/prefer-add-event-listener': PreferAddEventListener.RuleEntry;
  'unicorn/prefer-add-event-listener-options': PreferAddEventListenerOptions.RuleEntry;
  'unicorn/prefer-array-find': PreferArrayFind.RuleEntry;
  'unicorn/prefer-array-flat': PreferArrayFlat.RuleEntry;
  'unicorn/prefer-array-flat-map': PreferArrayFlatMap.RuleEntry;
  'unicorn/prefer-array-from-map': PreferArrayFromMap.RuleEntry;
  'unicorn/prefer-array-index-of': PreferArrayIndexOf.RuleEntry;
  'unicorn/prefer-array-last-methods': PreferArrayLastMethods.RuleEntry;
  'unicorn/prefer-array-some': PreferArraySome.RuleEntry;
  'unicorn/prefer-at': PreferAt.RuleEntry;
  'unicorn/prefer-await': PreferAwait.RuleEntry;
  'unicorn/prefer-bigint-literals': PreferBigintLiterals.RuleEntry;
  'unicorn/prefer-blob-reading-methods': PreferBlobReadingMethods.RuleEntry;
  'unicorn/prefer-class-fields': PreferClassFields.RuleEntry;
  'unicorn/prefer-classlist-toggle': PreferClasslistToggle.RuleEntry;
  'unicorn/prefer-code-point': PreferCodePoint.RuleEntry;
  'unicorn/prefer-date-now': PreferDateNow.RuleEntry;
  'unicorn/prefer-default-parameters': PreferDefaultParameters.RuleEntry;
  'unicorn/prefer-direct-iteration': PreferDirectIteration.RuleEntry;
  'unicorn/prefer-dispose': PreferDispose.RuleEntry;
  'unicorn/prefer-dom-node-append': PreferDomNodeAppend.RuleEntry;
  'unicorn/prefer-dom-node-html-methods': PreferDomNodeHtmlMethods.RuleEntry;
  'unicorn/prefer-dom-node-remove': PreferDomNodeRemove.RuleEntry;
  'unicorn/prefer-dom-node-text-content': PreferDomNodeTextContent.RuleEntry;
  'unicorn/prefer-early-return': PreferEarlyReturn.RuleEntry;
  'unicorn/prefer-event-target': PreferEventTarget.RuleEntry;
  'unicorn/prefer-export-from': PreferExportFrom.RuleEntry;
  'unicorn/prefer-get-or-insert-computed': PreferGetOrInsertComputed.RuleEntry;
  'unicorn/prefer-global-number-constants': PreferGlobalNumberConstants.RuleEntry;
  'unicorn/prefer-global-this': PreferGlobalThis.RuleEntry;
  'unicorn/prefer-https': PreferHttps.RuleEntry;
  'unicorn/prefer-identifier-import-export-specifiers': PreferIdentifierImportExportSpecifiers.RuleEntry;
  'unicorn/prefer-import-meta-properties': PreferImportMetaProperties.RuleEntry;
  'unicorn/prefer-includes': PreferIncludes.RuleEntry;
  'unicorn/prefer-includes-over-repeated-comparisons': PreferIncludesOverRepeatedComparisons.RuleEntry;
  'unicorn/prefer-iterable-in-constructor': PreferIterableInConstructor.RuleEntry;
  'unicorn/prefer-iterator-concat': PreferIteratorConcat.RuleEntry;
  'unicorn/prefer-iterator-to-array': PreferIteratorToArray.RuleEntry;
  'unicorn/prefer-iterator-to-array-at-end': PreferIteratorToArrayAtEnd.RuleEntry;
  'unicorn/prefer-keyboard-event-key': PreferKeyboardEventKey.RuleEntry;
  'unicorn/prefer-location-assign': PreferLocationAssign.RuleEntry;
  'unicorn/prefer-logical-operator-over-ternary': PreferLogicalOperatorOverTernary.RuleEntry;
  'unicorn/prefer-math-abs': PreferMathAbs.RuleEntry;
  'unicorn/prefer-math-min-max': PreferMathMinMax.RuleEntry;
  'unicorn/prefer-math-trunc': PreferMathTrunc.RuleEntry;
  'unicorn/prefer-minimal-ternary': PreferMinimalTernary.RuleEntry;
  'unicorn/prefer-modern-dom-apis': PreferModernDomApis.RuleEntry;
  'unicorn/prefer-modern-math-apis': PreferModernMathApis.RuleEntry;
  'unicorn/prefer-module': PreferModule.RuleEntry;
  'unicorn/prefer-native-coercion-functions': PreferNativeCoercionFunctions.RuleEntry;
  'unicorn/prefer-negative-index': PreferNegativeIndex.RuleEntry;
  'unicorn/prefer-node-protocol': PreferNodeProtocol.RuleEntry;
  'unicorn/prefer-number-coercion': PreferNumberCoercion.RuleEntry;
  'unicorn/prefer-number-is-safe-integer': PreferNumberIsSafeInteger.RuleEntry;
  'unicorn/prefer-number-properties': PreferNumberProperties.RuleEntry;
  'unicorn/prefer-object-define-properties': PreferObjectDefineProperties.RuleEntry;
  'unicorn/prefer-object-destructuring-defaults': PreferObjectDestructuringDefaults.RuleEntry;
  'unicorn/prefer-object-from-entries': PreferObjectFromEntries.RuleEntry;
  'unicorn/prefer-object-iterable-methods': PreferObjectIterableMethods.RuleEntry;
  'unicorn/prefer-optional-catch-binding': PreferOptionalCatchBinding.RuleEntry;
  'unicorn/prefer-path2d': PreferPath2d.RuleEntry;
  'unicorn/prefer-private-class-fields': PreferPrivateClassFields.RuleEntry;
  'unicorn/prefer-prototype-methods': PreferPrototypeMethods.RuleEntry;
  'unicorn/prefer-query-selector': PreferQuerySelector.RuleEntry;
  'unicorn/prefer-queue-microtask': PreferQueueMicrotask.RuleEntry;
  'unicorn/prefer-reflect-apply': PreferReflectApply.RuleEntry;
  'unicorn/prefer-regexp-test': PreferRegexpTest.RuleEntry;
  'unicorn/prefer-response-static-json': PreferResponseStaticJson.RuleEntry;
  'unicorn/prefer-scoped-selector': PreferScopedSelector.RuleEntry;
  'unicorn/prefer-set-has': PreferSetHas.RuleEntry;
  'unicorn/prefer-set-size': PreferSetSize.RuleEntry;
  'unicorn/prefer-short-arrow-method': PreferShortArrowMethod.RuleEntry;
  'unicorn/prefer-simple-condition-first': PreferSimpleConditionFirst.RuleEntry;
  'unicorn/prefer-simple-sort-comparator': PreferSimpleSortComparator.RuleEntry;
  'unicorn/prefer-single-array-predicate': PreferSingleArrayPredicate.RuleEntry;
  'unicorn/prefer-single-call': PreferSingleCall.RuleEntry;
  'unicorn/prefer-single-object-destructuring': PreferSingleObjectDestructuring.RuleEntry;
  'unicorn/prefer-smaller-scope': PreferSmallerScope.RuleEntry;
  'unicorn/prefer-split-limit': PreferSplitLimit.RuleEntry;
  'unicorn/prefer-spread': PreferSpread.RuleEntry;
  'unicorn/prefer-string-match-all': PreferStringMatchAll.RuleEntry;
  'unicorn/prefer-string-pad-start-end': PreferStringPadStartEnd.RuleEntry;
  'unicorn/prefer-string-raw': PreferStringRaw.RuleEntry;
  'unicorn/prefer-string-repeat': PreferStringRepeat.RuleEntry;
  'unicorn/prefer-string-replace-all': PreferStringReplaceAll.RuleEntry;
  'unicorn/prefer-string-slice': PreferStringSlice.RuleEntry;
  'unicorn/prefer-string-starts-ends-with': PreferStringStartsEndsWith.RuleEntry;
  'unicorn/prefer-string-trim-start-end': PreferStringTrimStartEnd.RuleEntry;
  'unicorn/prefer-structured-clone': PreferStructuredClone.RuleEntry;
  'unicorn/prefer-switch': PreferSwitch.RuleEntry;
  'unicorn/prefer-temporal': PreferTemporal.RuleEntry;
  'unicorn/prefer-ternary': PreferTernary.RuleEntry;
  'unicorn/prefer-top-level-await': PreferTopLevelAwait.RuleEntry;
  'unicorn/prefer-type-error': PreferTypeError.RuleEntry;
  'unicorn/prefer-type-literal-last': PreferTypeLiteralLast.RuleEntry;
  'unicorn/prefer-uint8array-base64': PreferUint8arrayBase64.RuleEntry;
  'unicorn/prefer-unicode-code-point-escapes': PreferUnicodeCodePointEscapes.RuleEntry;
  'unicorn/prefer-url-href': PreferUrlHref.RuleEntry;
  'unicorn/prevent-abbreviations': PreventAbbreviations.RuleEntry;
  'unicorn/relative-url-style': RelativeUrlStyle.RuleEntry;
  'unicorn/require-array-join-separator': RequireArrayJoinSeparator.RuleEntry;
  'unicorn/require-array-sort-compare': RequireArraySortCompare.RuleEntry;
  'unicorn/require-css-escape': RequireCssEscape.RuleEntry;
  'unicorn/require-module-attributes': RequireModuleAttributes.RuleEntry;
  'unicorn/require-module-specifiers': RequireModuleSpecifiers.RuleEntry;
  'unicorn/require-number-to-fixed-digits-argument': RequireNumberToFixedDigitsArgument.RuleEntry;
  'unicorn/require-passive-events': RequirePassiveEvents.RuleEntry;
  'unicorn/require-post-message-target-origin': RequirePostMessageTargetOrigin.RuleEntry;
  'unicorn/require-proxy-trap-boolean-return': RequireProxyTrapBooleanReturn.RuleEntry;
  'unicorn/string-content': StringContent.RuleEntry;
  'unicorn/switch-case-braces': SwitchCaseBraces.RuleEntry;
  'unicorn/switch-case-break-position': SwitchCaseBreakPosition.RuleEntry;
  'unicorn/template-indent': TemplateIndent.RuleEntry;
  'unicorn/text-encoding-identifier-case': TextEncodingIdentifierCase.RuleEntry;
  'unicorn/throw-new-error': ThrowNewError.RuleEntry;
  'unicorn/try-complexity': TryComplexity.RuleEntry;

  // deprecated
  'unicorn/better-regex': BetterRegex.RuleEntry;
  'unicorn/no-instanceof-array': NoInstanceofArray.RuleEntry;
  'unicorn/no-length-as-slice-end': NoLengthAsSliceEnd.RuleEntry;
  'unicorn/no-hex-escape': NoHexEscape.RuleEntry;
  'unicorn/no-array-push-push': NoArrayPushPush.RuleEntry;
  'unicorn/prefer-json-parse-buffer': PreferJsonParseBuffer.RuleEntry;
  'unicorn/prefer-dom-node-dataset': PreferDomNodeDataset.RuleEntry;
}>;

export type EslintUnicornRulesOption = Readonly<{
  'unicorn/catch-error-name': CatchErrorName.Options;
  'unicorn/class-reference-in-static-methods': ClassReferenceInStaticMethods.Options;
  'unicorn/comment-content': CommentContent.Options;
  'unicorn/consistent-class-member-order': ConsistentClassMemberOrder.Options;
  'unicorn/consistent-compound-words': ConsistentCompoundWords.Options;
  'unicorn/consistent-export-decorator-position': ConsistentExportDecoratorPosition.Options;
  'unicorn/consistent-function-scoping': ConsistentFunctionScoping.Options;
  'unicorn/consistent-function-style': ConsistentFunctionStyle.Options;
  'unicorn/consistent-json-file-read': ConsistentJsonFileRead.Options;
  'unicorn/dom-node-dataset': DomNodeDataset.Options;
  'unicorn/escape-case': EscapeCase.Options;
  'unicorn/expiring-todo-comments': ExpiringTodoComments.Options;
  'unicorn/explicit-length-check': ExplicitLengthCheck.Options;
  'unicorn/explicit-timer-delay': ExplicitTimerDelay.Options;
  'unicorn/filename-case': FilenameCase.Options;
  'unicorn/id-match': readonly [IdMatch.Options0, IdMatch.Options1];
  'unicorn/import-style': ImportStyle.Options;
  'unicorn/isolated-functions': IsolatedFunctions.Options;
  'unicorn/max-nested-calls': MaxNestedCalls.Options;
  'unicorn/no-array-callback-reference': NoArrayCallbackReference.Options;
  'unicorn/no-array-reduce': NoArrayReduce.Options;
  'unicorn/no-array-reverse': NoArrayReverse.Options;
  'unicorn/no-array-sort': NoArraySort.Options;
  'unicorn/no-empty-file': NoEmptyFile.Options;
  'unicorn/no-instanceof-builtins': NoInstanceofBuiltins.Options;
  'unicorn/no-keyword-prefix': NoKeywordPrefix.Options;
  'unicorn/no-negated-comparison': NoNegatedComparison.Options;
  'unicorn/no-null': NoNull.Options;
  'unicorn/no-typeof-undefined': NoTypeofUndefined.Options;
  'unicorn/no-unnecessary-polyfills': NoUnnecessaryPolyfills.Options;
  'unicorn/no-unreadable-array-destructuring': NoUnreadableArrayDestructuring.Options;
  'unicorn/no-useless-undefined': NoUselessUndefined.Options;
  'unicorn/number-literal-case': NumberLiteralCase.Options;
  'unicorn/numeric-separators-style': NumericSeparatorsStyle.Options;
  'unicorn/prefer-add-event-listener': PreferAddEventListener.Options;
  'unicorn/prefer-array-find': PreferArrayFind.Options;
  'unicorn/prefer-array-flat': PreferArrayFlat.Options;
  'unicorn/prefer-at': PreferAt.Options;
  'unicorn/prefer-early-return': PreferEarlyReturn.Options;
  'unicorn/prefer-export-from': PreferExportFrom.Options;
  'unicorn/prefer-includes-over-repeated-comparisons': PreferIncludesOverRepeatedComparisons.Options;
  'unicorn/prefer-number-properties': PreferNumberProperties.Options;
  'unicorn/prefer-object-from-entries': PreferObjectFromEntries.Options;
  'unicorn/prefer-query-selector': PreferQuerySelector.Options;
  'unicorn/prefer-queue-microtask': PreferQueueMicrotask.Options;
  'unicorn/prefer-set-has': PreferSetHas.Options;
  'unicorn/prefer-single-call': PreferSingleCall.Options;
  'unicorn/prefer-string-repeat': PreferStringRepeat.Options;
  'unicorn/prefer-structured-clone': PreferStructuredClone.Options;
  'unicorn/prefer-switch': PreferSwitch.Options;
  'unicorn/prefer-temporal': PreferTemporal.Options;
  'unicorn/prefer-ternary': PreferTernary.Options;
  'unicorn/prevent-abbreviations': PreventAbbreviations.Options;
  'unicorn/relative-url-style': RelativeUrlStyle.Options;
  'unicorn/require-css-escape': RequireCssEscape.Options;
  'unicorn/string-content': StringContent.Options;
  'unicorn/switch-case-braces': SwitchCaseBraces.Options;
  'unicorn/template-indent': TemplateIndent.Options;
  'unicorn/text-encoding-identifier-case': TextEncodingIdentifierCase.Options;
  'unicorn/try-complexity': TryComplexity.Options;
}>;
