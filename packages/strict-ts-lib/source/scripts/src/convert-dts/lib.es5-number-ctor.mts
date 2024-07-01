import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';

export const convertLibEs5_NumberConstructor = ({
  config: { commentOutDeprecated },
}: ConverterOptions): MonoTypeFunction<string> =>
  replaceWithNoMatchCheckBetweenRegexp({
    startRegexp: 'interface NumberConstructor {',
    endRegexp: closeBraceRegexp,
    mapFn: composeMonoTypeFns(
      ...[
        //
        'new (value?: unknown): Number;',
        '(value?: unknown): number;',
      ].map((line) =>
        replaceWithNoMatchCheck(
          line,
          [
            "  /** @deprecated Don't use Number constructor */",
            commentOutDeprecated ? `// ${line}` : line,
          ].join('\n'),
        ),
      ),
    ),
  });
