import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp } from './common.mjs';

export const convertLibEs5_NumberConstructor = (
  source: string,
  commentOutDeprecated: boolean,
): string =>
  pipe(source).chain(
    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: 'interface NumberConstructor {',
      endRegexp: closeBraceRegexp,
      mapFn: (slice) =>
        pipe(slice).chainMonoTypeFns(
          ['new (value?: unknown): Number;', '(value?: unknown): number;'].map(
            (line) =>
              replaceWithNoMatchCheck(
                line,
                [
                  "  /** @deprecated Don't use Number constructor */",
                  commentOutDeprecated ? `// ${line}` : line,
                ].join('\n'),
              ),
          ),
        ).value,
    }),
  ).value;
