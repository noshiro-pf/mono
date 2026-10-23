import type { InitializedObservable } from 'synstate';
import { constant, If, view, type Child, type JSX } from 'synstate-dom';
import type { BlockId } from '../layout.mjs';
import { layoutStore } from '../store/index.mjs';

/** What a block's mode gives it (`block-column.tsx`). */
export type BlockPlacement = Readonly<{
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
  /** The share of {@link BlockPlacement.next}. */
  nextShare: number | undefined;
}>;

type Props = Readonly<{
  id: BlockId;
  placement$: InitializedObservable<BlockPlacement>;
  children: Child;
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
export const LayoutBlock = ({
  id,
  placement$,
  children,
}: Props): JSX.Element => {
  const mut_elements: {
    /** Only to measure the block, and find the next one, when the line moves. */
    block: HTMLDivElement | undefined;
    /** Only to measure the block as drawn when a height drag starts. */
    body: HTMLDivElement | undefined;
  } = { block: undefined, body: undefined };

  const onDividerDown = (
    pressed: PointerEvent & Readonly<{ currentTarget: HTMLDivElement }>,
  ): void => {
    if (pressed.button !== 0) {
      return;
    }

    const { share, next, nextShare } = placement$.getSnapshot().value;

    if (share === undefined) {
      const { body } = mut_elements;

      if (body === undefined) {
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
    const { block } = mut_elements;

    if (block === undefined || next === undefined || nextShare === undefined) {
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
  };

  const onDividerDoubleClick = (): void => {
    const { share, next } = placement$.getSnapshot().value;

    if (share === undefined) {
      layoutStore.setHeight(id, undefined);
    } else if (next !== undefined) {
      layoutStore.evenShares([id, next]);
    }
  };

  return (
    <div
      ref={(element) => {
        mut_elements.block = element;
      }}
      class={constant('layout-block')}
      data-block={constant(id)}
      style={{
        'flex-grow': view(placement$, ({ share }) =>
          share === undefined ? '' : String(share),
        ),
      }}
    >
      <div
        ref={(element) => {
          mut_elements.body = element;
        }}
        class={constant('block-body')}
        data-sized={view(placement$, ({ height, share }) =>
          String(height !== undefined || share !== undefined),
        )}
        style={{
          height: view(placement$, ({ height }) =>
            height === undefined ? '' : `${height}px`,
          ),
        }}
      >
        {children}
      </div>

      <If
        // The last block of a column in the `fill` mode has nothing to share
        // with.
        cond={view(
          placement$,
          ({ share, next }) => share === undefined || next !== undefined,
        )}
        then={
          <div
            aria-hidden={constant('true')}
            class={constant('row-divider')}
            title={view(placement$, ({ share }) =>
              share === undefined
                ? 'Drag to set the height; double-click for the natural height'
                : 'Drag to share the height with the block below; double-click to even them',
            )}
            onDblClick={onDividerDoubleClick}
            onLostPointerCapture={onDividerUp}
            onPointerDown={onDividerDown}
            onPointerMove={onDividerMove}
            onPointerUp={onDividerUp}
          />
        }
      />
    </div>
  );
};

const onDividerMove = (moved: PointerEvent): void => {
  layoutStore.resizeTo(moved.clientY);
};

const onDividerUp = (): void => {
  layoutStore.endResize();
};
