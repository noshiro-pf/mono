/* cSpell:disable */
/* eslint-disable @typescript-eslint/sort-type-constituents */
import { type Linter } from 'eslint';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleLevel, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleLevel, ...T[1]] : T;

/**
 * @description Enforce functional parameters.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v5.0.6/docs/rules/functional-parameters.md
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | category    | Currying   |
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
   *               "ignoreLambdaExpression": {
   *                 "type": "boolean"
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
          readonly ignoreLambdaExpression?: boolean;
          readonly ignoreIIFE?: boolean;
        };
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce treating data as immutable.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v5.0.6/docs/rules/immutable-data.md
 *
 *  | key         | value        |
 *  | :---------- | :----------- |
 *  | type        | suggestion   |
 *  | category    | No Mutations |
 *  | recommended | error        |
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
   *       "ignoreClasses": {
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
    readonly ignoreClasses?: boolean | 'fieldsOnly';
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
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v5.0.6/docs/rules/no-classes.md
 *
 *  | key         | value              |
 *  | :---------- | :----------------- |
 *  | type        | suggestion         |
 *  | category    | No Other Paradigms |
 *  | recommended | error              |
 */
namespace NoClasses {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow conditional statements.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v5.0.6/docs/rules/no-conditional-statements.md
 *
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | category    | No Statements |
 *  | recommended | error         |
 */
namespace NoConditionalStatements {
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
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v5.0.6/docs/rules/no-expression-statements.md
 *
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | category    | No Statements |
 *  | recommended | strict        |
 */
namespace NoExpressionStatements {
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
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v5.0.6/docs/rules/no-let.md
 *
 *  | key         | value        |
 *  | :---------- | :----------- |
 *  | type        | suggestion   |
 *  | category    | No Mutations |
 *  | recommended | error        |
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
   *       },
   *       "allowInFunctions": {
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
    readonly allowInForLoopInit?: boolean;
    readonly allowInFunctions?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow imperative loops.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v5.0.6/docs/rules/no-loop-statements.md
 *
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | category    | No Statements |
 *  | recommended | error         |
 */
namespace NoLoopStatements {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Restrict types so that only members of the same kind are allowed in them.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v5.0.6/docs/rules/no-mixed-types.md
 *
 *  | key         | value              |
 *  | :---------- | :----------------- |
 *  | type        | suggestion         |
 *  | category    | No Other Paradigms |
 *  | recommended | error              |
 */
namespace NoMixedTypes {
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
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v5.0.6/docs/rules/no-promise-reject.md
 *
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | category    | No Exceptions |
 *  | recommended | false         |
 */
namespace NoPromiseReject {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow functions that don't return anything.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v5.0.6/docs/rules/no-return-void.md
 *
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | category    | No Statements |
 *  | recommended | error         |
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
   *       "ignoreInferredTypes": {
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
    readonly ignoreInferredTypes?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow this access.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v5.0.6/docs/rules/no-this-expressions.md
 *
 *  | key         | value              |
 *  | :---------- | :----------------- |
 *  | type        | suggestion         |
 *  | category    | No Other Paradigms |
 *  | recommended | strict             |
 */
namespace NoThisExpressions {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Disallow throwing exceptions.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v5.0.6/docs/rules/no-throw-statements.md
 *
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | category    | No Exceptions |
 *  | recommended | error         |
 */
namespace NoThrowStatements {
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
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v5.0.6/docs/rules/no-try-statements.md
 *
 *  | key         | value         |
 *  | :---------- | :------------ |
 *  | type        | suggestion    |
 *  | category    | No Exceptions |
 *  | recommended | strict        |
 */
namespace NoTryStatements {
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
 * @description Require function parameters to be typed as certain immutability
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v5.0.6/docs/rules/prefer-immutable-types.md
 *
 *  | key         | value        |
 *  | :---------- | :----------- |
 *  | type        | suggestion   |
 *  | fixable     | code         |
 *  | category    | No Mutations |
 *  | recommended | error        |
 */
namespace PreferImmutableTypes {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreClasses": {
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
   *       "enforcement": {
   *         "type": [
   *           "string",
   *           "number",
   *           "boolean"
   *         ],
   *         "enum": [
   *           "ReadonlyShallow",
   *           "ReadonlyDeep",
   *           "Immutable",
   *           null,
   *           3,
   *           4,
   *           5,
   *           "None",
   *           false
   *         ]
   *       },
   *       "ignoreInferredTypes": {
   *         "type": "boolean"
   *       },
   *       "ignoreNamePattern": {
   *         "type": [
   *           "string",
   *           "array"
   *         ],
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "ignoreTypePattern": {
   *         "type": [
   *           "string",
   *           "array"
   *         ],
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "parameters": {
   *         "oneOf": [
   *           {
   *             "type": "object",
   *             "properties": {
   *               "ignoreClasses": {
   *                 "oneOf": [
   *                   {
   *                     "type": "boolean"
   *                   },
   *                   {
   *                     "type": "string",
   *                     "enum": [
   *                       "fieldsOnly"
   *                     ]
   *                   }
   *                 ]
   *               },
   *               "enforcement": {
   *                 "type": [
   *                   "string",
   *                   "number",
   *                   "boolean"
   *                 ],
   *                 "enum": [
   *                   "ReadonlyShallow",
   *                   "ReadonlyDeep",
   *                   "Immutable",
   *                   null,
   *                   3,
   *                   4,
   *                   5,
   *                   "None",
   *                   false
   *                 ]
   *               },
   *               "ignoreInferredTypes": {
   *                 "type": "boolean"
   *               },
   *               "ignoreNamePattern": {
   *                 "type": [
   *                   "string",
   *                   "array"
   *                 ],
   *                 "items": {
   *                   "type": "string"
   *                 }
   *               },
   *               "ignoreTypePattern": {
   *                 "type": [
   *                   "string",
   *                   "array"
   *                 ],
   *                 "items": {
   *                   "type": "string"
   *                 }
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           {
   *             "type": [
   *               "string",
   *               "number",
   *               "boolean"
   *             ],
   *             "enum": [
   *               "ReadonlyShallow",
   *               "ReadonlyDeep",
   *               "Immutable",
   *               null,
   *               3,
   *               4,
   *               5,
   *               "None",
   *               false
   *             ]
   *           }
   *         ]
   *       },
   *       "returnTypes": {
   *         "oneOf": [
   *           {
   *             "type": "object",
   *             "properties": {
   *               "ignoreClasses": {
   *                 "oneOf": [
   *                   {
   *                     "type": "boolean"
   *                   },
   *                   {
   *                     "type": "string",
   *                     "enum": [
   *                       "fieldsOnly"
   *                     ]
   *                   }
   *                 ]
   *               },
   *               "enforcement": {
   *                 "type": [
   *                   "string",
   *                   "number",
   *                   "boolean"
   *                 ],
   *                 "enum": [
   *                   "ReadonlyShallow",
   *                   "ReadonlyDeep",
   *                   "Immutable",
   *                   null,
   *                   3,
   *                   4,
   *                   5,
   *                   "None",
   *                   false
   *                 ]
   *               },
   *               "ignoreInferredTypes": {
   *                 "type": "boolean"
   *               },
   *               "ignoreNamePattern": {
   *                 "type": [
   *                   "string",
   *                   "array"
   *                 ],
   *                 "items": {
   *                   "type": "string"
   *                 }
   *               },
   *               "ignoreTypePattern": {
   *                 "type": [
   *                   "string",
   *                   "array"
   *                 ],
   *                 "items": {
   *                   "type": "string"
   *                 }
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           {
   *             "type": [
   *               "string",
   *               "number",
   *               "boolean"
   *             ],
   *             "enum": [
   *               "ReadonlyShallow",
   *               "ReadonlyDeep",
   *               "Immutable",
   *               null,
   *               3,
   *               4,
   *               5,
   *               "None",
   *               false
   *             ]
   *           }
   *         ]
   *       },
   *       "variables": {
   *         "oneOf": [
   *           {
   *             "type": "object",
   *             "properties": {
   *               "ignoreClasses": {
   *                 "oneOf": [
   *                   {
   *                     "type": "boolean"
   *                   },
   *                   {
   *                     "type": "string",
   *                     "enum": [
   *                       "fieldsOnly"
   *                     ]
   *                   }
   *                 ]
   *               },
   *               "enforcement": {
   *                 "type": [
   *                   "string",
   *                   "number",
   *                   "boolean"
   *                 ],
   *                 "enum": [
   *                   "ReadonlyShallow",
   *                   "ReadonlyDeep",
   *                   "Immutable",
   *                   null,
   *                   3,
   *                   4,
   *                   5,
   *                   "None",
   *                   false
   *                 ]
   *               },
   *               "ignoreInferredTypes": {
   *                 "type": "boolean"
   *               },
   *               "ignoreNamePattern": {
   *                 "type": [
   *                   "string",
   *                   "array"
   *                 ],
   *                 "items": {
   *                   "type": "string"
   *                 }
   *               },
   *               "ignoreTypePattern": {
   *                 "type": [
   *                   "string",
   *                   "array"
   *                 ],
   *                 "items": {
   *                   "type": "string"
   *                 }
   *               },
   *               "ignoreInFunctions": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           {
   *             "type": [
   *               "string",
   *               "number",
   *               "boolean"
   *             ],
   *             "enum": [
   *               "ReadonlyShallow",
   *               "ReadonlyDeep",
   *               "Immutable",
   *               null,
   *               3,
   *               4,
   *               5,
   *               "None",
   *               false
   *             ]
   *           }
   *         ]
   *       },
   *       "fixer": {
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
   *               "ReadonlyShallow": {
   *                 "oneOf": [
   *                   {
   *                     "type": "boolean",
   *                     "enum": [
   *                       false
   *                     ]
   *                   },
   *                   {
   *                     "type": "object",
   *                     "properties": {
   *                       "pattern": {
   *                         "type": "string"
   *                       },
   *                       "replace": {
   *                         "type": "string"
   *                       }
   *                     },
   *                     "additionalProperties": false
   *                   },
   *                   {
   *                     "type": "array",
   *                     "items": {
   *                       "type": "object",
   *                       "properties": {
   *                         "pattern": {
   *                           "type": "string"
   *                         },
   *                         "replace": {
   *                           "type": "string"
   *                         }
   *                       },
   *                       "additionalProperties": false
   *                     }
   *                   }
   *                 ]
   *               },
   *               "ReadonlyDeep": {
   *                 "oneOf": [
   *                   {
   *                     "type": "boolean",
   *                     "enum": [
   *                       false
   *                     ]
   *                   },
   *                   {
   *                     "type": "object",
   *                     "properties": {
   *                       "pattern": {
   *                         "type": "string"
   *                       },
   *                       "replace": {
   *                         "type": "string"
   *                       }
   *                     },
   *                     "additionalProperties": false
   *                   },
   *                   {
   *                     "type": "array",
   *                     "items": {
   *                       "type": "object",
   *                       "properties": {
   *                         "pattern": {
   *                           "type": "string"
   *                         },
   *                         "replace": {
   *                           "type": "string"
   *                         }
   *                       },
   *                       "additionalProperties": false
   *                     }
   *                   }
   *                 ]
   *               },
   *               "Immutable": {
   *                 "oneOf": [
   *                   {
   *                     "type": "boolean",
   *                     "enum": [
   *                       false
   *                     ]
   *                   },
   *                   {
   *                     "type": "object",
   *                     "properties": {
   *                       "pattern": {
   *                         "type": "string"
   *                       },
   *                       "replace": {
   *                         "type": "string"
   *                       }
   *                     },
   *                     "additionalProperties": false
   *                   },
   *                   {
   *                     "type": "array",
   *                     "items": {
   *                       "type": "object",
   *                       "properties": {
   *                         "pattern": {
   *                           "type": "string"
   *                         },
   *                         "replace": {
   *                           "type": "string"
   *                         }
   *                       },
   *                       "additionalProperties": false
   *                     }
   *                   }
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
    readonly ignoreClasses?: boolean | 'fieldsOnly';
    readonly enforcement?:
      | 'ReadonlyShallow'
      | 'ReadonlyDeep'
      | 'Immutable'
      | null
      | 3
      | 4
      | 5
      | 'None'
      | false;
    readonly ignoreInferredTypes?: boolean;
    readonly ignoreNamePattern?: string | readonly string[];
    readonly ignoreTypePattern?: string | readonly string[];
    readonly parameters?:
      | {
          readonly ignoreClasses?: boolean | 'fieldsOnly';
          readonly enforcement?:
            | 'ReadonlyShallow'
            | 'ReadonlyDeep'
            | 'Immutable'
            | null
            | 3
            | 4
            | 5
            | 'None'
            | false;
          readonly ignoreInferredTypes?: boolean;
          readonly ignoreNamePattern?: string | readonly string[];
          readonly ignoreTypePattern?: string | readonly string[];
        }
      | (
          | 'ReadonlyShallow'
          | 'ReadonlyDeep'
          | 'Immutable'
          | null
          | 3
          | 4
          | 5
          | 'None'
          | false
        );
    readonly returnTypes?:
      | {
          readonly ignoreClasses?: boolean | 'fieldsOnly';
          readonly enforcement?:
            | 'ReadonlyShallow'
            | 'ReadonlyDeep'
            | 'Immutable'
            | null
            | 3
            | 4
            | 5
            | 'None'
            | false;
          readonly ignoreInferredTypes?: boolean;
          readonly ignoreNamePattern?: string | readonly string[];
          readonly ignoreTypePattern?: string | readonly string[];
        }
      | (
          | 'ReadonlyShallow'
          | 'ReadonlyDeep'
          | 'Immutable'
          | null
          | 3
          | 4
          | 5
          | 'None'
          | false
        );
    readonly variables?:
      | {
          readonly ignoreClasses?: boolean | 'fieldsOnly';
          readonly enforcement?:
            | 'ReadonlyShallow'
            | 'ReadonlyDeep'
            | 'Immutable'
            | null
            | 3
            | 4
            | 5
            | 'None'
            | false;
          readonly ignoreInferredTypes?: boolean;
          readonly ignoreNamePattern?: string | readonly string[];
          readonly ignoreTypePattern?: string | readonly string[];
          readonly ignoreInFunctions?: boolean;
        }
      | (
          | 'ReadonlyShallow'
          | 'ReadonlyDeep'
          | 'Immutable'
          | null
          | 3
          | 4
          | 5
          | 'None'
          | false
        );
    readonly fixer?:
      | false
      | {
          readonly ReadonlyShallow?:
            | false
            | {
                readonly pattern?: string;
                readonly replace?: string;
              }
            | readonly {
                readonly pattern?: string;
                readonly replace?: string;
              }[];
          readonly ReadonlyDeep?:
            | false
            | {
                readonly pattern?: string;
                readonly replace?: string;
              }
            | readonly {
                readonly pattern?: string;
                readonly replace?: string;
              }[];
          readonly Immutable?:
            | false
            | {
                readonly pattern?: string;
                readonly replace?: string;
              }
            | readonly {
                readonly pattern?: string;
                readonly replace?: string;
              }[];
        };
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Prefer property signatures over method signatures.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v5.0.6/docs/rules/prefer-property-signatures.md
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | category    | Stylistic  |
 *  | recommended | false      |
 */
namespace PreferPropertySignatures {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreIfReadonlyWrapped": {
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
    readonly ignoreIfReadonlyWrapped?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Prefer readonly types over mutable types.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v5.0.6/docs/rules/prefer-readonly-type.md
 *
 *  | key         | value        |
 *  | :---------- | :----------- |
 *  | type        | suggestion   |
 *  | deprecated  | true         |
 *  | fixable     | code         |
 *  | category    | No Mutations |
 *  | recommended | error        |
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
  export type RuleEntry = 'off';
}

/**
 * @description Replaces `x => f(x)` with just `f`.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v5.0.6/docs/rules/prefer-tacit.md
 *
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | hasSuggestions | true       |
 *  | category       | Stylistic  |
 *  | recommended    | false      |
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
   *       "assumeTypes": {
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
    readonly assumeTypes?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Require consistently using either `readonly` keywords or `Readonly<T>`
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v5.0.6/docs/rules/readonly-type.md
 *
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | fixable     | code       |
 *  | category    | Stylistic  |
 *  | recommended | error      |
 */
namespace ReadonlyType {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "enum": [
   *       "generic",
   *       "keyword"
   *     ],
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = 'generic' | 'keyword';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce the immutability of types based on patterns.
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v5.0.6/docs/rules/type-declaration-immutability.md
 *
 *  | key         | value        |
 *  | :---------- | :----------- |
 *  | type        | suggestion   |
 *  | fixable     | code         |
 *  | category    | No Mutations |
 *  | recommended | error        |
 */
namespace TypeDeclarationImmutability {
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
   *       "rules": {
   *         "type": "array",
   *         "items": {
   *           "type": "object",
   *           "properties": {
   *             "identifiers": {
   *               "type": [
   *                 "string",
   *                 "array"
   *               ],
   *               "items": {
   *                 "type": [
   *                   "string"
   *                 ]
   *               }
   *             },
   *             "immutability": {
   *               "type": [
   *                 "string",
   *                 "number"
   *               ],
   *               "enum": [
   *                 "Mutable",
   *                 "ReadonlyShallow",
   *                 "ReadonlyDeep",
   *                 "Immutable",
   *                 null,
   *                 2,
   *                 3,
   *                 4,
   *                 5
   *               ]
   *             },
   *             "comparator": {
   *               "type": [
   *                 "string",
   *                 "number"
   *               ],
   *               "enum": [
   *                 "Exactly",
   *                 "AtLeast",
   *                 "More",
   *                 -2,
   *                 "Less",
   *                 -1,
   *                 "AtMost",
   *                 0,
   *                 1,
   *                 2
   *               ]
   *             },
   *             "fixer": {
   *               "oneOf": [
   *                 {
   *                   "type": "boolean",
   *                   "enum": [
   *                     false
   *                   ]
   *                 },
   *                 {
   *                   "type": "object",
   *                   "properties": {
   *                     "pattern": {
   *                       "type": "string"
   *                     },
   *                     "replace": {
   *                       "type": "string"
   *                     }
   *                   },
   *                   "additionalProperties": false
   *                 },
   *                 {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "object",
   *                     "properties": {
   *                       "pattern": {
   *                         "type": "string"
   *                       },
   *                       "replace": {
   *                         "type": "string"
   *                       }
   *                     },
   *                     "additionalProperties": false
   *                   }
   *                 }
   *               ]
   *             }
   *           },
   *           "required": [
   *             "identifiers",
   *             "immutability"
   *           ],
   *           "additionalProperties": false
   *         }
   *       },
   *       "ignoreInterfaces": {
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
    readonly rules?: readonly {
      readonly identifiers: string | readonly string[];
      readonly immutability:
        | (
            | 'Mutable'
            | 'ReadonlyShallow'
            | 'ReadonlyDeep'
            | 'Immutable'
            | null
            | 2
            | 3
            | 4
            | 5
          )
        | (
            | 'Mutable'
            | 'ReadonlyShallow'
            | 'ReadonlyDeep'
            | 'Immutable'
            | null
            | 2
            | 3
            | 4
            | 5
          );
      readonly comparator?:
        | (
            | 'Exactly'
            | 'AtLeast'
            | 'More'
            | -2
            | 'Less'
            | -1
            | 'AtMost'
            | 0
            | 1
            | 2
          )
        | (
            | 'Exactly'
            | 'AtLeast'
            | 'More'
            | -2
            | 'Less'
            | -1
            | 'AtMost'
            | 0
            | 1
            | 2
          );
      readonly fixer?:
        | false
        | {
            readonly pattern?: string;
            readonly replace?: string;
          }
        | readonly {
            readonly pattern?: string;
            readonly replace?: string;
          }[];
    }[];
    readonly ignoreInterfaces?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

export type EslintFunctionalRules = {
  readonly 'functional/functional-parameters': FunctionalParameters.RuleEntry;
  readonly 'functional/immutable-data': ImmutableData.RuleEntry;
  readonly 'functional/no-classes': NoClasses.RuleEntry;
  readonly 'functional/no-conditional-statements': NoConditionalStatements.RuleEntry;
  readonly 'functional/no-expression-statements': NoExpressionStatements.RuleEntry;
  readonly 'functional/no-let': NoLet.RuleEntry;
  readonly 'functional/no-loop-statements': NoLoopStatements.RuleEntry;
  readonly 'functional/no-mixed-types': NoMixedTypes.RuleEntry;
  readonly 'functional/no-promise-reject': NoPromiseReject.RuleEntry;
  readonly 'functional/no-return-void': NoReturnVoid.RuleEntry;
  readonly 'functional/no-this-expressions': NoThisExpressions.RuleEntry;
  readonly 'functional/no-throw-statements': NoThrowStatements.RuleEntry;
  readonly 'functional/no-try-statements': NoTryStatements.RuleEntry;
  readonly 'functional/prefer-immutable-types': PreferImmutableTypes.RuleEntry;
  readonly 'functional/prefer-property-signatures': PreferPropertySignatures.RuleEntry;
  readonly 'functional/prefer-tacit': PreferTacit.RuleEntry;
  readonly 'functional/readonly-type': ReadonlyType.RuleEntry;
  readonly 'functional/type-declaration-immutability': TypeDeclarationImmutability.RuleEntry;

  // deprecated
  readonly 'functional/prefer-readonly-type': PreferReadonlyType.RuleEntry;
};
