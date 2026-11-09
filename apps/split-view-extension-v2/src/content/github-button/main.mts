import {
  asGitHubMessage,
  githubTag,
  pullRequestOf,
  pullRequestTitleOf,
  type GitHubMessage,
  type PullRequest,
} from '../../core/index.mjs';
import { readConversation } from './conversation.mjs';

/**
 * The "⧉ Split view" button on github.com's pull requests (spec G1).
 *
 * A `<button>`, not a link to `split.html`: a page may not navigate to an
 * extension page it is not listed for, and listing github.com would tell every
 * page there the extension is installed. The worker opens the tab instead.
 *
 * In a shadow root on `<html>`, fixed at the bottom left: GitHub replaces the
 * body on every in-site navigation and moves its header around often.
 */
const main = (): void => {
  const mut_host = document.createElement('div');

  const mut_shadow = mut_host.attachShadow({ mode: 'open' });

  const mut_button = document.createElement('button');

  mut_button.type = 'button';

  mut_button.textContent = '⧉ Split view';

  mut_button.title = buttonTitle;

  // Constructed rather than a `<style>`, which GitHub's CSP would be asked about.
  const sheet = new CSSStyleSheet();

  sheet.replaceSync(css);

  mut_shadow.adoptedStyleSheets = [sheet];

  mut_shadow.append(mut_button);

  const showOnPullRequests = (): void => {
    mut_host.hidden = pullRequestOf(document.location.href) === undefined;
  };

  showOnPullRequests();

  document.documentElement.append(mut_host);

  // An in-site navigation changes the history entry and loads no document.
  window.navigation.addEventListener('currententrychange', showOnPullRequests);

  // A plain click replaces this tab; one that opens behind keeps it.
  const openThis = (active: boolean): void => {
    const pullRequest = pullRequestOf(document.location.href);

    if (pullRequest === undefined || mut_button.disabled) {
      return;
    }

    mut_button.disabled = true;

    open(pullRequest, active, active)
      .catch(console.error)
      .finally(() => {
        mut_button.disabled = false;
      });
  };

  mut_button.addEventListener('click', (event) => {
    openThis(!(event.ctrlKey || event.metaKey));
  });

  mut_button.addEventListener('auxclick', (event) => {
    if (event.button === middleButton) {
      openThis(false);
    }
  });

  // The context menu's look-up (spec M1).
  chrome.runtime.onMessage.addListener(
    (value: unknown, _sender, sendResponse: (handled: boolean) => void) => {
      const message = asGitHubMessage(value);

      if (message?.kind !== 'look-up') {
        return false;
      }

      const pullRequest = pullRequestOf(message.url);

      if (pullRequest !== undefined) {
        open(pullRequest, true, false).catch(console.error);
      }

      // Answered, or the worker's promise rejects as if no script were here and
      // it opens the pull request a second time.
      sendResponse(pullRequest !== undefined);

      return false;
    },
  );
};

/** Reads the conversation and asks the worker to open it; opens regardless. */
const open = async (
  pullRequest: PullRequest,
  active: boolean,
  closeOpener: boolean,
): Promise<void> => {
  const conversation = await readConversation(pullRequest);

  const onScreen =
    pullRequestOf(document.location.href)?.url === pullRequest.url;

  const message: GitHubMessage = {
    tag: githubTag,
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

const buttonTitle = [
  'Open this pull request in Split View: the diff beside the conversation,',
  'and the issue it closes and the Claude Code session it names beside them.',
  'This tab is closed once it opens.',
  'Ctrl+click or middle-click opens it behind this tab and keeps this tab.',
].join('\n');

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
