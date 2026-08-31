import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '../functions/utils/node-utils.mjs';

export const convertReturnTypeToUintRange: MonoTypeFunction<string> = (src) =>
  pipe(src).map(
    composeMonoTypeFns(
      replaceWithNoMatchCheck(
        'minimumIntegerDigits?: number | undefined',
        'minimumIntegerDigits?: UintRangeInclusive<1, 21> | undefined',
      ),
      replaceWithNoMatchCheck(
        'minimumIntegerDigits: number;',
        'minimumIntegerDigits: UintRangeInclusive<1, 21>;',
      ),
      replaceWithNoMatchCheck(
        'minimumSignificantDigits?: number | undefined',
        'minimumSignificantDigits?: UintRangeInclusive<1, 21> | undefined',
      ),
      replaceWithNoMatchCheck(
        'minimumSignificantDigits?: number;',
        'minimumSignificantDigits?: UintRangeInclusive<1, 21>;',
      ),
      replaceWithNoMatchCheck(
        'maximumSignificantDigits?: number | undefined',
        'maximumSignificantDigits?: UintRangeInclusive<1, 21> | undefined',
      ),
      replaceWithNoMatchCheck(
        'maximumSignificantDigits?: number;',
        'maximumSignificantDigits?: UintRangeInclusive<1, 21>;',
      ),
      replaceWithNoMatchCheck(
        'minimumFractionDigits?: number | undefined',
        'minimumFractionDigits?: UintRangeInclusive<0, 20> | undefined',
      ),
      replaceWithNoMatchCheck(
        'minimumFractionDigits?: number;',
        'minimumFractionDigits?: UintRangeInclusive<0, 20>;',
        { onNotFound: 'off' },
      ),
      replaceWithNoMatchCheck(
        'minimumFractionDigits: number;',
        'minimumFractionDigits: UintRangeInclusive<0, 20>;',
        { onNotFound: 'off' },
      ),
      replaceWithNoMatchCheck(
        'maximumFractionDigits?: number | undefined',
        'maximumFractionDigits?: UintRangeInclusive<0, 20> | undefined',
      ),
      replaceWithNoMatchCheck(
        'maximumFractionDigits?: number;',
        'maximumFractionDigits?: UintRangeInclusive<0, 20>;',
        { onNotFound: 'off' },
      ),
      replaceWithNoMatchCheck(
        'maximumFractionDigits: number;',
        'maximumFractionDigits: UintRangeInclusive<0, 20>;',
        { onNotFound: 'off' },
      ),
    ),
  ).value;
