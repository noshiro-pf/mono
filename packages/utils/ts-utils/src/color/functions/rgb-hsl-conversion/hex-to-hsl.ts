import { Hsl } from '../../types';
import { hexToRgb } from '../basic-conversion';
import { rgbToHsl } from './rgb-to-hsl';

export const hexToHsl = (hex: string): Hsl => rgbToHsl(hexToRgb(hex));
