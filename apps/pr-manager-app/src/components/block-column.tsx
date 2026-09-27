import { Fragment, type ComponentChildren } from 'preact';
import { memoNamed } from 'preact-utils';
import { type ReadonlyRecord } from 'ts-type-forge';
import { type BlockId, type ColumnIndex, type Layout } from '../layout.mjs';
import { type Moving } from '../store/index.mjs';
import { LayoutBlock } from './layout-block.js';

type Props = Readonly<{
  column: ColumnIndex;
  ids: readonly BlockId[];
  blocks: ReadonlyRecord<BlockId, ComponentChildren>;
  heights: Layout['heights'];
  moving: Moving | undefined;
}>;

/**
 * One column of blocks, and — while a block is dragged over it — the line
 * where it would land.
 *
 * The dragged block stays where it was, dimmed, until it is dropped, so the
 * page does not reflow under the pointer. The line is placed by counting the
 * other blocks only, which is how `DropTarget.index` counts them.
 */
export const BlockColumn = memoNamed<Props>('BlockColumn', (props) => {
  const { column, ids, blocks, heights, moving } = props;

  const markerAt =
    moving?.target?.column === column ? moving.target.index : undefined;

  const others = ids.filter((id) => id !== moving?.block);

  return (
    <div className={'block-column'} data-column={column}>
      {ids.map((id) => {
        const position = others.indexOf(id);

        return (
          <Fragment key={id}>
            {markerAt !== undefined && position === markerAt ? (
              <div aria-hidden={'true'} className={'drop-marker'} />
            ) : undefined}

            <LayoutBlock
              column={column}
              dragging={moving?.block === id}
              height={heights[id]}
              id={id}
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
