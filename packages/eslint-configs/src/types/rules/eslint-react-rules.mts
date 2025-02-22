/* cSpell:disable */
import { type Linter } from 'eslint';
import { type RuleSeverityWithDefaultOption } from '../rule-severity-branded.mjs';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Enforces consistent naming for boolean props
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/boolean-prop-naming.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
  export type Options = {
    /** @minItems 1 */
    readonly propTypeNames?: readonly [string, ...(readonly string[])];
    readonly rule?: string;
    readonly message?: string;
    readonly validateNested?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow usage of `button` elements without an explicit `type` attribute
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/button-has-type.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | deprecated  | false           |
 *  | category    | Possible Errors |
 *  | recommended | false           |
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
  export type Options = {
    readonly button?: boolean;
    readonly submit?: boolean;
    readonly reset?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce using `onChange` or `readonly` attribute when `checked` is used
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/checked-requires-onchange-or-readonly.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
  export type Options = {
    readonly ignoreMissingProperties?: boolean;
    readonly ignoreExclusiveCheckedAttribute?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce all defaultProps have a corresponding non-required PropType
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/default-props-match-prop-types.md
 *
 *  ```md
 *  | key        | value          |
 *  | :--------- | :------------- |
 *  | deprecated | false          |
 *  | category   | Best Practices |
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
  export type Options = {
    readonly allowRequiredDefaults?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent usage of destructuring assignment of props, state, and
 * context
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/destructuring-assignment.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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

  export type Options1 = {
    readonly ignoreClassFields?: boolean;
    readonly destructureInSignature?: 'always' | 'ignore';
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

/**
 * Disallow missing displayName in a React component definition
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/display-name.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | true           |
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
  export type Options = {
    readonly ignoreTranspilerName?: boolean;
    readonly checkContextObjects?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow certain props on components
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/forbid-component-props.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
  export type Options = {
    readonly forbid?: readonly (
      | UnknownRecord
      | string
      | {
          readonly propName?: string;
          readonly allowedFor?: readonly string[];
          readonly allowedForPatterns?: readonly string[];
          readonly message?: string;
        }
      | {
          readonly propNamePattern?: string;
          readonly allowedFor?: readonly string[];
          readonly allowedForPatterns?: readonly string[];
          readonly message?: string;
        }
    )[];
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow certain props on DOM Nodes
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/forbid-dom-props.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
  export type Options = {
    readonly forbid?: readonly (
      | string
      | {
          readonly propName?: string;
          readonly disallowedFor?: readonly string[];
          readonly message?: string;
          readonly [k: string]: unknown;
        }
    )[];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow certain elements
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/forbid-elements.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
  export type Options = {
    readonly forbid?: readonly (
      | string
      | {
          readonly element: string;
          readonly message?: string;
        }
    )[];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow using another component's propTypes
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/forbid-foreign-prop-types.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
  export type Options = {
    readonly allowInPropTypes?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow certain propTypes
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/forbid-prop-types.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
  export type Options = {
    readonly forbid?: readonly string[];
    readonly checkContextTypes?: boolean;
    readonly checkChildContextTypes?: boolean;
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require all forwardRef components include a ref parameter
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/forward-ref-uses-ref.md
 *
 *  ```md
 *  | key            | value           |
 *  | :------------- | :-------------- |
 *  | type           | suggestion      |
 *  | deprecated     | false           |
 *  | hasSuggestions | true            |
 *  | category       | Possible Errors |
 *  | recommended    | false           |
 *  ```
 */
namespace ForwardRefUsesRef {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce a specific function type for function components
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/function-component-definition.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
  export type Options = {
    readonly namedComponents?:
      | readonly (
          | 'arrow-function'
          | 'function-declaration'
          | 'function-expression'
        )[]
      | 'arrow-function'
      | 'function-declaration'
      | 'function-expression';
    readonly unnamedComponents?:
      | readonly ('arrow-function' | 'function-expression')[]
      | 'arrow-function'
      | 'function-expression';
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Ensure destructuring and symmetric naming of useState hook value and setter
 * variables
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/hook-use-state.md
 *
 *  ```md
 *  | key            | value          |
 *  | :------------- | :------------- |
 *  | type           | suggestion     |
 *  | deprecated     | false          |
 *  | hasSuggestions | true           |
 *  | category       | Best Practices |
 *  | recommended    | false          |
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
  export type Options = {
    readonly allowDestructuredState?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce sandbox attribute on iframe elements
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/iframe-missing-sandbox.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
 *  ```
 */
namespace IframeMissingSandbox {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce boolean attributes notation in JSX
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-boolean-value.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 *  ```
 */
namespace JsxBooleanValue {
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
   *       "additionalItems": false
   *     },
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["always"]
   *         },
   *         {
   *           "type": "object",
   *           "additionalProperties": false,
   *           "properties": {
   *             "never": {
   *               "type": "array",
   *               "items": {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               "uniqueItems": true
   *             },
   *             "assumeUndefinedIsFalse": {
   *               "type": "boolean"
   *             }
   *           }
   *         }
   *       ],
   *       "additionalItems": false
   *     },
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["never"]
   *         },
   *         {
   *           "type": "object",
   *           "additionalProperties": false,
   *           "properties": {
   *             "always": {
   *               "type": "array",
   *               "items": {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               "uniqueItems": true
   *             },
   *             "assumeUndefinedIsFalse": {
   *               "type": "boolean"
   *             }
   *           }
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
          readonly never?: readonly string[];
          readonly assumeUndefinedIsFalse?: boolean;
        },
      ]
    | readonly [
        'never',
        {
          readonly always?: readonly string[];
          readonly assumeUndefinedIsFalse?: boolean;
        },
      ]
    | readonly ['always' | 'never']
    | readonly ['always']
    | readonly ['never']
    | readonly [];

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce or disallow spaces inside of curly braces in JSX attributes and
 * expressions
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-child-element-spacing.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 *  ```
 */
namespace JsxChildElementSpacing {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce closing bracket location in JSX
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-closing-bracket-location.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce closing tag location for multiline JSX
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-closing-tag-location.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | whitespace       |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
    | 'line-aligned'
    | 'tag-aligned'
    | {
        readonly location?: 'line-aligned' | 'tag-aligned';
      };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce or disallow spaces inside of curly braces in JSX attributes and
 * expressions
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-curly-spacing.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 *  ```
 */
namespace JsxCurlySpacing {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "definitions": {
   *     "basicConfig": {
   *       "type": "object",
   *       "properties": {
   *         "when": {
   *           "enum": ["always", "never"]
   *         },
   *         "allowMultiline": {
   *           "type": "boolean"
   *         },
   *         "spacing": {
   *           "type": "object",
   *           "properties": {
   *             "objectLiterals": {
   *               "enum": ["always", "never"]
   *             }
   *           }
   *         }
   *       }
   *     },
   *     "basicConfigOrBoolean": {
   *       "anyOf": [
   *         {
   *           "$ref": "#/definitions/basicConfig"
   *         },
   *         {
   *           "type": "boolean"
   *         }
   *       ]
   *     }
   *   },
   *   "type": "array",
   *   "items": [
   *     {
   *       "anyOf": [
   *         {
   *           "allOf": [
   *             {
   *               "$ref": "#/definitions/basicConfig"
   *             },
   *             {
   *               "type": "object",
   *               "properties": {
   *                 "attributes": {
   *                   "$ref": "#/definitions/basicConfigOrBoolean"
   *                 },
   *                 "children": {
   *                   "$ref": "#/definitions/basicConfigOrBoolean"
   *                 }
   *               }
   *             }
   *           ]
   *         },
   *         {
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
   *               "enum": ["always", "never"]
   *             }
   *           }
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
          | (BasicConfig & {
              readonly attributes?: BasicConfigOrBoolean;
              readonly children?: BasicConfigOrBoolean;
              readonly [k: string]: unknown;
            })
          | ('always' | 'never')
        ),
        {
          readonly allowMultiline?: boolean;
          readonly spacing?: {
            readonly objectLiterals?: 'always' | 'never';
            readonly [k: string]: unknown;
          };
        },
      ]
    | readonly [
        | (BasicConfig & {
            readonly attributes?: BasicConfigOrBoolean;
            readonly children?: BasicConfigOrBoolean;
            readonly [k: string]: unknown;
          })
        | ('always' | 'never'),
      ]
    | readonly [];
  export type BasicConfigOrBoolean = BasicConfig | boolean;

  export type BasicConfig = {
    readonly when?: 'always' | 'never';
    readonly allowMultiline?: boolean;
    readonly spacing?: {
      readonly objectLiterals?: 'always' | 'never';
      readonly [k: string]: unknown;
    };
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent linebreaks in curly braces in JSX attributes and
 * expressions
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-curly-newline.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | type        | layout           |
 *  | deprecated  | false            |
 *  | fixable     | whitespace       |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
    | 'consistent'
    | 'never'
    | {
        readonly singleline?: 'consistent' | 'forbid' | 'require';
        readonly multiline?: 'consistent' | 'forbid' | 'require';
      };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce or disallow spaces around equal signs in JSX attributes
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-equals-spacing.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow file extensions that may contain JSX
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-filename-extension.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
  export type Options = {
    readonly allow?: 'always' | 'as-needed';
    readonly extensions?: readonly string[];
    readonly ignoreFilesWithoutCode?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce proper position of the first property in JSX
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-first-prop-new-line.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
    | 'multiline-multiprop'
    | 'multiline'
    | 'multiprop'
    | 'never';

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce event handler naming conventions in JSX
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-handler-names.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
  export type Options =
    | {
        readonly checkInlineFunction?: boolean;
      }
    | {
        readonly checkLocalVariables?: boolean;
      }
    | {
        readonly eventHandlerPrefix?: false;
        readonly eventHandlerPropPrefix?: string;
        readonly checkLocalVariables?: boolean;
        readonly checkInlineFunction?: boolean;
        readonly ignoreComponentNames?: readonly string[];
      }
    | {
        readonly eventHandlerPrefix?: string;
        readonly eventHandlerPropPrefix?: false;
        readonly checkLocalVariables?: boolean;
        readonly checkInlineFunction?: boolean;
        readonly ignoreComponentNames?: readonly string[];
      }
    | {
        readonly eventHandlerPrefix?: string;
        readonly eventHandlerPropPrefix?: string;
        readonly checkLocalVariables?: boolean;
        readonly checkInlineFunction?: boolean;
        readonly ignoreComponentNames?: readonly string[];
      }
    | {
        readonly ignoreComponentNames?: readonly string[];
        readonly [k: string]: unknown;
      };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce JSX indentation
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-indent.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | whitespace       |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
  export type Options0 = number | 'tab';

  export type Options1 = {
    readonly checkAttributes?: boolean;
    readonly indentLogicalExpressions?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

/**
 * Enforce props indentation in JSX
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-indent-props.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
    | number
    | 'first'
    | 'tab'
    | {
        readonly indentMode?: number | 'first' | 'tab';
        readonly ignoreTernaryOperator?: boolean;
        readonly [k: string]: unknown;
      };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow missing `key` props in iterators/collection literals
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-key.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | deprecated  | false           |
 *  | category    | Possible Errors |
 *  | recommended | true            |
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
  export type Options = {
    readonly checkFragmentShorthand?: boolean;
    readonly checkKeyMustBeforeSpread?: boolean;
    readonly warnOnDuplicates?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce JSX maximum depth
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-max-depth.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
  export type Options = {
    readonly max?: number;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce maximum of props on a single line in JSX
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-max-props-per-line.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
  export type Options =
    | {
        readonly maximum?: {
          readonly single?: number;
          readonly multi?: number;
          readonly [k: string]: unknown;
        };
      }
    | {
        readonly maximum?: number;
        readonly when?: 'always' | 'multiline';
      };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require or prevent a new line after jsx elements and expressions.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-newline.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow `.bind()` or arrow functions in JSX props
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-no-bind.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
  export type Options = {
    readonly allowArrowFunctions?: boolean;
    readonly allowBind?: boolean;
    readonly allowFunctions?: boolean;
    readonly ignoreRefs?: boolean;
    readonly ignoreDOMComponents?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow comments from being inserted as text nodes
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-no-comment-textnodes.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | deprecated  | false           |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 *  ```
 */
namespace JsxNoCommentTextnodes {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallows JSX context provider values from taking values that will cause
 * needless rerenders
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-no-constructed-context-values.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
 *  ```
 */
namespace JsxNoConstructedContextValues {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow duplicate properties in JSX
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-no-duplicate-props.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | deprecated  | false           |
 *  | category    | Possible Errors |
 *  | recommended | true            |
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
  export type Options = {
    readonly ignoreCase?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow problematic leaked values from being rendered
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-no-leaked-render.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | deprecated  | false           |
 *  | fixable     | code            |
 *  | category    | Possible Errors |
 *  | recommended | false           |
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
  export type Options = {
    readonly validStrategies?: readonly ('coerce' | 'ternary')[];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow usage of string literals in JSX
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-no-literals.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
  export type Options = {
    readonly elementOverrides?: Record<
      string,
      {
        readonly applyToNestedElements?: boolean;
        readonly noStrings?: boolean;
        readonly allowedStrings?: readonly string[];
        readonly ignoreProps?: boolean;
        readonly noAttributeStrings?: boolean;
        readonly [k: string]: unknown;
      }
    >;
    readonly noStrings?: boolean;
    readonly allowedStrings?: readonly string[];
    readonly ignoreProps?: boolean;
    readonly noAttributeStrings?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow usage of `javascript:` URLs
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-no-script-url.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
 *  ```
 */
namespace JsxNoScriptUrl {
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
   *           "type": "array",
   *           "uniqueItems": true,
   *           "items": {
   *             "type": "object",
   *             "properties": {
   *               "name": {
   *                 "type": "string"
   *               },
   *               "props": {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "uniqueItems": true
   *                 }
   *               }
   *             },
   *             "required": ["name", "props"],
   *             "additionalProperties": false
   *           }
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "includeFromSettings": {
   *               "type": "boolean"
   *             }
   *           },
   *           "additionalItems": false
   *         }
   *       ],
   *       "additionalItems": false
   *     },
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "type": "object",
   *           "properties": {
   *             "includeFromSettings": {
   *               "type": "boolean"
   *             }
   *           },
   *           "additionalItems": false
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
        {
          readonly includeFromSettings?: boolean;
          readonly [k: string]: unknown;
        },
      ]
    | readonly [
        readonly {
          readonly name: string;
          readonly props: readonly string[];
        }[],
        {
          readonly includeFromSettings?: boolean;
          readonly [k: string]: unknown;
        },
      ]
    | readonly [
        readonly {
          readonly name: string;
          readonly props: readonly string[];
        }[],
      ]
    | readonly [];

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow `target="_blank"` attribute without `rel="noreferrer"`
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-no-target-blank.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | true           |
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
  export type Options = {
    readonly allowReferrer?: boolean;
    readonly enforceDynamicLinks?: 'always' | 'never';
    readonly warnOnSpreadAttributes?: boolean;
    readonly links?: boolean;
    readonly forms?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow unnecessary fragments
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-no-useless-fragment.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | type        | suggestion      |
 *  | deprecated  | false           |
 *  | fixable     | code            |
 *  | category    | Possible Errors |
 *  | recommended | false           |
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
  export type Options = {
    readonly allowExpressions?: boolean;
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require one JSX element per line
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-one-expression-per-line.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | whitespace       |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
  export type Options = {
    readonly allow?: 'literal' | 'non-jsx' | 'none' | 'single-child';
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow undeclared variables in JSX
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-no-undef.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | deprecated  | false           |
 *  | category    | Possible Errors |
 *  | recommended | true            |
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
  export type Options = {
    readonly allowGlobals?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow unnecessary JSX expressions when literals alone are sufficient or
 * enforce JSX expressions on literals in JSX children or attributes
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-curly-brace-presence.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
    | {
        readonly props?: 'always' | 'ignore' | 'never';
        readonly children?: 'always' | 'ignore' | 'never';
        readonly propElementValues?: 'always' | 'ignore' | 'never';
      }
    | ('always' | 'ignore' | 'never');

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce PascalCase for user-defined JSX components
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-pascal-case.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
   *         "items": [
   *           {
   *             "type": "string"
   *           }
   *         ],
   *         "minItems": 0,
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
    /** @minItems 0 */
    readonly ignore?: readonly [] | readonly [string];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce shorthand or standard form for React fragments
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-fragments.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
  export type Options = 'element' | 'syntax';

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow multiple spaces between inline JSX props
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-props-no-multi-spaces.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 *  ```
 */
namespace JsxPropsNoMultiSpaces {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow JSX prop spreading
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-props-no-spreading.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
  export type Options = UnknownRecord & {
    readonly html?: 'enforce' | 'ignore';
    readonly custom?: 'enforce' | 'ignore';
    readonly explicitSpread?: 'enforce' | 'ignore';
    readonly exceptions?: readonly string[];
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow JSX prop spreading the same identifier multiple times
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-props-no-spread-multi.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
 *  ```
 */
namespace JsxPropsNoSpreadMulti {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce defaultProps declarations alphabetical sorting
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-sort-default-props.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | true             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
 * Enforce props alphabetical sorting
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-sort-props.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
  export type Options = {
    readonly callbacksLast?: boolean;
    readonly shorthandFirst?: boolean;
    readonly shorthandLast?: boolean;
    readonly multiline?: 'first' | 'ignore' | 'last';
    readonly ignoreCase?: boolean;
    readonly noSortAlphabetically?: boolean;
    readonly reservedFirst?: boolean | readonly unknown[];
    readonly locale?: string;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce spacing before closing bracket in JSX
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-space-before-closing.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | true             |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
 * Enforce whitespace in and around the JSX opening and closing brackets
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-tag-spacing.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | whitespace       |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow React to be incorrectly marked as unused
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-uses-react.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | true           |
 *  ```
 */
namespace JsxUsesReact {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow variables used in JSX to be incorrectly marked as unused
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-uses-vars.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | true           |
 *  ```
 */
namespace JsxUsesVars {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow missing parentheses around multiline JSX
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/jsx-wrap-multilines.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
  export type Options = {
    readonly declaration?:
      | 'ignore'
      | 'never'
      | 'parens-new-line'
      | 'parens'
      | false
      | true;
    readonly assignment?:
      | 'ignore'
      | 'never'
      | 'parens-new-line'
      | 'parens'
      | false
      | true;
    readonly return?:
      | 'ignore'
      | 'never'
      | 'parens-new-line'
      | 'parens'
      | false
      | true;
    readonly arrow?:
      | 'ignore'
      | 'never'
      | 'parens-new-line'
      | 'parens'
      | false
      | true;
    readonly condition?:
      | 'ignore'
      | 'never'
      | 'parens-new-line'
      | 'parens'
      | false
      | true;
    readonly logical?:
      | 'ignore'
      | 'never'
      | 'parens-new-line'
      | 'parens'
      | false
      | true;
    readonly prop?:
      | 'ignore'
      | 'never'
      | 'parens-new-line'
      | 'parens'
      | false
      | true;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow usage of invalid attributes
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-invalid-html-attribute.md
 *
 *  ```md
 *  | key            | value           |
 *  | :------------- | :-------------- |
 *  | type           | suggestion      |
 *  | deprecated     | false           |
 *  | hasSuggestions | true            |
 *  | category       | Possible Errors |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow when this.state is accessed within setState
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-access-state-in-setstate.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | deprecated  | false           |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 *  ```
 */
namespace NoAccessStateInSetstate {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow adjacent inline elements not separated by whitespace.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-adjacent-inline-elements.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
 *  ```
 */
namespace NoAdjacentInlineElements {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow usage of Array index in keys
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-array-index-key.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
 *  ```
 */
namespace NoArrayIndexKey {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Lifecycle methods should be methods on the prototype, not class fields
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-arrow-function-lifecycle.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | false          |
 *  ```
 */
namespace NoArrowFunctionLifecycle {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow passing of children as props
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-children-prop.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | true           |
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
  export type Options = {
    readonly allowFunctions?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow usage of dangerous JSX properties
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-danger.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
  export type Options = {
    /** @minItems 0 */
    readonly customComponentNames?: readonly string[];
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow when a DOM element is using both children and
 * dangerouslySetInnerHTML
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-danger-with-children.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | deprecated  | false           |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 *  ```
 */
namespace NoDangerWithChildren {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow usage of deprecated methods
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-deprecated.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | true           |
 *  ```
 */
namespace NoDeprecated {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow usage of setState in componentDidMount
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-did-mount-set-state.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow usage of setState in componentDidUpdate
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-did-update-set-state.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow direct mutation of this.state
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-direct-mutation-state.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | deprecated  | false           |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 *  ```
 */
namespace NoDirectMutationState {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow usage of findDOMNode
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-find-dom-node.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | true           |
 *  ```
 */
namespace NoFindDomNode {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow usage of isMounted
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-is-mounted.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | true           |
 *  ```
 */
namespace NoIsMounted {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow multiple component definition per file
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-multi-comp.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
  export type Options = {
    readonly ignoreStateless?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce that namespaces are not used in React elements
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-namespace.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | deprecated  | false           |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 *  ```
 */
namespace NoNamespace {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow usage of setState
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-set-state.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 *  ```
 */
namespace NoSetState {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow using string references
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-string-refs.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | true           |
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
  export type Options = {
    readonly noTemplateLiterals?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow usage of shouldComponentUpdate when extending React.PureComponent
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-redundant-should-component-update.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | deprecated  | false           |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 *  ```
 */
namespace NoRedundantShouldComponentUpdate {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow usage of the return value of ReactDOM.render
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-render-return-value.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | true           |
 *  ```
 */
namespace NoRenderReturnValue {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow `this` from being used in stateless functional components
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-this-in-sfc.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | deprecated  | false           |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 *  ```
 */
namespace NoThisInSfc {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow common typos
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-typos.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 *  ```
 */
namespace NoTypos {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow unescaped HTML entities from appearing in markup
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-unescaped-entities.md
 *
 *  ```md
 *  | key            | value           |
 *  | :------------- | :-------------- |
 *  | deprecated     | false           |
 *  | hasSuggestions | true            |
 *  | category       | Possible Errors |
 *  | recommended    | true            |
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
  export type Options = {
    readonly forbid?: readonly (
      | string
      | {
          readonly char?: string;
          readonly alternatives?: readonly string[];
          readonly [k: string]: unknown;
        }
    )[];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow usage of unknown DOM property
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-unknown-property.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | deprecated  | false           |
 *  | fixable     | code            |
 *  | category    | Possible Errors |
 *  | recommended | true            |
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
  export type Options = {
    readonly ignore?: readonly string[];
    readonly requireDataLowercase?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow usage of unsafe lifecycle methods
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-unsafe.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
  export type Options = {
    readonly checkAliases?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow creating unstable components inside components
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-unstable-nested-components.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | deprecated  | false           |
 *  | category    | Possible Errors |
 *  | recommended | false           |
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
  export type Options = {
    readonly customValidators?: readonly string[];
    readonly allowAsProps?: boolean;
    readonly propNamePattern?: string;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow declaring unused methods of component class
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-unused-class-component-methods.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
 *  ```
 */
namespace NoUnusedClassComponentMethods {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow definitions of unused propTypes
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-unused-prop-types.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
  export type Options = {
    readonly ignore?: readonly string[];
    readonly customValidators?: readonly string[];
    readonly skipShapeProps?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow definitions of unused state
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-unused-state.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
 *  ```
 */
namespace NoUnusedState {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow usage of referential-type variables as default param in functional
 * component
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-object-type-as-default-prop.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
 *  ```
 */
namespace NoObjectTypeAsDefaultProp {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow usage of setState in componentWillUpdate
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/no-will-update-set-state.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce ES5 or ES6 class for React Components
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/prefer-es6-class.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Prefer exact proptype definitions
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/prefer-exact-props.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | deprecated  | false           |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 *  ```
 */
namespace PreferExactProps {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce that props are read-only
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/prefer-read-only-props.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 *  ```
 */
namespace PreferReadOnlyProps {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce stateless components to be written as a pure function
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/prefer-stateless-function.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
  export type Options = {
    readonly ignorePureComponents?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow missing props validation in a React component definition
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/prop-types.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | true           |
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
  export type Options = {
    readonly ignore?: readonly string[];
    readonly customValidators?: readonly string[];
    readonly skipUndeclared?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow missing React when using JSX
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/react-in-jsx-scope.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | deprecated  | false           |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 *  ```
 */
namespace ReactInJsxScope {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce a defaultProps definition for every prop that is not a required prop
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/require-default-props.md
 *
 *  ```md
 *  | key        | value          |
 *  | :--------- | :------------- |
 *  | deprecated | false          |
 *  | category   | Best Practices |
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
  export type Options = {
    readonly forbidDefaultForRequired?: boolean;
    readonly classes?: 'defaultProps' | 'ignore';
    readonly functions?: 'defaultArguments' | 'defaultProps' | 'ignore';
    readonly ignoreFunctionalComponents?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce React components to have a shouldComponentUpdate method
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/require-optimization.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
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
  export type Options = {
    readonly allowDecorators?: readonly string[];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce ES5 or ES6 class for returning value in render function
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/require-render-return.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | deprecated  | false           |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 *  ```
 */
namespace RequireRenderReturn {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow extra closing tags for components without children
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/self-closing-comp.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
  export type Options = {
    readonly component?: boolean;
    readonly html?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce component methods order
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/sort-comp.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
  export type Options = {
    readonly order?: readonly string[];
    readonly groups?: Record<string, readonly string[]>;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce defaultProps declarations alphabetical sorting
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/sort-default-props.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
  export type Options = {
    readonly ignoreCase?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce propTypes declarations alphabetical sorting
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/sort-prop-types.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
  export type Options = {
    readonly requiredFirst?: boolean;
    readonly callbacksLast?: boolean;
    readonly ignoreCase?: boolean;
    readonly noSortAlphabetically?: boolean;
    readonly sortShapeProp?: boolean;
    readonly checkTypes?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce class component state initialization style
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/state-in-constructor.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforces where React component static properties should be positioned.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/static-property-placement.md
 *
 *  ```md
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | false            |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
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
    | 'property assignment'
    | 'static getter'
    | 'static public field';

  export type Options1 = {
    readonly propTypes?:
      | 'property assignment'
      | 'static getter'
      | 'static public field';
    readonly defaultProps?:
      | 'property assignment'
      | 'static getter'
      | 'static public field';
    readonly childContextTypes?:
      | 'property assignment'
      | 'static getter'
      | 'static public field';
    readonly contextTypes?:
      | 'property assignment'
      | 'static getter'
      | 'static public field';
    readonly contextType?:
      | 'property assignment'
      | 'static getter'
      | 'static public field';
    readonly displayName?:
      | 'property assignment'
      | 'static getter'
      | 'static public field';
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
}

/**
 * Enforce style prop value is an object
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/style-prop-object.md
 *
 *  ```md
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | deprecated  | false           |
 *  | category    | Possible Errors |
 *  | recommended | false           |
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
  export type Options = {
    readonly allow?: readonly string[];
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow void DOM elements (e.g. `<img />`, `<br />`) from receiving children
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-react/tree/master/docs/rules/void-dom-elements-no-children.md
 *
 *  ```md
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | deprecated  | false          |
 *  | category    | Best Practices |
 *  | recommended | false          |
 *  ```
 */
namespace VoidDomElementsNoChildren {
  export type RuleEntry = Linter.StringSeverity;
}

export type EslintReactRules = {
  readonly 'react/boolean-prop-naming': BooleanPropNaming.RuleEntry;
  readonly 'react/button-has-type': ButtonHasType.RuleEntry;
  readonly 'react/checked-requires-onchange-or-readonly': CheckedRequiresOnchangeOrReadonly.RuleEntry;
  readonly 'react/default-props-match-prop-types': DefaultPropsMatchPropTypes.RuleEntry;
  readonly 'react/destructuring-assignment': DestructuringAssignment.RuleEntry;
  readonly 'react/display-name': DisplayName.RuleEntry;
  readonly 'react/forbid-component-props': ForbidComponentProps.RuleEntry;
  readonly 'react/forbid-dom-props': ForbidDomProps.RuleEntry;
  readonly 'react/forbid-elements': ForbidElements.RuleEntry;
  readonly 'react/forbid-foreign-prop-types': ForbidForeignPropTypes.RuleEntry;
  readonly 'react/forbid-prop-types': ForbidPropTypes.RuleEntry;
  readonly 'react/forward-ref-uses-ref': ForwardRefUsesRef.RuleEntry;
  readonly 'react/function-component-definition': FunctionComponentDefinition.RuleEntry;
  readonly 'react/hook-use-state': HookUseState.RuleEntry;
  readonly 'react/iframe-missing-sandbox': IframeMissingSandbox.RuleEntry;
  readonly 'react/jsx-boolean-value': JsxBooleanValue.RuleEntry;
  readonly 'react/jsx-child-element-spacing': JsxChildElementSpacing.RuleEntry;
  readonly 'react/jsx-closing-bracket-location': JsxClosingBracketLocation.RuleEntry;
  readonly 'react/jsx-closing-tag-location': JsxClosingTagLocation.RuleEntry;
  readonly 'react/jsx-curly-spacing': JsxCurlySpacing.RuleEntry;
  readonly 'react/jsx-curly-newline': JsxCurlyNewline.RuleEntry;
  readonly 'react/jsx-equals-spacing': JsxEqualsSpacing.RuleEntry;
  readonly 'react/jsx-filename-extension': JsxFilenameExtension.RuleEntry;
  readonly 'react/jsx-first-prop-new-line': JsxFirstPropNewLine.RuleEntry;
  readonly 'react/jsx-handler-names': JsxHandlerNames.RuleEntry;
  readonly 'react/jsx-indent': JsxIndent.RuleEntry;
  readonly 'react/jsx-indent-props': JsxIndentProps.RuleEntry;
  readonly 'react/jsx-key': JsxKey.RuleEntry;
  readonly 'react/jsx-max-depth': JsxMaxDepth.RuleEntry;
  readonly 'react/jsx-max-props-per-line': JsxMaxPropsPerLine.RuleEntry;
  readonly 'react/jsx-newline': JsxNewline.RuleEntry;
  readonly 'react/jsx-no-bind': JsxNoBind.RuleEntry;
  readonly 'react/jsx-no-comment-textnodes': JsxNoCommentTextnodes.RuleEntry;
  readonly 'react/jsx-no-constructed-context-values': JsxNoConstructedContextValues.RuleEntry;
  readonly 'react/jsx-no-duplicate-props': JsxNoDuplicateProps.RuleEntry;
  readonly 'react/jsx-no-leaked-render': JsxNoLeakedRender.RuleEntry;
  readonly 'react/jsx-no-literals': JsxNoLiterals.RuleEntry;
  readonly 'react/jsx-no-script-url': JsxNoScriptUrl.RuleEntry;
  readonly 'react/jsx-no-target-blank': JsxNoTargetBlank.RuleEntry;
  readonly 'react/jsx-no-useless-fragment': JsxNoUselessFragment.RuleEntry;
  readonly 'react/jsx-one-expression-per-line': JsxOneExpressionPerLine.RuleEntry;
  readonly 'react/jsx-no-undef': JsxNoUndef.RuleEntry;
  readonly 'react/jsx-curly-brace-presence': JsxCurlyBracePresence.RuleEntry;
  readonly 'react/jsx-pascal-case': JsxPascalCase.RuleEntry;
  readonly 'react/jsx-fragments': JsxFragments.RuleEntry;
  readonly 'react/jsx-props-no-multi-spaces': JsxPropsNoMultiSpaces.RuleEntry;
  readonly 'react/jsx-props-no-spreading': JsxPropsNoSpreading.RuleEntry;
  readonly 'react/jsx-props-no-spread-multi': JsxPropsNoSpreadMulti.RuleEntry;
  readonly 'react/jsx-sort-props': JsxSortProps.RuleEntry;
  readonly 'react/jsx-tag-spacing': JsxTagSpacing.RuleEntry;
  readonly 'react/jsx-uses-react': JsxUsesReact.RuleEntry;
  readonly 'react/jsx-uses-vars': JsxUsesVars.RuleEntry;
  readonly 'react/jsx-wrap-multilines': JsxWrapMultilines.RuleEntry;
  readonly 'react/no-invalid-html-attribute': NoInvalidHtmlAttribute.RuleEntry;
  readonly 'react/no-access-state-in-setstate': NoAccessStateInSetstate.RuleEntry;
  readonly 'react/no-adjacent-inline-elements': NoAdjacentInlineElements.RuleEntry;
  readonly 'react/no-array-index-key': NoArrayIndexKey.RuleEntry;
  readonly 'react/no-arrow-function-lifecycle': NoArrowFunctionLifecycle.RuleEntry;
  readonly 'react/no-children-prop': NoChildrenProp.RuleEntry;
  readonly 'react/no-danger': NoDanger.RuleEntry;
  readonly 'react/no-danger-with-children': NoDangerWithChildren.RuleEntry;
  readonly 'react/no-deprecated': NoDeprecated.RuleEntry;
  readonly 'react/no-did-mount-set-state': NoDidMountSetState.RuleEntry;
  readonly 'react/no-did-update-set-state': NoDidUpdateSetState.RuleEntry;
  readonly 'react/no-direct-mutation-state': NoDirectMutationState.RuleEntry;
  readonly 'react/no-find-dom-node': NoFindDomNode.RuleEntry;
  readonly 'react/no-is-mounted': NoIsMounted.RuleEntry;
  readonly 'react/no-multi-comp': NoMultiComp.RuleEntry;
  readonly 'react/no-namespace': NoNamespace.RuleEntry;
  readonly 'react/no-set-state': NoSetState.RuleEntry;
  readonly 'react/no-string-refs': NoStringRefs.RuleEntry;
  readonly 'react/no-redundant-should-component-update': NoRedundantShouldComponentUpdate.RuleEntry;
  readonly 'react/no-render-return-value': NoRenderReturnValue.RuleEntry;
  readonly 'react/no-this-in-sfc': NoThisInSfc.RuleEntry;
  readonly 'react/no-typos': NoTypos.RuleEntry;
  readonly 'react/no-unescaped-entities': NoUnescapedEntities.RuleEntry;
  readonly 'react/no-unknown-property': NoUnknownProperty.RuleEntry;
  readonly 'react/no-unsafe': NoUnsafe.RuleEntry;
  readonly 'react/no-unstable-nested-components': NoUnstableNestedComponents.RuleEntry;
  readonly 'react/no-unused-class-component-methods': NoUnusedClassComponentMethods.RuleEntry;
  readonly 'react/no-unused-prop-types': NoUnusedPropTypes.RuleEntry;
  readonly 'react/no-unused-state': NoUnusedState.RuleEntry;
  readonly 'react/no-object-type-as-default-prop': NoObjectTypeAsDefaultProp.RuleEntry;
  readonly 'react/no-will-update-set-state': NoWillUpdateSetState.RuleEntry;
  readonly 'react/prefer-es6-class': PreferEs6Class.RuleEntry;
  readonly 'react/prefer-exact-props': PreferExactProps.RuleEntry;
  readonly 'react/prefer-read-only-props': PreferReadOnlyProps.RuleEntry;
  readonly 'react/prefer-stateless-function': PreferStatelessFunction.RuleEntry;
  readonly 'react/prop-types': PropTypes.RuleEntry;
  readonly 'react/react-in-jsx-scope': ReactInJsxScope.RuleEntry;
  readonly 'react/require-default-props': RequireDefaultProps.RuleEntry;
  readonly 'react/require-optimization': RequireOptimization.RuleEntry;
  readonly 'react/require-render-return': RequireRenderReturn.RuleEntry;
  readonly 'react/self-closing-comp': SelfClosingComp.RuleEntry;
  readonly 'react/sort-comp': SortComp.RuleEntry;
  readonly 'react/sort-default-props': SortDefaultProps.RuleEntry;
  readonly 'react/sort-prop-types': SortPropTypes.RuleEntry;
  readonly 'react/state-in-constructor': StateInConstructor.RuleEntry;
  readonly 'react/static-property-placement': StaticPropertyPlacement.RuleEntry;
  readonly 'react/style-prop-object': StylePropObject.RuleEntry;
  readonly 'react/void-dom-elements-no-children': VoidDomElementsNoChildren.RuleEntry;

  // deprecated
  readonly 'react/jsx-sort-default-props': JsxSortDefaultProps.RuleEntry;
  readonly 'react/jsx-space-before-closing': JsxSpaceBeforeClosing.RuleEntry;
};

export type EslintReactRulesOption = {
  readonly 'react/boolean-prop-naming': BooleanPropNaming.Options;
  readonly 'react/button-has-type': ButtonHasType.Options;
  readonly 'react/checked-requires-onchange-or-readonly': CheckedRequiresOnchangeOrReadonly.Options;
  readonly 'react/default-props-match-prop-types': DefaultPropsMatchPropTypes.Options;
  readonly 'react/destructuring-assignment': readonly [
    DestructuringAssignment.Options0,
    DestructuringAssignment.Options1,
  ];
  readonly 'react/display-name': DisplayName.Options;
  readonly 'react/forbid-component-props': ForbidComponentProps.Options;
  readonly 'react/forbid-dom-props': ForbidDomProps.Options;
  readonly 'react/forbid-elements': ForbidElements.Options;
  readonly 'react/forbid-foreign-prop-types': ForbidForeignPropTypes.Options;
  readonly 'react/forbid-prop-types': ForbidPropTypes.Options;
  readonly 'react/function-component-definition': FunctionComponentDefinition.Options;
  readonly 'react/hook-use-state': HookUseState.Options;
  readonly 'react/jsx-boolean-value': JsxBooleanValue.Options;
  readonly 'react/jsx-closing-bracket-location': JsxClosingBracketLocation.Options;
  readonly 'react/jsx-closing-tag-location': JsxClosingTagLocation.Options;
  readonly 'react/jsx-curly-spacing': JsxCurlySpacing.Options;
  readonly 'react/jsx-curly-newline': JsxCurlyNewline.Options;
  readonly 'react/jsx-equals-spacing': JsxEqualsSpacing.Options;
  readonly 'react/jsx-filename-extension': JsxFilenameExtension.Options;
  readonly 'react/jsx-first-prop-new-line': JsxFirstPropNewLine.Options;
  readonly 'react/jsx-handler-names': JsxHandlerNames.Options;
  readonly 'react/jsx-indent': readonly [
    JsxIndent.Options0,
    JsxIndent.Options1,
  ];
  readonly 'react/jsx-indent-props': JsxIndentProps.Options;
  readonly 'react/jsx-key': JsxKey.Options;
  readonly 'react/jsx-max-depth': JsxMaxDepth.Options;
  readonly 'react/jsx-max-props-per-line': JsxMaxPropsPerLine.Options;
  readonly 'react/jsx-newline': JsxNewline.Options;
  readonly 'react/jsx-no-bind': JsxNoBind.Options;
  readonly 'react/jsx-no-duplicate-props': JsxNoDuplicateProps.Options;
  readonly 'react/jsx-no-leaked-render': JsxNoLeakedRender.Options;
  readonly 'react/jsx-no-literals': JsxNoLiterals.Options;
  readonly 'react/jsx-no-script-url': JsxNoScriptUrl.Options;
  readonly 'react/jsx-no-target-blank': JsxNoTargetBlank.Options;
  readonly 'react/jsx-no-useless-fragment': JsxNoUselessFragment.Options;
  readonly 'react/jsx-one-expression-per-line': JsxOneExpressionPerLine.Options;
  readonly 'react/jsx-no-undef': JsxNoUndef.Options;
  readonly 'react/jsx-curly-brace-presence': JsxCurlyBracePresence.Options;
  readonly 'react/jsx-pascal-case': JsxPascalCase.Options;
  readonly 'react/jsx-fragments': JsxFragments.Options;
  readonly 'react/jsx-props-no-spreading': JsxPropsNoSpreading.Options;
  readonly 'react/jsx-sort-props': JsxSortProps.Options;
  readonly 'react/jsx-tag-spacing': JsxTagSpacing.Options;
  readonly 'react/jsx-wrap-multilines': JsxWrapMultilines.Options;
  readonly 'react/no-invalid-html-attribute': NoInvalidHtmlAttribute.Options;
  readonly 'react/no-children-prop': NoChildrenProp.Options;
  readonly 'react/no-danger': NoDanger.Options;
  readonly 'react/no-did-mount-set-state': NoDidMountSetState.Options;
  readonly 'react/no-did-update-set-state': NoDidUpdateSetState.Options;
  readonly 'react/no-multi-comp': NoMultiComp.Options;
  readonly 'react/no-string-refs': NoStringRefs.Options;
  readonly 'react/no-unescaped-entities': NoUnescapedEntities.Options;
  readonly 'react/no-unknown-property': NoUnknownProperty.Options;
  readonly 'react/no-unsafe': NoUnsafe.Options;
  readonly 'react/no-unstable-nested-components': NoUnstableNestedComponents.Options;
  readonly 'react/no-unused-prop-types': NoUnusedPropTypes.Options;
  readonly 'react/no-will-update-set-state': NoWillUpdateSetState.Options;
  readonly 'react/prefer-es6-class': PreferEs6Class.Options;
  readonly 'react/prefer-stateless-function': PreferStatelessFunction.Options;
  readonly 'react/prop-types': PropTypes.Options;
  readonly 'react/require-default-props': RequireDefaultProps.Options;
  readonly 'react/require-optimization': RequireOptimization.Options;
  readonly 'react/self-closing-comp': SelfClosingComp.Options;
  readonly 'react/sort-comp': SortComp.Options;
  readonly 'react/sort-default-props': SortDefaultProps.Options;
  readonly 'react/sort-prop-types': SortPropTypes.Options;
  readonly 'react/state-in-constructor': StateInConstructor.Options;
  readonly 'react/static-property-placement': readonly [
    StaticPropertyPlacement.Options0,
    StaticPropertyPlacement.Options1,
  ];
  readonly 'react/style-prop-object': StylePropObject.Options;
};
