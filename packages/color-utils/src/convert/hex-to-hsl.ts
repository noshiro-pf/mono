import { hexToRgb, Hsl } from '@mono/ts-utils';
import { rgbToHsl } from './rgb-to-hsl';

export const hexToHsl = (hex: string): Hsl => rgbToHsl(hexToRgb(hex));
