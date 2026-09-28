import { hasKey, isRecord } from 'ts-data-forge';

/**
 * Tags every `chrome.runtime` message between the GitHub content script and
 * the service worker.
 */
export const githubMessageTag = 'split-view/github/v1';

/**
 * The two messages between `github-button.mts` and the service worker.
 *
 * - `open`, content script to worker: open this pull request in a split view,
 *   with what the content script read off GitHub. The worker opens the tab,
 *   because an extension page is not something a web page can navigate to.
 * - `look-up`, worker to content script: the context menu was used on this
 *   pull request; read its title and issue as the button does, and answer with
 *   an `open`. The worker cannot read them itself — a service worker has no
 *   `DOMParser` and does not carry the user's GitHub session.
 */
export type GitHubMessage = Readonly<
  | {
      tag: typeof githubMessageTag;
      kind: 'open';
      url: string;
      title: string | undefined;
      issueUrl: string | undefined;
      /** `false` for a Ctrl+click or a middle click: open it behind this tab. */
      active: boolean;
    }
  | {
      tag: typeof githubMessageTag;
      kind: 'look-up';
      url: string;
    }
>;

/**
 * Validates a message. Only this extension's own scripts can send one — the
 * manifest has no `externally_connectable` — but what they pass on was read
 * off a web page, so the receiver checks the addresses again all the same.
 */
export const asGitHubMessage = (value: unknown): GitHubMessage | undefined => {
  if (
    !isRecord(value) ||
    !hasKey(value, 'tag') ||
    value.tag !== githubMessageTag ||
    !hasKey(value, 'url') ||
    typeof value.url !== 'string' ||
    !hasKey(value, 'kind')
  ) {
    return undefined;
  }

  if (value.kind === 'look-up') {
    return { tag: githubMessageTag, kind: 'look-up', url: value.url };
  }

  if (value.kind !== 'open') {
    return undefined;
  }

  const title = hasKey(value, 'title') ? value.title : undefined;

  const issueUrl = hasKey(value, 'issueUrl') ? value.issueUrl : undefined;

  return hasKey(value, 'active') &&
    typeof value.active === 'boolean' &&
    isOptionalString(title) &&
    isOptionalString(issueUrl)
    ? {
        tag: githubMessageTag,
        kind: 'open',
        url: value.url,
        title,
        issueUrl,
        active: value.active,
      }
    : undefined;
};

const isOptionalString = (value: unknown): value is string | undefined =>
  value === undefined || typeof value === 'string';
