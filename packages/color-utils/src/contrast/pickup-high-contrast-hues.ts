import { Hue, max, Percent, seq, zeros } from 'noshiro-ts-utils';
import { relativeLuminance } from '.';
import { hslToRgb } from '../convert/hsl-to-rgb';
import { getLuminanceListAccumulated } from './get-luminance-list-acc';

// constants
const hues: Hue[] = seq(360) as Hue[];

/**
 * relativeLuminanceの差分を累積した分布関数を縦軸yでn等分して、対応するx座標（＝hue）を返す
 */
export const pickupHighContrastHues = (
  n: number,
  saturation: Percent,
  lightness: Percent
): Hue[] => {
  const luminanceList: readonly number[] = hues.map((hue: Hue) =>
    relativeLuminance(hslToRgb([hue, saturation, lightness]))
  );

  const luminanceDiffAccumulated: readonly number[] = getLuminanceListAccumulated(
    luminanceList
  );

  /* pickup n hues */

  const result = zeros(n) as Hue[];

  let [i, y] = [0, 0];

  const maxValue = max(luminanceDiffAccumulated);
  if (maxValue === undefined) return [];
  for (const [x, value] of luminanceDiffAccumulated.entries()) {
    if (value > y) {
      result[i] = x as Hue;
      [i, y] = [i + 1, (maxValue * (i + 1)) / n];
    }
  }

  return result;
};
