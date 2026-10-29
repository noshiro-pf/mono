/**
 * How the issues block shows the open issues, and how that is kept in the
 * URL: as the list or as the DAG (`issues=dag`), and whether the DAG leaves
 * out what is done (`dag.hideDone=1`) and what is labelled `pending`
 * (`dag.hidePending=1`). Kept as the layout is (`layout.mts`), so a bookmark
 * or a pasted link opens on the same view; only what differs from
 * {@link DEFAULT_ISSUES_VIEW_SETTINGS} is written. The DAG's switches are
 * kept while the list is shown, so that going back to the DAG finds them as
 * they were.
 */

import {
  currentSearch,
  flagParam,
  rewriteSearch,
  searchOf,
  setFlagParam,
} from './url.mjs';

export const issuesViews = ['list', 'dag'] as const;

export type IssuesView = (typeof issuesViews)[number];

export type IssuesViewSettings = Readonly<{
  view: IssuesView;
  /** Whether the DAG leaves out what is done. */
  hideDone: boolean;
  /** Whether the DAG leaves out what is labelled `pending`. */
  hidePending: boolean;
}>;

export const DEFAULT_ISSUES_VIEW_SETTINGS: IssuesViewSettings = {
  view: 'list',
  hideDone: false,
  hidePending: false,
} as const;

/** Anything it cannot read is the default. */
export const issuesViewSettingsFromSearch = (
  search: string,
): IssuesViewSettings => {
  const params = new URLSearchParams(search);

  return {
    view:
      issuesViews.find((each) => each === params.get(PARAM.view)) ??
      DEFAULT_ISSUES_VIEW_SETTINGS.view,
    hideDone: flagParam(params, PARAM.hideDone),
    hidePending: flagParam(params, PARAM.hidePending),
  };
};

/** The query string with `settings` written in, the rest as it was. */
export const searchWithIssuesViewSettings = (
  search: string,
  settings: IssuesViewSettings,
): string => {
  const params = new URLSearchParams(search);

  if (settings.view === DEFAULT_ISSUES_VIEW_SETTINGS.view) {
    params.delete(PARAM.view);
  } else {
    params.set(PARAM.view, settings.view);
  }

  setFlagParam(params, PARAM.hideDone, settings.hideDone);

  setFlagParam(params, PARAM.hidePending, settings.hidePending);

  return searchOf(params);
};

/** What the query string asks for, now. */
export const issuesViewSettingsFromLocation = (): IssuesViewSettings =>
  issuesViewSettingsFromSearch(currentSearch());

/** Writes the settings into the address bar; see `rewriteSearch`. */
export const saveIssuesViewSettings = (settings: IssuesViewSettings): void => {
  rewriteSearch((search) => searchWithIssuesViewSettings(search, settings));
};

const PARAM = {
  view: 'issues',
  hideDone: 'dag.hideDone',
  hidePending: 'dag.hidePending',
} as const;
