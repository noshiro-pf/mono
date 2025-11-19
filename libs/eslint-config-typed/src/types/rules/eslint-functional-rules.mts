/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Enforce functional parameters.
 *
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v9.0.2/docs/rules/functional-parameters.md
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
namespace FunctionalParameters {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreIdentifierPattern": {
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
   *               "ignoreGettersAndSetters": {
   *                 "type": "boolean"
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
   *       },
   *       "overrides": {
   *         "type": "array",
   *         "items": {
   *           "type": "object",
   *           "properties": {
   *             "specifiers": {
   *               "oneOf": [
   *                 {
   *                   "oneOf": [
   *                     {
   *                       "type": "object",
   *                       "properties": {
   *                         "name": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "pattern": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "ignoreName": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "ignorePattern": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "from": {
   *                           "type": "string",
   *                           "enum": [
   *                             "file"
   *                           ]
   *                         },
   *                         "path": {
   *                           "type": "string"
   *                         }
   *                       },
   *                       "additionalProperties": false
   *                     },
   *                     {
   *                       "type": "object",
   *                       "properties": {
   *                         "name": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "pattern": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "ignoreName": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "ignorePattern": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "from": {
   *                           "type": "string",
   *                           "enum": [
   *                             "lib"
   *                           ]
   *                         }
   *                       },
   *                       "additionalProperties": false
   *                     },
   *                     {
   *                       "type": "object",
   *                       "properties": {
   *                         "name": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "pattern": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "ignoreName": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "ignorePattern": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "from": {
   *                           "type": "string",
   *                           "enum": [
   *                             "package"
   *                           ]
   *                         },
   *                         "package": {
   *                           "type": "string"
   *                         }
   *                       },
   *                       "additionalProperties": false
   *                     }
   *                   ]
   *                 },
   *                 {
   *                   "type": "array",
   *                   "items": {
   *                     "oneOf": [
   *                       {
   *                         "type": "object",
   *                         "properties": {
   *                           "name": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "pattern": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "ignoreName": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "ignorePattern": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "from": {
   *                             "type": "string",
   *                             "enum": [
   *                               "file"
   *                             ]
   *                           },
   *                           "path": {
   *                             "type": "string"
   *                           }
   *                         },
   *                         "additionalProperties": false
   *                       },
   *                       {
   *                         "type": "object",
   *                         "properties": {
   *                           "name": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "pattern": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "ignoreName": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "ignorePattern": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "from": {
   *                             "type": "string",
   *                             "enum": [
   *                               "lib"
   *                             ]
   *                           }
   *                         },
   *                         "additionalProperties": false
   *                       },
   *                       {
   *                         "type": "object",
   *                         "properties": {
   *                           "name": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "pattern": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "ignoreName": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "ignorePattern": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "from": {
   *                             "type": "string",
   *                             "enum": [
   *                               "package"
   *                             ]
   *                           },
   *                           "package": {
   *                             "type": "string"
   *                           }
   *                         },
   *                         "additionalProperties": false
   *                       }
   *                     ]
   *                   }
   *                 }
   *               ]
   *             },
   *             "options": {
   *               "type": "object",
   *               "properties": {
   *                 "ignoreIdentifierPattern": {
   *                   "type": [
   *                     "string",
   *                     "array"
   *                   ],
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "ignorePrefixSelector": {
   *                   "type": [
   *                     "string",
   *                     "array"
   *                   ],
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "allowRestParameter": {
   *                   "type": "boolean"
   *                 },
   *                 "allowArgumentsKeyword": {
   *                   "type": "boolean"
   *                 },
   *                 "enforceParameterCount": {
   *                   "oneOf": [
   *                     {
   *                       "type": "boolean",
   *                       "enum": [
   *                         false
   *                       ]
   *                     },
   *                     {
   *                       "type": "string",
   *                       "enum": [
   *                         "atLeastOne",
   *                         "exactlyOne"
   *                       ]
   *                     },
   *                     {
   *                       "type": "object",
   *                       "properties": {
   *                         "count": {
   *                           "type": "string",
   *                           "enum": [
   *                             "atLeastOne",
   *                             "exactlyOne"
   *                           ]
   *                         },
   *                         "ignoreGettersAndSetters": {
   *                           "type": "boolean"
   *                         },
   *                         "ignoreLambdaExpression": {
   *                           "type": "boolean"
   *                         },
   *                         "ignoreIIFE": {
   *                           "type": "boolean"
   *                         }
   *                       },
   *                       "additionalProperties": false
   *                     }
   *                   ]
   *                 }
   *               },
   *               "additionalProperties": false
   *             },
   *             "inherit": {
   *               "type": "boolean"
   *             },
   *             "disable": {
   *               "type": "boolean"
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    ignoreIdentifierPattern?: string | readonly string[];
    ignorePrefixSelector?: string | readonly string[];
    allowRestParameter?: boolean;
    allowArgumentsKeyword?: boolean;
    enforceParameterCount?:
      | false
      | ('atLeastOne' | 'exactlyOne')
      | Readonly<{
          count?: 'atLeastOne' | 'exactlyOne';
          ignoreGettersAndSetters?: boolean;
          ignoreLambdaExpression?: boolean;
          ignoreIIFE?: boolean;
        }>;
    overrides?: readonly Readonly<{
      specifiers?:
        | Readonly<
            | {
                name?: string | readonly string[];
                pattern?: string | readonly string[];
                ignoreName?: string | readonly string[];
                ignorePattern?: string | readonly string[];
                from?: 'file';
                path?: string;
              }
            | {
                name?: string | readonly string[];
                pattern?: string | readonly string[];
                ignoreName?: string | readonly string[];
                ignorePattern?: string | readonly string[];
                from?: 'lib';
              }
            | {
                name?: string | readonly string[];
                pattern?: string | readonly string[];
                ignoreName?: string | readonly string[];
                ignorePattern?: string | readonly string[];
                from?: 'package';
                package?: string;
              }
          >
        | readonly Readonly<
            | {
                name?: string | readonly string[];
                pattern?: string | readonly string[];
                ignoreName?: string | readonly string[];
                ignorePattern?: string | readonly string[];
                from?: 'file';
                path?: string;
              }
            | {
                name?: string | readonly string[];
                pattern?: string | readonly string[];
                ignoreName?: string | readonly string[];
                ignorePattern?: string | readonly string[];
                from?: 'lib';
              }
            | {
                name?: string | readonly string[];
                pattern?: string | readonly string[];
                ignoreName?: string | readonly string[];
                ignorePattern?: string | readonly string[];
                from?: 'package';
                package?: string;
              }
          >[];
      options?: Readonly<{
        ignoreIdentifierPattern?: string | readonly string[];
        ignorePrefixSelector?: string | readonly string[];
        allowRestParameter?: boolean;
        allowArgumentsKeyword?: boolean;
        enforceParameterCount?:
          | false
          | ('atLeastOne' | 'exactlyOne')
          | Readonly<{
              count?: 'atLeastOne' | 'exactlyOne';
              ignoreGettersAndSetters?: boolean;
              ignoreLambdaExpression?: boolean;
              ignoreIIFE?: boolean;
            }>;
      }>;
      inherit?: boolean;
      disable?: boolean;
    }>[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce treating data as immutable.
 *
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v9.0.2/docs/rules/immutable-data.md
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
namespace ImmutableData {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreIdentifierPattern": {
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
   *       "ignoreMapsAndSets": {
   *         "type": "boolean"
   *       },
   *       "ignoreImmediateMutation": {
   *         "type": "boolean"
   *       },
   *       "ignoreNonConstDeclarations": {
   *         "oneOf": [
   *           {
   *             "type": "boolean"
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "treatParametersAsConst": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         ]
   *       },
   *       "overrides": {
   *         "type": "array",
   *         "items": {
   *           "type": "object",
   *           "properties": {
   *             "specifiers": {
   *               "oneOf": [
   *                 {
   *                   "oneOf": [
   *                     {
   *                       "type": "object",
   *                       "properties": {
   *                         "name": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "pattern": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "ignoreName": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "ignorePattern": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "from": {
   *                           "type": "string",
   *                           "enum": [
   *                             "file"
   *                           ]
   *                         },
   *                         "path": {
   *                           "type": "string"
   *                         }
   *                       },
   *                       "additionalProperties": false
   *                     },
   *                     {
   *                       "type": "object",
   *                       "properties": {
   *                         "name": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "pattern": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "ignoreName": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "ignorePattern": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "from": {
   *                           "type": "string",
   *                           "enum": [
   *                             "lib"
   *                           ]
   *                         }
   *                       },
   *                       "additionalProperties": false
   *                     },
   *                     {
   *                       "type": "object",
   *                       "properties": {
   *                         "name": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "pattern": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "ignoreName": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "ignorePattern": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "from": {
   *                           "type": "string",
   *                           "enum": [
   *                             "package"
   *                           ]
   *                         },
   *                         "package": {
   *                           "type": "string"
   *                         }
   *                       },
   *                       "additionalProperties": false
   *                     }
   *                   ]
   *                 },
   *                 {
   *                   "type": "array",
   *                   "items": {
   *                     "oneOf": [
   *                       {
   *                         "type": "object",
   *                         "properties": {
   *                           "name": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "pattern": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "ignoreName": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "ignorePattern": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "from": {
   *                             "type": "string",
   *                             "enum": [
   *                               "file"
   *                             ]
   *                           },
   *                           "path": {
   *                             "type": "string"
   *                           }
   *                         },
   *                         "additionalProperties": false
   *                       },
   *                       {
   *                         "type": "object",
   *                         "properties": {
   *                           "name": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "pattern": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "ignoreName": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "ignorePattern": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "from": {
   *                             "type": "string",
   *                             "enum": [
   *                               "lib"
   *                             ]
   *                           }
   *                         },
   *                         "additionalProperties": false
   *                       },
   *                       {
   *                         "type": "object",
   *                         "properties": {
   *                           "name": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "pattern": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "ignoreName": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "ignorePattern": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "from": {
   *                             "type": "string",
   *                             "enum": [
   *                               "package"
   *                             ]
   *                           },
   *                           "package": {
   *                             "type": "string"
   *                           }
   *                         },
   *                         "additionalProperties": false
   *                       }
   *                     ]
   *                   }
   *                 }
   *               ]
   *             },
   *             "options": {
   *               "type": "object",
   *               "properties": {
   *                 "ignoreIdentifierPattern": {
   *                   "type": [
   *                     "string",
   *                     "array"
   *                   ],
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "ignoreAccessorPattern": {
   *                   "type": [
   *                     "string",
   *                     "array"
   *                   ],
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "ignoreClasses": {
   *                   "oneOf": [
   *                     {
   *                       "type": "boolean"
   *                     },
   *                     {
   *                       "type": "string",
   *                       "enum": [
   *                         "fieldsOnly"
   *                       ]
   *                     }
   *                   ]
   *                 },
   *                 "ignoreMapsAndSets": {
   *                   "type": "boolean"
   *                 },
   *                 "ignoreImmediateMutation": {
   *                   "type": "boolean"
   *                 },
   *                 "ignoreNonConstDeclarations": {
   *                   "oneOf": [
   *                     {
   *                       "type": "boolean"
   *                     },
   *                     {
   *                       "type": "object",
   *                       "properties": {
   *                         "treatParametersAsConst": {
   *                           "type": "boolean"
   *                         }
   *                       },
   *                       "additionalProperties": false
   *                     }
   *                   ]
   *                 }
   *               },
   *               "additionalProperties": false
   *             },
   *             "inherit": {
   *               "type": "boolean"
   *             },
   *             "disable": {
   *               "type": "boolean"
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    ignoreIdentifierPattern?: string | readonly string[];
    ignoreAccessorPattern?: string | readonly string[];
    ignoreClasses?: boolean | 'fieldsOnly';
    ignoreMapsAndSets?: boolean;
    ignoreImmediateMutation?: boolean;
    ignoreNonConstDeclarations?:
      | boolean
      | Readonly<{
          treatParametersAsConst?: boolean;
        }>;
    overrides?: readonly Readonly<{
      specifiers?:
        | Readonly<
            | {
                name?: string | readonly string[];
                pattern?: string | readonly string[];
                ignoreName?: string | readonly string[];
                ignorePattern?: string | readonly string[];
                from?: 'file';
                path?: string;
              }
            | {
                name?: string | readonly string[];
                pattern?: string | readonly string[];
                ignoreName?: string | readonly string[];
                ignorePattern?: string | readonly string[];
                from?: 'lib';
              }
            | {
                name?: string | readonly string[];
                pattern?: string | readonly string[];
                ignoreName?: string | readonly string[];
                ignorePattern?: string | readonly string[];
                from?: 'package';
                package?: string;
              }
          >
        | readonly Readonly<
            | {
                name?: string | readonly string[];
                pattern?: string | readonly string[];
                ignoreName?: string | readonly string[];
                ignorePattern?: string | readonly string[];
                from?: 'file';
                path?: string;
              }
            | {
                name?: string | readonly string[];
                pattern?: string | readonly string[];
                ignoreName?: string | readonly string[];
                ignorePattern?: string | readonly string[];
                from?: 'lib';
              }
            | {
                name?: string | readonly string[];
                pattern?: string | readonly string[];
                ignoreName?: string | readonly string[];
                ignorePattern?: string | readonly string[];
                from?: 'package';
                package?: string;
              }
          >[];
      options?: Readonly<{
        ignoreIdentifierPattern?: string | readonly string[];
        ignoreAccessorPattern?: string | readonly string[];
        ignoreClasses?: boolean | 'fieldsOnly';
        ignoreMapsAndSets?: boolean;
        ignoreImmediateMutation?: boolean;
        ignoreNonConstDeclarations?:
          | boolean
          | Readonly<{
              treatParametersAsConst?: boolean;
            }>;
      }>;
      inherit?: boolean;
      disable?: boolean;
    }>[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow classes.
 *
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v9.0.2/docs/rules/no-classes.md
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | suggestion  |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | false       |
 *  ```
 */
namespace NoClasses {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreIdentifierPattern": {
   *         "type": [
   *           "string",
   *           "array"
   *         ],
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "ignoreCodePattern": {
   *         "type": [
   *           "string",
   *           "array"
   *         ],
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
    ignoreIdentifierPattern?: string | readonly string[];
    ignoreCodePattern?: string | readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow inheritance in classes.
 *
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v9.0.2/docs/rules/no-class-inheritance.md
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | suggestion  |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | false       |
 *  ```
 */
namespace NoClassInheritance {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreIdentifierPattern": {
   *         "type": [
   *           "string",
   *           "array"
   *         ],
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "ignoreCodePattern": {
   *         "type": [
   *           "string",
   *           "array"
   *         ],
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
    ignoreIdentifierPattern?: string | readonly string[];
    ignoreCodePattern?: string | readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow conditional statements.
 *
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v9.0.2/docs/rules/no-conditional-statements.md
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
namespace NoConditionalStatements {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreCodePattern": {
   *         "type": [
   *           "string",
   *           "array"
   *         ],
   *         "items": {
   *           "type": "string"
   *         }
   *       },
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
  export type Options = Readonly<{
    ignoreCodePattern?: string | readonly string[];
    allowReturningBranches?: boolean | 'ifExhaustive';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow expression statements.
 *
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v9.0.2/docs/rules/no-expression-statements.md
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
namespace NoExpressionStatements {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreCodePattern": {
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
   *       },
   *       "ignoreSelfReturning": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    ignoreCodePattern?: string | readonly string[];
    ignoreVoid?: boolean;
    ignoreSelfReturning?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow mutable variables.
 *
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v9.0.2/docs/rules/no-let.md
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | suggestion  |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | false       |
 *  ```
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
   *       "ignoreIdentifierPattern": {
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
  export type Options = Readonly<{
    ignoreIdentifierPattern?: string | readonly string[];
    allowInForLoopInit?: boolean;
    allowInFunctions?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow imperative loops.
 *
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v9.0.2/docs/rules/no-loop-statements.md
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | suggestion  |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | false       |
 *  ```
 */
namespace NoLoopStatements {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Restrict types so that only members of the same kind are allowed in them.
 *
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v9.0.2/docs/rules/no-mixed-types.md
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
  export type Options = Readonly<{
    checkInterfaces?: boolean;
    checkTypeLiterals?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow rejecting promises.
 *
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v9.0.2/docs/rules/no-promise-reject.md
 *
 *  ```md
 *  | key                  | value      |
 *  | :------------------- | :--------- |
 *  | type                 | suggestion |
 *  | deprecated           | false      |
 *  | recommended          | false      |
 *  | requiresTypeChecking | false      |
 *  ```
 */
namespace NoPromiseReject {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow functions that don't return anything.
 *
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v9.0.2/docs/rules/no-return-void.md
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
  export type Options = Readonly<{
    allowNull?: boolean;
    allowUndefined?: boolean;
    ignoreInferredTypes?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow this access.
 *
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v9.0.2/docs/rules/no-this-expressions.md
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | suggestion  |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | false       |
 *  ```
 */
namespace NoThisExpressions {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow throwing exceptions.
 *
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v9.0.2/docs/rules/no-throw-statements.md
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
namespace NoThrowStatements {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowToRejectPromises": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowToRejectPromises?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow try-catch[-finally] and try-finally patterns.
 *
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v9.0.2/docs/rules/no-try-statements.md
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | suggestion  |
 *  | deprecated           | false       |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | false       |
 *  ```
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
  export type Options = Readonly<{
    allowCatch?: boolean;
    allowFinally?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require function parameters to be typed as certain immutability
 *
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v9.0.2/docs/rules/prefer-immutable-types.md
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | suggestion  |
 *  | deprecated           | false       |
 *  | fixable              | code        |
 *  | hasSuggestions       | true        |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
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
   *           null,
   *           "Calculating",
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
   *                   null,
   *                   "Calculating",
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
   *               null,
   *               "Calculating",
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
   *                   null,
   *                   "Calculating",
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
   *               null,
   *               "Calculating",
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
   *                   null,
   *                   "Calculating",
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
   *               null,
   *               "Calculating",
   *               "None",
   *               false
   *             ]
   *           }
   *         ]
   *       },
   *       "fixer": {
   *         "type": "object",
   *         "properties": {
   *           "ReadonlyShallow": {
   *             "oneOf": [
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "pattern": {
   *                     "type": "string"
   *                   },
   *                   "replace": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               },
   *               {
   *                 "type": "array",
   *                 "items": {
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
   *                 }
   *               }
   *             ]
   *           },
   *           "ReadonlyDeep": {
   *             "oneOf": [
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "pattern": {
   *                     "type": "string"
   *                   },
   *                   "replace": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               },
   *               {
   *                 "type": "array",
   *                 "items": {
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
   *                 }
   *               }
   *             ]
   *           },
   *           "Immutable": {
   *             "oneOf": [
   *               {
   *                 "type": "object",
   *                 "properties": {
   *                   "pattern": {
   *                     "type": "string"
   *                   },
   *                   "replace": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               },
   *               {
   *                 "type": "array",
   *                 "items": {
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
   *                 }
   *               }
   *             ]
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       "suggestions": {
   *         "type": "object",
   *         "properties": {
   *           "ReadonlyShallow": {
   *             "type": "array",
   *             "items": {
   *               "type": "array",
   *               "items": {
   *                 "type": "object",
   *                 "properties": {
   *                   "pattern": {
   *                     "type": "string"
   *                   },
   *                   "replace": {
   *                     "type": "string"
   *                   },
   *                   "message": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             }
   *           },
   *           "ReadonlyDeep": {
   *             "type": "array",
   *             "items": {
   *               "type": "array",
   *               "items": {
   *                 "type": "object",
   *                 "properties": {
   *                   "pattern": {
   *                     "type": "string"
   *                   },
   *                   "replace": {
   *                     "type": "string"
   *                   },
   *                   "message": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             }
   *           },
   *           "Immutable": {
   *             "type": "array",
   *             "items": {
   *               "type": "array",
   *               "items": {
   *                 "type": "object",
   *                 "properties": {
   *                   "pattern": {
   *                     "type": "string"
   *                   },
   *                   "replace": {
   *                     "type": "string"
   *                   },
   *                   "message": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "additionalProperties": false
   *               }
   *             }
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       "overrides": {
   *         "type": "array",
   *         "items": {
   *           "type": "object",
   *           "properties": {
   *             "specifiers": {
   *               "oneOf": [
   *                 {
   *                   "oneOf": [
   *                     {
   *                       "type": "object",
   *                       "properties": {
   *                         "name": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "pattern": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "ignoreName": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "ignorePattern": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "from": {
   *                           "type": "string",
   *                           "enum": [
   *                             "file"
   *                           ]
   *                         },
   *                         "path": {
   *                           "type": "string"
   *                         }
   *                       },
   *                       "additionalProperties": false
   *                     },
   *                     {
   *                       "type": "object",
   *                       "properties": {
   *                         "name": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "pattern": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "ignoreName": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "ignorePattern": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "from": {
   *                           "type": "string",
   *                           "enum": [
   *                             "lib"
   *                           ]
   *                         }
   *                       },
   *                       "additionalProperties": false
   *                     },
   *                     {
   *                       "type": "object",
   *                       "properties": {
   *                         "name": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "pattern": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "ignoreName": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "ignorePattern": {
   *                           "oneOf": [
   *                             {
   *                               "type": "string"
   *                             },
   *                             {
   *                               "type": "array",
   *                               "items": {
   *                                 "type": "string"
   *                               }
   *                             }
   *                           ]
   *                         },
   *                         "from": {
   *                           "type": "string",
   *                           "enum": [
   *                             "package"
   *                           ]
   *                         },
   *                         "package": {
   *                           "type": "string"
   *                         }
   *                       },
   *                       "additionalProperties": false
   *                     }
   *                   ]
   *                 },
   *                 {
   *                   "type": "array",
   *                   "items": {
   *                     "oneOf": [
   *                       {
   *                         "type": "object",
   *                         "properties": {
   *                           "name": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "pattern": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "ignoreName": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "ignorePattern": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "from": {
   *                             "type": "string",
   *                             "enum": [
   *                               "file"
   *                             ]
   *                           },
   *                           "path": {
   *                             "type": "string"
   *                           }
   *                         },
   *                         "additionalProperties": false
   *                       },
   *                       {
   *                         "type": "object",
   *                         "properties": {
   *                           "name": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "pattern": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "ignoreName": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "ignorePattern": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "from": {
   *                             "type": "string",
   *                             "enum": [
   *                               "lib"
   *                             ]
   *                           }
   *                         },
   *                         "additionalProperties": false
   *                       },
   *                       {
   *                         "type": "object",
   *                         "properties": {
   *                           "name": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "pattern": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "ignoreName": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "ignorePattern": {
   *                             "oneOf": [
   *                               {
   *                                 "type": "string"
   *                               },
   *                               {
   *                                 "type": "array",
   *                                 "items": {
   *                                   "type": "string"
   *                                 }
   *                               }
   *                             ]
   *                           },
   *                           "from": {
   *                             "type": "string",
   *                             "enum": [
   *                               "package"
   *                             ]
   *                           },
   *                           "package": {
   *                             "type": "string"
   *                           }
   *                         },
   *                         "additionalProperties": false
   *                       }
   *                     ]
   *                   }
   *                 }
   *               ]
   *             },
   *             "options": {
   *               "type": "object",
   *               "properties": {
   *                 "ignoreClasses": {
   *                   "oneOf": [
   *                     {
   *                       "type": "boolean"
   *                     },
   *                     {
   *                       "type": "string",
   *                       "enum": [
   *                         "fieldsOnly"
   *                       ]
   *                     }
   *                   ]
   *                 },
   *                 "enforcement": {
   *                   "type": [
   *                     "string",
   *                     "number",
   *                     "boolean"
   *                   ],
   *                   "enum": [
   *                     "ReadonlyShallow",
   *                     "ReadonlyDeep",
   *                     "Immutable",
   *                     null,
   *                     3,
   *                     4,
   *                     5,
   *                     null,
   *                     "Calculating",
   *                     "None",
   *                     false
   *                   ]
   *                 },
   *                 "ignoreInferredTypes": {
   *                   "type": "boolean"
   *                 },
   *                 "ignoreNamePattern": {
   *                   "type": [
   *                     "string",
   *                     "array"
   *                   ],
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "ignoreTypePattern": {
   *                   "type": [
   *                     "string",
   *                     "array"
   *                   ],
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 },
   *                 "parameters": {
   *                   "oneOf": [
   *                     {
   *                       "type": "object",
   *                       "properties": {
   *                         "ignoreClasses": {
   *                           "oneOf": [
   *                             {
   *                               "type": "boolean"
   *                             },
   *                             {
   *                               "type": "string",
   *                               "enum": [
   *                                 "fieldsOnly"
   *                               ]
   *                             }
   *                           ]
   *                         },
   *                         "enforcement": {
   *                           "type": [
   *                             "string",
   *                             "number",
   *                             "boolean"
   *                           ],
   *                           "enum": [
   *                             "ReadonlyShallow",
   *                             "ReadonlyDeep",
   *                             "Immutable",
   *                             null,
   *                             3,
   *                             4,
   *                             5,
   *                             null,
   *                             "Calculating",
   *                             "None",
   *                             false
   *                           ]
   *                         },
   *                         "ignoreInferredTypes": {
   *                           "type": "boolean"
   *                         },
   *                         "ignoreNamePattern": {
   *                           "type": [
   *                             "string",
   *                             "array"
   *                           ],
   *                           "items": {
   *                             "type": "string"
   *                           }
   *                         },
   *                         "ignoreTypePattern": {
   *                           "type": [
   *                             "string",
   *                             "array"
   *                           ],
   *                           "items": {
   *                             "type": "string"
   *                           }
   *                         }
   *                       },
   *                       "additionalProperties": false
   *                     },
   *                     {
   *                       "type": [
   *                         "string",
   *                         "number",
   *                         "boolean"
   *                       ],
   *                       "enum": [
   *                         "ReadonlyShallow",
   *                         "ReadonlyDeep",
   *                         "Immutable",
   *                         null,
   *                         3,
   *                         4,
   *                         5,
   *                         null,
   *                         "Calculating",
   *                         "None",
   *                         false
   *                       ]
   *                     }
   *                   ]
   *                 },
   *                 "returnTypes": {
   *                   "oneOf": [
   *                     {
   *                       "type": "object",
   *                       "properties": {
   *                         "ignoreClasses": {
   *                           "oneOf": [
   *                             {
   *                               "type": "boolean"
   *                             },
   *                             {
   *                               "type": "string",
   *                               "enum": [
   *                                 "fieldsOnly"
   *                               ]
   *                             }
   *                           ]
   *                         },
   *                         "enforcement": {
   *                           "type": [
   *                             "string",
   *                             "number",
   *                             "boolean"
   *                           ],
   *                           "enum": [
   *                             "ReadonlyShallow",
   *                             "ReadonlyDeep",
   *                             "Immutable",
   *                             null,
   *                             3,
   *                             4,
   *                             5,
   *                             null,
   *                             "Calculating",
   *                             "None",
   *                             false
   *                           ]
   *                         },
   *                         "ignoreInferredTypes": {
   *                           "type": "boolean"
   *                         },
   *                         "ignoreNamePattern": {
   *                           "type": [
   *                             "string",
   *                             "array"
   *                           ],
   *                           "items": {
   *                             "type": "string"
   *                           }
   *                         },
   *                         "ignoreTypePattern": {
   *                           "type": [
   *                             "string",
   *                             "array"
   *                           ],
   *                           "items": {
   *                             "type": "string"
   *                           }
   *                         }
   *                       },
   *                       "additionalProperties": false
   *                     },
   *                     {
   *                       "type": [
   *                         "string",
   *                         "number",
   *                         "boolean"
   *                       ],
   *                       "enum": [
   *                         "ReadonlyShallow",
   *                         "ReadonlyDeep",
   *                         "Immutable",
   *                         null,
   *                         3,
   *                         4,
   *                         5,
   *                         null,
   *                         "Calculating",
   *                         "None",
   *                         false
   *                       ]
   *                     }
   *                   ]
   *                 },
   *                 "variables": {
   *                   "oneOf": [
   *                     {
   *                       "type": "object",
   *                       "properties": {
   *                         "ignoreClasses": {
   *                           "oneOf": [
   *                             {
   *                               "type": "boolean"
   *                             },
   *                             {
   *                               "type": "string",
   *                               "enum": [
   *                                 "fieldsOnly"
   *                               ]
   *                             }
   *                           ]
   *                         },
   *                         "enforcement": {
   *                           "type": [
   *                             "string",
   *                             "number",
   *                             "boolean"
   *                           ],
   *                           "enum": [
   *                             "ReadonlyShallow",
   *                             "ReadonlyDeep",
   *                             "Immutable",
   *                             null,
   *                             3,
   *                             4,
   *                             5,
   *                             null,
   *                             "Calculating",
   *                             "None",
   *                             false
   *                           ]
   *                         },
   *                         "ignoreInferredTypes": {
   *                           "type": "boolean"
   *                         },
   *                         "ignoreNamePattern": {
   *                           "type": [
   *                             "string",
   *                             "array"
   *                           ],
   *                           "items": {
   *                             "type": "string"
   *                           }
   *                         },
   *                         "ignoreTypePattern": {
   *                           "type": [
   *                             "string",
   *                             "array"
   *                           ],
   *                           "items": {
   *                             "type": "string"
   *                           }
   *                         },
   *                         "ignoreInFunctions": {
   *                           "type": "boolean"
   *                         }
   *                       },
   *                       "additionalProperties": false
   *                     },
   *                     {
   *                       "type": [
   *                         "string",
   *                         "number",
   *                         "boolean"
   *                       ],
   *                       "enum": [
   *                         "ReadonlyShallow",
   *                         "ReadonlyDeep",
   *                         "Immutable",
   *                         null,
   *                         3,
   *                         4,
   *                         5,
   *                         null,
   *                         "Calculating",
   *                         "None",
   *                         false
   *                       ]
   *                     }
   *                   ]
   *                 },
   *                 "fixer": {
   *                   "type": "object",
   *                   "properties": {
   *                     "ReadonlyShallow": {
   *                       "oneOf": [
   *                         {
   *                           "type": "object",
   *                           "properties": {
   *                             "pattern": {
   *                               "type": "string"
   *                             },
   *                             "replace": {
   *                               "type": "string"
   *                             }
   *                           },
   *                           "additionalProperties": false
   *                         },
   *                         {
   *                           "type": "array",
   *                           "items": {
   *                             "type": "object",
   *                             "properties": {
   *                               "pattern": {
   *                                 "type": "string"
   *                               },
   *                               "replace": {
   *                                 "type": "string"
   *                               }
   *                             },
   *                             "additionalProperties": false
   *                           }
   *                         }
   *                       ]
   *                     },
   *                     "ReadonlyDeep": {
   *                       "oneOf": [
   *                         {
   *                           "type": "object",
   *                           "properties": {
   *                             "pattern": {
   *                               "type": "string"
   *                             },
   *                             "replace": {
   *                               "type": "string"
   *                             }
   *                           },
   *                           "additionalProperties": false
   *                         },
   *                         {
   *                           "type": "array",
   *                           "items": {
   *                             "type": "object",
   *                             "properties": {
   *                               "pattern": {
   *                                 "type": "string"
   *                               },
   *                               "replace": {
   *                                 "type": "string"
   *                               }
   *                             },
   *                             "additionalProperties": false
   *                           }
   *                         }
   *                       ]
   *                     },
   *                     "Immutable": {
   *                       "oneOf": [
   *                         {
   *                           "type": "object",
   *                           "properties": {
   *                             "pattern": {
   *                               "type": "string"
   *                             },
   *                             "replace": {
   *                               "type": "string"
   *                             }
   *                           },
   *                           "additionalProperties": false
   *                         },
   *                         {
   *                           "type": "array",
   *                           "items": {
   *                             "type": "object",
   *                             "properties": {
   *                               "pattern": {
   *                                 "type": "string"
   *                               },
   *                               "replace": {
   *                                 "type": "string"
   *                               }
   *                             },
   *                             "additionalProperties": false
   *                           }
   *                         }
   *                       ]
   *                     }
   *                   },
   *                   "additionalProperties": false
   *                 },
   *                 "suggestions": {
   *                   "type": "object",
   *                   "properties": {
   *                     "ReadonlyShallow": {
   *                       "type": "array",
   *                       "items": {
   *                         "type": "array",
   *                         "items": {
   *                           "type": "object",
   *                           "properties": {
   *                             "pattern": {
   *                               "type": "string"
   *                             },
   *                             "replace": {
   *                               "type": "string"
   *                             },
   *                             "message": {
   *                               "type": "string"
   *                             }
   *                           },
   *                           "additionalProperties": false
   *                         }
   *                       }
   *                     },
   *                     "ReadonlyDeep": {
   *                       "type": "array",
   *                       "items": {
   *                         "type": "array",
   *                         "items": {
   *                           "type": "object",
   *                           "properties": {
   *                             "pattern": {
   *                               "type": "string"
   *                             },
   *                             "replace": {
   *                               "type": "string"
   *                             },
   *                             "message": {
   *                               "type": "string"
   *                             }
   *                           },
   *                           "additionalProperties": false
   *                         }
   *                       }
   *                     },
   *                     "Immutable": {
   *                       "type": "array",
   *                       "items": {
   *                         "type": "array",
   *                         "items": {
   *                           "type": "object",
   *                           "properties": {
   *                             "pattern": {
   *                               "type": "string"
   *                             },
   *                             "replace": {
   *                               "type": "string"
   *                             },
   *                             "message": {
   *                               "type": "string"
   *                             }
   *                           },
   *                           "additionalProperties": false
   *                         }
   *                       }
   *                     }
   *                   },
   *                   "additionalProperties": false
   *                 }
   *               },
   *               "additionalProperties": false
   *             },
   *             "inherit": {
   *               "type": "boolean"
   *             },
   *             "disable": {
   *               "type": "boolean"
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    ignoreClasses?: boolean | 'fieldsOnly';
    enforcement?:
      | 'ReadonlyShallow'
      | 'ReadonlyDeep'
      | 'Immutable'
      | null
      | 3
      | 4
      | 5
      | 'Calculating'
      | 'None'
      | false;
    ignoreInferredTypes?: boolean;
    ignoreNamePattern?: string | readonly string[];
    ignoreTypePattern?: string | readonly string[];
    parameters?:
      | Readonly<{
          ignoreClasses?: boolean | 'fieldsOnly';
          enforcement?:
            | 'ReadonlyShallow'
            | 'ReadonlyDeep'
            | 'Immutable'
            | null
            | 3
            | 4
            | 5
            | 'Calculating'
            | 'None'
            | false;
          ignoreInferredTypes?: boolean;
          ignoreNamePattern?: string | readonly string[];
          ignoreTypePattern?: string | readonly string[];
        }>
      | (
          | 'ReadonlyShallow'
          | 'ReadonlyDeep'
          | 'Immutable'
          | null
          | 3
          | 4
          | 5
          | 'Calculating'
          | 'None'
          | false
        );
    returnTypes?:
      | Readonly<{
          ignoreClasses?: boolean | 'fieldsOnly';
          enforcement?:
            | 'ReadonlyShallow'
            | 'ReadonlyDeep'
            | 'Immutable'
            | null
            | 3
            | 4
            | 5
            | 'Calculating'
            | 'None'
            | false;
          ignoreInferredTypes?: boolean;
          ignoreNamePattern?: string | readonly string[];
          ignoreTypePattern?: string | readonly string[];
        }>
      | (
          | 'ReadonlyShallow'
          | 'ReadonlyDeep'
          | 'Immutable'
          | null
          | 3
          | 4
          | 5
          | 'Calculating'
          | 'None'
          | false
        );
    variables?:
      | Readonly<{
          ignoreClasses?: boolean | 'fieldsOnly';
          enforcement?:
            | 'ReadonlyShallow'
            | 'ReadonlyDeep'
            | 'Immutable'
            | null
            | 3
            | 4
            | 5
            | 'Calculating'
            | 'None'
            | false;
          ignoreInferredTypes?: boolean;
          ignoreNamePattern?: string | readonly string[];
          ignoreTypePattern?: string | readonly string[];
          ignoreInFunctions?: boolean;
        }>
      | (
          | 'ReadonlyShallow'
          | 'ReadonlyDeep'
          | 'Immutable'
          | null
          | 3
          | 4
          | 5
          | 'Calculating'
          | 'None'
          | false
        );
    fixer?: Readonly<{
      ReadonlyShallow?:
        | Readonly<{
            pattern?: string;
            replace?: string;
          }>
        | readonly Readonly<{
            pattern?: string;
            replace?: string;
          }>[];
      ReadonlyDeep?:
        | Readonly<{
            pattern?: string;
            replace?: string;
          }>
        | readonly Readonly<{
            pattern?: string;
            replace?: string;
          }>[];
      Immutable?:
        | Readonly<{
            pattern?: string;
            replace?: string;
          }>
        | readonly Readonly<{
            pattern?: string;
            replace?: string;
          }>[];
    }>;
    suggestions?: Readonly<{
      ReadonlyShallow?: readonly (readonly Readonly<{
        pattern?: string;
        replace?: string;
        message?: string;
      }>[])[];
      ReadonlyDeep?: readonly (readonly Readonly<{
        pattern?: string;
        replace?: string;
        message?: string;
      }>[])[];
      Immutable?: readonly (readonly Readonly<{
        pattern?: string;
        replace?: string;
        message?: string;
      }>[])[];
    }>;
    overrides?: readonly Readonly<{
      specifiers?:
        | Readonly<
            | {
                name?: string | readonly string[];
                pattern?: string | readonly string[];
                ignoreName?: string | readonly string[];
                ignorePattern?: string | readonly string[];
                from?: 'file';
                path?: string;
              }
            | {
                name?: string | readonly string[];
                pattern?: string | readonly string[];
                ignoreName?: string | readonly string[];
                ignorePattern?: string | readonly string[];
                from?: 'lib';
              }
            | {
                name?: string | readonly string[];
                pattern?: string | readonly string[];
                ignoreName?: string | readonly string[];
                ignorePattern?: string | readonly string[];
                from?: 'package';
                package?: string;
              }
          >
        | readonly Readonly<
            | {
                name?: string | readonly string[];
                pattern?: string | readonly string[];
                ignoreName?: string | readonly string[];
                ignorePattern?: string | readonly string[];
                from?: 'file';
                path?: string;
              }
            | {
                name?: string | readonly string[];
                pattern?: string | readonly string[];
                ignoreName?: string | readonly string[];
                ignorePattern?: string | readonly string[];
                from?: 'lib';
              }
            | {
                name?: string | readonly string[];
                pattern?: string | readonly string[];
                ignoreName?: string | readonly string[];
                ignorePattern?: string | readonly string[];
                from?: 'package';
                package?: string;
              }
          >[];
      options?: Readonly<{
        ignoreClasses?: boolean | 'fieldsOnly';
        enforcement?:
          | 'ReadonlyShallow'
          | 'ReadonlyDeep'
          | 'Immutable'
          | null
          | 3
          | 4
          | 5
          | 'Calculating'
          | 'None'
          | false;
        ignoreInferredTypes?: boolean;
        ignoreNamePattern?: string | readonly string[];
        ignoreTypePattern?: string | readonly string[];
        parameters?:
          | Readonly<{
              ignoreClasses?: boolean | 'fieldsOnly';
              enforcement?:
                | 'ReadonlyShallow'
                | 'ReadonlyDeep'
                | 'Immutable'
                | null
                | 3
                | 4
                | 5
                | 'Calculating'
                | 'None'
                | false;
              ignoreInferredTypes?: boolean;
              ignoreNamePattern?: string | readonly string[];
              ignoreTypePattern?: string | readonly string[];
            }>
          | (
              | 'ReadonlyShallow'
              | 'ReadonlyDeep'
              | 'Immutable'
              | null
              | 3
              | 4
              | 5
              | 'Calculating'
              | 'None'
              | false
            );
        returnTypes?:
          | Readonly<{
              ignoreClasses?: boolean | 'fieldsOnly';
              enforcement?:
                | 'ReadonlyShallow'
                | 'ReadonlyDeep'
                | 'Immutable'
                | null
                | 3
                | 4
                | 5
                | 'Calculating'
                | 'None'
                | false;
              ignoreInferredTypes?: boolean;
              ignoreNamePattern?: string | readonly string[];
              ignoreTypePattern?: string | readonly string[];
            }>
          | (
              | 'ReadonlyShallow'
              | 'ReadonlyDeep'
              | 'Immutable'
              | null
              | 3
              | 4
              | 5
              | 'Calculating'
              | 'None'
              | false
            );
        variables?:
          | Readonly<{
              ignoreClasses?: boolean | 'fieldsOnly';
              enforcement?:
                | 'ReadonlyShallow'
                | 'ReadonlyDeep'
                | 'Immutable'
                | null
                | 3
                | 4
                | 5
                | 'Calculating'
                | 'None'
                | false;
              ignoreInferredTypes?: boolean;
              ignoreNamePattern?: string | readonly string[];
              ignoreTypePattern?: string | readonly string[];
              ignoreInFunctions?: boolean;
            }>
          | (
              | 'ReadonlyShallow'
              | 'ReadonlyDeep'
              | 'Immutable'
              | null
              | 3
              | 4
              | 5
              | 'Calculating'
              | 'None'
              | false
            );
        fixer?: Readonly<{
          ReadonlyShallow?:
            | Readonly<{
                pattern?: string;
                replace?: string;
              }>
            | readonly Readonly<{
                pattern?: string;
                replace?: string;
              }>[];
          ReadonlyDeep?:
            | Readonly<{
                pattern?: string;
                replace?: string;
              }>
            | readonly Readonly<{
                pattern?: string;
                replace?: string;
              }>[];
          Immutable?:
            | Readonly<{
                pattern?: string;
                replace?: string;
              }>
            | readonly Readonly<{
                pattern?: string;
                replace?: string;
              }>[];
        }>;
        suggestions?: Readonly<{
          ReadonlyShallow?: readonly (readonly Readonly<{
            pattern?: string;
            replace?: string;
            message?: string;
          }>[])[];
          ReadonlyDeep?: readonly (readonly Readonly<{
            pattern?: string;
            replace?: string;
            message?: string;
          }>[])[];
          Immutable?: readonly (readonly Readonly<{
            pattern?: string;
            replace?: string;
            message?: string;
          }>[])[];
        }>;
      }>;
      inherit?: boolean;
      disable?: boolean;
    }>[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Prefer property signatures over method signatures.
 *
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v9.0.2/docs/rules/prefer-property-signatures.md
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
  export type Options = Readonly<{
    /** @default false */
    ignoreIfReadonlyWrapped?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Prefer readonly types over mutable types.
 *
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v9.0.2/docs/rules/prefer-readonly-type.md
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | suggestion  |
 *  | deprecated           | true        |
 *  | fixable              | code        |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
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
  export type RuleEntry = 0;
}

/**
 * Replaces `x => f(x)` with just `f`.
 *
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v9.0.2/docs/rules/prefer-tacit.md
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
namespace PreferTacit {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "checkMemberExpressions": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    checkMemberExpressions?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Require consistently using either `readonly` keywords or `Readonly<T>`
 *
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v9.0.2/docs/rules/readonly-type.md
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
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'generic' | 'keyword';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce the immutability of types based on patterns.
 *
 * @link https://github.com/eslint-functional/eslint-plugin-functional/blob/v9.0.2/docs/rules/type-declaration-immutability.md
 *
 *  ```md
 *  | key                  | value       |
 *  | :------------------- | :---------- |
 *  | type                 | suggestion  |
 *  | deprecated           | false       |
 *  | fixable              | code        |
 *  | hasSuggestions       | true        |
 *  | recommended          | recommended |
 *  | requiresTypeChecking | true        |
 *  ```
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
   *       "ignoreIdentifierPattern": {
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
   *                 5,
   *                 null,
   *                 "Calculating"
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
   *             },
   *             "suggestions": {
   *               "oneOf": [
   *                 {
   *                   "type": "boolean",
   *                   "enum": [
   *                     false
   *                   ]
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
  export type Options = Readonly<{
    ignoreIdentifierPattern?: string | readonly string[];
    rules?: readonly Readonly<{
      identifiers: string | readonly string[];
      immutability:
        | 'Mutable'
        | 'ReadonlyShallow'
        | 'ReadonlyDeep'
        | 'Immutable'
        | null
        | 2
        | 3
        | 4
        | 5
        | 'Calculating';
      comparator?:
        | 'Exactly'
        | 'AtLeast'
        | 'More'
        | -2
        | 'Less'
        | -1
        | 'AtMost'
        | 0
        | 1
        | 2;
      fixer?:
        | false
        | Readonly<{
            pattern?: string;
            replace?: string;
          }>
        | readonly Readonly<{
            pattern?: string;
            replace?: string;
          }>[];
      suggestions?:
        | false
        | readonly Readonly<{
            pattern?: string;
            replace?: string;
          }>[];
    }>[];
    ignoreInterfaces?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

export type EslintFunctionalRules = Readonly<{
  'functional/functional-parameters': FunctionalParameters.RuleEntry;
  'functional/immutable-data': ImmutableData.RuleEntry;
  'functional/no-classes': NoClasses.RuleEntry;
  'functional/no-class-inheritance': NoClassInheritance.RuleEntry;
  'functional/no-conditional-statements': NoConditionalStatements.RuleEntry;
  'functional/no-expression-statements': NoExpressionStatements.RuleEntry;
  'functional/no-let': NoLet.RuleEntry;
  'functional/no-loop-statements': NoLoopStatements.RuleEntry;
  'functional/no-mixed-types': NoMixedTypes.RuleEntry;
  'functional/no-promise-reject': NoPromiseReject.RuleEntry;
  'functional/no-return-void': NoReturnVoid.RuleEntry;
  'functional/no-this-expressions': NoThisExpressions.RuleEntry;
  'functional/no-throw-statements': NoThrowStatements.RuleEntry;
  'functional/no-try-statements': NoTryStatements.RuleEntry;
  'functional/prefer-immutable-types': PreferImmutableTypes.RuleEntry;
  'functional/prefer-property-signatures': PreferPropertySignatures.RuleEntry;
  'functional/prefer-tacit': PreferTacit.RuleEntry;
  'functional/readonly-type': ReadonlyType.RuleEntry;
  'functional/type-declaration-immutability': TypeDeclarationImmutability.RuleEntry;

  // deprecated
  'functional/prefer-readonly-type': PreferReadonlyType.RuleEntry;
}>;

export type EslintFunctionalRulesOption = Readonly<{
  'functional/functional-parameters': FunctionalParameters.Options;
  'functional/immutable-data': ImmutableData.Options;
  'functional/no-classes': NoClasses.Options;
  'functional/no-class-inheritance': NoClassInheritance.Options;
  'functional/no-conditional-statements': NoConditionalStatements.Options;
  'functional/no-expression-statements': NoExpressionStatements.Options;
  'functional/no-let': NoLet.Options;
  'functional/no-mixed-types': NoMixedTypes.Options;
  'functional/no-return-void': NoReturnVoid.Options;
  'functional/no-throw-statements': NoThrowStatements.Options;
  'functional/no-try-statements': NoTryStatements.Options;
  'functional/prefer-immutable-types': PreferImmutableTypes.Options;
  'functional/prefer-property-signatures': PreferPropertySignatures.Options;
  'functional/prefer-tacit': PreferTacit.Options;
  'functional/readonly-type': ReadonlyType.Options;
  'functional/type-declaration-immutability': TypeDeclarationImmutability.Options;
}>;
