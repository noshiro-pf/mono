import { blackHsl, whiteHsl } from '../../color-constants.mjs';
import { type Hsl } from '../../types/index.mjs';
import { contrastRatioHsl } from './contrast-ratio.mjs';

export const higherContrastTextColorHsl = (hsl: Hsl): 'black' | 'white' => {
  const contrastWhite = contrastRatioHsl(whiteHsl, hsl);
  const contrastBlack = contrastRatioHsl(hsl, blackHsl);

  return contrastWhite < contrastBlack ? 'black' : 'white';
};
