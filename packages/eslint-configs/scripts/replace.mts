import {
  pipe,
  replaceWithNoMatchCheck,
  sliceByMatch,
} from '@noshiro/mono-scripts';
import { eslintPlugins } from './eslint-plugins.mjs';

export const replaceRulesType = (content: string, typeName: string): string => {
  let mut_ret = content;

  switch (typeName) {
    case eslintPlugins.EslintRules.typeName: {
      const slice = sliceFn(mut_ret, 'LogicalAssignmentOperators');

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
      const slice = sliceFn(mut_ret, 'ValidTitle');

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
              "     * This interface was referenced by `Options`'s JSON-Schema definition via",
              '     * the `patternProperty` "^must(?:Not)?Match$".',
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
      const slice = sliceFn(mut_ret, 'PreferArrowFunctions');

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
      const slice = sliceFn(mut_ret, 'UnsafeToChainCommand');

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

    case eslintPlugins.EslintUnicornRules.typeName: {
      const slice = sliceFn(mut_ret, 'ImportStyle');

      mut_ret = mut_ret.replaceAll(
        slice,
        pipe(slice).chain(
          replaceWithNoMatchCheck(
            '  export type BooleanObject = Readonly<Record<string, boolean>>;',
            [
              '  export type BooleanObject = Readonly<',
              "    Partial<Record<'default' | 'named' | 'namespace' | 'unassigned', boolean>>",
              '  >;',
            ].join('\n'),
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

const sliceFn = (target: string, ruleName: string): string =>
  sliceByMatch({
    target,
    startRegexp: `namespace ${ruleName} {`,
    endRegexp: /\n\}\n/u,
  });
