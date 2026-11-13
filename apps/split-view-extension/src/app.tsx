import { createState, derive, map, onScopeDispose } from 'synstate';
import {
  constant,
  For,
  If,
  isImeKeyDown,
  listenInScope,
  type JSX,
} from 'synstate-dom';
import { Arr, fastDeepEqual, Num, unknownToString } from 'ts-data-forge';
import {
  PaneDropIndicator,
  PaneFrame,
  Splitter,
  TopBar,
  WorkspacePicker,
  type PaneView,
} from './components/index.mjs';
import {
  clampRatio,
  computeGeometry,
  dropTargetAt,
  type FixedSize,
  type LayoutGeometry,
  type PaneDropTarget,
  type PaneId,
  type PresetId,
  type SplitterRect,
  type WorkspaceState,
} from './layout/index.mjs';
import {
  asFrameToPageMessage,
  asSplitOpenRequest,
  ensureHeaderRule,
  ensureInitiatorRule,
  readRuleDiagnostics,
  recordOpenSplitViewTab,
  splitViewTabIdSessionKey,
  workspacePositionFromCode,
  workspaceShortcutCodeOf,
} from './shared/index.mjs';
import {
  activateWorkspaceEntry,
  addWorkspaceEntry,
  applyTabIdentity,
  describeOpenedWorkspaces,
  downloadJsonFile,
  emptyWorkspaceRegistry,
  exportWorkspacesAsJson,
  importWorkspacesFromJson,
  initialWorkspaceState,
  loadServiceWorkerResetOrigins,
  loadWorkspaceState,
  moveWorkspaceEntry,
  nextWorkspaceName,
  openEveryWorkspaceInTabs,
  openWorkspaceInNewTab,
  pruneUnlistedWorkspaces,
  putWorkspaceInUrl,
  readWorkspaceUrl,
  reconcileWorkspace,
  removeWorkspaceEntry,
  removeWorkspaceState,
  renameWorkspaceEntry,
  resolveWorkspace,
  saveWorkspaceRegistry,
  saveWorkspaceState,
  setServiceWorkerResetOrigin,
  setWorkspaceEntryPinned,
  tabLabelOf,
  watchServiceWorkerResetOrigins,
  watchWorkspaceRegistry,
  workspaceAtPosition,
  workspaceEntryOf,
  workspaceIdFromUrl,
  workspacePositionOf,
  workspaceReducer,
  type WorkspaceAction,
  type WorkspaceRegistry,
} from './state/index.mjs';

/** The width of a divider, and so the gap between two panes. */
const gutterPx = 6;

/** How long a change waits before it is written to storage. */
const saveDebounceMs = 250;

/** How long an import's report stays in the workspace bar. */
const noticeMs = 6000;

/**
 * How often a tab asks the browser about itself when nothing has happened.
 *
 * Slow: what it is looking for is a pin, which is a thing the user does once
 * and then leaves, and the answer is only read when the split views are opened
 * again. One `chrome.tabs.getCurrent` and one read of session storage.
 */
const tabNoteIntervalMs = 30_000;

