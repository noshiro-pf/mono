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
  For,
  If,
  isImeKeyDown,
  listenInScope,
  render,
  type Child,
  type JSX,
} from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { classObject, intentClass } from '../internal/index.mjs';
import { ButtonGroup } from './button-group.js';
import { Button } from './button.js';
import { Icon, type IconName } from './icon.js';
import type { Intent } from './intent.mjs';
import {
  enterStack,
  isOnTop,
  leaveStack,
  transitionClassesOf,
  type OverlayEntry,
  type Phase,
} from './overlay-parts.js';

/** What {@link Toaster.show} is given: Blueprint's `ToastProps`. */
export type ToastProps = Readonly<{
  message: Child;
  intent?: Intent;
  /** Before the message. */
  icon?: IconName;
  /** Milliseconds before it dismisses itself; `0` or less, never. */
  timeout?: number;
  /** The × after the message; on by default. */
  isCloseButtonShown?: boolean;
  /** Classes on `div.bp6-toast`, after Blueprint's own. */
  class?: string;
  /** Told whether the timeout dismissed it, rather than a person or the code. */
  onDismiss?: (didTimeoutExpire: boolean) => void;
}>;

/** Where the toasts are stacked, as Blueprint's `ToasterPosition`. */
export type ToasterPosition =
  'bottom-left' | 'bottom-right' | 'bottom' | 'top-left' | 'top-right' | 'top';

export type OverlayToasterProps = Readonly<{
  /** `top` by default. */
  position?: ToasterPosition;
  /** Escape dismisses every toast; on by default. */
  canEscapeKeyClear?: boolean;
  /** Showing one more dismisses the oldest. */
  maxToasts?: number;
  /** Classes on `div.bp6-toast-container`, after Blueprint's own. */
  class?: string;
}>;

/** Blueprint's `Toaster`, the handle {@link createToaster} gives. */
export type Toaster = Readonly<{
  /**
   * Shows a toast, newest first, and gives its key. One with the key of a toast
   * still shown, or still waiting to be, replaces it in place.
   */
  show: (props: ToastProps, key?: string) => string;
  dismiss: (key: string) => void;
  /**
   * Dismisses every toast, calling the `onDismiss` of each still shown with
   * `false`, and drops those waiting to be shown, which were never shown.
   */
  clear: () => void;
  /** The toasts shown, newest first. */
  getToasts: () => readonly ShownToast[];
  /**
   * Takes the toaster out of the page, with its toasts and those waiting to be
   * shown, as {@link Toaster.clear} does: the `onDismiss` of each toast still
   * shown is called with `false`, and those waiting are dropped. A toast shown
   * after this, with a key or without, is ignored. Blueprint's toaster has no
   * `remove`: it goes as it is unmounted.
   */
  remove: () => void;
}>;

export type ShownToast = ToastProps & Readonly<{ key: string }>;

/**
 * Blueprint's `OverlayToaster.create`: a toaster drawn in place at the end of
 * `container`, `div.bp6-overlay.bp6-toast-container` once a toast is first
 * shown, with each toast animated in and out as Blueprint's style sheets do.
 * Its `div` joins `container` with that first toast, where Blueprint's joins as
 * the toaster is made.
 * Toasts are shown at least 50 ms apart, as Blueprint queues them, so that
 * their animations keep up.
 *
 * Synchronous, where Blueprint's returns a promise: the toaster is ready once
 * this returns.
 */
