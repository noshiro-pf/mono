import { contrastRatioHsl, type Hue } from '@noshiro/ts-utils-additional';

export const hueListToContrastRatioList = (
  hueList: NonEmptyArray<Hue>,
  saturation: Percent,
  lightness: Percent
): NonEmptyArray<PositiveFiniteNumber> =>
  Tpl.map(hueList, (h, idx) =>
    contrastRatioHsl(
      [h, saturation, lightness],
      [hueList[(idx + 1) % hueList.length] ?? 0, saturation, lightness]
    )
  );
