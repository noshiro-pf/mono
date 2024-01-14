import { pipe } from '@noshiro/mono-scripts/ts-utils/pipe.mjs';
import { replaceWithNoMatchCheck } from '@noshiro/mono-scripts/ts-utils/replace-with-no-match-check.mjs';
import { eslintPlugins } from './eslint-plugins.mjs';

export const replaceRulesType = (content: string, typeName: string): string => {
  let mut_ret = content;

  switch (typeName) {
    case eslintPlugins.EslintRules.typeName: {
      const slice = mut_ret.slice(
        mut_ret.indexOf('namespace LogicalAssignmentOperators {'),
        mut_ret.indexOf('namespace MaxClassesPerFile {'),
      );
      mut_ret = mut_ret.replaceAll(
        slice,
        pipe(slice)
          .chain(
            replaceWithNoMatchCheck(
              'export type Options = ',
              ['/* modified */', '  export type Options = '].join('\n'),
            ),
          )
          .chain(replaceWithNoMatchCheck('readonly unknown[] &', '')).value,
      );
      break;
    }

    case eslintPlugins.EslintJestRules.typeName: {
      const slice = mut_ret.slice(
        mut_ret.indexOf('namespace ValidTitle {'),
        mut_ret.indexOf('export type EslintJestRules = {'),
      );
      mut_ret = mut_ret.replaceAll(
        slice,
        pipe(slice).chain(
          replaceWithNoMatchCheck(
            [
              '  export type Options = {',
              '    readonly ignoreSpaces?: boolean;',
              '    readonly ignoreTypeOfDescribeName?: boolean;',
              '    readonly ignoreTypeOfTestName?: boolean;',
              '    readonly disallowedWords?: readonly string[];',
              '    /**',
              "     * This interface was referenced by `Options`'s JSON-Schema definition",
              '     * via the `patternProperty` "^must(?:Not)?Match$".',
              '     */',
              '    readonly [k: string]:',
              '      | Record<string, string | readonly [string, string] | readonly [string]>',
              '      | string',
              '      | readonly [string, string]',
              '      | readonly [string];',
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
              "    Partial<Record<'describe' | 'it' | 'test', string>>",
              '  >;',
            ].join('\n'),
          ),
        ).value,
      );
      break;
    }

    case eslintPlugins.PreferArrowFunctionRules.typeName: {
      const slice = mut_ret.slice(
        mut_ret.indexOf('namespace PreferArrowFunctions {'),
        mut_ret.indexOf('export type PreferArrowFunctionRules = {'),
      );
      mut_ret = mut_ret.replaceAll(
        slice,
        pipe(slice).chain(
          replaceWithNoMatchCheck(
            'returnStyle?: string;',
            "returnStyle?: 'explicit' | 'implicit' | 'unchanged'; // modified",
          ),
        ).value,
      );
      break;
    }

    case eslintPlugins.EslintCypressRules.typeName: {
      const slice = mut_ret.slice(
        mut_ret.indexOf('namespace UnsafeToChainCommand {'),
        mut_ret.indexOf('namespace NoUnnecessaryWaiting {'),
      );
      mut_ret = mut_ret.replaceAll(
        slice,
        pipe(slice).chain(
          replaceWithNoMatchCheck(
            'export type Rules = {',
            'export type Options = {',
          ),
        ).value,
      );
      break;
    }

    default:
      break;
  }

  return mut_ret;
};
