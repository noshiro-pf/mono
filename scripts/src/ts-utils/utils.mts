export function zeros<N extends SmallUint>(len: N): ArrayOfLength<N, 0>;
export function zeros(len: PositiveSafeIntWithSmallInt): NonEmptyArray<0>;
export function zeros(len: number): readonly 0[] {
  return Array.from({ length: len }, () => 0);
}

// eslint-disable-next-line no-restricted-syntax
export const toSafeUint = (n: number): SafeUint => n as SafeUint;

export const toPositiveSafeInt = (n: number): PositiveSafeInt =>
  // eslint-disable-next-line no-restricted-syntax
  n as PositiveSafeInt;

export const toUint32 = (v: number): Uint32 =>
  // eslint-disable-next-line no-restricted-syntax
  v as Uint32;
