import {
  Arr,
  asNonNegativeFiniteNumber,
  asPositiveSafeInt,
  NonNegativeFiniteNumber,
  Num,
  Optional,
  tp,
  type PositiveFiniteNumber,
} from 'ts-data-forge';
import {
  type DeepReadonly,
  type NonEmptyArray,
  type Percent,
} from 'ts-type-forge';
import {
  hslToRgb,
  relativeLuminance,
  variance,
  type Hsl,
  type Hue,
} from 'ts-utils-additional';
import { huesDefault } from '../constants/index.mjs';
import { type ColorResult, type DivisionNumber } from '../types/index.mjs';
import { hueListToContrastRatioList } from './get-contrast-ratio-list.mjs';
import { getLuminanceListAccumulated } from './luminance-list-accumulated.mjs';
import { normalizeList } from './normalize-list.mjs';
import { pickupHighContrastHues } from './pickup-high-contrast-hues.mjs';
import { toHue } from './to-hue.mjs';

/**
 * `Arr.map` over a `Seq<N>` union yields a union of tuple types. Every member
 * is non-empty, but the union does not carry `NonEmptyArray`'s brand, and only
 * a guard can establish it. `divisionNumber` is `UintRange<2, 31>`, so this
 * cannot fail.
 */
const asNonEmptyHues = (hues: readonly Hue[]): NonEmptyArray<Hue> => {
  if (!Arr.isNonEmpty(hues)) {
    throw new Error('calcAll: the picked-up hue list is unexpectedly empty');
  }

  return hues;
};

export const calcAll = ({
  saturation,
  lightness,
  firstHue,
  divisionNumber,
}: Readonly<{
  saturation: Percent;
  lightness: Percent;
  firstHue: Hue;
  divisionNumber: DivisionNumber;
}>): DeepReadonly<{
  relativeLuminanceDistribution: [Hsl, NonNegativeFiniteNumber][];
  result1_equallySpaced: ColorResult;
  result2_weighted: ColorResult;
  result3_weighted_log: ColorResult;
}> => {
  /* values */

  const hueList: NonEmptyArray<Hue> = Arr.map(huesDefault, (h) =>
    toHue((h - firstHue + 360) % 360),
  );

  const hslList: NonEmptyArray<Hsl> = Arr.map(hueList, (hue) =>
    tp(hue, saturation, lightness),
  );

  const luminanceList: NonEmptyArray<NonNegativeFiniteNumber> = Arr.map(
    hslList,
    (v) => relativeLuminance(hslToRgb(v)),
  );

  /* 1. 彩度・明度を固定し色相を横軸としたときの相対輝度分布 */

  // `Arr.max` returns `Optional`; the list is non-empty so it is always
  // `Some`, and 0 is what the `isNonZero` guard below rejects anyway.
  const maxLuminanceInList = Optional.unwrapOr(
    Arr.max(luminanceList),
    asNonNegativeFiniteNumber(0),
  );

  const luminanceListNormalized: NonEmptyArray<NonNegativeFiniteNumber> =
    Arr.map(luminanceList, (l) =>
      Num.isNonZero(maxLuminanceInList)
        ? NonNegativeFiniteNumber.div(l, maxLuminanceInList)
        : asNonNegativeFiniteNumber(0),
    );

  // Type annotations are added to avoid
  // "Type instantiation is excessively deep and possibly infinite." error
  const relativeLuminanceDistribution = Arr.zip<
    NonEmptyArray<Hsl>,
    NonEmptyArray<NonNegativeFiniteNumber>
  >(hslList, luminanceListNormalized);

  // Plain `.map` rather than `pipe().map(Arr.map(…))`: `Arr.map`'s curried
  // overload cannot infer the element type from the callback alone, and
  // `Arr.map`'s `const` type parameter reconstructs the tuple shape, which is
  // TS2590 territory at this length.
  const pickedUpHues_equallySpaced: readonly Hue[] = Arr.seq(
    divisionNumber,
  ).map((i) =>
    toHue((Num.roundToInt((i * 360) / divisionNumber) - firstHue + 360) % 360),
  );

  const adjacentContrastRatioList_equallySpaced: NonEmptyArray<PositiveFiniteNumber> =
    hueListToContrastRatioList(
      asNonEmptyHues(pickedUpHues_equallySpaced),
      saturation,
      lightness,
    );

  const result1_equallySpaced: ColorResult = {
    accumulatedDistribution: Arr.zip<
      NonEmptyArray<Hsl>,
      NonEmptyArray<NonNegativeFiniteNumber>
    >(
      hslList,
      Arr.map(huesDefault, (i) =>
        NonNegativeFiniteNumber.div(
          asNonNegativeFiniteNumber(i),
          asPositiveSafeInt(360),
        ),
      ),
    ),
    pickedUpHues: pickedUpHues_equallySpaced,
    adjacentContrastRatioList: adjacentContrastRatioList_equallySpaced,
    adjacentContrastRatioVariance: variance(
      adjacentContrastRatioList_equallySpaced,
    ),
  } as const;

  /* 相対輝度の変化量の絶対値の累積分布 */
  const pickedUpHues_weighted: readonly Hue[] = pickupHighContrastHues(
    divisionNumber,
    saturation,
    lightness,
    firstHue,
    false,
  ).map((h) => toHue((h - firstHue + 360) % 360));

  const adjacentContrastRatioList_weighted: NonEmptyArray<PositiveFiniteNumber> =
    hueListToContrastRatioList(
      asNonEmptyHues(pickedUpHues_weighted),
      saturation,
      lightness,
    );

  const result2_weighted: ColorResult = {
    accumulatedDistribution: Arr.zip<
      NonEmptyArray<Hsl>,
      NonEmptyArray<NonNegativeFiniteNumber>
    >(
      hslList,
      normalizeList(getLuminanceListAccumulated(luminanceList, false)),
    ),
    pickedUpHues: pickedUpHues_weighted,
    adjacentContrastRatioList: adjacentContrastRatioList_weighted,
    adjacentContrastRatioVariance: variance(adjacentContrastRatioList_weighted),
  } as const;

  /* 相対輝度の変化量の絶対値のlogの累積分布 */

  const pickedUpHues_weighted_log: readonly Hue[] = pickupHighContrastHues(
    divisionNumber,
    saturation,
    lightness,
    firstHue,
    true,
  ).map((h) => toHue((h - firstHue + 360) % 360));

  const adjacentContrastRatioList_weighted_log: NonEmptyArray<PositiveFiniteNumber> =
    hueListToContrastRatioList(
      asNonEmptyHues(pickedUpHues_weighted_log),
      saturation,
      lightness,
    );

  const result3_weighted_log: ColorResult = {
    accumulatedDistribution: Arr.zip<
      NonEmptyArray<Hsl>,
      NonEmptyArray<NonNegativeFiniteNumber>
    >(hslList, normalizeList(getLuminanceListAccumulated(luminanceList, true))),
    pickedUpHues: pickedUpHues_weighted_log,
    adjacentContrastRatioList: adjacentContrastRatioList_weighted_log,
    adjacentContrastRatioVariance: variance(
      adjacentContrastRatioList_weighted_log,
    ),
  } as const;

  return {
    relativeLuminanceDistribution,
    result1_equallySpaced,
    result2_weighted,
    result3_weighted_log,
  };
};
