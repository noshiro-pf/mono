/* cSpell:disable */
/* eslint-disable @typescript-eslint/sort-type-constituents */
import type { Linter } from 'eslint';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleLevel, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleLevel, ...T[1]] : T;

/**
 * @description Enforce functional parameters.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v4.4.1/docs/rules/functional-parameters.md
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | error      |
 */
namespace FunctionalParameters {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignorePattern": {
   *         "type": [
   *           "string",
   *           "array"
   *         ],
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "ignorePrefixSelector": {
   *         "type": [
   *           "string",
   *           "array"
   *         ],
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "allowRestParameter": {
   *         "type": "boolean"
   *       },
   *       "allowArgumentsKeyword": {
   *         "type": "boolean"
   *       },
   *       "enforceParameterCount": {
   *         "oneOf": [
   *           {
   *             "type": "boolean",
   *             "enum": [
   *               false
   *             ]
   *           },
   *           {
   *             "type": "string",
   *             "enum": [
   *               "atLeastOne",
   *               "exactlyOne"
   *             ]
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "count": {
   *                 "type": "string",
   *                 "enum": [
   *                   "atLeastOne",
   *                   "exactlyOne"
   *                 ]
   *               },
   *               "ignoreIIFE": {
   *                 "type": "boolean"
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
    readonly ignorePattern?: string | readonly string[];
    readonly ignorePrefixSelector?: string | readonly string[];
    readonly allowRestParameter?: boolean;
    readonly allowArgumentsKeyword?: boolean;
    readonly enforceParameterCount?:
      | false
      | ('atLeastOne' | 'exactlyOne')
      | {
          readonly count?: 'atLeastOne' | 'exactlyOne';
          readonly ignoreIIFE?: boolean;
        };
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce treating data as immutable.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v4.4.1/docs/rules/immutable-data.md
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | error      |
 */
namespace ImmutableData {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignorePattern": {
   *         "type": [
   *           "string",
   *           "array"
   *         ],
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "ignoreAccessorPattern": {
   *         "type": [
   *           "string",
   *           "array"
   *         ],
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "ignoreClass": {
   *         "oneOf": [
   *           {
   *             "type": "boolean"
   *           },
   *           {
   *             "type": "string",
   *             "enum": [
   *               "fieldsOnly"
   *             ]
   *           }
   *         ]
   *       },
   *       "ignoreImmediateMutation": {
   *         "type": "boolean"
   *       },
   *       "assumeTypes": {
   *         "oneOf": [
   *           {
   *             "type": "boolean"
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "forArrays": {
   *                 "type": "boolean"
   *               },
   *               "forObjects": {
   *                 "type": "boolean"
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
    readonly ignorePattern?: string | readonly string[];
    readonly ignoreAccessorPattern?: string | readonly string[];
    readonly ignoreClass?: boolean | 'fieldsOnly';
    readonly ignoreImmediateMutation?: boolean;
    readonly assumeTypes?:
      | boolean
      | {
          readonly forArrays?: boolean;
          readonly forObjects?: boolean;
        };
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow classes.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v4.4.1/docs/rules/no-class.md
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | error      |
 */
namespace NoClass {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow conditional statements.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v4.4.1/docs/rules/no-conditional-statement.md
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | error      |
 */
namespace NoConditionalStatement {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowReturningBranches": {
   *         "oneOf": [
   *           {
   *             "type": "boolean"
   *           },
   *           {
   *             "type": "string",
   *             "enum": [
   *               "ifExhaustive"
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
  export type Options = {
    readonly allowReturningBranches?: boolean | 'ifExhaustive';
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow expression statements.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v4.4.1/docs/rules/no-expression-statement.md
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | error      |
 */
namespace NoExpressionStatement {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignorePattern": {
   *         "type": [
   *           "string",
   *           "array"
   *         ],
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "ignoreVoid": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly ignorePattern?: string | readonly string[];
    readonly ignoreVoid?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow mutable variables.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v4.4.1/docs/rules/no-let.md
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | error      |
 */
namespace NoLet {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowLocalMutation": {
   *         "type": "boolean"
   *       },
   *       "ignorePattern": {
   *         "type": [
   *           "string",
   *           "array"
   *         ],
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "allowInForLoopInit": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowLocalMutation?: boolean;
    readonly ignorePattern?: string | readonly string[];
    readonly allowInForLoopInit?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow imperative loops.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v4.4.1/docs/rules/no-loop-statement.md
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | error      |
 */
namespace NoLoopStatement {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Prefer property signatures with readonly modifiers over method signatures.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v4.4.1/docs/rules/no-method-signature.md
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | warn       |
 */
namespace NoMethodSignature {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreIfReadonly": {
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
    readonly ignoreIfReadonly?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Restrict types so that only members of the same kind of are allowed in them.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v4.4.1/docs/rules/no-mixed-type.md
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | error      |
 */
namespace NoMixedType {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "checkInterfaces": {
   *         "type": "boolean"
   *       },
   *       "checkTypeLiterals": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly checkInterfaces?: boolean;
    readonly checkTypeLiterals?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow try-catch[-finally] and try-finally patterns.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v4.4.1/docs/rules/no-promise-reject.md
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | false      |
 */
namespace NoPromiseReject {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow functions that don't return anything.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v4.4.1/docs/rules/no-return-void.md
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | error      |
 */
namespace NoReturnVoid {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowNull": {
   *         "type": "boolean"
   *       },
   *       "allowUndefined": {
   *         "type": "boolean"
   *       },
   *       "ignoreImplicit": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowNull?: boolean;
    readonly allowUndefined?: boolean;
    readonly ignoreImplicit?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow this access.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v4.4.1/docs/rules/no-this-expression.md
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | error      |
 */
namespace NoThisExpression {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow throwing exceptions.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v4.4.1/docs/rules/no-throw-statement.md
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | error      |
 */
namespace NoThrowStatement {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowInAsyncFunctions": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowInAsyncFunctions?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow try-catch[-finally] and try-finally patterns.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v4.4.1/docs/rules/no-try-statement.md
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | recommended | error      |
 */
namespace NoTryStatement {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowCatch": {
   *         "type": "boolean"
   *       },
   *       "allowFinally": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowCatch?: boolean;
    readonly allowFinally?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Prefer readonly array over mutable arrays.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v4.4.1/docs/rules/prefer-readonly-type.md
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | error      |
 */
namespace PreferReadonlyType {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowLocalMutation": {
   *         "type": "boolean"
   *       },
   *       "ignorePattern": {
   *         "type": [
   *           "string",
   *           "array"
   *         ],
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "ignoreClass": {
   *         "oneOf": [
   *           {
   *             "type": "boolean"
   *           },
   *           {
   *             "type": "string",
   *             "enum": [
   *               "fieldsOnly"
   *             ]
   *           }
   *         ]
   *       },
   *       "ignoreInterface": {
   *         "type": "boolean"
   *       },
   *       "allowMutableReturnType": {
   *         "type": "boolean"
   *       },
   *       "checkImplicit": {
   *         "type": "boolean"
   *       },
   *       "ignoreCollections": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly allowLocalMutation?: boolean;
    readonly ignorePattern?: string | readonly string[];
    readonly ignoreClass?: boolean | 'fieldsOnly';
    readonly ignoreInterface?: boolean;
    readonly allowMutableReturnType?: boolean;
    readonly checkImplicit?: boolean;
    readonly ignoreCollections?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Replaces `x => f(x)` with just `f`.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v4.4.1/docs/rules/prefer-tacit.md
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | recommended | false      |
 */
namespace PreferTacit {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignorePattern": {
   *         "type": [
   *           "string",
   *           "array"
   *         ],
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "ignoreImmediateMutation": {
   *         "type": "boolean"
   *       },
   *       "assumeTypes": {
   *         "oneOf": [
   *           {
   *             "type": "boolean",
   *             "enum": [
   *               false
   *             ]
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "allowFixer": {
   *                 "type": "boolean"
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
    readonly ignorePattern?: string | readonly string[];
    readonly ignoreImmediateMutation?: boolean;
    readonly assumeTypes?:
      | false
      | {
          readonly allowFixer?: boolean;
        };
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

export type EslintFunctionalRules = {
  readonly 'functional/functional-parameters': FunctionalParameters.RuleEntry;
  readonly 'functional/immutable-data': ImmutableData.RuleEntry;
  readonly 'functional/no-class': NoClass.RuleEntry;
  readonly 'functional/no-conditional-statement': NoConditionalStatement.RuleEntry;
  readonly 'functional/no-expression-statement': NoExpressionStatement.RuleEntry;
  readonly 'functional/no-let': NoLet.RuleEntry;
  readonly 'functional/no-loop-statement': NoLoopStatement.RuleEntry;
  readonly 'functional/no-method-signature': NoMethodSignature.RuleEntry;
  readonly 'functional/no-mixed-type': NoMixedType.RuleEntry;
  readonly 'functional/no-promise-reject': NoPromiseReject.RuleEntry;
  readonly 'functional/no-return-void': NoReturnVoid.RuleEntry;
  readonly 'functional/no-this-expression': NoThisExpression.RuleEntry;
  readonly 'functional/no-throw-statement': NoThrowStatement.RuleEntry;
  readonly 'functional/no-try-statement': NoTryStatement.RuleEntry;
  readonly 'functional/prefer-readonly-type': PreferReadonlyType.RuleEntry;
  readonly 'functional/prefer-tacit': PreferTacit.RuleEntry;
};
