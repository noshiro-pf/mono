import * as React from 'react';
import { memoNamed } from 'react-utils';
import { Num } from 'ts-data-forge';
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
import { hostnameOf, originOf, type WorkspaceAction } from '../state/index.mjs';

/**
 * How long a pane waits for its frame to say hello before it says the page may
 * not be embeddable. Long enough for a slow site, short enough to be an answer.
 */
const agentTimeoutMs = 2500;

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

    const showAgentWarning =
      !agentSeen && pane.url !== '' && waitedFor === loadKey;

    const siteOrigin = originOf(address);

    const alwaysReset =
      siteOrigin !== undefined && resetOrigins.includes(siteOrigin);

    /** The load a reset was already attempted for, so it happens once. */
    const [resetAttemptedFor, setResetAttemptedFor] = React.useState<
      string | undefined
    >(undefined);

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
          setServiceWorkersRemoved(message.count);

          setResetUrl(undefined);

          dispatch({ type: 'reload', paneId: pane.id });

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
    }, [paneFrame, resetFrame, dispatch, pane.id]);

    React.useEffect(() => {
      if (agentSeen) {
        return undefined;
      }

      const timer = setTimeout(() => {
        setWaitedFor(loadKey);
      }, agentTimeoutMs);

      return () => {
        clearTimeout(timer);
      };
    }, [agentSeen, loadKey]);

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
      // element is the only way to reload a pane that has no agent.
      if (agentSeen) {
        sendCommand('reload');
      } else {
        dispatch({ type: 'reload', paneId: pane.id });
      }
    }, [agentSeen, sendCommand, dispatch, pane.id]);

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
      siteOrigin !== undefined && (alwaysReset || showAgentWarning);

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
      if (!alwaysReset || !showAgentWarning) {
        return;
      }

      if (resetUrl !== undefined || resetAttemptedFor === loadKey) {
        return;
      }

      setResetAttemptedFor(loadKey);

      setResetUrl(`${siteOrigin}/`);
    }, [
      alwaysReset,
      showAgentWarning,
      resetUrl,
      resetAttemptedFor,
      loadKey,
      siteOrigin,
    ]);

    // And while such a pane is loading fine, the worker is kept away: the site
    // registers it again on every visit, and the next navigation would be the
    // one to fail.
    React.useEffect(() => {
      if (alwaysReset && agentSeen) {
        sendToFrame({
          tag: splitViewMessageTag,
          kind: 'unregister-service-workers',
          paneId: pane.id,
        });
      }
    }, [alwaysReset, agentSeen, sendToFrame, pane.id]);

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

    const handleOpenExternally = React.useCallback((): void => {
      if (address !== '') {
        chrome.tabs.create({ url: address }).catch(console.error);
      }
    }, [address]);

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
     * Zoom, as the browser does it: the element is made `1 / zoom` of the
     * space it has and then drawn at `zoom`, so the site is laid out for the
     * viewport it appears to have — narrower as you zoom in, wider as you zoom
     * out — rather than being a picture of a page stretched to fit.
     *
     * `transform-origin` is the top left because that corner is the one the
     * pane's rectangle is positioned from.
     */
    const frameStyle = React.useMemo<React.CSSProperties>(() => {
      if (!Num.isNonZero(pane.zoom) || pane.zoom === 1) {
        return {};
      }

      const inverse = `${String(Num.div(100, pane.zoom))}%` as const;

      return {
        width: inverse,
        height: inverse,
        transform: `scale(${String(pane.zoom)})`,
        transformOrigin: '0 0',
      };
    }, [pane.zoom]);

    const zoomLabel = formatPaneZoom(pane.zoom);

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
            {'⠿'}
          </button>
          <button
            aria-label={'Back'}
            className={'pane__button'}
            disabled={!agentSeen || pane.historyLength <= 1}
            title={'Back'}
            type={'button'}
            onClick={handleBack}
          >
            {'←'}
          </button>
          <button
            aria-label={'Forward'}
            className={'pane__button'}
            disabled={!agentSeen}
            title={'Forward'}
            type={'button'}
            onClick={handleForward}
          >
            {'→'}
          </button>
          <button
            aria-label={'Reload'}
            className={'pane__button'}
            disabled={pane.url === ''}
            title={'Reload'}
            type={'button'}
            onClick={handleReload}
          >
            {'↻'}
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

          <button
            aria-label={'Zoom out'}
            className={'pane__button'}
            disabled={steppedPaneZoom(pane.zoom, 'out') === pane.zoom}
            title={'Zoom out (Ctrl + wheel does it too)'}
            type={'button'}
            onClick={handleZoomOut}
          >
            {'－'}
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
            {'＋'}
          </button>

          {showAgentWarning ? (
            <button
              className={'pane__button pane__button--warn'}
              title={
                'This page may be served by the site\u{2019}s own service worker, which puts it out of reach of the header-stripping rules. This removes the worker and reloads the pane; the site registers it again on its next ordinary visit.'
              }
              type={'button'}
              onClick={handleResetServiceWorkers}
            >
              {'Clear SW'}
            </button>
          ) : undefined}

          {showResetToggle ? (
            <button
              aria-pressed={alwaysReset}
              className={
                alwaysReset ? 'pane__button pane__button--on' : 'pane__button'
              }
              title={resetToggleTitle}
              type={'button'}
              onClick={handleToggleAlwaysReset}
            >
              {alwaysReset ? 'SW auto' : 'Always clear'}
            </button>
          ) : undefined}

          {serviceWorkersRemoved === undefined ? undefined : (
            <span className={'pane__warning'} title={'Service workers removed'}>
              {`SW-${serviceWorkersRemoved}`}
            </span>
          )}

          {showAgentWarning ? (
            <span
              className={'pane__warning'}
              title={
                'No answer from this page. It may be refusing to be framed, or be a page the extension cannot run its script in \u{2014} a chrome:// URL, the Web Store, an error page.'
              }
            >
              {'⚠'}
            </span>
          ) : undefined}

          <button
            aria-label={'Open in a new tab'}
            className={'pane__button'}
            disabled={address === ''}
            title={'Open in a new tab'}
            type={'button'}
            onClick={handleOpenExternally}
          >
            {'↗'}
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
            {pane.sandboxed ? '🔒' : '🔓'}
          </button>
          <button
            aria-label={'Split to the right'}
            className={'pane__button'}
            title={'Split to the right'}
            type={'button'}
            onClick={handleSplitRow}
          >
            {'⬌'}
          </button>
          <button
            aria-label={'Split downwards'}
            className={'pane__button'}
            title={'Split downwards'}
            type={'button'}
            onClick={handleSplitColumn}
          >
            {'⬍'}
          </button>
          <button
            aria-label={'Close this pane'}
            className={'pane__button'}
            disabled={!canClose}
            title={'Close this pane'}
            type={'button'}
            onClick={handleClose}
          >
            {'✕'}
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
              onLoad={announceToFrame}
            />
          )}
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
