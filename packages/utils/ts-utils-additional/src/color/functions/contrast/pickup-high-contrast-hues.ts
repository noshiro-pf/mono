import { Arr, Num, Tpl } from '@noshiro/ts-utils';
import { toHue } from '../../to-hue';
import { type Hue } from '../../types';
import { hslToRgb } from '../rgb-hsl-conversion';
import { getLuminanceListAccumulated } from './get-luminance-list-acc';
import { relativeLuminance } from './relative-luminance';

const hues = Arr.seq(360) satisfies Seq<360>;

/**
 * relativeLuminanceの差分を累積した分布関数を縦軸yでn等分して、対応するx座標（=hue）を返す
 */
export function pickupHighContrastHues<N extends SmallUint>(
  n: N,
  saturation: Percent,
  lightness: Percent,
): ArrayOfLength<N, Hue>;
export function pickupHighContrastHues(
  n: PositiveSafeIntWithSmallInt,
  saturation: Percent,
  lightness: Percent,
): NonEmptyArray<Hue>;
export function pickupHighContrastHues(
  n: SafeUintWithSmallInt,
  saturation: Percent,
  lightness: Percent,
): NonEmptyArray<Hue> | undefined {
  if (!Num.isPositive(n)) return undefined;

  const luminanceList: ArrayOfLength<360, NonNegativeFiniteNumber> = Tpl.map(
    hues,
    (hue) => relativeLuminance(hslToRgb([hue, saturation, lightness])),
  );

  const luminanceDiffAccumulated: NonEmptyArray<FiniteNumber> =
    getLuminanceListAccumulated(luminanceList);

  /* pickup n hues */

  const mut_result: MutableNonEmptyArray<Hue> = Arr.asMut(Arr.zeros(n));

  let mut_i = 0;
  let mut_y = 0;

  const maxValue = Arr.max(luminanceDiffAccumulated);

  for (const [x, value] of luminanceDiffAccumulated.entries()) {
    if (value > mut_y) {
      mut_result[mut_i] = toHue(x);
      [mut_i, mut_y] = [mut_i + 1, (maxValue * (mut_i + 1)) / n];
    }
  }

  return mut_result;
}
