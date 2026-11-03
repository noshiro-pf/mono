// cspell:ignore ellipsize Ellipsized
import { createState, onScopeDispose } from 'synstate';
import {
  constant,
  createAfterUpdate,
  isImeKeyDown,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';
import { classObject, intentClass } from '../internal/index.mjs';
import { Icon, type IconName } from './icon.js';
import type { Intent } from './intent.mjs';
import { Menu } from './menu.js';
import { PopoverCore } from './popover-parts.js';

type Props = Readonly<{
  text: Bindable<string>;
  /** Before the text, in `span.bp6-menu-item-icon`. */
  icon?: IconName;
  intent?: Intent;
  /** Drawn as the item under the pointer (`bp6-active`). */
  active?: Bindable<boolean>;
  disabled?: boolean;
  /** After the text, in `span.bp6-menu-item-label`. */
  label?: Bindable<string>;
  onClick?: (event: MouseEvent) => void;
  /**
   * A click closes the popover the menu is in (`bp6-popover-dismiss`); on by
   * default, as Blueprint's, for an item with no submenu.
   */
  shouldDismissPopover?: boolean;
  /** The submenu's items: drawn in a popover to the right while hovered. */
  children?: Child;
  /** Classes on `a.bp6-menu-item`, after Blueprint's own. */
  class?: string;
  'data-e2e'?: string;
}>;

/**
 * Blueprint's `MenuItem`: `a.bp6-menu-item[role="menuitem"]` in
 * `li[role="none"]`, its text cut short with an ellipsis, and given a `title`,
 * where it does not fit. With `children`, a submenu opens beside it while it is
 * hovered or has focus.
 */
export const MenuItem = ({
  text,
  icon,
  intent = 'none',
  active,
  disabled = false,
  label,
  onClick,
  shouldDismissPopover = true,
  children,
  class: className,
  'data-e2e': e2e,
}: Props): JSX.Element => {
  const hasSubmenu = children !== undefined;

  const target = (
    <a
      aria-disabled={disabled ? constant('true') : undefined}
      class={classObject(
        [
          'bp6-menu-item',
          intentClass(intent),
          disabled && 'bp6-disabled',
          shouldDismissPopover && !disabled && !hasSubmenu
            ? 'bp6-popover-dismiss'
            : undefined,
          className,
        ],
        [['bp6-active', active]],
      )}
      data-e2e={e2e === undefined ? undefined : constant(e2e)}
      role={constant(hasSubmenu ? 'none' : 'menuitem')}
      tabIndex={constant(hasSubmenu || disabled ? -1 : 0)}
      onClick={(event) => {
        if (!disabled) {
          onClick?.(event);
        }
      }}
      onKeyDown={(event) => {
        // `clickElementOnKeyPress(['Enter', ' '])`.
        if (
          (event.key !== 'Enter' && event.key !== ' ') ||
          isImeKeyDown(event)
        ) {
          return;
        }

        event.preventDefault();

        event.currentTarget.click();
      }}
    >
      {icon === undefined ? (
        []
      ) : (
        <span
          aria-hidden={constant('true')}
          class={constant('bp6-menu-item-icon')}
        >
          <Icon icon={icon} />
        </span>
      )}
      <EllipsizedText text={text} />
      {label === undefined ? (
        []
      ) : (
        <span class={constant('bp6-menu-item-label')}>{label}</span>
      )}
      {hasSubmenu ? (
        <Icon class={'bp6-submenu-icon'} icon={'caret-right'} />
      ) : (
        []
      )}
    </a>
  );

  return (
    <li
      class={constant(hasSubmenu ? 'bp6-submenu' : '')}
      role={constant('none')}
    >
      {hasSubmenu ? (
        <PopoverCore
          arrow={false}
          autoFocus={false}
          content={<Menu>{children}</Menu>}
          disabled={constant(disabled)}
          enforceFocus={false}
          hoverCloseDelay={0}
          interactionKind={'hover'}
          minimalAnimation={true}
          offset={{ crossAxis: -5 }}
          placement={'right-start'}
          popoverClass={'bp6-submenu'}
          targetRole={'menuitem'}
          targetTabIndex={0}
          usePortal={false}
          viewportPadding={20}
        >
          {target}
        </PopoverCore>
      ) : (
        target
      )}
    </li>
  );
};

/**
 * Blueprint's `Text` with `ellipsize`: `div.bp6-text-overflow-ellipsis.bp6-fill`,
 * with its text as its `title` once it is drawn cut short.
 */
const EllipsizedText = ({
  text,
}: Readonly<{ text: Bindable<string> }>): JSX.Element => {
  const mut_element: { div: HTMLElement | undefined } = { div: undefined };

  const [title$, setTitle] = createState<string | undefined>(undefined);

  const afterUpdate = createAfterUpdate();

  const measure = (): void => {
    const { div } = mut_element;

    if (div !== undefined) {
      setTitle(div.scrollWidth > div.clientWidth ? div.textContent : undefined);
    }
  };

  // Measured once it is drawn, and again as its text changes, as `Text`
  // measures on every render; read off the DOM, so that a `View` is not mapped
  // twice.
  const textChanges = new MutationObserver(measure);

  afterUpdate(() => {
    measure();

    if (mut_element.div !== undefined) {
      textChanges.observe(mut_element.div, {
        characterData: true,
        childList: true,
        subtree: true,
      });
    }
  });

  onScopeDispose(() => {
    textChanges.disconnect();

    mut_element.div = undefined;
  });

  return (
    <div
      ref={(div) => {
        mut_element.div = div;
      }}
      class={constant('bp6-text-overflow-ellipsis bp6-fill')}
      title={title$}
    >
      {text}
    </div>
  );
};
