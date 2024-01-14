import { type Hsl } from '../../types/index.mjs';
import { rgbToHex } from '../basic-conversion/index.mjs';
import { hslToRgb } from './hsl-to-rgb.mjs';

export const hslToHex = (hsl: Hsl): string => rgbToHex(hslToRgb(hsl));
