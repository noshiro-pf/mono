import { combine, map, type InitializedObservable } from 'synstate';
import { constant, For, type JSX } from 'synstate-dom';
import type { ReadonlyRecord } from 'ts-type-forge';
import { defaultShareOf, type BlockId, type Layout } from '../layout.mjs';
import { layoutStore } from '../store/index.mjs';
import { LayoutBlock, type BlockPlacement } from './layout-block.js';

type Props = Readonly<{
  /** The blocks drawn in the column, top down. */
  ids$: InitializedObservable<readonly BlockId[]>;
  blocks: ReadonlyRecord<BlockId, JSX.Element>;
}>;

/**
 * One column of blocks, each handed what its mode reads: a height in the
 * `natural` mode, and in the `fill` mode its share and the block under it,
 * which the line between them shares the height with.
 */
export const BlockColumn = ({ ids$, blocks }: Props): JSX.Element => (
  <div class={constant('block-column')}>
    <For items={ids$} key={(id) => id}>
      {(id$, index$) => {
        // The key is the id, so the row's id is the one it was made with.
        const id = id$.getSnapshot().value;

        const placement$ = combine([layoutStore.layout, ids$, index$]).pipe(
          map(([layout, ids, index]) => placementOf(layout, ids, index, id)),
        );

        return (
          <LayoutBlock id={id} placement$={placement$}>
            {blocks[id]}
          </LayoutBlock>
        );
      }}
    </For>
  </div>
);

const placementOf = (
  layout: Layout,
  ids: readonly BlockId[],
  index: number,
  id: BlockId,
): BlockPlacement => {
  if (layout.mode !== 'fill') {
    return {
      height: layout.heights[id],
      share: undefined,
      next: undefined,
      nextShare: undefined,
    };
  }

  const below = ids[index + 1];

  return {
    height: undefined,
    share: layout.shares[id] ?? defaultShareOf(id),
    next: below,
    nextShare:
      below === undefined
        ? undefined
        : (layout.shares[below] ?? defaultShareOf(below)),
  };
};
