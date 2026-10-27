import {
  constant,
  mapBindable,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';
import { classObject, intentClass, sizeClass } from '../internal/index.mjs';
import { Icon, type IconName } from './icon.js';
import type { Intent, Size } from './intent.mjs';

/** How a {@link Button} is drawn: filled, without a border until hovered, or bordered. */
export type ButtonVariant = 'minimal' | 'outlined' | 'solid';

export type ButtonProps = Readonly<{
  /** The label, in `span.bp6-button-text`. */
  text?: Bindable<string>;
  /** Drawn after `text`, in the same `span`. */
  children?: Child;
  /** Drawn before the text. */
  icon?: IconName;
  /** Drawn after the text. */
  endIcon?: IconName;
  intent?: Intent;
  variant?: Bindable<ButtonVariant>;
  size?: Size;
  /** Takes the width of its container (`bp6-fill`). */
  fill?: boolean;
  /** Drawn pressed (`bp6-active`). */
  active?: Bindable<boolean>;
  disabled?: Bindable<boolean>;
  type?: 'button' | 'reset' | 'submit';
  /** Classes after Blueprint's own. */
  class?: string;
  title?: Bindable<string>;
  role?: string;
  tabIndex?: Bindable<number>;
  onClick?: (
    event: MouseEvent & Readonly<{ currentTarget: HTMLButtonElement }>,
  ) => void;
  'aria-label'?: Bindable<string>;
  'aria-pressed'?: Bindable<string | undefined>;
  'aria-checked'?: Bindable<string | undefined>;
  'data-e2e'?: Bindable<string | undefined>;
}>;

/**
 * Blueprint's `Button`: a `<button type="button">` with the icon, the text
 * in `span.bp6-button-text` and the end icon, as Blueprint draws them.
 *
 * `disabled` also sets `bp6-disabled`, which Blueprint's style sheets draw a
 * disabled button by. No `loading` spinner.
 */
export const Button = ({
  text,
  children,
  icon,
  endIcon,
  intent = 'none',
  variant = constant('solid'),
  size = 'medium',
  fill = false,
  active,
  disabled,
  type = 'button',
  class: className,
  title,
  role,
  tabIndex,
  onClick,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
  'aria-checked': ariaChecked,
  'data-e2e': e2e,
}: ButtonProps): JSX.Element => (
  <button
    aria-checked={ariaChecked}
    aria-label={ariaLabel}
    aria-pressed={ariaPressed}
    class={classObject(
      [
        'bp6-button',
        intentClass(intent),
        sizeClass(size),
        fill && 'bp6-fill',
        className,
      ],
      [
        ['bp6-minimal', mapBindable(variant, (v) => v === 'minimal')],
        ['bp6-outlined', mapBindable(variant, (v) => v === 'outlined')],
        ['bp6-active', active],
        ['bp6-disabled', disabled],
      ],
    )}
    data-e2e={e2e}
    disabled={disabled}
    role={role === undefined ? undefined : constant(role)}
    tabIndex={tabIndex}
    title={title}
    type={constant(type)}
    onClick={onClick}
  >
    {icon === undefined ? [] : <Icon icon={icon} />}
    {text === undefined && children === undefined ? (
      []
    ) : (
      <span class={constant('bp6-button-text')}>
        {text ?? []}
        {children ?? []}
      </span>
    )}
    {endIcon === undefined ? [] : <Icon icon={endIcon} />}
  </button>
);
