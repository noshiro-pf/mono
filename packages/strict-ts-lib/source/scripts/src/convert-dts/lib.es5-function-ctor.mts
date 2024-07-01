import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';

export const convertLibEs5_FunctionConstructor = ({
  config: { commentOutDeprecated },
}: ConverterOptions): MonoTypeFunction<string> =>
  replaceWithNoMatchCheckBetweenRegexp({
    startRegexp: 'interface FunctionConstructor {',
    endRegexp: closeBraceRegexp,
    mapFn: composeMonoTypeFns(
      replaceWithNoMatchCheck(
        [
          //
          '   */',
          '  new (...args: readonly string[]): Function;',
        ].join('\n'),
        [
          "   * @deprecated Don't use Function constructor",
          '   */',
          `  ${commentOutDeprecated ? '// ' : ''} new (...args: readonly string[]): Function;`,
        ].join('\n'),
      ),
      replaceWithNoMatchCheck(
        '  (...args: readonly string[]): Function;',
        [
          "  /** @deprecated Don't use Function constructor */",
          `  ${commentOutDeprecated ? '// ' : ''}(...args: readonly string[]): Function;`,
        ].join('\n'),
      ),
    ),
  });
