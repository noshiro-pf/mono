import { type Hue } from '../../types/index.mjs';
import { hexToHsl } from './hex-to-hsl.mjs';

export const hexToHue = (hex: string): Hue => hexToHsl(hex)[0];
