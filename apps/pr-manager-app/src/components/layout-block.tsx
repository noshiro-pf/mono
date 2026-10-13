import type { ComponentChildren, PointerEventHandler } from 'preact';
import { memoNamed } from 'preact-utils';
import { useCallback, useMemo, useRef } from 'preact/hooks';
import {
  BLOCK_NAMES,
  nearestDropTarget,
  type BlockId,
  type ColumnBox,
  type ColumnIndex,
} from '../layout.mjs';
import { layoutStore } from '../store/index.mjs';

type Props = Readonly<{
  id: BlockId;
  column: ColumnIndex;
  /**
   * Absent is the natural height, with no scroll of its own. Always absent in
   * the `fill` mode.
   */
  height: number | undefined;
  /** Present in the `fill` mode only, and then always. */
  share: number | undefined;
  /**
   * In the `fill` mode, the block under this one, whose height its bottom
   * edge shares; absent for the last of a column, whose edge does nothing.
   */
  next: BlockId | undefined;
  /** The share of {@link Props.next}. */
  nextShare: number | undefined;
  dragging: boolean;
  children: ComponentChildren;
}>;

/**
 * One block: a handle to drag it by, what it holds, and a bottom edge to
 * drag its height by (a double click there gives the natural height back).
 * In the `fill` mode the edge is the line between this block and the next,
 * and moves height from one to the other (a double click evens the two).
 *
 * **Pointer events, not the HTML drag and drop API**, which draws its own
 * ghost image, does not work with touch, and would still need all of this to
 * say where a block lands. The pointer is captured where the drag starts, so
 * one that leaves the window still ends where it is released.
 *
 * Both are pointer-only, and hidden from assistive technology for it: the
 * layout settings move a block and change its height with buttons, which is
 * the keyboard's way to the same things.
 */
