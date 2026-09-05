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
import {
  type FixedLengthTuple,
  type NonEmptyArray,
  type NonNegativeFiniteNumber,
  type Percent,
  type SmallUint,
} from 'ts-type-forge';
import { toHue } from '../../to-hue.mjs';
import { type Hue } from '../../types/index.mjs';
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

/** RelativeLuminanceの差分を累積した分布関数を縦軸yでn等分して、対応するx座標（=hue）を返す */
export function pickupHighContrastHues<N extends SmallUint>(
  n: N,
  saturation: Percent,
  lightness: Percent,
): FixedLengthTuple<N, Hue>;

export function pickupHighContrastHues(
  n: SizeType.ArgArrPositive,
  saturation: Percent,
  lightness: Percent,
): NonEmptyArray<Hue>;

export function pickupHighContrastHues(
  n: SizeType.ArgArr,
  saturation: Percent,
  lightness: Percent,
): NonEmptyArray<Hue> | undefined {
  if (!Num.isPositive(n)) return undefined;

  const luminanceList: NonEmptyArray<NonNegativeFiniteNumber> = Arr.map(
    hues,
    (hue) => relativeLuminance(hslToRgb([hue, saturation, lightness])),
  );

  const luminanceDiffAccumulated: NonEmptyArray<NonNegativeFiniteNumber> =
    getLuminanceListAccumulated(luminanceList);

  /* pickup n hues */

  // A plain mutable array rather than `castMutable(Arr.zeros(n))`: the latter
  // carries `Arr.zeros`'s length-constraint brand, which the declared
  // `NonEmptyArray<Hue>` return type does not accept.
  const mut_result: Hue[] = Arr.zeros(n).map((): Hue => 0);

  let mut_i: SafeUint = asSafeUint(0);

  let mut_y = 0;

  // `Arr.max` returns `Optional`; the list is non-empty so it is always `Some`.
  const maxValue = Optional.unwrapOr(
    Arr.max(luminanceDiffAccumulated),
    asPositiveFiniteNumber(1),
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
