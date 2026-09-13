import dedent from 'dedent';
import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithinInterface,
} from '../functions/utils/node-utils.mjs';
import { type ConverterOptions } from './common.mjs';

export const convertLibEs5_StringConstructor =
  ({
    config: { commentOutDeprecated },
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        replaceWithinInterface({
          name: 'StringConstructor',
          mapFn: composeMonoTypeFns(
            ...[
              //
              'new (value?: unknown): String;',
              '(value?: unknown): string;',
            ].map((line) =>
              replaceWithNoMatchCheck(
                line,
                dedent`
                    /** @deprecated Don't use String constructor */
                  ${commentOutDeprecated ? `// ${line}` : line}
                `,
              ),
            ),
          ),
        }),
      ),
    ).value;
