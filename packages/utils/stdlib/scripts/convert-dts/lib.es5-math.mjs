import { pipe } from './common.mjs';

const marker = {
  start: 'interface Math {',
  end: 'declare const Math: Math;',
};

/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs5_Math = (from) => {
  const slice = from.slice(
    from.indexOf(marker.start),
    from.indexOf(marker.end)
  );

  return from.replaceAll(
    slice,
    pipe(slice).chain((str) => {
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
        str = str.replaceAll(
          `readonly ${a}: number;`,
          `readonly ${a}: PositiveNumber;`
        );
      }

      str = str.replaceAll(
        'abs(x: number): number;',

        [
          'abs<N extends SmallInt>(x: N): AbsoluteValue<N>;',
          'abs<N extends FiniteNumber>(x: N): IntersectBrand<N, NonNegativeNumber>;',
          'abs(x: number): NonNegativeNumber | NaNType;',
        ].join('\n')
      );
      str = str.replaceAll(
        `acos(x: number): number;`,
        `acos(x: number): NonNegativeNumber | NaNType;`
      );

      // The return type is  NonNegativeNumber instead of PositiveNumber
      // because Math.exp(Number.NEGATIVE_INFINITY) == 0
      str = str.replaceAll(
        `exp(x: number): number;`,
        `exp(x: number): NonNegativeNumber | NaNType;`
      );

      str = str.replaceAll(
        `sqrt(x: number): number;`,
        `sqrt(x: number): NonNegativeNumber | NaNType;`
      );

      for (const fn of ['ceil', 'floor', 'round']) {
        str = str.replaceAll(
          `${fn}(x: number): number;`,
          [
            `${fn}<N extends FiniteNumber>(x: N): IntersectBrand<N, Int>;`,
            `${fn}(x: number): Int | InfiniteNumber | NaNType;`,
          ].join('\n')
        );
      }
      return str;
    }).value
  );
};