export const App = (): JSX.Element => {
  const [session$, setSession, { updateState: updateSession }] =
    createState<Session>({
      workspaceId: undefined,
      state: initialWorkspaceState(),
    });

  /**
   * Applies a pane action to the workspace on screen.
   *
   * Returning the identical session when the reducer returns the identical
   * state is what keeps the frames' once-a-second reports free: a state that is
   * given the value it already holds passes nothing on.
   */
  const dispatch = (action: WorkspaceAction): void => {
    updateSession((current) => {
      const next = workspaceReducer(current.state, action);

      return next === current.state ? current : { ...current, state: next };
    });
  };

  const [registry$, setRegistry] = createState<WorkspaceRegistry>(
    emptyWorkspaceRegistry,
  );

  /**
   * Adopts a list written by another tab, without writing it back.
   *
   * Every tab holds its own copy, so a workspace created in one has to reach
   * the other or the other's next write would drop it. The comparison is what
   * keeps this tab's own writes — which arrive here too — from updating
   * anything.
   */
  onScopeDispose(
    watchWorkspaceRegistry((written) => {
      if (!fastDeepEqual(written, registry$.getSnapshot().value)) {
        setRegistry(written);
      }
    }),
  );

  /** Writes the list to storage and to the page at once. */
  const commitRegistry = (next: WorkspaceRegistry): void => {
    if (next === registry$.getSnapshot().value) {
      return;
    }

    setRegistry(next);

    saveWorkspaceRegistry(next).catch(console.error);
  };

  const [notice$, setNotice] = createState<string | undefined>(undefined);

  const mut_timers: {
    notice: ReturnType<typeof setTimeout> | undefined;
    save: ReturnType<typeof setTimeout> | undefined;
  } = { notice: undefined, save: undefined };

  /** Shows what an import or "open all" had to say, for a while. */
  const showNotice = (text: string): void => {
    clearTimeout(mut_timers.notice);

    setNotice(text);

    mut_timers.notice = setTimeout(() => {
      setNotice(undefined);
    }, noticeMs);
  };

  onScopeDispose(() => {
    clearTimeout(mut_timers.notice);

    clearTimeout(mut_timers.save);
  });

  const [stageSize$, setStageSize] = createState<
    Readonly<{ width: number; height: number }> | undefined
  >(undefined);

  const [drag$, setDrag] = createState<SplitterRect | undefined>(undefined);

  /**
   * The pane being dragged somewhere else, and where it would land.
   *
   * `target` is recomputed on every pointer move but replaced only when it
   * names a different pane or a different side, so crossing a pane is one
   * update rather than one per pixel.
   */
  const [move$, setMove, { updateState: updateMove }] = createState<
    PaneMove | undefined
  >(undefined);

  /**
   * Whether the header-stripping rule is in place. `false` means every site
   * that refuses to be framed will refuse in a pane too, so it is worth saying
   * out loud rather than leaving as a pane that mysteriously stays blank.
   */
  const [headerRuleActive$, setHeaderRuleActive] = createState(true);

  /**
   * Whether the extension may act on the sites at all. Chrome's per-extension
   * "site access" setting and an enterprise policy can both withhold this, and
   * a rule the extension may not apply is installed, correct, and never matches
   * anything — which is indistinguishable from a broken rule until you look
   * here.
   */
  const [hostAccessGranted$, setHostAccessGranted] = createState(true);

  const mut_stage: { element: HTMLDivElement | undefined } = {
    element: undefined,
  };

  /**
   * Re-asserts the header-stripping rule for whichever tab this page is in
   * *now*. The tab id is read every time rather than remembered: a discarded
   * and restored tab comes back with a different one, and a rule bound to the
   * old id matches nothing.
   */
  const ensureRule = async (): Promise<void> => {
    setHostAccessGranted(
      await chrome.permissions.contains({ origins: ['<all_urls>'] }),
    );

    // Two rules, because neither covers the other's case: this one covers every
    // frame the extension opens, in any tab, and outlives the browser session;
    // the tab-scoped one below covers a link clicked *inside* a pane, which the
    // site initiates rather than us.
    const initiatorRuleActive = await ensureInitiatorRule();

    const tab = await chrome.tabs.getCurrent();

    if (tab?.id === undefined) {
      setHeaderRuleActive(initiatorRuleActive);

      return;
    }

    // The tab the toolbar button goes back to is the one last looked at, so a
    // tab loading behind another does not claim it; it does when it is shown.
    if (document.visibilityState === 'visible') {
      await chrome.storage.session.set({ [splitViewTabIdSessionKey]: tab.id });
    }

    setHeaderRuleActive(
      initiatorRuleActive && (await ensureHeaderRule(tab.id)),
    );
  };

  /**
   * Records what this tab is, for "open every split view" to read back: which
   * workspace it is showing, and whether it is pinned.
   *
   * Called when the workspace changes and whenever the tab is looked at or
   * left, because there is no event for a tab being pinned — and pinning one is
   * something done just before looking at another. `chrome.tabs.getCurrent`
   * needs no permission for this much: `pinned` is not one of the fields the
   * `tabs` permission guards, which are the URL, the title and the icon.
   */
  const noteThisTab = async (): Promise<void> => {
    const { workspaceId } = session$.getSnapshot().value;

    if (workspaceId === undefined) {
      return;
    }

    const tab = await chrome.tabs.getCurrent();

    if (tab?.id === undefined) {
      return;
    }

    await recordOpenSplitViewTab(tab.id, workspaceId);

    commitRegistry(
      setWorkspaceEntryPinned(
        registry$.getSnapshot().value,
        workspaceId,
        tab.pinned,
      ),
    );
  };

  const requestHostAccess = async (): Promise<void> => {
    // Withheld host permissions can be asked for again, from a user gesture.
    // If Chrome refuses — an enterprise policy does not negotiate — the toolbar
    // keeps saying so.
    await chrome.permissions.request({ origins: ['<all_urls>'] });

    await ensureRule();
  };

  const handleRequestHostAccess = (): void => {
    requestHostAccess().catch(console.error);
  };

  /** Origins whose service workers a pane removes without being asked. */
  const [resetOrigins$, setResetOrigins] = createState<readonly string[]>([]);

  // Another tab's toggle has to reach this one's panes too: read once, the list
  // stayed as it was here until this tab was reloaded.
  onScopeDispose(watchServiceWorkerResetOrigins(setResetOrigins));

  const handleToggleResetOrigin = (
    siteOrigin: string,
    enabled: boolean,
  ): void => {
    const toggle = async (): Promise<void> => {
      setResetOrigins(await setServiceWorkerResetOrigin(siteOrigin, enabled));
    };

    toggle().catch(console.error);
  };

  const [diagnostics$, setDiagnostics] = createState<string | undefined>(
    undefined,
  );

  const collectDiagnostics = async (): Promise<void> => {
    const tab = await chrome.tabs.getCurrent();

    const paneUrls = session$
      .getSnapshot()
      .value.state.panes.map((pane) => pane.currentUrl ?? pane.url)
      .filter((url) => url !== '');

    setDiagnostics(await readRuleDiagnostics(tab?.id, paneUrls));
  };

  const handleCollectDiagnostics = (): void => {
    collectDiagnostics().catch((error: unknown) => {
      setDiagnostics(unknownToString(error));
    });
  };

  /**
   * Counts the writes of the session that wait on storage (a switch, an
   * import's reload), so that only the last one asked for lands; and how many
   * switches are still loading.
   */
  const mut_switches: { requested: number; loading: number } = {
    requested: 0,
    loading: 0,
  };

  const initialize = async (): Promise<void> => {
    await ensureRule();

    // The URL says which split view this tab shows, and may say what it shows.
    // `?ws=` wins where there is one — it is what a reload, a restored session
    // and a bookmark carry — and the list's `activeId` answers when there is
    // not, which is the toolbar button's case. A URL that describes a view
    // without naming one is a new split view, as `+` makes one: it gets an id
    // of its own and a place on the list.
    const request = readWorkspaceUrl();

    const resolved = await resolveWorkspace(
      {
        workspaceId:
          request.workspaceId ??
          (request.state === undefined ? undefined : crypto.randomUUID()),
        name: request.name,
      },
      Date.now(),
      document.visibilityState === 'visible',
    );

    // A view the URL describes is shown over the one saved under that id: the
    // URL is written from the view whenever the view is saved, so on a reload
    // the two agree, and where they differ the URL is a link that was made to
    // show something.
    const shown =
      request.state ??
      sessionStateOf(await loadWorkspaceState(resolved.workspaceId));

    commitRegistry(resolved.registry);

    // A Back pressed while this loaded has already asked for what to show.
    if (mut_switches.requested === 0) {
      putWorkspaceInUrl(resolved.workspaceId, shown, 'replace');

      setSession({ workspaceId: resolved.workspaceId, state: shown });
    }

    setResetOrigins(await loadServiceWorkerResetOrigins());

    await pruneUnlistedWorkspaces(
      resolved.registry.entries.map((entry) => entry.id),
    );
  };

  initialize().catch(console.error);

  /**
   * Shows another saved split view in this tab.
   *
   * The layout on screen is saved first and without waiting for the debounce:
   * it is the one thing here that storage does not already have. `saveCurrent`
   * is `false` for exactly one caller — the one that has just deleted the
   * workspace being left, where saving it would write the record back.
   */
  const showWorkspace = async (
    workspaceId: string,
    options: SwitchOptions,
  ): Promise<void> => {
    mut_switches.requested += 1;

    const request = mut_switches.requested;

    const live = session$.getSnapshot().value;

    if (live.workspaceId === workspaceId) {
      // Back to the one on screen while another loads: that one is dropped
      // below, and the URL, which a Back may have moved to it, comes back too.
      if (mut_switches.loading > 0 && options.history !== 'none') {
        putWorkspaceInUrl(workspaceId, live.state, options.history);
      }

      return;
    }

    mut_switches.loading += 1;

    const shown = await (async () => {
      try {
        if (options.saveCurrent) {
          await saveShown();
        }

        return sessionStateOf(await loadWorkspaceState(workspaceId));
      } finally {
        mut_switches.loading -= 1;
      }
    })();

    // A later switch was asked for while this one loaded — from the select,
    // Alt+N or Back — and the last one asked for is the one to show, however
    // the loads finish.
    if (request !== mut_switches.requested) {
      return;
    }

    setSession({ workspaceId, state: shown });

    if (options.history !== 'none') {
      putWorkspaceInUrl(workspaceId, shown, options.history);
    }

    commitRegistry(
      activateWorkspaceEntry(registry$.getSnapshot().value, workspaceId),
    );
  };

  const switchWorkspace = (
    workspaceId: string,
    options: SwitchOptions,
  ): void => {
    showWorkspace(workspaceId, options).catch(console.error);
  };

  /** Writes the layout on screen, for whatever reads storage next. */
  const saveShown = async (): Promise<void> => {
    const live = session$.getSnapshot().value;

    if (live.workspaceId !== undefined && isListed(live.workspaceId)) {
      await saveWorkspaceState(live.workspaceId, live.state);
    }
  };

  /**
   * Whether the list still has `workspaceId`. A deleted one stays on screen
   * until the switch away from it lands, and whatever saves it meanwhile — the
   * debounce, `pagehide` — would write its record back.
   */
  const isListed = (workspaceId: string): boolean =>
    registry$
      .getSnapshot()
      .value.entries.some((entry) => entry.id === workspaceId);

  /**
   * Adds a split view and opens it in a tab of its own.
   *
   * A new tab rather than this one, so that adding a split view never takes
   * away the one on screen. The list is written before the tab is opened: the
   * new page reads it on load, and one that did not find the entry yet would
   * add its own under a name of its choosing.
   */
  const createWorkspace = async (): Promise<void> => {
    const workspaceId = crypto.randomUUID();

    const current = registry$.getSnapshot().value;

    const next = addWorkspaceEntry(current, {
      id: workspaceId,
      name: nextWorkspaceName(current),
      createdAt: Date.now(),
      pinned: false,
    });

    setRegistry(next);

    await saveWorkspaceRegistry(next);

    await openWorkspaceInNewTab(workspaceId);
  };

  const handleCreateWorkspace = (): void => {
    createWorkspace().catch(console.error);
  };

  const handleOpenWorkspaceInNewTab = (workspaceId: string): void => {
    const openTab = async (): Promise<void> => {
      // The layout on screen is written first, so that a second tab opened on
      // the workspace being shown starts from what is on screen.
      await saveShown();

      await openWorkspaceInNewTab(workspaceId);
    };

    openTab().catch(console.error);
  };

  const openAllWorkspaces = async (): Promise<void> => {
    // As above: what is on screen is written first, so that the tab opened on
    // this workspace — if this one is not the tab it ends up in — starts from
    // what is on screen rather than from the last save.
    await saveShown();

    showNotice(
      describeOpenedWorkspaces(
        await openEveryWorkspaceInTabs(registry$.getSnapshot().value.entries),
      ),
    );
  };

  const handleOpenAllWorkspaces = (): void => {
    openAllWorkspaces().catch(console.error);
  };

  const handleRenameWorkspace = (
    workspaceId: string,
    workspaceName: string,
  ): void => {
    commitRegistry(
      renameWorkspaceEntry(
        registry$.getSnapshot().value,
        workspaceId,
        workspaceName,
      ),
    );
  };

  const handleMoveWorkspace = (workspaceId: string, offset: number): void => {
    commitRegistry(
      moveWorkspaceEntry(registry$.getSnapshot().value, workspaceId, offset),
    );
  };

  /**
   * Deletes a saved split view, layout and all.
   *
   * The layout goes with the entry rather than being kept: a record nothing
   * refers to is what `pruneUnlistedWorkspaces` deletes on the next load
   * anyway, so keeping it would only make "deleted" mean two different things.
   * Deleting the last one leaves nothing to show, so a fresh empty workspace
   * takes its place — which is also how the list is reset.
   */
  const handleRemoveWorkspace = (workspaceId: string): void => {
    const remove = async (): Promise<void> => {
      const without = removeWorkspaceEntry(
        registry$.getSnapshot().value,
        workspaceId,
      );

      // Off the list before the record goes, so that no save writes it back.
      commitRegistry(without);

      clearTimeout(mut_timers.save);

      await removeWorkspaceState(workspaceId);

      if (without.activeId === undefined) {
        const replacement = crypto.randomUUID();

        commitRegistry(
          addWorkspaceEntry(without, {
            id: replacement,
            name: nextWorkspaceName(without),
            createdAt: Date.now(),
            pinned: false,
          }),
        );

        switchWorkspace(replacement, {
          history: 'replace',
          saveCurrent: false,
        });

        return;
      }

      if (session$.getSnapshot().value.workspaceId === workspaceId) {
        switchWorkspace(without.activeId, {
          history: 'replace',
          saveCurrent: false,
        });
      }
    };

    remove().catch(console.error);
  };

  const exportWorkspaces = async (): Promise<void> => {
    // The export reads storage, and the layout on screen may not be in it yet.
    await saveShown();

    downloadJsonFile(
      'split-views.json',
      await exportWorkspacesAsJson(registry$.getSnapshot().value),
    );
  };

  const handleExportWorkspaces = (): void => {
    exportWorkspaces().catch(console.error);
  };

  const handleImportWorkspaces = (text: string): void => {
    const read = async (): Promise<void> => {
      const result = await importWorkspacesFromJson(
        registry$.getSnapshot().value,
        text,
        Date.now(),
      );

      if (result === undefined) {
        showNotice('Could not import: that is not a backup');

        return;
      }

      commitRegistry(result.registry);

      showNotice(
        `Imported ${(result.added + result.replaced).toString()} (${result.added.toString()} new, ${result.replaced.toString()} replaced)`,
      );

      // The workspace on screen is one of the ones that may have just been
      // overwritten in storage.
      const { workspaceId } = session$.getSnapshot().value;

      if (workspaceId === undefined) {
        return;
      }

      mut_switches.requested += 1;

      const request = mut_switches.requested;

      const restored = await loadWorkspaceState(workspaceId);

      // A switch asked for meanwhile shows its own split view, read after the
      // import wrote it.
      if (restored !== undefined && request === mut_switches.requested) {
        setSession({ workspaceId, state: reconcileWorkspace(restored) });
      }
    };

    read().catch(console.error);
  };

  /**
   * `Alt+1..9` selects the split view at that position in the list.
   *
   * Twice over, because a key event does not cross a frame boundary and the
   * focus is inside a pane most of the time: this page's own `keydown`, and the
   * same key forwarded by the content script from whichever pane had the focus.
   */
  const switchToPosition = (code: string): void => {
    const position = workspacePositionFromCode(code);

    const entry =
      position === undefined
        ? undefined
        : workspaceAtPosition(registry$.getSnapshot().value, position);

    if (entry !== undefined) {
      switchWorkspace(entry.id, { history: 'push', saveCurrent: true });
    }
  };

  listenInScope(globalThis, 'keydown', (keyboardEvent) => {
    if (!(keyboardEvent instanceof KeyboardEvent)) {
      return;
    }

    const code = workspaceShortcutCodeOf(keyboardEvent);

    if (code === undefined) {
      return;
    }

    keyboardEvent.preventDefault();

    switchToPosition(code);
  });

  listenInScope(globalThis, 'message', (messageEvent) => {
    if (!(messageEvent instanceof MessageEvent)) {
      return;
    }

    const message = asFrameToPageMessage(messageEvent.data);

    if (message?.kind === 'shortcut') {
      switchToPosition(message.code);
    }
  });

  /**
   * The context menu's "open to the right" or "open below", chosen in one of
   * this tab's panes: the worker asks every split view page, and the one in the
   * named tab splits the pane as its `||` or `=` button would, with the link in
   * the new pane.
   *
   * Only the worker is listened to — a message with no `tab` — and not the
   * content scripts, which run in pages this split view shows.
   */
  const onWorkerMessage = (
    value: unknown,
    sender: Readonly<{ id?: string | undefined; tab?: unknown }>,
  ): false => {
    const request = asSplitOpenRequest(value);

    if (
      request === undefined ||
      sender.id !== chrome.runtime.id ||
      sender.tab !== undefined
    ) {
      return false;
    }

    const splitOpen = async (): Promise<void> => {
      const { workspaceId } = session$.getSnapshot().value;

      // Asked each time: Chrome gives a discarded tab a new id.
      const tab = await chrome.tabs.getCurrent();

      if (workspaceId === undefined || tab?.id !== request.tabId) {
        return;
      }

      // As before any pane loads an address: the rule that lets it be framed is
      // put back first if it was lost.
      await ensureRule();

      // The pane was named in the split view the menu was opened in; one
      // switched to meanwhile has panes of the same ids that are not it.
      if (session$.getSnapshot().value.workspaceId !== workspaceId) {
        return;
      }

      // No pane named splits the active one, as the reducer sees it.
      dispatch({
        type: 'split-open',
        paneId: request.paneId,
        axis: request.axis,
        url: request.url,
      });
    };

    splitOpen().catch(console.error);

    return false;
  };

  chrome.runtime.onMessage.addListener(onWorkerMessage);

  onScopeDispose(() => {
    chrome.runtime.onMessage.removeListener(onWorkerMessage);
  });

  // Switching pushes a history entry, so the browser's Back button walks back
  // through the split views visited in this tab.
  listenInScope(globalThis, 'popstate', () => {
    const workspaceId = workspaceIdFromUrl();

    if (workspaceId !== undefined) {
      switchWorkspace(workspaceId, { history: 'none', saveCurrent: true });
    }
  });

  // The tab's own title and favicon, so that a window of split views can be
  // told apart in the tab strip. Worked out first and applied only when it
  // changes: the view changes on every pointer move of a splitter drag, and the
  // favicon is drawn on a canvas.
  derive(
    [registry$, session$],
    (registry, { workspaceId: shown, state: shownState }) => {
      if (shown === undefined) {
        return undefined;
      }

      const entry = workspaceEntryOf(registry, shown);

      const position = workspacePositionOf(registry, shown);

      return entry === undefined || position === undefined
        ? undefined
        : { position, label: tabLabelOf(shownState, entry.name) };
    },
    {
      equals: (a, b) => a?.position === b?.position && a?.label === b?.label,
    },
  ).subscribe((tabIdentity) => {
    if (tabIdentity !== undefined) {
      applyTabIdentity(tabIdentity.position, tabIdentity.label);
    }
  });

  /**
   * When the tab's own notes are taken.
   *
   * There is no event for a tab being pinned that the page in it can hear, and
   * the one the browser does offer — `chrome.tabs.onUpdated` — wakes the
   * service worker for every navigation, title and icon change in every tab in
   * the browser, which is a great deal of waking for a flag that matters when
   * the browser closes. So the page asks about itself at the moments a pin is
   * likely to have just happened: pinning a tab is done in the tab strip, which
   * takes the focus off the page, and a tab that has been pinned is usually
   * then left alone. The timer is the backstop for the rest — the focus can be
   * inside a pane, where neither event reaches this page.
   */
  const note = (): void => {
    noteThisTab().catch(console.error);
  };

  session$.pipe(map((session) => session.workspaceId)).subscribe(note);

  listenInScope(globalThis, 'visibilitychange', note);

  listenInScope(globalThis, 'blur', note);

  const noteTimer = setInterval(note, tabNoteIntervalMs);

  onScopeDispose(() => {
    clearInterval(noteTimer);
  });

  // Coming back to the tab is the moment a discarded-and-restored tab id would
  // have changed under us. It is also what makes this split view the one the
  // toolbar button and a `split.html` with no `?ws=` go back to, which a tab
  // that loaded behind another has not claimed yet.
  listenInScope(globalThis, 'visibilitychange', () => {
    if (document.visibilityState !== 'visible') {
      return;
    }

    ensureRule().catch(console.error);

    const { workspaceId } = session$.getSnapshot().value;

    if (workspaceId !== undefined) {
      commitRegistry(
        activateWorkspaceEntry(registry$.getSnapshot().value, workspaceId),
      );
    }
  });

  // Saving is debounced because a splitter drag changes the state on every
  // pointer move; `pagehide` is what covers a tab closed inside the window.
  //
  // The URL is written at the same moment as storage, and only then: it is the
  // same snapshot, so a reload finds the two in agreement, and the browser
  // throttles a page that rewrites its history entry on every pointer move.
  session$.subscribe(({ workspaceId: saveTo, state: toSave }) => {
    clearTimeout(mut_timers.save);

    mut_timers.save =
      saveTo === undefined
        ? undefined
        : setTimeout(() => {
            if (!isListed(saveTo)) {
              return;
            }

            saveWorkspaceState(saveTo, toSave).catch(console.error);

            putWorkspaceInUrl(saveTo, toSave, 'replace');
          }, saveDebounceMs);
  });

  listenInScope(globalThis, 'pagehide', () => {
    saveShown().catch(console.error);
  });

  // A drag is followed on `window` rather than on the divider, and the panes
  // stop taking pointer events while it lasts: a pointer over an `iframe` is
  // the frame's, not ours.
  listenInScope(globalThis, 'pointermove', (pointerEvent) => {
    const drag = drag$.getSnapshot().value;

    const element = mut_stage.element;

    if (
      drag === undefined ||
      element === undefined ||
      !(pointerEvent instanceof PointerEvent)
    ) {
      return;
    }

    const stageBounds = element.getBoundingClientRect();

    const ratio = ratioFromPointer(
      drag,
      pointerEvent.clientX - stageBounds.left,
      pointerEvent.clientY - stageBounds.top,
    );

    if (ratio === undefined) {
      return;
    }

    if (drag.fixed === undefined) {
      dispatch({ type: 'set-ratio', path: drag.path, ratio });

      return;
    }

    dispatch({
      type: 'set-fixed-px',
      path: drag.path,
      px: fixedPxFromRatio(drag, drag.fixed, ratio),
    });
  });

  const endDrag = (): void => {
    if (drag$.getSnapshot().value !== undefined) {
      setDrag(undefined);
    }
  };

  listenInScope(globalThis, 'pointerup', endDrag);

  listenInScope(globalThis, 'pointercancel', endDrag);

  const stateRoot$ = session$.pipe(map((session) => session.state.root));

  const geometry$ = derive(
    [stateRoot$, stageSize$],
    (root, stageSize): LayoutGeometry | undefined =>
      stageSize === undefined
        ? undefined
        : computeGeometry(
            root,
            {
              left: 0,
              top: 0,
              width: stageSize.width,
              height: stageSize.height,
            },
            gutterPx,
          ),
  );

  /**
   * Follows a pane being dragged, and drops it.
   *
   * On `window` and against the computed rectangles rather than on the panes
   * themselves, for the reason the splitter drag is: a pointer over a pane is a
   * pointer over an `iframe`, which belongs to the framed site. The stage turns
   * pointer events off for the frames while this is going on.
   */
  const moveTargetAt = (
    pointerEvent: Event,
  ):
    | Readonly<{ paneId: PaneId; target: PaneDropTarget | undefined }>
    | undefined => {
    const move = move$.getSnapshot().value;

    const geometry = geometry$.getSnapshot().value;

    const element = mut_stage.element;

    if (
      move === undefined ||
      geometry === undefined ||
      element === undefined ||
      !(pointerEvent instanceof PointerEvent)
    ) {
      return undefined;
    }

    const stageBounds = element.getBoundingClientRect();

    return {
      paneId: move.paneId,
      target: dropTargetAt(
        geometry,
        {
          x: pointerEvent.clientX - stageBounds.left,
          y: pointerEvent.clientY - stageBounds.top,
        },
        move.paneId,
      ),
    };
  };

  listenInScope(globalThis, 'pointermove', (pointerEvent) => {
    const found = moveTargetAt(pointerEvent);

    if (found !== undefined) {
      updateMove((current) =>
        current === undefined || isSameDropTarget(current.target, found.target)
          ? current
          : { ...current, target: found.target },
      );
    }
  });

  listenInScope(globalThis, 'pointerup', (pointerEvent) => {
    if (move$.getSnapshot().value === undefined) {
      return;
    }

    // Read before the move is let go of, which is what `moveTargetAt` reads.
    const found = moveTargetAt(pointerEvent);

    setMove(undefined);

    if (found?.target !== undefined) {
      dispatch({
        type: 'move-pane',
        paneId: found.paneId,
        targetPaneId: found.target.paneId,
        zone: found.target.zone,
      });
    }
  });

  const abandonMove = (): void => {
    if (move$.getSnapshot().value !== undefined) {
      setMove(undefined);
    }
  };

  listenInScope(globalThis, 'pointercancel', abandonMove);

  listenInScope(globalThis, 'keydown', (keyboardEvent) => {
    if (
      keyboardEvent instanceof KeyboardEvent &&
      keyboardEvent.key === 'Escape' &&
      !isImeKeyDown(keyboardEvent)
    ) {
      abandonMove();
    }
  });

  /**
   * A pane's address bar reaches the reducer through here, so that the rule is
   * back in place *before* the `iframe` starts loading. Doing it after would be
   * a race the frame usually wins.
   */
  const handleNavigate = (paneId: PaneId, input: string): void => {
    const navigate = async (): Promise<void> => {
      await ensureRule();

      dispatch({ type: 'navigate', paneId, input });
    };

    navigate().catch(console.error);
  };

  const handleMoveStart = (paneId: PaneId): void => {
    setMove({ paneId, target: undefined });
  };

  /** Which pane is being moved; where it would land changes nothing below. */
  const movedPaneId$ = move$.pipe(map((move) => move?.paneId));

  /**
   * Panes in id order, which never changes as the layout does, each with the
   * rectangle the layout gives it.
   *
   * Moving an `iframe` within the DOM reloads it, so the elements are kept as
   * siblings in a fixed order and positioned from the geometry. Keeping them in
   * tree order would reload half the panes on every split. Nothing is shown
   * before the workspace is known and the stage measured.
   */
  const paneSlots$ = derive(
    [session$, geometry$, movedPaneId$],
    ({ workspaceId, state }, geometry, movedPaneId): readonly PaneSlot[] => {
      if (workspaceId === undefined || geometry === undefined) {
        return [];
      }

      const rects = new Map(
        geometry.panes.map((entry) => [entry.paneId, entry.rect] as const),
      );

      return Arr.generate(function* () {
        for (const pane of Arr.toSorted(state.panes, (a, b) => a.id - b.id)) {
          const rect = rects.get(pane.id);

          if (rect !== undefined) {
            yield {
              key: `${workspaceId}:${pane.id.toString()}`,
              paneId: pane.id,
              view: {
                pane,
                rect,
                active: pane.id === state.activePaneId,
                canClose: state.panes.length > 1,
                moving: movedPaneId === pane.id,
              },
            };
          }
        }
      });
    },
  );

  const splitters$ = derive(
    [session$, geometry$],
    ({ workspaceId }, geometry): readonly SplitterRect[] =>
      workspaceId === undefined || geometry === undefined
        ? []
        : geometry.splitters,
  );

  const dropTarget$ = move$.pipe(map((move) => move?.target));

  /**
   * `--dragging` is what turns pointer events off for the frames, and both
   * kinds of drag need it: a pointer over a pane is the framed site's, not
   * ours.
   */
  const stageClassName$ = derive([drag$, move$], (drag, move) =>
    [
      'stage',
      drag === undefined && move === undefined ? undefined : 'stage--dragging',
      move === undefined ? undefined : 'stage--moving',
    ]
      .filter((part) => part !== undefined)
      .join(' '),
  );

  return (
    <div class={constant('app')}>
      <TopBar
        diagnostics={diagnostics$}
        headerRuleActive={headerRuleActive$}
        hostAccessGranted={hostAccessGranted$}
        onApplyPreset={(presetId: PresetId) => {
          dispatch({ type: 'apply-preset', presetId });
        }}
        onCollectDiagnostics={handleCollectDiagnostics}
        onRequestHostAccess={handleRequestHostAccess}
      >
        <WorkspacePicker
          activeId={session$.pipe(map((session) => session.workspaceId))}
          notice={notice$}
          registry={registry$}
          onCreate={handleCreateWorkspace}
          onExport={handleExportWorkspaces}
          onImport={handleImportWorkspaces}
          onMove={handleMoveWorkspace}
          onOpenAll={handleOpenAllWorkspaces}
          onOpenInNewTab={handleOpenWorkspaceInNewTab}
          onRemove={handleRemoveWorkspace}
          onRename={handleRenameWorkspace}
          onSwitch={(workspaceId) =>
            showWorkspace(workspaceId, { history: 'push', saveCurrent: true })
          }
        />
      </TopBar>

      <div
        ref={(element) => {
          mut_stage.element = element;

          const observer = new ResizeObserver(() => {
            setStageSize({
              width: element.clientWidth,
              height: element.clientHeight,
            });
          });

          observer.observe(element);

          onScopeDispose(() => {
            observer.disconnect();
          });
        }}
        class={stageClassName$}
        data-e2e={constant('stage')}
      >
        <For items={paneSlots$} key={(slot) => slot.key}>
          {(slot$) => (
            <PaneFrame
              dispatch={dispatch}
              paneId={slot$.getSnapshot().value.paneId}
              resetOrigins={resetOrigins$}
              view$={slot$.pipe(map((slot) => slot.view))}
              onMoveStart={handleMoveStart}
              onNavigate={handleNavigate}
              onToggleResetOrigin={handleToggleResetOrigin}
            />
          )}
        </For>

        <For items={splitters$} key={(splitter) => splitter.path.join('/')}>
          {(splitter$) => (
            <Splitter splitter$={splitter$} onDragStart={setDrag} />
          )}
        </For>

        <If
          cond={dropTarget$.pipe(map((target) => target !== undefined))}
          then={<PaneDropIndicator target$={dropTarget$} />}
        />
      </div>
    </div>
  );
};

