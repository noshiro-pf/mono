import { map, type InitializedObservable } from 'synstate';
import { constant, For, type JSX } from 'synstate-dom';
import { Num } from 'ts-data-forge';
import {
  BLOCK_NAMES,
  type BlockId,
  type DrawnGroup,
} from '../../domain/index.mjs';

type Props = Readonly<{
  group: InitializedObservable<DrawnGroup>;
  select: (id: BlockId) => void;
}>;

/**
 * The tabs of a group (spec §6): the WAI-ARIA tabs pattern with selection
 * following focus. Tab stops at the shown tab; the arrow keys, Home and End
 * move to another and show it.
 */
export const TabList = ({ group, select }: Props): JSX.Element => (
  <div
    aria-label={constant('Blocks in this place')}
    class={constant('tab-list')}
    role={constant('tablist')}
    onKeyDown={(event) => {
      const { tabs, shown } = group.getSnapshot().value;

      const count = tabs.length;

      if (!Num.isNonZero(count)) {
        return;
      }

      const at = tabs.indexOf(shown);

      const target =
        event.key === 'ArrowRight'
          ? tabs[Num.rem(at + 1, count)]
          : event.key === 'ArrowLeft'
            ? tabs[Num.rem(at - 1 + count, count)]
            : event.key === 'Home'
              ? tabs[0]
              : event.key === 'End'
                ? tabs.at(-1)
                : undefined;

      if (target === undefined) {
        return;
      }

      event.preventDefault();

      select(target);

      queueMicrotask(() => {
        document
          .querySelector<HTMLElement>(`#tab-${CSS.escape(target)}`)
          ?.focus();
      });
    }}
  >
    <For items={group.pipe(map((g) => g.tabs))} key={(id) => id}>
      {(id$) => {
        const id = id$.getSnapshot().value;

        const selected = group.pipe(map((g) => g.shown === id));

        return (
          <button
            aria-controls={constant(`block-${id}`)}
            aria-selected={selected.pipe(map((s) => s.toString()))}
            class={constant('tab')}
            id={constant(`tab-${id}`)}
            role={constant('tab')}
            tabIndex={selected.pipe(map((s) => (s ? 0 : -1)))}
            type={constant('button')}
            onClick={() => {
              select(id);
            }}
          >
            {constant(BLOCK_NAMES[id])}
          </button>
        );
      }}
    </For>
  </div>
);
