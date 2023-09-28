import {
  hslToRgb,
  relativeLuminance,
  variance,
  type Hsl,
  type Hue,
} from '@noshiro/ts-utils-additional';
import { type ColorResult, type DivisionNumber } from '../types';
import { hueListToContrastRatioList } from './get-contrast-ratio-list';
import { getLuminanceListAccumulated } from './luminance-list-accumulated';
import { normalizeList } from './normalize-list';
import { pickupHighContrastHues } from './pickup-high-contrast-hues';
import { toHue } from './to-hue';

const hueListDefault = Arr.seq(360);

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

  const hueList: ArrayOfLength<360, Hue> = Tpl.map(hueListDefault, (h) =>
    toHue((h - firstHue + 360) % 360)
  );

  const hslList: ArrayOfLength<360, Hsl> = Tpl.map(hueList, (hue) =>
    tp(hue, saturation, lightness)
  );

  const luminanceList: ArrayOfLength<360, NonNegativeFiniteNumber> = pipe(
    hslList
  )
    .chain((a) => Tpl.map(a, hslToRgb))
    .chain((a) => Tpl.map(a, relativeLuminance)).value;

  /* 1. 彩度・明度を固定し色相を横軸としたときの相対輝度分布 */

  const maxLuminanceInList = Arr.max(luminanceList);
  const luminanceListNormalized: ArrayOfLength<360, NonNegativeFiniteNumber> =
    Tpl.map(luminanceList, (l) =>
      Num.isNonZero(maxLuminanceInList)
        ? NonNegativeFiniteNumber.div(l, maxLuminanceInList)
        : toNonNegativeFiniteNumber(0)
    );

  // Type annotations are added to avoid
  // "Type instantiation is excessively deep and possibly infinite." error
  const relativeLuminanceDistribution = Arr.zip<
    NonEmptyArray<Hsl>,
    NonEmptyArray<NonNegativeFiniteNumber>
  >(hslList, luminanceListNormalized);

  const pickedUpHues_equallySpaced = pipe(Arr.seq(divisionNumber))
    .chain((list) =>
      Tpl.map(list, (i) => Num.roundToInt((i * 360) / divisionNumber))
    )
    .chain((list) =>
      Tpl.map(list, (h) => toHue((h - firstHue + 360) % 360))
    ).value;

  const adjacentContrastRatioList_equallySpaced: NonEmptyArray<PositiveFiniteNumber> =
    hueListToContrastRatioList(
      pickedUpHues_equallySpaced,
      saturation,
      lightness
    );

  const result1_equallySpaced: ColorResult = {
    accumulatedDistribution: Arr.zip<
      NonEmptyArray<Hsl>,
      NonEmptyArray<NonNegativeFiniteNumber>
    >(
      hslList,
      Tpl.map(hueListDefault, (i) =>
        NonNegativeFiniteNumber.div(
          toNonNegativeFiniteNumber(i),
          toPositiveSafeInt(360)
        )
      )
    ),
    pickedUpHues: pickedUpHues_equallySpaced,
    adjacentContrastRatioList: adjacentContrastRatioList_equallySpaced,
    adjacentContrastRatioVariance: variance(
      adjacentContrastRatioList_equallySpaced
    ),
  };

  /* 相対輝度の変化量の絶対値の累積分布 */
  const pickedUpHues_weighted: ArrayOfLength<DivisionNumber, Hue> = pipe(
    pickupHighContrastHues(
      divisionNumber,
      saturation,
      lightness,
      firstHue,
      false
    )
  ).chain((t) => Tpl.map(t, (h) => toHue((h - firstHue + 360) % 360))).value;

  const adjacentContrastRatioList_weighted: NonEmptyArray<PositiveFiniteNumber> =
    hueListToContrastRatioList(pickedUpHues_weighted, saturation, lightness);

  const result2_weighted: ColorResult = {
    accumulatedDistribution: Arr.zip<
      NonEmptyArray<Hsl>,
      NonEmptyArray<NonNegativeFiniteNumber>
    >(
      hslList,
      normalizeList(getLuminanceListAccumulated(luminanceList, false))
    ),
    pickedUpHues: pickedUpHues_weighted,
    adjacentContrastRatioList: adjacentContrastRatioList_weighted,
    adjacentContrastRatioVariance: variance(adjacentContrastRatioList_weighted),
  };

  /* 相対輝度の変化量の絶対値のlogの累積分布 */

  const pickedUpHues_weighted_log: ArrayOfLength<DivisionNumber, Hue> = pipe(
    pickupHighContrastHues(
      divisionNumber,
      saturation,
      lightness,
      firstHue,
      true
    )
  ).chain((t) => Tpl.map(t, (h) => toHue((h - firstHue + 360) % 360))).value;

  const adjacentContrastRatioList_weighted_log: NonEmptyArray<PositiveFiniteNumber> =
    hueListToContrastRatioList(
      pickedUpHues_weighted_log,
      saturation,
      lightness
    );

  const result3_weighted_log: ColorResult = {
    accumulatedDistribution: Arr.zip<
      NonEmptyArray<Hsl>,
      NonEmptyArray<NonNegativeFiniteNumber>
    >(hslList, normalizeList(getLuminanceListAccumulated(luminanceList, true))),
    pickedUpHues: pickedUpHues_weighted_log,
    adjacentContrastRatioList: adjacentContrastRatioList_weighted_log,
    adjacentContrastRatioVariance: variance(
      adjacentContrastRatioList_weighted_log
    ),
  };

  return {
    relativeLuminanceDistribution,
    result1_equallySpaced,
    result2_weighted,
    result3_weighted_log,
  };
};
