/**
 * The layout of the page's blocks, and what is going on with it: the block
 * being dragged, the height being dragged, and whether the settings are open.
 *
 * What each change does to a layout is `layout.mts`; this holds the current
 * one and, once started, hands it to `save` — which in the browser writes it
 * into the URL — a moment after the last change rather than on every one: a
 * drag changes the layout on each pointer move, and browsers throttle a page
 * that calls `history.replaceState` that often.
 */

import { createState, debounce, type InitializedObservable } from 'synstate';
import {
  DEFAULT_LAYOUT,
  moveBlock,
  withColumns,
  withHeight,
  withSplit,
  type BlockId,
  type DropTarget,
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

/** A height drag: whose, and where it started. */
export type Resizing = Readonly<{
  block: BlockId;
  fromY: number;
  fromHeight: number;
}>;

export type LayoutStore = Readonly<{
  layout: InitializedObservable<Layout>;
  moving: InitializedObservable<Moving | undefined>;
  resizing: InitializedObservable<Resizing | undefined>;
  settingsOpen: InitializedObservable<boolean>;
  setColumns: (columns: 1 | 2) => void;
  setSplit: (split: number) => void;
  setHeight: (block: BlockId, height: number | undefined) => void;
  move: (block: BlockId, target: DropTarget) => void;
  reset: () => void;
  startMove: (block: BlockId) => void;
  moveOver: (target: DropTarget | undefined) => void;
  /** Moves the block to where it was last over, if anywhere. */
  drop: () => void;
  cancelMove: () => void;
  /** `height` is the block's as drawn when the drag starts. */
  startResize: (block: BlockId, y: number, height: number) => void;
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

  const resizeHeightTo = (y: number): void => {
    const current = getResizing();

    if (current !== undefined) {
      setHeight(current.block, current.fromHeight + y - current.fromY);
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
      setResizing({ block, fromY: y, fromHeight: height });
    },
    resizeTo: resizeHeightTo,
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
