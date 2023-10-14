/* cSpell:disable */
/* eslint-disable functional/no-mixed-types */
/* eslint-disable functional/readonly-type */
/* eslint-disable @typescript-eslint/sort-type-constituents */
import { type Linter } from 'eslint';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleLevel, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleLevel, ...T[1]] : T;

/**
 * @description Ensure imports point to a file/module that can be resolved.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-unresolved.md
 *
 *  | key      | value           |
 *  | :------- | :-------------- |
 *  | type     | problem         |
 *  | category | Static analysis |
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
 * @description Ensure named imports correspond to a named export in the remote file.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/named.md
 *
 *  | key      | value           |
 *  | :------- | :-------------- |
 *  | type     | problem         |
 *  | category | Static analysis |
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
 * @description Ensure a default export is present, given a default import.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/default.md
 *
 *  | key      | value           |
 *  | :------- | :-------------- |
 *  | type     | problem         |
 *  | category | Static analysis |
 */
namespace Default {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Ensure imported namespaces contain dereferenced properties as they are dereferenced.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/namespace.md
 *
 *  | key      | value           |
 *  | :------- | :-------------- |
 *  | type     | problem         |
 *  | category | Static analysis |
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
 * @description Forbid namespace (a.k.a. "wildcard" `*`) imports.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-namespace.md
 *
 *  | key      | value       |
 *  | :------- | :---------- |
 *  | type     | suggestion  |
 *  | fixable  | code        |
 *  | category | Style guide |
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
 * @description Forbid any invalid exports, i.e. re-export of the same name.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/export.md
 *
 *  | key      | value            |
 *  | :------- | :--------------- |
 *  | type     | problem          |
 *  | category | Helpful warnings |
 */
namespace Export {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Forbid the use of mutable exports with `var` or `let`.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-mutable-exports.md
 *
 *  | key      | value            |
 *  | :------- | :--------------- |
 *  | type     | suggestion       |
 *  | category | Helpful warnings |
 */
namespace NoMutableExports {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Ensure consistent use of file extension within the import path.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/extensions.md
 *
 *  | key      | value       |
 *  | :------- | :---------- |
 *  | type     | suggestion  |
 *  | category | Style guide |
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
    | readonly [
        'always' | 'ignorePackages' | 'never',
        {
          readonly pattern?: Record<
            string,
            'always' | 'ignorePackages' | 'never'
          >;
          readonly ignorePackages?: boolean;
          readonly [k: string]: unknown;
        },
      ]
    | readonly [
        {
          readonly pattern?: Record<
            string,
            'always' | 'ignorePackages' | 'never'
          >;
          readonly ignorePackages?: boolean;
          readonly [k: string]: unknown;
        },
      ]
    | readonly [Record<string, 'always' | 'ignorePackages' | 'never'>]
    | readonly [
        'always' | 'ignorePackages' | 'never',
        Record<string, 'always' | 'ignorePackages' | 'never'>,
      ];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce which files can be imported in a given folder.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-restricted-paths.md
 *
 *  | key      | value           |
 *  | :------- | :-------------- |
 *  | type     | problem         |
 *  | category | Static analysis |
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
   *               "anyOf": [
   *                 {
   *                   "type": "string"
   *                 },
   *                 {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "uniqueItems": true,
   *                   "minLength": 1
   *                 }
   *               ]
   *             },
   *             "from": {
   *               "anyOf": [
   *                 {
   *                   "type": "string"
   *                 },
   *                 {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "uniqueItems": true,
   *                   "minLength": 1
   *                 }
   *               ]
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
        readonly target?: string | readonly string[];
        readonly from?: string | readonly string[];
        readonly except?: readonly string[];
        readonly message?: string;
      },
      ...(readonly {
        readonly target?: string | readonly string[];
        readonly from?: string | readonly string[];
        readonly except?: readonly string[];
        readonly message?: string;
      }[]),
    ];
    readonly basePath?: string;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Forbid importing the submodules of other modules.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-internal-modules.md
 *
 *  | key      | value           |
 *  | :------- | :-------------- |
 *  | type     | suggestion      |
 *  | category | Static analysis |
 */
namespace NoInternalModules {
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
 * @description Prefer named exports to be grouped together in a single export declaration
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/group-exports.md
 *
 *  | key      | value       |
 *  | :------- | :---------- |
 *  | type     | suggestion  |
 *  | category | Style guide |
 */
namespace GroupExports {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Forbid importing packages through relative paths.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-relative-packages.md
 *
 *  | key      | value           |
 *  | :------- | :-------------- |
 *  | type     | suggestion      |
 *  | fixable  | code            |
 *  | category | Static analysis |
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
 * @description Forbid importing modules from parent directories.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-relative-parent-imports.md
 *
 *  | key      | value           |
 *  | :------- | :-------------- |
 *  | type     | suggestion      |
 *  | category | Static analysis |
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
 * @description Enforce or ban the use of inline type-only markers for named imports.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/consistent-type-specifier-style.md
 *
 *  | key      | value       |
 *  | :------- | :---------- |
 *  | type     | suggestion  |
 *  | fixable  | code        |
 *  | category | Style guide |
 */
namespace ConsistentTypeSpecifierStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string",
   *     "enum": [
   *       "prefer-inline",
   *       "prefer-top-level"
   *     ],
   *     "default": "prefer-inline"
   *   }
   * ]
   * ```
   */
  export type Options = 'prefer-inline' | 'prefer-top-level';

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Forbid a module from importing itself.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-self-import.md
 *
 *  | key         | value           |
 *  | :---------- | :-------------- |
 *  | type        | problem         |
 *  | category    | Static analysis |
 *  | recommended | true            |
 */
namespace NoSelfImport {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Forbid a module from importing a module with a dependency path back to itself.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-cycle.md
 *
 *  | key      | value           |
 *  | :------- | :-------------- |
 *  | type     | suggestion      |
 *  | category | Static analysis |
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
   *         "anyOf": [
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
   *       },
   *       "allowUnsafeDynamicCyclicDependency": {
   *         "description": "Allow cyclic dependency if there is at least one dynamic import in the chain",
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
    /**
     * Allow cyclic dependency if there is at least one dynamic import in the chain
     */
    readonly allowUnsafeDynamicCyclicDependency?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Forbid named default exports.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-named-default.md
 *
 *  | key      | value       |
 *  | :------- | :---------- |
 *  | type     | suggestion  |
 *  | category | Style guide |
 */
namespace NoNamedDefault {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Forbid use of exported name as identifier of default export.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-named-as-default.md
 *
 *  | key      | value            |
 *  | :------- | :--------------- |
 *  | type     | problem          |
 *  | category | Helpful warnings |
 */
namespace NoNamedAsDefault {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Forbid use of exported name as property of default export.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-named-as-default-member.md
 *
 *  | key      | value            |
 *  | :------- | :--------------- |
 *  | type     | suggestion       |
 *  | category | Helpful warnings |
 */
namespace NoNamedAsDefaultMember {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Forbid anonymous values as default exports.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-anonymous-default-export.md
 *
 *  | key      | value       |
 *  | :------- | :---------- |
 *  | type     | suggestion  |
 *  | category | Style guide |
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
   *       },
   *       "allowNew": {
   *         "description": "If `false`, will report default export of a class instantiation",
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
    /**
     * If `false`, will report default export of a class instantiation
     */
    readonly allowNew?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Forbid modules without exports, or exports without matching import in another module.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-unused-modules.md
 *
 *  | key      | value            |
 *  | :------- | :--------------- |
 *  | type     | suggestion       |
 *  | category | Helpful warnings |
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
   *         "uniqueItems": true,
   *         "items": {
   *           "type": "string",
   *           "minLength": 1
   *         }
   *       },
   *       "ignoreExports": {
   *         "description": "files/paths for which unused exports will not be reported (e.g module entry points)",
   *         "type": "array",
   *         "uniqueItems": true,
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
   *     "anyOf": [
   *       {
   *         "properties": {
   *           "unusedExports": {
   *             "enum": [
   *               true
   *             ]
   *           },
   *           "src": {
   *             "minItems": 1
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
    | {
        readonly unusedExports: true;
        readonly src?: Record<string, unknown>;
        readonly [k: string]: unknown;
      }
    | {
        readonly missingExports: true;
        readonly [k: string]: unknown;
      }
  ) & {
    /**
     * files/paths to be analyzed (only for unused exports)
     */
    readonly src?: readonly string[];
    /**
     * files/paths for which unused exports will not be reported (e.g module entry points)
     */
    readonly ignoreExports?: readonly string[];
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
 * @description Forbid CommonJS `require` calls and `module.exports` or `exports.*`.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-commonjs.md
 *
 *  | key      | value          |
 *  | :------- | :------------- |
 *  | type     | suggestion     |
 *  | category | Module systems |
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
    | readonly [
        {
          readonly allowPrimitiveModules?: boolean;
          readonly allowRequire?: boolean;
          readonly allowConditionalRequire?: boolean;
        },
      ];

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Forbid AMD `require` and `define` calls.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-amd.md
 *
 *  | key      | value          |
 *  | :------- | :------------- |
 *  | type     | suggestion     |
 *  | category | Module systems |
 */
namespace NoAmd {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Forbid repeated import of the same module in multiple places.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-duplicates.md
 *
 *  | key      | value       |
 *  | :------- | :---------- |
 *  | type     | problem     |
 *  | fixable  | code        |
 *  | category | Style guide |
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
   *       },
   *       "prefer-inline": {
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
    readonly 'prefer-inline'?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Ensure all imports appear before other statements.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/first.md
 *
 *  | key      | value       |
 *  | :------- | :---------- |
 *  | type     | suggestion  |
 *  | fixable  | code        |
 *  | category | Style guide |
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
 * @description Enforce the maximum number of dependencies a module can have.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/max-dependencies.md
 *
 *  | key      | value       |
 *  | :------- | :---------- |
 *  | type     | suggestion  |
 *  | category | Style guide |
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
 * @description Forbid the use of extraneous packages.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-extraneous-dependencies.md
 *
 *  | key      | value            |
 *  | :------- | :--------------- |
 *  | type     | problem          |
 *  | category | Helpful warnings |
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
   *       },
   *       "includeInternal": {
   *         "type": [
   *           "boolean"
   *         ]
   *       },
   *       "includeTypes": {
   *         "type": [
   *           "boolean"
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
    readonly includeInternal?: boolean;
    readonly includeTypes?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Forbid import of modules using absolute paths.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-absolute-path.md
 *
 *  | key      | value           |
 *  | :------- | :-------------- |
 *  | type     | suggestion      |
 *  | fixable  | code            |
 *  | category | Static analysis |
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
 * @description Forbid Node.js builtin modules.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-nodejs-modules.md
 *
 *  | key      | value          |
 *  | :------- | :------------- |
 *  | type     | suggestion     |
 *  | category | Module systems |
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
 * @description Forbid webpack loader syntax in imports.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-webpack-loader-syntax.md
 *
 *  | key      | value           |
 *  | :------- | :-------------- |
 *  | type     | problem         |
 *  | category | Static analysis |
 */
namespace NoWebpackLoaderSyntax {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Enforce a convention in module import order.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/order.md
 *
 *  | key      | value       |
 *  | :------- | :---------- |
 *  | type     | suggestion  |
 *  | fixable  | code        |
 *  | category | Style guide |
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
   *       "distinctGroup": {
   *         "type": "boolean",
   *         "default": true
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
   *           "additionalProperties": false,
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
   *           },
   *           "orderImportKind": {
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
    readonly distinctGroup?: boolean;
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
    }[];
    readonly 'newlines-between'?:
      | 'ignore'
      | 'always'
      | 'always-and-inside-groups'
      | 'never';
    readonly alphabetize?: {
      readonly caseInsensitive?: boolean;
      readonly order?: 'ignore' | 'asc' | 'desc';
      readonly orderImportKind?: 'ignore' | 'asc' | 'desc';
    };
    readonly warnOnUnassignedImports?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Enforce a newline after import statements.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/newline-after-import.md
 *
 *  | key      | value       |
 *  | :------- | :---------- |
 *  | type     | layout      |
 *  | fixable  | whitespace  |
 *  | category | Style guide |
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
   *       },
   *       "considerComments": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly count?: number;
    readonly considerComments?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Prefer a default export if module exports a single name or multiple names.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/prefer-default-export.md
 *
 *  | key      | value       |
 *  | :------- | :---------- |
 *  | type     | suggestion  |
 *  | category | Style guide |
 */
namespace PreferDefaultExport {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "target": {
   *         "type": "string",
   *         "enum": [
   *           "single",
   *           "any"
   *         ],
   *         "default": "single"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly target?: 'single' | 'any';
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @description Forbid default exports.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-default-export.md
 *
 *  | key      | value       |
 *  | :------- | :---------- |
 *  | type     | suggestion  |
 *  | category | Style guide |
 */
namespace NoDefaultExport {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Forbid named exports.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-named-export.md
 *
 *  | key      | value       |
 *  | :------- | :---------- |
 *  | type     | suggestion  |
 *  | category | Style guide |
 */
namespace NoNamedExport {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Forbid `require()` calls with expressions.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-dynamic-require.md
 *
 *  | key      | value           |
 *  | :------- | :-------------- |
 *  | type     | suggestion      |
 *  | category | Static analysis |
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
 * @description Forbid potentially ambiguous parse goal (`script` vs. `module`).
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/unambiguous.md
 *
 *  | key      | value          |
 *  | :------- | :------------- |
 *  | type     | suggestion     |
 *  | category | Module systems |
 */
namespace Unambiguous {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Forbid unassigned imports
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-unassigned-import.md
 *
 *  | key      | value       |
 *  | :------- | :---------- |
 *  | type     | suggestion  |
 *  | category | Style guide |
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
 * @description Forbid unnecessary path segments in import and require statements.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-useless-path-segments.md
 *
 *  | key      | value           |
 *  | :------- | :-------------- |
 *  | type     | suggestion      |
 *  | fixable  | code            |
 *  | category | Static analysis |
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
 * @description Enforce a leading comment with the webpackChunkName for dynamic imports.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/dynamic-import-chunkname.md
 *
 *  | key      | value       |
 *  | :------- | :---------- |
 *  | type     | suggestion  |
 *  | category | Style guide |
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
 * @description Forbid import statements with CommonJS module.exports.
 *
 *  | key         | value          |
 *  | :---------- | :------------- |
 *  | type        | problem        |
 *  | fixable     | code           |
 *  | category    | Module systems |
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
 * @description Forbid empty named import blocks.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-empty-named-blocks.md
 *
 *  | key            | value            |
 *  | :------------- | :--------------- |
 *  | type           | suggestion       |
 *  | fixable        | code             |
 *  | hasSuggestions | true             |
 *  | category       | Helpful warnings |
 */
namespace NoEmptyNamedBlocks {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Ensure all exports appear after other statements.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/exports-last.md
 *
 *  | key      | value       |
 *  | :------- | :---------- |
 *  | type     | suggestion  |
 *  | category | Style guide |
 */
namespace ExportsLast {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Forbid imported names marked with `@deprecated` documentation tag.
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.28.1/docs/rules/no-deprecated.md
 *
 *  | key      | value            |
 *  | :------- | :--------------- |
 *  | type     | suggestion       |
 *  | category | Helpful warnings |
 */
namespace NoDeprecated {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Replaced by `import/first`.
 * @link https://github.com/import-js/eslint-plugin-import/blob/7b25c1cb95ee18acc1531002fd343e1e6031f9ed/docs/rules/imports-first.md
 *
 *  | key        | value       |
 *  | :--------- | :---------- |
 *  | type       | suggestion  |
 *  | deprecated | true        |
 *  | fixable    | code        |
 *  | category   | Style guide |
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
  readonly 'import/consistent-type-specifier-style': ConsistentTypeSpecifierStyle.RuleEntry;
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
  readonly 'import/no-empty-named-blocks': NoEmptyNamedBlocks.RuleEntry;
  readonly 'import/exports-last': ExportsLast.RuleEntry;
  readonly 'import/no-deprecated': NoDeprecated.RuleEntry;

  // deprecated
  readonly 'import/imports-first': ImportsFirst.RuleEntry;
};
