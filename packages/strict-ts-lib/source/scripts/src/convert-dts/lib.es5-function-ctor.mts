import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp } from './common.mjs';

export const convertLibEs5_FunctionConstructor = (
  source: string,
  commentOutDeprecated: boolean,
): string =>
  pipe(source).chain(
    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: 'interface FunctionConstructor {',
      endRegexp: closeBraceRegexp,
      mapFn: (slice) =>
        pipe(slice)
          .chain(
            replaceWithNoMatchCheck(
              [
                '     */\n',
                '    new (...args: readonly string[]): Function;\n',
              ].join(''),
              [
                "     * @deprecated Don't use Function constructor\n",
                '     */\n',
                commentOutDeprecated ? '// ' : '',
                '    new (...args: readonly string[]): Function;\n',
              ].join(''),
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              '  (...args: readonly string[]): Function;\n',
              [
                "  /** @deprecated Don't use Function constructor */\n",
                commentOutDeprecated ? '// ' : '',
                '  (...args: readonly string[]): Function;\n',
              ].join(''),
            ),
          ).value,
    }),
  ).value;
