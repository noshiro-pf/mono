import { constant, mapBindable, type Bindable, type JSX } from 'synstate-dom';
import { arrowDirection, classObject } from '../internal/index.mjs';
import { Button } from './button.js';
import type { IconName } from './icon.js';
import type { Intent, Size } from './intent.mjs';

/** One choice of a {@link SegmentedControl}. */
export type SegmentedControlOption<T extends string> = Readonly<{
  value: T;
  /** The text; `value` when omitted. */
  label?: string;
  icon?: IconName;
  disabled?: boolean;
  'data-e2e'?: string;
}>;

type Props<T extends string> = Readonly<{
  options: readonly SegmentedControlOption<T>[];
  value: Bindable<T>;
  onValueChange: (value: T) => void;
  /** The colour of the option chosen. */
  intent?: Intent;
  size?: Size;
  /** Takes the width of its container (`bp6-fill`). */
  fill?: boolean;
  /** Sits in a line with the text round it (`bp6-inline`). */
  inline?: boolean;
  disabled?: Bindable<boolean>;
  /** Classes after Blueprint's own. */
  class?: string;
  'aria-label'?: Bindable<string>;
  'data-e2e'?: Bindable<string | undefined>;
}>;

/**
 * Blueprint's `SegmentedControl` as a `radiogroup`: one {@link Button} per
 * option, the chosen one solid and the rest minimal. Only the chosen one is in
 * the tab order, and the arrow keys choose the one before or after it, wrapping
 * round, as with radio buttons.
 */
export const SegmentedControl = <T extends string>({
  options,
  value,
  onValueChange,
  intent = 'none',
  size = 'medium',
  fill = false,
  inline = false,
  disabled,
  class: className,
  'aria-label': ariaLabel,
  'data-e2e': e2e,
}: Props<T>): JSX.Element => (
  <div
    aria-label={ariaLabel}
    class={classObject([
      'bp6-segmented-control',
      fill && 'bp6-fill',
      inline && 'bp6-inline',
      className,
    ])}
    data-e2e={e2e}
    role={constant('radiogroup')}
    onKeyDown={(event) => {
      const direction = arrowDirection(event.key);

      if (direction === undefined) {
        return;
      }

      const focused =
        document.activeElement instanceof HTMLButtonElement
          ? document.activeElement
          : undefined;

      const enabled = Array.from(
        event.currentTarget.querySelectorAll<HTMLButtonElement>(
          'button:not(:disabled)',
        ),
      );

      const index = focused === undefined ? -1 : enabled.indexOf(focused);

      if (index < 0) {
        return;
      }

      event.preventDefault();

      const next =
        enabled[(index + direction + enabled.length) % enabled.length];

      next?.click();

      next?.focus();
    }}
  >
    {options.map((option) => {
      const selected = mapBindable(value, (v) => v === option.value);

      return (
        <Button
          aria-checked={mapBindable(selected, String)}
          data-e2e={
            option['data-e2e'] === undefined
              ? undefined
              : constant(option['data-e2e'])
          }
          disabled={option.disabled === true ? constant(true) : disabled}
          intent={intent}
          role={'radio'}
          size={size}
          tabIndex={mapBindable(selected, (s) => (s ? 0 : -1))}
          text={constant(option.label ?? option.value)}
          variant={mapBindable(selected, (s) => (s ? 'solid' : 'minimal'))}
          {...(option.icon === undefined ? {} : { icon: option.icon })}
          onClick={() => {
            onValueChange(option.value);
          }}
        />
      );
    })}
  </div>
);
