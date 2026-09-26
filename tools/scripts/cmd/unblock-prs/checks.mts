/**
 * What the merge is waiting for, read from `gh pr checks` and judged against
 * the contexts the ruleset requires.
 */

import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { git, parseJson } from './github.mjs';
import { type ChecksSummary } from './types.mjs';

/** The fields read from `gh pr checks --json`. */
const CheckListSchema = t.array(
  t.record({
    name: t.string(),
    /** `pass` | `fail` | `pending` | `skipping` | `cancel` */
    bucket: t.string(),
    link: t.string(),
  }),
);

export type ReportedCheck = t.TypeOf<typeof CheckListSchema>[number];

/**
 * The checks that gate the merge, as GitHub reports them for the head commit.
 * `--required` reads `isRequired` from the API, so the list follows the
 * ruleset without this script having to know it.
 */
export const listRequiredChecks = async (
  prNumber: number,
): Promise<Result<readonly ReportedCheck[], string>> => {
  const listed = await git(
    `gh pr checks ${prNumber} --required --json name,bucket,link`,
  );

  if (Result.isErr(listed)) {
    // Right after a push there is nothing to report yet, and gh treats that
    // as an error rather than an empty list.
    return listed.value.includes('no checks reported') ? Result.ok([]) : listed;
  }

  return parseJson(listed.value, CheckListSchema);
};

/**
 * The checks on the head commit that have not finished, required or not.
 *
 * A required aggregate has no run in a new round until the jobs it waits on
 * are done, so until then `--required` answers with the round before. When
 * that round was the one `skip-ci` skipped, every aggregate reads `skipped`
 * and the commit looks green halfway through its matrix. Anything still
 * running is what says the round is not over.
 */
export const listRunningChecks = async (
  prNumber: number,
): Promise<Result<readonly string[], string>> => {
  const listed = await git(`gh pr checks ${prNumber} --json name,bucket,link`);

  if (Result.isErr(listed)) {
    return listed.value.includes('no checks reported') ? Result.ok([]) : listed;
  }

  return Result.map(parseJson(listed.value, CheckListSchema), (checks) =>
    checks
      .filter((check) => check.bucket === 'pending')
      .map((check) => check.name),
  );
};

/**
 * `checks` is what `gh pr checks --required` reported for the head commit;
 * `requiredContexts` is what the ruleset asks for. The difference between the
 * two is the point: a context in the second and not the first has not
 * reported yet, and GitHub will not merge until it does. `running` is every
 * check on the head that has not finished ({@link listRunningChecks}); while
 * it is not empty the required ones may be the round before speaking, so
 * they can fail the pull request but not pass it.
 */
export const summarizeChecks = (
  checks: readonly ReportedCheck[],
  requiredContexts: readonly string[],
  running: readonly string[],
): ChecksSummary => {
  const failed = checks
    .filter((check) => check.bucket === 'fail' || check.bucket === 'cancel')
    .map((check) => check.name);

  const pending = checks
    .filter((check) => check.bucket === 'pending')
    .map((check) => check.name);

  const reported = new Set(checks.map((check) => check.name));

  const missing = requiredContexts.filter((context) => !reported.has(context));

  const stillRunning = running.filter((name) => !pending.includes(name));

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

/** Merge states in which GitHub itself says nothing holds the merge. */
export const isMergeableState = (mergeStateStatus: string): boolean =>
  mergeStateStatus === 'CLEAN' ||
  mergeStateStatus === 'HAS_HOOKS' ||
  mergeStateStatus === 'UNSTABLE';
