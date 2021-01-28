export const toNumber = (value: string): number | undefined => {
  const result = parseInt(value);
  return Number.isNaN(result) ? undefined : result;
};

export const halfInt = (x: number): number =>
  x % 2 === 0
    ? x / 2
    : x % 2 === 1
    ? x > 0
      ? (x - 1) / 2
      : (x + 1) / 2
    : x > 0
    ? Math.floor(x / 2)
    : Math.ceil(x / 2);

export const binarySearch = (sortedArray: number[], x: number): number => {
  if (sortedArray.length === 0) return 0;
  let left = 0;
  let right = sortedArray.length - 1;
  let mid = left + halfInt(right - left);
  // loop while x is in the range of [left, right)
  while (left <= right) {
    const curr = sortedArray[mid];
    if (x === curr) break;
    if (curr === undefined) break;
    if (curr > x) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
    mid = left + halfInt(right - left);
  }
  return mid;
};

export const noop = (): void => undefined;

export type None = { readonly _type: 'None' };
export const none: None = { _type: 'None' };
export type Some<A> = { readonly _type: 'Some'; value: A };
export const some = <A>(a: A): Option<A> => ({ _type: 'Some', value: a });
export type Option<A> = None | Some<A>;
export const isNone = <A>(value: Option<A>): value is None =>
  value._type === 'None';
export const isNotNone = <A>(value: Option<A>): value is Some<A> =>
  value._type !== 'None';
