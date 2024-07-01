import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp } from './common.mjs';

export const convertLibEs5_Number = (): MonoTypeFunction<string> =>
  replaceWithNoMatchCheckBetweenRegexp({
    startRegexp: 'interface Number {',
    endRegexp: closeBraceRegexp,
    mapFn: composeMonoTypeFns(
      replaceWithNoMatchCheck(
        'toString(radix?: number): string;',
        // eslint-disable-next-line no-template-curly-in-string
        'toString(radix?: UintRange<2, 37>): `${number}`;',
      ),
      replaceWithNoMatchCheck(
        'toFixed(fractionDigits?: number): string;',
        // eslint-disable-next-line no-template-curly-in-string
        'toFixed(fractionDigits?: UintRange<0, 21>): `${number}`;',
      ),
      replaceWithNoMatchCheck(
        'toExponential(fractionDigits?: number): string;',
        // eslint-disable-next-line no-template-curly-in-string
        'toExponential(fractionDigits?: UintRange<0, 21>): `${number}`;',
      ),
      replaceWithNoMatchCheck(
        'toPrecision(precision?: number): string;',
        // eslint-disable-next-line no-template-curly-in-string
        'toPrecision(precision?: UintRange<1, 22>): `${number}`;',
      ),
    ),
  });
