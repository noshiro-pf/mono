/**
 * What a write of the pull requests keeps of what it is given.
 *
 * GitHub answers every read with the whole report, so what changed has to
 * be found somewhere; it is found once, where the report is written into
 * the store (`store/reader.mts`). A part compared whole needs nothing more
 * than its state's `equals`; the pull requests are compared one by one, so
 * that one changing hands a new object to its own card only.
 */

import { fastDeepEqual } from 'ts-data-forge';

/**
 * `held` if every item is equal; otherwise `given`, with each item equal to
 * the held one of the same number replaced by that one, so that a card
 * whose pull request did not change is handed the object it already has.
 *
 * Matched by number rather than by position, because a pull request opening
 * or merging moves every one after it, and a card that only moved has not
 * changed.
 */
export const sameItemsIfEqual = <T extends Readonly<{ number: number }>>(
  held: readonly T[],
  given: readonly T[],
): readonly T[] => {
  if (fastDeepEqual(held, given)) {
    return held;
  }

  const byNumber = new Map(held.map((item) => [item.number, item]));

  return given.map((item) => {
    const before = byNumber.get(item.number);

    return before !== undefined && fastDeepEqual(before, item) ? before : item;
  });
};
