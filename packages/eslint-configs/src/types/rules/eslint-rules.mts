/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleSeverity, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleSeverity, ...T[1]] : T;

/**
 * Enforce getter and setter pairs in objects and classes
 *
 * @link https://eslint.org/docs/latest/rules/accessor-pairs
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace AccessorPairs {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "getWithoutSet": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "setWithoutGet": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "enforceForClassMembers": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly getWithoutSet?: boolean;
    readonly setWithoutGet?: boolean;
    readonly enforceForClassMembers?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce linebreaks after opening and before closing array brackets
 *
 * @link https://eslint.org/docs/latest/rules/array-bracket-newline
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace ArrayBracketNewline {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "enum": [
   *           "always",
   *           "never",
   *           "consistent"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "multiline": {
   *             "type": "boolean"
   *           },
   *           "minItems": {
   *             "type": [
   *               "integer",
   *               "null"
   *             ],
   *             "minimum": 0
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce consistent spacing inside array brackets
 *
 * @link https://eslint.org/docs/latest/rules/array-bracket-spacing
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace ArrayBracketSpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "singleValue": {
   *         "type": "boolean"
   *       },
   *       "objectsInArrays": {
   *         "type": "boolean"
   *       },
   *       "arraysInArrays": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce `return` statements in callbacks of array methods
 *
 * @link https://eslint.org/docs/latest/rules/array-callback-return
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | hasSuggestions | true    |
 *  | recommended    | false   |
 *  ```
 */
namespace ArrayCallbackReturn {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowImplicit": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "checkForEach": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "allowVoid": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowImplicit?: boolean;
    readonly checkForEach?: boolean;
    readonly allowVoid?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce line breaks after each array element
 *
 * @link https://eslint.org/docs/latest/rules/array-element-newline
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace ArrayElementNewline {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "definitions": {
   *     "basicConfig": {
   *       "oneOf": [
   *         {
   *           "enum": ["always", "never", "consistent"]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "multiline": {
   *               "type": "boolean"
   *             },
   *             "minItems": {
   *               "type": ["integer", "null"],
   *               "minimum": 0
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       ]
   *     }
   *   },
   *   "type": "array",
   *   "items": [
   *     {
   *       "oneOf": [
   *         {
   *           "$ref": "#/definitions/basicConfig"
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "ArrayExpression": {
   *               "$ref": "#/definitions/basicConfig"
   *             },
   *             "ArrayPattern": {
   *               "$ref": "#/definitions/basicConfig"
   *             }
   *           },
   *           "additionalProperties": false,
   *           "minProperties": 1
   *         }
   *       ]
   *     }
   *   ]
   * }
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require braces around arrow function bodies
 *
 * @link https://eslint.org/docs/latest/rules/arrow-body-style
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace ArrowBodyStyle {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "anyOf": [
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["always", "never"]
   *         }
   *       ],
   *       "minItems": 0,
   *       "maxItems": 1
   *     },
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["as-needed"]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "requireReturnForObjectLiteral": {
   *               "type": "boolean"
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       ],
   *       "minItems": 0,
   *       "maxItems": 2
   *     }
   *   ]
   * }
   * ```
   */
  export type Options =
    | readonly [
        'as-needed',
        {
          readonly requireReturnForObjectLiteral?: boolean;
        },
      ]
    | readonly ['always' | 'never']
    | readonly ['as-needed']
    | readonly [];

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require parentheses around arrow function arguments
 *
 * @link https://eslint.org/docs/latest/rules/arrow-parens
 *
 *  ```md
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | deprecated  | true   |
 *  | fixable     | code   |
 *  | recommended | false  |
 *  ```
 */
namespace ArrowParens {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "as-needed"
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "requireForBlockBody": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce consistent spacing before and after the arrow in arrow functions
 *
 * @link https://eslint.org/docs/latest/rules/arrow-spacing
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace ArrowSpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "before": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "after": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce the use of variables within the scope they are defined
 *
 * @link https://eslint.org/docs/latest/rules/block-scoped-var
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace BlockScopedVar {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow or enforce spaces inside of blocks after opening block and before
 * closing block
 *
 * @link https://eslint.org/docs/latest/rules/block-spacing
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace BlockSpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce consistent brace style for blocks
 *
 * @link https://eslint.org/docs/latest/rules/brace-style
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace BraceStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "1tbs",
   *       "stroustrup",
   *       "allman"
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowSingleLine": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require `return` statements after callbacks
 *
 * @link https://eslint.org/docs/latest/rules/callback-return
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 *  ```
 */
