import {
  constant,
  toObservable,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';
import { createAfterUpdate, subscribeInScope } from '../internal/index.mjs';
import { Icon } from './icon.js';

type Props = Readonly<{
  value: Bindable<string>;
  onChange: (changed: Readonly<{ currentTarget: HTMLSelectElement }>) => void;
  /** The `<option>`s. */
  children: Child;
  /** Takes the width of its container (`bp6-fill`). */
  fill?: boolean;
  /** No border or background until hovered (`bp6-minimal`). */
  minimal?: boolean;
  /** Classes after Blueprint's own on the wrapper. */
  class?: string;
  name?: string;
  disabled?: Bindable<boolean>;
  /** The style of the caret, which the date picker moves beside its text. */
  iconStyle?: Bindable<string>;
  /** Called with the `<select>`, as a `ref` is. */
  selectRef?: (select: HTMLSelectElement) => void;
  'aria-label'?: Bindable<string>;
  'aria-describedby'?: Bindable<string | undefined>;
  'aria-invalid'?: Bindable<string>;
  'data-e2e'?: Bindable<string>;
}>;

/**
 * Blueprint's `HTMLSelect`: a native `<select>` in the wrapper that carries the
 * modifier classes, with the double caret that says it opens.
 *
 * The wrapper is a `<span>` where Blueprint has a `<div>`, so that it may sit
 * inside a `<label>`; the styles hang off the classes alone.
 *
 * The value is written again once each update has finished, when the options it
 * may have brought are in place: an option and the value that picks it can
 * change together, and the value is bound before the option is there.
 */
export const HtmlSelect = ({
  value,
  onChange,
  children,
  fill = false,
  minimal = false,
  class: className,
  name,
  disabled,
  iconStyle,
  selectRef,
  'aria-label': ariaLabel,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  'data-e2e': e2e,
}: Props): JSX.Element => (
  <span
    class={constant(
      [
        'bp6-html-select',
        ...(minimal ? ['bp6-minimal'] : []),
        ...(fill ? ['bp6-fill'] : []),
        ...(className === undefined ? [] : [className]),
      ].join(' '),
    )}
  >
    <select
      ref={(mut_select) => {
        selectRef?.(mut_select);

        const value$ = toObservable(value);

        if (value$.isCompleted) {
          return;
        }

        const afterUpdate = createAfterUpdate();

        subscribeInScope(value$, () => {
          afterUpdate(() => {
            mut_select.value = value$.getSnapshot().value;
          });
        });
      }}
      aria-describedby={describedBy}
      aria-invalid={invalid}
      aria-label={ariaLabel}
      data-e2e={e2e}
      disabled={disabled}
      name={name === undefined ? undefined : constant(name)}
      value={value}
      onChange={onChange}
    >
      {children}
    </select>
    <Icon icon={'double-caret-vertical'} style={iconStyle} />
  </span>
);
