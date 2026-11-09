import { Arr, asUint32 } from 'ts-data-forge';
import { normalizeAddress, paneAddressOf } from '../address.mjs';
import { nonEmpty } from '../fields.mjs';
import {
  defaultPresetId,
  defaultZoom,
  insertBeside,
  maxPaneCount,
  movePaneBeside,
  paneIdsOf,
  paneLeaf,
  presetOf,
  removePane,
  resizeAt,
  stepZoom,
  swapPanes,
  type DropZone,
  type LayoutNode,
  type NodePath,
  type PaneId,
  type PresetId,
  type SplitAxis,
  type ZoomStep,
} from '../layout/index.mjs';
import {
  addressOf,
  findPane,
  initialLive,
  type Pane,
  type StoredPane,
  type StoredWorkspace,
  type Workspace,
} from './model.mjs';

export type WorkspaceAction = Readonly<
  | { type: 'activate'; paneId: PaneId }
  | { type: 'apply-preset'; presetId: PresetId }
  | { type: 'close'; paneId: PaneId }
  | { type: 'move'; paneId: PaneId; target: PaneId; zone: DropZone }
  | { type: 'navigate'; paneId: PaneId; input: string }
  | { type: 'reload'; paneId: PaneId }
  | {
      type: 'report';
      paneId: PaneId;
      url: string;
      title: string;
      historyLength: number;
    }
  | { type: 'resize'; path: NodePath; firstPx: number; availablePx: number }
  | { type: 'set-sandboxed'; paneId: PaneId; sandboxed: boolean }
  | {
      type: 'split';
      /** A pane that is not there (any more) splits the active one. */
      paneId: PaneId | undefined;
      axis: SplitAxis;
      /** What the new pane opens, as typed; `''` leaves it empty. */
      input: string;
    }
  | { type: 'zoom'; paneId: PaneId; step: ZoomStep }
>;

/**
 * Every change to a split view. An action that changes nothing returns the same
 * object, which is what keeps a frame's once-a-second report from
 * re-rendering anything or scheduling a save.
 */
export const workspaceReducer = (
  workspace: Workspace,
  action: WorkspaceAction,
): Workspace => {
  switch (action.type) {
    case 'activate':
      return workspace.activePaneId === action.paneId ||
        findPane(workspace, action.paneId) === undefined
        ? workspace
        : { ...workspace, activePaneId: action.paneId };

    case 'apply-preset':
      return applyPreset(workspace, action.presetId);

    case 'close':
      return closePane(workspace, action.paneId);

    case 'move': {
      if (
        findPane(workspace, action.paneId) === undefined ||
        findPane(workspace, action.target) === undefined
      ) {
        return workspace;
      }

      const root =
        action.zone === 'center'
          ? swapPanes(workspace.root, action.paneId, action.target)
          : movePaneBeside(
              workspace.root,
              action.paneId,
              action.target,
              action.zone,
            );

      return root === workspace.root
        ? workspace
        : { ...workspace, root, activePaneId: action.paneId };
    }

    case 'navigate': {
      const url = normalizeAddress(action.input);

      const pane = findPane(workspace, action.paneId);

      if (url === '' || pane === undefined) {
        return workspace;
      }

      return {
        ...replacePane(workspace, {
          ...pane,
          url,
          live: {
            ...initialLive,
            // The same address again is a reload: `src` alone would not change.
            reloadToken:
              url === pane.url
                ? pane.live.reloadToken + 1
                : pane.live.reloadToken,
          },
        }),
        activePaneId: action.paneId,
      };
    }

    case 'reload':
      return updatePane(workspace, action.paneId, (pane) => ({
        ...pane,
        // A new element loads `url`, so where the frame got to becomes `url`.
        url: addressOf(pane),
        live: { ...pane.live, reloadToken: pane.live.reloadToken + 1 },
      }));

    case 'report':
      return updatePane(workspace, action.paneId, (pane) => {
        const title = nonEmpty(action.title);

        // The frame's word: an address no pane navigates to is not taken.
        const currentUrl = paneAddressOf(action.url) ?? pane.live.currentUrl;

        return pane.live.currentUrl === currentUrl &&
          pane.live.title === title &&
          pane.live.historyLength === action.historyLength
          ? pane
          : {
              ...pane,
              live: {
                ...pane.live,
                currentUrl,
                title,
                historyLength: action.historyLength,
              },
            };
      });

    case 'resize': {
      const root = resizeAt(
        workspace.root,
        action.path,
        action.firstPx,
        action.availablePx,
      );

      return root === workspace.root ? workspace : { ...workspace, root };
    }

    case 'set-sandboxed':
      // `sandbox` applies to the next document only, so the element is replaced.
      return updatePane(workspace, action.paneId, (pane) =>
        pane.sandboxed === action.sandboxed
          ? pane
          : {
              ...pane,
              url: addressOf(pane),
              sandboxed: action.sandboxed,
              live: { ...pane.live, reloadToken: pane.live.reloadToken + 1 },
            },
      );

    case 'split': {
      const paneId =
        action.paneId !== undefined &&
        findPane(workspace, action.paneId) !== undefined
          ? action.paneId
          : workspace.activePaneId;

      return paneId === undefined
        ? workspace
        : splitPane(
            workspace,
            paneId,
            action.axis,
            normalizeAddress(action.input),
          );
    }

    case 'zoom':
      return updatePane(workspace, action.paneId, (pane) => {
        const zoom = stepZoom(pane.zoom, action.step);

        return zoom === pane.zoom ? pane : { ...pane, zoom };
      });
  }
};