namespace CallbackReturn {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "array",
   *     "items": {
   *       "type": "string"
   *     }
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce camelcase naming convention
 *
 * @link https://eslint.org/docs/latest/rules/camelcase
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace Camelcase {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreDestructuring": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "ignoreImports": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "ignoreGlobals": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "properties": {
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       },
   *       "allow": {
   *         "type": "array",
   *         "items": [
   *           {
   *             "type": "string"
   *           }
   *         ],
   *         "minItems": 0,
   *         "uniqueItems": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly ignoreDestructuring?: boolean;
    readonly ignoreImports?: boolean;
    readonly ignoreGlobals?: boolean;
    readonly properties?: 'always' | 'never';
    /** @minItems 0 */
    readonly allow?: readonly [] | readonly [string];
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce or disallow capitalization of the first letter of a comment
 *
 * @link https://eslint.org/docs/latest/rules/capitalized-comments
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace CapitalizedComments {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   },
   *   {
   *     "oneOf": [
   *       {
   *         "type": "object",
   *         "properties": {
   *           "ignorePattern": {
   *             "type": "string"
   *           },
   *           "ignoreInlineComments": {
   *             "type": "boolean"
   *           },
   *           "ignoreConsecutiveComments": {
   *             "type": "boolean"
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "line": {
   *             "type": "object",
   *             "properties": {
   *               "ignorePattern": {
   *                 "type": "string"
   *               },
   *               "ignoreInlineComments": {
   *                 "type": "boolean"
   *               },
   *               "ignoreConsecutiveComments": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "block": {
   *             "type": "object",
   *             "properties": {
   *               "ignorePattern": {
   *                 "type": "string"
   *               },
   *               "ignoreInlineComments": {
   *                 "type": "boolean"
   *               },
   *               "ignoreConsecutiveComments": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options0 = 'always' | 'never';

  export type Options1 =
    | {
        readonly ignorePattern?: string;
        readonly ignoreInlineComments?: boolean;
        readonly ignoreConsecutiveComments?: boolean;
      }
    | {
        readonly line?: {
          readonly ignorePattern?: string;
          readonly ignoreInlineComments?: boolean;
          readonly ignoreConsecutiveComments?: boolean;
        };
        readonly block?: {
          readonly ignorePattern?: string;
          readonly ignoreInlineComments?: boolean;
          readonly ignoreConsecutiveComments?: boolean;
        };
      };

  export type RuleEntry =
    | Linter.RuleSeverity
    | readonly [Linter.RuleSeverity, Options0, Options1]
    | readonly [Linter.RuleSeverity, Options0];
}

/**
 * Enforce that class methods utilize `this`
 *
 * @link https://eslint.org/docs/latest/rules/class-methods-use-this
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace ClassMethodsUseThis {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "exceptMethods": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "enforceForClassFields": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly exceptMethods?: readonly string[];
    readonly enforceForClassFields?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require or disallow trailing commas
 *
 * @link https://eslint.org/docs/latest/rules/comma-dangle
 *
 *  ```md
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | deprecated  | true   |
 *  | fixable     | code   |
 *  | recommended | false  |
 *  ```
 */
namespace CommaDangle {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "definitions": {
   *     "value": {
   *       "enum": ["always-multiline", "always", "never", "only-multiline"]
   *     },
   *     "valueWithIgnore": {
   *       "enum": [
   *         "always-multiline",
   *         "always",
   *         "ignore",
   *         "never",
   *         "only-multiline"
   *       ]
   *     }
   *   },
   *   "type": "array",
   *   "items": [
   *     {
   *       "oneOf": [
   *         {
   *           "$ref": "#/definitions/value"
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "arrays": {
   *               "$ref": "#/definitions/valueWithIgnore"
   *             },
   *             "objects": {
   *               "$ref": "#/definitions/valueWithIgnore"
   *             },
   *             "imports": {
   *               "$ref": "#/definitions/valueWithIgnore"
   *             },
   *             "exports": {
   *               "$ref": "#/definitions/valueWithIgnore"
   *             },
   *             "functions": {
   *               "$ref": "#/definitions/valueWithIgnore"
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       ]
   *     }
   *   ],
   *   "additionalItems": false
   * }
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce consistent spacing before and after commas
 *
 * @link https://eslint.org/docs/latest/rules/comma-spacing
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace CommaSpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "before": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "after": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce consistent comma style
 *
 * @link https://eslint.org/docs/latest/rules/comma-style
 *
 *  ```md
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | deprecated  | true   |
 *  | fixable     | code   |
 *  | recommended | false  |
 *  ```
 */
namespace CommaStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "first",
   *       "last"
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "exceptions": {
   *         "type": "object",
   *         "additionalProperties": {
   *           "type": "boolean"
   *         }
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce a maximum cyclomatic complexity allowed in a program
 *
 * @link https://eslint.org/docs/latest/rules/complexity
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace Complexity {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "type": "integer",
   *         "minimum": 0
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "maximum": {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           "max": {
   *             "type": "integer",
   *             "minimum": 0
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
    | number
    | {
        readonly maximum?: number;
        readonly max?: number;
      };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce consistent spacing inside computed property brackets
 *
 * @link https://eslint.org/docs/latest/rules/computed-property-spacing
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace ComputedPropertySpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "enforceForClassMembers": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require `return` statements to either always or never specify values
 *
 * @link https://eslint.org/docs/latest/rules/consistent-return
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace ConsistentReturn {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "treatUndefinedAsUnspecified": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly treatUndefinedAsUnspecified?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce consistent naming when capturing the current execution context
 *
 * @link https://eslint.org/docs/latest/rules/consistent-this
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace ConsistentThis {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "type": "array",
   *   "items": {
   *     "type": "string",
   *     "minLength": 1
   *   },
   *   "uniqueItems": true
   * }
   * ```
   */
  export type Options = readonly string[];

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require `super()` calls in constructors
 *
 * @link https://eslint.org/docs/latest/rules/constructor-super
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace ConstructorSuper {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce consistent brace style for all control statements
 *
 * @link https://eslint.org/docs/latest/rules/curly
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace Curly {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "anyOf": [
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["all"]
   *         }
   *       ],
   *       "minItems": 0,
   *       "maxItems": 1
   *     },
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["multi", "multi-line", "multi-or-nest"]
   *         },
   *         {
   *           "enum": ["consistent"]
   *         }
   *       ],
   *       "minItems": 0,
   *       "maxItems": 2
   *     }
   *   ]
   * }
   * ```
   */
  export type Options =
    | readonly ['all']
    | readonly ['multi-line' | 'multi-or-nest' | 'multi', 'consistent']
    | readonly ['multi-line' | 'multi-or-nest' | 'multi']
    | readonly [];

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require `default` cases in `switch` statements
 *
 * @link https://eslint.org/docs/latest/rules/default-case
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace DefaultCase {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "commentPattern": {
   *         "type": "string"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly commentPattern?: string;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce default clauses in switch statements to be last
 *
 * @link https://eslint.org/docs/latest/rules/default-case-last
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace DefaultCaseLast {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce default parameters to be last
 *
 * @link https://eslint.org/docs/latest/rules/default-param-last
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace DefaultParamLast {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce consistent newlines before and after dots
 *
 * @link https://eslint.org/docs/latest/rules/dot-location
 *
 *  ```md
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | deprecated  | true   |
 *  | fixable     | code   |
 *  | recommended | false  |
 *  ```
 */
namespace DotLocation {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "object",
   *       "property"
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce dot notation whenever possible
 *
 * @link https://eslint.org/docs/latest/rules/dot-notation
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace DotNotation {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowKeywords": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "allowPattern": {
   *         "type": "string",
   *         "default": ""
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowKeywords?: boolean;
    readonly allowPattern?: string;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require or disallow newline at the end of files
 *
 * @link https://eslint.org/docs/latest/rules/eol-last
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace EolLast {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never",
   *       "unix",
   *       "windows"
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require the use of `===` and `!==`
 *
 * @link https://eslint.org/docs/latest/rules/eqeqeq
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace Eqeqeq {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "anyOf": [
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["always"]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "null": {
   *               "enum": ["always", "never", "ignore"]
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       ],
   *       "additionalItems": false
   *     },
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["smart", "allow-null"]
   *         }
   *       ],
   *       "additionalItems": false
   *     }
   *   ]
   * }
   * ```
   */
  export type Options =
    | readonly [
        'always',
        {
          readonly null?: 'always' | 'ignore' | 'never';
        },
      ]
    | readonly ['allow-null' | 'smart']
    | readonly ['always']
    | readonly [];

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce "for" loop update clause moving the counter in the right direction
 *
 * @link https://eslint.org/docs/latest/rules/for-direction
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace ForDirection {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require or disallow spacing between function identifiers and their
 * invocations
 *
 * @link https://eslint.org/docs/latest/rules/func-call-spacing
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace FuncCallSpacing {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "anyOf": [
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["never"]
   *         }
   *       ],
   *       "minItems": 0,
   *       "maxItems": 1
   *     },
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["always"]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "allowNewlines": {
   *               "type": "boolean"
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       ],
   *       "minItems": 0,
   *       "maxItems": 2
   *     }
   *   ]
   * }
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require function names to match the name of the variable or property to which
 * they are assigned
 *
 * @link https://eslint.org/docs/latest/rules/func-name-matching
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace FuncNameMatching {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "anyOf": [
   *     {
   *       "type": "array",
   *       "additionalItems": false,
   *       "items": [
   *         {
   *           "enum": ["always", "never"]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "considerPropertyDescriptor": {
   *               "type": "boolean"
   *             },
   *             "includeCommonJSModuleExports": {
   *               "type": "boolean"
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       ]
   *     },
   *     {
   *       "type": "array",
   *       "additionalItems": false,
   *       "items": [
   *         {
   *           "type": "object",
   *           "properties": {
   *             "considerPropertyDescriptor": {
   *               "type": "boolean"
   *             },
   *             "includeCommonJSModuleExports": {
   *               "type": "boolean"
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       ]
   *     }
   *   ]
   * }
   * ```
   */
  export type Options =
    | readonly [
        'always' | 'never',
        {
          readonly considerPropertyDescriptor?: boolean;
          readonly includeCommonJSModuleExports?: boolean;
        },
      ]
    | readonly [
        {
          readonly considerPropertyDescriptor?: boolean;
          readonly includeCommonJSModuleExports?: boolean;
        },
      ]
    | readonly ['always' | 'never']
    | readonly [];

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require or disallow named `function` expressions
 *
 * @link https://eslint.org/docs/latest/rules/func-names
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace FuncNames {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "definitions": {
   *     "value": {
   *       "enum": ["always", "as-needed", "never"]
   *     }
   *   },
   *   "items": [
   *     {
   *       "$ref": "#/definitions/value"
   *     },
   *     {
   *       "type": "object",
   *       "properties": {
   *         "generators": {
   *           "$ref": "#/definitions/value"
   *         }
   *       },
   *       "additionalProperties": false
   *     }
   *   ]
   * }
   * ```
   */
  export type Options =
    | readonly [
        Value,
        {
          readonly generators?: Value;
        },
      ]
    | readonly []
    | readonly [Value];
  export type Value = 'always' | 'as-needed' | 'never';

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce the consistent use of either `function` declarations or expressions
 *
 * @link https://eslint.org/docs/latest/rules/func-style
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace FuncStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "declaration",
   *       "expression"
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowArrowFunctions": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options0 = 'declaration' | 'expression';

  export type Options1 = {
    readonly allowArrowFunctions?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | readonly [Linter.RuleSeverity, Options0, Options1]
    | readonly [Linter.RuleSeverity, Options0];
}

/**
 * Enforce line breaks between arguments of a function call
 *
 * @link https://eslint.org/docs/latest/rules/function-call-argument-newline
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace FunctionCallArgumentNewline {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never",
   *       "consistent"
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce consistent line breaks inside function parentheses
 *
 * @link https://eslint.org/docs/latest/rules/function-paren-newline
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace FunctionParenNewline {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "enum": [
   *           "always",
   *           "never",
   *           "consistent",
   *           "multiline",
   *           "multiline-arguments"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "minItems": {
   *             "type": "integer",
   *             "minimum": 0
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce consistent spacing around `*` operators in generator functions
 *
 * @link https://eslint.org/docs/latest/rules/generator-star-spacing
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace GeneratorStarSpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "enum": [
   *           "before",
   *           "after",
   *           "both",
   *           "neither"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "before": {
   *             "type": "boolean"
   *           },
   *           "after": {
   *             "type": "boolean"
   *           },
   *           "named": {
   *             "oneOf": [
   *               {
   *                 "enum": [
   *                   "before",
   *                   "after",
   *                   "both",
   *                   "neither"
   *                 ]
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "before": {
   *                     "type": "boolean"
   *                   },
   *                   "after": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "anonymous": {
   *             "oneOf": [
   *               {
   *                 "enum": [
   *                   "before",
   *                   "after",
   *                   "both",
   *                   "neither"
   *                 ]
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "before": {
   *                     "type": "boolean"
   *                   },
   *                   "after": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "method": {
   *             "oneOf": [
   *               {
   *                 "enum": [
   *                   "before",
   *                   "after",
   *                   "both",
   *                   "neither"
   *                 ]
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "before": {
   *                     "type": "boolean"
   *                   },
   *                   "after": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce `return` statements in getters
 *
 * @link https://eslint.org/docs/latest/rules/getter-return
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace GetterReturn {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowImplicit": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowImplicit?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require `require()` calls to be placed at top-level module scope
 *
 * @link https://eslint.org/docs/latest/rules/global-require
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 *  ```
 */
namespace GlobalRequire {
  export type RuleEntry = 0;
}

/**
 * Require grouped accessor pairs in object literals and classes
 *
 * @link https://eslint.org/docs/latest/rules/grouped-accessor-pairs
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace GroupedAccessorPairs {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "anyOrder",
   *       "getBeforeSet",
   *       "setBeforeGet"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'anyOrder' | 'getBeforeSet' | 'setBeforeGet';

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require `for-in` loops to include an `if` statement
 *
 * @link https://eslint.org/docs/latest/rules/guard-for-in
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace GuardForIn {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require error handling in callbacks
 *
 * @link https://eslint.org/docs/latest/rules/handle-callback-err
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 *  ```
 */
namespace HandleCallbackErr {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string"
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Disallow specified identifiers
 *
 * @link https://eslint.org/docs/latest/rules/id-blacklist
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 *  ```
 */
namespace IdBlacklist {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "type": "array",
   *   "items": {
   *     "type": "string"
   *   },
   *   "uniqueItems": true
   * }
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Disallow specified identifiers
 *
 * @link https://eslint.org/docs/latest/rules/id-denylist
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace IdDenylist {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "type": "array",
   *   "items": {
   *     "type": "string"
   *   },
   *   "uniqueItems": true
   * }
   * ```
   */
  export type Options = readonly string[];

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce minimum and maximum identifier lengths
 *
 * @link https://eslint.org/docs/latest/rules/id-length
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace IdLength {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "min": {
   *         "type": "integer",
   *         "default": 2
   *       },
   *       "max": {
   *         "type": "integer"
   *       },
   *       "exceptions": {
   *         "type": "array",
   *         "uniqueItems": true,
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "exceptionPatterns": {
   *         "type": "array",
   *         "uniqueItems": true,
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "properties": {
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly min?: number;
    readonly max?: number;
    readonly exceptions?: readonly string[];
    readonly exceptionPatterns?: readonly string[];
    readonly properties?: 'always' | 'never';
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require identifiers to match a specified regular expression
 *
 * @link https://eslint.org/docs/latest/rules/id-match
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
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
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "classFields": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "onlyDeclarations": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "ignoreDestructuring": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options0 = string;

  export type Options1 = {
    readonly properties?: boolean;
    readonly classFields?: boolean;
    readonly onlyDeclarations?: boolean;
    readonly ignoreDestructuring?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | readonly [Linter.RuleSeverity, Options0, Options1]
    | readonly [Linter.RuleSeverity, Options0];
}

/**
 * Enforce the location of arrow function bodies
 *
 * @link https://eslint.org/docs/latest/rules/implicit-arrow-linebreak
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace ImplicitArrowLinebreak {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "beside",
   *       "below"
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce consistent indentation
 *
 * @link https://eslint.org/docs/latest/rules/indent
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace Indent {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "enum": [
   *           "tab"
   *         ]
   *       },
   *       {
   *         "type": "integer",
   *         "minimum": 0
   *       }
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "SwitchCase": {
   *         "type": "integer",
   *         "minimum": 0,
   *         "default": 0
   *       },
   *       "VariableDeclarator": {
   *         "oneOf": [
   *           {
   *             "oneOf": [
   *               {
   *                 "type": "integer",
   *                 "minimum": 0
   *               },
   *               {
   *                 "enum": [
   *                   "first",
   *                   "off"
   *                 ]
   *               }
   *             ]
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "var": {
   *                 "oneOf": [
   *                   {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   {
   *                     "enum": [
   *                       "first",
   *                       "off"
   *                     ]
   *                   }
   *                 ]
   *               },
   *               "let": {
   *                 "oneOf": [
   *                   {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   {
   *                     "enum": [
   *                       "first",
   *                       "off"
   *                     ]
   *                   }
   *                 ]
   *               },
   *               "const": {
   *                 "oneOf": [
   *                   {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   {
   *                     "enum": [
   *                       "first",
   *                       "off"
   *                     ]
   *                   }
   *                 ]
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         ]
   *       },
   *       "outerIIFEBody": {
   *         "oneOf": [
   *           {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           {
   *             "enum": [
   *               "off"
   *             ]
   *           }
   *         ]
   *       },
   *       "MemberExpression": {
   *         "oneOf": [
   *           {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           {
   *             "enum": [
   *               "off"
   *             ]
   *           }
   *         ]
   *       },
   *       "FunctionDeclaration": {
   *         "type": "object",
   *         "properties": {
   *           "parameters": {
   *             "oneOf": [
   *               {
   *                 "type": "integer",
   *                 "minimum": 0
   *               },
   *               {
   *                 "enum": [
   *                   "first",
   *                   "off"
   *                 ]
   *               }
   *             ]
   *           },
   *           "body": {
   *             "type": "integer",
   *             "minimum": 0
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       "FunctionExpression": {
   *         "type": "object",
   *         "properties": {
   *           "parameters": {
   *             "oneOf": [
   *               {
   *                 "type": "integer",
   *                 "minimum": 0
   *               },
   *               {
   *                 "enum": [
   *                   "first",
   *                   "off"
   *                 ]
   *               }
   *             ]
   *           },
   *           "body": {
   *             "type": "integer",
   *             "minimum": 0
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       "StaticBlock": {
   *         "type": "object",
   *         "properties": {
   *           "body": {
   *             "type": "integer",
   *             "minimum": 0
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       "CallExpression": {
   *         "type": "object",
   *         "properties": {
   *           "arguments": {
   *             "oneOf": [
   *               {
   *                 "type": "integer",
   *                 "minimum": 0
   *               },
   *               {
   *                 "enum": [
   *                   "first",
   *                   "off"
   *                 ]
   *               }
   *             ]
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       "ArrayExpression": {
   *         "oneOf": [
   *           {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           {
   *             "enum": [
   *               "first",
   *               "off"
   *             ]
   *           }
   *         ]
   *       },
   *       "ObjectExpression": {
   *         "oneOf": [
   *           {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           {
   *             "enum": [
   *               "first",
   *               "off"
   *             ]
   *           }
   *         ]
   *       },
   *       "ImportDeclaration": {
   *         "oneOf": [
   *           {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           {
   *             "enum": [
   *               "first",
   *               "off"
   *             ]
   *           }
   *         ]
   *       },
   *       "flatTernaryExpressions": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "offsetTernaryExpressions": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "ignoredNodes": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "not": {
   *             "pattern": ":exit$"
   *           }
   *         }
   *       },
   *       "ignoreComments": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce consistent indentation
 *
 * @link https://eslint.org/docs/latest/rules/indent-legacy
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace IndentLegacy {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "enum": [
   *           "tab"
   *         ]
   *       },
   *       {
   *         "type": "integer",
   *         "minimum": 0
   *       }
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "SwitchCase": {
   *         "type": "integer",
   *         "minimum": 0
   *       },
   *       "VariableDeclarator": {
   *         "oneOf": [
   *           {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "var": {
   *                 "type": "integer",
   *                 "minimum": 0
   *               },
   *               "let": {
   *                 "type": "integer",
   *                 "minimum": 0
   *               },
   *               "const": {
   *                 "type": "integer",
   *                 "minimum": 0
   *               }
   *             }
   *           }
   *         ]
   *       },
   *       "outerIIFEBody": {
   *         "type": "integer",
   *         "minimum": 0
   *       },
   *       "MemberExpression": {
   *         "type": "integer",
   *         "minimum": 0
   *       },
   *       "FunctionDeclaration": {
   *         "type": "object",
   *         "properties": {
   *           "parameters": {
   *             "oneOf": [
   *               {
   *                 "type": "integer",
   *                 "minimum": 0
   *               },
   *               {
   *                 "enum": [
   *                   "first"
   *                 ]
   *               }
   *             ]
   *           },
   *           "body": {
   *             "type": "integer",
   *             "minimum": 0
   *           }
   *         }
   *       },
   *       "FunctionExpression": {
   *         "type": "object",
   *         "properties": {
   *           "parameters": {
   *             "oneOf": [
   *               {
   *                 "type": "integer",
   *                 "minimum": 0
   *               },
   *               {
   *                 "enum": [
   *                   "first"
   *                 ]
   *               }
   *             ]
   *           },
   *           "body": {
   *             "type": "integer",
   *             "minimum": 0
   *           }
   *         }
   *       },
   *       "CallExpression": {
   *         "type": "object",
   *         "properties": {
   *           "parameters": {
   *             "oneOf": [
   *               {
   *                 "type": "integer",
   *                 "minimum": 0
   *               },
   *               {
   *                 "enum": [
   *                   "first"
   *                 ]
   *               }
   *             ]
   *           }
   *         }
   *       },
   *       "ArrayExpression": {
   *         "oneOf": [
   *           {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           {
   *             "enum": [
   *               "first"
   *             ]
   *           }
   *         ]
   *       },
   *       "ObjectExpression": {
   *         "oneOf": [
   *           {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           {
   *             "enum": [
   *               "first"
   *             ]
   *           }
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require or disallow initialization in variable declarations
 *
 * @link https://eslint.org/docs/latest/rules/init-declarations
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace InitDeclarations {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "anyOf": [
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["always"]
   *         }
   *       ],
   *       "minItems": 0,
   *       "maxItems": 1
   *     },
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["never"]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "ignoreForLoopInit": {
   *               "type": "boolean"
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       ],
   *       "minItems": 0,
   *       "maxItems": 2
   *     }
   *   ]
   * }
   * ```
   */
  export type Options =
    | readonly [
        'never',
        {
          readonly ignoreForLoopInit?: boolean;
        },
      ]
    | readonly ['always']
    | readonly ['never']
    | readonly [];

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce the consistent use of either double or single quotes in JSX
 * attributes
 *
 * @link https://eslint.org/docs/latest/rules/jsx-quotes
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace JsxQuotes {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "prefer-single",
   *       "prefer-double"
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce consistent spacing between keys and values in object literal
 * properties
 *
 * @link https://eslint.org/docs/latest/rules/key-spacing
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace KeySpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "anyOf": [
   *       {
   *         "type": "object",
   *         "properties": {
   *           "align": {
   *             "anyOf": [
   *               {
   *                 "enum": [
   *                   "colon",
   *                   "value"
   *                 ]
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "mode": {
   *                     "enum": [
   *                       "strict",
   *                       "minimum"
   *                     ]
   *                   },
   *                   "on": {
   *                     "enum": [
   *                       "colon",
   *                       "value"
   *                     ]
   *                   },
   *                   "beforeColon": {
   *                     "type": "boolean"
   *                   },
   *                   "afterColon": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "mode": {
   *             "enum": [
   *               "strict",
   *               "minimum"
   *             ]
   *           },
   *           "beforeColon": {
   *             "type": "boolean"
   *           },
   *           "afterColon": {
   *             "type": "boolean"
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "singleLine": {
   *             "type": "object",
   *             "properties": {
   *               "mode": {
   *                 "enum": [
   *                   "strict",
   *                   "minimum"
   *                 ]
   *               },
   *               "beforeColon": {
   *                 "type": "boolean"
   *               },
   *               "afterColon": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "multiLine": {
   *             "type": "object",
   *             "properties": {
   *               "align": {
   *                 "anyOf": [
   *                   {
   *                     "enum": [
   *                       "colon",
   *                       "value"
   *                     ]
   *                   },
   *                   {
   *                     "type": "object",
   *                     "properties": {
   *                       "mode": {
   *                         "enum": [
   *                           "strict",
   *                           "minimum"
   *                         ]
   *                       },
   *                       "on": {
   *                         "enum": [
   *                           "colon",
   *                           "value"
   *                         ]
   *                       },
   *                       "beforeColon": {
   *                         "type": "boolean"
   *                       },
   *                       "afterColon": {
   *                         "type": "boolean"
   *                       }
   *                     },
   *                     "additionalProperties": false
   *                   }
   *                 ]
   *               },
   *               "mode": {
   *                 "enum": [
   *                   "strict",
   *                   "minimum"
   *                 ]
   *               },
   *               "beforeColon": {
   *                 "type": "boolean"
   *               },
   *               "afterColon": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "singleLine": {
   *             "type": "object",
   *             "properties": {
   *               "mode": {
   *                 "enum": [
   *                   "strict",
   *                   "minimum"
   *                 ]
   *               },
   *               "beforeColon": {
   *                 "type": "boolean"
   *               },
   *               "afterColon": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "multiLine": {
   *             "type": "object",
   *             "properties": {
   *               "mode": {
   *                 "enum": [
   *                   "strict",
   *                   "minimum"
   *                 ]
   *               },
   *               "beforeColon": {
   *                 "type": "boolean"
   *               },
   *               "afterColon": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "align": {
   *             "type": "object",
   *             "properties": {
   *               "mode": {
   *                 "enum": [
   *                   "strict",
   *                   "minimum"
   *                 ]
   *               },
   *               "on": {
   *                 "enum": [
   *                   "colon",
   *                   "value"
   *                 ]
   *               },
   *               "beforeColon": {
   *                 "type": "boolean"
   *               },
   *               "afterColon": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce consistent spacing before and after keywords
 *
 * @link https://eslint.org/docs/latest/rules/keyword-spacing
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace KeywordSpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "before": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "after": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "overrides": {
   *         "type": "object",
   *         "properties": {
   *           "abstract": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "as": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "async": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "await": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "boolean": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "break": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "byte": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "case": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "catch": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "char": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "class": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "const": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "continue": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "debugger": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "default": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "delete": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "do": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "double": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "else": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "enum": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "export": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "extends": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "false": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "final": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "finally": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "float": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "for": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "from": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "function": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "get": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "goto": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "if": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "implements": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "import": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "in": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "instanceof": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "int": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "interface": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "let": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "long": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "native": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "new": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "null": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "of": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "package": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "private": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "protected": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "public": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "return": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "set": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "short": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "static": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "super": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "switch": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "synchronized": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "this": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "throw": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "throws": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "transient": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "true": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "try": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "typeof": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "var": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "void": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "volatile": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "while": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "with": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "yield": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce position of line comments
 *
 * @link https://eslint.org/docs/latest/rules/line-comment-position
 *
 *  ```md
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | recommended | false  |
 *  ```
 */
namespace LineCommentPosition {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "enum": [
   *           "above",
   *           "beside"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "position": {
   *             "enum": [
   *               "above",
   *               "beside"
   *             ]
   *           },
   *           "ignorePattern": {
   *             "type": "string"
   *           },
   *           "applyDefaultPatterns": {
   *             "type": "boolean"
   *           },
   *           "applyDefaultIgnorePatterns": {
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
    | 'above'
    | 'beside'
    | {
        readonly position?: 'above' | 'beside';
        readonly ignorePattern?: string;
        readonly applyDefaultPatterns?: boolean;
        readonly applyDefaultIgnorePatterns?: boolean;
      };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce consistent linebreak style
 *
 * @link https://eslint.org/docs/latest/rules/linebreak-style
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace LinebreakStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "unix",
   *       "windows"
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require empty lines around comments
 *
 * @link https://eslint.org/docs/latest/rules/lines-around-comment
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace LinesAroundComment {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "beforeBlockComment": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "afterBlockComment": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "beforeLineComment": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "afterLineComment": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "allowBlockStart": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "allowBlockEnd": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "allowClassStart": {
   *         "type": "boolean"
   *       },
   *       "allowClassEnd": {
   *         "type": "boolean"
   *       },
   *       "allowObjectStart": {
   *         "type": "boolean"
   *       },
   *       "allowObjectEnd": {
   *         "type": "boolean"
   *       },
   *       "allowArrayStart": {
   *         "type": "boolean"
   *       },
   *       "allowArrayEnd": {
   *         "type": "boolean"
   *       },
   *       "ignorePattern": {
   *         "type": "string"
   *       },
   *       "applyDefaultIgnorePatterns": {
   *         "type": "boolean"
   *       },
   *       "afterHashbangComment": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require or disallow newlines around directives
 *
 * @link https://eslint.org/docs/latest/rules/lines-around-directive
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace LinesAroundDirective {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "before": {
   *             "enum": [
   *               "always",
   *               "never"
   *             ]
   *           },
   *           "after": {
   *             "enum": [
   *               "always",
   *               "never"
   *             ]
   *           }
   *         },
   *         "additionalProperties": false,
   *         "minProperties": 2
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require or disallow an empty line between class members
 *
 * @link https://eslint.org/docs/latest/rules/lines-between-class-members
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace LinesBetweenClassMembers {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "anyOf": [
   *       {
   *         "type": "object",
   *         "properties": {
   *           "enforce": {
   *             "type": "array",
   *             "items": {
   *               "type": "object",
   *               "properties": {
   *                 "blankLine": {
   *                   "enum": [
   *                     "always",
   *                     "never"
   *                   ]
   *                 },
   *                 "prev": {
   *                   "enum": [
   *                     "method",
   *                     "field",
   *                     "*"
   *                   ]
   *                 },
   *                 "next": {
   *                   "enum": [
   *                     "method",
   *                     "field",
   *                     "*"
   *                   ]
   *                 }
   *               },
   *               "additionalProperties": false,
   *               "required": [
   *                 "blankLine",
   *                 "prev",
   *                 "next"
   *               ]
   *             },
   *             "minItems": 1
   *           }
   *         },
   *         "additionalProperties": false,
   *         "required": [
   *           "enforce"
   *         ]
   *       },
   *       {
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       }
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "exceptAfterSingleLine": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require or disallow logical assignment operator shorthand
 *
 * @link https://eslint.org/docs/latest/rules/logical-assignment-operators
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
namespace LogicalAssignmentOperators {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "type": "array",
   *   "oneOf": [
   *     {
   *       "items": [
   *         {
   *           "const": "always"
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "enforceForIfStatements": {
   *               "type": "boolean"
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       ],
   *       "minItems": 0,
   *       "maxItems": 2
   *     },
   *     {
   *       "items": [
   *         {
   *           "const": "never"
   *         }
   *       ],
   *       "minItems": 1,
   *       "maxItems": 1
   *     }
   *   ]
   * }
   * ```
   */
  /* modified */
  export type Options =
    | readonly [
        'always',
        {
          readonly enforceForIfStatements?: boolean;
        },
      ]
    | readonly ['always']
    | readonly ['never']
    | readonly [];

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce a maximum number of classes per file
 *
 * @link https://eslint.org/docs/latest/rules/max-classes-per-file
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace MaxClassesPerFile {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "type": "integer",
   *         "minimum": 1
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "ignoreExpressions": {
   *             "type": "boolean"
   *           },
   *           "max": {
   *             "type": "integer",
   *             "minimum": 1
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
    | number
    | {
        readonly ignoreExpressions?: boolean;
        readonly max?: number;
      };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce a maximum depth that blocks can be nested
 *
 * @link https://eslint.org/docs/latest/rules/max-depth
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace MaxDepth {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "type": "integer",
   *         "minimum": 0
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "maximum": {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           "max": {
   *             "type": "integer",
   *             "minimum": 0
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
    | number
    | {
        readonly maximum?: number;
        readonly max?: number;
      };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce a maximum line length
 *
 * @link https://eslint.org/docs/latest/rules/max-len
 *
 *  ```md
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | deprecated  | true   |
 *  | recommended | false  |
 *  ```
 */
namespace MaxLen {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "anyOf": [
   *       {
   *         "type": "object",
   *         "properties": {
   *           "code": {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           "comments": {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           "tabWidth": {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           "ignorePattern": {
   *             "type": "string"
   *           },
   *           "ignoreComments": {
   *             "type": "boolean"
   *           },
   *           "ignoreStrings": {
   *             "type": "boolean"
   *           },
   *           "ignoreUrls": {
   *             "type": "boolean"
   *           },
   *           "ignoreTemplateLiterals": {
   *             "type": "boolean"
   *           },
   *           "ignoreRegExpLiterals": {
   *             "type": "boolean"
   *           },
   *           "ignoreTrailingComments": {
   *             "type": "boolean"
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "integer",
   *         "minimum": 0
   *       }
   *     ]
   *   },
   *   {
   *     "anyOf": [
   *       {
   *         "type": "object",
   *         "properties": {
   *           "code": {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           "comments": {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           "tabWidth": {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           "ignorePattern": {
   *             "type": "string"
   *           },
   *           "ignoreComments": {
   *             "type": "boolean"
   *           },
   *           "ignoreStrings": {
   *             "type": "boolean"
   *           },
   *           "ignoreUrls": {
   *             "type": "boolean"
   *           },
   *           "ignoreTemplateLiterals": {
   *             "type": "boolean"
   *           },
   *           "ignoreRegExpLiterals": {
   *             "type": "boolean"
   *           },
   *           "ignoreTrailingComments": {
   *             "type": "boolean"
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "integer",
   *         "minimum": 0
   *       }
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "code": {
   *         "type": "integer",
   *         "minimum": 0
   *       },
   *       "comments": {
   *         "type": "integer",
   *         "minimum": 0
   *       },
   *       "tabWidth": {
   *         "type": "integer",
   *         "minimum": 0
   *       },
   *       "ignorePattern": {
   *         "type": "string"
   *       },
   *       "ignoreComments": {
   *         "type": "boolean"
   *       },
   *       "ignoreStrings": {
   *         "type": "boolean"
   *       },
   *       "ignoreUrls": {
   *         "type": "boolean"
   *       },
   *       "ignoreTemplateLiterals": {
   *         "type": "boolean"
   *       },
   *       "ignoreRegExpLiterals": {
   *         "type": "boolean"
   *       },
   *       "ignoreTrailingComments": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce a maximum number of lines per file
 *
 * @link https://eslint.org/docs/latest/rules/max-lines
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace MaxLines {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "type": "integer",
   *         "minimum": 0
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "max": {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           "skipComments": {
   *             "type": "boolean"
   *           },
   *           "skipBlankLines": {
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
    | number
    | {
        readonly max?: number;
        readonly skipComments?: boolean;
        readonly skipBlankLines?: boolean;
      };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce a maximum number of lines of code in a function
 *
 * @link https://eslint.org/docs/latest/rules/max-lines-per-function
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace MaxLinesPerFunction {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "type": "object",
   *         "properties": {
   *           "max": {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           "skipComments": {
   *             "type": "boolean"
   *           },
   *           "skipBlankLines": {
   *             "type": "boolean"
   *           },
   *           "IIFEs": {
   *             "type": "boolean"
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "integer",
   *         "minimum": 1
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options =
    | number
    | {
        readonly max?: number;
        readonly skipComments?: boolean;
        readonly skipBlankLines?: boolean;
        readonly IIFEs?: boolean;
      };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce a maximum depth that callbacks can be nested
 *
 * @link https://eslint.org/docs/latest/rules/max-nested-callbacks
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace MaxNestedCallbacks {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "type": "integer",
   *         "minimum": 0
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "maximum": {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           "max": {
   *             "type": "integer",
   *             "minimum": 0
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
    | number
    | {
        readonly maximum?: number;
        readonly max?: number;
      };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce a maximum number of parameters in function definitions
 *
 * @link https://eslint.org/docs/latest/rules/max-params
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace MaxParams {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "type": "integer",
   *         "minimum": 0
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "maximum": {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           "max": {
   *             "type": "integer",
   *             "minimum": 0
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
    | number
    | {
        readonly maximum?: number;
        readonly max?: number;
      };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce a maximum number of statements allowed in function blocks
 *
 * @link https://eslint.org/docs/latest/rules/max-statements
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace MaxStatements {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "type": "integer",
   *         "minimum": 0
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "maximum": {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           "max": {
   *             "type": "integer",
   *             "minimum": 0
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreTopLevelFunctions": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options0 =
    | number
    | {
        readonly maximum?: number;
        readonly max?: number;
      };

  export type Options1 = {
    readonly ignoreTopLevelFunctions?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | readonly [Linter.RuleSeverity, Options0, Options1]
    | readonly [Linter.RuleSeverity, Options0];
}

/**
 * Enforce a maximum number of statements allowed per line
 *
 * @link https://eslint.org/docs/latest/rules/max-statements-per-line
 *
 *  ```md
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | deprecated  | true   |
 *  | recommended | false  |
 *  ```
 */
namespace MaxStatementsPerLine {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "max": {
   *         "type": "integer",
   *         "minimum": 1,
   *         "default": 1
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce a particular style for multiline comments
 *
 * @link https://eslint.org/docs/latest/rules/multiline-comment-style
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace MultilineCommentStyle {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "anyOf": [
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["starred-block", "bare-block"]
   *         }
   *       ],
   *       "additionalItems": false
   *     },
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["separate-lines"]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "checkJSDoc": {
   *               "type": "boolean"
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       ],
   *       "additionalItems": false
   *     }
   *   ]
   * }
   * ```
   */
  export type Options =
    | readonly [
        'separate-lines',
        {
          readonly checkJSDoc?: boolean;
        },
      ]
    | readonly ['bare-block' | 'starred-block']
    | readonly ['separate-lines']
    | readonly [];

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce newlines between operands of ternary expressions
 *
 * @link https://eslint.org/docs/latest/rules/multiline-ternary
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace MultilineTernary {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "always-multiline",
   *       "never"
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require constructor names to begin with a capital letter
 *
 * @link https://eslint.org/docs/latest/rules/new-cap
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NewCap {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "newIsCap": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "capIsNew": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "newIsCapExceptions": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "newIsCapExceptionPattern": {
   *         "type": "string"
   *       },
   *       "capIsNewExceptions": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "capIsNewExceptionPattern": {
   *         "type": "string"
   *       },
   *       "properties": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly newIsCap?: boolean;
    readonly capIsNew?: boolean;
    readonly newIsCapExceptions?: readonly string[];
    readonly newIsCapExceptionPattern?: string;
    readonly capIsNewExceptions?: readonly string[];
    readonly capIsNewExceptionPattern?: string;
    readonly properties?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce or disallow parentheses when invoking a constructor with no arguments
 *
 * @link https://eslint.org/docs/latest/rules/new-parens
 *
 *  ```md
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | deprecated  | true   |
 *  | fixable     | code   |
 *  | recommended | false  |
 *  ```
 */
namespace NewParens {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require or disallow an empty line after variable declarations
 *
 * @link https://eslint.org/docs/latest/rules/newline-after-var
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace NewlineAfterVar {
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
  export type RuleEntry = 0;
}

/**
 * Require an empty line before `return` statements
 *
 * @link https://eslint.org/docs/latest/rules/newline-before-return
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace NewlineBeforeReturn {
  export type RuleEntry = 0;
}

/**
 * Require a newline after each call in a method chain
 *
 * @link https://eslint.org/docs/latest/rules/newline-per-chained-call
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace NewlinePerChainedCall {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreChainWithDepth": {
   *         "type": "integer",
   *         "minimum": 1,
   *         "maximum": 10,
   *         "default": 2
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Disallow the use of `alert`, `confirm`, and `prompt`
 *
 * @link https://eslint.org/docs/latest/rules/no-alert
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoAlert {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow `Array` constructors
 *
 * @link https://eslint.org/docs/latest/rules/no-array-constructor
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 *  ```
 */
namespace NoArrayConstructor {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow using an async function as a Promise executor
 *
 * @link https://eslint.org/docs/latest/rules/no-async-promise-executor
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoAsyncPromiseExecutor {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow `await` inside of loops
 *
 * @link https://eslint.org/docs/latest/rules/no-await-in-loop
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoAwaitInLoop {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow bitwise operators
 *
 * @link https://eslint.org/docs/latest/rules/no-bitwise
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoBitwise {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allow": {
   *         "type": "array",
   *         "items": {
   *           "enum": [
   *             "^",
   *             "|",
   *             "&",
   *             "<<",
   *             ">>",
   *             ">>>",
   *             "^=",
   *             "|=",
   *             "&=",
   *             "<<=",
   *             ">>=",
   *             ">>>=",
   *             "~"
   *           ]
   *         },
   *         "uniqueItems": true
   *       },
   *       "int32Hint": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allow?: readonly (
      | '&'
      | '&='
      | '^'
      | '^='
      | '<<'
      | '<<='
      | '>>'
      | '>>='
      | '>>>'
      | '>>>='
      | '|'
      | '|='
      | '~'
    )[];
    readonly int32Hint?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow use of the `Buffer()` constructor
 *
 * @link https://eslint.org/docs/latest/rules/no-buffer-constructor
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | true    |
 *  | recommended | false   |
 *  ```
 */
namespace NoBufferConstructor {
  export type RuleEntry = 0;
}

/**
 * Disallow the use of `arguments.caller` or `arguments.callee`
 *
 * @link https://eslint.org/docs/latest/rules/no-caller
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoCaller {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow lexical declarations in case clauses
 *
 * @link https://eslint.org/docs/latest/rules/no-case-declarations
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace NoCaseDeclarations {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow `catch` clause parameters from shadowing variables in the outer
 * scope
 *
 * @link https://eslint.org/docs/latest/rules/no-catch-shadow
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 *  ```
 */
namespace NoCatchShadow {
  export type RuleEntry = 0;
}

/**
 * Disallow reassigning class members
 *
 * @link https://eslint.org/docs/latest/rules/no-class-assign
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoClassAssign {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow comparing against -0
 *
 * @link https://eslint.org/docs/latest/rules/no-compare-neg-zero
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoCompareNegZero {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow assignment operators in conditional expressions
 *
 * @link https://eslint.org/docs/latest/rules/no-cond-assign
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoCondAssign {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "except-parens",
   *       "always"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'always' | 'except-parens';

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow arrow functions where they could be confused with comparisons
 *
 * @link https://eslint.org/docs/latest/rules/no-confusing-arrow
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoConfusingArrow {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowParens": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "onlyOneSimpleParam": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Disallow the use of `console`
 *
 * @link https://eslint.org/docs/latest/rules/no-console
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 *  ```
 */
namespace NoConsole {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allow": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "minItems": 1,
   *         "uniqueItems": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    /** @minItems 1 */
    readonly allow?: readonly [string, ...(readonly string[])];
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow reassigning `const` variables
 *
 * @link https://eslint.org/docs/latest/rules/no-const-assign
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoConstAssign {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow expressions where the operation doesn't affect the value
 *
 * @link https://eslint.org/docs/latest/rules/no-constant-binary-expression
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoConstantBinaryExpression {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow constant expressions in conditions
 *
 * @link https://eslint.org/docs/latest/rules/no-constant-condition
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoConstantCondition {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "checkLoops": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly checkLoops?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow returning value from constructor
 *
 * @link https://eslint.org/docs/latest/rules/no-constructor-return
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoConstructorReturn {
  /**
   * ### schema
   *
   * ```json
   * {}
   * ```
   */
  export type Options = Readonly<Record<string, unknown>>;

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow `continue` statements
 *
 * @link https://eslint.org/docs/latest/rules/no-continue
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoContinue {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow control characters in regular expressions
 *
 * @link https://eslint.org/docs/latest/rules/no-control-regex
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoControlRegex {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow the use of `debugger`
 *
 * @link https://eslint.org/docs/latest/rules/no-debugger
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoDebugger {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow deleting variables
 *
 * @link https://eslint.org/docs/latest/rules/no-delete-var
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace NoDeleteVar {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow equal signs explicitly at the beginning of regular expressions
 *
 * @link https://eslint.org/docs/latest/rules/no-div-regex
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoDivRegex {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow duplicate arguments in `function` definitions
 *
 * @link https://eslint.org/docs/latest/rules/no-dupe-args
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoDupeArgs {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow duplicate class members
 *
 * @link https://eslint.org/docs/latest/rules/no-dupe-class-members
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoDupeClassMembers {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow duplicate conditions in if-else-if chains
 *
 * @link https://eslint.org/docs/latest/rules/no-dupe-else-if
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoDupeElseIf {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow duplicate keys in object literals
 *
 * @link https://eslint.org/docs/latest/rules/no-dupe-keys
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoDupeKeys {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow duplicate case labels
 *
 * @link https://eslint.org/docs/latest/rules/no-duplicate-case
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoDuplicateCase {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow duplicate module imports
 *
 * @link https://eslint.org/docs/latest/rules/no-duplicate-imports
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoDuplicateImports {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "includeExports": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly includeExports?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow `else` blocks after `return` statements in `if` statements
 *
 * @link https://eslint.org/docs/latest/rules/no-else-return
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoElseReturn {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowElseIf": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowElseIf?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow empty block statements
 *
 * @link https://eslint.org/docs/latest/rules/no-empty
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoEmpty {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowEmptyCatch": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowEmptyCatch?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow empty character classes in regular expressions
 *
 * @link https://eslint.org/docs/latest/rules/no-empty-character-class
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoEmptyCharacterClass {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow empty functions
 *
 * @link https://eslint.org/docs/latest/rules/no-empty-function
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoEmptyFunction {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allow": {
   *         "type": "array",
   *         "items": {
   *           "enum": [
   *             "functions",
   *             "arrowFunctions",
   *             "generatorFunctions",
   *             "methods",
   *             "generatorMethods",
   *             "getters",
   *             "setters",
   *             "constructors",
   *             "asyncFunctions",
   *             "asyncMethods"
   *           ]
   *         },
   *         "uniqueItems": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allow?: readonly (
      | 'arrowFunctions'
      | 'asyncFunctions'
      | 'asyncMethods'
      | 'constructors'
      | 'functions'
      | 'generatorFunctions'
      | 'generatorMethods'
      | 'getters'
      | 'methods'
      | 'setters'
    )[];
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow empty destructuring patterns
 *
 * @link https://eslint.org/docs/latest/rules/no-empty-pattern
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoEmptyPattern {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowObjectPatternsAsParameters": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowObjectPatternsAsParameters?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow empty static blocks
 *
 * @link https://eslint.org/docs/latest/rules/no-empty-static-block
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoEmptyStaticBlock {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow `null` comparisons without type-checking operators
 *
 * @link https://eslint.org/docs/latest/rules/no-eq-null
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoEqNull {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow the use of `eval()`
 *
 * @link https://eslint.org/docs/latest/rules/no-eval
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoEval {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowIndirect": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowIndirect?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow reassigning exceptions in `catch` clauses
 *
 * @link https://eslint.org/docs/latest/rules/no-ex-assign
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoExAssign {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow extending native types
 *
 * @link https://eslint.org/docs/latest/rules/no-extend-native
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoExtendNative {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "exceptions": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly exceptions?: readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow unnecessary calls to `.bind()`
 *
 * @link https://eslint.org/docs/latest/rules/no-extra-bind
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoExtraBind {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow unnecessary boolean casts
 *
 * @link https://eslint.org/docs/latest/rules/no-extra-boolean-cast
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoExtraBooleanCast {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "enforceForLogicalOperands": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly enforceForLogicalOperands?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow unnecessary labels
 *
 * @link https://eslint.org/docs/latest/rules/no-extra-label
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoExtraLabel {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow unnecessary parentheses
 *
 * @link https://eslint.org/docs/latest/rules/no-extra-parens
 *
 *  ```md
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | deprecated  | true   |
 *  | fixable     | code   |
 *  | recommended | false  |
 *  ```
 */
namespace NoExtraParens {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "anyOf": [
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["functions"]
   *         }
   *       ],
   *       "minItems": 0,
   *       "maxItems": 1
   *     },
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["all"]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "conditionalAssign": {
   *               "type": "boolean"
   *             },
   *             "ternaryOperandBinaryExpressions": {
   *               "type": "boolean"
   *             },
   *             "nestedBinaryExpressions": {
   *               "type": "boolean"
   *             },
   *             "returnAssign": {
   *               "type": "boolean"
   *             },
   *             "ignoreJSX": {
   *               "enum": ["none", "all", "single-line", "multi-line"]
   *             },
   *             "enforceForArrowConditionals": {
   *               "type": "boolean"
   *             },
   *             "enforceForSequenceExpressions": {
   *               "type": "boolean"
   *             },
   *             "enforceForNewInMemberExpressions": {
   *               "type": "boolean"
   *             },
   *             "enforceForFunctionPrototypeMethods": {
   *               "type": "boolean"
   *             },
   *             "allowParensAfterCommentPattern": {
   *               "type": "string"
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       ],
   *       "minItems": 0,
   *       "maxItems": 2
   *     }
   *   ]
   * }
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Disallow unnecessary semicolons
 *
 * @link https://eslint.org/docs/latest/rules/no-extra-semi
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoExtraSemi {
  export type RuleEntry = 0;
}

/**
 * Disallow fallthrough of `case` statements
 *
 * @link https://eslint.org/docs/latest/rules/no-fallthrough
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoFallthrough {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "commentPattern": {
   *         "type": "string",
   *         "default": ""
   *       },
   *       "allowEmptyCase": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly commentPattern?: string;
    readonly allowEmptyCase?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow leading or trailing decimal points in numeric literals
 *
 * @link https://eslint.org/docs/latest/rules/no-floating-decimal
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoFloatingDecimal {
  export type RuleEntry = 0;
}

/**
 * Disallow reassigning `function` declarations
 *
 * @link https://eslint.org/docs/latest/rules/no-func-assign
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoFuncAssign {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow assignments to native objects or read-only global variables
 *
 * @link https://eslint.org/docs/latest/rules/no-global-assign
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace NoGlobalAssign {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "exceptions": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly exceptions?: readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow shorthand type conversions
 *
 * @link https://eslint.org/docs/latest/rules/no-implicit-coercion
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoImplicitCoercion {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "boolean": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "number": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "string": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "disallowTemplateShorthand": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "allow": {
   *         "type": "array",
   *         "items": {
   *           "enum": [
   *             "~",
   *             "!!",
   *             "+",
   *             "*"
   *           ]
   *         },
   *         "uniqueItems": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly boolean?: boolean;
    readonly number?: boolean;
    readonly string?: boolean;
    readonly disallowTemplateShorthand?: boolean;
    readonly allow?: readonly ('!!' | '*' | '+' | '~')[];
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow declarations in the global scope
 *
 * @link https://eslint.org/docs/latest/rules/no-implicit-globals
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoImplicitGlobals {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "lexicalBindings": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly lexicalBindings?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow the use of `eval()`-like methods
 *
 * @link https://eslint.org/docs/latest/rules/no-implied-eval
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoImpliedEval {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow assigning to imported bindings
 *
 * @link https://eslint.org/docs/latest/rules/no-import-assign
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoImportAssign {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow inline comments after code
 *
 * @link https://eslint.org/docs/latest/rules/no-inline-comments
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoInlineComments {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignorePattern": {
   *         "type": "string"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly ignorePattern?: string;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow variable or `function` declarations in nested blocks
 *
 * @link https://eslint.org/docs/latest/rules/no-inner-declarations
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoInnerDeclarations {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "functions",
   *       "both"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'both' | 'functions';

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow invalid regular expression strings in `RegExp` constructors
 *
 * @link https://eslint.org/docs/latest/rules/no-invalid-regexp
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoInvalidRegexp {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowConstructorFlags": {
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
  export type Options = {
    readonly allowConstructorFlags?: readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow use of `this` in contexts where the value of `this` is `undefined`
 *
 * @link https://eslint.org/docs/latest/rules/no-invalid-this
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoInvalidThis {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "capIsConstructor": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly capIsConstructor?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow irregular whitespace
 *
 * @link https://eslint.org/docs/latest/rules/no-irregular-whitespace
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoIrregularWhitespace {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "skipComments": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "skipStrings": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "skipTemplates": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "skipRegExps": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "skipJSXText": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly skipComments?: boolean;
    readonly skipStrings?: boolean;
    readonly skipTemplates?: boolean;
    readonly skipRegExps?: boolean;
    readonly skipJSXText?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow the use of the `__iterator__` property
 *
 * @link https://eslint.org/docs/latest/rules/no-iterator
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoIterator {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow labels that share a name with a variable
 *
 * @link https://eslint.org/docs/latest/rules/no-label-var
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoLabelVar {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow labeled statements
 *
 * @link https://eslint.org/docs/latest/rules/no-labels
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoLabels {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowLoop": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "allowSwitch": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowLoop?: boolean;
    readonly allowSwitch?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow unnecessary nested blocks
 *
 * @link https://eslint.org/docs/latest/rules/no-lone-blocks
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoLoneBlocks {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow `if` statements as the only statement in `else` blocks
 *
 * @link https://eslint.org/docs/latest/rules/no-lonely-if
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoLonelyIf {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow function declarations that contain unsafe references inside loop
 * statements
 *
 * @link https://eslint.org/docs/latest/rules/no-loop-func
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoLoopFunc {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow literal numbers that lose precision
 *
 * @link https://eslint.org/docs/latest/rules/no-loss-of-precision
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoLossOfPrecision {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow magic numbers
 *
 * @link https://eslint.org/docs/latest/rules/no-magic-numbers
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoMagicNumbers {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "detectObjects": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "enforceConst": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "ignore": {
   *         "type": "array",
   *         "items": {
   *           "anyOf": [
   *             {
   *               "type": "number"
   *             },
   *             {
   *               "type": "string",
   *               "pattern": "^[+-]?(?:0|[1-9][0-9]*)n$"
   *             }
   *           ]
   *         },
   *         "uniqueItems": true
   *       },
   *       "ignoreArrayIndexes": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "ignoreDefaultValues": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "ignoreClassFieldInitialValues": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly detectObjects?: boolean;
    readonly enforceConst?: boolean;
    readonly ignore?: readonly (number | string)[];
    readonly ignoreArrayIndexes?: boolean;
    readonly ignoreDefaultValues?: boolean;
    readonly ignoreClassFieldInitialValues?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow characters which are made with multiple code points in character
 * class syntax
 *
 * @link https://eslint.org/docs/latest/rules/no-misleading-character-class
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace NoMisleadingCharacterClass {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow mixed binary operators
 *
 * @link https://eslint.org/docs/latest/rules/no-mixed-operators
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 *  ```
 */
namespace NoMixedOperators {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "groups": {
   *         "type": "array",
   *         "items": {
   *           "type": "array",
   *           "items": {
   *             "enum": [
   *               "+",
   *               "-",
   *               "*",
   *               "/",
   *               "%",
   *               "**",
   *               "&",
   *               "|",
   *               "^",
   *               "~",
   *               "<<",
   *               ">>",
   *               ">>>",
   *               "==",
   *               "!=",
   *               "===",
   *               "!==",
   *               ">",
   *               ">=",
   *               "<",
   *               "<=",
   *               "&&",
   *               "||",
   *               "in",
   *               "instanceof",
   *               "?:",
   *               "??"
   *             ]
   *           },
   *           "minItems": 2,
   *           "uniqueItems": true
   *         },
   *         "uniqueItems": true
   *       },
   *       "allowSamePrecedence": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Disallow `require` calls to be mixed with regular variable declarations
 *
 * @link https://eslint.org/docs/latest/rules/no-mixed-requires
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 *  ```
 */
namespace NoMixedRequires {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "type": "boolean"
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "grouping": {
   *             "type": "boolean"
   *           },
   *           "allowCall": {
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
  export type RuleEntry = 0;
}

/**
 * Disallow mixed spaces and tabs for indentation
 *
 * @link https://eslint.org/docs/latest/rules/no-mixed-spaces-and-tabs
 *
 *  ```md
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | deprecated  | true   |
 *  | recommended | true   |
 *  ```
 */
namespace NoMixedSpacesAndTabs {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "smart-tabs",
   *       true,
   *       false
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Disallow use of chained assignment expressions
 *
 * @link https://eslint.org/docs/latest/rules/no-multi-assign
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoMultiAssign {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreNonDeclaration": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly ignoreNonDeclaration?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow multiple spaces
 *
 * @link https://eslint.org/docs/latest/rules/no-multi-spaces
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace NoMultiSpaces {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "exceptions": {
   *         "type": "object",
   *         "patternProperties": {
   *           "^([A-Z][a-z]*)+$": {
   *             "type": "boolean"
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       "ignoreEOLComments": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Disallow multiline strings
 *
 * @link https://eslint.org/docs/latest/rules/no-multi-str
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoMultiStr {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow multiple empty lines
 *
 * @link https://eslint.org/docs/latest/rules/no-multiple-empty-lines
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace NoMultipleEmptyLines {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "max": {
   *         "type": "integer",
   *         "minimum": 0
   *       },
   *       "maxEOF": {
   *         "type": "integer",
   *         "minimum": 0
   *       },
   *       "maxBOF": {
   *         "type": "integer",
   *         "minimum": 0
   *       }
   *     },
   *     "required": [
   *       "max"
   *     ],
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Disallow assignments to native objects or read-only global variables
 *
 * @link https://eslint.org/docs/latest/rules/no-native-reassign
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 *  ```
 */
namespace NoNativeReassign {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "exceptions": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Disallow negated conditions
 *
 * @link https://eslint.org/docs/latest/rules/no-negated-condition
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoNegatedCondition {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow negating the left operand in `in` expressions
 *
 * @link https://eslint.org/docs/latest/rules/no-negated-in-lhs
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | true    |
 *  | recommended | false   |
 *  ```
 */
namespace NoNegatedInLhs {
  export type RuleEntry = 0;
}

/**
 * Disallow nested ternary expressions
 *
 * @link https://eslint.org/docs/latest/rules/no-nested-ternary
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoNestedTernary {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow `new` operators outside of assignments or comparisons
 *
 * @link https://eslint.org/docs/latest/rules/no-new
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoNew {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow `new` operators with the `Function` object
 *
 * @link https://eslint.org/docs/latest/rules/no-new-func
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoNewFunc {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow `new` operators with global non-constructor functions
 *
 * @link https://eslint.org/docs/latest/rules/no-new-native-nonconstructor
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoNewNativeNonconstructor {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow `Object` constructors
 *
 * @link https://eslint.org/docs/latest/rules/no-new-object
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 *  ```
 */
namespace NoNewObject {
  export type RuleEntry = 0;
}

/**
 * Disallow `new` operators with calls to `require`
 *
 * @link https://eslint.org/docs/latest/rules/no-new-require
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 *  ```
 */
namespace NoNewRequire {
  export type RuleEntry = 0;
}

/**
 * Disallow `new` operators with the `Symbol` object
 *
 * @link https://eslint.org/docs/latest/rules/no-new-symbol
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoNewSymbol {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow `new` operators with the `String`, `Number`, and `Boolean` objects
 *
 * @link https://eslint.org/docs/latest/rules/no-new-wrappers
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoNewWrappers {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow `\8` and `\9` escape sequences in string literals
 *
 * @link https://eslint.org/docs/latest/rules/no-nonoctal-decimal-escape
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoNonoctalDecimalEscape {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow calling global object properties as functions
 *
 * @link https://eslint.org/docs/latest/rules/no-obj-calls
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoObjCalls {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow calls to the `Object` constructor without an argument
 *
 * @link https://eslint.org/docs/latest/rules/no-object-constructor
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 *  ```
 */
namespace NoObjectConstructor {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow octal literals
 *
 * @link https://eslint.org/docs/latest/rules/no-octal
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace NoOctal {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow octal escape sequences in string literals
 *
 * @link https://eslint.org/docs/latest/rules/no-octal-escape
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoOctalEscape {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow reassigning `function` parameters
 *
 * @link https://eslint.org/docs/latest/rules/no-param-reassign
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoParamReassign {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "type": "object",
   *         "properties": {
   *           "props": {
   *             "enum": [
   *               false
   *             ]
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "props": {
   *             "enum": [
   *               true
   *             ]
   *           },
   *           "ignorePropertyModificationsFor": {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
   *             },
   *             "uniqueItems": true
   *           },
   *           "ignorePropertyModificationsForRegex": {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
   *             },
   *             "uniqueItems": true
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
        readonly props?: false;
      }
    | {
        readonly props?: true;
        readonly ignorePropertyModificationsFor?: readonly string[];
        readonly ignorePropertyModificationsForRegex?: readonly string[];
      };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow string concatenation with `__dirname` and `__filename`
 *
 * @link https://eslint.org/docs/latest/rules/no-path-concat
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 *  ```
 */
namespace NoPathConcat {
  export type RuleEntry = 0;
}

/**
 * Disallow the unary operators `++` and `--`
 *
 * @link https://eslint.org/docs/latest/rules/no-plusplus
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoPlusplus {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowForLoopAfterthoughts": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowForLoopAfterthoughts?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow the use of `process.env`
 *
 * @link https://eslint.org/docs/latest/rules/no-process-env
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 *  ```
 */
namespace NoProcessEnv {
  export type RuleEntry = 0;
}

/**
 * Disallow the use of `process.exit()`
 *
 * @link https://eslint.org/docs/latest/rules/no-process-exit
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 *  ```
 */
namespace NoProcessExit {
  export type RuleEntry = 0;
}

/**
 * Disallow returning values from Promise executor functions
 *
 * @link https://eslint.org/docs/latest/rules/no-promise-executor-return
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | hasSuggestions | true    |
 *  | recommended    | false   |
 *  ```
 */
namespace NoPromiseExecutorReturn {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowVoid": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowVoid?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow the use of the `__proto__` property
 *
 * @link https://eslint.org/docs/latest/rules/no-proto
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoProto {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow calling some `Object.prototype` methods directly on objects
 *
 * @link https://eslint.org/docs/latest/rules/no-prototype-builtins
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace NoPrototypeBuiltins {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow variable redeclaration
 *
 * @link https://eslint.org/docs/latest/rules/no-redeclare
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace NoRedeclare {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "builtinGlobals": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly builtinGlobals?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow multiple spaces in regular expressions
 *
 * @link https://eslint.org/docs/latest/rules/no-regex-spaces
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoRegexSpaces {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow specified names in exports
 *
 * @link https://eslint.org/docs/latest/rules/no-restricted-exports
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoRestrictedExports {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "anyOf": [
   *       {
   *         "type": "object",
   *         "properties": {
   *           "restrictedNamedExports": {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
   *             },
   *             "uniqueItems": true
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "restrictedNamedExports": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "pattern": "^(?!default$)"
   *             },
   *             "uniqueItems": true
   *           },
   *           "restrictDefaultExports": {
   *             "type": "object",
   *             "properties": {
   *               "direct": {
   *                 "type": "boolean"
   *               },
   *               "named": {
   *                 "type": "boolean"
   *               },
   *               "defaultFrom": {
   *                 "type": "boolean"
   *               },
   *               "namedFrom": {
   *                 "type": "boolean"
   *               },
   *               "namespaceFrom": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
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
        readonly restrictedNamedExports?: readonly string[];
        readonly restrictDefaultExports?: {
          readonly direct?: boolean;
          readonly named?: boolean;
          readonly defaultFrom?: boolean;
          readonly namedFrom?: boolean;
          readonly namespaceFrom?: boolean;
        };
      }
    | {
        readonly restrictedNamedExports?: readonly string[];
      };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow specified global variables
 *
 * @link https://eslint.org/docs/latest/rules/no-restricted-globals
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoRestrictedGlobals {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "type": "array",
   *   "items": {
   *     "oneOf": [
   *       {
   *         "type": "string"
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "name": {
   *             "type": "string"
   *           },
   *           "message": {
   *             "type": "string"
   *           }
   *         },
   *         "required": ["name"],
   *         "additionalProperties": false
   *       }
   *     ]
   *   },
   *   "uniqueItems": true,
   *   "minItems": 0
   * }
   * ```
   */
  /** @minItems 0 */
  export type Options = readonly (
    | string
    | {
        readonly name: string;
        readonly message?: string;
      }
  )[];

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow specified modules when loaded by `import`
 *
 * @link https://eslint.org/docs/latest/rules/no-restricted-imports
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoRestrictedImports {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "anyOf": [
   *     {
   *       "type": "array",
   *       "items": {
   *         "anyOf": [
   *           {
   *             "type": "string"
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "name": {
   *                 "type": "string"
   *               },
   *               "message": {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               "importNames": {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string"
   *                 }
   *               }
   *             },
   *             "additionalProperties": false,
   *             "required": ["name"]
   *           }
   *         ]
   *       },
   *       "uniqueItems": true
   *     },
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "type": "object",
   *           "properties": {
   *             "paths": {
   *               "type": "array",
   *               "items": {
   *                 "anyOf": [
   *                   {
   *                     "type": "string"
   *                   },
   *                   {
   *                     "type": "object",
   *                     "properties": {
   *                       "name": {
   *                         "type": "string"
   *                       },
   *                       "message": {
   *                         "type": "string",
   *                         "minLength": 1
   *                       },
   *                       "importNames": {
   *                         "type": "array",
   *                         "items": {
   *                           "type": "string"
   *                         }
   *                       }
   *                     },
   *                     "additionalProperties": false,
   *                     "required": ["name"]
   *                   }
   *                 ]
   *               },
   *               "uniqueItems": true
   *             },
   *             "patterns": {
   *               "anyOf": [
   *                 {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "uniqueItems": true
   *                 },
   *                 {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "object",
   *                     "properties": {
   *                       "importNames": {
   *                         "type": "array",
   *                         "items": {
   *                           "type": "string"
   *                         },
   *                         "minItems": 1,
   *                         "uniqueItems": true
   *                       },
   *                       "group": {
   *                         "type": "array",
   *                         "items": {
   *                           "type": "string"
   *                         },
   *                         "minItems": 1,
   *                         "uniqueItems": true
   *                       },
   *                       "importNamePattern": {
   *                         "type": "string"
   *                       },
   *                       "message": {
   *                         "type": "string",
   *                         "minLength": 1
   *                       },
   *                       "caseSensitive": {
   *                         "type": "boolean"
   *                       }
   *                     },
   *                     "additionalProperties": false,
   *                     "required": ["group"]
   *                   },
   *                   "uniqueItems": true
   *                 }
   *               ]
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       ],
   *       "additionalItems": false
   *     }
   *   ]
   * }
   * ```
   */
  export type Options =
    | readonly (
        | string
        | {
            readonly name: string;
            readonly message?: string;
            readonly importNames?: readonly string[];
          }
      )[]
    | readonly [
        {
          readonly paths?: readonly (
            | string
            | {
                readonly name: string;
                readonly message?: string;
                readonly importNames?: readonly string[];
              }
          )[];
          readonly patterns?:
            | readonly {
                /** @minItems 1 */
                readonly importNames?: readonly [
                  string,
                  ...(readonly string[]),
                ];
                /** @minItems 1 */
                readonly group: readonly [string, ...(readonly string[])];
                readonly importNamePattern?: string;
                readonly message?: string;
                readonly caseSensitive?: boolean;
              }[]
            | readonly string[];
        },
      ]
    | readonly [];

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow specified modules when loaded by `require`
 *
 * @link https://eslint.org/docs/latest/rules/no-restricted-modules
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 *  ```
 */
namespace NoRestrictedModules {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "anyOf": [
   *     {
   *       "type": "array",
   *       "items": {
   *         "anyOf": [
   *           {
   *             "type": "string"
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "name": {
   *                 "type": "string"
   *               },
   *               "message": {
   *                 "type": "string",
   *                 "minLength": 1
   *               }
   *             },
   *             "additionalProperties": false,
   *             "required": ["name"]
   *           }
   *         ]
   *       },
   *       "uniqueItems": true
   *     },
   *     {
   *       "type": "array",
   *       "items": {
   *         "type": "object",
   *         "properties": {
   *           "paths": {
   *             "type": "array",
   *             "items": {
   *               "anyOf": [
   *                 {
   *                   "type": "string"
   *                 },
   *                 {
   *                   "type": "object",
   *                   "properties": {
   *                     "name": {
   *                       "type": "string"
   *                     },
   *                     "message": {
   *                       "type": "string",
   *                       "minLength": 1
   *                     }
   *                   },
   *                   "additionalProperties": false,
   *                   "required": ["name"]
   *                 }
   *               ]
   *             },
   *             "uniqueItems": true
   *           },
   *           "patterns": {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
   *             },
   *             "uniqueItems": true
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       "additionalItems": false
   *     }
   *   ]
   * }
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Disallow certain properties on certain objects
 *
 * @link https://eslint.org/docs/latest/rules/no-restricted-properties
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoRestrictedProperties {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "type": "array",
   *   "items": {
   *     "anyOf": [
   *       {
   *         "type": "object",
   *         "properties": {
   *           "object": {
   *             "type": "string"
   *           },
   *           "property": {
   *             "type": "string"
   *           },
   *           "message": {
   *             "type": "string"
   *           }
   *         },
   *         "additionalProperties": false,
   *         "required": ["object"]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "object": {
   *             "type": "string"
   *           },
   *           "property": {
   *             "type": "string"
   *           },
   *           "message": {
   *             "type": "string"
   *           }
   *         },
   *         "additionalProperties": false,
   *         "required": ["property"]
   *       }
   *     ]
   *   },
   *   "uniqueItems": true
   * }
   * ```
   */
  export type Options = readonly (
    | {
        readonly object: string;
        readonly property?: string;
        readonly message?: string;
      }
    | {
        readonly object?: string;
        readonly property: string;
        readonly message?: string;
      }
  )[];

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow specified syntax
 *
 * @link https://eslint.org/docs/latest/rules/no-restricted-syntax
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoRestrictedSyntax {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "type": "array",
   *   "items": {
   *     "oneOf": [
   *       {
   *         "type": "string"
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "selector": {
   *             "type": "string"
   *           },
   *           "message": {
   *             "type": "string"
   *           }
   *         },
   *         "required": ["selector"],
   *         "additionalProperties": false
   *       }
   *     ]
   *   },
   *   "uniqueItems": true,
   *   "minItems": 0
   * }
   * ```
   */
  /** @minItems 0 */
  export type Options = readonly (
    | string
    | {
        readonly selector: string;
        readonly message?: string;
      }
  )[];

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow assignment operators in `return` statements
 *
 * @link https://eslint.org/docs/latest/rules/no-return-assign
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoReturnAssign {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "except-parens",
   *       "always"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'always' | 'except-parens';

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow unnecessary `return await`
 *
 * @link https://eslint.org/docs/latest/rules/no-return-await
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | true       |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 *  ```
 */
namespace NoReturnAwait {
  export type RuleEntry = 0;
}

/**
 * Disallow `javascript:` urls
 *
 * @link https://eslint.org/docs/latest/rules/no-script-url
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoScriptUrl {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow assignments where both sides are exactly the same
 *
 * @link https://eslint.org/docs/latest/rules/no-self-assign
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoSelfAssign {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "props": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly props?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow comparisons where both sides are exactly the same
 *
 * @link https://eslint.org/docs/latest/rules/no-self-compare
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoSelfCompare {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow comma operators
 *
 * @link https://eslint.org/docs/latest/rules/no-sequences
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoSequences {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "properties": {
   *       "allowInParentheses": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowInParentheses?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow returning values from setters
 *
 * @link https://eslint.org/docs/latest/rules/no-setter-return
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoSetterReturn {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow variable declarations from shadowing variables declared in the outer
 * scope
 *
 * @link https://eslint.org/docs/latest/rules/no-shadow
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoShadow {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "builtinGlobals": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "hoist": {
   *         "enum": [
   *           "all",
   *           "functions",
   *           "never"
   *         ],
   *         "default": "functions"
   *       },
   *       "allow": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "ignoreOnInitialization": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly builtinGlobals?: boolean;
    readonly hoist?: 'all' | 'functions' | 'never';
    readonly allow?: readonly string[];
    readonly ignoreOnInitialization?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow identifiers from shadowing restricted names
 *
 * @link https://eslint.org/docs/latest/rules/no-shadow-restricted-names
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace NoShadowRestrictedNames {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow spacing between function identifiers and their applications
 * (deprecated)
 *
 * @link https://eslint.org/docs/latest/rules/no-spaced-func
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace NoSpacedFunc {
  export type RuleEntry = 0;
}

/**
 * Disallow sparse arrays
 *
 * @link https://eslint.org/docs/latest/rules/no-sparse-arrays
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoSparseArrays {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow synchronous methods
 *
 * @link https://eslint.org/docs/latest/rules/no-sync
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 *  ```
 */
namespace NoSync {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowAtRootLevel": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Disallow all tabs
 *
 * @link https://eslint.org/docs/latest/rules/no-tabs
 *
 *  ```md
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | deprecated  | true   |
 *  | recommended | false  |
 *  ```
 */
namespace NoTabs {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowIndentationTabs": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Disallow template literal placeholder syntax in regular strings
 *
 * @link https://eslint.org/docs/latest/rules/no-template-curly-in-string
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoTemplateCurlyInString {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow ternary operators
 *
 * @link https://eslint.org/docs/latest/rules/no-ternary
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoTernary {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow `this`/`super` before calling `super()` in constructors
 *
 * @link https://eslint.org/docs/latest/rules/no-this-before-super
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoThisBeforeSuper {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow throwing literals as exceptions
 *
 * @link https://eslint.org/docs/latest/rules/no-throw-literal
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoThrowLiteral {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow trailing whitespace at the end of lines
 *
 * @link https://eslint.org/docs/latest/rules/no-trailing-spaces
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace NoTrailingSpaces {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "skipBlankLines": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "ignoreComments": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Disallow the use of undeclared variables unless mentioned in `global `
 * comments
 *
 * @link https://eslint.org/docs/latest/rules/no-undef
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoUndef {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "typeof": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly typeof?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow initializing variables to `undefined`
 *
 * @link https://eslint.org/docs/latest/rules/no-undef-init
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoUndefInit {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow the use of `undefined` as an identifier
 *
 * @link https://eslint.org/docs/latest/rules/no-undefined
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoUndefined {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow dangling underscores in identifiers
 *
 * @link https://eslint.org/docs/latest/rules/no-underscore-dangle
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoUnderscoreDangle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allow": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "allowAfterThis": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "allowAfterSuper": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "allowAfterThisConstructor": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "enforceInMethodNames": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "allowFunctionParams": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "enforceInClassFields": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "allowInArrayDestructuring": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "allowInObjectDestructuring": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allow?: readonly string[];
    readonly allowAfterThis?: boolean;
    readonly allowAfterSuper?: boolean;
    readonly allowAfterThisConstructor?: boolean;
    readonly enforceInMethodNames?: boolean;
    readonly allowFunctionParams?: boolean;
    readonly enforceInClassFields?: boolean;
    readonly allowInArrayDestructuring?: boolean;
    readonly allowInObjectDestructuring?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow confusing multiline expressions
 *
 * @link https://eslint.org/docs/latest/rules/no-unexpected-multiline
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnexpectedMultiline {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow unmodified loop conditions
 *
 * @link https://eslint.org/docs/latest/rules/no-unmodified-loop-condition
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoUnmodifiedLoopCondition {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow ternary operators when simpler alternatives exist
 *
 * @link https://eslint.org/docs/latest/rules/no-unneeded-ternary
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoUnneededTernary {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "defaultAssignment": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly defaultAssignment?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow unreachable code after `return`, `throw`, `continue`, and `break`
 * statements
 *
 * @link https://eslint.org/docs/latest/rules/no-unreachable
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnreachable {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow loops with a body that allows only one iteration
 *
 * @link https://eslint.org/docs/latest/rules/no-unreachable-loop
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoUnreachableLoop {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignore": {
   *         "type": "array",
   *         "items": {
   *           "enum": [
   *             "WhileStatement",
   *             "DoWhileStatement",
   *             "ForStatement",
   *             "ForInStatement",
   *             "ForOfStatement"
   *           ]
   *         },
   *         "uniqueItems": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly ignore?: readonly (
      | 'DoWhileStatement'
      | 'ForInStatement'
      | 'ForOfStatement'
      | 'ForStatement'
      | 'WhileStatement'
    )[];
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow control flow statements in `finally` blocks
 *
 * @link https://eslint.org/docs/latest/rules/no-unsafe-finally
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnsafeFinally {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow negating the left operand of relational operators
 *
 * @link https://eslint.org/docs/latest/rules/no-unsafe-negation
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace NoUnsafeNegation {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "enforceForOrderingRelations": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly enforceForOrderingRelations?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow use of optional chaining in contexts where the `undefined` value is
 * not allowed
 *
 * @link https://eslint.org/docs/latest/rules/no-unsafe-optional-chaining
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnsafeOptionalChaining {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "disallowArithmeticOperators": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly disallowArithmeticOperators?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow unused expressions
 *
 * @link https://eslint.org/docs/latest/rules/no-unused-expressions
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoUnusedExpressions {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowShortCircuit": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "allowTernary": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "allowTaggedTemplates": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "enforceForJSX": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowShortCircuit?: boolean;
    readonly allowTernary?: boolean;
    readonly allowTaggedTemplates?: boolean;
    readonly enforceForJSX?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow unused labels
 *
 * @link https://eslint.org/docs/latest/rules/no-unused-labels
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoUnusedLabels {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow unused private class members
 *
 * @link https://eslint.org/docs/latest/rules/no-unused-private-class-members
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoUnusedPrivateClassMembers {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow unused variables
 *
 * @link https://eslint.org/docs/latest/rules/no-unused-vars
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnusedVars {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "enum": [
   *           "all",
   *           "local"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "vars": {
   *             "enum": [
   *               "all",
   *               "local"
   *             ]
   *           },
   *           "varsIgnorePattern": {
   *             "type": "string"
   *           },
   *           "args": {
   *             "enum": [
   *               "all",
   *               "after-used",
   *               "none"
   *             ]
   *           },
   *           "ignoreRestSiblings": {
   *             "type": "boolean"
   *           },
   *           "argsIgnorePattern": {
   *             "type": "string"
   *           },
   *           "caughtErrors": {
   *             "enum": [
   *               "all",
   *               "none"
   *             ]
   *           },
   *           "caughtErrorsIgnorePattern": {
   *             "type": "string"
   *           },
   *           "destructuredArrayIgnorePattern": {
   *             "type": "string"
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
    | 'all'
    | 'local'
    | {
        readonly vars?: 'all' | 'local';
        readonly varsIgnorePattern?: string;
        readonly args?: 'after-used' | 'all' | 'none';
        readonly ignoreRestSiblings?: boolean;
        readonly argsIgnorePattern?: string;
        readonly caughtErrors?: 'all' | 'none';
        readonly caughtErrorsIgnorePattern?: string;
        readonly destructuredArrayIgnorePattern?: string;
      };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow the use of variables before they are defined
 *
 * @link https://eslint.org/docs/latest/rules/no-use-before-define
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace NoUseBeforeDefine {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "enum": [
   *           "nofunc"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "functions": {
   *             "type": "boolean"
   *           },
   *           "classes": {
   *             "type": "boolean"
   *           },
   *           "variables": {
   *             "type": "boolean"
   *           },
   *           "allowNamedExports": {
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
    | 'nofunc'
    | {
        readonly functions?: boolean;
        readonly classes?: boolean;
        readonly variables?: boolean;
        readonly allowNamedExports?: boolean;
      };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow useless backreferences in regular expressions
 *
 * @link https://eslint.org/docs/latest/rules/no-useless-backreference
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace NoUselessBackreference {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow unnecessary calls to `.call()` and `.apply()`
 *
 * @link https://eslint.org/docs/latest/rules/no-useless-call
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoUselessCall {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow unnecessary `catch` clauses
 *
 * @link https://eslint.org/docs/latest/rules/no-useless-catch
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace NoUselessCatch {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow unnecessary computed property keys in objects and classes
 *
 * @link https://eslint.org/docs/latest/rules/no-useless-computed-key
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoUselessComputedKey {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "enforceForClassMembers": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly enforceForClassMembers?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow unnecessary concatenation of literals or template literals
 *
 * @link https://eslint.org/docs/latest/rules/no-useless-concat
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoUselessConcat {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow unnecessary constructors
 *
 * @link https://eslint.org/docs/latest/rules/no-useless-constructor
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoUselessConstructor {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow unnecessary escape characters
 *
 * @link https://eslint.org/docs/latest/rules/no-useless-escape
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoUselessEscape {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow renaming import, export, and destructured assignments to the same
 * name
 *
 * @link https://eslint.org/docs/latest/rules/no-useless-rename
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoUselessRename {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreDestructuring": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "ignoreImport": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "ignoreExport": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly ignoreDestructuring?: boolean;
    readonly ignoreImport?: boolean;
    readonly ignoreExport?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow redundant return statements
 *
 * @link https://eslint.org/docs/latest/rules/no-useless-return
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoUselessReturn {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require `let` or `const` instead of `var`
 *
 * @link https://eslint.org/docs/latest/rules/no-var
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoVar {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow `void` operators
 *
 * @link https://eslint.org/docs/latest/rules/no-void
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoVoid {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowAsStatement": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowAsStatement?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow specified warning terms in comments
 *
 * @link https://eslint.org/docs/latest/rules/no-warning-comments
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace NoWarningComments {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "terms": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "location": {
   *         "enum": [
   *           "start",
   *           "anywhere"
   *         ]
   *       },
   *       "decoration": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "pattern": "^\\S$"
   *         },
   *         "minItems": 1,
   *         "uniqueItems": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly terms?: readonly string[];
    readonly location?: 'anywhere' | 'start';
    /** @minItems 1 */
    readonly decoration?: readonly [string, ...(readonly string[])];
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow whitespace before properties
 *
 * @link https://eslint.org/docs/latest/rules/no-whitespace-before-property
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace NoWhitespaceBeforeProperty {
  export type RuleEntry = 0;
}

/**
 * Disallow `with` statements
 *
 * @link https://eslint.org/docs/latest/rules/no-with
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace NoWith {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce the location of single-line statements
 *
 * @link https://eslint.org/docs/latest/rules/nonblock-statement-body-position
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace NonblockStatementBodyPosition {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "beside",
   *       "below",
   *       "any"
   *     ]
   *   },
   *   {
   *     "properties": {
   *       "overrides": {
   *         "properties": {
   *           "if": {
   *             "enum": [
   *               "beside",
   *               "below",
   *               "any"
   *             ]
   *           },
   *           "else": {
   *             "enum": [
   *               "beside",
   *               "below",
   *               "any"
   *             ]
   *           },
   *           "while": {
   *             "enum": [
   *               "beside",
   *               "below",
   *               "any"
   *             ]
   *           },
   *           "do": {
   *             "enum": [
   *               "beside",
   *               "below",
   *               "any"
   *             ]
   *           },
   *           "for": {
   *             "enum": [
   *               "beside",
   *               "below",
   *               "any"
   *             ]
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce consistent line breaks after opening and before closing braces
 *
 * @link https://eslint.org/docs/latest/rules/object-curly-newline
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace ObjectCurlyNewline {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "oneOf": [
   *           {
   *             "enum": [
   *               "always",
   *               "never"
   *             ]
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "multiline": {
   *                 "type": "boolean"
   *               },
   *               "minProperties": {
   *                 "type": "integer",
   *                 "minimum": 0
   *               },
   *               "consistent": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false,
   *             "minProperties": 1
   *           }
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "ObjectExpression": {
   *             "oneOf": [
   *               {
   *                 "enum": [
   *                   "always",
   *                   "never"
   *                 ]
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "multiline": {
   *                     "type": "boolean"
   *                   },
   *                   "minProperties": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false,
   *                 "minProperties": 1
   *               }
   *             ]
   *           },
   *           "ObjectPattern": {
   *             "oneOf": [
   *               {
   *                 "enum": [
   *                   "always",
   *                   "never"
   *                 ]
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "multiline": {
   *                     "type": "boolean"
   *                   },
   *                   "minProperties": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false,
   *                 "minProperties": 1
   *               }
   *             ]
   *           },
   *           "ImportDeclaration": {
   *             "oneOf": [
   *               {
   *                 "enum": [
   *                   "always",
   *                   "never"
   *                 ]
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "multiline": {
   *                     "type": "boolean"
   *                   },
   *                   "minProperties": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false,
   *                 "minProperties": 1
   *               }
   *             ]
   *           },
   *           "ExportDeclaration": {
   *             "oneOf": [
   *               {
   *                 "enum": [
   *                   "always",
   *                   "never"
   *                 ]
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "multiline": {
   *                     "type": "boolean"
   *                   },
   *                   "minProperties": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false,
   *                 "minProperties": 1
   *               }
   *             ]
   *           }
   *         },
   *         "additionalProperties": false,
   *         "minProperties": 1
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce consistent spacing inside braces
 *
 * @link https://eslint.org/docs/latest/rules/object-curly-spacing
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace ObjectCurlySpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "arraysInObjects": {
   *         "type": "boolean"
   *       },
   *       "objectsInObjects": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce placing object properties on separate lines
 *
 * @link https://eslint.org/docs/latest/rules/object-property-newline
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace ObjectPropertyNewline {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowAllPropertiesOnSameLine": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "allowMultiplePropertiesPerLine": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require or disallow method and property shorthand syntax for object literals
 *
 * @link https://eslint.org/docs/latest/rules/object-shorthand
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace ObjectShorthand {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "anyOf": [
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": [
   *             "always",
   *             "methods",
   *             "properties",
   *             "never",
   *             "consistent",
   *             "consistent-as-needed"
   *           ]
   *         }
   *       ],
   *       "minItems": 0,
   *       "maxItems": 1
   *     },
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["always", "methods", "properties"]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "avoidQuotes": {
   *               "type": "boolean"
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       ],
   *       "minItems": 0,
   *       "maxItems": 2
   *     },
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["always", "methods"]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "ignoreConstructors": {
   *               "type": "boolean"
   *             },
   *             "methodsIgnorePattern": {
   *               "type": "string"
   *             },
   *             "avoidQuotes": {
   *               "type": "boolean"
   *             },
   *             "avoidExplicitReturnArrows": {
   *               "type": "boolean"
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       ],
   *       "minItems": 0,
   *       "maxItems": 2
   *     }
   *   ]
   * }
   * ```
   */
  export type Options =
    | readonly [
        'always' | 'methods' | 'properties',
        {
          readonly avoidQuotes?: boolean;
        },
      ]
    | readonly [
        'always' | 'methods',
        {
          readonly ignoreConstructors?: boolean;
          readonly methodsIgnorePattern?: string;
          readonly avoidQuotes?: boolean;
          readonly avoidExplicitReturnArrows?: boolean;
        },
      ]
    | readonly [
        | 'always'
        | 'consistent-as-needed'
        | 'consistent'
        | 'methods'
        | 'never'
        | 'properties',
      ]
    | readonly ['always' | 'methods' | 'properties']
    | readonly ['always' | 'methods']
    | readonly [];

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce variables to be declared either together or separately in functions
 *
 * @link https://eslint.org/docs/latest/rules/one-var
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace OneVar {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "enum": [
   *           "always",
   *           "never",
   *           "consecutive"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "separateRequires": {
   *             "type": "boolean"
   *           },
   *           "var": {
   *             "enum": [
   *               "always",
   *               "never",
   *               "consecutive"
   *             ]
   *           },
   *           "let": {
   *             "enum": [
   *               "always",
   *               "never",
   *               "consecutive"
   *             ]
   *           },
   *           "const": {
   *             "enum": [
   *               "always",
   *               "never",
   *               "consecutive"
   *             ]
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "initialized": {
   *             "enum": [
   *               "always",
   *               "never",
   *               "consecutive"
   *             ]
   *           },
   *           "uninitialized": {
   *             "enum": [
   *               "always",
   *               "never",
   *               "consecutive"
   *             ]
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
    | 'always'
    | 'consecutive'
    | 'never'
    | {
        readonly initialized?: 'always' | 'consecutive' | 'never';
        readonly uninitialized?: 'always' | 'consecutive' | 'never';
      }
    | {
        readonly separateRequires?: boolean;
        readonly var?: 'always' | 'consecutive' | 'never';
        readonly let?: 'always' | 'consecutive' | 'never';
        readonly const?: 'always' | 'consecutive' | 'never';
      };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require or disallow newlines around variable declarations
 *
 * @link https://eslint.org/docs/latest/rules/one-var-declaration-per-line
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace OneVarDeclarationPerLine {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "initializations"
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require or disallow assignment operator shorthand where possible
 *
 * @link https://eslint.org/docs/latest/rules/operator-assignment
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace OperatorAssignment {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
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
 * Enforce consistent linebreak style for operators
 *
 * @link https://eslint.org/docs/latest/rules/operator-linebreak
 *
 *  ```md
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | deprecated  | true   |
 *  | fixable     | code   |
 *  | recommended | false  |
 *  ```
 */
namespace OperatorLinebreak {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "after",
   *       "before",
   *       "none",
   *       null
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "overrides": {
   *         "type": "object",
   *         "additionalProperties": {
   *           "enum": [
   *             "after",
   *             "before",
   *             "none",
   *             "ignore"
   *           ]
   *         }
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require or disallow padding within blocks
 *
 * @link https://eslint.org/docs/latest/rules/padded-blocks
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace PaddedBlocks {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "blocks": {
   *             "enum": [
   *               "always",
   *               "never"
   *             ]
   *           },
   *           "switches": {
   *             "enum": [
   *               "always",
   *               "never"
   *             ]
   *           },
   *           "classes": {
   *             "enum": [
   *               "always",
   *               "never"
   *             ]
   *           }
   *         },
   *         "additionalProperties": false,
   *         "minProperties": 1
   *       }
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowSingleLineBlocks": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require or disallow padding lines between statements
 *
 * @link https://eslint.org/docs/latest/rules/padding-line-between-statements
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace PaddingLineBetweenStatements {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "definitions": {
   *     "paddingType": {
   *       "enum": ["any", "never", "always"]
   *     },
   *     "statementType": {
   *       "anyOf": [
   *         {
   *           "enum": [
   *             "*",
   *             "block-like",
   *             "cjs-export",
   *             "cjs-import",
   *             "directive",
   *             "expression",
   *             "iife",
   *             "multiline-block-like",
   *             "multiline-expression",
   *             "multiline-const",
   *             "multiline-let",
   *             "multiline-var",
   *             "singleline-const",
   *             "singleline-let",
   *             "singleline-var",
   *             "block",
   *             "empty",
   *             "function",
   *             "break",
   *             "case",
   *             "class",
   *             "const",
   *             "continue",
   *             "debugger",
   *             "default",
   *             "do",
   *             "export",
   *             "for",
   *             "if",
   *             "import",
   *             "let",
   *             "return",
   *             "switch",
   *             "throw",
   *             "try",
   *             "var",
   *             "while",
   *             "with"
   *           ]
   *         },
   *         {
   *           "type": "array",
   *           "items": {
   *             "enum": [
   *               "*",
   *               "block-like",
   *               "cjs-export",
   *               "cjs-import",
   *               "directive",
   *               "expression",
   *               "iife",
   *               "multiline-block-like",
   *               "multiline-expression",
   *               "multiline-const",
   *               "multiline-let",
   *               "multiline-var",
   *               "singleline-const",
   *               "singleline-let",
   *               "singleline-var",
   *               "block",
   *               "empty",
   *               "function",
   *               "break",
   *               "case",
   *               "class",
   *               "const",
   *               "continue",
   *               "debugger",
   *               "default",
   *               "do",
   *               "export",
   *               "for",
   *               "if",
   *               "import",
   *               "let",
   *               "return",
   *               "switch",
   *               "throw",
   *               "try",
   *               "var",
   *               "while",
   *               "with"
   *             ]
   *           },
   *           "minItems": 1,
   *           "uniqueItems": true
   *         }
   *       ]
   *     }
   *   },
   *   "type": "array",
   *   "items": {
   *     "type": "object",
   *     "properties": {
   *       "blankLine": {
   *         "$ref": "#/definitions/paddingType"
   *       },
   *       "prev": {
   *         "$ref": "#/definitions/statementType"
   *       },
   *       "next": {
   *         "$ref": "#/definitions/statementType"
   *       }
   *     },
   *     "additionalProperties": false,
   *     "required": ["blankLine", "prev", "next"]
   *   }
   * }
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require using arrow functions for callbacks
 *
 * @link https://eslint.org/docs/latest/rules/prefer-arrow-callback
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferArrowCallback {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowNamedFunctions": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "allowUnboundThis": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowNamedFunctions?: boolean;
    readonly allowUnboundThis?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require `const` declarations for variables that are never reassigned after
 * declared
 *
 * @link https://eslint.org/docs/latest/rules/prefer-const
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferConst {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "destructuring": {
   *         "enum": [
   *           "any",
   *           "all"
   *         ],
   *         "default": "any"
   *       },
   *       "ignoreReadBeforeAssign": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly destructuring?: 'all' | 'any';
    readonly ignoreReadBeforeAssign?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require destructuring from arrays and/or objects
 *
 * @link https://eslint.org/docs/latest/rules/prefer-destructuring
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferDestructuring {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "type": "object",
   *         "properties": {
   *           "VariableDeclarator": {
   *             "type": "object",
   *             "properties": {
   *               "array": {
   *                 "type": "boolean"
   *               },
   *               "object": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "AssignmentExpression": {
   *             "type": "object",
   *             "properties": {
   *               "array": {
   *                 "type": "boolean"
   *               },
   *               "object": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "array": {
   *             "type": "boolean"
   *           },
   *           "object": {
   *             "type": "boolean"
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "enforceForRenamedProperties": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options0 =
    | {
        readonly array?: boolean;
        readonly object?: boolean;
      }
    | {
        readonly VariableDeclarator?: {
          readonly array?: boolean;
          readonly object?: boolean;
        };
        readonly AssignmentExpression?: {
          readonly array?: boolean;
          readonly object?: boolean;
        };
      };

  export type Options1 = {
    readonly enforceForRenamedProperties?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | readonly [Linter.RuleSeverity, Options0, Options1]
    | readonly [Linter.RuleSeverity, Options0];
}

/**
 * Disallow the use of `Math.pow` in favor of the `**` operator
 *
 * @link https://eslint.org/docs/latest/rules/prefer-exponentiation-operator
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferExponentiationOperator {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce using named capture group in regular expression
 *
 * @link https://eslint.org/docs/latest/rules/prefer-named-capture-group
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 *  ```
 */
namespace PreferNamedCaptureGroup {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow `parseInt()` and `Number.parseInt()` in favor of binary, octal, and
 * hexadecimal literals
 *
 * @link https://eslint.org/docs/latest/rules/prefer-numeric-literals
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferNumericLiterals {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow use of `Object.prototype.hasOwnProperty.call()` and prefer use of
 * `Object.hasOwn()`
 *
 * @link https://eslint.org/docs/latest/rules/prefer-object-has-own
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferObjectHasOwn {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Disallow using Object.assign with an object literal as the first argument and
 * prefer the use of object spread instead
 *
 * @link https://eslint.org/docs/latest/rules/prefer-object-spread
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferObjectSpread {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require using Error objects as Promise rejection reasons
 *
 * @link https://eslint.org/docs/latest/rules/prefer-promise-reject-errors
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace PreferPromiseRejectErrors {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowEmptyReject": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowEmptyReject?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require `Reflect` methods where applicable
 *
 * @link https://eslint.org/docs/latest/rules/prefer-reflect
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferReflect {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "exceptions": {
   *         "type": "array",
   *         "items": {
   *           "enum": [
   *             "apply",
   *             "call",
   *             "delete",
   *             "defineProperty",
   *             "getOwnPropertyDescriptor",
   *             "getPrototypeOf",
   *             "setPrototypeOf",
   *             "isExtensible",
   *             "getOwnPropertyNames",
   *             "preventExtensions"
   *           ]
   *         },
   *         "uniqueItems": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Disallow use of the `RegExp` constructor in favor of regular expression
 * literals
 *
 * @link https://eslint.org/docs/latest/rules/prefer-regex-literals
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 *  ```
 */
namespace PreferRegexLiterals {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "disallowRedundantWrapping": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly disallowRedundantWrapping?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require rest parameters instead of `arguments`
 *
 * @link https://eslint.org/docs/latest/rules/prefer-rest-params
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace PreferRestParams {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require spread operators instead of `.apply()`
 *
 * @link https://eslint.org/docs/latest/rules/prefer-spread
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace PreferSpread {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require template literals instead of string concatenation
 *
 * @link https://eslint.org/docs/latest/rules/prefer-template
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferTemplate {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require quotes around object literal property names
 *
 * @link https://eslint.org/docs/latest/rules/quote-props
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace QuoteProps {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "anyOf": [
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": [
   *             "always",
   *             "as-needed",
   *             "consistent",
   *             "consistent-as-needed"
   *           ]
   *         }
   *       ],
   *       "minItems": 0,
   *       "maxItems": 1
   *     },
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": [
   *             "always",
   *             "as-needed",
   *             "consistent",
   *             "consistent-as-needed"
   *           ]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "keywords": {
   *               "type": "boolean"
   *             },
   *             "unnecessary": {
   *               "type": "boolean"
   *             },
   *             "numbers": {
   *               "type": "boolean"
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       ],
   *       "minItems": 0,
   *       "maxItems": 2
   *     }
   *   ]
   * }
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce the consistent use of either backticks, double, or single quotes
 *
 * @link https://eslint.org/docs/latest/rules/quotes
 *
 *  ```md
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | deprecated  | true   |
 *  | fixable     | code   |
 *  | recommended | false  |
 *  ```
 */
namespace Quotes {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "single",
   *       "double",
   *       "backtick"
   *     ]
   *   },
   *   {
   *     "anyOf": [
   *       {
   *         "enum": [
   *           "avoid-escape"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "avoidEscape": {
   *             "type": "boolean"
   *           },
   *           "allowTemplateLiterals": {
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
  export type RuleEntry = 0;
}

/**
 * Enforce the consistent use of the radix argument when using `parseInt()`
 *
 * @link https://eslint.org/docs/latest/rules/radix
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 *  ```
 */
namespace Radix {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "as-needed"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'always' | 'as-needed';

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow assignments that can lead to race conditions due to usage of `await`
 * or `yield`
 *
 * @link https://eslint.org/docs/latest/rules/require-atomic-updates
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 *  ```
 */
namespace RequireAtomicUpdates {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowProperties": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowProperties?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Disallow async functions which have no `await` expression
 *
 * @link https://eslint.org/docs/latest/rules/require-await
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace RequireAwait {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require JSDoc comments
 *
 * @link https://eslint.org/docs/latest/rules/require-jsdoc
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 *  ```
 */
namespace RequireJsdoc {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "require": {
   *         "type": "object",
   *         "properties": {
   *           "ClassDeclaration": {
   *             "type": "boolean",
   *             "default": false
   *           },
   *           "MethodDefinition": {
   *             "type": "boolean",
   *             "default": false
   *           },
   *           "FunctionDeclaration": {
   *             "type": "boolean",
   *             "default": true
   *           },
   *           "ArrowFunctionExpression": {
   *             "type": "boolean",
   *             "default": false
   *           },
   *           "FunctionExpression": {
   *             "type": "boolean",
   *             "default": false
   *           }
   *         },
   *         "additionalProperties": false,
   *         "default": {}
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce the use of `u` or `v` flag on RegExp
 *
 * @link https://eslint.org/docs/latest/rules/require-unicode-regexp
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 *  ```
 */
namespace RequireUnicodeRegexp {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require generator functions to contain `yield`
 *
 * @link https://eslint.org/docs/latest/rules/require-yield
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 *  ```
 */
namespace RequireYield {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Enforce spacing between rest and spread operators and their expressions
 *
 * @link https://eslint.org/docs/latest/rules/rest-spread-spacing
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace RestSpreadSpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require or disallow semicolons instead of ASI
 *
 * @link https://eslint.org/docs/latest/rules/semi
 *
 *  ```md
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | deprecated  | true   |
 *  | fixable     | code   |
 *  | recommended | false  |
 *  ```
 */
namespace Semi {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "anyOf": [
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["never"]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "beforeStatementContinuationChars": {
   *               "enum": ["always", "any", "never"]
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       ],
   *       "minItems": 0,
   *       "maxItems": 2
   *     },
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["always"]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "omitLastInOneLineBlock": {
   *               "type": "boolean"
   *             },
   *             "omitLastInOneLineClassBody": {
   *               "type": "boolean"
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       ],
   *       "minItems": 0,
   *       "maxItems": 2
   *     }
   *   ]
   * }
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce consistent spacing before and after semicolons
 *
 * @link https://eslint.org/docs/latest/rules/semi-spacing
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace SemiSpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "before": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "after": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce location of semicolons
 *
 * @link https://eslint.org/docs/latest/rules/semi-style
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace SemiStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "last",
   *       "first"
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce sorted import declarations within modules
 *
 * @link https://eslint.org/docs/latest/rules/sort-imports
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace SortImports {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreCase": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "memberSyntaxSortOrder": {
   *         "type": "array",
   *         "items": {
   *           "enum": [
   *             "none",
   *             "all",
   *             "multiple",
   *             "single"
   *           ]
   *         },
   *         "uniqueItems": true,
   *         "minItems": 4,
   *         "maxItems": 4
   *       },
   *       "ignoreDeclarationSort": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "ignoreMemberSort": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "allowSeparatedGroups": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly ignoreCase?: boolean;
    /**
     * @minItems 4
     * @maxItems 4
     */
    readonly memberSyntaxSortOrder?: readonly [
      'all' | 'multiple' | 'none' | 'single',
      'all' | 'multiple' | 'none' | 'single',
      'all' | 'multiple' | 'none' | 'single',
      'all' | 'multiple' | 'none' | 'single',
    ];
    readonly ignoreDeclarationSort?: boolean;
    readonly ignoreMemberSort?: boolean;
    readonly allowSeparatedGroups?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require object keys to be sorted
 *
 * @link https://eslint.org/docs/latest/rules/sort-keys
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace SortKeys {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "asc",
   *       "desc"
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "caseSensitive": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "natural": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "minKeys": {
   *         "type": "integer",
   *         "minimum": 2,
   *         "default": 2
   *       },
   *       "allowLineSeparatedGroups": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options0 = 'asc' | 'desc';

  export type Options1 = {
    readonly caseSensitive?: boolean;
    readonly natural?: boolean;
    readonly minKeys?: number;
    readonly allowLineSeparatedGroups?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | readonly [Linter.RuleSeverity, Options0, Options1]
    | readonly [Linter.RuleSeverity, Options0];
}

/**
 * Require variables within the same declaration block to be sorted
 *
 * @link https://eslint.org/docs/latest/rules/sort-vars
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace SortVars {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreCase": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly ignoreCase?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce consistent spacing before blocks
 *
 * @link https://eslint.org/docs/latest/rules/space-before-blocks
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace SpaceBeforeBlocks {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "keywords": {
   *             "enum": [
   *               "always",
   *               "never",
   *               "off"
   *             ]
   *           },
   *           "functions": {
   *             "enum": [
   *               "always",
   *               "never",
   *               "off"
   *             ]
   *           },
   *           "classes": {
   *             "enum": [
   *               "always",
   *               "never",
   *               "off"
   *             ]
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce consistent spacing before `function` definition opening parenthesis
 *
 * @link https://eslint.org/docs/latest/rules/space-before-function-paren
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace SpaceBeforeFunctionParen {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "anonymous": {
   *             "enum": [
   *               "always",
   *               "never",
   *               "ignore"
   *             ]
   *           },
   *           "named": {
   *             "enum": [
   *               "always",
   *               "never",
   *               "ignore"
   *             ]
   *           },
   *           "asyncArrow": {
   *             "enum": [
   *               "always",
   *               "never",
   *               "ignore"
   *             ]
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce consistent spacing inside parentheses
 *
 * @link https://eslint.org/docs/latest/rules/space-in-parens
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace SpaceInParens {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "exceptions": {
   *         "type": "array",
   *         "items": {
   *           "enum": [
   *             "{}",
   *             "[]",
   *             "()",
   *             "empty"
   *           ]
   *         },
   *         "uniqueItems": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require spacing around infix operators
 *
 * @link https://eslint.org/docs/latest/rules/space-infix-ops
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace SpaceInfixOps {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "int32Hint": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce consistent spacing before or after unary operators
 *
 * @link https://eslint.org/docs/latest/rules/space-unary-ops
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace SpaceUnaryOps {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "words": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "nonwords": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "overrides": {
   *         "type": "object",
   *         "additionalProperties": {
   *           "type": "boolean"
   *         }
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce consistent spacing after the `//` or ` ` in a comment
 *
 * @link https://eslint.org/docs/latest/rules/spaced-comment
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace SpacedComment {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "exceptions": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "markers": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "line": {
   *         "type": "object",
   *         "properties": {
   *           "exceptions": {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
   *             }
   *           },
   *           "markers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
   *             }
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       "block": {
   *         "type": "object",
   *         "properties": {
   *           "exceptions": {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
   *             }
   *           },
   *           "markers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
   *             }
   *           },
   *           "balanced": {
   *             "type": "boolean",
   *             "default": false
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require or disallow strict mode directives
 *
 * @link https://eslint.org/docs/latest/rules/strict
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace Strict {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "never",
   *       "global",
   *       "function",
   *       "safe"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'function' | 'global' | 'never' | 'safe';

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce spacing around colons of switch statements
 *
 * @link https://eslint.org/docs/latest/rules/switch-colon-spacing
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace SwitchColonSpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "before": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "after": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require symbol descriptions
 *
 * @link https://eslint.org/docs/latest/rules/symbol-description
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace SymbolDescription {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require or disallow spacing around embedded expressions of template strings
 *
 * @link https://eslint.org/docs/latest/rules/template-curly-spacing
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace TemplateCurlySpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require or disallow spacing between template tags and their literals
 *
 * @link https://eslint.org/docs/latest/rules/template-tag-spacing
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace TemplateTagSpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require or disallow Unicode byte order mark (BOM)
 *
 * @link https://eslint.org/docs/latest/rules/unicode-bom
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace UnicodeBom {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
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
 * Require calls to `isNaN()` when checking for `NaN`
 *
 * @link https://eslint.org/docs/latest/rules/use-isnan
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 *  ```
 */
namespace UseIsnan {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "enforceForSwitchCase": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "enforceForIndexOf": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly enforceForSwitchCase?: boolean;
    readonly enforceForIndexOf?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Enforce valid JSDoc comments
 *
 * @link https://eslint.org/docs/latest/rules/valid-jsdoc
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace ValidJsdoc {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "prefer": {
   *         "type": "object",
   *         "additionalProperties": {
   *           "type": "string"
   *         }
   *       },
   *       "preferType": {
   *         "type": "object",
   *         "additionalProperties": {
   *           "type": "string"
   *         }
   *       },
   *       "requireReturn": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "requireParamDescription": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "requireReturnDescription": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "matchDescription": {
   *         "type": "string"
   *       },
   *       "requireReturnType": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "requireParamType": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce comparing `typeof` expressions against valid strings
 *
 * @link https://eslint.org/docs/latest/rules/valid-typeof
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace ValidTypeof {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "requireStringLiterals": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly requireStringLiterals?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | SpreadOptionsIfIsArray<readonly [Linter.RuleSeverity, Options]>;
}

/**
 * Require `var` declarations be placed at the top of their containing scope
 *
 * @link https://eslint.org/docs/latest/rules/vars-on-top
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 *  ```
 */
namespace VarsOnTop {
  export type RuleEntry = Linter.RuleSeverity;
}

/**
 * Require parentheses around immediate `function` invocations
 *
 * @link https://eslint.org/docs/latest/rules/wrap-iife
 *
 *  ```md
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | deprecated  | true   |
 *  | fixable     | code   |
 *  | recommended | false  |
 *  ```
 */
namespace WrapIife {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "outside",
   *       "inside",
   *       "any"
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "functionPrototypeMethods": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Require parenthesis around regex literals
 *
 * @link https://eslint.org/docs/latest/rules/wrap-regex
 *
 *  ```md
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | deprecated  | true   |
 *  | fixable     | code   |
 *  | recommended | false  |
 *  ```
 */
namespace WrapRegex {
  export type RuleEntry = 0;
}

/**
 * Require or disallow spacing around the `*` in `yield*` expressions
 *
 * @link https://eslint.org/docs/latest/rules/yield-star-spacing
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 *  ```
 */
namespace YieldStarSpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "enum": [
   *           "before",
   *           "after",
   *           "both",
   *           "neither"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "before": {
   *             "type": "boolean"
   *           },
   *           "after": {
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
  export type RuleEntry = 0;
}

/**
 * Require or disallow "Yoda" conditions
 *
 * @link https://eslint.org/docs/latest/rules/yoda
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace Yoda {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "exceptRange": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "onlyEquality": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options0 = 'always' | 'never';

  export type Options1 = {
    readonly exceptRange?: boolean;
    readonly onlyEquality?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleSeverity
    | readonly [Linter.RuleSeverity, Options0, Options1]
    | readonly [Linter.RuleSeverity, Options0];
}

export type EslintRules = {
  readonly 'accessor-pairs': AccessorPairs.RuleEntry;
  readonly 'array-callback-return': ArrayCallbackReturn.RuleEntry;
  readonly 'arrow-body-style': ArrowBodyStyle.RuleEntry;
  readonly 'block-scoped-var': BlockScopedVar.RuleEntry;
  readonly camelcase: Camelcase.RuleEntry;
  readonly 'capitalized-comments': CapitalizedComments.RuleEntry;
  readonly 'class-methods-use-this': ClassMethodsUseThis.RuleEntry;
  readonly complexity: Complexity.RuleEntry;
  readonly 'consistent-return': ConsistentReturn.RuleEntry;
  readonly 'consistent-this': ConsistentThis.RuleEntry;
  readonly 'constructor-super': ConstructorSuper.RuleEntry;
  readonly curly: Curly.RuleEntry;
  readonly 'default-case': DefaultCase.RuleEntry;
  readonly 'default-case-last': DefaultCaseLast.RuleEntry;
  readonly 'default-param-last': DefaultParamLast.RuleEntry;
  readonly 'dot-notation': DotNotation.RuleEntry;
  readonly eqeqeq: Eqeqeq.RuleEntry;
  readonly 'for-direction': ForDirection.RuleEntry;
  readonly 'func-name-matching': FuncNameMatching.RuleEntry;
  readonly 'func-names': FuncNames.RuleEntry;
  readonly 'func-style': FuncStyle.RuleEntry;
  readonly 'getter-return': GetterReturn.RuleEntry;
  readonly 'grouped-accessor-pairs': GroupedAccessorPairs.RuleEntry;
  readonly 'guard-for-in': GuardForIn.RuleEntry;
  readonly 'id-denylist': IdDenylist.RuleEntry;
  readonly 'id-length': IdLength.RuleEntry;
  readonly 'id-match': IdMatch.RuleEntry;
  readonly 'init-declarations': InitDeclarations.RuleEntry;
  readonly 'line-comment-position': LineCommentPosition.RuleEntry;
  readonly 'logical-assignment-operators': LogicalAssignmentOperators.RuleEntry;
  readonly 'max-classes-per-file': MaxClassesPerFile.RuleEntry;
  readonly 'max-depth': MaxDepth.RuleEntry;
  readonly 'max-lines': MaxLines.RuleEntry;
  readonly 'max-lines-per-function': MaxLinesPerFunction.RuleEntry;
  readonly 'max-nested-callbacks': MaxNestedCallbacks.RuleEntry;
  readonly 'max-params': MaxParams.RuleEntry;
  readonly 'max-statements': MaxStatements.RuleEntry;
  readonly 'multiline-comment-style': MultilineCommentStyle.RuleEntry;
  readonly 'new-cap': NewCap.RuleEntry;
  readonly 'no-alert': NoAlert.RuleEntry;
  readonly 'no-array-constructor': NoArrayConstructor.RuleEntry;
  readonly 'no-async-promise-executor': NoAsyncPromiseExecutor.RuleEntry;
  readonly 'no-await-in-loop': NoAwaitInLoop.RuleEntry;
  readonly 'no-bitwise': NoBitwise.RuleEntry;
  readonly 'no-caller': NoCaller.RuleEntry;
  readonly 'no-case-declarations': NoCaseDeclarations.RuleEntry;
  readonly 'no-class-assign': NoClassAssign.RuleEntry;
  readonly 'no-compare-neg-zero': NoCompareNegZero.RuleEntry;
  readonly 'no-cond-assign': NoCondAssign.RuleEntry;
  readonly 'no-console': NoConsole.RuleEntry;
  readonly 'no-const-assign': NoConstAssign.RuleEntry;
  readonly 'no-constant-binary-expression': NoConstantBinaryExpression.RuleEntry;
  readonly 'no-constant-condition': NoConstantCondition.RuleEntry;
  readonly 'no-constructor-return': NoConstructorReturn.RuleEntry;
  readonly 'no-continue': NoContinue.RuleEntry;
  readonly 'no-control-regex': NoControlRegex.RuleEntry;
  readonly 'no-debugger': NoDebugger.RuleEntry;
  readonly 'no-delete-var': NoDeleteVar.RuleEntry;
  readonly 'no-div-regex': NoDivRegex.RuleEntry;
  readonly 'no-dupe-args': NoDupeArgs.RuleEntry;
  readonly 'no-dupe-class-members': NoDupeClassMembers.RuleEntry;
  readonly 'no-dupe-else-if': NoDupeElseIf.RuleEntry;
  readonly 'no-dupe-keys': NoDupeKeys.RuleEntry;
  readonly 'no-duplicate-case': NoDuplicateCase.RuleEntry;
  readonly 'no-duplicate-imports': NoDuplicateImports.RuleEntry;
  readonly 'no-else-return': NoElseReturn.RuleEntry;
  readonly 'no-empty': NoEmpty.RuleEntry;
  readonly 'no-empty-character-class': NoEmptyCharacterClass.RuleEntry;
  readonly 'no-empty-function': NoEmptyFunction.RuleEntry;
  readonly 'no-empty-pattern': NoEmptyPattern.RuleEntry;
  readonly 'no-empty-static-block': NoEmptyStaticBlock.RuleEntry;
  readonly 'no-eq-null': NoEqNull.RuleEntry;
  readonly 'no-eval': NoEval.RuleEntry;
  readonly 'no-ex-assign': NoExAssign.RuleEntry;
  readonly 'no-extend-native': NoExtendNative.RuleEntry;
  readonly 'no-extra-bind': NoExtraBind.RuleEntry;
  readonly 'no-extra-boolean-cast': NoExtraBooleanCast.RuleEntry;
  readonly 'no-extra-label': NoExtraLabel.RuleEntry;
  readonly 'no-fallthrough': NoFallthrough.RuleEntry;
  readonly 'no-func-assign': NoFuncAssign.RuleEntry;
  readonly 'no-global-assign': NoGlobalAssign.RuleEntry;
  readonly 'no-implicit-coercion': NoImplicitCoercion.RuleEntry;
  readonly 'no-implicit-globals': NoImplicitGlobals.RuleEntry;
  readonly 'no-implied-eval': NoImpliedEval.RuleEntry;
  readonly 'no-import-assign': NoImportAssign.RuleEntry;
  readonly 'no-inline-comments': NoInlineComments.RuleEntry;
  readonly 'no-inner-declarations': NoInnerDeclarations.RuleEntry;
  readonly 'no-invalid-regexp': NoInvalidRegexp.RuleEntry;
  readonly 'no-invalid-this': NoInvalidThis.RuleEntry;
  readonly 'no-irregular-whitespace': NoIrregularWhitespace.RuleEntry;
  readonly 'no-iterator': NoIterator.RuleEntry;
  readonly 'no-label-var': NoLabelVar.RuleEntry;
  readonly 'no-labels': NoLabels.RuleEntry;
  readonly 'no-lone-blocks': NoLoneBlocks.RuleEntry;
  readonly 'no-lonely-if': NoLonelyIf.RuleEntry;
  readonly 'no-loop-func': NoLoopFunc.RuleEntry;
  readonly 'no-loss-of-precision': NoLossOfPrecision.RuleEntry;
  readonly 'no-magic-numbers': NoMagicNumbers.RuleEntry;
  readonly 'no-misleading-character-class': NoMisleadingCharacterClass.RuleEntry;
  readonly 'no-multi-assign': NoMultiAssign.RuleEntry;
  readonly 'no-multi-str': NoMultiStr.RuleEntry;
  readonly 'no-negated-condition': NoNegatedCondition.RuleEntry;
  readonly 'no-nested-ternary': NoNestedTernary.RuleEntry;
  readonly 'no-new': NoNew.RuleEntry;
  readonly 'no-new-func': NoNewFunc.RuleEntry;
  readonly 'no-new-native-nonconstructor': NoNewNativeNonconstructor.RuleEntry;
  readonly 'no-new-symbol': NoNewSymbol.RuleEntry;
  readonly 'no-new-wrappers': NoNewWrappers.RuleEntry;
  readonly 'no-nonoctal-decimal-escape': NoNonoctalDecimalEscape.RuleEntry;
  readonly 'no-obj-calls': NoObjCalls.RuleEntry;
  readonly 'no-object-constructor': NoObjectConstructor.RuleEntry;
  readonly 'no-octal': NoOctal.RuleEntry;
  readonly 'no-octal-escape': NoOctalEscape.RuleEntry;
  readonly 'no-param-reassign': NoParamReassign.RuleEntry;
  readonly 'no-plusplus': NoPlusplus.RuleEntry;
  readonly 'no-promise-executor-return': NoPromiseExecutorReturn.RuleEntry;
  readonly 'no-proto': NoProto.RuleEntry;
  readonly 'no-prototype-builtins': NoPrototypeBuiltins.RuleEntry;
  readonly 'no-redeclare': NoRedeclare.RuleEntry;
  readonly 'no-regex-spaces': NoRegexSpaces.RuleEntry;
  readonly 'no-restricted-exports': NoRestrictedExports.RuleEntry;
  readonly 'no-restricted-globals': NoRestrictedGlobals.RuleEntry;
  readonly 'no-restricted-imports': NoRestrictedImports.RuleEntry;
  readonly 'no-restricted-properties': NoRestrictedProperties.RuleEntry;
  readonly 'no-restricted-syntax': NoRestrictedSyntax.RuleEntry;
  readonly 'no-return-assign': NoReturnAssign.RuleEntry;
  readonly 'no-script-url': NoScriptUrl.RuleEntry;
  readonly 'no-self-assign': NoSelfAssign.RuleEntry;
  readonly 'no-self-compare': NoSelfCompare.RuleEntry;
  readonly 'no-sequences': NoSequences.RuleEntry;
  readonly 'no-setter-return': NoSetterReturn.RuleEntry;
  readonly 'no-shadow': NoShadow.RuleEntry;
  readonly 'no-shadow-restricted-names': NoShadowRestrictedNames.RuleEntry;
  readonly 'no-sparse-arrays': NoSparseArrays.RuleEntry;
  readonly 'no-template-curly-in-string': NoTemplateCurlyInString.RuleEntry;
  readonly 'no-ternary': NoTernary.RuleEntry;
  readonly 'no-this-before-super': NoThisBeforeSuper.RuleEntry;
  readonly 'no-throw-literal': NoThrowLiteral.RuleEntry;
  readonly 'no-undef': NoUndef.RuleEntry;
  readonly 'no-undef-init': NoUndefInit.RuleEntry;
  readonly 'no-undefined': NoUndefined.RuleEntry;
  readonly 'no-underscore-dangle': NoUnderscoreDangle.RuleEntry;
  readonly 'no-unexpected-multiline': NoUnexpectedMultiline.RuleEntry;
  readonly 'no-unmodified-loop-condition': NoUnmodifiedLoopCondition.RuleEntry;
  readonly 'no-unneeded-ternary': NoUnneededTernary.RuleEntry;
  readonly 'no-unreachable': NoUnreachable.RuleEntry;
  readonly 'no-unreachable-loop': NoUnreachableLoop.RuleEntry;
  readonly 'no-unsafe-finally': NoUnsafeFinally.RuleEntry;
  readonly 'no-unsafe-negation': NoUnsafeNegation.RuleEntry;
  readonly 'no-unsafe-optional-chaining': NoUnsafeOptionalChaining.RuleEntry;
  readonly 'no-unused-expressions': NoUnusedExpressions.RuleEntry;
  readonly 'no-unused-labels': NoUnusedLabels.RuleEntry;
  readonly 'no-unused-private-class-members': NoUnusedPrivateClassMembers.RuleEntry;
  readonly 'no-unused-vars': NoUnusedVars.RuleEntry;
  readonly 'no-use-before-define': NoUseBeforeDefine.RuleEntry;
  readonly 'no-useless-backreference': NoUselessBackreference.RuleEntry;
  readonly 'no-useless-call': NoUselessCall.RuleEntry;
  readonly 'no-useless-catch': NoUselessCatch.RuleEntry;
  readonly 'no-useless-computed-key': NoUselessComputedKey.RuleEntry;
  readonly 'no-useless-concat': NoUselessConcat.RuleEntry;
  readonly 'no-useless-constructor': NoUselessConstructor.RuleEntry;
  readonly 'no-useless-escape': NoUselessEscape.RuleEntry;
  readonly 'no-useless-rename': NoUselessRename.RuleEntry;
  readonly 'no-useless-return': NoUselessReturn.RuleEntry;
  readonly 'no-var': NoVar.RuleEntry;
  readonly 'no-void': NoVoid.RuleEntry;
  readonly 'no-warning-comments': NoWarningComments.RuleEntry;
  readonly 'no-with': NoWith.RuleEntry;
  readonly 'object-shorthand': ObjectShorthand.RuleEntry;
  readonly 'one-var': OneVar.RuleEntry;
  readonly 'operator-assignment': OperatorAssignment.RuleEntry;
  readonly 'prefer-arrow-callback': PreferArrowCallback.RuleEntry;
  readonly 'prefer-const': PreferConst.RuleEntry;
  readonly 'prefer-destructuring': PreferDestructuring.RuleEntry;
  readonly 'prefer-exponentiation-operator': PreferExponentiationOperator.RuleEntry;
  readonly 'prefer-named-capture-group': PreferNamedCaptureGroup.RuleEntry;
  readonly 'prefer-numeric-literals': PreferNumericLiterals.RuleEntry;
  readonly 'prefer-object-has-own': PreferObjectHasOwn.RuleEntry;
  readonly 'prefer-object-spread': PreferObjectSpread.RuleEntry;
  readonly 'prefer-promise-reject-errors': PreferPromiseRejectErrors.RuleEntry;
  readonly 'prefer-regex-literals': PreferRegexLiterals.RuleEntry;
  readonly 'prefer-rest-params': PreferRestParams.RuleEntry;
  readonly 'prefer-spread': PreferSpread.RuleEntry;
  readonly 'prefer-template': PreferTemplate.RuleEntry;
  readonly radix: Radix.RuleEntry;
  readonly 'require-atomic-updates': RequireAtomicUpdates.RuleEntry;
  readonly 'require-await': RequireAwait.RuleEntry;
  readonly 'require-unicode-regexp': RequireUnicodeRegexp.RuleEntry;
  readonly 'require-yield': RequireYield.RuleEntry;
  readonly 'sort-imports': SortImports.RuleEntry;
  readonly 'sort-keys': SortKeys.RuleEntry;
  readonly 'sort-vars': SortVars.RuleEntry;
  readonly strict: Strict.RuleEntry;
  readonly 'symbol-description': SymbolDescription.RuleEntry;
  readonly 'unicode-bom': UnicodeBom.RuleEntry;
  readonly 'use-isnan': UseIsnan.RuleEntry;
  readonly 'valid-typeof': ValidTypeof.RuleEntry;
  readonly 'vars-on-top': VarsOnTop.RuleEntry;
  readonly yoda: Yoda.RuleEntry;

  // deprecated
  readonly 'array-bracket-newline': ArrayBracketNewline.RuleEntry;
  readonly 'array-bracket-spacing': ArrayBracketSpacing.RuleEntry;
  readonly 'array-element-newline': ArrayElementNewline.RuleEntry;
  readonly 'arrow-parens': ArrowParens.RuleEntry;
  readonly 'arrow-spacing': ArrowSpacing.RuleEntry;
  readonly 'block-spacing': BlockSpacing.RuleEntry;
  readonly 'brace-style': BraceStyle.RuleEntry;
  readonly 'callback-return': CallbackReturn.RuleEntry;
  readonly 'comma-dangle': CommaDangle.RuleEntry;
  readonly 'comma-spacing': CommaSpacing.RuleEntry;
  readonly 'comma-style': CommaStyle.RuleEntry;
  readonly 'computed-property-spacing': ComputedPropertySpacing.RuleEntry;
  readonly 'dot-location': DotLocation.RuleEntry;
  readonly 'eol-last': EolLast.RuleEntry;
  readonly 'func-call-spacing': FuncCallSpacing.RuleEntry;
  readonly 'function-call-argument-newline': FunctionCallArgumentNewline.RuleEntry;
  readonly 'function-paren-newline': FunctionParenNewline.RuleEntry;
  readonly 'generator-star-spacing': GeneratorStarSpacing.RuleEntry;
  readonly 'global-require': GlobalRequire.RuleEntry;
  readonly 'handle-callback-err': HandleCallbackErr.RuleEntry;
  readonly 'id-blacklist': IdBlacklist.RuleEntry;
  readonly 'implicit-arrow-linebreak': ImplicitArrowLinebreak.RuleEntry;
  readonly indent: Indent.RuleEntry;
  readonly 'indent-legacy': IndentLegacy.RuleEntry;
  readonly 'jsx-quotes': JsxQuotes.RuleEntry;
  readonly 'key-spacing': KeySpacing.RuleEntry;
  readonly 'keyword-spacing': KeywordSpacing.RuleEntry;
  readonly 'linebreak-style': LinebreakStyle.RuleEntry;
  readonly 'lines-around-comment': LinesAroundComment.RuleEntry;
  readonly 'lines-around-directive': LinesAroundDirective.RuleEntry;
  readonly 'lines-between-class-members': LinesBetweenClassMembers.RuleEntry;
  readonly 'max-len': MaxLen.RuleEntry;
  readonly 'max-statements-per-line': MaxStatementsPerLine.RuleEntry;
  readonly 'multiline-ternary': MultilineTernary.RuleEntry;
  readonly 'new-parens': NewParens.RuleEntry;
  readonly 'newline-after-var': NewlineAfterVar.RuleEntry;
  readonly 'newline-before-return': NewlineBeforeReturn.RuleEntry;
  readonly 'newline-per-chained-call': NewlinePerChainedCall.RuleEntry;
  readonly 'no-buffer-constructor': NoBufferConstructor.RuleEntry;
  readonly 'no-catch-shadow': NoCatchShadow.RuleEntry;
  readonly 'no-confusing-arrow': NoConfusingArrow.RuleEntry;
  readonly 'no-extra-parens': NoExtraParens.RuleEntry;
  readonly 'no-extra-semi': NoExtraSemi.RuleEntry;
  readonly 'no-floating-decimal': NoFloatingDecimal.RuleEntry;
  readonly 'no-mixed-operators': NoMixedOperators.RuleEntry;
  readonly 'no-mixed-requires': NoMixedRequires.RuleEntry;
  readonly 'no-mixed-spaces-and-tabs': NoMixedSpacesAndTabs.RuleEntry;
  readonly 'no-multi-spaces': NoMultiSpaces.RuleEntry;
  readonly 'no-multiple-empty-lines': NoMultipleEmptyLines.RuleEntry;
  readonly 'no-native-reassign': NoNativeReassign.RuleEntry;
  readonly 'no-negated-in-lhs': NoNegatedInLhs.RuleEntry;
  readonly 'no-new-object': NoNewObject.RuleEntry;
  readonly 'no-new-require': NoNewRequire.RuleEntry;
  readonly 'no-path-concat': NoPathConcat.RuleEntry;
  readonly 'no-process-env': NoProcessEnv.RuleEntry;
  readonly 'no-process-exit': NoProcessExit.RuleEntry;
  readonly 'no-restricted-modules': NoRestrictedModules.RuleEntry;
  readonly 'no-return-await': NoReturnAwait.RuleEntry;
  readonly 'no-spaced-func': NoSpacedFunc.RuleEntry;
  readonly 'no-sync': NoSync.RuleEntry;
  readonly 'no-tabs': NoTabs.RuleEntry;
  readonly 'no-trailing-spaces': NoTrailingSpaces.RuleEntry;
  readonly 'no-whitespace-before-property': NoWhitespaceBeforeProperty.RuleEntry;
  readonly 'nonblock-statement-body-position': NonblockStatementBodyPosition.RuleEntry;
  readonly 'object-curly-newline': ObjectCurlyNewline.RuleEntry;
  readonly 'object-curly-spacing': ObjectCurlySpacing.RuleEntry;
  readonly 'object-property-newline': ObjectPropertyNewline.RuleEntry;
  readonly 'one-var-declaration-per-line': OneVarDeclarationPerLine.RuleEntry;
  readonly 'operator-linebreak': OperatorLinebreak.RuleEntry;
  readonly 'padded-blocks': PaddedBlocks.RuleEntry;
  readonly 'padding-line-between-statements': PaddingLineBetweenStatements.RuleEntry;
  readonly 'prefer-reflect': PreferReflect.RuleEntry;
  readonly 'quote-props': QuoteProps.RuleEntry;
  readonly quotes: Quotes.RuleEntry;
  readonly 'require-jsdoc': RequireJsdoc.RuleEntry;
  readonly 'rest-spread-spacing': RestSpreadSpacing.RuleEntry;
  readonly semi: Semi.RuleEntry;
  readonly 'semi-spacing': SemiSpacing.RuleEntry;
  readonly 'semi-style': SemiStyle.RuleEntry;
  readonly 'space-before-blocks': SpaceBeforeBlocks.RuleEntry;
  readonly 'space-before-function-paren': SpaceBeforeFunctionParen.RuleEntry;
  readonly 'space-in-parens': SpaceInParens.RuleEntry;
  readonly 'space-infix-ops': SpaceInfixOps.RuleEntry;
  readonly 'space-unary-ops': SpaceUnaryOps.RuleEntry;
  readonly 'spaced-comment': SpacedComment.RuleEntry;
  readonly 'switch-colon-spacing': SwitchColonSpacing.RuleEntry;
  readonly 'template-curly-spacing': TemplateCurlySpacing.RuleEntry;
  readonly 'template-tag-spacing': TemplateTagSpacing.RuleEntry;
  readonly 'valid-jsdoc': ValidJsdoc.RuleEntry;
  readonly 'wrap-iife': WrapIife.RuleEntry;
  readonly 'wrap-regex': WrapRegex.RuleEntry;
  readonly 'yield-star-spacing': YieldStarSpacing.RuleEntry;
};

export type EslintRulesOption = {
  readonly 'accessor-pairs': AccessorPairs.Options;
  readonly 'array-callback-return': ArrayCallbackReturn.Options;
  readonly 'arrow-body-style': ArrowBodyStyle.Options;
  readonly camelcase: Camelcase.Options;
  readonly 'capitalized-comments': readonly [
    CapitalizedComments.Options0,
    CapitalizedComments.Options1,
  ];
  readonly 'class-methods-use-this': ClassMethodsUseThis.Options;
  readonly complexity: Complexity.Options;
  readonly 'consistent-return': ConsistentReturn.Options;
  readonly 'consistent-this': ConsistentThis.Options;
  readonly curly: Curly.Options;
  readonly 'default-case': DefaultCase.Options;
  readonly 'dot-notation': DotNotation.Options;
  readonly eqeqeq: Eqeqeq.Options;
  readonly 'func-name-matching': FuncNameMatching.Options;
  readonly 'func-names': FuncNames.Options;
  readonly 'func-style': readonly [FuncStyle.Options0, FuncStyle.Options1];
  readonly 'getter-return': GetterReturn.Options;
  readonly 'grouped-accessor-pairs': GroupedAccessorPairs.Options;
  readonly 'id-denylist': IdDenylist.Options;
  readonly 'id-length': IdLength.Options;
  readonly 'id-match': readonly [IdMatch.Options0, IdMatch.Options1];
  readonly 'init-declarations': InitDeclarations.Options;
  readonly 'line-comment-position': LineCommentPosition.Options;
  readonly 'logical-assignment-operators': LogicalAssignmentOperators.Options;
  readonly 'max-classes-per-file': MaxClassesPerFile.Options;
  readonly 'max-depth': MaxDepth.Options;
  readonly 'max-lines': MaxLines.Options;
  readonly 'max-lines-per-function': MaxLinesPerFunction.Options;
  readonly 'max-nested-callbacks': MaxNestedCallbacks.Options;
  readonly 'max-params': MaxParams.Options;
  readonly 'max-statements': readonly [
    MaxStatements.Options0,
    MaxStatements.Options1,
  ];
  readonly 'multiline-comment-style': MultilineCommentStyle.Options;
  readonly 'new-cap': NewCap.Options;
  readonly 'no-bitwise': NoBitwise.Options;
  readonly 'no-cond-assign': NoCondAssign.Options;
  readonly 'no-console': NoConsole.Options;
  readonly 'no-constant-condition': NoConstantCondition.Options;
  readonly 'no-constructor-return': NoConstructorReturn.Options;
  readonly 'no-duplicate-imports': NoDuplicateImports.Options;
  readonly 'no-else-return': NoElseReturn.Options;
  readonly 'no-empty': NoEmpty.Options;
  readonly 'no-empty-function': NoEmptyFunction.Options;
  readonly 'no-empty-pattern': NoEmptyPattern.Options;
  readonly 'no-eval': NoEval.Options;
  readonly 'no-extend-native': NoExtendNative.Options;
  readonly 'no-extra-boolean-cast': NoExtraBooleanCast.Options;
  readonly 'no-fallthrough': NoFallthrough.Options;
  readonly 'no-global-assign': NoGlobalAssign.Options;
  readonly 'no-implicit-coercion': NoImplicitCoercion.Options;
  readonly 'no-implicit-globals': NoImplicitGlobals.Options;
  readonly 'no-inline-comments': NoInlineComments.Options;
  readonly 'no-inner-declarations': NoInnerDeclarations.Options;
  readonly 'no-invalid-regexp': NoInvalidRegexp.Options;
  readonly 'no-invalid-this': NoInvalidThis.Options;
  readonly 'no-irregular-whitespace': NoIrregularWhitespace.Options;
  readonly 'no-labels': NoLabels.Options;
  readonly 'no-magic-numbers': NoMagicNumbers.Options;
  readonly 'no-multi-assign': NoMultiAssign.Options;
  readonly 'no-param-reassign': NoParamReassign.Options;
  readonly 'no-plusplus': NoPlusplus.Options;
  readonly 'no-promise-executor-return': NoPromiseExecutorReturn.Options;
  readonly 'no-redeclare': NoRedeclare.Options;
  readonly 'no-restricted-exports': NoRestrictedExports.Options;
  readonly 'no-restricted-globals': NoRestrictedGlobals.Options;
  readonly 'no-restricted-imports': NoRestrictedImports.Options;
  readonly 'no-restricted-properties': NoRestrictedProperties.Options;
  readonly 'no-restricted-syntax': NoRestrictedSyntax.Options;
  readonly 'no-return-assign': NoReturnAssign.Options;
  readonly 'no-self-assign': NoSelfAssign.Options;
  readonly 'no-sequences': NoSequences.Options;
  readonly 'no-shadow': NoShadow.Options;
  readonly 'no-undef': NoUndef.Options;
  readonly 'no-underscore-dangle': NoUnderscoreDangle.Options;
  readonly 'no-unneeded-ternary': NoUnneededTernary.Options;
  readonly 'no-unreachable-loop': NoUnreachableLoop.Options;
  readonly 'no-unsafe-negation': NoUnsafeNegation.Options;
  readonly 'no-unsafe-optional-chaining': NoUnsafeOptionalChaining.Options;
  readonly 'no-unused-expressions': NoUnusedExpressions.Options;
  readonly 'no-unused-vars': NoUnusedVars.Options;
  readonly 'no-use-before-define': NoUseBeforeDefine.Options;
  readonly 'no-useless-computed-key': NoUselessComputedKey.Options;
  readonly 'no-useless-rename': NoUselessRename.Options;
  readonly 'no-void': NoVoid.Options;
  readonly 'no-warning-comments': NoWarningComments.Options;
  readonly 'object-shorthand': ObjectShorthand.Options;
  readonly 'one-var': OneVar.Options;
  readonly 'operator-assignment': OperatorAssignment.Options;
  readonly 'prefer-arrow-callback': PreferArrowCallback.Options;
  readonly 'prefer-const': PreferConst.Options;
  readonly 'prefer-destructuring': readonly [
    PreferDestructuring.Options0,
    PreferDestructuring.Options1,
  ];
  readonly 'prefer-promise-reject-errors': PreferPromiseRejectErrors.Options;
  readonly 'prefer-regex-literals': PreferRegexLiterals.Options;
  readonly radix: Radix.Options;
  readonly 'require-atomic-updates': RequireAtomicUpdates.Options;
  readonly 'sort-imports': SortImports.Options;
  readonly 'sort-keys': readonly [SortKeys.Options0, SortKeys.Options1];
  readonly 'sort-vars': SortVars.Options;
  readonly strict: Strict.Options;
  readonly 'unicode-bom': UnicodeBom.Options;
  readonly 'use-isnan': UseIsnan.Options;
  readonly 'valid-typeof': ValidTypeof.Options;
  readonly yoda: readonly [Yoda.Options0, Yoda.Options1];
};
