import { type InitializedObservable, map } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import { nextTabFocus } from './next-tab-focus.mjs';

type Props = Readonly<{
  labels: readonly string[];
  tabIndex: InitializedObservable<number>;
  /** Called when another tab is clicked; the selected one does nothing. */
  tabIndexChange: (tabIndex: number) => void;
  /**
   * The app's own look, by part: a CSS module of these five classes. The
   * indicator is given `--tab-index` (the selected one) and `--tab-count` to
   * place itself by.
   */
  classes: MuiTabsClasses;
}>;

/**
 * MUI's `Tabs`, without the ripple: the markup and the behavior, with the look
 * left to the app, since the apps draw MUI's tabs of different versions and
 * variants.
 *
 * As in MUI and the WAI-ARIA tabs pattern, only the selected tab is in the tab
 * order (roving `tabindex`), the arrow keys, Home and End move the focus
 * between the tabs (`nextTabFocus`), and Enter or Space selects the one with
 * the focus, as a click does.
 */
export const MuiTabs = ({
  labels,
  tabIndex,
  tabIndexChange,
  classes,
}: Props): JSX.Element => (
  <div class={constant(classes.root)}>
    <div class={constant(classes.scroller)}>
      <div
        class={constant(classes.list)}
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

          const next = nextTabFocus(event.key, current, tabs.length);

          if (next === undefined) {
            return;
          }

          event.preventDefault();

          tabs[next]?.focus();
        }}
      >
        {labels.map((label, index) => (
          <button
            aria-selected={tabIndex.pipe(
              map((selected) => (selected === index ? 'true' : 'false')),
            )}
            class={constant(classes.tab)}
            data-e2e={constant(`tab-${index}`)}
            role={constant('tab')}
            tabIndex={tabIndex.pipe(
              map((selected) => (selected === index ? 0 : -1)),
            )}
            type={constant('button')}
            onClick={() => {
              // Only for a change of tab, as MUI's `onChange`.
              if (Optional.unwrap(tabIndex.getSnapshot()) !== index) {
                tabIndexChange(index);
              }
            }}
          >
            {constant(label)}
          </button>
        ))}
      </div>
      <span
        class={constant(classes.indicator)}
        style={{
          '--tab-count': constant(labels.length.toString()),
          '--tab-index': tabIndex.pipe(map((i) => i.toString())),
        }}
      />
    </div>
  </div>
);

/** The parts of {@link MuiTabs} an app styles, each a class name. */
export type MuiTabsClasses = Readonly<{
  root: string;
  scroller: string;
  list: string;
  tab: string;
  indicator: string;
}>;