export const LayoutBlock = memoNamed<Props>('LayoutBlock', (props) => {
  const { id, column, height, share, next, nextShare, dragging, children } =
    props;

  /** Only to measure the block as drawn when a height drag starts. */
  const bodyRef = useRef<HTMLDivElement>(null);

  /** Only to measure the block, and find the next one, when the line moves. */
  const blockRef = useRef<HTMLDivElement>(null);

  const onHandleDown = useCallback<PointerEventHandler<HTMLDivElement>>(
    (pressed) => {
      if (pressed.button !== 0) {
        return;
      }

      pressed.preventDefault();

      pressed.currentTarget.setPointerCapture(pressed.pointerId);

      layoutStore.startMove(id);
    },
    [id],
  );

  const onHandleMove = useCallback<PointerEventHandler<HTMLDivElement>>(
    (moved) => {
      if (!moved.currentTarget.hasPointerCapture(moved.pointerId)) {
        return;
      }

      // Measured from the page as it is drawn, which is the only place the
      // blocks' positions are known; where that puts the block is
      // `nearestDropTarget`.
      const columnElements =
        moved.currentTarget
          .closest('.block-layout')
          ?.querySelectorAll<HTMLElement>('.block-column') ?? [];

      const columns = Array.from(columnElements, (element): ColumnBox => {
        const box = element.getBoundingClientRect();

        return {
          column: element.dataset[COLUMN_KEY] === '1' ? 1 : 0,
          left: box.left,
          right: box.right,
          top: box.top,
          bottom: box.bottom,
          midpoints: Array.from(
            element.querySelectorAll<HTMLElement>(':scope > .layout-block'),
          )
            .filter((block) => block.dataset[BLOCK_KEY] !== id)
            .map((block) => {
              const rect = block.getBoundingClientRect();

              return rect.top + rect.height / 2;
            }),
        };
      });

      layoutStore.moveOver(
        nearestDropTarget(columns, moved.clientX, moved.clientY),
      );
    },
    [id],
  );

  const onEdgeDown = useCallback<PointerEventHandler<HTMLDivElement>>(
    (pressed) => {
      if (pressed.button !== 0) {
        return;
      }

      if (share === undefined) {
        const body = bodyRef.current;

        if (body === null) {
          return;
        }

        pressed.preventDefault();

        pressed.currentTarget.setPointerCapture(pressed.pointerId);

        layoutStore.startResize(
          id,
          pressed.clientY,
          body.getBoundingClientRect().height,
        );

        return;
      }

      // The blocks share their column's height by their shares and nothing
      // else (`index.css`), so their heights as drawn are in the ratio of
      // their shares, which is what `withBoundaryAt` relies on.
      const block = blockRef.current;

      if (block === null || next === undefined || nextShare === undefined) {
        return;
      }

      const lower = block.parentElement?.querySelector<HTMLElement>(
        `:scope > .layout-block[data-block='${CSS.escape(next)}']`,
      );

      if (lower === null || lower === undefined) {
        return;
      }

      pressed.preventDefault();

      pressed.currentTarget.setPointerCapture(pressed.pointerId);

      layoutStore.startBoundaryResize({
        upper: id,
        lower: next,
        fromY: pressed.clientY,
        upperHeight: block.getBoundingClientRect().height,
        lowerHeight: lower.getBoundingClientRect().height,
        upperShare: share,
        lowerShare: nextShare,
      });
    },
    [id, share, next, nextShare],
  );

  const onEdgeDoubleClick = useCallback((): void => {
    if (share === undefined) {
      layoutStore.setHeight(id, undefined);
    } else if (next !== undefined) {
      layoutStore.evenShares([id, next]);
    }
  }, [id, share, next]);

  const blockStyle = useMemo(
    () => (share === undefined ? undefined : { flexGrow: share }),
    [share],
  );

  const bodyStyle = useMemo(
    () => (height === undefined ? undefined : { height }),
    [height],
  );

  // The last block of a column in the `fill` mode has nothing to share with.
  const inertEdge = share !== undefined && next === undefined;

  return (
    <div
      ref={blockRef}
      className={'layout-block'}
      data-block={id}
      data-column={column}
      data-dragging={dragging}
      style={blockStyle}
    >
      <div
        aria-hidden={'true'}
        className={'block-handle'}
        title={`Drag to move ${BLOCK_NAMES[id]}`}
        onLostPointerCapture={onHandleUp}
        onPointerCancel={onHandleCancel}
        onPointerDown={onHandleDown}
        onPointerMove={onHandleMove}
        onPointerUp={onHandleUp}
      >
        {'⠿'}
      </div>

      <div
        ref={bodyRef}
        className={'block-body'}
        data-sized={height !== undefined || share !== undefined}
        style={bodyStyle}
      >
        {children}
      </div>

      {inertEdge ? (
        <div aria-hidden={'true'} className={'block-edge'} data-inert />
      ) : (
        <div
          aria-hidden={'true'}
          className={'block-edge'}
          title={
            share === undefined
              ? 'Drag to set the height; double-click for the natural height'
              : 'Drag to share the height with the block below; double-click to even them'
          }
          onDblClick={onEdgeDoubleClick}
          onLostPointerCapture={onEdgeUp}
          onPointerDown={onEdgeDown}
          onPointerMove={onEdgeMove}
          onPointerUp={onEdgeUp}
        />
      )}
    </div>
  );
});

// Outside the component, since none of them reads its props: one function
// each serves every render, with no `useCallback` to keep it stable.

const onHandleUp = (): void => {
  layoutStore.drop();
};

const onHandleCancel = (): void => {
  layoutStore.cancelMove();
};

const onEdgeMove: PointerEventHandler<HTMLDivElement> = (moved) => {
  layoutStore.resizeTo(moved.clientY);
};

const onEdgeUp = (): void => {
  layoutStore.endResize();
};

// Through constants because `dot-notation` and
// `noPropertyAccessFromIndexSignature` want a literal key spelled two opposite
// ways; these read the `data-column` and `data-block` the components write.
const COLUMN_KEY = 'column';

const BLOCK_KEY = 'block';
