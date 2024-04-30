import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { closeBraceRegexp } from './common.mjs';

export const convertLibEs5_Math = (source: string): string =>
  pipe(source).chain(
    replaceWithNoMatchCheckBetweenRegexp({
      startRegexp: 'interface Math {',
      endRegexp: closeBraceRegexp,
      mapFn: (slice) =>
        pipe(slice)
          .chainMonoTypeFns(
            [
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
                `readonly ${a}: PositiveNumber;`,
              ),
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'abs(x: number): number;',

              [
                'abs<N extends SmallInt>(x: N): AbsoluteValue<N>;',
                'abs<N extends FiniteNumber>(x: N): IntersectBrand<N, NonNegativeNumber>;',
                'abs(x: number): NonNegativeNumber | NaNType;',
              ].join('\n'),
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `acos(x: number): number;`,
              `acos(x: number): NonNegativeNumber | NaNType;`,
            ),
          )
          .chain(
            // The return type is NonNegativeNumber instead of PositiveNumber
            // because Math.exp(Number.NEGATIVE_INFINITY) == 0
            replaceWithNoMatchCheck(
              `exp(x: number): number;`,
              `exp(x: number): NonNegativeNumber | NaNType;`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `sqrt(x: number): number;`,
              `sqrt(x: number): NonNegativeNumber | NaNType;`,
            ),
          )
          .chainMonoTypeFns(
            ['ceil', 'floor', 'round'].map((fn) =>
              replaceWithNoMatchCheck(
                `${fn}(x: number): number;`,
                [
                  `${fn}<N extends FiniteNumber>(x: N): IntersectBrand<N, Int>;`,
                  `${fn}(x: number): Int | InfiniteNumber | NaNType;`,
                ].join('\n'),
              ),
            ),
          ).value,
    }),
  ).value;
