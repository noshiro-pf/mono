import { mapOptional, Num, Uint8 } from '@noshiro/ts-utils';
import { type Rgb, type RgbValue } from '../../types';

const parseAsHexAndClamp = (hexStr: string): RgbValue | undefined =>
  mapOptional(Num.mapNaN2Undefined(Number.parseInt(hexStr, 16)), Uint8.clamp);

export const hexToRgb = (hex: string): Rgb => {
  if (!/^#[0-9a-fA-F]{6}$/u.test(hex)) return [0, 0, 0];

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const r = parseAsHexAndClamp(hex.slice(1, 3))!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const g = parseAsHexAndClamp(hex.slice(3, 5))!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const b = parseAsHexAndClamp(hex.slice(5, 7))!;

  return [r, g, b];
};
