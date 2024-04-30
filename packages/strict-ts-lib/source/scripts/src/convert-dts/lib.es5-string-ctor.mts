import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp } from './common.mjs';

export const convertLibEs5_StringConstructor = (
  source: string,
  commentOutDeprecated: boolean,
): string =>
  pipe(source).chain(
    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: 'interface StringConstructor {',
      endRegexp: closeBraceRegexp,
      mapFn: (slice) =>
        pipe(slice).chainMonoTypeFns(
          ['new (value?: unknown): String;', '(value?: unknown): string;'].map(
            (line) =>
              replaceWithNoMatchCheck(
                line,
                [
                  "  /** @deprecated Don't use String constructor */",
                  commentOutDeprecated ? `// ${line}` : line,
                ].join('\n'),
              ),
          ),
        ).value,
    }),
  ).value;
