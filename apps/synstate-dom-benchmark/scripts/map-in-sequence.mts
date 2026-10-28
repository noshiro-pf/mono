import { Arr } from 'ts-data-forge';

/** `Array#map` with an async callback, one element at a time. */
export const mapInSequence = async <T, R>(
  items: readonly T[],
  fn: (item: T) => Promise<R>,
): Promise<readonly R[]> => {
  const [head, ...rest] = items;

  if (head === undefined) {
    return [];
  }

  const first = await fn(head);

  return Arr.toUnshifted(first)(await mapInSequence(rest, fn));
};
