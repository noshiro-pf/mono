import type { InitializedObservable } from 'synstate';
import { constant, inlineMap, type JSX } from 'synstate-dom';
import { Num } from 'ts-data-forge';
import * as styles from './mui-tabs.module.css';

type Props = Readonly<{
  labels: readonly string[];
  tabIndex: InitializedObservable<number>;
  /** Called when another tab is clicked; the selected one does nothing. */
  tabIndexChange: (tabIndex: number) => void;
}>;

/**
 * MUI's `Tabs` with `variant="fullWidth"`, in the default theme's look and
 * without the ripple. The tabs share the width equally, so the indicator is
 * placed by the selected index alone. As in MUI, the arrow keys, Home and End
 * move the focus between the tabs, and Enter or Space selects one.
 */
export const MuiTabs = ({
  labels,
  tabIndex,
  tabIndexChange,
}: Props): JSX.Element => (
  <div class={constant(styles.root)}>
    <div class={constant(styles.scroller)}>
      <div
        class={constant(styles.list)}
        role={constant('tablist')}
        onKeyDown={(event) => {
          const tabs = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              ':scope > [role="tab"]',
            ),
          );

          // The tab with the focus: the key went to it.
          const current = tabs.findIndex((tab) =>
            tab.contains(document.activeElement),
          );

          const next = nextFocus(event.key, current, tabs.length);

          if (next === undefined) {
            return;
          }

          event.preventDefault();

          tabs[next]?.focus();
        }}
      >
        {labels.map((label, index) => (
          <button
            aria-selected={inlineMap(tabIndex, (selected) =>
              selected === index ? 'true' : 'false',
            )}
            class={constant(styles.tab)}
            role={constant('tab')}
            tabIndex={inlineMap(tabIndex, (selected) =>
              selected === index ? 0 : -1,
            )}
            type={constant('button')}
            onClick={() => {
              // Only for a change of tab, as MUI's `onChange`.
              if (tabIndex.getSnapshot().value !== index) {
                tabIndexChange(index);
              }
            }}
          >
            {constant(label)}
          </button>
        ))}
      </div>
      <span
        class={constant(styles.indicator)}
        style={{
          '--tab-count': constant(labels.length.toString()),
          '--tab-index': inlineMap(tabIndex, (i) => i.toString()),
        }}
      />
    </div>
  </div>
);

/** The tab the key moves the focus to, from `current` of `count`. */
const nextFocus = (
  key: string,
  current: number,
  count: number,
): number | undefined => {
  if (!Num.isNonZero(count)) {
    return undefined;
  }

  switch (key) {
    case 'ArrowRight':
      return Num.rem(current + 1, count);

    case 'ArrowLeft':
      return Num.rem(current - 1 + count, count);

    case 'Home':
      return 0;

    case 'End':
      return count - 1;

    default:
      return undefined;
  }
};
