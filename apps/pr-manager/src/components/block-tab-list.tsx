import { map, type InitializedObservable } from 'synstate';
import { constant, For, type JSX } from 'synstate-dom';
import { Num } from 'ts-data-forge';
import { BLOCK_NAMES, type BlockId, type Pane } from '../layout.mjs';
import { layoutStore } from '../store/index.mjs';
import { tabIdOf, tabPanelIdOf } from './block-tab-ids.mjs';

type Props = Readonly<{
  /** The tabs drawn of a group, in order. */
  ids$: InitializedObservable<Pane>;
  /** The one shown (`selectedTabOf`). */
  selected$: InitializedObservable<BlockId | undefined>;
}>;

/**
 * The tabs of a group of blocks sharing one place in a column (`layout.mts`),
 * above what they hold (`block-tab-panels.tsx`). Which one is shown is the
 * layout's, so a link opens on the same tab.
 *
 * The WAI-ARIA tabs pattern, selection following focus: the shown tab is the
 * one Tab stops at, and the arrow keys, Home and End move to another and show
 * it.
 */
export const BlockTabList = ({ ids$, selected$ }: Props): JSX.Element => {
  const onKeyDown = (
    pressed: KeyboardEvent & Readonly<{ currentTarget: HTMLButtonElement }>,
  ): void => {
    const ids = ids$.getSnapshot().value;

    const index = ids.findIndex(
      (id) => tabIdOf(id) === pressed.currentTarget.id,
    );

    const at = targetIndex(pressed.key, index, ids.length);

    if (at === undefined) {
      return;
    }

    // Consumed even when it goes nowhere, so that Home and End do not scroll.
    pressed.preventDefault();

    const target = ids.at(at);

    if (target === undefined || target === ids[index]) {
      return;
    }

    layoutStore.selectTab(target);

    document.querySelector<HTMLElement>(`#${tabIdOf(target)}`)?.focus();
  };

  return (
    <div
      aria-label={constant('Blocks in this place')}
      class={constant('block-tabs')}
      role={constant('tablist')}
    >
      <For items={ids$} key={(id) => id}>
        {(id$) => {
          // The key is the id, so the row's id is the one it was made with.
          const id = id$.getSnapshot().value;

          return (
            <button
              aria-controls={constant(tabPanelIdOf(id))}
              aria-selected={selected$.pipe(map((selected) => selected === id))}
              class={constant('block-tab')}
              id={constant(tabIdOf(id))}
              role={constant('tab')}
              tabIndex={selected$.pipe(
                map((selected) => (selected === id ? 0 : -1)),
              )}
              type={constant('button')}
              onClick={() => {
                layoutStore.selectTab(id);
              }}
              onKeyDown={onKeyDown}
            >
              {constant(BLOCK_NAMES[id])}
            </button>
          );
        }}
      </For>
    </div>
  );
};

/** Where a key moves from the tab at `index` of `count`; none for another key. */
const targetIndex = (
  key: string,
  index: number,
  count: number,
): number | undefined => {
  if (!Num.isNonZero(count)) {
    return undefined;
  }

  switch (key) {
    case 'ArrowLeft':
      return Num.rem(index - 1 + count, count);

    case 'ArrowRight':
      return Num.rem(index + 1, count);

    case 'Home':
      return 0;

    case 'End':
      return count - 1;

    default:
      return undefined;
  }
};
