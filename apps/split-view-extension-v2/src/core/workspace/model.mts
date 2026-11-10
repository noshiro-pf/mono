import type { LayoutNode, PaneId } from '../layout/index.mjs';

/**
 * A pane as it is stored (spec S4): what it should load, and how.
 *
 * `url` is what the page points the frame at and the only thing that ever
 * reaches its `src`; an empty one is an empty pane. Where the user navigated to
 * inside the frame is `live.currentUrl`, folded into `url` when stored.
 */
export type StoredPane = Readonly<{
  id: PaneId;
  url: string;
  /** The `sandbox` attribute is on (spec P5). */
  sandboxed: boolean;
  zoom: number;
}>;

/** What the page learns about a pane while it is open, and never stores. */
export type PaneLive = Readonly<{
  /** Where the frame says it is; `undefined` until it reports. */
  currentUrl: string | undefined;
  title: string | undefined;
  historyLength: number;
  /** Bumped to replace the `iframe`: the one reload that needs nothing of the frame. */
  reloadToken: number;
}>;

export type Pane = StoredPane & Readonly<{ live: PaneLive }>;

/** One split view, as the page holds it. */
export type Workspace = Readonly<{
  root: LayoutNode;
  /** One per leaf of `root`, in no particular order. */
  panes: readonly Pane[];
  nextPaneId: PaneId;
  activePaneId: PaneId | undefined;
  /** The tab's title, when a URL's `title=` gave it one. */
  title: string | undefined;
}>;

/**
 * One split view as stored under `workspace:<id>` (contract C2). `title` is
 * left out rather than `undefined` when there is none, as the current version
 * writes it.
 */
export type StoredWorkspace = Readonly<{
  version: 1;
  root: LayoutNode;
  panes: readonly StoredPane[];
  nextPaneId: PaneId;
  activePaneId: PaneId | undefined;
  title?: string;
}>;

export const initialLive: PaneLive = {
  currentUrl: undefined,
  title: undefined,
  historyLength: 1,
  reloadToken: 0,
} as const;

/** Where a pane is: where the frame says, or where it was pointed. */
export const addressOf = (pane: Pane): string =>
  pane.live.currentUrl ?? pane.url;

export const findPane = (
  workspace: Workspace,
  paneId: PaneId,
): Pane | undefined => workspace.panes.find((pane) => pane.id === paneId);
