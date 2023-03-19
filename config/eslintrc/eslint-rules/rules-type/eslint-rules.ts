/* cSpell:disable */
/* eslint-disable @typescript-eslint/sort-type-constituents */
import { type Linter } from 'eslint';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleLevel, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleLevel, ...T[1]] : T;

/**
 * @description Enforce getter and setter pairs in objects and classes
 * @link https://eslint.org/docs/rules/accessor-pairs
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce linebreaks after opening and before closing array brackets
 * @link https://eslint.org/docs/rules/array-bracket-newline
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options =
    | ('always' | 'never' | 'consistent')
    | {
        readonly multiline?: boolean;
        readonly minItems?: number | null;
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent spacing inside array brackets
 * @link https://eslint.org/docs/rules/array-bracket-spacing
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options0 = 'always' | 'never';

  export type Options1 = {
    readonly singleValue?: boolean;
    readonly objectsInArrays?: boolean;
    readonly arraysInArrays?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Enforce `return` statements in callbacks of array methods
 * @link https://eslint.org/docs/rules/array-callback-return
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
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
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce line breaks after each array element
 * @link https://eslint.org/docs/rules/array-element-newline
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
   *           "enum": [
   *             "always",
   *             "never",
   *             "consistent"
   *           ]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "multiline": {
   *               "type": "boolean"
   *             },
   *             "minItems": {
   *               "type": [
   *                 "integer",
   *                 "null"
   *               ],
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
  export type Options =
    | readonly []
    | readonly [
        | BasicConfig
        | {
            readonly ArrayExpression?: BasicConfig;
            readonly ArrayPattern?: BasicConfig;
          }
      ];
  export type BasicConfig =
    | ('always' | 'never' | 'consistent')
    | {
        readonly multiline?: boolean;
        readonly minItems?: number | null;
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require braces around arrow function bodies
 * @link https://eslint.org/docs/rules/arrow-body-style
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
   *           "enum": [
   *             "always",
   *             "never"
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
   *             "as-needed"
   *           ]
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
    | readonly []
    | readonly ['as-needed']
    | readonly [
        'as-needed',
        {
          readonly requireReturnForObjectLiteral?: boolean;
        }
      ];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require parentheses around arrow function arguments
 * @link https://eslint.org/docs/rules/arrow-parens
 *
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | fixable     | code   |
 *  | recommended | false  |
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
  export type Options0 = 'always' | 'as-needed';

  export type Options1 = {
    readonly requireForBlockBody?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Enforce consistent spacing before and after the arrow in arrow functions
 * @link https://eslint.org/docs/rules/arrow-spacing
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = {
    readonly before?: boolean;
    readonly after?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce the use of variables within the scope they are defined
 * @link https://eslint.org/docs/rules/block-scoped-var
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace BlockScopedVar {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow or enforce spaces inside of blocks after opening block and before closing block
 * @link https://eslint.org/docs/rules/block-spacing
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = 'always' | 'never';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent brace style for blocks
 * @link https://eslint.org/docs/rules/brace-style
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options0 = '1tbs' | 'stroustrup' | 'allman';

  export type Options1 = {
    readonly allowSingleLine?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Require `return` statements after callbacks
 * @link https://eslint.org/docs/rules/callback-return
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
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
  export type RuleEntry = 'off';
}

/**
 * @description Enforce camelcase naming convention
 * @link https://eslint.org/docs/rules/camelcase
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    /**
     * @minItems 0
     */
    readonly allow?: readonly [] | readonly [string];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce or disallow capitalization of the first letter of a comment
 * @link https://eslint.org/docs/rules/capitalized-comments
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Enforce that class methods utilize `this`
 * @link https://eslint.org/docs/rules/class-methods-use-this
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require or disallow trailing commas
 * @link https://eslint.org/docs/rules/comma-dangle
 *
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | fixable     | code   |
 *  | recommended | false  |
 */
