import dedent from 'dedent';
import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '../functions/utils/node-utils.mjs';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';

export const convertLibEs5_NumberConstructor =
  ({
    config: { commentOutDeprecated },
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: 'interface NumberConstructor {',
          endRegexp: closeBraceRegexp,
          mapFn: composeMonoTypeFns(
            ...[
              //
              'new (value?: unknown): Number;',
            ].map((line) =>
              replaceWithNoMatchCheck(
                line,
                dedent`
                    /** @deprecated Don't use Number constructor */
                  ${commentOutDeprecated ? `// ${line}` : line}
                `,
              ),
            ),
          ),
        }),
      ),
    ).value;
