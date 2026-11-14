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
  type JSX,
} from 'synstate-dom';
import { Arr, fastDeepEqual, Optional } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type {
  PaneId,
  PaneState,
  PaneZoomStep,
  Rect,
} from '../layout/index.mjs';
import {
  asFrameToPageMessage,
  paneFrameNamePrefix,
  splitViewMessageTag,
  type FrameCommand,
  type PageToFrameMessage,
} from '../shared/index.mjs';
import {
  hostnameOf,
  originOf,
  unframeableKindOf,
  type UnframeableKind,
  type WorkspaceAction,
} from '../state/index.mjs';
import { Icon } from './icon.js';
import { PaneFallback } from './pane-fallback.js';
import {
  PaneMenuItem,
  type PaneMenuAction,
  type PaneMenuChoice,
} from './pane-menu-item.js';
import { PaneZoomControls } from './pane-zoom-controls.js';

/**
 * How long after a frame has loaded its content script has to report.
 *
 * The page greets a frame on its `load` event and the content script answers
 * with the address and the title, so a document that can be scripted at all has
 * answered within a round trip of that. Silence past this is what "the frame is
 * showing something else" looks like from outside: an error page, a refusal to
 * be framed, a viewer of the browser's own.
 *
 * Measured, and the reason this is a `load` event rather than a clock: a frame
 * fires `load` exactly once whether the response was a page, an
 * `X-Frame-Options` refusal, a 403 with no body or a connection error — so
 * "loaded, and nobody answered" is an answer, where a fixed timer would call
 * every slow page a failure.
 */
const greetingGraceMs = 800;

/**
 * How many times a pane clears an always-clear site's workers by itself before
 * it stops and says so.
 *
 * Two: one clear is what the ordinary case needs, and the second covers the
 * clear that arrives too early — a worker registered while the page was loading
 * is not there yet when the clear runs, so the load after it is answered from
 * the worker after all. Past that, the thing keeping the pane from loading is
 * not a worker, and a pane that reloads every second is worse than a pane that
 * says it did not load.
 */
const maxAutomaticClears = 2;

/**
 * The backstop, for a frame that does not even get as far as loading.
 *
 * A request the server never answers has no `load` event to read, and neither
 * has an address Chrome refuses to navigate to — it keeps the frame on whatever
 * it was showing. Long, because all that is being waited for here is the first
 * byte.
 */
const noAnswerTimeoutMs = 10_000;

/**
 * Everything except top-level navigation.
 *
 * Dropping `allow-top-navigation` is what stops a framed page from replacing
 * the whole split view with itself — the classic "frame buster", which the
 * header-stripping rule would otherwise leave free to run. It cannot be done
 * from the page's side instead: `window.top` is unforgeable, and assigning to a
 * cross-origin `top.location` is allowed by design.
 *
 * `allow-same-origin` is what keeps the frame's own origin, and with it its
 * cookies and storage. Without it the pane would be logged out of everything.
 */
const paneSandboxTokens = [
  'allow-same-origin',
  'allow-scripts',
  'allow-forms',
  'allow-modals',
  'allow-popups',
  'allow-popups-to-escape-sandbox',
  'allow-downloads',
  'allow-storage-access-by-user-activation',
  'allow-presentation',
  'allow-orientation-lock',
  'allow-pointer-lock',
].join(' ');

/**
 * The width at which a pane's toolbar stops holding everything.
 *
 * Below it the zoom controls, the sandbox toggle, the split buttons and "open
 * in a new tab" move into the menu. Above it they are inline and the menu holds
 * only what is always in it.
 */
const compactPaneWidthPx = 440;

/** Delegated permissions, so that a pane is not a second-class browser tab. */
const paneAllowList = [
  'autoplay',
  'clipboard-read',
  'clipboard-write',
  'encrypted-media',
  'fullscreen',
  'picture-in-picture',
].join('; ');

/** What the layout says about one pane, as one value per update of it. */
export type PaneView = Readonly<{
  pane: PaneState;
  rect: Rect;
  active: boolean;
  canClose: boolean;
  /** This is the pane being dragged somewhere else. */
  moving: boolean;
}>;

type Props = Readonly<{
  /** Fixed for the life of the component: a pane is keyed by its id. */
  paneId: PaneId;
  view$: InitializedObservable<PaneView>;
  /** Origins whose service workers are removed without being asked. */
  resetOrigins: InitializedObservable<readonly string[]>;
  dispatch: (action: WorkspaceAction) => void;
  /** The grip was pressed; the page follows the pointer from there. */
  onMoveStart: (paneId: PaneId) => void;
  /** Goes through the page rather than the reducer; see `app.tsx`. */
  onNavigate: (paneId: PaneId, input: string) => void;
  onToggleResetOrigin: (toggledOrigin: string, enabled: boolean) => void;
}>;