/**
 * The workspace this tab is showing, and its layout, as one value.
 *
 * One value rather than two pieces of state because everything that saves reads
 * both, and a layout written under the wrong id is one workspace overwritten
 * with another's panes.
 *
 * `workspaceId` is `undefined` until the list has been read: nothing is
 * rendered and nothing is saved before then, because a frame that loaded before
 * the header-stripping rule existed would be blocked by the very headers the
 * rule removes.
 */
type Session = Readonly<{
  workspaceId: string | undefined;
  state: WorkspaceState;
}>;

/** A pane being dragged, and where it would land if let go now. */
type PaneMove = Readonly<{
  paneId: PaneId;
  target: PaneDropTarget | undefined;
}>;

/** How a switch of split view treats history and the one it leaves. */
type SwitchOptions = Readonly<{
  history: 'none' | 'push' | 'replace';
  saveCurrent: boolean;
}>;

/** One pane on the stage, with what its frame is keyed by. */
type PaneSlot = Readonly<{
  key: string;
  paneId: PaneId;
  view: PaneView;
}>;

/**
 * Whether the drop would do the same thing as it would have a moment ago.
 *
 * The indicator's rectangle follows from the pane and the side, so comparing
 * those two is comparing the whole thing — and a pointer move that changes
 * neither is a pointer move that has to change nothing on screen.
 */
