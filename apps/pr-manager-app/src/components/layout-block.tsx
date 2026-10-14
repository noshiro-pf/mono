import type { ComponentChildren, PointerEventHandler } from 'preact';
import { memoNamed } from 'preact-utils';
import { useCallback, useMemo, useRef } from 'preact/hooks';
import type { BlockId } from '../layout.mjs';
import { layoutStore } from '../store/index.mjs';

type Props = Readonly<{
  id: BlockId;
  /**
   * Absent is the natural height, with no scroll of its own. Always absent in
   * the `fill` mode.
   */
  height: number | undefined;
  /** Present in the `fill` mode only, and then always. */
  share: number | undefined;
  /**
   * In the `fill` mode, the block under this one, whose height the line
   * between them shares; absent for the last of a column, which has none.
   */
  next: BlockId | undefined;
  /** The share of {@link Props.next}. */
  nextShare: number | undefined;
  children: ComponentChildren;
}>;

/**
 * One block: what it holds, and the line under it to drag its height by (a
 * double click there gives the natural height back), drawn as the line
 * between two columns is. In the `fill` mode the line is the one between this
 * block and the next, and moves height from one to the other (a double click
 * evens the two); the last block of a column has none, and reaches the
 * column's end. Where a block goes is the Layout dialog's: an order set once
 * and seldom changed has no need of a drag.
 *
 * **Pointer events, not the HTML drag and drop API**, which draws its own
 * ghost image and does not work with touch. The pointer is captured where the
 * drag starts, so one that leaves the window still ends where it is released.
 *
 * The line is pointer-only, and hidden from assistive technology for it: the
 * layout settings change a block's height with buttons, which is the
 * keyboard's way to the same thing.
 */
export const LayoutBlock = memoNamed<Props>('LayoutBlock', (props) => {
  const { id, height, share, next, nextShare, children } = props;

  /** Only to measure the block as drawn when a height drag starts. */
  const bodyRef = useRef<HTMLDivElement>(null);

  /** Only to measure the block, and find the next one, when the line moves. */
  const blockRef = useRef<HTMLDivElement>(null);

  const onDividerDown = useCallback<PointerEventHandler<HTMLDivElement>>(
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

  const onDividerDoubleClick = useCallback((): void => {
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
  const divided = share === undefined || next !== undefined;

  return (
    <div
      ref={blockRef}
      className={'layout-block'}
      data-block={id}
      style={blockStyle}
    >
      <div
        ref={bodyRef}
        className={'block-body'}
        data-sized={height !== undefined || share !== undefined}
        style={bodyStyle}
      >
        {children}
      </div>

      {divided ? (
        <div
          aria-hidden={'true'}
          className={'row-divider'}
          title={
            share === undefined
              ? 'Drag to set the height; double-click for the natural height'
              : 'Drag to share the height with the block below; double-click to even them'
          }
          onDblClick={onDividerDoubleClick}
          onLostPointerCapture={onDividerUp}
          onPointerDown={onDividerDown}
          onPointerMove={onDividerMove}
          onPointerUp={onDividerUp}
        />
      ) : undefined}
    </div>
  );
});

// Outside the component, since none of them reads its props: one function
// each serves every render, with no `useCallback` to keep it stable.

const onDividerMove: PointerEventHandler<HTMLDivElement> = (moved) => {
  layoutStore.resizeTo(moved.clientY);
};

const onDividerUp = (): void => {
  layoutStore.endResize();
};
