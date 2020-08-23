import { Hsl, Rgb } from '@mono/ts-utils';
/**
 * @description
 * Contrast ratios can range from 1 to 21.
 * link: https://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
 */
export declare const contrastRatioRgb: (rgb1: Rgb, rgb2: Rgb) => number;
export declare const contrastRatioHsl: (hsl1: Hsl, hsl2: Hsl) => number;
//# sourceMappingURL=contrast-ratio.d.ts.map