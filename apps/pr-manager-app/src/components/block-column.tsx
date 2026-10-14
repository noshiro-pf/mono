import type { ComponentChildren } from 'preact';
import { memoNamed } from 'preact-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { DEFAULT_SHARE, type BlockId, type Layout } from '../layout.mjs';
import { LayoutBlock } from './layout-block.js';

type Props = Readonly<{
  ids: readonly BlockId[];
  blocks: ReadonlyRecord<BlockId, ComponentChildren>;
  heights: Layout['heights'];
  mode: Layout['mode'];
  shares: Layout['shares'];
}>;

/**
 * One column of blocks, each handed what its mode reads: a height in the
 * `natural` mode, and in the `fill` mode its share and the block under it,
 * which its bottom edge shares the height with.
 */
export const BlockColumn = memoNamed<Props>('BlockColumn', (props) => {
  const { ids, blocks, heights, mode, shares } = props;

  const fill = mode === 'fill';

  return (
    <div className={'block-column'}>
      {ids.map((id, index) => {
        const below = ids[index + 1];

        return (
          <LayoutBlock
            key={id}
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
        );
      })}
    </div>
  );
});
