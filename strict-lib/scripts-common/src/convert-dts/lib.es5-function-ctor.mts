import dedent from 'dedent';
import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithinInterface,
} from '../functions/utils/node-utils.mjs';
import { type ConverterOptions } from './common.mjs';

export const convertLibEs5_FunctionConstructor =
  ({
    config: { commentOutDeprecated },
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        replaceWithinInterface({
          name: 'FunctionConstructor',
          mapFn: composeMonoTypeFns(
            replaceWithNoMatchCheck(
              dedent`
                 */
                new (...args: readonly string[]): Function;
              `,
              dedent`
                 * @deprecated Don't use Function constructor
                 */
                ${commentOutDeprecated ? '// ' : ''} new (...args: readonly string[]): Function;
              `,
            ),
            replaceWithNoMatchCheck(
              '  (...args: readonly string[]): Function;',
              dedent`
                /** @deprecated Don't use Function constructor */
                ${commentOutDeprecated ? '// ' : ''}(...args: readonly string[]): Function;
              `,
            ),
          ),
        }),
      ),
    ).value;
