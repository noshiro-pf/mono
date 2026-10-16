import type { ComponentChildren } from 'preact';
import { memoNamed } from 'preact-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { defaultShareOf, type BlockId, type Layout } from '../layout.mjs';
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
 * which the line between them shares the height with.
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
                ? (shares[below] ?? defaultShareOf(below))
                : undefined
            }
            share={fill ? (shares[id] ?? defaultShareOf(id)) : undefined}
          >
            {blocks[id]}
          </LayoutBlock>
        );
      })}
    </div>
  );
});
