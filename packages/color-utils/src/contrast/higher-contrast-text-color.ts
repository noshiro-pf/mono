import { blackHsl, Hsl, whiteHsl } from 'noshiro-ts-utils';
import { contrastRatioHsl } from './contrast-ratio';

export const higherContrastTextColorHsl = (hsl: Hsl): 'black' | 'white' => {
  const contrastWhite = contrastRatioHsl(whiteHsl, hsl);
  const contrastBlack = contrastRatioHsl(hsl, blackHsl);
  return contrastWhite < contrastBlack ? 'black' : 'white';
};
