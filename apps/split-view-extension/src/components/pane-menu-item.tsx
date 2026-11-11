import { type InitializedObservable, map } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
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
    aria-pressed={item$.pipe(map((item) => item.pressed?.toString()))}
    class={item$.pipe(
      map((item) =>
        item.tone === 'warn'
          ? 'pane__menu-item pane__menu-item--warn'
          : 'pane__menu-item',
      ),
    )}
    disabled={item$.pipe(map((item) => item.disabled ?? false))}
    title={item$.pipe(map((item) => item.title))}
    type={constant('button')}
    onClick={() => {
      onChosen(Optional.unwrap(item$.getSnapshot()).choice);
    }}
  >
    <Icon icon={item$.pipe(map((item) => item.icon))} />

    {item$.pipe(map((item) => item.label))}
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
