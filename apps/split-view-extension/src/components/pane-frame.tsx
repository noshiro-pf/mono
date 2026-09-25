import * as React from 'react';
import { memoNamed } from 'react-utils';
import { Arr } from 'ts-data-forge';
import {
  formatPaneZoom,
  steppedPaneZoom,
  type PaneId,
  type PaneState,
  type Rect,
} from '../layout/index.mjs';
import {
  asFrameToPageMessage,
  paneFrameNamePrefix,
  splitViewMessageTag,
  type FrameCommand,
  type IncomingMessageEvent,
  type PageToFrameMessage,
} from '../shared/index.mjs';
import {
  hostnameOf,
  originOf,
  unframeableKindOf,
  type WorkspaceAction,
} from '../state/index.mjs';
import { Icon, type IconName } from './icon.js';
import { PaneFallback } from './pane-fallback.js';

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
 * clear that arrives too early — a worker registered while the page was
 * loading is not there yet when the clear runs, so the load after it is
 * answered from the worker after all. Past that, the thing keeping the pane
 * from loading is not a worker, and a pane that reloads every second is worse
 * than a pane that says it did not load.
 */
const maxAutomaticClears = 2;

/**
 * The backstop, for a frame that does not even get as far as loading.
 *
 * A request the server never answers has no `load` event to read, and neither
 * has an address Chrome refuses to navigate to — it keeps the frame on
 * whatever it was showing. Long, because all that is being waited for here is
 * the first byte.
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

/** One row of a pane's menu. */
type PaneMenuAction = Readonly<{
  icon: IconName;
  label: string;
  title: string;
  disabled?: boolean;
  pressed?: boolean;
  tone?: 'warn';
  onSelect: () => void;
}>;

const PaneMenuItem = memoNamed(
  'PaneMenuItem',
  ({
    item,
    onChosen,
  }: Readonly<{ item: PaneMenuAction; onChosen: () => void }>) => {
    const handleClick = React.useCallback((): void => {
      item.onSelect();

      onChosen();
    }, [item, onChosen]);

    return (
      <button
        aria-pressed={item.pressed}
        className={
          item.tone === 'warn'
            ? 'pane__menu-item pane__menu-item--warn'
            : 'pane__menu-item'
        }
        disabled={item.disabled ?? false}
        title={item.title}
        type={'button'}
        onClick={handleClick}
      >
        <Icon icon={item.icon} />

        {item.label}
      </button>
    );
  },
);

/**
 * The width at which a pane's toolbar stops holding everything.
 *
 * Below it the zoom controls, the sandbox toggle, the split buttons and "open
 * in a new tab" move into the menu. Above it they are inline and the menu
 * holds only what is always in it.
 */
const compactPaneWidthPx = 440;

const paneClassName = (active: boolean, moving: boolean): string =>
  [
    'pane',
    active ? 'pane--active' : undefined,
    moving ? 'pane--moving' : undefined,
  ]
    .filter((part) => part !== undefined)
    .join(' ');

/** Delegated permissions, so that a pane is not a second-class browser tab. */
const paneAllowList = [
  'autoplay',
  'clipboard-read',
  'clipboard-write',
  'encrypted-media',
  'fullscreen',
  'picture-in-picture',
].join('; ');