export const createPane = (id: PaneId, url: string = ''): Pane =>
  ({
    id,
    url,
    sandboxed: true,
    zoom: defaultZoom,
    live: initialLive,
  }) as const;

/** A new split view: the default preset, every pane empty. */
export const initialWorkspace = (): Workspace =>
  applyPreset(
    {
      root: paneLeaf(0),
      panes: [createPane(0)],
      nextPaneId: 1,
      activePaneId: 0,
      title: undefined,
    },
    defaultPresetId,
  );

/**
 * A stored split view made consistent (spec S2): every leaf gets a pane, a pane
 * not in the tree is dropped, `nextPaneId` passes every id, and a dangling
 * `activePaneId` falls back to the first pane.
 */
export const workspaceFromStored = (stored: StoredWorkspace): Workspace => {
  const listed = paneIdsOf(stored.root);

  // A pane is one leaf: an id the tree repeats gets a pane of its own.
  const { root, nextPaneId } = withUniquePaneIds(
    stored.root,
    // Past every stored pane too, so that a repeat does not take the id, and
    // the address, of a pane the tree had dropped.
    [...listed, ...stored.panes.map((pane) => pane.id)].reduce(
      (next, id) => Math.max(next, id + 1),
      stored.nextPaneId,
    ),
  );

  const ids = paneIdsOf(root);

  const byId = new Map(stored.panes.map((pane) => [pane.id, pane] as const));

  const panes = ids.map((id): Pane => ({
    ...(byId.get(id) ?? createPane(id)),
    live: initialLive,
  }));

  return {
    root,
    panes,
    nextPaneId,
    activePaneId:
      stored.activePaneId !== undefined && ids.includes(stored.activePaneId)
        ? stored.activePaneId
        : ids[0],
    title: stored.title,
  };
};

/** What is written: the addresses the panes are at, and nothing live. */
export const workspaceToStored = (workspace: Workspace): StoredWorkspace =>
  ({
    version: 1,
    root: workspace.root,
    panes: workspace.panes.map((pane): StoredPane => ({
      id: pane.id,
      url: addressOf(pane),
      sandboxed: pane.sandboxed,
      zoom: pane.zoom,
    })),
    nextPaneId: workspace.nextPaneId,
    activePaneId: workspace.activePaneId,
    ...(workspace.title === undefined ? {} : { title: workspace.title }),
  }) as const;

