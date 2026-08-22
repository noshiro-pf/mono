import dedent from 'dedent';
import { Arr, pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '../functions/utils/node-utils.mjs';
import { closeBraceRegexp, idFn, type ConverterOptions } from './common.mjs';

export const convertLibEs5_Math =
  ({
    config: { useBrandedNumber },
    brandedNumber,
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: 'interface Math {',
          endRegexp: closeBraceRegexp,
          mapFn: composeMonoTypeFns(
            ...(!useBrandedNumber
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
              Arr.toUnshifted(
                `abs<N extends ${useBrandedNumber ? 'SmallInt' : 'number'}>(x: N): AbsoluteValue<N>;`,
              )(
                !useBrandedNumber
                  ? ['abs(x: number): number;']
                  : [
                      `abs<N extends ${brandedNumber.FiniteNumber}>(x: N): IntersectBrand<N, ${brandedNumber.NonNegativeNumber}>;`,
                      `abs(x: number): ${brandedNumber.NonNegativeNumber} | ${brandedNumber.NaNType};`,
                    ],
              ).join('\n'),
            ),
            !useBrandedNumber
              ? idFn
              : replaceWithNoMatchCheck(
                  `acos(x: number): number;`,
                  `acos(x: number): ${brandedNumber.NonNegativeNumber} | ${brandedNumber.NaNType};`,
                ),

            // The return type is NonNegativeNumber instead of PositiveNumber
            // because Math.exp(Number.NEGATIVE_INFINITY) == 0
            !useBrandedNumber
              ? idFn
              : replaceWithNoMatchCheck(
                  `exp(x: number): number;`,
                  `exp(x: number): ${brandedNumber.NonNegativeNumber} | ${brandedNumber.NaNType};`,
                ),
            !useBrandedNumber
              ? idFn
              : replaceWithNoMatchCheck(
                  `sqrt(x: number): number;`,
                  `sqrt(x: number): ${brandedNumber.NonNegativeNumber} | ${brandedNumber.NaNType};`,
                ),
            !useBrandedNumber
              ? idFn
              : replaceWithNoMatchCheck(
                  `random(): number;`,
                  `random(): ${brandedNumber.NonNegativeNumber};`,
                ),

            ...(!useBrandedNumber
              ? []
              : ['ceil', 'floor', 'round'].map((fn) =>
                  replaceWithNoMatchCheck(
                    `${fn}(x: number): number;`,
                    dedent`
                      ${fn}<N extends ${brandedNumber.FiniteNumber}>(x: N): IntersectBrand<N, ${brandedNumber.Int}>;
                      ${fn}(x: number): ${brandedNumber.Int} | ${brandedNumber.InfiniteNumber} | ${brandedNumber.NaNType};
                    `,
                  ),
                )),
          ),
        }),
      ),
    ).value;
