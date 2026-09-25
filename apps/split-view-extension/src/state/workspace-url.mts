import { Num, Result } from 'ts-data-forge';
import {
  clampPaneZoom,
  defaultPaneZoom,
  evenChain,
  formatLayoutSpec,
  layoutPresets,
  paneIdsOf,
  parseLayoutSpec,
  type LayoutNode,
  type PaneState,
  type WorkspaceState,
} from '../layout/index.mjs';
import { workspaceQueryParam } from '../shared/index.mjs';
import { createPane, findPane } from './reducer.mjs';
import { normalizeAddress } from './url.mjs';

// See the note in `frame-agent.mts`: neither `window.history`,
// `globalThis.history` nor a bare `history` satisfies the lint rules together.
const { history: browserHistory } = globalThis;

/**
 * The query parameters of `split.html`, which together describe a split view.
 *
 * `ws` says *which* saved split view the tab shows; the rest say *what* it
 * shows, and are what the page writes back into the address bar as the view
 * changes — so the URL is always a link to what is on screen. A URL with only
 * `ws` is a pointer, and opens whatever is saved under that id; one with a
 * `layout` or an `url` is a request, and what it describes is shown and saved.
 *
 * - `layout`: a `LayoutNode` in the notation of `formatLayoutSpec`, or the id
 *   of a preset (`grid-2x2`). Left out, the addresses are put side by side.
 * - `url`, repeated: the panes' addresses in tree order, read as the address
 *   bar reads them. A pane beyond the last one is empty.
 * - `zoom`, repeated: the panes' zoom, `1` when absent.
 * - `sandbox`, repeated: `0` turns a pane's sandbox off. On when absent.
 * - `name`: what to call the split view, when this URL is what adds it to the
 *   list. Read once and not written back — the name is the list's, not the
 *   view's.
 * - `title`: what to call the tab. Part of the view, so saved and written
 *   back; see `WorkspaceState['title']`.
 */
export const layoutQueryParam = 'layout';

export const paneUrlQueryParam = 'url';

export const paneZoomQueryParam = 'zoom';

export const paneSandboxQueryParam = 'sandbox';

export const workspaceNameQueryParam = 'name';

export const workspaceTitleQueryParam = 'title';

/** What a `split.html` URL asks for. Each part is absent when the URL is. */
export type WorkspaceUrlRequest = Readonly<{
  workspaceId: string | undefined;
  name: string | undefined;
  state: WorkspaceState | undefined;
}>;

/**
 * What this tab's own URL asks for.
 *
 * The URL is the one piece of state a reload preserves by itself, which is what
 * makes a split view survive a reload, a browser restart with session restore,
 * and a tab reopened with Ctrl+Shift+T. No `ws` means the page was opened
 * without one — from the toolbar button, or from a link that describes a view
 * and not a saved one.
 */
export const readWorkspaceUrl = (): WorkspaceUrlRequest =>
  parseWorkspaceUrl(document.location.search);

/** Which stored workspace this tab is showing, according to its own URL. */
export const workspaceIdFromUrl = (): string | undefined =>
  workspaceIdOf(new URLSearchParams(document.location.search));

/**
 * Writes the split view into this tab's URL.
 *
 * `push` for a switch the user asked for, so that the browser's Back button
 * walks back through the split views visited in this tab; `replace` for the one
 * the page resolved on load, which is not somewhere the user navigated *to*,
 * and for every change to the view after that.
 */
export const putWorkspaceInUrl = (
  workspaceId: string,
  state: WorkspaceState,
  mode: 'push' | 'replace',
): void => {
  const search = workspaceUrlSearch(workspaceId, state);

  if (document.location.search === search) {
    return;
  }

  // A bare query resolves against the page's own URL, so this replaces the
  // query and nothing else.
  if (mode === 'push') {
    browserHistory.pushState(undefined, '', search);
  } else {
    browserHistory.replaceState(undefined, '', search);
  }
};

/**
 * The query string for a split view, `?` included.
 *
 * Written by hand rather than with `URLSearchParams`, whose serialization
 * percent-encodes `:` and `/` — legal in a query as they are — and turns every
 * address in the bar into `https%3A%2F%2F…`. Only what would be read as part
 * of the query itself is escaped, so an address stays readable, and a decoder
 * reads either form back the same.
 */
