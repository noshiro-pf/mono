import { type ComponentChildren } from 'preact';
import { memoNamed } from 'preact-utils';
import { useMemo } from 'preact/hooks';
import { type ReadonlyRecord } from 'ts-type-forge';
import { type BlockId } from '../layout.mjs';
import { layoutSignals } from '../store/index.mjs';
import { BlockColumn } from './block-column.js';
import { ColumnDivider } from './column-divider.js';

type Props = Readonly<{
  /** What each block holds. Where it goes is the layout's. */
  blocks: ReadonlyRecord<BlockId, ComponentChildren>;
}>;

/**
 * The page's blocks, in one column or two, as `layout.mts` describes.
 *
 * With two, the columns share the width by fractions rather than percentages,
 * so the divider's own width comes out of both sides; on a screen too narrow
 * for two, the stylesheet stacks them into one (the grid template is then
 * ignored, which is why it can be an inline style).
 */
export const BlockLayout = memoNamed<Props>('BlockLayout', (props) => {
  const { blocks } = props;

  const layout = layoutSignals.layout.value;

  const moving = layoutSignals.moving.value;

  const style = useMemo(
    () =>
      layout.columns === 2
        ? {
            gridTemplateColumns: `minmax(0, ${layout.split}fr) auto minmax(0, ${100 - layout.split}fr)`,
          }
        : undefined,
    [layout.columns, layout.split],
  );

  return (
    <div
      className={'block-layout'}
      data-columns={layout.columns}
      data-moving={moving !== undefined}
      style={style}
    >
      <BlockColumn
        blocks={blocks}
        column={0}
        heights={layout.heights}
        ids={layout.left}
        moving={moving}
      />

      {layout.columns === 2 ? (
        <>
          <ColumnDivider />

          <BlockColumn
            blocks={blocks}
            column={1}
            heights={layout.heights}
            ids={layout.right}
            moving={moving}
          />
        </>
      ) : undefined}
    </div>
  );
});