export const PaneFrame = ({
  paneId,
  view$,
  resetOrigins,
  dispatch,
  onMoveStart,
  onNavigate,
  onToggleResetOrigin,
}: Props): JSX.Element => {
  const afterUpdate = createAfterUpdate();

  const [load$, , { updateState: updateLoad }] =
    createState<LoadState>(initialLoadState);

  /** Writes the fields of `patch`, and nothing at all when none of them differ. */
  const patchLoad = (patch: Partial<LoadState>): void => {
    updateLoad((current) => {
      const next = { ...current, ...patch } as const;

      return fastDeepEqual(current, next) ? current : next;
    });
  };

  const pane$ = view$.pipe(map((paneView) => paneView.pane));

  // Compared by value: the layout makes every rectangle afresh, and a splitter
  // drag would otherwise rewrite every pane's position on each move.
  const rect$ = view$.pipe(
    map((paneView) => paneView.rect, { equals: fastDeepEqual }),
  );

  /**
   * Whether this pane is too narrow for its whole toolbar.
   *
   * A width rather than a measurement: the pane's rectangle is already known
   * here. The number is what the toolbar needs — the grip, three navigation
   * buttons, the close button and the menu come to about 130px, the collapsible
   * half to about 150, and an address bar wants the rest.
   *
   * Apart from the model below, which a splitter drag would otherwise recompute
   * for every pane on every pointer move.
   */
  const compact$ = rect$.pipe(map((rect) => rect.width < compactPaneWidthPx));

  const model$ = derive([pane$, compact$, load$, resetOrigins], paneModelOf);

  const address$ = model$.pipe(map((model) => model.address));

  const menuItems$ = model$.pipe(map((model) => model.menuItems));

  const mut_state: {
    paneFrame: HTMLIFrameElement | undefined;
    resetFrame: HTMLIFrameElement | undefined;
    menuRoot: HTMLSpanElement | undefined;
    addressInput: HTMLInputElement | undefined;
    /**
     * Reports since the frame's last `load` event, counted rather than
     * remembered: `pane.currentUrl` says that *some* document answered, and a
     * pane that follows a link into a page which will not be framed has to
     * notice that the next one did not.
     *
     * Zeroed by the `load` handler itself, before the greeting goes out, so
     * that the answer the *previous* document gave to its own greeting is not
     * counted for the next one.
     */
    reportsSinceLoad: number;
    /**
     * Where the document in the frame said it was navigating to, until a
     * document answers from there. See `frame-agent.mts`.
     */
    leavingFor: string | undefined;
    /** `loadKey` for the timers below, which outlive the update they were set in. */
    loadKey: string;
    greetingTimer: ReturnType<typeof setTimeout> | undefined;
    noAnswerTimer: ReturnType<typeof setTimeout> | undefined;
    resetTimer: ReturnType<typeof setTimeout> | undefined;
  } = {
    paneFrame: undefined,
    resetFrame: undefined,
    menuRoot: undefined,
    addressInput: undefined,
    reportsSinceLoad: 0,
    leavingFor: undefined,
    loadKey: Optional.unwrap(model$.getSnapshot()).loadKey,
    greetingTimer: undefined,
    noAnswerTimer: undefined,
    resetTimer: undefined,
  };

  onScopeDispose(() => {
    clearTimeout(mut_state.greetingTimer);

    clearTimeout(mut_state.noAnswerTimer);

    clearTimeout(mut_state.resetTimer);
  });

  /**
   * Loads the pane afresh, in a new element: at the address a link was taking
   * it to when the frame said so, and at the last address it reported
   * otherwise.
   *
   * The document that failed is the one a link led to, so reloading the last
   * page that reported would put the user back where they clicked.
   */
  const replaceFrame = (): void => {
    const destination = mut_state.leavingFor;

    mut_state.leavingFor = undefined;

    if (destination === undefined) {
      dispatch({ type: 'reload', paneId });
    } else {
      onNavigate(paneId, destination);
    }
  };

  const sendToFrame = (message: PageToFrameMessage): void => {
    // `'*'` as the target origin: the pane's origin is whatever the user
    // navigated to, and the message carries nothing worth protecting.
    mut_state.paneFrame?.contentWindow?.postMessage(message, '*');
  };

  const sendCommand = (command: FrameCommand): void => {
    sendToFrame({ tag: splitViewMessageTag, kind: 'command', paneId, command });
  };

  const announceToFrame = (): void => {
    sendToFrame({ tag: splitViewMessageTag, kind: 'assign', paneId });
  };

  // What the frame says about itself. `event.source` is compared with this
  // pane's own frame, so that a page cannot report on another pane's behalf.
  listenInScope(globalThis, 'message', (messageEvent) => {
    if (!(messageEvent instanceof MessageEvent)) {
      return;
    }

    const fromPane = isFrameOf(
      mut_state.paneFrame?.contentWindow,
      messageEvent.source,
    );

    const fromReset = isFrameOf(
      mut_state.resetFrame?.contentWindow,
      messageEvent.source,
    );

    if (!fromPane && !fromReset) {
      return;
    }

    const message = asFrameToPageMessage(messageEvent.data);

    if (message === undefined) {
      return;
    }

    if (message.kind === 'service-workers') {
      // Two clears reach here and only one of them is a repair. The helper
      // frame's is: the pane is blocked, the worker that was answering for it
      // is gone, and the reload is what finally shows the page. The one sent
      // into a pane that is *working* is housekeeping — the site registers a
      // worker on every visit and the next navigation would be the one it
      // answers — and reloading after that throws away the page the user is
      // reading, about 40ms after it arrived. Measured: it doubled every load
      // on an origin on the list.
      if (fromReset) {
        patchLoad({
          serviceWorkersRemoved: message.count,
          resetUrl: undefined,
        });

        replaceFrame();
      }

      return;
    }

    if (message.kind === 'leaving') {
      if (fromPane) {
        mut_state.leavingFor = message.url;
      }

      return;
    }

    if (message.kind === 'zoom') {
      // `paneId` rather than the id in the message: a frame may zoom the pane
      // it is in and no other.
      if (fromPane) {
        dispatch({ type: 'zoom', paneId, step: message.step });
      }

      return;
    }

    if (message.kind !== 'state') {
      // `shortcut` is handled by the page, which is what knows the list of
      // workspaces; a pane has nothing to do with it.
      return;
    }

    if (fromReset) {
      // The helper frame is only there to carry the one command.
      return;
    }

    // Something is running in the frame, so whatever is in it now is a document
    // the extension can see into — and any fallback over it is wrong from this
    // moment on.
    mut_state.reportsSinceLoad += 1;

    mut_state.leavingFor = undefined;

    // A document that answered is a document that loaded, so whatever the
    // automatic clears have spent getting here, they have spent it well and
    // start again from the next failure.
    patchLoad({ blockedLoad: undefined, automaticClears: 0 });

    dispatch({
      type: 'report',
      paneId,
      url: message.url,
      title: message.title,
      historyLength: message.historyLength,
    });
  });

  // Nothing at all for long enough is said out loud, rather than left as a
  // blank pane. Only while no document has answered for this load.
  model$
    .pipe(map((model) => (model.agentSeen ? undefined : model.loadKey)))
    .subscribe((waitingFor) => {
      clearTimeout(mut_state.noAnswerTimer);

      mut_state.noAnswerTimer =
        waitingFor === undefined
          ? undefined
          : setTimeout(() => {
              patchLoad({ waitedFor: waitingFor });
            }, noAnswerTimeoutMs);
    });

  // A new address, or a reload, starts all of that over — including a clear
  // still waiting on its helper frame, which was for the document before.
  model$.pipe(map((model) => model.loadKey)).subscribe((loadKey) => {
    mut_state.loadKey = loadKey;

    mut_state.reportsSinceLoad = 0;

    mut_state.leavingFor = undefined;

    afterUpdate(() => {
      patchLoad({ fallbackDismissed: false, resetUrl: undefined });
    });
  });

  /**
   * What the frame's `load` event meant, decided a round trip later. The count
   * is read when the time is up rather than watched, so a report that arrives
   * in between still counts as an answer.
   */
  const handleFrameLoad = (): void => {
    mut_state.reportsSinceLoad = 0;

    announceToFrame();

    // A document of its own gets a fallback of its own: a pane whose fallback
    // was sent away and which then followed a link into another page that will
    // not frame should say so again.
    patchLoad({ fallbackDismissed: false });

    clearTimeout(mut_state.greetingTimer);

    mut_state.greetingTimer = setTimeout(() => {
      if (mut_state.reportsSinceLoad === 0) {
        patchLoad({ blockedLoad: mut_state.loadKey });
      }
    }, greetingGraceMs);
  };

  // With the origin on the list, a pane that cannot load does not wait to be
  // asked: the worker is removed and the pane reloaded, once per load. While
  // such a pane is loading fine, the content script in it keeps the worker away
  // by itself; see `keepServiceWorkersAway` in `frame-agent.mts`.
  model$.subscribe(() => {
    afterUpdate(() => {
      const { alwaysReset, blockedBySite, loadKey, siteOrigin } =
        Optional.unwrap(model$.getSnapshot());

      const { resetUrl, resetAttemptedFor, automaticClears } = Optional.unwrap(
        load$.getSnapshot(),
      );

      if (
        !alwaysReset ||
        !blockedBySite ||
        siteOrigin === undefined ||
        resetUrl !== undefined ||
        resetAttemptedFor === loadKey ||
        automaticClears >= maxAutomaticClears
      ) {
        return;
      }

      patchLoad({
        resetAttemptedFor: loadKey,
        automaticClears: automaticClears + 1,
        resetUrl: `${siteOrigin}/`,
      });
    });
  });

  // A helper frame that never answers — its address answered by the site's
  // worker as well, or not reachable at all — is given up on, so that the pane
  // says it did not load instead of waiting on it for good. Nothing else ends
  // the wait: the button to clear again would set the address the helper
  // already has.
  load$.pipe(map((load) => load.resetUrl)).subscribe((resetUrl) => {
    clearTimeout(mut_state.resetTimer);

    mut_state.resetTimer =
      resetUrl === undefined
        ? undefined
        : setTimeout(() => {
            patchLoad({ resetUrl: undefined });
          }, noAnswerTimeoutMs);
  });

  // A pane that grows out of being compact should not leave a menu open over
  // the controls that have just come back into the toolbar.
  compact$.subscribe(() => {
    afterUpdate(() => {
      patchLoad({ menuOpen: false });
    });
  });

  // A menu whose items have all gone is unmounted with it; closed too, so that
  // it does not come back open when the pane has items again.
  menuItems$.subscribe((menuItems) => {
    if (!Arr.isNonEmpty(menuItems)) {
      afterUpdate(() => {
        patchLoad({ menuOpen: false });
      });
    }
  });

  /**
   * Escape, or a click anywhere but in the menu, closes it. Listened for from
   * the open menu's own scope, so only while it is open.
   */
  const listenForMenuClose = (): void => {
    listenInScope(globalThis, 'pointerdown', (pointerEvent) => {
      const { menuRoot } = mut_state;

      if (
        menuRoot !== undefined &&
        pointerEvent.target instanceof Node &&
        !menuRoot.contains(pointerEvent.target)
      ) {
        patchLoad({ menuOpen: false });
      }
    });

    listenInScope(globalThis, 'keydown', (keyboardEvent) => {
      if (
        keyboardEvent instanceof KeyboardEvent &&
        keyboardEvent.key === 'Escape' &&
        !isImeKeyDown(keyboardEvent)
      ) {
        patchLoad({ menuOpen: false });
      }
    });
  };

  const handleReload = (): void => {
    const { agentSeen, frameBlocked } = Optional.unwrap(model$.getSnapshot());

    // Reloading through the agent keeps the frame's history; replacing the
    // element is the only way to reload a pane that has no agent — including
    // one whose agent answered for an earlier document than the one there now,
    // which is what a link into a page that will not frame leaves.
    if (agentSeen && !frameBlocked) {
      sendCommand('reload');
    } else {
      replaceFrame();
    }
  };

  const handleResetServiceWorkers = (): void => {
    const { siteOrigin } = Optional.unwrap(model$.getSnapshot());

    if (siteOrigin !== undefined) {
      patchLoad({
        serviceWorkersRemoved: undefined,
        resetUrl: `${siteOrigin}/`,
      });
    }
  };

  const handleOpenExternally = (): void => {
    const { address, frameBlocked } = Optional.unwrap(model$.getSnapshot());

    // A pane that followed a link into a page that will not frame is still
    // showing the address it came from; the page wanted is the other one.
    const target = frameBlocked ? (mut_state.leavingFor ?? address) : address;

    if (target !== '') {
      chrome.tabs.create({ url: target }).catch(console.error);
    }
  };

  const handleToggleSandbox = (): void => {
    dispatch({
      type: 'set-sandboxed',
      paneId,
      sandboxed: !Optional.unwrap(pane$.getSnapshot()).sandboxed,
    });
  };

  const handleZoom = (step: PaneZoomStep): void => {
    dispatch({ type: 'zoom', paneId, step });
  };

  const handleSplitRow = (): void => {
    dispatch({ type: 'split', paneId, axis: 'row' });
  };

  const handleSplitColumn = (): void => {
    dispatch({ type: 'split', paneId, axis: 'column' });
  };

  const menuActions: ReadonlyRecord<PaneMenuChoice, () => void> = {
    'clear-service-workers': handleResetServiceWorkers,
    'toggle-always-clear': () => {
      const { alwaysReset, siteOrigin } = Optional.unwrap(model$.getSnapshot());

      if (siteOrigin !== undefined) {
        onToggleResetOrigin(siteOrigin, !alwaysReset);
      }
    },
    'open-externally': handleOpenExternally,
    'toggle-sandbox': handleToggleSandbox,
    'split-row': handleSplitRow,
    'split-column': handleSplitColumn,
  } as const;

  const handleResetFrameLoad = (): void => {
    const target = mut_state.resetFrame?.contentWindow;

    if (target === null || target === undefined) {
      return;
    }

    target.postMessage(
      { tag: splitViewMessageTag, kind: 'assign', paneId },
      '*',
    );

    target.postMessage(
      { tag: splitViewMessageTag, kind: 'unregister-service-workers', paneId },
      '*',
    );
  };

  const sandboxTitle = pane$.pipe(
    map((pane) =>
      pane.sandboxed
        ? 'Turn the sandbox off (this page will be able to reach the frames above it)'
        : 'Turn the sandbox on',
    ),
  );

  return (
    <section
      ref={(element) => {
        // Capture, so that a press on a control in the bar makes this the
        // active pane before the control acts.
        listenInScope(
          element,
          'pointerdown',
          () => {
            dispatch({ type: 'activate', paneId });
          },
          { capture: true },
        );
      }}
      class={view$.pipe(
        map((paneView) => paneClassName(paneView.active, paneView.moving)),
      )}
      data-e2e={constant('pane')}
      style={{
        left: rect$.pipe(map((rect) => `${rect.left}px`)),
        top: rect$.pipe(map((rect) => `${rect.top}px`)),
        width: rect$.pipe(map((rect) => `${rect.width}px`)),
        height: rect$.pipe(map((rect) => `${rect.height}px`)),
      }}
    >
      <header class={constant('pane__bar')}>
        <button
          aria-label={constant('Move this pane')}
          class={constant('pane__grip')}
          title={constant(
            'Drag to move. Drop on the middle of another pane to swap places with it, on an edge to take that side of it. Neither reloads.',
          )}
          type={constant('button')}
          onPointerDown={(pointerEvent) => {
            // Without this the press starts a text selection that follows the
            // pointer across the panes for the length of the drag.
            pointerEvent.preventDefault();

            onMoveStart(paneId);
          }}
        >
          <Icon icon={'grip'} />
        </button>
        <button
          aria-label={constant('Back')}
          class={constant('pane__button')}
          disabled={pane$.pipe(
            map(
              (pane) =>
                pane.currentUrl === undefined || pane.historyLength <= 1,
            ),
          )}
          title={constant('Back')}
          type={constant('button')}
          onClick={() => {
            sendCommand('back');
          }}
        >
          <Icon icon={'back'} />
        </button>
        <button
          aria-label={constant('Forward')}
          class={constant('pane__button')}
          disabled={pane$.pipe(map((pane) => pane.currentUrl === undefined))}
          title={constant('Forward')}
          type={constant('button')}
          onClick={() => {
            sendCommand('forward');
          }}
        >
          <Icon icon={'forward'} />
        </button>
        <button
          aria-label={constant('Reload')}
          class={constant('pane__button')}
          disabled={pane$.pipe(map((pane) => pane.url === ''))}
          title={constant('Reload')}
          type={constant('button')}
          onClick={handleReload}
        >
          <Icon icon={'reload'} />
        </button>

        <form
          class={constant('pane__address')}
          onSubmit={(submitEvent) => {
            submitEvent.preventDefault();

            onNavigate(
              paneId,
              mut_state.addressInput?.value ??
                Optional.unwrap(address$.getSnapshot()),
            );
          }}
        >
          <If
            cond={address$.pipe(map((address) => address !== ''))}
            then={
              <img
                alt={constant('')}
                class={constant('pane__favicon')}
                src={address$.pipe(map(faviconUrlOf))}
              />
            }
          />
          <input
            ref={(element) => {
              mut_state.addressInput = element;
            }}
            aria-label={constant('Address')}
            class={constant('pane__input')}
            placeholder={constant('Address, or something to search for')}
            spellcheck={constant(false)}
            type={constant('text')}
            // Written whenever the address changes, and only then: a draft
            // being typed stays until the pane goes somewhere.
            value={address$}
          />
        </form>

        <If
          cond={compact$.pipe(map((compact) => !compact))}
          then={<PaneZoomControls pane$={pane$} onZoom={handleZoom} />}
        />

        <If
          cond={load$.pipe(
            map((load) => load.serviceWorkersRemoved !== undefined),
          )}
          then={
            <span
              class={constant('pane__warning')}
              title={constant('Service workers removed')}
            >
              {load$.pipe(
                map(
                  (load) =>
                    `SW-${load.serviceWorkersRemoved?.toString() ?? ''}`,
                ),
              )}
            </span>
          }
        />

        <If
          cond={model$.pipe(map((model) => model.blocked))}
          then={
            <span
              class={constant('pane__warning')}
              title={constant(
                'No answer from this page. It may be refusing to be framed, or be a page the extension cannot run its script in \u{2014} a chrome:// URL, the Web Store, an error page.',
              )}
            >
              <Icon icon={'warning'} />
            </span>
          }
        />

        <If
          cond={compact$.pipe(map((compact) => !compact))}
          then={
            <>
              <button
                aria-label={constant('Open in a new tab')}
                class={constant('pane__button')}
                disabled={address$.pipe(map((address) => address === ''))}
                title={constant('Open in a new tab')}
                type={constant('button')}
                onClick={handleOpenExternally}
              >
                <Icon icon={'external'} />
              </button>
              <button
                aria-label={sandboxTitle}
                class={pane$.pipe(
                  map((pane) =>
                    pane.sandboxed
                      ? 'pane__button'
                      : 'pane__button pane__button--warn',
                  ),
                )}
                title={sandboxTitle}
                type={constant('button')}
                onClick={handleToggleSandbox}
              >
                <Icon
                  icon={pane$.pipe(
                    map((pane) => (pane.sandboxed ? 'lock' : 'unlock')),
                  )}
                />
              </button>
              <button
                aria-label={constant('Split to the right')}
                class={constant('pane__button')}
                title={constant('Split to the right')}
                type={constant('button')}
                onClick={handleSplitRow}
              >
                <Icon icon={'split-right'} />
              </button>
              <button
                aria-label={constant('Split downwards')}
                class={constant('pane__button')}
                title={constant('Split downwards')}
                type={constant('button')}
                onClick={handleSplitColumn}
              >
                <Icon icon={'split-down'} />
              </button>
            </>
          }
        />

        <If
          cond={menuItems$.pipe(map(Arr.isNonEmpty))}
          then={
            <span
              ref={(element) => {
                mut_state.menuRoot = element;
              }}
              class={constant('pane__menu')}
            >
              <button
                aria-expanded={load$.pipe(
                  map((load) => (load.menuOpen ? 'true' : 'false')),
                )}
                aria-label={constant('More for this pane')}
                class={constant('pane__button')}
                title={constant('More for this pane')}
                type={constant('button')}
                onClick={() => {
                  patchLoad({
                    menuOpen: !Optional.unwrap(load$.getSnapshot()).menuOpen,
                  });
                }}
              >
                <Icon icon={'more'} />
              </button>

              <If
                cond={load$.pipe(map((load) => load.menuOpen))}
                then={
                  <div
                    ref={listenForMenuClose}
                    class={constant('pane__menu-popover')}
                    data-e2e={constant('pane-menu')}
                  >
                    <If
                      cond={compact$}
                      then={
                        <div class={constant('pane__menu-zoom')}>
                          <PaneZoomControls pane$={pane$} onZoom={handleZoom} />
                        </div>
                      }
                    />

                    <For items={menuItems$} key={(item) => item.choice}>
                      {(item$) => (
                        <PaneMenuItem
                          item$={item$}
                          onChosen={(choice) => {
                            menuActions[choice]();

                            patchLoad({ menuOpen: false });
                          }}
                        />
                      )}
                    </For>
                  </div>
                }
              />
            </span>
          }
        />

        <button
          aria-label={constant('Close this pane')}
          class={constant('pane__button')}
          disabled={view$.pipe(map((paneView) => !paneView.canClose))}
          title={constant('Close this pane')}
          type={constant('button')}
          onClick={() => {
            dispatch({ type: 'close', paneId });
          }}
        >
          <Icon icon={'close'} />
        </button>
      </header>

      <div class={constant('pane__body')}>
        {/* Keyed by the address, so that the helper is a new element, and a new
            load, for every clear. */}
        <For
          items={load$.pipe(
            map((load) => (load.resetUrl === undefined ? [] : [load.resetUrl])),
          )}
          key={(resetUrl) => resetUrl}
        >
          {(resetUrl$) => (
            <iframe
              ref={(element) => {
                mut_state.resetFrame = element;

                // Before `src` is bound: the attribute applies to the document
                // loaded after it is set.
                element.setAttribute('sandbox', paneSandboxTokens);
              }}
              class={constant('pane__helper')}
              src={constant(Optional.unwrap(resetUrl$.getSnapshot()))}
              title={constant('service worker reset')}
              onLoad={handleResetFrameLoad}
            />
          )}
        </For>
        <If
          cond={pane$.pipe(map((pane) => pane.url === ''))}
          then={
            <div class={constant('pane__empty')}>
              {constant('Type an address in the bar above')}
            </div>
          }
          else={
            <For
              // Empty for an empty address, as the `If` is: the two hear of it
              // in the same update, and a row still here then would bind `src`
              // to `''` on its way out.
              items={pane$.pipe(map((pane) => (pane.url === '' ? [] : [pane])))}
              key={frameKeyOf}
            >
              {(shown$) => (
                <iframe
                  ref={(element) => {
                    mut_state.paneFrame = element;

                    // Set once, before `src` is bound: a change of it is a new
                    // element, as the key says.
                    if (Optional.unwrap(shown$.getSnapshot()).sandboxed) {
                      element.setAttribute('sandbox', paneSandboxTokens);
                    }

                    // The frame may load before or after the greeting would
                    // reach it, so it is sent once it is in the document as
                    // well as on `load`.
                    afterUpdate(announceToFrame);
                  }}
                  allow={constant(paneAllowList)}
                  class={constant('pane__frame')}
                  data-e2e={constant('pane-frame')}
                  name={constant(`${paneFrameNamePrefix}${paneId.toString()}`)}
                  // Bound through a cut-off: writing the same `src` again is a
                  // navigation.
                  src={shown$.pipe(map((pane) => pane.url))}
                  style={{
                    zoom: shown$.pipe(map((pane) => zoomStyleOf(pane.zoom))),
                  }}
                  title={shown$.pipe(map(labelOf))}
                  onLoad={handleFrameLoad}
                />
              )}
            </For>
          }
        />

        {/* Over the frame rather than instead of it: the element stays in the
            document, because taking it out and putting it back is a reload. */}
        <If
          cond={model$.pipe(map((model) => model.showFallback))}
          then={
            <PaneFallback
              address={model$.pipe(
                map((model) => (model.agentSeen ? undefined : model.address)),
              )}
              canClearServiceWorkers={model$.pipe(
                map((model) => model.canClearServiceWorkers),
              )}
              canOpenExternally={model$.pipe(
                map((model) => model.address !== ''),
              )}
              canReload={model$.pipe(map((model) => model.canRetry))}
              refusal={model$.pipe(map((model) => model.browserRefusal))}
              onClearServiceWorkers={handleResetServiceWorkers}
              onDismiss={() => {
                patchLoad({ fallbackDismissed: true });
              }}
              onOpenExternally={handleOpenExternally}
              onReload={handleReload}
            />
          }
        />
      </div>
    </section>
  );
};

