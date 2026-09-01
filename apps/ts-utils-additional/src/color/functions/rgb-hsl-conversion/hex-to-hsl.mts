import { type Hsl } from '../../types/index.mjs';
import { hexToRgb } from '../basic-conversion/index.mjs';
import { rgbToHsl } from './rgb-to-hsl.mjs';

export const hexToHsl = (hex: string): Hsl => rgbToHsl(hexToRgb(hex));
