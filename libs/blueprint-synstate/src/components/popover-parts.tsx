// Blueprint's `PopoverNext`, as `Popover`, `Tooltip` and the submenus of
// `MenuItem` use it: the target in `span.bp6-popover-target`, and after it the
// popover, which `PopoverFloat` draws and places. Not part of the package's
// API: `gen:index:src` leaves it out of the barrel.
import { createState, derive, map, onScopeDispose } from 'synstate';
import {
  constant,
  createAfterUpdate,
  isImeKeyDown,
  listenInScope,
  toObservable,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';
import { Optional } from 'ts-data-forge';
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

    if (!Optional.unwrap(disabled$.getSnapshot())) {
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
    container: HTMLElement | undefined;
  } = {
    target: undefined,
    container: undefined,
  };

  // Whether the page itself lost the focus (another browser tab, another
  // window, the browser's own controls) while the target had it: the browser
  // focuses the target again as the page gets the focus back, and that opens
  // nothing, as in Blueprint. Blueprint's `lostFocusOnSamePage` guesses this
  // from a `relatedTarget` of `null`, which a click on a blank part of the page
  // leaves too; the window's own `blur` is the page losing it, the target still
  // its active element. The next focus of the target takes the mark off. Known
  // limits: a Tab from the browser's controls back onto the target is taken for
  // the page getting it back, as in Blueprint, and so is the first focus of the
  // target from no element after the page got the focus back on another
  // element. Each hover popover listens for itself, on the global window, as
  // the package's overlays listen on the global document.
  const mut_focus = { pageLeftFromTarget: false };

  if (isHover) {
    listenInScope(globalThis, 'blur', () => {
      mut_focus.pageLeftFromTarget =
        mut_elements.target?.contains(document.activeElement) === true;
    });
  }

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
      !Optional.unwrap(disabled$.getSnapshot())
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
    decorateTarget(Optional.unwrap(open$.getSnapshot()));
  });

  onScopeDispose(() => {
    targetSwaps.disconnect();
  });

  afterUpdate(() => {
    decorateTarget(Optional.unwrap(open$.getSnapshot()));

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
                mut_click.wasOpen = Optional.unwrap(open$.getSnapshot());
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
        onClick={(event) => {
          if (isHover || Optional.unwrap(disabled$.getSnapshot())) {
            return;
          }

          // One keeping its own state toggles as it is now, as Blueprint's
          // updater does: no handler in the target can set that state.
          setOpenState(
            !(isControlled
              ? mut_click.wasOpen
              : Optional.unwrap(open$.getSnapshot())),
            event,
          );
        }}
        // `focusin` / `focusout`, which bubble as React's `onFocus` / `onBlur`
        // do: what takes the focus is the element inside, not this wrapper.
        // They are Blueprint's `handleTargetFocus` / `handleTargetBlur`, and
        // keep its limits so that the port behaves as Blueprint does: the focus
        // shares the pointer's `enter` / `leave` and its one `inside` flag, a
        // move between two elements of the target leaves and enters again, a
        // focus an overlay gives back as it closes counts as a focus, a move
        // onto the overlay's focus traps is a leave, and the focus leaving the
        // popover's content closes nothing, since no handler listens there.
        // With `enforceFocus` on, a Tab off the target is pulled onto the
        // overlay's focus trap and left there as the popover closes; `Tooltip`
        // and the submenu of `MenuItem` turn it off.
        onFocusIn={(event) => {
          const pageReturns =
            event.relatedTarget === null && mut_focus.pageLeftFromTarget;

          mut_focus.pageLeftFromTarget = false;

          if (pageReturns) {
            return;
          }

          if (isHover) {
            enter(event);
          }
        }}
        onFocusOut={(event) => {
          if (!isHover) {
            return;
          }

          // Into the popover's transition container, too: it takes the focus
          // itself (a `tabindex`) when it enforces the focus.
          if (
            event.relatedTarget instanceof Node &&
            mut_elements.container?.contains(event.relatedTarget) === true
          ) {
            return;
          }

          leave(event);
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
        containerRef={(container) => {
          mut_elements.container = container;
        }}
        content={content}
        enforceFocus={enforceFocus}
        getTarget={() => mut_elements.target}
        isOpen={open$}
        lazy={lazy}
        minimalAnimation={minimalAnimation}
        offset={offset}
        placement={placement}
        popoverClass={popoverClass}
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
