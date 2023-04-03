import { contrastRatioHsl, type Hue } from '@noshiro/ts-utils-additional';

export const hueListToContrastRatioList = (
  hueList: readonly Hue[],
  saturation: Percent,
  lightness: Percent
): readonly number[] =>
  hueList.map((h, idx) =>
    contrastRatioHsl(
      [h, saturation, lightness],
      [hueList[(idx + 1) % hueList.length] ?? 0, saturation, lightness]
    )
  );
