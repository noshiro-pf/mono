/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Enforce linebreaks after opening and before closing array brackets
 *
 * @link https://eslint.style/rules/array-bracket-newline
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
   *         "type": "string",
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
    | 'always'
    | 'consistent'
    | 'never'
    | {
        readonly multiline?: boolean;
        readonly minItems?: number | null;
      };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent spacing inside array brackets
 *
 * @link https://eslint.style/rules/array-bracket-spacing
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace ArrayBracketSpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
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
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

/**
 * Enforce line breaks after each array element
 *
 * @link https://eslint.style/rules/array-element-newline
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
   *           "type": "string",
   *           "enum": ["always", "never", "consistent"]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "consistent": {
   *               "type": "boolean"
   *             },
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
  export type Options =
    | readonly [
        | BasicConfig
        | {
            readonly ArrayExpression?: BasicConfig;
            readonly ArrayPattern?: BasicConfig;
          },
      ]
    | readonly [];
  export type BasicConfig =
    | 'always'
    | 'consistent'
    | 'never'
    | {
        readonly consistent?: boolean;
        readonly multiline?: boolean;
        readonly minItems?: number | null;
      };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require parentheses around arrow function arguments
 *
 * @link https://eslint.style/rules/arrow-parens
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace ArrowParens {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
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
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

/**
 * Enforce consistent spacing before and after the arrow in arrow functions
 *
 * @link https://eslint.style/rules/arrow-spacing
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
  export type Options = {
    readonly before?: boolean;
    readonly after?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow or enforce spaces inside of blocks after opening block and before
 * closing block
 *
 * @link https://eslint.style/rules/block-spacing
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace BlockSpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent brace style for blocks
 *
 * @link https://eslint.style/rules/brace-style
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace BraceStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
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
  export type Options0 = '1tbs' | 'allman' | 'stroustrup';

  export type Options1 = {
    readonly allowSingleLine?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

/**
 * Require or disallow trailing commas
 *
 * @link https://eslint.style/rules/comma-dangle
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace CommaDangle {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "$defs": {
   *     "value": {
   *       "type": "string",
   *       "enum": ["always-multiline", "always", "never", "only-multiline"]
   *     },
   *     "valueWithIgnore": {
   *       "type": "string",
   *       "enum": [
   *         "always-multiline",
   *         "always",
   *         "never",
   *         "only-multiline",
   *         "ignore"
   *       ]
   *     }
   *   },
   *   "type": "array",
   *   "items": [
   *     {
   *       "oneOf": [
   *         {
   *           "$ref": "#/$defs/value"
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "arrays": {
   *               "$ref": "#/$defs/valueWithIgnore"
   *             },
   *             "objects": {
   *               "$ref": "#/$defs/valueWithIgnore"
   *             },
   *             "imports": {
   *               "$ref": "#/$defs/valueWithIgnore"
   *             },
   *             "exports": {
   *               "$ref": "#/$defs/valueWithIgnore"
   *             },
   *             "functions": {
   *               "$ref": "#/$defs/valueWithIgnore"
   *             },
   *             "importAttributes": {
   *               "$ref": "#/$defs/valueWithIgnore"
   *             },
   *             "dynamicImports": {
   *               "$ref": "#/$defs/valueWithIgnore"
   *             },
   *             "enums": {
   *               "$ref": "#/$defs/valueWithIgnore"
   *             },
   *             "generics": {
   *               "$ref": "#/$defs/valueWithIgnore"
   *             },
   *             "tuples": {
   *               "$ref": "#/$defs/valueWithIgnore"
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
    | readonly [
        | Value
        | {
            readonly arrays?: ValueWithIgnore;
            readonly objects?: ValueWithIgnore;
            readonly imports?: ValueWithIgnore;
            readonly exports?: ValueWithIgnore;
            readonly functions?: ValueWithIgnore;
            readonly importAttributes?: ValueWithIgnore;
            readonly dynamicImports?: ValueWithIgnore;
            readonly enums?: ValueWithIgnore;
            readonly generics?: ValueWithIgnore;
            readonly tuples?: ValueWithIgnore;
          },
      ]
    | readonly [];
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent spacing before and after commas
 *
 * @link https://eslint.style/rules/comma-spacing
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
  export type Options = {
    readonly before?: boolean;
    readonly after?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent comma style
 *
 * @link https://eslint.style/rules/comma-style
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace CommaStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
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
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

/**
 * Enforce consistent spacing inside computed property brackets
 *
 * @link https://eslint.style/rules/computed-property-spacing
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace ComputedPropertySpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
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
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

/**
 * Enforce consistent line breaks after opening and before closing braces
 *
 * @link https://eslint.style/rules/curly-newline
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace CurlyNewline {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "type": "string",
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "IfStatementConsequent": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "IfStatementAlternative": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "DoWhileStatement": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "ForInStatement": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "ForOfStatement": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "ForStatement": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "WhileStatement": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "SwitchStatement": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "SwitchCase": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "TryStatementBlock": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "TryStatementHandler": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "TryStatementFinalizer": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "BlockStatement": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "ArrowFunctionExpression": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "FunctionDeclaration": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "FunctionExpression": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "Property": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "ClassBody": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "StaticBlock": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "WithStatement": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "TSModuleBlock": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *                   "minElements": {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   "consistent": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             ]
   *           },
   *           "multiline": {
   *             "type": "boolean"
   *           },
   *           "minElements": {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           "consistent": {
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
    | 'always'
    | 'never'
    | {
        readonly IfStatementConsequent?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly IfStatementAlternative?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly DoWhileStatement?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly ForInStatement?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly ForOfStatement?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly ForStatement?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly WhileStatement?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly SwitchStatement?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly SwitchCase?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly TryStatementBlock?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly TryStatementHandler?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly TryStatementFinalizer?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly BlockStatement?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly ArrowFunctionExpression?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly FunctionDeclaration?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly FunctionExpression?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly Property?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly ClassBody?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly StaticBlock?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly WithStatement?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly TSModuleBlock?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minElements?: number;
              readonly consistent?: boolean;
            };
        readonly multiline?: boolean;
        readonly minElements?: number;
        readonly consistent?: boolean;
      };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent newlines before and after dots
 *
 * @link https://eslint.style/rules/dot-location
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace DotLocation {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require or disallow newline at the end of files
 *
 * @link https://eslint.style/rules/eol-last
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace EolLast {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce line breaks between arguments of a function call
 *
 * @link https://eslint.style/rules/function-call-argument-newline
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace FunctionCallArgumentNewline {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "enum": [
   *       "always",
   *       "never",
   *       "consistent"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'always' | 'consistent' | 'never';

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require or disallow spacing between function identifiers and their
 * invocations
 *
 * @link https://eslint.style/rules/function-call-spacing
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace FunctionCallSpacing {
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
   *           "type": "string",
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
   *           "type": "string",
   *           "enum": ["always"]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "allowNewlines": {
   *               "type": "boolean"
   *             },
   *             "optionalChain": {
   *               "type": "object",
   *               "properties": {
   *                 "before": {
   *                   "type": "boolean"
   *                 },
   *                 "after": {
   *                   "type": "boolean"
   *                 }
   *               },
   *               "additionalProperties": false
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
        'always',
        {
          readonly allowNewlines?: boolean;
          readonly optionalChain?: {
            readonly before?: boolean;
            readonly after?: boolean;
          };
        },
      ]
    | readonly ['always']
    | readonly ['never']
    | readonly [];

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent line breaks inside function parentheses
 *
 * @link https://eslint.style/rules/function-paren-newline
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
   *         "type": "string",
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
    | 'always'
    | 'consistent'
    | 'multiline-arguments'
    | 'multiline'
    | 'never'
    | {
        readonly minItems?: number;
      };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent spacing around `*` operators in generator functions
 *
 * @link https://eslint.style/rules/generator-star-spacing
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
   *         "type": "string",
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
   *                 "type": "string",
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
   *                 "type": "string",
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
   *                 "type": "string",
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
   *           "shorthand": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
    | 'after'
    | 'before'
    | 'both'
    | 'neither'
    | {
        readonly before?: boolean;
        readonly after?: boolean;
        readonly named?:
          | 'after'
          | 'before'
          | 'both'
          | 'neither'
          | {
              readonly before?: boolean;
              readonly after?: boolean;
            };
        readonly anonymous?:
          | 'after'
          | 'before'
          | 'both'
          | 'neither'
          | {
              readonly before?: boolean;
              readonly after?: boolean;
            };
        readonly method?:
          | 'after'
          | 'before'
          | 'both'
          | 'neither'
          | {
              readonly before?: boolean;
              readonly after?: boolean;
            };
        readonly shorthand?:
          | 'after'
          | 'before'
          | 'both'
          | 'neither'
          | {
              readonly before?: boolean;
              readonly after?: boolean;
            };
      };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce the location of arrow function bodies
 *
 * @link https://eslint.style/rules/implicit-arrow-linebreak
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace ImplicitArrowLinebreak {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "enum": [
   *       "beside",
   *       "below"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'below' | 'beside';

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent indentation
 *
 * @link https://eslint.style/rules/indent
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
   *         "type": "string",
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
   *                 "type": "string",
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
   *                     "type": "string",
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
   *                     "type": "string",
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
   *                     "type": "string",
   *                     "enum": [
   *                       "first",
   *                       "off"
   *                     ]
   *                   }
   *                 ]
   *               },
   *               "using": {
   *                 "oneOf": [
   *                   {
   *                     "type": "integer",
   *                     "minimum": 0
   *                   },
   *                   {
   *                     "type": "string",
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
   *       "assignmentOperator": {
   *         "oneOf": [
   *           {
   *             "type": "integer",
   *             "minimum": 0
   *           },
   *           {
   *             "type": "string",
   *             "enum": [
   *               "off"
   *             ]
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
   *             "type": "string",
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
   *             "type": "string",
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
   *                 "type": "string",
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
   *           },
   *           "returnType": {
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
   *                 "type": "string",
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
   *           },
   *           "returnType": {
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
   *                 "type": "string",
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
   *             "type": "string",
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
   *             "type": "string",
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
   *             "type": "string",
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
   *         "oneOf": [
   *           {
   *             "type": "boolean"
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "CallExpression": {
   *                 "type": "boolean"
   *               },
   *               "AwaitExpression": {
   *                 "type": "boolean"
   *               },
   *               "NewExpression": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         ],
   *         "default": false
   *       },
   *       "offsetTernaryExpressionsOffsetCallExpressions": {
   *         "type": "boolean"
   *       },
   *       "ignoredNodes": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "not": {
   *             "type": "string",
   *             "pattern": ":exit$"
   *           }
   *         }
   *       },
   *       "ignoreComments": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "tabLength": {
   *         "type": "number",
   *         "default": 4
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options0 = number | 'tab';

  export type Options1 = {
    readonly SwitchCase?: number;
    readonly VariableDeclarator?:
      | number
      | 'first'
      | 'off'
      | {
          readonly var?: number | ('first' | 'off');
          readonly let?: number | ('first' | 'off');
          readonly const?: number | ('first' | 'off');
          readonly using?: number | ('first' | 'off');
        };
    readonly assignmentOperator?: number | 'off';
    readonly outerIIFEBody?: number | 'off';
    readonly MemberExpression?: number | 'off';
    readonly FunctionDeclaration?: {
      readonly parameters?: number | ('first' | 'off');
      readonly body?: number;
      readonly returnType?: number;
    };
    readonly FunctionExpression?: {
      readonly parameters?: number | ('first' | 'off');
      readonly body?: number;
      readonly returnType?: number;
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
    readonly offsetTernaryExpressions?:
      | boolean
      | {
          readonly CallExpression?: boolean;
          readonly AwaitExpression?: boolean;
          readonly NewExpression?: boolean;
        };
    readonly offsetTernaryExpressionsOffsetCallExpressions?: boolean;
    readonly ignoredNodes?: readonly string[];
    readonly ignoreComments?: boolean;
    readonly tabLength?: number;
  };

  export type RuleEntry =
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

/**
 * Indentation for binary operators
 *
 * @link https://eslint.style/rules/indent-binary-ops
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace IndentBinaryOps {
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
   *         "type": "string",
   *         "enum": [
   *           "tab"
   *         ]
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = number | 'tab';

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce or disallow spaces inside of curly braces in JSX attributes and
 * expressions
 *
 * @link https://eslint.style/rules/jsx-child-element-spacing
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  ```
 */
