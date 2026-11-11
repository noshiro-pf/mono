import type { ReadonlyRecord } from 'ts-type-forge';
import {
  addLabelThroughPicker,
  asGitHubMessage,
  claudeSessionUrlOfBody,
  conversationPathOf,
  githubMessageTag,
  hasMergeQueue,
  isConversationOf,
  issueUrlOf,
  pullRequestOf,
  pullRequestTitleOf,
  type AddLabelResult,
  type GitHubMessage,
  type PullRequest,
} from './github/index.mjs';

/**
 * The content script on github.com: a "⧉ Split view" button on every pull
 * request, which opens it as the PR Manager's links do — the diff beside the
 * conversation, and beside those the issue it closes and the Claude Code
 * session it was written in, when it names them.
 *
 * It runs in the top frame of github.com only, so a pull request shown in a
 * pane of a split view has no button of its own.
 *
 * The button is a `<button>` rather than a link to `split.html`: a web page may
 * not navigate to an extension page it is not listed for, and listing github.com
 * would let every page there open a split view and tell that the extension is
 * installed. The click is passed to the service worker instead, which opens the
 * tab with the extension's own id, whatever that id is.
 *
 * Beside it, on this repository's pull requests only (`hasMergeQueue`), a
 * "＋ merge-queued" button puts the label that queues a pull request for
 * `unblock-prs` on the one on screen, through GitHub's own label picker
 * (`github/label-picker.mts`).
 *
 * They sit at the bottom left of the window, in a shadow root on `<html>`
 * rather than anywhere in `<body>`: GitHub replaces the body on every
 * navigation within the site and rearranges its pull request header often, and
 * a button wedged into either would come and go with them.
 */
const main = (): void => {
  const mut_host = document.createElement('div');

  const mut_shadow = mut_host.attachShadow({ mode: 'open' });

  const mut_button = document.createElement('button');

  mut_button.type = 'button';

  mut_button.textContent = '⧉ Split view';

  mut_button.title = [
    'Open this pull request in Split View: the diff beside the conversation,',
    'and the issue it closes and the Claude Code session it names beside them.',
    'This tab is closed once it opens.',
    'Ctrl+click or middle-click opens it behind this tab and keeps this tab.',
  ].join('\n');

  const style = new CSSStyleSheet();

  style.replaceSync(css);

  // A constructed style sheet rather than a `<style>`, which GitHub's CSP would
  // be asked about.
  mut_shadow.adoptedStyleSheets = [style];

  const mut_queueButton = document.createElement('button');

  mut_queueButton.type = 'button';

  mut_queueButton.textContent = queueIdleText;

  mut_queueButton.title = [
    `Add the "${mergeQueuedLabel}" label to this pull request,`,
    "through the sidebar's label picker, as you.",
    'On another tab of the pull request it goes to the conversation first.',
  ].join('\n');

  mut_shadow.append(mut_button, mut_queueButton);

  const showOnPullRequests = (): void => {
    const pullRequest = pullRequestOf(document.location.href);

    mut_host.hidden = pullRequest === undefined;

    mut_queueButton.hidden =
      pullRequest === undefined || !hasMergeQueue(pullRequest);
  };

  showOnPullRequests();

  document.documentElement.append(mut_host);

  // Moving between pages within github.com changes the address without loading
  // a document, so it is the history entry that is watched.
  window.navigation.addEventListener('currententrychange', showOnPullRequests);

  /**
   * A plain click replaces this tab with the split view; one that opens it
   * behind keeps this tab, as the user is evidently staying on it.
   */
  const openThisPullRequest = (active: boolean): void => {
    const pullRequest = pullRequestOf(document.location.href);

    if (pullRequest === undefined || mut_button.disabled) {
      return;
    }

    mut_button.disabled = true;

    openPullRequest(pullRequest, { active, closeOpener: active })
      .catch(console.error)
      .finally(() => {
        mut_button.disabled = false;
      });
  };

  mut_button.addEventListener('click', (mouseEvent) => {
    openThisPullRequest(!(mouseEvent.ctrlKey || mouseEvent.metaKey));
  });

  mut_queueButton.addEventListener('click', () => {
    if (mut_queueButton.disabled) {
      return;
    }

    mut_queueButton.disabled = true;

    mut_queueButton.textContent = queueBusyText;

    queueThisPullRequest()
      .catch((error: unknown): QueueResult => {
        console.error(error);

        return 'not-saved';
      })
      .then(async (result) => {
        mut_queueButton.textContent = queueResultText[result];

        mut_queueButton.dataset['result'] = result;

        await new Promise((resolve) => {
          setTimeout(resolve, queueResultShownMs);
        });
      })
      .finally(() => {
        mut_queueButton.disabled = false;

        mut_queueButton.textContent = queueIdleText;

        delete mut_queueButton.dataset['result'];
      })
      .catch(console.error);
  });

  mut_button.addEventListener('auxclick', (mouseEvent) => {
    if (mouseEvent.button === middleButton) {
      openThisPullRequest(false);
    }
  });

  // The context menu's request, for a link to a pull request on this page or
  // for this page itself.
  chrome.runtime.onMessage.addListener((value: unknown) => {
    const message = asGitHubMessage(value);

    if (message?.kind !== 'look-up') {
      return;
    }

    const pullRequest = pullRequestOf(message.url);

    if (pullRequest !== undefined) {
      openPullRequest(pullRequest, {
        active: true,
        closeOpener: false,
      }).catch(console.error);
    }
  });
};

