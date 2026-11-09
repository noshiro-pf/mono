/** Identifies one pane within a split view. Never reused there. */
export type PaneId = number;

/**
 * How a split arranges its two children, named as CSS `flex-direction` names
 * them: `row` puts `first` on the left, `column` puts it on top.
 */
export type SplitAxis = 'column' | 'row';

/** One side of a pane. */
export type Side = 'bottom' | 'left' | 'right' | 'top';

/** Where a dragged pane is dropped on another: a side, or the middle. */
export type DropZone = Side | 'center';

/** A child of a split held at a size in CSS pixels, the other taking the rest. */
export type FixedSize = Readonly<{ child: 'first' | 'second'; px: number }>;

export type PaneLeaf = Readonly<{ kind: 'pane'; paneId: PaneId }>;

export type SplitNode = Readonly<{
  kind: 'split';
  axis: SplitAxis;
  /** `first`'s share of the space after the gutter. Ignored while `fixed` is set. */
  ratio: number;
  fixed?: FixedSize;
  first: LayoutNode;
  second: LayoutNode;
}>;

/** The layout: a binary tree whose leaves are the panes. */
export type LayoutNode = PaneLeaf | SplitNode;

/**
 * A split node, by the branches taken from the root. Valid only while the tree
 * keeps its shape: it carries a divider through one drag, and is never stored.
 */
export type NodePath = readonly ('first' | 'second')[];

/** A rectangle in CSS pixels, relative to the stage. */
export type Rect = Readonly<{
  left: number;
  top: number;
  width: number;
  height: number;
}>;
