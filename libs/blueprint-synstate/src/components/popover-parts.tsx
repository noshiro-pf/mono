// Blueprint's `PopoverNext`, as `Popover`, `Tooltip` and the submenus of
// `MenuItem` use it: the target in `span.bp6-popover-target`, and the popover
// in an `Overlay` without a backdrop, placed by Floating UI with the middleware
// Blueprint gives it. Not part of the package's API: `gen:index:src` leaves it
// out of the barrel.
import {
  arrow as arrowMiddleware,
  autoPlacement,
  autoUpdate,
  computePosition,
  flip,
  offset as offsetMiddleware,
  shift,
  type Middleware,
  type Placement,
} from '@floating-ui/dom';
import {
  createState,
  derive,
  map,
  onScopeDispose,
  type InitializedObservable,
} from 'synstate';
import {
  constant,
  createAfterUpdate,
  deriveBindable,
  inlineMap,
  isImeKeyDown,
  mapBindable,
  subscribeInScope,
  toObservable,
  type Bindable,
  type Child,
  type ClassObject,
  type JSX,
} from 'synstate-dom';
import { Num } from 'ts-data-forge';
import {
  ARROW_BORDER_PATH,
  ARROW_FILL_PATH,
  ARROW_SIZE,
  ARROW_STAND_OFF,
  classObject,
} from '../internal/index.mjs';
import { Overlay } from './overlay-parts.js';