/** What a pane remembers about the loads of its frame. */
type LoadState = Readonly<{
  /** The load the no-answer timer ran out on. */
  waitedFor: string | undefined;
  /**
   * The load that ended in a document nothing answered from.
   *
   * Keyed, like `waitedFor`, rather than a flag: a flag is still set in the
   * update where the pane moves to a new address or reloads, and the automatic
   * clear would read it as the new load failing — a second clear and a second
   * reload straight after every first one.
   */
  blockedLoad: string | undefined;
  /** The fallback was sent away for the document in the frame now. */
  fallbackDismissed: boolean;
  /**
   * Automatic service-worker clears made since the last document that loaded.
   *
   * A budget, because a site that registers its worker on every visit turns the
   * automatic clear into a loop otherwise: the clear gets the page back, the
   * page registers the worker again, the next load is answered from it, and the
   * pane reloads for as long as anyone watches. Spending the budget leaves the
   * fallback up instead, which offers the same clear as a button.
   */
  automaticClears: number;
  /**
   * A hidden frame at the site's origin, used to reach a page of that site when
   * the pane itself cannot load one: it is where the site's service worker can
   * be unregistered from. See `frame-agent.mts`.
   */
  resetUrl: string | undefined;
  serviceWorkersRemoved: number | undefined;
  /** The load a reset was already attempted for, so it happens once. */
  resetAttemptedFor: string | undefined;
  menuOpen: boolean;
}>;