/**
 * The description as Markdown enough for `claudeSessionUrlOfBody`: its text,
 * with each link written back as `[<text>](<href>)` and the code left out.
 * GitHub puts a line break between the rendered blocks and after each `<br>`,
 * so a line of the text is a line of what was written.
 */
const descriptionTextOf = (description: Element | null): string => {
  if (description === null) {
    return '';
  }

  const mut_copy = description.cloneNode(true);

  if (!(mut_copy instanceof Element)) {
    return '';
  }

  for (const mut_code of mut_copy.querySelectorAll('pre, code')) {
    mut_code.remove();
  }

  for (const mut_anchor of mut_copy.querySelectorAll('a[href]')) {
    mut_anchor.replaceWith(
      `[${mut_anchor.textContent}](${mut_anchor.getAttribute('href') ?? ''})`,
    );
  }

  for (const mut_lineBreak of mut_copy.querySelectorAll('br')) {
    mut_lineBreak.replaceWith('\n');
  }

  return mut_copy.textContent;
};

/**
 * The title; the first issue in the sidebar's "Development" section —
 * "Successfully merging this pull request may close these issues" — which is
 * GitHub's `closingIssuesReferences`, the list the PR Manager takes its issue
 * from; and the first Claude Code session the description names on a
 * `Claude-Session:` line, as the PR Manager reads it. Only the first of each,
 * as there.
 */
const readConversation = async (
  pullRequest: PullRequest,
): Promise<
  | Readonly<{
      title: string | undefined;
      issueUrl: string | undefined;
      sessionUrl: string | undefined;
    }>
  | undefined
> => {
  try {
    const response = await fetch(pullRequest.url, {
      headers: { Accept: 'text/html' },
      signal: AbortSignal.timeout(fetchTimeoutMs),
    });

    if (!response.ok) {
      return undefined;
    }

    const parser = new DOMParser();

    const page = parser.parseFromString(await response.text(), 'text/html');

    return {
      title: pullRequestTitleOf(page.title),
      issueUrl: Array.from(
        page.querySelectorAll(closingIssueSelector),
        (anchor) => issueUrlOf(anchor.getAttribute('href') ?? ''),
      ).find((issueUrl) => issueUrl !== undefined),
      sessionUrl: claudeSessionUrlOfBody(
        descriptionTextOf(page.querySelector(descriptionSelector)),
      ),
    };
  } catch {
    return undefined;
  }
};

/**
 * Reads the pull request's title, the issue it closes and the Claude Code
 * session it names from its conversation page, and asks the service worker to
 * open the split view.
 *
 * The conversation page is fetched rather than read off the document on screen:
 * the diff has none of them, and a pull request named in a link is not on
 * screen at all. The fetch is same-origin, so it sees what the user sees,
 * private repositories included. When it fails, or GitHub's markup has moved,
 * the split view opens all the same, without the issue or the session.
 */
const openPullRequest = async (
  pullRequest: PullRequest,
  { active, closeOpener }: Readonly<{ active: boolean; closeOpener: boolean }>,
): Promise<void> => {
  const conversation = await readConversation(pullRequest);

  const onScreen =
    pullRequestOf(document.location.href)?.url === pullRequest.url;

  const message: GitHubMessage = {
    tag: githubMessageTag,
    kind: 'open',
    url: pullRequest.url,
    title:
      conversation?.title ??
      (onScreen ? pullRequestTitleOf(document.title) : undefined),
    issueUrl: conversation?.issueUrl,
    sessionUrl: conversation?.sessionUrl,
    active,
    closeOpener,
  } as const;

  await chrome.runtime.sendMessage(message);
};

