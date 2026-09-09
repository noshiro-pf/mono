import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '../functions/utils/node-utils.mjs';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';
import { convertStringReplacerArgs } from './convert-string-replacer-args.mjs';

export const convertEs2015SymbolWellknown =
  ({ brandedNumber }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
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

        // Three occurrences here — `RegExp[Symbol.replace]` and the two in
        // `String.prototype.replace`'s object-searchValue overload — and they
        // have to agree with the ones in `lib.es5.d.ts`. Applied to the whole
        // file rather than per interface: the innermost of the three sits in a
        // structural type inside a parameter, not in an interface body.
        convertStringReplacerArgs,
      ),
    ).value;
