import { constant, type Bindable, type Child, type JSX } from 'synstate-dom';
import { classObject } from '../internal/index.mjs';

type Props = Readonly<{
  /** The text after the switch, inside the `<label>`; none when left out. */
  label?: Child;
  checked: Bindable<boolean>;
  onChange: (changed: Readonly<{ currentTarget: HTMLInputElement }>) => void;
  disabled?: Bindable<boolean>;
  /** Sits in a line with what is next to it (`bp6-inline`). */
  inline?: boolean;
  /** Classes after Blueprint's own on the `<label>`. */
  class?: string;
  /** On the `<input>`: what it is called where there is no `label`. */
  'aria-label'?: Bindable<string>;
  /** On the `<input>`. */
  'data-e2e'?: Bindable<string | undefined>;
}>;

/**
 * Blueprint's `Switch`: a checkbox drawn as a toggle, `label.bp6-switch` round
 * the native input, hidden, and the indicator Blueprint draws in its place.
 */
export const Switch = ({
  label,
  checked,
  onChange,
  disabled,
  inline = false,
  class: className,
  'aria-label': ariaLabel,
  'data-e2e': e2e,
}: Props): JSX.Element => (
  <label
    class={classObject(
      ['bp6-control', 'bp6-switch', inline && 'bp6-inline', className],
      [['bp6-disabled', disabled]],
    )}
  >
    <input
      aria-label={ariaLabel}
      checked={checked}
      class={constant('bp6-control-input')}
      data-e2e={e2e}
      disabled={disabled}
      type={constant('checkbox')}
      onChange={onChange}
    />
    <span class={constant('bp6-control-indicator')} />
    {label ?? []}
  </label>
);
