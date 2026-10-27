import {
  asGitHubMessage,
  claudeSessionUrlOfBody,
  githubMessageTag,
  issueUrlOf,
  pullRequestOf,
  pullRequestTitleOf,
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
 * It sits at the bottom left of the window, in a shadow root on `<html>` rather
 * than anywhere in `<body>`: GitHub replaces the body on every navigation
 * within the site and rearranges its pull request header often, and a button
 * wedged into either would come and go with them.
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

  // A constructed style sheet rather than a `<style>`, which GitHub's CSP
  // would be asked about.
  mut_shadow.adoptedStyleSheets = [style];

  mut_shadow.append(mut_button);

  const showOnPullRequests = (): void => {
    mut_host.hidden = pullRequestOf(document.location.href) === undefined;
  };

  showOnPullRequests();

  document.documentElement.append(mut_host);

  // Moving between pages within github.com changes the address without
  // loading a document, so it is the history entry that is watched.
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
 * Reads the pull request's title, the issue it closes and the Claude Code
 * session it names from its conversation page, and asks the service worker to
 * open the split view.
 *
 * The conversation page is fetched rather than read off the document on
 * screen: the diff has none of them, and a pull request named in a link is not
 * on screen at all. The fetch is same-origin, so it sees what the user sees,
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

const closingIssueSelector =
  'development-menu a[data-hovercard-type="issue"][href]';

/** The pull request's description, as GitHub renders it. */
const descriptionSelector = '.js-command-palette-pull-body .js-comment-body';

/** Long enough for a large pull request's page, short enough to give up on. */
const fetchTimeoutMs = 5000;

/** `MouseEvent.button` of the wheel. */
const middleButton = 1;

const css = [
  ':host {',
  '  all: initial;',
  '  position: fixed;',
  '  left: 16px;',
  '  bottom: 16px;',
  '  z-index: 2147483000;',
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
  'button:disabled {',
  '  cursor: progress;',
  '  opacity: 0.5;',
  '}',
].join('\n');

main();
