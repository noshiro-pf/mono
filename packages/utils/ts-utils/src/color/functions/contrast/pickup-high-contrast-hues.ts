import {
  map,
  max,
  NonEmptyArray,
  ReadonlyNonEmptyArray,
  seq,
  zeros,
} from '../../../array';
import { pipe } from '../../../functional';
import { isUint32, Percent, uint32 } from '../../../types';
import { Hue } from '../../types';
import { hslToRgb } from '../rgb-hsl-conversion';
import { getLuminanceListAccumulated } from './get-luminance-list-acc';
import { relativeLuminance } from './relative-luminance';

// constants
const hues = (seq(360 as uint32) as unknown) as ReadonlyNonEmptyArray<Hue>;

/**
 * relativeLuminanceの差分を累積した分布関数を縦軸yでn等分して、対応するx座標（＝hue）を返す
 */
export const pickupHighContrastHues = (
  n: number,
  saturation: Percent,
  lightness: Percent
): NonEmptyArray<Hue> | undefined => {
  if (!isUint32(n) || n < 1) return undefined;

  const luminanceList = pipe(hues).chain(
    map((hue: Hue) => relativeLuminance(hslToRgb([hue, saturation, lightness])))
  ).value;

  const luminanceDiffAccumulated = getLuminanceListAccumulated(luminanceList);

  /* pickup n hues */
  const result = zeros(n) as NonEmptyArray<Hue>;

  let [i, y] = [0, 0];

  const maxValue = max(luminanceDiffAccumulated);
  if (maxValue === undefined) return undefined;
  for (const [x, value] of luminanceDiffAccumulated.entries()) {
    if (value > y) {
      result[i] = x as Hue;
      [i, y] = [i + 1, (maxValue * (i + 1)) / n];
    }
  }

  return result;
};
