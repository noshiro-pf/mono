import { type InitializedObservable, map } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import * as styles from './mui-tabs.module.css';

type Props = Readonly<{
  labels: readonly string[];
  tabIndex: InitializedObservable<number>;
  /** Called when another tab is clicked; the selected one does nothing. */
  tabIndexChange: (tabIndex: number) => void;
}>;

/**
 * MUI's scrollable `Tabs` in the default theme's look, without the ripple.
 * Every tab has the same width, which the stylesheet sets, so the indicator is
 * placed by the selected index alone.
 */
export const MuiTabs = ({
  labels,
  tabIndex,
  tabIndexChange,
}: Props): JSX.Element => (
  <div class={constant(styles.root)}>
    <div class={constant(styles.scroller)}>
      <div class={constant(styles.flexContainer)} role={constant('tablist')}>
        {labels.map((label, index) => (
          <button
            aria-selected={tabIndex.pipe(
              map((selected) => (selected === index ? 'true' : 'false')),
            )}
            class={constant(styles.tab)}
            data-e2e={constant(`tab-${index}`)}
            role={constant('tab')}
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
        style={{ '--tab-index': tabIndex.pipe(map((i) => i.toString())) }}
      />
    </div>
  </div>
);
