export function max(array: number[]): undefined | number;
export function max(array: readonly number[]): undefined | number;
export function max(array: readonly number[]): undefined | number {
  return array.length === 0
    ? undefined
    : Math.max.apply(null, array as number[]);
}
