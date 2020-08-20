import { Hsl, Rgb } from '@mono/ts-utils';
import { hslToRgb } from '../convert/hsl-to-rgb';
import { relativeLuminance } from './relative-luminance';

/**
 * @description
 * Contrast ratios can range from 1 to 21.
 * link: https://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
 */
export const contrastRatioRgb = (rgb1: Rgb, rgb2: Rgb): number => {
  const a = relativeLuminance(rgb1);
  const b = relativeLuminance(rgb2);
  const [relativeLuminanceLighter, relativeLuminanceDarker] =
    a < b ? [b, a] : [a, b];
  return (relativeLuminanceLighter + 0.05) / (relativeLuminanceDarker + 0.05);
};

export const contrastRatioHsl = (hsl1: Hsl, hsl2: Hsl): number =>
  contrastRatioRgb(hslToRgb(hsl1), hslToRgb(hsl2));
