import type { Hue, Percent, uint32 } from '@noshiro/ts-utils';
import { at, contrastRatioHsl } from '@noshiro/ts-utils';

export const hueListToContrastRatioList = (
  hueList: readonly Hue[],
  saturation: Percent,
  lightness: Percent
): readonly number[] =>
  hueList.map((h, idx) =>
    contrastRatioHsl(
      [h, saturation, lightness],
      [
        at(hueList, ((idx + 1) % hueList.length) as uint32) ?? 0,
        saturation,
        lightness,
      ]
    )
  );
