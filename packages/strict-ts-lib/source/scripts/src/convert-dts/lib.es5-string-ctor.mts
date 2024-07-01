import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';

export const convertLibEs5_StringConstructor = ({
  config: { commentOutDeprecated },
}: ConverterOptions): MonoTypeFunction<string> =>
  replaceWithNoMatchCheckBetweenRegexp({
    startRegexp: 'interface StringConstructor {',
    endRegexp: closeBraceRegexp,
    mapFn: composeMonoTypeFns(
      ...[
        //
        'new (value?: unknown): String;',
        '(value?: unknown): string;',
      ].map((line) =>
        replaceWithNoMatchCheck(
          line,
          [
            "  /** @deprecated Don't use String constructor */",
            commentOutDeprecated ? `// ${line}` : line,
          ].join('\n'),
        ),
      ),
    ),
  });