export const createToaster = (
  {
    position = 'top',
    canEscapeKeyClear = true,
    maxToasts,
    class: className,
  }: OverlayToasterProps = {},
  container: HTMLElement = document.body,
): Toaster => {
  if (maxToasts !== undefined && maxToasts < 1) {
    throw new Error(
      '[Blueprint] <OverlayToaster> maxToasts is set to an invalid number, must be greater than 0',
    );
  }

  // Added to `container` as the first toast is shown, not here, so that a
  // toaster that never shows one leaves nothing in the page.
  const root = document.createElement('div');

  const [rows$, setRows] = createState<readonly Row[]>([]);

  // The overlay has been drawn: it stays, and a toast shown from now on enters
  // rather than appears.
  const [hasOpened$, setHasOpened] = createState(false);

  const mut_toaster: {
    /** For the keys of toasts shown with none, as Blueprint's `toastId`. */
    keyId: number;
    rowId: number;
    queue: ShownToast[];
    queueTimer: ReturnType<typeof setTimeout> | undefined;
    /** `remove` has been called: a toast shown from now on is ignored. */
    removed: boolean;
    /**
     * The rows whose `onDismiss` is running, which a `dismiss`, `clear` or
     * `remove` it makes does not dismiss again.
     */
    dismissing: Set<number>;
  } = {
    keyId: 0,
    rowId: 0,
    queue: [],
    queueTimer: undefined,
    removed: false,
    dismissing: new Set<number>(),
  };

  const shown = (): readonly Row[] =>
    rows$.getSnapshot().value.filter(({ leaving }) => !leaving);

  /**
   * Shows `toast` at once, dismissing first the oldest past `maxToasts`, as
   * Blueprint's `dismissIfAtLimit`; unless that dismissal removed the toaster.
   */
  const showNow = (toast: ShownToast): void => {
    // Not those already on their way out, whose `onDismiss` may show this.
    const rows = shown().filter(({ id }) => !mut_toaster.dismissing.has(id));

    if (maxToasts !== undefined && rows.length >= maxToasts) {
      const oldest = rows.at(-1);

      if (oldest !== undefined) {
        dismissRows(({ id }) => id === oldest.id, false);
      }

      if (mut_toaster.removed) {
        return;
      }
    }

    const isFirst = !hasOpened$.getSnapshot().value;

    if (isFirst) {
      container.append(root);
    }

    const row: Row = {
      id: mut_toaster.rowId,
      toast,
      leaving: false,
      appears: isFirst,
    } as const;

    mut_toaster.rowId += 1;

    setRows(Arr.toUnshifted(rows$.getSnapshot().value, row));

    setHasOpened(true);
  };

  const runQueue = (): void => {
    mut_toaster.queueTimer = setTimeout(() => {
      const next = mut_toaster.queue.shift();

      if (next === undefined) {
        mut_toaster.queueTimer = undefined;
      } else {
        runQueue();

        showNow(next);

        keepSpacing();
      }
    }, queueDelay);
  };

  /**
   * Arms the queue's timer again when a `clear` an `onDismiss` made while a
   * toast was being shown took it away, so that the next still waits.
   */
  const keepSpacing = (): void => {
    if (!mut_toaster.removed && mut_toaster.queueTimer === undefined) {
      runQueue();
    }
  };

  const replace = (toast: ShownToast): boolean => {
    const queued = mut_toaster.queue.findIndex(({ key }) => key === toast.key);

    if (queued !== -1) {
      mut_toaster.queue[queued] = toast;

      return true;
    }

    const rows = rows$.getSnapshot().value;

    if (rows.every((row) => row.leaving || row.toast.key !== toast.key)) {
      return false;
    }

    setRows(
      rows.map((row) =>
        !row.leaving && row.toast.key === toast.key ? { ...row, toast } : row,
      ),
    );

    return true;
  };

  const show = (props: ToastProps, key?: string): string => {
    const toast: ShownToast = {
      ...props,
      key: key ?? `toast-${mut_toaster.keyId.toString()}`,
    } as const;

    if (key === undefined) {
      mut_toaster.keyId += 1;
    }

    // Neither shown nor put in place of one, as from an `onDismiss` that
    // `remove` calls.
    if (mut_toaster.removed) {
      return toast.key;
    }

    if (key !== undefined && replace(toast)) {
      return toast.key;
    }

    if (mut_toaster.queueTimer === undefined) {
      runQueue();

      showNow(toast);

      keepSpacing();
    } else {
      mut_toaster.queue.push(toast);
    }

    return toast.key;
  };

  /**
   * Calls the `onDismiss` of the rows `dismissed` picks, then marks them as
   * leaving, as Blueprint's calls it while the toast is still listed. A row
   * whose `onDismiss` is running is not picked again by what that callback
   * does; a toast it shows stays.
   */
  const dismissRows = (
    dismissed: (row: Row) => boolean,
    didTimeoutExpire: boolean,
  ): void => {
    const leaving = shown().filter(
      (row) => !mut_toaster.dismissing.has(row.id) && dismissed(row),
    );

    if (Arr.isEmpty(leaving)) {
      return;
    }

    for (const { id } of leaving) {
      mut_toaster.dismissing.add(id);
    }

    callOnDismiss(leaving, didTimeoutExpire);

    for (const { id } of leaving) {
      mut_toaster.dismissing.delete(id);
    }

    if (mut_toaster.removed) {
      return;
    }

    // A row whose toast a callback replaced, by showing one with its key, stays
    // with the new toast.
    const toastOf = new Map(leaving.map((row) => [row.id, row.toast]));

    setRows(
      rows$
        .getSnapshot()
        .value.map((row) =>
          toastOf.get(row.id) === row.toast ? { ...row, leaving: true } : row,
        ),
    );
  };

  const dismiss = (key: string, didTimeoutExpire: boolean): void => {
    dismissRows((row) => row.toast.key === key, didTimeoutExpire);
  };

  const dropQueue = (): void => {
    clearTimeout(mut_toaster.queueTimer);

    mut_toaster.queueTimer = undefined;

    mut_toaster.queue = [];
  };

  /** Drops the toasts waiting, and dismisses those shown. */
  const clear = (): void => {
    dropQueue();

    dismissRows(() => true, false);
  };

  const removeRow = (id: number): void => {
    setRows(rows$.getSnapshot().value.filter((row) => row.id !== id));
  };

  const unmount = render(
    () => (
      <ToastContainer
        canEscapeKeyClear={canEscapeKeyClear}
        className={className}
        hasOpened$={hasOpened$}
        position={position}
        rows$={rows$}
        onClear={clear}
        onDismiss={dismiss}
        onExited={removeRow}
      />
    ),
    root,
  );

  return {
    show,
    dismiss: (key) => {
      dismiss(key, false);
    },
    clear,
    getToasts: () => shown().map(({ toast }) => toast),
    remove: () => {
      if (mut_toaster.removed) {
        return;
      }

      mut_toaster.removed = true;

      dropQueue();

      // Those a `dismiss` or `clear` is already telling are left to it.
      const shownRows = shown().filter(
        ({ id }) => !mut_toaster.dismissing.has(id),
      );

      // Out of the page first, with nothing left for a callback to dismiss,
      // clear or show again.
      unmount();

      setRows([]);

      root.remove();

      callOnDismiss(shownRows, false);
    },
  };
};

