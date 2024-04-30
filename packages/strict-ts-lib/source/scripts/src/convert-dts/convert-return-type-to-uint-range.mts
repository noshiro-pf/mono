// lib.es5.d.ts' && filename !== 'lib.es2018.intl.d.ts

import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';

export const convertReturnTypeToUintRange = (source: string): string =>
  pipe(source)
    .chain(
      replaceWithNoMatchCheck(
        'minimumIntegerDigits?: number | undefined',
        'minimumIntegerDigits?: UintRange<1, 22> | undefined',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'minimumSignificantDigits?: number | undefined',
        'minimumSignificantDigits?: UintRange<1, 22> | undefined',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'maximumSignificantDigits?: number | undefined',
        'maximumSignificantDigits?: UintRange<1, 22> | undefined',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'minimumFractionDigits?: number | undefined',
        'minimumFractionDigits?: UintRange<0, 21> | undefined',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'maximumFractionDigits?: number | undefined',
        'maximumFractionDigits?: UintRange<0, 21> | undefined',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'minimumIntegerDigits: number;',
        'minimumIntegerDigits: UintRange<1, 22>;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'minimumSignificantDigits?: number;',
        'minimumSignificantDigits?: UintRange<1, 22>;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'maximumSignificantDigits?: number;',
        'maximumSignificantDigits?: UintRange<1, 22>;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'minimumFractionDigits: number;',
        'minimumFractionDigits: UintRange<0, 21>;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'maximumFractionDigits: number;',
        'maximumFractionDigits: UintRange<0, 21>;',
      ),
    ).value;
