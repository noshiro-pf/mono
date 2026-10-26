import {
  constant,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { arrowDirection, classObject, sizeClass } from '../internal/index.mjs';
import type { Size } from './intent.mjs';

/** One tab of {@link Tabs}. */
export type TabProps<T extends string> = Readonly<{
  id: T;
  title: string;
  /** Mounted while the tab is chosen. */
  panel: JSX.Element;
  /** On the tab's title. */
  'data-e2e'?: string;
}>;

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
 * `div.bp6-tab-list`, and the chosen tab's panel alone, built when it is
 * chosen and disposed when another is. No sliding indicator (`animate` off):
 * the chosen title is underlined by Blueprint's style sheet.
 *
 * Only the chosen title is in the tab order. The arrow keys move the focus
 * between the titles, wrapping round, and Enter or Space chooses the one
 * focused, as Blueprint's do.
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
}: Props<T>): JSX.Element => (
  <div class={classObject(['bp6-tabs', fill && 'bp6-fill', className])}>
    <div
      aria-label={ariaLabel}
      class={classObject(['bp6-tab-list', sizeClass(size)])}
      role={constant('tablist')}
      onKeyDown={(event) => {
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

        titles[(focused + direction + titles.length) % titles.length]?.focus();
      }}
    >
      {tabs.map((tab) => {
        const selected = mapBindable(selectedTabId, (t) => t === tab.id);

        return (
          <div
            aria-controls={constant(panelId(id, tab.id))}
            aria-disabled={constant('false')}
            aria-expanded={mapBindable(selected, String)}
            aria-selected={mapBindable(selected, String)}
            class={constant('bp6-tab')}
            data-e2e={
              tab['data-e2e'] === undefined
                ? undefined
                : constant(tab['data-e2e'])
            }
            data-tab-id={constant<string>(tab.id)}
            id={constant(titleId(id, tab.id))}
            role={constant('tab')}
            tabIndex={mapBindable(selected, (s) => (s ? 0 : -1))}
            onClick={() => {
              onChange(tab.id);
            }}
          >
            {constant(tab.title)}
          </div>
        );
      })}
    </div>
    {tabs.map((tab) => (
      <If
        cond={mapBindable(selectedTabId, (t) => t === tab.id)}
        then={
          <div
            aria-hidden={constant('false')}
            aria-labelledby={constant(titleId(id, tab.id))}
            class={constant('bp6-tab-panel')}
            id={constant(panelId(id, tab.id))}
            role={constant('tabpanel')}
          >
            {tab.panel}
          </div>
        }
      />
    ))}
  </div>
);

/** Blueprint's ids for a tab's title and panel. */
const titleId = (parentId: string, tabId: string): string =>
  `bp6-tab-title_${parentId}_${tabId}` as const;

const panelId = (parentId: string, tabId: string): string =>
  `bp6-tab-panel_${parentId}_${tabId}` as const;
