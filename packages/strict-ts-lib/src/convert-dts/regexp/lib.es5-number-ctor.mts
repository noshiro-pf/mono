import {
  composeMonoTypeFns,
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-utils';
import { closeBraceRegexp, type ConverterOptions } from '../common.mjs';

export const convertLibEs5_NumberConstructor =
  ({
    config: { commentOutDeprecated },
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).chainMonoTypeFns(
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
              [
                "  /** @deprecated Don't use Number constructor */",
                commentOutDeprecated ? `// ${line}` : line,
              ].join('\n'),
            ),
          ),
        ),
      }),
    ).value;
