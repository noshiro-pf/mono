// Blueprint's `Overlay2`, as `Dialog`, `Alert` and the popovers use it: a portal
// into the body (or the overlay in place), an optional backdrop, the content,
// and the focus traps round it, with react-transition-group's classes as
// Blueprint's style sheets animate them. Not part of the package's API:
// `gen:index:src` leaves it out of the barrel.
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
import { classObject, focusablesIn, isInside } from '../internal/index.mjs';

export type OverlayProps = Readonly<{
  isOpen: Bindable<boolean>;
  /** Asked for by Escape and by a press on the backdrop, where they may. */
  onClose?: (event: Event) => void;
  /** Escape asks to close (`canEscapeKeyClose`, on by default). */
  canEscapeKeyClose?: boolean;
  /**
   * A press on the backdrop asks to close, or, with none, a press anywhere
   * outside the overlay and those opened over it (`canOutsideClickClose`).
   */
  canOutsideClickClose?: boolean;
  /** A backdrop under the content, which also marks the body; on by default. */
  hasBackdrop?: boolean;
  /** Focus is brought inside as it opens; on by default. */
  autoFocus?: boolean;
  /** Focus is kept inside while it is the overlay on top; on by default. */
  enforceFocus?: boolean;
  /** Focus goes back where it was once it has closed; on by default. */
  shouldReturnFocusOnClose?: boolean;
  /** In `div.bp6-portal` at the end of the body; otherwise in place. */
  usePortal?: boolean;
  /**
   * Nothing is drawn until it first opens; on by default. Off, an empty
   * `div.bp6-overlay` is there from the start, as a popover's is. Either way,
   * once it has opened, the empty one stays after it closes, as Blueprint's.
   */
  lazy?: boolean;
  /** The prefix of the transition's classes: `bp6-overlay` by default. */
  transitionName?: string;
  /** How long the enter and exit transitions run: 300ms by default. */
  transitionDuration?: number;
  /** Classes on `div.bp6-overlay`, after Blueprint's own. */
  class: string;
  /**
   * The content, given the classes that make it the overlay's content:
   * `bp6-overlay-content` and the transition's, and the `tabindex` Blueprint
   * gives it, `0` where focus is brought or kept inside.
   */
  content: (
    contentProps: Readonly<{
      class: ClassObject;
      tabIndex: number | undefined;
    }>,
  ) => JSX.Element;
}>;

/**
 * Draws `content` over the page while `isOpen` is on, and for the exit
 * transition after: in `div.bp6-portal` at the end of the body, over a
 * backdrop, with focus brought inside and kept there while it is the overlay on
 * top, and given back where it was once it has closed; each of those as the
 * props leave on.
 */
export const Overlay = ({
  isOpen,
  onClose,
  canEscapeKeyClose = true,
  canOutsideClickClose = true,
  hasBackdrop = true,
  autoFocus = true,
  enforceFocus = true,
  shouldReturnFocusOnClose = true,
  usePortal = true,
  lazy = true,
  transitionName = 'bp6-overlay',
  transitionDuration = 300,
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

  const [hasOpened$, setHasOpened] = createState(!lazy);

  // This overlay in Blueprint's overlay stack, from the opening to the closing,
  // not through the exit transition.
  const self: OverlayEntry = {
    elements: mut_elements,
    marksBody: hasBackdrop && usePortal,
    autoFocuses: autoFocus,
  } as const;

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

      // react-transition-group's `appear`: opened as its transition group is
      // mounted, which is with the overlay, or, for a lazy one, as it first
      // opens.
      const kind =
        first || (lazy && !hasOpened$.getSnapshot().value) ? 'appear' : 'enter';

      // The body first, so that the empty overlay is not drawn for a moment.
      setPhase(kind);

      setHasOpened(true);

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

          if (
            shouldReturnFocusOnClose &&
            giveBack &&
            before instanceof HTMLElement &&
            before.isConnected
          ) {
            before.focus();
          }
        }, transitionDuration);
      });
    }
  });

  // One toggle per class, shared by the four elements that carry them.
  const transitionToggles = transitionClassNames.map(
    ([name]) =>
      [
        `${transitionName}-${name}`,
        view(phase$, (phase) =>
          transitionClassesOf(transitionName, phase).includes(
            `${transitionName}-${name}`,
          ),
        ),
      ] as const,
  );

  const transitionClass = (base: string): ClassObject =>
    classObject([base], transitionToggles);

  const shown = view(phase$, (phase) => phase !== 'closed');

  const body = (
    <OverlayBody
      autoFocus={autoFocus}
      canEscapeKeyClose={canEscapeKeyClose}
      canOutsideClickClose={canOutsideClickClose}
      className={className}
      content={content}
      elements={() => mut_elements}
      enforceFocus={enforceFocus}
      hasBackdrop={hasBackdrop}
      inline={!usePortal}
      isOpen$={isOpen$}
      isOverlayOrAbove={(target) => isInStackFrom(self, target)}
      isThisOnTop={() => isOnTop(self)}
      isUnderNoFocusTaker={() => noFocusTakerAbove(self)}
      setElement={(name, element) => {
        mut_elements[name] = element;
      }}
      transitionClass={transitionClass}
      onClose={onClose}
    />
  );

  const inPortal = (element: JSX.Element): JSX.Element =>
    usePortal ? (
      <Portal>
        <div class={constant('bp6-portal')}>{element}</div>
      </Portal>
    ) : (
      element
    );

  return (
    <If
      cond={shown}
      else={
        <If
          cond={hasOpened$}
          then={inPortal(
            <div
              aria-live={constant('polite')}
              class={classObject([
                'bp6-overlay',
                !usePortal && 'bp6-overlay-inline',
                className,
              ])}
            />,
          )}
        />
      }
      then={inPortal(body)}
    />
  );
};

