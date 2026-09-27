/**
 * The words a set-aside status says after `<reason> at <base SHA>: `.
 *
 * GitHub keeps a status description to 140 characters and the prefix takes
 * about 55 of them, so each says what a reader would otherwise have to go
 * and find — which check, which file, which hold — rather than restate the
 * reason. `describeSetAside` in `pr-report-core` cuts what does not fit.
 */

import { Arr } from 'ts-data-forge';
import { describeWaitingOn } from './checks.mjs';
import { type ChecksSummary } from './types.mjs';

/**
 * The failed required checks, and the first one's run as the status's
 * link, so that "Details" on the pull request opens the failure itself.
 */
export const describeFailedChecks = (
  summary: ChecksSummary,
): Readonly<{ detail: string; link: string | undefined }> =>
  ({
    detail: `failed: ${summary.failed.map((check) => check.name).join(', ')}`,
    link: summary.failed.find((check) => check.link !== '')?.link,
  }) as const;

/**
 * What holds a pull request whose required checks are all green.
 * `reviewDecision` is `gh pr view`'s: `REVIEW_REQUIRED` when a review the
 * rules ask for is missing, which with `required_approving_review_count: 0`
 * leaves a code owner's; empty when the rules ask for none.
 */
export const describeHold = (
  mergeStateStatus: string,
  reviewDecision: string | undefined,
): string => {
  const head = `green but ${mergeStateStatus}` as const;

  return reviewDecision === 'REVIEW_REQUIRED'
    ? `${head}: a required review is missing (a code owner?)`
    : reviewDecision === 'CHANGES_REQUESTED'
      ? `${head}: changes requested`
      : `${head}: an unresolved conversation, or armed by who may not merge?`;
};

/** What the watch was still waiting on when it gave up. */
export const describeTimeout = (
  summary: ChecksSummary,
  timeoutMin: number,
): string =>
  `after ${timeoutMin} min, still waiting on ${describeWaitingOn(summary)}` as const;

/**
 * The files a rebase stopped on, or when git named none — a rebase can fail
 * before it reaches a merge — the end of what it printed.
 */
export const describeConflict = (
  conflicted: readonly string[],
  output: string,
  onto: string,
): string =>
  Arr.isNonEmpty(conflicted)
    ? (`conflicts with ${onto} in ${conflicted.join(', ')}` as const)
    : (`rebase onto ${onto} failed: ${output.replaceAll(/\s+/gu, ' ').trim()}` as const);

/**
 * The end of what a failed command printed. Node's message starts with
 * `Command failed: <the command>`, which says nothing the reason does not and
 * alone fills a status: an arm that failed was once reported as its own
 * GraphQL mutation, cut off before GitHub's answer. Only a command that
 * printed nothing is left with that line.
 */
export const describeCommandFailure = (message: string): string => {
  const lines = message.trim().split('\n');

  const printed =
    lines[0]?.startsWith(COMMAND_FAILED) === true ? Arr.tail(lines) : lines;

  return Arr.takeLast(Arr.isNonEmpty(printed) ? printed : lines, 2).join('\n');
};

const COMMAND_FAILED = 'Command failed: ';
