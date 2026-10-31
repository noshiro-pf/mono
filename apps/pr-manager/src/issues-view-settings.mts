/**
 * How the issues block shows the open issues, and how that is kept in the
 * URL: as the list or as the DAG (`issues=dag`). Kept as the layout is
 * (`layout.mts`), so a bookmark or a pasted link opens on the same view;
 * only what differs from {@link DEFAULT_ISSUES_VIEW_SETTINGS} is written.
 *
 * The DAG's own switches are gone: what is done is never drawn, and what is
 * pending is the list's switch (`issues.hidePending`, `issues-list-view.mts`),
 * which both views read. A `dag.hideDone` an older page wrote is dropped as the
 * settings are next written, and so is a `dag.hidePending`, once the list's
 * view has read it as `issues.hidePending`.
 */

import { currentSearch, rewriteSearch, searchOf } from './url.mjs';

export const issuesViews = ['list', 'dag'] as const;

export type IssuesView = (typeof issuesViews)[number];

export type IssuesViewSettings = Readonly<{
  view: IssuesView;
}>;

export const DEFAULT_ISSUES_VIEW_SETTINGS: IssuesViewSettings = {
  view: 'list',
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

  for (const dropped of DROPPED) {
    params.delete(dropped);
  }

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
} as const;

/** What an older page wrote for the DAG's switches. */
const DROPPED = ['dag.hideDone', 'dag.hidePending'] as const;
