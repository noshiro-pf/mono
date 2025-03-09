import {
  composeMonoTypeFns,
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-utils';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';

export const convertEs2015SymbolWellknown =
  ({ brandedNumber }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).chainMonoTypeFns(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface Array<T> {',
        endRegexp: closeBraceRegexp,
        mapFn:
          // revert eslint fix
          replaceWithNoMatchCheck(
            '[K in keyof readonly unknown[]]',
            '[K in keyof (readonly any[])]',
          ),
      }),

      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface ReadonlyArray<T> {',
        endRegexp: closeBraceRegexp,
        mapFn:
          // revert eslint fix
          replaceWithNoMatchCheck(
            '[K in keyof (readonly unknown[])]',
            '[K in keyof (readonly any[])]',
          ),
      }),

      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface RegExp {',
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          replaceWithNoMatchCheck(
            '[Symbol.search](string: string): number;',
            `[Symbol.search](string: string): ${brandedNumber.StringSize};`,
          ),
          replaceWithNoMatchCheck(
            'limit?: number',
            `limit?: ${brandedNumber.ArraySizeArgNonNegative}`,
          ),
        ),
      }),
    ).value;
