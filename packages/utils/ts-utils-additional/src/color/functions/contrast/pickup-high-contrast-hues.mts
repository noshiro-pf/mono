import {
  Arr,
  FiniteNumber,
  Num,
  SafeUint,
  Tpl,
  toPositiveFiniteNumber,
  toSafeUint,
  toUint16,
} from '@noshiro/ts-utils';
import { toHue } from '../../to-hue.mjs';
import { type Hue } from '../../types/index.mjs';
import { hslToRgb } from '../rgb-hsl-conversion/index.mjs';
import { getLuminanceListAccumulated } from './get-luminance-list-acc.mjs';
import { relativeLuminance } from './relative-luminance.mjs';

// eslint-disable-next-line total-functions/no-unsafe-type-assertion
const hues = Arr.seq(toUint16(360)) as unknown as Seq<360>;

/** RelativeLuminanceの差分を累積した分布関数を縦軸yでn等分して、対応するx座標（=hue）を返す */
export function pickupHighContrastHues<N extends SmallUint>(
  n: N,
  saturation: Percent,
  lightness: Percent,
): ArrayOfLength<N, Hue>;
export function pickupHighContrastHues(
  n: NumberType.ArraySizeArgPositive,
  saturation: Percent,
  lightness: Percent,
): NonEmptyArray<Hue>;
export function pickupHighContrastHues(
  n: NumberType.ArraySizeArgNonNegative,
  saturation: Percent,
  lightness: Percent,
): NonEmptyArray<Hue> | undefined {
  if (!Num.isPositive(n)) return undefined;

  const luminanceList: ArrayOfLength<360, NonNegativeFiniteNumber> = Tpl.map(
    hues,
    (hue) => relativeLuminance(hslToRgb([hue, saturation, lightness])),
  );

  const luminanceDiffAccumulated: NonEmptyArray<NonNegativeFiniteNumber> =
    getLuminanceListAccumulated(luminanceList);

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
