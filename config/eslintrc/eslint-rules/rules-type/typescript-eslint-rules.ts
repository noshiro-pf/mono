/* eslint-disable functional/no-mixed-types */
/* cSpell:disable */
/* eslint-disable @typescript-eslint/sort-type-constituents */
import { type Linter } from 'eslint';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleLevel, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleLevel, ...T[1]] : T;

/**
 * @description Require that function overload signatures be consecutive
 * @link https://typescript-eslint.io/rules/adjacent-overload-signatures
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | error      |
 */
namespace AdjacentOverloadSignatures {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require consistently using either `T[]` or `Array<T>` for arrays
 * @link https://typescript-eslint.io/rules/array-type
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | strict     |
 */
namespace ArrayType {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "$defs": {
   *     "arrayOption": {
   *       "enum": [
   *         "array",
   *         "generic",
   *         "array-simple"
   *       ]
   *     }
   *   },
   *   "prefixItems": [
   *     {
   *       "properties": {
   *         "default": {
   *           "$ref": "#/$defs/arrayOption",
   *           "description": "The array type expected for mutable cases..."
   *         },
   *         "readonly": {
   *           "$ref": "#/$defs/arrayOption",
   *           "description": "The array type expected for readonly cases. If omitted, the value for `default` will be used."
   *         }
   *       },
   *       "type": "object"
   *     }
   *   ],
   *   "type": "array"
   * }
   * ```
   */
  // modified
  export type Options = {
    /**
     * The array type expected for mutable cases...
     */
    readonly default?: 'array' | 'generic' | 'array-simple';
    /**
     * The array type expected for readonly cases. If omitted, the value for `default` will be used.
     */
    readonly readonly?: 'array' | 'generic' | 'array-simple';
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow awaiting a value that is not a Thenable
 * @link https://typescript-eslint.io/rules/await-thenable
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | recommended          | error   |
 *  | requiresTypeChecking | true    |
 */
namespace AwaitThenable {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `@ts-<directive>` comments or require descriptions after directives
 * @link https://typescript-eslint.io/rules/ban-ts-comment
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | error   |
 */
namespace BanTsComment {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "$defs": {
   *     "directiveConfigSchema": {
   *       "oneOf": [
   *         {
   *           "type": "boolean",
   *           "default": true
   *         },
   *         {
   *           "enum": [
   *             "allow-with-description"
   *           ]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "descriptionFormat": {
   *               "type": "string"
   *             }
   *           }
   *         }
   *       ]
   *     }
   *   },
   *   "prefixItems": [
   *     {
   *       "properties": {
   *         "ts-expect-error": {
   *           "$ref": "#/$defs/directiveConfigSchema"
   *         },
   *         "ts-ignore": {
   *           "$ref": "#/$defs/directiveConfigSchema"
   *         },
   *         "ts-nocheck": {
   *           "$ref": "#/$defs/directiveConfigSchema"
   *         },
   *         "ts-check": {
   *           "$ref": "#/$defs/directiveConfigSchema"
   *         },
   *         "minimumDescriptionLength": {
   *           "type": "number",
   *           "default": 3
   *         }
   *       },
   *       "additionalProperties": false
   *     }
   *   ],
   *   "type": "array"
   * }
   * ```
   */
  // modified
  export type Options = Readonly<{
    'ts-expect-error'?: DirectiveConfigSchema;
    'ts-ignore'?: DirectiveConfigSchema;
    'ts-nocheck'?: DirectiveConfigSchema;
    'ts-check'?: DirectiveConfigSchema;
    minimumDescriptionLength?: number;
  }>;