/** It is the overlay on top. */
export const isOnTop = (entry: OverlayEntry): boolean =>
  mut_overlayStack.at(-1) === entry;

export const enterStack = (entry: OverlayEntry): void => {
  // Read first: `includes` narrows `entry` to `never` past its early return.
  const { marksBody } = entry;

  if (mut_overlayStack.includes(entry)) {
    return;
  }

  mut_overlayStack.push(entry);

  if (marksBody) {
    document.body.classList.add('bp6-overlay-open');
  }
};

export const leaveStack = (entry: OverlayEntry): void => {
  const index = mut_overlayStack.indexOf(entry);

  if (index === -1) {
    return;
  }

  mut_overlayStack.splice(index, 1);

  if (mut_overlayStack.every(({ marksBody }) => !marksBody)) {
    document.body.classList.remove('bp6-overlay-open');
  }
};

/** The transition classes on while in `phase`, after `prefix`. */
export const transitionClassesOf = (
  prefix: string,
  phase: Phase,
): readonly string[] =>
  transitionClassNames
    .filter(([, phases]) => phases.includes(phase))
    .map(([name]) => `${prefix}-${name}`);

export type Phase =
  | 'appear-active'
  | 'appear-done'
  | 'appear'
  | 'closed'
  | 'enter-active'
  | 'enter-done'
  | 'enter'
  | 'exit-active'
  | 'exit';

export type OverlayElements = Readonly<{
  /** `div.bp6-overlay`. */
  overlay: HTMLElement | undefined;
  /** The focus trap before the content. */
  start: HTMLElement | undefined;
  /** The focus trap after the content. */
  end: HTMLElement | undefined;
}>;

/** An overlay in {@link mut_overlayStack}, told apart by identity. */
export type OverlayEntry = Readonly<{
  elements: OverlayElements;
  /** It has a backdrop in a portal, which marks the body. */
  marksBody: boolean;
  /** It brings focus inside itself as it opens (`autoFocus`). */
  autoFocuses: boolean;
}>;

/**
 * The classes react-transition-group's `CSSTransition` gives each child of the
 * overlay, after the transition's prefix, and the phases in which each is on.
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
 * one on top alone holds focus inside itself against focus moving out (a press
 * on a backdrop, or an opening, may still bring it in), and the body carries
 * `bp6-overlay-open`, which Blueprint's style sheets stop the page scrolling
 * by, while any with a backdrop in a portal is open.
 */
const mut_overlayStack: OverlayEntry[] = [];