/** A toast in the toaster, from its showing to the end of its exit. */
type Row = Readonly<{
  /** Its own, apart from the key, which a toast shown later may reuse. */
  id: number;
  toast: ShownToast;
  /** Dismissed, and in its exit transition. */
  leaving: boolean;
  /** Shown as the overlay is first drawn: react-transition-group's `appear`. */
  appears: boolean;
}>;

/** `OVERLAY_TOASTER_DELAY_MS`. */
const queueDelay = 50;

/** `$pt-transition-duration * 3 + $pt-transition-duration / 2`. */
const transitionDuration = 350;

/**
 * Calls each row's `onDismiss`, the next still called when one throws, which is
 * reported as an uncaught error would be.
 */
const callOnDismiss = (
  rows: readonly Row[],
  didTimeoutExpire: boolean,
): void => {
  for (const row of rows) {
    try {
      row.toast.onDismiss?.(didTimeoutExpire);
    } catch (error: unknown) {
      // As an uncaught error, where `reportError` is not, as in Node.js.
      if (typeof globalThis.reportError === 'function') {
        globalThis.reportError(error);
      } else {
        queueMicrotask(() => {
          throw error;
        });
      }
    }
  }
};

/**
 * Blueprint's `Toast`, as `Overlay2` decorates it: its timeout waits while the
 * pointer is over it or focus is in it, and starts afresh once they leave.
 */
