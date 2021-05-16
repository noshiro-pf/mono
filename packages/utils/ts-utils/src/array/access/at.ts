import type { uint32 } from '../../types';

export const at = <T>(array: readonly T[], pos: uint32): T | undefined =>
  0 <= pos && pos < array.length ? array[pos] : undefined;
