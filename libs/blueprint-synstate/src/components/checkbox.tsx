import { constant, type Bindable, type Child, type JSX } from 'synstate-dom';
import { classObject } from '../internal/index.mjs';

type Props = Readonly<{
  /** The text after the box, inside the `<label>`. */
  label: Child;
  checked: Bindable<boolean>;
  onChange: (changed: Readonly<{ currentTarget: HTMLInputElement }>) => void;
  disabled?: Bindable<boolean>;
  /** Sits in a line with what is next to it (`bp6-inline`). */
  inline?: boolean;
  /** Classes after Blueprint's own on the `<label>`. */
  class?: string;
  /** On the `<input>`. */
  'data-e2e'?: Bindable<string | undefined>;
}>;

/**
 * Blueprint's `Checkbox`: the native checkbox, hidden, and the box Blueprint
 * draws in its place, in a `<label>` with the text.
 */
export const Checkbox = ({
  label,
  checked,
  onChange,
  disabled,
  inline = false,
  class: className,
  'data-e2e': e2e,
}: Props): JSX.Element => (
  <label
    class={classObject(
      ['bp6-control', 'bp6-checkbox', inline && 'bp6-inline', className],
      [['bp6-disabled', disabled]],
    )}
  >
    <input
      checked={checked}
      class={constant('bp6-control-input')}
      data-e2e={e2e}
      disabled={disabled}
      type={constant('checkbox')}
      onChange={onChange}
    />
    <span class={constant('bp6-control-indicator')} />
    {label}
  </label>
);
