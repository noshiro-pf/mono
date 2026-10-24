/**
 * What the merge is waiting for, read from `gh pr checks` and judged against
 * the contexts the ruleset requires.
 */

import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { parseJson } from '../../lib/json.mjs';
import { git } from '../../lib/shell.mjs';
import { jsonFields } from './github.mjs';
import type { ChecksSummary } from './types.mjs';

/** The fields read from `gh pr checks --json`. */
const CheckSchema = t.record({
  name: t.string(),
  /** `pass` | `fail` | `pending` | `skipping` | `cancel` */
  bucket: t.string(),
  link: t.string(),
  /** ISO 8601; GitHub's zero time before the check has started. */
  startedAt: t.string(),
  /** ISO 8601; GitHub's zero time before the check has finished. */
  completedAt: t.string(),
});

const CheckListSchema = t.array(CheckSchema);

export type ReportedCheck = t.TypeOf<typeof CheckSchema>;

/** A check on the head that has not finished, and when it started. */
export type RunningCheck = Readonly<{ name: string; startedAt: string }>;

const CHECK_FIELDS = jsonFields(CheckSchema);

/**
 * The checks that gate the merge, as GitHub reports them for the head commit.
 * `--required` reads `isRequired` from the API, so the list follows the
 * ruleset without this script having to know it.
 */
export const listRequiredChecks = async (
  prNumber: number,
): Promise<Result<readonly ReportedCheck[], string>> => {
  const listed = await git(
    `gh pr checks ${prNumber} --required --json ${CHECK_FIELDS}`,
  );

  if (Result.isErr(listed)) {
    // Right after a push there is nothing to report yet, and gh treats that
    // as an error rather than an empty list.
    return listed.value.includes('no checks reported') ? Result.ok([]) : listed;
  }

  return parseJson(listed.value, CheckListSchema, `gh pr checks ${prNumber}`);
};

/**
 * The checks on the head commit that have not finished, required or not.
 *
 * A required aggregate has no run in a new round until the jobs it waits on
 * are done, so until then `--required` answers with the round before. When
 * that round was the one `skip-ci` skipped, every aggregate reads `skipped`
 * and the commit looks green halfway through its matrix. Anything still
 * running is what says the round is not over, and when it started is what
 * tells a failure of the round before from one of this round.
 */
export const listRunningChecks = async (
  prNumber: number,
): Promise<Result<readonly RunningCheck[], string>> => {
  const listed = await git(`gh pr checks ${prNumber} --json ${CHECK_FIELDS}`);

  if (Result.isErr(listed)) {
    return listed.value.includes('no checks reported') ? Result.ok([]) : listed;
  }

  return Result.map(
    parseJson(listed.value, CheckListSchema, `gh pr checks ${prNumber}`),
    (checks) =>
      checks
        .filter((check) => check.bucket === 'pending')
        .map(({ name, startedAt }) => ({ name, startedAt })),
  );
};

/**
 * `checks` is what `gh pr checks --required` reported for the head commit;
 * `requiredContexts` is what the ruleset asks for. The difference between the
 * two is the point: a context in the second and not the first has not
 * reported yet, and GitHub will not merge until it does. `running` is every
 * check on the head that has not finished ({@link listRunningChecks}); while
 * it is not empty the required ones may be the round before speaking, so
 * they cannot pass the pull request.
 *
 * Nor can they fail it when they finished before the round still running
 * began: the round `skip-ci` cancelled, as `open-pr` opens every pull request
 * under it, leaves its aggregates red, and reading that red as this round's
 * set a pull request aside while its first real round was under way (#2246).
 * Such a failure waits for the round to end, as a check not yet reported
 * does. A failure of this round finished after it began, and still fails the
 * pull request at once.
 */
export const summarizeChecks = (
  checks: readonly ReportedCheck[],
  requiredContexts: readonly string[],
  running: readonly RunningCheck[],
): ChecksSummary => {
  const roundStartedMs = earliestStart(running);

  const isOfRoundBefore = (check: ReportedCheck): boolean => {
    const completedMs = epochMs(check.completedAt);

    return (
      roundStartedMs !== undefined &&
      completedMs !== undefined &&
      completedMs < roundStartedMs
    );
  };

  const failures = checks.filter(
    (check) => check.bucket === 'fail' || check.bucket === 'cancel',
  );

  const failed = failures
    .filter((check) => !isOfRoundBefore(check))
    .map(({ name, link }) => ({ name, link }));

  const pending = [
    ...checks
      .filter((check) => check.bucket === 'pending')
      .map((check) => check.name),
    ...failures.filter(isOfRoundBefore).map((check) => check.name),
  ] as const;

  const reported = new Set(checks.map((check) => check.name));

  const missing = requiredContexts.filter((context) => !reported.has(context));

  const stillRunning = running
    .map(({ name }) => name)
    .filter((name) => !pending.includes(name));

  const status = Arr.isNonEmpty(failed)
    ? 'failed'
    : // No checks at all means they have not been reported yet — which is
      // also all that can be said when the ruleset could not be read.
      Arr.isNonEmpty(pending) ||
        Arr.isNonEmpty(missing) ||
        Arr.isNonEmpty(stillRunning) ||
        !Arr.isNonEmpty(checks)
      ? 'pending'
      : 'passed';

  return {
    status,
    failed,
    pending,
    missing,
    running: stillRunning,
    total: Math.max(checks.length, requiredContexts.length),
  };
};

/** Everything the merge is still waiting for, reported and unreported. */
export const describeWaitingOn = (summary: ChecksSummary): string => {
  const waiting = [
    ...summary.pending,
    ...summary.missing.map((context) => `${context} (not reported yet)`),
    ...summary.running.map((name) => `${name} (running)`),
  ] as const;

  return Arr.isNonEmpty(waiting) ? waiting.join(', ') : 'checks to be reported';
};

/**
 * When the earliest check still running started, in milliseconds; `undefined`
 * when nothing is running or no start time can be read.
 */
const earliestStart = (
  running: readonly RunningCheck[],
): number | undefined => {
  const starts = Arr.generate(function* () {
    for (const { startedAt } of running) {
      const ms = epochMs(startedAt);

      if (ms !== undefined) {
        yield ms;
      }
    }
  });

  return Arr.isNonEmpty(starts) ? Math.min(...starts) : undefined;
};

/** An ISO 8601 instant in milliseconds; `undefined` when it is not one. */
const epochMs = (iso: string): number | undefined => {
  try {
    return Temporal.Instant.from(iso).epochMilliseconds;
  } catch {
    return undefined;
  }
};
