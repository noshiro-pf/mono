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
import { hostnameOf, originOf, type WorkspaceAction } from '../state/index.mjs';
import { Icon, type IconName } from './icon.js';

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
        ...(showAgentWarning
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
        showAgentWarning,
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

          {showAgentWarning ? (
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
