// cspell:ignore nifmgpafbfpgpcijgmfpcoonjbalbkhf

/**
 * What a page outside `split-view-extension` needs to know to link to a split
 * view: where the page is, and the query parameters that describe one. The
 * extension reads these same names
 * (`apps/split-view-extension/src/state/workspace-url.mts`), so a link and the
 * page cannot drift apart.
 *
 * `ws` says *which* saved split view the tab shows; the rest say *what* it
 * shows, and are what the page writes back into the address bar as the view
 * changes — so the URL is always a link to what is on screen. A URL with only
 * `ws` is a pointer, and opens whatever is saved under that id; one with a
 * `layout` or an `url` is a request, and what it describes is shown and saved.
 */

/** The extension page that hosts a split view. */
export const splitViewPagePath = 'split.html';

/**
 * The id `key` in the extension's `public/manifest.json` pins, which is the id
 * an unpacked build has wherever it is loaded from. A build installed from the
 * Chrome Web Store has an id of its own, and a link built on this one does not
 * reach it. The extension's tests derive the id from `key` and compare.
 */
export const splitViewExtensionId = 'nifmgpafbfpgpcijgmfpcoonjbalbkhf';

/** Which saved split view a tab shows. */
export const workspaceQueryParam = 'ws';

/**
 * A `LayoutNode` in the notation of the extension's `formatLayoutSpec`, or the
 * id of a preset (`grid-2x2`). Left out, the addresses are put side by side.
 */
export const layoutQueryParam = 'layout';

/**
 * Repeated: the panes' addresses in tree order, read as the address bar reads
 * them. A pane beyond the last one is empty.
 */
export const paneUrlQueryParam = 'url';

/** Repeated: the panes' zoom, `1` when absent. */
export const paneZoomQueryParam = 'zoom';

/** Repeated: `0` turns a pane's sandbox off. On when absent. */
export const paneSandboxQueryParam = 'sandbox';

/**
 * What to call the split view, when this URL is what adds it to the list. Read
 * once and not written back — the name is the list's, not the view's.
 */
export const workspaceNameQueryParam = 'name';

/**
 * What to call the tab. Part of the view, so saved and written back; see the
 * extension's `WorkspaceState['title']`.
 */
export const workspaceTitleQueryParam = 'title';
