import {
  pipe,
  replaceWithNoMatchCheck,
  sliceByMatch,
} from '@noshiro/mono-scripts';
import { eslintPlugins } from './eslint-plugins.mjs';

export const replaceRulesType = (content: string, typeName: string): string => {
  switch (typeName) {
    case eslintPlugins.EslintRules.typeName: {
      const slice = sliceFn(content, 'LogicalAssignmentOperators');

      return content.replaceAll(
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
    }

    case eslintPlugins.EslintJestRules.typeName: {
      const slice = sliceFn(content, 'ValidTitle');

      return content.replaceAll(
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
    }

    case eslintPlugins.PreferArrowFunctionRules.typeName: {
      const slice = sliceFn(content, 'PreferArrowFunctions');

      return content.replaceAll(
        slice,
        pipe(slice).chain(
          replaceWithNoMatchCheck(
            'returnStyle?: string;',
            "returnStyle?: 'explicit' | 'implicit' | 'unchanged'; // modified",
          ),
        ).value,
      );
    }

    case eslintPlugins.EslintCypressRules.typeName: {
      const slice = sliceFn(content, 'UnsafeToChainCommand');

      return content.replaceAll(
        slice,
        pipe(slice).chain(
          replaceWithNoMatchCheck(
            'export type Rules = {',
            'export type Options = {',
          ),
        ).value,
      );
    }

    case eslintPlugins.EslintUnicornRules.typeName: {
      const slice = sliceFn(content, 'ImportStyle');

      return content.replaceAll(
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
    }

    default:
      return content;
  }
};

const sliceFn = (target: string, ruleName: string): string =>
  sliceByMatch({
    target,
    startRegexp: `namespace ${ruleName} {`,
    endRegexp: /\n\}\n/u,
  });
