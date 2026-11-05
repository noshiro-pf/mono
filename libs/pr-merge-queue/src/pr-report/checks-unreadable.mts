import { Arr } from 'ts-data-forge';

/**
 * The error a report fails with when the checks of some pull request could not
 * be read, or `undefined` when every read succeeded.
 *
 * A read that fails would otherwise leave the pull request with nothing
 * reported, so that every required context came out `missing` and the verdict
 * `pending`, as if CI had not started — a failing pull request reported as
 * waiting, with nothing saying the read failed (#2836). The report fails
 * instead, as it does when the rate limit is spent, naming what failed.
 */
export const describeUnreadableChecks = (
  failures: readonly Readonly<{ number: number; error: string }>[],
): string | undefined =>
  Arr.isEmpty(failures)
    ? undefined
    : Arr.toUnshifted(
        'The checks of these pull requests could not be read, so the report would have shown every required context of theirs as missing:',
      )(failures.map(({ number, error }) => `  #${number}: ${error}`)).join(
        '\n',
      );
