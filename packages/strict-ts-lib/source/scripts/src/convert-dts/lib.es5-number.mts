import {
  composeMonoTypeFns,
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/node-utils';
import { closeBraceRegexp } from './common.mjs';

export const convertLibEs5_Number: MonoTypeFunction<string> = (src) =>
  pipe(src).chainMonoTypeFns(
    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: 'interface Number {',
      endRegexp: closeBraceRegexp,
      mapFn: composeMonoTypeFns(
        replaceWithNoMatchCheck(
          'toString(radix?: number): string;',
          'toString(radix?: UintRange<2, 37>): string;',
        ),
        replaceWithNoMatchCheck(
          'toFixed(fractionDigits?: number): string;',
          'toFixed(fractionDigits?: UintRange<0, 101>): string;',
        ),
        replaceWithNoMatchCheck(
          'toExponential(fractionDigits?: number): string;',
          'toExponential(fractionDigits?: UintRange<1, 101>): string;',
        ),
        replaceWithNoMatchCheck(
          'toPrecision(precision?: number): string;',
          'toPrecision(precision?: UintRange<1, 101>): string;',
        ),
      ),
    }),
  ).value;
