import type { Hsl } from '../../types';
import { rgbToHex } from '../basic-conversion';
import { hslToRgb } from './hsl-to-rgb';

export const hslToHex = (hsl: Hsl): string => rgbToHex(hslToRgb(hsl));
