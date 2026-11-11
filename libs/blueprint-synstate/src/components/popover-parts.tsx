// Blueprint's `PopoverNext`, as `Popover`, `Tooltip` and the submenus of
// `MenuItem` use it: the target in `span.bp6-popover-target`, and after it the
// popover, which `PopoverFloat` draws and places. Not part of the package's
// API: `gen:index:src` leaves it out of the barrel.
import { createState, derive, map, onScopeDispose } from 'synstate';
import {
  constant,
  createAfterUpdate,
  isImeKeyDown,
  toObservable,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';
import { classObject } from '../internal/index.mjs';
import {
  PopoverFloat,
  type PopoverOffset,
  type PopoverPlacement,
} from './popover-float-parts.js';

export type { PopoverPlacement } from './popover-float-parts.js';

/**
 * How the popover opens: by a click on the target, by hovering over the target
 * or the popover, or by hovering over the target alone.
 */
export type PopoverInteractionKind = 'click' | 'hover-target' | 'hover';

export type PopoverCoreProps = Readonly<{
  /** The target: one element, wrapped in `span.bp6-popover-target`. */
  children: Child;
  /** Drawn in `div.bp6-popover-content`, afresh each time it opens. */
  content: Child;
  /** Open or not as this is; with none, the popover keeps its own state. */
  isOpen?: Bindable<boolean>;
  /** Open as it is mounted, for one that keeps its own state. */
  defaultIsOpen?: boolean;
  /** Called as it asks to open or close, for one opened as `isOpen` is. */
  onInteraction?: (nextOpen: boolean, event: Event) => void;
  /** Called as it asks to close. */
  onClose?: (event: Event) => void;
  /** Never opens while on. */
  disabled?: Bindable<boolean>;
  /** Where it goes; with none, the side with room for it. */
  placement?: PopoverPlacement;
  /** The arrow pointing at the target; on by default. */
  arrow?: boolean;
  interactionKind?: PopoverInteractionKind;
  hoverOpenDelay?: number;
  hoverCloseDelay?: number;
  canEscapeKeyClose?: boolean;
  /** Focus is brought inside as it opens; with none, as `interactionKind`. */
  autoFocus?: boolean;
  enforceFocus?: boolean;
  usePortal?: boolean;
  /** Nothing is drawn until it first opens; off by default, as Blueprint's. */
  lazy?: boolean;
  transitionDuration?: number;
  /** `bp6-popover-minimal-animation`, which only fades. */
  minimalAnimation?: boolean;
  /** Classes on `div.bp6-popover`, after Blueprint's own. */
  popoverClass?: string;
  /** How far it stands off the target, and along it. */
  offset?: PopoverOffset;
  /**
   * Kept this far within the viewport and the ancestors that clip it, as a
   * submenu is; 0 by default.
   */
  viewportPadding?: number;
  /** The target's `role`, and its `tabindex`, as a submenu's has them. */
  targetRole?: string;
  targetTabIndex?: number;
  'data-e2e'?: string;
}>;

/**
 * The popover itself, as `PopoverNext` draws and moves it. The props are
 * Blueprint's, less those nothing here has needed.
 */
export const PopoverCore = ({
  children,
  content,
  isOpen,
  defaultIsOpen = false,
  onInteraction,
  onClose,
  disabled = constant(false),
  placement,
  arrow = true,
  interactionKind = 'click',
  hoverOpenDelay = 150,
  hoverCloseDelay = 300,
  canEscapeKeyClose = true,
  autoFocus,
  enforceFocus = true,
  usePortal = true,
  lazy = false,
  transitionDuration = 300,
  minimalAnimation = false,
  popoverClass,
  offset,
  viewportPadding,
  targetRole,
  targetTabIndex,
  'data-e2e': e2e,
}: PopoverCoreProps): JSX.Element => {
  const isControlled = isOpen !== undefined;

  const isHover = interactionKind !== 'click';

  const disabled$ = toObservable(disabled);

  const [ownIsOpen$, setOwnIsOpen] = createState(defaultIsOpen);

  const requested$ = isOpen === undefined ? ownIsOpen$ : toObservable(isOpen);

  // `computedIsOpen`: never open while disabled.
  const open$ = derive(
    [requested$, disabled$],
    (requested, isDisabled) => requested && !isDisabled,
  );

  const afterUpdate = createAfterUpdate();

  // The delayed opening or closing, which a later one replaces, as
  // Blueprint's `cancelOpenTimeout`; and the check on leaving, apart from it.
  const mut_timers: {
    delayed: ReturnType<typeof setTimeout> | undefined;
    delayedOpens: boolean;
    leaving: ReturnType<typeof setTimeout> | undefined;
  } = { delayed: undefined, delayedOpens: false, leaving: undefined };

  onScopeDispose(() => {
    clearTimeout(mut_timers.delayed);

    clearTimeout(mut_timers.leaving);
  });

  disabled$.subscribe((isDisabled) => {
    if (!isDisabled) {
      return;
    }

    // Nothing waiting opens it later, as it is enabled again; a close waiting
    // still asks, as one the pointer has already made.
    if (mut_timers.delayedOpens) {
      clearTimeout(mut_timers.delayed);
    }

    // An open popover keeping its own state is closed as it is disabled, not
    // opened again as it is enabled; once this update is over.
    if (!isControlled) {
      afterUpdate(() => {
        setOwnIsOpen(false);
      });
    }
  });

  /** Blueprint's `setOpenState`, after `delay` when there is one. */
  const setOpenState = (
    nextOpen: boolean,
    event: Event,
    delay?: number,
  ): void => {
    clearTimeout(mut_timers.delayed);

    // A leaving check still to run is answered by a close; an open, though
    // late, leaves it to close what the pointer has left.
    if (!nextOpen) {
      clearTimeout(mut_timers.leaving);
    }

    if (delay !== undefined && delay > 0) {
      mut_timers.delayedOpens = nextOpen;

      mut_timers.delayed = setTimeout(() => {
        setOpenState(nextOpen, event);
      }, delay);

      return;
    }

    if (isControlled) {
      onInteraction?.(nextOpen, event);
    } else {
      setOwnIsOpen(nextOpen);
    }

    if (!nextOpen) {
      onClose?.(event);
    }
  };

  const close = (event: Event): void => {
    setOpenState(false, event);
  };

  const mut_hover = { inside: false };

  const enter = (event: Event): void => {
    mut_hover.inside = true;

    if (!disabled$.getSnapshot().value) {
      setOpenState(true, event, hoverOpenDelay);
    }
  };

  const leave = (event: Event): void => {
    mut_hover.inside = false;

    // On the next turn, so that moving from the target onto the popover is not
    // taken for leaving.
    clearTimeout(mut_timers.leaving);

    mut_timers.leaving = setTimeout(() => {
      if (!mut_hover.inside) {
        setOpenState(false, event, hoverCloseDelay);
      }
    }, 0);
  };

  const mut_elements: {
    target: HTMLElement | undefined;
    popover: HTMLElement | undefined;
  } = {
    target: undefined,
    popover: undefined,
  };

  // Whether it was open as a click on the target began, before the target's own
  // handler had a say: Blueprint toggles from the `isOpen` it was drawn with,
  // which a handler opening it in the same click has not yet changed.
  const mut_click = { wasOpen: false };

  // The element `bp6-active` was put on here, not by the element itself, and so
  // is this one's to take off. One whose own `active` turns on while this is
  // open loses it as this closes: the class does not say who wants it.
  const mut_decorated: { active: Element | undefined } = { active: undefined };

  /** Decorates the target's element as `PopoverTarget` clones it. */
  const decorateTarget = (open: boolean): void => {
    const element = mut_elements.target?.firstElementChild;

    if (!(element instanceof HTMLElement)) {
      return;
    }

    if (interactionKind !== 'hover-target') {
      element.setAttribute('aria-haspopup', 'menu');
    }

    if (
      isHover &&
      targetTabIndex === undefined &&
      !element.hasAttribute('tabindex') &&
      !disabled$.getSnapshot().value
    ) {
      element.setAttribute('tabindex', '0');
    }

    if (!isHover) {
      element.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    const active = open && !isControlled && !isHover;

    // One put in place of it took the class away with it.
    if (mut_decorated.active !== element) {
      mut_decorated.active = undefined;
    }

    if (active && !element.classList.contains('bp6-active')) {
      element.classList.add('bp6-active');

      mut_decorated.active = element;
    } else if (!active && mut_decorated.active === element) {
      element.classList.remove('bp6-active');

      mut_decorated.active = undefined;
    }
  };

  // An element put in place of the target's, as by an `If`, is decorated too.
  const targetSwaps = new MutationObserver(() => {
    decorateTarget(open$.getSnapshot().value);
  });

  onScopeDispose(() => {
    targetSwaps.disconnect();
  });

  afterUpdate(() => {
    decorateTarget(open$.getSnapshot().value);

    if (mut_elements.target !== undefined) {
      targetSwaps.observe(mut_elements.target, { childList: true });
    }
  });

  open$.subscribe(decorateTarget);

  return (
    <>
      <span
        ref={(target) => {
          mut_elements.target = target;

          // Captured, so as to run before the handlers of what it holds; only a
          // controlled one opened by a click reads it.
          if (isControlled && !isHover) {
            target.addEventListener(
              'click',
              () => {
                mut_click.wasOpen = open$.getSnapshot().value;
              },
              { capture: true },
            );
          }
        }}
        class={classObject(
          ['bp6-popover-target'],
          [
            ['bp6-popover-open', open$],
            [
              'bp6-active',
              open$.pipe(map((open) => open && !isControlled && !isHover)),
            ],
          ],
        )}
        data-e2e={e2e === undefined ? undefined : constant(e2e)}
        role={targetRole === undefined ? undefined : constant(targetRole)}
        tabIndex={
          targetTabIndex === undefined ? undefined : constant(targetTabIndex)
        }
        onBlur={(event) => {
          if (!isHover) {
            return;
          }

          if (
            event.relatedTarget instanceof Node &&
            mut_elements.popover?.contains(event.relatedTarget) === true
          ) {
            return;
          }

          leave(event);
        }}
        onClick={(event) => {
          if (isHover || disabled$.getSnapshot().value) {
            return;
          }

          // One keeping its own state toggles as it is now, as Blueprint's
          // updater does: no handler in the target can set that state.
          setOpenState(
            !(isControlled ? mut_click.wasOpen : open$.getSnapshot().value),
            event,
          );
        }}
        onFocus={(event) => {
          if (isHover) {
            enter(event);
          }
        }}
        onKeyDown={(event) => {
          if (isHover) {
            return;
          }

          clickOnKeyboard(event);
        }}
        onMouseEnter={(event) => {
          if (isHover) {
            enter(event);
          }
        }}
        onMouseLeave={(event) => {
          if (isHover) {
            leave(event);
          }
        }}
      >
        {children}
      </span>
      <PopoverFloat
        arrow={arrow}
        autoFocus={autoFocus ?? !isHover}
        canEscapeKeyClose={canEscapeKeyClose}
        canOutsideClickClose={interactionKind === 'click'}
        content={content}
        enforceFocus={enforceFocus}
        getTarget={() => mut_elements.target}
        isOpen={open$}
        lazy={lazy}
        minimalAnimation={minimalAnimation}
        offset={offset}
        placement={placement}
        popoverClass={popoverClass}
        popoverRef={(popover) => {
          mut_elements.popover = popover;
        }}
        shouldReturnFocusOnClose={!isHover}
        transitionDuration={transitionDuration}
        usePortal={usePortal}
        viewportPadding={viewportPadding}
        onClose={close}
        onContainerMouseEnter={interactionKind === 'hover' ? enter : undefined}
        onContainerMouseLeave={interactionKind === 'hover' ? leave : undefined}
        onDismiss={close}
      />
    </>
  );
};

/** `handleReferenceKeyDown`: Enter and Space click what does not click itself. */
const clickOnKeyboard = (
  event: KeyboardEvent & Readonly<{ currentTarget: HTMLElement }>,
): void => {
  if (
    !(event.key === 'Enter' || event.key === ' ') ||
    event.repeat ||
    isImeKeyDown(event)
  ) {
    return;
  }

  const { target } = event;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable
  ) {
    return;
  }

  if (event.key === ' ') {
    if (target.closest('button') !== null) {
      return;
    }

    event.preventDefault();
  } else if (target.closest('button, a') !== null) {
    return;
  }

  event.currentTarget.click();
};
