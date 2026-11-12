import { derive, map, type InitializedObservable } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  absentBlocks,
  columnWidths,
  shownPanesOf,
  type BlockId,
  type Layout,
  type ShownPane,
} from '../layout.mjs';
import { layoutStore, reader } from '../store/index.mjs';
import { BlockColumn } from './block-column.js';
import { ColumnDivider } from './column-divider.js';

type Props = Readonly<{
  /** What each block holds. Where it goes is the layout's. */
  blocks: ReadonlyRecord<BlockId, JSX.Element>;
}>;

/**
 * The page's blocks, in one column, two or three, as `layout.mts` describes.
 *
 * With more than one, the columns share the width by fractions rather than
 * percentages, so the dividers' own widths come out of every column; on a
 * screen too narrow for them, the stylesheet stacks them into one (the grid
 * template is then ignored, which is why it can be an inline style).
 *
 * A hidden block is left out of its column altogether, so the blocks around it
 * share the column as if it were not there; a column whose blocks are all
 * hidden keeps its width, empty. So is a block the repository has nothing for
 * (`absentBlocks`), without being hidden: the queue, on a repository that does
 * not run `unblock-prs`.
 *
 * A group of tabs takes one place in its column, as one block does
 * (`block-column.tsx`).
 *
 * In the `fill` mode the layout takes the height the page leaves it, and each
 * column shares that out among its blocks (`index.css`).
 *
 * A drag changes the layout many times a second, and what it changes is a width
 * or a height: the columns keep their blocks, each block its contents, and only
 * the styles bound to the layout are rewritten.
 */
export const BlockLayout = ({ blocks }: Props): JSX.Element => {
  const layout$ = layoutStore.layout;

  const absent$ = reader.features.pipe(map(absentBlocks));

  const shownIn = (
    column: (layout: Layout) => readonly BlockId[],
  ): InitializedObservable<readonly ShownPane[]> =>
    derive([layout$, absent$], (layout, absent) =>
      shownPanesOf(layout, column(layout), absent),
    );

  return (
    <div
      class={constant('block-layout')}
      data-columns={layout$.pipe(map(({ columns }) => columns.toString()))}
      data-mode={layout$.pipe(map(({ mode }) => mode))}
      style={layout$.pipe(map(gridOf))}
    >
      <BlockColumn blocks={blocks} panes$={shownIn(({ left }) => left)} />

      <If
        cond={layout$.pipe(map(({ columns }) => columns === 3))}
        then={
          <>
            <ColumnDivider position={'first'} />

            <BlockColumn
              blocks={blocks}
              panes$={shownIn(({ middle }) => middle)}
            />
          </>
        }
      />

      <If
        cond={layout$.pipe(map(({ columns }) => columns !== 1))}
        then={
          <>
            <ColumnDivider position={'last'} />

            <BlockColumn
              blocks={blocks}
              panes$={shownIn(({ right }) => right)}
            />
          </>
        }
      />
    </div>
  );
};

const gridOf = (layout: Layout): string => {
  const widths = columnWidths(layout);

  return widths.length > 1
    ? `grid-template-columns: ${widths
        .map((width) => `minmax(0, ${width}fr)`)
        .join(' auto ')}`
    : '';
};
