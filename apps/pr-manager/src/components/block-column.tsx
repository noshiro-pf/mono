import { derive, map, type InitializedObservable } from 'synstate';
import { constant, For, If, type JSX } from 'synstate-dom';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  defaultShareOf,
  selectedTabOf,
  type BlockId,
  type Layout,
  type ShownPane,
} from '../layout.mjs';
import { layoutStore } from '../store/index.mjs';
import { BlockTabList } from './block-tab-list.js';
import { BlockTabPanels } from './block-tab-panels.js';
import { LayoutBlock, type BlockPlacement } from './layout-block.js';

type Props = Readonly<{
  /**
   * The panes drawn in the column, top down: a block, or the blocks of a group
   * of tabs (`shownPanesOf`).
   */
  panes$: InitializedObservable<readonly ShownPane[]>;
  blocks: ReadonlyRecord<BlockId, JSX.Element>;
}>;

/**
 * One column of blocks, each handed what its mode reads: a height in the
 * `natural` mode, and in the `fill` mode its share and the block under it,
 * which the line between them shares the height with.
 *
 * A group of tabs is one place in the column, sized by the first block of the
 * group, drawn or not, and holds every tab's block, showing one; with one block
 * drawn it has no tabs (`block-tab-list.tsx`). A place is keyed by that first
 * block, so hiding or showing another block of the group leaves the blocks
 * drawn mounted as they were.
 */
export const BlockColumn = ({ panes$, blocks }: Props): JSX.Element => {
  const keys$ = panes$.pipe(map((panes) => panes.map(({ key }) => key)));

  return (
    <div class={constant('block-column')}>
      <For items={panes$} key={({ key }) => key}>
        {(pane$, index$) => {
          // The key is the pane's first block, so the row's is the one it was
          // made with.
          const id = pane$.getSnapshot().value.key;

          const ids$ = pane$.pipe(map(({ ids }) => ids));

          const placement$ = derive(
            [layoutStore.layout, keys$, index$],
            (layout, keys, index) => placementOf(layout, keys, index, id),
          );

          const selected$ = derive([layoutStore.layout, ids$], (layout, ids) =>
            selectedTabOf(layout, ids),
          );

          return (
            <LayoutBlock
              head={
                <If
                  cond={ids$.pipe(map((ids) => ids.length > 1))}
                  then={<BlockTabList ids$={ids$} selected$={selected$} />}
                />
              }
              id={id}
              placement$={placement$}
            >
              <BlockTabPanels
                blocks={blocks}
                ids$={ids$}
                selected$={selected$}
              />
            </LayoutBlock>
          );
        }}
      </For>
    </div>
  );
};

const placementOf = (
  layout: Layout,
  keys: readonly BlockId[],
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

  const below = keys[index + 1];

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
