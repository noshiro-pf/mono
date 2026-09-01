import {
  Arr,
  FiniteNumber,
  Num,
  Optional,
  SafeUint,
  asNonNegativeFiniteNumber,
  asPositiveFiniteNumber,
  asSafeUint,
  type NonNegativeFiniteNumber,
  type SizeType,
} from 'ts-data-forge';
import {
  type FixedLengthTuple,
  type NonEmptyArray,
  type Percent,
  type SmallUint,
} from 'ts-type-forge';
import { hslToRgb, relativeLuminance, type Hue } from 'ts-utils-additional';
import { huesDefault } from '../constants/index.mjs';
import { getLuminanceListAccumulated } from './luminance-list-accumulated.mjs';
import { toHue } from './to-hue.mjs';

/** RelativeLuminanceの差分を累積した分布関数を縦軸yでn等分して、対応するx座標（=hue）を返す */
export function pickupHighContrastHues<N extends SmallUint>(
  n: N,
  saturation: Percent,
  lightness: Percent,
  firstHue: Hue,
  useLog: boolean,
): FixedLengthTuple<N, Hue>;

export function pickupHighContrastHues(
  n: SizeType.ArgArrPositive,
  saturation: Percent,
  lightness: Percent,
  firstHue: Hue,
  useLog: boolean,
): NonEmptyArray<Hue>;

export function pickupHighContrastHues(
  n: SizeType.ArgArr,
  saturation: Percent,
  lightness: Percent,
  firstHue: Hue,
  useLog: boolean,
): NonEmptyArray<Hue> | undefined {
  if (!Num.isPositive(n)) return undefined;

  const hues = Arr.map(huesDefault, (h) => toHue((h - firstHue + 360) % 360));

  const luminanceList: NonEmptyArray<NonNegativeFiniteNumber> = Arr.map(
    hues,
    (hue) => relativeLuminance(hslToRgb([hue, saturation, lightness])),
  );

  const luminanceDiffAccumulated: NonEmptyArray<NonNegativeFiniteNumber> =
    getLuminanceListAccumulated(luminanceList, useLog);

  /* pickup n hues */

  // `Arr.zeros` gives `NonEmptyArray<0>`; `0` is a valid `Hue`, and the map
  // widens the element type so the slots can be overwritten below.
  // A plain mutable array rather than `castMutable(Arr.zeros(n))`: the latter
  // carries `Arr.zeros`'s length-constraint brand, which the declared
  // `NonEmptyArray<Hue>` return type does not accept.
  const mut_result: Hue[] = Arr.zeros(n).map((): Hue => 0);

  let mut_i: SafeUint = asSafeUint(0);

  let mut_y = 0;

  // `Arr.max` returns `Optional`; the list is non-empty so it is always `Some`.
  const maxValue = Optional.unwrapOr(
    Arr.max(luminanceDiffAccumulated),
    asNonNegativeFiniteNumber(0),
  );

  for (const [x, value] of luminanceDiffAccumulated.entries()) {
    if (!(value > mut_y)) {
      continue;
    }

    mut_result[mut_i] = toHue(x);

    [mut_i, mut_y] = [
      SafeUint.add(mut_i, 1),
      Num.div(
        FiniteNumber.mul(maxValue, SafeUint.add(mut_i, 1)),
        asPositiveFiniteNumber(n),
      ),
    ];
  }

  return Arr.isNonEmpty(mut_result) ? mut_result : undefined;
}