export const PaneFrame = memoNamed(
  'PaneFrame',
  ({
    pane,
    rect,
    active,
    canClose,
    dispatch,
    moving,
    resetOrigins,
    onMoveStart,
    onNavigate,
    onToggleResetOrigin,
  }: Readonly<{
    pane: PaneState;
    rect: Rect;
    active: boolean;
    canClose: boolean;
    dispatch: React.Dispatch<WorkspaceAction>;
    /** This is the pane being dragged somewhere else. */
    moving: boolean;
    /** Origins whose service workers are removed without being asked. */
    resetOrigins: readonly string[];
    /** The grip was pressed; the page follows the pointer from there. */
    onMoveStart: (paneId: PaneId) => void;
    /** Goes through the page rather than the reducer; see `app.tsx`. */
    onNavigate: (paneId: PaneId, input: string) => void;
    onToggleResetOrigin: (toggledOrigin: string, enabled: boolean) => void;
  }>) => {
    // The element is held in state rather than in a ref so that the effects
    // below re-run when the `iframe` is replaced — which is what a reload is.
    const [paneFrame, setPaneFrame] = React.useState<HTMLIFrameElement | null>(
      null,
    );

    const address = pane.currentUrl ?? pane.url;

    const [draft, setDraft] = React.useState(address);

    /** The frame has reported, so the agent is running inside it. */
    const agentSeen = pane.currentUrl !== undefined;

    /** Identifies one load of one address, so that a reload starts the wait over. */
    const loadKey = `${pane.url}#${pane.reloadToken}` as const;

    const [waitedFor, setWaitedFor] = React.useState<string | undefined>(
      undefined,
    );

    /**
     * Reports since the frame's last `load` event, counted rather than
     * remembered: `pane.currentUrl` says that *some* document answered, and a
     * pane that follows a link into a page which will not be framed has to
     * notice that the next one did not.
     *
     * Zeroed by the `load` handler itself, before the greeting goes out. It used
     * to be zeroed a render later, so the answer the *previous* document gave
     * to its own greeting was counted for the next one — and a link into a page
     * that would not frame was taken for a page that had answered. No fallback,
     * no automatic clear, and a reload button that asked the dead frame to
     * reload itself.
     */
    const mut_reportsSinceLoad = React.useRef(0);

    /** Bumped on every `load` of the pane's frame, to run the check below. */
    const [loadCount, setLoadCount] = React.useState(0);

    /**
     * The load that ended in a document nothing answered from.
     *
     * Keyed, like `waitedFor`, rather than a flag: a flag is still set in the
     * render where the pane moves to a new address or reloads, and the
     * automatic clear read it as the new load failing — a second clear and a
     * second reload straight after every first one.
     */
    const [blockedLoad, setBlockedLoad] = React.useState<string | undefined>(
      undefined,
    );

    const frameBlocked = blockedLoad === loadKey;

    /** `loadKey` for the timer below, which outlives the render it was set in. */
    const mut_loadKey = React.useRef(loadKey);

    /** The fallback was sent away for the document in the frame now. */
    const [fallbackDismissed, setFallbackDismissed] = React.useState(false);

    /**
     * Automatic service-worker clears made since the last document that
     * loaded.
     *
     * A budget, because a site that registers its worker on every visit turns
     * the automatic clear into a loop otherwise: the clear gets the page back,
     * the page registers the worker again, the next load is answered from it,
     * and the pane reloads for as long as anyone watches. Spending the budget
     * leaves the fallback up instead, which offers the same clear as a button.
     */
    const [automaticClears, setAutomaticClears] = React.useState(0);

    /**
     * A hidden frame at the site's origin, used to reach a page of that site
     * when the pane itself cannot load one: it is where the site's service
     * worker can be unregistered from. See `frame-agent.mts`.
     */
    const [resetUrl, setResetUrl] = React.useState<string | undefined>(
      undefined,
    );

    const [resetFrame, setResetFrame] =
      React.useState<HTMLIFrameElement | null>(null);

    const [serviceWorkersRemoved, setServiceWorkersRemoved] = React.useState<
      number | undefined
    >(undefined);

    /** The load a reset was already attempted for, so it happens once. */
    const [resetAttemptedFor, setResetAttemptedFor] = React.useState<
      string | undefined
    >(undefined);

    /**
     * Where the document in the frame said it was navigating to, until a
     * document answers from there. See `frame-agent.mts`.
     */
    const mut_leavingFor = React.useRef<string | undefined>(undefined);

    /**
     * Loads the pane afresh, in a new element: at the address a link was
     * taking it to when the frame said so, and at the last address it
     * reported otherwise.
     *
     * The document that failed is the one a link led to, so reloading the last
     * page that reported would put the user back where they clicked.
     */
    const replaceFrame = React.useCallback((): void => {
      const destination = mut_leavingFor.current;

      mut_leavingFor.current = undefined;

      if (destination === undefined) {
        dispatch({ type: 'reload', paneId: pane.id });
      } else {
        onNavigate(pane.id, destination);
      }
    }, [dispatch, onNavigate, pane.id]);

    /** Known from the address alone: the browser frames none of these. */
    const browserRefusal = unframeableKindOf(address);

    /**
     * The pane is not showing the page it was asked for.
     *
     * Three ways of knowing, in order of how much they know: the address is one
     * Chrome refuses outright, the frame loaded a document nothing answered
     * from, or nothing at all has happened for long enough that saying so is
     * better than a blank pane.
     */
    const blocked =
      pane.url !== '' &&
      (browserRefusal !== undefined ||
        frameBlocked ||
        (!agentSeen && waitedFor === loadKey));

    /**
     * Blocked for a reason the extension may still be able to undo, which is
     * what the service-worker offers hang off. Nothing undoes a browser
     * refusal, so offering to try there would be offering nothing.
     */
    const blockedBySite = blocked && browserRefusal === undefined;

    const siteOrigin = originOf(address);

    /** There is a site to clear a worker for, and a worker might be the cause. */
    const canClearServiceWorkers = blockedBySite && siteOrigin !== undefined;

    /**
     * What failed is the address the pane was pointed at, so retrying it means
     * something. After a navigation made inside the frame it does not: the page
     * knows where the pane *was*, not where the link went.
     */
    const canRetry = blockedBySite && !agentSeen;

    const alwaysReset =
      siteOrigin !== undefined && resetOrigins.includes(siteOrigin);

    /**
     * A clear is running, or is about to run, so this pane has not finished
     * failing.
     *
     * Without this the automatic clear is a message and a reload, several times
     * over, at a user who asked for one page: each attempt loads, is found to
     * be blocked, puts the fallback up and then reloads out from under it. The
     * pane simply keeps loading until the attempts are spent.
     */
    const clearingAutomatically =
      alwaysReset &&
      blockedBySite &&
      (resetUrl !== undefined ||
        (automaticClears < maxAutomaticClears &&
          resetAttemptedFor !== loadKey));

    React.useEffect(() => {
      setDraft(address);
    }, [address]);

    // What the frame says about itself. `event.source` is compared with this
    // pane's own frame, so that a page cannot report on another pane's behalf.
    React.useEffect(() => {
      if (paneFrame === null) {
        return undefined;
      }

      const onMessage = (messageEvent: IncomingMessageEvent): void => {
        const fromPane = messageEvent.source === paneFrame.contentWindow;

        const fromReset =
          resetFrame !== null &&
          messageEvent.source === resetFrame.contentWindow;

        if (!fromPane && !fromReset) {
          return;
        }

        const message = asFrameToPageMessage(messageEvent.data);

        if (message === undefined) {
          return;
        }

        if (message.kind === 'service-workers') {
          // Two clears reach here and only one of them is a repair. The helper
          // frame's is: the pane is blocked, the worker that was answering for
          // it is gone, and the reload is what finally shows the page. The one
          // sent into a pane that is *working* is housekeeping — the site
          // registers a worker on every visit and the next navigation would be
          // the one it answers — and reloading after that throws away the page
          // the user is reading, about 40ms after it arrived. Measured: it
          // doubled every load on an origin on the list.
          if (fromReset) {
            setServiceWorkersRemoved(message.count);

            setResetUrl(undefined);

            replaceFrame();
          }

          return;
        }

        if (message.kind === 'leaving') {
          if (fromPane) {
            mut_leavingFor.current = message.url;
          }

          return;
        }

        if (message.kind === 'zoom') {
          // `pane.id` rather than the id in the message: a frame may zoom the
          // pane it is in and no other.
          if (fromPane) {
            dispatch({ type: 'zoom', paneId: pane.id, step: message.step });
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

        // Something is running in the frame, so whatever is in it now is a
        // document the extension can see into — and any fallback over it is
        // wrong from this moment on.
        mut_reportsSinceLoad.current += 1;

        mut_leavingFor.current = undefined;

        setBlockedLoad(undefined);

        // A document that answered is a document that loaded, so whatever the
        // automatic clears below have spent getting here, they have spent it
        // well and start again from the next failure.
        setAutomaticClears(0);

        dispatch({
          type: 'report',
          paneId: pane.id,
          url: message.url,
          title: message.title,
          historyLength: message.historyLength,
        });
      };

      addEventListener('message', onMessage);

      return () => {
        removeEventListener('message', onMessage);
      };
    }, [paneFrame, resetFrame, dispatch, replaceFrame, pane.id]);

    React.useEffect(() => {
      if (agentSeen) {
        return undefined;
      }

      const timer = setTimeout(() => {
        setWaitedFor(loadKey);
      }, noAnswerTimeoutMs);

      return () => {
        clearTimeout(timer);
      };
    }, [agentSeen, loadKey]);

    // What the frame's `load` event meant, decided a round trip later. The
    // count is read rather than watched, so a report that arrives between the
    // event and this still counts as an answer.
    React.useEffect(() => {
      if (loadCount === 0) {
        return undefined;
      }

      // A document of its own gets a fallback of its own: a pane whose fallback
      // was sent away and which then followed a link into another page that
      // will not frame should say so again.
      setFallbackDismissed(false);

      const timer = setTimeout(() => {
        if (mut_reportsSinceLoad.current === 0) {
          setBlockedLoad(mut_loadKey.current);
        }
      }, greetingGraceMs);

      return () => {
        clearTimeout(timer);
      };
    }, [loadCount]);

    // A new address, or a reload, starts all of that over — including a clear
    // still waiting on its helper frame, which was for the document before.
    React.useEffect(() => {
      mut_loadKey.current = loadKey;

      setFallbackDismissed(false);

      setResetUrl(undefined);

      mut_reportsSinceLoad.current = 0;

      mut_leavingFor.current = undefined;
    }, [loadKey]);

    const sendToFrame = React.useCallback(
      (message: PageToFrameMessage): void => {
        // `'*'` as the target origin: the pane's origin is whatever the user
        // navigated to, and the message carries nothing worth protecting.
        paneFrame?.contentWindow?.postMessage(message, '*');
      },
      [paneFrame],
    );

    const sendCommand = React.useCallback(
      (command: FrameCommand): void => {
        sendToFrame({
          tag: splitViewMessageTag,
          kind: 'command',
          paneId: pane.id,
          command,
        });
      },
      [sendToFrame, pane.id],
    );

    const announceToFrame = React.useCallback((): void => {
      sendToFrame({
        tag: splitViewMessageTag,
        kind: 'assign',
        paneId: pane.id,
      });
    }, [sendToFrame, pane.id]);

    // The frame may already have loaded by the time the element reaches state,
    // so the greeting is sent on both occasions rather than on `load` alone.
    React.useEffect(() => {
      announceToFrame();
    }, [announceToFrame]);

    const handleFrameLoad = React.useCallback((): void => {
      mut_reportsSinceLoad.current = 0;

      announceToFrame();

      setLoadCount((count) => count + 1);
    }, [announceToFrame]);

    const handleAddressChange = React.useCallback<
      React.ChangeEventHandler<HTMLInputElement>
    >((changeEvent) => {
      setDraft(changeEvent.target.value);
    }, []);

    const handleSubmit = React.useCallback<
      React.SubmitEventHandler<HTMLFormElement>
    >(
      (submitEvent) => {
        submitEvent.preventDefault();

        onNavigate(pane.id, draft);
      },
      [onNavigate, pane.id, draft],
    );

    const handleActivate = React.useCallback((): void => {
      dispatch({ type: 'activate', paneId: pane.id });
    }, [dispatch, pane.id]);

    const handleBack = React.useCallback((): void => {
      sendCommand('back');
    }, [sendCommand]);

    const handleForward = React.useCallback((): void => {
      sendCommand('forward');
    }, [sendCommand]);

    const handleReload = React.useCallback((): void => {
      // Reloading through the agent keeps the frame's history; replacing the
      // element is the only way to reload a pane that has no agent — including
      // one whose agent answered for an earlier document than the one there
      // now, which is what a link into a page that will not frame leaves.
      if (agentSeen && !frameBlocked) {
        sendCommand('reload');
      } else {
        replaceFrame();
      }
    }, [agentSeen, frameBlocked, sendCommand, replaceFrame]);

    const handleSplitRow = React.useCallback((): void => {
      dispatch({ type: 'split', paneId: pane.id, axis: 'row' });
    }, [dispatch, pane.id]);

    const handleSplitColumn = React.useCallback((): void => {
      dispatch({ type: 'split', paneId: pane.id, axis: 'column' });
    }, [dispatch, pane.id]);

    const handleClose = React.useCallback((): void => {
      dispatch({ type: 'close', paneId: pane.id });
    }, [dispatch, pane.id]);

    const handleToggleSandbox = React.useCallback((): void => {
      dispatch({
        type: 'set-sandboxed',
        paneId: pane.id,
        sandboxed: !pane.sandboxed,
      });
    }, [dispatch, pane.id, pane.sandboxed]);

    const handleResetServiceWorkers = React.useCallback((): void => {
      if (siteOrigin === undefined) {
        return;
      }

      setServiceWorkersRemoved(undefined);

      setResetUrl(`${siteOrigin}/`);
    }, [siteOrigin]);

    const showResetToggle =
      siteOrigin !== undefined && (alwaysReset || blockedBySite);

    const resetToggleTitle =
      siteOrigin === undefined
        ? ''
        : alwaysReset
          ? (`Service workers are always cleared for ${siteOrigin}. Click to stop.` as const)
          : (`Always clear service workers for ${siteOrigin}` as const);

    const handleToggleAlwaysReset = React.useCallback((): void => {
      if (siteOrigin !== undefined) {
        onToggleResetOrigin(siteOrigin, !alwaysReset);
      }
    }, [onToggleResetOrigin, siteOrigin, alwaysReset]);

    // With the origin on the list, a pane that cannot load does not wait to be
    // asked: the worker is removed and the pane reloaded, once per load.
    React.useEffect(() => {
      if (!alwaysReset || !blockedBySite) {
        return;
      }

      if (resetUrl !== undefined || resetAttemptedFor === loadKey) {
        return;
      }

      if (automaticClears >= maxAutomaticClears) {
        return;
      }

      setResetAttemptedFor(loadKey);

      setAutomaticClears((count) => count + 1);

      setResetUrl(`${siteOrigin}/`);
    }, [
      alwaysReset,
      blockedBySite,
      resetUrl,
      resetAttemptedFor,
      automaticClears,
      loadKey,
      siteOrigin,
    ]);

    // While such a pane is loading fine, the content script in it keeps the
    // worker away by itself; see `keepServiceWorkersAway` in `frame-agent.mts`.

    // A helper frame that never answers — its address answered by the site's
    // worker as well, or not reachable at all — is given up on, so that the
    // pane says it did not load instead of waiting on it for good. Nothing
    // else ends the wait: the button to clear again would set the address the
    // helper already has.
    React.useEffect(() => {
      if (resetUrl === undefined) {
        return undefined;
      }

      const timer = setTimeout(() => {
        setResetUrl(undefined);
      }, noAnswerTimeoutMs);

      return () => {
        clearTimeout(timer);
      };
    }, [resetUrl]);

    const handleResetFrameLoad = React.useCallback((): void => {
      const target = resetFrame?.contentWindow;

      if (target === null || target === undefined) {
        return;
      }

      target.postMessage(
        { tag: splitViewMessageTag, kind: 'assign', paneId: pane.id },
        '*',
      );

      target.postMessage(
        {
          tag: splitViewMessageTag,
          kind: 'unregister-service-workers',
          paneId: pane.id,
        },
        '*',
      );
    }, [resetFrame, pane.id]);

    const handleZoomOut = React.useCallback((): void => {
      dispatch({ type: 'zoom', paneId: pane.id, step: 'out' });
    }, [dispatch, pane.id]);

    const handleZoomIn = React.useCallback((): void => {
      dispatch({ type: 'zoom', paneId: pane.id, step: 'in' });
    }, [dispatch, pane.id]);

    const handleZoomReset = React.useCallback((): void => {
      dispatch({ type: 'zoom', paneId: pane.id, step: 'reset' });
    }, [dispatch, pane.id]);

    const handleMoveStart = React.useCallback<
      React.PointerEventHandler<HTMLButtonElement>
    >(
      (pointerEvent) => {
        // Without this the press starts a text selection that follows the
        // pointer across the panes for the length of the drag.
        pointerEvent.preventDefault();

        onMoveStart(pane.id);
      },
      [onMoveStart, pane.id],
    );

    const handleDismissFallback = React.useCallback((): void => {
      setFallbackDismissed(true);
    }, []);

    const handleOpenExternally = React.useCallback((): void => {
      // A pane that followed a link into a page that will not frame is still
      // showing the address it came from; the page wanted is the other one.
      const target = frameBlocked
        ? (mut_leavingFor.current ?? address)
        : address;

      if (target !== '') {
        chrome.tabs.create({ url: target }).catch(console.error);
      }
    }, [frameBlocked, address]);

    const style = React.useMemo<React.CSSProperties>(
      () => ({
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      }),
      [rect],
    );

    /**
     * Zoom, as `zoom` rather than as a `transform`.
     *
     * Measured, because the two look the same on paper: with a scale
     * transform the frame's renderer rasterizes at 1x and the compositor
     * stretches the result — `devicePixelRatio` inside the frame stays 1 and
     * the text is soft. `zoom` on the element propagates into the frame as an
     * effective zoom, so `devicePixelRatio` there becomes the zoom and the
     * page is rasterized at that scale, which is what the browser's own zoom
     * does.
     *
     * The layout is the same either way: percentages resolve in the zoomed
     * space, so `width: 100%` still fills the pane and the site is laid out
     * for the viewport it appears to have — narrower as you zoom in, wider as
     * you zoom out.
     */
    const frameStyle = React.useMemo<React.CSSProperties>(
      () => (pane.zoom === 1 ? {} : { zoom: pane.zoom }),
      [pane.zoom],
    );

    const zoomLabel = formatPaneZoom(pane.zoom);

    /**
     * Whether this pane is too narrow for its whole toolbar.
     *
     * A width rather than a measurement: the pane's rectangle is already known
     * here, where a `ResizeObserver` would cost a second render per pane to
     * learn what the layout tree has just decided. The number is what the
     * toolbar needs — the grip, three navigation buttons, the close button and
     * the menu come to about 130px, the collapsible half to about 150, and an
     * address bar wants the rest.
     */
    const compact = rect.width < compactPaneWidthPx;

    const [menuOpen, setMenuOpen] = React.useState(false);

    const [menuRoot, setMenuRoot] = React.useState<HTMLSpanElement | null>(
      null,
    );

    const handleToggleMenu = React.useCallback((): void => {
      setMenuOpen((shown) => !shown);
    }, []);

    const handleCloseMenu = React.useCallback((): void => {
      setMenuOpen(false);
    }, []);

    // A pane that grows out of being compact should not leave a menu open over
    // the controls that have just come back into the toolbar.
    React.useEffect(() => {
      setMenuOpen(false);
    }, [compact]);

    /** Escape, or a click anywhere but in the menu, closes it. */
    React.useEffect(() => {
      if (!menuOpen) {
        return undefined;
      }

      const onPointerDown = (
        pointerEvent: Readonly<{ target: unknown }>,
      ): void => {
        if (
          menuRoot !== null &&
          pointerEvent.target instanceof Node &&
          !menuRoot.contains(pointerEvent.target)
        ) {
          setMenuOpen(false);
        }
      };

      const onKeyDown = (keyboardEvent: Readonly<{ key: string }>): void => {
        if (keyboardEvent.key === 'Escape') {
          setMenuOpen(false);
        }
      };

      addEventListener('pointerdown', onPointerDown);

      addEventListener('keydown', onKeyDown);

      return () => {
        removeEventListener('pointerdown', onPointerDown);

        removeEventListener('keydown', onKeyDown);
      };
    }, [menuOpen, menuRoot]);

    /**
     * What the menu holds.
     *
     * The two service-worker actions are in it whatever the pane's width,
     * because they are rare, they are hard to label in an icon, and a menu row
     * has room to say what they do. The rest of it is what a narrow pane has
     * no room for inline.
     */
    const menuItems = React.useMemo<readonly PaneMenuAction[]>(
      () => [
        // Each group is typed as `PaneMenuAction[]` rather than inferred: a
        // spread of a conditional array widens to include `undefined`.
        ...(blockedBySite
          ? ([
              {
                icon: 'clear-sw',
                label: 'Clear the site\u{2019}s service workers',
                title:
                  'This page may be served by the site\u{2019}s own service worker, which puts it out of reach of the header-stripping rules. This removes the worker and reloads the pane; the site registers it again on its next ordinary visit.',
                tone: 'warn',
                onSelect: handleResetServiceWorkers,
              },
            ] satisfies readonly PaneMenuAction[])
          : []),
        ...(showResetToggle
          ? ([
              {
                icon: 'clear-sw',
                label: alwaysReset
                  ? 'Stop clearing them for this site'
                  : 'Always clear them for this site',
                title: resetToggleTitle,
                pressed: alwaysReset,
                onSelect: handleToggleAlwaysReset,
              },
            ] satisfies readonly PaneMenuAction[])
          : []),
        ...(compact
          ? ([
              {
                icon: 'external',
                label: 'Open in a new tab',
                title: 'Open in a new tab',
                disabled: address === '',
                onSelect: handleOpenExternally,
              },
              {
                icon: pane.sandboxed ? 'lock' : 'unlock',
                label: pane.sandboxed
                  ? 'Turn the sandbox off'
                  : 'Turn the sandbox on',
                title: pane.sandboxed
                  ? 'Turn the sandbox off (this page will be able to reach the frames above it)'
                  : 'Turn the sandbox on',
                tone: pane.sandboxed ? undefined : 'warn',
                onSelect: handleToggleSandbox,
              },
              {
                icon: 'split-right',
                label: 'Split to the right',
                title: 'Split to the right',
                onSelect: handleSplitRow,
              },
              {
                icon: 'split-down',
                label: 'Split downwards',
                title: 'Split downwards',
                onSelect: handleSplitColumn,
              },
            ] satisfies readonly PaneMenuAction[])
          : []),
      ],
      [
        compact,
        blockedBySite,
        showResetToggle,
        alwaysReset,
        resetToggleTitle,
        address,
        pane.sandboxed,
        handleResetServiceWorkers,
        handleToggleAlwaysReset,
        handleOpenExternally,
        handleToggleSandbox,
        handleSplitRow,
        handleSplitColumn,
      ],
    );

    const label = pane.title ?? hostnameOf(address) ?? 'Empty pane';

    const faviconUrl =
      address === ''
        ? undefined
        : chrome.runtime.getURL(`/_favicon/?${faviconQuery(address)}`);

    return (
      <section
        className={paneClassName(active, moving)}
        style={style}
        onPointerDownCapture={handleActivate}
      >
        <header className={'pane__bar'}>
          <button
            aria-label={'Move this pane'}
            className={'pane__grip'}
            title={
              'Drag to move. Drop on the middle of another pane to swap places with it, on an edge to take that side of it. Neither reloads.'
            }
            type={'button'}
            onPointerDown={handleMoveStart}
          >
            <Icon icon={'grip'} />
          </button>
          <button
            aria-label={'Back'}
            className={'pane__button'}
            disabled={!agentSeen || pane.historyLength <= 1}
            title={'Back'}
            type={'button'}
            onClick={handleBack}
          >
            <Icon icon={'back'} />
          </button>
          <button
            aria-label={'Forward'}
            className={'pane__button'}
            disabled={!agentSeen}
            title={'Forward'}
            type={'button'}
            onClick={handleForward}
          >
            <Icon icon={'forward'} />
          </button>
          <button
            aria-label={'Reload'}
            className={'pane__button'}
            disabled={pane.url === ''}
            title={'Reload'}
            type={'button'}
            onClick={handleReload}
          >
            <Icon icon={'reload'} />
          </button>

          <form className={'pane__address'} onSubmit={handleSubmit}>
            {faviconUrl === undefined ? undefined : (
              <img alt={''} className={'pane__favicon'} src={faviconUrl} />
            )}
            <input
              aria-label={'Address'}
              className={'pane__input'}
              placeholder={'Address, or something to search for'}
              spellCheck={false}
              type={'text'}
              value={draft}
              onChange={handleAddressChange}
            />
          </form>

          {compact ? undefined : (
            <>
              <button
                aria-label={'Zoom out'}
                className={'pane__button'}
                disabled={steppedPaneZoom(pane.zoom, 'out') === pane.zoom}
                title={'Zoom out (Ctrl + wheel does it too)'}
                type={'button'}
                onClick={handleZoomOut}
              >
                <Icon icon={'minus'} />
              </button>
              <button
                aria-label={`Zoom ${zoomLabel}. Back to 100%`}
                className={'pane__zoom'}
                title={'Back to 100%'}
                type={'button'}
                onClick={handleZoomReset}
              >
                {zoomLabel}
              </button>
              <button
                aria-label={'Zoom in'}
                className={'pane__button'}
                disabled={steppedPaneZoom(pane.zoom, 'in') === pane.zoom}
                title={'Zoom in (Ctrl + wheel does it too)'}
                type={'button'}
                onClick={handleZoomIn}
              >
                <Icon icon={'plus'} />
              </button>
            </>
          )}

          {serviceWorkersRemoved === undefined ? undefined : (
            <span className={'pane__warning'} title={'Service workers removed'}>
              {`SW-${serviceWorkersRemoved}`}
            </span>
          )}

          {blocked ? (
            <span
              className={'pane__warning'}
              title={
                'No answer from this page. It may be refusing to be framed, or be a page the extension cannot run its script in \u{2014} a chrome:// URL, the Web Store, an error page.'
              }
            >
              <Icon icon={'warning'} />
            </span>
          ) : undefined}

          {compact ? undefined : (
            <>
              <button
                aria-label={'Open in a new tab'}
                className={'pane__button'}
                disabled={address === ''}
                title={'Open in a new tab'}
                type={'button'}
                onClick={handleOpenExternally}
              >
                <Icon icon={'external'} />
              </button>
              <button
                aria-label={
                  pane.sandboxed
                    ? 'Turn the sandbox off (this page will be able to reach the frames above it)'
                    : 'Turn the sandbox on'
                }
                className={
                  pane.sandboxed
                    ? 'pane__button'
                    : 'pane__button pane__button--warn'
                }
                title={
                  pane.sandboxed
                    ? 'Turn the sandbox off (this page will be able to reach the frames above it)'
                    : 'Turn the sandbox on'
                }
                type={'button'}
                onClick={handleToggleSandbox}
              >
                <Icon icon={pane.sandboxed ? 'lock' : 'unlock'} />
              </button>
              <button
                aria-label={'Split to the right'}
                className={'pane__button'}
                title={'Split to the right'}
                type={'button'}
                onClick={handleSplitRow}
              >
                <Icon icon={'split-right'} />
              </button>
              <button
                aria-label={'Split downwards'}
                className={'pane__button'}
                title={'Split downwards'}
                type={'button'}
                onClick={handleSplitColumn}
              >
                <Icon icon={'split-down'} />
              </button>
            </>
          )}

          {Arr.isEmpty(menuItems) ? undefined : (
            <span ref={setMenuRoot} className={'pane__menu'}>
              <button
                aria-expanded={menuOpen}
                aria-label={'More for this pane'}
                className={'pane__button'}
                title={'More for this pane'}
                type={'button'}
                onClick={handleToggleMenu}
              >
                <Icon icon={'more'} />
              </button>

              {menuOpen ? (
                <div className={'pane__menu-popover'}>
                  {compact ? (
                    <div className={'pane__menu-zoom'}>
                      <button
                        aria-label={'Zoom out'}
                        className={'pane__button'}
                        disabled={
                          steppedPaneZoom(pane.zoom, 'out') === pane.zoom
                        }
                        title={'Zoom out (Ctrl + wheel does it too)'}
                        type={'button'}
                        onClick={handleZoomOut}
                      >
                        <Icon icon={'minus'} />
                      </button>
                      <button
                        aria-label={`Zoom ${zoomLabel}. Back to 100%`}
                        className={'pane__zoom'}
                        title={'Back to 100%'}
                        type={'button'}
                        onClick={handleZoomReset}
                      >
                        {zoomLabel}
                      </button>
                      <button
                        aria-label={'Zoom in'}
                        className={'pane__button'}
                        disabled={
                          steppedPaneZoom(pane.zoom, 'in') === pane.zoom
                        }
                        title={'Zoom in (Ctrl + wheel does it too)'}
                        type={'button'}
                        onClick={handleZoomIn}
                      >
                        <Icon icon={'plus'} />
                      </button>
                    </div>
                  ) : undefined}

                  {menuItems.map((item) => (
                    <PaneMenuItem
                      key={item.label}
                      item={item}
                      onChosen={handleCloseMenu}
                    />
                  ))}
                </div>
              ) : undefined}
            </span>
          )}

          <button
            aria-label={'Close this pane'}
            className={'pane__button'}
            disabled={!canClose}
            title={'Close this pane'}
            type={'button'}
            onClick={handleClose}
          >
            <Icon icon={'close'} />
          </button>
        </header>

        <div className={'pane__body'}>
          {resetUrl === undefined ? undefined : (
            <iframe
              ref={setResetFrame}
              className={'pane__helper'}
              sandbox={paneSandboxTokens}
              src={resetUrl}
              title={'service worker reset'}
              onLoad={handleResetFrameLoad}
            />
          )}
          {pane.url === '' ? (
            <div className={'pane__empty'}>
              {'Type an address in the bar above'}
            </div>
          ) : (
            <iframe
              // Replacing the element is what a hard reload is, and what makes
              // a changed `sandbox` attribute take effect.
              key={pane.reloadToken}
              ref={setPaneFrame}
              allow={paneAllowList}
              className={'pane__frame'}
              name={`${paneFrameNamePrefix}${pane.id}`}
              sandbox={pane.sandboxed ? paneSandboxTokens : undefined}
              src={pane.url}
              style={frameStyle}
              title={label}
              onLoad={handleFrameLoad}
            />
          )}

          {/* Over the frame rather than instead of it: the element stays in
              the document, because taking it out and putting it back is a
              reload. */}
          {blocked && !fallbackDismissed && !clearingAutomatically ? (
            <PaneFallback
              address={agentSeen ? undefined : address}
              canClearServiceWorkers={canClearServiceWorkers}
              canOpenExternally={address !== ''}
              canReload={canRetry}
              refusal={browserRefusal}
              onClearServiceWorkers={handleResetServiceWorkers}
              onDismiss={handleDismissFallback}
              onOpenExternally={handleOpenExternally}
              onReload={handleReload}
            />
          ) : undefined}
        </div>
      </section>
    );
  },
);

/** `_favicon/` serves the icon Chrome already has for a page. */
const faviconQuery = (pageUrl: string): string => {
  const params = new URLSearchParams({ pageUrl, size: '16' });

  return params.toString();
};