const ToastView = ({
  row$,
  onDismiss,
  onExited,
}: Readonly<{
  row$: InitializedObservable<Row>;
  onDismiss: (key: string, didTimeoutExpire: boolean) => void;
  onExited: (rowId: number) => void;
}>): JSX.Element => {
  const { id, appears } = row$.getSnapshot().value;

  const kind = appears ? 'appear' : 'enter';

  const [entering$, setEntering] = createState<Phase>(kind);

  const [exitActive$, setExitActive] = createState(false);

  // Its exit follows its dismissal, which the row says.
  const phase$ = derive(
    [entering$, row$, exitActive$],
    (entering, { leaving }, exitActive): Phase =>
      leaving ? (exitActive ? 'exit-active' : 'exit') : entering,
  );

  const afterUpdate = createAfterUpdate();

  const mut_timers: {
    transition: ReturnType<typeof setTimeout> | undefined;
    dismiss: ReturnType<typeof setTimeout> | undefined;
  } = { transition: undefined, dismiss: undefined };

  onScopeDispose(() => {
    clearTimeout(mut_timers.transition);

    clearTimeout(mut_timers.dismiss);
  });

  const mut_last: { timeout: number | undefined; leaving: boolean } = {
    timeout: undefined,
    leaving: false,
  };

  afterUpdate(() => {
    // Dismissed as it was shown: its exit has taken over.
    if (mut_last.leaving) {
      return;
    }

    setEntering(`${kind}-active`);

    mut_timers.transition = setTimeout(() => {
      setEntering(kind === 'appear' ? 'appear-done' : 'enter-done');
    }, transitionDuration);
  });

  const timeoutOf = (row: Row): number => row.toast.timeout ?? 5000;

  const stopTimeout = (): void => {
    clearTimeout(mut_timers.dismiss);

    mut_timers.dismiss = undefined;
  };

  const startTimeout = (): void => {
    stopTimeout();

    const row = row$.getSnapshot().value;

    const timeout = timeoutOf(row);

    if (timeout > 0 && !row.leaving) {
      mut_timers.dismiss = setTimeout(() => {
        onDismiss(row$.getSnapshot().value.toast.key, true);
      }, timeout);
    }
  };

  row$.subscribe((row) => {
    if (row.leaving) {
      stopTimeout();

      if (!mut_last.leaving) {
        mut_last.leaving = true;

        clearTimeout(mut_timers.transition);

        afterUpdate(() => {
          setExitActive(true);

          mut_timers.transition = setTimeout(() => {
            onExited(id);
          }, transitionDuration);
        });
      }

      return;
    }

    // Started as it is shown, and again only as its timeout changes, as
    // Blueprint's effect on `timeout` is.
    const timeout = timeoutOf(row);

    if (timeout === mut_last.timeout) {
      return;
    }

    mut_last.timeout = timeout;

    startTimeout();
  });

  // Whole, as a toast replaced by its key may bring other classes of its own.
  const className$ = derive([row$, phase$], ({ toast }, phase) =>
    [
      'bp6-toast',
      intentClass(toast.intent ?? 'none'),
      toast.class,
      'bp6-overlay-content',
      ...transitionClassesOf('bp6-toast', phase),
    ]
      .filter((name) => name !== undefined && name !== '')
      .join(' '),
  );

  return (
    <div
      // React's `onFocus` and `onBlur`, which bubble; they go with the element.
      ref={(element) => {
        element.addEventListener('focusin', stopTimeout);

        element.addEventListener('focusout', startTimeout);
      }}
      class={className$}
      tabIndex={constant(0)}
      onMouseEnter={stopTimeout}
      onMouseLeave={startTimeout}
    >
      {/* Drawn afresh as the toast is replaced by one with its key. */}
      <For
        items={row$.pipe(map(({ toast }) => [toast]))}
        key={(toast) => toast}
      >
        {(toast$) => {
          const toast = toast$.getSnapshot().value;

          return (
            <>
              {toast.icon === undefined ? [] : <Icon icon={toast.icon} />}
              <span
                class={constant('bp6-toast-message')}
                role={constant('alert')}
              >
                {toast.message}
              </span>
              <ButtonGroup minimal={true}>
                {toast.isCloseButtonShown === false ? (
                  []
                ) : (
                  <Button
                    aria-label={constant('Close')}
                    icon={'cross'}
                    onClick={() => {
                      onDismiss(toast.key, false);
                    }}
                  />
                )}
              </ButtonGroup>
            </>
          );
        }}
      </For>
    </div>
  );
};

