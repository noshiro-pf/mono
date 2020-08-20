import { Hsl, rgbToHex } from 'noshiro-ts-utils';
import { hslToRgb } from './hsl-to-rgb';

export const hslToHex = (hsl: Hsl): string => rgbToHex(hslToRgb(hsl));
