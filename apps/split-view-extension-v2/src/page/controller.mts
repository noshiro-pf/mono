import {
  createState,
  derive,
  map,
  onScopeDispose,
  type InitializedObservable,
} from 'synstate';
import { listenInScope } from 'synstate-dom';
import { Arr, fastDeepEqual, Optional, unknownToString } from 'ts-data-forge';
import {
  applyListOp,
  asSplitOpenRequest,
  describeOpened,
  emptyList,
  emptyStoredWorkspace,
  entryAt,
  entryOf,
  formatBackup,
  formatViewQuery,
  initialWorkspace,
  maxPaneCount,
  parseBackup,
  parseViewQuery,
  positionOf,
  positionOfShortcut,
  resolveShown,
  tabLabelOf,
  viewIdOf,
  workspaceFromStored,
  workspaceReducer,
  workspaceShortcutOf,
  workspaceToStored,
  type ListAnswer,
  type ListOp,
  type PaneId,
  type SplitViewList,
  type StoredWorkspace,
  type Workspace,
  type WorkspaceAction,
} from '../core/index.mjs';
import {
  ensureInitiatorRule,
  ensureTabRule,
  hasHostAccess,
  openAllSplitViews,
  readDiagnostics,
  readList,
  readResetOrigins,
  readWorkspace,
  recordOpenView,
  removeTabRule,
  requestHostAccess,
  requestListOp,
  requestResetOrigin,
  splitViewUrlOf,
  watchStorage,
  writeWorkspace,
} from '../platform/index.mjs';
import { downloadJson } from './download.mjs';
import { applyTabIdentity } from './tab-identity.mjs';

/**
 * Everything `split.html` does that is not drawing (spec §4–§6, T1, F2): which
 * split view the tab shows, the list, saving, the URL, the keyboard, the
 * worker's requests and the tab's own identity. The components receive what
 * this exposes and draw it. Created inside the root component, whose scope owns
 * every listener and timer here.
 */
