import { constant, type Bindable, type JSX } from 'synstate-dom';
import { classObject, intentClass, sizeClass } from '../internal/index.mjs';
import type { Intent, Size } from './intent.mjs';

type Props = Readonly<{
  value: Bindable<string>;
  /** Called when the value is committed: on blur, or on Enter. */
  onChange?: (changed: Readonly<{ currentTarget: HTMLInputElement }>) => void;
  /** Called on every keystroke. */
  onInput?: (changed: Readonly<{ currentTarget: HTMLInputElement }>) => void;
  type?: 'email' | 'month' | 'number' | 'password' | 'search' | 'text' | 'url';
  /** For `type="number"`: the step, or `any`. */
  step?: string;
  placeholder?: Bindable<string>;
  disabled?: Bindable<boolean>;
  readOnly?: Bindable<boolean>;
  intent?: Intent;
  size?: Size;
  /** Takes the width of its container (`bp6-fill`). */
  fill?: boolean;
  /** Classes after Blueprint's own on the wrapper. */
  class?: string;
  id?: string;
  'aria-label'?: Bindable<string>;
  'data-e2e'?: Bindable<string | undefined>;
}>;

/**
 * Blueprint's `InputGroup`: `input.bp6-input` in `div.bp6-input-group`, which
 * carries the modifier classes. No icons or elements beside the input.
 *
 * Unlike React's `onChange`, synstate-dom's is the DOM's `change`, which fires
 * when the value is committed; `onInput` is the one for every keystroke.
 */
export const InputGroup = ({
  value,
  onChange,
  onInput,
  type = 'text',
  step,
  placeholder,
  disabled,
  readOnly,
  intent = 'none',
  size = 'medium',
  fill = false,
  class: className,
  id,
  'aria-label': ariaLabel,
  'data-e2e': e2e,
}: Props): JSX.Element => (
  <div
    class={classObject(
      [
        'bp6-input-group',
        intentClass(intent),
        sizeClass(size),
        fill && 'bp6-fill',
        className,
      ],
      [
        ['bp6-disabled', disabled],
        ['bp6-read-only', readOnly],
      ],
    )}
  >
    <input
      aria-label={ariaLabel}
      class={constant('bp6-input')}
      data-e2e={e2e}
      disabled={disabled}
      id={id === undefined ? undefined : constant(id)}
      placeholder={placeholder}
      readOnly={readOnly}
      step={step === undefined ? undefined : constant(step)}
      type={constant(type)}
      value={value}
      onChange={onChange}
      onInput={onInput}
    />
  </div>
);
