import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';

export const convertLibEs5_BooleanConstructor = ({
  config: { commentOutDeprecated },
}: ConverterOptions): MonoTypeFunction<string> =>
  replaceWithNoMatchCheckBetweenRegexp({
    startRegexp: 'interface BooleanConstructor {',
    endRegexp: closeBraceRegexp,
    mapFn: composeMonoTypeFns(
      ...[
        //
        'new (value?: unknown): Boolean;',
        '<T>(value?: T): boolean;',
      ].map((line) =>
        replaceWithNoMatchCheck(
          line,
          [
            "  /** @deprecated Don't use Boolean constructor */",
            commentOutDeprecated ? `// ${line}` : line,
          ].join('\n'),
        ),
      ),
    ),
  });
