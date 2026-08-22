import dedent from 'dedent';
import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '../functions/utils/node-utils.mjs';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';

export const convertLibEs5_ObjectConstructor =
  ({
    config: { commentOutDeprecated },
    readonlyModifier,
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: 'interface ObjectConstructor {',
          endRegexp: closeBraceRegexp,
          mapFn: composeMonoTypeFns(
            ...[
              'new (value?: unknown): Object;',
              '(): unknown;',
              '(value: unknown): unknown;',
            ].map((line) =>
              replaceWithNoMatchCheck(
                line,
                dedent`
                    /** @deprecated Don't use Object constructor */
                  ${commentOutDeprecated ? `// ${line}` : line}
                `,
              ),
            ),
            replaceWithNoMatchCheck(
              dedent`
                 */
                keys(o: object): readonly string[];
              `,
              dedent`
                 *
                 * @example
                 * const ks = Object.keys({ x: 1, y: 2, z: '3', 3: 4 }); // ('3' | 'x' | 'y' | 'z' | (string & {}))[]
                 *
                 */
                keys<const R extends UnknownRecord>(object: R): ${readonlyModifier}StrictLibInternals.ToObjectKeys<R>[];
              `,
            ),
          ),
        }),
      ),
    ).value;