export const createController = (): Controller => {
  const [session$, setSession, { updateState: updateSession }] =
    createState<Session>({ id: undefined, workspace: initialWorkspace() });

  const [list$, setList] = createState<SplitViewList>(emptyList);

  const [resetOrigins$, setResetOrigins] = createState<readonly string[]>([]);

  const [notice$, setNotice] = createState<string | undefined>(undefined);

  const [ruleActive$, setRuleActive] = createState(true);

  const [hostAccess$, setHostAccess] = createState(true);

  const [diagnostics$, setDiagnostics] = createState<string | undefined>(
    undefined,
  );

  const mut_timers: {
    save: ReturnType<typeof setTimeout> | undefined;
    notice: ReturnType<typeof setTimeout> | undefined;
  } = { save: undefined, notice: undefined };

  /** The tab the rules were last asserted for, for `pagehide` to take back. */
  const mut_tab: { id: number | undefined } = { id: undefined };

  /**
   * What the saves know: the last layout written, so that an unchanged one is
   * not written again, and the split view an import is writing over, which
   * nothing here may save until the import has loaded it.
   */
  const mut_saves: {
    last: Readonly<{ id: string; stored: StoredWorkspace }> | undefined;
    heldId: string | undefined;
    writes: number;
    /** The last write started, which a delete waits for (spec S1). */
    inFlight: Promise<void>;
  } = {
    last: undefined,
    heldId: undefined,
    writes: 0,
    inFlight: Promise.resolve(),
  };

  /** Lists adopted from storage, so that a worker's reply never undoes one. */
  const mut_listWrites = { seen: 0, originsSeen: 0 };

  /** Switches asked for, so that only the last one asked for lands. */
  const mut_switches = { requested: 0 };

  onScopeDispose(() => {
    clearTimeout(mut_timers.save);

    clearTimeout(mut_timers.notice);
  });

  const showNotice = (text: string): void => {
    clearTimeout(mut_timers.notice);

    setNotice(text);

    mut_timers.notice = setTimeout(() => {
      setNotice(undefined);
    }, noticeMs);
  };

  /** A change that returns the same workspace changes nothing at all. */
  const dispatch = (action: WorkspaceAction): void => {
    const before = Optional.unwrap(session$.getSnapshot()).workspace;

    updateSession((current) => {
      const workspace = workspaceReducer(current.workspace, action);

      return workspace === current.workspace
        ? current
        : { ...current, workspace };
    });

    // The one refusal a user can run into (spec L11) says so.
    if (
      action.type === 'split' &&
      Optional.unwrap(session$.getSnapshot()).workspace === before &&
      before.panes.length >= maxPaneCount
    ) {
      showNotice(`A split view holds at most ${maxPaneCount} panes.`);
    }
  };

  /**
   * Changes the saved list through the service worker, its one writer (spec
   * W10). Shown here at once, then as the worker stored it; `undefined` when
   * the worker did not answer.
   */
  const changeList = async (op: ListOp): Promise<ListAnswer | undefined> => {
    const current = Optional.unwrap(list$.getSnapshot());

    const local = applyListOp(current, op);

    // An edit that changes nothing here changes nothing there either; a load, a
    // delete and an import have work to do beyond the list.
    if (
      local.list === current &&
      op.kind !== 'show' &&
      op.kind !== 'remove' &&
      op.kind !== 'import'
    ) {
      return local.answer;
    }

    setList(local.list);

    const writesBefore = mut_listWrites.seen;

    const reply = await requestListOp(op);

    // The reply is the list as of this operation; a list written since, by a
    // later one, has already been adopted and is newer. This one's own write
    // arrives the same way when it changed anything.
    if (reply !== undefined && mut_listWrites.seen === writesBefore) {
      setList(reply.list);
    }

    return reply?.answer;
  };

  /**
   * Both framing rules, for the tab this page is in now (spec F2): the id is
   * asked each time, since a discarded tab comes back under a new one.
   */
  const assertRules = async (): Promise<void> => {
    const [access, initiator, tab] = await Promise.all([
      hasHostAccess(),
      ensureInitiatorRule(),
      chrome.tabs.getCurrent(),
    ]);

    setHostAccess(access);

    mut_tab.id = tab?.id;

    setRuleActive(
      initiator && (tab?.id === undefined || (await ensureTabRule(tab.id))),
    );
  };

  const ensureRules = async (): Promise<void> => {
    try {
      await assertRules();
    } catch (error) {
      // Shown as the rule missing, and the split view drawn regardless.
      console.error(error);

      setRuleActive(false);
    }
  };

  /** Whether the list still has `id`: a deleted one must not be saved back. */
  const isListed = (id: string): boolean =>
    entryOf(Optional.unwrap(list$.getSnapshot()), id) !== undefined;

  const writeUrl = (
    id: string,
    workspace: Workspace,
    mode: 'push' | 'replace',
  ): void => {
    const url =
      `${globalThis.location.pathname}${formatViewQuery(id, workspace)}` as const;

    if (mode === 'push') {
      window.history.pushState(null, '', url);
    } else {
      window.history.replaceState(null, '', url);
    }
  };

  /**
   * Writes the layout of `id` unless it may not be saved now: off the list, or
   * being imported over. `false` when it was not written; an unchanged layout,
   * such as after a report of a new title, counts as written.
   */
  const save = async (id: string, workspace: Workspace): Promise<boolean> => {
    if (!isListed(id) || mut_saves.heldId === id) {
      return false;
    }

    const stored = workspaceToStored(workspace);

    if (
      mut_saves.last?.id === id &&
      fastDeepEqual(mut_saves.last.stored, stored)
    ) {
      return true;
    }

    // Forgotten while written, and taken only once written: a failed write is
    // tried again by the next save, and one that finishes after a later save
    // began is not what storage holds.
    mut_saves.last = undefined;

    mut_saves.writes += 1;

    const write = mut_saves.writes;

    const written = writeWorkspace(id, stored);

    mut_saves.inFlight = written;

    await written;

    if (write === mut_saves.writes) {
      mut_saves.last = { id, stored };
    }

    return true;
  };

  /** The layout on screen, written now (spec S1). */
  const saveShown = async (): Promise<void> => {
    const { id, workspace } = Optional.unwrap(session$.getSnapshot());

    if (id !== undefined) {
      await save(id, workspace);
    }
  };

  const loadWorkspace = async (id: string): Promise<Workspace> => {
    const stored = await readWorkspace(id);

    return stored === undefined
      ? initialWorkspace()
      : workspaceFromStored(stored);
  };

  /**
   * Shows another saved split view in this tab (spec W1). The last switch asked
   * for wins, however the loads finish.
   */
  const switchTo = async (
    id: string,
    options: Readonly<{ history: 'none' | 'push' | 'replace'; save: boolean }>,
  ): Promise<void> => {
    mut_switches.requested += 1;

    if (Optional.unwrap(session$.getSnapshot()).id === id) {
      return;
    }

    const request = mut_switches.requested;

    if (options.save) {
      await saveShown();
    }

    // The new view's frames load as soon as it is shown (spec F2).
    await ensureRules();

    const workspace = await loadWorkspace(id);

    if (request !== mut_switches.requested) {
      return;
    }

    setSession({ id, workspace });

    if (options.history !== 'none') {
      writeUrl(id, workspace, options.history);
    }

    // As on load (spec U3): Back to a split view deleted since lists it again,
    // rather than showing one that nothing saves.
    await changeList({
      kind: 'show',
      id,
      name: undefined,
      now: Date.now(),
      activate: true,
    });
  };

  /** What the URL asks for, resolved against the list (spec U2, U3). */
  const initialize = async (): Promise<void> => {
    await ensureRules();

    const request = parseViewQuery(globalThis.location.search);

    setList(await readList());

    const show = {
      kind: 'show',
      id:
        request.id ??
        (request.workspace === undefined ? undefined : crypto.randomUUID()),
      name: request.name,
      now: Date.now(),
      activate: document.visibilityState === 'visible',
    } as const;

    const answer = await changeList(show);

    // Without the worker's answer, resolved here against the list as read.
    const id =
      answer?.kind === 'shown'
        ? answer.id
        : resolveShown(
            Optional.unwrap(list$.getSnapshot()),
            show,
            show.now,
            false,
          ).id;

    const workspace = request.workspace ?? (await loadWorkspace(id));

    // A Back pressed while this loaded has asked for something already.
    if (mut_switches.requested === 0) {
      writeUrl(id, workspace, 'replace');

      setSession({ id, workspace });
    }

    setResetOrigins(await readResetOrigins());
  };

  const create = async (): Promise<void> => {
    const id = crypto.randomUUID();

    // Stored before the tab opens, so that the new page finds it named.
    await changeList({ kind: 'create', id, now: Date.now() });

    await chrome.tabs.create({ url: splitViewUrlOf(id) });
  };

  const openInNewTab = async (id: string): Promise<void> => {
    await saveShown();

    await chrome.tabs.create({ url: splitViewUrlOf(id) });
  };

  const openAll = async (): Promise<void> => {
    await saveShown();

    const { opened, alreadyOpen } = await openAllSplitViews(
      Optional.unwrap(list$.getSnapshot()),
      undefined,
    );

    showNotice(describeOpened(opened, alreadyOpen));
  };

  /**
   * Deletes a split view and its layout (spec W4); deleting the last leaves a
   * fresh one.
   */
  const remove = async (id: string): Promise<void> => {
    // Off this tab's list at once, which stops its saves; the worker takes the
    // layout away after the entry, so that nothing saves it back. A pending
    // save of another split view, the one on screen, still goes ahead.
    if (Optional.unwrap(session$.getSnapshot()).id === id) {
      clearTimeout(mut_timers.save);
    }

    // A save already on its way would land after the worker's removal and put
    // the layout back.
    await mut_saves.inFlight.catch(() => undefined);

    await changeList({
      kind: 'remove',
      id,
      freshId: crypto.randomUUID(),
      now: Date.now(),
    });

    const list = Optional.unwrap(list$.getSnapshot());

    const replacement = list.activeId ?? list.entries[0]?.id;

    if (replacement === undefined) {
      return;
    }

    if (Optional.unwrap(session$.getSnapshot()).id === id) {
      await switchTo(replacement, { history: 'replace', save: false });
    }
  };

  const exportBackup = async (): Promise<void> => {
    await saveShown();

    const list = Optional.unwrap(list$.getSnapshot());

    const workspaces = await Promise.all(
      list.entries.map(async (entry) => ({
        id: entry.id,
        name: entry.name,
        state: (await readWorkspace(entry.id)) ?? emptyStoredWorkspace,
      })),
    );

    const exportedAt = new Date();

    downloadJson(
      'split-views.json',
      formatBackup(workspaces, exportedAt.toISOString()),
    );
  };

  const importBackup = async (text: string): Promise<void> => {
    const backedUp = parseBackup(text);

    if (backedUp === undefined) {
      showNotice('Could not import: that is not a backup');

      return;
    }

    const shownId = Optional.unwrap(session$.getSnapshot()).id;

    // The view on screen, if imported, is not saved until the import has loaded
    // it, or its old layout would be written over the imported one; if not, it
    // is written now, since the import moves on without it.
    if (backedUp.some((entry) => entry.id === shownId)) {
      mut_saves.heldId = shownId;
    } else {
      await saveShown();
    }

    try {
      await writeImported(backedUp);
    } finally {
      mut_saves.heldId = undefined;
    }
  };

  const writeImported = async (
    backedUp: NonNullable<ReturnType<typeof parseBackup>>,
  ): Promise<void> => {
    await Promise.all(
      backedUp.map(async (entry) => writeWorkspace(entry.id, entry.state)),
    );

    const answer = await changeList({
      kind: 'import',
      entries: backedUp.map((entry) => ({ id: entry.id, name: entry.name })),
      now: Date.now(),
    });

    showNotice(
      answer?.kind === 'imported'
        ? `Imported ${(answer.added + answer.replaced).toString()} (${answer.added.toString()} new, ${answer.replaced.toString()} replaced)`
        : 'Could not import: the list could not be saved',
    );

    // The one on screen may be one that was just overwritten.
    const { id } = Optional.unwrap(session$.getSnapshot());

    if (id === undefined || backedUp.every((entry) => entry.id !== id)) {
      return;
    }

    mut_switches.requested += 1;

    const request = mut_switches.requested;

    const workspace = await loadWorkspace(id);

    if (request === mut_switches.requested) {
      setSession({ id, workspace });
    }
  };

  const toggleResetOrigin = async (
    origin: string,
    enabled: boolean,
  ): Promise<void> => {
    const current = Optional.unwrap(resetOrigins$.getSnapshot());

    // Shown at once, then as the worker stored it (spec W10).
    setResetOrigins(
      enabled
        ? Arr.uniq(Arr.toPushed(current, origin))
        : current.filter((listed) => listed !== origin),
    );

    const writesBefore = mut_listWrites.originsSeen;

    const stored = await requestResetOrigin(origin, enabled);

    // As with the list: one written since is newer than this answer.
    if (stored !== undefined && mut_listWrites.originsSeen === writesBefore) {
      setResetOrigins(stored);
    }
  };

  /**
   * Runs `change` once the rules are asserted, unless a switch meanwhile put
   * another split view on screen, whose panes have the same ids.
   */
  const afterRules = async (change: () => void): Promise<void> => {
    const { id } = Optional.unwrap(session$.getSnapshot());

    await ensureRules();

    if (Optional.unwrap(session$.getSnapshot()).id === id) {
      change();
    }
  };

  /**
   * A change from the view: one that loads a frame — a reload, a retry, a
   * sandbox toggle, a split, a preset's new panes — waits for the rules (spec
   * F2), so that the load is not refused for want of them; the rest is at once.
   */
  const act = (action: WorkspaceAction): void => {
    switch (action.type) {
      case 'apply-preset':
      case 'navigate':
      case 'reload':
      case 'set-sandboxed':
      case 'split':
        run(
          afterRules(() => {
            dispatch(action);
          }),
        );

        return;

      case 'activate':
      case 'close':
      case 'move':
      case 'report':
      case 'resize':
      case 'zoom':
        dispatch(action);
    }
  };

  /** A pane's address goes through here so the rules are in place first. */
  const navigate = async (paneId: PaneId, input: string): Promise<void> =>
    afterRules(() => {
      dispatch({ type: 'navigate', paneId, input });
    });

  const collectDiagnostics = async (): Promise<void> => {
    const tab = await chrome.tabs.getCurrent();

    const urls = Optional.unwrap(session$.getSnapshot())
      .workspace.panes.map((pane) => pane.live.currentUrl ?? pane.url)
      .filter((url) => url !== '');

    setDiagnostics(await readDiagnostics(tab?.id, urls));
  };

  /** Records this tab as showing its split view, and whether it is pinned. */
  const noteTab = async (): Promise<void> => {
    const { id } = Optional.unwrap(session$.getSnapshot());

    const tab = await chrome.tabs.getCurrent();

    if (id === undefined || tab?.id === undefined) {
      return;
    }

    // Typed as always there, but Chrome sets it from 121 and the manifest
    // allows 116; a tab never looked at counts as looked at long ago.
    const lastAccessed: unknown = tab.lastAccessed;

    await recordOpenView({
      tabId: tab.id,
      workspaceId: id,
      viewedAt:
        document.visibilityState === 'visible'
          ? Date.now()
          : typeof lastAccessed === 'number'
            ? lastAccessed
            : 0,
    });

    await changeList({ kind: 'set-pinned', id, pinned: tab.pinned });
  };

  const switchToShortcut = (code: string): void => {
    const position = positionOfShortcut(code);

    const entry =
      position === undefined
        ? undefined
        : entryAt(Optional.unwrap(list$.getSnapshot()), position);

    if (entry !== undefined) {
      run(switchTo(entry.id, { history: 'push', save: true }));
    }
  };

  // The list as the worker stored it, whichever tab asked (spec W9, W10).
  onScopeDispose(
    watchStorage({
      list: (written) => {
        mut_listWrites.seen += 1;

        if (!fastDeepEqual(written, Optional.unwrap(list$.getSnapshot()))) {
          setList(written);
        }
      },
      resetOrigins: (origins) => {
        mut_listWrites.originsSeen += 1;

        setResetOrigins(origins);
      },
    }),
  );

  // Alt+1..9 here (spec W2); from inside a pane, the pane passes it on once it
  // has checked that its own frame sent it (`shortcut` below).
  listenInScope(globalThis, 'keydown', (event) => {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }

    const code = workspaceShortcutOf(event);

    if (code === undefined) {
      return;
    }

    event.preventDefault();

    switchToShortcut(code);
  });

  // "Open in a split" chosen in one of this tab's panes (spec M2): from the
  // worker only, which has no `tab`, never from a content script.
  const onWorkerMessage = (
    value: unknown,
    sender: Readonly<{ id?: string; tab?: unknown }>,
  ): false => {
    const request = asSplitOpenRequest(value);

    if (
      request === undefined ||
      sender.id !== chrome.runtime.id ||
      sender.tab !== undefined
    ) {
      return false;
    }

    run(
      (async () => {
        const { id } = Optional.unwrap(session$.getSnapshot());

        const tab = await chrome.tabs.getCurrent();

        if (id === undefined || tab?.id !== request.tabId) {
          return;
        }

        await ensureRules();

        // A switch meanwhile has panes of the same ids that are not these.
        if (Optional.unwrap(session$.getSnapshot()).id === id) {
          dispatch({
            type: 'split',
            paneId: request.paneId,
            axis: request.axis,
            input: request.url ?? '',
          });
        }
      })(),
    );

    return false;
  };

  chrome.runtime.onMessage.addListener(onWorkerMessage);

  onScopeDispose(() => {
    chrome.runtime.onMessage.removeListener(onWorkerMessage);
  });

  listenInScope(globalThis, 'popstate', () => {
    const id = viewIdOf(globalThis.location.search);

    if (id !== undefined) {
      run(switchTo(id, { history: 'none', save: true }));
    }
  });

  // The tab's title and favicon, applied only when they change: the view
  // changes on every pointer move of a drag, and the favicon is a canvas.
  derive(
    [list$, session$],
    (list, { id, workspace }) => {
      const entry = id === undefined ? undefined : entryOf(list, id);

      const position = id === undefined ? undefined : positionOf(list, id);

      return entry === undefined || position === undefined
        ? undefined
        : { position, label: tabLabelOf(workspace, entry.name) };
    },
    { equals: fastDeepEqual },
  ).subscribe((identity) => {
    if (identity !== undefined) {
      applyTabIdentity(identity.position, identity.label);
    }
  });

  // No event says a tab was pinned; a pin is done in the tab strip, which takes
  // the focus away, and the timer covers focus inside a pane (spec W8).
  const note = (): void => {
    run(noteTab());
  };

  session$.pipe(map(({ id }) => id)).subscribe(note);

  listenInScope(globalThis, 'blur', note);

  const noteTimer = setInterval(note, tabNoteIntervalMs);

  onScopeDispose(() => {
    clearInterval(noteTimer);
  });

  // Shown again: the moment a restored tab's id changed, and the moment this
  // becomes the split view looked at last.
  listenInScope(globalThis, 'visibilitychange', () => {
    note();

    if (document.visibilityState !== 'visible') {
      return;
    }

    run(ensureRules());

    const { id } = Optional.unwrap(session$.getSnapshot());

    if (id !== undefined) {
      run(changeList({ kind: 'activate', id }));
    }
  });

  // Saved 250ms after a change, and the URL with it, not more often: a drag
  // changes the state on every pointer move.
  session$.subscribe(({ id, workspace }) => {
    clearTimeout(mut_timers.save);

    mut_timers.save =
      id === undefined
        ? undefined
        : setTimeout(() => {
            run(
              (async () => {
                // Not if a Back meanwhile moved the tab to another entry, whose
                // address this would overwrite.
                if (
                  (await save(id, workspace)) &&
                  Optional.unwrap(session$.getSnapshot()).id === id
                ) {
                  writeUrl(id, workspace, 'replace');
                }
              })(),
            );
          }, saveDebounceMs);
  });

  // The tab's rule goes with the page (spec F2): issued here, it is gone before
  // the next page in the tab commits, where the worker's removal on
  // `tabs.onUpdated` comes only after. A reload or a Back asserts it again.
  listenInScope(globalThis, 'pagehide', () => {
    run(saveShown());

    if (mut_tab.id !== undefined) {
      run(removeTabRule(mut_tab.id));
    }
  });

  listenInScope(globalThis, 'pageshow', (event) => {
    if (event instanceof PageTransitionEvent && event.persisted) {
      run(ensureRules());
    }
  });

  run(initialize());

  return {
    session$,
    list$,
    resetOrigins$,
    notice$,
    ruleActive$,
    hostAccess$,
    diagnostics$,
    dispatch: act,
    navigate: (paneId: PaneId, input: string) => {
      run(navigate(paneId, input));
    },
    switchTo: async (id: string) =>
      switchTo(id, { history: 'push', save: true }),
    shortcut: switchToShortcut,
    create: () => {
      run(create());
    },
    openInNewTab: (id: string) => {
      run(openInNewTab(id));
    },
    openAll: () => {
      run(openAll());
    },
    rename: (id: string, name: string) => {
      run(changeList({ kind: 'rename', id, name }));
    },
    move: (id: string, offset: number) => {
      run(changeList({ kind: 'move', id, offset }));
    },
    remove: (id: string) => {
      run(remove(id));
    },
    exportBackup: () => {
      run(exportBackup());
    },
    importBackup: (text: string) => {
      run(importBackup(text));
    },
    toggleResetOrigin: (origin: string, enabled: boolean) => {
      run(toggleResetOrigin(origin, enabled));
    },
    requestHostAccess: () => {
      run(
        (async () => {
          await requestHostAccess();

          await ensureRules();
        })(),
      );
    },
    collectDiagnostics: () => {
      collectDiagnostics().catch((error: unknown) => {
        setDiagnostics(unknownToString(error));
      });
    },
  };
};

