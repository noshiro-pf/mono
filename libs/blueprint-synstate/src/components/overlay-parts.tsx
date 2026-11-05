// Blueprint's `Overlay2` as `Dialog` and `Alert` use it: a portal into the
// body, a backdrop, the content, and the focus traps round it, with
// react-transition-group's classes as Blueprint's style sheets animate them.
// Not part of the package's API: `gen:index:src` leaves it out of the barrel.
import {
  createState,
  onScopeDispose,
  type InitializedObservable,
} from 'synstate';
import {
  constant,
  createAfterUpdate,
  If,
  isImeKeyDown,
  listenInScope,
  Portal,
  subscribeInScope,
  toObservable,
  view,
  type Bindable,
  type ClassObject,
  type JSX,
} from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { classObject, focusablesIn, isInside } from '../internal/index.mjs';

export type OverlayProps = Readonly<{
  isOpen: Bindable<boolean>;
  /** Asked for by Escape and by a press on the backdrop, where they may. */
  onClose?: (event: Event) => void;
  /** Escape asks to close (`canEscapeKeyClose`, on by default). */
  canEscapeKeyClose?: boolean;
  /** A press on the backdrop asks to close (`canOutsideClickClose`). */
  canOutsideClickClose?: boolean;
  /** Classes on `div.bp6-overlay`, after Blueprint's own. */
  class: string;
  /**
   * The content, given the classes that make it the overlay's content:
   * `bp6-overlay-content` and the transition's. It sets `tabindex="0"` on
   * itself, as Blueprint does.
   */
  content: (contentProps: Readonly<{ class: ClassObject }>) => JSX.Element;
}>;

/**
 * Draws `content` over the page while `isOpen` is on, and for the exit
 * transition after: in `div.bp6-portal` at the end of the body, over a
 * backdrop, with focus brought inside and kept there while it is the overlay on
 * top, and given back where it was once it has closed.
 */
export const Overlay = ({
  isOpen,
  onClose,
  canEscapeKeyClose = true,
  canOutsideClickClose = true,
  class: className,
  content,
}: OverlayProps): JSX.Element => {
  const isOpen$ = toObservable(isOpen);

  const [phase$, setPhase] = createState<Phase>('closed');

  const afterUpdate = createAfterUpdate();

  // Each change of `isOpen` starts a transition and ends the one before:
  // work queued for an earlier one sees a later generation and stops.
  const mut_transition: {
    generation: number;
    timer: ReturnType<typeof setTimeout> | undefined;
  } = { generation: 0, timer: undefined };

  onScopeDispose(() => {
    clearTimeout(mut_transition.timer);
  });

  const mut_focus: { before: Element | null } = { before: null };

  // The overlay's elements while it is drawn, which `OverlayBody` sets.
  const mut_elements: {
    overlay: HTMLElement | undefined;
    start: HTMLElement | undefined;
    end: HTMLElement | undefined;
  } = {
    overlay: undefined,
    start: undefined,
    end: undefined,
  };

  const mut_mounted = { first: true };

  // This overlay in Blueprint's overlay stack, from the opening to the closing,
  // not through the exit transition.
  const self: OverlayEntry = { elements: mut_elements } as const;

  onScopeDispose(() => {
    leaveStack(self);
  });

  subscribeInScope(isOpen$, (open) => {
    const { first } = mut_mounted;

    mut_mounted.first = false;

    const current = phase$.getSnapshot().value;

    const showing = current !== 'closed' && !current.startsWith('exit');

    if (open === showing) {
      return;
    }

    clearTimeout(mut_transition.timer);

    mut_transition.generation += 1;

    const { generation } = mut_transition;

    const stillCurrent = (): boolean =>
      generation === mut_transition.generation;

    if (open) {
      enterStack(self);

      // Reopened during the exit while focus is still in it, or on nothing in
      // particular, the element to give it back to stays the one from before
      // the first opening; one that has moved on to takes its place.
      if (current === 'closed' || !focusIsOnOrIn(mut_elements.overlay)) {
        mut_focus.before = document.activeElement;
      }

      // Opened as it is mounted: react-transition-group's `appear`.
      const kind = first ? 'appear' : 'enter';

      setPhase(kind);

      afterUpdate(() => {
        if (!stillCurrent()) {
          return;
        }

        setPhase(`${kind}-active`);

        mut_transition.timer = setTimeout(() => {
          setPhase(kind === 'appear' ? 'appear-done' : 'enter-done');
        }, transitionDuration);
      });
    } else {
      leaveStack(self);

      setPhase('exit');

      afterUpdate(() => {
        if (!stillCurrent()) {
          return;
        }

        setPhase('exit-active');

        mut_transition.timer = setTimeout(() => {
          // Focus that an overlay still open holds stays there; otherwise it
          // goes back, if what had it is still in the page.
          const giveBack = !focusIsInStack();

          setPhase('closed');

          const { before } = mut_focus;

          if (giveBack && before instanceof HTMLElement && before.isConnected) {
            before.focus();
          }
        }, transitionDuration);
      });
    }
  });

  // One toggle per class, shared by the four elements that carry them.
  const transitionToggles = transitionClassNames.map(
    ([name, phases]) =>
      [
        `bp6-overlay-${name}`,
        view(phase$, (phase) => phases.includes(phase)),
      ] as const,
  );

  const transitionClass = (base: string): ClassObject =>
    classObject([base], transitionToggles);

  const shown = view(phase$, (phase) => phase !== 'closed');

  return (
    <If
      cond={shown}
      then={
        <Portal>
          <OverlayBody
            canEscapeKeyClose={canEscapeKeyClose}
            canOutsideClickClose={canOutsideClickClose}
            className={className}
            content={content}
            isOpen$={isOpen$}
            isThisOnTop={() => isOnTop(self)}
            elements={() => mut_elements}
            setElement={(name, element) => {
              mut_elements[name] = element;
            }}
            transitionClass={transitionClass}
            onClose={onClose}
          />
        </Portal>
      }
    />
  );
};