  type DirectiveConfigSchema =
    | boolean
    | 'allow-with-description'
    | {
        readonly descriptionFormat?: string;
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow `// tslint:<rule-flag>` comments
 * @link https://typescript-eslint.io/rules/ban-tslint-comment
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | strict     |
 */
namespace BanTslintComment {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow certain types
 * @link https://typescript-eslint.io/rules/ban-types
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | error      |
 */
namespace BanTypes {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "types": {
   *         "type": "object",
   *         "additionalProperties": {
   *           "oneOf": [
   *             {
   *               "type": "null"
   *             },
   *             {
   *               "type": "boolean"
   *             },
   *             {
   *               "type": "string"
   *             },
   *             {
   *               "type": "object",
   *               "properties": {
   *                 "message": {
   *                   "type": "string"
   *                 },
   *                 "fixWith": {
   *                   "type": "string"
   *                 },
   *                 "suggest": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 }
   *               },
   *               "additionalProperties": false
   *             }
   *           ]
   *         }
   *       },
   *       "extendDefaults": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly types?: Record<
      string,
      | null
      | boolean
      | string
      | {
          readonly message?: string;
          readonly fixWith?: string;
          readonly suggest?: readonly string[];
        }
    >;
    readonly extendDefaults?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow or enforce spaces inside of blocks after opening block and before closing block
 * @link https://typescript-eslint.io/rules/block-spacing
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
 * @link https://typescript-eslint.io/rules/brace-style
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
 * @description Enforce that literals on classes are exposed in a consistent style
 * @link https://typescript-eslint.io/rules/class-literal-property-style
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | fixable     | code    |
 *  | recommended | strict  |
 */
namespace ClassLiteralPropertyStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "fields",
   *       "getters"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'fields' | 'getters';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require or disallow trailing commas
 * @link https://typescript-eslint.io/rules/comma-dangle
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
   *   "$defs": {
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
   *   "additionalProperties": false
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
            readonly enums?: ValueWithIgnore;
            readonly generics?: ValueWithIgnore;
            readonly tuples?: ValueWithIgnore;
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
    | 'never'
    | 'only-multiline'
    | 'ignore';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent spacing before and after commas
 * @link https://typescript-eslint.io/rules/comma-spacing
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
 * @description Enforce specifying generic type arguments on type annotation or constructor name of a constructor call
 * @link https://typescript-eslint.io/rules/consistent-generic-constructors
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | strict     |
 */
namespace ConsistentGenericConstructors {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "type-annotation",
   *       "constructor"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'type-annotation' | 'constructor';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require or disallow the `Record` type
 * @link https://typescript-eslint.io/rules/consistent-indexed-object-style
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | strict     |
 */
namespace ConsistentIndexedObjectStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "record",
   *       "index-signature"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'record' | 'index-signature';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent usage of type assertions
 * @link https://typescript-eslint.io/rules/consistent-type-assertions
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | strict     |
 */
namespace ConsistentTypeAssertions {
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
   *           "assertionStyle": {
   *             "enum": [
   *               "never"
   *             ]
   *           }
   *         },
   *         "additionalProperties": false,
   *         "required": [
   *           "assertionStyle"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "assertionStyle": {
   *             "enum": [
   *               "as",
   *               "angle-bracket"
   *             ]
   *           },
   *           "objectLiteralTypeAssertions": {
   *             "enum": [
   *               "allow",
   *               "allow-as-parameter",
   *               "never"
   *             ]
   *           }
   *         },
   *         "additionalProperties": false,
   *         "required": [
   *           "assertionStyle"
   *         ]
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options =
    | {
        readonly assertionStyle: 'never';
      }
    | {
        readonly assertionStyle: 'as' | 'angle-bracket';
        readonly objectLiteralTypeAssertions?:
          | 'allow'
          | 'allow-as-parameter'
          | 'never';
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce type definitions to consistently use either `interface` or `type`
 * @link https://typescript-eslint.io/rules/consistent-type-definitions
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | strict     |
 */
namespace ConsistentTypeDefinitions {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "interface",
   *       "type"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'interface' | 'type';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent usage of type exports
 * @link https://typescript-eslint.io/rules/consistent-type-exports
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | fixable              | code       |
 *  | recommended          | false      |
 *  | requiresTypeChecking | true       |
 */
namespace ConsistentTypeExports {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "fixMixedExportsWithInlineTypeSpecifier": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly fixMixedExportsWithInlineTypeSpecifier?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent usage of type imports
 * @link https://typescript-eslint.io/rules/consistent-type-imports
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 */
namespace ConsistentTypeImports {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "prefer": {
   *         "enum": [
   *           "type-imports",
   *           "no-type-imports"
   *         ]
   *       },
   *       "disallowTypeAnnotations": {
   *         "type": "boolean"
   *       },
   *       "fixStyle": {
   *         "enum": [
   *           "separate-type-imports",
   *           "inline-type-imports"
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly prefer?: 'type-imports' | 'no-type-imports';
    readonly disallowTypeAnnotations?: boolean;
    readonly fixStyle?: 'separate-type-imports' | 'inline-type-imports';
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce default parameters to be last
 * @link https://typescript-eslint.io/rules/default-param-last
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
 * @description Enforce dot notation whenever possible
 * @link https://typescript-eslint.io/rules/dot-notation
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | fixable              | code       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
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
   *       },
   *       "allowPrivateClassPropertyAccess": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "allowProtectedClassPropertyAccess": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "allowIndexSignaturePropertyAccess": {
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
    readonly allowKeywords?: boolean;
    readonly allowPattern?: string;
    readonly allowPrivateClassPropertyAccess?: boolean;
    readonly allowProtectedClassPropertyAccess?: boolean;
    readonly allowIndexSignaturePropertyAccess?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require explicit return types on functions and class methods
 * @link https://typescript-eslint.io/rules/explicit-function-return-type
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 */
namespace ExplicitFunctionReturnType {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowConciseArrowFunctionExpressionsStartingWithVoid": {
   *         "description": "Whether to allow arrow functions that start with the `void` keyword.",
   *         "type": "boolean"
   *       },
   *       "allowExpressions": {
   *         "description": "Whether to ignore function expressions (functions which are not part of a declaration).",
   *         "type": "boolean"
   *       },
   *       "allowHigherOrderFunctions": {
   *         "description": "Whether to ignore functions immediately returning another function expression.",
   *         "type": "boolean"
   *       },
   *       "allowTypedFunctionExpressions": {
   *         "description": "Whether to ignore type annotations on the variable of function expressions.",
   *         "type": "boolean"
   *       },
   *       "allowDirectConstAssertionInArrowFunctions": {
   *         "description": "Whether to ignore arrow functions immediately returning a `as const` value.",
   *         "type": "boolean"
   *       },
   *       "allowFunctionsWithoutTypeParameters": {
   *         "description": "Whether to ignore functions that don't have generic type parameters.",
   *         "type": "boolean"
   *       },
   *       "allowedNames": {
   *         "description": "An array of function/method names that will not have their arguments or return values checked.",
   *         "items": {
   *           "type": "string"
   *         },
   *         "type": "array"
   *       },
   *       "allowIIFEs": {
   *         "description": "Whether to ignore immediately invoked function expressions (IIFEs).",
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether to allow arrow functions that start with the `void` keyword.
     */
    readonly allowConciseArrowFunctionExpressionsStartingWithVoid?: boolean;
    /**
     * Whether to ignore function expressions (functions which are not part of a declaration).
     */
    readonly allowExpressions?: boolean;
    /**
     * Whether to ignore functions immediately returning another function expression.
     */
    readonly allowHigherOrderFunctions?: boolean;
    /**
     * Whether to ignore type annotations on the variable of function expressions.
     */
    readonly allowTypedFunctionExpressions?: boolean;
    /**
     * Whether to ignore arrow functions immediately returning a `as const` value.
     */
    readonly allowDirectConstAssertionInArrowFunctions?: boolean;
    /**
     * Whether to ignore functions that don't have generic type parameters.
     */
    readonly allowFunctionsWithoutTypeParameters?: boolean;
    /**
     * An array of function/method names that will not have their arguments or return values checked.
     */
    readonly allowedNames?: readonly string[];
    /**
     * Whether to ignore immediately invoked function expressions (IIFEs).
     */
    readonly allowIIFEs?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require explicit accessibility modifiers on class properties and methods
 * @link https://typescript-eslint.io/rules/explicit-member-accessibility
 *
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | false   |
 */
namespace ExplicitMemberAccessibility {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "$defs": {
   *     "accessibilityLevel": {
   *       "oneOf": [
   *         {
   *           "const": "explicit",
   *           "description": "Always require an accessor."
   *         },
   *         {
   *           "const": "no-public",
   *           "description": "Require an accessor except when public."
   *         },
   *         {
   *           "const": "off",
   *           "description": "Never check whether there is an accessor."
   *         }
   *       ]
   *     }
   *   },
   *   "prefixItems": [
   *     {
   *       "type": "object",
   *       "properties": {
   *         "accessibility": {
   *           "$ref": "#/$defs/accessibilityLevel"
   *         },
   *         "overrides": {
   *           "type": "object",
   *           "properties": {
   *             "accessors": {
   *               "$ref": "#/$defs/accessibilityLevel"
   *             },
   *             "constructors": {
   *               "$ref": "#/$defs/accessibilityLevel"
   *             },
   *             "methods": {
   *               "$ref": "#/$defs/accessibilityLevel"
   *             },
   *             "properties": {
   *               "$ref": "#/$defs/accessibilityLevel"
   *             },
   *             "parameterProperties": {
   *               "$ref": "#/$defs/accessibilityLevel"
   *             }
   *           },
   *           "additionalProperties": false
   *         },
   *         "ignoredMethodNames": {
   *           "type": "array",
   *           "items": {
   *             "type": "string"
   *           }
   *         }
   *       },
   *       "additionalProperties": false
   *     }
   *   ],
   *   "type": "array"
   * }
   * ```
   */
  // modified
  export type Options = Readonly<{
    accessibility?: AccessibilityLevel;
    overrides?: Readonly<{
      accessors?: AccessibilityLevel;
      constructors?: AccessibilityLevel;
      methods?: AccessibilityLevel;
      properties?: AccessibilityLevel;
      parameterProperties?: AccessibilityLevel;
    }>;
    ignoredMethodNames?: readonly string[];
  }>;

  type AccessibilityLevel = 'explicit' | 'no-public' | 'off';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require explicit return and argument types on exported functions' and classes' public class methods
 * @link https://typescript-eslint.io/rules/explicit-module-boundary-types
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 */
namespace ExplicitModuleBoundaryTypes {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowArgumentsExplicitlyTypedAsAny": {
   *         "description": "Whether to ignore arguments that are explicitly typed as `any`.",
   *         "type": "boolean"
   *       },
   *       "allowDirectConstAssertionInArrowFunctions": {
   *         "description": "Whether to ignore return type annotations on body-less arrow functions that return an `as const` type assertion.\nYou must still type the parameters of the function.",
   *         "type": "boolean"
   *       },
   *       "allowedNames": {
   *         "description": "An array of function/method names that will not have their arguments or return values checked.",
   *         "items": {
   *           "type": "string"
   *         },
   *         "type": "array"
   *       },
   *       "allowHigherOrderFunctions": {
   *         "description": "Whether to ignore return type annotations on functions immediately returning another function expression.\nYou must still type the parameters of the function.",
   *         "type": "boolean"
   *       },
   *       "allowTypedFunctionExpressions": {
   *         "description": "Whether to ignore type annotations on the variable of a function expresion.",
   *         "type": "boolean"
   *       },
   *       "shouldTrackReferences": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether to ignore arguments that are explicitly typed as `any`.
     */
    readonly allowArgumentsExplicitlyTypedAsAny?: boolean;
    /**
     * Whether to ignore return type annotations on body-less arrow functions that return an `as const` type assertion.
     * You must still type the parameters of the function.
     */
    readonly allowDirectConstAssertionInArrowFunctions?: boolean;
    /**
     * An array of function/method names that will not have their arguments or return values checked.
     */
    readonly allowedNames?: readonly string[];
    /**
     * Whether to ignore return type annotations on functions immediately returning another function expression.
     * You must still type the parameters of the function.
     */
    readonly allowHigherOrderFunctions?: boolean;
    /**
     * Whether to ignore type annotations on the variable of a function expresion.
     */
    readonly allowTypedFunctionExpressions?: boolean;
    readonly shouldTrackReferences?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require or disallow spacing between function identifiers and their invocations
 * @link https://typescript-eslint.io/rules/func-call-spacing
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
 * @description Enforce consistent indentation
 * @link https://typescript-eslint.io/rules/indent
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
 * @description Require or disallow initialization in variable declarations
 * @link https://typescript-eslint.io/rules/init-declarations
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
 * @description Enforce consistent spacing between property names and type annotations in types and interfaces
 * @link https://typescript-eslint.io/rules/key-spacing
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
 * @link https://typescript-eslint.io/rules/keyword-spacing
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
      readonly type?: {
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
 * @description Require empty lines around comments
 * @link https://typescript-eslint.io/rules/lines-around-comment
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
   * {
   *   "type": "array",
   *   "items": [
   *     {
   *       "type": "object",
   *       "properties": {
   *         "beforeBlockComment": {
   *           "type": "boolean",
   *           "default": true
   *         },
   *         "afterBlockComment": {
   *           "type": "boolean",
   *           "default": false
   *         },
   *         "beforeLineComment": {
   *           "type": "boolean",
   *           "default": false
   *         },
   *         "afterLineComment": {
   *           "type": "boolean",
   *           "default": false
   *         },
   *         "allowBlockStart": {
   *           "type": "boolean",
   *           "default": false
   *         },
   *         "allowBlockEnd": {
   *           "type": "boolean",
   *           "default": false
   *         },
   *         "allowClassStart": {
   *           "type": "boolean"
   *         },
   *         "allowClassEnd": {
   *           "type": "boolean"
   *         },
   *         "allowObjectStart": {
   *           "type": "boolean"
   *         },
   *         "allowObjectEnd": {
   *           "type": "boolean"
   *         },
   *         "allowArrayStart": {
   *           "type": "boolean"
   *         },
   *         "allowArrayEnd": {
   *           "type": "boolean"
   *         },
   *         "allowInterfaceStart": {
   *           "type": "boolean"
   *         },
   *         "allowInterfaceEnd": {
   *           "type": "boolean"
   *         },
   *         "allowTypeStart": {
   *           "type": "boolean"
   *         },
   *         "allowTypeEnd": {
   *           "type": "boolean"
   *         },
   *         "allowEnumStart": {
   *           "type": "boolean"
   *         },
   *         "allowEnumEnd": {
   *           "type": "boolean"
   *         },
   *         "allowModuleStart": {
   *           "type": "boolean"
   *         },
   *         "allowModuleEnd": {
   *           "type": "boolean"
   *         },
   *         "ignorePattern": {
   *           "type": "string"
   *         },
   *         "applyDefaultIgnorePatterns": {
   *           "type": "boolean"
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
    | readonly [
        {
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
        }
      ];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require or disallow an empty line between class members
 * @link https://typescript-eslint.io/rules/lines-between-class-members
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
   * {
   *   "0": {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   },
   *   "1": {
   *     "type": "object",
   *     "properties": {
   *       "exceptAfterSingleLine": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     },
   *     "additionalProperties": false,
   *     "exceptAfterOverload": {
   *       "type": "boolean",
   *       "default": true
   *     }
   *   }
   * }
   * ```
   */
  export type Options = Readonly<Record<string, unknown>>;

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require a specific member delimiter style for interfaces and type literals
 * @link https://typescript-eslint.io/rules/member-delimiter-style
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 */
namespace MemberDelimiterStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "multiline": {
   *         "type": "object",
   *         "properties": {
   *           "delimiter": {
   *             "enum": [
   *               "none",
   *               "semi",
   *               "comma"
   *             ]
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
   *             "enum": [
   *               "semi",
   *               "comma"
   *             ]
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
   *             "type": "object",
   *             "properties": {
   *               "multiline": {
   *                 "type": "object",
   *                 "properties": {
   *                   "delimiter": {
   *                     "enum": [
   *                       "none",
   *                       "semi",
   *                       "comma"
   *                     ]
   *                   },
   *                   "requireLast": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               },
   *               "singleline": {
   *                 "type": "object",
   *                 "properties": {
   *                   "delimiter": {
   *                     "enum": [
   *                       "semi",
   *                       "comma"
   *                     ]
   *                   },
   *                   "requireLast": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "typeLiteral": {
   *             "type": "object",
   *             "properties": {
   *               "multiline": {
   *                 "type": "object",
   *                 "properties": {
   *                   "delimiter": {
   *                     "enum": [
   *                       "none",
   *                       "semi",
   *                       "comma"
   *                     ]
   *                   },
   *                   "requireLast": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               },
   *               "singleline": {
   *                 "type": "object",
   *                 "properties": {
   *                   "delimiter": {
   *                     "enum": [
   *                       "semi",
   *                       "comma"
   *                     ]
   *                   },
   *                   "requireLast": {
   *                     "type": "boolean"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       "multilineDetection": {
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
  export type Options = {
    readonly multiline?: {
      readonly delimiter?: 'none' | 'semi' | 'comma';
      readonly requireLast?: boolean;
    };
    readonly singleline?: {
      readonly delimiter?: 'semi' | 'comma';
      readonly requireLast?: boolean;
    };
    readonly overrides?: {
      readonly interface?: {
        readonly multiline?: {
          readonly delimiter?: 'none' | 'semi' | 'comma';
          readonly requireLast?: boolean;
        };
        readonly singleline?: {
          readonly delimiter?: 'semi' | 'comma';
          readonly requireLast?: boolean;
        };
      };
      readonly typeLiteral?: {
        readonly multiline?: {
          readonly delimiter?: 'none' | 'semi' | 'comma';
          readonly requireLast?: boolean;
        };
        readonly singleline?: {
          readonly delimiter?: 'semi' | 'comma';
          readonly requireLast?: boolean;
        };
      };
    };
    readonly multilineDetection?: 'brackets' | 'last-member';
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require a consistent member declaration order
 * @link https://typescript-eslint.io/rules/member-ordering
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace MemberOrdering {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "default": {
   *         "oneOf": [
   *           {
   *             "type": "string",
   *             "enum": [
   *               "never"
   *             ]
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "oneOf": [
   *                 {
   *                   "enum": [
   *                     "readonly-signature",
   *                     "signature",
   *                     "readonly-field",
   *                     "public-readonly-field",
   *                     "public-decorated-readonly-field",
   *                     "decorated-readonly-field",
   *                     "static-readonly-field",
   *                     "public-static-readonly-field",
   *                     "instance-readonly-field",
   *                     "public-instance-readonly-field",
   *                     "abstract-readonly-field",
   *                     "public-abstract-readonly-field",
   *                     "protected-readonly-field",
   *                     "protected-decorated-readonly-field",
   *                     "protected-static-readonly-field",
   *                     "protected-instance-readonly-field",
   *                     "protected-abstract-readonly-field",
   *                     "private-readonly-field",
   *                     "private-decorated-readonly-field",
   *                     "private-static-readonly-field",
   *                     "private-instance-readonly-field",
   *                     "#private-readonly-field",
   *                     "#private-static-readonly-field",
   *                     "#private-instance-readonly-field",
   *                     "field",
   *                     "public-field",
   *                     "public-decorated-field",
   *                     "decorated-field",
   *                     "static-field",
   *                     "public-static-field",
   *                     "instance-field",
   *                     "public-instance-field",
   *                     "abstract-field",
   *                     "public-abstract-field",
   *                     "protected-field",
   *                     "protected-decorated-field",
   *                     "protected-static-field",
   *                     "protected-instance-field",
   *                     "protected-abstract-field",
   *                     "private-field",
   *                     "private-decorated-field",
   *                     "private-static-field",
   *                     "private-instance-field",
   *                     "#private-field",
   *                     "#private-static-field",
   *                     "#private-instance-field",
   *                     "method",
   *                     "public-method",
   *                     "public-decorated-method",
   *                     "decorated-method",
   *                     "static-method",
   *                     "public-static-method",
   *                     "instance-method",
   *                     "public-instance-method",
   *                     "abstract-method",
   *                     "public-abstract-method",
   *                     "protected-method",
   *                     "protected-decorated-method",
   *                     "protected-static-method",
   *                     "protected-instance-method",
   *                     "protected-abstract-method",
   *                     "private-method",
   *                     "private-decorated-method",
   *                     "private-static-method",
   *                     "private-instance-method",
   *                     "#private-method",
   *                     "#private-static-method",
   *                     "#private-instance-method",
   *                     "call-signature",
   *                     "constructor",
   *                     "public-constructor",
   *                     "protected-constructor",
   *                     "private-constructor",
   *                     "get",
   *                     "public-get",
   *                     "public-decorated-get",
   *                     "decorated-get",
   *                     "static-get",
   *                     "public-static-get",
   *                     "instance-get",
   *                     "public-instance-get",
   *                     "abstract-get",
   *                     "public-abstract-get",
   *                     "protected-get",
   *                     "protected-decorated-get",
   *                     "protected-static-get",
   *                     "protected-instance-get",
   *                     "protected-abstract-get",
   *                     "private-get",
   *                     "private-decorated-get",
   *                     "private-static-get",
   *                     "private-instance-get",
   *                     "#private-get",
   *                     "#private-static-get",
   *                     "#private-instance-get",
   *                     "set",
   *                     "public-set",
   *                     "public-decorated-set",
   *                     "decorated-set",
   *                     "static-set",
   *                     "public-static-set",
   *                     "instance-set",
   *                     "public-instance-set",
   *                     "abstract-set",
   *                     "public-abstract-set",
   *                     "protected-set",
   *                     "protected-decorated-set",
   *                     "protected-static-set",
   *                     "protected-instance-set",
   *                     "protected-abstract-set",
   *                     "private-set",
   *                     "private-decorated-set",
   *                     "private-static-set",
   *                     "private-instance-set",
   *                     "#private-set",
   *                     "#private-static-set",
   *                     "#private-instance-set",
   *                     "static-initialization",
   *                     "static-static-initialization",
   *                     "public-static-static-initialization",
   *                     "instance-static-initialization",
   *                     "public-instance-static-initialization",
   *                     "abstract-static-initialization",
   *                     "public-abstract-static-initialization",
   *                     "protected-static-static-initialization",
   *                     "protected-instance-static-initialization",
   *                     "protected-abstract-static-initialization",
   *                     "private-static-static-initialization",
   *                     "private-instance-static-initialization",
   *                     "#private-static-static-initialization",
   *                     "#private-instance-static-initialization"
   *                   ]
   *                 },
   *                 {
   *                   "type": "array",
   *                   "items": {
   *                     "enum": [
   *                       "readonly-signature",
   *                       "signature",
   *                       "readonly-field",
   *                       "public-readonly-field",
   *                       "public-decorated-readonly-field",
   *                       "decorated-readonly-field",
   *                       "static-readonly-field",
   *                       "public-static-readonly-field",
   *                       "instance-readonly-field",
   *                       "public-instance-readonly-field",
   *                       "abstract-readonly-field",
   *                       "public-abstract-readonly-field",
   *                       "protected-readonly-field",
   *                       "protected-decorated-readonly-field",
   *                       "protected-static-readonly-field",
   *                       "protected-instance-readonly-field",
   *                       "protected-abstract-readonly-field",
   *                       "private-readonly-field",
   *                       "private-decorated-readonly-field",
   *                       "private-static-readonly-field",
   *                       "private-instance-readonly-field",
   *                       "#private-readonly-field",
   *                       "#private-static-readonly-field",
   *                       "#private-instance-readonly-field",
   *                       "field",
   *                       "public-field",
   *                       "public-decorated-field",
   *                       "decorated-field",
   *                       "static-field",
   *                       "public-static-field",
   *                       "instance-field",
   *                       "public-instance-field",
   *                       "abstract-field",
   *                       "public-abstract-field",
   *                       "protected-field",
   *                       "protected-decorated-field",
   *                       "protected-static-field",
   *                       "protected-instance-field",
   *                       "protected-abstract-field",
   *                       "private-field",
   *                       "private-decorated-field",
   *                       "private-static-field",
   *                       "private-instance-field",
   *                       "#private-field",
   *                       "#private-static-field",
   *                       "#private-instance-field",
   *                       "method",
   *                       "public-method",
   *                       "public-decorated-method",
   *                       "decorated-method",
   *                       "static-method",
   *                       "public-static-method",
   *                       "instance-method",
   *                       "public-instance-method",
   *                       "abstract-method",
   *                       "public-abstract-method",
   *                       "protected-method",
   *                       "protected-decorated-method",
   *                       "protected-static-method",
   *                       "protected-instance-method",
   *                       "protected-abstract-method",
   *                       "private-method",
   *                       "private-decorated-method",
   *                       "private-static-method",
   *                       "private-instance-method",
   *                       "#private-method",
   *                       "#private-static-method",
   *                       "#private-instance-method",
   *                       "call-signature",
   *                       "constructor",
   *                       "public-constructor",
   *                       "protected-constructor",
   *                       "private-constructor",
   *                       "get",
   *                       "public-get",
   *                       "public-decorated-get",
   *                       "decorated-get",
   *                       "static-get",
   *                       "public-static-get",
   *                       "instance-get",
   *                       "public-instance-get",
   *                       "abstract-get",
   *                       "public-abstract-get",
   *                       "protected-get",
   *                       "protected-decorated-get",
   *                       "protected-static-get",
   *                       "protected-instance-get",
   *                       "protected-abstract-get",
   *                       "private-get",
   *                       "private-decorated-get",
   *                       "private-static-get",
   *                       "private-instance-get",
   *                       "#private-get",
   *                       "#private-static-get",
   *                       "#private-instance-get",
   *                       "set",
   *                       "public-set",
   *                       "public-decorated-set",
   *                       "decorated-set",
   *                       "static-set",
   *                       "public-static-set",
   *                       "instance-set",
   *                       "public-instance-set",
   *                       "abstract-set",
   *                       "public-abstract-set",
   *                       "protected-set",
   *                       "protected-decorated-set",
   *                       "protected-static-set",
   *                       "protected-instance-set",
   *                       "protected-abstract-set",
   *                       "private-set",
   *                       "private-decorated-set",
   *                       "private-static-set",
   *                       "private-instance-set",
   *                       "#private-set",
   *                       "#private-static-set",
   *                       "#private-instance-set",
   *                       "static-initialization",
   *                       "static-static-initialization",
   *                       "public-static-static-initialization",
   *                       "instance-static-initialization",
   *                       "public-instance-static-initialization",
   *                       "abstract-static-initialization",
   *                       "public-abstract-static-initialization",
   *                       "protected-static-static-initialization",
   *                       "protected-instance-static-initialization",
   *                       "protected-abstract-static-initialization",
   *                       "private-static-static-initialization",
   *                       "private-instance-static-initialization",
   *                       "#private-static-static-initialization",
   *                       "#private-instance-static-initialization"
   *                     ]
   *                   }
   *                 }
   *               ]
   *             }
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "memberTypes": {
   *                 "oneOf": [
   *                   {
   *                     "type": "array",
   *                     "items": {
   *                       "oneOf": [
   *                         {
   *                           "enum": [
   *                             "readonly-signature",
   *                             "signature",
   *                             "readonly-field",
   *                             "public-readonly-field",
   *                             "public-decorated-readonly-field",
   *                             "decorated-readonly-field",
   *                             "static-readonly-field",
   *                             "public-static-readonly-field",
   *                             "instance-readonly-field",
   *                             "public-instance-readonly-field",
   *                             "abstract-readonly-field",
   *                             "public-abstract-readonly-field",
   *                             "protected-readonly-field",
   *                             "protected-decorated-readonly-field",
   *                             "protected-static-readonly-field",
   *                             "protected-instance-readonly-field",
   *                             "protected-abstract-readonly-field",
   *                             "private-readonly-field",
   *                             "private-decorated-readonly-field",
   *                             "private-static-readonly-field",
   *                             "private-instance-readonly-field",
   *                             "#private-readonly-field",
   *                             "#private-static-readonly-field",
   *                             "#private-instance-readonly-field",
   *                             "field",
   *                             "public-field",
   *                             "public-decorated-field",
   *                             "decorated-field",
   *                             "static-field",
   *                             "public-static-field",
   *                             "instance-field",
   *                             "public-instance-field",
   *                             "abstract-field",
   *                             "public-abstract-field",
   *                             "protected-field",
   *                             "protected-decorated-field",
   *                             "protected-static-field",
   *                             "protected-instance-field",
   *                             "protected-abstract-field",
   *                             "private-field",
   *                             "private-decorated-field",
   *                             "private-static-field",
   *                             "private-instance-field",
   *                             "#private-field",
   *                             "#private-static-field",
   *                             "#private-instance-field",
   *                             "method",
   *                             "public-method",
   *                             "public-decorated-method",
   *                             "decorated-method",
   *                             "static-method",
   *                             "public-static-method",
   *                             "instance-method",
   *                             "public-instance-method",
   *                             "abstract-method",
   *                             "public-abstract-method",
   *                             "protected-method",
   *                             "protected-decorated-method",
   *                             "protected-static-method",
   *                             "protected-instance-method",
   *                             "protected-abstract-method",
   *                             "private-method",
   *                             "private-decorated-method",
   *                             "private-static-method",
   *                             "private-instance-method",
   *                             "#private-method",
   *                             "#private-static-method",
   *                             "#private-instance-method",
   *                             "call-signature",
   *                             "constructor",
   *                             "public-constructor",
   *                             "protected-constructor",
   *                             "private-constructor",
   *                             "get",
   *                             "public-get",
   *                             "public-decorated-get",
   *                             "decorated-get",
   *                             "static-get",
   *                             "public-static-get",
   *                             "instance-get",
   *                             "public-instance-get",
   *                             "abstract-get",
   *                             "public-abstract-get",
   *                             "protected-get",
   *                             "protected-decorated-get",
   *                             "protected-static-get",
   *                             "protected-instance-get",
   *                             "protected-abstract-get",
   *                             "private-get",
   *                             "private-decorated-get",
   *                             "private-static-get",
   *                             "private-instance-get",
   *                             "#private-get",
   *                             "#private-static-get",
   *                             "#private-instance-get",
   *                             "set",
   *                             "public-set",
   *                             "public-decorated-set",
   *                             "decorated-set",
   *                             "static-set",
   *                             "public-static-set",
   *                             "instance-set",
   *                             "public-instance-set",
   *                             "abstract-set",
   *                             "public-abstract-set",
   *                             "protected-set",
   *                             "protected-decorated-set",
   *                             "protected-static-set",
   *                             "protected-instance-set",
   *                             "protected-abstract-set",
   *                             "private-set",
   *                             "private-decorated-set",
   *                             "private-static-set",
   *                             "private-instance-set",
   *                             "#private-set",
   *                             "#private-static-set",
   *                             "#private-instance-set",
   *                             "static-initialization",
   *                             "static-static-initialization",
   *                             "public-static-static-initialization",
   *                             "instance-static-initialization",
   *                             "public-instance-static-initialization",
   *                             "abstract-static-initialization",
   *                             "public-abstract-static-initialization",
   *                             "protected-static-static-initialization",
   *                             "protected-instance-static-initialization",
   *                             "protected-abstract-static-initialization",
   *                             "private-static-static-initialization",
   *                             "private-instance-static-initialization",
   *                             "#private-static-static-initialization",
   *                             "#private-instance-static-initialization"
   *                           ]
   *                         },
   *                         {
   *                           "type": "array",
   *                           "items": {
   *                             "enum": [
   *                               "readonly-signature",
   *                               "signature",
   *                               "readonly-field",
   *                               "public-readonly-field",
   *                               "public-decorated-readonly-field",
   *                               "decorated-readonly-field",
   *                               "static-readonly-field",
   *                               "public-static-readonly-field",
   *                               "instance-readonly-field",
   *                               "public-instance-readonly-field",
   *                               "abstract-readonly-field",
   *                               "public-abstract-readonly-field",
   *                               "protected-readonly-field",
   *                               "protected-decorated-readonly-field",
   *                               "protected-static-readonly-field",
   *                               "protected-instance-readonly-field",
   *                               "protected-abstract-readonly-field",
   *                               "private-readonly-field",
   *                               "private-decorated-readonly-field",
   *                               "private-static-readonly-field",
   *                               "private-instance-readonly-field",
   *                               "#private-readonly-field",
   *                               "#private-static-readonly-field",
   *                               "#private-instance-readonly-field",
   *                               "field",
   *                               "public-field",
   *                               "public-decorated-field",
   *                               "decorated-field",
   *                               "static-field",
   *                               "public-static-field",
   *                               "instance-field",
   *                               "public-instance-field",
   *                               "abstract-field",
   *                               "public-abstract-field",
   *                               "protected-field",
   *                               "protected-decorated-field",
   *                               "protected-static-field",
   *                               "protected-instance-field",
   *                               "protected-abstract-field",
   *                               "private-field",
   *                               "private-decorated-field",
   *                               "private-static-field",
   *                               "private-instance-field",
   *                               "#private-field",
   *                               "#private-static-field",
   *                               "#private-instance-field",
   *                               "method",
   *                               "public-method",
   *                               "public-decorated-method",
   *                               "decorated-method",
   *                               "static-method",
   *                               "public-static-method",
   *                               "instance-method",
   *                               "public-instance-method",
   *                               "abstract-method",
   *                               "public-abstract-method",
   *                               "protected-method",
   *                               "protected-decorated-method",
   *                               "protected-static-method",
   *                               "protected-instance-method",
   *                               "protected-abstract-method",
   *                               "private-method",
   *                               "private-decorated-method",
   *                               "private-static-method",
   *                               "private-instance-method",
   *                               "#private-method",
   *                               "#private-static-method",
   *                               "#private-instance-method",
   *                               "call-signature",
   *                               "constructor",
   *                               "public-constructor",
   *                               "protected-constructor",
   *                               "private-constructor",
   *                               "get",
   *                               "public-get",
   *                               "public-decorated-get",
   *                               "decorated-get",
   *                               "static-get",
   *                               "public-static-get",
   *                               "instance-get",
   *                               "public-instance-get",
   *                               "abstract-get",
   *                               "public-abstract-get",
   *                               "protected-get",
   *                               "protected-decorated-get",
   *                               "protected-static-get",
   *                               "protected-instance-get",
   *                               "protected-abstract-get",
   *                               "private-get",
   *                               "private-decorated-get",
   *                               "private-static-get",
   *                               "private-instance-get",
   *                               "#private-get",
   *                               "#private-static-get",
   *                               "#private-instance-get",
   *                               "set",
   *                               "public-set",
   *                               "public-decorated-set",
   *                               "decorated-set",
   *                               "static-set",
   *                               "public-static-set",
   *                               "instance-set",
   *                               "public-instance-set",
   *                               "abstract-set",
   *                               "public-abstract-set",
   *                               "protected-set",
   *                               "protected-decorated-set",
   *                               "protected-static-set",
   *                               "protected-instance-set",
   *                               "protected-abstract-set",
   *                               "private-set",
   *                               "private-decorated-set",
   *                               "private-static-set",
   *                               "private-instance-set",
   *                               "#private-set",
   *                               "#private-static-set",
   *                               "#private-instance-set",
   *                               "static-initialization",
   *                               "static-static-initialization",
   *                               "public-static-static-initialization",
   *                               "instance-static-initialization",
   *                               "public-instance-static-initialization",
   *                               "abstract-static-initialization",
   *                               "public-abstract-static-initialization",
   *                               "protected-static-static-initialization",
   *                               "protected-instance-static-initialization",
   *                               "protected-abstract-static-initialization",
   *                               "private-static-static-initialization",
   *                               "private-instance-static-initialization",
   *                               "#private-static-static-initialization",
   *                               "#private-instance-static-initialization"
   *                             ]
   *                           }
   *                         }
   *                       ]
   *                     }
   *                   },
   *                   {
   *                     "type": "string",
   *                     "enum": [
   *                       "never"
   *                     ]
   *                   }
   *                 ]
   *               },
   *               "order": {
   *                 "type": "string",
   *                 "enum": [
   *                   "alphabetically",
   *                   "alphabetically-case-insensitive",
   *                   "as-written",
   *                   "natural",
   *                   "natural-case-insensitive"
   *                 ]
   *               },
   *               "optionalityOrder": {
   *                 "type": "string",
   *                 "enum": [
   *                   "optional-first",
   *                   "required-first"
   *                 ]
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         ]
   *       },
   *       "classes": {
   *         "oneOf": [
   *           {
   *             "type": "string",
   *             "enum": [
   *               "never"
   *             ]
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "oneOf": [
   *                 {
   *                   "enum": [
   *                     "readonly-signature",
   *                     "signature",
   *                     "readonly-field",
   *                     "public-readonly-field",
   *                     "public-decorated-readonly-field",
   *                     "decorated-readonly-field",
   *                     "static-readonly-field",
   *                     "public-static-readonly-field",
   *                     "instance-readonly-field",
   *                     "public-instance-readonly-field",
   *                     "abstract-readonly-field",
   *                     "public-abstract-readonly-field",
   *                     "protected-readonly-field",
   *                     "protected-decorated-readonly-field",
   *                     "protected-static-readonly-field",
   *                     "protected-instance-readonly-field",
   *                     "protected-abstract-readonly-field",
   *                     "private-readonly-field",
   *                     "private-decorated-readonly-field",
   *                     "private-static-readonly-field",
   *                     "private-instance-readonly-field",
   *                     "#private-readonly-field",
   *                     "#private-static-readonly-field",
   *                     "#private-instance-readonly-field",
   *                     "field",
   *                     "public-field",
   *                     "public-decorated-field",
   *                     "decorated-field",
   *                     "static-field",
   *                     "public-static-field",
   *                     "instance-field",
   *                     "public-instance-field",
   *                     "abstract-field",
   *                     "public-abstract-field",
   *                     "protected-field",
   *                     "protected-decorated-field",
   *                     "protected-static-field",
   *                     "protected-instance-field",
   *                     "protected-abstract-field",
   *                     "private-field",
   *                     "private-decorated-field",
   *                     "private-static-field",
   *                     "private-instance-field",
   *                     "#private-field",
   *                     "#private-static-field",
   *                     "#private-instance-field",
   *                     "method",
   *                     "public-method",
   *                     "public-decorated-method",
   *                     "decorated-method",
   *                     "static-method",
   *                     "public-static-method",
   *                     "instance-method",
   *                     "public-instance-method",
   *                     "abstract-method",
   *                     "public-abstract-method",
   *                     "protected-method",
   *                     "protected-decorated-method",
   *                     "protected-static-method",
   *                     "protected-instance-method",
   *                     "protected-abstract-method",
   *                     "private-method",
   *                     "private-decorated-method",
   *                     "private-static-method",
   *                     "private-instance-method",
   *                     "#private-method",
   *                     "#private-static-method",
   *                     "#private-instance-method",
   *                     "call-signature",
   *                     "constructor",
   *                     "public-constructor",
   *                     "protected-constructor",
   *                     "private-constructor",
   *                     "get",
   *                     "public-get",
   *                     "public-decorated-get",
   *                     "decorated-get",
   *                     "static-get",
   *                     "public-static-get",
   *                     "instance-get",
   *                     "public-instance-get",
   *                     "abstract-get",
   *                     "public-abstract-get",
   *                     "protected-get",
   *                     "protected-decorated-get",
   *                     "protected-static-get",
   *                     "protected-instance-get",
   *                     "protected-abstract-get",
   *                     "private-get",
   *                     "private-decorated-get",
   *                     "private-static-get",
   *                     "private-instance-get",
   *                     "#private-get",
   *                     "#private-static-get",
   *                     "#private-instance-get",
   *                     "set",
   *                     "public-set",
   *                     "public-decorated-set",
   *                     "decorated-set",
   *                     "static-set",
   *                     "public-static-set",
   *                     "instance-set",
   *                     "public-instance-set",
   *                     "abstract-set",
   *                     "public-abstract-set",
   *                     "protected-set",
   *                     "protected-decorated-set",
   *                     "protected-static-set",
   *                     "protected-instance-set",
   *                     "protected-abstract-set",
   *                     "private-set",
   *                     "private-decorated-set",
   *                     "private-static-set",
   *                     "private-instance-set",
   *                     "#private-set",
   *                     "#private-static-set",
   *                     "#private-instance-set",
   *                     "static-initialization",
   *                     "static-static-initialization",
   *                     "public-static-static-initialization",
   *                     "instance-static-initialization",
   *                     "public-instance-static-initialization",
   *                     "abstract-static-initialization",
   *                     "public-abstract-static-initialization",
   *                     "protected-static-static-initialization",
   *                     "protected-instance-static-initialization",
   *                     "protected-abstract-static-initialization",
   *                     "private-static-static-initialization",
   *                     "private-instance-static-initialization",
   *                     "#private-static-static-initialization",
   *                     "#private-instance-static-initialization"
   *                   ]
   *                 },
   *                 {
   *                   "type": "array",
   *                   "items": {
   *                     "enum": [
   *                       "readonly-signature",
   *                       "signature",
   *                       "readonly-field",
   *                       "public-readonly-field",
   *                       "public-decorated-readonly-field",
   *                       "decorated-readonly-field",
   *                       "static-readonly-field",
   *                       "public-static-readonly-field",
   *                       "instance-readonly-field",
   *                       "public-instance-readonly-field",
   *                       "abstract-readonly-field",
   *                       "public-abstract-readonly-field",
   *                       "protected-readonly-field",
   *                       "protected-decorated-readonly-field",
   *                       "protected-static-readonly-field",
   *                       "protected-instance-readonly-field",
   *                       "protected-abstract-readonly-field",
   *                       "private-readonly-field",
   *                       "private-decorated-readonly-field",
   *                       "private-static-readonly-field",
   *                       "private-instance-readonly-field",
   *                       "#private-readonly-field",
   *                       "#private-static-readonly-field",
   *                       "#private-instance-readonly-field",
   *                       "field",
   *                       "public-field",
   *                       "public-decorated-field",
   *                       "decorated-field",
   *                       "static-field",
   *                       "public-static-field",
   *                       "instance-field",
   *                       "public-instance-field",
   *                       "abstract-field",
   *                       "public-abstract-field",
   *                       "protected-field",
   *                       "protected-decorated-field",
   *                       "protected-static-field",
   *                       "protected-instance-field",
   *                       "protected-abstract-field",
   *                       "private-field",
   *                       "private-decorated-field",
   *                       "private-static-field",
   *                       "private-instance-field",
   *                       "#private-field",
   *                       "#private-static-field",
   *                       "#private-instance-field",
   *                       "method",
   *                       "public-method",
   *                       "public-decorated-method",
   *                       "decorated-method",
   *                       "static-method",
   *                       "public-static-method",
   *                       "instance-method",
   *                       "public-instance-method",
   *                       "abstract-method",
   *                       "public-abstract-method",
   *                       "protected-method",
   *                       "protected-decorated-method",
   *                       "protected-static-method",
   *                       "protected-instance-method",
   *                       "protected-abstract-method",
   *                       "private-method",
   *                       "private-decorated-method",
   *                       "private-static-method",
   *                       "private-instance-method",
   *                       "#private-method",
   *                       "#private-static-method",
   *                       "#private-instance-method",
   *                       "call-signature",
   *                       "constructor",
   *                       "public-constructor",
   *                       "protected-constructor",
   *                       "private-constructor",
   *                       "get",
   *                       "public-get",
   *                       "public-decorated-get",
   *                       "decorated-get",
   *                       "static-get",
   *                       "public-static-get",
   *                       "instance-get",
   *                       "public-instance-get",
   *                       "abstract-get",
   *                       "public-abstract-get",
   *                       "protected-get",
   *                       "protected-decorated-get",
   *                       "protected-static-get",
   *                       "protected-instance-get",
   *                       "protected-abstract-get",
   *                       "private-get",
   *                       "private-decorated-get",
   *                       "private-static-get",
   *                       "private-instance-get",
   *                       "#private-get",
   *                       "#private-static-get",
   *                       "#private-instance-get",
   *                       "set",
   *                       "public-set",
   *                       "public-decorated-set",
   *                       "decorated-set",
   *                       "static-set",
   *                       "public-static-set",
   *                       "instance-set",
   *                       "public-instance-set",
   *                       "abstract-set",
   *                       "public-abstract-set",
   *                       "protected-set",
   *                       "protected-decorated-set",
   *                       "protected-static-set",
   *                       "protected-instance-set",
   *                       "protected-abstract-set",
   *                       "private-set",
   *                       "private-decorated-set",
   *                       "private-static-set",
   *                       "private-instance-set",
   *                       "#private-set",
   *                       "#private-static-set",
   *                       "#private-instance-set",
   *                       "static-initialization",
   *                       "static-static-initialization",
   *                       "public-static-static-initialization",
   *                       "instance-static-initialization",
   *                       "public-instance-static-initialization",
   *                       "abstract-static-initialization",
   *                       "public-abstract-static-initialization",
   *                       "protected-static-static-initialization",
   *                       "protected-instance-static-initialization",
   *                       "protected-abstract-static-initialization",
   *                       "private-static-static-initialization",
   *                       "private-instance-static-initialization",
   *                       "#private-static-static-initialization",
   *                       "#private-instance-static-initialization"
   *                     ]
   *                   }
   *                 }
   *               ]
   *             }
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "memberTypes": {
   *                 "oneOf": [
   *                   {
   *                     "type": "array",
   *                     "items": {
   *                       "oneOf": [
   *                         {
   *                           "enum": [
   *                             "readonly-signature",
   *                             "signature",
   *                             "readonly-field",
   *                             "public-readonly-field",
   *                             "public-decorated-readonly-field",
   *                             "decorated-readonly-field",
   *                             "static-readonly-field",
   *                             "public-static-readonly-field",
   *                             "instance-readonly-field",
   *                             "public-instance-readonly-field",
   *                             "abstract-readonly-field",
   *                             "public-abstract-readonly-field",
   *                             "protected-readonly-field",
   *                             "protected-decorated-readonly-field",
   *                             "protected-static-readonly-field",
   *                             "protected-instance-readonly-field",
   *                             "protected-abstract-readonly-field",
   *                             "private-readonly-field",
   *                             "private-decorated-readonly-field",
   *                             "private-static-readonly-field",
   *                             "private-instance-readonly-field",
   *                             "#private-readonly-field",
   *                             "#private-static-readonly-field",
   *                             "#private-instance-readonly-field",
   *                             "field",
   *                             "public-field",
   *                             "public-decorated-field",
   *                             "decorated-field",
   *                             "static-field",
   *                             "public-static-field",
   *                             "instance-field",
   *                             "public-instance-field",
   *                             "abstract-field",
   *                             "public-abstract-field",
   *                             "protected-field",
   *                             "protected-decorated-field",
   *                             "protected-static-field",
   *                             "protected-instance-field",
   *                             "protected-abstract-field",
   *                             "private-field",
   *                             "private-decorated-field",
   *                             "private-static-field",
   *                             "private-instance-field",
   *                             "#private-field",
   *                             "#private-static-field",
   *                             "#private-instance-field",
   *                             "method",
   *                             "public-method",
   *                             "public-decorated-method",
   *                             "decorated-method",
   *                             "static-method",
   *                             "public-static-method",
   *                             "instance-method",
   *                             "public-instance-method",
   *                             "abstract-method",
   *                             "public-abstract-method",
   *                             "protected-method",
   *                             "protected-decorated-method",
   *                             "protected-static-method",
   *                             "protected-instance-method",
   *                             "protected-abstract-method",
   *                             "private-method",
   *                             "private-decorated-method",
   *                             "private-static-method",
   *                             "private-instance-method",
   *                             "#private-method",
   *                             "#private-static-method",
   *                             "#private-instance-method",
   *                             "call-signature",
   *                             "constructor",
   *                             "public-constructor",
   *                             "protected-constructor",
   *                             "private-constructor",
   *                             "get",
   *                             "public-get",
   *                             "public-decorated-get",
   *                             "decorated-get",
   *                             "static-get",
   *                             "public-static-get",
   *                             "instance-get",
   *                             "public-instance-get",
   *                             "abstract-get",
   *                             "public-abstract-get",
   *                             "protected-get",
   *                             "protected-decorated-get",
   *                             "protected-static-get",
   *                             "protected-instance-get",
   *                             "protected-abstract-get",
   *                             "private-get",
   *                             "private-decorated-get",
   *                             "private-static-get",
   *                             "private-instance-get",
   *                             "#private-get",
   *                             "#private-static-get",
   *                             "#private-instance-get",
   *                             "set",
   *                             "public-set",
   *                             "public-decorated-set",
   *                             "decorated-set",
   *                             "static-set",
   *                             "public-static-set",
   *                             "instance-set",
   *                             "public-instance-set",
   *                             "abstract-set",
   *                             "public-abstract-set",
   *                             "protected-set",
   *                             "protected-decorated-set",
   *                             "protected-static-set",
   *                             "protected-instance-set",
   *                             "protected-abstract-set",
   *                             "private-set",
   *                             "private-decorated-set",
   *                             "private-static-set",
   *                             "private-instance-set",
   *                             "#private-set",
   *                             "#private-static-set",
   *                             "#private-instance-set",
   *                             "static-initialization",
   *                             "static-static-initialization",
   *                             "public-static-static-initialization",
   *                             "instance-static-initialization",
   *                             "public-instance-static-initialization",
   *                             "abstract-static-initialization",
   *                             "public-abstract-static-initialization",
   *                             "protected-static-static-initialization",
   *                             "protected-instance-static-initialization",
   *                             "protected-abstract-static-initialization",
   *                             "private-static-static-initialization",
   *                             "private-instance-static-initialization",
   *                             "#private-static-static-initialization",
   *                             "#private-instance-static-initialization"
   *                           ]
   *                         },
   *                         {
   *                           "type": "array",
   *                           "items": {
   *                             "enum": [
   *                               "readonly-signature",
   *                               "signature",
   *                               "readonly-field",
   *                               "public-readonly-field",
   *                               "public-decorated-readonly-field",
   *                               "decorated-readonly-field",
   *                               "static-readonly-field",
   *                               "public-static-readonly-field",
   *                               "instance-readonly-field",
   *                               "public-instance-readonly-field",
   *                               "abstract-readonly-field",
   *                               "public-abstract-readonly-field",
   *                               "protected-readonly-field",
   *                               "protected-decorated-readonly-field",
   *                               "protected-static-readonly-field",
   *                               "protected-instance-readonly-field",
   *                               "protected-abstract-readonly-field",
   *                               "private-readonly-field",
   *                               "private-decorated-readonly-field",
   *                               "private-static-readonly-field",
   *                               "private-instance-readonly-field",
   *                               "#private-readonly-field",
   *                               "#private-static-readonly-field",
   *                               "#private-instance-readonly-field",
   *                               "field",
   *                               "public-field",
   *                               "public-decorated-field",
   *                               "decorated-field",
   *                               "static-field",
   *                               "public-static-field",
   *                               "instance-field",
   *                               "public-instance-field",
   *                               "abstract-field",
   *                               "public-abstract-field",
   *                               "protected-field",
   *                               "protected-decorated-field",
   *                               "protected-static-field",
   *                               "protected-instance-field",
   *                               "protected-abstract-field",
   *                               "private-field",
   *                               "private-decorated-field",
   *                               "private-static-field",
   *                               "private-instance-field",
   *                               "#private-field",
   *                               "#private-static-field",
   *                               "#private-instance-field",
   *                               "method",
   *                               "public-method",
   *                               "public-decorated-method",
   *                               "decorated-method",
   *                               "static-method",
   *                               "public-static-method",
   *                               "instance-method",
   *                               "public-instance-method",
   *                               "abstract-method",
   *                               "public-abstract-method",
   *                               "protected-method",
   *                               "protected-decorated-method",
   *                               "protected-static-method",
   *                               "protected-instance-method",
   *                               "protected-abstract-method",
   *                               "private-method",
   *                               "private-decorated-method",
   *                               "private-static-method",
   *                               "private-instance-method",
   *                               "#private-method",
   *                               "#private-static-method",
   *                               "#private-instance-method",
   *                               "call-signature",
   *                               "constructor",
   *                               "public-constructor",
   *                               "protected-constructor",
   *                               "private-constructor",
   *                               "get",
   *                               "public-get",
   *                               "public-decorated-get",
   *                               "decorated-get",
   *                               "static-get",
   *                               "public-static-get",
   *                               "instance-get",
   *                               "public-instance-get",
   *                               "abstract-get",
   *                               "public-abstract-get",
   *                               "protected-get",
   *                               "protected-decorated-get",
   *                               "protected-static-get",
   *                               "protected-instance-get",
   *                               "protected-abstract-get",
   *                               "private-get",
   *                               "private-decorated-get",
   *                               "private-static-get",
   *                               "private-instance-get",
   *                               "#private-get",
   *                               "#private-static-get",
   *                               "#private-instance-get",
   *                               "set",
   *                               "public-set",
   *                               "public-decorated-set",
   *                               "decorated-set",
   *                               "static-set",
   *                               "public-static-set",
   *                               "instance-set",
   *                               "public-instance-set",
   *                               "abstract-set",
   *                               "public-abstract-set",
   *                               "protected-set",
   *                               "protected-decorated-set",
   *                               "protected-static-set",
   *                               "protected-instance-set",
   *                               "protected-abstract-set",
   *                               "private-set",
   *                               "private-decorated-set",
   *                               "private-static-set",
   *                               "private-instance-set",
   *                               "#private-set",
   *                               "#private-static-set",
   *                               "#private-instance-set",
   *                               "static-initialization",
   *                               "static-static-initialization",
   *                               "public-static-static-initialization",
   *                               "instance-static-initialization",
   *                               "public-instance-static-initialization",
   *                               "abstract-static-initialization",
   *                               "public-abstract-static-initialization",
   *                               "protected-static-static-initialization",
   *                               "protected-instance-static-initialization",
   *                               "protected-abstract-static-initialization",
   *                               "private-static-static-initialization",
   *                               "private-instance-static-initialization",
   *                               "#private-static-static-initialization",
   *                               "#private-instance-static-initialization"
   *                             ]
   *                           }
   *                         }
   *                       ]
   *                     }
   *                   },
   *                   {
   *                     "type": "string",
   *                     "enum": [
   *                       "never"
   *                     ]
   *                   }
   *                 ]
   *               },
   *               "order": {
   *                 "type": "string",
   *                 "enum": [
   *                   "alphabetically",
   *                   "alphabetically-case-insensitive",
   *                   "as-written",
   *                   "natural",
   *                   "natural-case-insensitive"
   *                 ]
   *               },
   *               "optionalityOrder": {
   *                 "type": "string",
   *                 "enum": [
   *                   "optional-first",
   *                   "required-first"
   *                 ]
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         ]
   *       },
   *       "classExpressions": {
   *         "oneOf": [
   *           {
   *             "type": "string",
   *             "enum": [
   *               "never"
   *             ]
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "oneOf": [
   *                 {
   *                   "enum": [
   *                     "readonly-signature",
   *                     "signature",
   *                     "readonly-field",
   *                     "public-readonly-field",
   *                     "public-decorated-readonly-field",
   *                     "decorated-readonly-field",
   *                     "static-readonly-field",
   *                     "public-static-readonly-field",
   *                     "instance-readonly-field",
   *                     "public-instance-readonly-field",
   *                     "abstract-readonly-field",
   *                     "public-abstract-readonly-field",
   *                     "protected-readonly-field",
   *                     "protected-decorated-readonly-field",
   *                     "protected-static-readonly-field",
   *                     "protected-instance-readonly-field",
   *                     "protected-abstract-readonly-field",
   *                     "private-readonly-field",
   *                     "private-decorated-readonly-field",
   *                     "private-static-readonly-field",
   *                     "private-instance-readonly-field",
   *                     "#private-readonly-field",
   *                     "#private-static-readonly-field",
   *                     "#private-instance-readonly-field",
   *                     "field",
   *                     "public-field",
   *                     "public-decorated-field",
   *                     "decorated-field",
   *                     "static-field",
   *                     "public-static-field",
   *                     "instance-field",
   *                     "public-instance-field",
   *                     "abstract-field",
   *                     "public-abstract-field",
   *                     "protected-field",
   *                     "protected-decorated-field",
   *                     "protected-static-field",
   *                     "protected-instance-field",
   *                     "protected-abstract-field",
   *                     "private-field",
   *                     "private-decorated-field",
   *                     "private-static-field",
   *                     "private-instance-field",
   *                     "#private-field",
   *                     "#private-static-field",
   *                     "#private-instance-field",
   *                     "method",
   *                     "public-method",
   *                     "public-decorated-method",
   *                     "decorated-method",
   *                     "static-method",
   *                     "public-static-method",
   *                     "instance-method",
   *                     "public-instance-method",
   *                     "abstract-method",
   *                     "public-abstract-method",
   *                     "protected-method",
   *                     "protected-decorated-method",
   *                     "protected-static-method",
   *                     "protected-instance-method",
   *                     "protected-abstract-method",
   *                     "private-method",
   *                     "private-decorated-method",
   *                     "private-static-method",
   *                     "private-instance-method",
   *                     "#private-method",
   *                     "#private-static-method",
   *                     "#private-instance-method",
   *                     "call-signature",
   *                     "constructor",
   *                     "public-constructor",
   *                     "protected-constructor",
   *                     "private-constructor",
   *                     "get",
   *                     "public-get",
   *                     "public-decorated-get",
   *                     "decorated-get",
   *                     "static-get",
   *                     "public-static-get",
   *                     "instance-get",
   *                     "public-instance-get",
   *                     "abstract-get",
   *                     "public-abstract-get",
   *                     "protected-get",
   *                     "protected-decorated-get",
   *                     "protected-static-get",
   *                     "protected-instance-get",
   *                     "protected-abstract-get",
   *                     "private-get",
   *                     "private-decorated-get",
   *                     "private-static-get",
   *                     "private-instance-get",
   *                     "#private-get",
   *                     "#private-static-get",
   *                     "#private-instance-get",
   *                     "set",
   *                     "public-set",
   *                     "public-decorated-set",
   *                     "decorated-set",
   *                     "static-set",
   *                     "public-static-set",
   *                     "instance-set",
   *                     "public-instance-set",
   *                     "abstract-set",
   *                     "public-abstract-set",
   *                     "protected-set",
   *                     "protected-decorated-set",
   *                     "protected-static-set",
   *                     "protected-instance-set",
   *                     "protected-abstract-set",
   *                     "private-set",
   *                     "private-decorated-set",
   *                     "private-static-set",
   *                     "private-instance-set",
   *                     "#private-set",
   *                     "#private-static-set",
   *                     "#private-instance-set",
   *                     "static-initialization",
   *                     "static-static-initialization",
   *                     "public-static-static-initialization",
   *                     "instance-static-initialization",
   *                     "public-instance-static-initialization",
   *                     "abstract-static-initialization",
   *                     "public-abstract-static-initialization",
   *                     "protected-static-static-initialization",
   *                     "protected-instance-static-initialization",
   *                     "protected-abstract-static-initialization",
   *                     "private-static-static-initialization",
   *                     "private-instance-static-initialization",
   *                     "#private-static-static-initialization",
   *                     "#private-instance-static-initialization"
   *                   ]
   *                 },
   *                 {
   *                   "type": "array",
   *                   "items": {
   *                     "enum": [
   *                       "readonly-signature",
   *                       "signature",
   *                       "readonly-field",
   *                       "public-readonly-field",
   *                       "public-decorated-readonly-field",
   *                       "decorated-readonly-field",
   *                       "static-readonly-field",
   *                       "public-static-readonly-field",
   *                       "instance-readonly-field",
   *                       "public-instance-readonly-field",
   *                       "abstract-readonly-field",
   *                       "public-abstract-readonly-field",
   *                       "protected-readonly-field",
   *                       "protected-decorated-readonly-field",
   *                       "protected-static-readonly-field",
   *                       "protected-instance-readonly-field",
   *                       "protected-abstract-readonly-field",
   *                       "private-readonly-field",
   *                       "private-decorated-readonly-field",
   *                       "private-static-readonly-field",
   *                       "private-instance-readonly-field",
   *                       "#private-readonly-field",
   *                       "#private-static-readonly-field",
   *                       "#private-instance-readonly-field",
   *                       "field",
   *                       "public-field",
   *                       "public-decorated-field",
   *                       "decorated-field",
   *                       "static-field",
   *                       "public-static-field",
   *                       "instance-field",
   *                       "public-instance-field",
   *                       "abstract-field",
   *                       "public-abstract-field",
   *                       "protected-field",
   *                       "protected-decorated-field",
   *                       "protected-static-field",
   *                       "protected-instance-field",
   *                       "protected-abstract-field",
   *                       "private-field",
   *                       "private-decorated-field",
   *                       "private-static-field",
   *                       "private-instance-field",
   *                       "#private-field",
   *                       "#private-static-field",
   *                       "#private-instance-field",
   *                       "method",
   *                       "public-method",
   *                       "public-decorated-method",
   *                       "decorated-method",
   *                       "static-method",
   *                       "public-static-method",
   *                       "instance-method",
   *                       "public-instance-method",
   *                       "abstract-method",
   *                       "public-abstract-method",
   *                       "protected-method",
   *                       "protected-decorated-method",
   *                       "protected-static-method",
   *                       "protected-instance-method",
   *                       "protected-abstract-method",
   *                       "private-method",
   *                       "private-decorated-method",
   *                       "private-static-method",
   *                       "private-instance-method",
   *                       "#private-method",
   *                       "#private-static-method",
   *                       "#private-instance-method",
   *                       "call-signature",
   *                       "constructor",
   *                       "public-constructor",
   *                       "protected-constructor",
   *                       "private-constructor",
   *                       "get",
   *                       "public-get",
   *                       "public-decorated-get",
   *                       "decorated-get",
   *                       "static-get",
   *                       "public-static-get",
   *                       "instance-get",
   *                       "public-instance-get",
   *                       "abstract-get",
   *                       "public-abstract-get",
   *                       "protected-get",
   *                       "protected-decorated-get",
   *                       "protected-static-get",
   *                       "protected-instance-get",
   *                       "protected-abstract-get",
   *                       "private-get",
   *                       "private-decorated-get",
   *                       "private-static-get",
   *                       "private-instance-get",
   *                       "#private-get",
   *                       "#private-static-get",
   *                       "#private-instance-get",
   *                       "set",
   *                       "public-set",
   *                       "public-decorated-set",
   *                       "decorated-set",
   *                       "static-set",
   *                       "public-static-set",
   *                       "instance-set",
   *                       "public-instance-set",
   *                       "abstract-set",
   *                       "public-abstract-set",
   *                       "protected-set",
   *                       "protected-decorated-set",
   *                       "protected-static-set",
   *                       "protected-instance-set",
   *                       "protected-abstract-set",
   *                       "private-set",
   *                       "private-decorated-set",
   *                       "private-static-set",
   *                       "private-instance-set",
   *                       "#private-set",
   *                       "#private-static-set",
   *                       "#private-instance-set",
   *                       "static-initialization",
   *                       "static-static-initialization",
   *                       "public-static-static-initialization",
   *                       "instance-static-initialization",
   *                       "public-instance-static-initialization",
   *                       "abstract-static-initialization",
   *                       "public-abstract-static-initialization",
   *                       "protected-static-static-initialization",
   *                       "protected-instance-static-initialization",
   *                       "protected-abstract-static-initialization",
   *                       "private-static-static-initialization",
   *                       "private-instance-static-initialization",
   *                       "#private-static-static-initialization",
   *                       "#private-instance-static-initialization"
   *                     ]
   *                   }
   *                 }
   *               ]
   *             }
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "memberTypes": {
   *                 "oneOf": [
   *                   {
   *                     "type": "array",
   *                     "items": {
   *                       "oneOf": [
   *                         {
   *                           "enum": [
   *                             "readonly-signature",
   *                             "signature",
   *                             "readonly-field",
   *                             "public-readonly-field",
   *                             "public-decorated-readonly-field",
   *                             "decorated-readonly-field",
   *                             "static-readonly-field",
   *                             "public-static-readonly-field",
   *                             "instance-readonly-field",
   *                             "public-instance-readonly-field",
   *                             "abstract-readonly-field",
   *                             "public-abstract-readonly-field",
   *                             "protected-readonly-field",
   *                             "protected-decorated-readonly-field",
   *                             "protected-static-readonly-field",
   *                             "protected-instance-readonly-field",
   *                             "protected-abstract-readonly-field",
   *                             "private-readonly-field",
   *                             "private-decorated-readonly-field",
   *                             "private-static-readonly-field",
   *                             "private-instance-readonly-field",
   *                             "#private-readonly-field",
   *                             "#private-static-readonly-field",
   *                             "#private-instance-readonly-field",
   *                             "field",
   *                             "public-field",
   *                             "public-decorated-field",
   *                             "decorated-field",
   *                             "static-field",
   *                             "public-static-field",
   *                             "instance-field",
   *                             "public-instance-field",
   *                             "abstract-field",
   *                             "public-abstract-field",
   *                             "protected-field",
   *                             "protected-decorated-field",
   *                             "protected-static-field",
   *                             "protected-instance-field",
   *                             "protected-abstract-field",
   *                             "private-field",
   *                             "private-decorated-field",
   *                             "private-static-field",
   *                             "private-instance-field",
   *                             "#private-field",
   *                             "#private-static-field",
   *                             "#private-instance-field",
   *                             "method",
   *                             "public-method",
   *                             "public-decorated-method",
   *                             "decorated-method",
   *                             "static-method",
   *                             "public-static-method",
   *                             "instance-method",
   *                             "public-instance-method",
   *                             "abstract-method",
   *                             "public-abstract-method",
   *                             "protected-method",
   *                             "protected-decorated-method",
   *                             "protected-static-method",
   *                             "protected-instance-method",
   *                             "protected-abstract-method",
   *                             "private-method",
   *                             "private-decorated-method",
   *                             "private-static-method",
   *                             "private-instance-method",
   *                             "#private-method",
   *                             "#private-static-method",
   *                             "#private-instance-method",
   *                             "call-signature",
   *                             "constructor",
   *                             "public-constructor",
   *                             "protected-constructor",
   *                             "private-constructor",
   *                             "get",
   *                             "public-get",
   *                             "public-decorated-get",
   *                             "decorated-get",
   *                             "static-get",
   *                             "public-static-get",
   *                             "instance-get",
   *                             "public-instance-get",
   *                             "abstract-get",
   *                             "public-abstract-get",
   *                             "protected-get",
   *                             "protected-decorated-get",
   *                             "protected-static-get",
   *                             "protected-instance-get",
   *                             "protected-abstract-get",
   *                             "private-get",
   *                             "private-decorated-get",
   *                             "private-static-get",
   *                             "private-instance-get",
   *                             "#private-get",
   *                             "#private-static-get",
   *                             "#private-instance-get",
   *                             "set",
   *                             "public-set",
   *                             "public-decorated-set",
   *                             "decorated-set",
   *                             "static-set",
   *                             "public-static-set",
   *                             "instance-set",
   *                             "public-instance-set",
   *                             "abstract-set",
   *                             "public-abstract-set",
   *                             "protected-set",
   *                             "protected-decorated-set",
   *                             "protected-static-set",
   *                             "protected-instance-set",
   *                             "protected-abstract-set",
   *                             "private-set",
   *                             "private-decorated-set",
   *                             "private-static-set",
   *                             "private-instance-set",
   *                             "#private-set",
   *                             "#private-static-set",
   *                             "#private-instance-set",
   *                             "static-initialization",
   *                             "static-static-initialization",
   *                             "public-static-static-initialization",
   *                             "instance-static-initialization",
   *                             "public-instance-static-initialization",
   *                             "abstract-static-initialization",
   *                             "public-abstract-static-initialization",
   *                             "protected-static-static-initialization",
   *                             "protected-instance-static-initialization",
   *                             "protected-abstract-static-initialization",
   *                             "private-static-static-initialization",
   *                             "private-instance-static-initialization",
   *                             "#private-static-static-initialization",
   *                             "#private-instance-static-initialization"
   *                           ]
   *                         },
   *                         {
   *                           "type": "array",
   *                           "items": {
   *                             "enum": [
   *                               "readonly-signature",
   *                               "signature",
   *                               "readonly-field",
   *                               "public-readonly-field",
   *                               "public-decorated-readonly-field",
   *                               "decorated-readonly-field",
   *                               "static-readonly-field",
   *                               "public-static-readonly-field",
   *                               "instance-readonly-field",
   *                               "public-instance-readonly-field",
   *                               "abstract-readonly-field",
   *                               "public-abstract-readonly-field",
   *                               "protected-readonly-field",
   *                               "protected-decorated-readonly-field",
   *                               "protected-static-readonly-field",
   *                               "protected-instance-readonly-field",
   *                               "protected-abstract-readonly-field",
   *                               "private-readonly-field",
   *                               "private-decorated-readonly-field",
   *                               "private-static-readonly-field",
   *                               "private-instance-readonly-field",
   *                               "#private-readonly-field",
   *                               "#private-static-readonly-field",
   *                               "#private-instance-readonly-field",
   *                               "field",
   *                               "public-field",
   *                               "public-decorated-field",
   *                               "decorated-field",
   *                               "static-field",
   *                               "public-static-field",
   *                               "instance-field",
   *                               "public-instance-field",
   *                               "abstract-field",
   *                               "public-abstract-field",
   *                               "protected-field",
   *                               "protected-decorated-field",
   *                               "protected-static-field",
   *                               "protected-instance-field",
   *                               "protected-abstract-field",
   *                               "private-field",
   *                               "private-decorated-field",
   *                               "private-static-field",
   *                               "private-instance-field",
   *                               "#private-field",
   *                               "#private-static-field",
   *                               "#private-instance-field",
   *                               "method",
   *                               "public-method",
   *                               "public-decorated-method",
   *                               "decorated-method",
   *                               "static-method",
   *                               "public-static-method",
   *                               "instance-method",
   *                               "public-instance-method",
   *                               "abstract-method",
   *                               "public-abstract-method",
   *                               "protected-method",
   *                               "protected-decorated-method",
   *                               "protected-static-method",
   *                               "protected-instance-method",
   *                               "protected-abstract-method",
   *                               "private-method",
   *                               "private-decorated-method",
   *                               "private-static-method",
   *                               "private-instance-method",
   *                               "#private-method",
   *                               "#private-static-method",
   *                               "#private-instance-method",
   *                               "call-signature",
   *                               "constructor",
   *                               "public-constructor",
   *                               "protected-constructor",
   *                               "private-constructor",
   *                               "get",
   *                               "public-get",
   *                               "public-decorated-get",
   *                               "decorated-get",
   *                               "static-get",
   *                               "public-static-get",
   *                               "instance-get",
   *                               "public-instance-get",
   *                               "abstract-get",
   *                               "public-abstract-get",
   *                               "protected-get",
   *                               "protected-decorated-get",
   *                               "protected-static-get",
   *                               "protected-instance-get",
   *                               "protected-abstract-get",
   *                               "private-get",
   *                               "private-decorated-get",
   *                               "private-static-get",
   *                               "private-instance-get",
   *                               "#private-get",
   *                               "#private-static-get",
   *                               "#private-instance-get",
   *                               "set",
   *                               "public-set",
   *                               "public-decorated-set",
   *                               "decorated-set",
   *                               "static-set",
   *                               "public-static-set",
   *                               "instance-set",
   *                               "public-instance-set",
   *                               "abstract-set",
   *                               "public-abstract-set",
   *                               "protected-set",
   *                               "protected-decorated-set",
   *                               "protected-static-set",
   *                               "protected-instance-set",
   *                               "protected-abstract-set",
   *                               "private-set",
   *                               "private-decorated-set",
   *                               "private-static-set",
   *                               "private-instance-set",
   *                               "#private-set",
   *                               "#private-static-set",
   *                               "#private-instance-set",
   *                               "static-initialization",
   *                               "static-static-initialization",
   *                               "public-static-static-initialization",
   *                               "instance-static-initialization",
   *                               "public-instance-static-initialization",
   *                               "abstract-static-initialization",
   *                               "public-abstract-static-initialization",
   *                               "protected-static-static-initialization",
   *                               "protected-instance-static-initialization",
   *                               "protected-abstract-static-initialization",
   *                               "private-static-static-initialization",
   *                               "private-instance-static-initialization",
   *                               "#private-static-static-initialization",
   *                               "#private-instance-static-initialization"
   *                             ]
   *                           }
   *                         }
   *                       ]
   *                     }
   *                   },
   *                   {
   *                     "type": "string",
   *                     "enum": [
   *                       "never"
   *                     ]
   *                   }
   *                 ]
   *               },
   *               "order": {
   *                 "type": "string",
   *                 "enum": [
   *                   "alphabetically",
   *                   "alphabetically-case-insensitive",
   *                   "as-written",
   *                   "natural",
   *                   "natural-case-insensitive"
   *                 ]
   *               },
   *               "optionalityOrder": {
   *                 "type": "string",
   *                 "enum": [
   *                   "optional-first",
   *                   "required-first"
   *                 ]
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         ]
   *       },
   *       "interfaces": {
   *         "oneOf": [
   *           {
   *             "type": "string",
   *             "enum": [
   *               "never"
   *             ]
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "oneOf": [
   *                 {
   *                   "enum": [
   *                     "readonly-signature",
   *                     "signature",
   *                     "readonly-field",
   *                     "field",
   *                     "method",
   *                     "constructor"
   *                   ]
   *                 },
   *                 {
   *                   "type": "array",
   *                   "items": {
   *                     "enum": [
   *                       "readonly-signature",
   *                       "signature",
   *                       "readonly-field",
   *                       "field",
   *                       "method",
   *                       "constructor"
   *                     ]
   *                   }
   *                 }
   *               ]
   *             }
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "memberTypes": {
   *                 "oneOf": [
   *                   {
   *                     "type": "array",
   *                     "items": {
   *                       "oneOf": [
   *                         {
   *                           "enum": [
   *                             "readonly-signature",
   *                             "signature",
   *                             "readonly-field",
   *                             "field",
   *                             "method",
   *                             "constructor"
   *                           ]
   *                         },
   *                         {
   *                           "type": "array",
   *                           "items": {
   *                             "enum": [
   *                               "readonly-signature",
   *                               "signature",
   *                               "readonly-field",
   *                               "field",
   *                               "method",
   *                               "constructor"
   *                             ]
   *                           }
   *                         }
   *                       ]
   *                     }
   *                   },
   *                   {
   *                     "type": "string",
   *                     "enum": [
   *                       "never"
   *                     ]
   *                   }
   *                 ]
   *               },
   *               "order": {
   *                 "type": "string",
   *                 "enum": [
   *                   "alphabetically",
   *                   "alphabetically-case-insensitive",
   *                   "as-written",
   *                   "natural",
   *                   "natural-case-insensitive"
   *                 ]
   *               },
   *               "optionalityOrder": {
   *                 "type": "string",
   *                 "enum": [
   *                   "optional-first",
   *                   "required-first"
   *                 ]
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         ]
   *       },
   *       "typeLiterals": {
   *         "oneOf": [
   *           {
   *             "type": "string",
   *             "enum": [
   *               "never"
   *             ]
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "oneOf": [
   *                 {
   *                   "enum": [
   *                     "readonly-signature",
   *                     "signature",
   *                     "readonly-field",
   *                     "field",
   *                     "method",
   *                     "constructor"
   *                   ]
   *                 },
   *                 {
   *                   "type": "array",
   *                   "items": {
   *                     "enum": [
   *                       "readonly-signature",
   *                       "signature",
   *                       "readonly-field",
   *                       "field",
   *                       "method",
   *                       "constructor"
   *                     ]
   *                   }
   *                 }
   *               ]
   *             }
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "memberTypes": {
   *                 "oneOf": [
   *                   {
   *                     "type": "array",
   *                     "items": {
   *                       "oneOf": [
   *                         {
   *                           "enum": [
   *                             "readonly-signature",
   *                             "signature",
   *                             "readonly-field",
   *                             "field",
   *                             "method",
   *                             "constructor"
   *                           ]
   *                         },
   *                         {
   *                           "type": "array",
   *                           "items": {
   *                             "enum": [
   *                               "readonly-signature",
   *                               "signature",
   *                               "readonly-field",
   *                               "field",
   *                               "method",
   *                               "constructor"
   *                             ]
   *                           }
   *                         }
   *                       ]
   *                     }
   *                   },
   *                   {
   *                     "type": "string",
   *                     "enum": [
   *                       "never"
   *                     ]
   *                   }
   *                 ]
   *               },
   *               "order": {
   *                 "type": "string",
   *                 "enum": [
   *                   "alphabetically",
   *                   "alphabetically-case-insensitive",
   *                   "as-written",
   *                   "natural",
   *                   "natural-case-insensitive"
   *                 ]
   *               },
   *               "optionalityOrder": {
   *                 "type": "string",
   *                 "enum": [
   *                   "optional-first",
   *                   "required-first"
   *                 ]
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly default?:
      | 'never'
      | readonly (
          | (
              | 'readonly-signature'
              | 'signature'
              | 'readonly-field'
              | 'public-readonly-field'
              | 'public-decorated-readonly-field'
              | 'decorated-readonly-field'
              | 'static-readonly-field'
              | 'public-static-readonly-field'
              | 'instance-readonly-field'
              | 'public-instance-readonly-field'
              | 'abstract-readonly-field'
              | 'public-abstract-readonly-field'
              | 'protected-readonly-field'
              | 'protected-decorated-readonly-field'
              | 'protected-static-readonly-field'
              | 'protected-instance-readonly-field'
              | 'protected-abstract-readonly-field'
              | 'private-readonly-field'
              | 'private-decorated-readonly-field'
              | 'private-static-readonly-field'
              | 'private-instance-readonly-field'
              | '#private-readonly-field'
              | '#private-static-readonly-field'
              | '#private-instance-readonly-field'
              | 'field'
              | 'public-field'
              | 'public-decorated-field'
              | 'decorated-field'
              | 'static-field'
              | 'public-static-field'
              | 'instance-field'
              | 'public-instance-field'
              | 'abstract-field'
              | 'public-abstract-field'
              | 'protected-field'
              | 'protected-decorated-field'
              | 'protected-static-field'
              | 'protected-instance-field'
              | 'protected-abstract-field'
              | 'private-field'
              | 'private-decorated-field'
              | 'private-static-field'
              | 'private-instance-field'
              | '#private-field'
              | '#private-static-field'
              | '#private-instance-field'
              | 'method'
              | 'public-method'
              | 'public-decorated-method'
              | 'decorated-method'
              | 'static-method'
              | 'public-static-method'
              | 'instance-method'
              | 'public-instance-method'
              | 'abstract-method'
              | 'public-abstract-method'
              | 'protected-method'
              | 'protected-decorated-method'
              | 'protected-static-method'
              | 'protected-instance-method'
              | 'protected-abstract-method'
              | 'private-method'
              | 'private-decorated-method'
              | 'private-static-method'
              | 'private-instance-method'
              | '#private-method'
              | '#private-static-method'
              | '#private-instance-method'
              | 'call-signature'
              | 'constructor'
              | 'public-constructor'
              | 'protected-constructor'
              | 'private-constructor'
              | 'get'
              | 'public-get'
              | 'public-decorated-get'
              | 'decorated-get'
              | 'static-get'
              | 'public-static-get'
              | 'instance-get'
              | 'public-instance-get'
              | 'abstract-get'
              | 'public-abstract-get'
              | 'protected-get'
              | 'protected-decorated-get'
              | 'protected-static-get'
              | 'protected-instance-get'
              | 'protected-abstract-get'
              | 'private-get'
              | 'private-decorated-get'
              | 'private-static-get'
              | 'private-instance-get'
              | '#private-get'
              | '#private-static-get'
              | '#private-instance-get'
              | 'set'
              | 'public-set'
              | 'public-decorated-set'
              | 'decorated-set'
              | 'static-set'
              | 'public-static-set'
              | 'instance-set'
              | 'public-instance-set'
              | 'abstract-set'
              | 'public-abstract-set'
              | 'protected-set'
              | 'protected-decorated-set'
              | 'protected-static-set'
              | 'protected-instance-set'
              | 'protected-abstract-set'
              | 'private-set'
              | 'private-decorated-set'
              | 'private-static-set'
              | 'private-instance-set'
              | '#private-set'
              | '#private-static-set'
              | '#private-instance-set'
              | 'static-initialization'
              | 'static-static-initialization'
              | 'public-static-static-initialization'
              | 'instance-static-initialization'
              | 'public-instance-static-initialization'
              | 'abstract-static-initialization'
              | 'public-abstract-static-initialization'
              | 'protected-static-static-initialization'
              | 'protected-instance-static-initialization'
              | 'protected-abstract-static-initialization'
              | 'private-static-static-initialization'
              | 'private-instance-static-initialization'
              | '#private-static-static-initialization'
              | '#private-instance-static-initialization'
            )
          | readonly (
              | 'readonly-signature'
              | 'signature'
              | 'readonly-field'
              | 'public-readonly-field'
              | 'public-decorated-readonly-field'
              | 'decorated-readonly-field'
              | 'static-readonly-field'
              | 'public-static-readonly-field'
              | 'instance-readonly-field'
              | 'public-instance-readonly-field'
              | 'abstract-readonly-field'
              | 'public-abstract-readonly-field'
              | 'protected-readonly-field'
              | 'protected-decorated-readonly-field'
              | 'protected-static-readonly-field'
              | 'protected-instance-readonly-field'
              | 'protected-abstract-readonly-field'
              | 'private-readonly-field'
              | 'private-decorated-readonly-field'
              | 'private-static-readonly-field'
              | 'private-instance-readonly-field'
              | '#private-readonly-field'
              | '#private-static-readonly-field'
              | '#private-instance-readonly-field'
              | 'field'
              | 'public-field'
              | 'public-decorated-field'
              | 'decorated-field'
              | 'static-field'
              | 'public-static-field'
              | 'instance-field'
              | 'public-instance-field'
              | 'abstract-field'
              | 'public-abstract-field'
              | 'protected-field'
              | 'protected-decorated-field'
              | 'protected-static-field'
              | 'protected-instance-field'
              | 'protected-abstract-field'
              | 'private-field'
              | 'private-decorated-field'
              | 'private-static-field'
              | 'private-instance-field'
              | '#private-field'
              | '#private-static-field'
              | '#private-instance-field'
              | 'method'
              | 'public-method'
              | 'public-decorated-method'
              | 'decorated-method'
              | 'static-method'
              | 'public-static-method'
              | 'instance-method'
              | 'public-instance-method'
              | 'abstract-method'
              | 'public-abstract-method'
              | 'protected-method'
              | 'protected-decorated-method'
              | 'protected-static-method'
              | 'protected-instance-method'
              | 'protected-abstract-method'
              | 'private-method'
              | 'private-decorated-method'
              | 'private-static-method'
              | 'private-instance-method'
              | '#private-method'
              | '#private-static-method'
              | '#private-instance-method'
              | 'call-signature'
              | 'constructor'
              | 'public-constructor'
              | 'protected-constructor'
              | 'private-constructor'
              | 'get'
              | 'public-get'
              | 'public-decorated-get'
              | 'decorated-get'
              | 'static-get'
              | 'public-static-get'
              | 'instance-get'
              | 'public-instance-get'
              | 'abstract-get'
              | 'public-abstract-get'
              | 'protected-get'
              | 'protected-decorated-get'
              | 'protected-static-get'
              | 'protected-instance-get'
              | 'protected-abstract-get'
              | 'private-get'
              | 'private-decorated-get'
              | 'private-static-get'
              | 'private-instance-get'
              | '#private-get'
              | '#private-static-get'
              | '#private-instance-get'
              | 'set'
              | 'public-set'
              | 'public-decorated-set'
              | 'decorated-set'
              | 'static-set'
              | 'public-static-set'
              | 'instance-set'
              | 'public-instance-set'
              | 'abstract-set'
              | 'public-abstract-set'
              | 'protected-set'
              | 'protected-decorated-set'
              | 'protected-static-set'
              | 'protected-instance-set'
              | 'protected-abstract-set'
              | 'private-set'
              | 'private-decorated-set'
              | 'private-static-set'
              | 'private-instance-set'
              | '#private-set'
              | '#private-static-set'
              | '#private-instance-set'
              | 'static-initialization'
              | 'static-static-initialization'
              | 'public-static-static-initialization'
              | 'instance-static-initialization'
              | 'public-instance-static-initialization'
              | 'abstract-static-initialization'
              | 'public-abstract-static-initialization'
              | 'protected-static-static-initialization'
              | 'protected-instance-static-initialization'
              | 'protected-abstract-static-initialization'
              | 'private-static-static-initialization'
              | 'private-instance-static-initialization'
              | '#private-static-static-initialization'
              | '#private-instance-static-initialization'
            )[]
        )[]
      | {
          readonly memberTypes?:
            | readonly (
                | (
                    | 'readonly-signature'
                    | 'signature'
                    | 'readonly-field'
                    | 'public-readonly-field'
                    | 'public-decorated-readonly-field'
                    | 'decorated-readonly-field'
                    | 'static-readonly-field'
                    | 'public-static-readonly-field'
                    | 'instance-readonly-field'
                    | 'public-instance-readonly-field'
                    | 'abstract-readonly-field'
                    | 'public-abstract-readonly-field'
                    | 'protected-readonly-field'
                    | 'protected-decorated-readonly-field'
                    | 'protected-static-readonly-field'
                    | 'protected-instance-readonly-field'
                    | 'protected-abstract-readonly-field'
                    | 'private-readonly-field'
                    | 'private-decorated-readonly-field'
                    | 'private-static-readonly-field'
                    | 'private-instance-readonly-field'
                    | '#private-readonly-field'
                    | '#private-static-readonly-field'
                    | '#private-instance-readonly-field'
                    | 'field'
                    | 'public-field'
                    | 'public-decorated-field'
                    | 'decorated-field'
                    | 'static-field'
                    | 'public-static-field'
                    | 'instance-field'
                    | 'public-instance-field'
                    | 'abstract-field'
                    | 'public-abstract-field'
                    | 'protected-field'
                    | 'protected-decorated-field'
                    | 'protected-static-field'
                    | 'protected-instance-field'
                    | 'protected-abstract-field'
                    | 'private-field'
                    | 'private-decorated-field'
                    | 'private-static-field'
                    | 'private-instance-field'
                    | '#private-field'
                    | '#private-static-field'
                    | '#private-instance-field'
                    | 'method'
                    | 'public-method'
                    | 'public-decorated-method'
                    | 'decorated-method'
                    | 'static-method'
                    | 'public-static-method'
                    | 'instance-method'
                    | 'public-instance-method'
                    | 'abstract-method'
                    | 'public-abstract-method'
                    | 'protected-method'
                    | 'protected-decorated-method'
                    | 'protected-static-method'
                    | 'protected-instance-method'
                    | 'protected-abstract-method'
                    | 'private-method'
                    | 'private-decorated-method'
                    | 'private-static-method'
                    | 'private-instance-method'
                    | '#private-method'
                    | '#private-static-method'
                    | '#private-instance-method'
                    | 'call-signature'
                    | 'constructor'
                    | 'public-constructor'
                    | 'protected-constructor'
                    | 'private-constructor'
                    | 'get'
                    | 'public-get'
                    | 'public-decorated-get'
                    | 'decorated-get'
                    | 'static-get'
                    | 'public-static-get'
                    | 'instance-get'
                    | 'public-instance-get'
                    | 'abstract-get'
                    | 'public-abstract-get'
                    | 'protected-get'
                    | 'protected-decorated-get'
                    | 'protected-static-get'
                    | 'protected-instance-get'
                    | 'protected-abstract-get'
                    | 'private-get'
                    | 'private-decorated-get'
                    | 'private-static-get'
                    | 'private-instance-get'
                    | '#private-get'
                    | '#private-static-get'
                    | '#private-instance-get'
                    | 'set'
                    | 'public-set'
                    | 'public-decorated-set'
                    | 'decorated-set'
                    | 'static-set'
                    | 'public-static-set'
                    | 'instance-set'
                    | 'public-instance-set'
                    | 'abstract-set'
                    | 'public-abstract-set'
                    | 'protected-set'
                    | 'protected-decorated-set'
                    | 'protected-static-set'
                    | 'protected-instance-set'
                    | 'protected-abstract-set'
                    | 'private-set'
                    | 'private-decorated-set'
                    | 'private-static-set'
                    | 'private-instance-set'
                    | '#private-set'
                    | '#private-static-set'
                    | '#private-instance-set'
                    | 'static-initialization'
                    | 'static-static-initialization'
                    | 'public-static-static-initialization'
                    | 'instance-static-initialization'
                    | 'public-instance-static-initialization'
                    | 'abstract-static-initialization'
                    | 'public-abstract-static-initialization'
                    | 'protected-static-static-initialization'
                    | 'protected-instance-static-initialization'
                    | 'protected-abstract-static-initialization'
                    | 'private-static-static-initialization'
                    | 'private-instance-static-initialization'
                    | '#private-static-static-initialization'
                    | '#private-instance-static-initialization'
                  )
                | readonly (
                    | 'readonly-signature'
                    | 'signature'
                    | 'readonly-field'
                    | 'public-readonly-field'
                    | 'public-decorated-readonly-field'
                    | 'decorated-readonly-field'
                    | 'static-readonly-field'
                    | 'public-static-readonly-field'
                    | 'instance-readonly-field'
                    | 'public-instance-readonly-field'
                    | 'abstract-readonly-field'
                    | 'public-abstract-readonly-field'
                    | 'protected-readonly-field'
                    | 'protected-decorated-readonly-field'
                    | 'protected-static-readonly-field'
                    | 'protected-instance-readonly-field'
                    | 'protected-abstract-readonly-field'
                    | 'private-readonly-field'
                    | 'private-decorated-readonly-field'
                    | 'private-static-readonly-field'
                    | 'private-instance-readonly-field'
                    | '#private-readonly-field'
                    | '#private-static-readonly-field'
                    | '#private-instance-readonly-field'
                    | 'field'
                    | 'public-field'
                    | 'public-decorated-field'
                    | 'decorated-field'
                    | 'static-field'
                    | 'public-static-field'
                    | 'instance-field'
                    | 'public-instance-field'
                    | 'abstract-field'
                    | 'public-abstract-field'
                    | 'protected-field'
                    | 'protected-decorated-field'
                    | 'protected-static-field'
                    | 'protected-instance-field'
                    | 'protected-abstract-field'
                    | 'private-field'
                    | 'private-decorated-field'
                    | 'private-static-field'
                    | 'private-instance-field'
                    | '#private-field'
                    | '#private-static-field'
                    | '#private-instance-field'
                    | 'method'
                    | 'public-method'
                    | 'public-decorated-method'
                    | 'decorated-method'
                    | 'static-method'
                    | 'public-static-method'
                    | 'instance-method'
                    | 'public-instance-method'
                    | 'abstract-method'
                    | 'public-abstract-method'
                    | 'protected-method'
                    | 'protected-decorated-method'
                    | 'protected-static-method'
                    | 'protected-instance-method'
                    | 'protected-abstract-method'
                    | 'private-method'
                    | 'private-decorated-method'
                    | 'private-static-method'
                    | 'private-instance-method'
                    | '#private-method'
                    | '#private-static-method'
                    | '#private-instance-method'
                    | 'call-signature'
                    | 'constructor'
                    | 'public-constructor'
                    | 'protected-constructor'
                    | 'private-constructor'
                    | 'get'
                    | 'public-get'
                    | 'public-decorated-get'
                    | 'decorated-get'
                    | 'static-get'
                    | 'public-static-get'
                    | 'instance-get'
                    | 'public-instance-get'
                    | 'abstract-get'
                    | 'public-abstract-get'
                    | 'protected-get'
                    | 'protected-decorated-get'
                    | 'protected-static-get'
                    | 'protected-instance-get'
                    | 'protected-abstract-get'
                    | 'private-get'
                    | 'private-decorated-get'
                    | 'private-static-get'
                    | 'private-instance-get'
                    | '#private-get'
                    | '#private-static-get'
                    | '#private-instance-get'
                    | 'set'
                    | 'public-set'
                    | 'public-decorated-set'
                    | 'decorated-set'
                    | 'static-set'
                    | 'public-static-set'
                    | 'instance-set'
                    | 'public-instance-set'
                    | 'abstract-set'
                    | 'public-abstract-set'
                    | 'protected-set'
                    | 'protected-decorated-set'
                    | 'protected-static-set'
                    | 'protected-instance-set'
                    | 'protected-abstract-set'
                    | 'private-set'
                    | 'private-decorated-set'
                    | 'private-static-set'
                    | 'private-instance-set'
                    | '#private-set'
                    | '#private-static-set'
                    | '#private-instance-set'
                    | 'static-initialization'
                    | 'static-static-initialization'
                    | 'public-static-static-initialization'
                    | 'instance-static-initialization'
                    | 'public-instance-static-initialization'
                    | 'abstract-static-initialization'
                    | 'public-abstract-static-initialization'
                    | 'protected-static-static-initialization'
                    | 'protected-instance-static-initialization'
                    | 'protected-abstract-static-initialization'
                    | 'private-static-static-initialization'
                    | 'private-instance-static-initialization'
                    | '#private-static-static-initialization'
                    | '#private-instance-static-initialization'
                  )[]
              )[]
            | 'never';
          readonly order?:
            | 'alphabetically'
            | 'alphabetically-case-insensitive'
            | 'as-written'
            | 'natural'
            | 'natural-case-insensitive';
          readonly optionalityOrder?: 'optional-first' | 'required-first';
        };
    readonly classes?:
      | 'never'
      | readonly (
          | (
              | 'readonly-signature'
              | 'signature'
              | 'readonly-field'
              | 'public-readonly-field'
              | 'public-decorated-readonly-field'
              | 'decorated-readonly-field'
              | 'static-readonly-field'
              | 'public-static-readonly-field'
              | 'instance-readonly-field'
              | 'public-instance-readonly-field'
              | 'abstract-readonly-field'
              | 'public-abstract-readonly-field'
              | 'protected-readonly-field'
              | 'protected-decorated-readonly-field'
              | 'protected-static-readonly-field'
              | 'protected-instance-readonly-field'
              | 'protected-abstract-readonly-field'
              | 'private-readonly-field'
              | 'private-decorated-readonly-field'
              | 'private-static-readonly-field'
              | 'private-instance-readonly-field'
              | '#private-readonly-field'
              | '#private-static-readonly-field'
              | '#private-instance-readonly-field'
              | 'field'
              | 'public-field'
              | 'public-decorated-field'
              | 'decorated-field'
              | 'static-field'
              | 'public-static-field'
              | 'instance-field'
              | 'public-instance-field'
              | 'abstract-field'
              | 'public-abstract-field'
              | 'protected-field'
              | 'protected-decorated-field'
              | 'protected-static-field'
              | 'protected-instance-field'
              | 'protected-abstract-field'
              | 'private-field'
              | 'private-decorated-field'
              | 'private-static-field'
              | 'private-instance-field'
              | '#private-field'
              | '#private-static-field'
              | '#private-instance-field'
              | 'method'
              | 'public-method'
              | 'public-decorated-method'
              | 'decorated-method'
              | 'static-method'
              | 'public-static-method'
              | 'instance-method'
              | 'public-instance-method'
              | 'abstract-method'
              | 'public-abstract-method'
              | 'protected-method'
              | 'protected-decorated-method'
              | 'protected-static-method'
              | 'protected-instance-method'
              | 'protected-abstract-method'
              | 'private-method'
              | 'private-decorated-method'
              | 'private-static-method'
              | 'private-instance-method'
              | '#private-method'
              | '#private-static-method'
              | '#private-instance-method'
              | 'call-signature'
              | 'constructor'
              | 'public-constructor'
              | 'protected-constructor'
              | 'private-constructor'
              | 'get'
              | 'public-get'
              | 'public-decorated-get'
              | 'decorated-get'
              | 'static-get'
              | 'public-static-get'
              | 'instance-get'
              | 'public-instance-get'
              | 'abstract-get'
              | 'public-abstract-get'
              | 'protected-get'
              | 'protected-decorated-get'
              | 'protected-static-get'
              | 'protected-instance-get'
              | 'protected-abstract-get'
              | 'private-get'
              | 'private-decorated-get'
              | 'private-static-get'
              | 'private-instance-get'
              | '#private-get'
              | '#private-static-get'
              | '#private-instance-get'
              | 'set'
              | 'public-set'
              | 'public-decorated-set'
              | 'decorated-set'
              | 'static-set'
              | 'public-static-set'
              | 'instance-set'
              | 'public-instance-set'
              | 'abstract-set'
              | 'public-abstract-set'
              | 'protected-set'
              | 'protected-decorated-set'
              | 'protected-static-set'
              | 'protected-instance-set'
              | 'protected-abstract-set'
              | 'private-set'
              | 'private-decorated-set'
              | 'private-static-set'
              | 'private-instance-set'
              | '#private-set'
              | '#private-static-set'
              | '#private-instance-set'
              | 'static-initialization'
              | 'static-static-initialization'
              | 'public-static-static-initialization'
              | 'instance-static-initialization'
              | 'public-instance-static-initialization'
              | 'abstract-static-initialization'
              | 'public-abstract-static-initialization'
              | 'protected-static-static-initialization'
              | 'protected-instance-static-initialization'
              | 'protected-abstract-static-initialization'
              | 'private-static-static-initialization'
              | 'private-instance-static-initialization'
              | '#private-static-static-initialization'
              | '#private-instance-static-initialization'
            )
          | readonly (
              | 'readonly-signature'
              | 'signature'
              | 'readonly-field'
              | 'public-readonly-field'
              | 'public-decorated-readonly-field'
              | 'decorated-readonly-field'
              | 'static-readonly-field'
              | 'public-static-readonly-field'
              | 'instance-readonly-field'
              | 'public-instance-readonly-field'
              | 'abstract-readonly-field'
              | 'public-abstract-readonly-field'
              | 'protected-readonly-field'
              | 'protected-decorated-readonly-field'
              | 'protected-static-readonly-field'
              | 'protected-instance-readonly-field'
              | 'protected-abstract-readonly-field'
              | 'private-readonly-field'
              | 'private-decorated-readonly-field'
              | 'private-static-readonly-field'
              | 'private-instance-readonly-field'
              | '#private-readonly-field'
              | '#private-static-readonly-field'
              | '#private-instance-readonly-field'
              | 'field'
              | 'public-field'
              | 'public-decorated-field'
              | 'decorated-field'
              | 'static-field'
              | 'public-static-field'
              | 'instance-field'
              | 'public-instance-field'
              | 'abstract-field'
              | 'public-abstract-field'
              | 'protected-field'
              | 'protected-decorated-field'
              | 'protected-static-field'
              | 'protected-instance-field'
              | 'protected-abstract-field'
              | 'private-field'
              | 'private-decorated-field'
              | 'private-static-field'
              | 'private-instance-field'
              | '#private-field'
              | '#private-static-field'
              | '#private-instance-field'
              | 'method'
              | 'public-method'
              | 'public-decorated-method'
              | 'decorated-method'
              | 'static-method'
              | 'public-static-method'
              | 'instance-method'
              | 'public-instance-method'
              | 'abstract-method'
              | 'public-abstract-method'
              | 'protected-method'
              | 'protected-decorated-method'
              | 'protected-static-method'
              | 'protected-instance-method'
              | 'protected-abstract-method'
              | 'private-method'
              | 'private-decorated-method'
              | 'private-static-method'
              | 'private-instance-method'
              | '#private-method'
              | '#private-static-method'
              | '#private-instance-method'
              | 'call-signature'
              | 'constructor'
              | 'public-constructor'
              | 'protected-constructor'
              | 'private-constructor'
              | 'get'
              | 'public-get'
              | 'public-decorated-get'
              | 'decorated-get'
              | 'static-get'
              | 'public-static-get'
              | 'instance-get'
              | 'public-instance-get'
              | 'abstract-get'
              | 'public-abstract-get'
              | 'protected-get'
              | 'protected-decorated-get'
              | 'protected-static-get'
              | 'protected-instance-get'
              | 'protected-abstract-get'
              | 'private-get'
              | 'private-decorated-get'
              | 'private-static-get'
              | 'private-instance-get'
              | '#private-get'
              | '#private-static-get'
              | '#private-instance-get'
              | 'set'
              | 'public-set'
              | 'public-decorated-set'
              | 'decorated-set'
              | 'static-set'
              | 'public-static-set'
              | 'instance-set'
              | 'public-instance-set'
              | 'abstract-set'
              | 'public-abstract-set'
              | 'protected-set'
              | 'protected-decorated-set'
              | 'protected-static-set'
              | 'protected-instance-set'
              | 'protected-abstract-set'
              | 'private-set'
              | 'private-decorated-set'
              | 'private-static-set'
              | 'private-instance-set'
              | '#private-set'
              | '#private-static-set'
              | '#private-instance-set'
              | 'static-initialization'
              | 'static-static-initialization'
              | 'public-static-static-initialization'
              | 'instance-static-initialization'
              | 'public-instance-static-initialization'
              | 'abstract-static-initialization'
              | 'public-abstract-static-initialization'
              | 'protected-static-static-initialization'
              | 'protected-instance-static-initialization'
              | 'protected-abstract-static-initialization'
              | 'private-static-static-initialization'
              | 'private-instance-static-initialization'
              | '#private-static-static-initialization'
              | '#private-instance-static-initialization'
            )[]
        )[]
      | {
          readonly memberTypes?:
            | readonly (
                | (
                    | 'readonly-signature'
                    | 'signature'
                    | 'readonly-field'
                    | 'public-readonly-field'
                    | 'public-decorated-readonly-field'
                    | 'decorated-readonly-field'
                    | 'static-readonly-field'
                    | 'public-static-readonly-field'
                    | 'instance-readonly-field'
                    | 'public-instance-readonly-field'
                    | 'abstract-readonly-field'
                    | 'public-abstract-readonly-field'
                    | 'protected-readonly-field'
                    | 'protected-decorated-readonly-field'
                    | 'protected-static-readonly-field'
                    | 'protected-instance-readonly-field'
                    | 'protected-abstract-readonly-field'
                    | 'private-readonly-field'
                    | 'private-decorated-readonly-field'
                    | 'private-static-readonly-field'
                    | 'private-instance-readonly-field'
                    | '#private-readonly-field'
                    | '#private-static-readonly-field'
                    | '#private-instance-readonly-field'
                    | 'field'
                    | 'public-field'
                    | 'public-decorated-field'
                    | 'decorated-field'
                    | 'static-field'
                    | 'public-static-field'
                    | 'instance-field'
                    | 'public-instance-field'
                    | 'abstract-field'
                    | 'public-abstract-field'
                    | 'protected-field'
                    | 'protected-decorated-field'
                    | 'protected-static-field'
                    | 'protected-instance-field'
                    | 'protected-abstract-field'
                    | 'private-field'
                    | 'private-decorated-field'
                    | 'private-static-field'
                    | 'private-instance-field'
                    | '#private-field'
                    | '#private-static-field'
                    | '#private-instance-field'
                    | 'method'
                    | 'public-method'
                    | 'public-decorated-method'
                    | 'decorated-method'
                    | 'static-method'
                    | 'public-static-method'
                    | 'instance-method'
                    | 'public-instance-method'
                    | 'abstract-method'
                    | 'public-abstract-method'
                    | 'protected-method'
                    | 'protected-decorated-method'
                    | 'protected-static-method'
                    | 'protected-instance-method'
                    | 'protected-abstract-method'
                    | 'private-method'
                    | 'private-decorated-method'
                    | 'private-static-method'
                    | 'private-instance-method'
                    | '#private-method'
                    | '#private-static-method'
                    | '#private-instance-method'
                    | 'call-signature'
                    | 'constructor'
                    | 'public-constructor'
                    | 'protected-constructor'
                    | 'private-constructor'
                    | 'get'
                    | 'public-get'
                    | 'public-decorated-get'
                    | 'decorated-get'
                    | 'static-get'
                    | 'public-static-get'
                    | 'instance-get'
                    | 'public-instance-get'
                    | 'abstract-get'
                    | 'public-abstract-get'
                    | 'protected-get'
                    | 'protected-decorated-get'
                    | 'protected-static-get'
                    | 'protected-instance-get'
                    | 'protected-abstract-get'
                    | 'private-get'
                    | 'private-decorated-get'
                    | 'private-static-get'
                    | 'private-instance-get'
                    | '#private-get'
                    | '#private-static-get'
                    | '#private-instance-get'
                    | 'set'
                    | 'public-set'
                    | 'public-decorated-set'
                    | 'decorated-set'
                    | 'static-set'
                    | 'public-static-set'
                    | 'instance-set'
                    | 'public-instance-set'
                    | 'abstract-set'
                    | 'public-abstract-set'
                    | 'protected-set'
                    | 'protected-decorated-set'
                    | 'protected-static-set'
                    | 'protected-instance-set'
                    | 'protected-abstract-set'
                    | 'private-set'
                    | 'private-decorated-set'
                    | 'private-static-set'
                    | 'private-instance-set'
                    | '#private-set'
                    | '#private-static-set'
                    | '#private-instance-set'
                    | 'static-initialization'
                    | 'static-static-initialization'
                    | 'public-static-static-initialization'
                    | 'instance-static-initialization'
                    | 'public-instance-static-initialization'
                    | 'abstract-static-initialization'
                    | 'public-abstract-static-initialization'
                    | 'protected-static-static-initialization'
                    | 'protected-instance-static-initialization'
                    | 'protected-abstract-static-initialization'
                    | 'private-static-static-initialization'
                    | 'private-instance-static-initialization'
                    | '#private-static-static-initialization'
                    | '#private-instance-static-initialization'
                  )
                | readonly (
                    | 'readonly-signature'
                    | 'signature'
                    | 'readonly-field'
                    | 'public-readonly-field'
                    | 'public-decorated-readonly-field'
                    | 'decorated-readonly-field'
                    | 'static-readonly-field'
                    | 'public-static-readonly-field'
                    | 'instance-readonly-field'
                    | 'public-instance-readonly-field'
                    | 'abstract-readonly-field'
                    | 'public-abstract-readonly-field'
                    | 'protected-readonly-field'
                    | 'protected-decorated-readonly-field'
                    | 'protected-static-readonly-field'
                    | 'protected-instance-readonly-field'
                    | 'protected-abstract-readonly-field'
                    | 'private-readonly-field'
                    | 'private-decorated-readonly-field'
                    | 'private-static-readonly-field'
                    | 'private-instance-readonly-field'
                    | '#private-readonly-field'
                    | '#private-static-readonly-field'
                    | '#private-instance-readonly-field'
                    | 'field'
                    | 'public-field'
                    | 'public-decorated-field'
                    | 'decorated-field'
                    | 'static-field'
                    | 'public-static-field'
                    | 'instance-field'
                    | 'public-instance-field'
                    | 'abstract-field'
                    | 'public-abstract-field'
                    | 'protected-field'
                    | 'protected-decorated-field'
                    | 'protected-static-field'
                    | 'protected-instance-field'
                    | 'protected-abstract-field'
                    | 'private-field'
                    | 'private-decorated-field'
                    | 'private-static-field'
                    | 'private-instance-field'
                    | '#private-field'
                    | '#private-static-field'
                    | '#private-instance-field'
                    | 'method'
                    | 'public-method'
                    | 'public-decorated-method'
                    | 'decorated-method'
                    | 'static-method'
                    | 'public-static-method'
                    | 'instance-method'
                    | 'public-instance-method'
                    | 'abstract-method'
                    | 'public-abstract-method'
                    | 'protected-method'
                    | 'protected-decorated-method'
                    | 'protected-static-method'
                    | 'protected-instance-method'
                    | 'protected-abstract-method'
                    | 'private-method'
                    | 'private-decorated-method'
                    | 'private-static-method'
                    | 'private-instance-method'
                    | '#private-method'
                    | '#private-static-method'
                    | '#private-instance-method'
                    | 'call-signature'
                    | 'constructor'
                    | 'public-constructor'
                    | 'protected-constructor'
                    | 'private-constructor'
                    | 'get'
                    | 'public-get'
                    | 'public-decorated-get'
                    | 'decorated-get'
                    | 'static-get'
                    | 'public-static-get'
                    | 'instance-get'
                    | 'public-instance-get'
                    | 'abstract-get'
                    | 'public-abstract-get'
                    | 'protected-get'
                    | 'protected-decorated-get'
                    | 'protected-static-get'
                    | 'protected-instance-get'
                    | 'protected-abstract-get'
                    | 'private-get'
                    | 'private-decorated-get'
                    | 'private-static-get'
                    | 'private-instance-get'
                    | '#private-get'
                    | '#private-static-get'
                    | '#private-instance-get'
                    | 'set'
                    | 'public-set'
                    | 'public-decorated-set'
                    | 'decorated-set'
                    | 'static-set'
                    | 'public-static-set'
                    | 'instance-set'
                    | 'public-instance-set'
                    | 'abstract-set'
                    | 'public-abstract-set'
                    | 'protected-set'
                    | 'protected-decorated-set'
                    | 'protected-static-set'
                    | 'protected-instance-set'
                    | 'protected-abstract-set'
                    | 'private-set'
                    | 'private-decorated-set'
                    | 'private-static-set'
                    | 'private-instance-set'
                    | '#private-set'
                    | '#private-static-set'
                    | '#private-instance-set'
                    | 'static-initialization'
                    | 'static-static-initialization'
                    | 'public-static-static-initialization'
                    | 'instance-static-initialization'
                    | 'public-instance-static-initialization'
                    | 'abstract-static-initialization'
                    | 'public-abstract-static-initialization'
                    | 'protected-static-static-initialization'
                    | 'protected-instance-static-initialization'
                    | 'protected-abstract-static-initialization'
                    | 'private-static-static-initialization'
                    | 'private-instance-static-initialization'
                    | '#private-static-static-initialization'
                    | '#private-instance-static-initialization'
                  )[]
              )[]
            | 'never';
          readonly order?:
            | 'alphabetically'
            | 'alphabetically-case-insensitive'
            | 'as-written'
            | 'natural'
            | 'natural-case-insensitive';
          readonly optionalityOrder?: 'optional-first' | 'required-first';
        };
    readonly classExpressions?:
      | 'never'
      | readonly (
          | (
              | 'readonly-signature'
              | 'signature'
              | 'readonly-field'
              | 'public-readonly-field'
              | 'public-decorated-readonly-field'
              | 'decorated-readonly-field'
              | 'static-readonly-field'
              | 'public-static-readonly-field'
              | 'instance-readonly-field'
              | 'public-instance-readonly-field'
              | 'abstract-readonly-field'
              | 'public-abstract-readonly-field'
              | 'protected-readonly-field'
              | 'protected-decorated-readonly-field'
              | 'protected-static-readonly-field'
              | 'protected-instance-readonly-field'
              | 'protected-abstract-readonly-field'
              | 'private-readonly-field'
              | 'private-decorated-readonly-field'
              | 'private-static-readonly-field'
              | 'private-instance-readonly-field'
              | '#private-readonly-field'
              | '#private-static-readonly-field'
              | '#private-instance-readonly-field'
              | 'field'
              | 'public-field'
              | 'public-decorated-field'
              | 'decorated-field'
              | 'static-field'
              | 'public-static-field'
              | 'instance-field'
              | 'public-instance-field'
              | 'abstract-field'
              | 'public-abstract-field'
              | 'protected-field'
              | 'protected-decorated-field'
              | 'protected-static-field'
              | 'protected-instance-field'
              | 'protected-abstract-field'
              | 'private-field'
              | 'private-decorated-field'
              | 'private-static-field'
              | 'private-instance-field'
              | '#private-field'
              | '#private-static-field'
              | '#private-instance-field'
              | 'method'
              | 'public-method'
              | 'public-decorated-method'
              | 'decorated-method'
              | 'static-method'
              | 'public-static-method'
              | 'instance-method'
              | 'public-instance-method'
              | 'abstract-method'
              | 'public-abstract-method'
              | 'protected-method'
              | 'protected-decorated-method'
              | 'protected-static-method'
              | 'protected-instance-method'
              | 'protected-abstract-method'
              | 'private-method'
              | 'private-decorated-method'
              | 'private-static-method'
              | 'private-instance-method'
              | '#private-method'
              | '#private-static-method'
              | '#private-instance-method'
              | 'call-signature'
              | 'constructor'
              | 'public-constructor'
              | 'protected-constructor'
              | 'private-constructor'
              | 'get'
              | 'public-get'
              | 'public-decorated-get'
              | 'decorated-get'
              | 'static-get'
              | 'public-static-get'
              | 'instance-get'
              | 'public-instance-get'
              | 'abstract-get'
              | 'public-abstract-get'
              | 'protected-get'
              | 'protected-decorated-get'
              | 'protected-static-get'
              | 'protected-instance-get'
              | 'protected-abstract-get'
              | 'private-get'
              | 'private-decorated-get'
              | 'private-static-get'
              | 'private-instance-get'
              | '#private-get'
              | '#private-static-get'
              | '#private-instance-get'
              | 'set'
              | 'public-set'
              | 'public-decorated-set'
              | 'decorated-set'
              | 'static-set'
              | 'public-static-set'
              | 'instance-set'
              | 'public-instance-set'
              | 'abstract-set'
              | 'public-abstract-set'
              | 'protected-set'
              | 'protected-decorated-set'
              | 'protected-static-set'
              | 'protected-instance-set'
              | 'protected-abstract-set'
              | 'private-set'
              | 'private-decorated-set'
              | 'private-static-set'
              | 'private-instance-set'
              | '#private-set'
              | '#private-static-set'
              | '#private-instance-set'
              | 'static-initialization'
              | 'static-static-initialization'
              | 'public-static-static-initialization'
              | 'instance-static-initialization'
              | 'public-instance-static-initialization'
              | 'abstract-static-initialization'
              | 'public-abstract-static-initialization'
              | 'protected-static-static-initialization'
              | 'protected-instance-static-initialization'
              | 'protected-abstract-static-initialization'
              | 'private-static-static-initialization'
              | 'private-instance-static-initialization'
              | '#private-static-static-initialization'
              | '#private-instance-static-initialization'
            )
          | readonly (
              | 'readonly-signature'
              | 'signature'
              | 'readonly-field'
              | 'public-readonly-field'
              | 'public-decorated-readonly-field'
              | 'decorated-readonly-field'
              | 'static-readonly-field'
              | 'public-static-readonly-field'
              | 'instance-readonly-field'
              | 'public-instance-readonly-field'
              | 'abstract-readonly-field'
              | 'public-abstract-readonly-field'
              | 'protected-readonly-field'
              | 'protected-decorated-readonly-field'
              | 'protected-static-readonly-field'
              | 'protected-instance-readonly-field'
              | 'protected-abstract-readonly-field'
              | 'private-readonly-field'
              | 'private-decorated-readonly-field'
              | 'private-static-readonly-field'
              | 'private-instance-readonly-field'
              | '#private-readonly-field'
              | '#private-static-readonly-field'
              | '#private-instance-readonly-field'
              | 'field'
              | 'public-field'
              | 'public-decorated-field'
              | 'decorated-field'
              | 'static-field'
              | 'public-static-field'
              | 'instance-field'
              | 'public-instance-field'
              | 'abstract-field'
              | 'public-abstract-field'
              | 'protected-field'
              | 'protected-decorated-field'
              | 'protected-static-field'
              | 'protected-instance-field'
              | 'protected-abstract-field'
              | 'private-field'
              | 'private-decorated-field'
              | 'private-static-field'
              | 'private-instance-field'
              | '#private-field'
              | '#private-static-field'
              | '#private-instance-field'
              | 'method'
              | 'public-method'
              | 'public-decorated-method'
              | 'decorated-method'
              | 'static-method'
              | 'public-static-method'
              | 'instance-method'
              | 'public-instance-method'
              | 'abstract-method'
              | 'public-abstract-method'
              | 'protected-method'
              | 'protected-decorated-method'
              | 'protected-static-method'
              | 'protected-instance-method'
              | 'protected-abstract-method'
              | 'private-method'
              | 'private-decorated-method'
              | 'private-static-method'
              | 'private-instance-method'
              | '#private-method'
              | '#private-static-method'
              | '#private-instance-method'
              | 'call-signature'
              | 'constructor'
              | 'public-constructor'
              | 'protected-constructor'
              | 'private-constructor'
              | 'get'
              | 'public-get'
              | 'public-decorated-get'
              | 'decorated-get'
              | 'static-get'
              | 'public-static-get'
              | 'instance-get'
              | 'public-instance-get'
              | 'abstract-get'
              | 'public-abstract-get'
              | 'protected-get'
              | 'protected-decorated-get'
              | 'protected-static-get'
              | 'protected-instance-get'
              | 'protected-abstract-get'
              | 'private-get'
              | 'private-decorated-get'
              | 'private-static-get'
              | 'private-instance-get'
              | '#private-get'
              | '#private-static-get'
              | '#private-instance-get'
              | 'set'
              | 'public-set'
              | 'public-decorated-set'
              | 'decorated-set'
              | 'static-set'
              | 'public-static-set'
              | 'instance-set'
              | 'public-instance-set'
              | 'abstract-set'
              | 'public-abstract-set'
              | 'protected-set'
              | 'protected-decorated-set'
              | 'protected-static-set'
              | 'protected-instance-set'
              | 'protected-abstract-set'
              | 'private-set'
              | 'private-decorated-set'
              | 'private-static-set'
              | 'private-instance-set'
              | '#private-set'
              | '#private-static-set'
              | '#private-instance-set'
              | 'static-initialization'
              | 'static-static-initialization'
              | 'public-static-static-initialization'
              | 'instance-static-initialization'
              | 'public-instance-static-initialization'
              | 'abstract-static-initialization'
              | 'public-abstract-static-initialization'
              | 'protected-static-static-initialization'
              | 'protected-instance-static-initialization'
              | 'protected-abstract-static-initialization'
              | 'private-static-static-initialization'
              | 'private-instance-static-initialization'
              | '#private-static-static-initialization'
              | '#private-instance-static-initialization'
            )[]
        )[]
      | {
          readonly memberTypes?:
            | readonly (
                | (
                    | 'readonly-signature'
                    | 'signature'
                    | 'readonly-field'
                    | 'public-readonly-field'
                    | 'public-decorated-readonly-field'
                    | 'decorated-readonly-field'
                    | 'static-readonly-field'
                    | 'public-static-readonly-field'
                    | 'instance-readonly-field'
                    | 'public-instance-readonly-field'
                    | 'abstract-readonly-field'
                    | 'public-abstract-readonly-field'
                    | 'protected-readonly-field'
                    | 'protected-decorated-readonly-field'
                    | 'protected-static-readonly-field'
                    | 'protected-instance-readonly-field'
                    | 'protected-abstract-readonly-field'
                    | 'private-readonly-field'
                    | 'private-decorated-readonly-field'
                    | 'private-static-readonly-field'
                    | 'private-instance-readonly-field'
                    | '#private-readonly-field'
                    | '#private-static-readonly-field'
                    | '#private-instance-readonly-field'
                    | 'field'
                    | 'public-field'
                    | 'public-decorated-field'
                    | 'decorated-field'
                    | 'static-field'
                    | 'public-static-field'
                    | 'instance-field'
                    | 'public-instance-field'
                    | 'abstract-field'
                    | 'public-abstract-field'
                    | 'protected-field'
                    | 'protected-decorated-field'
                    | 'protected-static-field'
                    | 'protected-instance-field'
                    | 'protected-abstract-field'
                    | 'private-field'
                    | 'private-decorated-field'
                    | 'private-static-field'
                    | 'private-instance-field'
                    | '#private-field'
                    | '#private-static-field'
                    | '#private-instance-field'
                    | 'method'
                    | 'public-method'
                    | 'public-decorated-method'
                    | 'decorated-method'
                    | 'static-method'
                    | 'public-static-method'
                    | 'instance-method'
                    | 'public-instance-method'
                    | 'abstract-method'
                    | 'public-abstract-method'
                    | 'protected-method'
                    | 'protected-decorated-method'
                    | 'protected-static-method'
                    | 'protected-instance-method'
                    | 'protected-abstract-method'
                    | 'private-method'
                    | 'private-decorated-method'
                    | 'private-static-method'
                    | 'private-instance-method'
                    | '#private-method'
                    | '#private-static-method'
                    | '#private-instance-method'
                    | 'call-signature'
                    | 'constructor'
                    | 'public-constructor'
                    | 'protected-constructor'
                    | 'private-constructor'
                    | 'get'
                    | 'public-get'
                    | 'public-decorated-get'
                    | 'decorated-get'
                    | 'static-get'
                    | 'public-static-get'
                    | 'instance-get'
                    | 'public-instance-get'
                    | 'abstract-get'
                    | 'public-abstract-get'
                    | 'protected-get'
                    | 'protected-decorated-get'
                    | 'protected-static-get'
                    | 'protected-instance-get'
                    | 'protected-abstract-get'
                    | 'private-get'
                    | 'private-decorated-get'
                    | 'private-static-get'
                    | 'private-instance-get'
                    | '#private-get'
                    | '#private-static-get'
                    | '#private-instance-get'
                    | 'set'
                    | 'public-set'
                    | 'public-decorated-set'
                    | 'decorated-set'
                    | 'static-set'
                    | 'public-static-set'
                    | 'instance-set'
                    | 'public-instance-set'
                    | 'abstract-set'
                    | 'public-abstract-set'
                    | 'protected-set'
                    | 'protected-decorated-set'
                    | 'protected-static-set'
                    | 'protected-instance-set'
                    | 'protected-abstract-set'
                    | 'private-set'
                    | 'private-decorated-set'
                    | 'private-static-set'
                    | 'private-instance-set'
                    | '#private-set'
                    | '#private-static-set'
                    | '#private-instance-set'
                    | 'static-initialization'
                    | 'static-static-initialization'
                    | 'public-static-static-initialization'
                    | 'instance-static-initialization'
                    | 'public-instance-static-initialization'
                    | 'abstract-static-initialization'
                    | 'public-abstract-static-initialization'
                    | 'protected-static-static-initialization'
                    | 'protected-instance-static-initialization'
                    | 'protected-abstract-static-initialization'
                    | 'private-static-static-initialization'
                    | 'private-instance-static-initialization'
                    | '#private-static-static-initialization'
                    | '#private-instance-static-initialization'
                  )
                | readonly (
                    | 'readonly-signature'
                    | 'signature'
                    | 'readonly-field'
                    | 'public-readonly-field'
                    | 'public-decorated-readonly-field'
                    | 'decorated-readonly-field'
                    | 'static-readonly-field'
                    | 'public-static-readonly-field'
                    | 'instance-readonly-field'
                    | 'public-instance-readonly-field'
                    | 'abstract-readonly-field'
                    | 'public-abstract-readonly-field'
                    | 'protected-readonly-field'
                    | 'protected-decorated-readonly-field'
                    | 'protected-static-readonly-field'
                    | 'protected-instance-readonly-field'
                    | 'protected-abstract-readonly-field'
                    | 'private-readonly-field'
                    | 'private-decorated-readonly-field'
                    | 'private-static-readonly-field'
                    | 'private-instance-readonly-field'
                    | '#private-readonly-field'
                    | '#private-static-readonly-field'
                    | '#private-instance-readonly-field'
                    | 'field'
                    | 'public-field'
                    | 'public-decorated-field'
                    | 'decorated-field'
                    | 'static-field'
                    | 'public-static-field'
                    | 'instance-field'
                    | 'public-instance-field'
                    | 'abstract-field'
                    | 'public-abstract-field'
                    | 'protected-field'
                    | 'protected-decorated-field'
                    | 'protected-static-field'
                    | 'protected-instance-field'
                    | 'protected-abstract-field'
                    | 'private-field'
                    | 'private-decorated-field'
                    | 'private-static-field'
                    | 'private-instance-field'
                    | '#private-field'
                    | '#private-static-field'
                    | '#private-instance-field'
                    | 'method'
                    | 'public-method'
                    | 'public-decorated-method'
                    | 'decorated-method'
                    | 'static-method'
                    | 'public-static-method'
                    | 'instance-method'
                    | 'public-instance-method'
                    | 'abstract-method'
                    | 'public-abstract-method'
                    | 'protected-method'
                    | 'protected-decorated-method'
                    | 'protected-static-method'
                    | 'protected-instance-method'
                    | 'protected-abstract-method'
                    | 'private-method'
                    | 'private-decorated-method'
                    | 'private-static-method'
                    | 'private-instance-method'
                    | '#private-method'
                    | '#private-static-method'
                    | '#private-instance-method'
                    | 'call-signature'
                    | 'constructor'
                    | 'public-constructor'
                    | 'protected-constructor'
                    | 'private-constructor'
                    | 'get'
                    | 'public-get'
                    | 'public-decorated-get'
                    | 'decorated-get'
                    | 'static-get'
                    | 'public-static-get'
                    | 'instance-get'
                    | 'public-instance-get'
                    | 'abstract-get'
                    | 'public-abstract-get'
                    | 'protected-get'
                    | 'protected-decorated-get'
                    | 'protected-static-get'
                    | 'protected-instance-get'
                    | 'protected-abstract-get'
                    | 'private-get'
                    | 'private-decorated-get'
                    | 'private-static-get'
                    | 'private-instance-get'
                    | '#private-get'
                    | '#private-static-get'
                    | '#private-instance-get'
                    | 'set'
                    | 'public-set'
                    | 'public-decorated-set'
                    | 'decorated-set'
                    | 'static-set'
                    | 'public-static-set'
                    | 'instance-set'
                    | 'public-instance-set'
                    | 'abstract-set'
                    | 'public-abstract-set'
                    | 'protected-set'
                    | 'protected-decorated-set'
                    | 'protected-static-set'
                    | 'protected-instance-set'
                    | 'protected-abstract-set'
                    | 'private-set'
                    | 'private-decorated-set'
                    | 'private-static-set'
                    | 'private-instance-set'
                    | '#private-set'
                    | '#private-static-set'
                    | '#private-instance-set'
                    | 'static-initialization'
                    | 'static-static-initialization'
                    | 'public-static-static-initialization'
                    | 'instance-static-initialization'
                    | 'public-instance-static-initialization'
                    | 'abstract-static-initialization'
                    | 'public-abstract-static-initialization'
                    | 'protected-static-static-initialization'
                    | 'protected-instance-static-initialization'
                    | 'protected-abstract-static-initialization'
                    | 'private-static-static-initialization'
                    | 'private-instance-static-initialization'
                    | '#private-static-static-initialization'
                    | '#private-instance-static-initialization'
                  )[]
              )[]
            | 'never';
          readonly order?:
            | 'alphabetically'
            | 'alphabetically-case-insensitive'
            | 'as-written'
            | 'natural'
            | 'natural-case-insensitive';
          readonly optionalityOrder?: 'optional-first' | 'required-first';
        };
    readonly interfaces?:
      | 'never'
      | readonly (
          | (
              | 'readonly-signature'
              | 'signature'
              | 'readonly-field'
              | 'field'
              | 'method'
              | 'constructor'
            )
          | readonly (
              | 'readonly-signature'
              | 'signature'
              | 'readonly-field'
              | 'field'
              | 'method'
              | 'constructor'
            )[]
        )[]
      | {
          readonly memberTypes?:
            | readonly (
                | (
                    | 'readonly-signature'
                    | 'signature'
                    | 'readonly-field'
                    | 'field'
                    | 'method'
                    | 'constructor'
                  )
                | readonly (
                    | 'readonly-signature'
                    | 'signature'
                    | 'readonly-field'
                    | 'field'
                    | 'method'
                    | 'constructor'
                  )[]
              )[]
            | 'never';
          readonly order?:
            | 'alphabetically'
            | 'alphabetically-case-insensitive'
            | 'as-written'
            | 'natural'
            | 'natural-case-insensitive';
          readonly optionalityOrder?: 'optional-first' | 'required-first';
        };
    readonly typeLiterals?:
      | 'never'
      | readonly (
          | (
              | 'readonly-signature'
              | 'signature'
              | 'readonly-field'
              | 'field'
              | 'method'
              | 'constructor'
            )
          | readonly (
              | 'readonly-signature'
              | 'signature'
              | 'readonly-field'
              | 'field'
              | 'method'
              | 'constructor'
            )[]
        )[]
      | {
          readonly memberTypes?:
            | readonly (
                | (
                    | 'readonly-signature'
                    | 'signature'
                    | 'readonly-field'
                    | 'field'
                    | 'method'
                    | 'constructor'
                  )
                | readonly (
                    | 'readonly-signature'
                    | 'signature'
                    | 'readonly-field'
                    | 'field'
                    | 'method'
                    | 'constructor'
                  )[]
              )[]
            | 'never';
          readonly order?:
            | 'alphabetically'
            | 'alphabetically-case-insensitive'
            | 'as-written'
            | 'natural'
            | 'natural-case-insensitive';
          readonly optionalityOrder?: 'optional-first' | 'required-first';
        };
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce using a particular method signature syntax
 * @link https://typescript-eslint.io/rules/method-signature-style
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 */
namespace MethodSignatureStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "property",
   *       "method"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'property' | 'method';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce naming conventions for everything across a codebase
 * @link https://typescript-eslint.io/rules/naming-convention
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | recommended          | false      |
 *  | requiresTypeChecking | true       |
 */
namespace NamingConvention {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "type": "array",
   *   "items": {
   *     "oneOf": [
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "default",
   *                 "variableLike",
   *                 "memberLike",
   *                 "typeLike",
   *                 "method",
   *                 "property",
   *                 "variable",
   *                 "function",
   *                 "parameter",
   *                 "parameterProperty",
   *                 "accessor",
   *                 "enumMember",
   *                 "classMethod",
   *                 "objectLiteralMethod",
   *                 "typeMethod",
   *                 "classProperty",
   *                 "objectLiteralProperty",
   *                 "typeProperty",
   *                 "class",
   *                 "interface",
   *                 "typeAlias",
   *                 "enum",
   *                 "typeParameter"
   *               ]
   *             },
   *             "additionalItems": false
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "const",
   *                 "readonly",
   *                 "static",
   *                 "public",
   *                 "protected",
   *                 "private",
   *                 "#private",
   *                 "abstract",
   *                 "destructured",
   *                 "global",
   *                 "exported",
   *                 "unused",
   *                 "requiresQuotes",
   *                 "override",
   *                 "async"
   *               ]
   *             },
   *             "additionalItems": false
   *           },
   *           "types": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "boolean",
   *                 "string",
   *                 "number",
   *                 "function",
   *                 "array"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "default"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "const",
   *                 "readonly",
   *                 "static",
   *                 "public",
   *                 "protected",
   *                 "private",
   *                 "#private",
   *                 "abstract",
   *                 "destructured",
   *                 "global",
   *                 "exported",
   *                 "unused",
   *                 "requiresQuotes",
   *                 "override",
   *                 "async"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "variableLike"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "unused",
   *                 "async"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "variable"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "const",
   *                 "destructured",
   *                 "exported",
   *                 "global",
   *                 "unused",
   *                 "async"
   *               ]
   *             },
   *             "additionalItems": false
   *           },
   *           "types": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "boolean",
   *                 "string",
   *                 "number",
   *                 "function",
   *                 "array"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "function"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "exported",
   *                 "global",
   *                 "unused",
   *                 "async"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "parameter"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "destructured",
   *                 "unused"
   *               ]
   *             },
   *             "additionalItems": false
   *           },
   *           "types": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "boolean",
   *                 "string",
   *                 "number",
   *                 "function",
   *                 "array"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "memberLike"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "abstract",
   *                 "private",
   *                 "#private",
   *                 "protected",
   *                 "public",
   *                 "readonly",
   *                 "requiresQuotes",
   *                 "static",
   *                 "override",
   *                 "async"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "classProperty"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "abstract",
   *                 "private",
   *                 "#private",
   *                 "protected",
   *                 "public",
   *                 "readonly",
   *                 "requiresQuotes",
   *                 "static",
   *                 "override"
   *               ]
   *             },
   *             "additionalItems": false
   *           },
   *           "types": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "boolean",
   *                 "string",
   *                 "number",
   *                 "function",
   *                 "array"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "objectLiteralProperty"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "public",
   *                 "requiresQuotes"
   *               ]
   *             },
   *             "additionalItems": false
   *           },
   *           "types": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "boolean",
   *                 "string",
   *                 "number",
   *                 "function",
   *                 "array"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "typeProperty"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "public",
   *                 "readonly",
   *                 "requiresQuotes"
   *               ]
   *             },
   *             "additionalItems": false
   *           },
   *           "types": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "boolean",
   *                 "string",
   *                 "number",
   *                 "function",
   *                 "array"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "parameterProperty"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "private",
   *                 "protected",
   *                 "public",
   *                 "readonly"
   *               ]
   *             },
   *             "additionalItems": false
   *           },
   *           "types": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "boolean",
   *                 "string",
   *                 "number",
   *                 "function",
   *                 "array"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "property"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "abstract",
   *                 "private",
   *                 "#private",
   *                 "protected",
   *                 "public",
   *                 "readonly",
   *                 "requiresQuotes",
   *                 "static",
   *                 "override",
   *                 "async"
   *               ]
   *             },
   *             "additionalItems": false
   *           },
   *           "types": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "boolean",
   *                 "string",
   *                 "number",
   *                 "function",
   *                 "array"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "classMethod"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "abstract",
   *                 "private",
   *                 "#private",
   *                 "protected",
   *                 "public",
   *                 "requiresQuotes",
   *                 "static",
   *                 "override",
   *                 "async"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "objectLiteralMethod"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "public",
   *                 "requiresQuotes",
   *                 "async"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "typeMethod"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "public",
   *                 "requiresQuotes"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "method"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "abstract",
   *                 "private",
   *                 "#private",
   *                 "protected",
   *                 "public",
   *                 "requiresQuotes",
   *                 "static",
   *                 "override",
   *                 "async"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "accessor"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "abstract",
   *                 "private",
   *                 "protected",
   *                 "public",
   *                 "requiresQuotes",
   *                 "static",
   *                 "override"
   *               ]
   *             },
   *             "additionalItems": false
   *           },
   *           "types": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "boolean",
   *                 "string",
   *                 "number",
   *                 "function",
   *                 "array"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "enumMember"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "requiresQuotes"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "typeLike"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "abstract",
   *                 "exported",
   *                 "unused"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "class"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "abstract",
   *                 "exported",
   *                 "unused"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "interface"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "exported",
   *                 "unused"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "typeAlias"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "exported",
   *                 "unused"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "enum"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "exported",
   *                 "unused"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "format": {
   *             "oneOf": [
   *               {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "camelCase",
   *                     "strictCamelCase",
   *                     "PascalCase",
   *                     "StrictPascalCase",
   *                     "snake_case",
   *                     "UPPER_CASE"
   *                   ]
   *                 },
   *                 "additionalItems": false
   *               },
   *               {
   *                 "type": "null"
   *               }
   *             ]
   *           },
   *           "custom": {
   *             "type": "object",
   *             "properties": {
   *               "match": {
   *                 "type": "boolean"
   *               },
   *               "regex": {
   *                 "type": "string"
   *               }
   *             },
   *             "required": [
   *               "match",
   *               "regex"
   *             ]
   *           },
   *           "leadingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "trailingUnderscore": {
   *             "type": "string",
   *             "enum": [
   *               "forbid",
   *               "allow",
   *               "require",
   *               "requireDouble",
   *               "allowDouble",
   *               "allowSingleOrDouble"
   *             ]
   *           },
   *           "prefix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "suffix": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "minLength": 1
   *             },
   *             "additionalItems": false
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "type": "string",
   *                 "minLength": 1
   *               },
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "match": {
   *                     "type": "boolean"
   *                   },
   *                   "regex": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "required": [
   *                   "match",
   *                   "regex"
   *                 ]
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "type": "string",
   *             "enum": [
   *               "typeParameter"
   *             ]
   *           },
   *           "modifiers": {
   *             "type": "array",
   *             "items": {
   *               "type": "string",
   *               "enum": [
   *                 "unused"
   *               ]
   *             },
   *             "additionalItems": false
   *           }
   *         },
   *         "required": [
   *           "selector",
   *           "format"
   *         ],
   *         "additionalProperties": false
   *       }
   *     ]
   *   },
   *   "additionalItems": false
   * }
   * ```
   */
  export type Options = readonly (
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: readonly (
          | 'default'
          | 'variableLike'
          | 'memberLike'
          | 'typeLike'
          | 'method'
          | 'property'
          | 'variable'
          | 'function'
          | 'parameter'
          | 'parameterProperty'
          | 'accessor'
          | 'enumMember'
          | 'classMethod'
          | 'objectLiteralMethod'
          | 'typeMethod'
          | 'classProperty'
          | 'objectLiteralProperty'
          | 'typeProperty'
          | 'class'
          | 'interface'
          | 'typeAlias'
          | 'enum'
          | 'typeParameter'
        )[];
        readonly modifiers?: readonly (
          | 'const'
          | 'readonly'
          | 'static'
          | 'public'
          | 'protected'
          | 'private'
          | '#private'
          | 'abstract'
          | 'destructured'
          | 'global'
          | 'exported'
          | 'unused'
          | 'requiresQuotes'
          | 'override'
          | 'async'
        )[];
        readonly types?: readonly (
          | 'boolean'
          | 'string'
          | 'number'
          | 'function'
          | 'array'
        )[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'default';
        readonly modifiers?: readonly (
          | 'const'
          | 'readonly'
          | 'static'
          | 'public'
          | 'protected'
          | 'private'
          | '#private'
          | 'abstract'
          | 'destructured'
          | 'global'
          | 'exported'
          | 'unused'
          | 'requiresQuotes'
          | 'override'
          | 'async'
        )[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'variableLike';
        readonly modifiers?: readonly ('unused' | 'async')[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'variable';
        readonly modifiers?: readonly (
          | 'const'
          | 'destructured'
          | 'exported'
          | 'global'
          | 'unused'
          | 'async'
        )[];
        readonly types?: readonly (
          | 'boolean'
          | 'string'
          | 'number'
          | 'function'
          | 'array'
        )[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'function';
        readonly modifiers?: readonly (
          | 'exported'
          | 'global'
          | 'unused'
          | 'async'
        )[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'parameter';
        readonly modifiers?: readonly ('destructured' | 'unused')[];
        readonly types?: readonly (
          | 'boolean'
          | 'string'
          | 'number'
          | 'function'
          | 'array'
        )[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'memberLike';
        readonly modifiers?: readonly (
          | 'abstract'
          | 'private'
          | '#private'
          | 'protected'
          | 'public'
          | 'readonly'
          | 'requiresQuotes'
          | 'static'
          | 'override'
          | 'async'
        )[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'classProperty';
        readonly modifiers?: readonly (
          | 'abstract'
          | 'private'
          | '#private'
          | 'protected'
          | 'public'
          | 'readonly'
          | 'requiresQuotes'
          | 'static'
          | 'override'
        )[];
        readonly types?: readonly (
          | 'boolean'
          | 'string'
          | 'number'
          | 'function'
          | 'array'
        )[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'objectLiteralProperty';
        readonly modifiers?: readonly ('public' | 'requiresQuotes')[];
        readonly types?: readonly (
          | 'boolean'
          | 'string'
          | 'number'
          | 'function'
          | 'array'
        )[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'typeProperty';
        readonly modifiers?: readonly (
          | 'public'
          | 'readonly'
          | 'requiresQuotes'
        )[];
        readonly types?: readonly (
          | 'boolean'
          | 'string'
          | 'number'
          | 'function'
          | 'array'
        )[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'parameterProperty';
        readonly modifiers?: readonly (
          | 'private'
          | 'protected'
          | 'public'
          | 'readonly'
        )[];
        readonly types?: readonly (
          | 'boolean'
          | 'string'
          | 'number'
          | 'function'
          | 'array'
        )[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'property';
        readonly modifiers?: readonly (
          | 'abstract'
          | 'private'
          | '#private'
          | 'protected'
          | 'public'
          | 'readonly'
          | 'requiresQuotes'
          | 'static'
          | 'override'
          | 'async'
        )[];
        readonly types?: readonly (
          | 'boolean'
          | 'string'
          | 'number'
          | 'function'
          | 'array'
        )[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'classMethod';
        readonly modifiers?: readonly (
          | 'abstract'
          | 'private'
          | '#private'
          | 'protected'
          | 'public'
          | 'requiresQuotes'
          | 'static'
          | 'override'
          | 'async'
        )[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'objectLiteralMethod';
        readonly modifiers?: readonly ('public' | 'requiresQuotes' | 'async')[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'typeMethod';
        readonly modifiers?: readonly ('public' | 'requiresQuotes')[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'method';
        readonly modifiers?: readonly (
          | 'abstract'
          | 'private'
          | '#private'
          | 'protected'
          | 'public'
          | 'requiresQuotes'
          | 'static'
          | 'override'
          | 'async'
        )[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'accessor';
        readonly modifiers?: readonly (
          | 'abstract'
          | 'private'
          | 'protected'
          | 'public'
          | 'requiresQuotes'
          | 'static'
          | 'override'
        )[];
        readonly types?: readonly (
          | 'boolean'
          | 'string'
          | 'number'
          | 'function'
          | 'array'
        )[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'enumMember';
        readonly modifiers?: readonly 'requiresQuotes'[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'typeLike';
        readonly modifiers?: readonly ('abstract' | 'exported' | 'unused')[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'class';
        readonly modifiers?: readonly ('abstract' | 'exported' | 'unused')[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'interface';
        readonly modifiers?: readonly ('exported' | 'unused')[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'typeAlias';
        readonly modifiers?: readonly ('exported' | 'unused')[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'enum';
        readonly modifiers?: readonly ('exported' | 'unused')[];
      }
    | {
        readonly format:
          | readonly (
              | 'camelCase'
              | 'strictCamelCase'
              | 'PascalCase'
              | 'StrictPascalCase'
              | 'snake_case'
              | 'UPPER_CASE'
            )[]
          | null;
        readonly custom?: {
          readonly match: boolean;
          readonly regex: string;
          readonly [k: string]: unknown;
        };
        readonly leadingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly trailingUnderscore?:
          | 'forbid'
          | 'allow'
          | 'require'
          | 'requireDouble'
          | 'allowDouble'
          | 'allowSingleOrDouble';
        readonly prefix?: readonly string[];
        readonly suffix?: readonly string[];
        readonly failureMessage?: string;
        readonly filter?:
          | string
          | {
              readonly match: boolean;
              readonly regex: string;
              readonly [k: string]: unknown;
            };
        readonly selector: 'typeParameter';
        readonly modifiers?: readonly 'unused'[];
      }
  )[];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow generic `Array` constructors
 * @link https://typescript-eslint.io/rules/no-array-constructor
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | error      |
 */
namespace NoArrayConstructor {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require `.toString()` to only be called on objects which provide useful information when stringified
 * @link https://typescript-eslint.io/rules/no-base-to-string
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 */
namespace NoBaseToString {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoredTypeNames": {
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
    readonly ignoredTypeNames?: readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow non-null assertion in locations that may be confusing
 * @link https://typescript-eslint.io/rules/no-confusing-non-null-assertion
 *
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | strict  |
 */
namespace NoConfusingNonNullAssertion {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require expressions of type void to appear in statement position
 * @link https://typescript-eslint.io/rules/no-confusing-void-expression
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | fixable              | code    |
 *  | hasSuggestions       | true    |
 *  | recommended          | false   |
 *  | requiresTypeChecking | true    |
 */
namespace NoConfusingVoidExpression {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreArrowShorthand": {
   *         "type": "boolean"
   *       },
   *       "ignoreVoidOperator": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly ignoreArrowShorthand?: boolean;
    readonly ignoreVoidOperator?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow duplicate class members
 * @link https://typescript-eslint.io/rules/no-dupe-class-members
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 */
namespace NoDupeClassMembers {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow duplicate enum member values
 * @link https://typescript-eslint.io/rules/no-duplicate-enum-values
 *
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | hasSuggestions | false   |
 *  | recommended    | strict  |
 */
namespace NoDuplicateEnumValues {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow duplicate imports
 * @link https://typescript-eslint.io/rules/no-duplicate-imports
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | true    |
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
  export type RuleEntry = 'off';
}

/**
 * @description Disallow duplicate constituents of union or intersection types
 * @link https://typescript-eslint.io/rules/no-duplicate-type-constituents
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | fixable              | code       |
 *  | recommended          | false      |
 *  | requiresTypeChecking | true       |
 */
namespace NoDuplicateTypeConstituents {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "type": "object",
   *     "properties": {
   *       "ignoreIntersections": {
   *         "type": "boolean"
   *       },
   *       "ignoreUnions": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly ignoreIntersections?: boolean;
    readonly ignoreUnions?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow using the `delete` operator on computed key expressions
 * @link https://typescript-eslint.io/rules/no-dynamic-delete
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | strict     |
 */
namespace NoDynamicDelete {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow empty functions
 * @link https://typescript-eslint.io/rules/no-empty-function
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | error      |
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
   *             "private-constructors",
   *             "protected-constructors",
   *             "asyncFunctions",
   *             "asyncMethods",
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
      | 'private-constructors'
      | 'protected-constructors'
      | 'asyncFunctions'
      | 'asyncMethods'
      | 'decoratedFunctions'
      | 'overrideMethods'
    )[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow the declaration of empty interfaces
 * @link https://typescript-eslint.io/rules/no-empty-interface
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | error      |
 */
namespace NoEmptyInterface {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowSingleExtends": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowSingleExtends?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow the `any` type
 * @link https://typescript-eslint.io/rules/no-explicit-any
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | warn       |
 */
namespace NoExplicitAny {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "fixToUnknown": {
   *         "description": "Whether to enable auto-fixing in which the `any` type is converted to the `unknown` type.",
   *         "type": "boolean"
   *       },
   *       "ignoreRestArgs": {
   *         "description": "Whether to ignore rest parameter arrays.",
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether to enable auto-fixing in which the `any` type is converted to the `unknown` type.
     */
    readonly fixToUnknown?: boolean;
    /**
     * Whether to ignore rest parameter arrays.
     */
    readonly ignoreRestArgs?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow extra non-null assertions
 * @link https://typescript-eslint.io/rules/no-extra-non-null-assertion
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | fixable     | code    |
 *  | recommended | error   |
 */
namespace NoExtraNonNullAssertion {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow unnecessary parentheses
 * @link https://typescript-eslint.io/rules/no-extra-parens
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
 * @link https://typescript-eslint.io/rules/no-extra-semi
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | error      |
 */
namespace NoExtraSemi {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow classes used as namespaces
 * @link https://typescript-eslint.io/rules/no-extraneous-class
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | strict     |
 */
namespace NoExtraneousClass {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowConstructorOnly": {
   *         "description": "Whether to allow extraneous classes that contain only a constructor.",
   *         "type": "boolean"
   *       },
   *       "allowEmpty": {
   *         "description": "Whether to allow extraneous classes that have no body (i.e. are empty).",
   *         "type": "boolean"
   *       },
   *       "allowStaticOnly": {
   *         "description": "Whether to allow extraneous classes that only contain static members.",
   *         "type": "boolean"
   *       },
   *       "allowWithDecorator": {
   *         "description": "Whether to allow extraneous classes that include a decorator.",
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether to allow extraneous classes that contain only a constructor.
     */
    readonly allowConstructorOnly?: boolean;
    /**
     * Whether to allow extraneous classes that have no body (i.e. are empty).
     */
    readonly allowEmpty?: boolean;
    /**
     * Whether to allow extraneous classes that only contain static members.
     */
    readonly allowStaticOnly?: boolean;
    /**
     * Whether to allow extraneous classes that include a decorator.
     */
    readonly allowWithDecorator?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require Promise-like statements to be handled appropriately
 * @link https://typescript-eslint.io/rules/no-floating-promises
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | hasSuggestions       | true    |
 *  | recommended          | error   |
 *  | requiresTypeChecking | true    |
 */
namespace NoFloatingPromises {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreVoid": {
   *         "description": "Whether to ignore `void` expressions.",
   *         "type": "boolean"
   *       },
   *       "ignoreIIFE": {
   *         "description": "Whether to ignore async IIFEs (Immediately Invocated Function Expressions).",
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether to ignore `void` expressions.
     */
    readonly ignoreVoid?: boolean;
    /**
     * Whether to ignore async IIFEs (Immediately Invocated Function Expressions).
     */
    readonly ignoreIIFE?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow iterating over an array with a for-in loop
 * @link https://typescript-eslint.io/rules/no-for-in-array
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | recommended          | error   |
 *  | requiresTypeChecking | true    |
 */
namespace NoForInArray {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow usage of the implicit `any` type in catch clauses
 * @link https://typescript-eslint.io/rules/no-implicit-any-catch
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | true       |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 */
namespace NoImplicitAnyCatch {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowExplicitAny": {
   *         "description": "Whether to disallow specifying `: any` as the error type as well. See also `no-explicit-any`.",
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 'off';
}

/**
 * @description Disallow the use of `eval()`-like methods
 * @link https://typescript-eslint.io/rules/no-implied-eval
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | recommended          | error      |
 *  | requiresTypeChecking | true       |
 */
namespace NoImpliedEval {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce the use of top-level import type qualifier when an import only has specifiers with inline type qualifiers
 * @link https://typescript-eslint.io/rules/no-import-type-side-effects
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | fixable     | code    |
 *  | recommended | false   |
 */
namespace NoImportTypeSideEffects {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow explicit type declarations for variables or parameters initialized to a number, string, or boolean
 * @link https://typescript-eslint.io/rules/no-inferrable-types
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | error      |
 */
namespace NoInferrableTypes {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreParameters": {
   *         "type": "boolean"
   *       },
   *       "ignoreProperties": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly ignoreParameters?: boolean;
    readonly ignoreProperties?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow `this` keywords outside of classes or class-like objects
 * @link https://typescript-eslint.io/rules/no-invalid-this
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
 * @description Disallow `void` type outside of generic or return types
 * @link https://typescript-eslint.io/rules/no-invalid-void-type
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | strict  |
 */
namespace NoInvalidVoidType {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowInGenericTypeArguments": {
   *         "oneOf": [
   *           {
   *             "type": "boolean"
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
   *             },
   *             "minLength": 1
   *           }
   *         ]
   *       },
   *       "allowAsThisParameter": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowInGenericTypeArguments?: boolean | readonly string[];
    readonly allowAsThisParameter?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow function declarations that contain unsafe references inside loop statements
 * @link https://typescript-eslint.io/rules/no-loop-func
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
 * @link https://typescript-eslint.io/rules/no-loss-of-precision
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | error   |
 */
namespace NoLossOfPrecision {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow magic numbers
 * @link https://typescript-eslint.io/rules/no-magic-numbers
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
   *       },
   *       "ignoreNumericLiteralTypes": {
   *         "type": "boolean"
   *       },
   *       "ignoreEnums": {
   *         "type": "boolean"
   *       },
   *       "ignoreReadonlyClassProperties": {
   *         "type": "boolean"
   *       },
   *       "ignoreTypeIndexes": {
   *         "type": "boolean"
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
    readonly ignoreNumericLiteralTypes?: boolean;
    readonly ignoreEnums?: boolean;
    readonly ignoreReadonlyClassProperties?: boolean;
    readonly ignoreTypeIndexes?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow the `void` operator except when used to discard a value
 * @link https://typescript-eslint.io/rules/no-meaningless-void-operator
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | fixable              | code       |
 *  | hasSuggestions       | true       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 */
namespace NoMeaninglessVoidOperator {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "checkNever": {
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
    readonly checkNever?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce valid definition of `new` and `constructor`
 * @link https://typescript-eslint.io/rules/no-misused-new
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | error   |
 */
namespace NoMisusedNew {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow Promises in places not designed to handle them
 * @link https://typescript-eslint.io/rules/no-misused-promises
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | recommended          | error   |
 *  | requiresTypeChecking | true    |
 */
namespace NoMisusedPromises {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "checksConditionals": {
   *         "type": "boolean"
   *       },
   *       "checksVoidReturn": {
   *         "oneOf": [
   *           {
   *             "type": "boolean"
   *           },
   *           {
   *             "additionalProperties": false,
   *             "properties": {
   *               "arguments": {
   *                 "type": "boolean"
   *               },
   *               "attributes": {
   *                 "type": "boolean"
   *               },
   *               "properties": {
   *                 "type": "boolean"
   *               },
   *               "returns": {
   *                 "type": "boolean"
   *               },
   *               "variables": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "type": "object"
   *           }
   *         ]
   *       },
   *       "checksSpreads": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly checksConditionals?: boolean;
    readonly checksVoidReturn?:
      | boolean
      | {
          readonly arguments?: boolean;
          readonly attributes?: boolean;
          readonly properties?: boolean;
          readonly returns?: boolean;
          readonly variables?: boolean;
        };
    readonly checksSpreads?: boolean;
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow enums from having both number and string members
 * @link https://typescript-eslint.io/rules/no-mixed-enums
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | recommended          | strict  |
 *  | requiresTypeChecking | true    |
 */
namespace NoMixedEnums {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow TypeScript namespaces
 * @link https://typescript-eslint.io/rules/no-namespace
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | error      |
 */
namespace NoNamespace {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowDeclarations": {
   *         "description": "Whether to allow `declare` with custom TypeScript namespaces.",
   *         "type": "boolean"
   *       },
   *       "allowDefinitionFiles": {
   *         "description": "Whether to allow `declare` with custom TypeScript namespaces inside definition files.",
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether to allow `declare` with custom TypeScript namespaces.
     */
    readonly allowDeclarations?: boolean;
    /**
     * Whether to allow `declare` with custom TypeScript namespaces inside definition files.
     */
    readonly allowDefinitionFiles?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow non-null assertions in the left operand of a nullish coalescing operator
 * @link https://typescript-eslint.io/rules/no-non-null-asserted-nullish-coalescing
 *
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | hasSuggestions | true    |
 *  | recommended    | strict  |
 */
namespace NoNonNullAssertedNullishCoalescing {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow non-null assertions after an optional chain expression
 * @link https://typescript-eslint.io/rules/no-non-null-asserted-optional-chain
 *
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | hasSuggestions | true    |
 *  | recommended    | error   |
 */
namespace NoNonNullAssertedOptionalChain {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow non-null assertions using the `!` postfix operator
 * @link https://typescript-eslint.io/rules/no-non-null-assertion
 *
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | hasSuggestions | true    |
 *  | recommended    | warn    |
 */
namespace NoNonNullAssertion {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow the use of parameter properties in class constructors
 * @link https://typescript-eslint.io/rules/no-parameter-properties
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | true    |
 *  | recommended | false   |
 */
namespace NoParameterProperties {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allows": {
   *         "type": "array",
   *         "items": {
   *           "enum": [
   *             "readonly",
   *             "private",
   *             "protected",
   *             "public",
   *             "private readonly",
   *             "protected readonly",
   *             "public readonly"
   *           ]
   *         },
   *         "minItems": 1
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
 * @description Disallow variable redeclaration
 * @link https://typescript-eslint.io/rules/no-redeclare
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
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
   *       },
   *       "ignoreDeclarationMerge": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly builtinGlobals?: boolean;
    readonly ignoreDeclarationMerge?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow members of unions and intersections that do nothing or override type information
 * @link https://typescript-eslint.io/rules/no-redundant-type-constituents
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | recommended          | false      |
 *  | requiresTypeChecking | true       |
 */
namespace NoRedundantTypeConstituents {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow invocation of `require()`
 * @link https://typescript-eslint.io/rules/no-require-imports
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 */
namespace NoRequireImports {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow specified modules when loaded by `import`
 * @link https://typescript-eslint.io/rules/no-restricted-imports
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
   *       "items": {
   *         "anyOf": [
   *           {},
   *           {
   *             "properties": {
   *               "allowTypeImports": {
   *                 "type": "boolean",
   *                 "default": false
   *               }
   *             }
   *           }
   *         ]
   *       }
   *     },
   *     {
   *       "items": {
   *         "properties": {
   *           "paths": {
   *             "items": {
   *               "anyOf": [
   *                 {},
   *                 {
   *                   "properties": {
   *                     "allowTypeImports": {
   *                       "type": "boolean",
   *                       "default": false
   *                     }
   *                   }
   *                 }
   *               ]
   *             }
   *           },
   *           "patterns": {
   *             "anyOf": [
   *               {},
   *               {
   *                 "items": {
   *                   "properties": {
   *                     "allowTypeImports": {
   *                       "type": "boolean",
   *                       "default": false
   *                     }
   *                   }
   *                 }
   *               }
   *             ]
   *           }
   *         }
   *       }
   *     }
   *   ]
   * }
   * ```
   */
  // modified
  export type Options =
    | {
        readonly paths: readonly {
          readonly name: string;
          readonly message: string;
          readonly importNames: readonly string[];
          readonly allowTypeImports?: boolean;
        }[];
      }
    | {
        readonly paths: readonly {
          readonly name: string;
          readonly message: string;
          readonly allowTypeImports?: boolean;
        }[];
      }
    | {
        readonly paths: readonly string[];
        readonly patterns: readonly string[];
        readonly allowTypeImports?: boolean;
      }
    | {
        readonly patterns: readonly {
          readonly group: readonly string[];
          readonly message: string;
          readonly allowTypeImports?: boolean;
        }[];
      }
    | { readonly paths: readonly string[] };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow variable declarations from shadowing variables declared in the outer scope
 * @link https://typescript-eslint.io/rules/no-shadow
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
   *         "type": "boolean"
   *       },
   *       "hoist": {
   *         "enum": [
   *           "all",
   *           "functions",
   *           "never"
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
  export type Options = {
    readonly builtinGlobals?: boolean;
    readonly hoist?: 'all' | 'functions' | 'never';
    readonly allow?: readonly string[];
    readonly ignoreOnInitialization?: boolean;
    readonly ignoreTypeValueShadow?: boolean;
    readonly ignoreFunctionTypeParameterNameValueShadow?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow aliasing `this`
 * @link https://typescript-eslint.io/rules/no-this-alias
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | error      |
 */
namespace NoThisAlias {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowDestructuring": {
   *         "description": "Whether to ignore destructurings, such as `const { props, state } = this`.",
   *         "type": "boolean"
   *       },
   *       "allowedNames": {
   *         "description": "Names to ignore, such as [\"self\"] for `const self = this;`.",
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether to ignore destructurings, such as `const { props, state } = this`.
     */
    readonly allowDestructuring?: boolean;
    /**
     * Names to ignore, such as ["self"] for `const self = this;`.
     */
    readonly allowedNames?: readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow throwing literals as exceptions
 * @link https://typescript-eslint.io/rules/no-throw-literal
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | recommended          | strict  |
 *  | requiresTypeChecking | true    |
 */
namespace NoThrowLiteral {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowThrowingAny": {
   *         "type": "boolean"
   *       },
   *       "allowThrowingUnknown": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowThrowingAny?: boolean;
    readonly allowThrowingUnknown?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow type aliases
 * @link https://typescript-eslint.io/rules/no-type-alias
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoTypeAlias {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowAliases": {
   *         "description": "Whether to allow direct one-to-one type aliases.",
   *         "enum": [
   *           "always",
   *           "never",
   *           "in-unions",
   *           "in-intersections",
   *           "in-unions-and-intersections"
   *         ]
   *       },
   *       "allowCallbacks": {
   *         "description": "Whether to allow type aliases for callbacks.",
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       },
   *       "allowConditionalTypes": {
   *         "description": "Whether to allow type aliases for conditional types.",
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       },
   *       "allowConstructors": {
   *         "description": "Whether to allow type aliases with constructors.",
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       },
   *       "allowLiterals": {
   *         "description": "Whether to allow type aliases with object literal types.",
   *         "enum": [
   *           "always",
   *           "never",
   *           "in-unions",
   *           "in-intersections",
   *           "in-unions-and-intersections"
   *         ]
   *       },
   *       "allowMappedTypes": {
   *         "description": "Whether to allow type aliases with mapped types.",
   *         "enum": [
   *           "always",
   *           "never",
   *           "in-unions",
   *           "in-intersections",
   *           "in-unions-and-intersections"
   *         ]
   *       },
   *       "allowTupleTypes": {
   *         "description": "Whether to allow type aliases with tuple types.",
   *         "enum": [
   *           "always",
   *           "never",
   *           "in-unions",
   *           "in-intersections",
   *           "in-unions-and-intersections"
   *         ]
   *       },
   *       "allowGenerics": {
   *         "description": "Whether to allow type aliases with generic types.",
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
    /**
     * Whether to allow direct one-to-one type aliases.
     */
    readonly allowAliases?:
      | 'always'
      | 'never'
      | 'in-unions'
      | 'in-intersections'
      | 'in-unions-and-intersections';
    /**
     * Whether to allow type aliases for callbacks.
     */
    readonly allowCallbacks?: 'always' | 'never';
    /**
     * Whether to allow type aliases for conditional types.
     */
    readonly allowConditionalTypes?: 'always' | 'never';
    /**
     * Whether to allow type aliases with constructors.
     */
    readonly allowConstructors?: 'always' | 'never';
    /**
     * Whether to allow type aliases with object literal types.
     */
    readonly allowLiterals?:
      | 'always'
      | 'never'
      | 'in-unions'
      | 'in-intersections'
      | 'in-unions-and-intersections';
    /**
     * Whether to allow type aliases with mapped types.
     */
    readonly allowMappedTypes?:
      | 'always'
      | 'never'
      | 'in-unions'
      | 'in-intersections'
      | 'in-unions-and-intersections';
    /**
     * Whether to allow type aliases with tuple types.
     */
    readonly allowTupleTypes?:
      | 'always'
      | 'never'
      | 'in-unions'
      | 'in-intersections'
      | 'in-unions-and-intersections';
    /**
     * Whether to allow type aliases with generic types.
     */
    readonly allowGenerics?: 'always' | 'never';
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow unnecessary equality comparisons against boolean literals
 * @link https://typescript-eslint.io/rules/no-unnecessary-boolean-literal-compare
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | fixable              | code       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 */
namespace NoUnnecessaryBooleanLiteralCompare {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowComparingNullableBooleansToTrue": {
   *         "description": "Whether to allow comparisons between nullable boolean variables and `true`.",
   *         "type": "boolean"
   *       },
   *       "allowComparingNullableBooleansToFalse": {
   *         "description": "Whether to allow comparisons between nullable boolean variables and `false`.",
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether to allow comparisons between nullable boolean variables and `true`.
     */
    readonly allowComparingNullableBooleansToTrue?: boolean;
    /**
     * Whether to allow comparisons between nullable boolean variables and `false`.
     */
    readonly allowComparingNullableBooleansToFalse?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow conditionals where the type is always truthy or always falsy
 * @link https://typescript-eslint.io/rules/no-unnecessary-condition
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | fixable              | code       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 */
namespace NoUnnecessaryCondition {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowConstantLoopConditions": {
   *         "description": "Whether to ignore constant loop conditions, such as `while (true)`.",
   *         "type": "boolean"
   *       },
   *       "allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing": {
   *         "description": "Whether to not error when running with a tsconfig that has strictNullChecks turned.",
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether to ignore constant loop conditions, such as `while (true)`.
     */
    readonly allowConstantLoopConditions?: boolean;
    /**
     * Whether to not error when running with a tsconfig that has strictNullChecks turned.
     */
    readonly allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow unnecessary namespace qualifiers
 * @link https://typescript-eslint.io/rules/no-unnecessary-qualifier
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | fixable              | code       |
 *  | recommended          | false      |
 *  | requiresTypeChecking | true       |
 */
namespace NoUnnecessaryQualifier {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow type arguments that are equal to the default
 * @link https://typescript-eslint.io/rules/no-unnecessary-type-arguments
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | fixable              | code       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 */
namespace NoUnnecessaryTypeArguments {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow type assertions that do not change the type of an expression
 * @link https://typescript-eslint.io/rules/no-unnecessary-type-assertion
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | fixable              | code       |
 *  | recommended          | error      |
 *  | requiresTypeChecking | true       |
 */
namespace NoUnnecessaryTypeAssertion {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "typesToIgnore": {
   *         "description": "A list of type names to ignore.",
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * A list of type names to ignore.
     */
    readonly typesToIgnore?: readonly string[];
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow unnecessary constraints on generic types
 * @link https://typescript-eslint.io/rules/no-unnecessary-type-constraint
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | error      |
 */
namespace NoUnnecessaryTypeConstraint {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow calling a function with a value with type `any`
 * @link https://typescript-eslint.io/rules/no-unsafe-argument
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | recommended          | error   |
 *  | requiresTypeChecking | true    |
 */
namespace NoUnsafeArgument {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow assigning a value with type `any` to variables and properties
 * @link https://typescript-eslint.io/rules/no-unsafe-assignment
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | recommended          | error   |
 *  | requiresTypeChecking | true    |
 */
namespace NoUnsafeAssignment {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow calling a value with type `any`
 * @link https://typescript-eslint.io/rules/no-unsafe-call
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | recommended          | error   |
 *  | requiresTypeChecking | true    |
 */
namespace NoUnsafeCall {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow unsafe declaration merging
 * @link https://typescript-eslint.io/rules/no-unsafe-declaration-merging
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | recommended          | strict  |
 *  | requiresTypeChecking | false   |
 */
namespace NoUnsafeDeclarationMerging {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow comparing an enum value with a non-enum value
 * @link https://typescript-eslint.io/rules/no-unsafe-enum-comparison
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 */
namespace NoUnsafeEnumComparison {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow member access on a value with type `any`
 * @link https://typescript-eslint.io/rules/no-unsafe-member-access
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | recommended          | error   |
 *  | requiresTypeChecking | true    |
 */
namespace NoUnsafeMemberAccess {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow returning a value with type `any` from a function
 * @link https://typescript-eslint.io/rules/no-unsafe-return
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | recommended          | error   |
 *  | requiresTypeChecking | true    |
 */
namespace NoUnsafeReturn {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow unused expressions
 * @link https://typescript-eslint.io/rules/no-unused-expressions
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
 * @description Disallow unused variables
 * @link https://typescript-eslint.io/rules/no-unused-vars
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | warn    |
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
 * @link https://typescript-eslint.io/rules/no-use-before-define
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
   *           "enums": {
   *             "type": "boolean"
   *           },
   *           "variables": {
   *             "type": "boolean"
   *           },
   *           "typedefs": {
   *             "type": "boolean"
   *           },
   *           "ignoreTypeReferences": {
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
        readonly enums?: boolean;
        readonly variables?: boolean;
        readonly typedefs?: boolean;
        readonly ignoreTypeReferences?: boolean;
        readonly allowNamedExports?: boolean;
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow unnecessary constructors
 * @link https://typescript-eslint.io/rules/no-useless-constructor
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | strict  |
 */
namespace NoUselessConstructor {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow empty exports that don't change anything in a module file
 * @link https://typescript-eslint.io/rules/no-useless-empty-export
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | false      |
 *  | recommended    | false      |
 */
namespace NoUselessEmptyExport {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow `require` statements except in import statements
 * @link https://typescript-eslint.io/rules/no-var-requires
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | error   |
 */
namespace NoVarRequires {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce non-null assertions over explicit type casts
 * @link https://typescript-eslint.io/rules/non-nullable-type-assertion-style
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | fixable              | code       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 */
namespace NonNullableTypeAssertionStyle {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce consistent spacing inside braces
 * @link https://typescript-eslint.io/rules/object-curly-spacing
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
 * @description Require or disallow padding lines between statements
 * @link https://typescript-eslint.io/rules/padding-line-between-statements
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | layout     |
 *  | fixable        | whitespace |
 *  | hasSuggestions | false      |
 *  | recommended    | false      |
 */
namespace PaddingLineBetweenStatements {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "$defs": {
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
   *             "exports",
   *             "require",
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
   *             "with",
   *             "interface",
   *             "type"
   *           ]
   *         },
   *         {
   *           "type": "array",
   *           "items": {
   *             "enum": [
   *               "*",
   *               "block-like",
   *               "exports",
   *               "require",
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
   *               "with",
   *               "interface",
   *               "type"
   *             ]
   *           },
   *           "minItems": 1,
   *           "uniqueItems": true,
   *           "additionalItems": false
   *         }
   *       ]
   *     }
   *   },
   *   "type": "array",
   *   "items": {
   *     "type": "object",
   *     "properties": {
   *       "blankLine": {
   *         "$ref": "#/$defs/paddingType"
   *       },
   *       "prev": {
   *         "$ref": "#/$defs/statementType"
   *       },
   *       "next": {
   *         "$ref": "#/$defs/statementType"
   *       }
   *     },
   *     "additionalProperties": false,
   *     "required": [
   *       "blankLine",
   *       "prev",
   *       "next"
   *     ]
   *   },
   *   "additionalItems": false
   * }
   * ```
   */
  export type PaddingType = 'any' | 'never' | 'always';
  export type StatementType =
    | (
        | '*'
        | 'block-like'
        | 'exports'
        | 'require'
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
        | 'interface'
        | 'type'
      )
    | readonly [
        (
          | '*'
          | 'block-like'
          | 'exports'
          | 'require'
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
          | 'interface'
          | 'type'
        ),
        ...(readonly (
          | '*'
          | 'block-like'
          | 'exports'
          | 'require'
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
          | 'interface'
          | 'type'
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
 * @description Require or disallow parameter properties in class constructors
 * @link https://typescript-eslint.io/rules/parameter-properties
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | false   |
 */
namespace ParameterProperties {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "$defs": {
   *     "modifier": {
   *       "enum": [
   *         "readonly",
   *         "private",
   *         "protected",
   *         "public",
   *         "private readonly",
   *         "protected readonly",
   *         "public readonly"
   *       ]
   *     }
   *   },
   *   "prefixItems": [
   *     {
   *       "type": "object",
   *       "properties": {
   *         "allow": {
   *           "type": "array",
   *           "items": {
   *             "$ref": "#/$defs/modifier"
   *           },
   *           "minItems": 1
   *         },
   *         "prefer": {
   *           "enum": [
   *             "class-property",
   *             "parameter-property"
   *           ]
   *         }
   *       },
   *       "additionalProperties": false
   *     }
   *   ],
   *   "type": "array"
   * }
   * ```
   */
  // modified
  export type Options = {
    readonly allow?: readonly [Modifier, ...Modifier[]];
    readonly prefer?: 'class-property' | 'parameter-property';
  };

  type Modifier =
    | 'readonly'
    | 'private'
    | 'protected'
    | 'public'
    | 'private readonly'
    | 'protected readonly'
    | 'public readonly';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce the use of `as const` over literal type
 * @link https://typescript-eslint.io/rules/prefer-as-const
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | error      |
 */
namespace PreferAsConst {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require each enum member value to be explicitly initialized
 * @link https://typescript-eslint.io/rules/prefer-enum-initializers
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 */
namespace PreferEnumInitializers {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce the use of `for-of` loop over the standard `for` loop where possible
 * @link https://typescript-eslint.io/rules/prefer-for-of
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | strict     |
 */
namespace PreferForOf {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce using function types instead of interfaces with call signatures
 * @link https://typescript-eslint.io/rules/prefer-function-type
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | strict     |
 */
namespace PreferFunctionType {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce `includes` method over `indexOf` method
 * @link https://typescript-eslint.io/rules/prefer-includes
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | fixable              | code       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 */
namespace PreferIncludes {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require all enum members to be literal values
 * @link https://typescript-eslint.io/rules/prefer-literal-enum-member
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | false      |
 */
namespace PreferLiteralEnumMember {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowBitwiseExpressions": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowBitwiseExpressions?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require using `namespace` keyword over `module` keyword to declare custom TypeScript modules
 * @link https://typescript-eslint.io/rules/prefer-namespace-keyword
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | error      |
 */
namespace PreferNamespaceKeyword {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce using the nullish coalescing operator instead of logical chaining
 * @link https://typescript-eslint.io/rules/prefer-nullish-coalescing
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | hasSuggestions       | true       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 */
namespace PreferNullishCoalescing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreConditionalTests": {
   *         "type": "boolean"
   *       },
   *       "ignoreTernaryTests": {
   *         "type": "boolean"
   *       },
   *       "ignoreMixedLogicalExpressions": {
   *         "type": "boolean"
   *       },
   *       "allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly ignoreConditionalTests?: boolean;
    readonly ignoreTernaryTests?: boolean;
    readonly ignoreMixedLogicalExpressions?: boolean;
    readonly allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce using concise optional chain expressions instead of chained logical ands, negated logical ors, or empty objects
 * @link https://typescript-eslint.io/rules/prefer-optional-chain
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | recommended    | strict     |
 */
namespace PreferOptionalChain {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require private members to be marked as `readonly` if they're never modified outside of the constructor
 * @link https://typescript-eslint.io/rules/prefer-readonly
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | fixable              | code       |
 *  | recommended          | false      |
 *  | requiresTypeChecking | true       |
 */
namespace PreferReadonly {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "allowAdditionalProperties": false,
   *     "properties": {
   *       "onlyInlineLambdas": {
   *         "type": "boolean"
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly onlyInlineLambdas?: boolean;
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require function parameters to be typed as `readonly` to prevent accidental mutation of inputs
 * @link https://typescript-eslint.io/rules/prefer-readonly-parameter-types
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | recommended          | false      |
 *  | requiresTypeChecking | true       |
 */
namespace PreferReadonlyParameterTypes {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "checkParameterProperties": {
   *         "type": "boolean"
   *       },
   *       "ignoreInferredTypes": {
   *         "type": "boolean"
   *       },
   *       "treatMethodsAsReadonly": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly checkParameterProperties?: boolean;
    readonly ignoreInferredTypes?: boolean;
    readonly treatMethodsAsReadonly?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce using type parameter when calling `Array#reduce` instead of casting
 * @link https://typescript-eslint.io/rules/prefer-reduce-type-parameter
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | fixable              | code    |
 *  | recommended          | strict  |
 *  | requiresTypeChecking | true    |
 */
namespace PreferReduceTypeParameter {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce `RegExp#exec` over `String#match` if no global flag is provided
 * @link https://typescript-eslint.io/rules/prefer-regexp-exec
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | fixable              | code       |
 *  | recommended          | false      |
 *  | requiresTypeChecking | true       |
 */
namespace PreferRegexpExec {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce that `this` is used when only `this` type is returned
 * @link https://typescript-eslint.io/rules/prefer-return-this-type
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | fixable              | code       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 */
namespace PreferReturnThisType {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce using `String#startsWith` and `String#endsWith` over other equivalent methods of checking substrings
 * @link https://typescript-eslint.io/rules/prefer-string-starts-ends-with
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | fixable              | code       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 */
namespace PreferStringStartsEndsWith {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce using `@ts-expect-error` over `@ts-ignore`
 * @link https://typescript-eslint.io/rules/prefer-ts-expect-error
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | fixable     | code    |
 *  | recommended | strict  |
 */
namespace PreferTsExpectError {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require any function or method that returns a Promise to be marked async
 * @link https://typescript-eslint.io/rules/promise-function-async
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | fixable              | code       |
 *  | recommended          | false      |
 *  | requiresTypeChecking | true       |
 */
namespace PromiseFunctionAsync {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowAny": {
   *         "description": "Whether to consider `any` and `unknown` to be Promises.",
   *         "type": "boolean"
   *       },
   *       "allowedPromiseNames": {
   *         "description": "Any extra names of classes or interfaces to be considered Promises.",
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "checkArrowFunctions": {
   *         "type": "boolean"
   *       },
   *       "checkFunctionDeclarations": {
   *         "type": "boolean"
   *       },
   *       "checkFunctionExpressions": {
   *         "type": "boolean"
   *       },
   *       "checkMethodDeclarations": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether to consider `any` and `unknown` to be Promises.
     */
    readonly allowAny?: boolean;
    /**
     * Any extra names of classes or interfaces to be considered Promises.
     */
    readonly allowedPromiseNames?: readonly string[];
    readonly checkArrowFunctions?: boolean;
    readonly checkFunctionDeclarations?: boolean;
    readonly checkFunctionExpressions?: boolean;
    readonly checkMethodDeclarations?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce the consistent use of either backticks, double, or single quotes
 * @link https://typescript-eslint.io/rules/quotes
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
 * @description Require `Array#sort` calls to always provide a `compareFunction`
 * @link https://typescript-eslint.io/rules/require-array-sort-compare
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | recommended          | false   |
 *  | requiresTypeChecking | true    |
 */
namespace RequireArraySortCompare {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreStringArrays": {
   *         "description": "Whether to ignore arrays in which all elements are strings.",
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether to ignore arrays in which all elements are strings.
     */
    readonly ignoreStringArrays?: boolean;
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow async functions which have no `await` expression
 * @link https://typescript-eslint.io/rules/require-await
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | recommended          | error      |
 *  | requiresTypeChecking | true       |
 */
namespace RequireAwait {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Require both operands of addition to be the same type and be `bigint`, `number`, or `string`
 * @link https://typescript-eslint.io/rules/restrict-plus-operands
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | recommended          | error   |
 *  | requiresTypeChecking | true    |
 */
namespace RestrictPlusOperands {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "checkCompoundAssignments": {
   *         "description": "Whether to check compound assignments such as `+=`.",
   *         "type": "boolean"
   *       },
   *       "allowAny": {
   *         "description": "Whether to allow `any` typed values.",
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether to check compound assignments such as `+=`.
     */
    readonly checkCompoundAssignments?: boolean;
    /**
     * Whether to allow `any` typed values.
     */
    readonly allowAny?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce template literal expressions to be of `string` type
 * @link https://typescript-eslint.io/rules/restrict-template-expressions
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | recommended          | error   |
 *  | requiresTypeChecking | true    |
 */
namespace RestrictTemplateExpressions {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowNumber": {
   *         "description": "Whether to allow `number` typed values in template expressions.",
   *         "type": "boolean"
   *       },
   *       "allowBoolean": {
   *         "description": "Whether to allow `boolean` typed values in template expressions.",
   *         "type": "boolean"
   *       },
   *       "allowAny": {
   *         "description": "Whether to allow `any` typed values in template expressions.",
   *         "type": "boolean"
   *       },
   *       "allowNullish": {
   *         "description": "Whether to allow `nullish` typed values in template expressions.",
   *         "type": "boolean"
   *       },
   *       "allowRegExp": {
   *         "description": "Whether to allow `regexp` typed values in template expressions.",
   *         "type": "boolean"
   *       },
   *       "allowNever": {
   *         "description": "Whether to allow `never` typed values in template expressions.",
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether to allow `number` typed values in template expressions.
     */
    readonly allowNumber?: boolean;
    /**
     * Whether to allow `boolean` typed values in template expressions.
     */
    readonly allowBoolean?: boolean;
    /**
     * Whether to allow `any` typed values in template expressions.
     */
    readonly allowAny?: boolean;
    /**
     * Whether to allow `nullish` typed values in template expressions.
     */
    readonly allowNullish?: boolean;
    /**
     * Whether to allow `regexp` typed values in template expressions.
     */
    readonly allowRegExp?: boolean;
    /**
     * Whether to allow `never` typed values in template expressions.
     */
    readonly allowNever?: boolean;
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce consistent returning of awaited values
 * @link https://typescript-eslint.io/rules/return-await
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | fixable              | code    |
 *  | hasSuggestions       | true    |
 *  | recommended          | false   |
 *  | requiresTypeChecking | true    |
 */
namespace ReturnAwait {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "in-try-catch",
   *       "always",
   *       "never"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'in-try-catch' | 'always' | 'never';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require or disallow semicolons instead of ASI
 * @link https://typescript-eslint.io/rules/semi
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
          readonly omitLastInOneLineClassBody?: boolean;
        }
      ];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce constituents of a type union/intersection to be sorted alphabetically
 * @link https://typescript-eslint.io/rules/sort-type-constituents
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 */
namespace SortTypeConstituents {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "checkIntersections": {
   *         "description": "Whether to check intersection types.",
   *         "type": "boolean"
   *       },
   *       "checkUnions": {
   *         "description": "Whether to check union types.",
   *         "type": "boolean"
   *       },
   *       "groupOrder": {
   *         "description": "Ordering of the groups.",
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "enum": [
   *             "conditional",
   *             "function",
   *             "import",
   *             "intersection",
   *             "keyword",
   *             "nullish",
   *             "literal",
   *             "named",
   *             "object",
   *             "operator",
   *             "tuple",
   *             "union"
   *           ]
   *         }
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether to check intersection types.
     */
    readonly checkIntersections?: boolean;
    /**
     * Whether to check union types.
     */
    readonly checkUnions?: boolean;
    /**
     * Ordering of the groups.
     */
    readonly groupOrder?: readonly (
      | 'conditional'
      | 'function'
      | 'import'
      | 'intersection'
      | 'keyword'
      | 'nullish'
      | 'literal'
      | 'named'
      | 'object'
      | 'operator'
      | 'tuple'
      | 'union'
    )[];
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce members of a type union/intersection to be sorted alphabetically
 * @link https://typescript-eslint.io/rules/sort-type-union-intersection-members
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | true       |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | false      |
 */
namespace SortTypeUnionIntersectionMembers {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "checkIntersections": {
   *         "description": "Whether to check intersection types.",
   *         "type": "boolean"
   *       },
   *       "checkUnions": {
   *         "description": "Whether to check union types.",
   *         "type": "boolean"
   *       },
   *       "groupOrder": {
   *         "description": "Ordering of the groups.",
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "enum": [
   *             "conditional",
   *             "function",
   *             "import",
   *             "intersection",
   *             "keyword",
   *             "nullish",
   *             "literal",
   *             "named",
   *             "object",
   *             "operator",
   *             "tuple",
   *             "union"
   *           ]
   *         }
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 'off';
}

/**
 * @description Enforce consistent spacing before blocks
 * @link https://typescript-eslint.io/rules/space-before-blocks
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
 * @description Enforce consistent spacing before function parenthesis
 * @link https://typescript-eslint.io/rules/space-before-function-paren
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
 * @description Require spacing around infix operators
 * @link https://typescript-eslint.io/rules/space-infix-ops
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
 * @description Disallow certain types in boolean expressions
 * @link https://typescript-eslint.io/rules/strict-boolean-expressions
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | fixable              | code       |
 *  | hasSuggestions       | true       |
 *  | recommended          | false      |
 *  | requiresTypeChecking | true       |
 */
namespace StrictBooleanExpressions {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowString": {
   *         "type": "boolean"
   *       },
   *       "allowNumber": {
   *         "type": "boolean"
   *       },
   *       "allowNullableObject": {
   *         "type": "boolean"
   *       },
   *       "allowNullableBoolean": {
   *         "type": "boolean"
   *       },
   *       "allowNullableString": {
   *         "type": "boolean"
   *       },
   *       "allowNullableNumber": {
   *         "type": "boolean"
   *       },
   *       "allowNullableEnum": {
   *         "type": "boolean"
   *       },
   *       "allowAny": {
   *         "type": "boolean"
   *       },
   *       "allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowString?: boolean;
    readonly allowNumber?: boolean;
    readonly allowNullableObject?: boolean;
    readonly allowNullableBoolean?: boolean;
    readonly allowNullableString?: boolean;
    readonly allowNullableNumber?: boolean;
    readonly allowNullableEnum?: boolean;
    readonly allowAny?: boolean;
    readonly allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require switch-case statements to be exhaustive with union type
 * @link https://typescript-eslint.io/rules/switch-exhaustiveness-check
 *
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | hasSuggestions       | true       |
 *  | recommended          | false      |
 *  | requiresTypeChecking | true       |
 */
namespace SwitchExhaustivenessCheck {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow certain triple slash directives in favor of ES6-style import declarations
 * @link https://typescript-eslint.io/rules/triple-slash-reference
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | error      |
 */
namespace TripleSlashReference {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "lib": {
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       },
   *       "path": {
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       },
   *       "types": {
   *         "enum": [
   *           "always",
   *           "never",
   *           "prefer-import"
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly lib?: 'always' | 'never';
    readonly path?: 'always' | 'never';
    readonly types?: 'always' | 'never' | 'prefer-import';
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require consistent spacing around type annotations
 * @link https://typescript-eslint.io/rules/type-annotation-spacing
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | layout     |
 *  | fixable     | whitespace |
 *  | recommended | false      |
 */
namespace TypeAnnotationSpacing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
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
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "arrow": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "variable": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "parameter": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "property": {
   *             "type": "object",
   *             "properties": {
   *               "before": {
   *                 "type": "boolean"
   *               },
   *               "after": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           "returnType": {
   *             "type": "object",
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
      readonly colon?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly arrow?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly variable?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly parameter?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly property?: {
        readonly before?: boolean;
        readonly after?: boolean;
      };
      readonly returnType?: {
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
 * @description Require type annotations in certain places
 * @link https://typescript-eslint.io/rules/typedef
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace Typedef {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "arrayDestructuring": {
   *         "type": "boolean"
   *       },
   *       "arrowParameter": {
   *         "type": "boolean"
   *       },
   *       "memberVariableDeclaration": {
   *         "type": "boolean"
   *       },
   *       "objectDestructuring": {
   *         "type": "boolean"
   *       },
   *       "parameter": {
   *         "type": "boolean"
   *       },
   *       "propertyDeclaration": {
   *         "type": "boolean"
   *       },
   *       "variableDeclaration": {
   *         "type": "boolean"
   *       },
   *       "variableDeclarationIgnoreFunction": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly arrayDestructuring?: boolean;
    readonly arrowParameter?: boolean;
    readonly memberVariableDeclaration?: boolean;
    readonly objectDestructuring?: boolean;
    readonly parameter?: boolean;
    readonly propertyDeclaration?: boolean;
    readonly variableDeclaration?: boolean;
    readonly variableDeclarationIgnoreFunction?: boolean;
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce unbound methods are called with their expected scope
 * @link https://typescript-eslint.io/rules/unbound-method
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | recommended          | error   |
 *  | requiresTypeChecking | true    |
 */
namespace UnboundMethod {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreStatic": {
   *         "description": "Whether to skip checking whether `static` methods are correctly bound.",
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether to skip checking whether `static` methods are correctly bound.
     */
    readonly ignoreStatic?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow two overloads that could be unified into one with a union or an optional/rest parameter
 * @link https://typescript-eslint.io/rules/unified-signatures
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | strict     |
 */
namespace UnifiedSignatures {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "additionalProperties": false,
   *     "properties": {
   *       "ignoreDifferentlyNamedParameters": {
   *         "description": "Whether two parameters with different names at the same index should be considered different even if their types are the same.",
   *         "type": "boolean"
   *       }
   *     },
   *     "type": "object"
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether two parameters with different names at the same index should be considered different even if their types are the same.
     */
    readonly ignoreDifferentlyNamedParameters?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

export type TypeScriptEslintRules = {
  readonly '@typescript-eslint/adjacent-overload-signatures': AdjacentOverloadSignatures.RuleEntry;
  readonly '@typescript-eslint/array-type': ArrayType.RuleEntry;
  readonly '@typescript-eslint/await-thenable': AwaitThenable.RuleEntry;
  readonly '@typescript-eslint/ban-ts-comment': BanTsComment.RuleEntry;
  readonly '@typescript-eslint/ban-tslint-comment': BanTslintComment.RuleEntry;
  readonly '@typescript-eslint/ban-types': BanTypes.RuleEntry;
  readonly '@typescript-eslint/block-spacing': BlockSpacing.RuleEntry;
  readonly '@typescript-eslint/brace-style': BraceStyle.RuleEntry;
  readonly '@typescript-eslint/class-literal-property-style': ClassLiteralPropertyStyle.RuleEntry;
  readonly '@typescript-eslint/comma-dangle': CommaDangle.RuleEntry;
  readonly '@typescript-eslint/comma-spacing': CommaSpacing.RuleEntry;
  readonly '@typescript-eslint/consistent-generic-constructors': ConsistentGenericConstructors.RuleEntry;
  readonly '@typescript-eslint/consistent-indexed-object-style': ConsistentIndexedObjectStyle.RuleEntry;
  readonly '@typescript-eslint/consistent-type-assertions': ConsistentTypeAssertions.RuleEntry;
  readonly '@typescript-eslint/consistent-type-definitions': ConsistentTypeDefinitions.RuleEntry;
  readonly '@typescript-eslint/consistent-type-exports': ConsistentTypeExports.RuleEntry;
  readonly '@typescript-eslint/consistent-type-imports': ConsistentTypeImports.RuleEntry;
  readonly '@typescript-eslint/default-param-last': DefaultParamLast.RuleEntry;
  readonly '@typescript-eslint/dot-notation': DotNotation.RuleEntry;
  readonly '@typescript-eslint/explicit-function-return-type': ExplicitFunctionReturnType.RuleEntry;
  readonly '@typescript-eslint/explicit-member-accessibility': ExplicitMemberAccessibility.RuleEntry;
  readonly '@typescript-eslint/explicit-module-boundary-types': ExplicitModuleBoundaryTypes.RuleEntry;
  readonly '@typescript-eslint/func-call-spacing': FuncCallSpacing.RuleEntry;
  readonly '@typescript-eslint/indent': Indent.RuleEntry;
  readonly '@typescript-eslint/init-declarations': InitDeclarations.RuleEntry;
  readonly '@typescript-eslint/key-spacing': KeySpacing.RuleEntry;
  readonly '@typescript-eslint/keyword-spacing': KeywordSpacing.RuleEntry;
  readonly '@typescript-eslint/lines-around-comment': LinesAroundComment.RuleEntry;
  readonly '@typescript-eslint/lines-between-class-members': LinesBetweenClassMembers.RuleEntry;
  readonly '@typescript-eslint/member-delimiter-style': MemberDelimiterStyle.RuleEntry;
  readonly '@typescript-eslint/member-ordering': MemberOrdering.RuleEntry;
  readonly '@typescript-eslint/method-signature-style': MethodSignatureStyle.RuleEntry;
  readonly '@typescript-eslint/naming-convention': NamingConvention.RuleEntry;
  readonly '@typescript-eslint/no-array-constructor': NoArrayConstructor.RuleEntry;
  readonly '@typescript-eslint/no-base-to-string': NoBaseToString.RuleEntry;
  readonly '@typescript-eslint/no-confusing-non-null-assertion': NoConfusingNonNullAssertion.RuleEntry;
  readonly '@typescript-eslint/no-confusing-void-expression': NoConfusingVoidExpression.RuleEntry;
  readonly '@typescript-eslint/no-dupe-class-members': NoDupeClassMembers.RuleEntry;
  readonly '@typescript-eslint/no-duplicate-enum-values': NoDuplicateEnumValues.RuleEntry;
  readonly '@typescript-eslint/no-duplicate-type-constituents': NoDuplicateTypeConstituents.RuleEntry;
  readonly '@typescript-eslint/no-dynamic-delete': NoDynamicDelete.RuleEntry;
  readonly '@typescript-eslint/no-empty-function': NoEmptyFunction.RuleEntry;
  readonly '@typescript-eslint/no-empty-interface': NoEmptyInterface.RuleEntry;
  readonly '@typescript-eslint/no-explicit-any': NoExplicitAny.RuleEntry;
  readonly '@typescript-eslint/no-extra-non-null-assertion': NoExtraNonNullAssertion.RuleEntry;
  readonly '@typescript-eslint/no-extra-parens': NoExtraParens.RuleEntry;
  readonly '@typescript-eslint/no-extra-semi': NoExtraSemi.RuleEntry;
  readonly '@typescript-eslint/no-extraneous-class': NoExtraneousClass.RuleEntry;
  readonly '@typescript-eslint/no-floating-promises': NoFloatingPromises.RuleEntry;
  readonly '@typescript-eslint/no-for-in-array': NoForInArray.RuleEntry;
  readonly '@typescript-eslint/no-implied-eval': NoImpliedEval.RuleEntry;
  readonly '@typescript-eslint/no-import-type-side-effects': NoImportTypeSideEffects.RuleEntry;
  readonly '@typescript-eslint/no-inferrable-types': NoInferrableTypes.RuleEntry;
  readonly '@typescript-eslint/no-invalid-this': NoInvalidThis.RuleEntry;
  readonly '@typescript-eslint/no-invalid-void-type': NoInvalidVoidType.RuleEntry;
  readonly '@typescript-eslint/no-loop-func': NoLoopFunc.RuleEntry;
  readonly '@typescript-eslint/no-loss-of-precision': NoLossOfPrecision.RuleEntry;
  readonly '@typescript-eslint/no-magic-numbers': NoMagicNumbers.RuleEntry;
  readonly '@typescript-eslint/no-meaningless-void-operator': NoMeaninglessVoidOperator.RuleEntry;
  readonly '@typescript-eslint/no-misused-new': NoMisusedNew.RuleEntry;
  readonly '@typescript-eslint/no-misused-promises': NoMisusedPromises.RuleEntry;
  readonly '@typescript-eslint/no-mixed-enums': NoMixedEnums.RuleEntry;
  readonly '@typescript-eslint/no-namespace': NoNamespace.RuleEntry;
  readonly '@typescript-eslint/no-non-null-asserted-nullish-coalescing': NoNonNullAssertedNullishCoalescing.RuleEntry;
  readonly '@typescript-eslint/no-non-null-asserted-optional-chain': NoNonNullAssertedOptionalChain.RuleEntry;
  readonly '@typescript-eslint/no-non-null-assertion': NoNonNullAssertion.RuleEntry;
  readonly '@typescript-eslint/no-redeclare': NoRedeclare.RuleEntry;
  readonly '@typescript-eslint/no-redundant-type-constituents': NoRedundantTypeConstituents.RuleEntry;
  readonly '@typescript-eslint/no-require-imports': NoRequireImports.RuleEntry;
  readonly '@typescript-eslint/no-restricted-imports': NoRestrictedImports.RuleEntry;
  readonly '@typescript-eslint/no-shadow': NoShadow.RuleEntry;
  readonly '@typescript-eslint/no-this-alias': NoThisAlias.RuleEntry;
  readonly '@typescript-eslint/no-throw-literal': NoThrowLiteral.RuleEntry;
  readonly '@typescript-eslint/no-type-alias': NoTypeAlias.RuleEntry;
  readonly '@typescript-eslint/no-unnecessary-boolean-literal-compare': NoUnnecessaryBooleanLiteralCompare.RuleEntry;
  readonly '@typescript-eslint/no-unnecessary-condition': NoUnnecessaryCondition.RuleEntry;
  readonly '@typescript-eslint/no-unnecessary-qualifier': NoUnnecessaryQualifier.RuleEntry;
  readonly '@typescript-eslint/no-unnecessary-type-arguments': NoUnnecessaryTypeArguments.RuleEntry;
  readonly '@typescript-eslint/no-unnecessary-type-assertion': NoUnnecessaryTypeAssertion.RuleEntry;
  readonly '@typescript-eslint/no-unnecessary-type-constraint': NoUnnecessaryTypeConstraint.RuleEntry;
  readonly '@typescript-eslint/no-unsafe-argument': NoUnsafeArgument.RuleEntry;
  readonly '@typescript-eslint/no-unsafe-assignment': NoUnsafeAssignment.RuleEntry;
  readonly '@typescript-eslint/no-unsafe-call': NoUnsafeCall.RuleEntry;
  readonly '@typescript-eslint/no-unsafe-declaration-merging': NoUnsafeDeclarationMerging.RuleEntry;
  readonly '@typescript-eslint/no-unsafe-enum-comparison': NoUnsafeEnumComparison.RuleEntry;
  readonly '@typescript-eslint/no-unsafe-member-access': NoUnsafeMemberAccess.RuleEntry;
  readonly '@typescript-eslint/no-unsafe-return': NoUnsafeReturn.RuleEntry;
  readonly '@typescript-eslint/no-unused-expressions': NoUnusedExpressions.RuleEntry;
  readonly '@typescript-eslint/no-unused-vars': NoUnusedVars.RuleEntry;
  readonly '@typescript-eslint/no-use-before-define': NoUseBeforeDefine.RuleEntry;
  readonly '@typescript-eslint/no-useless-constructor': NoUselessConstructor.RuleEntry;
  readonly '@typescript-eslint/no-useless-empty-export': NoUselessEmptyExport.RuleEntry;
  readonly '@typescript-eslint/no-var-requires': NoVarRequires.RuleEntry;
  readonly '@typescript-eslint/non-nullable-type-assertion-style': NonNullableTypeAssertionStyle.RuleEntry;
  readonly '@typescript-eslint/object-curly-spacing': ObjectCurlySpacing.RuleEntry;
  readonly '@typescript-eslint/padding-line-between-statements': PaddingLineBetweenStatements.RuleEntry;
  readonly '@typescript-eslint/parameter-properties': ParameterProperties.RuleEntry;
  readonly '@typescript-eslint/prefer-as-const': PreferAsConst.RuleEntry;
  readonly '@typescript-eslint/prefer-enum-initializers': PreferEnumInitializers.RuleEntry;
  readonly '@typescript-eslint/prefer-for-of': PreferForOf.RuleEntry;
  readonly '@typescript-eslint/prefer-function-type': PreferFunctionType.RuleEntry;
  readonly '@typescript-eslint/prefer-includes': PreferIncludes.RuleEntry;
  readonly '@typescript-eslint/prefer-literal-enum-member': PreferLiteralEnumMember.RuleEntry;
  readonly '@typescript-eslint/prefer-namespace-keyword': PreferNamespaceKeyword.RuleEntry;
  readonly '@typescript-eslint/prefer-nullish-coalescing': PreferNullishCoalescing.RuleEntry;
  readonly '@typescript-eslint/prefer-optional-chain': PreferOptionalChain.RuleEntry;
  readonly '@typescript-eslint/prefer-readonly': PreferReadonly.RuleEntry;
  readonly '@typescript-eslint/prefer-readonly-parameter-types': PreferReadonlyParameterTypes.RuleEntry;
  readonly '@typescript-eslint/prefer-reduce-type-parameter': PreferReduceTypeParameter.RuleEntry;
  readonly '@typescript-eslint/prefer-regexp-exec': PreferRegexpExec.RuleEntry;
  readonly '@typescript-eslint/prefer-return-this-type': PreferReturnThisType.RuleEntry;
  readonly '@typescript-eslint/prefer-string-starts-ends-with': PreferStringStartsEndsWith.RuleEntry;
  readonly '@typescript-eslint/prefer-ts-expect-error': PreferTsExpectError.RuleEntry;
  readonly '@typescript-eslint/promise-function-async': PromiseFunctionAsync.RuleEntry;
  readonly '@typescript-eslint/quotes': Quotes.RuleEntry;
  readonly '@typescript-eslint/require-array-sort-compare': RequireArraySortCompare.RuleEntry;
  readonly '@typescript-eslint/require-await': RequireAwait.RuleEntry;
  readonly '@typescript-eslint/restrict-plus-operands': RestrictPlusOperands.RuleEntry;
  readonly '@typescript-eslint/restrict-template-expressions': RestrictTemplateExpressions.RuleEntry;
  readonly '@typescript-eslint/return-await': ReturnAwait.RuleEntry;
  readonly '@typescript-eslint/semi': Semi.RuleEntry;
  readonly '@typescript-eslint/sort-type-constituents': SortTypeConstituents.RuleEntry;
  readonly '@typescript-eslint/space-before-blocks': SpaceBeforeBlocks.RuleEntry;
  readonly '@typescript-eslint/space-before-function-paren': SpaceBeforeFunctionParen.RuleEntry;
  readonly '@typescript-eslint/space-infix-ops': SpaceInfixOps.RuleEntry;
  readonly '@typescript-eslint/strict-boolean-expressions': StrictBooleanExpressions.RuleEntry;
  readonly '@typescript-eslint/switch-exhaustiveness-check': SwitchExhaustivenessCheck.RuleEntry;
  readonly '@typescript-eslint/triple-slash-reference': TripleSlashReference.RuleEntry;
  readonly '@typescript-eslint/type-annotation-spacing': TypeAnnotationSpacing.RuleEntry;
  readonly '@typescript-eslint/typedef': Typedef.RuleEntry;
  readonly '@typescript-eslint/unbound-method': UnboundMethod.RuleEntry;
  readonly '@typescript-eslint/unified-signatures': UnifiedSignatures.RuleEntry;

  // deprecated
  readonly '@typescript-eslint/no-duplicate-imports': NoDuplicateImports.RuleEntry;
  readonly '@typescript-eslint/no-implicit-any-catch': NoImplicitAnyCatch.RuleEntry;
  readonly '@typescript-eslint/no-parameter-properties': NoParameterProperties.RuleEntry;
  readonly '@typescript-eslint/sort-type-union-intersection-members': SortTypeUnionIntersectionMembers.RuleEntry;
};