/** What the components get: state to draw, and what they may ask for. */
export type Controller = Readonly<{
  session$: InitializedObservable<Session>;
  list$: InitializedObservable<SplitViewList>;
  resetOrigins$: InitializedObservable<readonly string[]>;
  notice$: InitializedObservable<string | undefined>;
  ruleActive$: InitializedObservable<boolean>;
  hostAccess$: InitializedObservable<boolean>;
  diagnostics$: InitializedObservable<string | undefined>;
  dispatch: (action: WorkspaceAction) => void;
  navigate: (paneId: PaneId, input: string) => void;
  /** Settles once the tab shows `id`, or has failed to. */
  switchTo: (id: string) => Promise<void>;
  /** Alt+N pressed inside a pane, as the pane's own frame reported it. */
  shortcut: (code: string) => void;
  create: () => void;
  openInNewTab: (id: string) => void;
  openAll: () => void;
  rename: (id: string, name: string) => void;
  move: (id: string, offset: number) => void;
  remove: (id: string) => void;
  exportBackup: () => void;
  importBackup: (text: string) => void;
  toggleResetOrigin: (origin: string, enabled: boolean) => void;
  requestHostAccess: () => void;
  collectDiagnostics: () => void;
}>;

/**
 * The split view this tab shows and its layout, as one value: a layout written
 * under the wrong id is one split view overwritten with another's panes.
 * `id` is `undefined` until the list is read, and nothing is drawn or saved
 * before then.
 */
export type Session = Readonly<{
  id: string | undefined;
  workspace: Workspace;
}>;

const saveDebounceMs = 250;

const noticeMs = 6000;

const tabNoteIntervalMs = 30_000;

const run = (task: Promise<unknown>): void => {
  task.catch(console.error);
};