/** The panes in tree order, which is the order the URL lists them in. */
export const panesInTreeOrder = (workspace: Workspace): readonly Pane[] =>
  paneIdsOf(workspace.root).map(
    (id) => findPane(workspace, id) ?? createPane(id),
  );

/** Rebuilds the tree as a preset, reusing panes in tree order (spec L4). */
const applyPreset = (workspace: Workspace, presetId: PresetId): Workspace => {
  const preset = presetOf(presetId);

  if (preset === undefined) {
    return workspace;
  }

  const reused = paneIdsOf(workspace.root).slice(0, preset.paneCount);

  const created = Arr.seq(
    asUint32(Math.max(0, preset.paneCount - reused.length)),
  ).map((offset) => workspace.nextPaneId + offset);

  const slots = [...reused, ...created] as const;

  if (!Arr.isNonEmpty(slots)) {
    return workspace;
  }

  return {
    ...workspace,
    root: preset.build((slot) => slots[slot] ?? slots[0]),
    panes: [
      ...workspace.panes.filter((pane) => reused.includes(pane.id)),
      ...created.map((id) => createPane(id)),
    ],
    nextPaneId: workspace.nextPaneId + created.length,
    activePaneId:
      workspace.activePaneId !== undefined &&
      slots.includes(workspace.activePaneId)
        ? workspace.activePaneId
        : slots[0],
  };
};

const closePane = (workspace: Workspace, paneId: PaneId): Workspace => {
  const root = removePane(workspace.root, paneId);

  // The last pane stays: an empty split view has no pane to split.
  if (root === undefined || root === workspace.root) {
    return workspace;
  }

  return {
    ...workspace,
    root,
    panes: workspace.panes.filter((pane) => pane.id !== paneId),
    activePaneId:
      workspace.activePaneId === paneId
        ? paneIdsOf(root)[0]
        : workspace.activePaneId,
  };
};

const splitPane = (
  workspace: Workspace,
  paneId: PaneId,
  axis: SplitAxis,
  url: string,
): Workspace => {
  if (workspace.panes.length >= maxPaneCount) {
    return workspace;
  }

  const id = workspace.nextPaneId;

  return {
    ...workspace,
    root: insertBeside(
      workspace.root,
      paneId,
      axis === 'row' ? 'right' : 'bottom',
      id,
    ),
    panes: Arr.toPushed(workspace.panes, createPane(id, url)),
    nextPaneId: id + 1,
    activePaneId: id,
  };
};

/**
 * `root` with every repeated pane id after the first replaced by a fresh one,
 * from `firstFree` on; the tree is shared where nothing changed.
 */
const withUniquePaneIds = (
  root: LayoutNode,
  firstFree: PaneId,
): Readonly<{ root: LayoutNode; nextPaneId: PaneId }> => {
  const mut_seen = new Set<PaneId>();

  const mut_next = { id: firstFree };

  const visit = (node: LayoutNode): LayoutNode => {
    if (node.kind === 'pane') {
      if (!mut_seen.has(node.paneId)) {
        mut_seen.add(node.paneId);

        return node;
      }

      const id = mut_next.id;

      mut_next.id += 1;

      return paneLeaf(id);
    }

    const first = visit(node.first);

    const second = visit(node.second);

    return first === node.first && second === node.second
      ? node
      : { ...node, first, second };
  };

  const unique = visit(root);

  return { root: unique, nextPaneId: mut_next.id };
};

const replacePane = (workspace: Workspace, next: Pane): Workspace =>
  ({
    ...workspace,
    panes: workspace.panes.map((pane) => (pane.id === next.id ? next : pane)),
  }) as const;

/** Applies `update` to one pane; an update returning the pane changes nothing. */
const updatePane = (
  workspace: Workspace,
  paneId: PaneId,
  update: (current: Pane) => Pane,
): Workspace => {
  const pane = findPane(workspace, paneId);

  if (pane === undefined) {
    return workspace;
  }

  const next = update(pane);

  return next === pane ? workspace : replacePane(workspace, next);
};
