import { at, contrastRatioHsl, Hue, Percent } from '@mono/ts-utils';

export const hueListToContrastRatioList = (
  hueList: readonly Hue[],
  saturation: Percent,
  lightness: Percent
): number[] =>
  hueList.map((h, idx) =>
    contrastRatioHsl(
      [h, saturation, lightness],
      [at(hueList, (idx + 1) % hueList.length) ?? 0, saturation, lightness]
    )
  );
