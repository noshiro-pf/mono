import { Arr } from 'ts-data-forge';
import {
  defaultPaneZoom,
  defaultPresetId,
  layoutPresets,
  movePaneBeside,
  paneIdsOf,
  paneNode,
  removePaneAt,
  splitPaneAt,
  steppedPaneZoom,
  swapPanesAt,
  updateRatioAt,
  type NodePath,
  type PaneDropZone,
  type PaneId,
  type PaneState,
  type PaneZoomStep,
  type PresetId,
  type SplitAxis,
  type WorkspaceState,
} from '../layout/index.mjs';
import { normalizeAddress } from './url.mjs';

export type WorkspaceAction = Readonly<
  | { type: 'activate'; paneId: PaneId }
  | { type: 'apply-preset'; presetId: PresetId }
  | { type: 'close'; paneId: PaneId }
  | {
      type: 'move-pane';
      paneId: PaneId;
      targetPaneId: PaneId;
      zone: PaneDropZone;
    }
  | { type: 'navigate'; paneId: PaneId; input: string }
  | { type: 'reload'; paneId: PaneId }
  | {
      type: 'report';
      paneId: PaneId;
      url: string;
      title: string;
      historyLength: number;
    }
  | { type: 'restore'; state: WorkspaceState }
  | { type: 'set-ratio'; path: NodePath; ratio: number }
  | { type: 'set-sandboxed'; paneId: PaneId; sandboxed: boolean }
  | { type: 'split'; paneId: PaneId; axis: SplitAxis }
  | { type: 'zoom'; paneId: PaneId; step: PaneZoomStep }
>;

/**
 * Every change to a split view, as one pure function.
 *
 * Two properties matter beyond the obvious. An action that changes nothing
 * returns the *same* state object, so that the frames' once-a-second reports do
 * not re-render the page or trigger a save. And a pane that stays in the tree
 * keeps its `PaneState` — including its address — across preset changes, so
 * switching from a 2x2 grid to three columns keeps the first three pages.
 */
export const workspaceReducer = (
  state: WorkspaceState,
  action: WorkspaceAction,
): WorkspaceState => {
  switch (action.type) {
    case 'restore':
      return reconcileWorkspace(action.state);

    case 'apply-preset':
      return applyPreset(state, action.presetId);

    case 'split': {
      if (findPane(state, action.paneId) === undefined) {
        return state;
      }

      const newPaneId = state.nextPaneId;

      return {
        ...state,
        root: splitPaneAt(state.root, action.paneId, action.axis, newPaneId),
        panes: Arr.toPushed(state.panes, createPane(newPaneId)),
        nextPaneId: newPaneId + 1,
        activePaneId: newPaneId,
      };
    }

    /**
     * Drops one pane onto another: the middle exchanges their places, an edge
     * takes that side of the target.
     *
     * Both are edits to the tree alone. The panes keep their ids, so their
     * `iframe` elements are neither recreated nor moved in the DOM — they are
     * positioned into different rectangles on the next render, and nothing
     * reloads.
     */
    case 'move-pane': {
      if (
        findPane(state, action.paneId) === undefined ||
        findPane(state, action.targetPaneId) === undefined
      ) {
        return state;
      }

      const root =
        action.zone === 'center'
          ? swapPanesAt(state.root, action.paneId, action.targetPaneId)
          : movePaneBeside(
              state.root,
              action.paneId,
              action.targetPaneId,
              action.zone,
            );

      return root === state.root
        ? state
        : { ...state, root, activePaneId: action.paneId };
    }

    case 'close': {
      const root = removePaneAt(state.root, action.paneId);

      // The last pane cannot be closed: an empty split view has nothing to
      // split, and no way back to a pane.
      if (root === undefined) {
        return state;
      }

      const panes = state.panes.filter((pane) => pane.id !== action.paneId);

      return {
        ...state,
        root,
        panes,
        activePaneId:
          state.activePaneId === action.paneId
            ? paneIdsOf(root)[0]
            : state.activePaneId,
      };
    }

    case 'set-ratio':
      return {
        ...state,
        root: updateRatioAt(state.root, action.path, action.ratio),
      };

    case 'navigate': {
      const url = normalizeAddress(action.input);

      if (url === '' || findPane(state, action.paneId) === undefined) {
        return state;
      }

      return {
        ...updatePane(state, action.paneId, (pane) => ({
          ...pane,
          url,
          currentUrl: undefined,
          title: undefined,
          historyLength: 1,
          // Submitting the address the pane is already at means "reload": the
          // `src` would not change, so nothing would happen otherwise.
          reloadToken:
            url === pane.url ? pane.reloadToken + 1 : pane.reloadToken,
        })),
        activePaneId: action.paneId,
      };
    }

    case 'report': {
      const pane = findPane(state, action.paneId);

      if (pane === undefined) {
        return state;
      }

      const title = action.title === '' ? undefined : action.title;

      if (
        pane.currentUrl === action.url &&
        pane.title === title &&
        pane.historyLength === action.historyLength
      ) {
        return state;
      }

      return updatePane(state, action.paneId, (target) => ({
        ...target,
        currentUrl: action.url,
        title,
        historyLength: action.historyLength,
      }));
    }

    case 'reload':
      return updatePane(state, action.paneId, (pane) => ({
        ...pane,
        // Recreating the element loads `url`, so where the user navigated to
        // inside the pane has to become `url` first — otherwise a reload is a
        // jump back to wherever the pane was pointed originally.
        url: pane.currentUrl ?? pane.url,
        reloadToken: pane.reloadToken + 1,
      }));

    case 'set-sandboxed':
      // The `sandbox` attribute only takes effect on a document loaded into the
      // frame afterwards, so the element has to be replaced for the change to
      // mean anything — which makes this a reload as well.
      return updatePane(state, action.paneId, (pane) => ({
        ...pane,
        url: pane.currentUrl ?? pane.url,
        sandboxed: action.sandboxed,
        reloadToken: pane.reloadToken + 1,
      }));

    // Zoom is the page's to apply, not the frame's: it is a `transform` on the
    // `iframe`, so it works on a page that will not run our content script.
    case 'zoom':
      return updatePane(state, action.paneId, (pane) => {
        const zoom = steppedPaneZoom(pane.zoom, action.step);

        return zoom === pane.zoom ? pane : { ...pane, zoom };
      });

    case 'activate':
      return state.activePaneId === action.paneId
        ? state
        : { ...state, activePaneId: action.paneId };
  }
};

