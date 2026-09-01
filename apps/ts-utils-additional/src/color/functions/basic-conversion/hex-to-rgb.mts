import { Uint8 } from 'ts-data-forge';
import { type Rgb, type RgbValue } from '../../types/index.mjs';

/**
 * The caller has already matched `hex` against `/^#[0-9a-fA-F]{6}$/`, so each
 * two-character slice parses to 0–255. `Uint8.fromNumber` is total (it clamps)
 * and replaces what used to be `mapOptional(Num.mapNaN2Undefined(…), …)`
 * followed by a non-null assertion at each of the three call sites.
 */
const parseAsHex = (hexStr: string): RgbValue =>
  Uint8.fromNumber(Number.parseInt(hexStr, 16));

export const hexToRgb = (hex: string): Rgb => {
  if (!/^#[0-9a-fA-F]{6}$/u.test(hex)) return [0, 0, 0];

  return [
    parseAsHex(hex.slice(1, 3)),
    parseAsHex(hex.slice(3, 5)),
    parseAsHex(hex.slice(5, 7)),
  ];
};
