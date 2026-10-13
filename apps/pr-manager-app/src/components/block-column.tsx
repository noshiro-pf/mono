import { Fragment, type ComponentChildren } from 'preact';
import { memoNamed } from 'preact-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  DEFAULT_SHARE,
  type BlockId,
  type ColumnIndex,
  type Layout,
} from '../layout.mjs';
import type { Moving } from '../store/index.mjs';
import { LayoutBlock } from './layout-block.js';

type Props = Readonly<{
  column: ColumnIndex;
  ids: readonly BlockId[];
  blocks: ReadonlyRecord<BlockId, ComponentChildren>;
  heights: Layout['heights'];
  mode: Layout['mode'];
  shares: Layout['shares'];
  moving: Moving | undefined;
}>;

/**
 * One column of blocks, and — while a block is dragged over it — the line
 * where it would land.
 *
 * The dragged block stays where it was, dimmed, until it is dropped, so the
 * page does not reflow under the pointer. The line is placed by counting the
 * other blocks only, which is how `DropTarget.index` counts them.
 *
 * Each block is handed what its mode reads: a height in the `natural` mode,
 * and in the `fill` mode its share and the block under it, which its bottom
 * edge shares the height with.
 */
export const BlockColumn = memoNamed<Props>('BlockColumn', (props) => {
  const { column, ids, blocks, heights, mode, shares, moving } = props;

  const fill = mode === 'fill';

  const markerAt =
    moving?.target?.column === column ? moving.target.index : undefined;

  const others = ids.filter((id) => id !== moving?.block);

  return (
    <div className={'block-column'} data-column={column}>
      {ids.map((id, index) => {
        const position = others.indexOf(id);

        const below = ids[index + 1];

        return (
          <Fragment key={id}>
            {markerAt !== undefined && position === markerAt ? (
              <div aria-hidden={'true'} className={'drop-marker'} />
            ) : undefined}

            <LayoutBlock
              column={column}
              dragging={moving?.block === id}
              height={fill ? undefined : heights[id]}
              id={id}
              next={fill ? below : undefined}
              nextShare={
                fill && below !== undefined
                  ? (shares[below] ?? DEFAULT_SHARE)
                  : undefined
              }
              share={fill ? (shares[id] ?? DEFAULT_SHARE) : undefined}
            >
              {blocks[id]}
            </LayoutBlock>
          </Fragment>
        );
      })}

      {markerAt !== undefined && markerAt >= others.length ? (
        <div aria-hidden={'true'} className={'drop-marker'} />
      ) : undefined}
    </div>
  );
});
