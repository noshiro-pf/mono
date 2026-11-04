import { Arr } from 'ts-data-forge';
import {
  layoutQueryParam,
  paneUrlQueryParam,
  paneZoomQueryParam,
  workspaceNameQueryParam,
  workspaceQueryParam,
  workspaceTitleQueryParam,
} from './split-view-page.mjs';

/**
 * The query string of `split.html` that opens a pull request, as both the PR
 * Manager's links and the extension's own button on GitHub open it: the diff on
 * the left, without whitespace changes or the files marked viewed, at a width
 * and a zoom that keep GitHub's file tree beside it, and the conversation in the
 * rest of the page. When the pull request closes an issue or names the Claude
 * Code session it was written in, the conversation is held at the widest its
 * description gets with the sidebar below it and that takes the rest, to the
 * right of the conversation; with both, the issue is stacked over the session.
 *
 * The conversation and the issue are shown at 75%, so that more of each fits in
 * a pane narrower than GitHub lays them out for — the conversation beside the
 * diff alone too, so that it reads the same whatever shares the page. The diff
 * is at 67% in either layout, which is what keeps GitHub's file tree beside it;
 * the session stays at 100%.
 *
 * The tab is titled `#<number> <title>`, as a tab of the pull request on GitHub
 * would be with the number first, or `#<number>` when the title is not known.
 *
 * `workspace` names the saved split view every pull request opened from one
 * place reuses, so that opening one after another replaces what that entry
 * holds rather than adding an entry per pull request to the extension's list.
 *
 * Escaped as a form is, `:` and `/` included; the extension reads either form,
 * and writes the readable one back into its address bar once it has loaded. One
 * pair at a time, because `url` repeats.
 */
export const pullRequestSplitViewSearch = ({
  workspace,
  pullRequest,
  title,
  issueUrl,
  sessionUrl,
}: Readonly<{
  workspace: Readonly<{ id: string; name: string }>;
  pullRequest: Readonly<{
    number: number;
    /** `https://github.com/<owner>/<repo>/pull/<number>` */
    url: string;
  }>;
  title: string | undefined;
  issueUrl: string | undefined;
  sessionUrl: string | undefined;
}>): `?${string}` => {
  const conversation = { url: pullRequest.url, zoom: reading } as const;

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
    url: `${pullRequest.url}/files?${diffQuery}`,
    zoom: diffZoom,
  } as const;

  const panes = [diff, conversation, ...others] as const;

  const params = [
    [workspaceQueryParam, workspace.id],
    [workspaceNameQueryParam, workspace.name],
    [
      workspaceTitleQueryParam,
      title === undefined
        ? (`#${pullRequest.number}` as const)
        : (`#${pullRequest.number} ${title}` as const),
    ],
    [layoutQueryParam, layout],
    ...panes.map(({ url }) => [paneUrlQueryParam, url] as const),
    ...panes.map(({ zoom }) => [paneZoomQueryParam, zoom.toString()] as const),
  ] as const;

  const query = params
    .map(([key, value]) => new URLSearchParams({ [key]: value }))
    .map((pair) => pair.toString())
    .join('&');

  return `?${query}`;
};

/**
 * The diff with whitespace changes hidden (`w=1`), and without the files
 * already marked viewed (`show-viewed-files=false`).
 */
const diffQuery = 'w=1&show-viewed-files=false';

/**
 * The width the diff is held at, in either layout.
 *
 * 737px was measured as the narrowest the diff is at with GitHub's file tree
 * beside it at the diff's 100%, on the pane's `<section>`, in the split view's
 * own pixels, which are what a layout spec holds a pane at, so the zoom of the
 * split view's tab does not change it. The tree has since been seen folded
 * there all the same, so the diff is at `diffZoom` rather than 100%.
 *
 * It is the same in three columns, not scaled down by the diff's zoom: a
 * smaller zoom did not make up for a narrower pane. At 554px and 67%, about
 * 824px inside the pane, the tree was folded; at 737px and 67% it stays.
 */
const diffWidth = 737;

/**
 * The width the conversation is held at in three columns: the widest it is at,
 * at its 75%, with the reviewers, the labels and the rest of the sidebar below
 * the description. From 578px they move beside it and the description narrows.
 */
const conversationWidth = 577;

/**
 * The diff beside the conversation alone: the diff held at `diffWidth` and the
 * rest to the conversation, whose description is what a pull request is
 * reviewed in now more than its diff.
 */
const diffBesideConversation = `r${diffWidth}fpp` as const;

/**
 * The diff, the conversation and the right column: the diff held at
 * `diffWidth`, the conversation at `conversationWidth`, and the rest to the
 * right column.
 */
const threeColumns = `r${diffWidth}fpr${conversationWidth}fpp` as const;

/** `threeColumns`, with the right column stacked in two. */
const threeColumnsStacked =
  `r${diffWidth}fpr${conversationWidth}fpcpp` as const;

/** 100%, where the extension's `zoom` leaves a pane when it is absent. */
const full = 1;

/** The conversation and the issue. */
const reading = 0.75;

/**
 * The diff, in either layout. At `diffWidth` GitHub folds the file tree into a
 * menu at 100% and keeps it beside the diff at 67%, in both layouts.
 */
const diffZoom = 0.67;
