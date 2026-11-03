import {
  Arr,
  asPositiveFiniteNumber,
  asSafeUint,
  asUint16,
  FiniteNumber,
  Num,
  Optional,
  SafeUint,
  type SizeType,
} from 'ts-data-forge';
import type {
  FixedLengthTuple,
  NonEmptyArray,
  NonNegativeFiniteNumber,
  Percent,
  SmallUint,
} from 'ts-type-forge';
import { toHue } from '../../to-hue.mjs';
import type { Hue } from '../../types/index.mjs';
import { hslToRgb } from '../rgb-hsl-conversion/index.mjs';
import { getLuminanceListAccumulated } from './get-luminance-list-acc.mjs';
import { relativeLuminance } from './relative-luminance.mjs';

const seq = Arr.seq(asUint16(360));

// `NonEmptyArray` carries a brand, so only a guard can establish it — a literal
// or an assertion cannot. `Arr.seq` returns `NonEmptyArray` directly only when
// its argument is statically positive, and `Uint16` includes 0. This check
// cannot fail. The original used `as unknown as Seq<360>` here; the exact
// 360-member tuple type is also what makes `Arr.map` below blow up with
// TS2589/TS2590, and nothing here relies on more than non-emptiness.
if (!Arr.isNonEmpty(seq)) {
  throw new Error('pickupHighContrastHues: Arr.seq(360) returned empty');
}

const hues: NonEmptyArray<Hue> = Arr.map(seq, toHue);

/**
 * RelativeLuminanceの差分を累積した分布関数を縦軸yでn等分して、対応するx座標の色相を返す
 *
 * @param firstHue Where hue 0 lies on the x axis that the distribution is
 *   accumulated along: x-coordinate `x` is the hue `(x - firstHue) mod 360`.
 *   Defaults to 0, where x is the hue itself. The result is hues, not
 *   x-coordinates.
 * @param useLog Accumulate the differences of the log of the luminance (the
 *   default) rather than of the luminance itself.
 */
export function pickupHighContrastHues<N extends SmallUint>(
  n: N,
  saturation: Percent,
  lightness: Percent,
  firstHue?: Hue,
  useLog?: boolean,
): FixedLengthTuple<N, Hue>;

export function pickupHighContrastHues(
  n: SizeType.ArgArrPositive,
  saturation: Percent,
  lightness: Percent,
  firstHue?: Hue,
  useLog?: boolean,
): NonEmptyArray<Hue>;

export function pickupHighContrastHues(
  n: SizeType.ArgArr,
  saturation: Percent,
  lightness: Percent,
  firstHue: Hue = 0,
  useLog: boolean = true,
): NonEmptyArray<Hue> | undefined {
  if (!Num.isPositive(n)) {
    return undefined;
  }

  const huesFromFirst: NonEmptyArray<Hue> = Arr.map(hues, (h) =>
    toHue((h - firstHue + 360) % 360),
  );

  const luminanceList: NonEmptyArray<NonNegativeFiniteNumber> = Arr.map(
    huesFromFirst,
    (hue) => relativeLuminance(hslToRgb([hue, saturation, lightness])),
  );

  const luminanceDiffAccumulated: NonEmptyArray<NonNegativeFiniteNumber> =
    getLuminanceListAccumulated(luminanceList, useLog);

  /* pickup n hues */

  // A plain mutable array rather than `castMutable(Arr.zeros(n))`: the latter
  // carries `Arr.zeros`'s length-constraint brand, which the declared
  // `NonEmptyArray<Hue>` return type does not accept. A slot left unfilled (a flat curve picks nothing) holds the hue at x = 0.
  const mut_result: Hue[] = Arr.zeros(n).map((): Hue => huesFromFirst[0]);

  let mut_i: SafeUint = asSafeUint(0);

  let mut_y = 0;

  // `Arr.max` returns `Optional`; the list is non-empty so it is always `Some`.
  const maxValue = Optional.unwrapOr(
    Arr.max(luminanceDiffAccumulated),
    asPositiveFiniteNumber(1),
  );

  for (const [x, value] of luminanceDiffAccumulated.entries()) {
    // After the n-th pick the threshold `maxValue * n / n` can round one ulp
    // below `maxValue`, so the last value would pass as an (n + 1)-th hue.
    if (mut_i >= n) {
      break;
    }

    if (value <= mut_y) {
      continue;
    }

    mut_result[mut_i] = toHue((x - firstHue + 360) % 360);

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
