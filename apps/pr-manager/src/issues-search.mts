/**
 * The open issues as a GitHub search, as far as one can say them, for the
 * issues block's "on GitHub" link: the merge order's `githubSearchOf`
 * (`merge-order-view.mts`), for the view of issues (`issues-list-view.mts`).
 *
 * The tiers are `priority:<tier>` labels: one switched off is `-label:`, those
 * picked are one `label:` listing them, which GitHub reads as any of them, and
 * `none` is an issue carrying no one of them — switched off, it asks for one of
 * them; picked alone, it negates them all; picked with a tier, it is "this tier
 * or none of them", which is no search GitHub has. An issue carrying several
 * tiers, which the page counts as `none`, is where the two can still differ.
 * The labels picked are one `label:` too.
 *
 * `in progress` and the start states are read off the issue graph and the open
 * pull requests (`issue-start.mts`), which GitHub's search knows nothing of,
 * and the search matches any part of a title, or a number, where GitHub's
 * matches whole words, so they are left out and said to be, as where GitHub
 * lists more. The DAG reads the tiers and `in progress` alone, as it does on
 * the page, and also draws what a drawn issue waits on, whatever its tier and
 * even closed unfinished, which the search can leave out. GitHub has no order
 * by tier or by start state.
 */

import {
  ISSUE_PRIORITIES,
  issuePriorityLabel,
  type IssuePriority,
} from 'pr-report-core';
import { Arr } from 'ts-data-forge';
import type { IssuesListView } from './issues-list-view.mjs';
import type { IssuesView } from './issues-view-settings.mjs';
import { anyLabelQualifier, notLabelQualifier } from './label-search.mjs';
import type { IssueTier } from './priority.mjs';

export const githubIssuesSearchOf = (
  view: IssuesListView,
  query: string,
  shown: IssuesView,
): IssuesSearch => {
  const isList = shown === 'list';

  const picked = view.onlyPriorities.filter(isTier);

  const isNonePicked = view.onlyPriorities.includes('none');

  const tiers = Arr.uniq([
    ...view.hiddenPriorities
      .filter(isTier)
      .map((tier) => notLabelQualifier(issuePriorityLabel(tier))),
    ...(view.hiddenPriorities.includes('none')
      ? [anyLabelQualifier(ISSUE_PRIORITIES.map(issuePriorityLabel))]
      : []),
    ...(!isNonePicked && Arr.isNonEmpty(picked)
      ? [anyLabelQualifier(picked.map(issuePriorityLabel))]
      : []),
    ...(isNonePicked && !Arr.isNonEmpty(picked)
      ? ISSUE_PRIORITIES.map((tier) =>
          notLabelQualifier(issuePriorityLabel(tier)),
        )
      : []),
  ]);

  return {
    qualifiers: [
      ...tiers,
      ...(isList && Arr.isNonEmpty(view.onlyLabels)
        ? [anyLabelQualifier(view.onlyLabels)]
        : []),
    ],
    unsearchable: [
      ...(isNonePicked && Arr.isNonEmpty(picked) ? ['the tiers picked'] : []),
      ...(view.hideInProgress || view.onlyInProgress ? ['in progress'] : []),
      ...(isList && Arr.isNonEmpty(view.hiddenStarts) ? ['start state'] : []),
      ...(isList && query.trim() !== ''
        ? ['the search by title or number']
        : []),
    ],
    isPrerequisiteLeftOut: !isList,
  } as const;
};

/**
 * The "on GitHub" link's tooltip: what it lists, where it lists more than the
 * page does, and, for the DAG, what it leaves out.
 */
export const githubIssuesSearchTitle = ({
  unsearchable,
  isPrerequisiteLeftOut,
}: IssuesSearch): string =>
  [
    'The open issues as the filters leave them, most recently updated first.',
    ...(Arr.isNonEmpty(unsearchable)
      ? [
          `GitHub's search cannot narrow by ${unsearchable.map((name) => `“${name}”`).join(', ')}, so it lists more.`,
        ]
      : []),
    ...(isPrerequisiteLeftOut
      ? ['The DAG also draws what the issues wait on, which it can leave out.']
      : []),
  ].join(' ');

/** The view as a GitHub issue search, as far as one can say it. */
export type IssuesSearch = Readonly<{
  /** What to add to `is:issue is:open`, before the order. */
  qualifiers: readonly string[];
  /** What the search cannot narrow by, as the page names it. */
  unsearchable: readonly string[];
  /**
   * Whether the DAG draws issues the search leaves out: what a drawn one waits
   * on, whatever its tier.
   */
  isPrerequisiteLeftOut: boolean;
}>;

const isTier = (tier: IssueTier): tier is IssuePriority => tier !== 'none';
