import { Num } from '../num';

export const toFiniteNumber = (a: number): FiniteNumber => {
  if (!Num.isFinite(a)) {
    throw new TypeError(`Expected finite number, got: ${a}`);
  }
  return a;
};

export const toInt = (a: number): Int => {
  if (!Num.isInt(a)) {
    throw new TypeError(`Expected integer, got: ${a}`);
  }
  return a;
};

export const toUint = (a: number): Uint => {
  if (!Num.isInt(a) || !Num.isNonNegative(a)) {
    throw new TypeError(`Expected non-negative integer, got: ${a}`);
  }
  return a;
};

export const toSafeInt = (a: number): SafeInt => {
  if (!Num.isSafeInt(a)) {
    throw new TypeError(`Expected safe integer, got: ${a}`);
  }
  return a;
};

export const toSafeUint = (a: number): SafeUint => {
  if (!Num.isSafeInt(a) || !Num.isNonNegative(a)) {
    throw new TypeError(`Expected safe non-negative integer, got: ${a}`);
  }
  return a;
};

export const toInt32 = (a: number): Int32 => {
  if (!Num.isInt32(a)) {
    throw new TypeError(`Expected integer in [-2^32, 2^32), got: ${a}`);
  }
  return a;
};

export const toUint32 = (a: number): Uint32 => {
  if (!Num.isUint32(a)) {
    throw new TypeError(
      `Expected non-negative integer less than 2^32, got: ${a}`
    );
  }
  return a;
};
