/** Many parts read as one. */

import { Arr, Result } from 'ts-data-forge';
import type { Read } from '../snapshot/index.mjs';

/**
 * Every value, or the first part that failed: a list with one member unread is
 * not the list, and read as the rest it would be taken for the whole.
 */
export const allRead = <A,>(reads: readonly Read<A>[]): Read<readonly A[]> => {
  const failed = reads.find(Result.isErr);

  return (
    failed ??
    Result.ok(
      Arr.generate(function* () {
        for (const each of reads) {
          if (Result.isOk(each)) {
            yield each.value;
          }
        }
      }),
    )
  );
};
