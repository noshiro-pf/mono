import { clamp } from '../../num';
import { uint32 } from '../../types';

export const safeSlice = <T>(
  array: readonly T[],
  start: uint32,
  end: uint32
): T[] => {
  const startClamped = clamp(0, array.length)(start);
  const endClamped = clamp(startClamped, array.length)(end);
  return array.slice(startClamped, endClamped);
};
