import { Hue } from '@mono/ts-utils';
import { hexToHsl } from './hex-to-hsl';

export const hexToHue = (hex: string): Hue => hexToHsl(hex)[0];
