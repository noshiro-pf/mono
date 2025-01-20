import {
  composeMonoTypeFns,
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-utils';
import { eslintPlugins } from './eslint-plugins.mjs';
import { closeBraceRegexp } from './utils.mjs';

export const replaceRulesType = (src: string, typeName: string): string =>
  pipe(src)
    .chain((content) => {
      switch (typeName) {
        case eslintPlugins.EslintRules.typeName:
          return pipe(content).chain(
            replaceWithNoMatchCheckBetweenRegexp({
              startRegexp: 'namespace LogicalAssignmentOperators {',
              endRegexp: closeBraceRegexp,
              mapFn: composeMonoTypeFns(
                replaceWithNoMatchCheck(
                  'export type Options = ',
                  ['/* modified */', '  export type Options = '].join('\n'),
                ),
                replaceWithNoMatchCheck('readonly unknown[] &', ''),
              ),
            }),
          ).value;

        case eslintPlugins.TypeScriptEslintRules.typeName:
          return pipe(content).chain(
            replaceWithNoMatchCheckBetweenRegexp({
              startRegexp: 'namespace ReturnAwait {',
              endRegexp: closeBraceRegexp,
              mapFn: composeMonoTypeFns(
                replaceWithNoMatchCheck(
                  [
                    '  export type Options = string &',
                    "    ('always' | 'error-handling-correctness-only' | 'in-try-catch' | 'never');",
                  ].join('\n'),
                  [
                    '  export type Options = ',
                    "    'always' | 'error-handling-correctness-only' | 'in-try-catch' | 'never'",
                  ].join('\n'),
                ),
              ),
            }),
          ).value;

        case eslintPlugins.EslintPlaywrightRules.typeName:
          return pipe(content).chain(
            replaceWithNoMatchCheckBetweenRegexp({
              startRegexp: 'namespace ValidTitle {',
              endRegexp: closeBraceRegexp,
              mapFn: replaceWithNoMatchCheck(
                [
                  'export type Options = {',
                  '  readonly disallowedWords?: readonly string[];',
                  '  readonly ignoreSpaces?: boolean;',
                  '  readonly ignoreTypeOfDescribeName?: boolean;',
                  '  readonly ignoreTypeOfStepName?: boolean;',
                  '  readonly ignoreTypeOfTestName?: boolean;',
                  '  /**',
                  "   * This interface was referenced by `Options`'s JSON-Schema definition via",
                  '   * the `patternProperty` "^must(?:Not)?Match$".',
                  '   */',
                  '  readonly [k: string]:',
                  '    | Record<string, string | readonly [string, string] | readonly [string]>',
                  '    | string',
                  '    | readonly [string, string]',
                  '    | readonly [string];',
                  '};',
                ].join('\n'),

                [
                  '/* modified */',
                  'export type Options = {',
                  '  readonly disallowedWords?: readonly string[];',
                  '  readonly ignoreSpaces?: boolean;',
                  '  readonly ignoreTypeOfDescribeName?: boolean;',
                  '  readonly ignoreTypeOfStepName?: boolean;',
                  '  readonly ignoreTypeOfTestName?: boolean;',
                  '  readonly mustNotMatch?: MustMatchType | string;',
                  '  readonly mustMatch?: MustMatchType | string;',
                  '};',
                  '',
                  'type MustMatchType = Readonly<',
                  "  Partial<Record<'describe' | 'it' | 'test', string>>",
                  '>;',
                ].join('\n'),
              ),
            }),
          ).value;

        case eslintPlugins.EslintVitestRules.typeName:
          return pipe(content).chain(
            replaceWithNoMatchCheckBetweenRegexp({
              startRegexp: 'namespace ValidTitle {',
              endRegexp: closeBraceRegexp,
              mapFn: replaceWithNoMatchCheck(
                [
                  '  export type Options = {',
                  '    readonly ignoreTypeOfDescribeName?: boolean;',
                  '    readonly allowArguments?: boolean;',
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
                  '    readonly allowArguments?: boolean;',
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
            }),
          ).value;

        case eslintPlugins.EslintJestRules.typeName:
          return pipe(content).chain(
            replaceWithNoMatchCheckBetweenRegexp({
              startRegexp: 'namespace ValidTitle {',
              endRegexp: closeBraceRegexp,
              mapFn: replaceWithNoMatchCheck(
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
            }),
          ).value;

        case eslintPlugins.EslintPreferArrowFunctionRules.typeName:
          return pipe(content).chain(
            replaceWithNoMatchCheckBetweenRegexp({
              startRegexp: 'namespace PreferArrowFunctions {',
              endRegexp: closeBraceRegexp,
              mapFn: replaceWithNoMatchCheck(
                'returnStyle?: string;',
                "returnStyle?: 'explicit' | 'implicit' | 'unchanged'; // modified",
              ),
            }),
          ).value;

        case eslintPlugins.EslintCypressRules.typeName:
          return pipe(content).chain(
            replaceWithNoMatchCheckBetweenRegexp({
              startRegexp: 'namespace UnsafeToChainCommand {',
              endRegexp: closeBraceRegexp,
              mapFn: replaceWithNoMatchCheck(
                'export type Rules = {',
                'export type Options = {',
              ),
            }),
          ).value;

        case eslintPlugins.EslintUnicornRules.typeName:
          return pipe(content).chain(
            replaceWithNoMatchCheckBetweenRegexp({
              startRegexp: 'namespace ImportStyle {',
              endRegexp: closeBraceRegexp,
              mapFn: replaceWithNoMatchCheck(
                '  export type BooleanObject = Readonly<Record<string, boolean>>;',
                [
                  '  export type BooleanObject = Readonly<',
                  "    Partial<Record<'default' | 'named' | 'namespace' | 'unassigned', boolean>>",
                  '  >;',
                ].join('\n'),
              ),
            }),
          ).value;

        default:
          return content;
      }
    })
    .chain((content) =>
      content
        .replaceAll('Readonly<Record<string, unknown>>', 'UnknownRecord')
        .replaceAll('Record<string, unknown>', 'UnknownRecord'),
    ).value;
