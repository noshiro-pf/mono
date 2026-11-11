/** What a session that ran comes to, read from its result and the issue after it. */

import { Arr } from 'ts-data-forge';
import { mayHaveSpent, type ResultEvent } from '../../agent/index.mjs';

/**
 * What a session that ran comes to for its issue, from its result and the issue
 * read once it ended (`undefined` when it could not be read).
 *
 * - `opened`: an open pull request closes it now.
 * - `closed`: it is closed; nothing more to start.
 * - `left`: neither — the session found it could not be finished here, or
 *   stopped short (given up, out of budget, failed or stopped after spending,
 *   or ended with no result at all, where what it spent is unknown). Not
 *   handed on again until someone changes the issue.
 * - `not-started`: it failed before spending anything (a bad key, the API
 *   down). Tried again on the next look.
 *
 * `release` is whether to take off the `in-progress` label the command put on
 * before the session: always but where a pull request closes the issue now,
 * since the label would otherwise keep everyone off it for good, a closed one
 * reopened included. Unread, it is taken off as well: one a pull request closes
 * reads as in progress without it.
 */
export const judgeIssueSession = (
  result: ResultEvent | undefined,
  after: IssueAfter | undefined,
): Readonly<{ verdict: IssueVerdict; release: boolean }> =>
  !mayHaveSpent(result)
    ? ({ verdict: 'not-started', release: true } as const)
    : after === undefined
      ? ({ verdict: 'left', release: true } as const)
      : !after.open
        ? ({ verdict: 'closed', release: true } as const)
        : Arr.isNonEmpty(after.closedBy)
          ? ({ verdict: 'opened', release: false } as const)
          : ({ verdict: 'left', release: true } as const);

/** What {@link judgeIssueSession} reads of the issue once the session ended. */
export type IssueAfter = Readonly<{
  open: boolean;
  /** The open pull requests that close it. */
  closedBy: readonly number[];
}>;

export type IssueVerdict = 'closed' | 'left' | 'not-started' | 'opened';

/**
 * Whether the session's cap is what stopped it: its result says so, or it spent
 * as much. Such an issue is held for the run, not recorded, since a later run
 * may cap a session on it higher.
 */
export const hitItsCap = (
  result: ResultEvent | undefined,
  capUsd: number,
): boolean =>
  result?.subtype === BUDGET_SUBTYPE ||
  (result?.costUsd !== undefined && capUsd <= result.costUsd);

/** What `claude -p` ends with when `--max-budget-usd` stopped it. */
const BUDGET_SUBTYPE = 'error_max_budget_usd';
