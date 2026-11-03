// The popover Blueprint's date inputs hang below their target, drawn in place,
// after the target, rather than in a portal, and positioned `fixed`: inside a
// modal `<dialog>`, which is in the top layer, a portal on `<body>` would be
// drawn behind the dialog and be inert. In place it is inside the dialog, and
// is not clipped by a scrolling body.

import { createState, map, onScopeDispose } from 'synstate';
import {
  constant,
  createAfterUpdate,
  isImeKeyDown,
  listenInScope,
  view,
  type Child,
  type JSX,
} from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import {
  ARROW_BORDER_PATH,
  ARROW_FILL_PATH,
  ARROW_SIZE,
  ARROW_STAND_OFF,
  placeBottomStart,
  type PopoverPosition,
} from '../internal/index.mjs';

type Props = Readonly<{
  /** The element it hangs below, and a press on which is not outside. */
  getTarget: () => HTMLElement | undefined;
  /** After `bp6-popover`, such as `bp6-date-input-popover`. */
  popoverClass: string;
  /** A press outside both the target and the popover. */
  onOutsidePress: () => void;
  /** Escape in the popover, kept from the page. */
  onEscape: () => void;
  /** What `bp6-popover-content` holds. */
  children: Child;
  /** Given the popover's container as it is drawn, `undefined` as it goes. */
  containerRef?: (container: HTMLDivElement | undefined) => void;
}>;

/**
 * `div.bp6-overlay` round the popover, placed below the target (above it where
 * there is no room) and following it as the page scrolls or resizes, with
 * Blueprint's enter transition.
 */
export const DatePopover = ({
  getTarget,
  popoverClass,
  onOutsidePress,
  onEscape,
  children,
  containerRef,
}: Props): JSX.Element => {
  const [position$, setPosition] = createState<Optional<PopoverPosition>>(
    Optional.none,
  );

  const [phase$, setPhase] = createState<'enter' | 'active' | 'done'>('enter');

  const afterUpdate = createAfterUpdate();

  const placement$ = position$.pipe(
    map((position) =>
      Optional.isSome(position) ? position.value.placement : 'bottom',
    ),
  );

  const mut_container: { element: HTMLDivElement | undefined } = {
    element: undefined,
  };

  const place = (): void => {
    const target = getTarget();

    const container = mut_container.element;

    if (target === undefined || container === undefined) {
      return;
    }

    setPosition(
      Optional.some(
        placeBottomStart(
          target.getBoundingClientRect(),
          { width: container.offsetWidth, height: container.offsetHeight },
          {
            width: document.documentElement.clientWidth,
            height: window.innerHeight,
          },
        ),
      ),
    );
  };

  listenInScope(globalThis, 'resize', place);

  listenInScope(document, 'scroll', place, { capture: true, passive: true });

  listenInScope(
    document,
    'mousedown',
    (event) => {
      const pressed = event.target;

      if (
        pressed instanceof Node &&
        getTarget()?.contains(pressed) !== true &&
        mut_container.element?.contains(pressed) !== true
      ) {
        onOutsidePress();
      }
    },
    { capture: true },
  );

  // Blueprint's enter transition: `-enter`, then `-enter-active` from the next
  // frame for the 300ms it runs, then `-enter-done`.
  const mut_transition: {
    frame: number;
    timer: ReturnType<typeof setTimeout> | undefined;
  } = { frame: 0, timer: undefined };

  onScopeDispose(() => {
    cancelAnimationFrame(mut_transition.frame);

    clearTimeout(mut_transition.timer);
  });

  afterUpdate(() => {
    place();

    mut_transition.frame = requestAnimationFrame(() => {
      setPhase('active');
    });

    mut_transition.timer = setTimeout(() => {
      setPhase('done');
    }, TRANSITION_MS);
  });

  return (
    <div
      aria-live={constant('polite')}
      class={constant('bp6-overlay bp6-overlay-open bp6-overlay-inline')}
    >
      <div
        ref={(container) => {
          mut_container.element = container;

          containerRef?.(container);

          onScopeDispose(() => {
            containerRef?.(undefined);
          });

          const observer = new ResizeObserver(() => {
            place();
          });

          observer.observe(container);

          onScopeDispose(() => {
            observer.disconnect();
          });
        }}
        class={{
          'bp6-popover-transition-container': constant(true),
          'bp6-overlay-content': constant(true),
          'bp6-popover-enter': view(phase$, (phase) => phase !== 'done'),
          'bp6-popover-enter-active': view(
            phase$,
            (phase) => phase === 'active',
          ),
          'bp6-popover-enter-done': view(phase$, (phase) => phase === 'done'),
        }}
        style={{
          position: constant('fixed'),
          left: view(position$, (position) =>
            Optional.isSome(position) ? `${position.value.left}px` : '0px',
          ),
          top: view(position$, (position) =>
            Optional.isSome(position) ? `${position.value.top}px` : '0px',
          ),
        }}
        onKeyDown={(event) => {
          // The Escape that cancels what an input method is composing, in the
          // time picker's fields, is the input method's.
          if (event.key !== 'Escape' || isImeKeyDown(event)) {
            return;
          }

          event.preventDefault();

          event.stopPropagation();

          onEscape();
        }}
      >
        <div
          class={view(
            placement$,
            (placement) =>
              `bp6-popover bp6-popover-placement-${placement} ${popoverClass}`,
          )}
          style={{
            'transform-origin': view(position$, (position) =>
              Optional.isSome(position)
                ? `${position.value.arrowLeft + ARROW_SIZE / 2}px ${position.value.placement === 'top' ? 'bottom' : 'top'}`
                : undefined,
            ),
          }}
        >
          <div
            aria-hidden={constant('true')}
            class={constant('bp6-popover-arrow')}
            data-popper-arrow={constant('')}
            style={{
              left: view(position$, (position) =>
                Optional.isSome(position)
                  ? `${position.value.arrowLeft}px`
                  : undefined,
              ),
              top: view(placement$, (placement) =>
                placement === 'bottom' ? ARROW_STAND_OFF : undefined,
              ),
              bottom: view(placement$, (placement) =>
                placement === 'top' ? ARROW_STAND_OFF : undefined,
              ),
            }}
          >
            <svg
              style={view(
                placement$,
                (placement) =>
                  `transform: rotate(${placement === 'top' ? -90 : 90}deg);`,
              )}
              viewBox={constant(`0 0 ${ARROW_SIZE} ${ARROW_SIZE}`)}
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
          <div class={constant('bp6-popover-content')}>{children}</div>
        </div>
      </div>
    </div>
  );
};

const TRANSITION_MS = 300;
