/* cSpell:disable */
import { type Linter } from 'eslint';
import { type RuleSeverityWithDefaultOption } from '../rule-severity-branded.mjs';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Ensure imports point to a file/module that can be resolved.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-unresolved.md
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
    /** @minItems 1 */
    readonly ignore?: readonly [string, ...(readonly string[])];
    readonly caseSensitive?: boolean;
    readonly caseSensitiveStrict?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Ensure named imports correspond to a named export in the remote file.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/named.md
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
  export type Options = {
    readonly commonjs?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Ensure a default export is present, given a default import.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/default.md
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
 * Ensure imported namespaces contain dereferenced properties as they are
 * dereferenced.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/namespace.md
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
  export type Options = {
    /**
     * If `false`, will report computed (and thus, un-lintable) references to
     * namespace members.
     */
    readonly allowComputed?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Forbid namespace (a.k.a. "wildcard" `*`) imports.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-namespace.md
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
  export type Options = {
    readonly ignore?: readonly string[];
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Forbid any invalid exports, i.e. re-export of the same name.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/export.md
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
 * Forbid the use of mutable exports with `var` or `let`.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-mutable-exports.md
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
 * Ensure consistent use of file extension within the import path.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/extensions.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
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
   *           "enum": ["always", "ignorePackages", "never"]
   *         }
   *       ],
   *       "additionalItems": false
   *     },
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["always", "ignorePackages", "never"]
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "pattern": {
   *               "type": "object",
   *               "patternProperties": {
   *                 ".*": {
   *                   "enum": ["always", "ignorePackages", "never"]
   *                 }
   *               }
   *             },
   *             "checkTypeImports": {
   *               "type": "boolean"
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
   *                   "enum": ["always", "ignorePackages", "never"]
   *                 }
   *               }
   *             },
   *             "checkTypeImports": {
   *               "type": "boolean"
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
   *               "enum": ["always", "ignorePackages", "never"]
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
   *           "enum": ["always", "ignorePackages", "never"]
   *         },
   *         {
   *           "type": "object",
   *           "patternProperties": {
   *             ".*": {
   *               "enum": ["always", "ignorePackages", "never"]
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
    | readonly [
        'always' | 'ignorePackages' | 'never',
        {
          readonly pattern?: Record<
            string,
            'always' | 'ignorePackages' | 'never'
          >;
          readonly checkTypeImports?: boolean;
          readonly ignorePackages?: boolean;
          readonly [k: string]: unknown;
        },
      ]
    | readonly [
        'always' | 'ignorePackages' | 'never',
        Record<string, 'always' | 'ignorePackages' | 'never'>,
      ]
    | readonly [
        {
          readonly pattern?: Record<
            string,
            'always' | 'ignorePackages' | 'never'
          >;
          readonly checkTypeImports?: boolean;
          readonly ignorePackages?: boolean;
          readonly [k: string]: unknown;
        },
      ]
    | readonly ['always' | 'ignorePackages' | 'never']
    | readonly []
    | readonly [Record<string, 'always' | 'ignorePackages' | 'never'>];

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce which files can be imported in a given folder.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-restricted-paths.md
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
    /** @minItems 1 */
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Forbid importing the submodules of other modules.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-internal-modules.md
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
  export type Options =
    | {
        readonly allow?: readonly string[];
      }
    | {
        readonly forbid?: readonly string[];
      };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Prefer named exports to be grouped together in a single export declaration
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/group-exports.md
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
 * Forbid importing packages through relative paths.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-relative-packages.md
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
  export type Options = {
    readonly commonjs?: boolean;
    readonly amd?: boolean;
    readonly esmodule?: boolean;
    /** @minItems 1 */
    readonly ignore?: readonly [string, ...(readonly string[])];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Forbid importing modules from parent directories.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-relative-parent-imports.md
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
  export type Options = {
    readonly commonjs?: boolean;
    readonly amd?: boolean;
    readonly esmodule?: boolean;
    /** @minItems 1 */
    readonly ignore?: readonly [string, ...(readonly string[])];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce or ban the use of inline type-only markers for named imports.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/consistent-type-specifier-style.md
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Forbid a module from importing itself.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-self-import.md
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
 * Forbid a module from importing a module with a dependency path back to
 * itself.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-cycle.md
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
   *       },
   *       "disableScc": {
   *         "description": "When true, don't calculate a strongly-connected-components graph. SCC is used to reduce the time-complexity of cycle detection, but adds overhead.",
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
    /** @minItems 1 */
    readonly ignore?: readonly [string, ...(readonly string[])];
    readonly maxDepth?: number | '∞';
    /** Ignore external modules */
    readonly ignoreExternal?: boolean;
    /**
     * Allow cyclic dependency if there is at least one dynamic import in the
     * chain
     */
    readonly allowUnsafeDynamicCyclicDependency?: boolean;
    /**
     * When true, don't calculate a strongly-connected-components graph. SCC is
     * used to reduce the time-complexity of cycle detection, but adds
     * overhead.
     */
    readonly disableScc?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Forbid named default exports.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-named-default.md
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
 * Forbid use of exported name as identifier of default export.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-named-as-default.md
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
 * Forbid use of exported name as property of default export.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-named-as-default-member.md
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
 * Forbid anonymous values as default exports.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-anonymous-default-export.md
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
  export type Options = {
    /** If `false`, will report default export of an array */
    readonly allowArray?: boolean;
    /** If `false`, will report default export of an arrow function */
    readonly allowArrowFunction?: boolean;
    /** If `false`, will report default export of a function call */
    readonly allowCallExpression?: boolean;
    /** If `false`, will report default export of an anonymous class */
    readonly allowAnonymousClass?: boolean;
    /** If `false`, will report default export of an anonymous function */
    readonly allowAnonymousFunction?: boolean;
    /** If `false`, will report default export of a literal */
    readonly allowLiteral?: boolean;
    /** If `false`, will report default export of an object expression */
    readonly allowObject?: boolean;
    /** If `false`, will report default export of a class instantiation */
    readonly allowNew?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Forbid modules without exports, or exports without matching import in another
 * module.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-unused-modules.md
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
  export type Options = {
    /** Files/paths to be analyzed (only for unused exports) */
    readonly src?: readonly string[];
    /**
     * Files/paths for which unused exports will not be reported (e.g module
     * entry points)
     */
    readonly ignoreExports?: readonly string[];
    /** Report modules without any exports */
    readonly missingExports?: boolean;
    /** Report exports without any usage */
    readonly unusedExports?: boolean;
    /** Ignore type exports without any usage */
    readonly ignoreUnusedTypeExports?: boolean;
    readonly [k: string]: unknown;
  } & (
    | {
        readonly missingExports: true;
        readonly [k: string]: unknown;
      }
    | {
        readonly unusedExports: true;
        readonly src?: UnknownRecord;
        readonly [k: string]: unknown;
      }
  );

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Forbid CommonJS `require` calls and `module.exports` or `exports.*`.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-commonjs.md
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
   * {
   *   "anyOf": [
   *     {
   *       "type": "array",
   *       "items": [
   *         {
   *           "enum": ["allow-primitive-modules"]
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
    | readonly [
        {
          readonly allowPrimitiveModules?: boolean;
          readonly allowRequire?: boolean;
          readonly allowConditionalRequire?: boolean;
        },
      ]
    | readonly ['allow-primitive-modules']
    | readonly [];

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Forbid AMD `require` and `define` calls.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-amd.md
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
 * Forbid repeated import of the same module in multiple places.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-duplicates.md
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
  export type Options = {
    readonly considerQueryString?: boolean;
    readonly 'prefer-inline'?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Ensure all imports appear before other statements.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/first.md
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce the maximum number of dependencies a module can have.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/max-dependencies.md
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
  export type Options = {
    readonly max?: number;
    readonly ignoreTypeImports?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Forbid the use of extraneous packages.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-extraneous-dependencies.md
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Forbid import of modules using absolute paths.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-absolute-path.md
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
  export type Options = {
    readonly commonjs?: boolean;
    readonly amd?: boolean;
    readonly esmodule?: boolean;
    /** @minItems 1 */
    readonly ignore?: readonly [string, ...(readonly string[])];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Forbid Node.js builtin modules.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-nodejs-modules.md
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
  export type Options = {
    readonly allow?: readonly string[];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Forbid webpack loader syntax in imports.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-webpack-loader-syntax.md
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
 * Enforce a convention in module import order.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/order.md
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
   *         "enum": [
   *           "ignore",
   *           "always",
   *           "always-and-inside-groups",
   *           "never"
   *         ]
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
      readonly patternOptions?: UnknownRecord;
      readonly group:
        | 'builtin'
        | 'external'
        | 'index'
        | 'internal'
        | 'object'
        | 'parent'
        | 'sibling'
        | 'type'
        | 'unknown';
      readonly position?: 'after' | 'before';
    }[];
    readonly 'newlines-between'?:
      | 'always-and-inside-groups'
      | 'always'
      | 'ignore'
      | 'never';
    readonly named?:
      | boolean
      | {
          readonly enabled?: boolean;
          readonly import?: boolean;
          readonly export?: boolean;
          readonly require?: boolean;
          readonly cjsExports?: boolean;
          readonly types?: 'mixed' | 'types-first' | 'types-last';
        };
    readonly alphabetize?: {
      readonly caseInsensitive?: boolean;
      readonly order?: 'asc' | 'desc' | 'ignore';
      readonly orderImportKind?: 'asc' | 'desc' | 'ignore';
    };
    readonly warnOnUnassignedImports?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce a newline after import statements.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/newline-after-import.md
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
  export type Options = {
    readonly count?: number;
    readonly exactCount?: boolean;
    readonly considerComments?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Prefer a default export if module exports a single name or multiple names.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/prefer-default-export.md
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
  export type Options = {
    readonly target?: 'any' | 'single';
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Forbid default exports.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-default-export.md
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
 * Forbid named exports.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-named-export.md
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
 * Forbid `require()` calls with expressions.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-dynamic-require.md
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
  export type Options = {
    readonly esmodule?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Forbid potentially ambiguous parse goal (`script` vs. `module`).
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/unambiguous.md
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
 * Forbid unassigned imports
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-unassigned-import.md
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
  export type Options = {
    readonly devDependencies?: boolean | readonly unknown[];
    readonly optionalDependencies?: boolean | readonly unknown[];
    readonly peerDependencies?: boolean | readonly unknown[];
    readonly allow?: readonly string[];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Forbid unnecessary path segments in import and require statements.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-useless-path-segments.md
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
  export type Options = {
    readonly commonjs?: boolean;
    readonly noUselessIndex?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce a leading comment with the webpackChunkName for dynamic imports.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/dynamic-import-chunkname.md
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
  export type Options = {
    readonly importFunctions?: readonly string[];
    readonly allowEmpty?: boolean;
    readonly webpackChunknameFormat?: string;
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Forbid import statements with CommonJS module.exports.
 *
 * ```md
 * | key         | value   |
 * | :---------- | :------ |
 * | type        | problem |
 * | deprecated  | false   |
 * | fixable     | code    |
 * | recommended | true    |
 * ```
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
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Forbid empty named import blocks.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-empty-named-blocks.md
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
 * Ensure all exports appear after other statements.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/exports-last.md
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
 * Forbid imported names marked with `@deprecated` documentation tag.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/v2.31.0/docs/rules/no-deprecated.md
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
 * Replaced by `import/first`.
 *
 * @link https://github.com/import-js/eslint-plugin-import/blob/7b25c1cb95ee18acc1531002fd343e1e6031f9ed/docs/rules/imports-first.md
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

export type EslintImportsRulesOption = {
  readonly 'import/no-unresolved': NoUnresolved.Options;
  readonly 'import/named': Named.Options;
  readonly 'import/namespace': Namespace.Options;
  readonly 'import/no-namespace': NoNamespace.Options;
  readonly 'import/extensions': Extensions.Options;
  readonly 'import/no-restricted-paths': NoRestrictedPaths.Options;
  readonly 'import/no-internal-modules': NoInternalModules.Options;
  readonly 'import/no-relative-packages': NoRelativePackages.Options;
  readonly 'import/no-relative-parent-imports': NoRelativeParentImports.Options;
  readonly 'import/consistent-type-specifier-style': ConsistentTypeSpecifierStyle.Options;
  readonly 'import/no-cycle': NoCycle.Options;
  readonly 'import/no-anonymous-default-export': NoAnonymousDefaultExport.Options;
  readonly 'import/no-unused-modules': NoUnusedModules.Options;
  readonly 'import/no-commonjs': NoCommonjs.Options;
  readonly 'import/no-duplicates': NoDuplicates.Options;
  readonly 'import/first': First.Options;
  readonly 'import/max-dependencies': MaxDependencies.Options;
  readonly 'import/no-extraneous-dependencies': NoExtraneousDependencies.Options;
  readonly 'import/no-absolute-path': NoAbsolutePath.Options;
  readonly 'import/no-nodejs-modules': NoNodejsModules.Options;
  readonly 'import/order': Order.Options;
  readonly 'import/newline-after-import': NewlineAfterImport.Options;
  readonly 'import/prefer-default-export': PreferDefaultExport.Options;
  readonly 'import/no-dynamic-require': NoDynamicRequire.Options;
  readonly 'import/no-unassigned-import': NoUnassignedImport.Options;
  readonly 'import/no-useless-path-segments': NoUselessPathSegments.Options;
  readonly 'import/dynamic-import-chunkname': DynamicImportChunkname.Options;
  readonly 'import/no-import-module-exports': NoImportModuleExports.Options;
};
