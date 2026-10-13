/**
 * The layout of the page's blocks, and what is going on with it: the block
 * being dragged, the height or the line between two blocks being dragged,
 * and whether the settings are open.
 *
 * What each change does to a layout is `layout.mts`; this holds the current
 * one and, once started, hands it to `save` — which in the browser writes it
 * into the URL — a moment after the last change rather than on every one: a
 * drag changes the layout on each pointer move, and browsers throttle a page
 * that calls `history.replaceState` that often.
 */

import {
  createState,
  debounce,
  map,
  skipIfNoChange,
  type InitializedObservable,
} from 'synstate';
import {
  DEFAULT_LAYOUT,
  moveBlock,
  withBoundaryAt,
  withColumns,
  withEvenShares,
  withHeight,
  withMode,
  withShare,
  withSplit,
  type BlockId,
  type BoundaryDrag,
  type DropTarget,
  type HeightMode,
  type Layout,
} from '../layout.mjs';

export type LayoutDeps = Readonly<{
  initial: Layout;
  save: (layout: Layout) => void;
  /** How long the layout has to stay still before it is saved. */
  saveDelayMs: number;
}>;

/** The block under the pointer, and where it would land if dropped now. */
export type Moving = Readonly<{
  block: BlockId;
  target: DropTarget | undefined;
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
  moving: InitializedObservable<Moving | undefined>;
  resizing: InitializedObservable<Resizing | undefined>;
  settingsOpen: InitializedObservable<boolean>;
  setColumns: (columns: 1 | 2) => void;
  setSplit: (split: number) => void;
  setHeight: (block: BlockId, height: number | undefined) => void;
  setMode: (mode: HeightMode) => void;
  setShare: (block: BlockId, share: number | undefined) => void;
  /** Gives the blocks the same height each, out of what they had. */
  evenShares: (blocks: readonly BlockId[]) => void;
  move: (block: BlockId, target: DropTarget) => void;
  reset: () => void;
  startMove: (block: BlockId) => void;
  moveOver: (target: DropTarget | undefined) => void;
  /** Moves the block to where it was last over, if anywhere. */
  drop: () => void;
  cancelMove: () => void;
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

  const [moving, setMoving, { getSnapshot: getMoving }] = createState<
    Moving | undefined
  >(undefined);

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

  const move = (block: BlockId, target: DropTarget): void => {
    updateLayout((current) => moveBlock(current, block, target));
  };

  const moveOver = (target: DropTarget | undefined): void => {
    const current = getMoving();

    if (current === undefined) {
      return;
    }

    setMoving({ block: current.block, target });
  };

  const drop = (): void => {
    const current = getMoving();

    setMoving(undefined);

    if (current?.target !== undefined) {
      move(current.block, current.target);
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
    mode: layout.pipe(map((current) => current.mode)).pipe(skipIfNoChange()),
    moving,
    resizing,
    settingsOpen,
    setColumns: (columns) => {
      updateLayout((current) => withColumns(current, columns));
    },
    setSplit: (split) => {
      updateLayout((current) => withSplit(current, split));
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
    move,
    reset: () => {
      setLayout(DEFAULT_LAYOUT);
    },
    startMove: (block) => {
      setMoving({ block, target: undefined });
    },
    moveOver,
    drop,
    cancelMove: () => {
      setMoving(undefined);
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
