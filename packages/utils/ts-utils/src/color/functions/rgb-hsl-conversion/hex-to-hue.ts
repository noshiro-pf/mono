import { Hue } from '../../types';
import { hexToHsl } from './hex-to-hsl';

export const hexToHue = (hex: string): Hue => hexToHsl(hex)[0];
