import {
  constant,
  If,
  isImeKeyDown,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import {
  arrowDirection,
  classObject,
  sizeClass,
  stepAround,
} from '../internal/index.mjs';
import type { Size } from './intent.mjs';

/** One tab of {@link Tabs}. */
export type TabProps<T extends string> = Readonly<
  {
    id: T;
    title: string;
    /** On the tab's title. */
    'data-e2e'?: string;
  } & (
    | {
        /**
         * Mounted while the tab is chosen. Left out, the tab is a title alone,
         * as in a navbar whose content is drawn elsewhere.
         */
        panel?: JSX.Element;
        panelId?: undefined;
      }
    | {
        panel?: undefined;
        /**
         * For a title alone: the `id` of the element, drawn elsewhere, that the
         * tab controls, written as its `aria-controls`. Give that element
         * `role="tabpanel"`, and `aria-labelledby` the chosen tab's
         * {@link tabTitleId}.
         */
        panelId: string;
      }
  )
>;

type Props<T extends string> = Readonly<{
  /** Makes the ids of the titles and panels, which say which is whose. */
  id: string;
  tabs: readonly TabProps<T>[];
  selectedTabId: Bindable<T>;
  onChange: (tabId: T) => void;
  size?: Size;
  /** Takes the width of its container (`bp6-fill`). */
  fill?: boolean;
  /** Classes after Blueprint's own. */
  class?: string;
  /** On the tab list. */
  'aria-label'?: Bindable<string>;
}>;

/**
 * Blueprint's `Tabs`, with `renderActiveTabPanelOnly`: the titles in
 * `div.bp6-tab-list`, and the chosen tab's panel alone, built when it is chosen
 * and disposed when another is. No sliding indicator (`animate` off):
 * the chosen title is underlined by Blueprint's style sheet.
 *
 * Only the chosen title is in the tab order, or the first when no tab is
 * chosen. The arrow keys move the focus between the titles, wrapping round, and
 * Enter or Space chooses the one focused, as Blueprint's do.
 */
export const Tabs = <T extends string>({
  id,
  tabs,
  selectedTabId,
  onChange,
  size = 'medium',
  fill = false,
  class: className,
  'aria-label': ariaLabel,
}: Props<T>): JSX.Element => {
  // The one title in the tab order: the chosen one, or the first when no tab is
  // chosen. Kept apart from SegmentedControl's tab stop on purpose: this
  // library's `TabProps` has no `disabled`, so no title is checked for one. A
  // `disabled` added there needs the check on the chosen title and on the
  // fallback alike, as SegmentedControl has.
  const tabStop = mapBindable(selectedTabId, (t) =>
    tabs.some((x) => x.id === t) ? t : tabs[0]?.id,
  );

  return (
    <div class={classObject(['bp6-tabs', fill && 'bp6-fill', className])}>
      <div
        aria-label={ariaLabel}
        class={classObject(['bp6-tab-list', sizeClass(size)])}
        role={constant('tablist')}
        onKeyDown={(event) => {
          if (isImeKeyDown(event)) {
            return;
          }

          const titles = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]'),
          );

          const focused =
            document.activeElement instanceof HTMLElement
              ? titles.indexOf(document.activeElement)
              : -1;

          if (focused < 0) {
            return;
          }

          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();

            titles[focused]?.click();

            return;
          }

          const direction = arrowDirection(event.key);

          if (direction === undefined) {
            return;
          }

          event.preventDefault();

          titles[stepAround(focused, direction, titles.length)]?.focus();
        }}
      >
        {tabs.map((tab) => {
          const selected = mapBindable(selectedTabId, (t) => t === tab.id);

          // A title alone controls the panel it names, if any, which it neither
          // shows nor hides, so it does not say whether it is expanded.
          const controlsPanel = tab.panel !== undefined;

          const controls = controlsPanel ? panelId(id, tab.id) : tab.panelId;

          return (
            <div
              aria-controls={
                controls === undefined ? undefined : constant(controls)
              }
              aria-disabled={constant('false')}
              aria-expanded={controlsPanel ? selected : undefined}
              aria-selected={selected}
              class={constant('bp6-tab')}
              data-e2e={
                tab['data-e2e'] === undefined
                  ? undefined
                  : constant(tab['data-e2e'])
              }
              data-tab-id={constant<string>(tab.id)}
              id={constant(tabTitleId(id, tab.id))}
              role={constant('tab')}
              tabIndex={mapBindable(tabStop, (stop) =>
                stop === tab.id ? 0 : -1,
              )}
              onClick={() => {
                onChange(tab.id);
              }}
            >
              {constant(tab.title)}
            </div>
          );
        })}
      </div>
      {tabs.map((tab) =>
        tab.panel === undefined ? (
          []
        ) : (
          <If
            cond={mapBindable(selectedTabId, (t) => t === tab.id)}
            then={
              <div
                aria-hidden={constant('false')}
                aria-labelledby={constant(tabTitleId(id, tab.id))}
                class={constant('bp6-tab-panel')}
                id={constant(panelId(id, tab.id))}
                role={constant('tabpanel')}
              >
                {tab.panel}
              </div>
            }
          />
        ),
      )}
    </div>
  );
};

/**
 * The `id` of a tab's title, as Blueprint makes it from the `id` of its
 * {@link Tabs} and its own: what a panel drawn elsewhere is labelled by.
 */
export const tabTitleId = (tabsId: string, tabId: string): string =>
  `bp6-tab-title_${tabsId}_${tabId}` as const;

/** Blueprint's id for a tab's panel. */
const panelId = (parentId: string, tabId: string): string =>
  `bp6-tab-panel_${parentId}_${tabId}` as const;