/**
 * Goes to the conversation tab when on another one — the picker is in its
 * sidebar and nowhere else — and adds the label there.
 *
 * The tab is reached by clicking GitHub's own link to it, so it is a
 * client-side navigation like any other and this script lives on; with no such
 * link on the page the address is changed instead, which loads a new document
 * and ends this script, and the button is pressed again there.
 *
 * Every step after that is taken only while the page is still this pull
 * request's conversation, so following a link while it waits labels nothing.
 */
const queueThisPullRequest = async (): Promise<QueueResult> => {
  const pullRequest = pullRequestOf(document.location.href);

  if (pullRequest === undefined || !hasMergeQueue(pullRequest)) {
    return 'no-picker';
  }

  if (!isConversationOf(document.location.href, pullRequest)) {
    const conversationPath = conversationPathOf(pullRequest);

    const conversationLink = Array.from(
      document.querySelectorAll('a[href]'),
    ).find(
      (anchor): anchor is HTMLAnchorElement =>
        anchor instanceof HTMLAnchorElement &&
        anchor.getAttribute('href') === conversationPath,
    );

    if (conversationLink === undefined) {
      document.location.assign(conversationPath);

      return 'reloading';
    }

    conversationLink.click();
  }

  return addLabelThroughPicker(mergeQueuedLabel, () =>
    isConversationOf(document.location.href, pullRequest),
  );
};

const closingIssueSelector =
  'development-menu a[data-hovercard-type="issue"][href]';

/** The pull request's description, as GitHub renders it. */
const descriptionSelector = '.js-command-palette-pull-body .js-comment-body';

/** Long enough for a large pull request's page, short enough to give up on. */
const fetchTimeoutMs = 5000;

/** `MouseEvent.button` of the wheel. */
const middleButton = 1;

/**
 * What the merge-queued button shows afterwards: what adding the label came to,
 * or that the conversation tab is being loaded as a new document.
 */
type QueueResult = AddLabelResult | 'reloading';

/**
 * The string is the one in `libs/pr-report-core/src/labels.mts` and the
 * workflows; it is written out rather than imported because this is a content
 * script, built into one file, and that package is the queue's Node tooling.
 */
const mergeQueuedLabel = 'merge-queued';

const queueIdleText = `＋ ${mergeQueuedLabel}` as const;

const queueBusyText = `… ${mergeQueuedLabel}` as const;

const queueResultText = {
  labelled: `✓ ${mergeQueuedLabel}`,
  'already-labelled': `✓ already ${mergeQueuedLabel}`,
  'no-picker': '✕ no label picker here',
  'no-such-label': `✕ no "${mergeQueuedLabel}" label`,
  'not-saved': '✕ not saved',
  'left-page': '✕ left the pull request',
  reloading: '→ conversation; press again there',
} as const satisfies ReadonlyRecord<QueueResult, string>;

/** How long the outcome stays on the button before it is ready again. */
const queueResultShownMs = 3000;

const css = [
  ':host {',
  '  all: initial;',
  '  position: fixed;',
  '  left: 16px;',
  '  bottom: 16px;',
  '  z-index: 2147483000;',
  '  display: flex;',
  '  gap: 8px;',
  '}',
  '',
  ':host([hidden]) {',
  '  display: none;',
  '}',
  '',
  'button {',
  '  font: 600 12px/1 system-ui, sans-serif;',
  '  padding: 7px 10px;',
  '  border: 1px solid rgb(127 127 127 / 40%);',
  '  border-radius: 6px;',
  '  background: #24292f;',
  '  color: #ffffff;',
  '  opacity: 0.8;',
  '  cursor: pointer;',
  '}',
  '',
  'button:hover,',
  'button:focus-visible {',
  '  opacity: 1;',
  '}',
  '',
  'button[hidden] {',
  '  display: none;',
  '}',
  '',
  'button:disabled {',
  '  cursor: progress;',
  '  opacity: 0.5;',
  '}',
  '',
  // The merge-queued button's outcome, shown for a few seconds while it is
  // still disabled.
  'button[data-result="labelled"],',
  'button[data-result="already-labelled"] {',
  '  background: #1a7f37;',
  '  opacity: 1;',
  '}',
  '',
  'button[data-result="no-picker"],',
  'button[data-result="no-such-label"],',
  'button[data-result="not-saved"],',
  'button[data-result="left-page"] {',
  '  background: #cf222e;',
  '  opacity: 1;',
  '}',
].join('\n');

main();
