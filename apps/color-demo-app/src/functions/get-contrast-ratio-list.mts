import { Arr, type PositiveFiniteNumber } from 'ts-data-forge';
import { type NonEmptyArray, type Percent } from 'ts-type-forge';
import { contrastRatioHsl, type Hue } from 'ts-utils-additional';

export const hueListToContrastRatioList = (
  hueList: NonEmptyArray<Hue>,
  saturation: Percent,
  lightness: Percent,
): NonEmptyArray<PositiveFiniteNumber> =>
  Arr.map(hueList, (h, idx) =>
    contrastRatioHsl(
      [h, saturation, lightness],
      [hueList[(idx + 1) % hueList.length] ?? 0, saturation, lightness],
    ),
  );
