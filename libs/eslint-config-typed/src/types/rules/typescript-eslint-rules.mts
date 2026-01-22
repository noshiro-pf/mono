/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Require that function overload signatures be consecutive
 *
 * @link https://typescript-eslint.io/rules/adjacent-overload-signatures
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | stylistic  |
 *  ```
 */
namespace AdjacentOverloadSignatures {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require consistently using either `T[]` or `Array<T>` for arrays
 *
 * @link https://typescript-eslint.io/rules/array-type
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | stylistic  |
 *  ```
 */
namespace ArrayType {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "$defs": {
   *       "arrayOption": {
   *         "type": "string",
   *         "enum": [
   *           "array",
   *           "generic",
   *           "array-simple"
   *         ]
   *       }
   *     },
   *     "additionalProperties": false,
   *     "properties": {
   *       "default": {
   *         "$ref": "#/$defs/arrayOption",
   *         "description": "The array type expected for mutable cases."
   *       },
   *       "readonly": {
   *         "$ref": "#/$defs/arrayOption",
   *         "description": "The array type expected for readonly cases. If omitted, the value for `default` will be used."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** The array type expected for mutable cases. */
    default?: 'array' | 'generic' | 'array-simple';
    /**
     * The array type expected for readonly cases. If omitted, the value for
     * `default` will be used.
     */
    readonly?: 'array' | 'generic' | 'array-simple';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow awaiting a value that is not a Thenable
 *
 * @link https://typescript-eslint.io/rules/await-thenable
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | problem     |
 *  | deprecated           | false       |
 *  | hasSuggestions       | true        |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace AwaitThenable {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow `@ts-<directive>` comments or require descriptions after directives
 *
 * @link https://typescript-eslint.io/rules/ban-ts-comment
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | hasSuggestions | true    |
 *  ```
 */
namespace BanTsComment {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "$defs": {
   *       "directiveConfigSchema": {
   *         "oneOf": [
   *           {
   *             "type": "boolean",
   *             "default": true
   *           },
   *           {
   *             "type": "string",
   *             "enum": [
   *               "allow-with-description"
   *             ]
   *           },
   *           {
   *             "type": "object",
   *             "additionalProperties": false,
   *             "properties": {
   *               "descriptionFormat": {
   *                 "type": "string"
   *               }
   *             }
   *           }
   *         ]
   *       }
   *     },
   *     "additionalProperties": false,
   *     "properties": {
   *       "minimumDescriptionLength": {
   *         "type": "number",
   *         "description": "A minimum character length for descriptions when `allow-with-description` is enabled."
   *       },
   *       "ts-check": {
   *         "$ref": "#/$defs/directiveConfigSchema",
   *         "description": "Whether allow ts-check directives, and with which restrictions."
   *       },
   *       "ts-expect-error": {
   *         "$ref": "#/$defs/directiveConfigSchema",
   *         "description": "Whether and when expect-error directives, and with which restrictions."
   *       },
   *       "ts-ignore": {
   *         "$ref": "#/$defs/directiveConfigSchema",
   *         "description": "Whether allow ts-ignore directives, and with which restrictions."
   *       },
   *       "ts-nocheck": {
   *         "$ref": "#/$defs/directiveConfigSchema",
   *         "description": "Whether allow ts-nocheck directives, and with which restrictions."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * A minimum character length for descriptions when `allow-with-description`
     * is enabled.
     */
    minimumDescriptionLength?: number;
    /** Whether allow ts-check directives, and with which restrictions. */
    'ts-check'?:
      | boolean
      | 'allow-with-description'
      | Readonly<{
          descriptionFormat?: string;
        }>;
    /** Whether and when expect-error directives, and with which restrictions. */
    'ts-expect-error'?:
      | boolean
      | 'allow-with-description'
      | Readonly<{
          descriptionFormat?: string;
        }>;
    /** Whether allow ts-ignore directives, and with which restrictions. */
    'ts-ignore'?:
      | boolean
      | 'allow-with-description'
      | Readonly<{
          descriptionFormat?: string;
        }>;
    /** Whether allow ts-nocheck directives, and with which restrictions. */
    'ts-nocheck'?:
      | boolean
      | 'allow-with-description'
      | Readonly<{
          descriptionFormat?: string;
        }>;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow `// tslint:<rule-flag>` comments
 *
 * @link https://typescript-eslint.io/rules/ban-tslint-comment
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | stylistic  |
 *  ```
 */
namespace BanTslintComment {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce that literals on classes are exposed in a consistent style
 *
 * @link https://typescript-eslint.io/rules/class-literal-property-style
 *
 *  ```md
 *  | key            | value     |
 *  | :------------- | :-------- |
 *  | type           | problem   |
 *  | deprecated     | false     |
 *  | hasSuggestions | true      |
 *  | recommended    | stylistic |
 *  ```
 */
namespace ClassLiteralPropertyStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "description": "Which literal class member syntax to prefer.",
   *     "enum": [
   *       "fields",
   *       "getters"
   *     ]
   *   }
   * ]
   * ```
   */
  /** Which literal class member syntax to prefer. */
  export type Options = 'fields' | 'getters';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce that class methods utilize `this`
 *
 * @link https://typescript-eslint.io/rules/class-methods-use-this
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | requiresTypeChecking | false      |
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
   *     "additionalProperties": false,
   *     "properties": {
   *       "enforceForClassFields": {
   *         "type": "boolean",
   *         "description": "Enforces that functions used as instance field initializers utilize `this`."
   *       },
   *       "exceptMethods": {
   *         "type": "array",
   *         "description": "Allows specified method names to be ignored with this rule.",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "ignoreClassesThatImplementAnInterface": {
   *         "description": "Whether to ignore class members that are defined within a class that `implements` a type.",
   *         "oneOf": [
   *           {
   *             "type": "boolean",
   *             "description": "Ignore all classes that implement an interface"
   *           },
   *           {
   *             "type": "string",
   *             "description": "Ignore only the public fields of classes that implement an interface",
   *             "enum": [
   *               "public-fields"
   *             ]
   *           }
   *         ]
   *       },
   *       "ignoreOverrideMethods": {
   *         "type": "boolean",
   *         "description": "Whether to ignore members marked with the `override` modifier."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Enforces that functions used as instance field initializers utilize
     * `this`.
     */
    enforceForClassFields?: boolean;
    /** Allows specified method names to be ignored with this rule. */
    exceptMethods?: readonly string[];
    /**
     * Whether to ignore class members that are defined within a class that
     * `implements` a type.
     */
    ignoreClassesThatImplementAnInterface?: boolean | 'public-fields';
    /** Whether to ignore members marked with the `override` modifier. */
    ignoreOverrideMethods?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce specifying generic type arguments on type annotation or constructor
 * name of a constructor call
 *
 * @link https://typescript-eslint.io/rules/consistent-generic-constructors
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | stylistic  |
 *  ```
 */
namespace ConsistentGenericConstructors {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "description": "Which constructor call syntax to prefer.",
   *     "enum": [
   *       "type-annotation",
   *       "constructor"
   *     ]
   *   }
   * ]
   * ```
   */
  /** Which constructor call syntax to prefer. */
  export type Options = 'type-annotation' | 'constructor';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require or disallow the `Record` type
 *
 * @link https://typescript-eslint.io/rules/consistent-indexed-object-style
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | stylistic  |
 *  ```
 */
namespace ConsistentIndexedObjectStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "description": "Which indexed object syntax to prefer.",
   *     "enum": [
   *       "record",
   *       "index-signature"
   *     ]
   *   }
   * ]
   * ```
   */
  /** Which indexed object syntax to prefer. */
  export type Options = 'record' | 'index-signature';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require `return` statements to either always or never specify values
 *
 * @link https://typescript-eslint.io/rules/consistent-return
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | requiresTypeChecking | true       |
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
 * Enforce consistent usage of type assertions
 *
 * @link https://typescript-eslint.io/rules/consistent-type-assertions
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | stylistic  |
 *  ```
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
   *         "additionalProperties": false,
   *         "properties": {
   *           "assertionStyle": {
   *             "type": "string",
   *             "description": "The expected assertion style to enforce.",
   *             "enum": [
   *               "never"
   *             ]
   *           }
   *         },
   *         "required": [
   *           "assertionStyle"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "additionalProperties": false,
   *         "properties": {
   *           "arrayLiteralTypeAssertions": {
   *             "type": "string",
   *             "description": "Whether to always prefer type declarations for array literals used as variable initializers, rather than type assertions.",
   *             "enum": [
   *               "allow",
   *               "allow-as-parameter",
   *               "never"
   *             ]
   *           },
   *           "assertionStyle": {
   *             "type": "string",
   *             "description": "The expected assertion style to enforce.",
   *             "enum": [
   *               "as",
   *               "angle-bracket"
   *             ]
   *           },
   *           "objectLiteralTypeAssertions": {
   *             "type": "string",
   *             "description": "Whether to always prefer type declarations for object literals used as variable initializers, rather than type assertions.",
   *             "enum": [
   *               "allow",
   *               "allow-as-parameter",
   *               "never"
   *             ]
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
        /** The expected assertion style to enforce. */
        assertionStyle: 'never';
      }
    | {
        /**
         * Whether to always prefer type declarations for array literals used as
         * variable initializers, rather than type assertions.
         */
        arrayLiteralTypeAssertions?: 'allow' | 'allow-as-parameter' | 'never';
        /** The expected assertion style to enforce. */
        assertionStyle?: 'as' | 'angle-bracket';
        /**
         * Whether to always prefer type declarations for object literals used
         * as variable initializers, rather than type assertions.
         */
        objectLiteralTypeAssertions?: 'allow' | 'allow-as-parameter' | 'never';
      }
  >;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce type definitions to consistently use either `interface` or `type`
 *
 * @link https://typescript-eslint.io/rules/consistent-type-definitions
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | stylistic  |
 *  ```
 */
namespace ConsistentTypeDefinitions {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "description": "Which type definition syntax to prefer.",
   *     "enum": [
   *       "interface",
   *       "type"
   *     ]
   *   }
   * ]
   * ```
   */
  /** Which type definition syntax to prefer. */
  export type Options = 'interface' | 'type';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce consistent usage of type exports
 *
 * @link https://typescript-eslint.io/rules/consistent-type-exports
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | fixable              | code       |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace ConsistentTypeExports {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "fixMixedExportsWithInlineTypeSpecifier": {
   *         "type": "boolean",
   *         "description": "Whether the rule will autofix \"mixed\" export cases using TS inline type specifiers."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether the rule will autofix "mixed" export cases using TS inline type
     * specifiers.
     */
    fixMixedExportsWithInlineTypeSpecifier?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce consistent usage of type imports
 *
 * @link https://typescript-eslint.io/rules/consistent-type-imports
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace ConsistentTypeImports {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "disallowTypeAnnotations": {
   *         "type": "boolean",
   *         "description": "Whether to disallow type imports in type annotations (`import()`)."
   *       },
   *       "fixStyle": {
   *         "type": "string",
   *         "description": "The expected type modifier to be added when an import is detected as used only in the type position.",
   *         "enum": [
   *           "separate-type-imports",
   *           "inline-type-imports"
   *         ]
   *       },
   *       "prefer": {
   *         "type": "string",
   *         "description": "The expected import kind for type-only imports.",
   *         "enum": [
   *           "type-imports",
   *           "no-type-imports"
   *         ]
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to disallow type imports in type annotations (`import()`). */
    disallowTypeAnnotations?: boolean;
    /**
     * The expected type modifier to be added when an import is detected as used
     * only in the type position.
     */
    fixStyle?: 'separate-type-imports' | 'inline-type-imports';
    /** The expected import kind for type-only imports. */
    prefer?: 'type-imports' | 'no-type-imports';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce default parameters to be last
 *
 * @link https://typescript-eslint.io/rules/default-param-last
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace DefaultParamLast {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce dot notation whenever possible
 *
 * @link https://typescript-eslint.io/rules/dot-notation
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | fixable              | code       |
 *  | recommended          | stylistic  |
 *  | requiresTypeChecking | true       |
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
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowIndexSignaturePropertyAccess": {
   *         "type": "boolean",
   *         "description": "Whether to allow accessing properties matching an index signature with array notation."
   *       },
   *       "allowKeywords": {
   *         "type": "boolean",
   *         "description": "Whether to allow keywords such as [\"class\"]`."
   *       },
   *       "allowPattern": {
   *         "type": "string",
   *         "description": "Regular expression of names to allow."
   *       },
   *       "allowPrivateClassPropertyAccess": {
   *         "type": "boolean",
   *         "description": "Whether to allow accessing class members marked as `private` with array notation."
   *       },
   *       "allowProtectedClassPropertyAccess": {
   *         "type": "boolean",
   *         "description": "Whether to allow accessing class members marked as `protected` with array notation."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to allow accessing properties matching an index signature with
     * array notation.
     */
    allowIndexSignaturePropertyAccess?: boolean;
    /** Whether to allow keywords such as ["class"]`. */
    allowKeywords?: boolean;
    /** Regular expression of names to allow. */
    allowPattern?: string;
    /**
     * Whether to allow accessing class members marked as `private` with array
     * notation.
     */
    allowPrivateClassPropertyAccess?: boolean;
    /**
     * Whether to allow accessing class members marked as `protected` with array
     * notation.
     */
    allowProtectedClassPropertyAccess?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require explicit return types on functions and class methods
 *
 * @link https://typescript-eslint.io/rules/explicit-function-return-type
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace ExplicitFunctionReturnType {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowConciseArrowFunctionExpressionsStartingWithVoid": {
   *         "type": "boolean",
   *         "description": "Whether to allow arrow functions that start with the `void` keyword."
   *       },
   *       "allowDirectConstAssertionInArrowFunctions": {
   *         "type": "boolean",
   *         "description": "Whether to ignore arrow functions immediately returning a `as const` value."
   *       },
   *       "allowedNames": {
   *         "type": "array",
   *         "description": "An array of function/method names that will not have their arguments or return values checked.",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "allowExpressions": {
   *         "type": "boolean",
   *         "description": "Whether to ignore function expressions (functions which are not part of a declaration)."
   *       },
   *       "allowFunctionsWithoutTypeParameters": {
   *         "type": "boolean",
   *         "description": "Whether to ignore functions that don't have generic type parameters."
   *       },
   *       "allowHigherOrderFunctions": {
   *         "type": "boolean",
   *         "description": "Whether to ignore functions immediately returning another function expression."
   *       },
   *       "allowIIFEs": {
   *         "type": "boolean",
   *         "description": "Whether to ignore immediately invoked function expressions (IIFEs)."
   *       },
   *       "allowTypedFunctionExpressions": {
   *         "type": "boolean",
   *         "description": "Whether to ignore type annotations on the variable of function expressions."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to allow arrow functions that start with the `void` keyword. */
    allowConciseArrowFunctionExpressionsStartingWithVoid?: boolean;
    /**
     * Whether to ignore arrow functions immediately returning a `as const`
     * value.
     */
    allowDirectConstAssertionInArrowFunctions?: boolean;
    /**
     * An array of function/method names that will not have their arguments or
     * return values checked.
     */
    allowedNames?: readonly string[];
    /**
     * Whether to ignore function expressions (functions which are not part of a
     * declaration).
     */
    allowExpressions?: boolean;
    /** Whether to ignore functions that don't have generic type parameters. */
    allowFunctionsWithoutTypeParameters?: boolean;
    /**
     * Whether to ignore functions immediately returning another function
     * expression.
     */
    allowHigherOrderFunctions?: boolean;
    /** Whether to ignore immediately invoked function expressions (IIFEs). */
    allowIIFEs?: boolean;
    /**
     * Whether to ignore type annotations on the variable of function
     * expressions.
     */
    allowTypedFunctionExpressions?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require explicit accessibility modifiers on class properties and methods
 *
 * @link https://typescript-eslint.io/rules/explicit-member-accessibility
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  ```
 */
namespace ExplicitMemberAccessibility {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "$defs": {
   *       "accessibilityLevel": {
   *         "oneOf": [
   *           {
   *             "type": "string",
   *             "description": "Always require an accessor.",
   *             "enum": [
   *               "explicit"
   *             ]
   *           },
   *           {
   *             "type": "string",
   *             "description": "Require an accessor except when public.",
   *             "enum": [
   *               "no-public"
   *             ]
   *           },
   *           {
   *             "type": "string",
   *             "description": "Never check whether there is an accessor.",
   *             "enum": [
   *               "off"
   *             ]
   *           }
   *         ]
   *       }
   *     },
   *     "additionalProperties": false,
   *     "properties": {
   *       "accessibility": {
   *         "$ref": "#/$defs/accessibilityLevel",
   *         "description": "Which accessibility modifier is required to exist or not exist."
   *       },
   *       "ignoredMethodNames": {
   *         "type": "array",
   *         "description": "Specific method names that may be ignored.",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "overrides": {
   *         "type": "object",
   *         "additionalProperties": false,
   *         "description": "Changes to required accessibility modifiers for specific kinds of class members.",
   *         "properties": {
   *           "accessors": {
   *             "$ref": "#/$defs/accessibilityLevel",
   *             "description": "Which member accessibility modifier requirements to apply for accessors."
   *           },
   *           "constructors": {
   *             "$ref": "#/$defs/accessibilityLevel",
   *             "description": "Which member accessibility modifier requirements to apply for constructors."
   *           },
   *           "methods": {
   *             "$ref": "#/$defs/accessibilityLevel",
   *             "description": "Which member accessibility modifier requirements to apply for methods."
   *           },
   *           "parameterProperties": {
   *             "$ref": "#/$defs/accessibilityLevel",
   *             "description": "Which member accessibility modifier requirements to apply for parameterProperties."
   *           },
   *           "properties": {
   *             "$ref": "#/$defs/accessibilityLevel",
   *             "description": "Which member accessibility modifier requirements to apply for properties."
   *           }
   *         }
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Which accessibility modifier is required to exist or not exist. */
    accessibility?: 'explicit' | 'no-public' | 'off';
    /** Specific method names that may be ignored. */
    ignoredMethodNames?: readonly string[];
    /**
     * Changes to required accessibility modifiers for specific kinds of class
     * members.
     */
    overrides?: Readonly<{
      /**
       * Which member accessibility modifier requirements to apply for
       * accessors.
       */
      accessors?: 'explicit' | 'no-public' | 'off';
      /**
       * Which member accessibility modifier requirements to apply for
       * constructors.
       */
      constructors?: 'explicit' | 'no-public' | 'off';
      /** Which member accessibility modifier requirements to apply for methods. */
      methods?: 'explicit' | 'no-public' | 'off';
      /**
       * Which member accessibility modifier requirements to apply for
       * parameterProperties.
       */
      parameterProperties?: 'explicit' | 'no-public' | 'off';
      /**
       * Which member accessibility modifier requirements to apply for
       * properties.
       */
      properties?: 'explicit' | 'no-public' | 'off';
    }>;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require explicit return and argument types on exported functions' and
 * classes' public class methods
 *
 * @link https://typescript-eslint.io/rules/explicit-module-boundary-types
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace ExplicitModuleBoundaryTypes {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowArgumentsExplicitlyTypedAsAny": {
   *         "type": "boolean",
   *         "description": "Whether to ignore arguments that are explicitly typed as `any`."
   *       },
   *       "allowDirectConstAssertionInArrowFunctions": {
   *         "type": "boolean",
   *         "description": "Whether to ignore return type annotations on body-less arrow functions that return an `as const` type assertion.\nYou must still type the parameters of the function."
   *       },
   *       "allowedNames": {
   *         "type": "array",
   *         "description": "An array of function/method names that will not have their arguments or return values checked.",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "allowHigherOrderFunctions": {
   *         "type": "boolean",
   *         "description": "Whether to ignore return type annotations on functions immediately returning another function expression.\nYou must still type the parameters of the function."
   *       },
   *       "allowOverloadFunctions": {
   *         "type": "boolean",
   *         "description": "Whether to ignore return type annotations on functions with overload signatures."
   *       },
   *       "allowTypedFunctionExpressions": {
   *         "type": "boolean",
   *         "description": "Whether to ignore type annotations on the variable of a function expression."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to ignore arguments that are explicitly typed as `any`. */
    allowArgumentsExplicitlyTypedAsAny?: boolean;
    /**
     * Whether to ignore return type annotations on body-less arrow functions
     * that return an `as const` type assertion. You must still type the
     * parameters of the function.
     */
    allowDirectConstAssertionInArrowFunctions?: boolean;
    /**
     * An array of function/method names that will not have their arguments or
     * return values checked.
     */
    allowedNames?: readonly string[];
    /**
     * Whether to ignore return type annotations on functions immediately
     * returning another function expression. You must still type the parameters
     * of the function.
     */
    allowHigherOrderFunctions?: boolean;
    /**
     * Whether to ignore return type annotations on functions with overload
     * signatures.
     */
    allowOverloadFunctions?: boolean;
    /**
     * Whether to ignore type annotations on the variable of a function
     * expression.
     */
    allowTypedFunctionExpressions?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require or disallow initialization in variable declarations
 *
 * @link https://typescript-eslint.io/rules/init-declarations
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace InitDeclarations {
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
   *               "always"
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
   *             "enum": [
   *               "never"
   *             ]
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "ignoreForLoopInit": {
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
 * Enforce a maximum number of parameters in function definitions
 *
 * @link https://typescript-eslint.io/rules/max-params
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace MaxParams {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "countVoidThis": {
   *         "type": "boolean",
   *         "description": "Whether to count a `this` declaration when the type is `void`."
   *       },
   *       "max": {
   *         "type": "integer",
   *         "description": "A maximum number of parameters in function definitions.",
   *         "minimum": 0
   *       },
   *       "maximum": {
   *         "type": "integer",
   *         "description": "(deprecated) A maximum number of parameters in function definitions.",
   *         "minimum": 0
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to count a `this` declaration when the type is `void`. */
    countVoidThis?: boolean;
    /** A maximum number of parameters in function definitions. */
    max?: number;
    /** (deprecated) A maximum number of parameters in function definitions. */
    maximum?: number;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require a consistent member declaration order
 *
 * @link https://typescript-eslint.io/rules/member-ordering
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace MemberOrdering {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "$defs": {
   *       "allItems": {
   *         "type": "string",
   *         "enum": [
   *           "readonly-signature",
   *           "signature",
   *           "readonly-field",
   *           "public-readonly-field",
   *           "public-decorated-readonly-field",
   *           "decorated-readonly-field",
   *           "static-readonly-field",
   *           "public-static-readonly-field",
   *           "instance-readonly-field",
   *           "public-instance-readonly-field",
   *           "abstract-readonly-field",
   *           "public-abstract-readonly-field",
   *           "protected-readonly-field",
   *           "protected-decorated-readonly-field",
   *           "protected-static-readonly-field",
   *           "protected-instance-readonly-field",
   *           "protected-abstract-readonly-field",
   *           "private-readonly-field",
   *           "private-decorated-readonly-field",
   *           "private-static-readonly-field",
   *           "private-instance-readonly-field",
   *           "#private-readonly-field",
   *           "#private-static-readonly-field",
   *           "#private-instance-readonly-field",
   *           "field",
   *           "public-field",
   *           "public-decorated-field",
   *           "decorated-field",
   *           "static-field",
   *           "public-static-field",
   *           "instance-field",
   *           "public-instance-field",
   *           "abstract-field",
   *           "public-abstract-field",
   *           "protected-field",
   *           "protected-decorated-field",
   *           "protected-static-field",
   *           "protected-instance-field",
   *           "protected-abstract-field",
   *           "private-field",
   *           "private-decorated-field",
   *           "private-static-field",
   *           "private-instance-field",
   *           "#private-field",
   *           "#private-static-field",
   *           "#private-instance-field",
   *           "method",
   *           "public-method",
   *           "public-decorated-method",
   *           "decorated-method",
   *           "static-method",
   *           "public-static-method",
   *           "instance-method",
   *           "public-instance-method",
   *           "abstract-method",
   *           "public-abstract-method",
   *           "protected-method",
   *           "protected-decorated-method",
   *           "protected-static-method",
   *           "protected-instance-method",
   *           "protected-abstract-method",
   *           "private-method",
   *           "private-decorated-method",
   *           "private-static-method",
   *           "private-instance-method",
   *           "#private-method",
   *           "#private-static-method",
   *           "#private-instance-method",
   *           "call-signature",
   *           "constructor",
   *           "public-constructor",
   *           "protected-constructor",
   *           "private-constructor",
   *           "accessor",
   *           "public-accessor",
   *           "public-decorated-accessor",
   *           "decorated-accessor",
   *           "static-accessor",
   *           "public-static-accessor",
   *           "instance-accessor",
   *           "public-instance-accessor",
   *           "abstract-accessor",
   *           "public-abstract-accessor",
   *           "protected-accessor",
   *           "protected-decorated-accessor",
   *           "protected-static-accessor",
   *           "protected-instance-accessor",
   *           "protected-abstract-accessor",
   *           "private-accessor",
   *           "private-decorated-accessor",
   *           "private-static-accessor",
   *           "private-instance-accessor",
   *           "#private-accessor",
   *           "#private-static-accessor",
   *           "#private-instance-accessor",
   *           "get",
   *           "public-get",
   *           "public-decorated-get",
   *           "decorated-get",
   *           "static-get",
   *           "public-static-get",
   *           "instance-get",
   *           "public-instance-get",
   *           "abstract-get",
   *           "public-abstract-get",
   *           "protected-get",
   *           "protected-decorated-get",
   *           "protected-static-get",
   *           "protected-instance-get",
   *           "protected-abstract-get",
   *           "private-get",
   *           "private-decorated-get",
   *           "private-static-get",
   *           "private-instance-get",
   *           "#private-get",
   *           "#private-static-get",
   *           "#private-instance-get",
   *           "set",
   *           "public-set",
   *           "public-decorated-set",
   *           "decorated-set",
   *           "static-set",
   *           "public-static-set",
   *           "instance-set",
   *           "public-instance-set",
   *           "abstract-set",
   *           "public-abstract-set",
   *           "protected-set",
   *           "protected-decorated-set",
   *           "protected-static-set",
   *           "protected-instance-set",
   *           "protected-abstract-set",
   *           "private-set",
   *           "private-decorated-set",
   *           "private-static-set",
   *           "private-instance-set",
   *           "#private-set",
   *           "#private-static-set",
   *           "#private-instance-set",
   *           "static-initialization",
   *           "static-static-initialization",
   *           "public-static-static-initialization",
   *           "instance-static-initialization",
   *           "public-instance-static-initialization",
   *           "abstract-static-initialization",
   *           "public-abstract-static-initialization",
   *           "protected-static-static-initialization",
   *           "protected-instance-static-initialization",
   *           "protected-abstract-static-initialization",
   *           "private-static-static-initialization",
   *           "private-instance-static-initialization",
   *           "#private-static-static-initialization",
   *           "#private-instance-static-initialization"
   *         ]
   *       },
   *       "optionalityOrderOptions": {
   *         "type": "string",
   *         "enum": [
   *           "optional-first",
   *           "required-first"
   *         ]
   *       },
   *       "orderOptions": {
   *         "type": "string",
   *         "enum": [
   *           "alphabetically",
   *           "alphabetically-case-insensitive",
   *           "as-written",
   *           "natural",
   *           "natural-case-insensitive"
   *         ]
   *       },
   *       "typeItems": {
   *         "type": "string",
   *         "enum": [
   *           "readonly-signature",
   *           "signature",
   *           "readonly-field",
   *           "field",
   *           "method",
   *           "constructor"
   *         ]
   *       },
   *       "baseConfig": {
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
   *                   "$ref": "#/$defs/allItems"
   *                 },
   *                 {
   *                   "type": "array",
   *                   "items": {
   *                     "$ref": "#/$defs/allItems"
   *                   }
   *                 }
   *               ]
   *             }
   *           },
   *           {
   *             "type": "object",
   *             "additionalProperties": false,
   *             "properties": {
   *               "memberTypes": {
   *                 "oneOf": [
   *                   {
   *                     "type": "array",
   *                     "items": {
   *                       "oneOf": [
   *                         {
   *                           "$ref": "#/$defs/allItems"
   *                         },
   *                         {
   *                           "type": "array",
   *                           "items": {
   *                             "$ref": "#/$defs/allItems"
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
   *               "optionalityOrder": {
   *                 "$ref": "#/$defs/optionalityOrderOptions"
   *               },
   *               "order": {
   *                 "$ref": "#/$defs/orderOptions"
   *               }
   *             }
   *           }
   *         ]
   *       },
   *       "typesConfig": {
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
   *                   "$ref": "#/$defs/typeItems"
   *                 },
   *                 {
   *                   "type": "array",
   *                   "items": {
   *                     "$ref": "#/$defs/typeItems"
   *                   }
   *                 }
   *               ]
   *             }
   *           },
   *           {
   *             "type": "object",
   *             "additionalProperties": false,
   *             "properties": {
   *               "memberTypes": {
   *                 "oneOf": [
   *                   {
   *                     "type": "array",
   *                     "items": {
   *                       "oneOf": [
   *                         {
   *                           "$ref": "#/$defs/typeItems"
   *                         },
   *                         {
   *                           "type": "array",
   *                           "items": {
   *                             "$ref": "#/$defs/typeItems"
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
   *               "optionalityOrder": {
   *                 "$ref": "#/$defs/optionalityOrderOptions"
   *               },
   *               "order": {
   *                 "$ref": "#/$defs/orderOptions"
   *               }
   *             }
   *           }
   *         ]
   *       }
   *     },
   *     "additionalProperties": false,
   *     "properties": {
   *       "classes": {
   *         "$ref": "#/$defs/baseConfig",
   *         "description": "Which ordering to enforce for classes."
   *       },
   *       "classExpressions": {
   *         "$ref": "#/$defs/baseConfig",
   *         "description": "Which ordering to enforce for classExpressions."
   *       },
   *       "default": {
   *         "$ref": "#/$defs/baseConfig",
   *         "description": "Which ordering to enforce for default."
   *       },
   *       "interfaces": {
   *         "$ref": "#/$defs/typesConfig",
   *         "description": "Which ordering to enforce for interfaces."
   *       },
   *       "typeLiterals": {
   *         "$ref": "#/$defs/typesConfig",
   *         "description": "Which ordering to enforce for typeLiterals."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type AllItems =
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
    | 'accessor'
    | 'public-accessor'
    | 'public-decorated-accessor'
    | 'decorated-accessor'
    | 'static-accessor'
    | 'public-static-accessor'
    | 'instance-accessor'
    | 'public-instance-accessor'
    | 'abstract-accessor'
    | 'public-abstract-accessor'
    | 'protected-accessor'
    | 'protected-decorated-accessor'
    | 'protected-static-accessor'
    | 'protected-instance-accessor'
    | 'protected-abstract-accessor'
    | 'private-accessor'
    | 'private-decorated-accessor'
    | 'private-static-accessor'
    | 'private-instance-accessor'
    | '#private-accessor'
    | '#private-static-accessor'
    | '#private-instance-accessor'
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
    | '#private-instance-static-initialization';

  export type OptionalityOrderOptions = 'optional-first' | 'required-first';

  export type OrderOptions =
    | 'alphabetically'
    | 'alphabetically-case-insensitive'
    | 'as-written'
    | 'natural'
    | 'natural-case-insensitive';

  export type TypeItems =
    | 'readonly-signature'
    | 'signature'
    | 'readonly-field'
    | 'field'
    | 'method'
    | 'constructor';

  export type Options = Readonly<{
    /** Which ordering to enforce for classes. */
    classes?:
      | 'never'
      | readonly (AllItems | readonly AllItems[])[]
      | Readonly<{
          memberTypes?: readonly (AllItems | readonly AllItems[])[] | 'never';
          optionalityOrder?: OptionalityOrderOptions;
          order?: OrderOptions;
        }>;
    /** Which ordering to enforce for classExpressions. */
    classExpressions?:
      | 'never'
      | readonly (AllItems | readonly AllItems[])[]
      | Readonly<{
          memberTypes?: readonly (AllItems | readonly AllItems[])[] | 'never';
          optionalityOrder?: OptionalityOrderOptions;
          order?: OrderOptions;
        }>;
    /** Which ordering to enforce for default. */
    default?:
      | 'never'
      | readonly (AllItems | readonly AllItems[])[]
      | Readonly<{
          memberTypes?: readonly (AllItems | readonly AllItems[])[] | 'never';
          optionalityOrder?: OptionalityOrderOptions;
          order?: OrderOptions;
        }>;
    /** Which ordering to enforce for interfaces. */
    interfaces?:
      | 'never'
      | readonly (TypeItems | readonly TypeItems[])[]
      | Readonly<{
          memberTypes?: readonly (TypeItems | readonly TypeItems[])[] | 'never';
          optionalityOrder?: OptionalityOrderOptions;
          order?: OrderOptions;
        }>;
    /** Which ordering to enforce for typeLiterals. */
    typeLiterals?:
      | 'never'
      | readonly (TypeItems | readonly TypeItems[])[]
      | Readonly<{
          memberTypes?: readonly (TypeItems | readonly TypeItems[])[] | 'never';
          optionalityOrder?: OptionalityOrderOptions;
          order?: OrderOptions;
        }>;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce using a particular method signature syntax
 *
 * @link https://typescript-eslint.io/rules/method-signature-style
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace MethodSignatureStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "description": "The method signature style to enforce using.",
   *     "enum": [
   *       "property",
   *       "method"
   *     ]
   *   }
   * ]
   * ```
   */
  /** The method signature style to enforce using. */
  export type Options = 'property' | 'method';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce naming conventions for everything across a codebase
 *
 * @link https://typescript-eslint.io/rules/naming-convention
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace NamingConvention {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "$defs": {
   *       "predefinedFormats": {
   *         "enum": [
   *           "camelCase",
   *           "strictCamelCase",
   *           "PascalCase",
   *           "StrictPascalCase",
   *           "snake_case",
   *           "UPPER_CASE"
   *         ],
   *         "type": "string"
   *       },
   *       "typeModifiers": {
   *         "enum": [
   *           "boolean",
   *           "string",
   *           "number",
   *           "function",
   *           "array"
   *         ],
   *         "type": "string"
   *       },
   *       "underscoreOptions": {
   *         "enum": [
   *           "forbid",
   *           "allow",
   *           "require",
   *           "requireDouble",
   *           "allowDouble",
   *           "allowSingleOrDouble"
   *         ],
   *         "type": "string"
   *       },
   *       "formatOptionsConfig": {
   *         "oneOf": [
   *           {
   *             "additionalItems": false,
   *             "items": {
   *               "$ref": "#/$defs/predefinedFormats"
   *             },
   *             "type": "array"
   *           },
   *           {
   *             "type": "null"
   *           }
   *         ]
   *       },
   *       "matchRegexConfig": {
   *         "additionalProperties": false,
   *         "properties": {
   *           "match": {
   *             "type": "boolean"
   *           },
   *           "regex": {
   *             "type": "string"
   *           }
   *         },
   *         "required": [
   *           "match",
   *           "regex"
   *         ],
   *         "type": "object"
   *       },
   *       "prefixSuffixConfig": {
   *         "additionalItems": false,
   *         "items": {
   *           "minLength": 1,
   *           "type": "string"
   *         },
   *         "type": "array"
   *       }
   *     },
   *     "additionalItems": false,
   *     "items": {
   *       "oneOf": [
   *         {
   *           "additionalProperties": false,
   *           "description": "Multiple selectors in one config",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "const",
   *                   "readonly",
   *                   "static",
   *                   "public",
   *                   "protected",
   *                   "private",
   *                   "#private",
   *                   "abstract",
   *                   "destructured",
   *                   "global",
   *                   "exported",
   *                   "unused",
   *                   "requiresQuotes",
   *                   "override",
   *                   "async",
   *                   "default",
   *                   "namespace"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             },
   *             "selector": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "default",
   *                   "variableLike",
   *                   "memberLike",
   *                   "typeLike",
   *                   "method",
   *                   "property",
   *                   "accessor",
   *                   "variable",
   *                   "function",
   *                   "parameter",
   *                   "parameterProperty",
   *                   "classicAccessor",
   *                   "enumMember",
   *                   "classMethod",
   *                   "objectLiteralMethod",
   *                   "typeMethod",
   *                   "classProperty",
   *                   "objectLiteralProperty",
   *                   "typeProperty",
   *                   "autoAccessor",
   *                   "class",
   *                   "interface",
   *                   "typeAlias",
   *                   "enum",
   *                   "typeParameter",
   *                   "import"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             },
   *             "types": {
   *               "additionalItems": false,
   *               "items": {
   *                 "$ref": "#/$defs/typeModifiers"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'default'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "default"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "const",
   *                   "readonly",
   *                   "static",
   *                   "public",
   *                   "protected",
   *                   "private",
   *                   "#private",
   *                   "abstract",
   *                   "destructured",
   *                   "global",
   *                   "exported",
   *                   "unused",
   *                   "requiresQuotes",
   *                   "override",
   *                   "async",
   *                   "default",
   *                   "namespace"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'variableLike'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "variableLike"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "unused",
   *                   "async"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'variable'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "variable"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "const",
   *                   "destructured",
   *                   "exported",
   *                   "global",
   *                   "unused",
   *                   "async"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             },
   *             "types": {
   *               "additionalItems": false,
   *               "items": {
   *                 "$ref": "#/$defs/typeModifiers"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'function'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "function"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "exported",
   *                   "global",
   *                   "unused",
   *                   "async"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'parameter'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "parameter"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "destructured",
   *                   "unused"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             },
   *             "types": {
   *               "additionalItems": false,
   *               "items": {
   *                 "$ref": "#/$defs/typeModifiers"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'memberLike'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "memberLike"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "abstract",
   *                   "private",
   *                   "#private",
   *                   "protected",
   *                   "public",
   *                   "readonly",
   *                   "requiresQuotes",
   *                   "static",
   *                   "override",
   *                   "async"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'classProperty'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "classProperty"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "abstract",
   *                   "private",
   *                   "#private",
   *                   "protected",
   *                   "public",
   *                   "readonly",
   *                   "requiresQuotes",
   *                   "static",
   *                   "override"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             },
   *             "types": {
   *               "additionalItems": false,
   *               "items": {
   *                 "$ref": "#/$defs/typeModifiers"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'objectLiteralProperty'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "objectLiteralProperty"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "public",
   *                   "requiresQuotes"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             },
   *             "types": {
   *               "additionalItems": false,
   *               "items": {
   *                 "$ref": "#/$defs/typeModifiers"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'typeProperty'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "typeProperty"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "public",
   *                   "readonly",
   *                   "requiresQuotes"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             },
   *             "types": {
   *               "additionalItems": false,
   *               "items": {
   *                 "$ref": "#/$defs/typeModifiers"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'parameterProperty'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "parameterProperty"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "private",
   *                   "protected",
   *                   "public",
   *                   "readonly"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             },
   *             "types": {
   *               "additionalItems": false,
   *               "items": {
   *                 "$ref": "#/$defs/typeModifiers"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'property'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "property"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "abstract",
   *                   "private",
   *                   "#private",
   *                   "protected",
   *                   "public",
   *                   "readonly",
   *                   "requiresQuotes",
   *                   "static",
   *                   "override",
   *                   "async"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             },
   *             "types": {
   *               "additionalItems": false,
   *               "items": {
   *                 "$ref": "#/$defs/typeModifiers"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'classMethod'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "classMethod"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "abstract",
   *                   "private",
   *                   "#private",
   *                   "protected",
   *                   "public",
   *                   "requiresQuotes",
   *                   "static",
   *                   "override",
   *                   "async"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'objectLiteralMethod'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "objectLiteralMethod"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "public",
   *                   "requiresQuotes",
   *                   "async"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'typeMethod'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "typeMethod"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "public",
   *                   "requiresQuotes"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'method'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "method"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "abstract",
   *                   "private",
   *                   "#private",
   *                   "protected",
   *                   "public",
   *                   "requiresQuotes",
   *                   "static",
   *                   "override",
   *                   "async"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'classicAccessor'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "classicAccessor"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "abstract",
   *                   "private",
   *                   "protected",
   *                   "public",
   *                   "requiresQuotes",
   *                   "static",
   *                   "override"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             },
   *             "types": {
   *               "additionalItems": false,
   *               "items": {
   *                 "$ref": "#/$defs/typeModifiers"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'autoAccessor'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "autoAccessor"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "abstract",
   *                   "private",
   *                   "protected",
   *                   "public",
   *                   "requiresQuotes",
   *                   "static",
   *                   "override"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             },
   *             "types": {
   *               "additionalItems": false,
   *               "items": {
   *                 "$ref": "#/$defs/typeModifiers"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'accessor'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "accessor"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "abstract",
   *                   "private",
   *                   "protected",
   *                   "public",
   *                   "requiresQuotes",
   *                   "static",
   *                   "override"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             },
   *             "types": {
   *               "additionalItems": false,
   *               "items": {
   *                 "$ref": "#/$defs/typeModifiers"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'enumMember'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "enumMember"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "requiresQuotes"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'typeLike'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "typeLike"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "abstract",
   *                   "exported",
   *                   "unused"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'class'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "class"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "abstract",
   *                   "exported",
   *                   "unused"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'interface'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "interface"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "exported",
   *                   "unused"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'typeAlias'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "typeAlias"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "exported",
   *                   "unused"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'enum'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "enum"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "exported",
   *                   "unused"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'typeParameter'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "typeParameter"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "unused"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         },
   *         {
   *           "additionalProperties": false,
   *           "description": "Selector 'import'",
   *           "properties": {
   *             "custom": {
   *               "$ref": "#/$defs/matchRegexConfig"
   *             },
   *             "failureMessage": {
   *               "type": "string"
   *             },
   *             "format": {
   *               "$ref": "#/$defs/formatOptionsConfig"
   *             },
   *             "leadingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "prefix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "suffix": {
   *               "$ref": "#/$defs/prefixSuffixConfig"
   *             },
   *             "trailingUnderscore": {
   *               "$ref": "#/$defs/underscoreOptions"
   *             },
   *             "filter": {
   *               "oneOf": [
   *                 {
   *                   "minLength": 1,
   *                   "type": "string"
   *                 },
   *                 {
   *                   "$ref": "#/$defs/matchRegexConfig"
   *                 }
   *               ]
   *             },
   *             "selector": {
   *               "enum": [
   *                 "import"
   *               ],
   *               "type": "string"
   *             },
   *             "modifiers": {
   *               "additionalItems": false,
   *               "items": {
   *                 "enum": [
   *                   "default",
   *                   "namespace"
   *                 ],
   *                 "type": "string"
   *               },
   *               "type": "array"
   *             }
   *           },
   *           "required": [
   *             "selector",
   *             "format"
   *           ],
   *           "type": "object"
   *         }
   *       ]
   *     },
   *     "type": "array"
   *   }
   * ]
   * ```
   */
  export type FormatOptionsConfig = readonly PredefinedFormats[] | null;

  export type PredefinedFormats =
    | 'camelCase'
    | 'strictCamelCase'
    | 'PascalCase'
    | 'StrictPascalCase'
    | 'snake_case'
    | 'UPPER_CASE';

  export type UnderscoreOptions =
    | 'forbid'
    | 'allow'
    | 'require'
    | 'requireDouble'
    | 'allowDouble'
    | 'allowSingleOrDouble';

  export type PrefixSuffixConfig = readonly string[];

  export type TypeModifiers =
    | 'boolean'
    | 'string'
    | 'number'
    | 'function'
    | 'array';

  export type Options = readonly Readonly<
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        modifiers?: readonly (
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
          | 'default'
          | 'namespace'
        )[];
        selector: readonly (
          | 'default'
          | 'variableLike'
          | 'memberLike'
          | 'typeLike'
          | 'method'
          | 'property'
          | 'accessor'
          | 'variable'
          | 'function'
          | 'parameter'
          | 'parameterProperty'
          | 'classicAccessor'
          | 'enumMember'
          | 'classMethod'
          | 'objectLiteralMethod'
          | 'typeMethod'
          | 'classProperty'
          | 'objectLiteralProperty'
          | 'typeProperty'
          | 'autoAccessor'
          | 'class'
          | 'interface'
          | 'typeAlias'
          | 'enum'
          | 'typeParameter'
          | 'import'
        )[];
        types?: readonly TypeModifiers[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'default';
        modifiers?: readonly (
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
          | 'default'
          | 'namespace'
        )[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'variableLike';
        modifiers?: readonly ('unused' | 'async')[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'variable';
        modifiers?: readonly (
          | 'const'
          | 'destructured'
          | 'exported'
          | 'global'
          | 'unused'
          | 'async'
        )[];
        types?: readonly TypeModifiers[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'function';
        modifiers?: readonly ('exported' | 'global' | 'unused' | 'async')[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'parameter';
        modifiers?: readonly ('destructured' | 'unused')[];
        types?: readonly TypeModifiers[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'memberLike';
        modifiers?: readonly (
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
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'classProperty';
        modifiers?: readonly (
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
        types?: readonly TypeModifiers[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'objectLiteralProperty';
        modifiers?: readonly ('public' | 'requiresQuotes')[];
        types?: readonly TypeModifiers[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'typeProperty';
        modifiers?: readonly ('public' | 'readonly' | 'requiresQuotes')[];
        types?: readonly TypeModifiers[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'parameterProperty';
        modifiers?: readonly (
          | 'private'
          | 'protected'
          | 'public'
          | 'readonly'
        )[];
        types?: readonly TypeModifiers[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'property';
        modifiers?: readonly (
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
        types?: readonly TypeModifiers[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'classMethod';
        modifiers?: readonly (
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
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'objectLiteralMethod';
        modifiers?: readonly ('public' | 'requiresQuotes' | 'async')[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'typeMethod';
        modifiers?: readonly ('public' | 'requiresQuotes')[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'method';
        modifiers?: readonly (
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
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'classicAccessor';
        modifiers?: readonly (
          | 'abstract'
          | 'private'
          | 'protected'
          | 'public'
          | 'requiresQuotes'
          | 'static'
          | 'override'
        )[];
        types?: readonly TypeModifiers[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'autoAccessor';
        modifiers?: readonly (
          | 'abstract'
          | 'private'
          | 'protected'
          | 'public'
          | 'requiresQuotes'
          | 'static'
          | 'override'
        )[];
        types?: readonly TypeModifiers[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'accessor';
        modifiers?: readonly (
          | 'abstract'
          | 'private'
          | 'protected'
          | 'public'
          | 'requiresQuotes'
          | 'static'
          | 'override'
        )[];
        types?: readonly TypeModifiers[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'enumMember';
        modifiers?: readonly 'requiresQuotes'[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'typeLike';
        modifiers?: readonly ('abstract' | 'exported' | 'unused')[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'class';
        modifiers?: readonly ('abstract' | 'exported' | 'unused')[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'interface';
        modifiers?: readonly ('exported' | 'unused')[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'typeAlias';
        modifiers?: readonly ('exported' | 'unused')[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'enum';
        modifiers?: readonly ('exported' | 'unused')[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'typeParameter';
        modifiers?: readonly 'unused'[];
      }
    | {
        custom?: MatchRegexConfig;
        failureMessage?: string;
        format: FormatOptionsConfig;
        leadingUnderscore?: UnderscoreOptions;
        prefix?: PrefixSuffixConfig;
        suffix?: PrefixSuffixConfig;
        trailingUnderscore?: UnderscoreOptions;
        filter?: string | MatchRegexConfig;
        selector: 'import';
        modifiers?: readonly ('default' | 'namespace')[];
      }
  >[];

  export type MatchRegexConfig = Readonly<{
    match: boolean;
    regex: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow generic `Array` constructors
 *
 * @link https://typescript-eslint.io/rules/no-array-constructor
 *
 *  ```md
 *  | key         | value       |
 *  | :---------- | :---------- |
 *  | type        | suggestion  |
 *  | deprecated  | false       |
 *  | fixable     | code        |
 *  | recommended | recommended |
 *  ```
 */
namespace NoArrayConstructor {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow using the `delete` operator on array values
 *
 * @link https://typescript-eslint.io/rules/no-array-delete
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | problem     |
 *  | deprecated           | false       |
 *  | hasSuggestions       | true        |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace NoArrayDelete {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require `.toString()` and `.toLocaleString()` to only be called on objects
 * which provide useful information when stringified
 *
 * @link https://typescript-eslint.io/rules/no-base-to-string
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | suggestion  |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace NoBaseToString {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "checkUnknown": {
   *         "type": "boolean",
   *         "description": "Whether to also check values of type `unknown`"
   *       },
   *       "ignoredTypeNames": {
   *         "type": "array",
   *         "description": "Stringified type names to ignore.",
   *         "items": {
   *           "type": "string"
   *         }
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to also check values of type `unknown` */
    checkUnknown?: boolean;
    /** Stringified type names to ignore. */
    ignoredTypeNames?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow non-null assertion in locations that may be confusing
 *
 * @link https://typescript-eslint.io/rules/no-confusing-non-null-assertion
 *
 *  ```md
 *  | key            | value     |
 *  | :------------- | :-------- |
 *  | type           | problem   |
 *  | deprecated     | false     |
 *  | hasSuggestions | true      |
 *  | recommended    | stylistic |
 *  ```
 */
namespace NoConfusingNonNullAssertion {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require expressions of type void to appear in statement position
 *
 * @link https://typescript-eslint.io/rules/no-confusing-void-expression
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | fixable              | code    |
 *  | hasSuggestions       | true    |
 *  | recommended          | strict  |
 *  | requiresTypeChecking | true    |
 *  ```
 */
namespace NoConfusingVoidExpression {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "ignoreArrowShorthand": {
   *         "type": "boolean",
   *         "description": "Whether to ignore \"shorthand\" `() =>` arrow functions: those without `{ ... }` braces."
   *       },
   *       "ignoreVoidOperator": {
   *         "type": "boolean",
   *         "description": "Whether to ignore returns that start with the `void` operator."
   *       },
   *       "ignoreVoidReturningFunctions": {
   *         "type": "boolean",
   *         "description": "Whether to ignore returns from functions with explicit `void` return types and functions with contextual `void` return types."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to ignore "shorthand" `() =>` arrow functions: those without `{
     * ... }` braces.
     */
    ignoreArrowShorthand?: boolean;
    /** Whether to ignore returns that start with the `void` operator. */
    ignoreVoidOperator?: boolean;
    /**
     * Whether to ignore returns from functions with explicit `void` return
     * types and functions with contextual `void` return types.
     */
    ignoreVoidReturningFunctions?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow using code marked as `@deprecated`
 *
 * @link https://typescript-eslint.io/rules/no-deprecated
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | recommended          | strict  |
 *  | requiresTypeChecking | true    |
 *  ```
 */
namespace NoDeprecated {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allow": {
   *         "items": {
   *           "oneOf": [
   *             {
   *               "type": "string"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "file"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 },
   *                 "path": {
   *                   "type": "string"
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name"
   *               ],
   *               "type": "object"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "lib"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name"
   *               ],
   *               "type": "object"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "package"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 },
   *                 "package": {
   *                   "type": "string"
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name",
   *                 "package"
   *               ],
   *               "type": "object"
   *             }
   *           ]
   *         },
   *         "type": "array",
   *         "description": "Type specifiers that can be allowed."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Type specifiers that can be allowed. */
    allow?: readonly (
      | string
      | Readonly<
          | {
              from: 'file';
              name: string | readonly [string, ...string[]];
              path?: string;
            }
          | {
              from: 'lib';
              name: string | readonly [string, ...string[]];
            }
          | {
              from: 'package';
              name: string | readonly [string, ...string[]];
              package: string;
            }
        >
    )[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow duplicate class members
 *
 * @link https://typescript-eslint.io/rules/no-dupe-class-members
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoDupeClassMembers {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow duplicate enum member values
 *
 * @link https://typescript-eslint.io/rules/no-duplicate-enum-values
 *
 *  ```md
 *  | key            | value       |
 *  | :------------- | :---------- |
 *  | type           | problem     |
 *  | deprecated     | false       |
 *  | hasSuggestions | false       |
 *  | recommended    | recommended |
 *  ```
 */
namespace NoDuplicateEnumValues {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow duplicate constituents of union or intersection types
 *
 * @link https://typescript-eslint.io/rules/no-duplicate-type-constituents
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | suggestion  |
 *  | deprecated           | false       |
 *  | fixable              | code        |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace NoDuplicateTypeConstituents {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "ignoreIntersections": {
   *         "type": "boolean",
   *         "description": "Whether to ignore `&` intersections."
   *       },
   *       "ignoreUnions": {
   *         "type": "boolean",
   *         "description": "Whether to ignore `|` unions."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to ignore `&` intersections. */
    ignoreIntersections?: boolean;
    /** Whether to ignore `|` unions. */
    ignoreUnions?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow using the `delete` operator on computed key expressions
 *
 * @link https://typescript-eslint.io/rules/no-dynamic-delete
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | strict     |
 *  ```
 */
namespace NoDynamicDelete {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow empty functions
 *
 * @link https://typescript-eslint.io/rules/no-empty-function
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  | recommended    | stylistic  |
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
   *             "private-constructors",
   *             "protected-constructors",
   *             "asyncFunctions",
   *             "asyncMethods",
   *             "decoratedFunctions",
   *             "overrideMethods"
   *           ],
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "description": "Locations and kinds of functions that are allowed to be empty."
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Locations and kinds of functions that are allowed to be empty. */
    allow?: readonly (
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
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow the declaration of empty interfaces
 *
 * @link https://typescript-eslint.io/rules/no-empty-interface
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | true       |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
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
   *         "type": "boolean",
   *         "description": "Whether to allow empty interfaces that extend a single other interface."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Disallow accidentally using the "empty object" type
 *
 * @link https://typescript-eslint.io/rules/no-empty-object-type
 *
 *  ```md
 *  | key            | value       |
 *  | :------------- | :---------- |
 *  | type           | suggestion  |
 *  | deprecated     | false       |
 *  | hasSuggestions | true        |
 *  | recommended    | recommended |
 *  ```
 */
namespace NoEmptyObjectType {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowInterfaces": {
   *         "type": "string",
   *         "description": "Whether to allow empty interfaces.",
   *         "enum": [
   *           "always",
   *           "never",
   *           "with-single-extends"
   *         ]
   *       },
   *       "allowObjectTypes": {
   *         "type": "string",
   *         "description": "Whether to allow empty object type literals.",
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       },
   *       "allowWithName": {
   *         "type": "string",
   *         "description": "A stringified regular expression to allow interfaces and object type aliases with the configured name."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to allow empty interfaces. */
    allowInterfaces?: 'always' | 'never' | 'with-single-extends';
    /** Whether to allow empty object type literals. */
    allowObjectTypes?: 'always' | 'never';
    /**
     * A stringified regular expression to allow interfaces and object type
     * aliases with the configured name.
     */
    allowWithName?: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow the `any` type
 *
 * @link https://typescript-eslint.io/rules/no-explicit-any
 *
 *  ```md
 *  | key            | value       |
 *  | :------------- | :---------- |
 *  | type           | suggestion  |
 *  | deprecated     | false       |
 *  | fixable        | code        |
 *  | hasSuggestions | true        |
 *  | recommended    | recommended |
 *  ```
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
   *         "type": "boolean",
   *         "description": "Whether to enable auto-fixing in which the `any` type is converted to the `unknown` type."
   *       },
   *       "ignoreRestArgs": {
   *         "type": "boolean",
   *         "description": "Whether to ignore rest parameter arrays."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to enable auto-fixing in which the `any` type is converted to the
     * `unknown` type.
     */
    fixToUnknown?: boolean;
    /** Whether to ignore rest parameter arrays. */
    ignoreRestArgs?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow extra non-null assertions
 *
 * @link https://typescript-eslint.io/rules/no-extra-non-null-assertion
 *
 *  ```md
 *  | key         | value       |
 *  | :---------- | :---------- |
 *  | type        | problem     |
 *  | deprecated  | false       |
 *  | fixable     | code        |
 *  | recommended | recommended |
 *  ```
 */
namespace NoExtraNonNullAssertion {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow classes used as namespaces
 *
 * @link https://typescript-eslint.io/rules/no-extraneous-class
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | strict     |
 *  ```
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
   *         "type": "boolean",
   *         "description": "Whether to allow extraneous classes that contain only a constructor."
   *       },
   *       "allowEmpty": {
   *         "type": "boolean",
   *         "description": "Whether to allow extraneous classes that have no body (i.e. are empty)."
   *       },
   *       "allowStaticOnly": {
   *         "type": "boolean",
   *         "description": "Whether to allow extraneous classes that only contain static members."
   *       },
   *       "allowWithDecorator": {
   *         "type": "boolean",
   *         "description": "Whether to allow extraneous classes that include a decorator."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to allow extraneous classes that contain only a constructor. */
    allowConstructorOnly?: boolean;
    /** Whether to allow extraneous classes that have no body (i.e. are empty). */
    allowEmpty?: boolean;
    /** Whether to allow extraneous classes that only contain static members. */
    allowStaticOnly?: boolean;
    /** Whether to allow extraneous classes that include a decorator. */
    allowWithDecorator?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require Promise-like statements to be handled appropriately
 *
 * @link https://typescript-eslint.io/rules/no-floating-promises
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | problem     |
 *  | deprecated           | false       |
 *  | hasSuggestions       | true        |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace NoFloatingPromises {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowForKnownSafeCalls": {
   *         "items": {
   *           "oneOf": [
   *             {
   *               "type": "string"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "file"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 },
   *                 "path": {
   *                   "type": "string"
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name"
   *               ],
   *               "type": "object"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "lib"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name"
   *               ],
   *               "type": "object"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "package"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 },
   *                 "package": {
   *                   "type": "string"
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name",
   *                 "package"
   *               ],
   *               "type": "object"
   *             }
   *           ]
   *         },
   *         "type": "array",
   *         "description": "Type specifiers of functions whose calls are safe to float."
   *       },
   *       "allowForKnownSafePromises": {
   *         "items": {
   *           "oneOf": [
   *             {
   *               "type": "string"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "file"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 },
   *                 "path": {
   *                   "type": "string"
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name"
   *               ],
   *               "type": "object"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "lib"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name"
   *               ],
   *               "type": "object"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "package"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 },
   *                 "package": {
   *                   "type": "string"
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name",
   *                 "package"
   *               ],
   *               "type": "object"
   *             }
   *           ]
   *         },
   *         "type": "array",
   *         "description": "Type specifiers that are known to be safe to float."
   *       },
   *       "checkThenables": {
   *         "type": "boolean",
   *         "description": "Whether to check all \"Thenable\"s, not just the built-in Promise type."
   *       },
   *       "ignoreIIFE": {
   *         "type": "boolean",
   *         "description": "Whether to ignore async IIFEs (Immediately Invoked Function Expressions)."
   *       },
   *       "ignoreVoid": {
   *         "type": "boolean",
   *         "description": "Whether to ignore `void` expressions."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Type specifiers of functions whose calls are safe to float. */
    allowForKnownSafeCalls?: readonly (
      | string
      | Readonly<
          | {
              from: 'file';
              name: string | readonly [string, ...string[]];
              path?: string;
            }
          | {
              from: 'lib';
              name: string | readonly [string, ...string[]];
            }
          | {
              from: 'package';
              name: string | readonly [string, ...string[]];
              package: string;
            }
        >
    )[];
    /** Type specifiers that are known to be safe to float. */
    allowForKnownSafePromises?: readonly (
      | string
      | Readonly<
          | {
              from: 'file';
              name: string | readonly [string, ...string[]];
              path?: string;
            }
          | {
              from: 'lib';
              name: string | readonly [string, ...string[]];
            }
          | {
              from: 'package';
              name: string | readonly [string, ...string[]];
              package: string;
            }
        >
    )[];
    /** Whether to check all "Thenable"s, not just the built-in Promise type. */
    checkThenables?: boolean;
    /** Whether to ignore async IIFEs (Immediately Invoked Function Expressions). */
    ignoreIIFE?: boolean;
    /** Whether to ignore `void` expressions. */
    ignoreVoid?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow iterating over an array with a for-in loop
 *
 * @link https://typescript-eslint.io/rules/no-for-in-array
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | problem     |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace NoForInArray {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow the use of `eval()`-like functions
 *
 * @link https://typescript-eslint.io/rules/no-implied-eval
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | suggestion  |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace NoImpliedEval {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of top-level import type qualifier when an import only has
 * specifiers with inline type qualifiers
 *
 * @link https://typescript-eslint.io/rules/no-import-type-side-effects
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  | fixable    | code    |
 *  ```
 */
namespace NoImportTypeSideEffects {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow explicit type declarations for variables or parameters initialized
 * to a number, string, or boolean
 *
 * @link https://typescript-eslint.io/rules/no-inferrable-types
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | stylistic  |
 *  ```
 */
namespace NoInferrableTypes {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "ignoreParameters": {
   *         "type": "boolean",
   *         "description": "Whether to ignore function parameters."
   *       },
   *       "ignoreProperties": {
   *         "type": "boolean",
   *         "description": "Whether to ignore class properties."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to ignore function parameters. */
    ignoreParameters?: boolean;
    /** Whether to ignore class properties. */
    ignoreProperties?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow `this` keywords outside of classes or class-like objects
 *
 * @link https://typescript-eslint.io/rules/no-invalid-this
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
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
 * Disallow `void` type outside of generic or return types
 *
 * @link https://typescript-eslint.io/rules/no-invalid-void-type
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | strict  |
 *  ```
 */
namespace NoInvalidVoidType {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowAsThisParameter": {
   *         "type": "boolean",
   *         "description": "Whether a `this` parameter of a function may be `void`."
   *       },
   *       "allowInGenericTypeArguments": {
   *         "description": "Whether `void` can be used as a valid value for generic type parameters.",
   *         "oneOf": [
   *           {
   *             "type": "boolean",
   *             "description": "Whether `void` can be used as a valid value for all generic type parameters."
   *           },
   *           {
   *             "type": "array",
   *             "description": "Allowlist of types that may accept `void` as a generic type parameter.",
   *             "items": {
   *               "type": "string"
   *             },
   *             "minItems": 1
   *           }
   *         ]
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether a `this` parameter of a function may be `void`. */
    allowAsThisParameter?: boolean;
    /** Whether `void` can be used as a valid value for generic type parameters. */
    allowInGenericTypeArguments?: boolean | readonly [string, ...string[]];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow function declarations that contain unsafe references inside loop
 * statements
 *
 * @link https://typescript-eslint.io/rules/no-loop-func
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoLoopFunc {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow literal numbers that lose precision
 *
 * @link https://typescript-eslint.io/rules/no-loss-of-precision
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | true    |
 *  ```
 */
namespace NoLossOfPrecision {
  export type RuleEntry = 0;
}

/**
 * Disallow magic numbers
 *
 * @link https://typescript-eslint.io/rules/no-magic-numbers
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
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
   *         "default": false,
   *         "description": "Whether enums used in TypeScript are considered okay."
   *       },
   *       "ignoreNumericLiteralTypes": {
   *         "type": "boolean",
   *         "default": false,
   *         "description": "Whether numbers used in TypeScript numeric literal types are considered okay."
   *       },
   *       "ignoreReadonlyClassProperties": {
   *         "type": "boolean",
   *         "default": false,
   *         "description": "Whether `readonly` class properties are considered okay."
   *       },
   *       "ignoreTypeIndexes": {
   *         "type": "boolean",
   *         "default": false,
   *         "description": "Whether numbers used to index types are okay."
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
    /**
     * Whether enums used in TypeScript are considered okay.
     *
     * @default false
     */
    ignoreEnums?: boolean;
    /**
     * Whether numbers used in TypeScript numeric literal types are considered
     * okay.
     *
     * @default false
     */
    ignoreNumericLiteralTypes?: boolean;
    /**
     * Whether `readonly` class properties are considered okay.
     *
     * @default false
     */
    ignoreReadonlyClassProperties?: boolean;
    /**
     * Whether numbers used to index types are okay.
     *
     * @default false
     */
    ignoreTypeIndexes?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow the `void` operator except when used to discard a value
 *
 * @link https://typescript-eslint.io/rules/no-meaningless-void-operator
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | fixable              | code       |
 *  | hasSuggestions       | true       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace NoMeaninglessVoidOperator {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "checkNever": {
   *         "type": "boolean",
   *         "description": "Whether to suggest removing `void` when the argument has type `never`."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to suggest removing `void` when the argument has type `never`. */
    checkNever?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce valid definition of `new` and `constructor`
 *
 * @link https://typescript-eslint.io/rules/no-misused-new
 *
 *  ```md
 *  | key         | value       |
 *  | :---------- | :---------- |
 *  | type        | problem     |
 *  | deprecated  | false       |
 *  | recommended | recommended |
 *  ```
 */
namespace NoMisusedNew {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow Promises in places not designed to handle them
 *
 * @link https://typescript-eslint.io/rules/no-misused-promises
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | problem     |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace NoMisusedPromises {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "checksConditionals": {
   *         "type": "boolean",
   *         "description": "Whether to warn when a Promise is provided to conditional statements."
   *       },
   *       "checksSpreads": {
   *         "type": "boolean",
   *         "description": "Whether to warn when `...` spreading a `Promise`."
   *       },
   *       "checksVoidReturn": {
   *         "description": "Whether to warn when a Promise is returned from a function typed as returning `void`.",
   *         "oneOf": [
   *           {
   *             "type": "boolean",
   *             "description": "Whether to disable checking all asynchronous functions."
   *           },
   *           {
   *             "type": "object",
   *             "additionalProperties": false,
   *             "description": "Which forms of functions may have checking disabled.",
   *             "properties": {
   *               "arguments": {
   *                 "type": "boolean",
   *                 "description": "Disables checking an asynchronous function passed as argument where the parameter type expects a function that returns `void`."
   *               },
   *               "attributes": {
   *                 "type": "boolean",
   *                 "description": "Disables checking an asynchronous function passed as a JSX attribute expected to be a function that returns `void`."
   *               },
   *               "inheritedMethods": {
   *                 "type": "boolean",
   *                 "description": "Disables checking an asynchronous method in a type that extends or implements another type expecting that method to return `void`."
   *               },
   *               "properties": {
   *                 "type": "boolean",
   *                 "description": "Disables checking an asynchronous function passed as an object property expected to be a function that returns `void`."
   *               },
   *               "returns": {
   *                 "type": "boolean",
   *                 "description": "Disables checking an asynchronous function returned in a function whose return type is a function that returns `void`."
   *               },
   *               "variables": {
   *                 "type": "boolean",
   *                 "description": "Disables checking an asynchronous function used as a variable whose return type is a function that returns `void`."
   *               }
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
    /** Whether to warn when a Promise is provided to conditional statements. */
    checksConditionals?: boolean;
    /** Whether to warn when `...` spreading a `Promise`. */
    checksSpreads?: boolean;
    /**
     * Whether to warn when a Promise is returned from a function typed as
     * returning `void`.
     */
    checksVoidReturn?:
      | boolean
      | Readonly<{
          /**
           * Disables checking an asynchronous function passed as argument where
           * the parameter type expects a function that returns `void`.
           */
          arguments?: boolean;
          /**
           * Disables checking an asynchronous function passed as a JSX
           * attribute expected to be a function that returns `void`.
           */
          attributes?: boolean;
          /**
           * Disables checking an asynchronous method in a type that extends or
           * implements another type expecting that method to return `void`.
           */
          inheritedMethods?: boolean;
          /**
           * Disables checking an asynchronous function passed as an object
           * property expected to be a function that returns `void`.
           */
          properties?: boolean;
          /**
           * Disables checking an asynchronous function returned in a function
           * whose return type is a function that returns `void`.
           */
          returns?: boolean;
          /**
           * Disables checking an asynchronous function used as a variable whose
           * return type is a function that returns `void`.
           */
          variables?: boolean;
        }>;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow using the spread operator when it might cause unexpected behavior
 *
 * @link https://typescript-eslint.io/rules/no-misused-spread
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | hasSuggestions       | true    |
 *  | recommended          | strict  |
 *  | requiresTypeChecking | true    |
 *  ```
 */
namespace NoMisusedSpread {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allow": {
   *         "items": {
   *           "oneOf": [
   *             {
   *               "type": "string"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "file"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 },
   *                 "path": {
   *                   "type": "string"
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name"
   *               ],
   *               "type": "object"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "lib"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name"
   *               ],
   *               "type": "object"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "package"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 },
   *                 "package": {
   *                   "type": "string"
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name",
   *                 "package"
   *               ],
   *               "type": "object"
   *             }
   *           ]
   *         },
   *         "type": "array",
   *         "description": "An array of type specifiers that are known to be safe to spread."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** An array of type specifiers that are known to be safe to spread. */
    allow?: readonly (
      | string
      | Readonly<
          | {
              from: 'file';
              name: string | readonly [string, ...string[]];
              path?: string;
            }
          | {
              from: 'lib';
              name: string | readonly [string, ...string[]];
            }
          | {
              from: 'package';
              name: string | readonly [string, ...string[]];
              package: string;
            }
        >
    )[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow enums from having both number and string members
 *
 * @link https://typescript-eslint.io/rules/no-mixed-enums
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | recommended          | strict  |
 *  | requiresTypeChecking | true    |
 *  ```
 */
namespace NoMixedEnums {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow TypeScript namespaces
 *
 * @link https://typescript-eslint.io/rules/no-namespace
 *
 *  ```md
 *  | key         | value       |
 *  | :---------- | :---------- |
 *  | type        | suggestion  |
 *  | deprecated  | false       |
 *  | recommended | recommended |
 *  ```
 */
namespace NoNamespace {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowDeclarations": {
   *         "type": "boolean",
   *         "description": "Whether to allow `declare` with custom TypeScript namespaces."
   *       },
   *       "allowDefinitionFiles": {
   *         "type": "boolean",
   *         "description": "Whether to allow `declare` with custom TypeScript namespaces inside definition files."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to allow `declare` with custom TypeScript namespaces. */
    allowDeclarations?: boolean;
    /**
     * Whether to allow `declare` with custom TypeScript namespaces inside
     * definition files.
     */
    allowDefinitionFiles?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow non-null assertions in the left operand of a nullish coalescing
 * operator
 *
 * @link https://typescript-eslint.io/rules/no-non-null-asserted-nullish-coalescing
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | hasSuggestions | true    |
 *  | recommended    | strict  |
 *  ```
 */
namespace NoNonNullAssertedNullishCoalescing {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow non-null assertions after an optional chain expression
 *
 * @link https://typescript-eslint.io/rules/no-non-null-asserted-optional-chain
 *
 *  ```md
 *  | key            | value       |
 *  | :------------- | :---------- |
 *  | type           | problem     |
 *  | deprecated     | false       |
 *  | hasSuggestions | true        |
 *  | recommended    | recommended |
 *  ```
 */
namespace NoNonNullAssertedOptionalChain {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow non-null assertions using the `!` postfix operator
 *
 * @link https://typescript-eslint.io/rules/no-non-null-assertion
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | hasSuggestions | true    |
 *  | recommended    | strict  |
 *  ```
 */
namespace NoNonNullAssertion {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow variable redeclaration
 *
 * @link https://typescript-eslint.io/rules/no-redeclare
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
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
   *     "additionalProperties": false,
   *     "properties": {
   *       "builtinGlobals": {
   *         "type": "boolean",
   *         "description": "Whether to report shadowing of built-in global variables."
   *       },
   *       "ignoreDeclarationMerge": {
   *         "type": "boolean",
   *         "description": "Whether to ignore declaration merges between certain TypeScript declaration types."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to report shadowing of built-in global variables. */
    builtinGlobals?: boolean;
    /**
     * Whether to ignore declaration merges between certain TypeScript
     * declaration types.
     */
    ignoreDeclarationMerge?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow members of unions and intersections that do nothing or override type
 * information
 *
 * @link https://typescript-eslint.io/rules/no-redundant-type-constituents
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | suggestion  |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace NoRedundantTypeConstituents {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow invocation of `require()`
 *
 * @link https://typescript-eslint.io/rules/no-require-imports
 *
 *  ```md
 *  | key         | value       |
 *  | :---------- | :---------- |
 *  | type        | problem     |
 *  | deprecated  | false       |
 *  | recommended | recommended |
 *  ```
 */
namespace NoRequireImports {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allow": {
   *         "type": "array",
   *         "description": "Patterns of import paths to allow requiring from.",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "allowAsImport": {
   *         "type": "boolean",
   *         "description": "Allows `require` statements in import declarations."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Patterns of import paths to allow requiring from. */
    allow?: readonly string[];
    /** Allows `require` statements in import declarations. */
    allowAsImport?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow specified modules when loaded by `import`
 *
 * @link https://typescript-eslint.io/rules/no-restricted-imports
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoRestrictedImports {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "anyOf": [
   *       {
   *         "type": "array",
   *         "items": {
   *           "anyOf": [
   *             {
   *               "type": "string"
   *             },
   *             {
   *               "type": "object",
   *               "additionalProperties": false,
   *               "properties": {
   *                 "name": {
   *                   "type": "string"
   *                 },
   *                 "message": {
   *                   "type": "string",
   *                   "minLength": 1
   *                 },
   *                 "importNames": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "allowImportNames": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "allowTypeImports": {
   *                   "type": "boolean",
   *                   "description": "Whether to allow type-only imports for a path."
   *                 }
   *               },
   *               "required": [
   *                 "name"
   *               ]
   *             }
   *           ]
   *         },
   *         "uniqueItems": true
   *       },
   *       {
   *         "type": "array",
   *         "additionalItems": false,
   *         "items": [
   *           {
   *             "type": "object",
   *             "additionalProperties": false,
   *             "properties": {
   *               "paths": {
   *                 "type": "array",
   *                 "items": {
   *                   "anyOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "type": "object",
   *                       "additionalProperties": false,
   *                       "properties": {
   *                         "name": {
   *                           "type": "string"
   *                         },
   *                         "message": {
   *                           "type": "string",
   *                           "minLength": 1
   *                         },
   *                         "importNames": {
   *                           "type": "array",
   *                           "items": {
   *                             "type": "string"
   *                           }
   *                         },
   *                         "allowImportNames": {
   *                           "type": "array",
   *                           "items": {
   *                             "type": "string"
   *                           }
   *                         },
   *                         "allowTypeImports": {
   *                           "type": "boolean",
   *                           "description": "Whether to allow type-only imports for a path."
   *                         }
   *                       },
   *                       "required": [
   *                         "name"
   *                       ]
   *                     }
   *                   ]
   *                 },
   *                 "uniqueItems": true
   *               },
   *               "patterns": {
   *                 "anyOf": [
   *                   {
   *                     "type": "array",
   *                     "items": {
   *                       "type": "string"
   *                     },
   *                     "uniqueItems": true
   *                   },
   *                   {
   *                     "type": "array",
   *                     "items": {
   *                       "type": "object",
   *                       "additionalProperties": false,
   *                       "properties": {
   *                         "importNames": {
   *                           "type": "array",
   *                           "items": {
   *                             "type": "string"
   *                           },
   *                           "minItems": 1,
   *                           "uniqueItems": true
   *                         },
   *                         "allowImportNames": {
   *                           "type": "array",
   *                           "items": {
   *                             "type": "string"
   *                           },
   *                           "minItems": 1,
   *                           "uniqueItems": true
   *                         },
   *                         "group": {
   *                           "type": "array",
   *                           "items": {
   *                             "type": "string"
   *                           },
   *                           "minItems": 1,
   *                           "uniqueItems": true
   *                         },
   *                         "regex": {
   *                           "type": "string"
   *                         },
   *                         "importNamePattern": {
   *                           "type": "string"
   *                         },
   *                         "allowImportNamePattern": {
   *                           "type": "string"
   *                         },
   *                         "message": {
   *                           "type": "string",
   *                           "minLength": 1
   *                         },
   *                         "caseSensitive": {
   *                           "type": "boolean"
   *                         },
   *                         "allowTypeImports": {
   *                           "type": "boolean",
   *                           "description": "Whether to allow type-only imports for a path."
   *                         }
   *                       }
   *                     },
   *                     "uniqueItems": true
   *                   }
   *                 ]
   *               }
   *             }
   *           }
   *         ],
   *         "minItems": 1
   *       }
   *     ]
   *   }
   * ]
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
            | readonly Readonly<{
                /** @minItems 1 */
                importNames?: readonly [string, ...string[]];
                /** @minItems 1 */
                allowImportNames?: readonly [string, ...string[]];
                /** @minItems 1 */
                group?: readonly [string, ...string[]];
                regex?: string;
                importNamePattern?: string;
                allowImportNamePattern?: string;
                message?: string;
                caseSensitive?: boolean;
                /** Whether to allow type-only imports for a path. */
                allowTypeImports?: boolean;
              }>[];
        }>,
      ];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow certain types
 *
 * @link https://typescript-eslint.io/rules/no-restricted-types
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace NoRestrictedTypes {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "$defs": {
   *       "banConfig": {
   *         "oneOf": [
   *           {
   *             "type": "boolean",
   *             "description": "Bans the type with the default message.",
   *             "enum": [
   *               true
   *             ]
   *           },
   *           {
   *             "type": "string",
   *             "description": "Bans the type with a custom message."
   *           },
   *           {
   *             "type": "object",
   *             "additionalProperties": false,
   *             "description": "Bans a type.",
   *             "properties": {
   *               "fixWith": {
   *                 "type": "string",
   *                 "description": "Type to autofix replace with. Note that autofixers can be applied automatically - so you need to be careful with this option."
   *               },
   *               "message": {
   *                 "type": "string",
   *                 "description": "Custom error message."
   *               },
   *               "suggest": {
   *                 "type": "array",
   *                 "description": "Types to suggest replacing with.",
   *                 "items": {
   *                   "type": "string"
   *                 }
   *               }
   *             }
   *           }
   *         ]
   *       }
   *     },
   *     "additionalProperties": false,
   *     "properties": {
   *       "types": {
   *         "type": "object",
   *         "additionalProperties": {
   *           "$ref": "#/$defs/banConfig"
   *         },
   *         "description": "An object whose keys are the types you want to ban, and the values are error messages."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type BanConfig =
    | true
    | string
    | Readonly<{
        /**
         * Type to autofix replace with. Note that autofixers can be applied
         * automatically - so you need to be careful with this option.
         */
        fixWith?: string;
        /** Custom error message. */
        message?: string;
        /** Types to suggest replacing with. */
        suggest?: readonly string[];
      }>;

  export type Options = Readonly<{
    /**
     * An object whose keys are the types you want to ban, and the values are
     * error messages.
     */
    types?: Readonly<Record<string, BanConfig>>;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow variable declarations from shadowing variables declared in the outer
 * scope
 *
 * @link https://typescript-eslint.io/rules/no-shadow
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
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
   *     "additionalProperties": false,
   *     "properties": {
   *       "allow": {
   *         "type": "array",
   *         "description": "Identifier names for which shadowing is allowed.",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "builtinGlobals": {
   *         "type": "boolean",
   *         "description": "Whether to report shadowing of built-in global variables."
   *       },
   *       "hoist": {
   *         "type": "string",
   *         "description": "Whether to report shadowing before outer functions or variables are defined.",
   *         "enum": [
   *           "all",
   *           "functions",
   *           "functions-and-types",
   *           "never",
   *           "types"
   *         ]
   *       },
   *       "ignoreFunctionTypeParameterNameValueShadow": {
   *         "type": "boolean",
   *         "description": "Whether to ignore function parameters named the same as a variable."
   *       },
   *       "ignoreOnInitialization": {
   *         "type": "boolean",
   *         "description": "Whether to ignore the variable initializers when the shadowed variable is presumably still unitialized."
   *       },
   *       "ignoreTypeValueShadow": {
   *         "type": "boolean",
   *         "description": "Whether to ignore types named the same as a variable."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Identifier names for which shadowing is allowed. */
    allow?: readonly string[];
    /** Whether to report shadowing of built-in global variables. */
    builtinGlobals?: boolean;
    /**
     * Whether to report shadowing before outer functions or variables are
     * defined.
     */
    hoist?: 'all' | 'functions' | 'functions-and-types' | 'never' | 'types';
    /** Whether to ignore function parameters named the same as a variable. */
    ignoreFunctionTypeParameterNameValueShadow?: boolean;
    /**
     * Whether to ignore the variable initializers when the shadowed variable is
     * presumably still unitialized.
     */
    ignoreOnInitialization?: boolean;
    /** Whether to ignore types named the same as a variable. */
    ignoreTypeValueShadow?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow aliasing `this`
 *
 * @link https://typescript-eslint.io/rules/no-this-alias
 *
 *  ```md
 *  | key         | value       |
 *  | :---------- | :---------- |
 *  | type        | suggestion  |
 *  | deprecated  | false       |
 *  | recommended | recommended |
 *  ```
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
   *         "type": "boolean",
   *         "description": "Whether to ignore destructurings, such as `const { props, state } = this`."
   *       },
   *       "allowedNames": {
   *         "type": "array",
   *         "description": "Names to ignore, such as [\"self\"] for `const self = this;`.",
   *         "items": {
   *           "type": "string"
   *         }
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to ignore destructurings, such as `const { props, state } =
     * this`.
     */
    allowDestructuring?: boolean;
    /** Names to ignore, such as ["self"] for `const self = this;`. */
    allowedNames?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow type aliases
 *
 * @link https://typescript-eslint.io/rules/no-type-alias
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | true       |
 *  ```
 */
namespace NoTypeAlias {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "$defs": {
   *       "expandedOptions": {
   *         "type": "string",
   *         "enum": [
   *           "always",
   *           "never",
   *           "in-unions",
   *           "in-intersections",
   *           "in-unions-and-intersections"
   *         ]
   *       },
   *       "simpleOptions": {
   *         "type": "string",
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       }
   *     },
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowAliases": {
   *         "$ref": "#/$defs/expandedOptions",
   *         "description": "Whether to allow direct one-to-one type aliases."
   *       },
   *       "allowCallbacks": {
   *         "$ref": "#/$defs/simpleOptions",
   *         "description": "Whether to allow type aliases for callbacks."
   *       },
   *       "allowConditionalTypes": {
   *         "$ref": "#/$defs/simpleOptions",
   *         "description": "Whether to allow type aliases for conditional types."
   *       },
   *       "allowConstructors": {
   *         "$ref": "#/$defs/simpleOptions",
   *         "description": "Whether to allow type aliases with constructors."
   *       },
   *       "allowGenerics": {
   *         "$ref": "#/$defs/simpleOptions",
   *         "description": "Whether to allow type aliases with generic types."
   *       },
   *       "allowLiterals": {
   *         "$ref": "#/$defs/expandedOptions",
   *         "description": "Whether to allow type aliases with object literal types."
   *       },
   *       "allowMappedTypes": {
   *         "$ref": "#/$defs/expandedOptions",
   *         "description": "Whether to allow type aliases with mapped types."
   *       },
   *       "allowTupleTypes": {
   *         "$ref": "#/$defs/expandedOptions",
   *         "description": "Whether to allow type aliases with tuple types."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Disallow unnecessary equality comparisons against boolean literals
 *
 * @link https://typescript-eslint.io/rules/no-unnecessary-boolean-literal-compare
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | fixable              | code       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace NoUnnecessaryBooleanLiteralCompare {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowComparingNullableBooleansToFalse": {
   *         "type": "boolean",
   *         "description": "Whether to allow comparisons between nullable boolean variables and `false`."
   *       },
   *       "allowComparingNullableBooleansToTrue": {
   *         "type": "boolean",
   *         "description": "Whether to allow comparisons between nullable boolean variables and `true`."
   *       },
   *       "allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing": {
   *         "type": "boolean",
   *         "description": "Unless this is set to `true`, the rule will error on every file whose `tsconfig.json` does _not_ have the `strictNullChecks` compiler option (or `strict`) set to `true`."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to allow comparisons between nullable boolean variables and
     * `false`.
     */
    allowComparingNullableBooleansToFalse?: boolean;
    /**
     * Whether to allow comparisons between nullable boolean variables and
     * `true`.
     */
    allowComparingNullableBooleansToTrue?: boolean;
    /**
     * Unless this is set to `true`, the rule will error on every file whose
     * `tsconfig.json` does _not_ have the `strictNullChecks` compiler option
     * (or `strict`) set to `true`.
     */
    allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow conditionals where the type is always truthy or always falsy
 *
 * @link https://typescript-eslint.io/rules/no-unnecessary-condition
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | hasSuggestions       | true       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace NoUnnecessaryCondition {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowConstantLoopConditions": {
   *         "description": "Whether to ignore constant loop conditions, such as `while (true)`.",
   *         "oneOf": [
   *           {
   *             "type": "boolean",
   *             "description": "Always ignore or not ignore the loop conditions"
   *           },
   *           {
   *             "type": "string",
   *             "description": "Which situations to ignore constant conditions in.",
   *             "enum": [
   *               "always",
   *               "never",
   *               "only-allowed-literals"
   *             ]
   *           }
   *         ]
   *       },
   *       "allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing": {
   *         "type": "boolean",
   *         "description": "Whether to not error when running with a tsconfig that has strictNullChecks turned."
   *       },
   *       "checkTypePredicates": {
   *         "type": "boolean",
   *         "description": "Whether to check the asserted argument of a type predicate function for unnecessary conditions"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to ignore constant loop conditions, such as `while (true)`. */
    allowConstantLoopConditions?:
      | boolean
      | ('always' | 'never' | 'only-allowed-literals');
    /**
     * Whether to not error when running with a tsconfig that has
     * strictNullChecks turned.
     */
    allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
    /**
     * Whether to check the asserted argument of a type predicate function for
     * unnecessary conditions
     */
    checkTypePredicates?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow unnecessary assignment of constructor property parameter
 *
 * @link https://typescript-eslint.io/rules/no-unnecessary-parameter-property-assignment
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoUnnecessaryParameterPropertyAssignment {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow unnecessary namespace qualifiers
 *
 * @link https://typescript-eslint.io/rules/no-unnecessary-qualifier
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | fixable              | code       |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace NoUnnecessaryQualifier {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow unnecessary template expressions
 *
 * @link https://typescript-eslint.io/rules/no-unnecessary-template-expression
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | fixable              | code       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace NoUnnecessaryTemplateExpression {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow type arguments that are equal to the default
 *
 * @link https://typescript-eslint.io/rules/no-unnecessary-type-arguments
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | fixable              | code       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace NoUnnecessaryTypeArguments {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow type assertions that do not change the type of an expression
 *
 * @link https://typescript-eslint.io/rules/no-unnecessary-type-assertion
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | suggestion  |
 *  | deprecated           | false       |
 *  | fixable              | code        |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace NoUnnecessaryTypeAssertion {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "checkLiteralConstAssertions": {
   *         "type": "boolean",
   *         "description": "Whether to check literal const assertions."
   *       },
   *       "typesToIgnore": {
   *         "type": "array",
   *         "description": "A list of type names to ignore.",
   *         "items": {
   *           "type": "string"
   *         }
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to check literal const assertions. */
    checkLiteralConstAssertions?: boolean;
    /** A list of type names to ignore. */
    typesToIgnore?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow unnecessary constraints on generic types
 *
 * @link https://typescript-eslint.io/rules/no-unnecessary-type-constraint
 *
 *  ```md
 *  | key            | value       |
 *  | :------------- | :---------- |
 *  | type           | suggestion  |
 *  | deprecated     | false       |
 *  | hasSuggestions | true        |
 *  | recommended    | recommended |
 *  ```
 */
namespace NoUnnecessaryTypeConstraint {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow conversion idioms when they do not change the type or value of the
 * expression
 *
 * @link https://typescript-eslint.io/rules/no-unnecessary-type-conversion
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | hasSuggestions       | true       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace NoUnnecessaryTypeConversion {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow type parameters that aren't used multiple times
 *
 * @link https://typescript-eslint.io/rules/no-unnecessary-type-parameters
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | hasSuggestions       | true    |
 *  | recommended          | strict  |
 *  | requiresTypeChecking | true    |
 *  ```
 */
namespace NoUnnecessaryTypeParameters {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow calling a function with a value with type `any`
 *
 * @link https://typescript-eslint.io/rules/no-unsafe-argument
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | problem     |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace NoUnsafeArgument {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow assigning a value with type `any` to variables and properties
 *
 * @link https://typescript-eslint.io/rules/no-unsafe-assignment
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | problem     |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace NoUnsafeAssignment {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow calling a value with type `any`
 *
 * @link https://typescript-eslint.io/rules/no-unsafe-call
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | problem     |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace NoUnsafeCall {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow unsafe declaration merging
 *
 * @link https://typescript-eslint.io/rules/no-unsafe-declaration-merging
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | problem     |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | false       |
 *  ```
 */
namespace NoUnsafeDeclarationMerging {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow comparing an enum value with a non-enum value
 *
 * @link https://typescript-eslint.io/rules/no-unsafe-enum-comparison
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | suggestion  |
 *  | deprecated           | false       |
 *  | hasSuggestions       | true        |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace NoUnsafeEnumComparison {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow using the unsafe built-in Function type
 *
 * @link https://typescript-eslint.io/rules/no-unsafe-function-type
 *
 *  ```md
 *  | key         | value       |
 *  | :---------- | :---------- |
 *  | type        | problem     |
 *  | deprecated  | false       |
 *  | recommended | recommended |
 *  ```
 */
namespace NoUnsafeFunctionType {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow member access on a value with type `any`
 *
 * @link https://typescript-eslint.io/rules/no-unsafe-member-access
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | problem     |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace NoUnsafeMemberAccess {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowOptionalChaining": {
   *         "type": "boolean",
   *         "description": "Whether to allow `?.` optional chains on `any` values."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to allow `?.` optional chains on `any` values. */
    allowOptionalChaining?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow returning a value with type `any` from a function
 *
 * @link https://typescript-eslint.io/rules/no-unsafe-return
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | problem     |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace NoUnsafeReturn {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow type assertions that narrow a type
 *
 * @link https://typescript-eslint.io/rules/no-unsafe-type-assertion
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | requiresTypeChecking | true    |
 *  ```
 */
namespace NoUnsafeTypeAssertion {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require unary negation to take a number
 *
 * @link https://typescript-eslint.io/rules/no-unsafe-unary-minus
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | problem     |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace NoUnsafeUnaryMinus {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow unused expressions
 *
 * @link https://typescript-eslint.io/rules/no-unused-expressions
 *
 *  ```md
 *  | key         | value       |
 *  | :---------- | :---------- |
 *  | type        | suggestion  |
 *  | deprecated  | false       |
 *  | recommended | recommended |
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
 * Disallow unused private class members
 *
 * @link https://typescript-eslint.io/rules/no-unused-private-class-members
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | requiresTypeChecking | false   |
 *  ```
 */
namespace NoUnusedPrivateClassMembers {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow unused variables
 *
 * @link https://typescript-eslint.io/rules/no-unused-vars
 *
 *  ```md
 *  | key            | value       |
 *  | :------------- | :---------- |
 *  | type           | problem     |
 *  | deprecated     | false       |
 *  | fixable        | code        |
 *  | hasSuggestions | true        |
 *  | recommended    | recommended |
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
   *         "type": "string",
   *         "description": "Broad setting for unused variables to target.",
   *         "enum": [
   *           "all",
   *           "local"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "additionalProperties": false,
   *         "properties": {
   *           "args": {
   *             "type": "string",
   *             "description": "Whether to check all, some, or no arguments.",
   *             "enum": [
   *               "all",
   *               "after-used",
   *               "none"
   *             ]
   *           },
   *           "argsIgnorePattern": {
   *             "type": "string",
   *             "description": "Regular expressions of argument names to not check for usage."
   *           },
   *           "caughtErrors": {
   *             "type": "string",
   *             "description": "Whether to check catch block arguments.",
   *             "enum": [
   *               "all",
   *               "none"
   *             ]
   *           },
   *           "caughtErrorsIgnorePattern": {
   *             "type": "string",
   *             "description": "Regular expressions of catch block argument names to not check for usage."
   *           },
   *           "destructuredArrayIgnorePattern": {
   *             "type": "string",
   *             "description": "Regular expressions of destructured array variable names to not check for usage."
   *           },
   *           "enableAutofixRemoval": {
   *             "type": "object",
   *             "additionalProperties": false,
   *             "description": "Configurable automatic fixes for different types of unused variables.",
   *             "properties": {
   *               "imports": {
   *                 "type": "boolean",
   *                 "description": "Whether to enable automatic removal of unused imports."
   *               }
   *             }
   *           },
   *           "ignoreClassWithStaticInitBlock": {
   *             "type": "boolean",
   *             "description": "Whether to ignore classes with at least one static initialization block."
   *           },
   *           "ignoreRestSiblings": {
   *             "type": "boolean",
   *             "description": "Whether to ignore sibling properties in `...` destructurings."
   *           },
   *           "ignoreUsingDeclarations": {
   *             "type": "boolean",
   *             "description": "Whether to ignore using or await using declarations."
   *           },
   *           "reportUsedIgnorePattern": {
   *             "type": "boolean",
   *             "description": "Whether to report variables that match any of the valid ignore pattern options if they have been used."
   *           },
   *           "vars": {
   *             "type": "string",
   *             "description": "Whether to check all variables or only locally-declared variables.",
   *             "enum": [
   *               "all",
   *               "local"
   *             ]
   *           },
   *           "varsIgnorePattern": {
   *             "type": "string",
   *             "description": "Regular expressions of variable names to not check for usage."
   *           }
   *         }
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options =
    | ('all' | 'local')
    | Readonly<{
        /** Whether to check all, some, or no arguments. */
        args?: 'all' | 'after-used' | 'none';
        /** Regular expressions of argument names to not check for usage. */
        argsIgnorePattern?: string;
        /** Whether to check catch block arguments. */
        caughtErrors?: 'all' | 'none';
        /**
         * Regular expressions of catch block argument names to not check for
         * usage.
         */
        caughtErrorsIgnorePattern?: string;
        /**
         * Regular expressions of destructured array variable names to not check
         * for usage.
         */
        destructuredArrayIgnorePattern?: string;
        /** Configurable automatic fixes for different types of unused variables. */
        enableAutofixRemoval?: Readonly<{
          /** Whether to enable automatic removal of unused imports. */
          imports?: boolean;
        }>;
        /**
         * Whether to ignore classes with at least one static initialization
         * block.
         */
        ignoreClassWithStaticInitBlock?: boolean;
        /** Whether to ignore sibling properties in `...` destructurings. */
        ignoreRestSiblings?: boolean;
        /** Whether to ignore using or await using declarations. */
        ignoreUsingDeclarations?: boolean;
        /**
         * Whether to report variables that match any of the valid ignore
         * pattern options if they have been used.
         */
        reportUsedIgnorePattern?: boolean;
        /** Whether to check all variables or only locally-declared variables. */
        vars?: 'all' | 'local';
        /** Regular expressions of variable names to not check for usage. */
        varsIgnorePattern?: string;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow the use of variables before they are defined
 *
 * @link https://typescript-eslint.io/rules/no-use-before-define
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
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
   *         "type": "string",
   *         "description": "Broadly set functions and allowNamedExports to false.",
   *         "enum": [
   *           "nofunc"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "additionalProperties": false,
   *         "properties": {
   *           "allowNamedExports": {
   *             "type": "boolean",
   *             "description": "Whether to ignore named exports."
   *           },
   *           "classes": {
   *             "type": "boolean",
   *             "description": "Whether to ignore references to class declarations."
   *           },
   *           "enums": {
   *             "type": "boolean",
   *             "description": "Whether to check references to enums."
   *           },
   *           "functions": {
   *             "type": "boolean",
   *             "description": "Whether to ignore references to function declarations."
   *           },
   *           "ignoreTypeReferences": {
   *             "type": "boolean",
   *             "description": "Whether to ignore type references, such as in type annotations and assertions."
   *           },
   *           "typedefs": {
   *             "type": "boolean",
   *             "description": "Whether to check references to types."
   *           },
   *           "variables": {
   *             "type": "boolean",
   *             "description": "Whether to ignore references to variables."
   *           }
   *         }
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options =
    | 'nofunc'
    | Readonly<{
        /** Whether to ignore named exports. */
        allowNamedExports?: boolean;
        /** Whether to ignore references to class declarations. */
        classes?: boolean;
        /** Whether to check references to enums. */
        enums?: boolean;
        /** Whether to ignore references to function declarations. */
        functions?: boolean;
        /**
         * Whether to ignore type references, such as in type annotations and
         * assertions.
         */
        ignoreTypeReferences?: boolean;
        /** Whether to check references to types. */
        typedefs?: boolean;
        /** Whether to ignore references to variables. */
        variables?: boolean;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow unnecessary constructors
 *
 * @link https://typescript-eslint.io/rules/no-useless-constructor
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | hasSuggestions | true    |
 *  | recommended    | strict  |
 *  ```
 */
namespace NoUselessConstructor {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow default values that will never be used
 *
 * @link https://typescript-eslint.io/rules/no-useless-default-assignment
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | fixable              | code       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace NoUselessDefaultAssignment {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow empty exports that don't change anything in a module file
 *
 * @link https://typescript-eslint.io/rules/no-useless-empty-export
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | false      |
 *  ```
 */
namespace NoUselessEmptyExport {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow `require` statements except in import statements
 *
 * @link https://typescript-eslint.io/rules/no-var-requires
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | true    |
 *  ```
 */
namespace NoVarRequires {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allow": {
   *         "type": "array",
   *         "description": "Patterns of import paths to allow requiring from.",
   *         "items": {
   *           "type": "string"
   *         }
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Disallow using confusing built-in primitive class wrappers
 *
 * @link https://typescript-eslint.io/rules/no-wrapper-object-types
 *
 *  ```md
 *  | key         | value       |
 *  | :---------- | :---------- |
 *  | type        | problem     |
 *  | deprecated  | false       |
 *  | fixable     | code        |
 *  | recommended | recommended |
 *  ```
 */
namespace NoWrapperObjectTypes {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce non-null assertions over explicit type assertions
 *
 * @link https://typescript-eslint.io/rules/non-nullable-type-assertion-style
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | fixable              | code       |
 *  | recommended          | stylistic  |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace NonNullableTypeAssertionStyle {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow throwing non-`Error` values as exceptions
 *
 * @link https://typescript-eslint.io/rules/only-throw-error
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | problem     |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace OnlyThrowError {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allow": {
   *         "items": {
   *           "oneOf": [
   *             {
   *               "type": "string"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "file"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 },
   *                 "path": {
   *                   "type": "string"
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name"
   *               ],
   *               "type": "object"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "lib"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name"
   *               ],
   *               "type": "object"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "package"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 },
   *                 "package": {
   *                   "type": "string"
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name",
   *                 "package"
   *               ],
   *               "type": "object"
   *             }
   *           ]
   *         },
   *         "type": "array",
   *         "description": "Type specifiers that can be thrown."
   *       },
   *       "allowRethrowing": {
   *         "type": "boolean",
   *         "description": "Whether to allow rethrowing caught values that are not `Error` objects."
   *       },
   *       "allowThrowingAny": {
   *         "type": "boolean",
   *         "description": "Whether to always allow throwing values typed as `any`."
   *       },
   *       "allowThrowingUnknown": {
   *         "type": "boolean",
   *         "description": "Whether to always allow throwing values typed as `unknown`."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Type specifiers that can be thrown. */
    allow?: readonly (
      | string
      | Readonly<
          | {
              from: 'file';
              name: string | readonly [string, ...string[]];
              path?: string;
            }
          | {
              from: 'lib';
              name: string | readonly [string, ...string[]];
            }
          | {
              from: 'package';
              name: string | readonly [string, ...string[]];
              package: string;
            }
        >
    )[];
    /** Whether to allow rethrowing caught values that are not `Error` objects. */
    allowRethrowing?: boolean;
    /** Whether to always allow throwing values typed as `any`. */
    allowThrowingAny?: boolean;
    /** Whether to always allow throwing values typed as `unknown`. */
    allowThrowingUnknown?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require or disallow parameter properties in class constructors
 *
 * @link https://typescript-eslint.io/rules/parameter-properties
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace ParameterProperties {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "$defs": {
   *       "modifier": {
   *         "type": "string",
   *         "enum": [
   *           "readonly",
   *           "private",
   *           "protected",
   *           "public",
   *           "private readonly",
   *           "protected readonly",
   *           "public readonly"
   *         ]
   *       }
   *     },
   *     "additionalProperties": false,
   *     "properties": {
   *       "allow": {
   *         "type": "array",
   *         "description": "Whether to allow certain kinds of properties to be ignored.",
   *         "items": {
   *           "$ref": "#/$defs/modifier"
   *         }
   *       },
   *       "prefer": {
   *         "type": "string",
   *         "description": "Whether to prefer class properties or parameter properties.",
   *         "enum": [
   *           "class-property",
   *           "parameter-property"
   *         ]
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Modifier =
    | 'readonly'
    | 'private'
    | 'protected'
    | 'public'
    | 'private readonly'
    | 'protected readonly'
    | 'public readonly';

  export type Options = Readonly<{
    /** Whether to allow certain kinds of properties to be ignored. */
    allow?: readonly Modifier[];
    /** Whether to prefer class properties or parameter properties. */
    prefer?: 'class-property' | 'parameter-property';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce the use of `as const` over literal type
 *
 * @link https://typescript-eslint.io/rules/prefer-as-const
 *
 *  ```md
 *  | key            | value       |
 *  | :------------- | :---------- |
 *  | type           | suggestion  |
 *  | deprecated     | false       |
 *  | fixable        | code        |
 *  | hasSuggestions | true        |
 *  | recommended    | recommended |
 *  ```
 */
namespace PreferAsConst {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require destructuring from arrays and/or objects
 *
 * @link https://typescript-eslint.io/rules/prefer-destructuring
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | fixable              | code       |
 *  | requiresTypeChecking | true       |
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
   *         "additionalProperties": false,
   *         "properties": {
   *           "AssignmentExpression": {
   *             "type": "object",
   *             "additionalProperties": false,
   *             "properties": {
   *               "array": {
   *                 "type": "boolean"
   *               },
   *               "object": {
   *                 "type": "boolean"
   *               }
   *             }
   *           },
   *           "VariableDeclarator": {
   *             "type": "object",
   *             "additionalProperties": false,
   *             "properties": {
   *               "array": {
   *                 "type": "boolean"
   *               },
   *               "object": {
   *                 "type": "boolean"
   *               }
   *             }
   *           }
   *         }
   *       },
   *       {
   *         "type": "object",
   *         "additionalProperties": false,
   *         "properties": {
   *           "array": {
   *             "type": "boolean"
   *           },
   *           "object": {
   *             "type": "boolean"
   *           }
   *         }
   *       }
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "enforceForDeclarationWithTypeAnnotation": {
   *         "type": "boolean",
   *         "description": "Whether to enforce destructuring on variable declarations with type annotations."
   *       },
   *       "enforceForRenamedProperties": {
   *         "type": "boolean",
   *         "description": "Whether to enforce destructuring that use a different variable name than the property name."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options0 = Readonly<
    | {
        AssignmentExpression?: Readonly<{
          array?: boolean;
          object?: boolean;
        }>;
        VariableDeclarator?: Readonly<{
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
    /**
     * Whether to enforce destructuring on variable declarations with type
     * annotations.
     */
    enforceForDeclarationWithTypeAnnotation?: boolean;
    /**
     * Whether to enforce destructuring that use a different variable name than
     * the property name.
     */
    enforceForRenamedProperties?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
}

/**
 * Require each enum member value to be explicitly initialized
 *
 * @link https://typescript-eslint.io/rules/prefer-enum-initializers
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace PreferEnumInitializers {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of Array.prototype.find() over Array.prototype.filter()
 * followed by [0] when looking for a single result
 *
 * @link https://typescript-eslint.io/rules/prefer-find
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | hasSuggestions       | true       |
 *  | recommended          | stylistic  |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace PreferFind {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce the use of `for-of` loop over the standard `for` loop where possible
 *
 * @link https://typescript-eslint.io/rules/prefer-for-of
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | stylistic  |
 *  ```
 */
namespace PreferForOf {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using function types instead of interfaces with call signatures
 *
 * @link https://typescript-eslint.io/rules/prefer-function-type
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | stylistic  |
 *  ```
 */
namespace PreferFunctionType {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce `includes` method over `indexOf` method
 *
 * @link https://typescript-eslint.io/rules/prefer-includes
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | fixable              | code       |
 *  | recommended          | stylistic  |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace PreferIncludes {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require all enum members to be literal values
 *
 * @link https://typescript-eslint.io/rules/prefer-literal-enum-member
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | false      |
 *  ```
 */
namespace PreferLiteralEnumMember {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowBitwiseExpressions": {
   *         "type": "boolean",
   *         "description": "Whether to allow using bitwise expressions in enum initializers."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to allow using bitwise expressions in enum initializers. */
    allowBitwiseExpressions?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require using `namespace` keyword over `module` keyword to declare custom
 * TypeScript modules
 *
 * @link https://typescript-eslint.io/rules/prefer-namespace-keyword
 *
 *  ```md
 *  | key         | value       |
 *  | :---------- | :---------- |
 *  | type        | suggestion  |
 *  | deprecated  | false       |
 *  | fixable     | code        |
 *  | recommended | recommended |
 *  ```
 */
namespace PreferNamespaceKeyword {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using the nullish coalescing operator instead of logical assignments
 * or chaining
 *
 * @link https://typescript-eslint.io/rules/prefer-nullish-coalescing
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | hasSuggestions       | true       |
 *  | recommended          | stylistic  |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace PreferNullishCoalescing {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing": {
   *         "type": "boolean",
   *         "description": "Unless this is set to `true`, the rule will error on every file whose `tsconfig.json` does _not_ have the `strictNullChecks` compiler option (or `strict`) set to `true`."
   *       },
   *       "ignoreBooleanCoercion": {
   *         "type": "boolean",
   *         "description": "Whether to ignore arguments to the `Boolean` constructor"
   *       },
   *       "ignoreConditionalTests": {
   *         "type": "boolean",
   *         "description": "Whether to ignore cases that are located within a conditional test."
   *       },
   *       "ignoreIfStatements": {
   *         "type": "boolean",
   *         "description": "Whether to ignore any if statements that could be simplified by using the nullish coalescing operator."
   *       },
   *       "ignoreMixedLogicalExpressions": {
   *         "type": "boolean",
   *         "description": "Whether to ignore any logical or expressions that are part of a mixed logical expression (with `&&`)."
   *       },
   *       "ignorePrimitives": {
   *         "description": "Whether to ignore all (`true`) or some (an object with properties) primitive types.",
   *         "oneOf": [
   *           {
   *             "type": "object",
   *             "additionalProperties": false,
   *             "description": "Which primitives types may be ignored.",
   *             "properties": {
   *               "bigint": {
   *                 "type": "boolean",
   *                 "description": "Ignore bigint primitive types."
   *               },
   *               "boolean": {
   *                 "type": "boolean",
   *                 "description": "Ignore boolean primitive types."
   *               },
   *               "number": {
   *                 "type": "boolean",
   *                 "description": "Ignore number primitive types."
   *               },
   *               "string": {
   *                 "type": "boolean",
   *                 "description": "Ignore string primitive types."
   *               }
   *             }
   *           },
   *           {
   *             "type": "boolean",
   *             "description": "Ignore all primitive types.",
   *             "enum": [
   *               true
   *             ]
   *           }
   *         ]
   *       },
   *       "ignoreTernaryTests": {
   *         "type": "boolean",
   *         "description": "Whether to ignore any ternary expressions that could be simplified by using the nullish coalescing operator."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Unless this is set to `true`, the rule will error on every file whose
     * `tsconfig.json` does _not_ have the `strictNullChecks` compiler option
     * (or `strict`) set to `true`.
     */
    allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
    /** Whether to ignore arguments to the `Boolean` constructor */
    ignoreBooleanCoercion?: boolean;
    /** Whether to ignore cases that are located within a conditional test. */
    ignoreConditionalTests?: boolean;
    /**
     * Whether to ignore any if statements that could be simplified by using the
     * nullish coalescing operator.
     */
    ignoreIfStatements?: boolean;
    /**
     * Whether to ignore any logical or expressions that are part of a mixed
     * logical expression (with `&&`).
     */
    ignoreMixedLogicalExpressions?: boolean;
    /**
     * Whether to ignore all (`true`) or some (an object with properties)
     * primitive types.
     */
    ignorePrimitives?:
      | Readonly<{
          /** Ignore bigint primitive types. */
          bigint?: boolean;
          /** Ignore boolean primitive types. */
          boolean?: boolean;
          /** Ignore number primitive types. */
          number?: boolean;
          /** Ignore string primitive types. */
          string?: boolean;
        }>
      | true;
    /**
     * Whether to ignore any ternary expressions that could be simplified by
     * using the nullish coalescing operator.
     */
    ignoreTernaryTests?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce using concise optional chain expressions instead of chained logical
 * ands, negated logical ors, or empty objects
 *
 * @link https://typescript-eslint.io/rules/prefer-optional-chain
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | fixable              | code       |
 *  | hasSuggestions       | true       |
 *  | recommended          | stylistic  |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace PreferOptionalChain {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing": {
   *         "type": "boolean",
   *         "description": "Allow autofixers that will change the return type of the expression. This option is considered unsafe as it may break the build."
   *       },
   *       "checkAny": {
   *         "type": "boolean",
   *         "description": "Check operands that are typed as `any` when inspecting \"loose boolean\" operands."
   *       },
   *       "checkBigInt": {
   *         "type": "boolean",
   *         "description": "Check operands that are typed as `bigint` when inspecting \"loose boolean\" operands."
   *       },
   *       "checkBoolean": {
   *         "type": "boolean",
   *         "description": "Check operands that are typed as `boolean` when inspecting \"loose boolean\" operands."
   *       },
   *       "checkNumber": {
   *         "type": "boolean",
   *         "description": "Check operands that are typed as `number` when inspecting \"loose boolean\" operands."
   *       },
   *       "checkString": {
   *         "type": "boolean",
   *         "description": "Check operands that are typed as `string` when inspecting \"loose boolean\" operands."
   *       },
   *       "checkUnknown": {
   *         "type": "boolean",
   *         "description": "Check operands that are typed as `unknown` when inspecting \"loose boolean\" operands."
   *       },
   *       "requireNullish": {
   *         "type": "boolean",
   *         "description": "Skip operands that are not typed with `null` and/or `undefined` when inspecting \"loose boolean\" operands."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Allow autofixers that will change the return type of the expression. This
     * option is considered unsafe as it may break the build.
     */
    allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing?: boolean;
    /**
     * Check operands that are typed as `any` when inspecting "loose boolean"
     * operands.
     */
    checkAny?: boolean;
    /**
     * Check operands that are typed as `bigint` when inspecting "loose boolean"
     * operands.
     */
    checkBigInt?: boolean;
    /**
     * Check operands that are typed as `boolean` when inspecting "loose
     * boolean" operands.
     */
    checkBoolean?: boolean;
    /**
     * Check operands that are typed as `number` when inspecting "loose boolean"
     * operands.
     */
    checkNumber?: boolean;
    /**
     * Check operands that are typed as `string` when inspecting "loose boolean"
     * operands.
     */
    checkString?: boolean;
    /**
     * Check operands that are typed as `unknown` when inspecting "loose
     * boolean" operands.
     */
    checkUnknown?: boolean;
    /**
     * Skip operands that are not typed with `null` and/or `undefined` when
     * inspecting "loose boolean" operands.
     */
    requireNullish?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require using Error objects as Promise rejection reasons
 *
 * @link https://typescript-eslint.io/rules/prefer-promise-reject-errors
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | suggestion  |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
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
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowEmptyReject": {
   *         "type": "boolean",
   *         "description": "Whether to allow calls to `Promise.reject()` with no arguments."
   *       },
   *       "allowThrowingAny": {
   *         "type": "boolean",
   *         "description": "Whether to always allow throwing values typed as `any`."
   *       },
   *       "allowThrowingUnknown": {
   *         "type": "boolean",
   *         "description": "Whether to always allow throwing values typed as `unknown`."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to allow calls to `Promise.reject()` with no arguments. */
    allowEmptyReject?: boolean;
    /** Whether to always allow throwing values typed as `any`. */
    allowThrowingAny?: boolean;
    /** Whether to always allow throwing values typed as `unknown`. */
    allowThrowingUnknown?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require private members to be marked as `readonly` if they're never modified
 * outside of the constructor
 *
 * @link https://typescript-eslint.io/rules/prefer-readonly
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | fixable              | code       |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace PreferReadonly {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "onlyInlineLambdas": {
   *         "type": "boolean",
   *         "description": "Whether to restrict checking only to members immediately assigned a lambda value."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to restrict checking only to members immediately assigned a
     * lambda value.
     */
    onlyInlineLambdas?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require function parameters to be typed as `readonly` to prevent accidental
 * mutation of inputs
 *
 * @link https://typescript-eslint.io/rules/prefer-readonly-parameter-types
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | requiresTypeChecking | true       |
 *  ```
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
   *       "allow": {
   *         "items": {
   *           "oneOf": [
   *             {
   *               "type": "string"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "file"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 },
   *                 "path": {
   *                   "type": "string"
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name"
   *               ],
   *               "type": "object"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "lib"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name"
   *               ],
   *               "type": "object"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "package"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 },
   *                 "package": {
   *                   "type": "string"
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name",
   *                 "package"
   *               ],
   *               "type": "object"
   *             }
   *           ]
   *         },
   *         "type": "array",
   *         "description": "An array of type specifiers to ignore."
   *       },
   *       "checkParameterProperties": {
   *         "type": "boolean",
   *         "description": "Whether to check class parameter properties."
   *       },
   *       "ignoreInferredTypes": {
   *         "type": "boolean",
   *         "description": "Whether to ignore parameters which don't explicitly specify a type."
   *       },
   *       "treatMethodsAsReadonly": {
   *         "type": "boolean",
   *         "description": "Whether to treat all mutable methods as though they are readonly."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** An array of type specifiers to ignore. */
    allow?: readonly (
      | string
      | Readonly<
          | {
              from: 'file';
              name: string | readonly [string, ...string[]];
              path?: string;
            }
          | {
              from: 'lib';
              name: string | readonly [string, ...string[]];
            }
          | {
              from: 'package';
              name: string | readonly [string, ...string[]];
              package: string;
            }
        >
    )[];
    /** Whether to check class parameter properties. */
    checkParameterProperties?: boolean;
    /** Whether to ignore parameters which don't explicitly specify a type. */
    ignoreInferredTypes?: boolean;
    /** Whether to treat all mutable methods as though they are readonly. */
    treatMethodsAsReadonly?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce using type parameter when calling `Array#reduce` instead of using a
 * type assertion
 *
 * @link https://typescript-eslint.io/rules/prefer-reduce-type-parameter
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | fixable              | code    |
 *  | recommended          | strict  |
 *  | requiresTypeChecking | true    |
 *  ```
 */
namespace PreferReduceTypeParameter {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce `RegExp#exec` over `String#match` if no global flag is provided
 *
 * @link https://typescript-eslint.io/rules/prefer-regexp-exec
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | fixable              | code       |
 *  | recommended          | stylistic  |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace PreferRegexpExec {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce that `this` is used when only `this` type is returned
 *
 * @link https://typescript-eslint.io/rules/prefer-return-this-type
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | fixable              | code       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace PreferReturnThisType {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforce using `String#startsWith` and `String#endsWith` over other equivalent
 * methods of checking substrings
 *
 * @link https://typescript-eslint.io/rules/prefer-string-starts-ends-with
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | fixable              | code       |
 *  | recommended          | stylistic  |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace PreferStringStartsEndsWith {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowSingleElementEquality": {
   *         "type": "string",
   *         "description": "Whether to allow equality checks against the first or last element of a string.",
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to allow equality checks against the first or last element of a
     * string.
     */
    allowSingleElementEquality?: 'always' | 'never';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce using `@ts-expect-error` over `@ts-ignore`
 *
 * @link https://typescript-eslint.io/rules/prefer-ts-expect-error
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | true    |
 *  | fixable    | code    |
 *  ```
 */
namespace PreferTsExpectError {
  export type RuleEntry = 0;
}

/**
 * Require any function or method that returns a Promise to be marked async
 *
 * @link https://typescript-eslint.io/rules/promise-function-async
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | fixable              | code       |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace PromiseFunctionAsync {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowAny": {
   *         "type": "boolean",
   *         "description": "Whether to consider `any` and `unknown` to be Promises."
   *       },
   *       "allowedPromiseNames": {
   *         "type": "array",
   *         "description": "Any extra names of classes or interfaces to be considered Promises.",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "checkArrowFunctions": {
   *         "type": "boolean",
   *         "description": "Whether to check arrow functions."
   *       },
   *       "checkFunctionDeclarations": {
   *         "type": "boolean",
   *         "description": "Whether to check standalone function declarations."
   *       },
   *       "checkFunctionExpressions": {
   *         "type": "boolean",
   *         "description": "Whether to check inline function expressions"
   *       },
   *       "checkMethodDeclarations": {
   *         "type": "boolean",
   *         "description": "Whether to check methods on classes and object literals."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to consider `any` and `unknown` to be Promises. */
    allowAny?: boolean;
    /** Any extra names of classes or interfaces to be considered Promises. */
    allowedPromiseNames?: readonly string[];
    /** Whether to check arrow functions. */
    checkArrowFunctions?: boolean;
    /** Whether to check standalone function declarations. */
    checkFunctionDeclarations?: boolean;
    /** Whether to check inline function expressions */
    checkFunctionExpressions?: boolean;
    /** Whether to check methods on classes and object literals. */
    checkMethodDeclarations?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce that `get()` types should be assignable to their equivalent `set()`
 * type
 *
 * @link https://typescript-eslint.io/rules/related-getter-setter-pairs
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | recommended          | strict  |
 *  | requiresTypeChecking | true    |
 *  ```
 */
namespace RelatedGetterSetterPairs {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require `Array#sort` and `Array#toSorted` calls to always provide a
 * `compareFunction`
 *
 * @link https://typescript-eslint.io/rules/require-array-sort-compare
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | requiresTypeChecking | true    |
 *  ```
 */
namespace RequireArraySortCompare {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "ignoreStringArrays": {
   *         "type": "boolean",
   *         "description": "Whether to ignore arrays in which all elements are strings."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to ignore arrays in which all elements are strings. */
    ignoreStringArrays?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow async functions which do not return promises and have no `await`
 * expression
 *
 * @link https://typescript-eslint.io/rules/require-await
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | suggestion  |
 *  | deprecated           | false       |
 *  | hasSuggestions       | true        |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace RequireAwait {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require both operands of addition to be the same type and be `bigint`,
 * `number`, or `string`
 *
 * @link https://typescript-eslint.io/rules/restrict-plus-operands
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | requiresTypeChecking | true    |
 *  ```
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
   *       "allowAny": {
   *         "type": "boolean",
   *         "description": "Whether to allow `any` typed values."
   *       },
   *       "allowBoolean": {
   *         "type": "boolean",
   *         "description": "Whether to allow `boolean` typed values."
   *       },
   *       "allowNullish": {
   *         "type": "boolean",
   *         "description": "Whether to allow potentially `null` or `undefined` typed values."
   *       },
   *       "allowNumberAndString": {
   *         "type": "boolean",
   *         "description": "Whether to allow `bigint`/`number` typed values and `string` typed values to be added together."
   *       },
   *       "allowRegExp": {
   *         "type": "boolean",
   *         "description": "Whether to allow `regexp` typed values."
   *       },
   *       "skipCompoundAssignments": {
   *         "type": "boolean",
   *         "description": "Whether to skip compound assignments such as `+=`."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to allow `any` typed values. */
    allowAny?: boolean;
    /** Whether to allow `boolean` typed values. */
    allowBoolean?: boolean;
    /** Whether to allow potentially `null` or `undefined` typed values. */
    allowNullish?: boolean;
    /**
     * Whether to allow `bigint`/`number` typed values and `string` typed values
     * to be added together.
     */
    allowNumberAndString?: boolean;
    /** Whether to allow `regexp` typed values. */
    allowRegExp?: boolean;
    /** Whether to skip compound assignments such as `+=`. */
    skipCompoundAssignments?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce template literal expressions to be of `string` type
 *
 * @link https://typescript-eslint.io/rules/restrict-template-expressions
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | requiresTypeChecking | true    |
 *  ```
 */
namespace RestrictTemplateExpressions {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowAny": {
   *         "type": "boolean",
   *         "description": "Whether to allow `any` typed values in template expressions."
   *       },
   *       "allowArray": {
   *         "type": "boolean",
   *         "description": "Whether to allow `array` typed values in template expressions."
   *       },
   *       "allowBoolean": {
   *         "type": "boolean",
   *         "description": "Whether to allow `boolean` typed values in template expressions."
   *       },
   *       "allowNullish": {
   *         "type": "boolean",
   *         "description": "Whether to allow `nullish` typed values in template expressions."
   *       },
   *       "allowNumber": {
   *         "type": "boolean",
   *         "description": "Whether to allow `number` typed values in template expressions."
   *       },
   *       "allowRegExp": {
   *         "type": "boolean",
   *         "description": "Whether to allow `regexp` typed values in template expressions."
   *       },
   *       "allowNever": {
   *         "type": "boolean",
   *         "description": "Whether to allow `never` typed values in template expressions."
   *       },
   *       "allow": {
   *         "description": "Types to allow in template expressions.",
   *         "items": {
   *           "oneOf": [
   *             {
   *               "type": "string"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "file"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 },
   *                 "path": {
   *                   "type": "string"
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name"
   *               ],
   *               "type": "object"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "lib"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name"
   *               ],
   *               "type": "object"
   *             },
   *             {
   *               "additionalProperties": false,
   *               "properties": {
   *                 "from": {
   *                   "enum": [
   *                     "package"
   *                   ],
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "oneOf": [
   *                     {
   *                       "type": "string"
   *                     },
   *                     {
   *                       "items": {
   *                         "type": "string"
   *                       },
   *                       "minItems": 1,
   *                       "type": "array",
   *                       "uniqueItems": true
   *                     }
   *                   ]
   *                 },
   *                 "package": {
   *                   "type": "string"
   *                 }
   *               },
   *               "required": [
   *                 "from",
   *                 "name",
   *                 "package"
   *               ],
   *               "type": "object"
   *             }
   *           ]
   *         },
   *         "type": "array"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to allow `any` typed values in template expressions. */
    allowAny?: boolean;
    /** Whether to allow `array` typed values in template expressions. */
    allowArray?: boolean;
    /** Whether to allow `boolean` typed values in template expressions. */
    allowBoolean?: boolean;
    /** Whether to allow `nullish` typed values in template expressions. */
    allowNullish?: boolean;
    /** Whether to allow `number` typed values in template expressions. */
    allowNumber?: boolean;
    /** Whether to allow `regexp` typed values in template expressions. */
    allowRegExp?: boolean;
    /** Whether to allow `never` typed values in template expressions. */
    allowNever?: boolean;
    /** Types to allow in template expressions. */
    allow?: readonly (
      | string
      | Readonly<
          | {
              from: 'file';
              name: string | readonly [string, ...string[]];
              path?: string;
            }
          | {
              from: 'lib';
              name: string | readonly [string, ...string[]];
            }
          | {
              from: 'package';
              name: string | readonly [string, ...string[]];
              package: string;
            }
        >
    )[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce consistent awaiting of returned promises
 *
 * @link https://typescript-eslint.io/rules/return-await
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | fixable              | code    |
 *  | hasSuggestions       | true    |
 *  | requiresTypeChecking | true    |
 *  ```
 */
namespace ReturnAwait {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "type": "string",
   *         "description": "Requires that all returned promises be awaited.",
   *         "enum": [
   *           "always"
   *         ]
   *       },
   *       {
   *         "type": "string",
   *         "description": "In error-handling contexts, the rule enforces that returned promises must be awaited. In ordinary contexts, the rule does not enforce any particular behavior around whether returned promises are awaited.",
   *         "enum": [
   *           "error-handling-correctness-only"
   *         ]
   *       },
   *       {
   *         "type": "string",
   *         "description": "In error-handling contexts, the rule enforces that returned promises must be awaited. In ordinary contexts, the rule enforces that returned promises _must not_ be awaited.",
   *         "enum": [
   *           "in-try-catch"
   *         ]
   *       },
   *       {
   *         "type": "string",
   *         "description": "Disallows awaiting any returned promises.",
   *         "enum": [
   *           "never"
   *         ]
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options =
    | 'always'
    | 'error-handling-correctness-only'
    | 'in-try-catch'
    | 'never';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce constituents of a type union/intersection to be sorted alphabetically
 *
 * @link https://typescript-eslint.io/rules/sort-type-constituents
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | true       |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  ```
 */
namespace SortTypeConstituents {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "caseSensitive": {
   *         "type": "boolean",
   *         "description": "Whether to sort using case sensitive string comparisons."
   *       },
   *       "checkIntersections": {
   *         "type": "boolean",
   *         "description": "Whether to check intersection types (`&`)."
   *       },
   *       "checkUnions": {
   *         "type": "boolean",
   *         "description": "Whether to check union types (`|`)."
   *       },
   *       "groupOrder": {
   *         "type": "array",
   *         "description": "Ordering of the groups.",
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
  export type RuleEntry = 0;
}

/**
 * Disallow certain types in boolean expressions
 *
 * @link https://typescript-eslint.io/rules/strict-boolean-expressions
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | hasSuggestions       | true       |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace StrictBooleanExpressions {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowAny": {
   *         "type": "boolean",
   *         "description": "Whether to allow `any`s in a boolean context."
   *       },
   *       "allowNullableBoolean": {
   *         "type": "boolean",
   *         "description": "Whether to allow nullable `boolean`s in a boolean context."
   *       },
   *       "allowNullableEnum": {
   *         "type": "boolean",
   *         "description": "Whether to allow nullable `enum`s in a boolean context."
   *       },
   *       "allowNullableNumber": {
   *         "type": "boolean",
   *         "description": "Whether to allow nullable `number`s in a boolean context."
   *       },
   *       "allowNullableObject": {
   *         "type": "boolean",
   *         "description": "Whether to allow nullable `object`s, `symbol`s, and functions in a boolean context."
   *       },
   *       "allowNullableString": {
   *         "type": "boolean",
   *         "description": "Whether to allow nullable `string`s in a boolean context."
   *       },
   *       "allowNumber": {
   *         "type": "boolean",
   *         "description": "Whether to allow `number`s in a boolean context."
   *       },
   *       "allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing": {
   *         "type": "boolean",
   *         "description": "Unless this is set to `true`, the rule will error on every file whose `tsconfig.json` does _not_ have the `strictNullChecks` compiler option (or `strict`) set to `true`."
   *       },
   *       "allowString": {
   *         "type": "boolean",
   *         "description": "Whether to allow `string`s in a boolean context."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to allow `any`s in a boolean context. */
    allowAny?: boolean;
    /** Whether to allow nullable `boolean`s in a boolean context. */
    allowNullableBoolean?: boolean;
    /** Whether to allow nullable `enum`s in a boolean context. */
    allowNullableEnum?: boolean;
    /** Whether to allow nullable `number`s in a boolean context. */
    allowNullableNumber?: boolean;
    /**
     * Whether to allow nullable `object`s, `symbol`s, and functions in a
     * boolean context.
     */
    allowNullableObject?: boolean;
    /** Whether to allow nullable `string`s in a boolean context. */
    allowNullableString?: boolean;
    /** Whether to allow `number`s in a boolean context. */
    allowNumber?: boolean;
    /**
     * Unless this is set to `true`, the rule will error on every file whose
     * `tsconfig.json` does _not_ have the `strictNullChecks` compiler option
     * (or `strict`) set to `true`.
     */
    allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
    /** Whether to allow `string`s in a boolean context. */
    allowString?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow passing a value-returning function in a position accepting a void
 * function
 *
 * @link https://typescript-eslint.io/rules/strict-void-return
 *
 *  ```md
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | deprecated           | false   |
 *  | requiresTypeChecking | true    |
 *  ```
 */
namespace StrictVoidReturn {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowReturnAny": {
   *         "type": "boolean",
   *         "description": "Whether to allow functions returning `any` to be used in place expecting a `void` function."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether to allow functions returning `any` to be used in place expecting
     * a `void` function.
     */
    allowReturnAny?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require switch-case statements to be exhaustive
 *
 * @link https://typescript-eslint.io/rules/switch-exhaustiveness-check
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | hasSuggestions       | true       |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace SwitchExhaustivenessCheck {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "allowDefaultCaseForExhaustiveSwitch": {
   *         "type": "boolean",
   *         "description": "If 'true', allow 'default' cases on switch statements with exhaustive cases."
   *       },
   *       "considerDefaultExhaustiveForUnions": {
   *         "type": "boolean",
   *         "description": "If 'true', the 'default' clause is used to determine whether the switch statement is exhaustive for union type"
   *       },
   *       "defaultCaseCommentPattern": {
   *         "type": "string",
   *         "description": "Regular expression for a comment that can indicate an intentionally omitted default case."
   *       },
   *       "requireDefaultForNonUnion": {
   *         "type": "boolean",
   *         "description": "If 'true', require a 'default' clause for switches on non-union types."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * If 'true', allow 'default' cases on switch statements with exhaustive
     * cases.
     */
    allowDefaultCaseForExhaustiveSwitch?: boolean;
    /**
     * If 'true', the 'default' clause is used to determine whether the switch
     * statement is exhaustive for union type
     */
    considerDefaultExhaustiveForUnions?: boolean;
    /**
     * Regular expression for a comment that can indicate an intentionally
     * omitted default case.
     */
    defaultCaseCommentPattern?: string;
    /** If 'true', require a 'default' clause for switches on non-union types. */
    requireDefaultForNonUnion?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow certain triple slash directives in favor of ES6-style import
 * declarations
 *
 * @link https://typescript-eslint.io/rules/triple-slash-reference
 *
 *  ```md
 *  | key         | value       |
 *  | :---------- | :---------- |
 *  | type        | suggestion  |
 *  | deprecated  | false       |
 *  | recommended | recommended |
 *  ```
 */
namespace TripleSlashReference {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "lib": {
   *         "type": "string",
   *         "description": "What to enforce for `/// <reference lib=\"...\" />` references.",
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       },
   *       "path": {
   *         "type": "string",
   *         "description": "What to enforce for `/// <reference path=\"...\" />` references.",
   *         "enum": [
   *           "always",
   *           "never"
   *         ]
   *       },
   *       "types": {
   *         "type": "string",
   *         "description": "What to enforce for `/// <reference types=\"...\" />` references.",
   *         "enum": [
   *           "always",
   *           "never",
   *           "prefer-import"
   *         ]
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** What to enforce for `/// <reference lib="..." />` references. */
    lib?: 'always' | 'never';
    /** What to enforce for `/// <reference path="..." />` references. */
    path?: 'always' | 'never';
    /** What to enforce for `/// <reference types="..." />` references. */
    types?: 'always' | 'never' | 'prefer-import';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require type annotations in certain places
 *
 * @link https://typescript-eslint.io/rules/typedef
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | true       |
 *  ```
 */
namespace Typedef {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "arrayDestructuring": {
   *         "type": "boolean",
   *         "description": "Whether to enforce type annotations on variables declared using array destructuring."
   *       },
   *       "arrowParameter": {
   *         "type": "boolean",
   *         "description": "Whether to enforce type annotations for parameters of arrow functions."
   *       },
   *       "memberVariableDeclaration": {
   *         "type": "boolean",
   *         "description": "Whether to enforce type annotations on member variables of classes."
   *       },
   *       "objectDestructuring": {
   *         "type": "boolean",
   *         "description": "Whether to enforce type annotations on variables declared using object destructuring."
   *       },
   *       "parameter": {
   *         "type": "boolean",
   *         "description": "Whether to enforce type annotations for parameters of functions and methods."
   *       },
   *       "propertyDeclaration": {
   *         "type": "boolean",
   *         "description": "Whether to enforce type annotations for properties of interfaces and types."
   *       },
   *       "variableDeclaration": {
   *         "type": "boolean",
   *         "description": "Whether to enforce type annotations for variable declarations, excluding array and object destructuring."
   *       },
   *       "variableDeclarationIgnoreFunction": {
   *         "type": "boolean",
   *         "description": "Whether to ignore variable declarations for non-arrow and arrow functions."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce unbound methods are called with their expected scope
 *
 * @link https://typescript-eslint.io/rules/unbound-method
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | problem     |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace UnboundMethod {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "ignoreStatic": {
   *         "type": "boolean",
   *         "description": "Whether to skip checking whether `static` methods are correctly bound."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** Whether to skip checking whether `static` methods are correctly bound. */
    ignoreStatic?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow two overloads that could be unified into one with a union or an
 * optional/rest parameter
 *
 * @link https://typescript-eslint.io/rules/unified-signatures
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | strict     |
 *  ```
 */
namespace UnifiedSignatures {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "ignoreDifferentlyNamedParameters": {
   *         "type": "boolean",
   *         "description": "Whether two parameters with different names at the same index should be considered different even if their types are the same."
   *       },
   *       "ignoreOverloadsWithDifferentJSDoc": {
   *         "type": "boolean",
   *         "description": "Whether two overloads with different JSDoc comments should be considered different even if their parameter and return types are the same."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Whether two parameters with different names at the same index should be
     * considered different even if their types are the same.
     */
    ignoreDifferentlyNamedParameters?: boolean;
    /**
     * Whether two overloads with different JSDoc comments should be considered
     * different even if their parameter and return types are the same.
     */
    ignoreOverloadsWithDifferentJSDoc?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce typing arguments in Promise rejection callbacks as `unknown`
 *
 * @link https://typescript-eslint.io/rules/use-unknown-in-catch-callback-variable
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | hasSuggestions       | true       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace UseUnknownInCatchCallbackVariable {
  export type RuleEntry = Linter.StringSeverity;
}

export type TypeScriptEslintRules = Readonly<{
  '@typescript-eslint/adjacent-overload-signatures': AdjacentOverloadSignatures.RuleEntry;
  '@typescript-eslint/array-type': ArrayType.RuleEntry;
  '@typescript-eslint/await-thenable': AwaitThenable.RuleEntry;
  '@typescript-eslint/ban-ts-comment': BanTsComment.RuleEntry;
  '@typescript-eslint/ban-tslint-comment': BanTslintComment.RuleEntry;
  '@typescript-eslint/class-literal-property-style': ClassLiteralPropertyStyle.RuleEntry;
  '@typescript-eslint/class-methods-use-this': ClassMethodsUseThis.RuleEntry;
  '@typescript-eslint/consistent-generic-constructors': ConsistentGenericConstructors.RuleEntry;
  '@typescript-eslint/consistent-indexed-object-style': ConsistentIndexedObjectStyle.RuleEntry;
  '@typescript-eslint/consistent-return': ConsistentReturn.RuleEntry;
  '@typescript-eslint/consistent-type-assertions': ConsistentTypeAssertions.RuleEntry;
  '@typescript-eslint/consistent-type-definitions': ConsistentTypeDefinitions.RuleEntry;
  '@typescript-eslint/consistent-type-exports': ConsistentTypeExports.RuleEntry;
  '@typescript-eslint/consistent-type-imports': ConsistentTypeImports.RuleEntry;
  '@typescript-eslint/default-param-last': DefaultParamLast.RuleEntry;
  '@typescript-eslint/dot-notation': DotNotation.RuleEntry;
  '@typescript-eslint/explicit-function-return-type': ExplicitFunctionReturnType.RuleEntry;
  '@typescript-eslint/explicit-member-accessibility': ExplicitMemberAccessibility.RuleEntry;
  '@typescript-eslint/explicit-module-boundary-types': ExplicitModuleBoundaryTypes.RuleEntry;
  '@typescript-eslint/init-declarations': InitDeclarations.RuleEntry;
  '@typescript-eslint/max-params': MaxParams.RuleEntry;
  '@typescript-eslint/member-ordering': MemberOrdering.RuleEntry;
  '@typescript-eslint/method-signature-style': MethodSignatureStyle.RuleEntry;
  '@typescript-eslint/naming-convention': NamingConvention.RuleEntry;
  '@typescript-eslint/no-array-constructor': NoArrayConstructor.RuleEntry;
  '@typescript-eslint/no-array-delete': NoArrayDelete.RuleEntry;
  '@typescript-eslint/no-base-to-string': NoBaseToString.RuleEntry;
  '@typescript-eslint/no-confusing-non-null-assertion': NoConfusingNonNullAssertion.RuleEntry;
  '@typescript-eslint/no-confusing-void-expression': NoConfusingVoidExpression.RuleEntry;
  '@typescript-eslint/no-deprecated': NoDeprecated.RuleEntry;
  '@typescript-eslint/no-dupe-class-members': NoDupeClassMembers.RuleEntry;
  '@typescript-eslint/no-duplicate-enum-values': NoDuplicateEnumValues.RuleEntry;
  '@typescript-eslint/no-duplicate-type-constituents': NoDuplicateTypeConstituents.RuleEntry;
  '@typescript-eslint/no-dynamic-delete': NoDynamicDelete.RuleEntry;
  '@typescript-eslint/no-empty-function': NoEmptyFunction.RuleEntry;
  '@typescript-eslint/no-empty-object-type': NoEmptyObjectType.RuleEntry;
  '@typescript-eslint/no-explicit-any': NoExplicitAny.RuleEntry;
  '@typescript-eslint/no-extra-non-null-assertion': NoExtraNonNullAssertion.RuleEntry;
  '@typescript-eslint/no-extraneous-class': NoExtraneousClass.RuleEntry;
  '@typescript-eslint/no-floating-promises': NoFloatingPromises.RuleEntry;
  '@typescript-eslint/no-for-in-array': NoForInArray.RuleEntry;
  '@typescript-eslint/no-implied-eval': NoImpliedEval.RuleEntry;
  '@typescript-eslint/no-import-type-side-effects': NoImportTypeSideEffects.RuleEntry;
  '@typescript-eslint/no-inferrable-types': NoInferrableTypes.RuleEntry;
  '@typescript-eslint/no-invalid-this': NoInvalidThis.RuleEntry;
  '@typescript-eslint/no-invalid-void-type': NoInvalidVoidType.RuleEntry;
  '@typescript-eslint/no-loop-func': NoLoopFunc.RuleEntry;
  '@typescript-eslint/no-magic-numbers': NoMagicNumbers.RuleEntry;
  '@typescript-eslint/no-meaningless-void-operator': NoMeaninglessVoidOperator.RuleEntry;
  '@typescript-eslint/no-misused-new': NoMisusedNew.RuleEntry;
  '@typescript-eslint/no-misused-promises': NoMisusedPromises.RuleEntry;
  '@typescript-eslint/no-misused-spread': NoMisusedSpread.RuleEntry;
  '@typescript-eslint/no-mixed-enums': NoMixedEnums.RuleEntry;
  '@typescript-eslint/no-namespace': NoNamespace.RuleEntry;
  '@typescript-eslint/no-non-null-asserted-nullish-coalescing': NoNonNullAssertedNullishCoalescing.RuleEntry;
  '@typescript-eslint/no-non-null-asserted-optional-chain': NoNonNullAssertedOptionalChain.RuleEntry;
  '@typescript-eslint/no-non-null-assertion': NoNonNullAssertion.RuleEntry;
  '@typescript-eslint/no-redeclare': NoRedeclare.RuleEntry;
  '@typescript-eslint/no-redundant-type-constituents': NoRedundantTypeConstituents.RuleEntry;
  '@typescript-eslint/no-require-imports': NoRequireImports.RuleEntry;
  '@typescript-eslint/no-restricted-imports': NoRestrictedImports.RuleEntry;
  '@typescript-eslint/no-restricted-types': NoRestrictedTypes.RuleEntry;
  '@typescript-eslint/no-shadow': NoShadow.RuleEntry;
  '@typescript-eslint/no-this-alias': NoThisAlias.RuleEntry;
  '@typescript-eslint/no-unnecessary-boolean-literal-compare': NoUnnecessaryBooleanLiteralCompare.RuleEntry;
  '@typescript-eslint/no-unnecessary-condition': NoUnnecessaryCondition.RuleEntry;
  '@typescript-eslint/no-unnecessary-parameter-property-assignment': NoUnnecessaryParameterPropertyAssignment.RuleEntry;
  '@typescript-eslint/no-unnecessary-qualifier': NoUnnecessaryQualifier.RuleEntry;
  '@typescript-eslint/no-unnecessary-template-expression': NoUnnecessaryTemplateExpression.RuleEntry;
  '@typescript-eslint/no-unnecessary-type-arguments': NoUnnecessaryTypeArguments.RuleEntry;
  '@typescript-eslint/no-unnecessary-type-assertion': NoUnnecessaryTypeAssertion.RuleEntry;
  '@typescript-eslint/no-unnecessary-type-constraint': NoUnnecessaryTypeConstraint.RuleEntry;
  '@typescript-eslint/no-unnecessary-type-conversion': NoUnnecessaryTypeConversion.RuleEntry;
  '@typescript-eslint/no-unnecessary-type-parameters': NoUnnecessaryTypeParameters.RuleEntry;
  '@typescript-eslint/no-unsafe-argument': NoUnsafeArgument.RuleEntry;
  '@typescript-eslint/no-unsafe-assignment': NoUnsafeAssignment.RuleEntry;
  '@typescript-eslint/no-unsafe-call': NoUnsafeCall.RuleEntry;
  '@typescript-eslint/no-unsafe-declaration-merging': NoUnsafeDeclarationMerging.RuleEntry;
  '@typescript-eslint/no-unsafe-enum-comparison': NoUnsafeEnumComparison.RuleEntry;
  '@typescript-eslint/no-unsafe-function-type': NoUnsafeFunctionType.RuleEntry;
  '@typescript-eslint/no-unsafe-member-access': NoUnsafeMemberAccess.RuleEntry;
  '@typescript-eslint/no-unsafe-return': NoUnsafeReturn.RuleEntry;
  '@typescript-eslint/no-unsafe-type-assertion': NoUnsafeTypeAssertion.RuleEntry;
  '@typescript-eslint/no-unsafe-unary-minus': NoUnsafeUnaryMinus.RuleEntry;
  '@typescript-eslint/no-unused-expressions': NoUnusedExpressions.RuleEntry;
  '@typescript-eslint/no-unused-private-class-members': NoUnusedPrivateClassMembers.RuleEntry;
  '@typescript-eslint/no-unused-vars': NoUnusedVars.RuleEntry;
  '@typescript-eslint/no-use-before-define': NoUseBeforeDefine.RuleEntry;
  '@typescript-eslint/no-useless-constructor': NoUselessConstructor.RuleEntry;
  '@typescript-eslint/no-useless-default-assignment': NoUselessDefaultAssignment.RuleEntry;
  '@typescript-eslint/no-useless-empty-export': NoUselessEmptyExport.RuleEntry;
  '@typescript-eslint/no-wrapper-object-types': NoWrapperObjectTypes.RuleEntry;
  '@typescript-eslint/non-nullable-type-assertion-style': NonNullableTypeAssertionStyle.RuleEntry;
  '@typescript-eslint/only-throw-error': OnlyThrowError.RuleEntry;
  '@typescript-eslint/parameter-properties': ParameterProperties.RuleEntry;
  '@typescript-eslint/prefer-as-const': PreferAsConst.RuleEntry;
  '@typescript-eslint/prefer-destructuring': PreferDestructuring.RuleEntry;
  '@typescript-eslint/prefer-enum-initializers': PreferEnumInitializers.RuleEntry;
  '@typescript-eslint/prefer-find': PreferFind.RuleEntry;
  '@typescript-eslint/prefer-for-of': PreferForOf.RuleEntry;
  '@typescript-eslint/prefer-function-type': PreferFunctionType.RuleEntry;
  '@typescript-eslint/prefer-includes': PreferIncludes.RuleEntry;
  '@typescript-eslint/prefer-literal-enum-member': PreferLiteralEnumMember.RuleEntry;
  '@typescript-eslint/prefer-namespace-keyword': PreferNamespaceKeyword.RuleEntry;
  '@typescript-eslint/prefer-nullish-coalescing': PreferNullishCoalescing.RuleEntry;
  '@typescript-eslint/prefer-optional-chain': PreferOptionalChain.RuleEntry;
  '@typescript-eslint/prefer-promise-reject-errors': PreferPromiseRejectErrors.RuleEntry;
  '@typescript-eslint/prefer-readonly': PreferReadonly.RuleEntry;
  '@typescript-eslint/prefer-readonly-parameter-types': PreferReadonlyParameterTypes.RuleEntry;
  '@typescript-eslint/prefer-reduce-type-parameter': PreferReduceTypeParameter.RuleEntry;
  '@typescript-eslint/prefer-regexp-exec': PreferRegexpExec.RuleEntry;
  '@typescript-eslint/prefer-return-this-type': PreferReturnThisType.RuleEntry;
  '@typescript-eslint/prefer-string-starts-ends-with': PreferStringStartsEndsWith.RuleEntry;
  '@typescript-eslint/promise-function-async': PromiseFunctionAsync.RuleEntry;
  '@typescript-eslint/related-getter-setter-pairs': RelatedGetterSetterPairs.RuleEntry;
  '@typescript-eslint/require-array-sort-compare': RequireArraySortCompare.RuleEntry;
  '@typescript-eslint/require-await': RequireAwait.RuleEntry;
  '@typescript-eslint/restrict-plus-operands': RestrictPlusOperands.RuleEntry;
  '@typescript-eslint/restrict-template-expressions': RestrictTemplateExpressions.RuleEntry;
  '@typescript-eslint/return-await': ReturnAwait.RuleEntry;
  '@typescript-eslint/strict-boolean-expressions': StrictBooleanExpressions.RuleEntry;
  '@typescript-eslint/strict-void-return': StrictVoidReturn.RuleEntry;
  '@typescript-eslint/switch-exhaustiveness-check': SwitchExhaustivenessCheck.RuleEntry;
  '@typescript-eslint/triple-slash-reference': TripleSlashReference.RuleEntry;
  '@typescript-eslint/unbound-method': UnboundMethod.RuleEntry;
  '@typescript-eslint/unified-signatures': UnifiedSignatures.RuleEntry;
  '@typescript-eslint/use-unknown-in-catch-callback-variable': UseUnknownInCatchCallbackVariable.RuleEntry;

  // deprecated
  '@typescript-eslint/no-empty-interface': NoEmptyInterface.RuleEntry;
  '@typescript-eslint/no-loss-of-precision': NoLossOfPrecision.RuleEntry;
  '@typescript-eslint/no-type-alias': NoTypeAlias.RuleEntry;
  '@typescript-eslint/no-var-requires': NoVarRequires.RuleEntry;
  '@typescript-eslint/prefer-ts-expect-error': PreferTsExpectError.RuleEntry;
  '@typescript-eslint/sort-type-constituents': SortTypeConstituents.RuleEntry;
  '@typescript-eslint/typedef': Typedef.RuleEntry;
}>;

export type TypeScriptEslintRulesOption = Readonly<{
  '@typescript-eslint/array-type': ArrayType.Options;
  '@typescript-eslint/ban-ts-comment': BanTsComment.Options;
  '@typescript-eslint/class-literal-property-style': ClassLiteralPropertyStyle.Options;
  '@typescript-eslint/class-methods-use-this': ClassMethodsUseThis.Options;
  '@typescript-eslint/consistent-generic-constructors': ConsistentGenericConstructors.Options;
  '@typescript-eslint/consistent-indexed-object-style': ConsistentIndexedObjectStyle.Options;
  '@typescript-eslint/consistent-return': ConsistentReturn.Options;
  '@typescript-eslint/consistent-type-assertions': ConsistentTypeAssertions.Options;
  '@typescript-eslint/consistent-type-definitions': ConsistentTypeDefinitions.Options;
  '@typescript-eslint/consistent-type-exports': ConsistentTypeExports.Options;
  '@typescript-eslint/consistent-type-imports': ConsistentTypeImports.Options;
  '@typescript-eslint/dot-notation': DotNotation.Options;
  '@typescript-eslint/explicit-function-return-type': ExplicitFunctionReturnType.Options;
  '@typescript-eslint/explicit-member-accessibility': ExplicitMemberAccessibility.Options;
  '@typescript-eslint/explicit-module-boundary-types': ExplicitModuleBoundaryTypes.Options;
  '@typescript-eslint/init-declarations': InitDeclarations.Options;
  '@typescript-eslint/max-params': MaxParams.Options;
  '@typescript-eslint/member-ordering': MemberOrdering.Options;
  '@typescript-eslint/method-signature-style': MethodSignatureStyle.Options;
  '@typescript-eslint/naming-convention': NamingConvention.Options;
  '@typescript-eslint/no-base-to-string': NoBaseToString.Options;
  '@typescript-eslint/no-confusing-void-expression': NoConfusingVoidExpression.Options;
  '@typescript-eslint/no-deprecated': NoDeprecated.Options;
  '@typescript-eslint/no-duplicate-type-constituents': NoDuplicateTypeConstituents.Options;
  '@typescript-eslint/no-empty-function': NoEmptyFunction.Options;
  '@typescript-eslint/no-empty-object-type': NoEmptyObjectType.Options;
  '@typescript-eslint/no-explicit-any': NoExplicitAny.Options;
  '@typescript-eslint/no-extraneous-class': NoExtraneousClass.Options;
  '@typescript-eslint/no-floating-promises': NoFloatingPromises.Options;
  '@typescript-eslint/no-inferrable-types': NoInferrableTypes.Options;
  '@typescript-eslint/no-invalid-this': NoInvalidThis.Options;
  '@typescript-eslint/no-invalid-void-type': NoInvalidVoidType.Options;
  '@typescript-eslint/no-magic-numbers': NoMagicNumbers.Options;
  '@typescript-eslint/no-meaningless-void-operator': NoMeaninglessVoidOperator.Options;
  '@typescript-eslint/no-misused-promises': NoMisusedPromises.Options;
  '@typescript-eslint/no-misused-spread': NoMisusedSpread.Options;
  '@typescript-eslint/no-namespace': NoNamespace.Options;
  '@typescript-eslint/no-redeclare': NoRedeclare.Options;
  '@typescript-eslint/no-require-imports': NoRequireImports.Options;
  '@typescript-eslint/no-restricted-imports': NoRestrictedImports.Options;
  '@typescript-eslint/no-restricted-types': NoRestrictedTypes.Options;
  '@typescript-eslint/no-shadow': NoShadow.Options;
  '@typescript-eslint/no-this-alias': NoThisAlias.Options;
  '@typescript-eslint/no-unnecessary-boolean-literal-compare': NoUnnecessaryBooleanLiteralCompare.Options;
  '@typescript-eslint/no-unnecessary-condition': NoUnnecessaryCondition.Options;
  '@typescript-eslint/no-unnecessary-type-assertion': NoUnnecessaryTypeAssertion.Options;
  '@typescript-eslint/no-unsafe-member-access': NoUnsafeMemberAccess.Options;
  '@typescript-eslint/no-unused-expressions': NoUnusedExpressions.Options;
  '@typescript-eslint/no-unused-vars': NoUnusedVars.Options;
  '@typescript-eslint/no-use-before-define': NoUseBeforeDefine.Options;
  '@typescript-eslint/only-throw-error': OnlyThrowError.Options;
  '@typescript-eslint/parameter-properties': ParameterProperties.Options;
  '@typescript-eslint/prefer-destructuring': readonly [
    PreferDestructuring.Options0,
    PreferDestructuring.Options1,
  ];
  '@typescript-eslint/prefer-literal-enum-member': PreferLiteralEnumMember.Options;
  '@typescript-eslint/prefer-nullish-coalescing': PreferNullishCoalescing.Options;
  '@typescript-eslint/prefer-optional-chain': PreferOptionalChain.Options;
  '@typescript-eslint/prefer-promise-reject-errors': PreferPromiseRejectErrors.Options;
  '@typescript-eslint/prefer-readonly': PreferReadonly.Options;
  '@typescript-eslint/prefer-readonly-parameter-types': PreferReadonlyParameterTypes.Options;
  '@typescript-eslint/prefer-string-starts-ends-with': PreferStringStartsEndsWith.Options;
  '@typescript-eslint/promise-function-async': PromiseFunctionAsync.Options;
  '@typescript-eslint/require-array-sort-compare': RequireArraySortCompare.Options;
  '@typescript-eslint/restrict-plus-operands': RestrictPlusOperands.Options;
  '@typescript-eslint/restrict-template-expressions': RestrictTemplateExpressions.Options;
  '@typescript-eslint/return-await': ReturnAwait.Options;
  '@typescript-eslint/strict-boolean-expressions': StrictBooleanExpressions.Options;
  '@typescript-eslint/strict-void-return': StrictVoidReturn.Options;
  '@typescript-eslint/switch-exhaustiveness-check': SwitchExhaustivenessCheck.Options;
  '@typescript-eslint/triple-slash-reference': TripleSlashReference.Options;
  '@typescript-eslint/unbound-method': UnboundMethod.Options;
  '@typescript-eslint/unified-signatures': UnifiedSignatures.Options;
}>;