namespace JsxChildElementSpacing {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce closing bracket location in JSX
 *
 * @link https://eslint.style/rules/jsx-closing-bracket-location
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace JsxClosingBracketLocation {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "anyOf": [
   *       {
   *         "type": "string",
   *         "enum": [
   *           "after-props",
   *           "props-aligned",
   *           "tag-aligned",
   *           "line-aligned"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "location": {
   *             "type": "string",
   *             "enum": [
   *               "after-props",
   *               "props-aligned",
   *               "tag-aligned",
   *               "line-aligned"
   *             ]
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "nonEmpty": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "enum": [
   *                   "after-props",
   *                   "props-aligned",
   *                   "tag-aligned",
   *                   "line-aligned"
   *                 ]
   *               },
   *               {
   *                 "type": "boolean",
   *                 "enum": [
   *                   false
   *                 ]
   *               }
   *             ]
   *           },
   *           "selfClosing": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "enum": [
   *                   "after-props",
   *                   "props-aligned",
   *                   "tag-aligned",
   *                   "line-aligned"
   *                 ]
   *               },
   *               {
   *                 "type": "boolean",
   *                 "enum": [
   *                   false
   *                 ]
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
    | 'after-props'
    | 'line-aligned'
    | 'props-aligned'
    | 'tag-aligned'
    | {
        readonly location?:
          | 'after-props'
          | 'line-aligned'
          | 'props-aligned'
          | 'tag-aligned';
      }
    | {
        readonly nonEmpty?:
          | 'after-props'
          | 'line-aligned'
          | 'props-aligned'
          | 'tag-aligned'
          | false;
        readonly selfClosing?:
          | 'after-props'
          | 'line-aligned'
          | 'props-aligned'
          | 'tag-aligned'
          | false;
      };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce closing tag location for multiline JSX
 *
 * @link https://eslint.style/rules/jsx-closing-tag-location
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace JsxClosingTagLocation {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "anyOf": [
   *       {
   *         "type": "string",
   *         "enum": [
   *           "tag-aligned",
   *           "line-aligned"
   *         ],
   *         "default": "tag-aligned"
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'line-aligned' | 'tag-aligned';

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow unnecessary JSX expressions when literals alone are sufficient or
 * enforce JSX expressions on literals in JSX children or attributes
 *
 * @link https://eslint.style/rules/jsx-curly-brace-presence
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace JsxCurlyBracePresence {
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
   *           "props": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never",
   *               "ignore"
   *             ]
   *           },
   *           "children": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never",
   *               "ignore"
   *             ]
   *           },
   *           "propElementValues": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never",
   *               "ignore"
   *             ]
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "string",
   *         "enum": [
   *           "always",
   *           "never",
   *           "ignore"
   *         ]
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options =
    | {
        readonly props?: 'always' | 'ignore' | 'never';
        readonly children?: 'always' | 'ignore' | 'never';
        readonly propElementValues?: 'always' | 'ignore' | 'never';
      }
    | ('always' | 'ignore' | 'never');

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent linebreaks in curly braces in JSX attributes and
 * expressions
 *
 * @link https://eslint.style/rules/jsx-curly-newline
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace JsxCurlyNewline {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "anyOf": [
   *       {
   *         "type": "string",
   *         "enum": [
   *           "consistent",
   *           "never"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "singleline": {
   *             "type": "string",
   *             "enum": [
   *               "consistent",
   *               "require",
   *               "forbid"
   *             ]
   *           },
   *           "multiline": {
   *             "type": "string",
   *             "enum": [
   *               "consistent",
   *               "require",
   *               "forbid"
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
    | 'consistent'
    | 'never'
    | {
        readonly singleline?: 'consistent' | 'forbid' | 'require';
        readonly multiline?: 'consistent' | 'forbid' | 'require';
      };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce or disallow spaces inside of curly braces in JSX attributes and
 * expressions
 *
 * @link https://eslint.style/rules/jsx-curly-spacing
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace JsxCurlySpacing {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "type": "array",
   *   "items": [
   *     {
   *       "anyOf": [
   *         {
   *           "type": "object",
   *           "additionalProperties": false,
   *           "properties": {
   *             "when": {
   *               "type": "string",
   *               "enum": ["always", "never"]
   *             },
   *             "allowMultiline": {
   *               "type": "boolean"
   *             },
   *             "spacing": {
   *               "type": "object",
   *               "properties": {
   *                 "objectLiterals": {
   *                   "type": "string",
   *                   "enum": ["always", "never"]
   *                 }
   *               },
   *               "additionalProperties": false
   *             },
   *             "attributes": {
   *               "anyOf": [
   *                 {
   *                   "type": "object",
   *                   "properties": {
   *                     "when": {
   *                       "type": "string",
   *                       "enum": ["always", "never"]
   *                     },
   *                     "allowMultiline": {
   *                       "type": "boolean"
   *                     },
   *                     "spacing": {
   *                       "type": "object",
   *                       "properties": {
   *                         "objectLiterals": {
   *                           "type": "string",
   *                           "enum": ["always", "never"]
   *                         }
   *                       },
   *                       "additionalProperties": false
   *                     }
   *                   },
   *                   "additionalProperties": false
   *                 },
   *                 {
   *                   "type": "boolean"
   *                 }
   *               ]
   *             },
   *             "children": {
   *               "anyOf": [
   *                 {
   *                   "type": "object",
   *                   "properties": {
   *                     "when": {
   *                       "type": "string",
   *                       "enum": ["always", "never"]
   *                     },
   *                     "allowMultiline": {
   *                       "type": "boolean"
   *                     },
   *                     "spacing": {
   *                       "type": "object",
   *                       "properties": {
   *                         "objectLiterals": {
   *                           "type": "string",
   *                           "enum": ["always", "never"]
   *                         }
   *                       },
   *                       "additionalProperties": false
   *                     }
   *                   },
   *                   "additionalProperties": false
   *                 },
   *                 {
   *                   "type": "boolean"
   *                 }
   *               ]
   *             }
   *           }
   *         },
   *         {
   *           "type": "string",
   *           "enum": ["always", "never"]
   *         }
   *       ]
   *     },
   *     {
   *       "type": "object",
   *       "properties": {
   *         "allowMultiline": {
   *           "type": "boolean"
   *         },
   *         "spacing": {
   *           "type": "object",
   *           "properties": {
   *             "objectLiterals": {
   *               "type": "string",
   *               "enum": ["always", "never"]
   *             }
   *           },
   *           "additionalProperties": false
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
        (
          | {
              readonly when?: 'always' | 'never';
              readonly allowMultiline?: boolean;
              readonly spacing?: {
                readonly objectLiterals?: 'always' | 'never';
              };
              readonly attributes?:
                | boolean
                | {
                    readonly when?: 'always' | 'never';
                    readonly allowMultiline?: boolean;
                    readonly spacing?: {
                      readonly objectLiterals?: 'always' | 'never';
                    };
                  };
              readonly children?:
                | boolean
                | {
                    readonly when?: 'always' | 'never';
                    readonly allowMultiline?: boolean;
                    readonly spacing?: {
                      readonly objectLiterals?: 'always' | 'never';
                    };
                  };
            }
          | ('always' | 'never')
        ),
        {
          readonly allowMultiline?: boolean;
          readonly spacing?: {
            readonly objectLiterals?: 'always' | 'never';
          };
        },
      ]
    | readonly [
        | {
            readonly when?: 'always' | 'never';
            readonly allowMultiline?: boolean;
            readonly spacing?: {
              readonly objectLiterals?: 'always' | 'never';
            };
            readonly attributes?:
              | boolean
              | {
                  readonly when?: 'always' | 'never';
                  readonly allowMultiline?: boolean;
                  readonly spacing?: {
                    readonly objectLiterals?: 'always' | 'never';
                  };
                };
            readonly children?:
              | boolean
              | {
                  readonly when?: 'always' | 'never';
                  readonly allowMultiline?: boolean;
                  readonly spacing?: {
                    readonly objectLiterals?: 'always' | 'never';
                  };
                };
          }
        | ('always' | 'never'),
      ]
    | readonly [];

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce or disallow spaces around equal signs in JSX attributes
 *
 * @link https://eslint.style/rules/jsx-equals-spacing
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace JsxEqualsSpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce proper position of the first property in JSX
 *
 * @link https://eslint.style/rules/jsx-first-prop-new-line
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace JsxFirstPropNewLine {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "enum": [
   *       "always",
   *       "never",
   *       "multiline",
   *       "multiline-multiprop",
   *       "multiprop"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options =
    | 'always'
    | 'multiline-multiprop'
    | 'multiline'
    | 'multiprop'
    | 'never';

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce line breaks before and after JSX elements when they are used as
 * arguments to a function.
 *
 * @link https://eslint.style/rules/jsx-function-call-newline
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace JsxFunctionCallNewline {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "enum": [
   *       "always",
   *       "multiline"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'always' | 'multiline';

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce JSX indentation. Deprecated, use `indent` rule instead.
 *
 * @link https://eslint.style/rules/jsx-indent
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | true       |
 *  | fixable    | whitespace |
 *  ```
 */
namespace JsxIndent {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "anyOf": [
   *       {
   *         "type": "string",
   *         "enum": [
   *           "tab"
   *         ]
   *       },
   *       {
   *         "type": "integer"
   *       }
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "checkAttributes": {
   *         "type": "boolean"
   *       },
   *       "indentLogicalExpressions": {
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
 * Enforce props indentation in JSX
 *
 * @link https://eslint.style/rules/jsx-indent-props
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace JsxIndentProps {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "anyOf": [
   *       {
   *         "type": "string",
   *         "enum": [
   *           "tab",
   *           "first"
   *         ]
   *       },
   *       {
   *         "type": "integer"
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "indentMode": {
   *             "anyOf": [
   *               {
   *                 "type": "string",
   *                 "enum": [
   *                   "tab",
   *                   "first"
   *                 ]
   *               },
   *               {
   *                 "type": "integer"
   *               }
   *             ]
   *           },
   *           "ignoreTernaryOperator": {
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
    | 'first'
    | 'tab'
    | {
        readonly indentMode?: number | 'first' | 'tab';
        readonly ignoreTernaryOperator?: boolean;
      };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce maximum of props on a single line in JSX
 *
 * @link https://eslint.style/rules/jsx-max-props-per-line
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace JsxMaxPropsPerLine {
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
   *           "maximum": {
   *             "type": "object",
   *             "properties": {
   *               "single": {
   *                 "type": "integer",
   *                 "minimum": 1
   *               },
   *               "multi": {
   *                 "type": "integer",
   *                 "minimum": 1
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
   *           "maximum": {
   *             "type": "number",
   *             "minimum": 1
   *           },
   *           "when": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "multiline"
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
    | {
        readonly maximum?: {
          readonly single?: number;
          readonly multi?: number;
        };
      }
    | {
        readonly maximum?: number;
        readonly when?: 'always' | 'multiline';
      };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require or prevent a new line after jsx elements and expressions.
 *
 * @link https://eslint.style/rules/jsx-newline
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace JsxNewline {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "prevent": {
   *         "default": false,
   *         "type": "boolean"
   *       },
   *       "allowMultilines": {
   *         "default": false,
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false,
   *     "if": {
   *       "properties": {
   *         "allowMultilines": {
   *           "const": true
   *         }
   *       }
   *     },
   *     "then": {
   *       "properties": {
   *         "prevent": {
   *           "const": true
   *         }
   *       },
   *       "required": [
   *         "prevent"
   *       ]
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly prevent?: boolean;
    readonly allowMultilines?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require one JSX element per line
 *
 * @link https://eslint.style/rules/jsx-one-expression-per-line
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace JsxOneExpressionPerLine {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allow": {
   *         "type": "string",
   *         "enum": [
   *           "none",
   *           "literal",
   *           "single-child",
   *           "single-line",
   *           "non-jsx"
   *         ]
   *       }
   *     },
   *     "default": {
   *       "allow": "none"
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allow?:
      | 'literal'
      | 'non-jsx'
      | 'none'
      | 'single-child'
      | 'single-line';
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce PascalCase for user-defined JSX components
 *
 * @link https://eslint.style/rules/jsx-pascal-case
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace JsxPascalCase {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowAllCaps": {
   *         "type": "boolean"
   *       },
   *       "allowLeadingUnderscore": {
   *         "type": "boolean"
   *       },
   *       "allowNamespace": {
   *         "type": "boolean"
   *       },
   *       "ignore": {
   *         "items": {
   *           "type": "string"
   *         },
   *         "type": "array",
   *         "uniqueItems": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowAllCaps?: boolean;
    readonly allowLeadingUnderscore?: boolean;
    readonly allowNamespace?: boolean;
    readonly ignore?: readonly string[];
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow multiple spaces between inline JSX props. Deprecated, use
 * `no-multi-spaces` rule instead.
 *
 * @link https://eslint.style/rules/jsx-props-no-multi-spaces
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | true   |
 *  | fixable    | code   |
 *  ```
 */
namespace JsxPropsNoMultiSpaces {
  export type RuleEntry = 0;
}

/**
 * Enforce the consistent use of either double or single quotes in JSX
 * attributes
 *
 * @link https://eslint.style/rules/jsx-quotes
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace JsxQuotes {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "enum": [
   *       "prefer-single",
   *       "prefer-double"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'prefer-double' | 'prefer-single';

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow extra closing tags for components without children
 *
 * @link https://eslint.style/rules/jsx-self-closing-comp
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace JsxSelfClosingComp {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "component": {
   *         "default": true,
   *         "type": "boolean"
   *       },
   *       "html": {
   *         "default": true,
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly component?: boolean;
    readonly html?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce props alphabetical sorting
 *
 * @link https://eslint.style/rules/jsx-sort-props
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace JsxSortProps {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "callbacksLast": {
   *         "type": "boolean"
   *       },
   *       "shorthandFirst": {
   *         "type": "boolean"
   *       },
   *       "shorthandLast": {
   *         "type": "boolean"
   *       },
   *       "multiline": {
   *         "type": "string",
   *         "enum": [
   *           "ignore",
   *           "first",
   *           "last"
   *         ],
   *         "default": "ignore"
   *       },
   *       "ignoreCase": {
   *         "type": "boolean"
   *       },
   *       "noSortAlphabetically": {
   *         "type": "boolean"
   *       },
   *       "reservedFirst": {
   *         "oneOf": [
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
   *             }
   *           },
   *           {
   *             "type": "boolean"
   *           }
   *         ]
   *       },
   *       "reservedLast": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "locale": {
   *         "type": "string",
   *         "default": "auto"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly callbacksLast?: boolean;
    readonly shorthandFirst?: boolean;
    readonly shorthandLast?: boolean;
    readonly multiline?: 'first' | 'ignore' | 'last';
    readonly ignoreCase?: boolean;
    readonly noSortAlphabetically?: boolean;
    readonly reservedFirst?: boolean | readonly string[];
    readonly reservedLast?: readonly string[];
    readonly locale?: string;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce whitespace in and around the JSX opening and closing brackets
 *
 * @link https://eslint.style/rules/jsx-tag-spacing
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace JsxTagSpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "closingSlash": {
   *         "type": "string",
   *         "enum": [
   *           "always",
   *           "never",
   *           "allow"
   *         ]
   *       },
   *       "beforeSelfClosing": {
   *         "type": "string",
   *         "enum": [
   *           "always",
   *           "proportional-always",
   *           "never",
   *           "allow"
   *         ]
   *       },
   *       "afterOpening": {
   *         "type": "string",
   *         "enum": [
   *           "always",
   *           "allow-multiline",
   *           "never",
   *           "allow"
   *         ]
   *       },
   *       "beforeClosing": {
   *         "type": "string",
   *         "enum": [
   *           "always",
   *           "proportional-always",
   *           "never",
   *           "allow"
   *         ]
   *       }
   *     },
   *     "default": {
   *       "closingSlash": "never",
   *       "beforeSelfClosing": "always",
   *       "afterOpening": "never",
   *       "beforeClosing": "allow"
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly closingSlash?: 'allow' | 'always' | 'never';
    readonly beforeSelfClosing?:
      | 'allow'
      | 'always'
      | 'never'
      | 'proportional-always';
    readonly afterOpening?: 'allow-multiline' | 'allow' | 'always' | 'never';
    readonly beforeClosing?:
      | 'allow'
      | 'always'
      | 'never'
      | 'proportional-always';
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow missing parentheses around multiline JSX
 *
 * @link https://eslint.style/rules/jsx-wrap-multilines
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace JsxWrapMultilines {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "declaration": {
   *         "type": [
   *           "string",
   *           "boolean"
   *         ],
   *         "enum": [
   *           true,
   *           false,
   *           "ignore",
   *           "parens",
   *           "parens-new-line"
   *         ]
   *       },
   *       "assignment": {
   *         "type": [
   *           "string",
   *           "boolean"
   *         ],
   *         "enum": [
   *           true,
   *           false,
   *           "ignore",
   *           "parens",
   *           "parens-new-line"
   *         ]
   *       },
   *       "return": {
   *         "type": [
   *           "string",
   *           "boolean"
   *         ],
   *         "enum": [
   *           true,
   *           false,
   *           "ignore",
   *           "parens",
   *           "parens-new-line"
   *         ]
   *       },
   *       "arrow": {
   *         "type": [
   *           "string",
   *           "boolean"
   *         ],
   *         "enum": [
   *           true,
   *           false,
   *           "ignore",
   *           "parens",
   *           "parens-new-line"
   *         ]
   *       },
   *       "condition": {
   *         "type": [
   *           "string",
   *           "boolean"
   *         ],
   *         "enum": [
   *           true,
   *           false,
   *           "ignore",
   *           "parens",
   *           "parens-new-line"
   *         ]
   *       },
   *       "logical": {
   *         "type": [
   *           "string",
   *           "boolean"
   *         ],
   *         "enum": [
   *           true,
   *           false,
   *           "ignore",
   *           "parens",
   *           "parens-new-line"
   *         ]
   *       },
   *       "prop": {
   *         "type": [
   *           "string",
   *           "boolean"
   *         ],
   *         "enum": [
   *           true,
   *           false,
   *           "ignore",
   *           "parens",
   *           "parens-new-line"
   *         ]
   *       },
   *       "propertyValue": {
   *         "type": [
   *           "string",
   *           "boolean"
   *         ],
   *         "enum": [
   *           true,
   *           false,
   *           "ignore",
   *           "parens",
   *           "parens-new-line"
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly declaration?:
      | 'ignore'
      | 'parens-new-line'
      | 'parens'
      | false
      | true;
    readonly assignment?:
      | 'ignore'
      | 'parens-new-line'
      | 'parens'
      | false
      | true;
    readonly return?: 'ignore' | 'parens-new-line' | 'parens' | false | true;
    readonly arrow?: 'ignore' | 'parens-new-line' | 'parens' | false | true;
    readonly condition?: 'ignore' | 'parens-new-line' | 'parens' | false | true;
    readonly logical?: 'ignore' | 'parens-new-line' | 'parens' | false | true;
    readonly prop?: 'ignore' | 'parens-new-line' | 'parens' | false | true;
    readonly propertyValue?:
      | 'ignore'
      | 'parens-new-line'
      | 'parens'
      | false
      | true;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent spacing between property names and type annotations in
 * types and interfaces
 *
 * @link https://eslint.style/rules/key-spacing
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
   *                 "type": "string",
   *                 "enum": [
   *                   "colon",
   *                   "value"
   *                 ]
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "mode": {
   *                     "type": "string",
   *                     "enum": [
   *                       "strict",
   *                       "minimum"
   *                     ]
   *                   },
   *                   "on": {
   *                     "type": "string",
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
   *             "type": "string",
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
   *           },
   *           "ignoredNodes": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "ObjectExpression",
   *                 "ObjectPattern",
   *                 "ImportDeclaration",
   *                 "ExportNamedDeclaration",
   *                 "ExportAllDeclaration",
   *                 "TSTypeLiteral",
   *                 "TSInterfaceBody",
   *                 "ClassBody"
   *               ]
   *             }
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
   *                 "type": "string",
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
   *                     "type": "string",
   *                     "enum": [
   *                       "colon",
   *                       "value"
   *                     ]
   *                   },
   *                   {
   *                     "type": "object",
   *                     "properties": {
   *                       "mode": {
   *                         "type": "string",
   *                         "enum": [
   *                           "strict",
   *                           "minimum"
   *                         ]
   *                       },
   *                       "on": {
   *                         "type": "string",
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
   *                 "type": "string",
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
   *                 "type": "string",
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
   *                 "type": "string",
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
   *                 "type": "string",
   *                 "enum": [
   *                   "strict",
   *                   "minimum"
   *                 ]
   *               },
   *               "on": {
   *                 "type": "string",
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
          | 'colon'
          | 'value'
          | {
              readonly mode?: 'minimum' | 'strict';
              readonly on?: 'colon' | 'value';
              readonly beforeColon?: boolean;
              readonly afterColon?: boolean;
            };
        readonly mode?: 'minimum' | 'strict';
        readonly beforeColon?: boolean;
        readonly afterColon?: boolean;
        readonly ignoredNodes?: readonly (
          | 'ClassBody'
          | 'ExportAllDeclaration'
          | 'ExportNamedDeclaration'
          | 'ImportDeclaration'
          | 'ObjectExpression'
          | 'ObjectPattern'
          | 'TSInterfaceBody'
          | 'TSTypeLiteral'
        )[];
      }
    | {
        readonly singleLine?: {
          readonly mode?: 'minimum' | 'strict';
          readonly beforeColon?: boolean;
          readonly afterColon?: boolean;
        };
        readonly multiLine?: {
          readonly align?:
            | 'colon'
            | 'value'
            | {
                readonly mode?: 'minimum' | 'strict';
                readonly on?: 'colon' | 'value';
                readonly beforeColon?: boolean;
                readonly afterColon?: boolean;
              };
          readonly mode?: 'minimum' | 'strict';
          readonly beforeColon?: boolean;
          readonly afterColon?: boolean;
        };
      }
    | {
        readonly singleLine?: {
          readonly mode?: 'minimum' | 'strict';
          readonly beforeColon?: boolean;
          readonly afterColon?: boolean;
        };
        readonly multiLine?: {
          readonly mode?: 'minimum' | 'strict';
          readonly beforeColon?: boolean;
          readonly afterColon?: boolean;
        };
        readonly align?: {
          readonly mode?: 'minimum' | 'strict';
          readonly on?: 'colon' | 'value';
          readonly beforeColon?: boolean;
          readonly afterColon?: boolean;
        };
      };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent spacing before and after keywords
 *
 * @link https://eslint.style/rules/keyword-spacing
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
   *           "arguments": {
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
   *           "eval": {
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
   *           "type": {
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
   *           "using": {
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
   *           },
   *           "accessor": {
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
   *           "satisfies": {
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
      readonly function?: {
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
      readonly arguments?: {
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
      readonly eval?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly from?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly get?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly let?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly of?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly set?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly type?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly using?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly yield?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly accessor?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly satisfies?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
    };
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce position of line comments
 *
 * @link https://eslint.style/rules/line-comment-position
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
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
   *         "type": "string",
   *         "enum": [
   *           "above",
   *           "beside"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "position": {
   *             "type": "string",
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent linebreak style
 *
 * @link https://eslint.style/rules/linebreak-style
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace LinebreakStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require empty lines around comments
 *
 * @link https://eslint.style/rules/lines-around-comment
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
   *       "allowInterfaceStart": {
   *         "type": "boolean"
   *       },
   *       "allowInterfaceEnd": {
   *         "type": "boolean"
   *       },
   *       "allowTypeStart": {
   *         "type": "boolean"
   *       },
   *       "allowTypeEnd": {
   *         "type": "boolean"
   *       },
   *       "allowEnumStart": {
   *         "type": "boolean"
   *       },
   *       "allowEnumEnd": {
   *         "type": "boolean"
   *       },
   *       "allowModuleStart": {
   *         "type": "boolean"
   *       },
   *       "allowModuleEnd": {
   *         "type": "boolean"
   *       },
   *       "ignorePattern": {
   *         "type": "string"
   *       },
   *       "applyDefaultIgnorePatterns": {
   *         "type": "boolean"
   *       },
   *       "afterHashbangComment": {
   *         "type": "boolean"
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
    readonly allowInterfaceStart?: boolean;
    readonly allowInterfaceEnd?: boolean;
    readonly allowTypeStart?: boolean;
    readonly allowTypeEnd?: boolean;
    readonly allowEnumStart?: boolean;
    readonly allowEnumEnd?: boolean;
    readonly allowModuleStart?: boolean;
    readonly allowModuleEnd?: boolean;
    readonly ignorePattern?: string;
    readonly applyDefaultIgnorePatterns?: boolean;
    readonly afterHashbangComment?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require or disallow an empty line between class members
 *
 * @link https://eslint.style/rules/lines-between-class-members
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
   *                   "type": "string",
   *                   "enum": [
   *                     "always",
   *                     "never"
   *                   ]
   *                 },
   *                 "prev": {
   *                   "type": "string",
   *                   "enum": [
   *                     "method",
   *                     "field",
   *                     "*"
   *                   ]
   *                 },
   *                 "next": {
   *                   "type": "string",
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
   *         "type": "string",
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
   *       },
   *       "exceptAfterOverload": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options0 =
    | {
        /** @minItems 1 */
        readonly enforce: readonly [
          {
            readonly blankLine: 'always' | 'never';
            readonly prev: '*' | 'field' | 'method';
            readonly next: '*' | 'field' | 'method';
          },
          ...(readonly {
            readonly blankLine: 'always' | 'never';
            readonly prev: '*' | 'field' | 'method';
            readonly next: '*' | 'field' | 'method';
          }[]),
        ];
      }
    | ('always' | 'never');

  export type Options1 = {
    readonly exceptAfterSingleLine?: boolean;
    readonly exceptAfterOverload?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

/**
 * Enforce consistent spacing and line break styles inside brackets.
 *
 * @link https://eslint.style/rules/list-style
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace ExpListStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "$defs": {
   *       "singleLineConfig": {
   *         "type": "object",
   *         "additionalProperties": false,
   *         "properties": {
   *           "spacing": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never"
   *             ]
   *           },
   *           "maxItems": {
   *             "type": "integer",
   *             "minimum": 0
   *           }
   *         }
   *       },
   *       "multiLineConfig": {
   *         "type": "object",
   *         "additionalProperties": false,
   *         "properties": {
   *           "minItems": {
   *             "type": "integer",
   *             "minimum": 0
   *           }
   *         }
   *       },
   *       "baseConfig": {
   *         "type": "object",
   *         "additionalProperties": false,
   *         "properties": {
   *           "singleLine": {
   *             "$ref": "#/items/0/$defs/singleLineConfig"
   *           },
   *           "multiline": {
   *             "$ref": "#/items/0/$defs/multiLineConfig"
   *           }
   *         }
   *       }
   *     },
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "singleLine": {
   *         "$ref": "#/items/0/$defs/singleLineConfig"
   *       },
   *       "multiLine": {
   *         "$ref": "#/items/0/$defs/multiLineConfig"
   *       },
   *       "overrides": {
   *         "type": "object",
   *         "additionalProperties": false,
   *         "properties": {
   *           "[]": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "{}": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "<>": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "()": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "ArrayExpression": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "ArrayPattern": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "ArrowFunctionExpression": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "CallExpression": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "ExportNamedDeclaration": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "FunctionDeclaration": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "FunctionExpression": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "ImportDeclaration": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "ImportAttributes": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "NewExpression": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "ObjectExpression": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "ObjectPattern": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "TSDeclareFunction": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "TSFunctionType": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "TSInterfaceBody": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "TSEnumBody": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "TSTupleType": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "TSTypeLiteral": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "TSTypeParameterDeclaration": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "TSTypeParameterInstantiation": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "JSONArrayExpression": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           },
   *           "JSONObjectExpression": {
   *             "$ref": "#/items/0/$defs/baseConfig"
   *           }
   *         }
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly singleLine?: SingleLineConfig;
    readonly multiLine?: MultiLineConfig;
    readonly overrides?: {
      readonly '[]'?: BaseConfig;
      readonly '{}'?: BaseConfig;
      readonly '<>'?: BaseConfig;
      readonly '()'?: BaseConfig;
      readonly ArrayExpression?: BaseConfig;
      readonly ArrayPattern?: BaseConfig;
      readonly ArrowFunctionExpression?: BaseConfig;
      readonly CallExpression?: BaseConfig;
      readonly ExportNamedDeclaration?: BaseConfig;
      readonly FunctionDeclaration?: BaseConfig;
      readonly FunctionExpression?: BaseConfig;
      readonly ImportDeclaration?: BaseConfig;
      readonly ImportAttributes?: BaseConfig;
      readonly NewExpression?: BaseConfig;
      readonly ObjectExpression?: BaseConfig;
      readonly ObjectPattern?: BaseConfig;
      readonly TSDeclareFunction?: BaseConfig;
      readonly TSFunctionType?: BaseConfig;
      readonly TSInterfaceBody?: BaseConfig;
      readonly TSEnumBody?: BaseConfig;
      readonly TSTupleType?: BaseConfig;
      readonly TSTypeLiteral?: BaseConfig;
      readonly TSTypeParameterDeclaration?: BaseConfig;
      readonly TSTypeParameterInstantiation?: BaseConfig;
      readonly JSONArrayExpression?: BaseConfig;
      readonly JSONObjectExpression?: BaseConfig;
    };
  };
  export type SingleLineConfig = {
    readonly spacing?: 'always' | 'never';
    readonly maxItems?: number;
  };
  export type MultiLineConfig = {
    readonly minItems?: number;
  };
  export type BaseConfig = {
    readonly singleLine?: SingleLineConfig;
    readonly multiline?: MultiLineConfig;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce a maximum line length
 *
 * @link https://eslint.style/rules/max-len
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
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
  export type Options0 =
    | number
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
      };

  export type Options1 =
    | number
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
      };

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
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0, Options1, Options2]
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

/**
 * Enforce a maximum number of statements allowed per line
 *
 * @link https://eslint.style/rules/max-statements-per-line
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
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
   *       },
   *       "ignoredNodes": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "enum": [
   *             "BreakStatement",
   *             "ClassDeclaration",
   *             "ContinueStatement",
   *             "DebuggerStatement",
   *             "DoWhileStatement",
   *             "ExpressionStatement",
   *             "ForInStatement",
   *             "ForOfStatement",
   *             "ForStatement",
   *             "FunctionDeclaration",
   *             "IfStatement",
   *             "ImportDeclaration",
   *             "LabeledStatement",
   *             "ReturnStatement",
   *             "SwitchStatement",
   *             "ThrowStatement",
   *             "TryStatement",
   *             "VariableDeclaration",
   *             "WhileStatement",
   *             "WithStatement",
   *             "ExportNamedDeclaration",
   *             "ExportDefaultDeclaration",
   *             "ExportAllDeclaration"
   *           ]
   *         }
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly max?: number;
    readonly ignoredNodes?: readonly (
      | 'BreakStatement'
      | 'ClassDeclaration'
      | 'ContinueStatement'
      | 'DebuggerStatement'
      | 'DoWhileStatement'
      | 'ExportAllDeclaration'
      | 'ExportDefaultDeclaration'
      | 'ExportNamedDeclaration'
      | 'ExpressionStatement'
      | 'ForInStatement'
      | 'ForOfStatement'
      | 'ForStatement'
      | 'FunctionDeclaration'
      | 'IfStatement'
      | 'ImportDeclaration'
      | 'LabeledStatement'
      | 'ReturnStatement'
      | 'SwitchStatement'
      | 'ThrowStatement'
      | 'TryStatement'
      | 'VariableDeclaration'
      | 'WhileStatement'
      | 'WithStatement'
    )[];
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require a specific member delimiter style for interfaces and type literals
 *
 * @link https://eslint.style/rules/member-delimiter-style
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace MemberDelimiterStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "$defs": {
   *       "multiLineOption": {
   *         "type": "string",
   *         "enum": [
   *           "none",
   *           "semi",
   *           "comma"
   *         ]
   *       },
   *       "singleLineOption": {
   *         "type": "string",
   *         "enum": [
   *           "semi",
   *           "comma"
   *         ]
   *       },
   *       "delimiterConfig": {
   *         "type": "object",
   *         "properties": {
   *           "multiline": {
   *             "type": "object",
   *             "properties": {
   *               "delimiter": {
   *                 "$ref": "#/items/0/$defs/multiLineOption"
   *               },
   *               "requireLast": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "singleline": {
   *             "type": "object",
   *             "properties": {
   *               "delimiter": {
   *                 "$ref": "#/items/0/$defs/singleLineOption"
   *               },
   *               "requireLast": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     },
   *     "type": "object",
   *     "properties": {
   *       "multiline": {
   *         "type": "object",
   *         "properties": {
   *           "delimiter": {
   *             "$ref": "#/items/0/$defs/multiLineOption"
   *           },
   *           "requireLast": {
   *             "type": "boolean"
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       "singleline": {
   *         "type": "object",
   *         "properties": {
   *           "delimiter": {
   *             "$ref": "#/items/0/$defs/singleLineOption"
   *           },
   *           "requireLast": {
   *             "type": "boolean"
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       "overrides": {
   *         "type": "object",
   *         "properties": {
   *           "interface": {
   *             "$ref": "#/items/0/$defs/delimiterConfig"
   *           },
   *           "typeLiteral": {
   *             "$ref": "#/items/0/$defs/delimiterConfig"
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       "multilineDetection": {
   *         "type": "string",
   *         "enum": [
   *           "brackets",
   *           "last-member"
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type MultiLineOption = 'comma' | 'none' | 'semi';
  export type SingleLineOption = 'comma' | 'semi';

  export type Options = {
    readonly multiline?: {
      readonly delimiter?: MultiLineOption;
      readonly requireLast?: boolean;
    };
    readonly singleline?: {
      readonly delimiter?: SingleLineOption;
      readonly requireLast?: boolean;
    };
    readonly overrides?: {
      readonly interface?: DelimiterConfig;
      readonly typeLiteral?: DelimiterConfig;
    };
    readonly multilineDetection?: 'brackets' | 'last-member';
  };
  export type DelimiterConfig = {
    readonly multiline?: {
      readonly delimiter?: MultiLineOption;
      readonly requireLast?: boolean;
    };
    readonly singleline?: {
      readonly delimiter?: SingleLineOption;
      readonly requireLast?: boolean;
    };
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce a particular style for multiline comments
 *
 * @link https://eslint.style/rules/multiline-comment-style
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
   *           "enum": ["starred-block", "bare-block"],
   *           "type": "string"
   *         }
   *       ],
   *       "additionalItems": false
   *     },
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["separate-lines"],
   *           "type": "string"
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "checkJSDoc": {
   *               "type": "boolean"
   *             },
   *             "checkExclamation": {
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
          readonly checkExclamation?: boolean;
        },
      ]
    | readonly ['bare-block' | 'starred-block']
    | readonly ['separate-lines']
    | readonly [];

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce newlines between operands of ternary expressions
 *
 * @link https://eslint.style/rules/multiline-ternary
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace MultilineTernary {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "enum": [
   *       "always",
   *       "always-multiline",
   *       "never"
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreJSX": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options0 = 'always-multiline' | 'always' | 'never';

  export type Options1 = {
    readonly ignoreJSX?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

/**
 * Enforce or disallow parentheses when invoking a constructor with no arguments
 *
 * @link https://eslint.style/rules/new-parens
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace NewParens {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require a newline after each call in a method chain
 *
 * @link https://eslint.style/rules/newline-per-chained-call
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
  export type Options = {
    readonly ignoreChainWithDepth?: number;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow arrow functions where they could be confused with comparisons
 *
 * @link https://eslint.style/rules/no-confusing-arrow
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
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
  export type Options = {
    readonly allowParens?: boolean;
    readonly onlyOneSimpleParam?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow unnecessary parentheses
 *
 * @link https://eslint.style/rules/no-extra-parens
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
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
   *           "type": "string",
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
   *           "type": "string",
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
   *               "type": "string",
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
   *             },
   *             "nestedConditionalExpressions": {
   *               "type": "boolean"
   *             },
   *             "allowNodesInSpreadElement": {
   *               "type": "object",
   *               "properties": {
   *                 "ConditionalExpression": {
   *                   "type": "boolean"
   *                 },
   *                 "LogicalExpression": {
   *                   "type": "boolean"
   *                 },
   *                 "AwaitExpression": {
   *                   "type": "boolean"
   *                 }
   *               },
   *               "additionalProperties": false
   *             },
   *             "ignoredNodes": {
   *               "type": "array",
   *               "items": {
   *                 "type": "string",
   *                 "not": {
   *                   "type": "string",
   *                   "pattern": ":exit$"
   *                 }
   *               }
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
        'all',
        {
          readonly conditionalAssign?: boolean;
          readonly ternaryOperandBinaryExpressions?: boolean;
          readonly nestedBinaryExpressions?: boolean;
          readonly returnAssign?: boolean;
          readonly ignoreJSX?: 'all' | 'multi-line' | 'none' | 'single-line';
          readonly enforceForArrowConditionals?: boolean;
          readonly enforceForSequenceExpressions?: boolean;
          readonly enforceForNewInMemberExpressions?: boolean;
          readonly enforceForFunctionPrototypeMethods?: boolean;
          readonly allowParensAfterCommentPattern?: string;
          readonly nestedConditionalExpressions?: boolean;
          readonly allowNodesInSpreadElement?: {
            readonly ConditionalExpression?: boolean;
            readonly LogicalExpression?: boolean;
            readonly AwaitExpression?: boolean;
          };
          readonly ignoredNodes?: readonly string[];
        },
      ]
    | readonly ['all']
    | readonly ['functions']
    | readonly [];

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow unnecessary semicolons
 *
 * @link https://eslint.style/rules/no-extra-semi
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace NoExtraSemi {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow leading or trailing decimal points in numeric literals
 *
 * @link https://eslint.style/rules/no-floating-decimal
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace NoFloatingDecimal {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow mixed binary operators
 *
 * @link https://eslint.style/rules/no-mixed-operators
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
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
   *             "type": "string",
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
        | '-'
        | '!='
        | '!=='
        | '?:'
        | '??'
        | '*'
        | '**'
        | '/'
        | '&'
        | '&&'
        | '%'
        | '^'
        | '+'
        | '<'
        | '<<'
        | '<='
        | '=='
        | '==='
        | '>'
        | '>='
        | '>>'
        | '>>>'
        | '|'
        | '||'
        | '~'
        | 'in'
        | 'instanceof'
      ),
      (
        | '-'
        | '!='
        | '!=='
        | '?:'
        | '??'
        | '*'
        | '**'
        | '/'
        | '&'
        | '&&'
        | '%'
        | '^'
        | '+'
        | '<'
        | '<<'
        | '<='
        | '=='
        | '==='
        | '>'
        | '>='
        | '>>'
        | '>>>'
        | '|'
        | '||'
        | '~'
        | 'in'
        | 'instanceof'
      ),
      ...(readonly (
        | '-'
        | '!='
        | '!=='
        | '?:'
        | '??'
        | '*'
        | '**'
        | '/'
        | '&'
        | '&&'
        | '%'
        | '^'
        | '+'
        | '<'
        | '<<'
        | '<='
        | '=='
        | '==='
        | '>'
        | '>='
        | '>>'
        | '>>>'
        | '|'
        | '||'
        | '~'
        | 'in'
        | 'instanceof'
      )[]),
    ])[];
    readonly allowSamePrecedence?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow mixed spaces and tabs for indentation
 *
 * @link https://eslint.style/rules/no-mixed-spaces-and-tabs
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  ```
 */
namespace NoMixedSpacesAndTabs {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "type": "string",
   *         "enum": [
   *           "smart-tabs"
   *         ]
   *       },
   *       {
   *         "type": "boolean"
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = boolean | 'smart-tabs';

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow multiple spaces
 *
 * @link https://eslint.style/rules/no-multi-spaces
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
   *       },
   *       "includeTabs": {
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
    readonly exceptions?: Record<string, boolean>;
    readonly ignoreEOLComments?: boolean;
    readonly includeTabs?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow multiple empty lines
 *
 * @link https://eslint.style/rules/no-multiple-empty-lines
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
  export type Options = {
    readonly max: number;
    readonly maxEOF?: number;
    readonly maxBOF?: number;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow all tabs
 *
 * @link https://eslint.style/rules/no-tabs
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
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
  export type Options = {
    readonly allowIndentationTabs?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow trailing whitespace at the end of lines
 *
 * @link https://eslint.style/rules/no-trailing-spaces
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
  export type Options = {
    readonly skipBlankLines?: boolean;
    readonly ignoreComments?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow whitespace before properties
 *
 * @link https://eslint.style/rules/no-whitespace-before-property
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace NoWhitespaceBeforeProperty {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the location of single-line statements
 *
 * @link https://eslint.style/rules/nonblock-statement-body-position
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace NonblockStatementBodyPosition {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "enum": [
   *       "beside",
   *       "below",
   *       "any"
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "overrides": {
   *         "type": "object",
   *         "properties": {
   *           "if": {
   *             "type": "string",
   *             "enum": [
   *               "beside",
   *               "below",
   *               "any"
   *             ]
   *           },
   *           "else": {
   *             "type": "string",
   *             "enum": [
   *               "beside",
   *               "below",
   *               "any"
   *             ]
   *           },
   *           "while": {
   *             "type": "string",
   *             "enum": [
   *               "beside",
   *               "below",
   *               "any"
   *             ]
   *           },
   *           "do": {
   *             "type": "string",
   *             "enum": [
   *               "beside",
   *               "below",
   *               "any"
   *             ]
   *           },
   *           "for": {
   *             "type": "string",
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
  export type Options0 = 'any' | 'below' | 'beside';

  export type Options1 = {
    readonly overrides?: {
      readonly if?: 'any' | 'below' | 'beside';
      readonly else?: 'any' | 'below' | 'beside';
      readonly while?: 'any' | 'below' | 'beside';
      readonly do?: 'any' | 'below' | 'beside';
      readonly for?: 'any' | 'below' | 'beside';
    };
  };

  export type RuleEntry =
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

/**
 * Enforce consistent line breaks after opening and before closing braces
 *
 * @link https://eslint.style/rules/object-curly-newline
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
   *             "type": "string",
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
   *                 "type": "string",
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
   *                 "type": "string",
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
   *                 "type": "string",
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
   *                 "type": "string",
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
   *           "TSTypeLiteral": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *           "TSInterfaceBody": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
   *           "TSEnumBody": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
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
    | 'always'
    | 'never'
    | {
        readonly multiline?: boolean;
        readonly minProperties?: number;
        readonly consistent?: boolean;
      }
    | {
        readonly ObjectExpression?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minProperties?: number;
              readonly consistent?: boolean;
            };
        readonly ObjectPattern?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minProperties?: number;
              readonly consistent?: boolean;
            };
        readonly ImportDeclaration?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minProperties?: number;
              readonly consistent?: boolean;
            };
        readonly ExportDeclaration?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minProperties?: number;
              readonly consistent?: boolean;
            };
        readonly TSTypeLiteral?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minProperties?: number;
              readonly consistent?: boolean;
            };
        readonly TSInterfaceBody?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minProperties?: number;
              readonly consistent?: boolean;
            };
        readonly TSEnumBody?:
          | 'always'
          | 'never'
          | {
              readonly multiline?: boolean;
              readonly minProperties?: number;
              readonly consistent?: boolean;
            };
      };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent spacing inside braces
 *
 * @link https://eslint.style/rules/object-curly-spacing
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace ObjectCurlySpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
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
   *       },
   *       "overrides": {
   *         "type": "object",
   *         "properties": {
   *           "ObjectPattern": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never"
   *             ]
   *           },
   *           "ObjectExpression": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never"
   *             ]
   *           },
   *           "ImportDeclaration": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never"
   *             ]
   *           },
   *           "ImportAttributes": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never"
   *             ]
   *           },
   *           "ExportNamedDeclaration": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never"
   *             ]
   *           },
   *           "ExportAllDeclaration": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never"
   *             ]
   *           },
   *           "TSMappedType": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never"
   *             ]
   *           },
   *           "TSTypeLiteral": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never"
   *             ]
   *           },
   *           "TSInterfaceBody": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never"
   *             ]
   *           },
   *           "TSEnumBody": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never"
   *             ]
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       "emptyObjects": {
   *         "type": "string",
   *         "enum": [
   *           "ignore",
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
  export type Options0 = 'always' | 'never';

  export type Options1 = {
    readonly arraysInObjects?: boolean;
    readonly objectsInObjects?: boolean;
    readonly overrides?: {
      readonly ObjectPattern?: 'always' | 'never';
      readonly ObjectExpression?: 'always' | 'never';
      readonly ImportDeclaration?: 'always' | 'never';
      readonly ImportAttributes?: 'always' | 'never';
      readonly ExportNamedDeclaration?: 'always' | 'never';
      readonly ExportAllDeclaration?: 'always' | 'never';
      readonly TSMappedType?: 'always' | 'never';
      readonly TSTypeLiteral?: 'always' | 'never';
      readonly TSInterfaceBody?: 'always' | 'never';
      readonly TSEnumBody?: 'always' | 'never';
    };
    readonly emptyObjects?: 'always' | 'ignore' | 'never';
  };

  export type RuleEntry =
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

/**
 * Enforce placing object properties on separate lines
 *
 * @link https://eslint.style/rules/object-property-newline
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowAllPropertiesOnSameLine?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require or disallow newlines around variable declarations
 *
 * @link https://eslint.style/rules/one-var-declaration-per-line
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace OneVarDeclarationPerLine {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent linebreak style for operators
 *
 * @link https://eslint.style/rules/operator-linebreak
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace OperatorLinebreak {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "type": "string",
   *         "enum": [
   *           "after",
   *           "before",
   *           "none"
   *         ]
   *       },
   *       {
   *         "type": "null"
   *       }
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "overrides": {
   *         "type": "object",
   *         "additionalProperties": {
   *           "type": "string",
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
  export type Options0 = ('after' | 'before' | 'none') | null;

  export type Options1 = {
    readonly overrides?: Record<string, 'after' | 'before' | 'ignore' | 'none'>;
  };

  export type RuleEntry =
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

/**
 * Require or disallow padding within blocks
 *
 * @link https://eslint.style/rules/padded-blocks
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
   *         "type": "string",
   *         "enum": [
   *           "always",
   *           "never",
   *           "start",
   *           "end"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "blocks": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never",
   *               "start",
   *               "end"
   *             ]
   *           },
   *           "switches": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never",
   *               "start",
   *               "end"
   *             ]
   *           },
   *           "classes": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never",
   *               "start",
   *               "end"
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
    | 'always'
    | 'end'
    | 'never'
    | 'start'
    | {
        readonly blocks?: 'always' | 'end' | 'never' | 'start';
        readonly switches?: 'always' | 'end' | 'never' | 'start';
        readonly classes?: 'always' | 'end' | 'never' | 'start';
      };

  export type Options1 = {
    readonly allowSingleLineBlocks?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

/**
 * Require or disallow padding lines between statements
 *
 * @link https://eslint.style/rules/padding-line-between-statements
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | layout     |
 *  | deprecated     | false      |
 *  | fixable        | whitespace |
 *  | hasSuggestions | false      |
 *  ```
 */
namespace PaddingLineBetweenStatements {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "$defs": {
   *     "paddingType": {
   *       "type": "string",
   *       "enum": ["any", "never", "always"]
   *     },
   *     "statementType": {
   *       "type": "string",
   *       "enum": [
   *         "*",
   *         "exports",
   *         "require",
   *         "directive",
   *         "iife",
   *         "block",
   *         "empty",
   *         "function",
   *         "ts-method",
   *         "break",
   *         "case",
   *         "class",
   *         "continue",
   *         "debugger",
   *         "default",
   *         "do",
   *         "for",
   *         "if",
   *         "import",
   *         "switch",
   *         "throw",
   *         "try",
   *         "while",
   *         "with",
   *         "cjs-export",
   *         "cjs-import",
   *         "enum",
   *         "interface",
   *         "function-overload",
   *         "block-like",
   *         "singleline-block-like",
   *         "multiline-block-like",
   *         "expression",
   *         "singleline-expression",
   *         "multiline-expression",
   *         "return",
   *         "singleline-return",
   *         "multiline-return",
   *         "export",
   *         "singleline-export",
   *         "multiline-export",
   *         "var",
   *         "singleline-var",
   *         "multiline-var",
   *         "let",
   *         "singleline-let",
   *         "multiline-let",
   *         "const",
   *         "singleline-const",
   *         "multiline-const",
   *         "using",
   *         "singleline-using",
   *         "multiline-using",
   *         "type",
   *         "singleline-type",
   *         "multiline-type"
   *       ]
   *     },
   *     "statementOption": {
   *       "anyOf": [
   *         {
   *           "$ref": "#/$defs/statementType"
   *         },
   *         {
   *           "type": "array",
   *           "items": {
   *             "$ref": "#/$defs/statementType"
   *           },
   *           "minItems": 1,
   *           "uniqueItems": true,
   *           "additionalItems": false
   *         }
   *       ]
   *     }
   *   },
   *   "type": "array",
   *   "additionalItems": false,
   *   "items": {
   *     "type": "object",
   *     "properties": {
   *       "blankLine": {
   *         "$ref": "#/$defs/paddingType"
   *       },
   *       "prev": {
   *         "$ref": "#/$defs/statementOption"
   *       },
   *       "next": {
   *         "$ref": "#/$defs/statementOption"
   *       }
   *     },
   *     "additionalProperties": false,
   *     "required": ["blankLine", "prev", "next"]
   *   }
   * }
   * ```
   */
  export type PaddingType = 'always' | 'any' | 'never';
  export type StatementOption =
    | StatementType
    | readonly [StatementType, ...(readonly StatementType[])];
  export type StatementType =
    | '*'
    | 'block-like'
    | 'block'
    | 'break'
    | 'case'
    | 'cjs-export'
    | 'cjs-import'
    | 'class'
    | 'const'
    | 'continue'
    | 'debugger'
    | 'default'
    | 'directive'
    | 'do'
    | 'empty'
    | 'enum'
    | 'export'
    | 'exports'
    | 'expression'
    | 'for'
    | 'function-overload'
    | 'function'
    | 'if'
    | 'iife'
    | 'import'
    | 'interface'
    | 'let'
    | 'multiline-block-like'
    | 'multiline-const'
    | 'multiline-export'
    | 'multiline-expression'
    | 'multiline-let'
    | 'multiline-return'
    | 'multiline-type'
    | 'multiline-using'
    | 'multiline-var'
    | 'require'
    | 'return'
    | 'singleline-block-like'
    | 'singleline-const'
    | 'singleline-export'
    | 'singleline-expression'
    | 'singleline-let'
    | 'singleline-return'
    | 'singleline-type'
    | 'singleline-using'
    | 'singleline-var'
    | 'switch'
    | 'throw'
    | 'try'
    | 'ts-method'
    | 'type'
    | 'using'
    | 'var'
    | 'while'
    | 'with';
  export type Options = readonly {
    readonly blankLine: PaddingType;
    readonly prev: StatementOption;
    readonly next: StatementOption;
  }[];

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require quotes around object literal, type literal, interfaces and enums
 * property names
 *
 * @link https://eslint.style/rules/quote-props
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
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
   *           "type": "string",
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
   *           "type": "string",
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
    | readonly [
        'always' | 'as-needed' | 'consistent-as-needed' | 'consistent',
        {
          readonly keywords?: boolean;
          readonly unnecessary?: boolean;
          readonly numbers?: boolean;
        },
      ]
    | readonly ['always' | 'as-needed' | 'consistent-as-needed' | 'consistent']
    | readonly [];

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce the consistent use of either backticks, double, or single quotes
 *
 * @link https://eslint.style/rules/quotes
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace Quotes {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "enum": [
   *       "single",
   *       "double",
   *       "backtick"
   *     ]
   *   },
   *   {
   *     "anyOf": [
   *       {
   *         "type": "string",
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
   *             "anyOf": [
   *               {
   *                 "type": "boolean"
   *               },
   *               {
   *                 "type": "string",
   *                 "enum": [
   *                   "never",
   *                   "avoidEscape",
   *                   "always"
   *                 ]
   *               }
   *             ]
   *           },
   *           "ignoreStringLiterals": {
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
  export type Options0 = 'backtick' | 'double' | 'single';

  export type Options1 =
    | 'avoid-escape'
    | {
        readonly avoidEscape?: boolean;
        readonly allowTemplateLiterals?:
          | boolean
          | ('always' | 'avoidEscape' | 'never');
        readonly ignoreStringLiterals?: boolean;
      };

  export type RuleEntry =
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

/**
 * Enforce spacing between rest and spread operators and their expressions
 *
 * @link https://eslint.style/rules/rest-spread-spacing
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace RestSpreadSpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require or disallow semicolons instead of ASI
 *
 * @link https://eslint.style/rules/semi
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
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
   *           "type": "string",
   *           "enum": ["never"]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "beforeStatementContinuationChars": {
   *               "type": "string",
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
   *           "type": "string",
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
  export type Options =
    | readonly [
        'always',
        {
          readonly omitLastInOneLineBlock?: boolean;
          readonly omitLastInOneLineClassBody?: boolean;
        },
      ]
    | readonly [
        'never',
        {
          readonly beforeStatementContinuationChars?:
            | 'always'
            | 'any'
            | 'never';
        },
      ]
    | readonly ['always']
    | readonly ['never']
    | readonly [];

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent spacing before and after semicolons
 *
 * @link https://eslint.style/rules/semi-spacing
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
  export type Options = {
    readonly before?: boolean;
    readonly after?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce location of semicolons
 *
 * @link https://eslint.style/rules/semi-style
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace SemiStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "enum": [
   *       "last",
   *       "first"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'first' | 'last';

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent spacing before blocks
 *
 * @link https://eslint.style/rules/space-before-blocks
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
   *         "type": "string",
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "keywords": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never",
   *               "off"
   *             ]
   *           },
   *           "functions": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never",
   *               "off"
   *             ]
   *           },
   *           "classes": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never",
   *               "off"
   *             ]
   *           },
   *           "modules": {
   *             "type": "string",
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
    | 'always'
    | 'never'
    | {
        readonly keywords?: 'always' | 'never' | 'off';
        readonly functions?: 'always' | 'never' | 'off';
        readonly classes?: 'always' | 'never' | 'off';
        readonly modules?: 'always' | 'never' | 'off';
      };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent spacing before function parenthesis
 *
 * @link https://eslint.style/rules/space-before-function-paren
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
   *         "type": "string",
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "anonymous": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never",
   *               "ignore"
   *             ]
   *           },
   *           "named": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never",
   *               "ignore"
   *             ]
   *           },
   *           "asyncArrow": {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never",
   *               "ignore"
   *             ]
   *           },
   *           "catch": {
   *             "type": "string",
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
    | 'always'
    | 'never'
    | {
        readonly anonymous?: 'always' | 'ignore' | 'never';
        readonly named?: 'always' | 'ignore' | 'never';
        readonly asyncArrow?: 'always' | 'ignore' | 'never';
        readonly catch?: 'always' | 'ignore' | 'never';
      };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent spacing inside parentheses
 *
 * @link https://eslint.style/rules/space-in-parens
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace SpaceInParens {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
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
   *           "type": "string",
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
    readonly exceptions?: readonly ('()' | '[]' | '{}' | 'empty')[];
  };

  export type RuleEntry =
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

/**
 * Require spacing around infix operators
 *
 * @link https://eslint.style/rules/space-infix-ops
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
   *       },
   *       "ignoreTypes": {
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
    readonly ignoreTypes?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent spacing before or after unary operators
 *
 * @link https://eslint.style/rules/space-unary-ops
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
  export type Options = {
    readonly words?: boolean;
    readonly nonwords?: boolean;
    readonly overrides?: Record<string, boolean>;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent spacing after the `//` or ` ` in a comment
 *
 * @link https://eslint.style/rules/spaced-comment
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace SpacedComment {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
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
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

/**
 * Enforce spacing around colons of switch statements
 *
 * @link https://eslint.style/rules/switch-colon-spacing
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
  export type Options = {
    readonly before?: boolean;
    readonly after?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require or disallow spacing around embedded expressions of template strings
 *
 * @link https://eslint.style/rules/template-curly-spacing
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace TemplateCurlySpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require or disallow spacing between template tags and their literals
 *
 * @link https://eslint.style/rules/template-tag-spacing
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace TemplateTagSpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require consistent spacing around type annotations
 *
 * @link https://eslint.style/rules/type-annotation-spacing
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace TypeAnnotationSpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "$defs": {
   *       "spacingConfig": {
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
   *     },
   *     "type": "object",
   *     "properties": {
   *       "before": {
   *         "type": "boolean"
   *       },
   *       "after": {
   *         "type": "boolean"
   *       },
   *       "overrides": {
   *         "type": "object",
   *         "properties": {
   *           "colon": {
   *             "$ref": "#/items/0/$defs/spacingConfig"
   *           },
   *           "arrow": {
   *             "$ref": "#/items/0/$defs/spacingConfig"
   *           },
   *           "variable": {
   *             "$ref": "#/items/0/$defs/spacingConfig"
   *           },
   *           "parameter": {
   *             "$ref": "#/items/0/$defs/spacingConfig"
   *           },
   *           "property": {
   *             "$ref": "#/items/0/$defs/spacingConfig"
   *           },
   *           "returnType": {
   *             "$ref": "#/items/0/$defs/spacingConfig"
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
      readonly colon?: SpacingConfig;
      readonly arrow?: SpacingConfig;
      readonly variable?: SpacingConfig;
      readonly parameter?: SpacingConfig;
      readonly property?: SpacingConfig;
      readonly returnType?: SpacingConfig;
    };
  };
  export type SpacingConfig = {
    readonly before?: boolean;
    readonly after?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforces consistent spacing inside TypeScript type generics
 *
 * @link https://eslint.style/rules/type-generic-spacing
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace TypeGenericSpacing {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Expect space before the type declaration in the named tuple
 *
 * @link https://eslint.style/rules/type-named-tuple-spacing
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
 */
namespace TypeNamedTupleSpacing {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require parentheses around immediate `function` invocations
 *
 * @link https://eslint.style/rules/wrap-iife
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace WrapIife {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
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
  export type Options0 = 'any' | 'inside' | 'outside';

  export type Options1 = {
    readonly functionPrototypeMethods?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

/**
 * Require parenthesis around regex literals
 *
 * @link https://eslint.style/rules/wrap-regex
 *
 *  ```md
 *  | key        | value  |
 *  | :--------- | :----- |
 *  | type       | layout |
 *  | deprecated | false  |
 *  | fixable    | code   |
 *  ```
 */
namespace WrapRegex {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require or disallow spacing around the `*` in `yield*` expressions
 *
 * @link https://eslint.style/rules/yield-star-spacing
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
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
   *         "type": "string",
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
    | 'after'
    | 'before'
    | 'both'
    | 'neither'
    | {
        readonly before?: boolean;
        readonly after?: boolean;
      };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

export type EslintStylisticRules = {
  readonly '@stylistic/array-bracket-newline': ArrayBracketNewline.RuleEntry;
  readonly '@stylistic/array-bracket-spacing': ArrayBracketSpacing.RuleEntry;
  readonly '@stylistic/array-element-newline': ArrayElementNewline.RuleEntry;
  readonly '@stylistic/arrow-parens': ArrowParens.RuleEntry;
  readonly '@stylistic/arrow-spacing': ArrowSpacing.RuleEntry;
  readonly '@stylistic/block-spacing': BlockSpacing.RuleEntry;
  readonly '@stylistic/brace-style': BraceStyle.RuleEntry;
  readonly '@stylistic/comma-dangle': CommaDangle.RuleEntry;
  readonly '@stylistic/comma-spacing': CommaSpacing.RuleEntry;
  readonly '@stylistic/comma-style': CommaStyle.RuleEntry;
  readonly '@stylistic/computed-property-spacing': ComputedPropertySpacing.RuleEntry;
  readonly '@stylistic/curly-newline': CurlyNewline.RuleEntry;
  readonly '@stylistic/dot-location': DotLocation.RuleEntry;
  readonly '@stylistic/eol-last': EolLast.RuleEntry;
  readonly '@stylistic/function-call-argument-newline': FunctionCallArgumentNewline.RuleEntry;
  readonly '@stylistic/function-call-spacing': FunctionCallSpacing.RuleEntry;
  readonly '@stylistic/function-paren-newline': FunctionParenNewline.RuleEntry;
  readonly '@stylistic/generator-star-spacing': GeneratorStarSpacing.RuleEntry;
  readonly '@stylistic/implicit-arrow-linebreak': ImplicitArrowLinebreak.RuleEntry;
  readonly '@stylistic/indent': Indent.RuleEntry;
  readonly '@stylistic/indent-binary-ops': IndentBinaryOps.RuleEntry;
  readonly '@stylistic/jsx-child-element-spacing': JsxChildElementSpacing.RuleEntry;
  readonly '@stylistic/jsx-closing-bracket-location': JsxClosingBracketLocation.RuleEntry;
  readonly '@stylistic/jsx-closing-tag-location': JsxClosingTagLocation.RuleEntry;
  readonly '@stylistic/jsx-curly-brace-presence': JsxCurlyBracePresence.RuleEntry;
  readonly '@stylistic/jsx-curly-newline': JsxCurlyNewline.RuleEntry;
  readonly '@stylistic/jsx-curly-spacing': JsxCurlySpacing.RuleEntry;
  readonly '@stylistic/jsx-equals-spacing': JsxEqualsSpacing.RuleEntry;
  readonly '@stylistic/jsx-first-prop-new-line': JsxFirstPropNewLine.RuleEntry;
  readonly '@stylistic/jsx-function-call-newline': JsxFunctionCallNewline.RuleEntry;
  readonly '@stylistic/jsx-indent-props': JsxIndentProps.RuleEntry;
  readonly '@stylistic/jsx-max-props-per-line': JsxMaxPropsPerLine.RuleEntry;
  readonly '@stylistic/jsx-newline': JsxNewline.RuleEntry;
  readonly '@stylistic/jsx-one-expression-per-line': JsxOneExpressionPerLine.RuleEntry;
  readonly '@stylistic/jsx-pascal-case': JsxPascalCase.RuleEntry;
  readonly '@stylistic/jsx-quotes': JsxQuotes.RuleEntry;
  readonly '@stylistic/jsx-self-closing-comp': JsxSelfClosingComp.RuleEntry;
  readonly '@stylistic/jsx-sort-props': JsxSortProps.RuleEntry;
  readonly '@stylistic/jsx-tag-spacing': JsxTagSpacing.RuleEntry;
  readonly '@stylistic/jsx-wrap-multilines': JsxWrapMultilines.RuleEntry;
  readonly '@stylistic/key-spacing': KeySpacing.RuleEntry;
  readonly '@stylistic/keyword-spacing': KeywordSpacing.RuleEntry;
  readonly '@stylistic/line-comment-position': LineCommentPosition.RuleEntry;
  readonly '@stylistic/linebreak-style': LinebreakStyle.RuleEntry;
  readonly '@stylistic/lines-around-comment': LinesAroundComment.RuleEntry;
  readonly '@stylistic/lines-between-class-members': LinesBetweenClassMembers.RuleEntry;
  readonly '@stylistic/exp-list-style': ExpListStyle.RuleEntry;
  readonly '@stylistic/max-len': MaxLen.RuleEntry;
  readonly '@stylistic/max-statements-per-line': MaxStatementsPerLine.RuleEntry;
  readonly '@stylistic/member-delimiter-style': MemberDelimiterStyle.RuleEntry;
  readonly '@stylistic/multiline-comment-style': MultilineCommentStyle.RuleEntry;
  readonly '@stylistic/multiline-ternary': MultilineTernary.RuleEntry;
  readonly '@stylistic/new-parens': NewParens.RuleEntry;
  readonly '@stylistic/newline-per-chained-call': NewlinePerChainedCall.RuleEntry;
  readonly '@stylistic/no-confusing-arrow': NoConfusingArrow.RuleEntry;
  readonly '@stylistic/no-extra-parens': NoExtraParens.RuleEntry;
  readonly '@stylistic/no-extra-semi': NoExtraSemi.RuleEntry;
  readonly '@stylistic/no-floating-decimal': NoFloatingDecimal.RuleEntry;
  readonly '@stylistic/no-mixed-operators': NoMixedOperators.RuleEntry;
  readonly '@stylistic/no-mixed-spaces-and-tabs': NoMixedSpacesAndTabs.RuleEntry;
  readonly '@stylistic/no-multi-spaces': NoMultiSpaces.RuleEntry;
  readonly '@stylistic/no-multiple-empty-lines': NoMultipleEmptyLines.RuleEntry;
  readonly '@stylistic/no-tabs': NoTabs.RuleEntry;
  readonly '@stylistic/no-trailing-spaces': NoTrailingSpaces.RuleEntry;
  readonly '@stylistic/no-whitespace-before-property': NoWhitespaceBeforeProperty.RuleEntry;
  readonly '@stylistic/nonblock-statement-body-position': NonblockStatementBodyPosition.RuleEntry;
  readonly '@stylistic/object-curly-newline': ObjectCurlyNewline.RuleEntry;
  readonly '@stylistic/object-curly-spacing': ObjectCurlySpacing.RuleEntry;
  readonly '@stylistic/object-property-newline': ObjectPropertyNewline.RuleEntry;
  readonly '@stylistic/one-var-declaration-per-line': OneVarDeclarationPerLine.RuleEntry;
  readonly '@stylistic/operator-linebreak': OperatorLinebreak.RuleEntry;
  readonly '@stylistic/padded-blocks': PaddedBlocks.RuleEntry;
  readonly '@stylistic/padding-line-between-statements': PaddingLineBetweenStatements.RuleEntry;
  readonly '@stylistic/quote-props': QuoteProps.RuleEntry;
  readonly '@stylistic/quotes': Quotes.RuleEntry;
  readonly '@stylistic/rest-spread-spacing': RestSpreadSpacing.RuleEntry;
  readonly '@stylistic/semi': Semi.RuleEntry;
  readonly '@stylistic/semi-spacing': SemiSpacing.RuleEntry;
  readonly '@stylistic/semi-style': SemiStyle.RuleEntry;
  readonly '@stylistic/space-before-blocks': SpaceBeforeBlocks.RuleEntry;
  readonly '@stylistic/space-before-function-paren': SpaceBeforeFunctionParen.RuleEntry;
  readonly '@stylistic/space-in-parens': SpaceInParens.RuleEntry;
  readonly '@stylistic/space-infix-ops': SpaceInfixOps.RuleEntry;
  readonly '@stylistic/space-unary-ops': SpaceUnaryOps.RuleEntry;
  readonly '@stylistic/spaced-comment': SpacedComment.RuleEntry;
  readonly '@stylistic/switch-colon-spacing': SwitchColonSpacing.RuleEntry;
  readonly '@stylistic/template-curly-spacing': TemplateCurlySpacing.RuleEntry;
  readonly '@stylistic/template-tag-spacing': TemplateTagSpacing.RuleEntry;
  readonly '@stylistic/type-annotation-spacing': TypeAnnotationSpacing.RuleEntry;
  readonly '@stylistic/type-generic-spacing': TypeGenericSpacing.RuleEntry;
  readonly '@stylistic/type-named-tuple-spacing': TypeNamedTupleSpacing.RuleEntry;
  readonly '@stylistic/wrap-iife': WrapIife.RuleEntry;
  readonly '@stylistic/wrap-regex': WrapRegex.RuleEntry;
  readonly '@stylistic/yield-star-spacing': YieldStarSpacing.RuleEntry;

  // deprecated
  readonly '@stylistic/jsx-indent': JsxIndent.RuleEntry;
  readonly '@stylistic/jsx-props-no-multi-spaces': JsxPropsNoMultiSpaces.RuleEntry;
};

export type EslintStylisticRulesOption = {
  readonly '@stylistic/array-bracket-newline': ArrayBracketNewline.Options;
  readonly '@stylistic/array-bracket-spacing': readonly [
    ArrayBracketSpacing.Options0,
    ArrayBracketSpacing.Options1,
  ];
  readonly '@stylistic/array-element-newline': ArrayElementNewline.Options;
  readonly '@stylistic/arrow-parens': readonly [
    ArrowParens.Options0,
    ArrowParens.Options1,
  ];
  readonly '@stylistic/arrow-spacing': ArrowSpacing.Options;
  readonly '@stylistic/block-spacing': BlockSpacing.Options;
  readonly '@stylistic/brace-style': readonly [
    BraceStyle.Options0,
    BraceStyle.Options1,
  ];
  readonly '@stylistic/comma-dangle': CommaDangle.Options;
  readonly '@stylistic/comma-spacing': CommaSpacing.Options;
  readonly '@stylistic/comma-style': readonly [
    CommaStyle.Options0,
    CommaStyle.Options1,
  ];
  readonly '@stylistic/computed-property-spacing': readonly [
    ComputedPropertySpacing.Options0,
    ComputedPropertySpacing.Options1,
  ];
  readonly '@stylistic/curly-newline': CurlyNewline.Options;
  readonly '@stylistic/dot-location': DotLocation.Options;
  readonly '@stylistic/eol-last': EolLast.Options;
  readonly '@stylistic/function-call-argument-newline': FunctionCallArgumentNewline.Options;
  readonly '@stylistic/function-call-spacing': FunctionCallSpacing.Options;
  readonly '@stylistic/function-paren-newline': FunctionParenNewline.Options;
  readonly '@stylistic/generator-star-spacing': GeneratorStarSpacing.Options;
  readonly '@stylistic/implicit-arrow-linebreak': ImplicitArrowLinebreak.Options;
  readonly '@stylistic/indent': readonly [Indent.Options0, Indent.Options1];
  readonly '@stylistic/indent-binary-ops': IndentBinaryOps.Options;
  readonly '@stylistic/jsx-closing-bracket-location': JsxClosingBracketLocation.Options;
  readonly '@stylistic/jsx-closing-tag-location': JsxClosingTagLocation.Options;
  readonly '@stylistic/jsx-curly-brace-presence': JsxCurlyBracePresence.Options;
  readonly '@stylistic/jsx-curly-newline': JsxCurlyNewline.Options;
  readonly '@stylistic/jsx-curly-spacing': JsxCurlySpacing.Options;
  readonly '@stylistic/jsx-equals-spacing': JsxEqualsSpacing.Options;
  readonly '@stylistic/jsx-first-prop-new-line': JsxFirstPropNewLine.Options;
  readonly '@stylistic/jsx-function-call-newline': JsxFunctionCallNewline.Options;
  readonly '@stylistic/jsx-indent-props': JsxIndentProps.Options;
  readonly '@stylistic/jsx-max-props-per-line': JsxMaxPropsPerLine.Options;
  readonly '@stylistic/jsx-newline': JsxNewline.Options;
  readonly '@stylistic/jsx-one-expression-per-line': JsxOneExpressionPerLine.Options;
  readonly '@stylistic/jsx-pascal-case': JsxPascalCase.Options;
  readonly '@stylistic/jsx-quotes': JsxQuotes.Options;
  readonly '@stylistic/jsx-self-closing-comp': JsxSelfClosingComp.Options;
  readonly '@stylistic/jsx-sort-props': JsxSortProps.Options;
  readonly '@stylistic/jsx-tag-spacing': JsxTagSpacing.Options;
  readonly '@stylistic/jsx-wrap-multilines': JsxWrapMultilines.Options;
  readonly '@stylistic/key-spacing': KeySpacing.Options;
  readonly '@stylistic/keyword-spacing': KeywordSpacing.Options;
  readonly '@stylistic/line-comment-position': LineCommentPosition.Options;
  readonly '@stylistic/linebreak-style': LinebreakStyle.Options;
  readonly '@stylistic/lines-around-comment': LinesAroundComment.Options;
  readonly '@stylistic/lines-between-class-members': readonly [
    LinesBetweenClassMembers.Options0,
    LinesBetweenClassMembers.Options1,
  ];
  readonly '@stylistic/exp-list-style': ExpListStyle.Options;
  readonly '@stylistic/max-len': readonly [
    MaxLen.Options0,
    MaxLen.Options1,
    MaxLen.Options2,
  ];
  readonly '@stylistic/max-statements-per-line': MaxStatementsPerLine.Options;
  readonly '@stylistic/member-delimiter-style': MemberDelimiterStyle.Options;
  readonly '@stylistic/multiline-comment-style': MultilineCommentStyle.Options;
  readonly '@stylistic/multiline-ternary': readonly [
    MultilineTernary.Options0,
    MultilineTernary.Options1,
  ];
  readonly '@stylistic/new-parens': NewParens.Options;
  readonly '@stylistic/newline-per-chained-call': NewlinePerChainedCall.Options;
  readonly '@stylistic/no-confusing-arrow': NoConfusingArrow.Options;
  readonly '@stylistic/no-extra-parens': NoExtraParens.Options;
  readonly '@stylistic/no-mixed-operators': NoMixedOperators.Options;
  readonly '@stylistic/no-mixed-spaces-and-tabs': NoMixedSpacesAndTabs.Options;
  readonly '@stylistic/no-multi-spaces': NoMultiSpaces.Options;
  readonly '@stylistic/no-multiple-empty-lines': NoMultipleEmptyLines.Options;
  readonly '@stylistic/no-tabs': NoTabs.Options;
  readonly '@stylistic/no-trailing-spaces': NoTrailingSpaces.Options;
  readonly '@stylistic/nonblock-statement-body-position': readonly [
    NonblockStatementBodyPosition.Options0,
    NonblockStatementBodyPosition.Options1,
  ];
  readonly '@stylistic/object-curly-newline': ObjectCurlyNewline.Options;
  readonly '@stylistic/object-curly-spacing': readonly [
    ObjectCurlySpacing.Options0,
    ObjectCurlySpacing.Options1,
  ];
  readonly '@stylistic/object-property-newline': ObjectPropertyNewline.Options;
  readonly '@stylistic/one-var-declaration-per-line': OneVarDeclarationPerLine.Options;
  readonly '@stylistic/operator-linebreak': readonly [
    OperatorLinebreak.Options0,
    OperatorLinebreak.Options1,
  ];
  readonly '@stylistic/padded-blocks': readonly [
    PaddedBlocks.Options0,
    PaddedBlocks.Options1,
  ];
  readonly '@stylistic/padding-line-between-statements': PaddingLineBetweenStatements.Options;
  readonly '@stylistic/quote-props': QuoteProps.Options;
  readonly '@stylistic/quotes': readonly [Quotes.Options0, Quotes.Options1];
  readonly '@stylistic/rest-spread-spacing': RestSpreadSpacing.Options;
  readonly '@stylistic/semi': Semi.Options;
  readonly '@stylistic/semi-spacing': SemiSpacing.Options;
  readonly '@stylistic/semi-style': SemiStyle.Options;
  readonly '@stylistic/space-before-blocks': SpaceBeforeBlocks.Options;
  readonly '@stylistic/space-before-function-paren': SpaceBeforeFunctionParen.Options;
  readonly '@stylistic/space-in-parens': readonly [
    SpaceInParens.Options0,
    SpaceInParens.Options1,
  ];
  readonly '@stylistic/space-infix-ops': SpaceInfixOps.Options;
  readonly '@stylistic/space-unary-ops': SpaceUnaryOps.Options;
  readonly '@stylistic/spaced-comment': readonly [
    SpacedComment.Options0,
    SpacedComment.Options1,
  ];
  readonly '@stylistic/switch-colon-spacing': SwitchColonSpacing.Options;
  readonly '@stylistic/template-curly-spacing': TemplateCurlySpacing.Options;
  readonly '@stylistic/template-tag-spacing': TemplateTagSpacing.Options;
  readonly '@stylistic/type-annotation-spacing': TypeAnnotationSpacing.Options;
  readonly '@stylistic/wrap-iife': readonly [
    WrapIife.Options0,
    WrapIife.Options1,
  ];
  readonly '@stylistic/yield-star-spacing': YieldStarSpacing.Options;
};
