/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Enforce getter and setter pairs in objects and classes
 *
 * @link https://eslint.org/docs/latest/rules/accessor-pairs
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       },
   *       "setWithoutGet": {
   *         "type": "boolean"
   *       },
   *       "enforceForClassMembers": {
   *         "type": "boolean"
   *       },
   *       "enforceForTSTypes": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    getWithoutSet?: boolean;
    setWithoutGet?: boolean;
    enforceForClassMembers?: boolean;
    enforceForTSTypes?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated     | false   |
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
   *         "type": "boolean"
   *       },
   *       "checkForEach": {
   *         "type": "boolean"
   *       },
   *       "allowVoid": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowImplicit?: boolean;
    checkForEach?: boolean;
    allowVoid?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
    | readonly []
    | readonly ['always' | 'never']
    | readonly ['as-needed']
    | readonly [
        'as-needed',
        Readonly<{
          requireReturnForObjectLiteral?: boolean;
        }>,
      ];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace BlockScopedVar {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       },
   *       "ignoreImports": {
   *         "type": "boolean"
   *       },
   *       "ignoreGlobals": {
   *         "type": "boolean"
   *       },
   *       "properties": {
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       },
   *       "allow": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "minItems": 0,
   *         "uniqueItems": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    ignoreDestructuring?: boolean;
    ignoreImports?: boolean;
    ignoreGlobals?: boolean;
    properties?: 'always' | 'never';
    /** @minItems 0 */
    allow?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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

  export type Options1 = Readonly<
    | {
        ignorePattern?: string;
        ignoreInlineComments?: boolean;
        ignoreConsecutiveComments?: boolean;
      }
    | {
        line?: Readonly<{
          ignorePattern?: string;
          ignoreInlineComments?: boolean;
          ignoreConsecutiveComments?: boolean;
        }>;
        block?: Readonly<{
          ignorePattern?: string;
          ignoreInlineComments?: boolean;
          ignoreConsecutiveComments?: boolean;
        }>;
      }
  >;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       },
   *       "ignoreOverrideMethods": {
   *         "type": "boolean"
   *       },
   *       "ignoreClassesWithImplements": {
   *         "enum": [
   *           "all",
   *           "public-fields"
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    exceptMethods?: readonly string[];
    enforceForClassFields?: boolean;
    ignoreOverrideMethods?: boolean;
    ignoreClassesWithImplements?: 'all' | 'public-fields';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
   *           },
   *           "variant": {
   *             "enum": [
   *               "classic",
   *               "modified"
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
    | number
    | Readonly<{
        maximum?: number;
        max?: number;
        variant?: 'classic' | 'modified';
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    treatUndefinedAsUnspecified?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace ConstructorSuper {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
    | readonly []
    | readonly ['all']
    | readonly ['multi' | 'multi-line' | 'multi-or-nest']
    | readonly ['multi' | 'multi-line' | 'multi-or-nest', 'consistent'];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
  export type Options = Readonly<{
    commentPattern?: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce `default` clauses in `switch` statements to be last
 *
 * @link https://eslint.org/docs/latest/rules/default-case-last
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace DefaultCaseLast {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace DefaultParamLast {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       },
   *       "allowPattern": {
   *         "type": "string"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowKeywords?: boolean;
    allowPattern?: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
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
    | readonly []
    | readonly ['always']
    | readonly [
        'always',
        Readonly<{
          null?: 'always' | 'never' | 'ignore';
        }>,
      ]
    | readonly ['smart' | 'allow-null'];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce `for` loop update clause moving the counter in the right direction
 *
 * @link https://eslint.org/docs/latest/rules/for-direction
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace ForDirection {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
    | readonly []
    | readonly ['always' | 'never']
    | readonly [
        'always' | 'never',
        Readonly<{
          considerPropertyDescriptor?: boolean;
          includeCommonJSModuleExports?: boolean;
        }>,
      ]
    | readonly [
        Readonly<{
          considerPropertyDescriptor?: boolean;
          includeCommonJSModuleExports?: boolean;
        }>,
      ];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
    | readonly []
    | readonly [Value]
    | readonly [
        Value,
        Readonly<{
          generators?: Value;
        }>,
      ];

  export type Value = 'always' | 'as-needed' | 'never';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce the consistent use of either `function` declarations or expressions
 * assigned to variables
 *
 * @link https://eslint.org/docs/latest/rules/func-style
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       },
   *       "allowTypeAnnotation": {
   *         "type": "boolean"
   *       },
   *       "overrides": {
   *         "type": "object",
   *         "properties": {
   *           "namedExports": {
   *             "enum": [
   *               "declaration",
   *               "expression",
   *               "ignore"
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
  export type Options0 = 'declaration' | 'expression';

  export type Options1 = Readonly<{
    allowArrowFunctions?: boolean;
    allowTypeAnnotation?: boolean;
    overrides?: Readonly<{
      namedExports?: 'declaration' | 'expression' | 'ignore';
    }>;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
 *  | deprecated  | false   |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowImplicit?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "enforceForTSTypes": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options0 = 'anyOrder' | 'getBeforeSet' | 'setBeforeGet';

  export type Options1 = Readonly<{
    enforceForTSTypes?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace GuardForIn {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
   *         "type": "integer"
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
  export type Options = Readonly<{
    min?: number;
    max?: number;
    exceptions?: readonly string[];
    exceptionPatterns?: readonly string[];
    properties?: 'always' | 'never';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
 *  | deprecated  | false      |
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
    | readonly []
    | readonly ['always']
    | readonly ['never']
    | readonly [
        'never',
        Readonly<{
          ignoreForLoopInit?: boolean;
        }>,
      ];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | true   |
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
  export type RuleEntry = 0;
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
 *  | deprecated     | false      |
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
  export type Options =
    | readonly []
    | readonly ['always']
    | readonly [
        'always',
        Readonly<{
          enforceForIfStatements?: boolean;
        }>,
      ]
    | readonly ['never'];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
    | Readonly<{
        ignoreExpressions?: boolean;
        max?: number;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
    | Readonly<{
        maximum?: number;
        max?: number;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
    | Readonly<{
        max?: number;
        skipComments?: boolean;
        skipBlankLines?: boolean;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
    | Readonly<{
        max?: number;
        skipComments?: boolean;
        skipBlankLines?: boolean;
        IIFEs?: boolean;
      }>
    | number;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
    | Readonly<{
        maximum?: number;
        max?: number;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
   *           },
   *           "countVoidThis": {
   *             "type": "boolean",
   *             "description": "Whether to count a `this` declaration when the type is `void`."
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
    | Readonly<{
        maximum?: number;
        max?: number;
        /** Whether to count a `this` declaration when the type is `void`. */
        countVoidThis?: boolean;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
    | Readonly<{
        maximum?: number;
        max?: number;
      }>;

  export type Options1 = Readonly<{
    ignoreTopLevelFunctions?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
 *  | deprecated  | true       |
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
  export type RuleEntry = 0;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       },
   *       "capIsNew": {
   *         "type": "boolean"
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    newIsCap?: boolean;
    capIsNew?: boolean;
    newIsCapExceptions?: readonly string[];
    newIsCapExceptionPattern?: string;
    capIsNewExceptions?: readonly string[];
    capIsNewExceptionPattern?: string;
    properties?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoAlert {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 *  ```
 */
namespace NoArrayConstructor {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoAsyncPromiseExecutor {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | false   |
 *  ```
 */
namespace NoAwaitInLoop {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allow?: readonly (
      | '^'
      | '|'
      | '&'
      | '<<'
      | '>>'
      | '>>>'
      | '^='
      | '|='
      | '&='
      | '<<='
      | '>>='
      | '>>>='
      | '~'
    )[];
    int32Hint?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoCaller {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow lexical declarations in case clauses
 *
 * @link https://eslint.org/docs/latest/rules/no-case-declarations
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
namespace NoCaseDeclarations {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoClassAssign {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow comparing against `-0`
 *
 * @link https://eslint.org/docs/latest/rules/no-compare-neg-zero
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoCompareNegZero {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
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
  export type Options = 'except-parens' | 'always';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated     | false      |
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
  export type Options = Readonly<{
    /** @minItems 1 */
    allow?: readonly [string, ...string[]];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow reassigning `const`, `using`, and `await using` variables
 *
 * @link https://eslint.org/docs/latest/rules/no-const-assign
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoConstAssign {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoConstantBinaryExpression {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
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
   *         "enum": [
   *           "all",
   *           "allExceptWhileTrue",
   *           "none",
   *           true,
   *           false
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    checkLoops?: 'all' | 'allExceptWhileTrue' | 'none' | true | false;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
 *  | recommended | false   |
 *  ```
 */
namespace NoConstructorReturn {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoContinue {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoControlRegex {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoDebugger {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | true       |
 *  ```
 */
namespace NoDeleteVar {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoDivRegex {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoDupeArgs {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoDupeClassMembers {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoDupeElseIf {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoDupeKeys {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoDuplicateCase {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
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
   *         "type": "boolean"
   *       },
   *       "allowSeparateTypeImports": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    includeExports?: boolean;
    allowSeparateTypeImports?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowElseIf?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated     | false      |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowEmptyCatch?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoEmptyCharacterClass {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow empty functions
 *
 * @link https://eslint.org/docs/latest/rules/no-empty-function
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
   *             "asyncMethods",
   *             "privateConstructors",
   *             "protectedConstructors",
   *             "decoratedFunctions",
   *             "overrideMethods"
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
  export type Options = Readonly<{
    allow?: readonly (
      | 'functions'
      | 'arrowFunctions'
      | 'generatorFunctions'
      | 'methods'
      | 'generatorMethods'
      | 'getters'
      | 'setters'
      | 'constructors'
      | 'asyncFunctions'
      | 'asyncMethods'
      | 'privateConstructors'
      | 'protectedConstructors'
      | 'decoratedFunctions'
      | 'overrideMethods'
    )[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowObjectPatternsAsParameters?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow empty static blocks
 *
 * @link https://eslint.org/docs/latest/rules/no-empty-static-block
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
namespace NoEmptyStaticBlock {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoEqNull {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowIndirect?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoExAssign {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
  export type Options = Readonly<{
    exceptions?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoExtraBind {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
   *     "anyOf": [
   *       {
   *         "type": "object",
   *         "properties": {
   *           "enforceForInnerExpressions": {
   *             "type": "boolean"
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "enforceForLogicalOperands": {
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
        enforceForInnerExpressions?: boolean;
      }
    | {
        enforceForLogicalOperands?: boolean;
      }
  >;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoExtraLabel {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | recommended | false      |
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
 *  | deprecated  | false   |
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
   *         "type": "string"
   *       },
   *       "allowEmptyCase": {
   *         "type": "boolean"
   *       },
   *       "reportUnusedFallthroughComment": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    commentPattern?: string;
    allowEmptyCase?: boolean;
    reportUnusedFallthroughComment?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoFuncAssign {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
  export type Options = Readonly<{
    exceptions?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow shorthand type conversions
 *
 * @link https://eslint.org/docs/latest/rules/no-implicit-coercion
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
   *         "type": "boolean"
   *       },
   *       "number": {
   *         "type": "boolean"
   *       },
   *       "string": {
   *         "type": "boolean"
   *       },
   *       "disallowTemplateShorthand": {
   *         "type": "boolean"
   *       },
   *       "allow": {
   *         "type": "array",
   *         "items": {
   *           "enum": [
   *             "~",
   *             "!!",
   *             "+",
   *             "- -",
   *             "-",
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
  export type Options = Readonly<{
    boolean?: boolean;
    number?: boolean;
    string?: boolean;
    disallowTemplateShorthand?: boolean;
    allow?: readonly ('~' | '!!' | '+' | '- -' | '-' | '*')[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    lexicalBindings?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoImpliedEval {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoImportAssign {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
  export type Options = Readonly<{
    ignorePattern?: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
 *  | recommended | false   |
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
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "blockScopedFunctions": {
   *         "enum": [
   *           "allow",
   *           "disallow"
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options0 = 'functions' | 'both';

  export type Options1 = Readonly<{
    blockScopedFunctions?: 'allow' | 'disallow';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
 *  | deprecated  | false   |
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
  export type Options = Readonly<{
    allowConstructorFlags?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    capIsConstructor?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
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
   *         "type": "boolean"
   *       },
   *       "skipStrings": {
   *         "type": "boolean"
   *       },
   *       "skipTemplates": {
   *         "type": "boolean"
   *       },
   *       "skipRegExps": {
   *         "type": "boolean"
   *       },
   *       "skipJSXText": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    skipComments?: boolean;
    skipStrings?: boolean;
    skipTemplates?: boolean;
    skipRegExps?: boolean;
    skipJSXText?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoIterator {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoLabelVar {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       },
   *       "allowSwitch": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowLoop?: boolean;
    allowSwitch?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoLoneBlocks {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoLonelyIf {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoLoopFunc {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoLossOfPrecision {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
   *       },
   *       "ignoreEnums": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "ignoreNumericLiteralTypes": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "ignoreReadonlyClassProperties": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "ignoreTypeIndexes": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** @default false */
    detectObjects?: boolean;
    /** @default false */
    enforceConst?: boolean;
    ignore?: readonly (number | string)[];
    /** @default false */
    ignoreArrayIndexes?: boolean;
    /** @default false */
    ignoreDefaultValues?: boolean;
    /** @default false */
    ignoreClassFieldInitialValues?: boolean;
    /** @default false */
    ignoreEnums?: boolean;
    /** @default false */
    ignoreNumericLiteralTypes?: boolean;
    /** @default false */
    ignoreReadonlyClassProperties?: boolean;
    /** @default false */
    ignoreTypeIndexes?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated     | false   |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace NoMisleadingCharacterClass {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowEscape": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowEscape?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | recommended | false  |
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    ignoreNonDeclaration?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoMultiStr {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoNegatedCondition {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoNestedTernary {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoNew {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoNewFunc {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoNewNativeNonconstructor {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | true    |
 *  | recommended | false   |
 *  ```
 */
namespace NoNewSymbol {
  export type RuleEntry = 0;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoNewWrappers {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoNonoctalDecimalEscape {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoObjCalls {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 *  ```
 */
namespace NoObjectConstructor {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | true       |
 *  ```
 */
namespace NoOctal {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoOctalEscape {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow reassigning function parameters
 *
 * @link https://eslint.org/docs/latest/rules/no-param-reassign
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
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
  export type Options = Readonly<
    | {
        props?: false;
      }
    | {
        props?: true;
        ignorePropertyModificationsFor?: readonly string[];
        ignorePropertyModificationsForRegex?: readonly string[];
      }
  >;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowForLoopAfterthoughts?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated     | false   |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowVoid?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoProto {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated     | false   |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace NoPrototypeBuiltins {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    builtinGlobals?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoRegexSpaces {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
   *           },
   *           "restrictedNamedExportsPattern": {
   *             "type": "string"
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
   *           "restrictedNamedExportsPattern": {
   *             "type": "string"
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
  export type Options = Readonly<
    | {
        restrictedNamedExports?: readonly string[];
        restrictedNamedExportsPattern?: string;
      }
    | {
        restrictedNamedExports?: readonly string[];
        restrictedNamedExportsPattern?: string;
        restrictDefaultExports?: Readonly<{
          direct?: boolean;
          named?: boolean;
          defaultFrom?: boolean;
          namedFrom?: boolean;
          namespaceFrom?: boolean;
        }>;
      }
  >;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoRestrictedGlobals {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "anyOf": [
   *     {
   *       "type": "array",
   *       "items": {
   *         "oneOf": [
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
   *                 "type": "string"
   *               }
   *             },
   *             "required": ["name"],
   *             "additionalProperties": false
   *           }
   *         ]
   *       },
   *       "uniqueItems": true,
   *       "minItems": 0
   *     },
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "type": "object",
   *           "properties": {
   *             "globals": {
   *               "type": "array",
   *               "items": {
   *                 "oneOf": [
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
   *                         "type": "string"
   *                       }
   *                     },
   *                     "required": ["name"],
   *                     "additionalProperties": false
   *                   }
   *                 ]
   *               },
   *               "uniqueItems": true,
   *               "minItems": 0
   *             },
   *             "checkGlobalObject": {
   *               "type": "boolean"
   *             },
   *             "globalObjects": {
   *               "type": "array",
   *               "items": {
   *                 "type": "string"
   *               },
   *               "uniqueItems": true
   *             }
   *           },
   *           "required": ["globals"],
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
        | Readonly<{
            name: string;
            message?: string;
          }>
      )[]
    | readonly [
        Readonly<{
          /** @minItems 0 */
          globals: readonly (
            | string
            | Readonly<{
                name: string;
                message?: string;
              }>
          )[];
          checkGlobalObject?: boolean;
          globalObjects?: readonly string[];
        }>,
      ];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
   *               },
   *               "allowImportNames": {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string"
   *                 }
   *               },
   *               "allowTypeImports": {
   *                 "type": "boolean",
   *                 "description": "Whether to allow type-only imports for a path."
   *               }
   *             },
   *             "additionalProperties": false,
   *             "required": ["name"],
   *             "not": {
   *               "required": ["importNames", "allowImportNames"]
   *             }
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
   *                       },
   *                       "allowImportNames": {
   *                         "type": "array",
   *                         "items": {
   *                           "type": "string"
   *                         }
   *                       },
   *                       "allowTypeImports": {
   *                         "type": "boolean",
   *                         "description": "Whether to allow type-only imports for a path."
   *                       }
   *                     },
   *                     "additionalProperties": false,
   *                     "required": ["name"],
   *                     "not": {
   *                       "required": ["importNames", "allowImportNames"]
   *                     }
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
   *                       "allowImportNames": {
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
   *                       "regex": {
   *                         "type": "string"
   *                       },
   *                       "importNamePattern": {
   *                         "type": "string"
   *                       },
   *                       "allowImportNamePattern": {
   *                         "type": "string"
   *                       },
   *                       "message": {
   *                         "type": "string",
   *                         "minLength": 1
   *                       },
   *                       "caseSensitive": {
   *                         "type": "boolean"
   *                       },
   *                       "allowTypeImports": {
   *                         "type": "boolean",
   *                         "description": "Whether to allow type-only imports for a pattern."
   *                       }
   *                     },
   *                     "additionalProperties": false,
   *                     "not": {
   *                       "anyOf": [
   *                         {
   *                           "required": [
   *                             "importNames",
   *                             "allowImportNames"
   *                           ]
   *                         },
   *                         {
   *                           "required": [
   *                             "importNamePattern",
   *                             "allowImportNamePattern"
   *                           ]
   *                         },
   *                         {
   *                           "required": [
   *                             "importNames",
   *                             "allowImportNamePattern"
   *                           ]
   *                         },
   *                         {
   *                           "required": [
   *                             "importNamePattern",
   *                             "allowImportNames"
   *                           ]
   *                         },
   *                         {
   *                           "required": [
   *                             "allowImportNames",
   *                             "allowImportNamePattern"
   *                           ]
   *                         }
   *                       ]
   *                     },
   *                     "oneOf": [
   *                       {
   *                         "required": ["group"]
   *                       },
   *                       {
   *                         "required": ["regex"]
   *                       }
   *                     ]
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
        | Readonly<{
            name: string;
            message?: string;
            importNames?: readonly string[];
            allowImportNames?: readonly string[];
            /** Whether to allow type-only imports for a path. */
            allowTypeImports?: boolean;
          }>
      )[]
    | readonly [
        Readonly<{
          paths?: readonly (
            | string
            | Readonly<{
                name: string;
                message?: string;
                importNames?: readonly string[];
                allowImportNames?: readonly string[];
                /** Whether to allow type-only imports for a path. */
                allowTypeImports?: boolean;
              }>
          )[];
          patterns?:
            | readonly string[]
            | readonly Readonly<Record<string, unknown>>[];
        }>,
      ];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
   *     "type": "object",
   *     "properties": {
   *       "object": {
   *         "type": "string"
   *       },
   *       "property": {
   *         "type": "string"
   *       },
   *       "allowObjects": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true
   *       },
   *       "allowProperties": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true
   *       },
   *       "message": {
   *         "type": "string"
   *       }
   *     },
   *     "anyOf": [
   *       {
   *         "required": ["object"]
   *       },
   *       {
   *         "required": ["property"]
   *       }
   *     ],
   *     "not": {
   *       "anyOf": [
   *         {
   *           "required": ["allowObjects", "object"]
   *         },
   *         {
   *           "required": ["allowProperties", "property"]
   *         }
   *       ]
   *     },
   *     "additionalProperties": false
   *   },
   *   "uniqueItems": true
   * }
   * ```
   */
  export type Options = readonly Readonly<Record<string, unknown>>[];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
    | Readonly<{
        selector: string;
        message?: string;
      }>
  )[];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
  export type Options = 'except-parens' | 'always';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 * Disallow `javascript:` URLs
 *
 * @link https://eslint.org/docs/latest/rules/no-script-url
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoScriptUrl {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    props?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
 *  | recommended | false   |
 *  ```
 */
namespace NoSelfCompare {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
   *     "type": "object",
   *     "properties": {
   *       "allowInParentheses": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowInParentheses?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoSetterReturn {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       },
   *       "hoist": {
   *         "enum": [
   *           "all",
   *           "functions",
   *           "never",
   *           "types",
   *           "functions-and-types"
   *         ]
   *       },
   *       "allow": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "ignoreOnInitialization": {
   *         "type": "boolean"
   *       },
   *       "ignoreTypeValueShadow": {
   *         "type": "boolean"
   *       },
   *       "ignoreFunctionTypeParameterNameValueShadow": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    builtinGlobals?: boolean;
    hoist?: 'all' | 'functions' | 'never' | 'types' | 'functions-and-types';
    allow?: readonly string[];
    ignoreOnInitialization?: boolean;
    ignoreTypeValueShadow?: boolean;
    ignoreFunctionTypeParameterNameValueShadow?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | recommended | true       |
 *  ```
 */
namespace NoShadowRestrictedNames {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "reportGlobalThis": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    reportGlobalThis?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoSparseArrays {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | false   |
 *  ```
 */
namespace NoTemplateCurlyInString {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoTernary {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoThisBeforeSuper {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoThrowLiteral {
  export type RuleEntry = Linter.StringSeverity;
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
 * Disallow `let` or `var` variables that are read but never assigned
 *
 * @link https://eslint.org/docs/latest/rules/no-unassigned-vars
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | false   |
 *  ```
 */
namespace NoUnassignedVars {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    typeof?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoUndefInit {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoUndefined {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       },
   *       "allowAfterSuper": {
   *         "type": "boolean"
   *       },
   *       "allowAfterThisConstructor": {
   *         "type": "boolean"
   *       },
   *       "enforceInMethodNames": {
   *         "type": "boolean"
   *       },
   *       "allowFunctionParams": {
   *         "type": "boolean"
   *       },
   *       "enforceInClassFields": {
   *         "type": "boolean"
   *       },
   *       "allowInArrayDestructuring": {
   *         "type": "boolean"
   *       },
   *       "allowInObjectDestructuring": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allow?: readonly string[];
    allowAfterThis?: boolean;
    allowAfterSuper?: boolean;
    allowAfterThisConstructor?: boolean;
    enforceInMethodNames?: boolean;
    allowFunctionParams?: boolean;
    enforceInClassFields?: boolean;
    allowInArrayDestructuring?: boolean;
    allowInObjectDestructuring?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnexpectedMultiline {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | false   |
 *  ```
 */
namespace NoUnmodifiedLoopCondition {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    defaultAssignment?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnreachable {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
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
  export type Options = Readonly<{
    ignore?: readonly (
      | 'WhileStatement'
      | 'DoWhileStatement'
      | 'ForStatement'
      | 'ForInStatement'
      | 'ForOfStatement'
    )[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnsafeFinally {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated     | false   |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    enforceForOrderingRelations?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    disallowArithmeticOperators?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       },
   *       "allowTernary": {
   *         "type": "boolean"
   *       },
   *       "allowTaggedTemplates": {
   *         "type": "boolean"
   *       },
   *       "enforceForJSX": {
   *         "type": "boolean"
   *       },
   *       "ignoreDirectives": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowShortCircuit?: boolean;
    allowTernary?: boolean;
    allowTaggedTemplates?: boolean;
    enforceForJSX?: boolean;
    ignoreDirectives?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | true       |
 *  ```
 */
namespace NoUnusedLabels {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnusedPrivateClassMembers {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow unused variables
 *
 * @link https://eslint.org/docs/latest/rules/no-unused-vars
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
   *           },
   *           "ignoreClassWithStaticInitBlock": {
   *             "type": "boolean"
   *           },
   *           "ignoreUsingDeclarations": {
   *             "type": "boolean"
   *           },
   *           "reportUsedIgnorePattern": {
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
    | ('all' | 'local')
    | Readonly<{
        vars?: 'all' | 'local';
        varsIgnorePattern?: string;
        args?: 'all' | 'after-used' | 'none';
        ignoreRestSiblings?: boolean;
        argsIgnorePattern?: string;
        caughtErrors?: 'all' | 'none';
        caughtErrorsIgnorePattern?: string;
        destructuredArrayIgnorePattern?: string;
        ignoreClassWithStaticInitBlock?: boolean;
        ignoreUsingDeclarations?: boolean;
        reportUsedIgnorePattern?: boolean;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
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
   *           },
   *           "enums": {
   *             "type": "boolean"
   *           },
   *           "typedefs": {
   *             "type": "boolean"
   *           },
   *           "ignoreTypeReferences": {
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
    | Readonly<{
        functions?: boolean;
        classes?: boolean;
        variables?: boolean;
        allowNamedExports?: boolean;
        enums?: boolean;
        typedefs?: boolean;
        ignoreTypeReferences?: boolean;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow variable assignments when the value is not used
 *
 * @link https://eslint.org/docs/latest/rules/no-useless-assignment
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | false   |
 *  ```
 */
namespace NoUselessAssignment {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoUselessBackreference {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoUselessCall {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | true       |
 *  ```
 */
namespace NoUselessCatch {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    enforceForClassMembers?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoUselessConcat {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow unnecessary constructors
 *
 * @link https://eslint.org/docs/latest/rules/no-useless-constructor
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
namespace NoUselessConstructor {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace NoUselessEscape {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowRegexCharacters": {
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
  export type Options = Readonly<{
    allowRegexCharacters?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       },
   *       "ignoreImport": {
   *         "type": "boolean"
   *       },
   *       "ignoreExport": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    ignoreDestructuring?: boolean;
    ignoreImport?: boolean;
    ignoreExport?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoUselessReturn {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace NoVar {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowAsStatement?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
  export type Options = Readonly<{
    terms?: readonly string[];
    location?: 'start' | 'anywhere';
    /** @minItems 1 */
    decoration?: readonly [string, ...string[]];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | recommended | true       |
 *  ```
 */
namespace NoWith {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
    | readonly []
    | readonly [
        | 'always'
        | 'methods'
        | 'properties'
        | 'never'
        | 'consistent'
        | 'consistent-as-needed',
      ]
    | readonly [
        'always' | 'methods' | 'properties',
        Readonly<{
          avoidQuotes?: boolean;
        }>,
      ]
    | readonly [
        'always' | 'methods',
        Readonly<{
          ignoreConstructors?: boolean;
          methodsIgnorePattern?: string;
          avoidQuotes?: boolean;
          avoidExplicitReturnArrows?: boolean;
        }>,
      ];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
   *           },
   *           "using": {
   *             "enum": [
   *               "always",
   *               "never",
   *               "consecutive"
   *             ]
   *           },
   *           "awaitUsing": {
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
    | ('always' | 'never' | 'consecutive')
    | Readonly<
        | {
            separateRequires?: boolean;
            var?: 'always' | 'never' | 'consecutive';
            let?: 'always' | 'never' | 'consecutive';
            const?: 'always' | 'never' | 'consecutive';
            using?: 'always' | 'never' | 'consecutive';
            awaitUsing?: 'always' | 'never' | 'consecutive';
          }
        | {
            initialized?: 'always' | 'never' | 'consecutive';
            uninitialized?: 'always' | 'never' | 'consecutive';
          }
      >;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       },
   *       "allowUnboundThis": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowNamedFunctions?: boolean;
    allowUnboundThis?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
   *         ]
   *       },
   *       "ignoreReadBeforeAssign": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    destructuring?: 'any' | 'all';
    ignoreReadBeforeAssign?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
  export type Options0 = Readonly<
    | {
        VariableDeclarator?: Readonly<{
          array?: boolean;
          object?: boolean;
        }>;
        AssignmentExpression?: Readonly<{
          array?: boolean;
          object?: boolean;
        }>;
      }
    | {
        array?: boolean;
        object?: boolean;
      }
  >;

  export type Options1 = Readonly<{
    enforceForRenamedProperties?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferExponentiationOperator {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 *  ```
 */
namespace PreferNamedCaptureGroup {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferNumericLiterals {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferObjectHasOwn {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow using `Object.assign` with an object literal as the first argument
 * and prefer the use of object spread instead
 *
 * @link https://eslint.org/docs/latest/rules/prefer-object-spread
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
namespace PreferObjectSpread {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowEmptyReject?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated     | false      |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    disallowRedundantWrapping?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferRestParams {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferSpread {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferTemplate {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow losing originally caught error when re-throwing custom errors
 *
 * @link https://eslint.org/docs/latest/rules/preserve-caught-error
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
namespace PreserveCaughtError {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "requireCatchParameter": {
   *         "type": "boolean",
   *         "description": "Requires the catch blocks to always have the caught error parameter so it is not discarded."
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Requires the catch blocks to always have the caught error parameter so it
     * is not discarded.
     */
    requireCatchParameter?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated     | false      |
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false   |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowProperties?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow async functions which have no `await` expression
 *
 * @link https://eslint.org/docs/latest/rules/require-await
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
namespace RequireAwait {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of `u` or `v` flag on regular expressions
 *
 * @link https://eslint.org/docs/latest/rules/require-unicode-regexp
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
namespace RequireUnicodeRegexp {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "requireFlag": {
   *         "enum": [
   *           "u",
   *           "v"
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    requireFlag?: 'u' | 'v';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | recommended | true       |
 *  ```
 */
namespace RequireYield {
  export type RuleEntry = Linter.StringSeverity;
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
 * Enforce sorted `import` declarations within modules
 *
 * @link https://eslint.org/docs/latest/rules/sort-imports
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
   *         "type": "boolean"
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
   *         "type": "boolean"
   *       },
   *       "ignoreMemberSort": {
   *         "type": "boolean"
   *       },
   *       "allowSeparatedGroups": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    ignoreCase?: boolean;
    /**
     * @minItems 4
     * @maxItems 4
     */
    memberSyntaxSortOrder?: readonly [
      'none' | 'all' | 'multiple' | 'single',
      'none' | 'all' | 'multiple' | 'single',
      'none' | 'all' | 'multiple' | 'single',
      'none' | 'all' | 'multiple' | 'single',
    ];
    ignoreDeclarationSort?: boolean;
    ignoreMemberSort?: boolean;
    allowSeparatedGroups?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       },
   *       "natural": {
   *         "type": "boolean"
   *       },
   *       "minKeys": {
   *         "type": "integer",
   *         "minimum": 2
   *       },
   *       "allowLineSeparatedGroups": {
   *         "type": "boolean"
   *       },
   *       "ignoreComputedKeys": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options0 = 'asc' | 'desc';

  export type Options1 = Readonly<{
    caseSensitive?: boolean;
    natural?: boolean;
    minKeys?: number;
    allowLineSeparatedGroups?: boolean;
    ignoreComputedKeys?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    ignoreCase?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
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
  export type Options = 'never' | 'global' | 'function' | 'safe';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace SymbolDescription {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require calls to `isNaN()` when checking for `NaN`
 *
 * @link https://eslint.org/docs/latest/rules/use-isnan
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
   *         "type": "boolean"
   *       },
   *       "enforceForIndexOf": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    enforceForSwitchCase?: boolean;
    enforceForIndexOf?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated     | false   |
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    requireStringLiterals?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace VarsOnTop {
  export type RuleEntry = Linter.StringSeverity;
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
 *  | deprecated  | false      |
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
   *         "type": "boolean"
   *       },
   *       "onlyEquality": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options0 = 'always' | 'never';

  export type Options1 = Readonly<{
    exceptRange?: boolean;
    onlyEquality?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
}

export type EslintRules = Readonly<{
  'accessor-pairs': AccessorPairs.RuleEntry;
  'array-callback-return': ArrayCallbackReturn.RuleEntry;
  'arrow-body-style': ArrowBodyStyle.RuleEntry;
  'block-scoped-var': BlockScopedVar.RuleEntry;
  camelcase: Camelcase.RuleEntry;
  'capitalized-comments': CapitalizedComments.RuleEntry;
  'class-methods-use-this': ClassMethodsUseThis.RuleEntry;
  complexity: Complexity.RuleEntry;
  'consistent-return': ConsistentReturn.RuleEntry;
  'consistent-this': ConsistentThis.RuleEntry;
  'constructor-super': ConstructorSuper.RuleEntry;
  curly: Curly.RuleEntry;
  'default-case': DefaultCase.RuleEntry;
  'default-case-last': DefaultCaseLast.RuleEntry;
  'default-param-last': DefaultParamLast.RuleEntry;
  'dot-notation': DotNotation.RuleEntry;
  eqeqeq: Eqeqeq.RuleEntry;
  'for-direction': ForDirection.RuleEntry;
  'func-name-matching': FuncNameMatching.RuleEntry;
  'func-names': FuncNames.RuleEntry;
  'func-style': FuncStyle.RuleEntry;
  'getter-return': GetterReturn.RuleEntry;
  'grouped-accessor-pairs': GroupedAccessorPairs.RuleEntry;
  'guard-for-in': GuardForIn.RuleEntry;
  'id-denylist': IdDenylist.RuleEntry;
  'id-length': IdLength.RuleEntry;
  'id-match': IdMatch.RuleEntry;
  'init-declarations': InitDeclarations.RuleEntry;
  'logical-assignment-operators': LogicalAssignmentOperators.RuleEntry;
  'max-classes-per-file': MaxClassesPerFile.RuleEntry;
  'max-depth': MaxDepth.RuleEntry;
  'max-lines': MaxLines.RuleEntry;
  'max-lines-per-function': MaxLinesPerFunction.RuleEntry;
  'max-nested-callbacks': MaxNestedCallbacks.RuleEntry;
  'max-params': MaxParams.RuleEntry;
  'max-statements': MaxStatements.RuleEntry;
  'new-cap': NewCap.RuleEntry;
  'no-alert': NoAlert.RuleEntry;
  'no-array-constructor': NoArrayConstructor.RuleEntry;
  'no-async-promise-executor': NoAsyncPromiseExecutor.RuleEntry;
  'no-await-in-loop': NoAwaitInLoop.RuleEntry;
  'no-bitwise': NoBitwise.RuleEntry;
  'no-caller': NoCaller.RuleEntry;
  'no-case-declarations': NoCaseDeclarations.RuleEntry;
  'no-class-assign': NoClassAssign.RuleEntry;
  'no-compare-neg-zero': NoCompareNegZero.RuleEntry;
  'no-cond-assign': NoCondAssign.RuleEntry;
  'no-console': NoConsole.RuleEntry;
  'no-const-assign': NoConstAssign.RuleEntry;
  'no-constant-binary-expression': NoConstantBinaryExpression.RuleEntry;
  'no-constant-condition': NoConstantCondition.RuleEntry;
  'no-constructor-return': NoConstructorReturn.RuleEntry;
  'no-continue': NoContinue.RuleEntry;
  'no-control-regex': NoControlRegex.RuleEntry;
  'no-debugger': NoDebugger.RuleEntry;
  'no-delete-var': NoDeleteVar.RuleEntry;
  'no-div-regex': NoDivRegex.RuleEntry;
  'no-dupe-args': NoDupeArgs.RuleEntry;
  'no-dupe-class-members': NoDupeClassMembers.RuleEntry;
  'no-dupe-else-if': NoDupeElseIf.RuleEntry;
  'no-dupe-keys': NoDupeKeys.RuleEntry;
  'no-duplicate-case': NoDuplicateCase.RuleEntry;
  'no-duplicate-imports': NoDuplicateImports.RuleEntry;
  'no-else-return': NoElseReturn.RuleEntry;
  'no-empty': NoEmpty.RuleEntry;
  'no-empty-character-class': NoEmptyCharacterClass.RuleEntry;
  'no-empty-function': NoEmptyFunction.RuleEntry;
  'no-empty-pattern': NoEmptyPattern.RuleEntry;
  'no-empty-static-block': NoEmptyStaticBlock.RuleEntry;
  'no-eq-null': NoEqNull.RuleEntry;
  'no-eval': NoEval.RuleEntry;
  'no-ex-assign': NoExAssign.RuleEntry;
  'no-extend-native': NoExtendNative.RuleEntry;
  'no-extra-bind': NoExtraBind.RuleEntry;
  'no-extra-boolean-cast': NoExtraBooleanCast.RuleEntry;
  'no-extra-label': NoExtraLabel.RuleEntry;
  'no-fallthrough': NoFallthrough.RuleEntry;
  'no-func-assign': NoFuncAssign.RuleEntry;
  'no-global-assign': NoGlobalAssign.RuleEntry;
  'no-implicit-coercion': NoImplicitCoercion.RuleEntry;
  'no-implicit-globals': NoImplicitGlobals.RuleEntry;
  'no-implied-eval': NoImpliedEval.RuleEntry;
  'no-import-assign': NoImportAssign.RuleEntry;
  'no-inline-comments': NoInlineComments.RuleEntry;
  'no-inner-declarations': NoInnerDeclarations.RuleEntry;
  'no-invalid-regexp': NoInvalidRegexp.RuleEntry;
  'no-invalid-this': NoInvalidThis.RuleEntry;
  'no-irregular-whitespace': NoIrregularWhitespace.RuleEntry;
  'no-iterator': NoIterator.RuleEntry;
  'no-label-var': NoLabelVar.RuleEntry;
  'no-labels': NoLabels.RuleEntry;
  'no-lone-blocks': NoLoneBlocks.RuleEntry;
  'no-lonely-if': NoLonelyIf.RuleEntry;
  'no-loop-func': NoLoopFunc.RuleEntry;
  'no-loss-of-precision': NoLossOfPrecision.RuleEntry;
  'no-magic-numbers': NoMagicNumbers.RuleEntry;
  'no-misleading-character-class': NoMisleadingCharacterClass.RuleEntry;
  'no-multi-assign': NoMultiAssign.RuleEntry;
  'no-multi-str': NoMultiStr.RuleEntry;
  'no-negated-condition': NoNegatedCondition.RuleEntry;
  'no-nested-ternary': NoNestedTernary.RuleEntry;
  'no-new': NoNew.RuleEntry;
  'no-new-func': NoNewFunc.RuleEntry;
  'no-new-native-nonconstructor': NoNewNativeNonconstructor.RuleEntry;
  'no-new-wrappers': NoNewWrappers.RuleEntry;
  'no-nonoctal-decimal-escape': NoNonoctalDecimalEscape.RuleEntry;
  'no-obj-calls': NoObjCalls.RuleEntry;
  'no-object-constructor': NoObjectConstructor.RuleEntry;
  'no-octal': NoOctal.RuleEntry;
  'no-octal-escape': NoOctalEscape.RuleEntry;
  'no-param-reassign': NoParamReassign.RuleEntry;
  'no-plusplus': NoPlusplus.RuleEntry;
  'no-promise-executor-return': NoPromiseExecutorReturn.RuleEntry;
  'no-proto': NoProto.RuleEntry;
  'no-prototype-builtins': NoPrototypeBuiltins.RuleEntry;
  'no-redeclare': NoRedeclare.RuleEntry;
  'no-regex-spaces': NoRegexSpaces.RuleEntry;
  'no-restricted-exports': NoRestrictedExports.RuleEntry;
  'no-restricted-globals': NoRestrictedGlobals.RuleEntry;
  'no-restricted-imports': NoRestrictedImports.RuleEntry;
  'no-restricted-properties': NoRestrictedProperties.RuleEntry;
  'no-restricted-syntax': NoRestrictedSyntax.RuleEntry;
  'no-return-assign': NoReturnAssign.RuleEntry;
  'no-script-url': NoScriptUrl.RuleEntry;
  'no-self-assign': NoSelfAssign.RuleEntry;
  'no-self-compare': NoSelfCompare.RuleEntry;
  'no-sequences': NoSequences.RuleEntry;
  'no-setter-return': NoSetterReturn.RuleEntry;
  'no-shadow': NoShadow.RuleEntry;
  'no-shadow-restricted-names': NoShadowRestrictedNames.RuleEntry;
  'no-sparse-arrays': NoSparseArrays.RuleEntry;
  'no-template-curly-in-string': NoTemplateCurlyInString.RuleEntry;
  'no-ternary': NoTernary.RuleEntry;
  'no-this-before-super': NoThisBeforeSuper.RuleEntry;
  'no-throw-literal': NoThrowLiteral.RuleEntry;
  'no-unassigned-vars': NoUnassignedVars.RuleEntry;
  'no-undef': NoUndef.RuleEntry;
  'no-undef-init': NoUndefInit.RuleEntry;
  'no-undefined': NoUndefined.RuleEntry;
  'no-underscore-dangle': NoUnderscoreDangle.RuleEntry;
  'no-unexpected-multiline': NoUnexpectedMultiline.RuleEntry;
  'no-unmodified-loop-condition': NoUnmodifiedLoopCondition.RuleEntry;
  'no-unneeded-ternary': NoUnneededTernary.RuleEntry;
  'no-unreachable': NoUnreachable.RuleEntry;
  'no-unreachable-loop': NoUnreachableLoop.RuleEntry;
  'no-unsafe-finally': NoUnsafeFinally.RuleEntry;
  'no-unsafe-negation': NoUnsafeNegation.RuleEntry;
  'no-unsafe-optional-chaining': NoUnsafeOptionalChaining.RuleEntry;
  'no-unused-expressions': NoUnusedExpressions.RuleEntry;
  'no-unused-labels': NoUnusedLabels.RuleEntry;
  'no-unused-private-class-members': NoUnusedPrivateClassMembers.RuleEntry;
  'no-unused-vars': NoUnusedVars.RuleEntry;
  'no-use-before-define': NoUseBeforeDefine.RuleEntry;
  'no-useless-assignment': NoUselessAssignment.RuleEntry;
  'no-useless-backreference': NoUselessBackreference.RuleEntry;
  'no-useless-call': NoUselessCall.RuleEntry;
  'no-useless-catch': NoUselessCatch.RuleEntry;
  'no-useless-computed-key': NoUselessComputedKey.RuleEntry;
  'no-useless-concat': NoUselessConcat.RuleEntry;
  'no-useless-constructor': NoUselessConstructor.RuleEntry;
  'no-useless-escape': NoUselessEscape.RuleEntry;
  'no-useless-rename': NoUselessRename.RuleEntry;
  'no-useless-return': NoUselessReturn.RuleEntry;
  'no-var': NoVar.RuleEntry;
  'no-void': NoVoid.RuleEntry;
  'no-warning-comments': NoWarningComments.RuleEntry;
  'no-with': NoWith.RuleEntry;
  'object-shorthand': ObjectShorthand.RuleEntry;
  'one-var': OneVar.RuleEntry;
  'operator-assignment': OperatorAssignment.RuleEntry;
  'prefer-arrow-callback': PreferArrowCallback.RuleEntry;
  'prefer-const': PreferConst.RuleEntry;
  'prefer-destructuring': PreferDestructuring.RuleEntry;
  'prefer-exponentiation-operator': PreferExponentiationOperator.RuleEntry;
  'prefer-named-capture-group': PreferNamedCaptureGroup.RuleEntry;
  'prefer-numeric-literals': PreferNumericLiterals.RuleEntry;
  'prefer-object-has-own': PreferObjectHasOwn.RuleEntry;
  'prefer-object-spread': PreferObjectSpread.RuleEntry;
  'prefer-promise-reject-errors': PreferPromiseRejectErrors.RuleEntry;
  'prefer-regex-literals': PreferRegexLiterals.RuleEntry;
  'prefer-rest-params': PreferRestParams.RuleEntry;
  'prefer-spread': PreferSpread.RuleEntry;
  'prefer-template': PreferTemplate.RuleEntry;
  'preserve-caught-error': PreserveCaughtError.RuleEntry;
  radix: Radix.RuleEntry;
  'require-atomic-updates': RequireAtomicUpdates.RuleEntry;
  'require-await': RequireAwait.RuleEntry;
  'require-unicode-regexp': RequireUnicodeRegexp.RuleEntry;
  'require-yield': RequireYield.RuleEntry;
  'sort-imports': SortImports.RuleEntry;
  'sort-keys': SortKeys.RuleEntry;
  'sort-vars': SortVars.RuleEntry;
  strict: Strict.RuleEntry;
  'symbol-description': SymbolDescription.RuleEntry;
  'unicode-bom': UnicodeBom.RuleEntry;
  'use-isnan': UseIsnan.RuleEntry;
  'valid-typeof': ValidTypeof.RuleEntry;
  'vars-on-top': VarsOnTop.RuleEntry;
  yoda: Yoda.RuleEntry;

  // deprecated
  'array-bracket-newline': ArrayBracketNewline.RuleEntry;
  'array-bracket-spacing': ArrayBracketSpacing.RuleEntry;
  'array-element-newline': ArrayElementNewline.RuleEntry;
  'arrow-parens': ArrowParens.RuleEntry;
  'arrow-spacing': ArrowSpacing.RuleEntry;
  'block-spacing': BlockSpacing.RuleEntry;
  'brace-style': BraceStyle.RuleEntry;
  'callback-return': CallbackReturn.RuleEntry;
  'comma-dangle': CommaDangle.RuleEntry;
  'comma-spacing': CommaSpacing.RuleEntry;
  'comma-style': CommaStyle.RuleEntry;
  'computed-property-spacing': ComputedPropertySpacing.RuleEntry;
  'dot-location': DotLocation.RuleEntry;
  'eol-last': EolLast.RuleEntry;
  'func-call-spacing': FuncCallSpacing.RuleEntry;
  'function-call-argument-newline': FunctionCallArgumentNewline.RuleEntry;
  'function-paren-newline': FunctionParenNewline.RuleEntry;
  'generator-star-spacing': GeneratorStarSpacing.RuleEntry;
  'global-require': GlobalRequire.RuleEntry;
  'handle-callback-err': HandleCallbackErr.RuleEntry;
  'id-blacklist': IdBlacklist.RuleEntry;
  'implicit-arrow-linebreak': ImplicitArrowLinebreak.RuleEntry;
  indent: Indent.RuleEntry;
  'indent-legacy': IndentLegacy.RuleEntry;
  'jsx-quotes': JsxQuotes.RuleEntry;
  'key-spacing': KeySpacing.RuleEntry;
  'keyword-spacing': KeywordSpacing.RuleEntry;
  'line-comment-position': LineCommentPosition.RuleEntry;
  'linebreak-style': LinebreakStyle.RuleEntry;
  'lines-around-comment': LinesAroundComment.RuleEntry;
  'lines-around-directive': LinesAroundDirective.RuleEntry;
  'lines-between-class-members': LinesBetweenClassMembers.RuleEntry;
  'max-len': MaxLen.RuleEntry;
  'max-statements-per-line': MaxStatementsPerLine.RuleEntry;
  'multiline-comment-style': MultilineCommentStyle.RuleEntry;
  'multiline-ternary': MultilineTernary.RuleEntry;
  'new-parens': NewParens.RuleEntry;
  'newline-after-var': NewlineAfterVar.RuleEntry;
  'newline-before-return': NewlineBeforeReturn.RuleEntry;
  'newline-per-chained-call': NewlinePerChainedCall.RuleEntry;
  'no-buffer-constructor': NoBufferConstructor.RuleEntry;
  'no-catch-shadow': NoCatchShadow.RuleEntry;
  'no-confusing-arrow': NoConfusingArrow.RuleEntry;
  'no-extra-parens': NoExtraParens.RuleEntry;
  'no-extra-semi': NoExtraSemi.RuleEntry;
  'no-floating-decimal': NoFloatingDecimal.RuleEntry;
  'no-mixed-operators': NoMixedOperators.RuleEntry;
  'no-mixed-requires': NoMixedRequires.RuleEntry;
  'no-mixed-spaces-and-tabs': NoMixedSpacesAndTabs.RuleEntry;
  'no-multi-spaces': NoMultiSpaces.RuleEntry;
  'no-multiple-empty-lines': NoMultipleEmptyLines.RuleEntry;
  'no-native-reassign': NoNativeReassign.RuleEntry;
  'no-negated-in-lhs': NoNegatedInLhs.RuleEntry;
  'no-new-object': NoNewObject.RuleEntry;
  'no-new-require': NoNewRequire.RuleEntry;
  'no-new-symbol': NoNewSymbol.RuleEntry;
  'no-path-concat': NoPathConcat.RuleEntry;
  'no-process-env': NoProcessEnv.RuleEntry;
  'no-process-exit': NoProcessExit.RuleEntry;
  'no-restricted-modules': NoRestrictedModules.RuleEntry;
  'no-return-await': NoReturnAwait.RuleEntry;
  'no-spaced-func': NoSpacedFunc.RuleEntry;
  'no-sync': NoSync.RuleEntry;
  'no-tabs': NoTabs.RuleEntry;
  'no-trailing-spaces': NoTrailingSpaces.RuleEntry;
  'no-whitespace-before-property': NoWhitespaceBeforeProperty.RuleEntry;
  'nonblock-statement-body-position': NonblockStatementBodyPosition.RuleEntry;
  'object-curly-newline': ObjectCurlyNewline.RuleEntry;
  'object-curly-spacing': ObjectCurlySpacing.RuleEntry;
  'object-property-newline': ObjectPropertyNewline.RuleEntry;
  'one-var-declaration-per-line': OneVarDeclarationPerLine.RuleEntry;
  'operator-linebreak': OperatorLinebreak.RuleEntry;
  'padded-blocks': PaddedBlocks.RuleEntry;
  'padding-line-between-statements': PaddingLineBetweenStatements.RuleEntry;
  'prefer-reflect': PreferReflect.RuleEntry;
  'quote-props': QuoteProps.RuleEntry;
  quotes: Quotes.RuleEntry;
  'rest-spread-spacing': RestSpreadSpacing.RuleEntry;
  semi: Semi.RuleEntry;
  'semi-spacing': SemiSpacing.RuleEntry;
  'semi-style': SemiStyle.RuleEntry;
  'space-before-blocks': SpaceBeforeBlocks.RuleEntry;
  'space-before-function-paren': SpaceBeforeFunctionParen.RuleEntry;
  'space-in-parens': SpaceInParens.RuleEntry;
  'space-infix-ops': SpaceInfixOps.RuleEntry;
  'space-unary-ops': SpaceUnaryOps.RuleEntry;
  'spaced-comment': SpacedComment.RuleEntry;
  'switch-colon-spacing': SwitchColonSpacing.RuleEntry;
  'template-curly-spacing': TemplateCurlySpacing.RuleEntry;
  'template-tag-spacing': TemplateTagSpacing.RuleEntry;
  'wrap-iife': WrapIife.RuleEntry;
  'wrap-regex': WrapRegex.RuleEntry;
  'yield-star-spacing': YieldStarSpacing.RuleEntry;
}>;

export type EslintRulesOption = Readonly<{
  'accessor-pairs': AccessorPairs.Options;
  'array-callback-return': ArrayCallbackReturn.Options;
  'arrow-body-style': ArrowBodyStyle.Options;
  camelcase: Camelcase.Options;
  'capitalized-comments': readonly [
    CapitalizedComments.Options0,
    CapitalizedComments.Options1,
  ];
  'class-methods-use-this': ClassMethodsUseThis.Options;
  complexity: Complexity.Options;
  'consistent-return': ConsistentReturn.Options;
  'consistent-this': ConsistentThis.Options;
  curly: Curly.Options;
  'default-case': DefaultCase.Options;
  'dot-notation': DotNotation.Options;
  eqeqeq: Eqeqeq.Options;
  'func-name-matching': FuncNameMatching.Options;
  'func-names': FuncNames.Options;
  'func-style': readonly [FuncStyle.Options0, FuncStyle.Options1];
  'getter-return': GetterReturn.Options;
  'grouped-accessor-pairs': readonly [
    GroupedAccessorPairs.Options0,
    GroupedAccessorPairs.Options1,
  ];
  'id-denylist': IdDenylist.Options;
  'id-length': IdLength.Options;
  'id-match': readonly [IdMatch.Options0, IdMatch.Options1];
  'init-declarations': InitDeclarations.Options;
  'logical-assignment-operators': LogicalAssignmentOperators.Options;
  'max-classes-per-file': MaxClassesPerFile.Options;
  'max-depth': MaxDepth.Options;
  'max-lines': MaxLines.Options;
  'max-lines-per-function': MaxLinesPerFunction.Options;
  'max-nested-callbacks': MaxNestedCallbacks.Options;
  'max-params': MaxParams.Options;
  'max-statements': readonly [MaxStatements.Options0, MaxStatements.Options1];
  'new-cap': NewCap.Options;
  'no-bitwise': NoBitwise.Options;
  'no-cond-assign': NoCondAssign.Options;
  'no-console': NoConsole.Options;
  'no-constant-condition': NoConstantCondition.Options;
  'no-duplicate-imports': NoDuplicateImports.Options;
  'no-else-return': NoElseReturn.Options;
  'no-empty': NoEmpty.Options;
  'no-empty-function': NoEmptyFunction.Options;
  'no-empty-pattern': NoEmptyPattern.Options;
  'no-eval': NoEval.Options;
  'no-extend-native': NoExtendNative.Options;
  'no-extra-boolean-cast': NoExtraBooleanCast.Options;
  'no-fallthrough': NoFallthrough.Options;
  'no-global-assign': NoGlobalAssign.Options;
  'no-implicit-coercion': NoImplicitCoercion.Options;
  'no-implicit-globals': NoImplicitGlobals.Options;
  'no-inline-comments': NoInlineComments.Options;
  'no-inner-declarations': readonly [
    NoInnerDeclarations.Options0,
    NoInnerDeclarations.Options1,
  ];
  'no-invalid-regexp': NoInvalidRegexp.Options;
  'no-invalid-this': NoInvalidThis.Options;
  'no-irregular-whitespace': NoIrregularWhitespace.Options;
  'no-labels': NoLabels.Options;
  'no-magic-numbers': NoMagicNumbers.Options;
  'no-misleading-character-class': NoMisleadingCharacterClass.Options;
  'no-multi-assign': NoMultiAssign.Options;
  'no-param-reassign': NoParamReassign.Options;
  'no-plusplus': NoPlusplus.Options;
  'no-promise-executor-return': NoPromiseExecutorReturn.Options;
  'no-redeclare': NoRedeclare.Options;
  'no-restricted-exports': NoRestrictedExports.Options;
  'no-restricted-globals': NoRestrictedGlobals.Options;
  'no-restricted-imports': NoRestrictedImports.Options;
  'no-restricted-properties': NoRestrictedProperties.Options;
  'no-restricted-syntax': NoRestrictedSyntax.Options;
  'no-return-assign': NoReturnAssign.Options;
  'no-self-assign': NoSelfAssign.Options;
  'no-sequences': NoSequences.Options;
  'no-shadow': NoShadow.Options;
  'no-shadow-restricted-names': NoShadowRestrictedNames.Options;
  'no-undef': NoUndef.Options;
  'no-underscore-dangle': NoUnderscoreDangle.Options;
  'no-unneeded-ternary': NoUnneededTernary.Options;
  'no-unreachable-loop': NoUnreachableLoop.Options;
  'no-unsafe-negation': NoUnsafeNegation.Options;
  'no-unsafe-optional-chaining': NoUnsafeOptionalChaining.Options;
  'no-unused-expressions': NoUnusedExpressions.Options;
  'no-unused-vars': NoUnusedVars.Options;
  'no-use-before-define': NoUseBeforeDefine.Options;
  'no-useless-computed-key': NoUselessComputedKey.Options;
  'no-useless-escape': NoUselessEscape.Options;
  'no-useless-rename': NoUselessRename.Options;
  'no-void': NoVoid.Options;
  'no-warning-comments': NoWarningComments.Options;
  'object-shorthand': ObjectShorthand.Options;
  'one-var': OneVar.Options;
  'operator-assignment': OperatorAssignment.Options;
  'prefer-arrow-callback': PreferArrowCallback.Options;
  'prefer-const': PreferConst.Options;
  'prefer-destructuring': readonly [
    PreferDestructuring.Options0,
    PreferDestructuring.Options1,
  ];
  'prefer-promise-reject-errors': PreferPromiseRejectErrors.Options;
  'prefer-regex-literals': PreferRegexLiterals.Options;
  'preserve-caught-error': PreserveCaughtError.Options;
  radix: Radix.Options;
  'require-atomic-updates': RequireAtomicUpdates.Options;
  'require-unicode-regexp': RequireUnicodeRegexp.Options;
  'sort-imports': SortImports.Options;
  'sort-keys': readonly [SortKeys.Options0, SortKeys.Options1];
  'sort-vars': SortVars.Options;
  strict: Strict.Options;
  'unicode-bom': UnicodeBom.Options;
  'use-isnan': UseIsnan.Options;
  'valid-typeof': ValidTypeof.Options;
  yoda: readonly [Yoda.Options0, Yoda.Options1];
}>;
