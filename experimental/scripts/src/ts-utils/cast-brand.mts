export const toSafeUint = (n: number): SafeUint =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  n as SafeUint;

export const toPositiveSafeInt = (n: number): PositiveSafeInt =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  n as PositiveSafeInt;

export const toUint32 = (v: number): Uint32 =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  v as Uint32;
