import { Arr, pipe, Tpl } from '@noshiro/ts-utils';
import { type Hue } from '../../types';
import { hslToRgb } from '../rgb-hsl-conversion';
import { getLuminanceListAccumulated } from './get-luminance-list-acc';
import { relativeLuminance } from './relative-luminance';

// constants
const hues = Arr.seq(360);

/**
 * relativeLuminanceの差分を累積した分布関数を縦軸yでn等分して、対応するx座標（=hue）を返す
 */
export const pickupHighContrastHues = (
  n: SafeUint,
  saturation: Percent,
  lightness: Percent
): NonEmptyArray<Hue> | undefined => {
  if (n < 1) return undefined;

  const luminanceList = pipe(hues).chain((list) =>
    Tpl.map(list, (hue: Hue) =>
      relativeLuminance(hslToRgb([hue, saturation, lightness]))
    )
  ).value;

  const luminanceDiffAccumulated = getLuminanceListAccumulated(luminanceList);

  /* pickup n hues */
  const mut_result: Hue[] = Arr.asMut(Arr.zeros(n));

  let mut_i = 0;
  let mut_y = 0;

  const maxValue = Arr.max(luminanceDiffAccumulated);

  for (const [x, value] of luminanceDiffAccumulated.entries()) {
    if (value > mut_y) {
      mut_result[mut_i] = x as Hue;
      [mut_i, mut_y] = [mut_i + 1, (maxValue * (mut_i + 1)) / n];
    }
  }

  return mut_result as MutableNonEmptyArray<Hue>; // n >= 1 なので
};