/** The layout a freshly opened split view starts in. */
export const initialWorkspaceState = (): WorkspaceState =>
  applyPreset(
    {
      version: 1,
      root: paneNode(0),
      panes: [createPane(0)],
      nextPaneId: 1,
      activePaneId: 0,
    },
    defaultPresetId,
  );

/**
 * Makes a state that came from storage self-consistent: every pane in the tree
 * has a `PaneState`, every `PaneState` is in the tree, and `nextPaneId` is
 * ahead of every id in use.
 *
 * Restoring is where a stale or hand-edited value shows up, and the repair is
 * always better than refusing to restore — the addresses are the part the user
 * would miss.
 */
export const reconcileWorkspace = (state: WorkspaceState): WorkspaceState => {
  const paneIds = paneIdsOf(state.root);

  const known: ReadonlyMap<PaneId, PaneState> = new Map(
    state.panes.map((pane) => [pane.id, pane] as const),
  );

  const panes = paneIds.map((id) => known.get(id) ?? createPane(id));

  const maxPaneId = panes.reduce((acc, pane) => Math.max(acc, pane.id), -1);

  return {
    version: 1,
    root: state.root,
    panes,
    nextPaneId: Math.max(state.nextPaneId, maxPaneId + 1),
    activePaneId:
      state.activePaneId !== undefined && paneIds.includes(state.activePaneId)
        ? state.activePaneId
        : paneIds[0],
  };
};

export const createPane = (id: PaneId): PaneState =>
  ({
    id,
    url: '',
    currentUrl: undefined,
    title: undefined,
    sandboxed: true,
    historyLength: 1,
    zoom: defaultPaneZoom,
    reloadToken: 0,
  }) as const;

export const findPane = (
  state: WorkspaceState,
  paneId: PaneId,
): PaneState | undefined => state.panes.find((pane) => pane.id === paneId);

const applyPreset = (
  state: WorkspaceState,
  presetId: PresetId,
): WorkspaceState => {
  const preset = layoutPresets.find((candidate) => candidate.id === presetId);

  if (preset === undefined) {
    return state;
  }

  const reused = paneIdsOf(state.root).slice(0, preset.paneCount);

  const created = Array.from(
    { length: Math.max(0, preset.paneCount - reused.length) },
    (_, index) => state.nextPaneId + index,
  );

  const slots = [...reused, ...created] as const;

  if (!Arr.isNonEmpty(slots)) {
    return state;
  }

  const panes = [
    ...state.panes.filter((pane) => reused.includes(pane.id)),
    ...created.map(createPane),
  ] as const;

  return {
    ...state,
    // `slots[index] ?? slots[0]` is total by construction: a preset asks for
    // exactly `paneCount` slots and that is how many there are.
    root: preset.build((index) => slots[index] ?? slots[0]),
    panes,
    nextPaneId: state.nextPaneId + created.length,
    activePaneId:
      state.activePaneId !== undefined && slots.includes(state.activePaneId)
        ? state.activePaneId
        : slots[0],
  };
};

/**
 * Applies `update` to one pane.
 *
 * An updater that returns the pane it was given means "nothing changed", and
 * this passes that through: the whole state comes back unchanged, which is the
 * property the page relies on to render and save nothing. Without it, holding
 * `Ctrl` and spinning the wheel at the end of the zoom ladder would re-render
 * and re-save on every notch.
 */
const updatePane = (
  state: WorkspaceState,
  paneId: PaneId,
  update: (pane: PaneState) => PaneState,
): WorkspaceState => {
  const panes = state.panes.map((pane) =>
    pane.id === paneId ? update(pane) : pane,
  );

  return panes.every((pane, index) => pane === state.panes[index])
    ? state
    : { ...state, panes };
};
