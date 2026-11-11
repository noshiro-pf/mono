import { derive, map, type InitializedObservable } from 'synstate';
import { constant, For, type JSX } from 'synstate-dom';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { BlockId, Pane } from '../layout.mjs';
import { tabIdOf, tabPanelIdOf } from './block-tab-ids.mjs';

type Props = Readonly<{
  /** The blocks drawn of a place, in order: one, or the tabs of a group. */
  ids$: InitializedObservable<Pane>;
  /** The one shown (`selectedTabOf`). */
  selected$: InitializedObservable<BlockId | undefined>;
  blocks: ReadonlyRecord<BlockId, JSX.Element>;
}>;

/**
 * What a place in a column holds: each of its blocks drawn, in a box of its
 * own, and all but the one shown hidden, so that going back to a tab finds it
 * as it was left. Each box is a tab panel only while there are tabs
 * (`block-tab-list.tsx`); a block on its own is a box and nothing more.
 */
export const BlockTabPanels = ({
  ids$,
  selected$,
  blocks,
}: Props): JSX.Element => {
  const tabbed$ = ids$.pipe(map((ids) => ids.length > 1));

  return (
    <For items={ids$} key={(id) => id}>
      {(id$) => {
        // The key is the id, so the row's id is the one it was made with.
        const id = id$.getSnapshot().value;

        return (
          <div
            aria-labelledby={tabbed$.pipe(
              map((tabbed) => (tabbed ? tabIdOf(id) : undefined)),
            )}
            class={constant('block-tab-panel')}
            hidden={derive(
              [tabbed$, selected$],
              (tabbed, selected) => tabbed && selected !== id,
            )}
            id={constant(tabPanelIdOf(id))}
            role={tabbed$.pipe(
              map((tabbed) => (tabbed ? 'tabpanel' : undefined)),
            )}
          >
            {blocks[id]}
          </div>
        );
      }}
    </For>
  );
};
