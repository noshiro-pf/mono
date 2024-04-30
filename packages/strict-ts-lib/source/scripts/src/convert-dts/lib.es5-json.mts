import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp } from './common.mjs';

export const convertLibEs5_Json = (source: string): string =>
  pipe(source).chain(
    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: 'interface JSON {',
      endRegexp: closeBraceRegexp,
      mapFn: (slice) =>
        pipe(slice)
          .chain(
            replaceWithNoMatchCheck(
              //
              `): unknown;`,
              `): MutableJSONValue;`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'space?: string | number',
              'space?: string | UintRange<1, 11>',
            ),
          ).value,
    }),
  ).value;
