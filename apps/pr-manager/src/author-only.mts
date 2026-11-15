/**
 * Whether an open issue is one only the author can do: it carries the
 * `author-only` label (`docs/issue-priority.md`), which says what it asks takes
 * the author's own accounts, consoles or machine, so no session is handed it
 * whatever its tier. The open issues filter by it in either view
 * (`issue-filter.mts`), as they do by `in progress`: the author looks for their
 * own work alone, and a reader choosing what a session could take leaves it
 * out.
 */

import { AUTHOR_ONLY_LABEL, hasLabel, type Label } from 'pr-report-core';

/**
 * Whether `labels` say only the author can do the issue, whatever the case,
 * since GitHub's label names are case-insensitive and `run-issue-resolver`
 * reads them so (`hasLabel`): what it holds back is what this counts.
 */
export const isAuthorOnly = (labels: readonly Label[]): boolean =>
  hasLabel(labels, AUTHOR_ONLY_LABEL);

/** Whether `labelName` is `author-only`, whatever the case. */
export const isAuthorOnlyLabel = (labelName: string): boolean =>
  hasLabel([{ name: labelName }], AUTHOR_ONLY_LABEL);

/** Whether an issue only the author can do, or not, is shown under `filter`. */
export const isAuthorOnlyShown = (
  authorOnly: boolean,
  filter: AuthorOnlyFilter,
): boolean => (authorOnly ? !filter.hideAuthorOnly : !filter.onlyAuthorOnly);

/**
 * Whether the issues only the author can do are shown: switched off, or picked
 * ("only") to be shown alone, as `in progress` is (`in-progress.mts`). Never
 * both: picking it switches it back on, and switching it off unpicks it.
 */
export type AuthorOnlyFilter = Readonly<{
  /** Whether the issues only the author can do are left out. */
  hideAuthorOnly: boolean;
  /** Whether only the issues only the author can do are shown. */
  onlyAuthorOnly: boolean;
}>;
