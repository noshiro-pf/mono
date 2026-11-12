import {
  pullRequestSplitViewSearch,
  splitViewExtensionId,
  splitViewPagePath,
} from 'split-view-link';

/**
 * The link that opens a pull request in `split-view-extension` (spec §12), laid
 * out as `pullRequestSplitViewSearch` says, with its first closing issue and its
 * first session: another pane for a rare second one would be too narrow to read.
 *
 * Every link names the one saved view `PR Manager`, so opening one pull request
 * after another replaces that entry rather than adding one per pull request.
 */
export const splitViewUrl = (
  pullRequest: Readonly<{
    number: number;
    title: string;
    url: string;
    issueUrl: string | undefined;
    sessionUrl: string | undefined;
  }>,
): string =>
  `${PAGE}${pullRequestSplitViewSearch({
    workspace: WORKSPACE,
    pullRequest,
    title: pullRequest.title,
    issueUrl: pullRequest.issueUrl,
    sessionUrl: pullRequest.sessionUrl,
  })}` as const;

/**
 * Reachable only from origins the extension's manifest lists in
 * `web_accessible_resources`; from anywhere else Chrome blocks it.
 */
const PAGE =
  `chrome-extension://${splitViewExtensionId}/${splitViewPagePath}` as const;

const WORKSPACE = { id: 'pr-manager', name: 'PR Manager' } as const;