type Phase =
  | 'appear-active'
  | 'appear-done'
  | 'appear'
  | 'closed'
  | 'enter-active'
  | 'enter-done'
  | 'enter'
  | 'exit-active'
  | 'exit';

type OverlayElements = Readonly<{
  /** `div.bp6-overlay`. */
  overlay: HTMLElement | undefined;
  /** The focus trap before the content. */
  start: HTMLElement | undefined;
  /** The focus trap after the content. */
  end: HTMLElement | undefined;
}>;

/** An overlay in {@link mut_overlayStack}, told apart by identity. */
type OverlayEntry = Readonly<{ elements: OverlayElements }>;

/** How long the enter and exit transitions run: Blueprint's 300ms. */
const transitionDuration = 300;

/**
 * The classes react-transition-group's `CSSTransition` gives each child of the
 * overlay, with Blueprint's `bp6-overlay` prefix, and the phases in which each
 * is on.
 */
const transitionClassNames: readonly (readonly [string, readonly Phase[]])[] = [
  ['appear', ['appear', 'appear-active']],
  ['appear-active', ['appear-active']],
  ['appear-done', ['appear-done']],
  ['enter', ['enter', 'enter-active']],
  ['enter-active', ['enter-active']],
  ['enter-done', ['appear-done', 'enter-done']],
  ['exit', ['exit', 'exit-active']],
  ['exit-active', ['exit-active']],
] as const;

/**
 * The open overlays, the last opened last, as Blueprint's overlay stack: the
 * one on top alone keeps focus inside itself, and the body carries
 * `bp6-overlay-open`, which Blueprint's style sheets stop the page scrolling
 * by, while any is open.
 */
const mut_overlayStack: OverlayEntry[] = [];

