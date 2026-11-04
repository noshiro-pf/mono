import {
  pullRequestSplitViewSearch,
  splitViewExtensionId,
  splitViewPagePath,
} from 'split-view-link';
import type { StrictPick } from 'ts-type-forge';
import type { Entry } from './load-report.mjs';

/**
 * A link that opens a pull request in `split-view-extension`, laid out as
 * `pullRequestSplitViewSearch` says.
 *
 * Only the first issue and the first session are shown. A pull request that
 * names several is rare enough that another pane, narrower than anything is
 * readable in, is not worth drawing for it.
 *
 * Every link names the same saved split view, `ws=pr-manager`, so that opening
 * one pull request after another replaces what that entry holds rather than
 * adding an entry per pull request to the extension's list. A tab already open
 * on an earlier pull request keeps showing it: the extension shows what a tab's
 * own URL describes, over what is saved.
 */
export const splitViewUrl = (entry: SplitViewSource): string =>
  `${splitViewPageUrl}${pullRequestSplitViewSearch({
    workspace,
    pullRequest: entry,
    title: entry.title,
    issueUrl: entry.linkedIssues[0]?.url,
    sessionUrl: entry.claudeSessions[0]?.url,
  })}` as const;

/** What of a pull request the link is made from. */
export type SplitViewSource = StrictPick<
  Entry,
  'number' | 'title' | 'url' | 'linkedIssues' | 'claudeSessions'
>;

/**
 * Reachable from this page only because the extension's manifest lists
 * `split.html` in `web_accessible_resources` for `noshiro-pf.github.io` and, in
 * its development build only, for this app's dev server port. From any other
 * origin Chrome blocks the navigation with `ERR_BLOCKED_BY_CLIENT`.
 */
const splitViewPageUrl =
  `chrome-extension://${splitViewExtensionId}/${splitViewPagePath}` as const;

const workspace = { id: 'pr-manager', name: 'PR Manager' } as const;
