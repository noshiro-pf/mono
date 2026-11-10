import { ISSUE_TIERS, IssueLabel, issueTierLabel } from 'pr-report-core-v2';
import { Arr } from 'ts-data-forge';
import { anyLabelQualifier, notLabelQualifier } from '../github-search.mjs';
import type { IssuesSettings } from './issues-view.mjs';

/**
 * The closest GitHub search for the issues the block shows, and the tooltip
 * saying where it lists more (spec §11.1). Tiers and picked labels are labels;
 * `in progress` is read from the label alone, though the page also counts an
 * open pull request closing the issue and a `started` claim; the start states
 * and the search box are the page's own.
 */
export const issuesSearchOf = (
  settings: IssuesSettings,
): Readonly<{ query: string; title: string }> => {
  const named = ISSUE_TIERS.map(issueTierLabel);

  const picked = settings.onlyPriority.filter((tier) => tier !== 'none');

  const pickedNone = settings.onlyPriority.includes('none');

  const query = [
    'is:issue is:open',
    ...settings.hidePriority.flatMap((tier) =>
      tier === 'none'
        ? [anyLabelQualifier(named)]
        : [notLabelQualifier(issueTierLabel(tier))],
    ),
    ...(!pickedNone && Arr.isNonEmpty(picked)
      ? [anyLabelQualifier(picked.map(issueTierLabel))]
      : []),
    ...(pickedNone && !Arr.isNonEmpty(picked)
      ? named.map(notLabelQualifier)
      : []),
    ...(settings.hideInProgress
      ? [notLabelQualifier(IssueLabel.inProgress)]
      : []),
    ...(settings.onlyInProgress
      ? [anyLabelQualifier([IssueLabel.inProgress])]
      : []),
    ...(Arr.isNonEmpty(settings.labels)
      ? [anyLabelQualifier(settings.labels)]
      : []),
    'sort:updated-desc',
  ].join(' ');

  return {
    query,
    title: [
      'The open issues as the tiers and labels leave them.',
      'In progress is read from the in-progress label alone, the start states and the search box are not searched,',
      ...(pickedNone && Arr.isNonEmpty(picked)
        ? [
            'and “none” picked with a tier cannot be searched, so the tiers are not narrowed.',
          ]
        : ['so GitHub may list more.']),
    ].join(' '),
  };
};
