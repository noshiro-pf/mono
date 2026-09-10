import { splitViewPagePath, workspaceQueryParam } from '../shared/index.mjs';

// See the note in `frame-agent.mts`: neither `window.history`,
// `globalThis.history` nor a bare `history` satisfies the lint rules together.
const { history: browserHistory } = globalThis;

/**
 * Which stored workspace this tab is showing, according to its own URL.
 *
 * The URL is the one piece of state a reload preserves by itself, which is what
 * makes a split view survive a reload, a browser restart with session restore,
 * and a tab reopened with Ctrl+Shift+T. `undefined` means the page was opened
 * without one — from the toolbar button — and the registry's `activeId` decides
 * instead.
 */
export const workspaceIdFromUrl = (): string | undefined => {
  const params = new URLSearchParams(document.location.search);

  const fromUrl = params.get(workspaceQueryParam);

  return fromUrl === null || fromUrl === '' ? undefined : fromUrl;
};

/**
 * Writes the workspace into this tab's URL.
 *
 * `push` for a switch the user asked for, so that the browser's Back button
 * walks back through the split views visited in this tab; `replace` for the one
 * the page resolved on load, which is not somewhere the user navigated *to*.
 */
export const putWorkspaceIdInUrl = (
  workspaceId: string,
  mode: 'push' | 'replace',
): void => {
  const url = new URL(document.location.href);

  if (url.searchParams.get(workspaceQueryParam) === workspaceId) {
    return;
  }

  url.searchParams.set(workspaceQueryParam, workspaceId);

  if (mode === 'push') {
    browserHistory.pushState(undefined, '', url);
  } else {
    browserHistory.replaceState(undefined, '', url);
  }
};

/** Opens a workspace in a tab of its own. */
export const openWorkspaceInNewTab = async (
  workspaceId: string,
): Promise<void> => {
  const url = new URL(chrome.runtime.getURL(splitViewPagePath));

  url.searchParams.set(workspaceQueryParam, workspaceId);

  await chrome.tabs.create({ url: url.href });
};
