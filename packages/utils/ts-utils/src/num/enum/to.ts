import { Num } from '../num';

export const toInt8 = (a: number): Int8 => {
  if (!Num.isInt(a)) {
    throw new TypeError(`Expected integer in [-256, 255), got: ${a}`);
  }
  return a as Int8;
};

export const toUint8 = (a: number): Uint8 => {
  if (!Num.isInt(a) || !Num.isInRange(0, 255)(a)) {
    throw new TypeError(
      `Expected non-negative integer less than 256, got: ${a}`
    );
  }
  return a as Uint8;
};