const initialLoadState: LoadState = {
  waitedFor: undefined,
  blockedLoad: undefined,
  fallbackDismissed: false,
  automaticClears: 0,
  resetUrl: undefined,
  serviceWorkersRemoved: undefined,
  resetAttemptedFor: undefined,
  menuOpen: false,
} as const;

/** What follows from a pane, its rectangle and what its loads have shown. */
type PaneModel = Readonly<{
  address: string;
  /** The frame has reported, so the agent is running inside it. */
  agentSeen: boolean;
  /** Identifies one load of one address, so that a reload starts the wait over. */
  loadKey: string;
  frameBlocked: boolean;
  /** Known from the address alone: the browser frames none of these. */
  browserRefusal: UnframeableKind | undefined;
  /**
   * The pane is not showing the page it was asked for.
   *
   * Three ways of knowing, in order of how much they know: the address is one
   * Chrome refuses outright, the frame loaded a document nothing answered from,
   * or nothing at all has happened for long enough that saying so is better
   * than a blank pane.
   */
  blocked: boolean;
  /**
   * Blocked for a reason the extension may still be able to undo, which is what
   * the service-worker offers hang off. Nothing undoes a browser refusal, so
   * offering to try there would be offering nothing.
   */
  blockedBySite: boolean;
  siteOrigin: string | undefined;
  alwaysReset: boolean;
  /** There is a site to clear a worker for, and a worker might be the cause. */
  canClearServiceWorkers: boolean;
  /**
   * What failed is the address the pane was pointed at, so retrying it means
   * something. After a navigation made inside the frame it does not: the page
   * knows where the pane *was*, not where the link went.
   */
  canRetry: boolean;
  showFallback: boolean;
  menuItems: readonly PaneMenuAction[];
}>;

