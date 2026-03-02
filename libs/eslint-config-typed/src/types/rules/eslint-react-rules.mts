/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * @description Enforces consistent naming for boolean props
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/boolean-prop-naming.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace BooleanPropNaming {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "propTypeNames": {
   *         "items": {
   *           "type": "string"
   *         },
   *         "minItems": 1,
   *         "type": "array",
   *         "uniqueItems": true
   *       },
   *       "rule": {
   *         "default": "^(is|has)[A-Z]([A-Za-z0-9]?)+",
   *         "minLength": 1,
   *         "type": "string"
   *       },
   *       "message": {
   *         "minLength": 1,
   *         "type": "string"
   *       },
   *       "validateNested": {
   *         "default": false,
   *         "type": "boolean"
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * @minItems 1
     */
    propTypeNames?: readonly [string, ...string[]];
    /**
     * @default "^(is|has)[A-Z]([A-Za-z0-9]?)+"
     */
    rule?: string;
    message?: string;
    /**
     * @default false
     */
    validateNested?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow usage of `button` elements without an explicit `type` attribute
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/button-has-type.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace ButtonHasType {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "button": {
   *         "default": true,
   *         "type": "boolean"
   *       },
   *       "submit": {
   *         "default": true,
   *         "type": "boolean"
   *       },
   *       "reset": {
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
    /**
     * @default true
     */
    button?: boolean;
    /**
     * @default true
     */
    submit?: boolean;
    /**
     * @default true
     */
    reset?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce using `onChange` or `readonly` attribute when `checked` is used
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/checked-requires-onchange-or-readonly.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace CheckedRequiresOnchangeOrReadonly {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "ignoreMissingProperties": {
   *         "type": "boolean"
   *       },
   *       "ignoreExclusiveCheckedAttribute": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    ignoreMissingProperties?: boolean;
    ignoreExclusiveCheckedAttribute?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce all defaultProps have a corresponding non-required PropType
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/default-props-match-prop-types.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace DefaultPropsMatchPropTypes {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowRequiredDefaults": {
   *         "default": false,
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
     * @default false
     */
    allowRequiredDefaults?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce consistent usage of destructuring assignment of props, state, and context
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/destructuring-assignment.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
 *  ```
 */
namespace DestructuringAssignment {
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
   *       "ignoreClassFields": {
   *         "type": "boolean"
   *       },
   *       "destructureInSignature": {
   *         "type": "string",
   *         "enum": [
   *           "always",
   *           "ignore"
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
    ignoreClassFields?: boolean;
    destructureInSignature?: 'always' | 'ignore';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
}

/**
 * @description Disallow missing displayName in a React component definition
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/display-name.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | true  |
 *  ```
 */
namespace DisplayName {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreTranspilerName": {
   *         "type": "boolean"
   *       },
   *       "checkContextObjects": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    ignoreTranspilerName?: boolean;
    checkContextObjects?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow certain props on components
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/forbid-component-props.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace ForbidComponentProps {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "forbid": {
   *         "type": "array",
   *         "items": {
   *           "anyOf": [
   *             {
   *               "type": "string"
   *             },
   *             {
   *               "type": "object",
   *               "properties": {
   *                 "propName": {
   *                   "type": "string"
   *                 },
   *                 "allowedFor": {
   *                   "type": "array",
   *                   "uniqueItems": true,
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "allowedForPatterns": {
   *                   "type": "array",
   *                   "uniqueItems": true,
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "message": {
   *                   "type": "string"
   *                 }
   *               },
   *               "additionalProperties": false
   *             },
   *             {
   *               "type": "object",
   *               "properties": {
   *                 "propName": {
   *                   "type": "string"
   *                 },
   *                 "disallowedFor": {
   *                   "type": "array",
   *                   "uniqueItems": true,
   *                   "minItems": 1,
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "disallowedForPatterns": {
   *                   "type": "array",
   *                   "uniqueItems": true,
   *                   "minItems": 1,
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "message": {
   *                   "type": "string"
   *                 }
   *               },
   *               "anyOf": [
   *                 {
   *                   "required": [
   *                     "disallowedFor"
   *                   ]
   *                 },
   *                 {
   *                   "required": [
   *                     "disallowedForPatterns"
   *                   ]
   *                 }
   *               ],
   *               "additionalProperties": false
   *             },
   *             {
   *               "type": "object",
   *               "properties": {
   *                 "propNamePattern": {
   *                   "type": "string"
   *                 },
   *                 "allowedFor": {
   *                   "type": "array",
   *                   "uniqueItems": true,
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "allowedForPatterns": {
   *                   "type": "array",
   *                   "uniqueItems": true,
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "message": {
   *                   "type": "string"
   *                 }
   *               },
   *               "additionalProperties": false
   *             },
   *             {
   *               "type": "object",
   *               "properties": {
   *                 "propNamePattern": {
   *                   "type": "string"
   *                 },
   *                 "disallowedFor": {
   *                   "type": "array",
   *                   "uniqueItems": true,
   *                   "minItems": 1,
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "disallowedForPatterns": {
   *                   "type": "array",
   *                   "uniqueItems": true,
   *                   "minItems": 1,
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "message": {
   *                   "type": "string"
   *                 }
   *               },
   *               "anyOf": [
   *                 {
   *                   "required": [
   *                     "disallowedFor"
   *                   ]
   *                 },
   *                 {
   *                   "required": [
   *                     "disallowedForPatterns"
   *                   ]
   *                 }
   *               ],
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
    forbid?: readonly (
      | string
      | Readonly<
          | {
              propName?: string;
              allowedFor?: readonly string[];
              allowedForPatterns?: readonly string[];
              message?: string;
            }
          | {
              propNamePattern?: string;
              allowedFor?: readonly string[];
              allowedForPatterns?: readonly string[];
              message?: string;
            }
        >
      | Record<string, unknown>
    )[];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow certain props on DOM Nodes
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/forbid-dom-props.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace ForbidDomProps {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "forbid": {
   *         "type": "array",
   *         "items": {
   *           "anyOf": [
   *             {
   *               "type": "string"
   *             },
   *             {
   *               "type": "object",
   *               "properties": {
   *                 "propName": {
   *                   "type": "string"
   *                 },
   *                 "disallowedFor": {
   *                   "type": "array",
   *                   "uniqueItems": true,
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "message": {
   *                   "type": "string"
   *                 }
   *               }
   *             }
   *           ],
   *           "minLength": 1
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
    forbid?: readonly (
      | string
      | Readonly<{
          propName?: string;
          disallowedFor?: readonly string[];
          message?: string;
          [k: string]: unknown;
        }>
    )[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow certain elements
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/forbid-elements.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace ForbidElements {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "forbid": {
   *         "type": "array",
   *         "items": {
   *           "anyOf": [
   *             {
   *               "type": "string"
   *             },
   *             {
   *               "type": "object",
   *               "properties": {
   *                 "element": {
   *                   "type": "string"
   *                 },
   *                 "message": {
   *                   "type": "string"
   *                 }
   *               },
   *               "required": [
   *                 "element"
   *               ],
   *               "additionalProperties": false
   *             }
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
    forbid?: readonly (
      | string
      | Readonly<{
          element: string;
          message?: string;
        }>
    )[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow using another component's propTypes
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/forbid-foreign-prop-types.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace ForbidForeignPropTypes {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowInPropTypes": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowInPropTypes?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow certain propTypes
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/forbid-prop-types.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace ForbidPropTypes {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "forbid": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "checkContextTypes": {
   *         "type": "boolean"
   *       },
   *       "checkChildContextTypes": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    forbid?: readonly string[];
    checkContextTypes?: boolean;
    checkChildContextTypes?: boolean;
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Require all forwardRef components include a ref parameter
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/forward-ref-uses-ref.md
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
namespace ForwardRefUsesRef {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce a specific function type for function components
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/function-component-definition.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
 *  ```
 */
namespace FunctionComponentDefinition {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "namedComponents": {
   *         "anyOf": [
   *           {
   *             "enum": [
   *               "function-declaration",
   *               "arrow-function",
   *               "function-expression"
   *             ]
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "function-declaration",
   *                 "arrow-function",
   *                 "function-expression"
   *               ]
   *             }
   *           }
   *         ]
   *       },
   *       "unnamedComponents": {
   *         "anyOf": [
   *           {
   *             "enum": [
   *               "arrow-function",
   *               "function-expression"
   *             ]
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "arrow-function",
   *                 "function-expression"
   *               ]
   *             }
   *           }
   *         ]
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    namedComponents?:
      | ('function-declaration' | 'arrow-function' | 'function-expression')
      | readonly (
          | 'function-declaration'
          | 'arrow-function'
          | 'function-expression'
        )[];
    unnamedComponents?:
      | ('arrow-function' | 'function-expression')
      | readonly ('arrow-function' | 'function-expression')[];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Ensure destructuring and symmetric naming of useState hook value and setter variables
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/hook-use-state.md
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
namespace HookUseState {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowDestructuredState": {
   *         "default": false,
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
     * @default false
     */
    allowDestructuredState?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce sandbox attribute on iframe elements
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/iframe-missing-sandbox.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace IframeMissingSandbox {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce boolean attributes notation in JSX
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-boolean-value.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
 *  ```
 */
namespace JsxBooleanValue {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "anyOf": [
   *       {
   *         "type": "array",
   *         "items": [],
   *         "additionalItems": false,
   *         "minItems": 0,
   *         "maxItems": 0
   *       },
   *       {
   *         "type": "array",
   *         "items": [
   *           {
   *             "enum": [
   *               "always"
   *             ]
   *           },
   *           {
   *             "type": "object",
   *             "additionalProperties": false,
   *             "properties": {
   *               "never": {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "minLength": 1
   *                 },
   *                 "uniqueItems": true
   *               },
   *               "assumeUndefinedIsFalse": {
   *                 "type": "boolean"
   *               }
   *             }
   *           }
   *         ],
   *         "additionalItems": false,
   *         "minItems": 1
   *       },
   *       {
   *         "type": "array",
   *         "items": [
   *           {
   *             "enum": [
   *               "never"
   *             ]
   *           },
   *           {
   *             "type": "object",
   *             "additionalProperties": false,
   *             "properties": {
   *               "always": {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "minLength": 1
   *                 },
   *                 "uniqueItems": true
   *               },
   *               "assumeUndefinedIsFalse": {
   *                 "type": "boolean"
   *               }
   *             }
   *           }
   *         ],
   *         "additionalItems": false,
   *         "minItems": 1
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options =
    | readonly []
    | readonly ['always']
    | readonly [
        'always',
        Readonly<{
          never?: readonly string[];
          assumeUndefinedIsFalse?: boolean;
        }>,
      ]
    | readonly ['never']
    | readonly [
        'never',
        Readonly<{
          always?: readonly string[];
          assumeUndefinedIsFalse?: boolean;
        }>,
      ];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce or disallow spaces inside of curly braces in JSX attributes and expressions
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-child-element-spacing.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace JsxChildElementSpacing {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce closing bracket location in JSX
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-closing-bracket-location.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
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
   *             "enum": [
   *               "after-props",
   *               "props-aligned",
   *               "tag-aligned",
   *               "line-aligned",
   *               false
   *             ]
   *           },
   *           "selfClosing": {
   *             "enum": [
   *               "after-props",
   *               "props-aligned",
   *               "tag-aligned",
   *               "line-aligned",
   *               false
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
              | 'after-props'
              | 'props-aligned'
              | 'tag-aligned'
              | 'line-aligned'
              | false;
            selfClosing?:
              | 'after-props'
              | 'props-aligned'
              | 'tag-aligned'
              | 'line-aligned'
              | false;
          }
      >;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce closing tag location for multiline JSX
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-closing-tag-location.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | deprecated  | false      |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
   *         "enum": [
   *           "tag-aligned",
   *           "line-aligned"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "location": {
   *             "enum": [
   *               "tag-aligned",
   *               "line-aligned"
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
    | ('tag-aligned' | 'line-aligned')
    | Readonly<{
        location?: 'tag-aligned' | 'line-aligned';
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce or disallow spaces inside of curly braces in JSX attributes and expressions
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-curly-spacing.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
 *  ```
 */
namespace JsxCurlySpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "definitions": {
   *       "basicConfig": {
   *         "type": "object",
   *         "properties": {
   *           "when": {
   *             "enum": [
   *               "always",
   *               "never"
   *             ]
   *           },
   *           "allowMultiline": {
   *             "type": "boolean"
   *           },
   *           "spacing": {
   *             "type": "object",
   *             "properties": {
   *               "objectLiterals": {
   *                 "enum": [
   *                   "always",
   *                   "never"
   *                 ]
   *               }
   *             }
   *           }
   *         }
   *       },
   *       "basicConfigOrBoolean": {
   *         "anyOf": [
   *           {
   *             "$ref": "#/definitions/basicConfig"
   *           },
   *           {
   *             "type": "boolean"
   *           }
   *         ]
   *       }
   *     },
   *     "type": "array",
   *     "items": [
   *       {
   *         "anyOf": [
   *           {
   *             "allOf": [
   *               {
   *                 "$ref": "#/definitions/basicConfig"
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "attributes": {
   *                     "$ref": "#/definitions/basicConfigOrBoolean"
   *                   },
   *                   "children": {
   *                     "$ref": "#/definitions/basicConfigOrBoolean"
   *                   }
   *                 }
   *               }
   *             ]
   *           },
   *           {
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
   *                 "enum": [
   *                   "always",
   *                   "never"
   *                 ]
   *               }
   *             }
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
        | (BasicConfig &
            Readonly<{
              attributes?: BasicConfigOrBoolean;
              children?: BasicConfigOrBoolean;
              [k: string]: unknown;
            }>)
        | ('always' | 'never'),
      ]
    | readonly [
        (
          | (BasicConfig &
              Readonly<{
                attributes?: BasicConfigOrBoolean;
                children?: BasicConfigOrBoolean;
                [k: string]: unknown;
              }>)
          | ('always' | 'never')
        ),
        Readonly<{
          allowMultiline?: boolean;
          spacing?: Readonly<{
            objectLiterals?: 'always' | 'never';
            [k: string]: unknown;
          }>;
        }>,
      ];

  export type BasicConfigOrBoolean = BasicConfig | boolean;

  export type BasicConfig = Readonly<{
    when?: 'always' | 'never';
    allowMultiline?: boolean;
    spacing?: Readonly<{
      objectLiterals?: 'always' | 'never';
      [k: string]: unknown;
    }>;
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce consistent linebreaks in curly braces in JSX attributes and expressions
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-curly-newline.md
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
namespace JsxCurlyNewline {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "anyOf": [
   *       {
   *         "enum": [
   *           "consistent",
   *           "never"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "singleline": {
   *             "enum": [
   *               "consistent",
   *               "require",
   *               "forbid"
   *             ]
   *           },
   *           "multiline": {
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
 * @description Enforce or disallow spaces around equal signs in JSX attributes
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-equals-spacing.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
 *  ```
 */
namespace JsxEqualsSpacing {
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
 * @description Disallow file extensions that may contain JSX
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-filename-extension.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace JsxFilenameExtension {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allow": {
   *         "enum": [
   *           "always",
   *           "as-needed"
   *         ]
   *       },
   *       "extensions": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "ignoreFilesWithoutCode": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allow?: 'always' | 'as-needed';
    extensions?: readonly string[];
    ignoreFilesWithoutCode?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce proper position of the first property in JSX
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-first-prop-new-line.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
 *  ```
 */
namespace JsxFirstPropNewLine {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
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
 * @description Enforce event handler naming conventions in JSX
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-handler-names.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace JsxHandlerNames {
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
   *           "eventHandlerPrefix": {
   *             "type": "string"
   *           },
   *           "eventHandlerPropPrefix": {
   *             "type": "string"
   *           },
   *           "checkLocalVariables": {
   *             "type": "boolean"
   *           },
   *           "checkInlineFunction": {
   *             "type": "boolean"
   *           },
   *           "ignoreComponentNames": {
   *             "type": "array",
   *             "uniqueItems": true,
   *             "items": {
   *               "type": "string"
   *             }
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "eventHandlerPrefix": {
   *             "type": "string"
   *           },
   *           "eventHandlerPropPrefix": {
   *             "type": "boolean",
   *             "enum": [
   *               false
   *             ]
   *           },
   *           "checkLocalVariables": {
   *             "type": "boolean"
   *           },
   *           "checkInlineFunction": {
   *             "type": "boolean"
   *           },
   *           "ignoreComponentNames": {
   *             "type": "array",
   *             "uniqueItems": true,
   *             "items": {
   *               "type": "string"
   *             }
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "eventHandlerPrefix": {
   *             "type": "boolean",
   *             "enum": [
   *               false
   *             ]
   *           },
   *           "eventHandlerPropPrefix": {
   *             "type": "string"
   *           },
   *           "checkLocalVariables": {
   *             "type": "boolean"
   *           },
   *           "checkInlineFunction": {
   *             "type": "boolean"
   *           },
   *           "ignoreComponentNames": {
   *             "type": "array",
   *             "uniqueItems": true,
   *             "items": {
   *               "type": "string"
   *             }
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "checkLocalVariables": {
   *             "type": "boolean"
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "checkInlineFunction": {
   *             "type": "boolean"
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "ignoreComponentNames": {
   *             "type": "array",
   *             "uniqueItems": true,
   *             "items": {
   *               "type": "string"
   *             }
   *           }
   *         }
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<
    | {
        eventHandlerPrefix?: string;
        eventHandlerPropPrefix?: string;
        checkLocalVariables?: boolean;
        checkInlineFunction?: boolean;
        ignoreComponentNames?: readonly string[];
      }
    | {
        eventHandlerPrefix?: string;
        eventHandlerPropPrefix?: false;
        checkLocalVariables?: boolean;
        checkInlineFunction?: boolean;
        ignoreComponentNames?: readonly string[];
      }
    | {
        eventHandlerPrefix?: false;
        eventHandlerPropPrefix?: string;
        checkLocalVariables?: boolean;
        checkInlineFunction?: boolean;
        ignoreComponentNames?: readonly string[];
      }
    | {
        checkLocalVariables?: boolean;
      }
    | {
        checkInlineFunction?: boolean;
      }
    | {
        ignoreComponentNames?: readonly string[];
        [k: string]: unknown;
      }
  >;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce JSX indentation
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-indent.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | deprecated  | false      |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
  export type Options0 = 'tab' | number;

  export type Options1 = Readonly<{
    checkAttributes?: boolean;
    indentLogicalExpressions?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
}

/**
 * @description Enforce props indentation in JSX
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-indent-props.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
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
   *         }
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
        [k: string]: unknown;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow missing `key` props in iterators/collection literals
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-key.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | true  |
 *  ```
 */
namespace JsxKey {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "checkFragmentShorthand": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "checkKeyMustBeforeSpread": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "warnOnDuplicates": {
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
    /**
     * @default false
     */
    checkFragmentShorthand?: boolean;
    /**
     * @default false
     */
    checkKeyMustBeforeSpread?: boolean;
    /**
     * @default false
     */
    warnOnDuplicates?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce JSX maximum depth
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-max-depth.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace JsxMaxDepth {
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
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    max?: number;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce maximum of props on a single line in JSX
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-max-props-per-line.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
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
   *             }
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
          [k: string]: unknown;
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
 * @description Require or prevent a new line after jsx elements and expressions.
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-newline.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
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
    /**
     * @default false
     */
    prevent?: boolean;
    /**
     * @default false
     */
    allowMultilines?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow `.bind()` or arrow functions in JSX props
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-no-bind.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace JsxNoBind {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowArrowFunctions": {
   *         "default": false,
   *         "type": "boolean"
   *       },
   *       "allowBind": {
   *         "default": false,
   *         "type": "boolean"
   *       },
   *       "allowFunctions": {
   *         "default": false,
   *         "type": "boolean"
   *       },
   *       "ignoreRefs": {
   *         "default": false,
   *         "type": "boolean"
   *       },
   *       "ignoreDOMComponents": {
   *         "default": false,
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
     * @default false
     */
    allowArrowFunctions?: boolean;
    /**
     * @default false
     */
    allowBind?: boolean;
    /**
     * @default false
     */
    allowFunctions?: boolean;
    /**
     * @default false
     */
    ignoreRefs?: boolean;
    /**
     * @default false
     */
    ignoreDOMComponents?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow comments from being inserted as text nodes
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-no-comment-textnodes.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | true  |
 *  ```
 */
namespace JsxNoCommentTextnodes {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallows JSX context provider values from taking values that will cause needless rerenders
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-no-constructed-context-values.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace JsxNoConstructedContextValues {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow duplicate properties in JSX
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-no-duplicate-props.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | true  |
 *  ```
 */
namespace JsxNoDuplicateProps {
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
 * @description Disallow problematic leaked values from being rendered
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-no-leaked-render.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
 *  ```
 */
namespace JsxNoLeakedRender {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "validStrategies": {
   *         "type": "array",
   *         "items": {
   *           "enum": [
   *             "ternary",
   *             "coerce"
   *           ]
   *         },
   *         "uniqueItems": true,
   *         "default": [
   *           "ternary",
   *           "coerce"
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * @default ["ternary","coerce"]
     */
    validStrategies?: readonly ('ternary' | 'coerce')[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow usage of string literals in JSX
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-no-literals.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace JsxNoLiterals {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "elementOverrides": {
   *         "type": "object",
   *         "patternProperties": {
   *           "^[A-Z][\\w.]*$": {
   *             "type": "object",
   *             "properties": {
   *               "applyToNestedElements": {
   *                 "type": "boolean"
   *               },
   *               "noStrings": {
   *                 "type": "boolean"
   *               },
   *               "allowedStrings": {
   *                 "type": "array",
   *                 "uniqueItems": true,
   *                 "items": {
   *                   "type": "string"
   *                 }
   *               },
   *               "ignoreProps": {
   *                 "type": "boolean"
   *               },
   *               "noAttributeStrings": {
   *                 "type": "boolean"
   *               }
   *             }
   *           }
   *         }
   *       },
   *       "noStrings": {
   *         "type": "boolean"
   *       },
   *       "allowedStrings": {
   *         "type": "array",
   *         "uniqueItems": true,
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "ignoreProps": {
   *         "type": "boolean"
   *       },
   *       "noAttributeStrings": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    elementOverrides?: Readonly<
      Record<
        string,
        Readonly<{
          applyToNestedElements?: boolean;
          noStrings?: boolean;
          allowedStrings?: readonly string[];
          ignoreProps?: boolean;
          noAttributeStrings?: boolean;
          [k: string]: unknown;
        }>
      >
    >;
    noStrings?: boolean;
    allowedStrings?: readonly string[];
    ignoreProps?: boolean;
    noAttributeStrings?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow usage of `javascript:` URLs
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-no-script-url.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace JsxNoScriptUrl {
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
   *             "type": "array",
   *             "uniqueItems": true,
   *             "items": {
   *               "type": "object",
   *               "properties": {
   *                 "name": {
   *                   "type": "string"
   *                 },
   *                 "props": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string",
   *                     "uniqueItems": true
   *                   }
   *                 }
   *               },
   *               "required": [
   *                 "name",
   *                 "props"
   *               ],
   *               "additionalProperties": false
   *             }
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "includeFromSettings": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalItems": false
   *           }
   *         ],
   *         "additionalItems": false
   *       },
   *       {
   *         "type": "array",
   *         "items": [
   *           {
   *             "type": "object",
   *             "properties": {
   *               "includeFromSettings": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalItems": false
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
    | readonly [
        readonly Readonly<{
          name: string;
          props: readonly string[];
        }>[],
      ]
    | readonly [
        readonly Readonly<{
          name: string;
          props: readonly string[];
        }>[],
        Readonly<{
          includeFromSettings?: boolean;
          [k: string]: unknown;
        }>,
      ]
    | readonly [
        Readonly<{
          includeFromSettings?: boolean;
          [k: string]: unknown;
        }>,
      ];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow `target="_blank"` attribute without `rel="noreferrer"`
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-no-target-blank.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | true  |
 *  ```
 */
namespace JsxNoTargetBlank {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowReferrer": {
   *         "type": "boolean"
   *       },
   *       "enforceDynamicLinks": {
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       },
   *       "warnOnSpreadAttributes": {
   *         "type": "boolean"
   *       },
   *       "links": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "forms": {
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
    allowReferrer?: boolean;
    enforceDynamicLinks?: 'always' | 'never';
    warnOnSpreadAttributes?: boolean;
    /**
     * @default true
     */
    links?: boolean;
    /**
     * @default false
     */
    forms?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow unnecessary fragments
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-no-useless-fragment.md
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
namespace JsxNoUselessFragment {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowExpressions": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowExpressions?: boolean;
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Require one JSX element per line
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-one-expression-per-line.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | deprecated  | false      |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
   *         "enum": [
   *           "none",
   *           "literal",
   *           "single-child",
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
    allow?: 'none' | 'literal' | 'single-child' | 'non-jsx';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow undeclared variables in JSX
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-no-undef.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | true  |
 *  ```
 */
namespace JsxNoUndef {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowGlobals": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowGlobals?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow unnecessary JSX expressions when literals alone are sufficient or enforce JSX expressions on literals in JSX children or attributes
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-curly-brace-presence.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
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
   *             "enum": [
   *               "always",
   *               "never",
   *               "ignore"
   *             ]
   *           },
   *           "children": {
   *             "enum": [
   *               "always",
   *               "never",
   *               "ignore"
   *             ]
   *           },
   *           "propElementValues": {
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
 * @description Enforce PascalCase for user-defined JSX components
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-pascal-case.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
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
   *         "minItems": 0,
   *         "type": "array",
   *         "uniqueItems": true,
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
    allowAllCaps?: boolean;
    allowLeadingUnderscore?: boolean;
    allowNamespace?: boolean;
    /**
     * @minItems 0
     */
    ignore?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce shorthand or standard form for React fragments
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-fragments.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
 *  ```
 */
namespace JsxFragments {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "syntax",
   *       "element"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'syntax' | 'element';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow multiple spaces between inline JSX props
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-props-no-multi-spaces.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
 *  ```
 */
namespace JsxPropsNoMultiSpaces {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow JSX prop spreading
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-props-no-spreading.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace JsxPropsNoSpreading {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "allOf": [
   *       {
   *         "type": "object",
   *         "properties": {
   *           "html": {
   *             "enum": [
   *               "enforce",
   *               "ignore"
   *             ]
   *           },
   *           "custom": {
   *             "enum": [
   *               "enforce",
   *               "ignore"
   *             ]
   *           },
   *           "explicitSpread": {
   *             "enum": [
   *               "enforce",
   *               "ignore"
   *             ]
   *           },
   *           "exceptions": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "uniqueItems": true
   *             }
   *           }
   *         }
   *       },
   *       {
   *         "not": {
   *           "type": "object",
   *           "required": [
   *             "html",
   *             "custom"
   *           ],
   *           "properties": {
   *             "html": {
   *               "enum": [
   *                 "ignore"
   *               ]
   *             },
   *             "custom": {
   *               "enum": [
   *                 "ignore"
   *               ]
   *             },
   *             "exceptions": {
   *               "type": "array",
   *               "minItems": 0,
   *               "maxItems": 0
   *             }
   *           }
   *         }
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    html?: 'enforce' | 'ignore';
    custom?: 'enforce' | 'ignore';
    explicitSpread?: 'enforce' | 'ignore';
    exceptions?: readonly string[];
    [k: string]: unknown;
  }> &
    Record<string, unknown>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow JSX prop spreading the same identifier multiple times
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-props-no-spread-multi.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace JsxPropsNoSpreadMulti {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce defaultProps declarations alphabetical sorting
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-sort-default-props.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | true  |
 *  | recommended | false |
 *  ```
 */
namespace JsxSortDefaultProps {
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
  export type RuleEntry = 0;
}

/**
 * @description Enforce props alphabetical sorting
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-sort-props.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
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
   *         "type": [
   *           "array",
   *           "boolean"
   *         ]
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
    /**
     * @default "ignore"
     */
    multiline?: 'ignore' | 'first' | 'last';
    ignoreCase?: boolean;
    noSortAlphabetically?: boolean;
    reservedFirst?: readonly unknown[] | boolean;
    /**
     * @default "auto"
     */
    locale?: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce spacing before closing bracket in JSX
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-space-before-closing.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | true  |
 *  | fixable     | code  |
 *  | recommended | false |
 *  ```
 */
namespace JsxSpaceBeforeClosing {
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
 * @description Enforce whitespace in and around the JSX opening and closing brackets
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-tag-spacing.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | deprecated  | false      |
 *  | fixable     | whitespace |
 *  | recommended | false      |
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
   *         "enum": [
   *           "always",
   *           "never",
   *           "allow"
   *         ]
   *       },
   *       "beforeSelfClosing": {
   *         "enum": [
   *           "always",
   *           "proportional-always",
   *           "never",
   *           "allow"
   *         ]
   *       },
   *       "afterOpening": {
   *         "enum": [
   *           "always",
   *           "allow-multiline",
   *           "never",
   *           "allow"
   *         ]
   *       },
   *       "beforeClosing": {
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
 * @description Disallow React to be incorrectly marked as unused
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-uses-react.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | true  |
 *  ```
 */
namespace JsxUsesReact {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow variables used in JSX to be incorrectly marked as unused
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-uses-vars.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | true  |
 *  ```
 */
namespace JsxUsesVars {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow missing parentheses around multiline JSX
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-wrap-multilines.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
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
   *         "enum": [
   *           true,
   *           false,
   *           "ignore",
   *           "parens",
   *           "parens-new-line",
   *           "never"
   *         ]
   *       },
   *       "assignment": {
   *         "enum": [
   *           true,
   *           false,
   *           "ignore",
   *           "parens",
   *           "parens-new-line",
   *           "never"
   *         ]
   *       },
   *       "return": {
   *         "enum": [
   *           true,
   *           false,
   *           "ignore",
   *           "parens",
   *           "parens-new-line",
   *           "never"
   *         ]
   *       },
   *       "arrow": {
   *         "enum": [
   *           true,
   *           false,
   *           "ignore",
   *           "parens",
   *           "parens-new-line",
   *           "never"
   *         ]
   *       },
   *       "condition": {
   *         "enum": [
   *           true,
   *           false,
   *           "ignore",
   *           "parens",
   *           "parens-new-line",
   *           "never"
   *         ]
   *       },
   *       "logical": {
   *         "enum": [
   *           true,
   *           false,
   *           "ignore",
   *           "parens",
   *           "parens-new-line",
   *           "never"
   *         ]
   *       },
   *       "prop": {
   *         "enum": [
   *           true,
   *           false,
   *           "ignore",
   *           "parens",
   *           "parens-new-line",
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
    declaration?:
      | true
      | false
      | 'ignore'
      | 'parens'
      | 'parens-new-line'
      | 'never';
    assignment?:
      | true
      | false
      | 'ignore'
      | 'parens'
      | 'parens-new-line'
      | 'never';
    return?: true | false | 'ignore' | 'parens' | 'parens-new-line' | 'never';
    arrow?: true | false | 'ignore' | 'parens' | 'parens-new-line' | 'never';
    condition?:
      | true
      | false
      | 'ignore'
      | 'parens'
      | 'parens-new-line'
      | 'never';
    logical?: true | false | 'ignore' | 'parens' | 'parens-new-line' | 'never';
    prop?: true | false | 'ignore' | 'parens' | 'parens-new-line' | 'never';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow usage of invalid attributes
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-invalid-html-attribute.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace NoInvalidHtmlAttribute {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "array",
   *     "uniqueItems": true,
   *     "items": {
   *       "enum": [
   *         "rel"
   *       ]
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = readonly 'rel'[];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow when this.state is accessed within setState
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-access-state-in-setstate.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace NoAccessStateInSetstate {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow adjacent inline elements not separated by whitespace.
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-adjacent-inline-elements.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace NoAdjacentInlineElements {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow usage of Array index in keys
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-array-index-key.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace NoArrayIndexKey {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Lifecycle methods should be methods on the prototype, not class fields
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-arrow-function-lifecycle.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
 *  ```
 */
namespace NoArrowFunctionLifecycle {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow passing of children as props
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-children-prop.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | true  |
 *  ```
 */
namespace NoChildrenProp {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowFunctions": {
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
    /**
     * @default false
     */
    allowFunctions?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow usage of dangerous JSX properties
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-danger.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace NoDanger {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "customComponentNames": {
   *         "items": {
   *           "type": "string"
   *         },
   *         "minItems": 0,
   *         "type": "array",
   *         "uniqueItems": true
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
    customComponentNames?: readonly string[];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow when a DOM element is using both children and dangerouslySetInnerHTML
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-danger-with-children.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | true  |
 *  ```
 */
namespace NoDangerWithChildren {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow usage of deprecated methods
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-deprecated.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | true  |
 *  ```
 */
namespace NoDeprecated {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow usage of setState in componentDidMount
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-did-mount-set-state.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace NoDidMountSetState {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "disallow-in-func"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'disallow-in-func';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow usage of setState in componentDidUpdate
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-did-update-set-state.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace NoDidUpdateSetState {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "disallow-in-func"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'disallow-in-func';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow direct mutation of this.state
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-direct-mutation-state.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | true  |
 *  ```
 */
namespace NoDirectMutationState {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow usage of findDOMNode
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-find-dom-node.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | true  |
 *  ```
 */
namespace NoFindDomNode {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow usage of isMounted
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-is-mounted.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | true  |
 *  ```
 */
namespace NoIsMounted {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow multiple component definition per file
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-multi-comp.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace NoMultiComp {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreStateless": {
   *         "default": false,
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
     * @default false
     */
    ignoreStateless?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce that namespaces are not used in React elements
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-namespace.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace NoNamespace {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow usage of setState
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-set-state.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace NoSetState {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow using string references
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-string-refs.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | true  |
 *  ```
 */
namespace NoStringRefs {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "noTemplateLiterals": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    noTemplateLiterals?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow usage of shouldComponentUpdate when extending React.PureComponent
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-redundant-should-component-update.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace NoRedundantShouldComponentUpdate {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow usage of the return value of ReactDOM.render
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-render-return-value.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | true  |
 *  ```
 */
namespace NoRenderReturnValue {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow `this` from being used in stateless functional components
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-this-in-sfc.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace NoThisInSfc {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow common typos
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-typos.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace NoTypos {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow unescaped HTML entities from appearing in markup
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-unescaped-entities.md
 *
 *  ```md
 *  | key            | value |
 *  | :------------- | :---- |
 *  | deprecated     | false |
 *  | hasSuggestions | true  |
 *  | recommended    | true  |
 *  ```
 */
namespace NoUnescapedEntities {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "forbid": {
   *         "type": "array",
   *         "items": {
   *           "anyOf": [
   *             {
   *               "type": "string"
   *             },
   *             {
   *               "type": "object",
   *               "properties": {
   *                 "char": {
   *                   "type": "string"
   *                 },
   *                 "alternatives": {
   *                   "type": "array",
   *                   "uniqueItems": true,
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 }
   *               }
   *             }
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
    forbid?: readonly (
      | string
      | Readonly<{
          char?: string;
          alternatives?: readonly string[];
          [k: string]: unknown;
        }>
    )[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow usage of unknown DOM property
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-unknown-property.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | true  |
 *  ```
 */
namespace NoUnknownProperty {
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
   *           "type": "string"
   *         }
   *       },
   *       "requireDataLowercase": {
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
    ignore?: readonly string[];
    /**
     * @default false
     */
    requireDataLowercase?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow usage of unsafe lifecycle methods
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-unsafe.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace NoUnsafe {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "checkAliases": {
   *         "default": false,
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
     * @default false
     */
    checkAliases?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow creating unstable components inside components
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-unstable-nested-components.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace NoUnstableNestedComponents {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "customValidators": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "allowAsProps": {
   *         "type": "boolean"
   *       },
   *       "propNamePattern": {
   *         "type": "string"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    customValidators?: readonly string[];
    allowAsProps?: boolean;
    propNamePattern?: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow declaring unused methods of component class
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-unused-class-component-methods.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace NoUnusedClassComponentMethods {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow definitions of unused propTypes
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-unused-prop-types.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace NoUnusedPropTypes {
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
   *           "type": "string"
   *         },
   *         "uniqueItems": true
   *       },
   *       "customValidators": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "skipShapeProps": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    ignore?: readonly string[];
    customValidators?: readonly string[];
    skipShapeProps?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow definitions of unused state
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-unused-state.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace NoUnusedState {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow usage of referential-type variables as default param in functional component
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-object-type-as-default-prop.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace NoObjectTypeAsDefaultProp {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow usage of setState in componentWillUpdate
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-will-update-set-state.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace NoWillUpdateSetState {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "disallow-in-func"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'disallow-in-func';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce ES5 or ES6 class for React Components
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/prefer-es6-class.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace PreferEs6Class {
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
 * @description Prefer exact proptype definitions
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/prefer-exact-props.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace PreferExactProps {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce that props are read-only
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/prefer-read-only-props.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
 *  ```
 */
namespace PreferReadOnlyProps {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce stateless components to be written as a pure function
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/prefer-stateless-function.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace PreferStatelessFunction {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignorePureComponents": {
   *         "default": false,
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
     * @default false
     */
    ignorePureComponents?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow missing props validation in a React component definition
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/prop-types.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | true  |
 *  ```
 */
namespace PropTypes {
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
   *           "type": "string"
   *         }
   *       },
   *       "customValidators": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "skipUndeclared": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    ignore?: readonly string[];
    customValidators?: readonly string[];
    skipUndeclared?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow missing React when using JSX
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/react-in-jsx-scope.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | true  |
 *  ```
 */
namespace ReactInJsxScope {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce a defaultProps definition for every prop that is not a required prop
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/require-default-props.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace RequireDefaultProps {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "forbidDefaultForRequired": {
   *         "type": "boolean"
   *       },
   *       "classes": {
   *         "enum": [
   *           "defaultProps",
   *           "ignore"
   *         ]
   *       },
   *       "functions": {
   *         "enum": [
   *           "defaultArguments",
   *           "defaultProps",
   *           "ignore"
   *         ]
   *       },
   *       "ignoreFunctionalComponents": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    forbidDefaultForRequired?: boolean;
    classes?: 'defaultProps' | 'ignore';
    functions?: 'defaultArguments' | 'defaultProps' | 'ignore';
    ignoreFunctionalComponents?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce React components to have a shouldComponentUpdate method
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/require-optimization.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace RequireOptimization {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowDecorators": {
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
    allowDecorators?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce ES5 or ES6 class for returning value in render function
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/require-render-return.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | true  |
 *  ```
 */
namespace RequireRenderReturn {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow extra closing tags for components without children
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/self-closing-comp.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
 *  ```
 */
namespace SelfClosingComp {
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
    /**
     * @default true
     */
    component?: boolean;
    /**
     * @default true
     */
    html?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce component methods order
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/sort-comp.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace SortComp {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "order": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "groups": {
   *         "type": "object",
   *         "patternProperties": {
   *           "^.*$": {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
   *             }
   *           }
   *         }
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    order?: readonly string[];
    groups?: Readonly<Record<string, readonly string[]>>;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce defaultProps declarations alphabetical sorting
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/sort-default-props.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace SortDefaultProps {
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
 * @description Enforce propTypes declarations alphabetical sorting
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/sort-prop-types.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | fixable     | code  |
 *  | recommended | false |
 *  ```
 */
namespace SortPropTypes {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "requiredFirst": {
   *         "type": "boolean"
   *       },
   *       "callbacksLast": {
   *         "type": "boolean"
   *       },
   *       "ignoreCase": {
   *         "type": "boolean"
   *       },
   *       "noSortAlphabetically": {
   *         "type": "boolean"
   *       },
   *       "sortShapeProp": {
   *         "type": "boolean"
   *       },
   *       "checkTypes": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    requiredFirst?: boolean;
    callbacksLast?: boolean;
    ignoreCase?: boolean;
    noSortAlphabetically?: boolean;
    sortShapeProp?: boolean;
    checkTypes?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce class component state initialization style
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/state-in-constructor.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace StateInConstructor {
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
 * @description Enforces where React component static properties should be positioned.
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/static-property-placement.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace StaticPropertyPlacement {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "static public field",
   *       "static getter",
   *       "property assignment"
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "propTypes": {
   *         "enum": [
   *           "static public field",
   *           "static getter",
   *           "property assignment"
   *         ]
   *       },
   *       "defaultProps": {
   *         "enum": [
   *           "static public field",
   *           "static getter",
   *           "property assignment"
   *         ]
   *       },
   *       "childContextTypes": {
   *         "enum": [
   *           "static public field",
   *           "static getter",
   *           "property assignment"
   *         ]
   *       },
   *       "contextTypes": {
   *         "enum": [
   *           "static public field",
   *           "static getter",
   *           "property assignment"
   *         ]
   *       },
   *       "contextType": {
   *         "enum": [
   *           "static public field",
   *           "static getter",
   *           "property assignment"
   *         ]
   *       },
   *       "displayName": {
   *         "enum": [
   *           "static public field",
   *           "static getter",
   *           "property assignment"
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options0 =
    | 'static public field'
    | 'static getter'
    | 'property assignment';

  export type Options1 = Readonly<{
    propTypes?: 'static public field' | 'static getter' | 'property assignment';
    defaultProps?:
      | 'static public field'
      | 'static getter'
      | 'property assignment';
    childContextTypes?:
      | 'static public field'
      | 'static getter'
      | 'property assignment';
    contextTypes?:
      | 'static public field'
      | 'static getter'
      | 'property assignment';
    contextType?:
      | 'static public field'
      | 'static getter'
      | 'property assignment';
    displayName?:
      | 'static public field'
      | 'static getter'
      | 'property assignment';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
}

/**
 * @description Enforce style prop value is an object
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/style-prop-object.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace StylePropObject {
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
   *         "additionalItems": false,
   *         "uniqueItems": true
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allow?: readonly string[];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow void DOM elements (e.g. `<img />`, `<br />`) from receiving children
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/void-dom-elements-no-children.md
 *
 *  ```md
 *  | key         | value |
 *  | :---------- | :---- |
 *  | deprecated  | false |
 *  | recommended | false |
 *  ```
 */
namespace VoidDomElementsNoChildren {
  export type RuleEntry = Linter.StringSeverity;
}

export type EslintReactRules = Readonly<{
  'react/boolean-prop-naming': BooleanPropNaming.RuleEntry;
  'react/button-has-type': ButtonHasType.RuleEntry;
  'react/checked-requires-onchange-or-readonly': CheckedRequiresOnchangeOrReadonly.RuleEntry;
  'react/default-props-match-prop-types': DefaultPropsMatchPropTypes.RuleEntry;
  'react/destructuring-assignment': DestructuringAssignment.RuleEntry;
  'react/display-name': DisplayName.RuleEntry;
  'react/forbid-component-props': ForbidComponentProps.RuleEntry;
  'react/forbid-dom-props': ForbidDomProps.RuleEntry;
  'react/forbid-elements': ForbidElements.RuleEntry;
  'react/forbid-foreign-prop-types': ForbidForeignPropTypes.RuleEntry;
  'react/forbid-prop-types': ForbidPropTypes.RuleEntry;
  'react/forward-ref-uses-ref': ForwardRefUsesRef.RuleEntry;
  'react/function-component-definition': FunctionComponentDefinition.RuleEntry;
  'react/hook-use-state': HookUseState.RuleEntry;
  'react/iframe-missing-sandbox': IframeMissingSandbox.RuleEntry;
  'react/jsx-boolean-value': JsxBooleanValue.RuleEntry;
  'react/jsx-child-element-spacing': JsxChildElementSpacing.RuleEntry;
  'react/jsx-closing-bracket-location': JsxClosingBracketLocation.RuleEntry;
  'react/jsx-closing-tag-location': JsxClosingTagLocation.RuleEntry;
  'react/jsx-curly-spacing': JsxCurlySpacing.RuleEntry;
  'react/jsx-curly-newline': JsxCurlyNewline.RuleEntry;
  'react/jsx-equals-spacing': JsxEqualsSpacing.RuleEntry;
  'react/jsx-filename-extension': JsxFilenameExtension.RuleEntry;
  'react/jsx-first-prop-new-line': JsxFirstPropNewLine.RuleEntry;
  'react/jsx-handler-names': JsxHandlerNames.RuleEntry;
  'react/jsx-indent': JsxIndent.RuleEntry;
  'react/jsx-indent-props': JsxIndentProps.RuleEntry;
  'react/jsx-key': JsxKey.RuleEntry;
  'react/jsx-max-depth': JsxMaxDepth.RuleEntry;
  'react/jsx-max-props-per-line': JsxMaxPropsPerLine.RuleEntry;
  'react/jsx-newline': JsxNewline.RuleEntry;
  'react/jsx-no-bind': JsxNoBind.RuleEntry;
  'react/jsx-no-comment-textnodes': JsxNoCommentTextnodes.RuleEntry;
  'react/jsx-no-constructed-context-values': JsxNoConstructedContextValues.RuleEntry;
  'react/jsx-no-duplicate-props': JsxNoDuplicateProps.RuleEntry;
  'react/jsx-no-leaked-render': JsxNoLeakedRender.RuleEntry;
  'react/jsx-no-literals': JsxNoLiterals.RuleEntry;
  'react/jsx-no-script-url': JsxNoScriptUrl.RuleEntry;
  'react/jsx-no-target-blank': JsxNoTargetBlank.RuleEntry;
  'react/jsx-no-useless-fragment': JsxNoUselessFragment.RuleEntry;
  'react/jsx-one-expression-per-line': JsxOneExpressionPerLine.RuleEntry;
  'react/jsx-no-undef': JsxNoUndef.RuleEntry;
  'react/jsx-curly-brace-presence': JsxCurlyBracePresence.RuleEntry;
  'react/jsx-pascal-case': JsxPascalCase.RuleEntry;
  'react/jsx-fragments': JsxFragments.RuleEntry;
  'react/jsx-props-no-multi-spaces': JsxPropsNoMultiSpaces.RuleEntry;
  'react/jsx-props-no-spreading': JsxPropsNoSpreading.RuleEntry;
  'react/jsx-props-no-spread-multi': JsxPropsNoSpreadMulti.RuleEntry;
  'react/jsx-sort-props': JsxSortProps.RuleEntry;
  'react/jsx-tag-spacing': JsxTagSpacing.RuleEntry;
  'react/jsx-uses-react': JsxUsesReact.RuleEntry;
  'react/jsx-uses-vars': JsxUsesVars.RuleEntry;
  'react/jsx-wrap-multilines': JsxWrapMultilines.RuleEntry;
  'react/no-invalid-html-attribute': NoInvalidHtmlAttribute.RuleEntry;
  'react/no-access-state-in-setstate': NoAccessStateInSetstate.RuleEntry;
  'react/no-adjacent-inline-elements': NoAdjacentInlineElements.RuleEntry;
  'react/no-array-index-key': NoArrayIndexKey.RuleEntry;
  'react/no-arrow-function-lifecycle': NoArrowFunctionLifecycle.RuleEntry;
  'react/no-children-prop': NoChildrenProp.RuleEntry;
  'react/no-danger': NoDanger.RuleEntry;
  'react/no-danger-with-children': NoDangerWithChildren.RuleEntry;
  'react/no-deprecated': NoDeprecated.RuleEntry;
  'react/no-did-mount-set-state': NoDidMountSetState.RuleEntry;
  'react/no-did-update-set-state': NoDidUpdateSetState.RuleEntry;
  'react/no-direct-mutation-state': NoDirectMutationState.RuleEntry;
  'react/no-find-dom-node': NoFindDomNode.RuleEntry;
  'react/no-is-mounted': NoIsMounted.RuleEntry;
  'react/no-multi-comp': NoMultiComp.RuleEntry;
  'react/no-namespace': NoNamespace.RuleEntry;
  'react/no-set-state': NoSetState.RuleEntry;
  'react/no-string-refs': NoStringRefs.RuleEntry;
  'react/no-redundant-should-component-update': NoRedundantShouldComponentUpdate.RuleEntry;
  'react/no-render-return-value': NoRenderReturnValue.RuleEntry;
  'react/no-this-in-sfc': NoThisInSfc.RuleEntry;
  'react/no-typos': NoTypos.RuleEntry;
  'react/no-unescaped-entities': NoUnescapedEntities.RuleEntry;
  'react/no-unknown-property': NoUnknownProperty.RuleEntry;
  'react/no-unsafe': NoUnsafe.RuleEntry;
  'react/no-unstable-nested-components': NoUnstableNestedComponents.RuleEntry;
  'react/no-unused-class-component-methods': NoUnusedClassComponentMethods.RuleEntry;
  'react/no-unused-prop-types': NoUnusedPropTypes.RuleEntry;
  'react/no-unused-state': NoUnusedState.RuleEntry;
  'react/no-object-type-as-default-prop': NoObjectTypeAsDefaultProp.RuleEntry;
  'react/no-will-update-set-state': NoWillUpdateSetState.RuleEntry;
  'react/prefer-es6-class': PreferEs6Class.RuleEntry;
  'react/prefer-exact-props': PreferExactProps.RuleEntry;
  'react/prefer-read-only-props': PreferReadOnlyProps.RuleEntry;
  'react/prefer-stateless-function': PreferStatelessFunction.RuleEntry;
  'react/prop-types': PropTypes.RuleEntry;
  'react/react-in-jsx-scope': ReactInJsxScope.RuleEntry;
  'react/require-default-props': RequireDefaultProps.RuleEntry;
  'react/require-optimization': RequireOptimization.RuleEntry;
  'react/require-render-return': RequireRenderReturn.RuleEntry;
  'react/self-closing-comp': SelfClosingComp.RuleEntry;
  'react/sort-comp': SortComp.RuleEntry;
  'react/sort-default-props': SortDefaultProps.RuleEntry;
  'react/sort-prop-types': SortPropTypes.RuleEntry;
  'react/state-in-constructor': StateInConstructor.RuleEntry;
  'react/static-property-placement': StaticPropertyPlacement.RuleEntry;
  'react/style-prop-object': StylePropObject.RuleEntry;
  'react/void-dom-elements-no-children': VoidDomElementsNoChildren.RuleEntry;

  // deprecated
  'react/jsx-sort-default-props': JsxSortDefaultProps.RuleEntry;
  'react/jsx-space-before-closing': JsxSpaceBeforeClosing.RuleEntry;
}>;

export type EslintReactRulesOption = Readonly<{
  'react/boolean-prop-naming': BooleanPropNaming.Options;
  'react/button-has-type': ButtonHasType.Options;
  'react/checked-requires-onchange-or-readonly': CheckedRequiresOnchangeOrReadonly.Options;
  'react/default-props-match-prop-types': DefaultPropsMatchPropTypes.Options;
  'react/destructuring-assignment': readonly [
    DestructuringAssignment.Options0,
    DestructuringAssignment.Options1,
  ];
  'react/display-name': DisplayName.Options;
  'react/forbid-component-props': ForbidComponentProps.Options;
  'react/forbid-dom-props': ForbidDomProps.Options;
  'react/forbid-elements': ForbidElements.Options;
  'react/forbid-foreign-prop-types': ForbidForeignPropTypes.Options;
  'react/forbid-prop-types': ForbidPropTypes.Options;
  'react/function-component-definition': FunctionComponentDefinition.Options;
  'react/hook-use-state': HookUseState.Options;
  'react/jsx-boolean-value': JsxBooleanValue.Options;
  'react/jsx-closing-bracket-location': JsxClosingBracketLocation.Options;
  'react/jsx-closing-tag-location': JsxClosingTagLocation.Options;
  'react/jsx-curly-spacing': JsxCurlySpacing.Options;
  'react/jsx-curly-newline': JsxCurlyNewline.Options;
  'react/jsx-equals-spacing': JsxEqualsSpacing.Options;
  'react/jsx-filename-extension': JsxFilenameExtension.Options;
  'react/jsx-first-prop-new-line': JsxFirstPropNewLine.Options;
  'react/jsx-handler-names': JsxHandlerNames.Options;
  'react/jsx-indent': readonly [JsxIndent.Options0, JsxIndent.Options1];
  'react/jsx-indent-props': JsxIndentProps.Options;
  'react/jsx-key': JsxKey.Options;
  'react/jsx-max-depth': JsxMaxDepth.Options;
  'react/jsx-max-props-per-line': JsxMaxPropsPerLine.Options;
  'react/jsx-newline': JsxNewline.Options;
  'react/jsx-no-bind': JsxNoBind.Options;
  'react/jsx-no-duplicate-props': JsxNoDuplicateProps.Options;
  'react/jsx-no-leaked-render': JsxNoLeakedRender.Options;
  'react/jsx-no-literals': JsxNoLiterals.Options;
  'react/jsx-no-script-url': JsxNoScriptUrl.Options;
  'react/jsx-no-target-blank': JsxNoTargetBlank.Options;
  'react/jsx-no-useless-fragment': JsxNoUselessFragment.Options;
  'react/jsx-one-expression-per-line': JsxOneExpressionPerLine.Options;
  'react/jsx-no-undef': JsxNoUndef.Options;
  'react/jsx-curly-brace-presence': JsxCurlyBracePresence.Options;
  'react/jsx-pascal-case': JsxPascalCase.Options;
  'react/jsx-fragments': JsxFragments.Options;
  'react/jsx-props-no-spreading': JsxPropsNoSpreading.Options;
  'react/jsx-sort-props': JsxSortProps.Options;
  'react/jsx-tag-spacing': JsxTagSpacing.Options;
  'react/jsx-wrap-multilines': JsxWrapMultilines.Options;
  'react/no-invalid-html-attribute': NoInvalidHtmlAttribute.Options;
  'react/no-children-prop': NoChildrenProp.Options;
  'react/no-danger': NoDanger.Options;
  'react/no-did-mount-set-state': NoDidMountSetState.Options;
  'react/no-did-update-set-state': NoDidUpdateSetState.Options;
  'react/no-multi-comp': NoMultiComp.Options;
  'react/no-string-refs': NoStringRefs.Options;
  'react/no-unescaped-entities': NoUnescapedEntities.Options;
  'react/no-unknown-property': NoUnknownProperty.Options;
  'react/no-unsafe': NoUnsafe.Options;
  'react/no-unstable-nested-components': NoUnstableNestedComponents.Options;
  'react/no-unused-prop-types': NoUnusedPropTypes.Options;
  'react/no-will-update-set-state': NoWillUpdateSetState.Options;
  'react/prefer-es6-class': PreferEs6Class.Options;
  'react/prefer-stateless-function': PreferStatelessFunction.Options;
  'react/prop-types': PropTypes.Options;
  'react/require-default-props': RequireDefaultProps.Options;
  'react/require-optimization': RequireOptimization.Options;
  'react/self-closing-comp': SelfClosingComp.Options;
  'react/sort-comp': SortComp.Options;
  'react/sort-default-props': SortDefaultProps.Options;
  'react/sort-prop-types': SortPropTypes.Options;
  'react/state-in-constructor': StateInConstructor.Options;
  'react/static-property-placement': readonly [
    StaticPropertyPlacement.Options0,
    StaticPropertyPlacement.Options1,
  ];
  'react/style-prop-object': StylePropObject.Options;
}>;
