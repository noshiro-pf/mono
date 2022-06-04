import type { Hsl, Hue, Percent } from '@noshiro/ts-utils-additional';
import {
  hslToRgb,
  relativeLuminance,
  variance,
} from '@noshiro/ts-utils-additional';
import type { ColorResult } from '../types';
import { hueListToContrastRatioList } from './get-contrast-ratio-list';
import { getLuminanceListAccumulated } from './luminance-list-accumulated';
import { normalizeList } from './normalize-list';
import { pickupHighContrastHues } from './pickup-high-contrast-hues';

const hueListDefault = IList.seqThrow(360);

export const calcAll = ({
  saturation,
  lightness,
  firstHue,
  divisionNumber,
}: Readonly<{
  saturation: Percent;
  lightness: Percent;
  firstHue: Hue;
  divisionNumber: number;
}>): DeepReadonly<{
  relativeLuminanceDistribution: [Hsl, number][];
  result1_equallySpaced: ColorResult;
  result2_weighted: ColorResult;
  result3_weighted_log: ColorResult;
}> => {
  /* values */

  const hueList = hueListDefault.map(
    (h) => ((h - firstHue + 360) % 360) as Hue
  );

  const hslList: readonly Hsl[] = hueList.map((hue) => [
    hue,
    saturation,
    lightness,
  ]);

  const luminanceList = hslList.map(hslToRgb).map(relativeLuminance);

  /* 1. 彩度・明度を固定し色相を横軸としたときの相対輝度分布 */

  const maxLuminanceInList = IList.max(luminanceList) ?? 1;
  const luminanceListNormalized = luminanceList.map(
    (l) => l / maxLuminanceInList
  );

  const relativeLuminanceDistribution = IList.zip(
    hslList,
    luminanceListNormalized
  );

  const pickedUpHues_equallySpaced = IList.seqThrow(divisionNumber)
    .map((i) => Num.roundToInt((i * 360) / divisionNumber) as Hue)
    .map((h) => ((h - firstHue + 360) % 360) as Hue);

  const adjacentContrastRatioList_equallySpaced = hueListToContrastRatioList(
    pickedUpHues_equallySpaced,
    saturation,
    lightness
  );

  const result1_equallySpaced: ColorResult = {
    accumulatedDistribution: IList.zip(
      hslList,
      hueListDefault.map((i) => i / 360)
    ),
    pickedUpHues: pickedUpHues_equallySpaced,
    adjacentContrastRatioList: adjacentContrastRatioList_equallySpaced,
    adjacentContrastRatioVariance:
      variance(adjacentContrastRatioList_equallySpaced) ?? 0,
  };

  /* 相対輝度の変化量の絶対値の累積分布 */
  const pickedUpHues_weighted = pickupHighContrastHues(
    divisionNumber,
    saturation,
    lightness,
    firstHue,
    false
  ).map((h) => ((h - firstHue + 360) % 360) as Hue);

  const adjacentContrastRatioList_weighted = hueListToContrastRatioList(
    pickedUpHues_weighted,
    saturation,
    lightness
  );

  const result2_weighted: ColorResult = {
    accumulatedDistribution: IList.zip(
      hslList,
      normalizeList(getLuminanceListAccumulated(luminanceList, false))
    ),
    pickedUpHues: pickedUpHues_weighted,
    adjacentContrastRatioList: adjacentContrastRatioList_weighted,
    adjacentContrastRatioVariance:
      variance(adjacentContrastRatioList_weighted) ?? 0,
  };

  /* 相対輝度の変化量の絶対値のlogの累積分布 */

  const pickedUpHues_weighted_log = pickupHighContrastHues(
    divisionNumber,
    saturation,
    lightness,
    firstHue,
    true
  ).map((h) => ((h - firstHue + 360) % 360) as Hue);

  const adjacentContrastRatioList_weighted_log = hueListToContrastRatioList(
    pickedUpHues_weighted_log,
    saturation,
    lightness
  );

  const result3_weighted_log: ColorResult = {
    accumulatedDistribution: IList.zip(
      hslList,
      normalizeList(getLuminanceListAccumulated(luminanceList, true))
    ),
    pickedUpHues: pickedUpHues_weighted_log,
    adjacentContrastRatioList: adjacentContrastRatioList_weighted_log,
    adjacentContrastRatioVariance:
      variance(adjacentContrastRatioList_weighted_log) ?? 0,
  };

  return {
    relativeLuminanceDistribution,
    result1_equallySpaced,
    result2_weighted,
    result3_weighted_log,
  };
};
