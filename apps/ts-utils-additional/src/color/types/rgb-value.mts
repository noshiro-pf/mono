import { Uint8 } from 'ts-data-forge';
import { type UintRangeInclusive } from 'ts-type-forge';

export type RgbValue = UintRangeInclusive<0, 255>;

export const rgbValue = (v: number): RgbValue => Uint8.fromNumber(v);
