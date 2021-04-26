import { isUint32 } from '../types';

export const indexIsInRange = <T>(array: readonly T[]) => (
  index: number
): boolean => isUint32(index) && 0 <= index && index < array.length;
