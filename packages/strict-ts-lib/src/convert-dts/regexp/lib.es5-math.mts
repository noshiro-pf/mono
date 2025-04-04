import {
  composeMonoTypeFns,
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-utils';
import { closeBraceRegexp, idFn, type ConverterOptions } from '../common.mjs';

export const convertLibEs5_Math =
  ({
    config: { numberType },
    brandedNumber,
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).chainMonoTypeFns(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface Math {',
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          ...(numberType === 'normal'
            ? []
            : [
                'E',
                'LN10',
                'LN2',
                'LOG2E',
                'LOG10E',
                'PI',
                'SQRT1_2',
                'SQRT2',
              ].map((a) =>
                replaceWithNoMatchCheck(
                  `readonly ${a}: number;`,
                  `readonly ${a}: ${brandedNumber.PositiveNumber};`,
                ),
              )),

          replaceWithNoMatchCheck(
            'abs(x: number): number;',
            [
              `abs<N extends ${numberType === 'normal' ? 'number' : 'SmallInt'}>(x: N): AbsoluteValue<N>;`,
              ...(numberType === 'normal'
                ? ['abs(x: number): number;']
                : [
                    `abs<N extends ${brandedNumber.FiniteNumber}>(x: N): IntersectBrand<N, ${brandedNumber.NonNegativeNumber}>;`,
                    `abs(x: number): ${brandedNumber.NonNegativeNumber} | ${brandedNumber.NaNType};`,
                  ]),
            ].join('\n'),
          ),
          numberType === 'normal'
            ? idFn
            : replaceWithNoMatchCheck(
                `acos(x: number): number;`,
                `acos(x: number): ${brandedNumber.NonNegativeNumber} | ${brandedNumber.NaNType};`,
              ),

          // The return type is NonNegativeNumber instead of PositiveNumber
          // because Math.exp(Number.NEGATIVE_INFINITY) == 0
          numberType === 'normal'
            ? idFn
            : replaceWithNoMatchCheck(
                `exp(x: number): number;`,
                `exp(x: number): ${brandedNumber.NonNegativeNumber} | ${brandedNumber.NaNType};`,
              ),
          numberType === 'normal'
            ? idFn
            : replaceWithNoMatchCheck(
                `sqrt(x: number): number;`,
                `sqrt(x: number): ${brandedNumber.NonNegativeNumber} | ${brandedNumber.NaNType};`,
              ),
          numberType === 'normal'
            ? idFn
            : replaceWithNoMatchCheck(
                `random(): number;`,
                `random(): ${brandedNumber.NonNegativeNumber};`,
              ),

          ...(numberType === 'normal'
            ? []
            : ['ceil', 'floor', 'round'].map((fn) =>
                replaceWithNoMatchCheck(
                  `${fn}(x: number): number;`,
                  [
                    `${fn}<N extends ${brandedNumber.FiniteNumber}>(x: N): IntersectBrand<N, ${brandedNumber.Int}>;`,
                    `${fn}(x: number): ${brandedNumber.Int} | ${brandedNumber.InfiniteNumber} | ${brandedNumber.NaNType};`,
                  ].join('\n'),
                ),
              )),
        ),
      }),
    ).value;
