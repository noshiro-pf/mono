import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-utils';

export const convertReturnTypeToUintRange: MonoTypeFunction<string> = (src) =>
  pipe(src).chainMonoTypeFns(
    replaceWithNoMatchCheck(
      'minimumIntegerDigits?: number | undefined',
      'minimumIntegerDigits?: UintRange<1, 22> | undefined',
    ),
    replaceWithNoMatchCheck(
      'minimumIntegerDigits: number;',
      'minimumIntegerDigits: UintRange<1, 22>;',
    ),
    replaceWithNoMatchCheck(
      'minimumSignificantDigits?: number | undefined',
      'minimumSignificantDigits?: UintRange<1, 22> | undefined',
    ),
    replaceWithNoMatchCheck(
      'minimumSignificantDigits?: number;',
      'minimumSignificantDigits?: UintRange<1, 22>;',
    ),
    replaceWithNoMatchCheck(
      'maximumSignificantDigits?: number | undefined',
      'maximumSignificantDigits?: UintRange<1, 22> | undefined',
    ),
    replaceWithNoMatchCheck(
      'maximumSignificantDigits?: number;',
      'maximumSignificantDigits?: UintRange<1, 22>;',
    ),
    replaceWithNoMatchCheck(
      'minimumFractionDigits?: number | undefined',
      'minimumFractionDigits?: UintRange<0, 21> | undefined',
    ),
    replaceWithNoMatchCheck(
      'minimumFractionDigits?: number;',
      'minimumFractionDigits?: UintRange<0, 21>;',
      { onNotFound: 'off' },
    ),
    replaceWithNoMatchCheck(
      'minimumFractionDigits: number;',
      'minimumFractionDigits: UintRange<0, 21>;',
      { onNotFound: 'off' },
    ),
    replaceWithNoMatchCheck(
      'maximumFractionDigits?: number | undefined',
      'maximumFractionDigits?: UintRange<0, 21> | undefined',
    ),
    replaceWithNoMatchCheck(
      'maximumFractionDigits?: number;',
      'maximumFractionDigits?: UintRange<0, 21>;',
      { onNotFound: 'off' },
    ),
    replaceWithNoMatchCheck(
      'maximumFractionDigits: number;',
      'maximumFractionDigits: UintRange<0, 21>;',
      { onNotFound: 'off' },
    ),
  ).value;
