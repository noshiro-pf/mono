import {
  hslToRgb,
  relativeLuminance,
  type Hue,
} from '@noshiro/ts-utils-additional';
import { huesDefault } from '../constants';
import { getLuminanceListAccumulated } from './luminance-list-accumulated';
import { toHue } from './to-hue';

/** RelativeLuminanceの差分を累積した分布関数を縦軸yでn等分して、対応するx座標（=hue）を返す */
export function pickupHighContrastHues<N extends SmallUint>(
  n: N,
  saturation: Percent,
  lightness: Percent,
  firstHue: Hue,
  useLog: boolean,
): ArrayOfLength<N, Hue>;
export function pickupHighContrastHues(
  n: NumberType.ArraySizeArgPositive,
  saturation: Percent,
  lightness: Percent,
  firstHue: Hue,
  useLog: boolean,
): NonEmptyArray<Hue>;
export function pickupHighContrastHues(
  n: NumberType.ArraySizeArgNonNegative,
  saturation: Percent,
  lightness: Percent,
  firstHue: Hue,
  useLog: boolean,
): NonEmptyArray<Hue> | undefined {
  if (!Num.isPositive(n)) return undefined;

  const hues = Tpl.map(huesDefault, (h) => toHue((h - firstHue + 360) % 360));

  const luminanceList: ArrayOfLength<360, NonNegativeFiniteNumber> = Tpl.map(
    hues,
    (hue) => relativeLuminance(hslToRgb([hue, saturation, lightness])),
  );

  const luminanceDiffAccumulated: NonEmptyArray<NonNegativeFiniteNumber> =
    getLuminanceListAccumulated(luminanceList, useLog);

  /* pickup n hues */

  const mut_result: MutableNonEmptyArray<Hue> = Arr.asMut(Arr.zeros(n));

  let mut_i: SafeUint = toSafeUint(0);
  let mut_y = 0;

  const maxValue = Arr.max(luminanceDiffAccumulated);

  for (const [x, value] of luminanceDiffAccumulated.entries()) {
    if (value > mut_y) {
      mut_result[mut_i] = toHue(x);
      [mut_i, mut_y] = [
        SafeUint.add(mut_i, 1),
        Num.div(
          FiniteNumber.mul(maxValue, SafeUint.add(mut_i, 1)),
          toPositiveFiniteNumber(n),
        ),
      ];
    }
  }

  return mut_result;
}
