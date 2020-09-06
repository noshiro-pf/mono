import { hslToRgb, relativeLuminance } from '@mono/color-utils';
import { Hue, max, Percent, seq, zeros } from '@mono/ts-utils';
import { getLuminanceListAccumulated } from './luminance-list-accumulated';

const huesDefault = seq(360) as readonly Hue[];

/**
 * relativeLuminanceの差分を累積した分布関数を縦軸yでn等分して、対応するx座標（＝hue）を返す
 */
export const pickupHighContrastHues = (
  n: number,
  saturation: Percent,
  lightness: Percent,
  firstHue: Hue = 0,
  useLog: boolean
): Hue[] => {
  const hues = huesDefault.map((h) => ((h - firstHue + 360) % 360) as Hue);

  const luminanceList: number[] = hues.map((hue) =>
    relativeLuminance(hslToRgb([hue, saturation, lightness]))
  );

  const luminanceDiffAccumulated: number[] = getLuminanceListAccumulated(
    luminanceList,
    useLog
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
