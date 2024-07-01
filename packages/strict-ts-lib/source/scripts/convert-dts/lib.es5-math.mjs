import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';

const marker = {
  start: 'interface Math {',
  end: 'declare const Math: Math;',
};

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs5_Math = (from) => {
  const slice = from.slice(
    from.indexOf(marker.start),
    from.indexOf(marker.end),
  );

  return pipe(from).chain(
    replaceWithNoMatchCheck(
      slice,
      pipe(slice).chain((str) => {
        let mut_str = str;

        for (const a of [
          'E',
          'LN10',
          'LN2',
          'LOG2E',
          'LOG10E',
          'PI',
          'SQRT1_2',
          'SQRT2',
        ]) {
          mut_str = pipe(mut_str).chain(
            replaceWithNoMatchCheck(
              `readonly ${a}: number;`,
              `readonly ${a}: PositiveNumber;`,
            ),
          ).value;
        }

        mut_str = pipe(mut_str)
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
            // The return type is  NonNegativeNumber instead of PositiveNumber
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
          ).value;

        for (const fn of ['ceil', 'floor', 'round']) {
          mut_str = pipe(mut_str).chain(
            replaceWithNoMatchCheck(
              `${fn}(x: number): number;`,
              [
                `${fn}<N extends FiniteNumber>(x: N): IntersectBrand<N, Int>;`,
                `${fn}(x: number): Int | InfiniteNumber | NaNType;`,
              ].join('\n'),
            ),
          ).value;
        }
        return mut_str;
      }).value,
    ),
  ).value;
};
