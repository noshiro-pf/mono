import { type ReportEntry } from 'pr-report-core';
import { type StrictPick } from 'ts-type-forge';

/**
 * A link that opens a pull request in `split-view-extension`: the diff on the
 * left and the conversation on the right at 7:3, or — when the pull request
 * closes an issue — the diff, the conversation and the issue at 2:1:1.
 *
 * Only the first issue is shown. A pull request that closes several is rare
 * enough that a fourth pane, narrower than anything is readable in, is not
 * worth drawing for it.
 *
 * The tab is titled `#<number> <title>`, as a tab of the pull request on
 * GitHub would be with the number first.
 *
 * Every link names the same saved split view, `ws=pr-manager`, so that
 * opening one pull request after another replaces what that entry holds
 * rather than adding an entry per pull request to the extension's list. A tab
 * already open on an earlier pull request keeps showing it: the extension
 * shows what a tab's own URL describes, over what is saved.
 */
export const splitViewUrl = (entry: SplitViewSource): string => {
  const issue = entry.linkedIssues[0];

  const params = [
    ['ws', workspaceId],
    ['name', workspaceName],
    ['title', `#${entry.number} ${entry.title}`],
    ['layout', issue === undefined ? twoColumns : threeColumns],
    ['url', `${entry.url}/files`],
    ['url', entry.url],
    ...(issue === undefined ? ([] as const) : ([['url', issue.url]] as const)),
  ] as const;

  // Escaped as a form is, `:` and `/` included; the extension reads either
  // form, and writes the readable one back into its address bar once it has
  // loaded. One pair at a time, because `url` repeats.
  const query = params
    .map(([key, value]) => String(new URLSearchParams({ [key]: value })))
    .join('&');

  return `${splitViewPageUrl}?${query}`;
};

/** What of a pull request the link is made from. */
export type SplitViewSource = StrictPick<
  ReportEntry,
  'number' | 'title' | 'url' | 'linkedIssues'
>;

/**
 * The id `key` in the extension's `public/manifest.json` pins, which is the id
 * an unpacked build has wherever it is loaded from. A build installed from the
 * Chrome Web Store has an id of its own, and this link does not reach it.
 */
const extensionId = 'nifmgpafbfpgpcijgmfpcoonjbalbkhf';

/**
 * Reachable from this page only because the extension's manifest lists
 * `split.html` in `web_accessible_resources` for `noshiro-pf.github.io` and,
 * in its development build only, for this app's dev server port. From any
 * other origin Chrome blocks the navigation with `ERR_BLOCKED_BY_CLIENT`.
 */
const splitViewPageUrl =
  `chrome-extension://${extensionId}/split.html` as const;

const workspaceId = 'pr-manager';

const workspaceName = 'PR Manager';

/** The diff beside the conversation, 7:3. */
const twoColumns = 'r70pp';

/** The diff, then the conversation beside the issue: half, and a quarter each. */
const threeColumns = 'rprpp';
