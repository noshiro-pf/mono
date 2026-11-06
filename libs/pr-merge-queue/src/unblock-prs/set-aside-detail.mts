/**
 * The one sentence a set-aside record carries: what the log says, and what the
 * comment on the pull request leads with.
 *
 * Each says what a reader would otherwise have to go and find — which check,
 * which file, which hold — rather than restate the reason. The comment has room
 * for more, and `set-aside-comment.mts` adds it: the failed checks with their
 * runs, and what the command printed.
 */

import type { ReviewHold } from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import { describeWaitingOn } from './checks.mjs';
import type { ChecksSummary } from './types.mjs';

/**
 * The failed required checks by name, and each with its run, which the comment
 * links so that the failure itself is one click away.
 */
export const describeFailedChecks = (
  summary: ChecksSummary,
): Readonly<{ detail: string; failedChecks: ChecksSummary['failedRuns'] }> =>
  ({
    detail: `failed: ${summary.failed.join(', ')}`,
    failedChecks: summary.failedRuns,
  }) as const;

/**
 * What holds a pull request whose required checks are all green, from its
 * review as read at the watched head (`pr-report-core`'s `reviewHold`, which
 * triage reads too): the approval it waits for, or the conversations. GitHub's
 * `reviewDecision` cannot say this — it describes branch protection, not a
 * ruleset, and is `null` here. What is left once the review shows no hold is a
 * guess — `reviewHold` holds nothing where it cannot tell, a team owner or
 * files past what was read, nor where the ruleset asks no review — and so is
 * everything when it could not be read.
 */
export const describeHold = (
  mergeStateStatus: string,
  review: Result<ReviewHold | undefined, string>,
): string => {
  const head = `green but ${mergeStateStatus}` as const;

  return Result.isErr(review)
    ? `${head}: its review could not be read (${review.value}); a code owner's approval, an unresolved conversation, or armed by who may not merge?`
    : review.value === undefined
      ? `${head}: nothing the worker could tell from its review holds it (not an owner team's approval, nor files past what it read); armed by who may not merge?`
      : `${head}: ${review.value.reason}`;
};

/** What the watch was still waiting on when it gave up. */
export const describeTimeout = (
  summary: ChecksSummary,
  timeoutMin: number,
): string =>
  `after ${timeoutMin} min, still waiting on ${describeWaitingOn(summary)}` as const;

/**
 * The required contexts that never reported on a head where nothing else was
 * left running: the workflows behind them were never started.
 */
export const describeNotStarted = (
  summary: ChecksSummary,
  graceMin: number,
): string =>
  `nothing ran on its head for ${graceMin} min, nor for ${graceMin} more after its check workflows were re-fired, and ${summary.missing.join(', ')} never reported: GitHub started no run for them` as const;

/**
 * The files a rebase stopped on, or when git named none — a rebase can fail
 * before it reaches a merge — the end of what it printed. When some of the
 * files could have been generated again (`regenerate.mts`) and the rest not,
 * which ones, so that whoever resolves it by hand knows which to regenerate.
 */
export const describeConflict = (
  conflicted: readonly string[],
  output: string,
  onto: string,
  wouldRegenerate: readonly string[] = [],
): string =>
  Arr.isNonEmpty(conflicted)
    ? (`conflicts with ${onto} in ${conflicted.join(', ')}${
        Arr.isNonEmpty(wouldRegenerate)
          ? `; only ${wouldRegenerate.join(', ')} could be generated again`
          : ''
      }` as const)
    : (`rebase onto ${onto} failed: ${output.replaceAll(/\s+/gu, ' ').trim()}` as const);

/**
 * The end of what a failed command printed. Node's message starts with
 * `Command failed: <the command>`, which says nothing the reason does not and
 * crowds out what does: an arm that failed was once reported as its own
 * GraphQL mutation, cut off before GitHub's answer. Only a command that printed
 * nothing is left with that line.
 */
export const describeCommandFailure = (message: string): string => {
  const lines = message.trim().split('\n');

  const printed =
    lines[0]?.startsWith(COMMAND_FAILED) === true ? Arr.tail(lines) : lines;

  return Arr.takeLast(Arr.isNonEmpty(printed) ? printed : lines, 2).join('\n');
};

const COMMAND_FAILED = 'Command failed: ';
