import {
  createBooleanState,
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
import { Arr, fastDeepEqual } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  asFrameToPage,
  frameKeyOf,
  frameTag,
  graceMs,
  hostnameOf,
  initialPaneLoad,
  loadKeyOf,
  noAnswerMs,
  paneFrameNamePrefix,
  paneLoadReducer,
  paneLoadView,
  type FrameCommand,
  type PageToFrame,
  type Pane,
  type PaneId,
  type PaneLoadEvent,
  type PaneLoadView,
  type Rect,
  type WorkspaceAction,
  type ZoomStep,
} from '../../core/index.mjs';
import { px } from './drop-indicator.js';
import { Icon } from './icon.js';
import { clearWorkersTitle, PaneFallback } from './pane-fallback.js';
import {
  PaneMenuRow,
  type PaneMenuChoice,
  type PaneMenuItem,
} from './pane-menu.js';
import { ZoomControls } from './zoom-controls.js';

/** What the layout says about one pane. */
export type PaneView = Readonly<{
  pane: Pane;
  rect: Rect;
  active: boolean;
  canClose: boolean;
  /** This pane is being dragged elsewhere. */
  moving: boolean;
}>;

type Props = Readonly<{
  /** Fixed: a pane is keyed by its id. */
  paneId: PaneId;
  view$: InitializedObservable<PaneView>;
  resetOrigins$: InitializedObservable<readonly string[]>;
  dispatch: (action: WorkspaceAction) => void;
  onNavigate: (paneId: PaneId, input: string) => void;
  onMoveStart: (paneId: PaneId) => void;
  /** Alt+N pressed inside this pane's own frame. */
  onShortcut: (code: string) => void;
  onToggleResetOrigin: (origin: string, enabled: boolean) => void;
}>;

/**
 * One pane (spec §3): its toolbar, its frame, the hidden helper frame that
 * clears a site's service workers, and the fallback. Whether the page loaded is
 * `paneLoadReducer`'s to decide; this component runs its timers and feeds it
 * what happens.
 */
