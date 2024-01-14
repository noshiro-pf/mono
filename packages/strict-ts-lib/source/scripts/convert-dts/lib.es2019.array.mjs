import { pipe } from '@noshiro/mono-scripts/ts-utils/pipe.mjs';
import { replaceWithNoMatchCheck } from '@noshiro/mono-scripts/ts-utils/replace-with-no-match-check.mjs';
import { indexType } from './common.mjs';

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2019Array = (from) =>
  pipe(from)
    .chain(
      replaceWithNoMatchCheck(
        [
          '        readonly (readonly (readonly (readonly (readonly (readonly (readonly (readonly (readonly (readonly [',
          '          -1,',
          '          0,',
          '          1,',
          '          2,',
          '          3,',
          '          4,',
          '          5,',
          '          6,',
          '          7,',
          '          8,',
          '          9,',
          '          10,',
          '          11,',
          '          12,',
          '          13,',
          '          14,',
          '          15,',
          '          16,',
          '          17,',
          '          18,',
          '          19,',
          '          20,',
          '        ][Depth])))))))))',
        ].join('\n'),
        [
          'readonly [',
          '-1,',
          '0,',
          '1,',
          '2,',
          '3,',
          '4,',
          '5,',
          '6,',
          '7,',
          '8,',
          '9,',
          '10,',
          '11,',
          '12,',
          '13,',
          '14,',
          '15,',
          '16,',
          '17,',
          '18,',
          '19,',
          '20,',
          '][Depth]',
        ].join('\n'),
      ),
    )
    .chain(
      // use branded number type in index
      replaceWithNoMatchCheck(
        'index: number',
        `index: ${indexType.callbackArg}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'flat<A, D extends number = 1>(this: A, depth?: D): readonly FlatArray<A, D>[];',
        `flat<A, D extends ${indexType.argNonNegative} = 1>(this: A, depth?: D): readonly FlatArray<A, D>[];`,
      ),
    ).value;
