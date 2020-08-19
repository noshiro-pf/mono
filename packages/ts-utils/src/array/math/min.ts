export function min(array: number[]): undefined | number;
export function min(array: readonly number[]): undefined | number;
export function min(array: readonly number[]): undefined | number {
  return array.length === 0
    ? undefined
    : Math.min.apply(null, array as number[]);
}