namespace CommaDangle {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "definitions": {
   *     "value": {
   *       "enum": [
   *         "always-multiline",
   *         "always",
   *         "never",
   *         "only-multiline"
   *       ]
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
  export type Options =
    | readonly []
    | readonly [
        | Value
        | {
            readonly arrays?: ValueWithIgnore;
            readonly objects?: ValueWithIgnore;
            readonly imports?: ValueWithIgnore;
            readonly exports?: ValueWithIgnore;
            readonly functions?: ValueWithIgnore;
          }
      ];
  export type Value =
    | 'always-multiline'
    | 'always'
    | 'never'
    | 'only-multiline';
  export type ValueWithIgnore =
    | 'always-multiline'
    | 'always'
    | 'ignore'
    | 'never'
    | 'only-multiline';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent spacing before and after commas
 * @link https://eslint.org/docs/rules/comma-spacing
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = {
    readonly before?: boolean;
    readonly after?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent comma style
 * @link https://eslint.org/docs/rules/comma-style
 *
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | fixable     | code   |
 *  | recommended | false  |
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
  export type Options0 = 'first' | 'last';

  export type Options1 = {
    readonly exceptions?: Record<string, boolean>;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Enforce a maximum cyclomatic complexity allowed in a program
 * @link https://eslint.org/docs/rules/complexity
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent spacing inside computed property brackets
 * @link https://eslint.org/docs/rules/computed-property-spacing
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options0 = 'always' | 'never';

  export type Options1 = {
    readonly enforceForClassMembers?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Require `return` statements to either always or never specify values
 * @link https://eslint.org/docs/rules/consistent-return
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent naming when capturing the current execution context
 * @link https://eslint.org/docs/rules/consistent-this
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require `super()` calls in constructors
 * @link https://eslint.org/docs/rules/constructor-super
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace ConstructorSuper {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce consistent brace style for all control statements
 * @link https://eslint.org/docs/rules/curly
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
   *           "enum": [
   *             "all"
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
   *             "multi",
   *             "multi-line",
   *             "multi-or-nest"
   *           ]
   *         },
   *         {
   *           "enum": [
   *             "consistent"
   *           ]
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
    | readonly []
    | readonly ['multi' | 'multi-line' | 'multi-or-nest']
    | readonly ['multi' | 'multi-line' | 'multi-or-nest', 'consistent'];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require `default` cases in `switch` statements
 * @link https://eslint.org/docs/rules/default-case
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce default clauses in switch statements to be last
 * @link https://eslint.org/docs/rules/default-case-last
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace DefaultCaseLast {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce default parameters to be last
 * @link https://eslint.org/docs/rules/default-param-last
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace DefaultParamLast {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce consistent newlines before and after dots
 * @link https://eslint.org/docs/rules/dot-location
 *
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | fixable     | code   |
 *  | recommended | false  |
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
  export type Options = 'object' | 'property';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce dot notation whenever possible
 * @link https://eslint.org/docs/rules/dot-notation
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require or disallow newline at the end of files
 * @link https://eslint.org/docs/rules/eol-last
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = 'always' | 'never' | 'unix' | 'windows';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require the use of `===` and `!==`
 * @link https://eslint.org/docs/rules/eqeqeq
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
   *           "enum": [
   *             "always"
   *           ]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "null": {
   *               "enum": [
   *                 "always",
   *                 "never",
   *                 "ignore"
   *               ]
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
   *           "enum": [
   *             "smart",
   *             "allow-null"
   *           ]
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
        {
          readonly null?: 'always' | 'never' | 'ignore';
        }
      ]
    | readonly []
    | readonly ['smart' | 'allow-null'];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce "for" loop update clause moving the counter in the right direction
 * @link https://eslint.org/docs/rules/for-direction
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace ForDirection {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require or disallow spacing between function identifiers and their invocations
 * @link https://eslint.org/docs/rules/func-call-spacing
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
   *           "enum": [
   *             "never"
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
   *             "always"
   *           ]
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
  export type Options =
    | readonly []
    | readonly ['never']
    | readonly []
    | readonly ['always']
    | readonly [
        'always',
        {
          readonly allowNewlines?: boolean;
        }
      ];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require function names to match the name of the variable or property to which they are assigned
 * @link https://eslint.org/docs/rules/func-name-matching
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
   *           "enum": [
   *             "always",
   *             "never"
   *           ]
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
        {
          readonly considerPropertyDescriptor?: boolean;
          readonly includeCommonJSModuleExports?: boolean;
        }
      ]
    | readonly []
    | readonly [
        {
          readonly considerPropertyDescriptor?: boolean;
          readonly includeCommonJSModuleExports?: boolean;
        }
      ];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require or disallow named `function` expressions
 * @link https://eslint.org/docs/rules/func-names
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace FuncNames {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "definitions": {
   *     "value": {
   *       "enum": [
   *         "always",
   *         "as-needed",
   *         "never"
   *       ]
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
        {
          readonly generators?: Value;
        }
      ];
  export type Value = 'always' | 'as-needed' | 'never';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce the consistent use of either `function` declarations or expressions
 * @link https://eslint.org/docs/rules/func-style
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Enforce line breaks between arguments of a function call
 * @link https://eslint.org/docs/rules/function-call-argument-newline
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = 'always' | 'never' | 'consistent';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent line breaks inside function parentheses
 * @link https://eslint.org/docs/rules/function-paren-newline
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options =
    | ('always' | 'never' | 'consistent' | 'multiline' | 'multiline-arguments')
    | {
        readonly minItems?: number;
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent spacing around `*` operators in generator functions
 * @link https://eslint.org/docs/rules/generator-star-spacing
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options =
    | ('before' | 'after' | 'both' | 'neither')
    | {
        readonly before?: boolean;
        readonly after?: boolean;
        readonly named?:
          | ('before' | 'after' | 'both' | 'neither')
          | {
              readonly before?: boolean;
              readonly after?: boolean;
            };
        readonly anonymous?:
          | ('before' | 'after' | 'both' | 'neither')
          | {
              readonly before?: boolean;
              readonly after?: boolean;
            };
        readonly method?:
          | ('before' | 'after' | 'both' | 'neither')
          | {
              readonly before?: boolean;
              readonly after?: boolean;
            };
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce `return` statements in getters
 * @link https://eslint.org/docs/rules/getter-return
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require `require()` calls to be placed at top-level module scope
 * @link https://eslint.org/docs/rules/global-require
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 */
namespace GlobalRequire {
  export type RuleEntry = 'off';
}

/**
 * @description Require grouped accessor pairs in object literals and classes
 * @link https://eslint.org/docs/rules/grouped-accessor-pairs
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require `for-in` loops to include an `if` statement
 * @link https://eslint.org/docs/rules/guard-for-in
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace GuardForIn {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require error handling in callbacks
 * @link https://eslint.org/docs/rules/handle-callback-err
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
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
  export type RuleEntry = 'off';
}

/**
 * @description Disallow specified identifiers
 * @link https://eslint.org/docs/rules/id-blacklist
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
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
  export type RuleEntry = 'off';
}

/**
 * @description Disallow specified identifiers
 * @link https://eslint.org/docs/rules/id-denylist
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce minimum and maximum identifier lengths
 * @link https://eslint.org/docs/rules/id-length
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require identifiers to match a specified regular expression
 * @link https://eslint.org/docs/rules/id-match
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Enforce the location of arrow function bodies
 * @link https://eslint.org/docs/rules/implicit-arrow-linebreak
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = 'beside' | 'below';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent indentation
 * @link https://eslint.org/docs/rules/indent
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options0 = 'tab' | number;

  export type Options1 = {
    readonly SwitchCase?: number;
    readonly VariableDeclarator?:
      | (number | ('first' | 'off'))
      | {
          readonly var?: number | ('first' | 'off');
          readonly let?: number | ('first' | 'off');
          readonly const?: number | ('first' | 'off');
        };
    readonly outerIIFEBody?: number | 'off';
    readonly MemberExpression?: number | 'off';
    readonly FunctionDeclaration?: {
      readonly parameters?: number | ('first' | 'off');
      readonly body?: number;
    };
    readonly FunctionExpression?: {
      readonly parameters?: number | ('first' | 'off');
      readonly body?: number;
    };
    readonly StaticBlock?: {
      readonly body?: number;
    };
    readonly CallExpression?: {
      readonly arguments?: number | ('first' | 'off');
    };
    readonly ArrayExpression?: number | ('first' | 'off');
    readonly ObjectExpression?: number | ('first' | 'off');
    readonly ImportDeclaration?: number | ('first' | 'off');
    readonly flatTernaryExpressions?: boolean;
    readonly offsetTernaryExpressions?: boolean;
    readonly ignoredNodes?: readonly string[];
    readonly ignoreComments?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Enforce consistent indentation
 * @link https://eslint.org/docs/rules/indent-legacy
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type RuleEntry = 'off';
}

/**
 * @description Require or disallow initialization in variable declarations
 * @link https://eslint.org/docs/rules/init-declarations
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
   *           "enum": [
   *             "always"
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
   *             "never"
   *           ]
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
    | readonly []
    | readonly ['never']
    | readonly [
        'never',
        {
          readonly ignoreForLoopInit?: boolean;
        }
      ];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce the consistent use of either double or single quotes in JSX attributes
 * @link https://eslint.org/docs/rules/jsx-quotes
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = 'prefer-single' | 'prefer-double';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent spacing between keys and values in object literal properties
 * @link https://eslint.org/docs/rules/key-spacing
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options =
    | {
        readonly align?:
          | ('colon' | 'value')
          | {
              readonly mode?: 'strict' | 'minimum';
              readonly on?: 'colon' | 'value';
              readonly beforeColon?: boolean;
              readonly afterColon?: boolean;
            };
        readonly mode?: 'strict' | 'minimum';
        readonly beforeColon?: boolean;
        readonly afterColon?: boolean;
      }
    | {
        readonly singleLine?: {
          readonly mode?: 'strict' | 'minimum';
          readonly beforeColon?: boolean;
          readonly afterColon?: boolean;
        };
        readonly multiLine?: {
          readonly align?:
            | ('colon' | 'value')
            | {
                readonly mode?: 'strict' | 'minimum';
                readonly on?: 'colon' | 'value';
                readonly beforeColon?: boolean;
                readonly afterColon?: boolean;
              };
          readonly mode?: 'strict' | 'minimum';
          readonly beforeColon?: boolean;
          readonly afterColon?: boolean;
        };
      }
    | {
        readonly singleLine?: {
          readonly mode?: 'strict' | 'minimum';
          readonly beforeColon?: boolean;
          readonly afterColon?: boolean;
        };
        readonly multiLine?: {
          readonly mode?: 'strict' | 'minimum';
          readonly beforeColon?: boolean;
          readonly afterColon?: boolean;
        };
        readonly align?: {
          readonly mode?: 'strict' | 'minimum';
          readonly on?: 'colon' | 'value';
          readonly beforeColon?: boolean;
          readonly afterColon?: boolean;
        };
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent spacing before and after keywords
 * @link https://eslint.org/docs/rules/keyword-spacing
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = {
    readonly before?: boolean;
    readonly after?: boolean;
    readonly overrides?: {
      readonly abstract?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly as?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly async?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly await?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly boolean?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly break?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly byte?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly case?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly catch?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly char?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly class?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly const?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly continue?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly debugger?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly default?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly delete?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly do?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly double?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly else?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly enum?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly export?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly extends?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly false?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly final?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly finally?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly float?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly for?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly from?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly function?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly get?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly goto?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly if?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly implements?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly import?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly in?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly instanceof?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly int?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly interface?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly let?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly long?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly native?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly new?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly null?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly of?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly package?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly private?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly protected?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly public?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly return?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly set?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly short?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly static?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly super?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly switch?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly synchronized?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly this?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly throw?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly throws?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly transient?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly true?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly try?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly typeof?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly var?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly void?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly volatile?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly while?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly with?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly yield?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
    };
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce position of line comments
 * @link https://eslint.org/docs/rules/line-comment-position
 *
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | recommended | false  |
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
    | ('above' | 'beside')
    | {
        readonly position?: 'above' | 'beside';
        readonly ignorePattern?: string;
        readonly applyDefaultPatterns?: boolean;
        readonly applyDefaultIgnorePatterns?: boolean;
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent linebreak style
 * @link https://eslint.org/docs/rules/linebreak-style
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = 'unix' | 'windows';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require empty lines around comments
 * @link https://eslint.org/docs/rules/lines-around-comment
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = {
    readonly beforeBlockComment?: boolean;
    readonly afterBlockComment?: boolean;
    readonly beforeLineComment?: boolean;
    readonly afterLineComment?: boolean;
    readonly allowBlockStart?: boolean;
    readonly allowBlockEnd?: boolean;
    readonly allowClassStart?: boolean;
    readonly allowClassEnd?: boolean;
    readonly allowObjectStart?: boolean;
    readonly allowObjectEnd?: boolean;
    readonly allowArrayStart?: boolean;
    readonly allowArrayEnd?: boolean;
    readonly ignorePattern?: string;
    readonly applyDefaultIgnorePatterns?: boolean;
    readonly afterHashbangComment?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require or disallow newlines around directives
 * @link https://eslint.org/docs/rules/lines-around-directive
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type RuleEntry = 'off';
}

/**
 * @description Require or disallow an empty line between class members
 * @link https://eslint.org/docs/rules/lines-between-class-members
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 */
namespace LinesBetweenClassMembers {
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
  export type Options0 = 'always' | 'never';

  export type Options1 = {
    readonly exceptAfterSingleLine?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Require or disallow logical assignment logical operator shorthand
 * @link https://eslint.org/docs/rules/logical-assignment-operators
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
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
    | readonly []
    | readonly ['always']
    | readonly [
        'always',
        {
          readonly enforceForIfStatements?: boolean;
        }
      ]
    | readonly ['never'];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce a maximum number of classes per file
 * @link https://eslint.org/docs/rules/max-classes-per-file
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce a maximum depth that blocks can be nested
 * @link https://eslint.org/docs/rules/max-depth
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce a maximum line length
 * @link https://eslint.org/docs/rules/max-len
 *
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | recommended | false  |
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
  export type Options0 =
    | {
        readonly code?: number;
        readonly comments?: number;
        readonly tabWidth?: number;
        readonly ignorePattern?: string;
        readonly ignoreComments?: boolean;
        readonly ignoreStrings?: boolean;
        readonly ignoreUrls?: boolean;
        readonly ignoreTemplateLiterals?: boolean;
        readonly ignoreRegExpLiterals?: boolean;
        readonly ignoreTrailingComments?: boolean;
      }
    | number;

  export type Options1 =
    | {
        readonly code?: number;
        readonly comments?: number;
        readonly tabWidth?: number;
        readonly ignorePattern?: string;
        readonly ignoreComments?: boolean;
        readonly ignoreStrings?: boolean;
        readonly ignoreUrls?: boolean;
        readonly ignoreTemplateLiterals?: boolean;
        readonly ignoreRegExpLiterals?: boolean;
        readonly ignoreTrailingComments?: boolean;
      }
    | number;

  export type Options2 = {
    readonly code?: number;
    readonly comments?: number;
    readonly tabWidth?: number;
    readonly ignorePattern?: string;
    readonly ignoreComments?: boolean;
    readonly ignoreStrings?: boolean;
    readonly ignoreUrls?: boolean;
    readonly ignoreTemplateLiterals?: boolean;
    readonly ignoreRegExpLiterals?: boolean;
    readonly ignoreTrailingComments?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1]
    | readonly [Linter.RuleLevel, Options0, Options1, Options2];
}

/**
 * @description Enforce a maximum number of lines per file
 * @link https://eslint.org/docs/rules/max-lines
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce a maximum number of lines of code in a function
 * @link https://eslint.org/docs/rules/max-lines-per-function
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | {
        readonly max?: number;
        readonly skipComments?: boolean;
        readonly skipBlankLines?: boolean;
        readonly IIFEs?: boolean;
      }
    | number;

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce a maximum depth that callbacks can be nested
 * @link https://eslint.org/docs/rules/max-nested-callbacks
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce a maximum number of parameters in function definitions
 * @link https://eslint.org/docs/rules/max-params
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce a maximum number of statements allowed in function blocks
 * @link https://eslint.org/docs/rules/max-statements
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Enforce a maximum number of statements allowed per line
 * @link https://eslint.org/docs/rules/max-statements-per-line
 *
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | recommended | false  |
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
  export type Options = {
    readonly max?: number;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce a particular style for multiline comments
 * @link https://eslint.org/docs/rules/multiline-comment-style
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
   *           "enum": [
   *             "starred-block",
   *             "bare-block"
   *           ]
   *         }
   *       ],
   *       "additionalItems": false
   *     },
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": [
   *             "separate-lines"
   *           ]
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
    | readonly []
    | readonly ['starred-block' | 'bare-block']
    | readonly []
    | readonly ['separate-lines']
    | readonly [
        'separate-lines',
        {
          readonly checkJSDoc?: boolean;
        }
      ];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce newlines between operands of ternary expressions
 * @link https://eslint.org/docs/rules/multiline-ternary
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = 'always' | 'always-multiline' | 'never';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require constructor names to begin with a capital letter
 * @link https://eslint.org/docs/rules/new-cap
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce or disallow parentheses when invoking a constructor with no arguments
 * @link https://eslint.org/docs/rules/new-parens
 *
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | fixable     | code   |
 *  | recommended | false  |
 */
namespace NewParens {
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
   *             "never"
   *           ]
   *         }
   *       ],
   *       "minItems": 0,
   *       "maxItems": 1
   *     }
   *   ]
   * }
   * ```
   */
  export type Options = readonly [] | readonly ['always' | 'never'];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require or disallow an empty line after variable declarations
 * @link https://eslint.org/docs/rules/newline-after-var
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type RuleEntry = 'off';
}

/**
 * @description Require an empty line before `return` statements
 * @link https://eslint.org/docs/rules/newline-before-return
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 */
namespace NewlineBeforeReturn {
  export type RuleEntry = 'off';
}

/**
 * @description Require a newline after each call in a method chain
 * @link https://eslint.org/docs/rules/newline-per-chained-call
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = {
    readonly ignoreChainWithDepth?: number;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow the use of `alert`, `confirm`, and `prompt`
 * @link https://eslint.org/docs/rules/no-alert
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoAlert {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `Array` constructors
 * @link https://eslint.org/docs/rules/no-array-constructor
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoArrayConstructor {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow using an async function as a Promise executor
 * @link https://eslint.org/docs/rules/no-async-promise-executor
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoAsyncPromiseExecutor {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `await` inside of loops
 * @link https://eslint.org/docs/rules/no-await-in-loop
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 */
namespace NoAwaitInLoop {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow bitwise operators
 * @link https://eslint.org/docs/rules/no-bitwise
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    readonly int32Hint?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow use of the `Buffer()` constructor
 * @link https://eslint.org/docs/rules/no-buffer-constructor
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | true    |
 *  | recommended | false   |
 */
namespace NoBufferConstructor {
  export type RuleEntry = 'off';
}

/**
 * @description Disallow the use of `arguments.caller` or `arguments.callee`
 * @link https://eslint.org/docs/rules/no-caller
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoCaller {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow lexical declarations in case clauses
 * @link https://eslint.org/docs/rules/no-case-declarations
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 */
namespace NoCaseDeclarations {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `catch` clause parameters from shadowing variables in the outer scope
 * @link https://eslint.org/docs/rules/no-catch-shadow
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 */
namespace NoCatchShadow {
  export type RuleEntry = 'off';
}

/**
 * @description Disallow reassigning class members
 * @link https://eslint.org/docs/rules/no-class-assign
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoClassAssign {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow comparing against -0
 * @link https://eslint.org/docs/rules/no-compare-neg-zero
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoCompareNegZero {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow assignment operators in conditional expressions
 * @link https://eslint.org/docs/rules/no-cond-assign
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow arrow functions where they could be confused with comparisons
 * @link https://eslint.org/docs/rules/no-confusing-arrow
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
  export type Options = {
    readonly allowParens?: boolean;
    readonly onlyOneSimpleParam?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow the use of `console`
 * @link https://eslint.org/docs/rules/no-console
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    /**
     * @minItems 1
     */
    readonly allow?: readonly [string, ...(readonly string[])];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow reassigning `const` variables
 * @link https://eslint.org/docs/rules/no-const-assign
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoConstAssign {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow expressions where the operation doesn't affect the value
 * @link https://eslint.org/docs/rules/no-constant-binary-expression
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 */
namespace NoConstantBinaryExpression {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow constant expressions in conditions
 * @link https://eslint.org/docs/rules/no-constant-condition
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow returning value from constructor
 * @link https://eslint.org/docs/rules/no-constructor-return
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow `continue` statements
 * @link https://eslint.org/docs/rules/no-continue
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoContinue {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow control characters in regular expressions
 * @link https://eslint.org/docs/rules/no-control-regex
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoControlRegex {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow the use of `debugger`
 * @link https://eslint.org/docs/rules/no-debugger
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoDebugger {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow deleting variables
 * @link https://eslint.org/docs/rules/no-delete-var
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 */
namespace NoDeleteVar {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow division operators explicitly at the beginning of regular expressions
 * @link https://eslint.org/docs/rules/no-div-regex
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 */
namespace NoDivRegex {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow duplicate arguments in `function` definitions
 * @link https://eslint.org/docs/rules/no-dupe-args
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoDupeArgs {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow duplicate class members
 * @link https://eslint.org/docs/rules/no-dupe-class-members
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoDupeClassMembers {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow duplicate conditions in if-else-if chains
 * @link https://eslint.org/docs/rules/no-dupe-else-if
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoDupeElseIf {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow duplicate keys in object literals
 * @link https://eslint.org/docs/rules/no-dupe-keys
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoDupeKeys {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow duplicate case labels
 * @link https://eslint.org/docs/rules/no-duplicate-case
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoDuplicateCase {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow duplicate module imports
 * @link https://eslint.org/docs/rules/no-duplicate-imports
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow `else` blocks after `return` statements in `if` statements
 * @link https://eslint.org/docs/rules/no-else-return
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow empty block statements
 * @link https://eslint.org/docs/rules/no-empty
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow empty character classes in regular expressions
 * @link https://eslint.org/docs/rules/no-empty-character-class
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoEmptyCharacterClass {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow empty functions
 * @link https://eslint.org/docs/rules/no-empty-function
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    )[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow empty destructuring patterns
 * @link https://eslint.org/docs/rules/no-empty-pattern
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoEmptyPattern {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow empty static blocks
 * @link https://eslint.org/docs/rules/no-empty-static-block
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoEmptyStaticBlock {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `null` comparisons without type-checking operators
 * @link https://eslint.org/docs/rules/no-eq-null
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoEqNull {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow the use of `eval()`
 * @link https://eslint.org/docs/rules/no-eval
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow reassigning exceptions in `catch` clauses
 * @link https://eslint.org/docs/rules/no-ex-assign
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoExAssign {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow extending native types
 * @link https://eslint.org/docs/rules/no-extend-native
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow unnecessary calls to `.bind()`
 * @link https://eslint.org/docs/rules/no-extra-bind
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 */
namespace NoExtraBind {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow unnecessary boolean casts
 * @link https://eslint.org/docs/rules/no-extra-boolean-cast
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow unnecessary labels
 * @link https://eslint.org/docs/rules/no-extra-label
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 */
namespace NoExtraLabel {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow unnecessary parentheses
 * @link https://eslint.org/docs/rules/no-extra-parens
 *
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | fixable     | code   |
 *  | recommended | false  |
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
   *           "enum": [
   *             "functions"
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
   *             "all"
   *           ]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "conditionalAssign": {
   *               "type": "boolean"
   *             },
   *             "nestedBinaryExpressions": {
   *               "type": "boolean"
   *             },
   *             "returnAssign": {
   *               "type": "boolean"
   *             },
   *             "ignoreJSX": {
   *               "enum": [
   *                 "none",
   *                 "all",
   *                 "single-line",
   *                 "multi-line"
   *               ]
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
  export type Options =
    | readonly []
    | readonly ['functions']
    | readonly []
    | readonly ['all']
    | readonly [
        'all',
        {
          readonly conditionalAssign?: boolean;
          readonly nestedBinaryExpressions?: boolean;
          readonly returnAssign?: boolean;
          readonly ignoreJSX?: 'none' | 'all' | 'single-line' | 'multi-line';
          readonly enforceForArrowConditionals?: boolean;
          readonly enforceForSequenceExpressions?: boolean;
          readonly enforceForNewInMemberExpressions?: boolean;
          readonly enforceForFunctionPrototypeMethods?: boolean;
          readonly allowParensAfterCommentPattern?: string;
        }
      ];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow unnecessary semicolons
 * @link https://eslint.org/docs/rules/no-extra-semi
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 */
namespace NoExtraSemi {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow fallthrough of `case` statements
 * @link https://eslint.org/docs/rules/no-fallthrough
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow leading or trailing decimal points in numeric literals
 * @link https://eslint.org/docs/rules/no-floating-decimal
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 */
namespace NoFloatingDecimal {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow reassigning `function` declarations
 * @link https://eslint.org/docs/rules/no-func-assign
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoFuncAssign {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow assignments to native objects or read-only global variables
 * @link https://eslint.org/docs/rules/no-global-assign
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow shorthand type conversions
 * @link https://eslint.org/docs/rules/no-implicit-coercion
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
    readonly allow?: readonly ('~' | '!!' | '+' | '*')[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow declarations in the global scope
 * @link https://eslint.org/docs/rules/no-implicit-globals
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow the use of `eval()`-like methods
 * @link https://eslint.org/docs/rules/no-implied-eval
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoImpliedEval {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow assigning to imported bindings
 * @link https://eslint.org/docs/rules/no-import-assign
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoImportAssign {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow inline comments after code
 * @link https://eslint.org/docs/rules/no-inline-comments
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow variable or `function` declarations in nested blocks
 * @link https://eslint.org/docs/rules/no-inner-declarations
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
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
  export type Options = 'functions' | 'both';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow invalid regular expression strings in `RegExp` constructors
 * @link https://eslint.org/docs/rules/no-invalid-regexp
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow use of `this` in contexts where the value of `this` is `undefined`
 * @link https://eslint.org/docs/rules/no-invalid-this
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow irregular whitespace
 * @link https://eslint.org/docs/rules/no-irregular-whitespace
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
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
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow the use of the `__iterator__` property
 * @link https://eslint.org/docs/rules/no-iterator
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoIterator {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow labels that share a name with a variable
 * @link https://eslint.org/docs/rules/no-label-var
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoLabelVar {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow labeled statements
 * @link https://eslint.org/docs/rules/no-labels
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow unnecessary nested blocks
 * @link https://eslint.org/docs/rules/no-lone-blocks
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoLoneBlocks {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `if` statements as the only statement in `else` blocks
 * @link https://eslint.org/docs/rules/no-lonely-if
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 */
namespace NoLonelyIf {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow function declarations that contain unsafe references inside loop statements
 * @link https://eslint.org/docs/rules/no-loop-func
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoLoopFunc {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow literal numbers that lose precision
 * @link https://eslint.org/docs/rules/no-loss-of-precision
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoLossOfPrecision {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow magic numbers
 * @link https://eslint.org/docs/rules/no-magic-numbers
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow characters which are made with multiple code points in character class syntax
 * @link https://eslint.org/docs/rules/no-misleading-character-class
 *
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 */
namespace NoMisleadingCharacterClass {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow mixed binary operators
 * @link https://eslint.org/docs/rules/no-mixed-operators
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
  export type Options = {
    readonly groups?: readonly (readonly [
      (
        | '+'
        | '-'
        | '*'
        | '/'
        | '%'
        | '**'
        | '&'
        | '|'
        | '^'
        | '~'
        | '<<'
        | '>>'
        | '>>>'
        | '=='
        | '!='
        | '==='
        | '!=='
        | '>'
        | '>='
        | '<'
        | '<='
        | '&&'
        | '||'
        | 'in'
        | 'instanceof'
        | '?:'
        | '??'
      ),
      (
        | '+'
        | '-'
        | '*'
        | '/'
        | '%'
        | '**'
        | '&'
        | '|'
        | '^'
        | '~'
        | '<<'
        | '>>'
        | '>>>'
        | '=='
        | '!='
        | '==='
        | '!=='
        | '>'
        | '>='
        | '<'
        | '<='
        | '&&'
        | '||'
        | 'in'
        | 'instanceof'
        | '?:'
        | '??'
      ),
      ...(readonly (
        | '+'
        | '-'
        | '*'
        | '/'
        | '%'
        | '**'
        | '&'
        | '|'
        | '^'
        | '~'
        | '<<'
        | '>>'
        | '>>>'
        | '=='
        | '!='
        | '==='
        | '!=='
        | '>'
        | '>='
        | '<'
        | '<='
        | '&&'
        | '||'
        | 'in'
        | 'instanceof'
        | '?:'
        | '??'
      )[])
    ])[];
    readonly allowSamePrecedence?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow `require` calls to be mixed with regular variable declarations
 * @link https://eslint.org/docs/rules/no-mixed-requires
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
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
  export type RuleEntry = 'off';
}

/**
 * @description Disallow mixed spaces and tabs for indentation
 * @link https://eslint.org/docs/rules/no-mixed-spaces-and-tabs
 *
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | recommended | true   |
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
  export type Options = 'smart-tabs' | true | false;

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow use of chained assignment expressions
 * @link https://eslint.org/docs/rules/no-multi-assign
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow multiple spaces
 * @link https://eslint.org/docs/rules/no-multi-spaces
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = {
    readonly exceptions?: Record<string, boolean>;
    readonly ignoreEOLComments?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow multiline strings
 * @link https://eslint.org/docs/rules/no-multi-str
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoMultiStr {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow multiple empty lines
 * @link https://eslint.org/docs/rules/no-multiple-empty-lines
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = {
    readonly max: number;
    readonly maxEOF?: number;
    readonly maxBOF?: number;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow assignments to native objects or read-only global variables
 * @link https://eslint.org/docs/rules/no-native-reassign
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
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
  export type RuleEntry = 'off';
}

/**
 * @description Disallow negated conditions
 * @link https://eslint.org/docs/rules/no-negated-condition
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoNegatedCondition {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow negating the left operand in `in` expressions
 * @link https://eslint.org/docs/rules/no-negated-in-lhs
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | true    |
 *  | recommended | false   |
 */
namespace NoNegatedInLhs {
  export type RuleEntry = 'off';
}

/**
 * @description Disallow nested ternary expressions
 * @link https://eslint.org/docs/rules/no-nested-ternary
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoNestedTernary {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `new` operators outside of assignments or comparisons
 * @link https://eslint.org/docs/rules/no-new
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoNew {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `new` operators with the `Function` object
 * @link https://eslint.org/docs/rules/no-new-func
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoNewFunc {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `new` operators with global non-constructor functions
 * @link https://eslint.org/docs/rules/no-new-native-nonconstructor
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 */
namespace NoNewNativeNonconstructor {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `Object` constructors
 * @link https://eslint.org/docs/rules/no-new-object
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoNewObject {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `new` operators with calls to `require`
 * @link https://eslint.org/docs/rules/no-new-require
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 */
namespace NoNewRequire {
  export type RuleEntry = 'off';
}

/**
 * @description Disallow `new` operators with the `Symbol` object
 * @link https://eslint.org/docs/rules/no-new-symbol
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoNewSymbol {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `new` operators with the `String`, `Number`, and `Boolean` objects
 * @link https://eslint.org/docs/rules/no-new-wrappers
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoNewWrappers {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `\8` and `\9` escape sequences in string literals
 * @link https://eslint.org/docs/rules/no-nonoctal-decimal-escape
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 */
namespace NoNonoctalDecimalEscape {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow calling global object properties as functions
 * @link https://eslint.org/docs/rules/no-obj-calls
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoObjCalls {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow octal literals
 * @link https://eslint.org/docs/rules/no-octal
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 */
namespace NoOctal {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow octal escape sequences in string literals
 * @link https://eslint.org/docs/rules/no-octal-escape
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoOctalEscape {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow reassigning `function` parameters
 * @link https://eslint.org/docs/rules/no-param-reassign
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow string concatenation with `__dirname` and `__filename`
 * @link https://eslint.org/docs/rules/no-path-concat
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 */
namespace NoPathConcat {
  export type RuleEntry = 'off';
}

/**
 * @description Disallow the unary operators `++` and `--`
 * @link https://eslint.org/docs/rules/no-plusplus
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow the use of `process.env`
 * @link https://eslint.org/docs/rules/no-process-env
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 */
namespace NoProcessEnv {
  export type RuleEntry = 'off';
}

/**
 * @description Disallow the use of `process.exit()`
 * @link https://eslint.org/docs/rules/no-process-exit
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
 */
namespace NoProcessExit {
  export type RuleEntry = 'off';
}

/**
 * @description Disallow returning values from Promise executor functions
 * @link https://eslint.org/docs/rules/no-promise-executor-return
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 */
namespace NoPromiseExecutorReturn {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow the use of the `__proto__` property
 * @link https://eslint.org/docs/rules/no-proto
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoProto {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow calling some `Object.prototype` methods directly on objects
 * @link https://eslint.org/docs/rules/no-prototype-builtins
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoPrototypeBuiltins {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow variable redeclaration
 * @link https://eslint.org/docs/rules/no-redeclare
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow multiple spaces in regular expressions
 * @link https://eslint.org/docs/rules/no-regex-spaces
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 */
namespace NoRegexSpaces {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow specified names in exports
 * @link https://eslint.org/docs/rules/no-restricted-exports
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
      }
    | {
        readonly restrictedNamedExports?: readonly string[];
        readonly restrictDefaultExports?: {
          readonly direct?: boolean;
          readonly named?: boolean;
          readonly defaultFrom?: boolean;
          readonly namedFrom?: boolean;
          readonly namespaceFrom?: boolean;
        };
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow specified global variables
 * @link https://eslint.org/docs/rules/no-restricted-globals
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
   *         "required": [
   *           "name"
   *         ],
   *         "additionalProperties": false
   *       }
   *     ]
   *   },
   *   "uniqueItems": true,
   *   "minItems": 0
   * }
   * ```
   */
  /**
   * @minItems 0
   */
  export type Options = readonly (
    | string
    | {
        readonly name: string;
        readonly message?: string;
      }
  )[];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow specified modules when loaded by `import`
 * @link https://eslint.org/docs/rules/no-restricted-imports
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
   *             "required": [
   *               "name"
   *             ]
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
   *                     "required": [
   *                       "name"
   *                     ]
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
   *                       "message": {
   *                         "type": "string",
   *                         "minLength": 1
   *                       },
   *                       "caseSensitive": {
   *                         "type": "boolean"
   *                       }
   *                     },
   *                     "additionalProperties": false,
   *                     "required": [
   *                       "group"
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
        | {
            readonly name: string;
            readonly message?: string;
            readonly importNames?: readonly string[];
          }
      )[]
    | readonly []
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
            | readonly string[]
            | readonly {
                /**
                 * @minItems 1
                 */
                readonly importNames?: readonly [
                  string,
                  ...(readonly string[])
                ];
                /**
                 * @minItems 1
                 */
                readonly group: readonly [string, ...(readonly string[])];
                readonly message?: string;
                readonly caseSensitive?: boolean;
              }[];
        }
      ];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow specified modules when loaded by `require`
 * @link https://eslint.org/docs/rules/no-restricted-modules
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
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
   *             "required": [
   *               "name"
   *             ]
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
   *                   "required": [
   *                     "name"
   *                   ]
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
  export type RuleEntry = 'off';
}

/**
 * @description Disallow certain properties on certain objects
 * @link https://eslint.org/docs/rules/no-restricted-properties
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
   *         "required": [
   *           "object"
   *         ]
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
   *         "required": [
   *           "property"
   *         ]
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow specified syntax
 * @link https://eslint.org/docs/rules/no-restricted-syntax
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
   *         "required": [
   *           "selector"
   *         ],
   *         "additionalProperties": false
   *       }
   *     ]
   *   },
   *   "uniqueItems": true,
   *   "minItems": 0
   * }
   * ```
   */
  /**
   * @minItems 0
   */
  export type Options = readonly (
    | string
    | {
        readonly selector: string;
        readonly message?: string;
      }
  )[];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow assignment operators in `return` statements
 * @link https://eslint.org/docs/rules/no-return-assign
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow unnecessary `return await`
 * @link https://eslint.org/docs/rules/no-return-await
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 */
namespace NoReturnAwait {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `javascript:` urls
 * @link https://eslint.org/docs/rules/no-script-url
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoScriptUrl {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow assignments where both sides are exactly the same
 * @link https://eslint.org/docs/rules/no-self-assign
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow comparisons where both sides are exactly the same
 * @link https://eslint.org/docs/rules/no-self-compare
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 */
namespace NoSelfCompare {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow comma operators
 * @link https://eslint.org/docs/rules/no-sequences
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow returning values from setters
 * @link https://eslint.org/docs/rules/no-setter-return
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoSetterReturn {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow variable declarations from shadowing variables declared in the outer scope
 * @link https://eslint.org/docs/rules/no-shadow
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow identifiers from shadowing restricted names
 * @link https://eslint.org/docs/rules/no-shadow-restricted-names
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 */
namespace NoShadowRestrictedNames {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow spacing between function identifiers and their applications (deprecated)
 * @link https://eslint.org/docs/rules/no-spaced-func
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | deprecated  | true       |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 */
namespace NoSpacedFunc {
  export type RuleEntry = 'off';
}

/**
 * @description Disallow sparse arrays
 * @link https://eslint.org/docs/rules/no-sparse-arrays
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoSparseArrays {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow synchronous methods
 * @link https://eslint.org/docs/rules/no-sync
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
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
  export type RuleEntry = 'off';
}

/**
 * @description Disallow all tabs
 * @link https://eslint.org/docs/rules/no-tabs
 *
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | recommended | false  |
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
  export type Options = {
    readonly allowIndentationTabs?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow template literal placeholder syntax in regular strings
 * @link https://eslint.org/docs/rules/no-template-curly-in-string
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 */
namespace NoTemplateCurlyInString {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow ternary operators
 * @link https://eslint.org/docs/rules/no-ternary
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoTernary {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `this`/`super` before calling `super()` in constructors
 * @link https://eslint.org/docs/rules/no-this-before-super
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoThisBeforeSuper {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow throwing literals as exceptions
 * @link https://eslint.org/docs/rules/no-throw-literal
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoThrowLiteral {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow trailing whitespace at the end of lines
 * @link https://eslint.org/docs/rules/no-trailing-spaces
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = {
    readonly skipBlankLines?: boolean;
    readonly ignoreComments?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow the use of undeclared variables unless mentioned in ` global  ` comments
 * @link https://eslint.org/docs/rules/no-undef
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow initializing variables to `undefined`
 * @link https://eslint.org/docs/rules/no-undef-init
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 */
namespace NoUndefInit {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow the use of `undefined` as an identifier
 * @link https://eslint.org/docs/rules/no-undefined
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoUndefined {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow dangling underscores in identifiers
 * @link https://eslint.org/docs/rules/no-underscore-dangle
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow confusing multiline expressions
 * @link https://eslint.org/docs/rules/no-unexpected-multiline
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoUnexpectedMultiline {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow unmodified loop conditions
 * @link https://eslint.org/docs/rules/no-unmodified-loop-condition
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 */
namespace NoUnmodifiedLoopCondition {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow ternary operators when simpler alternatives exist
 * @link https://eslint.org/docs/rules/no-unneeded-ternary
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow unreachable code after `return`, `throw`, `continue`, and `break` statements
 * @link https://eslint.org/docs/rules/no-unreachable
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoUnreachable {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow loops with a body that allows only one iteration
 * @link https://eslint.org/docs/rules/no-unreachable-loop
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
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
      | 'WhileStatement'
      | 'DoWhileStatement'
      | 'ForStatement'
      | 'ForInStatement'
      | 'ForOfStatement'
    )[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow control flow statements in `finally` blocks
 * @link https://eslint.org/docs/rules/no-unsafe-finally
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoUnsafeFinally {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow negating the left operand of relational operators
 * @link https://eslint.org/docs/rules/no-unsafe-negation
 *
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow use of optional chaining in contexts where the `undefined` value is not allowed
 * @link https://eslint.org/docs/rules/no-unsafe-optional-chaining
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow unused expressions
 * @link https://eslint.org/docs/rules/no-unused-expressions
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow unused labels
 * @link https://eslint.org/docs/rules/no-unused-labels
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | true       |
 */
namespace NoUnusedLabels {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow unused private class members
 * @link https://eslint.org/docs/rules/no-unused-private-class-members
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 */
namespace NoUnusedPrivateClassMembers {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow unused variables
 * @link https://eslint.org/docs/rules/no-unused-vars
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
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
    | ('all' | 'local')
    | {
        readonly vars?: 'all' | 'local';
        readonly varsIgnorePattern?: string;
        readonly args?: 'all' | 'after-used' | 'none';
        readonly ignoreRestSiblings?: boolean;
        readonly argsIgnorePattern?: string;
        readonly caughtErrors?: 'all' | 'none';
        readonly caughtErrorsIgnorePattern?: string;
        readonly destructuredArrayIgnorePattern?: string;
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow the use of variables before they are defined
 * @link https://eslint.org/docs/rules/no-use-before-define
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow useless backreferences in regular expressions
 * @link https://eslint.org/docs/rules/no-useless-backreference
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoUselessBackreference {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow unnecessary calls to `.call()` and `.apply()`
 * @link https://eslint.org/docs/rules/no-useless-call
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoUselessCall {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow unnecessary `catch` clauses
 * @link https://eslint.org/docs/rules/no-useless-catch
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 */
namespace NoUselessCatch {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow unnecessary computed property keys in objects and classes
 * @link https://eslint.org/docs/rules/no-useless-computed-key
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow unnecessary concatenation of literals or template literals
 * @link https://eslint.org/docs/rules/no-useless-concat
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoUselessConcat {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow unnecessary constructors
 * @link https://eslint.org/docs/rules/no-useless-constructor
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoUselessConstructor {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow unnecessary escape characters
 * @link https://eslint.org/docs/rules/no-useless-escape
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 */
namespace NoUselessEscape {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow renaming import, export, and destructured assignments to the same name
 * @link https://eslint.org/docs/rules/no-useless-rename
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow redundant return statements
 * @link https://eslint.org/docs/rules/no-useless-return
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 */
namespace NoUselessReturn {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require `let` or `const` instead of `var`
 * @link https://eslint.org/docs/rules/no-var
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 */
namespace NoVar {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `void` operators
 * @link https://eslint.org/docs/rules/no-void
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow specified warning terms in comments
 * @link https://eslint.org/docs/rules/no-warning-comments
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    readonly location?: 'start' | 'anywhere';
    /**
     * @minItems 1
     */
    readonly decoration?: readonly [string, ...(readonly string[])];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow whitespace before properties
 * @link https://eslint.org/docs/rules/no-whitespace-before-property
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 */
namespace NoWhitespaceBeforeProperty {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `with` statements
 * @link https://eslint.org/docs/rules/no-with
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 */
namespace NoWith {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce the location of single-line statements
 * @link https://eslint.org/docs/rules/nonblock-statement-body-position
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options0 = 'beside' | 'below' | 'any';

  export type Options1 = {
    readonly overrides?: {
      readonly if?: 'beside' | 'below' | 'any';
      readonly else?: 'beside' | 'below' | 'any';
      readonly while?: 'beside' | 'below' | 'any';
      readonly do?: 'beside' | 'below' | 'any';
      readonly for?: 'beside' | 'below' | 'any';
    };
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Enforce consistent line breaks after opening and before closing braces
 * @link https://eslint.org/docs/rules/object-curly-newline
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options =
    | (
        | ('always' | 'never')
        | {
            readonly multiline?: boolean;
            readonly minProperties?: number;
            readonly consistent?: boolean;
          }
      )
    | {
        readonly ObjectExpression?:
          | ('always' | 'never')
          | {
              readonly multiline?: boolean;
              readonly minProperties?: number;
              readonly consistent?: boolean;
            };
        readonly ObjectPattern?:
          | ('always' | 'never')
          | {
              readonly multiline?: boolean;
              readonly minProperties?: number;
              readonly consistent?: boolean;
            };
        readonly ImportDeclaration?:
          | ('always' | 'never')
          | {
              readonly multiline?: boolean;
              readonly minProperties?: number;
              readonly consistent?: boolean;
            };
        readonly ExportDeclaration?:
          | ('always' | 'never')
          | {
              readonly multiline?: boolean;
              readonly minProperties?: number;
              readonly consistent?: boolean;
            };
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent spacing inside braces
 * @link https://eslint.org/docs/rules/object-curly-spacing
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options0 = 'always' | 'never';

  export type Options1 = {
    readonly arraysInObjects?: boolean;
    readonly objectsInObjects?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Enforce placing object properties on separate lines
 * @link https://eslint.org/docs/rules/object-property-newline
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = {
    readonly allowAllPropertiesOnSameLine?: boolean;
    readonly allowMultiplePropertiesPerLine?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require or disallow method and property shorthand syntax for object literals
 * @link https://eslint.org/docs/rules/object-shorthand
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
   *           "enum": [
   *             "always",
   *             "methods",
   *             "properties"
   *           ]
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
   *           "enum": [
   *             "always",
   *             "methods"
   *           ]
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
        | 'consistent-as-needed'
      ]
    | readonly []
    | readonly ['always' | 'methods' | 'properties']
    | readonly [
        'always' | 'methods' | 'properties',
        {
          readonly avoidQuotes?: boolean;
        }
      ]
    | readonly []
    | readonly ['always' | 'methods']
    | readonly [
        'always' | 'methods',
        {
          readonly ignoreConstructors?: boolean;
          readonly methodsIgnorePattern?: string;
          readonly avoidQuotes?: boolean;
          readonly avoidExplicitReturnArrows?: boolean;
        }
      ];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce variables to be declared either together or separately in functions
 * @link https://eslint.org/docs/rules/one-var
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
    | ('always' | 'never' | 'consecutive')
    | {
        readonly separateRequires?: boolean;
        readonly var?: 'always' | 'never' | 'consecutive';
        readonly let?: 'always' | 'never' | 'consecutive';
        readonly const?: 'always' | 'never' | 'consecutive';
      }
    | {
        readonly initialized?: 'always' | 'never' | 'consecutive';
        readonly uninitialized?: 'always' | 'never' | 'consecutive';
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require or disallow newlines around variable declarations
 * @link https://eslint.org/docs/rules/one-var-declaration-per-line
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = 'always' | 'initializations';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require or disallow assignment operator shorthand where possible
 * @link https://eslint.org/docs/rules/operator-assignment
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent linebreak style for operators
 * @link https://eslint.org/docs/rules/operator-linebreak
 *
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | fixable     | code   |
 *  | recommended | false  |
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
  export type Options0 = 'after' | 'before' | 'none' | null;

  export type Options1 = {
    readonly overrides?: Record<string, 'after' | 'before' | 'none' | 'ignore'>;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Require or disallow padding within blocks
 * @link https://eslint.org/docs/rules/padded-blocks
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options0 =
    | ('always' | 'never')
    | {
        readonly blocks?: 'always' | 'never';
        readonly switches?: 'always' | 'never';
        readonly classes?: 'always' | 'never';
      };

  export type Options1 = {
    readonly allowSingleLineBlocks?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Require or disallow padding lines between statements
 * @link https://eslint.org/docs/rules/padding-line-between-statements
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 */
namespace PaddingLineBetweenStatements {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "definitions": {
   *     "paddingType": {
   *       "enum": [
   *         "any",
   *         "never",
   *         "always"
   *       ]
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
   *     "required": [
   *       "blankLine",
   *       "prev",
   *       "next"
   *     ]
   *   }
   * }
   * ```
   */
  export type PaddingType = 'any' | 'never' | 'always';
  export type StatementType =
    | (
        | '*'
        | 'block-like'
        | 'cjs-export'
        | 'cjs-import'
        | 'directive'
        | 'expression'
        | 'iife'
        | 'multiline-block-like'
        | 'multiline-expression'
        | 'multiline-const'
        | 'multiline-let'
        | 'multiline-var'
        | 'singleline-const'
        | 'singleline-let'
        | 'singleline-var'
        | 'block'
        | 'empty'
        | 'function'
        | 'break'
        | 'case'
        | 'class'
        | 'const'
        | 'continue'
        | 'debugger'
        | 'default'
        | 'do'
        | 'export'
        | 'for'
        | 'if'
        | 'import'
        | 'let'
        | 'return'
        | 'switch'
        | 'throw'
        | 'try'
        | 'var'
        | 'while'
        | 'with'
      )
    | readonly [
        (
          | '*'
          | 'block-like'
          | 'cjs-export'
          | 'cjs-import'
          | 'directive'
          | 'expression'
          | 'iife'
          | 'multiline-block-like'
          | 'multiline-expression'
          | 'multiline-const'
          | 'multiline-let'
          | 'multiline-var'
          | 'singleline-const'
          | 'singleline-let'
          | 'singleline-var'
          | 'block'
          | 'empty'
          | 'function'
          | 'break'
          | 'case'
          | 'class'
          | 'const'
          | 'continue'
          | 'debugger'
          | 'default'
          | 'do'
          | 'export'
          | 'for'
          | 'if'
          | 'import'
          | 'let'
          | 'return'
          | 'switch'
          | 'throw'
          | 'try'
          | 'var'
          | 'while'
          | 'with'
        ),
        ...(readonly (
          | '*'
          | 'block-like'
          | 'cjs-export'
          | 'cjs-import'
          | 'directive'
          | 'expression'
          | 'iife'
          | 'multiline-block-like'
          | 'multiline-expression'
          | 'multiline-const'
          | 'multiline-let'
          | 'multiline-var'
          | 'singleline-const'
          | 'singleline-let'
          | 'singleline-var'
          | 'block'
          | 'empty'
          | 'function'
          | 'break'
          | 'case'
          | 'class'
          | 'const'
          | 'continue'
          | 'debugger'
          | 'default'
          | 'do'
          | 'export'
          | 'for'
          | 'if'
          | 'import'
          | 'let'
          | 'return'
          | 'switch'
          | 'throw'
          | 'try'
          | 'var'
          | 'while'
          | 'with'
        )[])
      ];
  export type Options = readonly {
    readonly blankLine: PaddingType;
    readonly prev: StatementType;
    readonly next: StatementType;
  }[];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require using arrow functions for callbacks
 * @link https://eslint.org/docs/rules/prefer-arrow-callback
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require `const` declarations for variables that are never reassigned after declared
 * @link https://eslint.org/docs/rules/prefer-const
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
    readonly destructuring?: 'any' | 'all';
    readonly ignoreReadBeforeAssign?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require destructuring from arrays and/or objects
 * @link https://eslint.org/docs/rules/prefer-destructuring
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
        readonly VariableDeclarator?: {
          readonly array?: boolean;
          readonly object?: boolean;
        };
        readonly AssignmentExpression?: {
          readonly array?: boolean;
          readonly object?: boolean;
        };
      }
    | {
        readonly array?: boolean;
        readonly object?: boolean;
      };

  export type Options1 = {
    readonly enforceForRenamedProperties?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Disallow the use of `Math.pow` in favor of the `**` operator
 * @link https://eslint.org/docs/rules/prefer-exponentiation-operator
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 */
namespace PreferExponentiationOperator {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce using named capture group in regular expression
 * @link https://eslint.org/docs/rules/prefer-named-capture-group
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 */
namespace PreferNamedCaptureGroup {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `parseInt()` and `Number.parseInt()` in favor of binary, octal, and hexadecimal literals
 * @link https://eslint.org/docs/rules/prefer-numeric-literals
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 */
namespace PreferNumericLiterals {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow use of `Object.prototype.hasOwnProperty.call()` and prefer use of `Object.hasOwn()`
 * @link https://eslint.org/docs/rules/prefer-object-has-own
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 */
namespace PreferObjectHasOwn {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow using Object.assign with an object literal as the first argument and prefer the use of object spread instead
 * @link https://eslint.org/docs/rules/prefer-object-spread
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 */
namespace PreferObjectSpread {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require using Error objects as Promise rejection reasons
 * @link https://eslint.org/docs/rules/prefer-promise-reject-errors
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require `Reflect` methods where applicable
 * @link https://eslint.org/docs/rules/prefer-reflect
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
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
  export type RuleEntry = 'off';
}

/**
 * @description Disallow use of the `RegExp` constructor in favor of regular expression literals
 * @link https://eslint.org/docs/rules/prefer-regex-literals
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require rest parameters instead of `arguments`
 * @link https://eslint.org/docs/rules/prefer-rest-params
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace PreferRestParams {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require spread operators instead of `.apply()`
 * @link https://eslint.org/docs/rules/prefer-spread
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace PreferSpread {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require template literals instead of string concatenation
 * @link https://eslint.org/docs/rules/prefer-template
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 */
namespace PreferTemplate {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require quotes around object literal property names
 * @link https://eslint.org/docs/rules/quote-props
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
  export type Options =
    | readonly []
    | readonly ['always' | 'as-needed' | 'consistent' | 'consistent-as-needed']
    | readonly []
    | readonly ['always' | 'as-needed' | 'consistent' | 'consistent-as-needed']
    | readonly [
        'always' | 'as-needed' | 'consistent' | 'consistent-as-needed',
        {
          readonly keywords?: boolean;
          readonly unnecessary?: boolean;
          readonly numbers?: boolean;
        }
      ];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce the consistent use of either backticks, double, or single quotes
 * @link https://eslint.org/docs/rules/quotes
 *
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | fixable     | code   |
 *  | recommended | false  |
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
  export type Options0 = 'single' | 'double' | 'backtick';

  export type Options1 =
    | 'avoid-escape'
    | {
        readonly avoidEscape?: boolean;
        readonly allowTemplateLiterals?: boolean;
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Enforce the consistent use of the radix argument when using `parseInt()`
 * @link https://eslint.org/docs/rules/radix
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow assignments that can lead to race conditions due to usage of `await` or `yield`
 * @link https://eslint.org/docs/rules/require-atomic-updates
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow async functions which have no `await` expression
 * @link https://eslint.org/docs/rules/require-await
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace RequireAwait {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require JSDoc comments
 * @link https://eslint.org/docs/rules/require-jsdoc
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | recommended | false      |
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
  export type RuleEntry = 'off';
}

/**
 * @description Enforce the use of `u` flag on RegExp
 * @link https://eslint.org/docs/rules/require-unicode-regexp
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace RequireUnicodeRegexp {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require generator functions to contain `yield`
 * @link https://eslint.org/docs/rules/require-yield
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | true       |
 */
namespace RequireYield {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce spacing between rest and spread operators and their expressions
 * @link https://eslint.org/docs/rules/rest-spread-spacing
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = 'always' | 'never';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require or disallow semicolons instead of ASI
 * @link https://eslint.org/docs/rules/semi
 *
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | fixable     | code   |
 *  | recommended | false  |
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
   *           "enum": [
   *             "never"
   *           ]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "beforeStatementContinuationChars": {
   *               "enum": [
   *                 "always",
   *                 "any",
   *                 "never"
   *               ]
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
   *           "enum": [
   *             "always"
   *           ]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "omitLastInOneLineBlock": {
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
    | readonly ['never']
    | readonly [
        'never',
        {
          readonly beforeStatementContinuationChars?:
            | 'always'
            | 'any'
            | 'never';
        }
      ]
    | readonly []
    | readonly ['always']
    | readonly [
        'always',
        {
          readonly omitLastInOneLineBlock?: boolean;
        }
      ];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent spacing before and after semicolons
 * @link https://eslint.org/docs/rules/semi-spacing
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = {
    readonly before?: boolean;
    readonly after?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce location of semicolons
 * @link https://eslint.org/docs/rules/semi-style
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = 'last' | 'first';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce sorted import declarations within modules
 * @link https://eslint.org/docs/rules/sort-imports
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
      'none' | 'all' | 'multiple' | 'single',
      'none' | 'all' | 'multiple' | 'single',
      'none' | 'all' | 'multiple' | 'single',
      'none' | 'all' | 'multiple' | 'single'
    ];
    readonly ignoreDeclarationSort?: boolean;
    readonly ignoreMemberSort?: boolean;
    readonly allowSeparatedGroups?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require object keys to be sorted
 * @link https://eslint.org/docs/rules/sort-keys
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Require variables within the same declaration block to be sorted
 * @link https://eslint.org/docs/rules/sort-vars
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent spacing before blocks
 * @link https://eslint.org/docs/rules/space-before-blocks
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options =
    | ('always' | 'never')
    | {
        readonly keywords?: 'always' | 'never' | 'off';
        readonly functions?: 'always' | 'never' | 'off';
        readonly classes?: 'always' | 'never' | 'off';
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent spacing before `function` definition opening parenthesis
 * @link https://eslint.org/docs/rules/space-before-function-paren
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options =
    | ('always' | 'never')
    | {
        readonly anonymous?: 'always' | 'never' | 'ignore';
        readonly named?: 'always' | 'never' | 'ignore';
        readonly asyncArrow?: 'always' | 'never' | 'ignore';
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent spacing inside parentheses
 * @link https://eslint.org/docs/rules/space-in-parens
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options0 = 'always' | 'never';

  export type Options1 = {
    readonly exceptions?: readonly ('{}' | '[]' | '()' | 'empty')[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Require spacing around infix operators
 * @link https://eslint.org/docs/rules/space-infix-ops
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = {
    readonly int32Hint?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent spacing before or after unary operators
 * @link https://eslint.org/docs/rules/space-unary-ops
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = {
    readonly words?: boolean;
    readonly nonwords?: boolean;
    readonly overrides?: Record<string, boolean>;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent spacing after the `//` or ` ` in a comment
 * @link https://eslint.org/docs/rules/spaced-comment
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options0 = 'always' | 'never';

  export type Options1 = {
    readonly exceptions?: readonly string[];
    readonly markers?: readonly string[];
    readonly line?: {
      readonly exceptions?: readonly string[];
      readonly markers?: readonly string[];
    };
    readonly block?: {
      readonly exceptions?: readonly string[];
      readonly markers?: readonly string[];
      readonly balanced?: boolean;
    };
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Require or disallow strict mode directives
 * @link https://eslint.org/docs/rules/strict
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce spacing around colons of switch statements
 * @link https://eslint.org/docs/rules/switch-colon-spacing
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = {
    readonly before?: boolean;
    readonly after?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require symbol descriptions
 * @link https://eslint.org/docs/rules/symbol-description
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace SymbolDescription {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require or disallow spacing around embedded expressions of template strings
 * @link https://eslint.org/docs/rules/template-curly-spacing
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = 'always' | 'never';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require or disallow spacing between template tags and their literals
 * @link https://eslint.org/docs/rules/template-tag-spacing
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options = 'always' | 'never';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require or disallow Unicode byte order mark (BOM)
 * @link https://eslint.org/docs/rules/unicode-bom
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require calls to `isNaN()` when checking for `NaN`
 * @link https://eslint.org/docs/rules/use-isnan
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce valid JSDoc comments
 * @link https://eslint.org/docs/rules/valid-jsdoc
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | true       |
 *  | fixable     | code       |
 *  | recommended | false      |
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
  export type RuleEntry = 'off';
}

/**
 * @description Enforce comparing `typeof` expressions against valid strings
 * @link https://eslint.org/docs/rules/valid-typeof
 *
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require `var` declarations be placed at the top of their containing scope
 * @link https://eslint.org/docs/rules/vars-on-top
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace VarsOnTop {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require parentheses around immediate `function` invocations
 * @link https://eslint.org/docs/rules/wrap-iife
 *
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | fixable     | code   |
 *  | recommended | false  |
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
  export type Options0 = 'outside' | 'inside' | 'any';

  export type Options1 = {
    readonly functionPrototypeMethods?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

/**
 * @description Require parenthesis around regex literals
 * @link https://eslint.org/docs/rules/wrap-regex
 *
 *  | key         | value  |
 *  | :---------- | :----- |
 *  | type        | layout |
 *  | fixable     | code   |
 *  | recommended | false  |
 */
namespace WrapRegex {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require or disallow spacing around the `*` in `yield*` expressions
 * @link https://eslint.org/docs/rules/yield-star-spacing
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options =
    | ('before' | 'after' | 'both' | 'neither')
    | {
        readonly before?: boolean;
        readonly after?: boolean;
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require or disallow "Yoda" conditions
 * @link https://eslint.org/docs/rules/yoda
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
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
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0]
    | readonly [Linter.RuleLevel, Options0, Options1];
}

export type EslintRules = {
  readonly 'accessor-pairs': AccessorPairs.RuleEntry;
  readonly 'array-bracket-newline': ArrayBracketNewline.RuleEntry;
  readonly 'array-bracket-spacing': ArrayBracketSpacing.RuleEntry;
  readonly 'array-callback-return': ArrayCallbackReturn.RuleEntry;
  readonly 'array-element-newline': ArrayElementNewline.RuleEntry;
  readonly 'arrow-body-style': ArrowBodyStyle.RuleEntry;
  readonly 'arrow-parens': ArrowParens.RuleEntry;
  readonly 'arrow-spacing': ArrowSpacing.RuleEntry;
  readonly 'block-scoped-var': BlockScopedVar.RuleEntry;
  readonly 'block-spacing': BlockSpacing.RuleEntry;
  readonly 'brace-style': BraceStyle.RuleEntry;
  readonly camelcase: Camelcase.RuleEntry;
  readonly 'capitalized-comments': CapitalizedComments.RuleEntry;
  readonly 'class-methods-use-this': ClassMethodsUseThis.RuleEntry;
  readonly 'comma-dangle': CommaDangle.RuleEntry;
  readonly 'comma-spacing': CommaSpacing.RuleEntry;
  readonly 'comma-style': CommaStyle.RuleEntry;
  readonly complexity: Complexity.RuleEntry;
  readonly 'computed-property-spacing': ComputedPropertySpacing.RuleEntry;
  readonly 'consistent-return': ConsistentReturn.RuleEntry;
  readonly 'consistent-this': ConsistentThis.RuleEntry;
  readonly 'constructor-super': ConstructorSuper.RuleEntry;
  readonly curly: Curly.RuleEntry;
  readonly 'default-case': DefaultCase.RuleEntry;
  readonly 'default-case-last': DefaultCaseLast.RuleEntry;
  readonly 'default-param-last': DefaultParamLast.RuleEntry;
  readonly 'dot-location': DotLocation.RuleEntry;
  readonly 'dot-notation': DotNotation.RuleEntry;
  readonly 'eol-last': EolLast.RuleEntry;
  readonly eqeqeq: Eqeqeq.RuleEntry;
  readonly 'for-direction': ForDirection.RuleEntry;
  readonly 'func-call-spacing': FuncCallSpacing.RuleEntry;
  readonly 'func-name-matching': FuncNameMatching.RuleEntry;
  readonly 'func-names': FuncNames.RuleEntry;
  readonly 'func-style': FuncStyle.RuleEntry;
  readonly 'function-call-argument-newline': FunctionCallArgumentNewline.RuleEntry;
  readonly 'function-paren-newline': FunctionParenNewline.RuleEntry;
  readonly 'generator-star-spacing': GeneratorStarSpacing.RuleEntry;
  readonly 'getter-return': GetterReturn.RuleEntry;
  readonly 'grouped-accessor-pairs': GroupedAccessorPairs.RuleEntry;
  readonly 'guard-for-in': GuardForIn.RuleEntry;
  readonly 'id-denylist': IdDenylist.RuleEntry;
  readonly 'id-length': IdLength.RuleEntry;
  readonly 'id-match': IdMatch.RuleEntry;
  readonly 'implicit-arrow-linebreak': ImplicitArrowLinebreak.RuleEntry;
  readonly indent: Indent.RuleEntry;
  readonly 'init-declarations': InitDeclarations.RuleEntry;
  readonly 'jsx-quotes': JsxQuotes.RuleEntry;
  readonly 'key-spacing': KeySpacing.RuleEntry;
  readonly 'keyword-spacing': KeywordSpacing.RuleEntry;
  readonly 'line-comment-position': LineCommentPosition.RuleEntry;
  readonly 'linebreak-style': LinebreakStyle.RuleEntry;
  readonly 'lines-around-comment': LinesAroundComment.RuleEntry;
  readonly 'lines-between-class-members': LinesBetweenClassMembers.RuleEntry;
  readonly 'logical-assignment-operators': LogicalAssignmentOperators.RuleEntry;
  readonly 'max-classes-per-file': MaxClassesPerFile.RuleEntry;
  readonly 'max-depth': MaxDepth.RuleEntry;
  readonly 'max-len': MaxLen.RuleEntry;
  readonly 'max-lines': MaxLines.RuleEntry;
  readonly 'max-lines-per-function': MaxLinesPerFunction.RuleEntry;
  readonly 'max-nested-callbacks': MaxNestedCallbacks.RuleEntry;
  readonly 'max-params': MaxParams.RuleEntry;
  readonly 'max-statements': MaxStatements.RuleEntry;
  readonly 'max-statements-per-line': MaxStatementsPerLine.RuleEntry;
  readonly 'multiline-comment-style': MultilineCommentStyle.RuleEntry;
  readonly 'multiline-ternary': MultilineTernary.RuleEntry;
  readonly 'new-cap': NewCap.RuleEntry;
  readonly 'new-parens': NewParens.RuleEntry;
  readonly 'newline-per-chained-call': NewlinePerChainedCall.RuleEntry;
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
  readonly 'no-confusing-arrow': NoConfusingArrow.RuleEntry;
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
  readonly 'no-extra-parens': NoExtraParens.RuleEntry;
  readonly 'no-extra-semi': NoExtraSemi.RuleEntry;
  readonly 'no-fallthrough': NoFallthrough.RuleEntry;
  readonly 'no-floating-decimal': NoFloatingDecimal.RuleEntry;
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
  readonly 'no-mixed-operators': NoMixedOperators.RuleEntry;
  readonly 'no-mixed-spaces-and-tabs': NoMixedSpacesAndTabs.RuleEntry;
  readonly 'no-multi-assign': NoMultiAssign.RuleEntry;
  readonly 'no-multi-spaces': NoMultiSpaces.RuleEntry;
  readonly 'no-multi-str': NoMultiStr.RuleEntry;
  readonly 'no-multiple-empty-lines': NoMultipleEmptyLines.RuleEntry;
  readonly 'no-negated-condition': NoNegatedCondition.RuleEntry;
  readonly 'no-nested-ternary': NoNestedTernary.RuleEntry;
  readonly 'no-new': NoNew.RuleEntry;
  readonly 'no-new-func': NoNewFunc.RuleEntry;
  readonly 'no-new-native-nonconstructor': NoNewNativeNonconstructor.RuleEntry;
  readonly 'no-new-object': NoNewObject.RuleEntry;
  readonly 'no-new-symbol': NoNewSymbol.RuleEntry;
  readonly 'no-new-wrappers': NoNewWrappers.RuleEntry;
  readonly 'no-nonoctal-decimal-escape': NoNonoctalDecimalEscape.RuleEntry;
  readonly 'no-obj-calls': NoObjCalls.RuleEntry;
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
  readonly 'no-return-await': NoReturnAwait.RuleEntry;
  readonly 'no-script-url': NoScriptUrl.RuleEntry;
  readonly 'no-self-assign': NoSelfAssign.RuleEntry;
  readonly 'no-self-compare': NoSelfCompare.RuleEntry;
  readonly 'no-sequences': NoSequences.RuleEntry;
  readonly 'no-setter-return': NoSetterReturn.RuleEntry;
  readonly 'no-shadow': NoShadow.RuleEntry;
  readonly 'no-shadow-restricted-names': NoShadowRestrictedNames.RuleEntry;
  readonly 'no-sparse-arrays': NoSparseArrays.RuleEntry;
  readonly 'no-tabs': NoTabs.RuleEntry;
  readonly 'no-template-curly-in-string': NoTemplateCurlyInString.RuleEntry;
  readonly 'no-ternary': NoTernary.RuleEntry;
  readonly 'no-this-before-super': NoThisBeforeSuper.RuleEntry;
  readonly 'no-throw-literal': NoThrowLiteral.RuleEntry;
  readonly 'no-trailing-spaces': NoTrailingSpaces.RuleEntry;
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
  readonly 'no-whitespace-before-property': NoWhitespaceBeforeProperty.RuleEntry;
  readonly 'no-with': NoWith.RuleEntry;
  readonly 'nonblock-statement-body-position': NonblockStatementBodyPosition.RuleEntry;
  readonly 'object-curly-newline': ObjectCurlyNewline.RuleEntry;
  readonly 'object-curly-spacing': ObjectCurlySpacing.RuleEntry;
  readonly 'object-property-newline': ObjectPropertyNewline.RuleEntry;
  readonly 'object-shorthand': ObjectShorthand.RuleEntry;
  readonly 'one-var': OneVar.RuleEntry;
  readonly 'one-var-declaration-per-line': OneVarDeclarationPerLine.RuleEntry;
  readonly 'operator-assignment': OperatorAssignment.RuleEntry;
  readonly 'operator-linebreak': OperatorLinebreak.RuleEntry;
  readonly 'padded-blocks': PaddedBlocks.RuleEntry;
  readonly 'padding-line-between-statements': PaddingLineBetweenStatements.RuleEntry;
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
  readonly 'quote-props': QuoteProps.RuleEntry;
  readonly quotes: Quotes.RuleEntry;
  readonly radix: Radix.RuleEntry;
  readonly 'require-atomic-updates': RequireAtomicUpdates.RuleEntry;
  readonly 'require-await': RequireAwait.RuleEntry;
  readonly 'require-unicode-regexp': RequireUnicodeRegexp.RuleEntry;
  readonly 'require-yield': RequireYield.RuleEntry;
  readonly 'rest-spread-spacing': RestSpreadSpacing.RuleEntry;
  readonly semi: Semi.RuleEntry;
  readonly 'semi-spacing': SemiSpacing.RuleEntry;
  readonly 'semi-style': SemiStyle.RuleEntry;
  readonly 'sort-imports': SortImports.RuleEntry;
  readonly 'sort-keys': SortKeys.RuleEntry;
  readonly 'sort-vars': SortVars.RuleEntry;
  readonly 'space-before-blocks': SpaceBeforeBlocks.RuleEntry;
  readonly 'space-before-function-paren': SpaceBeforeFunctionParen.RuleEntry;
  readonly 'space-in-parens': SpaceInParens.RuleEntry;
  readonly 'space-infix-ops': SpaceInfixOps.RuleEntry;
  readonly 'space-unary-ops': SpaceUnaryOps.RuleEntry;
  readonly 'spaced-comment': SpacedComment.RuleEntry;
  readonly strict: Strict.RuleEntry;
  readonly 'switch-colon-spacing': SwitchColonSpacing.RuleEntry;
  readonly 'symbol-description': SymbolDescription.RuleEntry;
  readonly 'template-curly-spacing': TemplateCurlySpacing.RuleEntry;
  readonly 'template-tag-spacing': TemplateTagSpacing.RuleEntry;
  readonly 'unicode-bom': UnicodeBom.RuleEntry;
  readonly 'use-isnan': UseIsnan.RuleEntry;
  readonly 'valid-typeof': ValidTypeof.RuleEntry;
  readonly 'vars-on-top': VarsOnTop.RuleEntry;
  readonly 'wrap-iife': WrapIife.RuleEntry;
  readonly 'wrap-regex': WrapRegex.RuleEntry;
  readonly 'yield-star-spacing': YieldStarSpacing.RuleEntry;
  readonly yoda: Yoda.RuleEntry;

  // deprecated
  readonly 'callback-return': CallbackReturn.RuleEntry;
  readonly 'global-require': GlobalRequire.RuleEntry;
  readonly 'handle-callback-err': HandleCallbackErr.RuleEntry;
  readonly 'id-blacklist': IdBlacklist.RuleEntry;
  readonly 'indent-legacy': IndentLegacy.RuleEntry;
  readonly 'lines-around-directive': LinesAroundDirective.RuleEntry;
  readonly 'newline-after-var': NewlineAfterVar.RuleEntry;
  readonly 'newline-before-return': NewlineBeforeReturn.RuleEntry;
  readonly 'no-buffer-constructor': NoBufferConstructor.RuleEntry;
  readonly 'no-catch-shadow': NoCatchShadow.RuleEntry;
  readonly 'no-mixed-requires': NoMixedRequires.RuleEntry;
  readonly 'no-native-reassign': NoNativeReassign.RuleEntry;
  readonly 'no-negated-in-lhs': NoNegatedInLhs.RuleEntry;
  readonly 'no-new-require': NoNewRequire.RuleEntry;
  readonly 'no-path-concat': NoPathConcat.RuleEntry;
  readonly 'no-process-env': NoProcessEnv.RuleEntry;
  readonly 'no-process-exit': NoProcessExit.RuleEntry;
  readonly 'no-restricted-modules': NoRestrictedModules.RuleEntry;
  readonly 'no-spaced-func': NoSpacedFunc.RuleEntry;
  readonly 'no-sync': NoSync.RuleEntry;
  readonly 'prefer-reflect': PreferReflect.RuleEntry;
  readonly 'require-jsdoc': RequireJsdoc.RuleEntry;
  readonly 'valid-jsdoc': ValidJsdoc.RuleEntry;
};
