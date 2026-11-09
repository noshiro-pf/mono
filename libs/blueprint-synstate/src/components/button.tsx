import { constant, type Bindable, type Child, type JSX } from 'synstate-dom';
import {
  buttonClass,
  ButtonContents,
  disabledWhileLoading,
} from './button-parts.js';
import type { IconName } from './icon.js';
import type { Intent, Size } from './intent.mjs';

/** How a {@link Button} is drawn: filled, without a border until hovered, or bordered. */
export type ButtonVariant = 'minimal' | 'outlined' | 'solid';

export type ButtonProps = Readonly<{
  /** The label, in `span.bp6-button-text`. */
  text?: Bindable<string>;
  /** Drawn after `text`, in the same `span`. */
  children?: Child;
  /** Drawn before the text; one that changes is redrawn as it does. */
  icon?: Bindable<IconName> | IconName;
  /**
   * Drawn as it is in place of `icon`, such as an `<svg>` of the app's own, as
   * Blueprint draws an element given as its icon.
   */
  iconElement?: Child;
  /** Drawn after the text; one that changes is redrawn as it does. */
  endIcon?: Bindable<IconName> | IconName;
  intent?: Intent;
  variant?: Bindable<ButtonVariant>;
  size?: Size;
  /** Takes the width of its container (`bp6-fill`). */
  fill?: boolean;
  /** Drawn pressed (`bp6-active`). */
  active?: Bindable<boolean>;
  disabled?: Bindable<boolean>;
  /**
   * A spinner over the contents, which Blueprint's style sheets hide; the
   * button is disabled meanwhile.
   */
  loading?: Bindable<boolean>;
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
  'aria-pressed'?: Bindable<boolean | string | undefined>;
  'aria-checked'?: Bindable<boolean | string | undefined>;
  'aria-controls'?: Bindable<string>;
  'aria-expanded'?: Bindable<boolean | string | undefined>;
  'data-e2e'?: Bindable<string | undefined>;
}>;

/**
 * Blueprint's `Button`: a `<button type="button">` with the icon, the text in
 * `span.bp6-button-text` and the end icon, as Blueprint draws them.
 *
 * `disabled` also sets `bp6-disabled`, which Blueprint's style sheets draw a
 * disabled button by; so does `loading`.
 */
export const Button = ({
  text,
  children,
  icon,
  iconElement,
  endIcon,
  intent = 'none',
  variant = constant('solid'),
  size = 'medium',
  fill = false,
  active,
  disabled: disabledProp,
  loading,
  type = 'button',
  class: className,
  title,
  role,
  tabIndex,
  onClick,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
  'aria-checked': ariaChecked,
  'aria-controls': ariaControls,
  'aria-expanded': ariaExpanded,
  'data-e2e': e2e,
}: ButtonProps): JSX.Element => {
  const disabled = disabledWhileLoading(disabledProp, loading);

  return (
    <button
      aria-checked={ariaChecked}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      class={buttonClass({
        intent,
        variant,
        size,
        fill,
        active,
        disabled,
        loading,
        className,
      })}
      data-e2e={e2e}
      disabled={disabled}
      role={role === undefined ? undefined : constant(role)}
      tabIndex={tabIndex}
      title={title}
      type={constant(type)}
      onClick={onClick}
    >
      <ButtonContents
        children={children}
        endIcon={endIcon}
        icon={icon}
        iconElement={iconElement}
        loading={loading}
        text={text}
      />
    </button>
  );
};
