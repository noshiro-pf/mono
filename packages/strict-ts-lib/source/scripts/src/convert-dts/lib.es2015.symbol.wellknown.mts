import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp } from './common.mjs';

export const convertEs2015SymbolWellknown = (source: string): string =>
  pipe(source)
    .chain(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface Array<T> {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice).chain(
            // revert eslint fix
            replaceWithNoMatchCheck(
              '[K in keyof readonly unknown[]]',
              '[K in keyof (readonly any[])]',
            ),
          ).value,
      }),
    )
    .chain(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface ReadonlyArray<T> {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice).chain(
            // revert eslint fix
            replaceWithNoMatchCheck(
              '[K in keyof readonly unknown[]]',
              '[K in keyof (readonly any[])]',
            ),
          ).value,
      }),
    ).value;
