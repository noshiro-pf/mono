// @ts-check

import { eslintPlugins } from './eslint-plugins.mjs';

/**
 *
 * @param {string} content
 * @param {string} typeName
 * @returns {string}
 */
export const replaceRulesType = (content, typeName) => {
  let mut_ret = content;

  switch (typeName) {
    case eslintPlugins.EslintRules.typeName: {
      const slice = mut_ret.slice(
        mut_ret.indexOf('namespace LogicalAssignmentOperators {'),
        mut_ret.indexOf('namespace MaxClassesPerFile {')
      );
      mut_ret = mut_ret.replaceAll(
        slice,
        slice
          .replaceAll(
            'export type Options = (',
            ['/* modified */', '  export type Options = ('].join('\n')
          )
          .replaceAll([' &', '    readonly unknown[];'].join('\n'), '')
      );
      break;
    }

    case eslintPlugins.TypeScriptEslintRules.typeName: {
      {
        const slice = mut_ret.slice(
          mut_ret.indexOf('namespace ArrayType {'),
          mut_ret.indexOf('namespace AwaitThenable {')
        );

        mut_ret = mut_ret.replaceAll(
          slice,
          slice.replaceAll(
            `export type Options = readonly unknown[];`,
            [
              '/* modified */',
              'export type Options = {',
              '  /**',
              '   * The array type expected for mutable cases...',
              '   */',
              "  readonly default?: 'array' | 'generic' | 'array-simple';",
              '  /**',
              '   * The array type expected for readonly cases. If omitted, the value for `default` will be used.',
              '   */',
              "  readonly readonly?: 'array' | 'generic' | 'array-simple';",
              '};',
            ].join('\n')
          )
        );
      }

      {
        const slice = mut_ret.slice(
          mut_ret.indexOf('namespace BanTsComment {'),
          mut_ret.indexOf('namespace BanTslintComment {')
        );
        mut_ret = mut_ret.replaceAll(
          slice,
          slice.replaceAll(
            `export type Options = readonly unknown[];`,
            [
              '/* modified */',
              'export type Options = Readonly<{',
              "  'ts-expect-error'?: DirectiveConfigSchema;",
              "  'ts-ignore'?: DirectiveConfigSchema;",
              "  'ts-nocheck'?: DirectiveConfigSchema;",
              "  'ts-check'?: DirectiveConfigSchema;",
              '  minimumDescriptionLength?: number;',
              '}>;',
              '',
              'type DirectiveConfigSchema =',
              '  | boolean',
              "  | 'allow-with-description'",
              '  | {',
              '      readonly descriptionFormat?: string;',
              '    };',
            ].join('\n')
          )
        );
      }

      {
        const slice = mut_ret.slice(
          mut_ret.indexOf('namespace NoRestrictedImports {'),
          mut_ret.indexOf('namespace NoShadow {')
        );
        mut_ret = mut_ret.replaceAll(
          slice,
          slice.replaceAll(
            [
              'export type Options =',
              '    | readonly (',
              '        | unknown',
              '        | {',
              '            readonly allowTypeImports?: boolean;',
              '            readonly [k: string]: unknown;',
              '          }',
              '      )[]',
              '    | readonly {',
              '        readonly paths?: readonly (',
              '          | unknown',
              '          | {',
              '              readonly allowTypeImports?: boolean;',
              '              readonly [k: string]: unknown;',
              '            }',
              '        )[];',
              '        readonly patterns?:',
              '          | unknown',
              '          | readonly {',
              '              readonly allowTypeImports?: boolean;',
              '              readonly [k: string]: unknown;',
              '            }[];',
              '        readonly [k: string]: unknown;',
              '      }[];',
            ].join('\n'),
            [
              '/* modified */',
              '  export type Options =',
              '  | {',
              '      readonly paths: readonly {',
              '        readonly name: string;',
              '        readonly message: string;',
              '        readonly importNames: readonly string[];',
              '        readonly allowTypeImports?: boolean;',
              '      }[];',
              '    }',
              '  | {',
              '      readonly paths: readonly {',
              '        readonly name: string;',
              '        readonly message: string;',
              '        readonly allowTypeImports?: boolean;',
              '      }[];',
              '    }',
              '  | {',
              '      readonly paths: readonly string[];',
              '      readonly patterns: readonly string[];',
              '      readonly allowTypeImports?: boolean;',
              '    }',
              '  | {',
              '      readonly patterns: readonly {',
              '        readonly group: readonly string[];',
              '        readonly message: string;',
              '        readonly allowTypeImports?: boolean;',
              '      }[];',
              '    }',
              '  | { readonly paths: readonly string[] };',
            ].join('\n')
          )
        );
      }

      {
        const slice = mut_ret.slice(
          mut_ret.indexOf('namespace ParameterProperties {'),
          mut_ret.indexOf('namespace PreferAsConst {')
        );
        mut_ret = mut_ret.replaceAll(
          slice,
          slice.replaceAll(
            `export type Options = readonly unknown[];`,
            [
              '  // modified',
              '  export type Options = {',
              '    readonly allow?: readonly [Modifier, ...Modifier[]];',
              "    readonly prefer?: 'class-property' | 'parameter-property';",
              '  };',
              '',
              '  type Modifier =',
              "    | 'readonly'",
              "    | 'private'",
              "    | 'protected'",
              "    | 'public'",
              "    | 'private readonly'",
              "    | 'protected readonly'",
              "    | 'public readonly';",
            ].join('\n')
          )
        );
      }

      {
        const slice = mut_ret.slice(
          mut_ret.indexOf('namespace ExplicitMemberAccessibility {'),
          mut_ret.indexOf('namespace ExplicitModuleBoundaryTypes {')
        );
        mut_ret = mut_ret.replaceAll(
          slice,
          slice.replaceAll(
            `export type Options = readonly unknown[];`,
            [
              '  /* modified */',
              '  export type Options = Readonly<{',
              '    accessibility?: AccessibilityLevel;',
              '    overrides?: Readonly<{',
              '      accessors?: AccessibilityLevel;',
              '      constructors?: AccessibilityLevel;',
              '      methods?: AccessibilityLevel;',
              '      properties?: AccessibilityLevel;',
              '      parameterProperties?: AccessibilityLevel;',
              '    }>;',
              '    ignoredMethodNames?: readonly string[];',
              '  }>;',
              '',
              "  type AccessibilityLevel = 'explicit' | 'no-public' | 'off';",
            ].join('\n')
          )
        );
      }

      break;
    }

    case eslintPlugins.EslintJestRules.typeName: {
      const slice = mut_ret.slice(
        mut_ret.indexOf('namespace ValidTitle {'),
        mut_ret.indexOf('export type EslintJestRules = {')
      );
      mut_ret = mut_ret.replaceAll(
        slice,
        slice.replaceAll(
          [
            '  export type Options = {',
            '    readonly ignoreTypeOfDescribeName?: boolean;',
            '    readonly disallowedWords?: readonly string[];',
            '    /**',
            "     * This interface was referenced by `Options`'s JSON-Schema definition",
            '     * via the `patternProperty` "^must(?:Not)?Match$".',
            '     */',
            '    readonly [k: string]:',
            '      | string',
            '      | readonly [string]',
            '      | readonly [string, string]',
            '      | Record<string, string | readonly [string] | readonly [string, string]>;',
            '  };',
          ].join('\n'),

          [
            '/* modified */',
            '  export type Options = {',
            '    readonly ignoreTypeOfDescribeName?: boolean;',
            '    readonly disallowedWords?: readonly string[];',
            '    readonly mustNotMatch?: MustMatchType | string;',
            '    readonly mustMatch?: MustMatchType | string;',
            '  };',
            '',
            '  type MustMatchType = Readonly<',
            "    Partial<Record<'describe' | 'test' | 'it', string>>",
            '  >;',
          ].join('\n')
        )
      );
      break;
    }
  }

  return mut_ret;
};
