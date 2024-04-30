import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp } from './common.mjs';

export const convertLibEs5_ObjectConstructor = (
  source: string,
  commentOutDeprecated: boolean,
): string =>
  pipe(source).chain(
    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: 'interface ObjectConstructor {',
      endRegexp: closeBraceRegexp,
      mapFn: (slice) =>
        pipe(slice).chainMonoTypeFns(
          [
            'new (value?: unknown): Object;',
            '(): unknown;',
            '(value: unknown): unknown;',
          ].map((line) =>
            replaceWithNoMatchCheck(
              line,
              [
                "  /** @deprecated Don't use Object constructor */",
                commentOutDeprecated ? `// ${line}` : line,
              ].join('\n'),
            ),
          ),
        ).value,
    }),
  ).value;
