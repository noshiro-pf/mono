import type { ComponentChildren } from 'preact';
import { memoNamed } from 'preact-utils';
import { useMemo } from 'preact/hooks';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  absentBlocks,
  columnWidths,
  shownOf,
  type BlockId,
} from '../layout.mjs';
import { layoutSignals, readerSignals } from '../store/index.mjs';
import { BlockColumn } from './block-column.js';
import { ColumnDivider } from './column-divider.js';

type Props = Readonly<{
  /** What each block holds. Where it goes is the layout's. */
  blocks: ReadonlyRecord<BlockId, ComponentChildren>;
}>;

/**
 * The page's blocks, in one column, two or three, as `layout.mts` describes.
 *
 * With more than one, the columns share the width by fractions rather than
 * percentages, so the dividers' own widths come out of every column; on a
 * screen too narrow for them, the stylesheet stacks them into one (the grid
 * template is then ignored, which is why it can be an inline style).
 *
 * A hidden block is left out of its column altogether, so the blocks around
 * it share the column as if it were not there; a column whose blocks are all
 * hidden keeps its width, empty. So is a block the repository has nothing
 * for (`absentBlocks`), without being hidden: the queue, on a repository
 * that does not run `unblock-prs`.
 *
 * In the `fill` mode the layout takes the height the page leaves it, and each
 * column shares that out among its blocks (`index.css`).
 */
export const BlockLayout = memoNamed<Props>('BlockLayout', (props) => {
  const { blocks } = props;

  const layout = layoutSignals.layout.value;

  const features = readerSignals.features.value;

  const absent = useMemo(() => absentBlocks(features), [features]);

  const widths = useMemo(() => columnWidths(layout), [layout]);

  const left = useMemo(
    () => shownOf(layout, layout.left, absent),
    [layout, absent],
  );

  const middle = useMemo(
    () => shownOf(layout, layout.middle, absent),
    [layout, absent],
  );

  const right = useMemo(
    () => shownOf(layout, layout.right, absent),
    [layout, absent],
  );

  const style = useMemo(
    () =>
      widths.length > 1
        ? {
            gridTemplateColumns: widths
              .map((width) => `minmax(0, ${width}fr)`)
              .join(' auto '),
          }
        : undefined,
    [widths],
  );

  return (
    <div
      className={'block-layout'}
      data-columns={layout.columns}
      data-mode={layout.mode}
      style={style}
    >
      <BlockColumn
        blocks={blocks}
        heights={layout.heights}
        ids={left}
        mode={layout.mode}
        shares={layout.shares}
      />

      {layout.columns === 3 ? (
        <>
          <ColumnDivider line={0} />

          <BlockColumn
            blocks={blocks}
            heights={layout.heights}
            ids={middle}
            mode={layout.mode}
            shares={layout.shares}
          />
        </>
      ) : undefined}

      {layout.columns === 1 ? undefined : (
        <>
          <ColumnDivider line={layout.columns === 3 ? 1 : 0} />

          <BlockColumn
            blocks={blocks}
            heights={layout.heights}
            ids={right}
            mode={layout.mode}
            shares={layout.shares}
          />
        </>
      )}
    </div>
  );
});
