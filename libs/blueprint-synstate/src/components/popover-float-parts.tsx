// Blueprint's `PopoverNext` without its target: the popover in an `Overlay`
// without a backdrop, placed by Floating UI with the middleware Blueprint gives
// it, and its arrow. `PopoverCore` draws it after its target; the date inputs,
// whose field is the target, draw it alone. Not part of the package's API:
// `gen:index:src` leaves it out of the barrel.
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
  map,
  onScopeDispose,
  type InitializedObservable,
} from 'synstate';
import {
  constant,
  createAfterUpdate,
  deriveBindable,
  isImeKeyDown,
  mapBindable,
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
  isInside,
} from '../internal/index.mjs';
import { Overlay } from './overlay-parts.js';

/**
 * The popover without its target, as `PopoverNext` draws and moves it: an
 * `Overlay` without a backdrop holding `div.bp6-popover` and its arrow, placed
 * against `getTarget()` by Floating UI. `PopoverCore` draws its target in front
 * of it; the date inputs, whose field is the target, draw it alone.
 */
export const PopoverFloat = ({
  getTarget,
  isOpen,
  content,
  onClose,
  onDismiss,
  placement,
  flipFallback = 'bestFit',
  flipAlignment = true,
  arrow = true,
  offset,
  viewportPadding = 0,
  positioningStrategy = 'absolute',
  autoFocus = true,
  enforceFocus = true,
  shouldReturnFocusOnClose = true,
  canEscapeKeyClose = true,
  canOutsideClickClose = true,
  usePortal = true,
  lazy = false,
  transitionDuration = 300,
  minimalAnimation = false,
  popoverClass,
  onContainerMouseEnter,
  onContainerMouseLeave,
  containerRef,
}: PopoverFloatProps): JSX.Element => {
  const mut_elements: {
    container: HTMLElement | undefined;
    popover: HTMLElement | undefined;
    arrow: HTMLElement | undefined;
  } = {
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
      : flip({
          fallbackStrategy: flipFallback,
          flipAlignment,
          padding: viewportPadding,
        }),
    // Within the viewport and the ancestors that clip it, Floating UI's default
    // boundaries, with `viewportPadding` to spare.
    shift({ padding: viewportPadding }),
  ] as const;

  /** Floating UI's `update`: where the popover and its arrow go now. */
  const update = (): void => {
    const target = getTarget();

    const { container } = mut_elements;

    if (target === undefined || container === undefined) {
      return;
    }

    computePosition(target, container, {
      strategy: positioningStrategy,
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

  const basePlacement$ = placement$.pipe(map(basePlacementOf));

  const dismiss = (event: Event): void => {
    dismissOnClick(event, mut_elements.popover, onDismiss);
  };

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
    const dark = getTarget()?.closest('.bp6-dark') != null;

    const mut_autoUpdate: { stop: (() => void) | undefined } = {
      stop: undefined,
    };

    const afterMount = createAfterUpdate();

    afterMount(() => {
      const target = getTarget();

      const { container } = mut_elements;

      if (target !== undefined && container !== undefined) {
        mut_autoUpdate.stop = autoUpdate(target, container, update);
      }
    });

    onScopeDispose(() => {
      mut_autoUpdate.stop?.();

      mut_elements.container = undefined;

      mut_elements.popover = undefined;

      containerRef?.(undefined);
    });

    return (
      <div
        ref={(container) => {
          mut_elements.container = container;

          containerRef?.(container);
        }}
        class={{
          'bp6-popover-transition-container': constant(true),
          ...contentClass,
        }}
        style={{
          position: constant(positioningStrategy),
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
        onMouseEnter={onContainerMouseEnter}
        onMouseLeave={onContainerMouseLeave}
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
    <Overlay
      autoFocus={autoFocus}
      canEscapeKeyClose={canEscapeKeyClose}
      canOutsideClickClose={canOutsideClickClose}
      class={''}
      content={({ class: contentClass, tabIndex }) => (
        <Container contentClass={contentClass} tabIndex={tabIndex} />
      )}
      enforceFocus={enforceFocus}
      hasBackdrop={false}
      isOpen={isOpen}
      lazy={lazy}
      shouldReturnFocusOnClose={shouldReturnFocusOnClose}
      transitionDuration={transitionDuration}
      transitionName={'bp6-popover'}
      usePortal={usePortal}
      onClose={(event) => {
        if (
          event instanceof KeyboardEvent ||
          !isInside(event.target, getTarget())
        ) {
          onClose(event);
        }
      }}
    />
  );
};

export type PopoverFloatProps = Readonly<{
  /** The element it is placed against. */
  getTarget: () => HTMLElement | undefined;
  isOpen: Bindable<boolean>;
  /** Drawn in `div.bp6-popover-content`, afresh each time it opens. */
  content: Child;
  /**
   * Asked for by Escape and by a press outside both the popover and the target,
   * as its overlay hears them. A press on the target is the target's to handle.
   */
  onClose: (event: Event) => void;
  /** A click on a `bp6-popover-dismiss` element in it. */
  onDismiss: (event: Event) => void;
  /** Where it goes; with none, the side with room for it. */
  placement?: PopoverPlacement | undefined;
  /**
   * Where it goes when it fits on no side: `'bestFit'`, the side it overflows
   * least, as `PopoverNext`'s flip; or `'initialPlacement'`, where it was asked
   * to go, as Popper's flip in Blueprint's `Popover`.
   */
  flipFallback?: 'bestFit' | 'initialPlacement';
  /**
   * Tries the other end of a side (`bottom-end` for `bottom-start`) before the
   * other side, as `PopoverNext`'s flip does; on by default. Popper's, in
   * Blueprint's `Popover`, does not, and shifts it instead.
   */
  flipAlignment?: boolean;
  /** The arrow pointing at the target; on by default. */
  arrow?: boolean;
  /** How far it stands off the target, and along it. */
  offset?: PopoverOffset | undefined;
  /**
   * Kept this far within the viewport and the ancestors that clip it, as a
   * submenu is; 0 by default.
   */
  viewportPadding?: number | undefined;
  /** `positioningStrategy`: `'absolute'` by default. */
  positioningStrategy?: 'absolute' | 'fixed';
  autoFocus?: boolean;
  enforceFocus?: boolean;
  shouldReturnFocusOnClose?: boolean;
  canEscapeKeyClose?: boolean;
  canOutsideClickClose?: boolean;
  usePortal?: boolean;
  /** Nothing is drawn until it first opens; off by default, as Blueprint's. */
  lazy?: boolean;
  transitionDuration?: number;
  /** `bp6-popover-minimal-animation`, which only fades. */
  minimalAnimation?: boolean;
  /** Classes on `div.bp6-popover`, after Blueprint's own. */
  popoverClass?: string | undefined;
  onContainerMouseEnter?: ((event: Event) => void) | undefined;
  onContainerMouseLeave?: ((event: Event) => void) | undefined;
  /**
   * Given `div.bp6-popover-transition-container` as it is drawn, `undefined` as
   * it goes.
   */
  containerRef?: (container: HTMLElement | undefined) => void;
}>;

export type PopoverPlacement = Placement;

/** How far a popover stands off its target, and along it. */
export type PopoverOffset = Readonly<{ mainAxis?: number; crossAxis?: number }>;

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