/**
 * The title of the toggle that keeps service workers cleared for `siteOrigin`.
 *
 * A function of its own so that the origin is not read under `alwaysReset`: the
 * strict standard library declares `includes` as a type predicate, which
 * TypeScript also applies when it is false, so where `alwaysReset` is false a
 * `siteOrigin` that passed through it would be narrowed to `never`.
 */
const resetToggleTitleOf = (
  siteOrigin: string,
  alwaysReset: boolean,
): string =>
  alwaysReset
    ? (`Service workers are always cleared for ${siteOrigin}. Click to stop.` as const)
    : (`Always clear service workers for ${siteOrigin}` as const);

/**
 * What the menu holds.
 *
 * The two service-worker actions are in it whatever the pane's width, because
 * they are rare, they are hard to label in an icon, and a menu row has room to
 * say what they do. The rest of it is what a narrow pane has no room for
 * inline.
 */
const paneMenuItemsOf = ({
  address,
  alwaysReset,
  blockedBySite,
  compact,
  sandboxed,
  siteOrigin,
}: Readonly<{
  address: string;
  alwaysReset: boolean;
  blockedBySite: boolean;
  compact: boolean;
  sandboxed: boolean;
  siteOrigin: string | undefined;
}>): readonly PaneMenuAction[] =>
  [
    // Each group is typed as `PaneMenuAction[]` rather than inferred: a spread of
    // a conditional array widens to include `undefined`.
    ...(blockedBySite
      ? ([
          {
            choice: 'clear-service-workers',
            icon: 'clear-sw',
            label: 'Clear the site\u{2019}s service workers',
            title:
              'This page may be served by the site\u{2019}s own service worker, which puts it out of reach of the header-stripping rules. This removes the worker and reloads the pane; the site registers it again on its next ordinary visit.',
            tone: 'warn',
          },
        ] as const satisfies readonly PaneMenuAction[])
      : ([] as const)),
    ...(siteOrigin !== undefined && (alwaysReset || blockedBySite)
      ? ([
          {
            choice: 'toggle-always-clear',
            icon: 'clear-sw',
            label: alwaysReset
              ? ('Stop clearing them for this site' as const)
              : ('Always clear them for this site' as const),
            title: resetToggleTitleOf(siteOrigin, alwaysReset),
            pressed: alwaysReset,
          },
        ] as const satisfies readonly PaneMenuAction[])
      : ([] as const)),
    ...(compact
      ? ([
          {
            choice: 'open-externally',
            icon: 'external',
            label: 'Open in a new tab',
            title: 'Open in a new tab',
            disabled: address === '',
          },
          {
            choice: 'toggle-sandbox',
            icon: sandboxed ? ('lock' as const) : ('unlock' as const),
            label: sandboxed
              ? ('Turn the sandbox off' as const)
              : ('Turn the sandbox on' as const),
            title: sandboxed
              ? ('Turn the sandbox off (this page will be able to reach the frames above it)' as const)
              : ('Turn the sandbox on' as const),
            ...(sandboxed ? {} : { tone: 'warn' }),
          },
          {
            choice: 'split-row',
            icon: 'split-right',
            label: 'Split to the right',
            title: 'Split to the right',
          },
          {
            choice: 'split-column',
            icon: 'split-down',
            label: 'Split downwards',
            title: 'Split downwards',
          },
        ] as const satisfies readonly PaneMenuAction[])
      : ([] as const)),
  ] as const;

