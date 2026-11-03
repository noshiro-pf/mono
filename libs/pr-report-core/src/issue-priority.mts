/**
 * How soon an open issue should be started: one `priority:<tier>` label each,
 * decided when the issue is filed. What each tier means, and how an issue is
 * placed in one, is `docs/issue-priority.md`.
 *
 * These are issue labels. A pull request's place in the merge queue is
 * `priority:high` / `priority:low` (`labels.mts`), which no issue carries.
 */

/** The tier the one `priority:<tier>` label names, `none`, or `several`. */
export const issuePriorityOfLabels = (
  labels: readonly string[],
): IssuePriority | 'none' | 'several' => {
  const carried = ISSUE_PRIORITIES.filter((priority) =>
    labels.includes(issuePriorityLabel(priority)),
  );

  switch (carried.length) {
    case 0:
      return 'none';

    case 1:
      return carried[0] ?? 'none';

    default:
      return 'several';
  }
};

/**
 * Where an issue goes in the order it is started in, as a sort key: `S` first,
 * then `A`, `B` and `C`, then one with no tier or several, then `D`. What
 * nobody has placed is not known to matter less than what was placed last.
 * `hold` and `close` rank with no tier here; whoever takes issues in this order
 * leaves them out first.
 */
export const issueStartRank = (labels: readonly string[]): number => {
  const priority = issuePriorityOfLabels(labels);

  return priority === 'none' || priority === 'several'
    ? UNPLACED_RANK
    : rankOf(priority);
};

/** The tier as written on a command line, or `undefined` for anything else. */
export const parseIssuePriority = (raw: string): IssuePriority | undefined =>
  ISSUE_PRIORITIES.find((priority) => priority === raw);

export const issuePriorityLabel = (
  priority: IssuePriority,
): `priority:${IssuePriority}` => `priority:${priority}` as const;

/**
 * Every tier, the order `docs/issue-priority.md` lists them in.
 *
 * - `S` — speeds up the work on everything else now: CI, `check-changed`, the
 *   merge queue, the review loop, a step a person does by hand most days.
 * - `A` — what the rest of that stands on, a step a person does by hand on
 *   every release or deploy, a security issue, or a bug real users meet that
 *   stops what they came to do.
 * - `B` — the other bugs in an app with users or in a published package, and
 *   smaller gains in speed.
 * - `C` — documents, refactoring, small improvements and features.
 * - `D` — an app nobody uses but its author, and large features.
 * - `hold` — not to be started as things stand: code about to be replaced, or
 *   work waiting on a decision.
 * - `close` — to be closed or folded into another issue at the next triage.
 *
 * `pr-manager`'s tier tooltips (`issue-tier-group.tsx`) repeat this list.
 */
export const ISSUE_PRIORITIES = [
  'S',
  'A',
  'B',
  'C',
  'D',
  'hold',
  'close',
] as const;

export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];

/** The tiers a new issue may be filed under: `close` is a verdict on one. */
export const FILING_PRIORITIES = [
  'S',
  'A',
  'B',
  'C',
  'D',
  'hold',
] as const satisfies readonly IssuePriority[];

const UNPLACED_RANK = 4;

const rankOf = (priority: IssuePriority): number => {
  switch (priority) {
    case 'S':
      return 0;

    case 'A':
      return 1;

    case 'B':
      return 2;

    case 'C':
      return 3;

    case 'D':
      return 5;

    case 'hold':
    case 'close':
      return UNPLACED_RANK;
  }
};
