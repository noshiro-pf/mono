import { Rgb } from 'noshiro-ts-utils';

/**
 * link: https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
 */
export const relativeLuminance = ([r, g, b]: Rgb): number =>
  0.2126 * f(r / 255) + 0.7152 * f(g / 255) + 0.0722 * f(b / 255);

const f = (v: number): number =>
  v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