export type PopoverPlacement = Placement;

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
  offset?: Readonly<{ mainAxis?: number; crossAxis?: number }>;
  /** Kept this far within the viewport, as a submenu is. */
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

  subscribeInScope(disabled$, (isDisabled) => {
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
    container: HTMLElement | undefined;
    popover: HTMLElement | undefined;
    arrow: HTMLElement | undefined;
  } = {
    target: undefined,
    container: undefined,
    popover: undefined,
    arrow: undefined,
  };

  const [placement$, setPlacement] = createState<Placement>(
    placement ?? 'bottom',
  );

  // Most updates, on a scroll, move nothing.
  const [arrowAt$, setArrowAt] = createState<ArrowAt>(
    { left: undefined, top: undefined },
    { equals: (a, b) => a.left === b.left && a.top === b.top },
  );

  const middleware: readonly Middleware[] = [
    ...(arrow || offset !== undefined
      ? ([
          offsetMiddleware({
            mainAxis: offset?.mainAxis ?? (arrow ? ARROW_SIZE / 2 : 0),
            crossAxis: offset?.crossAxis ?? 0,
          }),
        ] as const)
      : ([] as const)),
    placement === undefined
      ? autoPlacement({ boundary: 'clippingAncestors' })
      : flip(
          viewportPadding === undefined
            ? { boundary: 'clippingAncestors' }
            : { padding: viewportPadding, rootBoundary: 'viewport' },
        ),
    shift(
      viewportPadding === undefined
        ? { boundary: 'clippingAncestors' }
        : { padding: viewportPadding, rootBoundary: 'viewport' },
    ),
  ] as const;

  /** Floating UI's `update`: where the popover and its arrow go now. */
  const update = (): void => {
    const { target, container } = mut_elements;

    if (target === undefined || container === undefined) {
      return;
    }

    computePosition(target, container, {
      strategy: 'absolute',
      ...(placement === undefined ? {} : { placement }),
      middleware: [
        ...middleware,
        ...(arrow && mut_elements.arrow !== undefined
          ? [arrowMiddleware({ element: mut_elements.arrow })]
          : []),
      ],
    })
      .then(({ x, y, placement: placed, middlewareData }) => {
        // Nothing to place once it has gone.
        if (!container.isConnected) {
          return;
        }

        // `useFloating`'s `floatingStyles`, with its `transform`.
        container.style.setProperty(
          'transform',
          `translate(${roundByDpr(x).toString()}px, ${roundByDpr(y).toString()}px)`,
        );

        if (window.devicePixelRatio >= 1.5) {
          container.style.setProperty('will-change', 'transform');
        }

        setPlacement(placed);

        setArrowAt({
          left: middlewareData.arrow?.x,
          top: middlewareData.arrow?.y,
        });
      })
      // An error is reported as an uncaught one would be, not lost.
      .catch(reportError);
  };

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

  subscribeInScope(open$, decorateTarget);

  const basePlacement$ = placement$.pipe(map(basePlacementOf));

  /**
   * `div.bp6-popover-transition-container` and what it holds, mounted as the
   * popover opens; Floating UI moves it while it is drawn.
   */
  const Container = ({
    contentClass,
    tabIndex,
  }: Readonly<{
    contentClass: ClassObject;
    tabIndex: number | undefined;
  }>): JSX.Element => {
    // `inheritDarkTheme`: dark within a dark target.
    const dark = mut_elements.target?.closest('.bp6-dark') != null;

    const mut_autoUpdate: { stop: (() => void) | undefined } = {
      stop: undefined,
    };

    const afterMount = createAfterUpdate();

    afterMount(() => {
      const { target, container } = mut_elements;

      if (target !== undefined && container !== undefined) {
        mut_autoUpdate.stop = autoUpdate(target, container, update);
      }
    });

    onScopeDispose(() => {
      mut_autoUpdate.stop?.();

      mut_elements.container = undefined;

      mut_elements.popover = undefined;
    });

    const dismiss = (event: Event): void => {
      dismissOnClick(event, mut_elements.popover, (dismissed) => {
        setOpenState(false, dismissed);
      });
    };

    return (
      <div
        ref={(container) => {
          mut_elements.container = container;
        }}
        class={{
          'bp6-popover-transition-container': constant(true),
          ...contentClass,
        }}
        style={{
          position: constant('absolute'),
          left: constant('0'),
          top: constant('0'),
        }}
        tabIndex={tabIndex === undefined ? undefined : constant(tabIndex)}
        onClick={dismiss}
        onKeyDown={(event) => {
          if (
            (event.key === 'Enter' || event.key === ' ') &&
            !isImeKeyDown(event)
          ) {
            dismiss(event);
          }
        }}
        onMouseEnter={(event) => {
          if (interactionKind === 'hover') {
            enter(event);
          }
        }}
        onMouseLeave={(event) => {
          if (interactionKind === 'hover') {
            leave(event);
          }
        }}
      >
        <div
          ref={(popover) => {
            mut_elements.popover = popover;
          }}
          class={classObject(
            [
              'bp6-popover',
              minimalAnimation && 'bp6-popover-minimal-animation',
              popoverClass,
              dark && 'bp6-dark',
            ],
            placementToggles(basePlacement$),
          )}
          style={{
            'transform-origin': deriveBindable(
              [basePlacement$, arrowAt$],
              (base, at) => transformOriginOf(base, arrow ? at : undefined),
            ),
          }}
        >
          {arrow ? (
            <PopoverArrow
              arrowAt$={arrowAt$}
              basePlacement$={basePlacement$}
              setElement={(element) => {
                mut_elements.arrow = element;
              }}
            />
          ) : (
            []
          )}
          <div class={constant('bp6-popover-content')}>{content}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <span
        ref={(target) => {
          mut_elements.target = target;
        }}
        class={classObject(
          ['bp6-popover-target'],
          [
            ['bp6-popover-open', open$],
            [
              'bp6-active',
              inlineMap(open$, (open) => open && !isControlled && !isHover),
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

          setOpenState(!open$.getSnapshot().value, event);
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
      <Overlay
        autoFocus={autoFocus ?? !isHover}
        canEscapeKeyClose={canEscapeKeyClose}
        canOutsideClickClose={interactionKind === 'click'}
        class={''}
        content={({ class: contentClass, tabIndex }) => (
          <Container contentClass={contentClass} tabIndex={tabIndex} />
        )}
        enforceFocus={enforceFocus}
        hasBackdrop={false}
        isOpen={open$}
        lazy={lazy}
        shouldReturnFocusOnClose={!isHover}
        transitionDuration={transitionDuration}
        transitionName={'bp6-popover'}
        usePortal={usePortal}
        onClose={(event) => {
          // A press on the target is the target's to handle.
          if (
            event instanceof KeyboardEvent ||
            !(
              event.target instanceof Node &&
              mut_elements.target?.contains(event.target) === true
            )
          ) {
            setOpenState(false, event);
          }
        }}
      />
    </>
  );
};

type ArrowAt = Readonly<{
  left: number | undefined;
  top: number | undefined;
}>;

type Side = 'bottom' | 'left' | 'right' | 'top';

const sides: readonly Side[] = ['bottom', 'left', 'right', 'top'] as const;

const arrowAngleOf = (side: Side): number => {
  switch (side) {
    case 'top':
      return -90;

    case 'left':
      return 180;

    case 'bottom':
      return 90;

    case 'right':
      return 0;
  }
};

const pixels = (value: number | undefined): string | undefined =>
  value === undefined ? undefined : (`${value.toString()}px` as const);

/** The arrow, as `PopoverArrow` draws it on the side facing the target. */
const PopoverArrow = ({
  basePlacement$,
  arrowAt$,
  setElement,
}: Readonly<{
  basePlacement$: Bindable<Side>;
  arrowAt$: InitializedObservable<ArrowAt>;
  setElement: (element: HTMLElement | undefined) => void;
}>): JSX.Element => (
  <div
    ref={(element) => {
      setElement(element);

      onScopeDispose(() => {
        setElement(undefined);
      });
    }}
    aria-hidden={constant('true')}
    class={constant('bp6-popover-arrow')}
    data-popper-arrow={constant('true')}
    style={{
      position: constant('absolute'),
      left: deriveBindable([basePlacement$, arrowAt$], (base, at) =>
        base === 'right' ? ARROW_STAND_OFF : pixels(at.left),
      ),
      top: deriveBindable([basePlacement$, arrowAt$], (base, at) =>
        base === 'bottom' ? ARROW_STAND_OFF : pixels(at.top),
      ),
      right: mapBindable(basePlacement$, (base) =>
        base === 'left' ? ARROW_STAND_OFF : undefined,
      ),
      bottom: mapBindable(basePlacement$, (base) =>
        base === 'top' ? ARROW_STAND_OFF : undefined,
      ),
    }}
  >
    <svg
      style={mapBindable(
        basePlacement$,
        (base) => `transform: rotate(${arrowAngleOf(base).toString()}deg);`,
      )}
      viewBox={constant(
        `0 0 ${ARROW_SIZE.toString()} ${ARROW_SIZE.toString()}`,
      )}
    >
      <path
        class={constant('bp6-popover-arrow-border')}
        d={constant(ARROW_BORDER_PATH)}
      />
      <path
        class={constant('bp6-popover-arrow-fill')}
        d={constant(ARROW_FILL_PATH)}
      />
    </svg>
  </div>
);

const basePlacementOf = (placement: Placement): Side => {
  const [side] = placement.split('-', 1);

  return sides.find((s) => s === side) ?? 'bottom';
};

const placementToggles = (
  basePlacement$: Bindable<Side>,
): readonly (readonly [string, Bindable<boolean>])[] =>
  sides.map(
    (side) =>
      [
        `bp6-popover-placement-${side}`,
        mapBindable(basePlacement$, (base) => base === side),
      ] as const,
  );

const oppositeOf = (side: Side): Side => {
  switch (side) {
    case 'top':
      return 'bottom';

    case 'left':
      return 'right';

    case 'bottom':
      return 'top';

    case 'right':
      return 'left';
  }
};

/** `parseInt(value, 10) + by` and `px`, `NaNpx` included, as Blueprint. */
const originPixels = (value: number | undefined, by: number): string =>
  value === undefined
    ? 'NaNpx'
    : (`${(Math.trunc(value) + by).toString()}px` as const);

/** Blueprint's `getTransformOrigin`, its quirks kept. */
const transformOriginOf = (side: Side, at: ArrowAt | undefined): string => {
  const sideways = side === 'left' || side === 'right';

  if (at === undefined) {
    return sideways
      ? `${oppositeOf(side)} center`
      : `center ${oppositeOf(side)}`;
  }

  const halfArrow = ARROW_SIZE / 2;

  return sideways
    ? `${oppositeOf(side)} ${originPixels(at.top, halfArrow)}`
    : `${originPixels(at.left, halfArrow)} ${oppositeOf(side)}`;
};

/** Floating UI's `roundByDPR`: to the nearest device pixel. */
const roundByDpr = (value: number): number => {
  const ratio = window.devicePixelRatio;

  return Num.isNonZero(ratio)
    ? Num.div(Math.round(value * ratio), ratio)
    : value;
};

/**
 * `handlePopoverClick`: a click on a `bp6-popover-dismiss` element, not inside a
 * `bp6-popover-dismiss-override` one nor disabled, closes the popover.
 */
const dismissOnClick = (
  event: Event,
  popover: HTMLElement | undefined,
  dismiss: (dismissed: Event) => void,
): void => {
  const { target } = event;

  if (!(target instanceof Element)) {
    return;
  }

  const eventPopover = target.closest('.bp6-popover');

  const dismissElement = target.closest(
    '.bp6-popover-dismiss, .bp6-popover-dismiss-override',
  );

  const shouldDismiss =
    dismissElement?.classList.contains('bp6-popover-dismiss') === true;

  const isDisabled = target.closest(':disabled, .bp6-disabled') !== null;

  const capturing =
    eventPopover?.classList.contains('bp6-popover-capturing-dismiss') === true;

  if (
    shouldDismiss &&
    !isDisabled &&
    (!capturing || eventPopover === popover)
  ) {
    dismiss(event);
  }
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
