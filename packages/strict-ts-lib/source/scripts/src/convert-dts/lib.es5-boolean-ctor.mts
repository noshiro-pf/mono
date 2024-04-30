import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp } from './common.mjs';

export const convertLibEs5_BooleanConstructor = (
  source: string,
  commentOutDeprecated: boolean,
): string =>
  pipe(source).chain(
    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: 'interface BooleanConstructor {',
      endRegexp: closeBraceRegexp,
      mapFn: (slice) =>
        pipe(slice).chainMonoTypeFns(
          [
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
        ).value,
    }),
  ).value;
