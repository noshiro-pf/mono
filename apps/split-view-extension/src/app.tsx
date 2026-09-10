import * as React from 'react';
import { memoNamed } from 'react-utils';
import { Arr, fastDeepEqual, Num } from 'ts-data-forge';
import {
  PaneDropIndicator,
  PaneFrame,
  Splitter,
  TopBar,
  WorkspacePicker,
} from './components/index.mjs';
import {
  computeGeometry,
  dropTargetAt,
  type LayoutGeometry,
  type PaneDropTarget,
  type PaneId,
  type PaneState,
  type PresetId,
  type Rect,
  type SplitterRect,
  type WorkspaceState,
} from './layout/index.mjs';
import {
  asFrameToPageMessage,
  ensureHeaderRule,
  ensureInitiatorRule,
  readRuleDiagnostics,
  splitViewTabIdSessionKey,
  workspacePositionFromCode,
  workspaceShortcutCodeOf,
  type IncomingMessageEvent,
  type ShortcutKeyEvent,
} from './shared/index.mjs';
import {
  activateWorkspaceEntry,
  addWorkspaceEntry,
  applyTabIdentity,
  downloadJsonFile,
  emptyWorkspaceRegistry,
  exportWorkspacesAsJson,
  importWorkspacesFromJson,
  initialWorkspaceState,
  loadServiceWorkerResetOrigins,
  loadWorkspaceState,
  moveWorkspaceEntry,
  nextWorkspaceName,
  openWorkspaceInNewTab,
  pruneUnlistedWorkspaces,
  putWorkspaceIdInUrl,
  reconcileWorkspace,
  removeWorkspaceEntry,
  removeWorkspaceState,
  renameWorkspaceEntry,
  resolveWorkspace,
  saveWorkspaceRegistry,
  saveWorkspaceState,
  setServiceWorkerResetOrigin,
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
 * The workspace this tab is showing, and its layout, as one value.
 *
 * One value rather than two pieces of state because everything that saves reads
 * both, and a layout written under the wrong id is one workspace overwritten
 * with another's panes. Keeping them apart made that a question of which
 * `setState` React happened to batch with which.
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

export const App = memoNamed('App', () => {
  const [session, setSession] = React.useState<Session>(() => ({
    workspaceId: undefined,
    state: initialWorkspaceState(),
  }));

  const { state } = session;

  /**
   * Applies a pane action to the workspace on screen.
   *
   * Returning the identical session when the reducer returns the identical
   * state is what keeps the frames' once-a-second reports free: React bails out
   * of an update that produces the object it already had.
   */
  const dispatch = React.useCallback((action: WorkspaceAction): void => {
    setSession((current) => {
      const next = workspaceReducer(current.state, action);

      return next === current.state ? current : { ...current, state: next };
    });
  }, []);

  const [registry, setRegistry] = React.useState<WorkspaceRegistry>(
    emptyWorkspaceRegistry,
  );

  const [notice, setNotice] = React.useState<string | undefined>(undefined);

  /**
   * The session and the list as they are *now*.
   *
   * The callbacks below must not be rebuilt when either changes: switching
   * workspaces has to save the layout on screen first, and a `switchWorkspace`
   * with a new identity on every frame report would re-render the workspace bar
   * and re-bind the keyboard listener once a second.
   */
  const mut_liveSession = React.useRef(session);

  const mut_liveRegistry = React.useRef(registry);

  React.useEffect(() => {
    mut_liveSession.current = session;
  }, [session]);

  /**
   * Adopts a list written by another tab, without writing it back.
   *
   * Every tab holds its own copy, so a workspace created in one has to reach
   * the other or the other's next write would drop it. The comparison is what
   * keeps this tab's own writes — which arrive here too — from re-rendering
   * anything.
   */
  React.useEffect(
    () =>
      watchWorkspaceRegistry((written) => {
        if (fastDeepEqual(written, mut_liveRegistry.current)) {
          return;
        }

        mut_liveRegistry.current = written;

        setRegistry(written);
      }),
    [],
  );

  /** Writes the list to storage and to the page at once. */
  const commitRegistry = React.useCallback((next: WorkspaceRegistry): void => {
    if (next === mut_liveRegistry.current) {
      return;
    }

    mut_liveRegistry.current = next;

    setRegistry(next);

    saveWorkspaceRegistry(next).catch(console.error);
  }, []);

  const [stageSize, setStageSize] = React.useState<
    Readonly<{ width: number; height: number }> | undefined
  >(undefined);

  const [drag, setDrag] = React.useState<SplitterRect | undefined>(undefined);

  /**
   * The pane being dragged somewhere else, and where it would land.
   *
   * `target` is recomputed on every pointer move but replaced only when it
   * names a different pane or a different side, so crossing a pane costs one
   * render rather than one per pixel.
   */
  const [move, setMove] = React.useState<PaneMove | undefined>(undefined);

  /**
   * Whether the header-stripping rule is in place. `false` means every site
   * that refuses to be framed will refuse in a pane too, so it is worth saying
   * out loud rather than leaving as a pane that mysteriously stays blank.
   */
  const [headerRuleActive, setHeaderRuleActive] = React.useState(true);

  /**
   * Whether the extension may act on the sites at all. Chrome's per-extension
   * "site access" setting and an enterprise policy can both withhold this, and
   * a rule the extension may not apply is installed, correct, and never
   * matches anything — which is indistinguishable from a broken rule until you
   * look here.
   */
  const [hostAccessGranted, setHostAccessGranted] = React.useState(true);

  const stageRef = React.useRef<HTMLDivElement | null>(null);

  /**
   * Re-asserts the header-stripping rule for whichever tab this page is in
   * *now*. The tab id is read every time rather than remembered: a discarded
   * and restored tab comes back with a different one, and a rule bound to the
   * old id matches nothing.
   */
  const ensureRule = React.useCallback(async (): Promise<void> => {
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

    await chrome.storage.session.set({ [splitViewTabIdSessionKey]: tab.id });

    setHeaderRuleActive(
      initiatorRuleActive && (await ensureHeaderRule(tab.id)),
    );
  }, []);

  const handleRequestHostAccess = React.useCallback((): void => {
    const request = async (): Promise<void> => {
      // Withheld host permissions can be asked for again, from a user gesture.
      // If Chrome refuses — an enterprise policy does not negotiate — the
      // toolbar keeps saying so.
      await chrome.permissions.request({ origins: ['<all_urls>'] });

      await ensureRule();
    };

    request().catch(console.error);
  }, [ensureRule]);

  /** Origins whose service workers a pane removes without being asked. */
  const [resetOrigins, setResetOrigins] = React.useState<readonly string[]>([]);

  const handleToggleResetOrigin = React.useCallback(
    (siteOrigin: string, enabled: boolean): void => {
      const toggle = async (): Promise<void> => {
        setResetOrigins(await setServiceWorkerResetOrigin(siteOrigin, enabled));
      };

      toggle().catch(console.error);
    },
    [],
  );

  const [diagnostics, setDiagnostics] = React.useState<string | undefined>(
    undefined,
  );

  const handleCollectDiagnostics = React.useCallback((): void => {
    const collect = async (): Promise<void> => {
      const tab = await chrome.tabs.getCurrent();

      const paneUrls = state.panes
        .map((pane) => pane.currentUrl ?? pane.url)
        .filter((url) => url !== '');

      setDiagnostics(await readRuleDiagnostics(tab?.id, paneUrls));
    };

    collect().catch((error: unknown) => {
      setDiagnostics(String(error));
    });
  }, [state.panes]);

  React.useEffect(() => {
    const initialize = async (): Promise<void> => {
      await ensureRule();

      // `?ws=` wins where there is one — it is what a reload, a restored
      // session and a bookmark carry — and the list's `activeId` answers when
      // there is not, which is the toolbar button's case.
      const resolved = await resolveWorkspace(workspaceIdFromUrl(), Date.now());

      putWorkspaceIdInUrl(resolved.workspaceId, 'replace');

      const restored = await loadWorkspaceState(resolved.workspaceId);

      commitRegistry(resolved.registry);

      setSession({
        workspaceId: resolved.workspaceId,
        state: sessionStateOf(restored),
      });

      setResetOrigins(await loadServiceWorkerResetOrigins());

      await pruneUnlistedWorkspaces(
        resolved.registry.entries.map((entry) => entry.id),
      );
    };

    initialize().catch(console.error);
  }, [ensureRule, commitRegistry]);

  /**
   * Shows another saved split view in this tab.
   *
   * The layout on screen is saved first and without waiting for the debounce:
   * it is the one thing here that storage does not already have. `saveCurrent`
   * is `false` for exactly one caller — the one that has just deleted the
   * workspace being left, where saving it would write the record back.
   */
  const switchWorkspace = React.useCallback(
    (
      workspaceId: string,
      options: Readonly<{
        history: 'none' | 'push' | 'replace';
        saveCurrent: boolean;
      }>,
    ): void => {
      const run = async (): Promise<void> => {
        const live = mut_liveSession.current;

        if (live.workspaceId === workspaceId) {
          return;
        }

        if (options.saveCurrent && live.workspaceId !== undefined) {
          await saveWorkspaceState(live.workspaceId, live.state);
        }

        const restored = await loadWorkspaceState(workspaceId);

        setSession({ workspaceId, state: sessionStateOf(restored) });

        if (options.history !== 'none') {
          putWorkspaceIdInUrl(workspaceId, options.history);
        }

        commitRegistry(
          activateWorkspaceEntry(mut_liveRegistry.current, workspaceId),
        );
      };

      run().catch(console.error);
    },
    [commitRegistry],
  );

  const handleSwitchWorkspace = React.useCallback(
    (workspaceId: string): void => {
      switchWorkspace(workspaceId, { history: 'push', saveCurrent: true });
    },
    [switchWorkspace],
  );

  const handleCreateWorkspace = React.useCallback((): void => {
    const workspaceId = crypto.randomUUID();

    commitRegistry(
      addWorkspaceEntry(mut_liveRegistry.current, {
        id: workspaceId,
        name: nextWorkspaceName(mut_liveRegistry.current),
        createdAt: Date.now(),
      }),
    );

    switchWorkspace(workspaceId, { history: 'push', saveCurrent: true });
  }, [commitRegistry, switchWorkspace]);

  const handleOpenWorkspaceInNewTab = React.useCallback(
    (workspaceId: string): void => {
      const openTab = async (): Promise<void> => {
        // The layout on screen is written first, so that a second tab opened on
        // the workspace being shown starts from what is on screen.
        const live = mut_liveSession.current;

        if (live.workspaceId !== undefined) {
          await saveWorkspaceState(live.workspaceId, live.state);
        }

        await openWorkspaceInNewTab(workspaceId);
      };

      openTab().catch(console.error);
    },
    [],
  );

  const handleRenameWorkspace = React.useCallback(
    (workspaceId: string, workspaceName: string): void => {
      commitRegistry(
        renameWorkspaceEntry(
          mut_liveRegistry.current,
          workspaceId,
          workspaceName,
        ),
      );
    },
    [commitRegistry],
  );

  const handleMoveWorkspace = React.useCallback(
    (workspaceId: string, offset: number): void => {
      commitRegistry(
        moveWorkspaceEntry(mut_liveRegistry.current, workspaceId, offset),
      );
    },
    [commitRegistry],
  );

  /**
   * Deletes a saved split view, layout and all.
   *
   * The layout goes with the entry rather than being kept: a record nothing
   * refers to is what `pruneUnlistedWorkspaces` deletes on the next load
   * anyway, so keeping it would only make "deleted" mean two different things.
   * Deleting the last one leaves nothing to show, so a fresh empty workspace
   * takes its place — which is also how the list is reset.
   */
  const handleRemoveWorkspace = React.useCallback(
    (workspaceId: string): void => {
      const remove = async (): Promise<void> => {
        const without = removeWorkspaceEntry(
          mut_liveRegistry.current,
          workspaceId,
        );

        await removeWorkspaceState(workspaceId);

        if (without.activeId === undefined) {
          const replacement = crypto.randomUUID();

          commitRegistry(
            addWorkspaceEntry(without, {
              id: replacement,
              name: nextWorkspaceName(without),
              createdAt: Date.now(),
            }),
          );

          switchWorkspace(replacement, {
            history: 'replace',
            saveCurrent: false,
          });

          return;
        }

        commitRegistry(without);

        if (mut_liveSession.current.workspaceId === workspaceId) {
          switchWorkspace(without.activeId, {
            history: 'replace',
            saveCurrent: false,
          });
        }
      };

      remove().catch(console.error);
    },
    [commitRegistry, switchWorkspace],
  );

  const handleExportWorkspaces = React.useCallback((): void => {
    const write = async (): Promise<void> => {
      // The export reads storage, and the layout on screen may not be in it
      // yet.
      const live = mut_liveSession.current;

      if (live.workspaceId !== undefined) {
        await saveWorkspaceState(live.workspaceId, live.state);
      }

      downloadJsonFile(
        'split-views.json',
        await exportWorkspacesAsJson(mut_liveRegistry.current),
      );
    };

    write().catch(console.error);
  }, []);

  const handleImportWorkspaces = React.useCallback(
    (text: string): void => {
      const read = async (): Promise<void> => {
        const result = await importWorkspacesFromJson(
          mut_liveRegistry.current,
          text,
          Date.now(),
        );

        if (result === undefined) {
          setNotice('Could not import: that is not a backup');

          return;
        }

        commitRegistry(result.registry);

        setNotice(
          `Imported ${String(result.added + result.replaced)} (${String(result.added)} new, ${String(result.replaced)} replaced)`,
        );

        // The workspace on screen is one of the ones that may have just been
        // overwritten in storage.
        const live = mut_liveSession.current;

        if (live.workspaceId !== undefined) {
          const restored = await loadWorkspaceState(live.workspaceId);

          if (restored !== undefined) {
            setSession({
              workspaceId: live.workspaceId,
              state: reconcileWorkspace(restored),
            });
          }
        }
      };

      read().catch(console.error);
    },
    [commitRegistry],
  );

  React.useEffect(() => {
    if (notice === undefined) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setNotice(undefined);
    }, noticeMs);

    return () => {
      clearTimeout(timer);
    };
  }, [notice]);

  /**
   * `Alt+1..9` selects the split view at that position in the list.
   *
   * Twice over, because a key event does not cross a frame boundary and the
   * focus is inside a pane most of the time: this page's own `keydown`, and the
   * same key forwarded by the content script from whichever pane had the focus.
   */
  React.useEffect(() => {
    const switchToPosition = (code: string): void => {
      const position = workspacePositionFromCode(code);

      const entry =
        position === undefined
          ? undefined
          : workspaceAtPosition(mut_liveRegistry.current, position);

      if (entry !== undefined) {
        switchWorkspace(entry.id, { history: 'push', saveCurrent: true });
      }
    };

    const onKeyDown = (keyboardEvent: ShortcutKeyEvent): void => {
      const code = workspaceShortcutCodeOf(keyboardEvent);

      if (code === undefined) {
        return;
      }

      keyboardEvent.preventDefault();

      switchToPosition(code);
    };

    const onMessage = (messageEvent: IncomingMessageEvent): void => {
      const message = asFrameToPageMessage(messageEvent.data);

      if (message?.kind === 'shortcut') {
        switchToPosition(message.code);
      }
    };

    addEventListener('keydown', onKeyDown);

    addEventListener('message', onMessage);

    return () => {
      removeEventListener('keydown', onKeyDown);

      removeEventListener('message', onMessage);
    };
  }, [switchWorkspace]);

  // Switching pushes a history entry, so the browser's Back button walks back
  // through the split views visited in this tab.
  React.useEffect(() => {
    const onPopState = (): void => {
      const workspaceId = workspaceIdFromUrl();

      if (workspaceId !== undefined) {
        switchWorkspace(workspaceId, { history: 'none', saveCurrent: true });
      }
    };

    addEventListener('popstate', onPopState);

    return () => {
      removeEventListener('popstate', onPopState);
    };
  }, [switchWorkspace]);

  // The tab's own title and favicon, so that a window of split views can be
  // told apart in the tab strip.
  React.useEffect(() => {
    const shown = session.workspaceId;

    if (shown === undefined) {
      return;
    }

    const entry = workspaceEntryOf(registry, shown);

    const position = workspacePositionOf(registry, shown);

    if (entry !== undefined && position !== undefined) {
      applyTabIdentity(position, entry.name);
    }
  }, [registry, session.workspaceId]);

  // Coming back to the tab is the moment a discarded-and-restored tab id would
  // have changed under us.
  React.useEffect(() => {
    const onVisible = (): void => {
      if (document.visibilityState === 'visible') {
        ensureRule().catch(console.error);
      }
    };

    addEventListener('visibilitychange', onVisible);

    return () => {
      removeEventListener('visibilitychange', onVisible);
    };
  }, [ensureRule]);

  // Saving is debounced because a splitter drag changes the state on every
  // pointer move; `pagehide` is what covers a tab closed inside the window.
  React.useEffect(() => {
    const { workspaceId: saveTo, state: toSave } = session;

    if (saveTo === undefined) {
      return undefined;
    }

    const save = (): void => {
      saveWorkspaceState(saveTo, toSave).catch(console.error);
    };

    const timer = setTimeout(save, saveDebounceMs);

    addEventListener('pagehide', save);

    return () => {
      clearTimeout(timer);

      removeEventListener('pagehide', save);
    };
  }, [session]);

  React.useEffect(() => {
    const element = stageRef.current;

    if (element === null) {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      setStageSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  // A drag is followed on `window` rather than on the divider, and the panes
  // stop taking pointer events while it lasts: a pointer over an `iframe` is
  // the frame's, not ours.
  React.useEffect(() => {
    const element = stageRef.current;

    if (drag === undefined || element === null) {
      return undefined;
    }

    const onMove = (pointerEvent: PointerEvent): void => {
      const stageBounds = element.getBoundingClientRect();

      const ratio = ratioFromPointer(
        drag,
        pointerEvent.clientX - stageBounds.left,
        pointerEvent.clientY - stageBounds.top,
      );

      if (ratio !== undefined) {
        dispatch({ type: 'set-ratio', path: drag.path, ratio });
      }
    };

    const onRelease = (): void => {
      setDrag(undefined);
    };

    addEventListener('pointermove', onMove);

    addEventListener('pointerup', onRelease);

    addEventListener('pointercancel', onRelease);

    return () => {
      removeEventListener('pointermove', onMove);

      removeEventListener('pointerup', onRelease);

      removeEventListener('pointercancel', onRelease);
    };
  }, [drag, dispatch]);

  const geometry = React.useMemo<LayoutGeometry | undefined>(
    () =>
      stageSize === undefined
        ? undefined
        : computeGeometry(
            state.root,
            {
              left: 0,
              top: 0,
              width: stageSize.width,
              height: stageSize.height,
            },
            gutterPx,
          ),
    [state.root, stageSize],
  );

  const handleMoveStart = React.useCallback((paneId: PaneId): void => {
    setMove({ paneId, target: undefined });
  }, []);

  /**
   * Follows a pane being dragged, and drops it.
   *
   * On `window` and against the computed rectangles rather than on the panes
   * themselves, for the reason the splitter drag is: a pointer over a pane is
   * a pointer over an `iframe`, which belongs to the framed site. The stage
   * turns pointer events off for the frames while this is going on.
   */
  React.useEffect(() => {
    const element = stageRef.current;

    const movedPaneId = move?.paneId;

    if (
      movedPaneId === undefined ||
      element === null ||
      geometry === undefined
    ) {
      return undefined;
    }

    const targetAt = (
      pointerEvent: PointerEvent,
    ): PaneDropTarget | undefined => {
      const stageBounds = element.getBoundingClientRect();

      return dropTargetAt(
        geometry,
        {
          x: pointerEvent.clientX - stageBounds.left,
          y: pointerEvent.clientY - stageBounds.top,
        },
        movedPaneId,
      );
    };

    const onMove = (pointerEvent: PointerEvent): void => {
      const target = targetAt(pointerEvent);

      setMove((current) =>
        current === undefined || isSameDropTarget(current.target, target)
          ? current
          : { ...current, target },
      );
    };

    const onRelease = (pointerEvent: PointerEvent): void => {
      const target = targetAt(pointerEvent);

      setMove(undefined);

      if (target !== undefined) {
        dispatch({
          type: 'move-pane',
          paneId: movedPaneId,
          targetPaneId: target.paneId,
          zone: target.zone,
        });
      }
    };

    const onAbandon = (): void => {
      setMove(undefined);
    };

    const onKeyDown = (keyboardEvent: Readonly<{ key: string }>): void => {
      if (keyboardEvent.key === 'Escape') {
        setMove(undefined);
      }
    };

    addEventListener('pointermove', onMove);

    addEventListener('pointerup', onRelease);

    addEventListener('pointercancel', onAbandon);

    addEventListener('keydown', onKeyDown);

    return () => {
      removeEventListener('pointermove', onMove);

      removeEventListener('pointerup', onRelease);

      removeEventListener('pointercancel', onAbandon);

      removeEventListener('keydown', onKeyDown);
    };
  }, [move?.paneId, geometry, dispatch]);

  const paneRects = React.useMemo<ReadonlyMap<PaneId, Rect>>(
    () =>
      new Map(
        (geometry?.panes ?? []).map(
          (entry) => [entry.paneId, entry.rect] as const,
        ),
      ),
    [geometry],
  );

  /**
   * Panes in id order, which never changes as the layout does.
   *
   * Moving an `iframe` within the DOM reloads it, so the elements are rendered
   * as siblings in a fixed order and positioned from the geometry. Rendering
   * them in tree order would reload half the panes on every split.
   */
  const orderedPanes = React.useMemo<readonly PaneState[]>(
    () => Arr.toSorted(state.panes, (a, b) => a.id - b.id),
    [state.panes],
  );

  /**
   * A pane's address bar reaches the reducer through here, so that the rule is
   * back in place *before* the `iframe` starts loading. Doing it after would be
   * a race the frame usually wins.
   */
  const handleNavigate = React.useCallback(
    (paneId: PaneId, input: string): void => {
      const navigate = async (): Promise<void> => {
        await ensureRule();

        dispatch({ type: 'navigate', paneId, input });
      };

      navigate().catch(console.error);
    },
    [ensureRule, dispatch],
  );

  const handleApplyPreset = React.useCallback(
    (presetId: PresetId): void => {
      dispatch({ type: 'apply-preset', presetId });
    },
    [dispatch],
  );

  const handleDragStart = React.useCallback((splitter: SplitterRect): void => {
    setDrag(splitter);
  }, []);

  const ready = session.workspaceId !== undefined && geometry !== undefined;

  /**
   * `--dragging` is what turns pointer events off for the frames, and both
   * kinds of drag need it: a pointer over a pane is the framed site's, not
   * ours.
   */
  const stageClassName = React.useMemo<string>(
    () =>
      [
        'stage',
        drag === undefined && move === undefined
          ? undefined
          : 'stage--dragging',
        move === undefined ? undefined : 'stage--moving',
      ]
        .filter((part) => part !== undefined)
        .join(' '),
    [drag, move],
  );

  return (
    <div className={'app'}>
      <TopBar
        diagnostics={diagnostics}
        headerRuleActive={headerRuleActive}
        hostAccessGranted={hostAccessGranted}
        onApplyPreset={handleApplyPreset}
        onCollectDiagnostics={handleCollectDiagnostics}
        onRequestHostAccess={handleRequestHostAccess}
      >
        <WorkspacePicker
          activeId={session.workspaceId}
          notice={notice}
          registry={registry}
          onCreate={handleCreateWorkspace}
          onExport={handleExportWorkspaces}
          onImport={handleImportWorkspaces}
          onMove={handleMoveWorkspace}
          onOpenInNewTab={handleOpenWorkspaceInNewTab}
          onRemove={handleRemoveWorkspace}
          onRename={handleRenameWorkspace}
          onSwitch={handleSwitchWorkspace}
        />
      </TopBar>

      <div ref={stageRef} className={stageClassName}>
        {!ready ? undefined : (
          <>
            {orderedPanes.map((pane) => {
              const rect = paneRects.get(pane.id);

              return rect === undefined ? undefined : (
                <PaneFrame
                  key={`${session.workspaceId ?? ''}:${String(pane.id)}`}
                  active={pane.id === state.activePaneId}
                  canClose={state.panes.length > 1}
                  dispatch={dispatch}
                  moving={move?.paneId === pane.id}
                  pane={pane}
                  rect={rect}
                  resetOrigins={resetOrigins}
                  onMoveStart={handleMoveStart}
                  onNavigate={handleNavigate}
                  onToggleResetOrigin={handleToggleResetOrigin}
                />
              );
            })}

            {geometry.splitters.map((splitter) => (
              <Splitter
                key={splitter.path.join('/')}
                splitter={splitter}
                onDragStart={handleDragStart}
              />
            ))}

            {move?.target === undefined ? undefined : (
              <PaneDropIndicator target={move.target} />
            )}
          </>
        )}
      </div>
    </div>
  );
});

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
