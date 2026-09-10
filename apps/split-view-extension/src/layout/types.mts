/** Identifies one pane. Monotonically increasing within a workspace. */
export type PaneId = number;

/**
 * How a split node arranges its two children.
 *
 * - `row`: side by side, `first` on the left.
 * - `column`: stacked, `first` on top.
 *
 * The names follow CSS `flex-direction` rather than "horizontal" / "vertical",
 * which is ambiguous about whether it describes the divider or the children.
 */
export type SplitAxis = 'column' | 'row';

/** Which side of a pane something is attached to. */
export type PaneDropSide = 'bottom' | 'left' | 'right' | 'top';

/**
 * Where a dragged pane was let go over another one.
 *
 * The middle of a pane means "exchange places with it"; an edge means "take
 * that side of it". Both are moves of the *tree*, never of the `iframe`
 * elements, which is why neither reloads anything.
 */
export type PaneDropZone = PaneDropSide | 'center';

/**
 * The layout, as a binary tree: a leaf is a pane, a split node divides its rect
 * between two children.
 *
 * This is what makes arbitrary recursive splitting (phase 2) the same code as
 * the fixed 2x2 grid (phase 1) — a preset is just a tree of a particular shape,
 * and "split this pane" replaces one leaf with a split node.
 */
export type LayoutNode = Readonly<
  | {
      kind: 'split';
      axis: SplitAxis;
      /** `first`'s share of the space available after the gutter, in `0..1`. */
      ratio: number;
      first: LayoutNode;
      second: LayoutNode;
    }
  | { kind: 'pane'; paneId: PaneId }
>;

/**
 * Addresses one split node by the branches taken from the root.
 *
 * A path is stable only as long as the tree's shape is: it is used to carry
 * "which divider is being dragged" for the length of a drag, not to store
 * anything.
 */
export type NodePath = readonly ('first' | 'second')[];

/** A rectangle in CSS pixels, relative to the stage's top-left corner. */
export type Rect = Readonly<{
  left: number;
  top: number;
  width: number;
  height: number;
}>;

/** Everything the page knows about one pane. */
export type PaneState = Readonly<{
  id: PaneId;

  /**
   * The address the page has told the frame to load, and the only thing that
   * ever reaches the `iframe`'s `src`. Empty means an empty pane, which renders
   * an address prompt instead of a frame.
   */
  url: string;

  /**
   * Where the frame says it actually is, which is where the user navigated to
   * from inside the pane. `undefined` until the frame reports — see
   * `frame-agent.mts` for why it may never report at all.
   */
  currentUrl: string | undefined;

  /** The frame's `document.title`, when the frame has reported one. */
  title: string | undefined;

  /**
   * Whether the `sandbox` attribute is applied. It is what stops a page from
   * navigating the whole tab out from under the split view, and it is per-pane
   * because a site that needs top-level navigation (some sign-in flows) cannot
   * work with it on.
   */
  sandboxed: boolean;

  /** `history.length` as last reported, i.e. whether going back is possible. */
  historyLength: number;

  /**
   * How far this pane's page is scaled, `1` being unzoomed.
   *
   * It is applied by the *page*, as a `transform` on the `iframe` with the
   * element's own size divided by it — so the framed site is laid out for the
   * viewport it appears to have and then drawn at that scale, which is what
   * the browser's own zoom does. Applying it inside the frame instead would
   * need the content script, and a pane whose page blocks content scripts is
   * exactly the sort of page that turns out to need zooming out.
   */
  zoom: number;

  /**
   * Bumped to force the `iframe` element to be recreated. It is the `key`, so a
   * change replaces the element — the only reload that works without the
   * frame's cooperation.
   */
  reloadToken: number;
}>;

/** One split view: the tree, the panes it refers to, and the id counter. */
export type WorkspaceState = Readonly<{
  version: 1;
  root: LayoutNode;
  panes: readonly PaneState[];
  nextPaneId: PaneId;
  activePaneId: PaneId | undefined;
}>;