/**
 * Which `iframe` element shows the pane: a new key is a new element, and with
 * it a new load, which the pane's load bookkeeping is keyed by too.
 *
 * Replacing the element is what a hard reload is, and what makes a changed
 * `sandbox` attribute take effect. The reducer bumps the token when it changes
 * `sandboxed`, but a layout read back by an import can bring either without the
 * other.
 */
const frameKeyOf = (pane: PaneState): string =>
  `${pane.reloadToken.toString()}:${pane.sandboxed ? 'sandboxed' : 'open'}` as const;

const paneModelOf = (
  pane: PaneState,
  compact: boolean,
  load: LoadState,
  resetOrigins: readonly string[],
): PaneModel => {
  const address = pane.currentUrl ?? pane.url;

  const agentSeen = pane.currentUrl !== undefined;

  const loadKey = `${pane.url}#${frameKeyOf(pane)}` as const;

  const frameBlocked = load.blockedLoad === loadKey;

  const browserRefusal = unframeableKindOf(address);

  const blocked =
    pane.url !== '' &&
    (browserRefusal !== undefined ||
      frameBlocked ||
      (!agentSeen && load.waitedFor === loadKey));

  const blockedBySite = blocked && browserRefusal === undefined;

  const siteOrigin = originOf(address);

  const alwaysReset =
    siteOrigin !== undefined && resetOrigins.includes(siteOrigin);

  /**
   * A clear is running, or is about to run, so this pane has not finished
   * failing.
   *
   * Without this the automatic clear is a message and a reload, several times
   * over, at a user who asked for one page: each attempt loads, is found to be
   * blocked, puts the fallback up and then reloads out from under it.
   */
  const clearingAutomatically =
    alwaysReset &&
    blockedBySite &&
    (load.resetUrl !== undefined ||
      (load.automaticClears < maxAutomaticClears &&
        load.resetAttemptedFor !== loadKey));

  return {
    address,
    agentSeen,
    loadKey,
    frameBlocked,
    browserRefusal,
    blocked,
    blockedBySite,
    siteOrigin,
    alwaysReset,
    canClearServiceWorkers: blockedBySite && siteOrigin !== undefined,
    canRetry: blockedBySite && !agentSeen,
    showFallback: blocked && !load.fallbackDismissed && !clearingAutomatically,
    menuItems: paneMenuItemsOf({
      address,
      alwaysReset,
      blockedBySite,
      compact,
      sandboxed: pane.sandboxed,
      siteOrigin,
    }),
  };
};

