import dedent from 'dedent';
import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithinInterface,
} from '../functions/utils/node-utils.mjs';
import { type ConverterOptions } from './common.mjs';

export const convertLibEs5_BooleanConstructor =
  ({
    config: { commentOutDeprecated },
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        replaceWithinInterface({
          name: 'BooleanConstructor',
          mapFn: composeMonoTypeFns(
            ...[
              //
              'new (value?: unknown): Boolean;',
              '<T>(value?: T): boolean;',
            ].map((line) =>
              replaceWithNoMatchCheck(
                line,
                dedent`
                    /** @deprecated Don't use Boolean constructor */
                  ${commentOutDeprecated ? `// ${line}` : line}
                `,
              ),
            ),
          ),
        }),
      ),
    ).value;
