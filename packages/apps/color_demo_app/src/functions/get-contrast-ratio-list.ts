import type { Hue, Percent } from '@noshiro/ts-utils';
import { contrastRatioHsl } from '@noshiro/ts-utils';

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
