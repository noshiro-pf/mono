export const isInRange =
  (min: number, max: number) =>
  (target: number): boolean =>
    min <= target && target <= max;