export const PaneFrame = ({
  paneId,
  view$,
  resetOrigins$,
  dispatch,
  onNavigate,
  onMoveStart,
  onShortcut,
  onToggleResetOrigin,
}: Props): JSX.Element => {
  const afterUpdate = createAfterUpdate();

  const pane$ = view$.pipe(map(({ pane }) => pane));

  // By value: the layout makes every rectangle afresh on each drag move.
  const rect$ = view$.pipe(map(({ rect }) => rect, { equals: fastDeepEqual }));

  const compact$ = rect$.pipe(map(({ width }) => width < compactWidthPx));

  const [load$, , { updateState: updateLoad }] = createState(
    initialPaneLoad(loadKeyOf(pane$.getSnapshot().value)),
  );

  const send = (event: PaneLoadEvent): void => {
    updateLoad((state) => paneLoadReducer(state, event));
  };

  const model$ = derive([load$, pane$, resetOrigins$], paneLoadView, {
    equals: fastDeepEqual,
  });

  const [menuOpen$, { setFalse: closeMenu, toggle: toggleMenu }] =
    createBooleanState(false);

  const mut_refs: {
    frame: HTMLIFrameElement | undefined;
    helper: HTMLIFrameElement | undefined;
    menu: HTMLElement | undefined;
    address: HTMLInputElement | undefined;
  } = {
    frame: undefined,
    helper: undefined,
    menu: undefined,
    address: undefined,
  };

  const mut_timers = new Set<ReturnType<typeof setTimeout>>();

  const later = (ms: number, act: () => void): void => {
    const timer = setTimeout(() => {
      mut_timers.delete(timer);

      act();
    }, ms);

    mut_timers.add(timer);
  };

  onScopeDispose(() => {
    for (const timer of mut_timers) {
      clearTimeout(timer);
    }
  });

  const postTo = (target: 'frame' | 'helper', message: PageToFrame): void => {
    // Any origin: the pane is wherever the user went, and this says nothing.
    mut_refs[target]?.contentWindow?.postMessage(message, '*');
  };

  const command = (name: FrameCommand): void => {
    postTo('frame', {
      tag: frameTag,
      kind: 'command',
      paneId,
      command: name,
    });
  };

  const assign = (): void => {
    postTo('frame', { tag: frameTag, kind: 'assign', paneId });
  };

  /**
   * Loads the pane afresh in a new element: where a link was taking it, when
   * the frame said, since the document that failed is that one.
   */
  const replaceFrame = (): void => {
    const { leavingFor } = load$.getSnapshot().value;

    if (leavingFor === undefined) {
      dispatch({ type: 'reload', paneId });
    } else {
      onNavigate(paneId, leavingFor);
    }
  };

  const reload = (): void => {
    // Through the frame keeps its history; a frame that cannot answer is
    // replaced.
    if (model$.getSnapshot().value.frameAnswers) {
      command('reload');
    } else {
      replaceFrame();
    }
  };

  const clearWorkers = (automatic: boolean): void => {
    const { siteOrigin } = model$.getSnapshot().value;

    if (siteOrigin === undefined) {
      return;
    }

    send({ type: 'clear-workers', origin: siteOrigin, automatic });

    const { helperSerial } = load$.getSnapshot().value;

    // A helper whose address is answered by the worker too never reports.
    later(noAnswerMs, () => {
      send({ type: 'helper-timeout', serial: helperSerial });
    });
  };

  const openInTab = (): void => {
    const { target } = model$.getSnapshot().value;

    if (target !== '') {
      chrome.tabs.create({ url: target }).catch(console.error);
    }
  };

  const toggleSandbox = (): void => {
    dispatch({
      type: 'set-sandboxed',
      paneId,
      sandboxed: !pane$.getSnapshot().value.sandboxed,
    });
  };

  const zoomBy = (step: ZoomStep): void => {
    dispatch({ type: 'zoom', paneId, step });
  };

  const splitPane = (axis: 'column' | 'row'): void => {
    dispatch({ type: 'split', paneId, axis, input: '' });
  };

  const menuActions = {
    'clear-workers': () => {
      clearWorkers(false);
    },
    'toggle-always-clear': () => {
      const { alwaysClear, siteOrigin } = model$.getSnapshot().value;

      if (siteOrigin !== undefined) {
        onToggleResetOrigin(siteOrigin, !alwaysClear);
      }
    },
    'open-in-tab': openInTab,
    'toggle-sandbox': toggleSandbox,
    'split-row': () => {
      splitPane('row');
    },
    'split-column': () => {
      splitPane('column');
    },
  } as const satisfies ReadonlyRecord<PaneMenuChoice, () => void>;

  const menuItems$ = derive([model$, pane$, compact$], menuItemsOf, {
    equals: fastDeepEqual,
  });

  // What the frames say. A message counts only from this pane's own frame, so
  // that a page cannot report for another pane.
  listenInScope(globalThis, 'message', (event) => {
    if (!(event instanceof MessageEvent) || event.source === null) {
      return;
    }

    const fromFrame = event.source === mut_refs.frame?.contentWindow;

    const fromHelper = event.source === mut_refs.helper?.contentWindow;

    const message =
      fromFrame || fromHelper ? asFrameToPage(event.data) : undefined;

    if (message === undefined) {
      return;
    }

    switch (message.kind) {
      case 'service-workers':
        // Only the helper's clear is a repair worth a reload.
        if (fromHelper) {
          send({ type: 'workers-removed', count: message.count });

          replaceFrame();
        }

        return;

      case 'hello':
        if (fromFrame) {
          assign();
        }

        return;

      case 'leaving':
        if (fromFrame) {
          send({ type: 'leaving', url: message.url });
        }

        return;

      case 'zoom':
        if (fromFrame) {
          dispatch({ type: 'zoom', paneId, step: message.step });
        }

        return;

      case 'shortcut':
        // Only from this pane's own frame, not from one nested in it.
        if (fromFrame) {
          onShortcut(message.code);
        }

        return;

      case 'state':
        if (fromFrame) {
          send({ type: 'report' });

          dispatch({
            type: 'report',
            paneId,
            url: message.url,
            title: message.title,
            historyLength: message.historyLength,
          });
        }
    }
  });

  // A new address, element or sandbox is a new load, with a backstop for a
  // frame that never even fires `load`.
  pane$.pipe(map(loadKeyOf)).subscribe((loadKey) => {
    afterUpdate(() => {
      send({ type: 'load-key', loadKey });

      const { loadSerial } = load$.getSnapshot().value;

      later(noAnswerMs, () => {
        send({ type: 'waited-out', loadSerial });
      });
    });
  });

  // An always-clear site's pane does not wait to be asked (spec P15).
  model$.subscribe(({ shouldClearAutomatically }) => {
    if (shouldClearAutomatically) {
      afterUpdate(() => {
        clearWorkers(true);
      });
    }
  });

  // A pane that grows out of compact closes its menu, as does one whose items
  // all went.
  compact$.subscribe(() => {
    afterUpdate(closeMenu);
  });

  menuItems$.subscribe((items) => {
    if (!Arr.isNonEmpty(items)) {
      afterUpdate(closeMenu);
    }
  });

  const onFrameLoad = (): void => {
    send({ type: 'frame-load' });

    assign();

    const { frameLoads } = load$.getSnapshot().value;

    later(graceMs, () => {
      send({ type: 'grace-elapsed', frameLoads });
    });
  };

  const listenForMenuClose = (): void => {
    listenInScope(globalThis, 'pointerdown', (event) => {
      if (
        mut_refs.menu !== undefined &&
        event.target instanceof Node &&
        !mut_refs.menu.contains(event.target)
      ) {
        closeMenu();
      }
    });

    listenInScope(globalThis, 'keydown', (event) => {
      if (
        event instanceof KeyboardEvent &&
        event.key === 'Escape' &&
        !isImeKeyDown(event)
      ) {
        closeMenu();
      }
    });
  };

  const sandboxLabel$ = pane$.pipe(
    map(({ sandboxed }) =>
      sandboxed
        ? 'Turn the sandbox off (this page will be able to reach the frames above it)'
        : 'Turn the sandbox on',
    ),
  );

  const address$ = model$.pipe(map(({ address }) => address));

  return (
    <section
      ref={(element) => {
        // Capture: a press on a control makes this the active pane first.
        listenInScope(
          element,
          'pointerdown',
          () => {
            dispatch({ type: 'activate', paneId });
          },
          { capture: true },
        );
      }}
      aria-label={pane$.pipe(map(labelOf))}
      class={view$.pipe(
        map(({ active, moving }) =>
          ['pane', active ? 'pane--active' : '', moving ? 'pane--moving' : '']
            .filter((part) => part !== '')
            .join(' '),
        ),
      )}
      data-e2e={constant('pane')}
      style={{
        left: rect$.pipe(map(({ left }) => px(left))),
        top: rect$.pipe(map(({ top }) => px(top))),
        width: rect$.pipe(map(({ width }) => px(width))),
        height: rect$.pipe(map(({ height }) => px(height))),
      }}
    >
      <header class={constant('pane__bar')} data-e2e={constant('pane-bar')}>
        <button
          aria-label={constant('Move this pane')}
          class={constant('pane__grip')}
          title={constant(
            'Drag to move. Drop on the middle of another pane to swap places with it, on an edge to take that side of it. Neither reloads.',
          )}
          type={constant('button')}
          onPointerDown={(event) => {
            event.preventDefault();

            onMoveStart(paneId);
          }}
        >
          <Icon icon={'grip'} />
        </button>
        <button
          aria-label={constant('Back')}
          class={constant('pane__button')}
          // `history.length` counts the tab's joint history, as the frame's
          // `history.back()` walks it (see the frame agent's `back`).
          disabled={pane$.pipe(
            map(
              ({ live }) =>
                live.currentUrl === undefined || live.historyLength <= 1,
            ),
          )}
          title={constant('Back')}
          type={constant('button')}
          onClick={() => {
            command('back');
          }}
        >
          <Icon icon={'back'} />
        </button>
        <button
          aria-label={constant('Forward')}
          class={constant('pane__button')}
          disabled={pane$.pipe(
            map(({ live }) => live.currentUrl === undefined),
          )}
          title={constant('Forward')}
          type={constant('button')}
          onClick={() => {
            command('forward');
          }}
        >
          <Icon icon={'forward'} />
        </button>
        <button
          aria-label={constant('Reload')}
          class={constant('pane__button')}
          disabled={pane$.pipe(map(({ url }) => url === ''))}
          title={constant('Reload')}
          type={constant('button')}
          onClick={reload}
        >
          <Icon icon={'reload'} />
        </button>

        <form
          class={constant('pane__address')}
          onSubmit={(event) => {
            event.preventDefault();

            onNavigate(
              paneId,
              mut_refs.address?.value ?? address$.getSnapshot().value,
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
              mut_refs.address = element;
            }}
            aria-label={constant('Address')}
            class={constant('pane__input')}
            data-e2e={constant('pane-address')}
            placeholder={constant('Address, or something to search for')}
            spellcheck={constant(false)}
            type={constant('text')}
            // Written when the address changes only: a draft stays.
            value={address$}
          />
        </form>

        <If
          cond={compact$.pipe(map((compact) => !compact))}
          then={
            <ZoomControls
              zoom$={pane$.pipe(map(({ zoom }) => zoom))}
              onZoom={zoomBy}
            />
          }
        />

        <If
          cond={load$.pipe(
            map(({ removedWorkers }) => removedWorkers !== undefined),
          )}
          then={
            <span
              class={constant('pane__warning')}
              title={constant('Service workers removed')}
            >
              {load$.pipe(
                map(
                  ({ removedWorkers }) =>
                    `SW-${removedWorkers?.toString() ?? ''}`,
                ),
              )}
            </span>
          }
        />

        <If
          cond={model$.pipe(map(({ blocked }) => blocked))}
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
                onClick={openInTab}
              >
                <Icon icon={'external'} />
              </button>
              <button
                aria-label={sandboxLabel$}
                aria-pressed={pane$.pipe(
                  map(({ sandboxed }) => sandboxed.toString()),
                )}
                class={pane$.pipe(
                  map(({ sandboxed }) =>
                    sandboxed
                      ? 'pane__button'
                      : 'pane__button pane__button--warn',
                  ),
                )}
                data-e2e={constant('pane-sandbox')}
                title={sandboxLabel$}
                type={constant('button')}
                onClick={toggleSandbox}
              >
                <Icon
                  icon={pane$.pipe(
                    map(({ sandboxed }) => (sandboxed ? 'lock' : 'unlock')),
                  )}
                />
              </button>
              <button
                aria-label={constant('Split to the right')}
                class={constant('pane__button')}
                data-e2e={constant('pane-split-right')}
                title={constant('Split to the right')}
                type={constant('button')}
                onClick={() => {
                  splitPane('row');
                }}
              >
                <Icon icon={'split-right'} />
              </button>
              <button
                aria-label={constant('Split downwards')}
                class={constant('pane__button')}
                data-e2e={constant('pane-split-down')}
                title={constant('Split downwards')}
                type={constant('button')}
                onClick={() => {
                  splitPane('column');
                }}
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
                mut_refs.menu = element;
              }}
              class={constant('pane__menu')}
            >
              <button
                aria-expanded={menuOpen$.pipe(map((open) => open.toString()))}
                aria-haspopup={constant('menu')}
                aria-label={constant('More for this pane')}
                class={constant('pane__button')}
                data-e2e={constant('pane-more')}
                title={constant('More for this pane')}
                type={constant('button')}
                onClick={() => {
                  toggleMenu();
                }}
              >
                <Icon icon={'more'} />
              </button>

              <If
                cond={menuOpen$}
                then={
                  <div
                    ref={listenForMenuClose}
                    class={constant('pane__menu-popover')}
                    data-e2e={constant('pane-menu')}
                    role={constant('menu')}
                  >
                    <If
                      cond={compact$}
                      then={
                        <div class={constant('pane__menu-zoom')}>
                          <ZoomControls
                            zoom$={pane$.pipe(map(({ zoom }) => zoom))}
                            onZoom={zoomBy}
                          />
                        </div>
                      }
                    />
                    <For items={menuItems$} key={(item) => item.choice}>
                      {(item$) => (
                        <PaneMenuRow
                          item$={item$}
                          onChosen={(choice) => {
                            menuActions[choice]();

                            closeMenu();
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
          data-e2e={constant('pane-close')}
          disabled={view$.pipe(map(({ canClose }) => !canClose))}
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
        {/* Keyed by the clear, so each is a new element and a new load. */}
        <For
          items={load$.pipe(
            map(({ helper }) => (helper === undefined ? [] : [helper])),
          )}
          key={({ serial }) => serial}
        >
          {(helper$) => (
            <iframe
              ref={(element) => {
                mut_refs.helper = element;

                // Before `src`: it applies to the next document.
                element.setAttribute('sandbox', sandboxTokens);
              }}
              class={constant('pane__helper')}
              src={constant(helper$.getSnapshot().value.url)}
              title={constant('Service worker reset')}
              onLoad={() => {
                postTo('helper', {
                  tag: frameTag,
                  kind: 'assign',
                  paneId,
                });

                postTo('helper', {
                  tag: frameTag,
                  kind: 'unregister-service-workers',
                  paneId,
                });
              }}
            />
          )}
        </For>

        <If
          cond={pane$.pipe(map(({ url }) => url === ''))}
          then={
            <div class={constant('pane__empty')}>
              {constant('Type an address in the bar above')}
            </div>
          }
          else={
            <For
              // Empty with the address, so that a row on its way out does not
              // bind `src` to `''`.
              items={pane$.pipe(map((pane) => (pane.url === '' ? [] : [pane])))}
              key={frameKeyOf}
            >
              {(shown$) => (
                <iframe
                  ref={(element) => {
                    mut_refs.frame = element;

                    // Before `src`; a change is a new element, as the key says.
                    if (shown$.getSnapshot().value.sandboxed) {
                      element.setAttribute('sandbox', sandboxTokens);
                    }

                    // The frame may be ready before `load` or after it.
                    afterUpdate(assign);
                  }}
                  allow={constant(allowList)}
                  class={constant('pane__frame')}
                  data-e2e={constant('pane-frame')}
                  name={constant(`${paneFrameNamePrefix}${paneId.toString()}`)}
                  // Through a cut-off: writing the same `src` again navigates.
                  src={shown$.pipe(map(({ url }) => url))}
                  style={{
                    zoom: shown$.pipe(
                      map(({ zoom: level }) => zoomStyleOf(level)),
                    ),
                  }}
                  title={shown$.pipe(map(labelOf))}
                  onLoad={onFrameLoad}
                />
              )}
            </For>
          }
        />

        <If
          cond={model$.pipe(map(({ showFallback }) => showFallback))}
          then={
            <PaneFallback
              address={model$.pipe(
                map(({ address, frameAnswers }) =>
                  frameAnswers ? undefined : address,
                ),
              )}
              canClearWorkers={model$.pipe(
                map(
                  ({ blockedBySite, siteOrigin }) =>
                    blockedBySite && siteOrigin !== undefined,
                ),
              )}
              canOpen={model$.pipe(map(({ target }) => target !== ''))}
              canRetry={model$.pipe(map(({ canRetry }) => canRetry))}
              refusal={model$.pipe(map(({ refusal }) => refusal))}
              onClearWorkers={() => {
                clearWorkers(false);
              }}
              onDismiss={() => {
                send({ type: 'dismiss' });
              }}
              onOpen={openInTab}
              onRetry={reload}
            />
          }
        />
      </div>
    </section>
  );
};

/**
 * Everything but top navigation (spec P5): dropping `allow-top-navigation` is
 * what stops a framed page replacing the split view with itself, which the
 * header rules would leave it free to do. `allow-same-origin` keeps its
 * cookies, without which every pane is signed out.
 */
const sandboxTokens = [
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

const allowList = [
  'autoplay',
  'clipboard-read',
  'clipboard-write',
  'encrypted-media',
  'fullscreen',
  'picture-in-picture',
].join('; ');

/** Below this the zoom, sandbox, split and open-in-tab controls are in the menu (spec P7). */
const compactWidthPx = 440;

/**
 * The menu (spec P7, P14, P15): the service worker actions always, being rare
 * and hard to say in an icon; the rest only when the pane is too narrow for
 * them inline.
 */
const menuItemsOf = (
  model: PaneLoadView,
  pane: Pane,
  compact: boolean,
): readonly PaneMenuItem[] => {
  const item = (
    fields: Pick<PaneMenuItem, 'choice' | 'icon' | 'label' | 'title'> &
      Partial<PaneMenuItem>,
  ): PaneMenuItem =>
    ({
      disabled: false,
      pressed: undefined,
      warn: false,
      ...fields,
    }) as const;

  const { blockedBySite, siteOrigin, alwaysClear, address } = model;

  return [
    ...(blockedBySite && siteOrigin !== undefined
      ? [
          item({
            choice: 'clear-workers',
            icon: 'clear-sw',
            label: 'Clear the site\u{2019}s service workers',
            title: clearWorkersTitle,
            warn: true,
          }),
        ]
      : []),
    ...(siteOrigin !== undefined && (alwaysClear || blockedBySite)
      ? [
          item({
            choice: 'toggle-always-clear',
            icon: 'clear-sw',
            label: alwaysClear
              ? 'Stop clearing them for this site'
              : 'Always clear them for this site',
            title: alwaysClear
              ? `Service workers are always cleared for ${siteOrigin}. Click to stop.`
              : `Always clear service workers for ${siteOrigin}`,
            pressed: alwaysClear,
          }),
        ]
      : []),
    ...(compact
      ? [
          item({
            choice: 'open-in-tab',
            icon: 'external',
            label: 'Open in a new tab',
            title: 'Open in a new tab',
            disabled: address === '',
          }),
          item({
            choice: 'toggle-sandbox',
            icon: pane.sandboxed ? 'lock' : 'unlock',
            label: pane.sandboxed
              ? 'Turn the sandbox off'
              : 'Turn the sandbox on',
            title: pane.sandboxed
              ? 'Turn the sandbox off (this page will be able to reach the frames above it)'
              : 'Turn the sandbox on',
            warn: !pane.sandboxed,
          }),
          item({
            choice: 'split-row',
            icon: 'split-right',
            label: 'Split to the right',
            title: 'Split to the right',
          }),
          item({
            choice: 'split-column',
            icon: 'split-down',
            label: 'Split downwards',
            title: 'Split downwards',
          }),
        ]
      : []),
  ];
};

const labelOf = (pane: Pane): string =>
  pane.live.title ??
  hostnameOf(pane.live.currentUrl ?? pane.url) ??
  'Empty pane';

/**
 * `zoom` rather than a scale transform: it reaches into the frame as an
 * effective zoom, so the page is rasterized at that scale and laid out for the
 * viewport it appears to have, as the browser's own zoom does.
 */
const zoomStyleOf = (zoom: number): string | undefined =>
  zoom === 1 ? undefined : zoom.toString();

/** `_favicon/` serves the icon Chrome already has for a page (spec P8). */
const faviconUrlOf = (address: string): string => {
  const query = new URLSearchParams({ pageUrl: address, size: '16' });

  return chrome.runtime.getURL(`/_favicon/?${query.toString()}`);
};
