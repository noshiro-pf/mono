import { createState } from 'synstate';
import {
  constant,
  deriveBindable,
  isImeKeyDown,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import {
  buttonClass,
  ButtonContents,
  disabledWhileLoading,
} from './button-parts.js';
import type { ButtonProps } from './button.js';

type Props = Readonly<
  StrictPick<
    ButtonProps,
    | 'active'
    | 'aria-label'
    | 'children'
    | 'class'
    | 'data-e2e'
    | 'disabled'
    | 'endIcon'
    | 'fill'
    | 'icon'
    | 'iconElement'
    | 'intent'
    | 'loading'
    | 'size'
    | 'text'
    | 'title'
    | 'variant'
  > & {
    href: Bindable<string>;
    /** `_blank` for a new tab; pass `rel="noopener noreferrer"` with it. */
    target?: string;
    rel?: string;
    /** Not called while the button is disabled or loading. */
    onClick?: (
      event: MouseEvent & Readonly<{ currentTarget: HTMLAnchorElement }>,
    ) => void;
  }
>;

/**
 * Blueprint's `AnchorButton`: a link drawn as a `Button`, `a.bp6-button` with
 * `role="button"`, in the tab order. As a button does, it is pressed by Space
 * as well as Enter, on the key's release.
 *
 * Disabled, or loading, it has no `href`, so that it leads nowhere, leaves the
 * tab order, and does not call `onClick`.
 */
export const AnchorButton = ({
  href,
  target,
  rel,
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
  class: className,
  title,
  onClick,
  'aria-label': ariaLabel,
  'data-e2e': e2e,
}: Props): JSX.Element => {
  const disabled =
    disabledWhileLoading(disabledProp, loading) ?? constant(false);

  // Drawn pressed while Space or Enter is held on it, as Blueprint's is.
  const [keyHeld$, setKeyHeld] = createState(false);

  return (
    <a
      aria-disabled={disabled}
      aria-label={ariaLabel}
      class={buttonClass({
        intent,
        variant,
        size,
        fill,
        active:
          active === undefined
            ? keyHeld$
            : deriveBindable([active, keyHeld$], (a, k) => a || k),
        disabled,
        loading,
        className,
      })}
      data-e2e={e2e}
      href={deriveBindable([disabled, href], (d, h) => (d ? undefined : h))}
      rel={rel === undefined ? undefined : constant(rel)}
      role={constant('button')}
      tabIndex={mapBindable(disabled, (d) => (d ? -1 : 0))}
      target={target === undefined ? undefined : constant(target)}
      title={title}
      onBlur={() => {
        setKeyHeld(false);
      }}
      onClick={(event) => {
        if (isDisabled(event.currentTarget)) {
          event.preventDefault();

          return;
        }

        onClick?.(event);
      }}
      // As Blueprint's: the key's own action, which for Enter on a link is a
      // click, is held back, and the release clicks instead.
      onKeyDown={(event) => {
        if (!isPressKey(event)) {
          return;
        }

        event.preventDefault();

        setKeyHeld(true);
      }}
      onKeyUp={(event) => {
        // Only the release of a press this button held back: the Enter that
        // confirmed a conversion is released as a plain Enter.
        if (!isPressKey(event) || !Optional.unwrap(keyHeld$.getSnapshot())) {
          return;
        }

        setKeyHeld(false);

        if (!isDisabled(event.currentTarget)) {
          event.currentTarget.click();
        }
      }}
    >
      <ButtonContents
        children={children}
        endIcon={endIcon}
        icon={icon}
        iconElement={iconElement}
        loading={loading}
        text={text}
      />
    </a>
  );
};

/** What the element says of itself: it is drawn from `disabled`. */
const isDisabled = (anchor: Element): boolean =>
  anchor.getAttribute('aria-disabled') === 'true';

/**
 * Enter or Space, which press a button; not the Enter that confirms an input
 * method's conversion.
 */
const isPressKey = (event: KeyboardEvent): boolean =>
  (event.key === 'Enter' && !isImeKeyDown(event)) || event.key === ' ';