export const workspaceUrlSearch = (
  workspaceId: string,
  state: WorkspaceState,
): string => {
  const panes = panesInTreeOrder(state);

  const addresses = panes.map((pane) => pane.currentUrl ?? pane.url);

  const zooms = panes.map((pane) => pane.zoom);

  const sandboxes = panes.map((pane) => pane.sandboxed);

  const parts = [
    `${workspaceQueryParam}=${encode(workspaceId)}`,
    ...(state.title === undefined
      ? ([] as const)
      : ([`${workspaceTitleQueryParam}=${encode(state.title)}`] as const)),
    `${layoutQueryParam}=${formatLayoutSpec(state.root)}`,
    ...withoutTrailing(addresses, '').map(
      (address) => `${paneUrlQueryParam}=${encode(address)}` as const,
    ),
    ...(zooms.every((zoom) => zoom === defaultPaneZoom)
      ? ([] as const)
      : zooms.map((zoom) => `${paneZoomQueryParam}=${String(zoom)}` as const)),
    ...(sandboxes.every((sandboxed) => sandboxed)
      ? ([] as const)
      : sandboxes.map(
          (sandboxed) =>
            `${paneSandboxQueryParam}=${sandboxed ? '1' : '0'}` as const,
        )),
  ] as const;

  return `?${parts.join('&')}`;
};

/** Reads a query string, `?` or not, back into a request. */
export const parseWorkspaceUrl = (search: string): WorkspaceUrlRequest => {
  const params = new URLSearchParams(search);

  const workspaceName = params.get(workspaceNameQueryParam)?.trim();

  const title = params.get(workspaceTitleQueryParam)?.trim();

  const addresses = params.getAll(paneUrlQueryParam);

  const root = layoutOf(params.get(layoutQueryParam), addresses.length);

  return {
    workspaceId: workspaceIdOf(params),
    name:
      workspaceName === undefined || workspaceName === ''
        ? undefined
        : workspaceName,
    state:
      root === undefined
        ? undefined
        : stateOf(
            root,
            addresses,
            params.getAll(paneZoomQueryParam),
            params.getAll(paneSandboxQueryParam),
            title === undefined || title === '' ? undefined : title,
          ),
  };
};

const workspaceIdOf = (
  params: Readonly<Pick<URLSearchParams, 'get'>>,
): string | undefined => {
  const fromUrl = params.get(workspaceQueryParam);

  return fromUrl === null || fromUrl === '' ? undefined : fromUrl;
};

/**
 * The layout a URL asks for.
 *
 * A layout that cannot be read is treated as none rather than as a refusal:
 * the addresses beside it are what the link was for, and a row of them is
 * closer to what was meant than an empty page.
 */
const layoutOf = (
  spec: string | null,
  addressCount: number,
): LayoutNode | undefined => {
  const parsed =
    spec === null || spec === '' ? undefined : presetOrSpec(spec.trim());

  return (
    parsed ??
    (addressCount === 0
      ? undefined
      : evenChain(
          'row',
          Array.from({ length: addressCount }, (_, index) => index),
        ))
  );
};

const presetOrSpec = (spec: string): LayoutNode | undefined =>
  layoutPresets.find((preset) => preset.id === spec)?.build((index) => index) ??
  parseLayoutSpec(spec);

/**
 * A view built from what the URL said, its panes numbered in tree order.
 *
 * Addresses go through the same normalization as the address bar, so a bare
 * host becomes `https://…` and a scheme a pane will not load becomes a search.
 */
const stateOf = (
  root: LayoutNode,
  addresses: readonly string[],
  zooms: readonly string[],
  sandboxes: readonly string[],
  title: string | undefined,
): WorkspaceState => {
  const paneIds = paneIdsOf(root);

  return {
    version: 1,
    root,
    panes: paneIds.map((paneId, index) => ({
      ...createPane(paneId),
      url: normalizeAddress(addresses[index] ?? ''),
      zoom: zoomOf(zooms[index]),
      sandboxed: sandboxes[index] !== '0',
    })),
    nextPaneId: paneIds.length,
    activePaneId: paneIds[0],
    ...(title === undefined ? {} : { title }),
  };
};

const zoomOf = (text: string | undefined): number =>
  text === undefined
    ? defaultPaneZoom
    : clampPaneZoom(Result.unwrapOkOr(Num.safeParseFloat(text), Number.NaN));

const panesInTreeOrder = (state: WorkspaceState): readonly PaneState[] =>
  paneIdsOf(state.root).map(
    (paneId) => findPane(state, paneId) ?? createPane(paneId),
  );

const withoutTrailing = <T,>(
  items: readonly T[],
  trailing: T,
): readonly T[] => {
  const last = items.findLastIndex((item) => item !== trailing);

  return items.slice(0, last + 1);
};

/**
 * One value as `URLSearchParams` would write it, with `:` and `/` put back.
 *
 * Both are allowed in a query by the URL standard and are what makes an
 * address legible; what has to go is what the query's own syntax would read —
 * `&`, `=`, `#`, `+` (a space, to a form decoder) and `%` — and the form
 * encoding already escapes those.
 */
const encode = (value: string): string => {
  const encoded = new URLSearchParams({ v: value });

  return encoded
    .toString()
    .slice('v='.length)
    .replaceAll('%3A', ':')
    .replaceAll('%2F', '/');
};
