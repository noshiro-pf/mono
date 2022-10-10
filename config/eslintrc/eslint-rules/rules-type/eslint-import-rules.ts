/* eslint-disable functional/no-mixed-type */
/* cSpell:disable */
/* eslint-disable @typescript-eslint/sort-type-union-intersection-members */
import type { Linter } from 'eslint';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleLevel, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleLevel, ...T[1]] : T;

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-unresolved.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace NoUnresolved {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "commonjs": {
   *         "type": "boolean"
   *       },
   *       "amd": {
   *         "type": "boolean"
   *       },
   *       "esmodule": {
   *         "type": "boolean"
   *       },
   *       "ignore": {
   *         "type": "array",
   *         "minItems": 1,
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true
   *       },
   *       "caseSensitive": {
   *         "type": "boolean",
   *         "default": true
   *       },
   *       "caseSensitiveStrict": {
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
    readonly commonjs?: boolean;
    readonly amd?: boolean;
    readonly esmodule?: boolean;
    /**
     * @minItems 1
     */
    readonly ignore?: readonly [string, ...(readonly string[])];
    readonly caseSensitive?: boolean;
    readonly caseSensitiveStrict?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/named.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace Named {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "commonjs": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly commonjs?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/default.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace Default {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/namespace.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace Namespace {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowComputed": {
   *         "description": "If `false`, will report computed (and thus, un-lintable) references to namespace members.",
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
    /**
     * If `false`, will report computed (and thus, un-lintable) references to namespace members.
     */
    readonly allowComputed?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-namespace.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
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
   *       "ignore": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly ignore?: readonly string[];
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/export.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace Export {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-mutable-exports.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoMutableExports {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/extensions.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace Extensions {
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
   *             "always",
   *             "ignorePackages",
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
   *             "always",
   *             "ignorePackages",
   *             "never"
   *           ]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "pattern": {
   *               "type": "object",
   *               "patternProperties": {
   *                 ".*": {
   *                   "enum": [
   *                     "always",
   *                     "ignorePackages",
   *                     "never"
   *                   ]
   *                 }
   *               }
   *             },
   *             "ignorePackages": {
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
   *           "type": "object",
   *           "properties": {
   *             "pattern": {
   *               "type": "object",
   *               "patternProperties": {
   *                 ".*": {
   *                   "enum": [
   *                     "always",
   *                     "ignorePackages",
   *                     "never"
   *                   ]
   *                 }
   *               }
   *             },
   *             "ignorePackages": {
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
   *           "type": "object",
   *           "patternProperties": {
   *             ".*": {
   *               "enum": [
   *                 "always",
   *                 "ignorePackages",
   *                 "never"
   *               ]
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
   *             "always",
   *             "ignorePackages",
   *             "never"
   *           ]
   *         },
   *         {
   *           "type": "object",
   *           "patternProperties": {
   *             ".*": {
   *               "enum": [
   *                 "always",
   *                 "ignorePackages",
   *                 "never"
   *               ]
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
    | readonly []
    | readonly ['always' | 'ignorePackages' | 'never']
    | readonly []
    | readonly ['always' | 'ignorePackages' | 'never']
    | readonly [
        'always' | 'ignorePackages' | 'never',
        {
          readonly pattern?: Record<
            string,
            'always' | 'ignorePackages' | 'never'
          >;
          readonly ignorePackages?: boolean;
          readonly [k: string]: unknown;
        }
      ]
    | readonly []
    | readonly [
        {
          readonly pattern?: Record<
            string,
            'always' | 'ignorePackages' | 'never'
          >;
          readonly ignorePackages?: boolean;
          readonly [k: string]: unknown;
        }
      ]
    | readonly []
    | readonly [Record<string, 'always' | 'ignorePackages' | 'never'>]
    | readonly []
    | readonly ['always' | 'ignorePackages' | 'never']
    | readonly [
        'always' | 'ignorePackages' | 'never',
        Record<string, 'always' | 'ignorePackages' | 'never'>
      ];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-restricted-paths.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace NoRestrictedPaths {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "zones": {
   *         "type": "array",
   *         "minItems": 1,
   *         "items": {
   *           "type": "object",
   *           "properties": {
   *             "target": {
   *               "type": "string"
   *             },
   *             "from": {
   *               "type": "string"
   *             },
   *             "except": {
   *               "type": "array",
   *               "items": {
   *                 "type": "string"
   *               },
   *               "uniqueItems": true
   *             },
   *             "message": {
   *               "type": "string"
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       },
   *       "basePath": {
   *         "type": "string"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    /**
     * @minItems 1
     */
    readonly zones?: readonly [
      {
        readonly target?: string;
        readonly from?: string;
        readonly except?: readonly string[];
        readonly message?: string;
      },
      ...(readonly {
        readonly target?: string;
        readonly from?: string;
        readonly except?: readonly string[];
        readonly message?: string;
      }[])
    ];
    readonly basePath?: string;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-internal-modules.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoInternalModules {
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
   *           "allow": {
   *             "type": "array",
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
   *           "forbid": {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
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
    | {
        readonly allow?: readonly string[];
      }
    | {
        readonly forbid?: readonly string[];
      };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/group-exports.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace GroupExports {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-relative-packages.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NoRelativePackages {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "commonjs": {
   *         "type": "boolean"
   *       },
   *       "amd": {
   *         "type": "boolean"
   *       },
   *       "esmodule": {
   *         "type": "boolean"
   *       },
   *       "ignore": {
   *         "type": "array",
   *         "minItems": 1,
   *         "items": {
   *           "type": "string"
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
    readonly commonjs?: boolean;
    readonly amd?: boolean;
    readonly esmodule?: boolean;
    /**
     * @minItems 1
     */
    readonly ignore?: readonly [string, ...(readonly string[])];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-relative-parent-imports.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoRelativeParentImports {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "commonjs": {
   *         "type": "boolean"
   *       },
   *       "amd": {
   *         "type": "boolean"
   *       },
   *       "esmodule": {
   *         "type": "boolean"
   *       },
   *       "ignore": {
   *         "type": "array",
   *         "minItems": 1,
   *         "items": {
   *           "type": "string"
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
    readonly commonjs?: boolean;
    readonly amd?: boolean;
    readonly esmodule?: boolean;
    /**
     * @minItems 1
     */
    readonly ignore?: readonly [string, ...(readonly string[])];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Forbid a module from importing itself
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-self-import.md
 *
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | recommended | true    |
 */
namespace NoSelfImport {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-cycle.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoCycle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "commonjs": {
   *         "type": "boolean"
   *       },
   *       "amd": {
   *         "type": "boolean"
   *       },
   *       "esmodule": {
   *         "type": "boolean"
   *       },
   *       "ignore": {
   *         "type": "array",
   *         "minItems": 1,
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true
   *       },
   *       "maxDepth": {
   *         "oneOf": [
   *           {
   *             "description": "maximum dependency depth to traverse",
   *             "type": "integer",
   *             "minimum": 1
   *           },
   *           {
   *             "enum": [
   *               "∞"
   *             ],
   *             "type": "string"
   *           }
   *         ]
   *       },
   *       "ignoreExternal": {
   *         "description": "ignore external modules",
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
    readonly commonjs?: boolean;
    readonly amd?: boolean;
    readonly esmodule?: boolean;
    /**
     * @minItems 1
     */
    readonly ignore?: readonly [string, ...(readonly string[])];
    readonly maxDepth?: number | '∞';
    /**
     * ignore external modules
     */
    readonly ignoreExternal?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-named-default.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoNamedDefault {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-named-as-default.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace NoNamedAsDefault {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-named-as-default-member.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoNamedAsDefaultMember {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-anonymous-default-export.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoAnonymousDefaultExport {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowArray": {
   *         "description": "If `false`, will report default export of an array",
   *         "type": "boolean"
   *       },
   *       "allowArrowFunction": {
   *         "description": "If `false`, will report default export of an arrow function",
   *         "type": "boolean"
   *       },
   *       "allowCallExpression": {
   *         "description": "If `false`, will report default export of a function call",
   *         "type": "boolean"
   *       },
   *       "allowAnonymousClass": {
   *         "description": "If `false`, will report default export of an anonymous class",
   *         "type": "boolean"
   *       },
   *       "allowAnonymousFunction": {
   *         "description": "If `false`, will report default export of an anonymous function",
   *         "type": "boolean"
   *       },
   *       "allowLiteral": {
   *         "description": "If `false`, will report default export of a literal",
   *         "type": "boolean"
   *       },
   *       "allowObject": {
   *         "description": "If `false`, will report default export of an object expression",
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
     * If `false`, will report default export of an array
     */
    readonly allowArray?: boolean;
    /**
     * If `false`, will report default export of an arrow function
     */
    readonly allowArrowFunction?: boolean;
    /**
     * If `false`, will report default export of a function call
     */
    readonly allowCallExpression?: boolean;
    /**
     * If `false`, will report default export of an anonymous class
     */
    readonly allowAnonymousClass?: boolean;
    /**
     * If `false`, will report default export of an anonymous function
     */
    readonly allowAnonymousFunction?: boolean;
    /**
     * If `false`, will report default export of a literal
     */
    readonly allowLiteral?: boolean;
    /**
     * If `false`, will report default export of an object expression
     */
    readonly allowObject?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-unused-modules.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoUnusedModules {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "properties": {
   *       "src": {
   *         "description": "files/paths to be analyzed (only for unused exports)",
   *         "type": "array",
   *         "minItems": 1,
   *         "items": {
   *           "type": "string",
   *           "minLength": 1
   *         }
   *       },
   *       "ignoreExports": {
   *         "description": "files/paths for which unused exports will not be reported (e.g module entry points)",
   *         "type": "array",
   *         "minItems": 1,
   *         "items": {
   *           "type": "string",
   *           "minLength": 1
   *         }
   *       },
   *       "missingExports": {
   *         "description": "report modules without any exports",
   *         "type": "boolean"
   *       },
   *       "unusedExports": {
   *         "description": "report exports without any usage",
   *         "type": "boolean"
   *       }
   *     },
   *     "not": {
   *       "properties": {
   *         "unusedExports": {
   *           "enum": [
   *             false
   *           ]
   *         },
   *         "missingExports": {
   *           "enum": [
   *             false
   *           ]
   *         }
   *       }
   *     },
   *     "anyOf": [
   *       {
   *         "not": {
   *           "properties": {
   *             "unusedExports": {
   *               "enum": [
   *                 true
   *               ]
   *             }
   *           }
   *         },
   *         "required": [
   *           "missingExports"
   *         ]
   *       },
   *       {
   *         "not": {
   *           "properties": {
   *             "missingExports": {
   *               "enum": [
   *                 true
   *               ]
   *             }
   *           }
   *         },
   *         "required": [
   *           "unusedExports"
   *         ]
   *       },
   *       {
   *         "properties": {
   *           "unusedExports": {
   *             "enum": [
   *               true
   *             ]
   *           }
   *         },
   *         "required": [
   *           "unusedExports"
   *         ]
   *       },
   *       {
   *         "properties": {
   *           "missingExports": {
   *             "enum": [
   *               true
   *             ]
   *           }
   *         },
   *         "required": [
   *           "missingExports"
   *         ]
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = (
    | Record<string, unknown>
    | {
        readonly unusedExports: true;
        readonly [k: string]: unknown;
      }
    | {
        readonly missingExports: true;
        readonly [k: string]: unknown;
      }
  ) & {
    /**
     * files/paths to be analyzed (only for unused exports)
     *
     * @minItems 1
     */
    readonly src?: readonly [string, ...(readonly string[])];
    /**
     * files/paths for which unused exports will not be reported (e.g module entry points)
     *
     * @minItems 1
     */
    readonly ignoreExports?: readonly [string, ...(readonly string[])];
    /**
     * report modules without any exports
     */
    readonly missingExports?: boolean;
    /**
     * report exports without any usage
     */
    readonly unusedExports?: boolean;
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-commonjs.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoCommonjs {
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
   *             "allow-primitive-modules"
   *           ]
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
   *             "allowPrimitiveModules": {
   *               "type": "boolean"
   *             },
   *             "allowRequire": {
   *               "type": "boolean"
   *             },
   *             "allowConditionalRequire": {
   *               "type": "boolean"
   *             }
   *           },
   *           "additionalProperties": false
   *         }
   *       ],
   *       "additionalItems": false
   *     }
   *   ]
   * }
   * ```
   */
  export type Options =
    | readonly []
    | readonly ['allow-primitive-modules']
    | readonly []
    | readonly [
        {
          readonly allowPrimitiveModules?: boolean;
          readonly allowRequire?: boolean;
          readonly allowConditionalRequire?: boolean;
        }
      ];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-amd.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoAmd {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-duplicates.md
 *
 *  | key     | value   |
 *  | :------ | :------ |
 *  | type    | problem |
 *  | fixable | code    |
 */
namespace NoDuplicates {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "considerQueryString": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly considerQueryString?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/first.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace First {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "enum": [
   *       "absolute-first",
   *       "disable-absolute-first"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'absolute-first' | 'disable-absolute-first';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/max-dependencies.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace MaxDependencies {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "max": {
   *         "type": "number"
   *       },
   *       "ignoreTypeImports": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly max?: number;
    readonly ignoreTypeImports?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-extraneous-dependencies.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace NoExtraneousDependencies {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "devDependencies": {
   *         "type": [
   *           "boolean",
   *           "array"
   *         ]
   *       },
   *       "optionalDependencies": {
   *         "type": [
   *           "boolean",
   *           "array"
   *         ]
   *       },
   *       "peerDependencies": {
   *         "type": [
   *           "boolean",
   *           "array"
   *         ]
   *       },
   *       "bundledDependencies": {
   *         "type": [
   *           "boolean",
   *           "array"
   *         ]
   *       },
   *       "packageDir": {
   *         "type": [
   *           "string",
   *           "array"
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly devDependencies?: boolean | readonly unknown[];
    readonly optionalDependencies?: boolean | readonly unknown[];
    readonly peerDependencies?: boolean | readonly unknown[];
    readonly bundledDependencies?: boolean | readonly unknown[];
    readonly packageDir?: string | readonly unknown[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-absolute-path.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoAbsolutePath {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "commonjs": {
   *         "type": "boolean"
   *       },
   *       "amd": {
   *         "type": "boolean"
   *       },
   *       "esmodule": {
   *         "type": "boolean"
   *       },
   *       "ignore": {
   *         "type": "array",
   *         "minItems": 1,
   *         "items": {
   *           "type": "string"
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
    readonly commonjs?: boolean;
    readonly amd?: boolean;
    readonly esmodule?: boolean;
    /**
     * @minItems 1
     */
    readonly ignore?: readonly [string, ...(readonly string[])];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-nodejs-modules.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoNodejsModules {
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
  export type Options = {
    readonly allow?: readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-webpack-loader-syntax.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace NoWebpackLoaderSyntax {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/order.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace Order {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "groups": {
   *         "type": "array"
   *       },
   *       "pathGroupsExcludedImportTypes": {
   *         "type": "array"
   *       },
   *       "pathGroups": {
   *         "type": "array",
   *         "items": {
   *           "type": "object",
   *           "properties": {
   *             "pattern": {
   *               "type": "string"
   *             },
   *             "patternOptions": {
   *               "type": "object"
   *             },
   *             "group": {
   *               "type": "string",
   *               "enum": [
   *                 "builtin",
   *                 "external",
   *                 "internal",
   *                 "unknown",
   *                 "parent",
   *                 "sibling",
   *                 "index",
   *                 "object",
   *                 "type"
   *               ]
   *             },
   *             "position": {
   *               "type": "string",
   *               "enum": [
   *                 "after",
   *                 "before"
   *               ]
   *             }
   *           },
   *           "required": [
   *             "pattern",
   *             "group"
   *           ]
   *         }
   *       },
   *       "newlines-between": {
   *         "enum": [
   *           "ignore",
   *           "always",
   *           "always-and-inside-groups",
   *           "never"
   *         ]
   *       },
   *       "alphabetize": {
   *         "type": "object",
   *         "properties": {
   *           "caseInsensitive": {
   *             "type": "boolean",
   *             "default": false
   *           },
   *           "order": {
   *             "enum": [
   *               "ignore",
   *               "asc",
   *               "desc"
   *             ],
   *             "default": "ignore"
   *           }
   *         },
   *         "additionalProperties": false
   *       },
   *       "warnOnUnassignedImports": {
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
    readonly groups?: readonly unknown[];
    readonly pathGroupsExcludedImportTypes?: readonly unknown[];
    readonly pathGroups?: readonly {
      readonly pattern: string;
      readonly patternOptions?: Record<string, unknown>;
      readonly group:
        | 'builtin'
        | 'external'
        | 'internal'
        | 'unknown'
        | 'parent'
        | 'sibling'
        | 'index'
        | 'object'
        | 'type';
      readonly position?: 'after' | 'before';
      readonly [k: string]: unknown;
    }[];
    readonly 'newlines-between'?:
      | 'ignore'
      | 'always'
      | 'always-and-inside-groups'
      | 'never';
    readonly alphabetize?: {
      readonly caseInsensitive?: boolean;
      readonly order?: 'ignore' | 'asc' | 'desc';
    };
    readonly warnOnUnassignedImports?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/newline-after-import.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | layout     |
 *  | fixable | whitespace |
 */
namespace NewlineAfterImport {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "count": {
   *         "type": "integer",
   *         "minimum": 1
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly count?: number;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/prefer-default-export.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace PreferDefaultExport {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-default-export.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoDefaultExport {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-named-export.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoNamedExport {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-dynamic-require.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoDynamicRequire {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "esmodule": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly esmodule?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/unambiguous.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace Unambiguous {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-unassigned-import.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoUnassignedImport {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "devDependencies": {
   *         "type": [
   *           "boolean",
   *           "array"
   *         ]
   *       },
   *       "optionalDependencies": {
   *         "type": [
   *           "boolean",
   *           "array"
   *         ]
   *       },
   *       "peerDependencies": {
   *         "type": [
   *           "boolean",
   *           "array"
   *         ]
   *       },
   *       "allow": {
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
    readonly devDependencies?: boolean | readonly unknown[];
    readonly optionalDependencies?: boolean | readonly unknown[];
    readonly peerDependencies?: boolean | readonly unknown[];
    readonly allow?: readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-useless-path-segments.md
 *
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 */
namespace NoUselessPathSegments {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "commonjs": {
   *         "type": "boolean"
   *       },
   *       "noUselessIndex": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly commonjs?: boolean;
    readonly noUselessIndex?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/dynamic-import-chunkname.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace DynamicImportChunkname {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "importFunctions": {
   *         "type": "array",
   *         "uniqueItems": true,
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "webpackChunknameFormat": {
   *         "type": "string"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly importFunctions?: readonly string[];
    readonly webpackChunknameFormat?: string;
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Disallow import statements with module.exports
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | problem        |
 *  | fixable     | code           |
 *  | category    | Best Practices |
 *  | recommended | true           |
 */
namespace NoImportModuleExports {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "exceptions": {
   *         "type": "array"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly exceptions?: readonly unknown[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/exports-last.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace ExportsLast {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.26.0/docs/rules/no-deprecated.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoDeprecated {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/import-js/eslint-plugin-import/blob/7b25c1cb95ee18acc1531002fd343e1e6031f9ed/docs/rules/imports-first.md
 *
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | true       |
 *  | fixable    | code       |
 */
namespace ImportsFirst {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "enum": [
   *       "absolute-first",
   *       "disable-absolute-first"
   *     ]
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 'off';
}

export type EslintImportsRules = {
  readonly 'import/no-unresolved': NoUnresolved.RuleEntry;
  readonly 'import/named': Named.RuleEntry;
  readonly 'import/default': Default.RuleEntry;
  readonly 'import/namespace': Namespace.RuleEntry;
  readonly 'import/no-namespace': NoNamespace.RuleEntry;
  readonly 'import/export': Export.RuleEntry;
  readonly 'import/no-mutable-exports': NoMutableExports.RuleEntry;
  readonly 'import/extensions': Extensions.RuleEntry;
  readonly 'import/no-restricted-paths': NoRestrictedPaths.RuleEntry;
  readonly 'import/no-internal-modules': NoInternalModules.RuleEntry;
  readonly 'import/group-exports': GroupExports.RuleEntry;
  readonly 'import/no-relative-packages': NoRelativePackages.RuleEntry;
  readonly 'import/no-relative-parent-imports': NoRelativeParentImports.RuleEntry;
  readonly 'import/no-self-import': NoSelfImport.RuleEntry;
  readonly 'import/no-cycle': NoCycle.RuleEntry;
  readonly 'import/no-named-default': NoNamedDefault.RuleEntry;
  readonly 'import/no-named-as-default': NoNamedAsDefault.RuleEntry;
  readonly 'import/no-named-as-default-member': NoNamedAsDefaultMember.RuleEntry;
  readonly 'import/no-anonymous-default-export': NoAnonymousDefaultExport.RuleEntry;
  readonly 'import/no-unused-modules': NoUnusedModules.RuleEntry;
  readonly 'import/no-commonjs': NoCommonjs.RuleEntry;
  readonly 'import/no-amd': NoAmd.RuleEntry;
  readonly 'import/no-duplicates': NoDuplicates.RuleEntry;
  readonly 'import/first': First.RuleEntry;
  readonly 'import/max-dependencies': MaxDependencies.RuleEntry;
  readonly 'import/no-extraneous-dependencies': NoExtraneousDependencies.RuleEntry;
  readonly 'import/no-absolute-path': NoAbsolutePath.RuleEntry;
  readonly 'import/no-nodejs-modules': NoNodejsModules.RuleEntry;
  readonly 'import/no-webpack-loader-syntax': NoWebpackLoaderSyntax.RuleEntry;
  readonly 'import/order': Order.RuleEntry;
  readonly 'import/newline-after-import': NewlineAfterImport.RuleEntry;
  readonly 'import/prefer-default-export': PreferDefaultExport.RuleEntry;
  readonly 'import/no-default-export': NoDefaultExport.RuleEntry;
  readonly 'import/no-named-export': NoNamedExport.RuleEntry;
  readonly 'import/no-dynamic-require': NoDynamicRequire.RuleEntry;
  readonly 'import/unambiguous': Unambiguous.RuleEntry;
  readonly 'import/no-unassigned-import': NoUnassignedImport.RuleEntry;
  readonly 'import/no-useless-path-segments': NoUselessPathSegments.RuleEntry;
  readonly 'import/dynamic-import-chunkname': DynamicImportChunkname.RuleEntry;
  readonly 'import/no-import-module-exports': NoImportModuleExports.RuleEntry;
  readonly 'import/exports-last': ExportsLast.RuleEntry;
  readonly 'import/no-deprecated': NoDeprecated.RuleEntry;

  // deprecated
  readonly 'import/imports-first': ImportsFirst.RuleEntry;
};
