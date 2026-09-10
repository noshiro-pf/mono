/** The extension page that hosts a split view. */
export const splitViewPagePath = 'split.html';

/** Query parameter naming which stored workspace a tab is showing. */
export const workspaceQueryParam = 'ws';

/**
 * The id given to the first workspace a fresh install creates.
 *
 * Fixed rather than random only so that the storage of a new profile looks
 * like the storage of an old one — the id of the very first workspace is not
 * otherwise special, and which workspace the toolbar button opens is the
 * registry's `activeId`, not this. It is also the id the migration recognizes
 * as "the workspace from before there was a list".
 */
export const defaultWorkspaceId = 'default';

/**
 * Where the page records its own tab id, for the service worker to find.
 *
 * `chrome.tabs.query({ url })` would answer the same question, but filtering by
 * URL needs the `tabs` permission — and this needs no permission beyond the
 * `storage` the workspaces already use. Session storage is cleared when the
 * browser closes, which is exactly the lifetime of a tab id.
 */
export const splitViewTabIdSessionKey = 'splitViewTabId';

/**
 * Where the service worker keeps its ring buffer of rule matches and frame
 * navigations, for the diagnostics panel. Session storage, so it is cleared
 * when the browser closes and survives the worker being torn down.
 */
export const eventLogSessionKey = 'splitViewEventLog';

/** How many events are kept. */
export const maxEventLogEntries = 60;