const isSameDropTarget = (
  a: PaneDropTarget | undefined,
  b: PaneDropTarget | undefined,
): boolean =>
  a === undefined || b === undefined
    ? a === b
    : a.paneId === b.paneId && a.zone === b.zone;

/**
 * The layout to show for a workspace, whether or not storage had one.
 *
 * A stored layout is reconciled rather than trusted: it was written by an older
 * version of this code, and a tree that refers to a pane the record does not
 * have has to become a working layout rather than a page that throws.
 */
const sessionStateOf = (
  restored: WorkspaceState | undefined,
): WorkspaceState =>
  restored === undefined
    ? initialWorkspaceState()
    : reconcileWorkspace(restored);

/**
 * Where the pointer is within the node being divided, as a ratio.
 *
 * Half the gutter is taken off so that the divider sits under the pointer
 * rather than starting there.
 */
const ratioFromPointer = (
  splitter: SplitterRect,
  stageX: number,
  stageY: number,
): number | undefined => {
  const { axis, nodeRect } = splitter;

  const span = (axis === 'row' ? nodeRect.width : nodeRect.height) - gutterPx;

  if (!Num.isNonZero(span)) {
    return undefined;
  }

  const offset =
    axis === 'row' ? stageX - nodeRect.left : stageY - nodeRect.top;

  return Num.div(offset - Num.div(gutterPx, 2), span);
};

/**
 * The held child's size, in pixels, for a divider at `ratio` of its node: a
 * drag moves the divider the same way whichever child is held, and only what is
 * stored differs.
 */
const fixedPxFromRatio = (
  splitter: SplitterRect,
  fixed: FixedSize,
  ratio: number,
): number => {
  const { axis, nodeRect } = splitter;

  const span = (axis === 'row' ? nodeRect.width : nodeRect.height) - gutterPx;

  const first = clampRatio(ratio) * span;

  return fixed.child === 'first' ? first : span - first;
};
