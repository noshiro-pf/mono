import { clamp } from '../../num';

export const safeSlice = <T>(
  array: readonly T[],
  start: number,
  end: number
): T[] => {
  const startClamped = clamp(0, array.length)(start);
  const endClamped = clamp(startClamped, array.length)(end);
  return array.slice(startClamped, endClamped);
};
