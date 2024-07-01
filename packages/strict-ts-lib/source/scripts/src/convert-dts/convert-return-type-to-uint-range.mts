import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '@noshiro/mono-scripts';

export const convertReturnTypeToUintRange = composeMonoTypeFns(
  replaceWithNoMatchCheck(
    'minimumIntegerDigits?: number | undefined',
    'minimumIntegerDigits?: UintRange<1, 22> | undefined',
  ),
  replaceWithNoMatchCheck(
    'minimumSignificantDigits?: number | undefined',
    'minimumSignificantDigits?: UintRange<1, 22> | undefined',
  ),
  replaceWithNoMatchCheck(
    'maximumSignificantDigits?: number | undefined',
    'maximumSignificantDigits?: UintRange<1, 22> | undefined',
  ),
  replaceWithNoMatchCheck(
    'minimumFractionDigits?: number | undefined',
    'minimumFractionDigits?: UintRange<0, 21> | undefined',
  ),
  replaceWithNoMatchCheck(
    'maximumFractionDigits?: number | undefined',
    'maximumFractionDigits?: UintRange<0, 21> | undefined',
  ),
  replaceWithNoMatchCheck(
    'minimumIntegerDigits: number;',
    'minimumIntegerDigits: UintRange<1, 22>;',
  ),
  replaceWithNoMatchCheck(
    'minimumSignificantDigits?: number;',
    'minimumSignificantDigits?: UintRange<1, 22>;',
  ),
  replaceWithNoMatchCheck(
    'maximumSignificantDigits?: number;',
    'maximumSignificantDigits?: UintRange<1, 22>;',
  ),
  replaceWithNoMatchCheck(
    'minimumFractionDigits: number;',
    'minimumFractionDigits: UintRange<0, 21>;',
  ),
  replaceWithNoMatchCheck(
    'maximumFractionDigits: number;',
    'maximumFractionDigits: UintRange<0, 21>;',
  ),
);
