import { Arr } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import type { Entry } from './load-report.mjs';

/**
 * A link that opens a pull request in `split-view-extension`: the diff on the
 * left at the narrowest width that keeps GitHub's file tree, without whitespace
 * changes or the files marked viewed, and the conversation in the rest of the
 * page. When the pull request closes an issue or names the Claude
 * Code session it was written in, the conversation is held at the widest its
 * description gets with the sidebar below it and that takes the rest, to the
 * right of the conversation; with both, the issue is stacked over the session.
 *
 * Only the first issue and the first session are shown. A pull request that
 * names several is rare enough that another pane, narrower than anything is
 * readable in, is not worth drawing for it.
 *
 * The conversation and the issue are shown at 75%, so that more of each fits in
 * a pane narrower than GitHub lays them out for — the conversation beside the
 * diff alone too, so that it reads the same whatever shares the page. The diff
 * is at 100% beside the conversation alone and at 75% in three columns; the
 * session stays at 100%.
 *
 * The tab is titled `#<number> <title>`, as a tab of the pull request on
 * GitHub would be with the number first.
 *
 * Every link names the same saved split view, `ws=pr-manager`, so that opening
 * one pull request after another replaces what that entry holds rather than
 * adding an entry per pull request to the extension's list. A tab already open
 * on an earlier pull request keeps showing it: the extension shows what a tab's
 * own URL describes, over what is saved.
 */
export const splitViewUrl = (entry: SplitViewSource): string => {
  const issueUrl = entry.linkedIssues[0]?.url;

  const sessionUrl = entry.claudeSessions[0]?.url;

  const conversation = { url: entry.url, zoom: reading } as const;

  // What goes to the right of the conversation, the issue over the session when
  // there are both.
  const others = [
    ...(issueUrl === undefined
      ? ([] as const)
      : ([{ url: issueUrl, zoom: reading }] as const)),
    ...(sessionUrl === undefined
      ? ([] as const)
      : ([{ url: sessionUrl, zoom: full }] as const)),
  ] as const;

  const layout = Arr.isEmpty(others)
    ? diffBesideConversation
    : Arr.isFixedLengthArray(1, others)
      ? threeColumns
      : threeColumnsStacked;

  const diff = {
    url: `${entry.url}/files?${diffQuery}`,
    zoom: Arr.isEmpty(others) ? full : reading,
  } as const;

  const panes = [diff, conversation, ...others] as const;

  const params = [
    ['ws', workspaceId],
    ['name', workspaceName],
    ['title', `#${entry.number} ${entry.title}`],
    ['layout', layout],
    ...panes.map(({ url }) => ['url', url] as const),
    ...panes.map(({ zoom }) => ['zoom', zoom.toString()] as const),
  ] as const;

  // Escaped as a form is, `:` and `/` included; the extension reads either
  // form, and writes the readable one back into its address bar once it has
  // loaded. One pair at a time, because `url` repeats.
  const query = params
    .map(([key, value]) => new URLSearchParams({ [key]: value }))
    .map((pair) => pair.toString())
    .join('&');

  return `${splitViewPageUrl}?${query}`;
};

/** What of a pull request the link is made from. */
export type SplitViewSource = StrictPick<
  Entry,
  'number' | 'title' | 'url' | 'linkedIssues' | 'claudeSessions'
>;

/**
 * The id `key` in the extension's `public/manifest.json` pins, which is the id
 * an unpacked build has wherever it is loaded from. A build installed from the
 * Chrome Web Store has an id of its own, and this link does not reach it.
 */
const extensionId = 'nifmgpafbfpgpcijgmfpcoonjbalbkhf';

/**
 * Reachable from this page only because the extension's manifest lists
 * `split.html` in `web_accessible_resources` for `noshiro-pf.github.io` and, in
 * its development build only, for this app's dev server port. From any other
 * origin Chrome blocks the navigation with `ERR_BLOCKED_BY_CLIENT`.
 */
const splitViewPageUrl =
  `chrome-extension://${extensionId}/split.html` as const;

const workspaceId = 'pr-manager';

const workspaceName = 'PR Manager';

/**
 * The diff with whitespace changes hidden (`w=1`), and without the files
 * already marked viewed (`show-viewed-files=false`).
 */
const diffQuery = 'w=1&show-viewed-files=false';

/**
 * The diff beside the conversation alone: the diff held at 737px and the rest
 * to the conversation, whose description is what a pull request is reviewed in
 * now more than its diff.
 *
 * 737px is the narrowest the diff is at with GitHub's file tree beside it, at
 * the diff's 100%: below it the tree folds into a menu. Measured on the pane's
 * `<section>`, in the split view's own pixels, which are what a layout spec
 * holds a pane at, so the zoom of the split view's tab does not change it.
 */
const diffBesideConversation = 'r737fpp';

/**
 * The diff, the conversation and the right column: the diff held at 554px, the
 * conversation at 577px, and the rest to the right column.
 *
 * 554px is the 737px of `diffBesideConversation` at the diff's 75% here: the
 * pane's 1px borders do not zoom, so it is (737 - 2) × 0.75 + 2, rounded up. 577px is the widest the conversation is at, at its 75%, with the
 * reviewers, the labels and the rest of the sidebar below the description: from
 * 578px they move beside it and the description narrows.
 */
const threeColumns = 'r554fpr577fpp';

/** `threeColumns`, with the right column stacked in two. */
const threeColumnsStacked = 'r554fpr577fpcpp';

/** 100%, where the extension's `zoom` leaves a pane when it is absent. */
const full = 1;

/** The conversation and the issue, and the diff in three columns. */
const reading = 0.75;
