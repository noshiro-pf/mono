/* eslint-disable @typescript-eslint/sort-type-union-intersection-members */
import type { Linter } from 'eslint';

type Prefixes<L extends readonly unknown[]> = L extends readonly [
  infer Head,
  ...infer Rest
]
  ? readonly [] | readonly [Head, ...Prefixes<Rest>]
  : readonly [];

/**
 * @description Enforces consistent naming for boolean props
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/boolean-prop-naming.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace BooleanPropNaming {
  /**
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
   */
  export type Options = {
    readonly propTypeNames?: readonly [string, ...(readonly string[])];
    readonly rule?: string;
    readonly message?: string;
    readonly validateNested?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Forbid "button" element without an explicit "type" attribute
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/button-has-type.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 */
namespace ButtonHasType {
  /**
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
   */
  export type Options = {
    readonly button?: boolean;
    readonly submit?: boolean;
    readonly reset?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Enforce all defaultProps are defined and not "required" in propTypes.
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/default-props-match-prop-types.md
 *
 *  | key      | value          |
 *  | :------- | :------------- |
 *  | category | Best Practices |
 */
namespace DefaultPropsMatchPropTypes {
  /**
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
   */
  export type Options = {
    readonly allowRequiredDefaults?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Enforce consistent usage of destructuring assignment of props, state, and context
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/destructuring-assignment.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace DestructuringAssignment {
  /**
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
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   */
  export type Options0 = 'always' | 'never';

  export type Options1 = {
    readonly ignoreClassFields?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0, ...Prefixes<readonly [Options1]>];
}

/**
 * @description Prevent missing displayName in a React component definition
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/display-name.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | true           |
 */
namespace DisplayName {
  /**
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreTranspilerName": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   */
  export type Options = {
    readonly ignoreTranspilerName?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Forbid certain props on components
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/forbid-component-props.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace ForbidComponentProps {
  /**
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "forbid": {
   *         "type": "array",
   *         "items": {
   *           "oneOf": [
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
   *                 "message": {
   *                   "type": "string"
   *                 }
   *               }
   *             }
   *           ]
   *         }
   *       }
   *     }
   *   }
   * ]
   */
  export type Options = {
    readonly forbid?: readonly (
      | string
      | {
          readonly propName?: string;
          readonly allowedFor?: readonly string[];
          readonly message?: string;
          readonly [k: string]: unknown;
        }
    )[];
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Forbid certain props on DOM Nodes
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/forbid-dom-props.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace ForbidDomProps {
  /**
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "forbid": {
   *         "type": "array",
   *         "items": {
   *           "oneOf": [
   *             {
   *               "type": "string"
   *             },
   *             {
   *               "type": "object",
   *               "properties": {
   *                 "propName": {
   *                   "type": "string"
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
   */
  export type Options = {
    readonly forbid?: readonly (
      | string
      | {
          readonly propName?: string;
          readonly message?: string;
          readonly [k: string]: unknown;
        }
    )[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Forbid certain elements
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/forbid-elements.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace ForbidElements {
  /**
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
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Forbid using another component's propTypes
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/forbid-foreign-prop-types.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace ForbidForeignPropTypes {
  /**
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
   */
  export type Options = {
    readonly allowInPropTypes?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Forbid certain propTypes
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/forbid-prop-types.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace ForbidPropTypes {
  /**
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
   */
  export type Options = {
    readonly forbid?: readonly string[];
    readonly checkContextTypes?: boolean;
    readonly checkChildContextTypes?: boolean;
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Standardize the way function component get defined
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/function-component-definition.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace FunctionComponentDefinition {
  /**
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "namedComponents": {
   *         "oneOf": [
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
   *         "oneOf": [
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
   */
  export type Options = {
    readonly namedComponents?:
      | ('function-declaration' | 'arrow-function' | 'function-expression')
      | readonly (
          | 'function-declaration'
          | 'arrow-function'
          | 'function-expression'
        )[];
    readonly unnamedComponents?:
      | ('arrow-function' | 'function-expression')
      | readonly ('arrow-function' | 'function-expression')[];
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Ensure symmetric naming of useState hook value and setter variables
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/hook-use-state.md
 *
 *  | key            | value          |
 *  | :------------- | :------------- |
 *  | type           | suggestion     |
 *  | hasSuggestions | true           |
 *  | category       | Best Practices |
 *  | recommended    | false          |
 */
namespace HookUseState {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce sandbox attribute on iframe elements
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/iframe-missing-sandbox.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace IframeMissingSandbox {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce boolean attributes notation in JSX
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-boolean-value.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxBooleanValue {
  /**
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
   *       "additionalItems": false
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
   *           "additionalProperties": false,
   *           "properties": {
   *             "never": {
   *               "type": "array",
   *               "items": {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               "uniqueItems": true
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
   *           "enum": [
   *             "never"
   *           ]
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
   *             }
   *           }
   *         }
   *       ],
   *       "additionalItems": false
   *     }
   *   ]
   * }
   */
  export type Options =
    | readonly []
    | readonly ['always' | 'never']
    | readonly []
    | readonly ['always']
    | readonly [
        'always',
        {
          readonly never?: readonly string[];
        }
      ]
    | readonly []
    | readonly ['never']
    | readonly [
        'never',
        {
          readonly always?: readonly string[];
        }
      ];

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Ensures inline tags are not rendered without spaces between them
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-child-element-spacing.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxChildElementSpacing {
  /**
   * [
   *   {
   *     "type": "object",
   *     "properties": {},
   *     "default": {},
   *     "additionalProperties": false
   *   }
   * ]
   */

  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Validate closing bracket location in JSX
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-closing-bracket-location.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxClosingBracketLocation {
  /**
   * [
   *   {
   *     "oneOf": [
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
   */
  export type Options =
    | ('after-props' | 'props-aligned' | 'tag-aligned' | 'line-aligned')
    | {
        readonly location?:
          | 'after-props'
          | 'props-aligned'
          | 'tag-aligned'
          | 'line-aligned';
      }
    | {
        readonly nonEmpty?:
          | 'after-props'
          | 'props-aligned'
          | 'tag-aligned'
          | 'line-aligned'
          | false;
        readonly selfClosing?:
          | 'after-props'
          | 'props-aligned'
          | 'tag-aligned'
          | 'line-aligned'
          | false;
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Validate closing tag location for multiline JSX
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-closing-tag-location.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | fixable     | whitespace       |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxClosingTagLocation {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce or disallow spaces inside of curly braces in JSX attributes
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-curly-spacing.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxCurlySpacing {
  /**
   * {
   *   "definitions": {
   *     "basicConfig": {
   *       "type": "object",
   *       "properties": {
   *         "when": {
   *           "enum": [
   *             "always",
   *             "never"
   *           ]
   *         },
   *         "allowMultiline": {
   *           "type": "boolean"
   *         },
   *         "spacing": {
   *           "type": "object",
   *           "properties": {
   *             "objectLiterals": {
   *               "enum": [
   *                 "always",
   *                 "never"
   *               ]
   *             }
   *           }
   *         }
   *       }
   *     },
   *     "basicConfigOrBoolean": {
   *       "oneOf": [
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
   *       "oneOf": [
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
   *           "enum": [
   *             "always",
   *             "never"
   *           ]
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
   *               "enum": [
   *                 "always",
   *                 "never"
   *               ]
   *             }
   *           }
   *         }
   *       },
   *       "additionalProperties": false
   *     }
   *   ]
   * }
   */
  export type Options =
    | readonly []
    | readonly [
        | (BasicConfig & {
            readonly attributes?: BasicConfigOrBoolean;
            readonly children?: BasicConfigOrBoolean;
            readonly [k: string]: unknown;
          })
        | ('always' | 'never')
      ]
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
        }
      ];
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
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Enforce consistent line breaks inside jsx curly
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-curly-newline.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | type        | layout           |
 *  | fixable     | whitespace       |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxCurlyNewline {
  /**
   * [
   *   {
   *     "oneOf": [
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
   */
  export type Options =
    | ('consistent' | 'never')
    | {
        readonly singleline?: 'consistent' | 'require' | 'forbid';
        readonly multiline?: 'consistent' | 'require' | 'forbid';
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Disallow or enforce spaces around equal signs in JSX attributes
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-equals-spacing.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxEqualsSpacing {
  /**
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   }
   * ]
   */
  export type Options = 'always' | 'never';

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Restrict file extensions that may contain JSX
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-filename-extension.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxFilenameExtension {
  /**
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
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   */
  export type Options = {
    readonly allow?: 'always' | 'as-needed';
    readonly extensions?: readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Ensure proper position of the first property in JSX
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-first-prop-new-line.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxFirstPropNewLine {
  /**
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never",
   *       "multiline",
   *       "multiline-multiprop"
   *     ]
   *   }
   * ]
   */
  export type Options =
    | 'always'
    | 'never'
    | 'multiline'
    | 'multiline-multiprop';

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Enforce event handler naming conventions in JSX
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-handler-names.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxHandlerNames {
  /**
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
   *       }
   *     ]
   *   }
   * ]
   */
  export type Options =
    | {
        readonly eventHandlerPrefix?: string;
        readonly eventHandlerPropPrefix?: string;
        readonly checkLocalVariables?: boolean;
        readonly checkInlineFunction?: boolean;
      }
    | {
        readonly eventHandlerPrefix?: string;
        readonly eventHandlerPropPrefix?: false;
        readonly checkLocalVariables?: boolean;
        readonly checkInlineFunction?: boolean;
      }
    | {
        readonly eventHandlerPrefix?: false;
        readonly eventHandlerPropPrefix?: string;
        readonly checkLocalVariables?: boolean;
        readonly checkInlineFunction?: boolean;
      }
    | {
        readonly checkLocalVariables?: boolean;
      }
    | {
        readonly checkInlineFunction?: boolean;
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Validate JSX indentation
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-indent.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | fixable     | whitespace       |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxIndent {
  /**
   * [
   *   {
   *     "oneOf": [
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
   */
  export type Options0 = 'tab' | number;

  export type Options1 = {
    readonly checkAttributes?: boolean;
    readonly indentLogicalExpressions?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0, ...Prefixes<readonly [Options1]>];
}

/**
 * @description Validate props indentation in JSX
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-indent-props.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxIndentProps {
  /**
   * [
   *   {
   *     "oneOf": [
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
   *             "oneOf": [
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
   */
  export type Options =
    | ('tab' | 'first')
    | number
    | {
        readonly indentMode?: ('tab' | 'first') | number;
        readonly ignoreTernaryOperator?: boolean;
        readonly [k: string]: unknown;
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Report missing `key` props in iterators/collection literals
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-key.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 */
namespace JsxKey {
  /**
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
   */
  export type Options = {
    readonly checkFragmentShorthand?: boolean;
    readonly checkKeyMustBeforeSpread?: boolean;
    readonly warnOnDuplicates?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Validate JSX maximum depth
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-max-depth.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxMaxDepth {
  /**
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
   */
  export type Options = {
    readonly max?: number;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Limit maximum of props on a single line in JSX
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-max-props-per-line.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxMaxPropsPerLine {
  /**
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
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Require or prevent a new line after jsx elements and expressions.
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-newline.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxNewline {
  /**
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "prevent": {
   *         "default": false,
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   */
  export type Options = {
    readonly prevent?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Prevents usage of Function.prototype.bind and arrow functions in React component props
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-no-bind.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace JsxNoBind {
  /**
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
   */
  export type Options = {
    readonly allowArrowFunctions?: boolean;
    readonly allowBind?: boolean;
    readonly allowFunctions?: boolean;
    readonly ignoreRefs?: boolean;
    readonly ignoreDOMComponents?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Comments inside children section of tag should be placed inside braces
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-no-comment-textnodes.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 */
namespace JsxNoCommentTextnodes {
  /**
   * [
   *   {
   *     "type": "object",
   *     "properties": {},
   *     "additionalProperties": false
   *   }
   * ]
   */

  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevents JSX context provider values from taking values that will cause needless rerenders.
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-no-constructed-context-values.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace JsxNoConstructedContextValues {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce no duplicate props
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-no-duplicate-props.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 */
namespace JsxNoDuplicateProps {
  /**
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
   */
  export type Options = {
    readonly ignoreCase?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Prevent using string literals in React component definition
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-no-literals.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxNoLiterals {
  /**
   * [
   *   {
   *     "type": "object",
   *     "properties": {
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
   */
  export type Options = {
    readonly noStrings?: boolean;
    readonly allowedStrings?: readonly string[];
    readonly ignoreProps?: boolean;
    readonly noAttributeStrings?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Forbid `javascript:` URLs
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-no-script-url.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace JsxNoScriptUrl {
  /**
   * [
   *   {
   *     "type": "array",
   *     "uniqueItems": true,
   *     "items": {
   *       "type": "object",
   *       "properties": {
   *         "name": {
   *           "type": "string"
   *         },
   *         "props": {
   *           "type": "array",
   *           "items": {
   *             "type": "string",
   *             "uniqueItems": true
   *           }
   *         }
   *       },
   *       "required": [
   *         "name",
   *         "props"
   *       ],
   *       "additionalProperties": false
   *     }
   *   }
   * ]
   */
  export type Options = readonly {
    readonly name: string;
    readonly props: readonly string[];
  }[];

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Forbid `target="_blank"` attribute without `rel="noreferrer"`
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-no-target-blank.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | true           |
 */
namespace JsxNoTargetBlank {
  /**
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
   */
  export type Options = {
    readonly allowReferrer?: boolean;
    readonly enforceDynamicLinks?: 'always' | 'never';
    readonly warnOnSpreadAttributes?: boolean;
    readonly links?: boolean;
    readonly forms?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Disallow unnecessary fragments
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-no-useless-fragment.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | type        | suggestion      |
 *  | fixable     | code            |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 */
namespace JsxNoUselessFragment {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Limit to one expression per line in JSX
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-one-expression-per-line.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | fixable     | whitespace       |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxOneExpressionPerLine {
  /**
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allow": {
   *         "enum": [
   *           "none",
   *           "literal",
   *           "single-child"
   *         ]
   *       }
   *     },
   *     "default": {
   *       "allow": "none"
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   */
  export type Options = {
    readonly allow?: 'none' | 'literal' | 'single-child';
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Disallow undeclared variables in JSX
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-no-undef.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 */
namespace JsxNoUndef {
  /**
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
   */
  export type Options = {
    readonly allowGlobals?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Disallow unnecessary JSX expressions when literals alone are sufficient or enfore JSX expressions on literals in JSX children or attributes
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-curly-brace-presence.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxCurlyBracePresence {
  /**
   * [
   *   {
   *     "oneOf": [
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
   */
  export type Options =
    | {
        readonly props?: 'always' | 'never' | 'ignore';
        readonly children?: 'always' | 'never' | 'ignore';
        readonly propElementValues?: 'always' | 'never' | 'ignore';
      }
    | ('always' | 'never' | 'ignore');

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Enforce PascalCase for user-defined JSX components
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-pascal-case.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxPascalCase {
  /**
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
   */
  export type Options = {
    readonly allowAllCaps?: boolean;
    readonly allowLeadingUnderscore?: boolean;
    readonly allowNamespace?: boolean;
    readonly ignore?: readonly [] | readonly [string];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Enforce shorthand or standard form for React fragments
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-fragments.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxFragments {
  /**
   * [
   *   {
   *     "enum": [
   *       "syntax",
   *       "element"
   *     ]
   *   }
   * ]
   */
  export type Options = 'syntax' | 'element';

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Disallow multiple spaces between inline JSX props
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-props-no-multi-spaces.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxPropsNoMultiSpaces {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent JSX prop spreading
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-props-no-spreading.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace JsxPropsNoSpreading {
  /**
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
   */
  export type Options = {
    readonly html?: 'enforce' | 'ignore';
    readonly custom?: 'enforce' | 'ignore';
    readonly exceptions?: readonly string[];
    readonly [k: string]: unknown;
  } & Record<string, unknown>;

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Enforce default props alphabetical sorting
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-sort-default-props.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxSortDefaultProps {
  /**
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
   */
  export type Options = {
    readonly ignoreCase?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Enforce props alphabetical sorting
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-sort-props.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxSortProps {
  /**
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
   */
  export type Options = {
    readonly callbacksLast?: boolean;
    readonly shorthandFirst?: boolean;
    readonly shorthandLast?: boolean;
    readonly multiline?: 'ignore' | 'first' | 'last';
    readonly ignoreCase?: boolean;
    readonly noSortAlphabetically?: boolean;
    readonly reservedFirst?: readonly unknown[] | boolean;
    readonly locale?: string;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Validate spacing before closing bracket in JSX
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-space-before-closing.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | deprecated  | true             |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxSpaceBeforeClosing {
  /**
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   }
   * ]
   */
  export type RuleEntry = 'off';
}

/**
 * @description Validate whitespace in and around the JSX opening and closing brackets
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-tag-spacing.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | fixable     | whitespace       |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxTagSpacing {
  /**
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
   */
  export type Options = {
    readonly closingSlash?: 'always' | 'never' | 'allow';
    readonly beforeSelfClosing?: 'always' | 'never' | 'allow';
    readonly afterOpening?: 'always' | 'allow-multiline' | 'never' | 'allow';
    readonly beforeClosing?: 'always' | 'never' | 'allow';
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Prevent React to be marked as unused
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-uses-react.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | true           |
 */
namespace JsxUsesReact {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent variables used in JSX to be marked as unused
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-uses-vars.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | true           |
 */
namespace JsxUsesVars {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent missing parentheses around multilines JSX
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/jsx-wrap-multilines.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace JsxWrapMultilines {
  /**
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
   *           "parens-new-line"
   *         ]
   *       },
   *       "assignment": {
   *         "enum": [
   *           true,
   *           false,
   *           "ignore",
   *           "parens",
   *           "parens-new-line"
   *         ]
   *       },
   *       "return": {
   *         "enum": [
   *           true,
   *           false,
   *           "ignore",
   *           "parens",
   *           "parens-new-line"
   *         ]
   *       },
   *       "arrow": {
   *         "enum": [
   *           true,
   *           false,
   *           "ignore",
   *           "parens",
   *           "parens-new-line"
   *         ]
   *       },
   *       "condition": {
   *         "enum": [
   *           true,
   *           false,
   *           "ignore",
   *           "parens",
   *           "parens-new-line"
   *         ]
   *       },
   *       "logical": {
   *         "enum": [
   *           true,
   *           false,
   *           "ignore",
   *           "parens",
   *           "parens-new-line"
   *         ]
   *       },
   *       "prop": {
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
   */
  export type Options = {
    readonly declaration?:
      | true
      | false
      | 'ignore'
      | 'parens'
      | 'parens-new-line';
    readonly assignment?:
      | true
      | false
      | 'ignore'
      | 'parens'
      | 'parens-new-line';
    readonly return?: true | false | 'ignore' | 'parens' | 'parens-new-line';
    readonly arrow?: true | false | 'ignore' | 'parens' | 'parens-new-line';
    readonly condition?: true | false | 'ignore' | 'parens' | 'parens-new-line';
    readonly logical?: true | false | 'ignore' | 'parens' | 'parens-new-line';
    readonly prop?: true | false | 'ignore' | 'parens' | 'parens-new-line';
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Forbid attribute with an invalid values`
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-invalid-html-attribute.md
 *
 *  | key      | value           |
 *  | :------- | :-------------- |
 *  | fixable  | code            |
 *  | category | Possible Errors |
 */
namespace NoInvalidHtmlAttribute {
  /**
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
   */
  export type Options = readonly 'rel'[];

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Reports when this.state is accessed within setState
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-access-state-in-setstate.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 */
namespace NoAccessStateInSetstate {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent adjacent inline elements not separated by whitespace.
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-adjacent-inline-elements.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace NoAdjacentInlineElements {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent usage of Array index in keys
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-array-index-key.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace NoArrayIndexKey {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Lifecycle methods should be methods on the prototype, not class fields
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-arrow-function-lifecycle.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace NoArrowFunctionLifecycle {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent passing of children as props.
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-children-prop.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | true           |
 */
namespace NoChildrenProp {
  /**
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
   */
  export type Options = {
    readonly allowFunctions?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Prevent usage of dangerous JSX props
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-danger.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace NoDanger {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Report when a DOM element is using both children and dangerouslySetInnerHTML
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-danger-with-children.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 */
namespace NoDangerWithChildren {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent usage of deprecated methods
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-deprecated.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | true           |
 */
namespace NoDeprecated {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent usage of setState in componentDidMount
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-did-mount-set-state.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace NoDidMountSetState {
  /**
   * [
   *   {
   *     "enum": [
   *       "disallow-in-func"
   *     ]
   *   }
   * ]
   */
  export type Options = 'disallow-in-func';

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Prevent usage of setState in componentDidUpdate
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-did-update-set-state.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace NoDidUpdateSetState {
  /**
   * [
   *   {
   *     "enum": [
   *       "disallow-in-func"
   *     ]
   *   }
   * ]
   */
  export type Options = 'disallow-in-func';

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Prevent direct mutation of this.state
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-direct-mutation-state.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 */
namespace NoDirectMutationState {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent usage of findDOMNode
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-find-dom-node.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | true           |
 */
namespace NoFindDomNode {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent usage of isMounted
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-is-mounted.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | true           |
 */
namespace NoIsMounted {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent multiple component definition per file
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-multi-comp.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace NoMultiComp {
  /**
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
   */
  export type Options = {
    readonly ignoreStateless?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Enforce that namespaces are not used in React elements
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-namespace.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 */
namespace NoNamespace {
  /**
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false
   *   }
   * ]
   */

  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent usage of setState
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-set-state.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace NoSetState {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent string definitions for references and prevent referencing this.refs
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-string-refs.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | true           |
 */
namespace NoStringRefs {
  /**
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
   */
  export type Options = {
    readonly noTemplateLiterals?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Flag shouldComponentUpdate when extending PureComponent
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-redundant-should-component-update.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 */
namespace NoRedundantShouldComponentUpdate {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent usage of the return value of React.render
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-render-return-value.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | true           |
 */
namespace NoRenderReturnValue {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Report "this" being used in stateless components
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-this-in-sfc.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 */
namespace NoThisInSfc {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent common typos
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-typos.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace NoTypos {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Detect unescaped HTML entities, which might represent malformed tags
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-unescaped-entities.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 */
namespace NoUnescapedEntities {
  /**
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "forbid": {
   *         "type": "array",
   *         "items": {
   *           "oneOf": [
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
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Prevent usage of unknown DOM property
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-unknown-property.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | fixable     | code            |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 */
namespace NoUnknownProperty {
  /**
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignore": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   */
  export type Options = {
    readonly ignore?: readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Prevent usage of unsafe lifecycle methods
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-unsafe.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace NoUnsafe {
  /**
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
   */
  export type Options = {
    readonly checkAliases?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Prevent creating unstable components inside components
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-unstable-nested-components.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 */
namespace NoUnstableNestedComponents {
  /**
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
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   */
  export type Options = {
    readonly customValidators?: readonly string[];
    readonly allowAsProps?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Prevent declaring unused methods of component class
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-unused-class-component-methods.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace NoUnusedClassComponentMethods {
  /**
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false
   *   }
   * ]
   */

  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent definitions of unused prop types
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-unused-prop-types.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace NoUnusedPropTypes {
  /**
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
   */
  export type Options = {
    readonly ignore?: readonly string[];
    readonly customValidators?: readonly string[];
    readonly skipShapeProps?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Prevent definition of unused state fields
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-unused-state.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace NoUnusedState {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent usage of setState in componentWillUpdate
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/no-will-update-set-state.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace NoWillUpdateSetState {
  /**
   * [
   *   {
   *     "enum": [
   *       "disallow-in-func"
   *     ]
   *   }
   * ]
   */
  export type Options = 'disallow-in-func';

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Enforce ES5 or ES6 class for React Components
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/prefer-es6-class.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace PreferEs6Class {
  /**
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   }
   * ]
   */
  export type Options = 'always' | 'never';

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Prefer exact proptype definitions
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/prefer-exact-props.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 */
namespace PreferExactProps {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require read-only props.
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/prefer-read-only-props.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace PreferReadOnlyProps {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce stateless components to be written as a pure function
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/prefer-stateless-function.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace PreferStatelessFunction {
  /**
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
   */
  export type Options = {
    readonly ignorePureComponents?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Prevent missing props validation in a React component definition
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/prop-types.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | true           |
 */
namespace PropTypes {
  /**
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
   */
  export type Options = {
    readonly ignore?: readonly string[];
    readonly customValidators?: readonly string[];
    readonly skipUndeclared?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Prevent missing React when using JSX
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/react-in-jsx-scope.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 */
namespace ReactInJsxScope {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce a defaultProps definition for every prop that is not a required prop.
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/require-default-props.md
 *
 *  | key      | value          |
 *  | :------- | :------------- |
 *  | category | Best Practices |
 */
namespace RequireDefaultProps {
  /**
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "forbidDefaultForRequired": {
   *         "type": "boolean"
   *       },
   *       "ignoreFunctionalComponents": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   */
  export type Options = {
    readonly forbidDefaultForRequired?: boolean;
    readonly ignoreFunctionalComponents?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Enforce React components to have a shouldComponentUpdate method
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/require-optimization.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace RequireOptimization {
  /**
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
   */
  export type Options = {
    readonly allowDecorators?: readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Enforce ES5 or ES6 class for returning value in render function
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/require-render-return.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | true            |
 */
namespace RequireRenderReturn {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prevent extra closing tags for components without children
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/self-closing-comp.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | fixable     | code             |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace SelfClosingComp {
  /**
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
   */
  export type Options = {
    readonly component?: boolean;
    readonly html?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Enforce component methods order
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/sort-comp.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace SortComp {
  /**
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
   */
  export type Options = {
    readonly order?: readonly string[];
    readonly groups?: Record<string, readonly string[]>;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Enforce propTypes declarations alphabetical sorting
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/sort-prop-types.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace SortPropTypes {
  /**
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
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   */
  export type Options = {
    readonly requiredFirst?: boolean;
    readonly callbacksLast?: boolean;
    readonly ignoreCase?: boolean;
    readonly noSortAlphabetically?: boolean;
    readonly sortShapeProp?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description State initialization in an ES6 class component should be in a constructor
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/state-in-constructor.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace StateInConstructor {
  /**
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   }
   * ]
   */
  export type Options = 'always' | 'never';

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Defines where React component static properties should be positioned.
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/static-property-placement.md
 *
 *  | key         | value            |
 *  | :---------- | :--------------- |
 *  | category    | Stylistic Issues |
 *  | recommended | false            |
 */
namespace StaticPropertyPlacement {
  /**
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
   */
  export type Options0 =
    | 'static public field'
    | 'static getter'
    | 'property assignment';

  export type Options1 = {
    readonly propTypes?:
      | 'static public field'
      | 'static getter'
      | 'property assignment';
    readonly defaultProps?:
      | 'static public field'
      | 'static getter'
      | 'property assignment';
    readonly childContextTypes?:
      | 'static public field'
      | 'static getter'
      | 'property assignment';
    readonly contextTypes?:
      | 'static public field'
      | 'static getter'
      | 'property assignment';
    readonly contextType?:
      | 'static public field'
      | 'static getter'
      | 'property assignment';
    readonly displayName?:
      | 'static public field'
      | 'static getter'
      | 'property assignment';
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options0, ...Prefixes<readonly [Options1]>];
}

/**
 * @description Enforce style prop value is an object
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/style-prop-object.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | category    | Possible Errors |
 *  | recommended | false           |
 */
namespace StylePropObject {
  /**
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
   */
  export type Options = {
    readonly allow?: readonly string[];
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | readonly [Linter.RuleLevel, Options];
}

/**
 * @description Prevent passing of children to void DOM elements (e.g. `<br />`).
 * @link https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules/void-dom-elements-no-children.md
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | category    | Best Practices |
 *  | recommended | false          |
 */
namespace VoidDomElementsNoChildren {
  export type RuleEntry = Linter.RuleLevel;
}

export type EslintReactRules = {
  readonly 'react/boolean-prop-naming': BooleanPropNaming.RuleEntry;
  readonly 'react/button-has-type': ButtonHasType.RuleEntry;
  readonly 'react/default-props-match-prop-types': DefaultPropsMatchPropTypes.RuleEntry;
  readonly 'react/destructuring-assignment': DestructuringAssignment.RuleEntry;
  readonly 'react/display-name': DisplayName.RuleEntry;
  readonly 'react/forbid-component-props': ForbidComponentProps.RuleEntry;
  readonly 'react/forbid-dom-props': ForbidDomProps.RuleEntry;
  readonly 'react/forbid-elements': ForbidElements.RuleEntry;
  readonly 'react/forbid-foreign-prop-types': ForbidForeignPropTypes.RuleEntry;
  readonly 'react/forbid-prop-types': ForbidPropTypes.RuleEntry;
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
  readonly 'react/jsx-sort-default-props': JsxSortDefaultProps.RuleEntry;
  readonly 'react/jsx-sort-props': JsxSortProps.RuleEntry;
  readonly 'react/jsx-space-before-closing': JsxSpaceBeforeClosing.RuleEntry;
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
  readonly 'react/sort-prop-types': SortPropTypes.RuleEntry;
  readonly 'react/state-in-constructor': StateInConstructor.RuleEntry;
  readonly 'react/static-property-placement': StaticPropertyPlacement.RuleEntry;
  readonly 'react/style-prop-object': StylePropObject.RuleEntry;
  readonly 'react/void-dom-elements-no-children': VoidDomElementsNoChildren.RuleEntry;
};
