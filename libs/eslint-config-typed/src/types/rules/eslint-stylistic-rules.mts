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
    | ('always' | 'never' | 'consistent')
    | Readonly<{
        multiline?: boolean;
        minItems?: number | null;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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

  export type Options1 = Readonly<{
    singleValue?: boolean;
    objectsInArrays?: boolean;
    arraysInArrays?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
   * [
   *   {
   *     "definitions": {
   *       "basicConfig": {
   *         "oneOf": [
   *           {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never",
   *               "consistent"
   *             ]
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "consistent": {
   *                 "type": "boolean"
   *               },
   *               "multiline": {
   *                 "type": "boolean"
   *               },
   *               "minItems": {
   *                 "type": [
   *                   "integer",
   *                   "null"
   *                 ],
   *                 "minimum": 0
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         ]
   *       }
   *     },
   *     "type": "array",
   *     "items": [
   *       {
   *         "oneOf": [
   *           {
   *             "$ref": "#/definitions/basicConfig"
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "ArrayExpression": {
   *                 "$ref": "#/definitions/basicConfig"
   *               },
   *               "ArrayPattern": {
   *                 "$ref": "#/definitions/basicConfig"
   *               }
   *             },
   *             "additionalProperties": false,
   *             "minProperties": 1
   *           }
   *         ]
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options =
    | readonly []
    | readonly [
        | BasicConfig
        | Readonly<{
            ArrayExpression?: BasicConfig;
            ArrayPattern?: BasicConfig;
          }>,
      ];

  export type BasicConfig =
    | ('always' | 'never' | 'consistent')
    | Readonly<{
        consistent?: boolean;
        multiline?: boolean;
        minItems?: number | null;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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

  export type Options1 = Readonly<{
    /** @default false */
    requireForBlockBody?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
  export type Options = Readonly<{
    /** @default true */
    before?: boolean;
    /** @default true */
    after?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options0 = '1tbs' | 'stroustrup' | 'allman';

  export type Options1 = Readonly<{
    /** @default false */
    allowSingleLine?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
   * [
   *   {
   *     "$defs": {
   *       "value": {
   *         "type": "string",
   *         "enum": [
   *           "always-multiline",
   *           "always",
   *           "never",
   *           "only-multiline"
   *         ]
   *       },
   *       "valueWithIgnore": {
   *         "type": "string",
   *         "enum": [
   *           "always-multiline",
   *           "always",
   *           "never",
   *           "only-multiline",
   *           "ignore"
   *         ]
   *       }
   *     },
   *     "type": "array",
   *     "items": [
   *       {
   *         "oneOf": [
   *           {
   *             "$ref": "#/$defs/value"
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "arrays": {
   *                 "$ref": "#/$defs/valueWithIgnore"
   *               },
   *               "objects": {
   *                 "$ref": "#/$defs/valueWithIgnore"
   *               },
   *               "imports": {
   *                 "$ref": "#/$defs/valueWithIgnore"
   *               },
   *               "exports": {
   *                 "$ref": "#/$defs/valueWithIgnore"
   *               },
   *               "functions": {
   *                 "$ref": "#/$defs/valueWithIgnore"
   *               },
   *               "importAttributes": {
   *                 "$ref": "#/$defs/valueWithIgnore"
   *               },
   *               "dynamicImports": {
   *                 "$ref": "#/$defs/valueWithIgnore"
   *               },
   *               "enums": {
   *                 "$ref": "#/$defs/valueWithIgnore"
   *               },
   *               "generics": {
   *                 "$ref": "#/$defs/valueWithIgnore"
   *               },
   *               "tuples": {
   *                 "$ref": "#/$defs/valueWithIgnore"
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         ]
   *       }
   *     ],
   *     "additionalItems": false
   *   }
   * ]
   * ```
   */
  export type Options =
    | readonly []
    | readonly [
        | Value
        | Readonly<{
            arrays?: ValueWithIgnore;
            objects?: ValueWithIgnore;
            imports?: ValueWithIgnore;
            exports?: ValueWithIgnore;
            functions?: ValueWithIgnore;
            importAttributes?: ValueWithIgnore;
            dynamicImports?: ValueWithIgnore;
            enums?: ValueWithIgnore;
            generics?: ValueWithIgnore;
            tuples?: ValueWithIgnore;
          }>,
      ];

  export type Value =
    | 'always-multiline'
    | 'always'
    | 'never'
    | 'only-multiline';

  export type ValueWithIgnore =
    | 'always-multiline'
    | 'always'
    | 'never'
    | 'only-multiline'
    | 'ignore';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    /** @default false */
    before?: boolean;
    /** @default true */
    after?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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

  export type Options1 = Readonly<{
    exceptions?: Readonly<Record<string, boolean>>;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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

  export type Options1 = Readonly<{
    /** @default true */
    enforceForClassMembers?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
    | ('always' | 'never')
    | Readonly<{
        IfStatementConsequent?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        IfStatementAlternative?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        DoWhileStatement?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        ForInStatement?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        ForOfStatement?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        ForStatement?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        WhileStatement?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        SwitchStatement?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        SwitchCase?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        TryStatementBlock?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        TryStatementHandler?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        TryStatementFinalizer?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        BlockStatement?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        ArrowFunctionExpression?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        FunctionDeclaration?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        FunctionExpression?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        Property?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        ClassBody?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        StaticBlock?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        WithStatement?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        TSModuleBlock?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minElements?: number;
              consistent?: boolean;
            }>;
        multiline?: boolean;
        minElements?: number;
        consistent?: boolean;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = 'always' | 'never' | 'consistent';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
   * [
   *   {
   *     "anyOf": [
   *       {
   *         "type": "array",
   *         "items": [
   *           {
   *             "type": "string",
   *             "enum": [
   *               "never"
   *             ]
   *           }
   *         ],
   *         "minItems": 0,
   *         "maxItems": 1
   *       },
   *       {
   *         "type": "array",
   *         "items": [
   *           {
   *             "type": "string",
   *             "enum": [
   *               "always"
   *             ]
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "allowNewlines": {
   *                 "type": "boolean"
   *               },
   *               "optionalChain": {
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
   *             },
   *             "additionalProperties": false
   *           }
   *         ],
   *         "minItems": 0,
   *         "maxItems": 2
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options =
    | readonly []
    | readonly ['never']
    | readonly ['always']
    | readonly [
        'always',
        Readonly<{
          allowNewlines?: boolean;
          optionalChain?: Readonly<{
            before?: boolean;
            after?: boolean;
          }>;
        }>,
      ];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | ('always' | 'never' | 'consistent' | 'multiline' | 'multiline-arguments')
    | Readonly<{
        minItems?: number;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | ('before' | 'after' | 'both' | 'neither')
    | Readonly<{
        before?: boolean;
        after?: boolean;
        named?:
          | ('before' | 'after' | 'both' | 'neither')
          | Readonly<{
              before?: boolean;
              after?: boolean;
            }>;
        anonymous?:
          | ('before' | 'after' | 'both' | 'neither')
          | Readonly<{
              before?: boolean;
              after?: boolean;
            }>;
        method?:
          | ('before' | 'after' | 'both' | 'neither')
          | Readonly<{
              before?: boolean;
              after?: boolean;
            }>;
        shorthand?:
          | ('before' | 'after' | 'both' | 'neither')
          | Readonly<{
              before?: boolean;
              after?: boolean;
            }>;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = 'beside' | 'below';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options0 = 'tab' | number;

  export type Options1 = Readonly<{
    /** @default 0 */
    SwitchCase?: number;
    VariableDeclarator?:
      | (number | ('first' | 'off'))
      | Readonly<{
          var?: number | ('first' | 'off');
          let?: number | ('first' | 'off');
          const?: number | ('first' | 'off');
          using?: number | ('first' | 'off');
        }>;
    assignmentOperator?: number | 'off';
    outerIIFEBody?: number | 'off';
    MemberExpression?: number | 'off';
    FunctionDeclaration?: Readonly<{
      parameters?: number | ('first' | 'off');
      body?: number;
      returnType?: number;
    }>;
    FunctionExpression?: Readonly<{
      parameters?: number | ('first' | 'off');
      body?: number;
      returnType?: number;
    }>;
    StaticBlock?: Readonly<{
      body?: number;
    }>;
    CallExpression?: Readonly<{
      arguments?: number | ('first' | 'off');
    }>;
    ArrayExpression?: number | ('first' | 'off');
    ObjectExpression?: number | ('first' | 'off');
    ImportDeclaration?: number | ('first' | 'off');
    /** @default false */
    flatTernaryExpressions?: boolean;
    /** @default false */
    offsetTernaryExpressions?:
      | boolean
      | Readonly<{
          CallExpression?: boolean;
          AwaitExpression?: boolean;
          NewExpression?: boolean;
        }>;
    offsetTernaryExpressionsOffsetCallExpressions?: boolean;
    ignoredNodes?: readonly string[];
    /** @default false */
    ignoreComments?: boolean;
    /** @default 4 */
    tabLength?: number;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | ('after-props' | 'props-aligned' | 'tag-aligned' | 'line-aligned')
    | Readonly<
        | {
            location?:
              | 'after-props'
              | 'props-aligned'
              | 'tag-aligned'
              | 'line-aligned';
          }
        | {
            nonEmpty?:
              | (
                  | 'after-props'
                  | 'props-aligned'
                  | 'tag-aligned'
                  | 'line-aligned'
                )
              | false;
            selfClosing?:
              | (
                  | 'after-props'
                  | 'props-aligned'
                  | 'tag-aligned'
                  | 'line-aligned'
                )
              | false;
          }
      >;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = 'tag-aligned' | 'line-aligned';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | Readonly<{
        props?: 'always' | 'never' | 'ignore';
        children?: 'always' | 'never' | 'ignore';
        propElementValues?: 'always' | 'never' | 'ignore';
      }>
    | ('always' | 'never' | 'ignore');

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | ('consistent' | 'never')
    | Readonly<{
        singleline?: 'consistent' | 'require' | 'forbid';
        multiline?: 'consistent' | 'require' | 'forbid';
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
   * [
   *   {
   *     "type": "array",
   *     "items": [
   *       {
   *         "anyOf": [
   *           {
   *             "type": "object",
   *             "additionalProperties": false,
   *             "properties": {
   *               "when": {
   *                 "type": "string",
   *                 "enum": [
   *                   "always",
   *                   "never"
   *                 ]
   *               },
   *               "allowMultiline": {
   *                 "type": "boolean"
   *               },
   *               "spacing": {
   *                 "type": "object",
   *                 "properties": {
   *                   "objectLiterals": {
   *                     "type": "string",
   *                     "enum": [
   *                       "always",
   *                       "never"
   *                     ]
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               },
   *               "attributes": {
   *                 "anyOf": [
   *                   {
   *                     "type": "object",
   *                     "properties": {
   *                       "when": {
   *                         "type": "string",
   *                         "enum": [
   *                           "always",
   *                           "never"
   *                         ]
   *                       },
   *                       "allowMultiline": {
   *                         "type": "boolean"
   *                       },
   *                       "spacing": {
   *                         "type": "object",
   *                         "properties": {
   *                           "objectLiterals": {
   *                             "type": "string",
   *                             "enum": [
   *                               "always",
   *                               "never"
   *                             ]
   *                           }
   *                         },
   *                         "additionalProperties": false
   *                       }
   *                     },
   *                     "additionalProperties": false
   *                   },
   *                   {
   *                     "type": "boolean"
   *                   }
   *                 ]
   *               },
   *               "children": {
   *                 "anyOf": [
   *                   {
   *                     "type": "object",
   *                     "properties": {
   *                       "when": {
   *                         "type": "string",
   *                         "enum": [
   *                           "always",
   *                           "never"
   *                         ]
   *                       },
   *                       "allowMultiline": {
   *                         "type": "boolean"
   *                       },
   *                       "spacing": {
   *                         "type": "object",
   *                         "properties": {
   *                           "objectLiterals": {
   *                             "type": "string",
   *                             "enum": [
   *                               "always",
   *                               "never"
   *                             ]
   *                           }
   *                         },
   *                         "additionalProperties": false
   *                       }
   *                     },
   *                     "additionalProperties": false
   *                   },
   *                   {
   *                     "type": "boolean"
   *                   }
   *                 ]
   *               }
   *             }
   *           },
   *           {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "never"
   *             ]
   *           }
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "allowMultiline": {
   *             "type": "boolean"
   *           },
   *           "spacing": {
   *             "type": "object",
   *             "properties": {
   *               "objectLiterals": {
   *                 "type": "string",
   *                 "enum": [
   *                   "always",
   *                   "never"
   *                 ]
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
    | readonly []
    | readonly [
        | Readonly<{
            when?: 'always' | 'never';
            allowMultiline?: boolean;
            spacing?: Readonly<{
              objectLiterals?: 'always' | 'never';
            }>;
            attributes?:
              | Readonly<{
                  when?: 'always' | 'never';
                  allowMultiline?: boolean;
                  spacing?: Readonly<{
                    objectLiterals?: 'always' | 'never';
                  }>;
                }>
              | boolean;
            children?:
              | Readonly<{
                  when?: 'always' | 'never';
                  allowMultiline?: boolean;
                  spacing?: Readonly<{
                    objectLiterals?: 'always' | 'never';
                  }>;
                }>
              | boolean;
          }>
        | ('always' | 'never'),
      ]
    | readonly [
        (
          | Readonly<{
              when?: 'always' | 'never';
              allowMultiline?: boolean;
              spacing?: Readonly<{
                objectLiterals?: 'always' | 'never';
              }>;
              attributes?:
                | Readonly<{
                    when?: 'always' | 'never';
                    allowMultiline?: boolean;
                    spacing?: Readonly<{
                      objectLiterals?: 'always' | 'never';
                    }>;
                  }>
                | boolean;
              children?:
                | Readonly<{
                    when?: 'always' | 'never';
                    allowMultiline?: boolean;
                    spacing?: Readonly<{
                      objectLiterals?: 'always' | 'never';
                    }>;
                  }>
                | boolean;
            }>
          | ('always' | 'never')
        ),
        Readonly<{
          allowMultiline?: boolean;
          spacing?: Readonly<{
            objectLiterals?: 'always' | 'never';
          }>;
        }>,
      ];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | 'never'
    | 'multiline'
    | 'multiline-multiprop'
    | 'multiprop';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | ('tab' | 'first')
    | number
    | Readonly<{
        indentMode?: ('tab' | 'first') | number;
        ignoreTernaryOperator?: boolean;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<
    | {
        maximum?: Readonly<{
          single?: number;
          multi?: number;
        }>;
      }
    | {
        maximum?: number;
        when?: 'always' | 'multiline';
      }
  >;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    /** @default false */
    prevent?: boolean;
    /** @default false */
    allowMultilines?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    allow?: 'none' | 'literal' | 'single-child' | 'single-line' | 'non-jsx';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    allowAllCaps?: boolean;
    allowLeadingUnderscore?: boolean;
    allowNamespace?: boolean;
    ignore?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = 'prefer-single' | 'prefer-double';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    /** @default true */
    component?: boolean;
    /** @default true */
    html?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    callbacksLast?: boolean;
    shorthandFirst?: boolean;
    shorthandLast?: boolean;
    /** @default 'ignore' */
    multiline?: 'ignore' | 'first' | 'last';
    ignoreCase?: boolean;
    noSortAlphabetically?: boolean;
    reservedFirst?: readonly string[] | boolean;
    reservedLast?: readonly string[];
    /** @default 'auto' */
    locale?: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    closingSlash?: 'always' | 'never' | 'allow';
    beforeSelfClosing?: 'always' | 'proportional-always' | 'never' | 'allow';
    afterOpening?: 'always' | 'allow-multiline' | 'never' | 'allow';
    beforeClosing?: 'always' | 'proportional-always' | 'never' | 'allow';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    declaration?: true | false | 'ignore' | 'parens' | 'parens-new-line';
    assignment?: true | false | 'ignore' | 'parens' | 'parens-new-line';
    return?: true | false | 'ignore' | 'parens' | 'parens-new-line';
    arrow?: true | false | 'ignore' | 'parens' | 'parens-new-line';
    condition?: true | false | 'ignore' | 'parens' | 'parens-new-line';
    logical?: true | false | 'ignore' | 'parens' | 'parens-new-line';
    prop?: true | false | 'ignore' | 'parens' | 'parens-new-line';
    propertyValue?: true | false | 'ignore' | 'parens' | 'parens-new-line';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<
    | {
        align?:
          | ('colon' | 'value')
          | Readonly<{
              mode?: 'strict' | 'minimum';
              on?: 'colon' | 'value';
              beforeColon?: boolean;
              afterColon?: boolean;
            }>;
        mode?: 'strict' | 'minimum';
        beforeColon?: boolean;
        afterColon?: boolean;
        ignoredNodes?: readonly (
          | 'ObjectExpression'
          | 'ObjectPattern'
          | 'ImportDeclaration'
          | 'ExportNamedDeclaration'
          | 'ExportAllDeclaration'
          | 'TSTypeLiteral'
          | 'TSInterfaceBody'
          | 'ClassBody'
        )[];
      }
    | {
        singleLine?: Readonly<{
          mode?: 'strict' | 'minimum';
          beforeColon?: boolean;
          afterColon?: boolean;
        }>;
        multiLine?: Readonly<{
          align?:
            | ('colon' | 'value')
            | Readonly<{
                mode?: 'strict' | 'minimum';
                on?: 'colon' | 'value';
                beforeColon?: boolean;
                afterColon?: boolean;
              }>;
          mode?: 'strict' | 'minimum';
          beforeColon?: boolean;
          afterColon?: boolean;
        }>;
      }
    | {
        singleLine?: Readonly<{
          mode?: 'strict' | 'minimum';
          beforeColon?: boolean;
          afterColon?: boolean;
        }>;
        multiLine?: Readonly<{
          mode?: 'strict' | 'minimum';
          beforeColon?: boolean;
          afterColon?: boolean;
        }>;
        align?: Readonly<{
          mode?: 'strict' | 'minimum';
          on?: 'colon' | 'value';
          beforeColon?: boolean;
          afterColon?: boolean;
        }>;
      }
  >;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    /** @default true */
    before?: boolean;
    /** @default true */
    after?: boolean;
    overrides?: Readonly<{
      abstract?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      boolean?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      break?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      byte?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      case?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      catch?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      char?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      class?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      const?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      continue?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      debugger?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      default?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      delete?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      do?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      double?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      else?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      enum?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      export?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      extends?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      false?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      final?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      finally?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      float?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      for?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      function?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      goto?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      if?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      implements?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      import?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      in?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      instanceof?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      int?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      interface?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      long?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      native?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      new?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      null?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      package?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      private?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      protected?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      public?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      return?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      short?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      static?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      super?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      switch?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      synchronized?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      this?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      throw?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      throws?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      transient?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      true?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      try?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      typeof?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      var?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      void?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      volatile?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      while?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      with?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      arguments?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      as?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      async?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      await?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      eval?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      from?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      get?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      let?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      of?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      set?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      type?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      using?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      yield?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      accessor?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
      satisfies?: Readonly<{
        before?: boolean;
        after?: boolean;
      }>;
    }>;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | ('above' | 'beside')
    | Readonly<{
        position?: 'above' | 'beside';
        ignorePattern?: string;
        applyDefaultPatterns?: boolean;
        applyDefaultIgnorePatterns?: boolean;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    /** @default true */
    beforeBlockComment?: boolean;
    /** @default false */
    afterBlockComment?: boolean;
    /** @default false */
    beforeLineComment?: boolean;
    /** @default false */
    afterLineComment?: boolean;
    /** @default false */
    allowBlockStart?: boolean;
    /** @default false */
    allowBlockEnd?: boolean;
    allowClassStart?: boolean;
    allowClassEnd?: boolean;
    allowObjectStart?: boolean;
    allowObjectEnd?: boolean;
    allowArrayStart?: boolean;
    allowArrayEnd?: boolean;
    allowInterfaceStart?: boolean;
    allowInterfaceEnd?: boolean;
    allowTypeStart?: boolean;
    allowTypeEnd?: boolean;
    allowEnumStart?: boolean;
    allowEnumEnd?: boolean;
    allowModuleStart?: boolean;
    allowModuleEnd?: boolean;
    ignorePattern?: string;
    applyDefaultIgnorePatterns?: boolean;
    afterHashbangComment?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | Readonly<{
        /** @minItems 1 */
        enforce: readonly [
          Readonly<{
            blankLine: 'always' | 'never';
            prev: 'method' | 'field' | '*';
            next: 'method' | 'field' | '*';
          }>,
          ...Readonly<{
            blankLine: 'always' | 'never';
            prev: 'method' | 'field' | '*';
            next: 'method' | 'field' | '*';
          }>[],
        ];
      }>
    | ('always' | 'never');

  export type Options1 = Readonly<{
    /** @default false */
    exceptAfterSingleLine?: boolean;
    /** @default true */
    exceptAfterOverload?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
   *             "$ref": "#/$defs/singleLineConfig"
   *           },
   *           "multiline": {
   *             "$ref": "#/$defs/multiLineConfig"
   *           }
   *         }
   *       }
   *     },
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "singleLine": {
   *         "$ref": "#/$defs/singleLineConfig"
   *       },
   *       "multiLine": {
   *         "$ref": "#/$defs/multiLineConfig"
   *       },
   *       "overrides": {
   *         "type": "object",
   *         "additionalProperties": false,
   *         "properties": {
   *           "[]": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "{}": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "<>": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "()": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "ArrayExpression": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "ArrayPattern": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "ArrowFunctionExpression": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "CallExpression": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "ExportNamedDeclaration": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "FunctionDeclaration": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "FunctionExpression": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "ImportDeclaration": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "ImportAttributes": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "NewExpression": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "ObjectExpression": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "ObjectPattern": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "TSDeclareFunction": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "TSFunctionType": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "TSInterfaceBody": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "TSEnumBody": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "TSTupleType": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "TSTypeLiteral": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "TSTypeParameterDeclaration": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "TSTypeParameterInstantiation": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "JSONArrayExpression": {
   *             "$ref": "#/$defs/baseConfig"
   *           },
   *           "JSONObjectExpression": {
   *             "$ref": "#/$defs/baseConfig"
   *           }
   *         }
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    singleLine?: SingleLineConfig;
    multiLine?: MultiLineConfig;
    overrides?: Readonly<{
      '[]'?: BaseConfig;
      '{}'?: BaseConfig;
      '<>'?: BaseConfig;
      '()'?: BaseConfig;
      ArrayExpression?: BaseConfig;
      ArrayPattern?: BaseConfig;
      ArrowFunctionExpression?: BaseConfig;
      CallExpression?: BaseConfig;
      ExportNamedDeclaration?: BaseConfig;
      FunctionDeclaration?: BaseConfig;
      FunctionExpression?: BaseConfig;
      ImportDeclaration?: BaseConfig;
      ImportAttributes?: BaseConfig;
      NewExpression?: BaseConfig;
      ObjectExpression?: BaseConfig;
      ObjectPattern?: BaseConfig;
      TSDeclareFunction?: BaseConfig;
      TSFunctionType?: BaseConfig;
      TSInterfaceBody?: BaseConfig;
      TSEnumBody?: BaseConfig;
      TSTupleType?: BaseConfig;
      TSTypeLiteral?: BaseConfig;
      TSTypeParameterDeclaration?: BaseConfig;
      TSTypeParameterInstantiation?: BaseConfig;
      JSONArrayExpression?: BaseConfig;
      JSONObjectExpression?: BaseConfig;
    }>;
  }>;

  export type SingleLineConfig = Readonly<{
    spacing?: 'always' | 'never';
    maxItems?: number;
  }>;

  export type MultiLineConfig = Readonly<{
    minItems?: number;
  }>;

  export type BaseConfig = Readonly<{
    singleLine?: SingleLineConfig;
    multiline?: MultiLineConfig;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | Readonly<{
        code?: number;
        comments?: number;
        tabWidth?: number;
        ignorePattern?: string;
        ignoreComments?: boolean;
        ignoreStrings?: boolean;
        ignoreUrls?: boolean;
        ignoreTemplateLiterals?: boolean;
        ignoreRegExpLiterals?: boolean;
        ignoreTrailingComments?: boolean;
      }>
    | number;

  export type Options1 =
    | Readonly<{
        code?: number;
        comments?: number;
        tabWidth?: number;
        ignorePattern?: string;
        ignoreComments?: boolean;
        ignoreStrings?: boolean;
        ignoreUrls?: boolean;
        ignoreTemplateLiterals?: boolean;
        ignoreRegExpLiterals?: boolean;
        ignoreTrailingComments?: boolean;
      }>
    | number;

  export type Options2 = Readonly<{
    code?: number;
    comments?: number;
    tabWidth?: number;
    ignorePattern?: string;
    ignoreComments?: boolean;
    ignoreStrings?: boolean;
    ignoreUrls?: boolean;
    ignoreTemplateLiterals?: boolean;
    ignoreRegExpLiterals?: boolean;
    ignoreTrailingComments?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0, Options1, Options2];
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
  export type Options = Readonly<{
    /** @default 1 */
    max?: number;
    ignoredNodes?: readonly (
      | 'BreakStatement'
      | 'ClassDeclaration'
      | 'ContinueStatement'
      | 'DebuggerStatement'
      | 'DoWhileStatement'
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
      | 'ExportNamedDeclaration'
      | 'ExportDefaultDeclaration'
      | 'ExportAllDeclaration'
    )[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
   *                 "$ref": "#/$defs/multiLineOption"
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
   *                 "$ref": "#/$defs/singleLineOption"
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
   *             "$ref": "#/$defs/multiLineOption"
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
   *             "$ref": "#/$defs/singleLineOption"
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
   *             "$ref": "#/$defs/delimiterConfig"
   *           },
   *           "typeLiteral": {
   *             "$ref": "#/$defs/delimiterConfig"
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
  export type MultiLineOption = 'none' | 'semi' | 'comma';

  export type SingleLineOption = 'semi' | 'comma';

  export type Options = Readonly<{
    multiline?: Readonly<{
      delimiter?: MultiLineOption;
      requireLast?: boolean;
    }>;
    singleline?: Readonly<{
      delimiter?: SingleLineOption;
      requireLast?: boolean;
    }>;
    overrides?: Readonly<{
      interface?: DelimiterConfig;
      typeLiteral?: DelimiterConfig;
    }>;
    multilineDetection?: 'brackets' | 'last-member';
  }>;

  export type DelimiterConfig = Readonly<{
    multiline?: Readonly<{
      delimiter?: MultiLineOption;
      requireLast?: boolean;
    }>;
    singleline?: Readonly<{
      delimiter?: SingleLineOption;
      requireLast?: boolean;
    }>;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
   * [
   *   {
   *     "anyOf": [
   *       {
   *         "type": "array",
   *         "items": [
   *           {
   *             "enum": [
   *               "starred-block",
   *               "bare-block"
   *             ],
   *             "type": "string"
   *           }
   *         ],
   *         "additionalItems": false
   *       },
   *       {
   *         "type": "array",
   *         "items": [
   *           {
   *             "enum": [
   *               "separate-lines"
   *             ],
   *             "type": "string"
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "checkJSDoc": {
   *                 "type": "boolean"
   *               },
   *               "checkExclamation": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         ],
   *         "additionalItems": false
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options =
    | readonly []
    | readonly ['starred-block' | 'bare-block']
    | readonly ['separate-lines']
    | readonly [
        'separate-lines',
        Readonly<{
          checkJSDoc?: boolean;
          checkExclamation?: boolean;
        }>,
      ];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options0 = 'always' | 'always-multiline' | 'never';

  export type Options1 = Readonly<{
    /** @default false */
    ignoreJSX?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    /** @default 2 */
    ignoreChainWithDepth?: number;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    /** @default true */
    allowParens?: boolean;
    /** @default false */
    onlyOneSimpleParam?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
   * [
   *   {
   *     "anyOf": [
   *       {
   *         "type": "array",
   *         "items": [
   *           {
   *             "type": "string",
   *             "enum": [
   *               "functions"
   *             ]
   *           }
   *         ],
   *         "minItems": 0,
   *         "maxItems": 1
   *       },
   *       {
   *         "type": "array",
   *         "items": [
   *           {
   *             "type": "string",
   *             "enum": [
   *               "all"
   *             ]
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "conditionalAssign": {
   *                 "type": "boolean"
   *               },
   *               "ternaryOperandBinaryExpressions": {
   *                 "type": "boolean"
   *               },
   *               "nestedBinaryExpressions": {
   *                 "type": "boolean"
   *               },
   *               "returnAssign": {
   *                 "type": "boolean"
   *               },
   *               "ignoreJSX": {
   *                 "type": "string",
   *                 "enum": [
   *                   "none",
   *                   "all",
   *                   "single-line",
   *                   "multi-line"
   *                 ]
   *               },
   *               "enforceForArrowConditionals": {
   *                 "type": "boolean"
   *               },
   *               "enforceForSequenceExpressions": {
   *                 "type": "boolean"
   *               },
   *               "enforceForNewInMemberExpressions": {
   *                 "type": "boolean"
   *               },
   *               "enforceForFunctionPrototypeMethods": {
   *                 "type": "boolean"
   *               },
   *               "allowParensAfterCommentPattern": {
   *                 "type": "string"
   *               },
   *               "nestedConditionalExpressions": {
   *                 "type": "boolean"
   *               },
   *               "allowNodesInSpreadElement": {
   *                 "type": "object",
   *                 "properties": {
   *                   "ConditionalExpression": {
   *                     "type": "boolean"
   *                   },
   *                   "LogicalExpression": {
   *                     "type": "boolean"
   *                   },
   *                   "AwaitExpression": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               },
   *               "ignoredNodes": {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "not": {
   *                     "type": "string",
   *                     "pattern": ":exit$"
   *                   }
   *                 }
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         ],
   *         "minItems": 0,
   *         "maxItems": 2
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options =
    | readonly []
    | readonly ['functions']
    | readonly ['all']
    | readonly [
        'all',
        Readonly<{
          conditionalAssign?: boolean;
          ternaryOperandBinaryExpressions?: boolean;
          nestedBinaryExpressions?: boolean;
          returnAssign?: boolean;
          ignoreJSX?: 'none' | 'all' | 'single-line' | 'multi-line';
          enforceForArrowConditionals?: boolean;
          enforceForSequenceExpressions?: boolean;
          enforceForNewInMemberExpressions?: boolean;
          enforceForFunctionPrototypeMethods?: boolean;
          allowParensAfterCommentPattern?: string;
          nestedConditionalExpressions?: boolean;
          allowNodesInSpreadElement?: Readonly<{
            ConditionalExpression?: boolean;
            LogicalExpression?: boolean;
            AwaitExpression?: boolean;
          }>;
          ignoredNodes?: readonly string[];
        }>,
      ];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    groups?: readonly (readonly [
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
      ...(
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
      )[],
    ])[];
    /** @default true */
    allowSamePrecedence?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = 'smart-tabs' | boolean;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    exceptions?: Readonly<Record<string, boolean>>;
    /** @default false */
    ignoreEOLComments?: boolean;
    /** @default true */
    includeTabs?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    max: number;
    maxEOF?: number;
    maxBOF?: number;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    /** @default false */
    allowIndentationTabs?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    /** @default false */
    skipBlankLines?: boolean;
    /** @default false */
    ignoreComments?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options0 = 'beside' | 'below' | 'any';

  export type Options1 = Readonly<{
    overrides?: Readonly<{
      if?: 'beside' | 'below' | 'any';
      else?: 'beside' | 'below' | 'any';
      while?: 'beside' | 'below' | 'any';
      do?: 'beside' | 'below' | 'any';
      for?: 'beside' | 'below' | 'any';
    }>;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
    | (
        | ('always' | 'never')
        | Readonly<{
            multiline?: boolean;
            minProperties?: number;
            consistent?: boolean;
          }>
      )
    | Readonly<{
        ObjectExpression?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minProperties?: number;
              consistent?: boolean;
            }>;
        ObjectPattern?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minProperties?: number;
              consistent?: boolean;
            }>;
        ImportDeclaration?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minProperties?: number;
              consistent?: boolean;
            }>;
        ExportDeclaration?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minProperties?: number;
              consistent?: boolean;
            }>;
        TSTypeLiteral?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minProperties?: number;
              consistent?: boolean;
            }>;
        TSInterfaceBody?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minProperties?: number;
              consistent?: boolean;
            }>;
        TSEnumBody?:
          | ('always' | 'never')
          | Readonly<{
              multiline?: boolean;
              minProperties?: number;
              consistent?: boolean;
            }>;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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

  export type Options1 = Readonly<{
    arraysInObjects?: boolean;
    objectsInObjects?: boolean;
    overrides?: Readonly<{
      ObjectPattern?: 'always' | 'never';
      ObjectExpression?: 'always' | 'never';
      ImportDeclaration?: 'always' | 'never';
      ImportAttributes?: 'always' | 'never';
      ExportNamedDeclaration?: 'always' | 'never';
      ExportAllDeclaration?: 'always' | 'never';
      TSMappedType?: 'always' | 'never';
      TSTypeLiteral?: 'always' | 'never';
      TSInterfaceBody?: 'always' | 'never';
      TSEnumBody?: 'always' | 'never';
    }>;
    emptyObjects?: 'ignore' | 'always' | 'never';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
  export type Options = Readonly<{
    /** @default false */
    allowAllPropertiesOnSameLine?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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

  export type Options1 = Readonly<{
    overrides?: Readonly<
      Record<string, 'after' | 'before' | 'none' | 'ignore'>
    >;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
    | ('always' | 'never' | 'start' | 'end')
    | Readonly<{
        blocks?: 'always' | 'never' | 'start' | 'end';
        switches?: 'always' | 'never' | 'start' | 'end';
        classes?: 'always' | 'never' | 'start' | 'end';
      }>;

  export type Options1 = Readonly<{
    allowSingleLineBlocks?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
   * [
   *   {
   *     "$defs": {
   *       "paddingType": {
   *         "type": "string",
   *         "enum": [
   *           "any",
   *           "never",
   *           "always"
   *         ]
   *       },
   *       "statementType": {
   *         "type": "string",
   *         "enum": [
   *           "*",
   *           "exports",
   *           "require",
   *           "directive",
   *           "iife",
   *           "block",
   *           "empty",
   *           "function",
   *           "ts-method",
   *           "break",
   *           "case",
   *           "class",
   *           "continue",
   *           "debugger",
   *           "default",
   *           "do",
   *           "for",
   *           "if",
   *           "import",
   *           "switch",
   *           "throw",
   *           "try",
   *           "while",
   *           "with",
   *           "cjs-export",
   *           "cjs-import",
   *           "enum",
   *           "interface",
   *           "function-overload",
   *           "block-like",
   *           "singleline-block-like",
   *           "multiline-block-like",
   *           "expression",
   *           "singleline-expression",
   *           "multiline-expression",
   *           "return",
   *           "singleline-return",
   *           "multiline-return",
   *           "export",
   *           "singleline-export",
   *           "multiline-export",
   *           "var",
   *           "singleline-var",
   *           "multiline-var",
   *           "let",
   *           "singleline-let",
   *           "multiline-let",
   *           "const",
   *           "singleline-const",
   *           "multiline-const",
   *           "using",
   *           "singleline-using",
   *           "multiline-using",
   *           "type",
   *           "singleline-type",
   *           "multiline-type"
   *         ]
   *       },
   *       "statementOption": {
   *         "anyOf": [
   *           {
   *             "$ref": "#/$defs/statementType"
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "$ref": "#/$defs/statementType"
   *             },
   *             "minItems": 1,
   *             "uniqueItems": true,
   *             "additionalItems": false
   *           }
   *         ]
   *       }
   *     },
   *     "type": "array",
   *     "additionalItems": false,
   *     "items": {
   *       "type": "object",
   *       "properties": {
   *         "blankLine": {
   *           "$ref": "#/$defs/paddingType"
   *         },
   *         "prev": {
   *           "$ref": "#/$defs/statementOption"
   *         },
   *         "next": {
   *           "$ref": "#/$defs/statementOption"
   *         }
   *       },
   *       "additionalProperties": false,
   *       "required": [
   *         "blankLine",
   *         "prev",
   *         "next"
   *       ]
   *     }
   *   }
   * ]
   * ```
   */
  export type PaddingType = 'any' | 'never' | 'always';

  export type StatementOption =
    | StatementType
    | readonly [StatementType, ...StatementType[]];

  export type StatementType =
    | '*'
    | 'exports'
    | 'require'
    | 'directive'
    | 'iife'
    | 'block'
    | 'empty'
    | 'function'
    | 'ts-method'
    | 'break'
    | 'case'
    | 'class'
    | 'continue'
    | 'debugger'
    | 'default'
    | 'do'
    | 'for'
    | 'if'
    | 'import'
    | 'switch'
    | 'throw'
    | 'try'
    | 'while'
    | 'with'
    | 'cjs-export'
    | 'cjs-import'
    | 'enum'
    | 'interface'
    | 'function-overload'
    | 'block-like'
    | 'singleline-block-like'
    | 'multiline-block-like'
    | 'expression'
    | 'singleline-expression'
    | 'multiline-expression'
    | 'return'
    | 'singleline-return'
    | 'multiline-return'
    | 'export'
    | 'singleline-export'
    | 'multiline-export'
    | 'var'
    | 'singleline-var'
    | 'multiline-var'
    | 'let'
    | 'singleline-let'
    | 'multiline-let'
    | 'const'
    | 'singleline-const'
    | 'multiline-const'
    | 'using'
    | 'singleline-using'
    | 'multiline-using'
    | 'type'
    | 'singleline-type'
    | 'multiline-type';

  export type Options = readonly Readonly<{
    blankLine: PaddingType;
    prev: StatementOption;
    next: StatementOption;
  }>[];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
   * [
   *   {
   *     "anyOf": [
   *       {
   *         "type": "array",
   *         "items": [
   *           {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "as-needed",
   *               "consistent",
   *               "consistent-as-needed"
   *             ]
   *           }
   *         ],
   *         "minItems": 0,
   *         "maxItems": 1
   *       },
   *       {
   *         "type": "array",
   *         "items": [
   *           {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "as-needed",
   *               "consistent",
   *               "consistent-as-needed"
   *             ]
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "keywords": {
   *                 "type": "boolean"
   *               },
   *               "unnecessary": {
   *                 "type": "boolean"
   *               },
   *               "numbers": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         ],
   *         "minItems": 0,
   *         "maxItems": 2
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options =
    | readonly []
    | readonly ['always' | 'as-needed' | 'consistent' | 'consistent-as-needed']
    | readonly [
        'always' | 'as-needed' | 'consistent' | 'consistent-as-needed',
        Readonly<{
          keywords?: boolean;
          unnecessary?: boolean;
          numbers?: boolean;
        }>,
      ];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options0 = 'single' | 'double' | 'backtick';

  export type Options1 =
    | 'avoid-escape'
    | Readonly<{
        avoidEscape?: boolean;
        allowTemplateLiterals?: boolean | ('never' | 'avoidEscape' | 'always');
        ignoreStringLiterals?: boolean;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
   * [
   *   {
   *     "anyOf": [
   *       {
   *         "type": "array",
   *         "items": [
   *           {
   *             "type": "string",
   *             "enum": [
   *               "never"
   *             ]
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "beforeStatementContinuationChars": {
   *                 "type": "string",
   *                 "enum": [
   *                   "always",
   *                   "any",
   *                   "never"
   *                 ]
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         ],
   *         "minItems": 0,
   *         "maxItems": 2
   *       },
   *       {
   *         "type": "array",
   *         "items": [
   *           {
   *             "type": "string",
   *             "enum": [
   *               "always"
   *             ]
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "omitLastInOneLineBlock": {
   *                 "type": "boolean"
   *               },
   *               "omitLastInOneLineClassBody": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         ],
   *         "minItems": 0,
   *         "maxItems": 2
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options =
    | readonly []
    | readonly ['never']
    | readonly [
        'never',
        Readonly<{
          beforeStatementContinuationChars?: 'always' | 'any' | 'never';
        }>,
      ]
    | readonly ['always']
    | readonly [
        'always',
        Readonly<{
          omitLastInOneLineBlock?: boolean;
          omitLastInOneLineClassBody?: boolean;
        }>,
      ];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    /** @default false */
    before?: boolean;
    /** @default true */
    after?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = 'last' | 'first';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | ('always' | 'never')
    | Readonly<{
        keywords?: 'always' | 'never' | 'off';
        functions?: 'always' | 'never' | 'off';
        classes?: 'always' | 'never' | 'off';
        modules?: 'always' | 'never' | 'off';
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | ('always' | 'never')
    | Readonly<{
        anonymous?: 'always' | 'never' | 'ignore';
        named?: 'always' | 'never' | 'ignore';
        asyncArrow?: 'always' | 'never' | 'ignore';
        catch?: 'always' | 'never' | 'ignore';
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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

  export type Options1 = Readonly<{
    exceptions?: readonly ('{}' | '[]' | '()' | 'empty')[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
  export type Options = Readonly<{
    /** @default false */
    int32Hint?: boolean;
    /** @default false */
    ignoreTypes?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options = Readonly<{
    /** @default true */
    words?: boolean;
    /** @default false */
    nonwords?: boolean;
    overrides?: Readonly<Record<string, boolean>>;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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

  export type Options1 = Readonly<{
    exceptions?: readonly string[];
    markers?: readonly string[];
    line?: Readonly<{
      exceptions?: readonly string[];
      markers?: readonly string[];
    }>;
    block?: Readonly<{
      exceptions?: readonly string[];
      markers?: readonly string[];
      balanced?: boolean;
    }>;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
  export type Options = Readonly<{
    /** @default false */
    before?: boolean;
    /** @default true */
    after?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
   *             "$ref": "#/$defs/spacingConfig"
   *           },
   *           "arrow": {
   *             "$ref": "#/$defs/spacingConfig"
   *           },
   *           "variable": {
   *             "$ref": "#/$defs/spacingConfig"
   *           },
   *           "parameter": {
   *             "$ref": "#/$defs/spacingConfig"
   *           },
   *           "property": {
   *             "$ref": "#/$defs/spacingConfig"
   *           },
   *           "returnType": {
   *             "$ref": "#/$defs/spacingConfig"
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
  export type Options = Readonly<{
    before?: boolean;
    after?: boolean;
    overrides?: Readonly<{
      colon?: SpacingConfig;
      arrow?: SpacingConfig;
      variable?: SpacingConfig;
      parameter?: SpacingConfig;
      property?: SpacingConfig;
      returnType?: SpacingConfig;
    }>;
  }>;

  export type SpacingConfig = Readonly<{
    before?: boolean;
    after?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
  export type Options0 = 'outside' | 'inside' | 'any';

  export type Options1 = Readonly<{
    /** @default false */
    functionPrototypeMethods?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
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
    | ('before' | 'after' | 'both' | 'neither')
    | Readonly<{
        before?: boolean;
        after?: boolean;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

export type EslintStylisticRules = Readonly<{
  '@stylistic/array-bracket-newline': ArrayBracketNewline.RuleEntry;
  '@stylistic/array-bracket-spacing': ArrayBracketSpacing.RuleEntry;
  '@stylistic/array-element-newline': ArrayElementNewline.RuleEntry;
  '@stylistic/arrow-parens': ArrowParens.RuleEntry;
  '@stylistic/arrow-spacing': ArrowSpacing.RuleEntry;
  '@stylistic/block-spacing': BlockSpacing.RuleEntry;
  '@stylistic/brace-style': BraceStyle.RuleEntry;
  '@stylistic/comma-dangle': CommaDangle.RuleEntry;
  '@stylistic/comma-spacing': CommaSpacing.RuleEntry;
  '@stylistic/comma-style': CommaStyle.RuleEntry;
  '@stylistic/computed-property-spacing': ComputedPropertySpacing.RuleEntry;
  '@stylistic/curly-newline': CurlyNewline.RuleEntry;
  '@stylistic/dot-location': DotLocation.RuleEntry;
  '@stylistic/eol-last': EolLast.RuleEntry;
  '@stylistic/function-call-argument-newline': FunctionCallArgumentNewline.RuleEntry;
  '@stylistic/function-call-spacing': FunctionCallSpacing.RuleEntry;
  '@stylistic/function-paren-newline': FunctionParenNewline.RuleEntry;
  '@stylistic/generator-star-spacing': GeneratorStarSpacing.RuleEntry;
  '@stylistic/implicit-arrow-linebreak': ImplicitArrowLinebreak.RuleEntry;
  '@stylistic/indent': Indent.RuleEntry;
  '@stylistic/indent-binary-ops': IndentBinaryOps.RuleEntry;
  '@stylistic/jsx-child-element-spacing': JsxChildElementSpacing.RuleEntry;
  '@stylistic/jsx-closing-bracket-location': JsxClosingBracketLocation.RuleEntry;
  '@stylistic/jsx-closing-tag-location': JsxClosingTagLocation.RuleEntry;
  '@stylistic/jsx-curly-brace-presence': JsxCurlyBracePresence.RuleEntry;
  '@stylistic/jsx-curly-newline': JsxCurlyNewline.RuleEntry;
  '@stylistic/jsx-curly-spacing': JsxCurlySpacing.RuleEntry;
  '@stylistic/jsx-equals-spacing': JsxEqualsSpacing.RuleEntry;
  '@stylistic/jsx-first-prop-new-line': JsxFirstPropNewLine.RuleEntry;
  '@stylistic/jsx-function-call-newline': JsxFunctionCallNewline.RuleEntry;
  '@stylistic/jsx-indent-props': JsxIndentProps.RuleEntry;
  '@stylistic/jsx-max-props-per-line': JsxMaxPropsPerLine.RuleEntry;
  '@stylistic/jsx-newline': JsxNewline.RuleEntry;
  '@stylistic/jsx-one-expression-per-line': JsxOneExpressionPerLine.RuleEntry;
  '@stylistic/jsx-pascal-case': JsxPascalCase.RuleEntry;
  '@stylistic/jsx-quotes': JsxQuotes.RuleEntry;
  '@stylistic/jsx-self-closing-comp': JsxSelfClosingComp.RuleEntry;
  '@stylistic/jsx-sort-props': JsxSortProps.RuleEntry;
  '@stylistic/jsx-tag-spacing': JsxTagSpacing.RuleEntry;
  '@stylistic/jsx-wrap-multilines': JsxWrapMultilines.RuleEntry;
  '@stylistic/key-spacing': KeySpacing.RuleEntry;
  '@stylistic/keyword-spacing': KeywordSpacing.RuleEntry;
  '@stylistic/line-comment-position': LineCommentPosition.RuleEntry;
  '@stylistic/linebreak-style': LinebreakStyle.RuleEntry;
  '@stylistic/lines-around-comment': LinesAroundComment.RuleEntry;
  '@stylistic/lines-between-class-members': LinesBetweenClassMembers.RuleEntry;
  '@stylistic/exp-list-style': ExpListStyle.RuleEntry;
  '@stylistic/max-len': MaxLen.RuleEntry;
  '@stylistic/max-statements-per-line': MaxStatementsPerLine.RuleEntry;
  '@stylistic/member-delimiter-style': MemberDelimiterStyle.RuleEntry;
  '@stylistic/multiline-comment-style': MultilineCommentStyle.RuleEntry;
  '@stylistic/multiline-ternary': MultilineTernary.RuleEntry;
  '@stylistic/new-parens': NewParens.RuleEntry;
  '@stylistic/newline-per-chained-call': NewlinePerChainedCall.RuleEntry;
  '@stylistic/no-confusing-arrow': NoConfusingArrow.RuleEntry;
  '@stylistic/no-extra-parens': NoExtraParens.RuleEntry;
  '@stylistic/no-extra-semi': NoExtraSemi.RuleEntry;
  '@stylistic/no-floating-decimal': NoFloatingDecimal.RuleEntry;
  '@stylistic/no-mixed-operators': NoMixedOperators.RuleEntry;
  '@stylistic/no-mixed-spaces-and-tabs': NoMixedSpacesAndTabs.RuleEntry;
  '@stylistic/no-multi-spaces': NoMultiSpaces.RuleEntry;
  '@stylistic/no-multiple-empty-lines': NoMultipleEmptyLines.RuleEntry;
  '@stylistic/no-tabs': NoTabs.RuleEntry;
  '@stylistic/no-trailing-spaces': NoTrailingSpaces.RuleEntry;
  '@stylistic/no-whitespace-before-property': NoWhitespaceBeforeProperty.RuleEntry;
  '@stylistic/nonblock-statement-body-position': NonblockStatementBodyPosition.RuleEntry;
  '@stylistic/object-curly-newline': ObjectCurlyNewline.RuleEntry;
  '@stylistic/object-curly-spacing': ObjectCurlySpacing.RuleEntry;
  '@stylistic/object-property-newline': ObjectPropertyNewline.RuleEntry;
  '@stylistic/one-var-declaration-per-line': OneVarDeclarationPerLine.RuleEntry;
  '@stylistic/operator-linebreak': OperatorLinebreak.RuleEntry;
  '@stylistic/padded-blocks': PaddedBlocks.RuleEntry;
  '@stylistic/padding-line-between-statements': PaddingLineBetweenStatements.RuleEntry;
  '@stylistic/quote-props': QuoteProps.RuleEntry;
  '@stylistic/quotes': Quotes.RuleEntry;
  '@stylistic/rest-spread-spacing': RestSpreadSpacing.RuleEntry;
  '@stylistic/semi': Semi.RuleEntry;
  '@stylistic/semi-spacing': SemiSpacing.RuleEntry;
  '@stylistic/semi-style': SemiStyle.RuleEntry;
  '@stylistic/space-before-blocks': SpaceBeforeBlocks.RuleEntry;
  '@stylistic/space-before-function-paren': SpaceBeforeFunctionParen.RuleEntry;
  '@stylistic/space-in-parens': SpaceInParens.RuleEntry;
  '@stylistic/space-infix-ops': SpaceInfixOps.RuleEntry;
  '@stylistic/space-unary-ops': SpaceUnaryOps.RuleEntry;
  '@stylistic/spaced-comment': SpacedComment.RuleEntry;
  '@stylistic/switch-colon-spacing': SwitchColonSpacing.RuleEntry;
  '@stylistic/template-curly-spacing': TemplateCurlySpacing.RuleEntry;
  '@stylistic/template-tag-spacing': TemplateTagSpacing.RuleEntry;
  '@stylistic/type-annotation-spacing': TypeAnnotationSpacing.RuleEntry;
  '@stylistic/type-generic-spacing': TypeGenericSpacing.RuleEntry;
  '@stylistic/type-named-tuple-spacing': TypeNamedTupleSpacing.RuleEntry;
  '@stylistic/wrap-iife': WrapIife.RuleEntry;
  '@stylistic/wrap-regex': WrapRegex.RuleEntry;
  '@stylistic/yield-star-spacing': YieldStarSpacing.RuleEntry;

  // deprecated
  '@stylistic/jsx-indent': JsxIndent.RuleEntry;
  '@stylistic/jsx-props-no-multi-spaces': JsxPropsNoMultiSpaces.RuleEntry;
}>;

export type EslintStylisticRulesOption = Readonly<{
  '@stylistic/array-bracket-newline': ArrayBracketNewline.Options;
  '@stylistic/array-bracket-spacing': readonly [
    ArrayBracketSpacing.Options0,
    ArrayBracketSpacing.Options1,
  ];
  '@stylistic/array-element-newline': ArrayElementNewline.Options;
  '@stylistic/arrow-parens': readonly [
    ArrowParens.Options0,
    ArrowParens.Options1,
  ];
  '@stylistic/arrow-spacing': ArrowSpacing.Options;
  '@stylistic/block-spacing': BlockSpacing.Options;
  '@stylistic/brace-style': readonly [BraceStyle.Options0, BraceStyle.Options1];
  '@stylistic/comma-dangle': CommaDangle.Options;
  '@stylistic/comma-spacing': CommaSpacing.Options;
  '@stylistic/comma-style': readonly [CommaStyle.Options0, CommaStyle.Options1];
  '@stylistic/computed-property-spacing': readonly [
    ComputedPropertySpacing.Options0,
    ComputedPropertySpacing.Options1,
  ];
  '@stylistic/curly-newline': CurlyNewline.Options;
  '@stylistic/dot-location': DotLocation.Options;
  '@stylistic/eol-last': EolLast.Options;
  '@stylistic/function-call-argument-newline': FunctionCallArgumentNewline.Options;
  '@stylistic/function-call-spacing': FunctionCallSpacing.Options;
  '@stylistic/function-paren-newline': FunctionParenNewline.Options;
  '@stylistic/generator-star-spacing': GeneratorStarSpacing.Options;
  '@stylistic/implicit-arrow-linebreak': ImplicitArrowLinebreak.Options;
  '@stylistic/indent': readonly [Indent.Options0, Indent.Options1];
  '@stylistic/indent-binary-ops': IndentBinaryOps.Options;
  '@stylistic/jsx-closing-bracket-location': JsxClosingBracketLocation.Options;
  '@stylistic/jsx-closing-tag-location': JsxClosingTagLocation.Options;
  '@stylistic/jsx-curly-brace-presence': JsxCurlyBracePresence.Options;
  '@stylistic/jsx-curly-newline': JsxCurlyNewline.Options;
  '@stylistic/jsx-curly-spacing': JsxCurlySpacing.Options;
  '@stylistic/jsx-equals-spacing': JsxEqualsSpacing.Options;
  '@stylistic/jsx-first-prop-new-line': JsxFirstPropNewLine.Options;
  '@stylistic/jsx-function-call-newline': JsxFunctionCallNewline.Options;
  '@stylistic/jsx-indent-props': JsxIndentProps.Options;
  '@stylistic/jsx-max-props-per-line': JsxMaxPropsPerLine.Options;
  '@stylistic/jsx-newline': JsxNewline.Options;
  '@stylistic/jsx-one-expression-per-line': JsxOneExpressionPerLine.Options;
  '@stylistic/jsx-pascal-case': JsxPascalCase.Options;
  '@stylistic/jsx-quotes': JsxQuotes.Options;
  '@stylistic/jsx-self-closing-comp': JsxSelfClosingComp.Options;
  '@stylistic/jsx-sort-props': JsxSortProps.Options;
  '@stylistic/jsx-tag-spacing': JsxTagSpacing.Options;
  '@stylistic/jsx-wrap-multilines': JsxWrapMultilines.Options;
  '@stylistic/key-spacing': KeySpacing.Options;
  '@stylistic/keyword-spacing': KeywordSpacing.Options;
  '@stylistic/line-comment-position': LineCommentPosition.Options;
  '@stylistic/linebreak-style': LinebreakStyle.Options;
  '@stylistic/lines-around-comment': LinesAroundComment.Options;
  '@stylistic/lines-between-class-members': readonly [
    LinesBetweenClassMembers.Options0,
    LinesBetweenClassMembers.Options1,
  ];
  '@stylistic/exp-list-style': ExpListStyle.Options;
  '@stylistic/max-len': readonly [
    MaxLen.Options0,
    MaxLen.Options1,
    MaxLen.Options2,
  ];
  '@stylistic/max-statements-per-line': MaxStatementsPerLine.Options;
  '@stylistic/member-delimiter-style': MemberDelimiterStyle.Options;
  '@stylistic/multiline-comment-style': MultilineCommentStyle.Options;
  '@stylistic/multiline-ternary': readonly [
    MultilineTernary.Options0,
    MultilineTernary.Options1,
  ];
  '@stylistic/new-parens': NewParens.Options;
  '@stylistic/newline-per-chained-call': NewlinePerChainedCall.Options;
  '@stylistic/no-confusing-arrow': NoConfusingArrow.Options;
  '@stylistic/no-extra-parens': NoExtraParens.Options;
  '@stylistic/no-mixed-operators': NoMixedOperators.Options;
  '@stylistic/no-mixed-spaces-and-tabs': NoMixedSpacesAndTabs.Options;
  '@stylistic/no-multi-spaces': NoMultiSpaces.Options;
  '@stylistic/no-multiple-empty-lines': NoMultipleEmptyLines.Options;
  '@stylistic/no-tabs': NoTabs.Options;
  '@stylistic/no-trailing-spaces': NoTrailingSpaces.Options;
  '@stylistic/nonblock-statement-body-position': readonly [
    NonblockStatementBodyPosition.Options0,
    NonblockStatementBodyPosition.Options1,
  ];
  '@stylistic/object-curly-newline': ObjectCurlyNewline.Options;
  '@stylistic/object-curly-spacing': readonly [
    ObjectCurlySpacing.Options0,
    ObjectCurlySpacing.Options1,
  ];
  '@stylistic/object-property-newline': ObjectPropertyNewline.Options;
  '@stylistic/one-var-declaration-per-line': OneVarDeclarationPerLine.Options;
  '@stylistic/operator-linebreak': readonly [
    OperatorLinebreak.Options0,
    OperatorLinebreak.Options1,
  ];
  '@stylistic/padded-blocks': readonly [
    PaddedBlocks.Options0,
    PaddedBlocks.Options1,
  ];
  '@stylistic/padding-line-between-statements': PaddingLineBetweenStatements.Options;
  '@stylistic/quote-props': QuoteProps.Options;
  '@stylistic/quotes': readonly [Quotes.Options0, Quotes.Options1];
  '@stylistic/rest-spread-spacing': RestSpreadSpacing.Options;
  '@stylistic/semi': Semi.Options;
  '@stylistic/semi-spacing': SemiSpacing.Options;
  '@stylistic/semi-style': SemiStyle.Options;
  '@stylistic/space-before-blocks': SpaceBeforeBlocks.Options;
  '@stylistic/space-before-function-paren': SpaceBeforeFunctionParen.Options;
  '@stylistic/space-in-parens': readonly [
    SpaceInParens.Options0,
    SpaceInParens.Options1,
  ];
  '@stylistic/space-infix-ops': SpaceInfixOps.Options;
  '@stylistic/space-unary-ops': SpaceUnaryOps.Options;
  '@stylistic/spaced-comment': readonly [
    SpacedComment.Options0,
    SpacedComment.Options1,
  ];
  '@stylistic/switch-colon-spacing': SwitchColonSpacing.Options;
  '@stylistic/template-curly-spacing': TemplateCurlySpacing.Options;
  '@stylistic/template-tag-spacing': TemplateTagSpacing.Options;
  '@stylistic/type-annotation-spacing': TypeAnnotationSpacing.Options;
  '@stylistic/wrap-iife': readonly [WrapIife.Options0, WrapIife.Options1];
  '@stylistic/yield-star-spacing': YieldStarSpacing.Options;
}>;
