import type { ReadError } from 'pr-report-core-v2';
import { Arr } from 'ts-data-forge';

/**
 * What a read could not get, a line each, said once: one failure can reach a
 * block twice, as the base changes of a pull request do through the merged
 * parent read from them.
 */
export const failureLines = (
  failures: readonly ReadError[],
): readonly string[] =>
  Arr.uniq(failures.map(({ what, message }) => `${what} (${message})`));