const paneClassName = (active: boolean, moving: boolean): string =>
  [
    'pane',
    active ? 'pane--active' : undefined,
    moving ? 'pane--moving' : undefined,
  ]
    .filter((part) => part !== undefined)
    .join(' ');

/**
 * Whether `source` is `frameWindow`, the window inside a frame. A frame taken
 * out of the document has no window, and a message with no source is nobody's.
 */
const isFrameOf = (frameWindow: unknown, source: unknown): boolean =>
  frameWindow !== null && frameWindow !== undefined && source === frameWindow;

const labelOf = (pane: PaneState): string =>
  pane.title ?? hostnameOf(pane.currentUrl ?? pane.url) ?? 'Empty pane';

/**
 * Zoom, as `zoom` rather than as a `transform`.
 *
 * Measured, because the two look the same on paper: with a scale transform the
 * frame's renderer rasterizes at 1x and the compositor stretches the result —
 * `devicePixelRatio` inside the frame stays 1 and the text is soft. `zoom` on
 * the element propagates into the frame as an effective zoom, so
 * `devicePixelRatio` there becomes the zoom and the page is rasterized at that
 * scale, which is what the browser's own zoom does.
 *
 * The layout is the same either way: percentages resolve in the zoomed space,
 * so `width: 100%` still fills the pane and the site is laid out for the
 * viewport it appears to have — narrower as you zoom in, wider as you zoom out.
 */
const zoomStyleOf = (zoom: number): string | undefined =>
  zoom === 1 ? undefined : zoom.toString();

/** `_favicon/` serves the icon Chrome already has for a page. */
const faviconQuery = (pageUrl: string): string => {
  const params = new URLSearchParams({ pageUrl, size: '16' });

  return params.toString();
};

const faviconUrlOf = (address: string): string =>
  chrome.runtime.getURL(`/_favicon/?${faviconQuery(address)}`);