/** The overlay while it is drawn, mounted afresh each time it opens. */
const OverlayBody = ({
  isOpen$,
  isThisOnTop,
  elements,
  setElement,
  onClose,
  canEscapeKeyClose,
  canOutsideClickClose,
  className,
  content,
  transitionClass,
}: Readonly<{
  isOpen$: InitializedObservable<boolean>;
  isThisOnTop: () => boolean;
  /** Read from the `Overlay`, which owns them. */
  elements: () => OverlayElements;
  setElement: (
    name: keyof OverlayElements,
    element: HTMLElement | undefined,
  ) => void;
  onClose: ((event: Event) => void) | undefined;
  canEscapeKeyClose: boolean;
  canOutsideClickClose: boolean;
  className: string;
  content: OverlayProps['content'];
  transitionClass: (base: string) => ClassObject;
}>): JSX.Element => {
  /** What Tab reaches in the overlay, its focus traps aside. */
  const focusables = (): readonly HTMLElement[] =>
    focusablesIn(elements().overlay).filter(
      (element) => element !== elements().start && element !== elements().end,
    );

  /** Blueprint's `bringFocusInsideOverlay`, with `autofocus` honoured first. */
  const bringFocusInside = (): void => {
    const { overlay } = elements();

    if (overlay === undefined || overlay.contains(document.activeElement)) {
      return;
    }

    const autofocus = overlay.querySelector<HTMLElement>('[autofocus]');

    (autofocus ?? elements().start)?.focus({ preventScroll: true });
  };

  const mut_frame = { id: 0 };

  // As it opens, and as it is opened again during its exit: on the next frame,
  // once it is laid out, if it is still the one on top by then.
  subscribeInScope(isOpen$, (open) => {
    cancelAnimationFrame(mut_frame.id);

    if (open) {
      mut_frame.id = requestAnimationFrame(() => {
        if (isThisOnTop()) {
          bringFocusInside();
        }
      });
    }
  });

  onScopeDispose(() => {
    cancelAnimationFrame(mut_frame.id);

    setElement('overlay', undefined);

    setElement('start', undefined);

    setElement('end', undefined);
  });

  // `enforceFocus`: focus that would leave the overlay on top is brought back.
  listenInScope(
    document,
    'focus',
    (event) => {
      const { target } = event;

      if (
        target === document ||
        !isThisOnTop() ||
        isInside(target, elements().overlay)
      ) {
        return;
      }

      event.preventDefault();

      event.stopImmediatePropagation();

      bringFocusInside();
    },
    { capture: true },
  );

  return (
    <div class={constant('bp6-portal')}>
      <div
        ref={(overlay) => {
          setElement('overlay', overlay);
        }}
        aria-live={constant('polite')}
        class={classObject(
          ['bp6-overlay', className],
          [['bp6-overlay-open', isOpen$]],
        )}
        onKeyDown={(event) => {
          // An Escape that cancels what an input method is composing is not one
          // that closes.
          if (
            !(canEscapeKeyClose && event.key === 'Escape') ||
            isImeKeyDown(event)
          ) {
            return;
          }

          // One during the exit is still the overlay's, though it has already
          // closed.
          if (isOpen$.getSnapshot().value) {
            onClose?.(event);
          }

          event.stopPropagation();

          event.preventDefault();
        }}
      >
        <div
          ref={(start) => {
            setElement('start', start);
          }}
          class={transitionClass('bp6-overlay-start-focus-trap')}
          tabIndex={constant(0)}
          onFocus={(event) => {
            const { relatedTarget } = event;

            if (
              isInside(relatedTarget, elements().overlay) &&
              relatedTarget !== elements().end
            ) {
              elements().end?.focus({ preventScroll: true });
            }
          }}
          onKeyDown={(event) => {
            if (!(event.shiftKey && event.key === 'Tab')) {
              return;
            }

            const last = focusables().at(-1);

            if (last === undefined) {
              elements().end?.focus({ preventScroll: true });
            } else {
              event.preventDefault();

              last.focus();
            }
          }}
        />
        <div
          class={transitionClass('bp6-overlay-backdrop')}
          onMouseDown={(event) => {
            if (canOutsideClickClose && isOpen$.getSnapshot().value) {
              onClose?.(event);
            }

            if (isThisOnTop()) {
              bringFocusInside();
            }
          }}
        />
        {content({ class: transitionClass('bp6-overlay-content') })}
        <div
          ref={(end) => {
            setElement('end', end);
          }}
          class={transitionClass('bp6-overlay-end-focus-trap')}
          tabIndex={constant(0)}
          onFocus={(event) => {
            const { relatedTarget } = event;

            const inside = focusables();

            if (
              isInside(relatedTarget, elements().overlay) &&
              relatedTarget !== elements().start
            ) {
              const first = inside[0];

              (first !== undefined && first !== relatedTarget
                ? first
                : elements().start
              )?.focus({ preventScroll: true });
            } else {
              (inside.at(-1) ?? elements().start)?.focus({
                preventScroll: true,
              });
            }
          }}
        />
      </div>
    </div>
  );
};

/** Focus is in `overlay`, or on nothing in particular. */
const focusIsOnOrIn = (overlay: HTMLElement | undefined): boolean => {
  const active = document.activeElement;

  return (
    active === null || active === document.body || isInside(active, overlay)
  );
};

/** Focus is in an overlay still open. */
const focusIsInStack = (): boolean =>
  mut_overlayStack.some((entry) =>
    isInside(document.activeElement, entry.elements.overlay),
  );

const isOnTop = (entry: OverlayEntry): boolean =>
  mut_overlayStack.at(-1) === entry;

const enterStack = (entry: OverlayEntry): void => {
  if (mut_overlayStack.includes(entry)) {
    return;
  }

  mut_overlayStack.push(entry);

  document.body.classList.add('bp6-overlay-open');
};

const leaveStack = (entry: OverlayEntry): void => {
  const index = mut_overlayStack.indexOf(entry);

  if (index === -1) {
    return;
  }

  mut_overlayStack.splice(index, 1);

  if (Arr.isEmpty(mut_overlayStack)) {
    document.body.classList.remove('bp6-overlay-open');
  }
};
