import { map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { Icon, type IconName } from './icon.js';

/** What a row of a pane's menu does, which also tells the rows apart. */
export type PaneMenuChoice =
  | 'clear-workers'
  | 'open-in-tab'
  | 'split-column'
  | 'split-row'
  | 'toggle-always-clear'
  | 'toggle-sandbox';

export type PaneMenuItem = Readonly<{
  choice: PaneMenuChoice;
  icon: IconName;
  label: string;
  title: string;
  disabled: boolean;
  /** `undefined` for an item that is not a toggle. */
  pressed: boolean | undefined;
  warn: boolean;
}>;

export const PaneMenuRow = ({
  item$,
  onChosen,
}: Readonly<{
  item$: InitializedObservable<PaneMenuItem>;
  onChosen: (choice: PaneMenuChoice) => void;
}>): JSX.Element => (
  <button
    aria-pressed={item$.pipe(map((item) => item.pressed?.toString()))}
    class={item$.pipe(
      map((item) =>
        item.warn ? 'pane__menu-item pane__menu-item--warn' : 'pane__menu-item',
      ),
    )}
    disabled={item$.pipe(map((item) => item.disabled))}
    role={constant('menuitem')}
    title={item$.pipe(map((item) => item.title))}
    type={constant('button')}
    onClick={() => {
      onChosen(item$.getSnapshot().value.choice);
    }}
  >
    <Icon icon={item$.pipe(map((item) => item.icon))} />
    {item$.pipe(map((item) => item.label))}
  </button>
);
