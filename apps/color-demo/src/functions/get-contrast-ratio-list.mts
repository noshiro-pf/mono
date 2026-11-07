import { Arr, Num, type PositiveFiniteNumber } from 'ts-data-forge';
import type { NonEmptyArray, Percent } from 'ts-type-forge';
import { contrastRatioHsl, type Hue } from 'ts-utils-additional';

export const hueListToContrastRatioList = (
  hueList: NonEmptyArray<Hue>,
  saturation: Percent,
  lightness: Percent,
): NonEmptyArray<PositiveFiniteNumber> =>
  Arr.map(hueList, (h, idx) =>
    contrastRatioHsl(
      [h, saturation, lightness],
      [
        (Num.isNonZero(hueList.length)
          ? hueList[Num.rem(idx + 1, hueList.length)]
          : undefined) ?? 0,
        saturation,
        lightness,
      ],
    ),
  );
