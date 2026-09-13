import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithinInterface,
} from '../functions/utils/node-utils.mjs';

export const convertLibEs5_Number: MonoTypeFunction<string> = (src) =>
  pipe(src).map(
    composeMonoTypeFns(
      replaceWithinInterface({
        name: 'Number',
        mapFn: composeMonoTypeFns(
          replaceWithNoMatchCheck(
            'toString(radix?: number): string;',
            'toString(radix?: UintRangeInclusive<2, 36>): string;',
          ),
          replaceWithNoMatchCheck(
            'toFixed(fractionDigits?: number): string;',
            'toFixed(fractionDigits?: UintRangeInclusive<0, 100>): string;',
          ),
          replaceWithNoMatchCheck(
            'toExponential(fractionDigits?: number): string;',
            'toExponential(fractionDigits?: UintRangeInclusive<0, 100>): string;',
          ),
          replaceWithNoMatchCheck(
            'toPrecision(precision?: number): string;',
            'toPrecision(precision?: UintRangeInclusive<1, 100>): string;',
          ),
        ),
      }),
    ),
  ).value;
