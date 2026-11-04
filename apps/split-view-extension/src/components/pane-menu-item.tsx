import type { InitializedObservable } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';
import { Icon, type IconName } from './icon.js';

/** One row of a pane's menu. `onChosen` is told which row was chosen. */
export const PaneMenuItem = ({
  item$,
  onChosen,
}: Readonly<{
  item$: InitializedObservable<PaneMenuAction>;
  onChosen: (choice: PaneMenuChoice) => void;
}>): JSX.Element => (
  <button
    aria-pressed={view(item$, (item) => item.pressed?.toString())}
    class={view(item$, (item) =>
      item.tone === 'warn'
        ? 'pane__menu-item pane__menu-item--warn'
        : 'pane__menu-item',
    )}
    disabled={view(item$, (item) => item.disabled ?? false)}
    title={view(item$, (item) => item.title)}
    type={constant('button')}
    onClick={() => {
      onChosen(item$.getSnapshot().value.choice);
    }}
  >
    <Icon icon={view(item$, (item) => item.icon)} />

    {view(item$, (item) => item.label)}
  </button>
);

/** What a menu row does, which is also what tells the rows apart. */
export type PaneMenuChoice =
  | 'clear-service-workers'
  | 'toggle-always-clear'
  | 'open-externally'
  | 'toggle-sandbox'
  | 'split-row'
  | 'split-column';

/** One row of a pane's menu. */
export type PaneMenuAction = Readonly<{
  choice: PaneMenuChoice;
  icon: IconName;
  label: string;
  title: string;
  disabled?: boolean;
  pressed?: boolean;
  tone?: 'warn';
}>;
