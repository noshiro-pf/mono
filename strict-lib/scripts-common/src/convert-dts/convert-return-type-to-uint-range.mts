import { pipe } from 'ts-data-forge';
import type { MonoTypeFunction } from 'ts-type-forge';
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
      // Fraction digits are 0–100 after ECMA-402 2023, in every lib file; an
      // engine older than that edition throws a RangeError above 20. Each field
      // has a call for the options and a regex for the resolved options, whose
      // field is optional or required by lib file and version. The regexes take
      // any whitespace after the colon.
      replaceWithNoMatchCheck(
        'minimumFractionDigits?: number | undefined',
        'minimumFractionDigits?: UintRangeInclusive<0, 100> | undefined',
      ),
      replaceWithNoMatchCheck(
        /\b(minimumFractionDigits\??):\s*number;/gu,
        '$1: UintRangeInclusive<0, 100>;',
      ),
      replaceWithNoMatchCheck(
        'maximumFractionDigits?: number | undefined',
        'maximumFractionDigits?: UintRangeInclusive<0, 100> | undefined',
      ),
      replaceWithNoMatchCheck(
        /\b(maximumFractionDigits\??):\s*number;/gu,
        '$1: UintRangeInclusive<0, 100>;',
      ),
    ),
  ).value;
