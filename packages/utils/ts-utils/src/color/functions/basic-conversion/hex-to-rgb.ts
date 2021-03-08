import { clamp } from '../../../num';
import { Rgb, RgbValue } from '../../types';

const clamp255 = clamp(0, 255) as (target: number) => RgbValue;

const parseAsHexAndClamp = (hexStr: string): RgbValue =>
  clamp255(parseInt(hexStr, 16));

export const hexToRgb = (hex: string): Rgb => {
  if (!/^#[0-9a-fA-F]{6}$/u.test(hex)) return [0, 0, 0];

  const r = parseAsHexAndClamp(hex.slice(1, 3));
  const g = parseAsHexAndClamp(hex.slice(3, 5));
  const b = parseAsHexAndClamp(hex.slice(5, 7));

  return [r, g, b];
};
