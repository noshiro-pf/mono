/**
 * The layout of the page's blocks, and what is going on with it: the height or
 * the line between two blocks being dragged, and whether the settings are open.
 *
 * What each change does to a layout is `layout.mts`; this holds the current one
 * and, once started, hands it to `save` — which in the browser writes it into
 * the URL — a moment after the last change rather than on every one: a drag
 * changes the layout on each pointer move, and browsers throttle a page that
 * calls `history.replaceState` that often.
 */

import {
  createState,
  debounce,
  map,
  type InitializedObservable,
} from 'synstate';
import {
  DEFAULT_LAYOUT,
  moveBlock,
  withBoundaryAt,
  withColumns,
  withEvenLine,
  withEvenShares,
  withHeight,
  withHidden,
  withLineAt,
  withMode,
  withShare,
  withSplit,
  type BlockId,
  type BlockPlace,
  type BoundaryDrag,
  type ColumnCount,
  type HeightMode,
  type Layout,
  type LineIndex,
} from '../layout.mjs';

export type LayoutDeps = Readonly<{
  initial: Layout;
  save: (layout: Layout) => void;
  /** How long the layout has to stay still before it is saved. */
  saveDelayMs: number;
}>;

/**
 * A height drag — whose, and where it started — in the `natural` mode, or the
 * line between two blocks being dragged in the `fill` mode.
 */
export type Resizing = Readonly<
  | {
      type: 'height';
      block: BlockId;
      fromY: number;
      fromHeight: number;
    }
  | { type: 'boundary'; drag: BoundaryDrag }
>;

export type LayoutStore = Readonly<{
  layout: InitializedObservable<Layout>;
  /** The layout's mode, for what reads nothing else of it. */
  mode: InitializedObservable<HeightMode>;
  resizing: InitializedObservable<Resizing | undefined>;
  settingsOpen: InitializedObservable<boolean>;
  setColumns: (columns: ColumnCount) => void;
  setSplit: (split: number) => void;
  /** Moves the line between two columns; see `withLineAt`. */
  setLine: (line: LineIndex, at: number) => void;
  /** Evens the two columns beside the line. */
  evenLine: (line: LineIndex) => void;
  setHeight: (block: BlockId, height: number | undefined) => void;
  setMode: (mode: HeightMode) => void;
  setShare: (block: BlockId, share: number | undefined) => void;
  /** Gives the blocks the same height each, out of what they had. */
  evenShares: (blocks: readonly BlockId[]) => void;
  /** Hides a block, or shows it again where it was; see `withHidden`. */
  setHidden: (block: BlockId, hidden: boolean) => void;
  move: (block: BlockId, target: BlockPlace) => void;
  reset: () => void;
  /** `height` is the block's as drawn when the drag starts. */
  startResize: (block: BlockId, y: number, height: number) => void;
  startBoundaryResize: (drag: BoundaryDrag) => void;
  resizeTo: (y: number) => void;
  endResize: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  /** Starts saving, and returns what stops it. */
  start: () => () => void;
}>;

export const createLayoutStore = (deps: LayoutDeps): LayoutStore => {
  const [layout, setLayout, { updateState: updateLayout }] =
    createState<Layout>(deps.initial);

  const [resizing, setResizing, { getSnapshot: getResizing }] = createState<
    Resizing | undefined
  >(undefined);

  const [settingsOpen, setSettingsOpen] = createState(false);

  const setHeight = (block: BlockId, height: number | undefined): void => {
    updateLayout((current) => withHeight(current, block, height));
  };

  const resizeToY = (y: number): void => {
    const current = getResizing();

    if (current === undefined) {
      return;
    }

    switch (current.type) {
      case 'height':
        setHeight(current.block, current.fromHeight + y - current.fromY);

        break;

      case 'boundary':
        updateLayout((latest) => withBoundaryAt(latest, current.drag, y));

        break;
    }
  };

  const start = (): (() => void) => {
    const subscription = layout
      .pipe(debounce(deps.saveDelayMs))
      .subscribe(deps.save);

    return () => {
      subscription.unsubscribe();
    };
  };

  return {
    layout,
    mode: layout.pipe(map((current) => current.mode)),
    resizing,
    settingsOpen,
    setColumns: (columns) => {
      updateLayout((current) => withColumns(current, columns));
    },
    setSplit: (split) => {
      updateLayout((current) => withSplit(current, split));
    },
    setLine: (line, at) => {
      updateLayout((current) => withLineAt(current, line, at));
    },
    evenLine: (line) => {
      updateLayout((current) => withEvenLine(current, line));
    },
    setHeight,
    setMode: (mode) => {
      updateLayout((current) => withMode(current, mode));
    },
    setShare: (block, share) => {
      updateLayout((current) => withShare(current, block, share));
    },
    evenShares: (blocks) => {
      updateLayout((current) => withEvenShares(current, blocks));
    },
    setHidden: (block, hidden) => {
      updateLayout((current) => withHidden(current, block, hidden));
    },
    move: (block, target) => {
      updateLayout((current) => moveBlock(current, block, target));
    },
    reset: () => {
      setLayout(DEFAULT_LAYOUT);
    },
    startResize: (block, y, height) => {
      setResizing({ type: 'height', block, fromY: y, fromHeight: height });
    },
    startBoundaryResize: (drag) => {
      setResizing({ type: 'boundary', drag });
    },
    resizeTo: resizeToY,
    endResize: () => {
      setResizing(undefined);
    },
    openSettings: () => {
      setSettingsOpen(true);
    },
    closeSettings: () => {
      setSettingsOpen(false);
    },
    start,
  };
};