/** The overlay while it is drawn, mounted afresh each time it opens. */
const OverlayBody = ({
  isOpen$,
  isThisOnTop,
  isUnderNoFocusTaker,
  isOverlayOrAbove,
  elements,
  setElement,
  onClose,
  canEscapeKeyClose,
  canOutsideClickClose,
  hasBackdrop,
  autoFocus,
  enforceFocus,
  inline,
  className,
  content,
  transitionClass,
}: Readonly<{
  isOpen$: InitializedObservable<boolean>;
  isThisOnTop: () => boolean;
  /**
   * No overlay opened after this one takes focus as it opens: one that does
   * not, as a tooltip or a toaster, leaves this one to take it.
   */
  isUnderNoFocusTaker: () => boolean;
  /** `target` is in this overlay or in one opened over it. */
  isOverlayOrAbove: (target: EventTarget | null) => boolean;
  /** Read from the `Overlay`, which owns them. */
  elements: () => OverlayElements;
  setElement: (
    name: keyof OverlayElements,
    element: HTMLElement | undefined,
  ) => void;
  onClose: ((event: Event) => void) | undefined;
  canEscapeKeyClose: boolean;
  canOutsideClickClose: boolean;
  hasBackdrop: boolean;
  autoFocus: boolean;
  enforceFocus: boolean;
  /** In place, not in a portal (`bp6-overlay-inline`). */
  inline: boolean;
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

  // Its own, so that neither this nor the opening's cancels the other.
  const mut_backdropFrame = { id: 0 };

  // As it opens, and as it is opened again during its exit: on the next frame,
  // once it is laid out, unless one opened over it by then has taken focus.
  subscribeInScope(isOpen$, (open) => {
    cancelAnimationFrame(mut_frame.id);

    if (open && autoFocus) {
      mut_frame.id = requestAnimationFrame(() => {
        if (isUnderNoFocusTaker()) {
          bringFocusInside();
        }
      });
    }
  });

  onScopeDispose(() => {
    cancelAnimationFrame(mut_frame.id);

    cancelAnimationFrame(mut_backdropFrame.id);

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
        !enforceFocus ||
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

  // The event being dispatched as it is drawn, as the press that opened it, is
  // not one it hears: Blueprint listens from an effect, after that event. Only
  // `window.event` says which that is; a time or a timer would also drop a
  // press made as it was drawn.
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const drawnDuring = window.event;

  // With no backdrop, a press outside this overlay and those over it.
  listenInScope(document, 'mousedown', (event) => {
    if (
      hasBackdrop ||
      !canOutsideClickClose ||
      event === drawnDuring ||
      !isOpen$.getSnapshot().value ||
      isOverlayOrAbove(event.target)
    ) {
      return;
    }

    onClose?.(event);
  });

  // An overlay that does not take focus, as a tooltip, hears Escape from the
  // document while it is the one on top.
  listenInScope(document, 'keydown', (event) => {
    if (
      autoFocus ||
      !canEscapeKeyClose ||
      !(event instanceof KeyboardEvent) ||
      event.key !== 'Escape' ||
      isImeKeyDown(event) ||
      event.defaultPrevented ||
      !isOpen$.getSnapshot().value ||
      !isThisOnTop()
    ) {
      return;
    }

    onClose?.(event);

    event.stopPropagation();

    event.preventDefault();
  });

  const takesFocus = autoFocus || enforceFocus;

  return (
    <div
      ref={(overlay) => {
        setElement('overlay', overlay);
      }}
      aria-live={constant('polite')}
      class={classObject(
        ['bp6-overlay', inline && 'bp6-overlay-inline', className],
        [['bp6-overlay-open', isOpen$]],
      )}
      onKeyDown={(event) => {
        // An Escape that cancels what an input method is composing is not one
        // that closes, nor one a control in the overlay has taken: a date
        // input's calendar drawn in place, which in Blueprint's is an overlay
        // of its own over this one, and so takes Escape first.
        if (
          !(canEscapeKeyClose && event.key === 'Escape') ||
          isImeKeyDown(event) ||
          event.defaultPrevented
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
      {takesFocus ? (
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
      ) : (
        []
      )}
      {hasBackdrop ? (
        <div
          class={transitionClass('bp6-overlay-backdrop')}
          onMouseDown={(event) => {
            if (canOutsideClickClose && isOpen$.getSnapshot().value) {
              onClose?.(event);
            }

            // As Blueprint's, whatever is open over it, and on the next frame:
            // the press moves focus to the body once its handlers are done.
            if (!enforceFocus) {
              return;
            }

            cancelAnimationFrame(mut_backdropFrame.id);

            // Not into one the press has closed, which is on its way out.
            mut_backdropFrame.id = requestAnimationFrame(() => {
              if (isOpen$.getSnapshot().value) {
                bringFocusInside();
              }
            });
          }}
        />
      ) : (
        []
      )}
      {content({
        class: transitionClass('bp6-overlay-content'),
        tabIndex: takesFocus ? 0 : undefined,
      })}
      {enforceFocus ? (
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
      ) : (
        []
      )}
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

const noFocusTakerAbove = (entry: OverlayEntry): boolean => {
  const index = mut_overlayStack.indexOf(entry);

  return (
    index !== -1 &&
    mut_overlayStack.slice(index + 1).every(({ autoFocuses }) => !autoFocuses)
  );
};

/** `target` is in `entry`'s overlay or in one opened after it. */
const isInStackFrom = (
  entry: OverlayEntry,
  target: EventTarget | null,
): boolean => {
  const index = mut_overlayStack.indexOf(entry);

  return (
    index !== -1 &&
    mut_overlayStack.slice(index).some(
      ({ elements: { overlay } }) =>
        // A press on the overlay's own element, not on what it holds, is
        // outside it, as Blueprint counts it.
        target !== overlay && isInside(target, overlay),
    )
  );
};
