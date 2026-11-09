import {
  layoutQueryParam,
  paneSandboxQueryParam,
  paneUrlQueryParam,
  paneZoomQueryParam,
  workspaceNameQueryParam,
  workspaceQueryParam,
  workspaceTitleQueryParam,
} from 'split-view-link';
import { Arr, asUint32, Num, Result } from 'ts-data-forge';
import { normalizeAddress } from './address.mjs';
import { nonEmpty } from './fields.mjs';
import {
  clampZoom,
  defaultZoom,
  evenChain,
  formatLayoutSpec,
  maxPaneCount,
  paneIdsOf,
  paneLeaf,
  parseLayoutSpec,
  presetOf,
  type LayoutNode,
} from './layout/index.mjs';
import {
  addressOf,
  createPane,
  initialLive,
  panesInTreeOrder,
  type Workspace,
} from './workspace/index.mjs';

/**
 * What a `split.html` URL asks for (spec U2). `workspace` is set when the URL
 * describes a view — a `layout` or a `url` — and is then shown over what is
 * stored.
 */
export type ViewRequest = Readonly<{
  id: string | undefined;
  name: string | undefined;
  workspace: Workspace | undefined;
}>;

export const parseViewQuery = (search: string): ViewRequest => {
  const params = new URLSearchParams(search);

  // A split view has at most `maxPaneCount` panes; the rest are left out.
  const addresses = params.getAll(paneUrlQueryParam).slice(0, maxPaneCount);

  const root = layoutOf(params.get(layoutQueryParam), addresses.length);

  return {
    id: nonEmpty(params.get(workspaceQueryParam)),
    name: nonEmpty(params.get(workspaceNameQueryParam)?.trim() ?? null),
    workspace:
      root === undefined
        ? undefined
        : workspaceOf(
            root,
            addresses,
            params.getAll(paneZoomQueryParam),
            params.getAll(paneSandboxQueryParam),
            nonEmpty(params.get(workspaceTitleQueryParam)?.trim() ?? null),
          ),
  };
};

/**
 * The query string of a view, `?` included (spec U1). Written by hand rather
 * than by `URLSearchParams`, which escapes `:` and `/` and turns every address
 * in the bar into `https%3A%2F%2F…`; a reader takes either form.
 */
export const formatViewQuery = (id: string, workspace: Workspace): string => {
  const panes = panesInTreeOrder(workspace);

  const addresses = panes.map(addressOf);

  const lastAddress = addresses.findLastIndex((address) => address !== '');

  const pairs = [
    [workspaceQueryParam, id],
    ...(workspace.title === undefined
      ? ([] as const)
      : ([[workspaceTitleQueryParam, workspace.title]] as const)),
    [layoutQueryParam, formatLayoutSpec(workspace.root)],
    ...addresses
      .slice(0, lastAddress + 1)
      .map((address) => [paneUrlQueryParam, address] as const),
    ...(panes.every((pane) => pane.zoom === defaultZoom)
      ? ([] as const)
      : panes.map(
          (pane) => [paneZoomQueryParam, pane.zoom.toString()] as const,
        )),
    ...(panes.every((pane) => pane.sandboxed)
      ? ([] as const)
      : panes.map(
          (pane) =>
            [paneSandboxQueryParam, pane.sandboxed ? '1' : '0'] as const,
        )),
  ] as const;

  return `?${pairs.map(([key, value]) => `${key}=${encodeQueryValue(value)}`).join('&')}`;
};

/** The id a query names, or `undefined`. */
export const viewIdOf = (search: string): string | undefined => {
  const params = new URLSearchParams(search);

  return nonEmpty(params.get(workspaceQueryParam));
};

/**
 * A value as a form encodes it, with `:` and `/` put back: both are legal in a
 * query and make an address legible, while `&`, `=`, `#`, `+` and `%` stay
 * escaped.
 */
export const encodeQueryValue = (value: string): string => {
  const params = new URLSearchParams({ v: value });

  return params
    .toString()
    .slice('v='.length)
    .replaceAll('%3A', ':')
    .replaceAll('%2F', '/');
};

/**
 * The layout a URL asks for: a spec, or a preset's id. One that does not parse
 * counts as none, and addresses with no layout go side by side.
 */
const layoutOf = (
  spec: string | null,
  addressCount: number,
): LayoutNode | undefined => {
  const trimmed = spec?.trim() ?? '';

  const parsed =
    trimmed === ''
      ? undefined
      : (presetOf(trimmed)?.build((slot) => slot) ?? parseLayoutSpec(trimmed));

  return (
    parsed ??
    (addressCount === 0
      ? undefined
      : evenChain('row', Arr.seq(asUint32(addressCount)).map(paneLeaf)))
  );
};

const zoomOf = (text: string | undefined): number =>
  text === undefined
    ? defaultZoom
    : clampZoom(Result.unwrapOkOr(Num.safeParseFloat(text), Number.NaN));

/** Panes numbered in tree order; addresses normalized as typed ones are. */
const workspaceOf = (
  root: LayoutNode,
  addresses: readonly string[],
  zooms: readonly string[],
  sandboxes: readonly string[],
  title: string | undefined,
): Workspace => {
  const ids = paneIdsOf(root);

  return {
    root,
    panes: ids.map((id, index) => ({
      ...createPane(id, normalizeAddress(addresses[index] ?? '')),
      zoom: zoomOf(zooms[index]),
      sandboxed: sandboxes[index] !== '0',
      live: initialLive,
    })),
    nextPaneId: ids.length,
    activePaneId: ids[0],
    title,
  };
};
