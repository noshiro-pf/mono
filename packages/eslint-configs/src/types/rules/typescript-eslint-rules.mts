/* cSpell:disable */
import { type Linter } from 'eslint';
import { type RuleSeverityWithDefaultOption } from '../rule-severity-branded.mjs';

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
   *         "$ref": "#/items/0/$defs/arrayOption",
   *         "description": "The array type expected for mutable cases."
   *       },
   *       "readonly": {
   *         "$ref": "#/items/0/$defs/arrayOption",
   *         "description": "The array type expected for readonly cases. If omitted, the value for `default` will be used."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    /** The array type expected for mutable cases. */
    readonly default?: 'array-simple' | 'array' | 'generic';
    /**
     * The array type expected for readonly cases. If omitted, the value for
     * `default` will be used.
     */
    readonly readonly?: 'array-simple' | 'array' | 'generic';
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
 *  | key            | value           |
 *  | :------------- | :-------------- |
 *  | type           | problem         |
 *  | hasSuggestions | true            |
 *  | recommended    | [object Object] |
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
   *         "default": 3,
   *         "description": "A minimum character length for descriptions when `allow-with-description` is enabled."
   *       },
   *       "ts-check": {
   *         "$ref": "#/items/0/$defs/directiveConfigSchema"
   *       },
   *       "ts-expect-error": {
   *         "$ref": "#/items/0/$defs/directiveConfigSchema"
   *       },
   *       "ts-ignore": {
   *         "$ref": "#/items/0/$defs/directiveConfigSchema"
   *       },
   *       "ts-nocheck": {
   *         "$ref": "#/items/0/$defs/directiveConfigSchema"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type DirectiveConfigSchema =
    | boolean
    | 'allow-with-description'
    | {
        readonly descriptionFormat?: string;
      };

  export type Options = {
    /**
     * A minimum character length for descriptions when `allow-with-description`
     * is enabled.
     */
    readonly minimumDescriptionLength?: number;
    readonly 'ts-check'?: DirectiveConfigSchema;
    readonly 'ts-expect-error'?: DirectiveConfigSchema;
    readonly 'ts-ignore'?: DirectiveConfigSchema;
    readonly 'ts-nocheck'?: DirectiveConfigSchema;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
   *         "default": true,
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
   *         "description": "Makes the rule ignore class members that are defined within a class that `implements` a type",
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
   *         "description": "Ignore members marked with the `override` modifier"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Enforces that functions used as instance field initializers utilize
     * `this`.
     */
    readonly enforceForClassFields?: boolean;
    /** Allows specified method names to be ignored with this rule. */
    readonly exceptMethods?: readonly string[];
    /**
     * Makes the rule ignore class members that are defined within a class that
     * `implements` a type
     */
    readonly ignoreClassesThatImplementAnInterface?: boolean | 'public-fields';
    /** Ignore members marked with the `override` modifier */
    readonly ignoreOverrideMethods?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = 'constructor' | 'type-annotation';

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = 'index-signature' | 'record';

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    readonly treatUndefinedAsUnspecified?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options =
    | {
        /**
         * Whether to always prefer type declarations for array literals used as
         * variable initializers, rather than type assertions.
         */
        readonly arrayLiteralTypeAssertions?:
          | 'allow-as-parameter'
          | 'allow'
          | 'never';
        /** The expected assertion style to enforce. */
        readonly assertionStyle?: 'angle-bracket' | 'as';
        /**
         * Whether to always prefer type declarations for object literals used
         * as variable initializers, rather than type assertions.
         */
        readonly objectLiteralTypeAssertions?:
          | 'allow-as-parameter'
          | 'allow'
          | 'never';
      }
    | {
        /** The expected assertion style to enforce. */
        readonly assertionStyle: 'never';
      };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /**
     * Whether the rule will autofix "mixed" export cases using TS inline type
     * specifiers.
     */
    readonly fixMixedExportsWithInlineTypeSpecifier?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent usage of type imports
 *
 * @link https://typescript-eslint.io/rules/consistent-type-imports
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
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
  export type Options = {
    /** Whether to disallow type imports in type annotations (`import()`). */
    readonly disallowTypeAnnotations?: boolean;
    /**
     * The expected type modifier to be added when an import is detected as used
     * only in the type position.
     */
    readonly fixStyle?: 'inline-type-imports' | 'separate-type-imports';
    /** The expected import kind for type-only imports. */
    readonly prefer?: 'no-type-imports' | 'type-imports';
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce default parameters to be last
 *
 * @link https://typescript-eslint.io/rules/default-param-last
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
   *         "default": false,
   *         "description": "Whether to allow accessing properties matching an index signature with array notation."
   *       },
   *       "allowKeywords": {
   *         "type": "boolean",
   *         "default": true,
   *         "description": "Whether to allow keywords such as [\"class\"]`."
   *       },
   *       "allowPattern": {
   *         "type": "string",
   *         "default": "",
   *         "description": "Regular expression of names to allow."
   *       },
   *       "allowPrivateClassPropertyAccess": {
   *         "type": "boolean",
   *         "default": false,
   *         "description": "Whether to allow accessing class members marked as `private` with array notation."
   *       },
   *       "allowProtectedClassPropertyAccess": {
   *         "type": "boolean",
   *         "default": false,
   *         "description": "Whether to allow accessing class members marked as `protected` with array notation."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether to allow accessing properties matching an index signature with
     * array notation.
     */
    readonly allowIndexSignaturePropertyAccess?: boolean;
    /** Whether to allow keywords such as ["class"]`. */
    readonly allowKeywords?: boolean;
    /** Regular expression of names to allow. */
    readonly allowPattern?: string;
    /**
     * Whether to allow accessing class members marked as `private` with array
     * notation.
     */
    readonly allowPrivateClassPropertyAccess?: boolean;
    /**
     * Whether to allow accessing class members marked as `protected` with array
     * notation.
     */
    readonly allowProtectedClassPropertyAccess?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require explicit return types on functions and class methods
 *
 * @link https://typescript-eslint.io/rules/explicit-function-return-type
 *
 *  ```md
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
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
  export type Options = {
    /** Whether to allow arrow functions that start with the `void` keyword. */
    readonly allowConciseArrowFunctionExpressionsStartingWithVoid?: boolean;
    /**
     * Whether to ignore arrow functions immediately returning a `as const`
     * value.
     */
    readonly allowDirectConstAssertionInArrowFunctions?: boolean;
    /**
     * An array of function/method names that will not have their arguments or
     * return values checked.
     */
    readonly allowedNames?: readonly string[];
    /**
     * Whether to ignore function expressions (functions which are not part of a
     * declaration).
     */
    readonly allowExpressions?: boolean;
    /** Whether to ignore functions that don't have generic type parameters. */
    readonly allowFunctionsWithoutTypeParameters?: boolean;
    /**
     * Whether to ignore functions immediately returning another function
     * expression.
     */
    readonly allowHigherOrderFunctions?: boolean;
    /** Whether to ignore immediately invoked function expressions (IIFEs). */
    readonly allowIIFEs?: boolean;
    /**
     * Whether to ignore type annotations on the variable of function
     * expressions.
     */
    readonly allowTypedFunctionExpressions?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
   *         "$ref": "#/items/0/$defs/accessibilityLevel",
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
   *             "$ref": "#/items/0/$defs/accessibilityLevel"
   *           },
   *           "constructors": {
   *             "$ref": "#/items/0/$defs/accessibilityLevel"
   *           },
   *           "methods": {
   *             "$ref": "#/items/0/$defs/accessibilityLevel"
   *           },
   *           "parameterProperties": {
   *             "$ref": "#/items/0/$defs/accessibilityLevel"
   *           },
   *           "properties": {
   *             "$ref": "#/items/0/$defs/accessibilityLevel"
   *           }
   *         }
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type AccessibilityLevel = 'explicit' | 'no-public' | 'off';

  export type Options = {
    /** Which accessibility modifier is required to exist or not exist. */
    readonly accessibility?: 'explicit' | 'no-public' | 'off';
    /** Specific method names that may be ignored. */
    readonly ignoredMethodNames?: readonly string[];
    /**
     * Changes to required accessibility modifiers for specific kinds of class
     * members.
     */
    readonly overrides?: {
      readonly accessors?: AccessibilityLevel;
      readonly constructors?: AccessibilityLevel;
      readonly methods?: AccessibilityLevel;
      readonly parameterProperties?: AccessibilityLevel;
      readonly properties?: AccessibilityLevel;
    };
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require explicit return and argument types on exported functions' and
 * classes' public class methods
 *
 * @link https://typescript-eslint.io/rules/explicit-module-boundary-types
 *
 *  ```md
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
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
   *       "allowTypedFunctionExpressions": {
   *         "type": "boolean",
   *         "description": "Whether to ignore type annotations on the variable of a function expression."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    /** Whether to ignore arguments that are explicitly typed as `any`. */
    readonly allowArgumentsExplicitlyTypedAsAny?: boolean;
    /**
     * Whether to ignore return type annotations on body-less arrow functions
     * that return an `as const` type assertion. You must still type the
     * parameters of the function.
     */
    readonly allowDirectConstAssertionInArrowFunctions?: boolean;
    /**
     * An array of function/method names that will not have their arguments or
     * return values checked.
     */
    readonly allowedNames?: readonly string[];
    /**
     * Whether to ignore return type annotations on functions immediately
     * returning another function expression. You must still type the parameters
     * of the function.
     */
    readonly allowHigherOrderFunctions?: boolean;
    /**
     * Whether to ignore type annotations on the variable of a function
     * expression.
     */
    readonly allowTypedFunctionExpressions?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require or disallow initialization in variable declarations
 *
 * @link https://typescript-eslint.io/rules/init-declarations
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce a maximum number of parameters in function definitions
 *
 * @link https://typescript-eslint.io/rules/max-params
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
  export type Options = {
    /** Whether to count a `this` declaration when the type is `void`. */
    readonly countVoidThis?: boolean;
    /** A maximum number of parameters in function definitions. */
    readonly max?: number;
    /** (deprecated) A maximum number of parameters in function definitions. */
    readonly maximum?: number;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require a consistent member declaration order
 *
 * @link https://typescript-eslint.io/rules/member-ordering
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
   *                   "$ref": "#/items/0/$defs/allItems"
   *                 },
   *                 {
   *                   "type": "array",
   *                   "items": {
   *                     "$ref": "#/items/0/$defs/allItems"
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
   *                           "$ref": "#/items/0/$defs/allItems"
   *                         },
   *                         {
   *                           "type": "array",
   *                           "items": {
   *                             "$ref": "#/items/0/$defs/allItems"
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
   *                 "$ref": "#/items/0/$defs/optionalityOrderOptions"
   *               },
   *               "order": {
   *                 "$ref": "#/items/0/$defs/orderOptions"
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
   *                   "$ref": "#/items/0/$defs/typeItems"
   *                 },
   *                 {
   *                   "type": "array",
   *                   "items": {
   *                     "$ref": "#/items/0/$defs/typeItems"
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
   *                           "$ref": "#/items/0/$defs/typeItems"
   *                         },
   *                         {
   *                           "type": "array",
   *                           "items": {
   *                             "$ref": "#/items/0/$defs/typeItems"
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
   *                 "$ref": "#/items/0/$defs/optionalityOrderOptions"
   *               },
   *               "order": {
   *                 "$ref": "#/items/0/$defs/orderOptions"
   *               }
   *             }
   *           }
   *         ]
   *       }
   *     },
   *     "additionalProperties": false,
   *     "properties": {
   *       "classes": {
   *         "$ref": "#/items/0/$defs/baseConfig"
   *       },
   *       "classExpressions": {
   *         "$ref": "#/items/0/$defs/baseConfig"
   *       },
   *       "default": {
   *         "$ref": "#/items/0/$defs/baseConfig"
   *       },
   *       "interfaces": {
   *         "$ref": "#/items/0/$defs/typesConfig"
   *       },
   *       "typeLiterals": {
   *         "$ref": "#/items/0/$defs/typesConfig"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type BaseConfig =
    | readonly (AllItems | readonly AllItems[])[]
    | 'never'
    | {
        readonly memberTypes?:
          | readonly (AllItems | readonly AllItems[])[]
          | 'never';
        readonly optionalityOrder?: OptionalityOrderOptions;
        readonly order?: OrderOptions;
      };
  export type AllItems =
    | '#private-accessor'
    | '#private-field'
    | '#private-get'
    | '#private-instance-accessor'
    | '#private-instance-field'
    | '#private-instance-get'
    | '#private-instance-method'
    | '#private-instance-readonly-field'
    | '#private-instance-set'
    | '#private-instance-static-initialization'
    | '#private-method'
    | '#private-readonly-field'
    | '#private-set'
    | '#private-static-accessor'
    | '#private-static-field'
    | '#private-static-get'
    | '#private-static-method'
    | '#private-static-readonly-field'
    | '#private-static-set'
    | '#private-static-static-initialization'
    | 'abstract-accessor'
    | 'abstract-field'
    | 'abstract-get'
    | 'abstract-method'
    | 'abstract-readonly-field'
    | 'abstract-set'
    | 'abstract-static-initialization'
    | 'accessor'
    | 'call-signature'
    | 'constructor'
    | 'decorated-accessor'
    | 'decorated-field'
    | 'decorated-get'
    | 'decorated-method'
    | 'decorated-readonly-field'
    | 'decorated-set'
    | 'field'
    | 'get'
    | 'instance-accessor'
    | 'instance-field'
    | 'instance-get'
    | 'instance-method'
    | 'instance-readonly-field'
    | 'instance-set'
    | 'instance-static-initialization'
    | 'method'
    | 'private-accessor'
    | 'private-constructor'
    | 'private-decorated-accessor'
    | 'private-decorated-field'
    | 'private-decorated-get'
    | 'private-decorated-method'
    | 'private-decorated-readonly-field'
    | 'private-decorated-set'
    | 'private-field'
    | 'private-get'
    | 'private-instance-accessor'
    | 'private-instance-field'
    | 'private-instance-get'
    | 'private-instance-method'
    | 'private-instance-readonly-field'
    | 'private-instance-set'
    | 'private-instance-static-initialization'
    | 'private-method'
    | 'private-readonly-field'
    | 'private-set'
    | 'private-static-accessor'
    | 'private-static-field'
    | 'private-static-get'
    | 'private-static-method'
    | 'private-static-readonly-field'
    | 'private-static-set'
    | 'private-static-static-initialization'
    | 'protected-abstract-accessor'
    | 'protected-abstract-field'
    | 'protected-abstract-get'
    | 'protected-abstract-method'
    | 'protected-abstract-readonly-field'
    | 'protected-abstract-set'
    | 'protected-abstract-static-initialization'
    | 'protected-accessor'
    | 'protected-constructor'
    | 'protected-decorated-accessor'
    | 'protected-decorated-field'
    | 'protected-decorated-get'
    | 'protected-decorated-method'
    | 'protected-decorated-readonly-field'
    | 'protected-decorated-set'
    | 'protected-field'
    | 'protected-get'
    | 'protected-instance-accessor'
    | 'protected-instance-field'
    | 'protected-instance-get'
    | 'protected-instance-method'
    | 'protected-instance-readonly-field'
    | 'protected-instance-set'
    | 'protected-instance-static-initialization'
    | 'protected-method'
    | 'protected-readonly-field'
    | 'protected-set'
    | 'protected-static-accessor'
    | 'protected-static-field'
    | 'protected-static-get'
    | 'protected-static-method'
    | 'protected-static-readonly-field'
    | 'protected-static-set'
    | 'protected-static-static-initialization'
    | 'public-abstract-accessor'
    | 'public-abstract-field'
    | 'public-abstract-get'
    | 'public-abstract-method'
    | 'public-abstract-readonly-field'
    | 'public-abstract-set'
    | 'public-abstract-static-initialization'
    | 'public-accessor'
    | 'public-constructor'
    | 'public-decorated-accessor'
    | 'public-decorated-field'
    | 'public-decorated-get'
    | 'public-decorated-method'
    | 'public-decorated-readonly-field'
    | 'public-decorated-set'
    | 'public-field'
    | 'public-get'
    | 'public-instance-accessor'
    | 'public-instance-field'
    | 'public-instance-get'
    | 'public-instance-method'
    | 'public-instance-readonly-field'
    | 'public-instance-set'
    | 'public-instance-static-initialization'
    | 'public-method'
    | 'public-readonly-field'
    | 'public-set'
    | 'public-static-accessor'
    | 'public-static-field'
    | 'public-static-get'
    | 'public-static-method'
    | 'public-static-readonly-field'
    | 'public-static-set'
    | 'public-static-static-initialization'
    | 'readonly-field'
    | 'readonly-signature'
    | 'set'
    | 'signature'
    | 'static-accessor'
    | 'static-field'
    | 'static-get'
    | 'static-initialization'
    | 'static-method'
    | 'static-readonly-field'
    | 'static-set'
    | 'static-static-initialization';
  export type OptionalityOrderOptions = 'optional-first' | 'required-first';
  export type OrderOptions =
    | 'alphabetically-case-insensitive'
    | 'alphabetically'
    | 'as-written'
    | 'natural-case-insensitive'
    | 'natural';
  export type TypesConfig =
    | readonly (TypeItems | readonly TypeItems[])[]
    | 'never'
    | {
        readonly memberTypes?:
          | readonly (TypeItems | readonly TypeItems[])[]
          | 'never';
        readonly optionalityOrder?: OptionalityOrderOptions;
        readonly order?: OrderOptions;
      };
  export type TypeItems =
    | 'constructor'
    | 'field'
    | 'method'
    | 'readonly-field'
    | 'readonly-signature'
    | 'signature';

  export type Options = {
    readonly classes?: BaseConfig;
    readonly classExpressions?: BaseConfig;
    readonly default?: BaseConfig;
    readonly interfaces?: TypesConfig;
    readonly typeLiterals?: TypesConfig;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce using a particular method signature syntax
 *
 * @link https://typescript-eslint.io/rules/method-signature-style
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
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
   *     "enum": [
   *       "property",
   *       "method"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'method' | 'property';

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace NamingConvention {
  /**
   * ### schema
   *
   * ```json
   * {
   *   "$defs": {
   *     "predefinedFormats": {
   *       "enum": [
   *         "camelCase",
   *         "strictCamelCase",
   *         "PascalCase",
   *         "StrictPascalCase",
   *         "snake_case",
   *         "UPPER_CASE"
   *       ],
   *       "type": "string"
   *     },
   *     "typeModifiers": {
   *       "enum": ["boolean", "string", "number", "function", "array"],
   *       "type": "string"
   *     },
   *     "underscoreOptions": {
   *       "enum": [
   *         "forbid",
   *         "allow",
   *         "require",
   *         "requireDouble",
   *         "allowDouble",
   *         "allowSingleOrDouble"
   *       ],
   *       "type": "string"
   *     },
   *     "formatOptionsConfig": {
   *       "oneOf": [
   *         {
   *           "additionalItems": false,
   *           "items": {
   *             "$ref": "#/$defs/predefinedFormats"
   *           },
   *           "type": "array"
   *         },
   *         {
   *           "type": "null"
   *         }
   *       ]
   *     },
   *     "matchRegexConfig": {
   *       "additionalProperties": false,
   *       "properties": {
   *         "match": {
   *           "type": "boolean"
   *         },
   *         "regex": {
   *           "type": "string"
   *         }
   *       },
   *       "required": ["match", "regex"],
   *       "type": "object"
   *     },
   *     "prefixSuffixConfig": {
   *       "additionalItems": false,
   *       "items": {
   *         "minLength": 1,
   *         "type": "string"
   *       },
   *       "type": "array"
   *     }
   *   },
   *   "additionalItems": false,
   *   "items": {
   *     "oneOf": [
   *       {
   *         "additionalProperties": false,
   *         "description": "Multiple selectors in one config",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
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
   *                 "async",
   *                 "default",
   *                 "namespace"
   *               ],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           },
   *           "selector": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": [
   *                 "default",
   *                 "variableLike",
   *                 "memberLike",
   *                 "typeLike",
   *                 "method",
   *                 "property",
   *                 "accessor",
   *                 "variable",
   *                 "function",
   *                 "parameter",
   *                 "parameterProperty",
   *                 "classicAccessor",
   *                 "enumMember",
   *                 "classMethod",
   *                 "objectLiteralMethod",
   *                 "typeMethod",
   *                 "classProperty",
   *                 "objectLiteralProperty",
   *                 "typeProperty",
   *                 "autoAccessor",
   *                 "class",
   *                 "interface",
   *                 "typeAlias",
   *                 "enum",
   *                 "typeParameter",
   *                 "import"
   *               ],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           },
   *           "types": {
   *             "additionalItems": false,
   *             "items": {
   *               "$ref": "#/$defs/typeModifiers"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'default'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["default"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
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
   *                 "async",
   *                 "default",
   *                 "namespace"
   *               ],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'variableLike'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["variableLike"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": ["unused", "async"],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'variable'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["variable"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": [
   *                 "const",
   *                 "destructured",
   *                 "exported",
   *                 "global",
   *                 "unused",
   *                 "async"
   *               ],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           },
   *           "types": {
   *             "additionalItems": false,
   *             "items": {
   *               "$ref": "#/$defs/typeModifiers"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'function'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["function"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": ["exported", "global", "unused", "async"],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'parameter'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["parameter"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": ["destructured", "unused"],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           },
   *           "types": {
   *             "additionalItems": false,
   *             "items": {
   *               "$ref": "#/$defs/typeModifiers"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'memberLike'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["memberLike"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
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
   *               ],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'classProperty'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["classProperty"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
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
   *               ],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           },
   *           "types": {
   *             "additionalItems": false,
   *             "items": {
   *               "$ref": "#/$defs/typeModifiers"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'objectLiteralProperty'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["objectLiteralProperty"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": ["public", "requiresQuotes"],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           },
   *           "types": {
   *             "additionalItems": false,
   *             "items": {
   *               "$ref": "#/$defs/typeModifiers"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'typeProperty'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["typeProperty"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": ["public", "readonly", "requiresQuotes"],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           },
   *           "types": {
   *             "additionalItems": false,
   *             "items": {
   *               "$ref": "#/$defs/typeModifiers"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'parameterProperty'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["parameterProperty"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": ["private", "protected", "public", "readonly"],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           },
   *           "types": {
   *             "additionalItems": false,
   *             "items": {
   *               "$ref": "#/$defs/typeModifiers"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'property'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["property"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
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
   *               ],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           },
   *           "types": {
   *             "additionalItems": false,
   *             "items": {
   *               "$ref": "#/$defs/typeModifiers"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'classMethod'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["classMethod"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
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
   *               ],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'objectLiteralMethod'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["objectLiteralMethod"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": ["public", "requiresQuotes", "async"],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'typeMethod'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["typeMethod"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": ["public", "requiresQuotes"],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'method'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["method"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
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
   *               ],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'classicAccessor'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["classicAccessor"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": [
   *                 "abstract",
   *                 "private",
   *                 "protected",
   *                 "public",
   *                 "requiresQuotes",
   *                 "static",
   *                 "override"
   *               ],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           },
   *           "types": {
   *             "additionalItems": false,
   *             "items": {
   *               "$ref": "#/$defs/typeModifiers"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'autoAccessor'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["autoAccessor"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": [
   *                 "abstract",
   *                 "private",
   *                 "protected",
   *                 "public",
   *                 "requiresQuotes",
   *                 "static",
   *                 "override"
   *               ],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           },
   *           "types": {
   *             "additionalItems": false,
   *             "items": {
   *               "$ref": "#/$defs/typeModifiers"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'accessor'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["accessor"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": [
   *                 "abstract",
   *                 "private",
   *                 "protected",
   *                 "public",
   *                 "requiresQuotes",
   *                 "static",
   *                 "override"
   *               ],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           },
   *           "types": {
   *             "additionalItems": false,
   *             "items": {
   *               "$ref": "#/$defs/typeModifiers"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'enumMember'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["enumMember"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": ["requiresQuotes"],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'typeLike'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["typeLike"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": ["abstract", "exported", "unused"],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'class'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["class"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": ["abstract", "exported", "unused"],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'interface'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["interface"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": ["exported", "unused"],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'typeAlias'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["typeAlias"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": ["exported", "unused"],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'enum'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["enum"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": ["exported", "unused"],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'typeParameter'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["typeParameter"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": ["unused"],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       },
   *       {
   *         "additionalProperties": false,
   *         "description": "Selector 'import'",
   *         "properties": {
   *           "custom": {
   *             "$ref": "#/$defs/matchRegexConfig"
   *           },
   *           "failureMessage": {
   *             "type": "string"
   *           },
   *           "format": {
   *             "$ref": "#/$defs/formatOptionsConfig"
   *           },
   *           "leadingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "prefix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "suffix": {
   *             "$ref": "#/$defs/prefixSuffixConfig"
   *           },
   *           "trailingUnderscore": {
   *             "$ref": "#/$defs/underscoreOptions"
   *           },
   *           "filter": {
   *             "oneOf": [
   *               {
   *                 "minLength": 1,
   *                 "type": "string"
   *               },
   *               {
   *                 "$ref": "#/$defs/matchRegexConfig"
   *               }
   *             ]
   *           },
   *           "selector": {
   *             "enum": ["import"],
   *             "type": "string"
   *           },
   *           "modifiers": {
   *             "additionalItems": false,
   *             "items": {
   *               "enum": ["default", "namespace"],
   *               "type": "string"
   *             },
   *             "type": "array"
   *           }
   *         },
   *         "required": ["selector", "format"],
   *         "type": "object"
   *       }
   *     ]
   *   },
   *   "type": "array"
   * }
   * ```
   */
  export type FormatOptionsConfig = readonly PredefinedFormats[] | null;
  export type PredefinedFormats =
    | 'camelCase'
    | 'PascalCase'
    | 'snake_case'
    | 'strictCamelCase'
    | 'StrictPascalCase'
    | 'UPPER_CASE';
  export type UnderscoreOptions =
    | 'allow'
    | 'allowDouble'
    | 'allowSingleOrDouble'
    | 'forbid'
    | 'require'
    | 'requireDouble';
  export type PrefixSuffixConfig = readonly string[];
  export type TypeModifiers =
    | 'array'
    | 'boolean'
    | 'function'
    | 'number'
    | 'string';
  export type Options = readonly (
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly modifiers?: readonly (
          | '#private'
          | 'abstract'
          | 'async'
          | 'const'
          | 'default'
          | 'destructured'
          | 'exported'
          | 'global'
          | 'namespace'
          | 'override'
          | 'private'
          | 'protected'
          | 'public'
          | 'readonly'
          | 'requiresQuotes'
          | 'static'
          | 'unused'
        )[];
        readonly selector: readonly (
          | 'accessor'
          | 'autoAccessor'
          | 'class'
          | 'classicAccessor'
          | 'classMethod'
          | 'classProperty'
          | 'default'
          | 'enum'
          | 'enumMember'
          | 'function'
          | 'import'
          | 'interface'
          | 'memberLike'
          | 'method'
          | 'objectLiteralMethod'
          | 'objectLiteralProperty'
          | 'parameter'
          | 'parameterProperty'
          | 'property'
          | 'typeAlias'
          | 'typeLike'
          | 'typeMethod'
          | 'typeParameter'
          | 'typeProperty'
          | 'variable'
          | 'variableLike'
        )[];
        readonly types?: readonly TypeModifiers[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'accessor';
        readonly modifiers?: readonly (
          | 'abstract'
          | 'override'
          | 'private'
          | 'protected'
          | 'public'
          | 'requiresQuotes'
          | 'static'
        )[];
        readonly types?: readonly TypeModifiers[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'autoAccessor';
        readonly modifiers?: readonly (
          | 'abstract'
          | 'override'
          | 'private'
          | 'protected'
          | 'public'
          | 'requiresQuotes'
          | 'static'
        )[];
        readonly types?: readonly TypeModifiers[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'class';
        readonly modifiers?: readonly ('abstract' | 'exported' | 'unused')[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'classicAccessor';
        readonly modifiers?: readonly (
          | 'abstract'
          | 'override'
          | 'private'
          | 'protected'
          | 'public'
          | 'requiresQuotes'
          | 'static'
        )[];
        readonly types?: readonly TypeModifiers[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'classMethod';
        readonly modifiers?: readonly (
          | '#private'
          | 'abstract'
          | 'async'
          | 'override'
          | 'private'
          | 'protected'
          | 'public'
          | 'requiresQuotes'
          | 'static'
        )[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'classProperty';
        readonly modifiers?: readonly (
          | '#private'
          | 'abstract'
          | 'override'
          | 'private'
          | 'protected'
          | 'public'
          | 'readonly'
          | 'requiresQuotes'
          | 'static'
        )[];
        readonly types?: readonly TypeModifiers[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'default';
        readonly modifiers?: readonly (
          | '#private'
          | 'abstract'
          | 'async'
          | 'const'
          | 'default'
          | 'destructured'
          | 'exported'
          | 'global'
          | 'namespace'
          | 'override'
          | 'private'
          | 'protected'
          | 'public'
          | 'readonly'
          | 'requiresQuotes'
          | 'static'
          | 'unused'
        )[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'enum';
        readonly modifiers?: readonly ('exported' | 'unused')[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'enumMember';
        readonly modifiers?: readonly 'requiresQuotes'[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'function';
        readonly modifiers?: readonly (
          | 'async'
          | 'exported'
          | 'global'
          | 'unused'
        )[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'import';
        readonly modifiers?: readonly ('default' | 'namespace')[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'interface';
        readonly modifiers?: readonly ('exported' | 'unused')[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'memberLike';
        readonly modifiers?: readonly (
          | '#private'
          | 'abstract'
          | 'async'
          | 'override'
          | 'private'
          | 'protected'
          | 'public'
          | 'readonly'
          | 'requiresQuotes'
          | 'static'
        )[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'method';
        readonly modifiers?: readonly (
          | '#private'
          | 'abstract'
          | 'async'
          | 'override'
          | 'private'
          | 'protected'
          | 'public'
          | 'requiresQuotes'
          | 'static'
        )[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'objectLiteralMethod';
        readonly modifiers?: readonly ('async' | 'public' | 'requiresQuotes')[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'objectLiteralProperty';
        readonly modifiers?: readonly ('public' | 'requiresQuotes')[];
        readonly types?: readonly TypeModifiers[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'parameter';
        readonly modifiers?: readonly ('destructured' | 'unused')[];
        readonly types?: readonly TypeModifiers[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'parameterProperty';
        readonly modifiers?: readonly (
          | 'private'
          | 'protected'
          | 'public'
          | 'readonly'
        )[];
        readonly types?: readonly TypeModifiers[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'property';
        readonly modifiers?: readonly (
          | '#private'
          | 'abstract'
          | 'async'
          | 'override'
          | 'private'
          | 'protected'
          | 'public'
          | 'readonly'
          | 'requiresQuotes'
          | 'static'
        )[];
        readonly types?: readonly TypeModifiers[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'typeAlias';
        readonly modifiers?: readonly ('exported' | 'unused')[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'typeLike';
        readonly modifiers?: readonly ('abstract' | 'exported' | 'unused')[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'typeMethod';
        readonly modifiers?: readonly ('public' | 'requiresQuotes')[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'typeParameter';
        readonly modifiers?: readonly 'unused'[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'typeProperty';
        readonly modifiers?: readonly (
          | 'public'
          | 'readonly'
          | 'requiresQuotes'
        )[];
        readonly types?: readonly TypeModifiers[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'variable';
        readonly modifiers?: readonly (
          | 'async'
          | 'const'
          | 'destructured'
          | 'exported'
          | 'global'
          | 'unused'
        )[];
        readonly types?: readonly TypeModifiers[];
      }
    | {
        readonly custom?: MatchRegexConfig;
        readonly failureMessage?: string;
        readonly format: FormatOptionsConfig;
        readonly leadingUnderscore?: UnderscoreOptions;
        readonly prefix?: PrefixSuffixConfig;
        readonly suffix?: PrefixSuffixConfig;
        readonly trailingUnderscore?: UnderscoreOptions;
        readonly filter?: MatchRegexConfig | string;
        readonly selector: 'variableLike';
        readonly modifiers?: readonly ('async' | 'unused')[];
      }
  )[];

  export type MatchRegexConfig = {
    readonly match: boolean;
    readonly regex: string;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
   *       "ignoredTypeNames": {
   *         "type": "array",
   *         "description": "Stringified regular expressions of type names to ignore.",
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
    /** Stringified regular expressions of type names to ignore. */
    readonly ignoredTypeNames?: readonly string[];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /**
     * Whether to ignore "shorthand" `() =>` arrow functions: those without `{
     * ... }` braces.
     */
    readonly ignoreArrowShorthand?: boolean;
    /** Whether to ignore returns that start with the `void` operator. */
    readonly ignoreVoidOperator?: boolean;
    /**
     * Whether to ignore returns from functions with explicit `void` return
     * types and functions with contextual `void` return types.
     */
    readonly ignoreVoidReturningFunctions?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /** Type specifiers that can be allowed. */
    readonly allow?: readonly (
      | string
      | {
          readonly from: 'file';
          readonly name: string | readonly [string, ...(readonly string[])];
          readonly path?: string;
        }
      | {
          readonly from: 'lib';
          readonly name: string | readonly [string, ...(readonly string[])];
        }
      | {
          readonly from: 'package';
          readonly name: string | readonly [string, ...(readonly string[])];
          readonly package: string;
        }
    )[];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow duplicate class members
 *
 * @link https://typescript-eslint.io/rules/no-dupe-class-members
 *
 *  ```md
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
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
  export type Options = {
    /** Whether to ignore `&` intersections. */
    readonly ignoreIntersections?: boolean;
    /** Whether to ignore `|` unions. */
    readonly ignoreUnions?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
 *  | fixable     | code       |
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
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | stylistic  |
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
  export type Options = {
    /** Locations and kinds of functions that are allowed to be empty. */
    readonly allow?: readonly (
      | 'arrowFunctions'
      | 'asyncFunctions'
      | 'asyncMethods'
      | 'constructors'
      | 'decoratedFunctions'
      | 'functions'
      | 'generatorFunctions'
      | 'generatorMethods'
      | 'getters'
      | 'methods'
      | 'overrideMethods'
      | 'private-constructors'
      | 'protected-constructors'
      | 'setters'
    )[];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /** Whether to allow empty interfaces. */
    readonly allowInterfaces?: 'always' | 'never' | 'with-single-extends';
    /** Whether to allow empty object type literals. */
    readonly allowObjectTypes?: 'always' | 'never';
    /**
     * A stringified regular expression to allow interfaces and object type
     * aliases with the configured name.
     */
    readonly allowWithName?: string;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /**
     * Whether to enable auto-fixing in which the `any` type is converted to the
     * `unknown` type.
     */
    readonly fixToUnknown?: boolean;
    /** Whether to ignore rest parameter arrays. */
    readonly ignoreRestArgs?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /** Whether to allow extraneous classes that contain only a constructor. */
    readonly allowConstructorOnly?: boolean;
    /** Whether to allow extraneous classes that have no body (i.e. are empty). */
    readonly allowEmpty?: boolean;
    /** Whether to allow extraneous classes that only contain static members. */
    readonly allowStaticOnly?: boolean;
    /** Whether to allow extraneous classes that include a decorator. */
    readonly allowWithDecorator?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /** Type specifiers of functions whose calls are safe to float. */
    readonly allowForKnownSafeCalls?: readonly (
      | string
      | {
          readonly from: 'file';
          readonly name: string | readonly [string, ...(readonly string[])];
          readonly path?: string;
        }
      | {
          readonly from: 'lib';
          readonly name: string | readonly [string, ...(readonly string[])];
        }
      | {
          readonly from: 'package';
          readonly name: string | readonly [string, ...(readonly string[])];
          readonly package: string;
        }
    )[];
    /** Type specifiers that are known to be safe to float. */
    readonly allowForKnownSafePromises?: readonly (
      | string
      | {
          readonly from: 'file';
          readonly name: string | readonly [string, ...(readonly string[])];
          readonly path?: string;
        }
      | {
          readonly from: 'lib';
          readonly name: string | readonly [string, ...(readonly string[])];
        }
      | {
          readonly from: 'package';
          readonly name: string | readonly [string, ...(readonly string[])];
          readonly package: string;
        }
    )[];
    /** Whether to check all "Thenable"s, not just the built-in Promise type. */
    readonly checkThenables?: boolean;
    /** Whether to ignore async IIFEs (Immediately Invoked Function Expressions). */
    readonly ignoreIIFE?: boolean;
    /** Whether to ignore `void` expressions. */
    readonly ignoreVoid?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace NoForInArray {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow the use of `eval()`-like methods
 *
 * @link https://typescript-eslint.io/rules/no-implied-eval
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | suggestion  |
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
 *  | key     | value   |
 *  | :------ | :------ |
 *  | type    | problem |
 *  | fixable | code    |
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
  export type Options = {
    /** Whether to ignore function parameters. */
    readonly ignoreParameters?: boolean;
    /** Whether to ignore class properties. */
    readonly ignoreProperties?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow `this` keywords outside of classes or class-like objects
 *
 * @link https://typescript-eslint.io/rules/no-invalid-this
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
  export type Options = {
    readonly capIsConstructor?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /** Whether a `this` parameter of a function may be `void`. */
    readonly allowAsThisParameter?: boolean;
    /** Whether `void` can be used as a valid value for generic type parameters. */
    readonly allowInGenericTypeArguments?:
      | boolean
      | readonly [string, ...(readonly string[])];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow function declarations that contain unsafe references inside loop
 * statements
 *
 * @link https://typescript-eslint.io/rules/no-loop-func
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
   *         "description": "Whether enums used in TypeScript are considered okay."
   *       },
   *       "ignoreNumericLiteralTypes": {
   *         "type": "boolean",
   *         "description": "Whether numbers used in TypeScript numeric literal types are considered okay."
   *       },
   *       "ignoreReadonlyClassProperties": {
   *         "type": "boolean",
   *         "description": "Whether `readonly` class properties are considered okay."
   *       },
   *       "ignoreTypeIndexes": {
   *         "type": "boolean",
   *         "description": "Whether numbers used to index types are okay."
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
    /** Whether enums used in TypeScript are considered okay. */
    readonly ignoreEnums?: boolean;
    /**
     * Whether numbers used in TypeScript numeric literal types are considered
     * okay.
     */
    readonly ignoreNumericLiteralTypes?: boolean;
    /** Whether `readonly` class properties are considered okay. */
    readonly ignoreReadonlyClassProperties?: boolean;
    /** Whether numbers used to index types are okay. */
    readonly ignoreTypeIndexes?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
   *         "default": false,
   *         "description": "Whether to suggest removing `void` when the argument has type `never`."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    /** Whether to suggest removing `void` when the argument has type `never`. */
    readonly checkNever?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /** Whether to warn when a Promise is provided to conditional statements. */
    readonly checksConditionals?: boolean;
    /** Whether to warn when `...` spreading a `Promise`. */
    readonly checksSpreads?: boolean;
    /**
     * Whether to warn when a Promise is returned from a function typed as
     * returning `void`.
     */
    readonly checksVoidReturn?:
      | boolean
      | {
          /**
           * Disables checking an asynchronous function passed as argument where
           * the parameter type expects a function that returns `void`.
           */
          readonly arguments?: boolean;
          /**
           * Disables checking an asynchronous function passed as a JSX
           * attribute expected to be a function that returns `void`.
           */
          readonly attributes?: boolean;
          /**
           * Disables checking an asynchronous method in a type that extends or
           * implements another type expecting that method to return `void`.
           */
          readonly inheritedMethods?: boolean;
          /**
           * Disables checking an asynchronous function passed as an object
           * property expected to be a function that returns `void`.
           */
          readonly properties?: boolean;
          /**
           * Disables checking an asynchronous function returned in a function
           * whose return type is a function that returns `void`.
           */
          readonly returns?: boolean;
          /**
           * Disables checking an asynchronous function used as a variable whose
           * return type is a function that returns `void`.
           */
          readonly variables?: boolean;
        };
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /** An array of type specifiers that are known to be safe to spread. */
    readonly allow?: readonly (
      | string
      | {
          readonly from: 'file';
          readonly name: string | readonly [string, ...(readonly string[])];
          readonly path?: string;
        }
      | {
          readonly from: 'lib';
          readonly name: string | readonly [string, ...(readonly string[])];
        }
      | {
          readonly from: 'package';
          readonly name: string | readonly [string, ...(readonly string[])];
          readonly package: string;
        }
    )[];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /** Whether to allow `declare` with custom TypeScript namespaces. */
    readonly allowDeclarations?: boolean;
    /**
     * Whether to allow `declare` with custom TypeScript namespaces inside
     * definition files.
     */
    readonly allowDefinitionFiles?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
  export type Options = {
    /** Whether to report shadowing of built-in global variables. */
    readonly builtinGlobals?: boolean;
    /**
     * Whether to ignore declaration merges between certain TypeScript
     * declaration types.
     */
    readonly ignoreDeclarationMerge?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /** Patterns of import paths to allow requiring from. */
    readonly allow?: readonly string[];
    /** Allows `require` statements in import declarations. */
    readonly allowAsImport?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow specified modules when loaded by `import`
 *
 * @link https://typescript-eslint.io/rules/no-restricted-imports
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
   *             "additionalProperties": false,
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
   *             "required": ["name"]
   *           }
   *         ]
   *       },
   *       "uniqueItems": true
   *     },
   *     {
   *       "type": "array",
   *       "additionalItems": false,
   *       "items": [
   *         {
   *           "type": "object",
   *           "additionalProperties": false,
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
   *                     "additionalProperties": false,
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
   *                     "additionalProperties": false,
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
   *                         "description": "Whether to allow type-only imports for a path."
   *                       }
   *                     }
   *                   },
   *                   "uniqueItems": true
   *                 }
   *               ]
   *             }
   *           }
   *         }
   *       ]
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
            readonly allowImportNames?: readonly string[];
            /** Whether to allow type-only imports for a path. */
            readonly allowTypeImports?: boolean;
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
                readonly allowImportNames?: readonly string[];
                /** Whether to allow type-only imports for a path. */
                readonly allowTypeImports?: boolean;
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
                readonly allowImportNames?: readonly [
                  string,
                  ...(readonly string[]),
                ];
                /** @minItems 1 */
                readonly group?: readonly [string, ...(readonly string[])];
                readonly regex?: string;
                readonly importNamePattern?: string;
                readonly allowImportNamePattern?: string;
                readonly message?: string;
                readonly caseSensitive?: boolean;
                /** Whether to allow type-only imports for a path. */
                readonly allowTypeImports?: boolean;
              }[]
            | readonly string[];
        },
      ]
    | readonly [];

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
   *           "$ref": "#/items/0/$defs/banConfig"
   *         },
   *         "description": "An object whose keys are the types you want to ban, and the values are error messages."
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type BanConfig =
    | string
    | true
    | {
        /**
         * Type to autofix replace with. Note that autofixers can be applied
         * automatically - so you need to be careful with this option.
         */
        readonly fixWith?: string;
        /** Custom error message. */
        readonly message?: string;
        /** Types to suggest replacing with. */
        readonly suggest?: readonly string[];
      };

  export type Options = {
    /**
     * An object whose keys are the types you want to ban, and the values are
     * error messages.
     */
    readonly types?: Record<string, BanConfig>;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow variable declarations from shadowing variables declared in the outer
 * scope
 *
 * @link https://typescript-eslint.io/rules/no-shadow
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
  export type Options = {
    /** Identifier names for which shadowing is allowed. */
    readonly allow?: readonly string[];
    /** Whether to report shadowing of built-in global variables. */
    readonly builtinGlobals?: boolean;
    /**
     * Whether to report shadowing before outer functions or variables are
     * defined.
     */
    readonly hoist?:
      | 'all'
      | 'functions-and-types'
      | 'functions'
      | 'never'
      | 'types';
    /** Whether to ignore function parameters named the same as a variable. */
    readonly ignoreFunctionTypeParameterNameValueShadow?: boolean;
    /**
     * Whether to ignore the variable initializers when the shadowed variable is
     * presumably still unitialized.
     */
    readonly ignoreOnInitialization?: boolean;
    /** Whether to ignore types named the same as a variable. */
    readonly ignoreTypeValueShadow?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /**
     * Whether to ignore destructurings, such as `const { props, state } =
     * this`.
     */
    readonly allowDestructuring?: boolean;
    /** Names to ignore, such as ["self"] for `const self = this;`. */
    readonly allowedNames?: readonly string[];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
   *         "$ref": "#/items/0/$defs/expandedOptions",
   *         "description": "Whether to allow direct one-to-one type aliases."
   *       },
   *       "allowCallbacks": {
   *         "$ref": "#/items/0/$defs/simpleOptions",
   *         "description": "Whether to allow type aliases for callbacks."
   *       },
   *       "allowConditionalTypes": {
   *         "$ref": "#/items/0/$defs/simpleOptions",
   *         "description": "Whether to allow type aliases for conditional types."
   *       },
   *       "allowConstructors": {
   *         "$ref": "#/items/0/$defs/simpleOptions",
   *         "description": "Whether to allow type aliases with constructors."
   *       },
   *       "allowGenerics": {
   *         "$ref": "#/items/0/$defs/simpleOptions",
   *         "description": "Whether to allow type aliases with generic types."
   *       },
   *       "allowLiterals": {
   *         "$ref": "#/items/0/$defs/expandedOptions",
   *         "description": "Whether to allow type aliases with object literal types."
   *       },
   *       "allowMappedTypes": {
   *         "$ref": "#/items/0/$defs/expandedOptions",
   *         "description": "Whether to allow type aliases with mapped types."
   *       },
   *       "allowTupleTypes": {
   *         "$ref": "#/items/0/$defs/expandedOptions",
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
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether to allow comparisons between nullable boolean variables and
     * `false`.
     */
    readonly allowComparingNullableBooleansToFalse?: boolean;
    /**
     * Whether to allow comparisons between nullable boolean variables and
     * `true`.
     */
    readonly allowComparingNullableBooleansToTrue?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
 *  | fixable              | code       |
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
   *         "type": "boolean",
   *         "description": "Whether to ignore constant loop conditions, such as `while (true)`."
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
  export type Options = {
    /** Whether to ignore constant loop conditions, such as `while (true)`. */
    readonly allowConstantLoopConditions?: boolean;
    /**
     * Whether to not error when running with a tsconfig that has
     * strictNullChecks turned.
     */
    readonly allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
    /**
     * Whether to check the asserted argument of a type predicate function for
     * unnecessary conditions
     */
    readonly checkTypePredicates?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow unnecessary assignment of constructor property parameter
 *
 * @link https://typescript-eslint.io/rules/no-unnecessary-parameter-property-assignment
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
  export type Options = {
    /** A list of type names to ignore. */
    readonly typesToIgnore?: readonly string[];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
 *  | hasSuggestions | true        |
 *  | recommended    | recommended |
 *  ```
 */
namespace NoUnnecessaryTypeConstraint {
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
 *  | fixable     | code        |
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
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
 */
namespace NoUnsafeMemberAccess {
  export type RuleEntry = Linter.StringSeverity;
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow unused variables
 *
 * @link https://typescript-eslint.io/rules/no-unused-vars
 *
 *  ```md
 *  | key         | value       |
 *  | :---------- | :---------- |
 *  | type        | problem     |
 *  | recommended | recommended |
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
   *           "ignoreClassWithStaticInitBlock": {
   *             "type": "boolean",
   *             "description": "Whether to ignore classes with at least one static initialization block."
   *           },
   *           "ignoreRestSiblings": {
   *             "type": "boolean",
   *             "description": "Whether to ignore sibling properties in `...` destructurings."
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
    | 'all'
    | 'local'
    | {
        /** Whether to check all, some, or no arguments. */
        readonly args?: 'after-used' | 'all' | 'none';
        /** Regular expressions of argument names to not check for usage. */
        readonly argsIgnorePattern?: string;
        /** Whether to check catch block arguments. */
        readonly caughtErrors?: 'all' | 'none';
        /**
         * Regular expressions of catch block argument names to not check for
         * usage.
         */
        readonly caughtErrorsIgnorePattern?: string;
        /**
         * Regular expressions of destructured array variable names to not check
         * for usage.
         */
        readonly destructuredArrayIgnorePattern?: string;
        /**
         * Whether to ignore classes with at least one static initialization
         * block.
         */
        readonly ignoreClassWithStaticInitBlock?: boolean;
        /** Whether to ignore sibling properties in `...` destructurings. */
        readonly ignoreRestSiblings?: boolean;
        /**
         * Whether to report variables that match any of the valid ignore
         * pattern options if they have been used.
         */
        readonly reportUsedIgnorePattern?: boolean;
        /** Whether to check all variables or only locally-declared variables. */
        readonly vars?: 'all' | 'local';
        /** Regular expressions of variable names to not check for usage. */
        readonly varsIgnorePattern?: string;
      };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow the use of variables before they are defined
 *
 * @link https://typescript-eslint.io/rules/no-use-before-define
 *
 *  ```md
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
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
    | {
        /** Whether to ignore named exports. */
        readonly allowNamedExports?: boolean;
        /** Whether to ignore references to class declarations. */
        readonly classes?: boolean;
        /** Whether to check references to enums. */
        readonly enums?: boolean;
        /** Whether to ignore references to function declarations. */
        readonly functions?: boolean;
        /**
         * Whether to ignore type references, such as in type annotations and
         * assertions.
         */
        readonly ignoreTypeReferences?: boolean;
        /** Whether to check references to types. */
        readonly typedefs?: boolean;
        /** Whether to ignore references to variables. */
        readonly variables?: boolean;
      };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
 *  | hasSuggestions | true    |
 *  | recommended    | strict  |
 *  ```
 */
namespace NoUselessConstructor {
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
  export type Options = {
    /** Type specifiers that can be thrown. */
    readonly allow?: readonly (
      | string
      | {
          readonly from: 'file';
          readonly name: string | readonly [string, ...(readonly string[])];
          readonly path?: string;
        }
      | {
          readonly from: 'lib';
          readonly name: string | readonly [string, ...(readonly string[])];
        }
      | {
          readonly from: 'package';
          readonly name: string | readonly [string, ...(readonly string[])];
          readonly package: string;
        }
    )[];
    /** Whether to always allow throwing values typed as `any`. */
    readonly allowThrowingAny?: boolean;
    /** Whether to always allow throwing values typed as `unknown`. */
    readonly allowThrowingUnknown?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require or disallow parameter properties in class constructors
 *
 * @link https://typescript-eslint.io/rules/parameter-properties
 *
 *  ```md
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
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
   *           "$ref": "#/items/0/$defs/modifier"
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
    | 'private readonly'
    | 'private'
    | 'protected readonly'
    | 'protected'
    | 'public readonly'
    | 'public'
    | 'readonly';

  export type Options = {
    /** Whether to allow certain kinds of properties to be ignored. */
    readonly allow?: readonly Modifier[];
    /** Whether to prefer class properties or parameter properties. */
    readonly prefer?: 'class-property' | 'parameter-property';
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options0 =
    | {
        readonly array?: boolean;
        readonly object?: boolean;
      }
    | {
        readonly AssignmentExpression?: {
          readonly array?: boolean;
          readonly object?: boolean;
        };
        readonly VariableDeclarator?: {
          readonly array?: boolean;
          readonly object?: boolean;
        };
      };

  export type Options1 = {
    /**
     * Whether to enforce destructuring on variable declarations with type
     * annotations.
     */
    readonly enforceForDeclarationWithTypeAnnotation?: boolean;
    /**
     * Whether to enforce destructuring that use a different variable name than
     * the property name.
     */
    readonly enforceForRenamedProperties?: boolean;
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | readonly [Linter.StringSeverity, Options0, Options1]
    | readonly [Linter.StringSeverity, Options0]
    | 'off';
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
  export type Options = {
    /** Whether to allow using bitwise expressions in enum initializers. */
    readonly allowBitwiseExpressions?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
   *       "ignoreMixedLogicalExpressions": {
   *         "type": "boolean",
   *         "description": "Whether to ignore any logical or expressions that are part of a mixed logical expression (with `&&`)."
   *       },
   *       "ignorePrimitives": {
   *         "description": "Whether to ignore all (`true`) or some (an object with properties) primitive types.",
   *         "oneOf": [
   *           {
   *             "type": "object",
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
  export type Options = {
    /**
     * Unless this is set to `true`, the rule will error on every file whose
     * `tsconfig.json` does _not_ have the `strictNullChecks` compiler option
     * (or `strict`) set to `true`.
     */
    readonly allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
    /** Whether to ignore arguments to the `Boolean` constructor */
    readonly ignoreBooleanCoercion?: boolean;
    /** Whether to ignore cases that are located within a conditional test. */
    readonly ignoreConditionalTests?: boolean;
    /**
     * Whether to ignore any logical or expressions that are part of a mixed
     * logical expression (with `&&`).
     */
    readonly ignoreMixedLogicalExpressions?: boolean;
    /**
     * Whether to ignore all (`true`) or some (an object with properties)
     * primitive types.
     */
    readonly ignorePrimitives?:
      | true
      | {
          /** Ignore bigint primitive types. */
          readonly bigint?: boolean;
          /** Ignore boolean primitive types. */
          readonly boolean?: boolean;
          /** Ignore number primitive types. */
          readonly number?: boolean;
          /** Ignore string primitive types. */
          readonly string?: boolean;
          readonly [k: string]: unknown;
        };
    /**
     * Whether to ignore any ternary expressions that could be simplified by
     * using the nullish coalescing operator.
     */
    readonly ignoreTernaryTests?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /**
     * Allow autofixers that will change the return type of the expression. This
     * option is considered unsafe as it may break the build.
     */
    readonly allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing?: boolean;
    /**
     * Check operands that are typed as `any` when inspecting "loose boolean"
     * operands.
     */
    readonly checkAny?: boolean;
    /**
     * Check operands that are typed as `bigint` when inspecting "loose boolean"
     * operands.
     */
    readonly checkBigInt?: boolean;
    /**
     * Check operands that are typed as `boolean` when inspecting "loose
     * boolean" operands.
     */
    readonly checkBoolean?: boolean;
    /**
     * Check operands that are typed as `number` when inspecting "loose boolean"
     * operands.
     */
    readonly checkNumber?: boolean;
    /**
     * Check operands that are typed as `string` when inspecting "loose boolean"
     * operands.
     */
    readonly checkString?: boolean;
    /**
     * Check operands that are typed as `unknown` when inspecting "loose
     * boolean" operands.
     */
    readonly checkUnknown?: boolean;
    /**
     * Skip operands that are not typed with `null` and/or `undefined` when
     * inspecting "loose boolean" operands.
     */
    readonly requireNullish?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /** Whether to allow calls to `Promise.reject()` with no arguments. */
    readonly allowEmptyReject?: boolean;
    /** Whether to always allow throwing values typed as `any`. */
    readonly allowThrowingAny?: boolean;
    /** Whether to always allow throwing values typed as `unknown`. */
    readonly allowThrowingUnknown?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /**
     * Whether to restrict checking only to members immediately assigned a
     * lambda value.
     */
    readonly onlyInlineLambdas?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /** An array of type specifiers to ignore. */
    readonly allow?: readonly (
      | string
      | {
          readonly from: 'file';
          readonly name: string | readonly [string, ...(readonly string[])];
          readonly path?: string;
        }
      | {
          readonly from: 'lib';
          readonly name: string | readonly [string, ...(readonly string[])];
        }
      | {
          readonly from: 'package';
          readonly name: string | readonly [string, ...(readonly string[])];
          readonly package: string;
        }
    )[];
    /** Whether to check class parameter properties. */
    readonly checkParameterProperties?: boolean;
    /** Whether to ignore parameters which don't explicitly specify a type. */
    readonly ignoreInferredTypes?: boolean;
    /** Whether to treat all mutable methods as though they are readonly. */
    readonly treatMethodsAsReadonly?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /**
     * Whether to allow equality checks against the first or last element of a
     * string.
     */
    readonly allowSingleElementEquality?: 'always' | 'never';
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /** Whether to consider `any` and `unknown` to be Promises. */
    readonly allowAny?: boolean;
    /** Any extra names of classes or interfaces to be considered Promises. */
    readonly allowedPromiseNames?: readonly string[];
    /** Whether to check arrow functions. */
    readonly checkArrowFunctions?: boolean;
    /** Whether to check standalone function declarations. */
    readonly checkFunctionDeclarations?: boolean;
    /** Whether to check inline function expressions */
    readonly checkFunctionExpressions?: boolean;
    /** Whether to check methods on classes and object literals. */
    readonly checkMethodDeclarations?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /** Whether to ignore arrays in which all elements are strings. */
    readonly ignoreStringArrays?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
 *  | key                  | value           |
 *  | :------------------- | :-------------- |
 *  | type                 | problem         |
 *  | recommended          | [object Object] |
 *  | requiresTypeChecking | true            |
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
  export type Options = {
    /** Whether to allow `any` typed values. */
    readonly allowAny?: boolean;
    /** Whether to allow `boolean` typed values. */
    readonly allowBoolean?: boolean;
    /** Whether to allow potentially `null` or `undefined` typed values. */
    readonly allowNullish?: boolean;
    /**
     * Whether to allow `bigint`/`number` typed values and `string` typed values
     * to be added together.
     */
    readonly allowNumberAndString?: boolean;
    /** Whether to allow `regexp` typed values. */
    readonly allowRegExp?: boolean;
    /** Whether to skip compound assignments such as `+=`. */
    readonly skipCompoundAssignments?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce template literal expressions to be of `string` type
 *
 * @link https://typescript-eslint.io/rules/restrict-template-expressions
 *
 *  ```md
 *  | key                  | value           |
 *  | :------------------- | :-------------- |
 *  | type                 | problem         |
 *  | recommended          | [object Object] |
 *  | requiresTypeChecking | true            |
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
  export type Options = {
    /** Whether to allow `any` typed values in template expressions. */
    readonly allowAny?: boolean;
    /** Whether to allow `array` typed values in template expressions. */
    readonly allowArray?: boolean;
    /** Whether to allow `boolean` typed values in template expressions. */
    readonly allowBoolean?: boolean;
    /** Whether to allow `nullish` typed values in template expressions. */
    readonly allowNullish?: boolean;
    /** Whether to allow `number` typed values in template expressions. */
    readonly allowNumber?: boolean;
    /** Whether to allow `regexp` typed values in template expressions. */
    readonly allowRegExp?: boolean;
    /** Whether to allow `never` typed values in template expressions. */
    readonly allowNever?: boolean;
    /** Types to allow in template expressions. */
    readonly allow?: readonly (
      | string
      | {
          readonly from: 'file';
          readonly name: string | readonly [string, ...(readonly string[])];
          readonly path?: string;
        }
      | {
          readonly from: 'lib';
          readonly name: string | readonly [string, ...(readonly string[])];
        }
      | {
          readonly from: 'package';
          readonly name: string | readonly [string, ...(readonly string[])];
          readonly package: string;
        }
    )[];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce consistent awaiting of returned promises
 *
 * @link https://typescript-eslint.io/rules/return-await
 *
 *  ```md
 *  | key                  | value           |
 *  | :------------------- | :-------------- |
 *  | type                 | problem         |
 *  | fixable              | code            |
 *  | hasSuggestions       | true            |
 *  | recommended          | [object Object] |
 *  | requiresTypeChecking | true            |
 *  ```
 */
namespace ReturnAwait {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /** Whether to allow `any`s in a boolean context. */
    readonly allowAny?: boolean;
    /** Whether to allow nullable `boolean`s in a boolean context. */
    readonly allowNullableBoolean?: boolean;
    /** Whether to allow nullable `enum`s in a boolean context. */
    readonly allowNullableEnum?: boolean;
    /** Whether to allow nullable `number`s in a boolean context. */
    readonly allowNullableNumber?: boolean;
    /**
     * Whether to allow nullable `object`s, `symbol`s, and functions in a
     * boolean context.
     */
    readonly allowNullableObject?: boolean;
    /** Whether to allow nullable `string`s in a boolean context. */
    readonly allowNullableString?: boolean;
    /** Whether to allow `number`s in a boolean context. */
    readonly allowNumber?: boolean;
    /**
     * Unless this is set to `true`, the rule will error on every file whose
     * `tsconfig.json` does _not_ have the `strictNullChecks` compiler option
     * (or `strict`) set to `true`.
     */
    readonly allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
    /** Whether to allow `string`s in a boolean context. */
    readonly allowString?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /**
     * If 'true', allow 'default' cases on switch statements with exhaustive
     * cases.
     */
    readonly allowDefaultCaseForExhaustiveSwitch?: boolean;
    /**
     * If 'true', the 'default' clause is used to determine whether the switch
     * statement is exhaustive for union type
     */
    readonly considerDefaultExhaustiveForUnions?: boolean;
    /**
     * Regular expression for a comment that can indicate an intentionally
     * omitted default case.
     */
    readonly defaultCaseCommentPattern?: string;
    /** If 'true', require a 'default' clause for switches on non-union types. */
    readonly requireDefaultForNonUnion?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /** What to enforce for `/// <reference lib="..." />` references. */
    readonly lib?: 'always' | 'never';
    /** What to enforce for `/// <reference path="..." />` references. */
    readonly path?: 'always' | 'never';
    /** What to enforce for `/// <reference types="..." />` references. */
    readonly types?: 'always' | 'never' | 'prefer-import';
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require type annotations in certain places
 *
 * @link https://typescript-eslint.io/rules/typedef
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
  export type Options = {
    /**
     * Whether to enforce type annotations on variables declared using array
     * destructuring.
     */
    readonly arrayDestructuring?: boolean;
    /** Whether to enforce type annotations for parameters of arrow functions. */
    readonly arrowParameter?: boolean;
    /** Whether to enforce type annotations on member variables of classes. */
    readonly memberVariableDeclaration?: boolean;
    /**
     * Whether to enforce type annotations on variables declared using object
     * destructuring.
     */
    readonly objectDestructuring?: boolean;
    /**
     * Whether to enforce type annotations for parameters of functions and
     * methods.
     */
    readonly parameter?: boolean;
    /**
     * Whether to enforce type annotations for properties of interfaces and
     * types.
     */
    readonly propertyDeclaration?: boolean;
    /**
     * Whether to enforce type annotations for variable declarations, excluding
     * array and object destructuring.
     */
    readonly variableDeclaration?: boolean;
    /**
     * Whether to ignore variable declarations for non-arrow and arrow
     * functions.
     */
    readonly variableDeclarationIgnoreFunction?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    /** Whether to skip checking whether `static` methods are correctly bound. */
    readonly ignoreStatic?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * Whether two parameters with different names at the same index should be
     * considered different even if their types are the same.
     */
    readonly ignoreDifferentlyNamedParameters?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
 *  | fixable              | code       |
 *  | hasSuggestions       | true       |
 *  | recommended          | strict     |
 *  | requiresTypeChecking | true       |
 *  ```
 */
namespace UseUnknownInCatchCallbackVariable {
  export type RuleEntry = Linter.StringSeverity;
}

export type TypeScriptEslintRules = {
  readonly '@typescript-eslint/adjacent-overload-signatures': AdjacentOverloadSignatures.RuleEntry;
  readonly '@typescript-eslint/array-type': ArrayType.RuleEntry;
  readonly '@typescript-eslint/await-thenable': AwaitThenable.RuleEntry;
  readonly '@typescript-eslint/ban-ts-comment': BanTsComment.RuleEntry;
  readonly '@typescript-eslint/ban-tslint-comment': BanTslintComment.RuleEntry;
  readonly '@typescript-eslint/class-literal-property-style': ClassLiteralPropertyStyle.RuleEntry;
  readonly '@typescript-eslint/class-methods-use-this': ClassMethodsUseThis.RuleEntry;
  readonly '@typescript-eslint/consistent-generic-constructors': ConsistentGenericConstructors.RuleEntry;
  readonly '@typescript-eslint/consistent-indexed-object-style': ConsistentIndexedObjectStyle.RuleEntry;
  readonly '@typescript-eslint/consistent-return': ConsistentReturn.RuleEntry;
  readonly '@typescript-eslint/consistent-type-assertions': ConsistentTypeAssertions.RuleEntry;
  readonly '@typescript-eslint/consistent-type-definitions': ConsistentTypeDefinitions.RuleEntry;
  readonly '@typescript-eslint/consistent-type-exports': ConsistentTypeExports.RuleEntry;
  readonly '@typescript-eslint/consistent-type-imports': ConsistentTypeImports.RuleEntry;
  readonly '@typescript-eslint/default-param-last': DefaultParamLast.RuleEntry;
  readonly '@typescript-eslint/dot-notation': DotNotation.RuleEntry;
  readonly '@typescript-eslint/explicit-function-return-type': ExplicitFunctionReturnType.RuleEntry;
  readonly '@typescript-eslint/explicit-member-accessibility': ExplicitMemberAccessibility.RuleEntry;
  readonly '@typescript-eslint/explicit-module-boundary-types': ExplicitModuleBoundaryTypes.RuleEntry;
  readonly '@typescript-eslint/init-declarations': InitDeclarations.RuleEntry;
  readonly '@typescript-eslint/max-params': MaxParams.RuleEntry;
  readonly '@typescript-eslint/member-ordering': MemberOrdering.RuleEntry;
  readonly '@typescript-eslint/method-signature-style': MethodSignatureStyle.RuleEntry;
  readonly '@typescript-eslint/naming-convention': NamingConvention.RuleEntry;
  readonly '@typescript-eslint/no-array-constructor': NoArrayConstructor.RuleEntry;
  readonly '@typescript-eslint/no-array-delete': NoArrayDelete.RuleEntry;
  readonly '@typescript-eslint/no-base-to-string': NoBaseToString.RuleEntry;
  readonly '@typescript-eslint/no-confusing-non-null-assertion': NoConfusingNonNullAssertion.RuleEntry;
  readonly '@typescript-eslint/no-confusing-void-expression': NoConfusingVoidExpression.RuleEntry;
  readonly '@typescript-eslint/no-deprecated': NoDeprecated.RuleEntry;
  readonly '@typescript-eslint/no-dupe-class-members': NoDupeClassMembers.RuleEntry;
  readonly '@typescript-eslint/no-duplicate-enum-values': NoDuplicateEnumValues.RuleEntry;
  readonly '@typescript-eslint/no-duplicate-type-constituents': NoDuplicateTypeConstituents.RuleEntry;
  readonly '@typescript-eslint/no-dynamic-delete': NoDynamicDelete.RuleEntry;
  readonly '@typescript-eslint/no-empty-function': NoEmptyFunction.RuleEntry;
  readonly '@typescript-eslint/no-empty-object-type': NoEmptyObjectType.RuleEntry;
  readonly '@typescript-eslint/no-explicit-any': NoExplicitAny.RuleEntry;
  readonly '@typescript-eslint/no-extra-non-null-assertion': NoExtraNonNullAssertion.RuleEntry;
  readonly '@typescript-eslint/no-extraneous-class': NoExtraneousClass.RuleEntry;
  readonly '@typescript-eslint/no-floating-promises': NoFloatingPromises.RuleEntry;
  readonly '@typescript-eslint/no-for-in-array': NoForInArray.RuleEntry;
  readonly '@typescript-eslint/no-implied-eval': NoImpliedEval.RuleEntry;
  readonly '@typescript-eslint/no-import-type-side-effects': NoImportTypeSideEffects.RuleEntry;
  readonly '@typescript-eslint/no-inferrable-types': NoInferrableTypes.RuleEntry;
  readonly '@typescript-eslint/no-invalid-this': NoInvalidThis.RuleEntry;
  readonly '@typescript-eslint/no-invalid-void-type': NoInvalidVoidType.RuleEntry;
  readonly '@typescript-eslint/no-loop-func': NoLoopFunc.RuleEntry;
  readonly '@typescript-eslint/no-magic-numbers': NoMagicNumbers.RuleEntry;
  readonly '@typescript-eslint/no-meaningless-void-operator': NoMeaninglessVoidOperator.RuleEntry;
  readonly '@typescript-eslint/no-misused-new': NoMisusedNew.RuleEntry;
  readonly '@typescript-eslint/no-misused-promises': NoMisusedPromises.RuleEntry;
  readonly '@typescript-eslint/no-misused-spread': NoMisusedSpread.RuleEntry;
  readonly '@typescript-eslint/no-mixed-enums': NoMixedEnums.RuleEntry;
  readonly '@typescript-eslint/no-namespace': NoNamespace.RuleEntry;
  readonly '@typescript-eslint/no-non-null-asserted-nullish-coalescing': NoNonNullAssertedNullishCoalescing.RuleEntry;
  readonly '@typescript-eslint/no-non-null-asserted-optional-chain': NoNonNullAssertedOptionalChain.RuleEntry;
  readonly '@typescript-eslint/no-non-null-assertion': NoNonNullAssertion.RuleEntry;
  readonly '@typescript-eslint/no-redeclare': NoRedeclare.RuleEntry;
  readonly '@typescript-eslint/no-redundant-type-constituents': NoRedundantTypeConstituents.RuleEntry;
  readonly '@typescript-eslint/no-require-imports': NoRequireImports.RuleEntry;
  readonly '@typescript-eslint/no-restricted-imports': NoRestrictedImports.RuleEntry;
  readonly '@typescript-eslint/no-restricted-types': NoRestrictedTypes.RuleEntry;
  readonly '@typescript-eslint/no-shadow': NoShadow.RuleEntry;
  readonly '@typescript-eslint/no-this-alias': NoThisAlias.RuleEntry;
  readonly '@typescript-eslint/no-unnecessary-boolean-literal-compare': NoUnnecessaryBooleanLiteralCompare.RuleEntry;
  readonly '@typescript-eslint/no-unnecessary-condition': NoUnnecessaryCondition.RuleEntry;
  readonly '@typescript-eslint/no-unnecessary-parameter-property-assignment': NoUnnecessaryParameterPropertyAssignment.RuleEntry;
  readonly '@typescript-eslint/no-unnecessary-qualifier': NoUnnecessaryQualifier.RuleEntry;
  readonly '@typescript-eslint/no-unnecessary-template-expression': NoUnnecessaryTemplateExpression.RuleEntry;
  readonly '@typescript-eslint/no-unnecessary-type-arguments': NoUnnecessaryTypeArguments.RuleEntry;
  readonly '@typescript-eslint/no-unnecessary-type-assertion': NoUnnecessaryTypeAssertion.RuleEntry;
  readonly '@typescript-eslint/no-unnecessary-type-constraint': NoUnnecessaryTypeConstraint.RuleEntry;
  readonly '@typescript-eslint/no-unnecessary-type-parameters': NoUnnecessaryTypeParameters.RuleEntry;
  readonly '@typescript-eslint/no-unsafe-argument': NoUnsafeArgument.RuleEntry;
  readonly '@typescript-eslint/no-unsafe-assignment': NoUnsafeAssignment.RuleEntry;
  readonly '@typescript-eslint/no-unsafe-call': NoUnsafeCall.RuleEntry;
  readonly '@typescript-eslint/no-unsafe-declaration-merging': NoUnsafeDeclarationMerging.RuleEntry;
  readonly '@typescript-eslint/no-unsafe-enum-comparison': NoUnsafeEnumComparison.RuleEntry;
  readonly '@typescript-eslint/no-unsafe-function-type': NoUnsafeFunctionType.RuleEntry;
  readonly '@typescript-eslint/no-unsafe-member-access': NoUnsafeMemberAccess.RuleEntry;
  readonly '@typescript-eslint/no-unsafe-return': NoUnsafeReturn.RuleEntry;
  readonly '@typescript-eslint/no-unsafe-type-assertion': NoUnsafeTypeAssertion.RuleEntry;
  readonly '@typescript-eslint/no-unsafe-unary-minus': NoUnsafeUnaryMinus.RuleEntry;
  readonly '@typescript-eslint/no-unused-expressions': NoUnusedExpressions.RuleEntry;
  readonly '@typescript-eslint/no-unused-vars': NoUnusedVars.RuleEntry;
  readonly '@typescript-eslint/no-use-before-define': NoUseBeforeDefine.RuleEntry;
  readonly '@typescript-eslint/no-useless-constructor': NoUselessConstructor.RuleEntry;
  readonly '@typescript-eslint/no-useless-empty-export': NoUselessEmptyExport.RuleEntry;
  readonly '@typescript-eslint/no-wrapper-object-types': NoWrapperObjectTypes.RuleEntry;
  readonly '@typescript-eslint/non-nullable-type-assertion-style': NonNullableTypeAssertionStyle.RuleEntry;
  readonly '@typescript-eslint/only-throw-error': OnlyThrowError.RuleEntry;
  readonly '@typescript-eslint/parameter-properties': ParameterProperties.RuleEntry;
  readonly '@typescript-eslint/prefer-as-const': PreferAsConst.RuleEntry;
  readonly '@typescript-eslint/prefer-destructuring': PreferDestructuring.RuleEntry;
  readonly '@typescript-eslint/prefer-enum-initializers': PreferEnumInitializers.RuleEntry;
  readonly '@typescript-eslint/prefer-find': PreferFind.RuleEntry;
  readonly '@typescript-eslint/prefer-for-of': PreferForOf.RuleEntry;
  readonly '@typescript-eslint/prefer-function-type': PreferFunctionType.RuleEntry;
  readonly '@typescript-eslint/prefer-includes': PreferIncludes.RuleEntry;
  readonly '@typescript-eslint/prefer-literal-enum-member': PreferLiteralEnumMember.RuleEntry;
  readonly '@typescript-eslint/prefer-namespace-keyword': PreferNamespaceKeyword.RuleEntry;
  readonly '@typescript-eslint/prefer-nullish-coalescing': PreferNullishCoalescing.RuleEntry;
  readonly '@typescript-eslint/prefer-optional-chain': PreferOptionalChain.RuleEntry;
  readonly '@typescript-eslint/prefer-promise-reject-errors': PreferPromiseRejectErrors.RuleEntry;
  readonly '@typescript-eslint/prefer-readonly': PreferReadonly.RuleEntry;
  readonly '@typescript-eslint/prefer-readonly-parameter-types': PreferReadonlyParameterTypes.RuleEntry;
  readonly '@typescript-eslint/prefer-reduce-type-parameter': PreferReduceTypeParameter.RuleEntry;
  readonly '@typescript-eslint/prefer-regexp-exec': PreferRegexpExec.RuleEntry;
  readonly '@typescript-eslint/prefer-return-this-type': PreferReturnThisType.RuleEntry;
  readonly '@typescript-eslint/prefer-string-starts-ends-with': PreferStringStartsEndsWith.RuleEntry;
  readonly '@typescript-eslint/promise-function-async': PromiseFunctionAsync.RuleEntry;
  readonly '@typescript-eslint/related-getter-setter-pairs': RelatedGetterSetterPairs.RuleEntry;
  readonly '@typescript-eslint/require-array-sort-compare': RequireArraySortCompare.RuleEntry;
  readonly '@typescript-eslint/require-await': RequireAwait.RuleEntry;
  readonly '@typescript-eslint/restrict-plus-operands': RestrictPlusOperands.RuleEntry;
  readonly '@typescript-eslint/restrict-template-expressions': RestrictTemplateExpressions.RuleEntry;
  readonly '@typescript-eslint/return-await': ReturnAwait.RuleEntry;
  readonly '@typescript-eslint/strict-boolean-expressions': StrictBooleanExpressions.RuleEntry;
  readonly '@typescript-eslint/switch-exhaustiveness-check': SwitchExhaustivenessCheck.RuleEntry;
  readonly '@typescript-eslint/triple-slash-reference': TripleSlashReference.RuleEntry;
  readonly '@typescript-eslint/typedef': Typedef.RuleEntry;
  readonly '@typescript-eslint/unbound-method': UnboundMethod.RuleEntry;
  readonly '@typescript-eslint/unified-signatures': UnifiedSignatures.RuleEntry;
  readonly '@typescript-eslint/use-unknown-in-catch-callback-variable': UseUnknownInCatchCallbackVariable.RuleEntry;

  // deprecated
  readonly '@typescript-eslint/no-empty-interface': NoEmptyInterface.RuleEntry;
  readonly '@typescript-eslint/no-loss-of-precision': NoLossOfPrecision.RuleEntry;
  readonly '@typescript-eslint/no-type-alias': NoTypeAlias.RuleEntry;
  readonly '@typescript-eslint/no-var-requires': NoVarRequires.RuleEntry;
  readonly '@typescript-eslint/prefer-ts-expect-error': PreferTsExpectError.RuleEntry;
  readonly '@typescript-eslint/sort-type-constituents': SortTypeConstituents.RuleEntry;
};

export type TypeScriptEslintRulesOption = {
  readonly '@typescript-eslint/array-type': ArrayType.Options;
  readonly '@typescript-eslint/ban-ts-comment': BanTsComment.Options;
  readonly '@typescript-eslint/class-literal-property-style': ClassLiteralPropertyStyle.Options;
  readonly '@typescript-eslint/class-methods-use-this': ClassMethodsUseThis.Options;
  readonly '@typescript-eslint/consistent-generic-constructors': ConsistentGenericConstructors.Options;
  readonly '@typescript-eslint/consistent-indexed-object-style': ConsistentIndexedObjectStyle.Options;
  readonly '@typescript-eslint/consistent-return': ConsistentReturn.Options;
  readonly '@typescript-eslint/consistent-type-assertions': ConsistentTypeAssertions.Options;
  readonly '@typescript-eslint/consistent-type-definitions': ConsistentTypeDefinitions.Options;
  readonly '@typescript-eslint/consistent-type-exports': ConsistentTypeExports.Options;
  readonly '@typescript-eslint/consistent-type-imports': ConsistentTypeImports.Options;
  readonly '@typescript-eslint/dot-notation': DotNotation.Options;
  readonly '@typescript-eslint/explicit-function-return-type': ExplicitFunctionReturnType.Options;
  readonly '@typescript-eslint/explicit-member-accessibility': ExplicitMemberAccessibility.Options;
  readonly '@typescript-eslint/explicit-module-boundary-types': ExplicitModuleBoundaryTypes.Options;
  readonly '@typescript-eslint/init-declarations': InitDeclarations.Options;
  readonly '@typescript-eslint/max-params': MaxParams.Options;
  readonly '@typescript-eslint/member-ordering': MemberOrdering.Options;
  readonly '@typescript-eslint/method-signature-style': MethodSignatureStyle.Options;
  readonly '@typescript-eslint/naming-convention': NamingConvention.Options;
  readonly '@typescript-eslint/no-base-to-string': NoBaseToString.Options;
  readonly '@typescript-eslint/no-confusing-void-expression': NoConfusingVoidExpression.Options;
  readonly '@typescript-eslint/no-deprecated': NoDeprecated.Options;
  readonly '@typescript-eslint/no-duplicate-type-constituents': NoDuplicateTypeConstituents.Options;
  readonly '@typescript-eslint/no-empty-function': NoEmptyFunction.Options;
  readonly '@typescript-eslint/no-empty-object-type': NoEmptyObjectType.Options;
  readonly '@typescript-eslint/no-explicit-any': NoExplicitAny.Options;
  readonly '@typescript-eslint/no-extraneous-class': NoExtraneousClass.Options;
  readonly '@typescript-eslint/no-floating-promises': NoFloatingPromises.Options;
  readonly '@typescript-eslint/no-inferrable-types': NoInferrableTypes.Options;
  readonly '@typescript-eslint/no-invalid-this': NoInvalidThis.Options;
  readonly '@typescript-eslint/no-invalid-void-type': NoInvalidVoidType.Options;
  readonly '@typescript-eslint/no-magic-numbers': NoMagicNumbers.Options;
  readonly '@typescript-eslint/no-meaningless-void-operator': NoMeaninglessVoidOperator.Options;
  readonly '@typescript-eslint/no-misused-promises': NoMisusedPromises.Options;
  readonly '@typescript-eslint/no-misused-spread': NoMisusedSpread.Options;
  readonly '@typescript-eslint/no-namespace': NoNamespace.Options;
  readonly '@typescript-eslint/no-redeclare': NoRedeclare.Options;
  readonly '@typescript-eslint/no-require-imports': NoRequireImports.Options;
  readonly '@typescript-eslint/no-restricted-imports': NoRestrictedImports.Options;
  readonly '@typescript-eslint/no-restricted-types': NoRestrictedTypes.Options;
  readonly '@typescript-eslint/no-shadow': NoShadow.Options;
  readonly '@typescript-eslint/no-this-alias': NoThisAlias.Options;
  readonly '@typescript-eslint/no-unnecessary-boolean-literal-compare': NoUnnecessaryBooleanLiteralCompare.Options;
  readonly '@typescript-eslint/no-unnecessary-condition': NoUnnecessaryCondition.Options;
  readonly '@typescript-eslint/no-unnecessary-type-assertion': NoUnnecessaryTypeAssertion.Options;
  readonly '@typescript-eslint/no-unused-expressions': NoUnusedExpressions.Options;
  readonly '@typescript-eslint/no-unused-vars': NoUnusedVars.Options;
  readonly '@typescript-eslint/no-use-before-define': NoUseBeforeDefine.Options;
  readonly '@typescript-eslint/only-throw-error': OnlyThrowError.Options;
  readonly '@typescript-eslint/parameter-properties': ParameterProperties.Options;
  readonly '@typescript-eslint/prefer-destructuring': readonly [
    PreferDestructuring.Options0,
    PreferDestructuring.Options1,
  ];
  readonly '@typescript-eslint/prefer-literal-enum-member': PreferLiteralEnumMember.Options;
  readonly '@typescript-eslint/prefer-nullish-coalescing': PreferNullishCoalescing.Options;
  readonly '@typescript-eslint/prefer-optional-chain': PreferOptionalChain.Options;
  readonly '@typescript-eslint/prefer-promise-reject-errors': PreferPromiseRejectErrors.Options;
  readonly '@typescript-eslint/prefer-readonly': PreferReadonly.Options;
  readonly '@typescript-eslint/prefer-readonly-parameter-types': PreferReadonlyParameterTypes.Options;
  readonly '@typescript-eslint/prefer-string-starts-ends-with': PreferStringStartsEndsWith.Options;
  readonly '@typescript-eslint/promise-function-async': PromiseFunctionAsync.Options;
  readonly '@typescript-eslint/require-array-sort-compare': RequireArraySortCompare.Options;
  readonly '@typescript-eslint/restrict-plus-operands': RestrictPlusOperands.Options;
  readonly '@typescript-eslint/restrict-template-expressions': RestrictTemplateExpressions.Options;
  readonly '@typescript-eslint/return-await': ReturnAwait.Options;
  readonly '@typescript-eslint/strict-boolean-expressions': StrictBooleanExpressions.Options;
  readonly '@typescript-eslint/switch-exhaustiveness-check': SwitchExhaustivenessCheck.Options;
  readonly '@typescript-eslint/triple-slash-reference': TripleSlashReference.Options;
  readonly '@typescript-eslint/typedef': Typedef.Options;
  readonly '@typescript-eslint/unbound-method': UnboundMethod.Options;
  readonly '@typescript-eslint/unified-signatures': UnifiedSignatures.Options;
};
