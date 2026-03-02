/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * @description Ensure imports point to a file/module that can be resolved.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-unresolved.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
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
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    commonjs?: boolean;
    amd?: boolean;
    esmodule?: boolean;
    /**
     * @minItems 1
     */
    ignore?: readonly [string, ...string[]];
    /**
     * @default true
     */
    caseSensitive?: boolean;
    caseSensitiveStrict?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Ensure named imports correspond to a named export in the remote file.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/named.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
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
  export type Options = Readonly<{
    commonjs?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Ensure a default export is present, given a default import.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/default.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace Default {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Ensure imported namespaces contain dereferenced properties as they are dereferenced.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/namespace.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
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
  export type Options = Readonly<{
    /**
     * If `false`, will report computed (and thus, un-lintable) references to namespace members.
     *
     * @default false
     */
    allowComputed?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Forbid namespace (a.k.a. "wildcard" `*`) imports.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-namespace.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
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
  export type Options = Readonly<{
    ignore?: readonly string[];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Forbid any invalid exports, i.e. re-export of the same name.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/export.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace Export {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Forbid the use of mutable exports with `var` or `let`.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-mutable-exports.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoMutableExports {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Ensure consistent use of file extension within the import path.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/extensions.md
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
namespace Extensions {
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
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "ignorePackages",
   *               "never"
   *             ]
   *           }
   *         ],
   *         "additionalItems": false
   *       },
   *       {
   *         "type": "array",
   *         "items": [
   *           {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "ignorePackages",
   *               "never"
   *             ]
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "pattern": {
   *                 "type": "object",
   *                 "patternProperties": {
   *                   ".*": {
   *                     "type": "string",
   *                     "enum": [
   *                       "always",
   *                       "ignorePackages",
   *                       "never"
   *                     ]
   *                   }
   *                 }
   *               },
   *               "ignorePackages": {
   *                 "type": "boolean"
   *               },
   *               "checkTypeImports": {
   *                 "type": "boolean"
   *               },
   *               "pathGroupOverrides": {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "object",
   *                   "properties": {
   *                     "pattern": {
   *                       "type": "string"
   *                     },
   *                     "patternOptions": {
   *                       "type": "object"
   *                     },
   *                     "action": {
   *                       "type": "string",
   *                       "enum": [
   *                         "enforce",
   *                         "ignore"
   *                       ]
   *                     }
   *                   },
   *                   "additionalProperties": false,
   *                   "required": [
   *                     "pattern",
   *                     "action"
   *                   ]
   *                 }
   *               },
   *               "fix": {
   *                 "type": "boolean"
   *               }
   *             }
   *           }
   *         ],
   *         "additionalItems": false
   *       },
   *       {
   *         "type": "array",
   *         "items": [
   *           {
   *             "type": "object",
   *             "properties": {
   *               "pattern": {
   *                 "type": "object",
   *                 "patternProperties": {
   *                   ".*": {
   *                     "type": "string",
   *                     "enum": [
   *                       "always",
   *                       "ignorePackages",
   *                       "never"
   *                     ]
   *                   }
   *                 }
   *               },
   *               "ignorePackages": {
   *                 "type": "boolean"
   *               },
   *               "checkTypeImports": {
   *                 "type": "boolean"
   *               },
   *               "pathGroupOverrides": {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "object",
   *                   "properties": {
   *                     "pattern": {
   *                       "type": "string"
   *                     },
   *                     "patternOptions": {
   *                       "type": "object"
   *                     },
   *                     "action": {
   *                       "type": "string",
   *                       "enum": [
   *                         "enforce",
   *                         "ignore"
   *                       ]
   *                     }
   *                   },
   *                   "additionalProperties": false,
   *                   "required": [
   *                     "pattern",
   *                     "action"
   *                   ]
   *                 }
   *               },
   *               "fix": {
   *                 "type": "boolean"
   *               }
   *             }
   *           }
   *         ],
   *         "additionalItems": false
   *       },
   *       {
   *         "type": "array",
   *         "items": [
   *           {
   *             "type": "string",
   *             "enum": [
   *               "always",
   *               "ignorePackages",
   *               "never"
   *             ]
   *           },
   *           {
   *             "type": "object",
   *             "patternProperties": {
   *               ".*": {
   *                 "type": "string",
   *                 "enum": [
   *                   "always",
   *                   "ignorePackages",
   *                   "never"
   *                 ]
   *               }
   *             }
   *           }
   *         ],
   *         "additionalItems": false
   *       },
   *       {
   *         "type": "array",
   *         "items": [
   *           {
   *             "type": "object",
   *             "patternProperties": {
   *               ".*": {
   *                 "type": "string",
   *                 "enum": [
   *                   "always",
   *                   "ignorePackages",
   *                   "never"
   *                 ]
   *               }
   *             }
   *           }
   *         ],
   *         "additionalItems": false
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options =
    | readonly []
    | readonly ['always' | 'ignorePackages' | 'never']
    | readonly [
        'always' | 'ignorePackages' | 'never',
        Readonly<{
          pattern?: Readonly<
            Record<string, 'always' | 'ignorePackages' | 'never'>
          >;
          ignorePackages?: boolean;
          checkTypeImports?: boolean;
          pathGroupOverrides?: readonly Readonly<{
            pattern: string;
            patternOptions?: Readonly<Record<string, unknown>>;
            action: 'enforce' | 'ignore';
          }>[];
          fix?: boolean;
          [k: string]: unknown;
        }>,
      ]
    | readonly [
        Readonly<{
          pattern?: Readonly<
            Record<string, 'always' | 'ignorePackages' | 'never'>
          >;
          ignorePackages?: boolean;
          checkTypeImports?: boolean;
          pathGroupOverrides?: readonly Readonly<{
            pattern: string;
            patternOptions?: Readonly<Record<string, unknown>>;
            action: 'enforce' | 'ignore';
          }>[];
          fix?: boolean;
          [k: string]: unknown;
        }>,
      ]
    | readonly [
        'always' | 'ignorePackages' | 'never',
        Readonly<Record<string, 'always' | 'ignorePackages' | 'never'>>,
      ]
    | readonly [
        Readonly<Record<string, 'always' | 'ignorePackages' | 'never'>>,
      ];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce which files can be imported in a given folder.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-restricted-paths.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
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
   *                   "minItems": 1
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
   *                   "minItems": 1
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
  export type Options = Readonly<{
    /**
     * @minItems 1
     */
    zones?: readonly [
      Readonly<{
        target?: string | readonly [string, ...string[]];
        from?: string | readonly [string, ...string[]];
        except?: readonly string[];
        message?: string;
      }>,
      ...Readonly<{
        target?: string | readonly [string, ...string[]];
        from?: string | readonly [string, ...string[]];
        except?: readonly string[];
        message?: string;
      }>[],
    ];
    basePath?: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Forbid importing the submodules of other modules.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-internal-modules.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
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
  export type Options = Readonly<
    | {
        allow?: readonly string[];
      }
    | {
        forbid?: readonly string[];
      }
  >;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer named exports to be grouped together in a single export declaration.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/group-exports.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace GroupExports {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Forbid importing packages through relative paths.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-relative-packages.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
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
  export type Options = Readonly<{
    commonjs?: boolean;
    amd?: boolean;
    esmodule?: boolean;
    /**
     * @minItems 1
     */
    ignore?: readonly [string, ...string[]];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Forbid importing modules from parent directories.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-relative-parent-imports.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
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
  export type Options = Readonly<{
    commonjs?: boolean;
    amd?: boolean;
    esmodule?: boolean;
    /**
     * @minItems 1
     */
    ignore?: readonly [string, ...string[]];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce or ban the use of inline type-only markers for named imports.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/consistent-type-specifier-style.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
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
   *       "prefer-top-level",
   *       "prefer-inline"
   *     ],
   *     "default": "prefer-top-level"
   *   }
   * ]
   * ```
   */
  export type Options = 'prefer-top-level' | 'prefer-inline';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Forbid a module from importing itself.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-self-import.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoSelfImport {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Forbid a module from importing a module with a dependency path back to itself.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-cycle.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
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
  export type Options = Readonly<{
    commonjs?: boolean;
    amd?: boolean;
    esmodule?: boolean;
    /**
     * @minItems 1
     */
    ignore?: readonly [string, ...string[]];
    maxDepth?: number | '∞';
    /**
     * ignore external modules
     *
     * @default false
     */
    ignoreExternal?: boolean;
    /**
     * Allow cyclic dependency if there is at least one dynamic import in the chain
     *
     * @default false
     */
    allowUnsafeDynamicCyclicDependency?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Forbid named default exports.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-named-default.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoNamedDefault {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Forbid use of exported name as identifier of default export.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-named-as-default.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoNamedAsDefault {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Forbid use of exported name as property of default export.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-named-as-default-member.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoNamedAsDefaultMember {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Forbid anonymous values as default exports.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-anonymous-default-export.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
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
  export type Options = Readonly<{
    /**
     * If `false`, will report default export of an array
     */
    allowArray?: boolean;
    /**
     * If `false`, will report default export of an arrow function
     */
    allowArrowFunction?: boolean;
    /**
     * If `false`, will report default export of a function call
     */
    allowCallExpression?: boolean;
    /**
     * If `false`, will report default export of an anonymous class
     */
    allowAnonymousClass?: boolean;
    /**
     * If `false`, will report default export of an anonymous function
     */
    allowAnonymousFunction?: boolean;
    /**
     * If `false`, will report default export of a literal
     */
    allowLiteral?: boolean;
    /**
     * If `false`, will report default export of an object expression
     */
    allowObject?: boolean;
    /**
     * If `false`, will report default export of a class instantiation
     */
    allowNew?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Forbid importing a default export by a different name.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-rename-default.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoRenameDefault {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "commonjs": {
   *         "default": false,
   *         "type": "boolean"
   *       },
   *       "preventRenamingBindings": {
   *         "default": true,
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * @default false
     */
    commonjs?: boolean;
    /**
     * @default true
     */
    preventRenamingBindings?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Forbid modules without exports, or exports without matching import in another module.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-unused-modules.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoUnusedModules {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
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
   *       },
   *       "ignoreUnusedTypeExports": {
   *         "description": "ignore type exports without any usage",
   *         "type": "boolean"
   *       }
   *     },
   *     "anyOf": [
   *       {
   *         "type": "object",
   *         "properties": {
   *           "unusedExports": {
   *             "type": "boolean",
   *             "enum": [
   *               true
   *             ]
   *           },
   *           "src": {
   *             "type": "array",
   *             "minItems": 1
   *           }
   *         },
   *         "required": [
   *           "unusedExports"
   *         ]
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "missingExports": {
   *             "type": "boolean",
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
  export type Options = Readonly<
    (
      | {
          unusedExports: true;
          /**
           * @minItems 1
           */
          src?: readonly [unknown, ...unknown[]];
          [k: string]: unknown;
        }
      | {
          missingExports: true;
          [k: string]: unknown;
        }
    ) & {
      /**
       * files/paths to be analyzed (only for unused exports)
       */
      src?: readonly string[];
      /**
       * files/paths for which unused exports will not be reported (e.g module entry points)
       */
      ignoreExports?: readonly string[];
      /**
       * report modules without any exports
       */
      missingExports?: boolean;
      /**
       * report exports without any usage
       */
      unusedExports?: boolean;
      /**
       * ignore type exports without any usage
       */
      ignoreUnusedTypeExports?: boolean;
      [k: string]: unknown;
    }
  >;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Forbid CommonJS `require` calls and `module.exports` or `exports.*`.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-commonjs.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoCommonjs {
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
   *             "type": "string",
   *             "enum": [
   *               "allow-primitive-modules"
   *             ]
   *           }
   *         ],
   *         "additionalItems": false
   *       },
   *       {
   *         "type": "array",
   *         "items": [
   *           {
   *             "type": "object",
   *             "properties": {
   *               "allowPrimitiveModules": {
   *                 "type": "boolean"
   *               },
   *               "allowRequire": {
   *                 "type": "boolean"
   *               },
   *               "allowConditionalRequire": {
   *                 "type": "boolean"
   *               }
   *             },
   *             "additionalProperties": false
   *           }
   *         ],
   *         "additionalItems": false
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options =
    | readonly []
    | readonly ['allow-primitive-modules']
    | readonly [
        Readonly<{
          allowPrimitiveModules?: boolean;
          allowRequire?: boolean;
          allowConditionalRequire?: boolean;
        }>,
      ];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Forbid AMD `require` and `define` calls.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-amd.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoAmd {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Forbid repeated import of the same module in multiple places.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-duplicates.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  | fixable    | code    |
 *  ```
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
  export type Options = Readonly<{
    considerQueryString?: boolean;
    'prefer-inline'?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Ensure all imports appear before other statements.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/first.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
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
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce the maximum number of dependencies a module can have.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/max-dependencies.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
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
  export type Options = Readonly<{
    max?: number;
    ignoreTypeImports?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Forbid the use of extraneous packages.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-extraneous-dependencies.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
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
   *       },
   *       "whitelist": {
   *         "type": [
   *           "array"
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    devDependencies?: boolean | readonly unknown[];
    optionalDependencies?: boolean | readonly unknown[];
    peerDependencies?: boolean | readonly unknown[];
    bundledDependencies?: boolean | readonly unknown[];
    packageDir?: string | readonly unknown[];
    includeInternal?: boolean;
    includeTypes?: boolean;
    whitelist?: readonly unknown[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Forbid import of modules using absolute paths.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-absolute-path.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
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
  export type Options = Readonly<{
    commonjs?: boolean;
    amd?: boolean;
    esmodule?: boolean;
    /**
     * @minItems 1
     */
    ignore?: readonly [string, ...string[]];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Forbid Node.js builtin modules.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-nodejs-modules.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
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
  export type Options = Readonly<{
    allow?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Forbid webpack loader syntax in imports.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-webpack-loader-syntax.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoWebpackLoaderSyntax {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforce a convention in module import order.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/order.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
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
   *         "type": "string",
   *         "enum": [
   *           "ignore",
   *           "always",
   *           "always-and-inside-groups",
   *           "never"
   *         ]
   *       },
   *       "newlines-between-types": {
   *         "type": "string",
   *         "enum": [
   *           "ignore",
   *           "always",
   *           "always-and-inside-groups",
   *           "never"
   *         ]
   *       },
   *       "consolidateIslands": {
   *         "type": "string",
   *         "enum": [
   *           "inside-groups",
   *           "never"
   *         ]
   *       },
   *       "sortTypesGroup": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "named": {
   *         "default": false,
   *         "oneOf": [
   *           {
   *             "type": "boolean"
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "enabled": {
   *                 "type": "boolean"
   *               },
   *               "import": {
   *                 "type": "boolean"
   *               },
   *               "export": {
   *                 "type": "boolean"
   *               },
   *               "require": {
   *                 "type": "boolean"
   *               },
   *               "cjsExports": {
   *                 "type": "boolean"
   *               },
   *               "types": {
   *                 "type": "string",
   *                 "enum": [
   *                   "mixed",
   *                   "types-first",
   *                   "types-last"
   *                 ]
   *               }
   *             },
   *             "additionalProperties": false
   *           }
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
   *             "type": "string",
   *             "enum": [
   *               "ignore",
   *               "asc",
   *               "desc"
   *             ],
   *             "default": "ignore"
   *           },
   *           "orderImportKind": {
   *             "type": "string",
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
   *     "additionalProperties": false,
   *     "dependencies": {
   *       "newlines-between-types": {
   *         "type": "object",
   *         "properties": {
   *           "sortTypesGroup": {
   *             "type": "boolean",
   *             "enum": [
   *               true
   *             ]
   *           }
   *         },
   *         "required": [
   *           "sortTypesGroup"
   *         ]
   *       },
   *       "consolidateIslands": {
   *         "anyOf": [
   *           {
   *             "type": "object",
   *             "properties": {
   *               "newlines-between": {
   *                 "type": "string",
   *                 "enum": [
   *                   "always-and-inside-groups"
   *                 ]
   *               }
   *             },
   *             "required": [
   *               "newlines-between"
   *             ]
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "newlines-between-types": {
   *                 "type": "string",
   *                 "enum": [
   *                   "always-and-inside-groups"
   *                 ]
   *               }
   *             },
   *             "required": [
   *               "newlines-between-types"
   *             ]
   *           }
   *         ]
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    groups?: readonly unknown[];
    pathGroupsExcludedImportTypes?: readonly unknown[];
    /**
     * @default true
     */
    distinctGroup?: boolean;
    pathGroups?: readonly Readonly<{
      pattern: string;
      patternOptions?: Readonly<Record<string, unknown>>;
      group:
        | 'builtin'
        | 'external'
        | 'internal'
        | 'unknown'
        | 'parent'
        | 'sibling'
        | 'index'
        | 'object'
        | 'type';
      position?: 'after' | 'before';
    }>[];
    'newlines-between'?:
      | 'ignore'
      | 'always'
      | 'always-and-inside-groups'
      | 'never';
    'newlines-between-types'?:
      | 'ignore'
      | 'always'
      | 'always-and-inside-groups'
      | 'never';
    consolidateIslands?: 'inside-groups' | 'never';
    /**
     * @default false
     */
    sortTypesGroup?: boolean;
    /**
     * @default false
     */
    named?:
      | boolean
      | Readonly<{
          enabled?: boolean;
          import?: boolean;
          export?: boolean;
          require?: boolean;
          cjsExports?: boolean;
          types?: 'mixed' | 'types-first' | 'types-last';
        }>;
    alphabetize?: Readonly<{
      caseInsensitive?: boolean;
      order?: 'ignore' | 'asc' | 'desc';
      orderImportKind?: 'ignore' | 'asc' | 'desc';
    }>;
    /**
     * @default false
     */
    warnOnUnassignedImports?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce a newline after import statements.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/newline-after-import.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | layout     |
 *  | deprecated | false      |
 *  | fixable    | whitespace |
 *  ```
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
   *       "exactCount": {
   *         "type": "boolean"
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
  export type Options = Readonly<{
    count?: number;
    exactCount?: boolean;
    considerComments?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer a default export if module exports a single name or multiple names.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/prefer-default-export.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
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
  export type Options = Readonly<{
    /**
     * @default "single"
     */
    target?: 'single' | 'any';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce using namespace imports for specific modules, like `react`/`react-dom`, etc.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/prefer-namespace-import.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  | fixable    | code    |
 *  ```
 */
namespace PreferNamespaceImport {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "patterns": {
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
  export type Options = Readonly<{
    patterns?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Forbid default exports.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-default-export.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoDefaultExport {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Forbid named exports.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-named-export.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoNamedExport {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Forbid `require()` calls with expressions.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-dynamic-require.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
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
  export type Options = Readonly<{
    esmodule?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Forbid potentially ambiguous parse goal (`script` vs. `module`).
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/unambiguous.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace Unambiguous {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Forbid unassigned imports.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-unassigned-import.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
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
  export type Options = Readonly<{
    devDependencies?: boolean | readonly unknown[];
    optionalDependencies?: boolean | readonly unknown[];
    peerDependencies?: boolean | readonly unknown[];
    allow?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Forbid unnecessary path segments in import and require statements.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-useless-path-segments.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
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
  export type Options = Readonly<{
    commonjs?: boolean;
    noUselessIndex?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce a leading comment with the webpackChunkName for dynamic imports.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/dynamic-import-chunkname.md
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | hasSuggestions | true       |
 *  ```
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
   *       "allowEmpty": {
   *         "type": "boolean"
   *       },
   *       "webpackChunknameFormat": {
   *         "type": "string"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    importFunctions?: readonly string[];
    allowEmpty?: boolean;
    webpackChunknameFormat?: string;
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Forbid import statements with CommonJS module.exports.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-import-module-exports.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | fixable     | code    |
 *  | recommended | true    |
 *  ```
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
  export type Options = Readonly<{
    exceptions?: readonly unknown[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Forbid empty named import blocks.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-empty-named-blocks.md
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
namespace NoEmptyNamedBlocks {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Ensure all exports appear after other statements.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/exports-last.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace ExportsLast {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Forbid imported names marked with `@deprecated` documentation tag.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/no-deprecated.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoDeprecated {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Replaced by `import-x/first`.
 * @link https://github.com/un-ts/eslint-plugin-import-x/blob/v4.16.1/docs/rules/imports-first.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | true       |
 *  | fixable    | code       |
 *  ```
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
  export type RuleEntry = 0;
}

export type EslintImportsRules = Readonly<{
  'import-x/no-unresolved': NoUnresolved.RuleEntry;
  'import-x/named': Named.RuleEntry;
  'import-x/default': Default.RuleEntry;
  'import-x/namespace': Namespace.RuleEntry;
  'import-x/no-namespace': NoNamespace.RuleEntry;
  'import-x/export': Export.RuleEntry;
  'import-x/no-mutable-exports': NoMutableExports.RuleEntry;
  'import-x/extensions': Extensions.RuleEntry;
  'import-x/no-restricted-paths': NoRestrictedPaths.RuleEntry;
  'import-x/no-internal-modules': NoInternalModules.RuleEntry;
  'import-x/group-exports': GroupExports.RuleEntry;
  'import-x/no-relative-packages': NoRelativePackages.RuleEntry;
  'import-x/no-relative-parent-imports': NoRelativeParentImports.RuleEntry;
  'import-x/consistent-type-specifier-style': ConsistentTypeSpecifierStyle.RuleEntry;
  'import-x/no-self-import': NoSelfImport.RuleEntry;
  'import-x/no-cycle': NoCycle.RuleEntry;
  'import-x/no-named-default': NoNamedDefault.RuleEntry;
  'import-x/no-named-as-default': NoNamedAsDefault.RuleEntry;
  'import-x/no-named-as-default-member': NoNamedAsDefaultMember.RuleEntry;
  'import-x/no-anonymous-default-export': NoAnonymousDefaultExport.RuleEntry;
  'import-x/no-rename-default': NoRenameDefault.RuleEntry;
  'import-x/no-unused-modules': NoUnusedModules.RuleEntry;
  'import-x/no-commonjs': NoCommonjs.RuleEntry;
  'import-x/no-amd': NoAmd.RuleEntry;
  'import-x/no-duplicates': NoDuplicates.RuleEntry;
  'import-x/first': First.RuleEntry;
  'import-x/max-dependencies': MaxDependencies.RuleEntry;
  'import-x/no-extraneous-dependencies': NoExtraneousDependencies.RuleEntry;
  'import-x/no-absolute-path': NoAbsolutePath.RuleEntry;
  'import-x/no-nodejs-modules': NoNodejsModules.RuleEntry;
  'import-x/no-webpack-loader-syntax': NoWebpackLoaderSyntax.RuleEntry;
  'import-x/order': Order.RuleEntry;
  'import-x/newline-after-import': NewlineAfterImport.RuleEntry;
  'import-x/prefer-default-export': PreferDefaultExport.RuleEntry;
  'import-x/prefer-namespace-import': PreferNamespaceImport.RuleEntry;
  'import-x/no-default-export': NoDefaultExport.RuleEntry;
  'import-x/no-named-export': NoNamedExport.RuleEntry;
  'import-x/no-dynamic-require': NoDynamicRequire.RuleEntry;
  'import-x/unambiguous': Unambiguous.RuleEntry;
  'import-x/no-unassigned-import': NoUnassignedImport.RuleEntry;
  'import-x/no-useless-path-segments': NoUselessPathSegments.RuleEntry;
  'import-x/dynamic-import-chunkname': DynamicImportChunkname.RuleEntry;
  'import-x/no-import-module-exports': NoImportModuleExports.RuleEntry;
  'import-x/no-empty-named-blocks': NoEmptyNamedBlocks.RuleEntry;
  'import-x/exports-last': ExportsLast.RuleEntry;
  'import-x/no-deprecated': NoDeprecated.RuleEntry;

  // deprecated
  'import-x/imports-first': ImportsFirst.RuleEntry;
}>;

export type EslintImportsRulesOption = Readonly<{
  'import-x/no-unresolved': NoUnresolved.Options;
  'import-x/named': Named.Options;
  'import-x/namespace': Namespace.Options;
  'import-x/no-namespace': NoNamespace.Options;
  'import-x/extensions': Extensions.Options;
  'import-x/no-restricted-paths': NoRestrictedPaths.Options;
  'import-x/no-internal-modules': NoInternalModules.Options;
  'import-x/no-relative-packages': NoRelativePackages.Options;
  'import-x/no-relative-parent-imports': NoRelativeParentImports.Options;
  'import-x/consistent-type-specifier-style': ConsistentTypeSpecifierStyle.Options;
  'import-x/no-cycle': NoCycle.Options;
  'import-x/no-anonymous-default-export': NoAnonymousDefaultExport.Options;
  'import-x/no-rename-default': NoRenameDefault.Options;
  'import-x/no-unused-modules': NoUnusedModules.Options;
  'import-x/no-commonjs': NoCommonjs.Options;
  'import-x/no-duplicates': NoDuplicates.Options;
  'import-x/first': First.Options;
  'import-x/max-dependencies': MaxDependencies.Options;
  'import-x/no-extraneous-dependencies': NoExtraneousDependencies.Options;
  'import-x/no-absolute-path': NoAbsolutePath.Options;
  'import-x/no-nodejs-modules': NoNodejsModules.Options;
  'import-x/order': Order.Options;
  'import-x/newline-after-import': NewlineAfterImport.Options;
  'import-x/prefer-default-export': PreferDefaultExport.Options;
  'import-x/prefer-namespace-import': PreferNamespaceImport.Options;
  'import-x/no-dynamic-require': NoDynamicRequire.Options;
  'import-x/no-unassigned-import': NoUnassignedImport.Options;
  'import-x/no-useless-path-segments': NoUselessPathSegments.Options;
  'import-x/dynamic-import-chunkname': DynamicImportChunkname.Options;
  'import-x/no-import-module-exports': NoImportModuleExports.Options;
}>;