/** `Overlay2` round the toasts, which is drawn once the first is shown. */
const ToastContainer = ({
  rows$,
  hasOpened$,
  position,
  canEscapeKeyClear,
  className,
  onDismiss,
  onClear,
  onExited,
}: Readonly<{
  rows$: InitializedObservable<readonly Row[]>;
  hasOpened$: InitializedObservable<boolean>;
  position: ToasterPosition;
  canEscapeKeyClear: boolean;
  className: string | undefined;
  onDismiss: (key: string, didTimeoutExpire: boolean) => void;
  onClear: () => void;
  onExited: (rowId: number) => void;
}>): JSX.Element => {
  const isOpen$ = derive([rows$], (rows) =>
    rows.some(({ leaving }) => !leaving),
  );

  const mut_elements: {
    overlay: HTMLElement | undefined;
    start: HTMLElement | undefined;
    end: HTMLElement | undefined;
  } = { overlay: undefined, start: undefined, end: undefined };

  const self: OverlayEntry = {
    elements: mut_elements,
    marksBody: false,
    autoFocuses: false,
  } as const;

  // In Blueprint's overlay stack while a toast is shown, so that Escape is the
  // toaster's only while no overlay opened after it is open.
  isOpen$.subscribe((open) => {
    if (open) {
      enterStack(self);
    } else {
      leaveStack(self);
    }
  });

  onScopeDispose(() => {
    leaveStack(self);
  });

  const clearOnEscape = (event: KeyboardEvent): void => {
    if (
      !canEscapeKeyClear ||
      event.key !== 'Escape' ||
      isImeKeyDown(event) ||
      !isOpen$.getSnapshot().value
    ) {
      return;
    }

    onClear();

    event.stopPropagation();

    event.preventDefault();
  };

  // It takes no focus, so it hears Escape from the document while it is the
  // overlay on top, as Blueprint's tooltips do.
  listenInScope(document, 'keydown', (event) => {
    if (event instanceof KeyboardEvent && isOnTop(self)) {
      clearOnEscape(event);
    }
  });

  return (
    <If
      cond={hasOpened$}
      then={
        <div
          ref={(overlay) => {
            mut_elements.overlay = overlay;
          }}
          aria-live={constant('polite')}
          class={classObject(
            [
              'bp6-overlay',
              'bp6-overlay-inline',
              'bp6-toast-container',
              ...position
                .split('-')
                .map((side) => `bp6-toast-container-${side}`),
              'bp6-toast-container-inline',
              className,
            ],
            [['bp6-overlay-open', isOpen$]],
          )}
          onKeyDown={clearOnEscape}
        >
          <For items={rows$} key={(row) => row.id}>
            {(row$) => (
              <ToastView
                row$={row$}
                onDismiss={onDismiss}
                onExited={onExited}
              />
            )}
          </For>
        </div>
      }
    />
  );
};
