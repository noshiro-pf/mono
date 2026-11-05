// What `Button` and `AnchorButton` draw alike, as Blueprint's `AbstractButton`
// has it for both. Not part of the package's API: `gen:index:src` leaves it out
// of the barrel.
import {
  constant,
  derive,
  If,
  mapBindable,
  type Bindable,
  type Child,
  type ClassObject,
  type JSX,
} from 'synstate-dom';
import { classObject, intentClass, sizeClass } from '../internal/index.mjs';
import type { ButtonVariant } from './button.js';
import { Icon, type IconName } from './icon.js';
import type { Intent, Size } from './intent.mjs';
import { Spinner, SpinnerSize } from './spinner.js';

/** `disabled`, and on while `loading` is, as Blueprint's buttons have it. */
export const disabledWhileLoading = (
  disabled: Bindable<boolean> | undefined,
  loading: Bindable<boolean> | undefined,
): Bindable<boolean> | undefined =>
  loading === undefined
    ? disabled
    : derive([disabled ?? constant(false), loading], (d, l) => d || l);

/** `bp6-button` and the classes its props add. */
export const buttonClass = ({
  intent,
  variant,
  size,
  fill,
  active,
  disabled,
  loading,
  className,
}: Readonly<{
  intent: Intent;
  variant: Bindable<ButtonVariant>;
  size: Size;
  fill: boolean;
  active: Bindable<boolean> | undefined;
  disabled: Bindable<boolean> | undefined;
  loading: Bindable<boolean> | undefined;
  className: string | undefined;
}>): ClassObject =>
  classObject(
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
      // Never drawn pressed while it cannot be pressed, as Blueprint's.
      [
        'bp6-active',
        active === undefined || disabled === undefined
          ? active
          : derive([active, disabled], (a, d) => a && !d),
      ],
      ['bp6-disabled', disabled],
      ['bp6-loading', loading],
    ],
  );

/** The spinner, the icon, the text and the end icon, as Blueprint draws them. */
export const ButtonContents = ({
  text,
  children,
  icon,
  endIcon,
  loading,
}: Readonly<{
  text: Bindable<string> | undefined;
  children: Child | undefined;
  icon: Bindable<IconName> | IconName | undefined;
  endIcon: Bindable<IconName> | IconName | undefined;
  loading: Bindable<boolean> | undefined;
}>): JSX.Element => (
  <>
    {loading === undefined ? (
      []
    ) : (
      <If
        cond={loading}
        then={<Spinner class={'bp6-button-spinner'} size={SpinnerSize.SMALL} />}
      />
    )}
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
  </>
);
