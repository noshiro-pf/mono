/**
 * The page's state, made once with the browser as its surroundings.
 *
 * The components read it through the signals below and call its actions;
 * none of them holds state of its own. What each part does, and the tests of
 * it, are in the modules this puts together — this file is only which real
 * thing each of them is handed.
 */

import {
  counter,
  createEventEmitter,
  type Observable as SynstateObservable,
} from 'synstate';
import { toSignal } from 'synstate-preact-signals';
import { reportSourceFromSearch, repositoryUrl } from '../constants.mjs';
import { layoutFromLocation, saveLayout } from '../layout.mjs';
import { loadIssuePage, loadReport } from '../load-report.mjs';
import { readSetting, writeSetting } from '../settings-db.mjs';
import {
  applyTheme,
  saveTheme,
  systemColorScheme,
  systemColorSchemeQuery,
  themeFromLocation,
} from '../theme.mjs';
import { browserStores } from '../token.mjs';
import { currentSearch } from '../url.mjs';
import { loadWeeklyActivity } from '../weekly-activity.mjs';
import { loadWorkflowRuns } from '../workflow-runs.mjs';
import { createActivityStore } from './activity-store.mjs';
import { createHeaderStore } from './header-store.mjs';
import { createIssuesListStore } from './issues-list-store.mjs';
import { createIssuesViewStore } from './issues-view-store.mjs';
import { createLayoutStore } from './layout-store.mjs';
import { createMergeOrderStore } from './merge-order-store.mjs';
import { createReader } from './reader.mjs';
import { createThemeStore } from './theme-store.mjs';
import { createTokenStore } from './token-store.mjs';

/** The repository the page reads, as the URL named it when the page opened. */
export const reportSource = reportSourceFromSearch(currentSearch());

export const tokenStore = createTokenStore(browserStores());

export const reader = createReader({
  token: tokenStore.token,
  load: (token, nowMs, issueCount, onProgress) =>
    loadReport(reportSource, {
      token,
      nowMs,
      issueCount,
      ...(onProgress === undefined ? {} : { onProgress }),
    }),
  loadRuns: (token) => loadWorkflowRuns(reportSource, { token }),
  loadIssues: (token, after, first) =>
    loadIssuePage(reportSource, { token, after, first }),
  now: () => Date.now(),
  counter: (ms) => counter(ms, { emitInitial: false }),
  isVisible: () => document.visibilityState === 'visible',
  visibilityChange: fromEvent(document, 'visibilitychange'),
});

export const themeStore = createThemeStore({
  initial: themeFromLocation(),
  system: {
    get: systemColorScheme,
    change: fromEvent(systemColorSchemeQuery(), 'change'),
  },
  apply: applyTheme,
  save: saveTheme,
});

export const layoutStore = createLayoutStore({
  initial: layoutFromLocation(),
  save: saveLayout,
  saveDelayMs: 300,
});

const MERGE_ORDER_VIEW_KEY = 'merge-order-view';

export const mergeOrderStore = createMergeOrderStore({
  entries: reader.entries,
  roots: reader.roots,
  features: reader.features,
  load: () => readSetting(MERGE_ORDER_VIEW_KEY),
  // A choice that cannot be kept still applies for as long as the page is
  // open, which is all a reader would notice.
  save: (view) => {
    writeSetting(MERGE_ORDER_VIEW_KEY, view).catch(() => undefined);
  },
});

const HEADER_FOLDED_KEY = 'header-folded';

export const headerStore = createHeaderStore({
  load: () => readSetting(HEADER_FOLDED_KEY),
  save: (folded) => {
    writeSetting(HEADER_FOLDED_KEY, folded).catch(() => undefined);
  },
});

const ISSUES_LIST_VIEW_KEY = 'issues-list-view';

export const issuesListStore = createIssuesListStore({
  issues: reader.issues,
  load: () => readSetting(ISSUES_LIST_VIEW_KEY),
  save: (view) => {
    writeSetting(ISSUES_LIST_VIEW_KEY, view).catch(() => undefined);
  },
});

const ISSUES_VIEW_KEY = 'issues-view';

const ISSUES_DAG_HIDE_DONE_KEY = 'issues-dag-hide-done';

export const issuesViewStore = createIssuesViewStore({
  issues: reader.issues,
  entries: reader.entries,
  repoUrl: repositoryUrl(reportSource),
  load: () => readSetting(ISSUES_VIEW_KEY),
  save: (view) => {
    writeSetting(ISSUES_VIEW_KEY, view).catch(() => undefined);
  },
  loadHideDone: () => readSetting(ISSUES_DAG_HIDE_DONE_KEY),
  saveHideDone: (hide) => {
    writeSetting(ISSUES_DAG_HIDE_DONE_KEY, hide).catch(() => undefined);
  },
  moreIssues: reader.moreIssues,
  loadMoreIssues: reader.loadMoreIssues,
});

export const activityStore = createActivityStore({
  token: tokenStore.token,
  load: (token, nowMs) => loadWeeklyActivity(reportSource, { token, nowMs }),
  now: () => Date.now(),
  setTimer: (delayMs, run) => {
    const timer = setTimeout(run, delayMs);

    return () => {
      clearTimeout(timer);
    };
  },
});

/**
 * Everything a component reads, as Preact signals, and the only way a
 * component reads the stores.
 *
 * The stores stay synstate, which is what their operators and their tests
 * are written in; this is where their values cross into the view. Read
 * `.value` in a render and Preact renders that component again when it
 * changes, as a hook would. Hand the signal itself to JSX as a child or a
 * DOM attribute instead and Preact rewrites that one node without rendering
 * anything, which is what the ages do (`components/age.tsx`).
 *
 * Nothing is made of them on the way: what a component needs, the store
 * derives, and emits only when it changed (`reader.mts`).
 */
export const readerSignals = {
  loadStatus: toSignal(reader.loadStatus),
  readAt: toSignal(reader.readAt),
  summary: toSignal(reader.summary),
  entries: toSignal(reader.entries),
  byNumber: toSignal(reader.byNumber),
  scaleMax: toSignal(reader.scaleMax),
  roots: toSignal(reader.roots),
  cycles: toSignal(reader.cycles),
  merged: toSignal(reader.merged),
  queue: toSignal(reader.queue),
  features: toSignal(reader.features),
  issues: toSignal(reader.issues),
  reading: toSignal(reader.reading),
  runs: toSignal(reader.runs),
  moreIssues: toSignal(reader.moreIssues),
  rateLimit: toSignal(reader.rateLimit),
  nowMs: toSignal(reader.nowMs),
} as const;

export const tokenSignals = {
  token: toSignal(tokenStore.token),
  saveError: toSignal(tokenStore.saveError),
  typed: toSignal(tokenStore.typed),
  remember: toSignal(tokenStore.remember),
} as const;

export const themeSignals = {
  theme: toSignal(themeStore.theme),
  system: toSignal(themeStore.system),
} as const;

export const mergeOrderSignals = {
  view: toSignal(mergeOrderStore.view),
  roots: toSignal(mergeOrderStore.roots),
  counts: toSignal(mergeOrderStore.counts),
} as const;

export const headerSignals = {
  folded: toSignal(headerStore.folded),
} as const;

export const issuesViewSignals = {
  view: toSignal(issuesViewStore.view),
  hideDone: toSignal(issuesViewStore.hideDone),
  graph: toSignal(issuesViewStore.graph),
  layout: toSignal(issuesViewStore.layout),
  doneCount: toSignal(issuesViewStore.doneCount),
  dagScale: toSignal(issuesViewStore.dagScale),
  dagFitted: toSignal(issuesViewStore.dagFitted),
} as const;

export const issuesListSignals = {
  view: toSignal(issuesListStore.view),
  query: toSignal(issuesListStore.query),
  items: toSignal(issuesListStore.items),
  counts: toSignal(issuesListStore.counts),
} as const;

export const layoutSignals = {
  layout: toSignal(layoutStore.layout),
  mode: toSignal(layoutStore.mode),
  settingsOpen: toSignal(layoutStore.settingsOpen),
} as const;

export const activitySignals = {
  open: toSignal(activityStore.open),
  status: toSignal(activityStore.status),
} as const;

/**
 * Starts the timers and the listeners. Called once, from `main.tsx`, before
 * the first render: the theme is written to `<html>` as it starts, so a page
 * opened with `?theme=` never draws a frame of the other one.
 */
export const startStore = (): (() => void) => {
  const stopToken = tokenStore.start();

  const stopTheme = themeStore.start();

  const stopReader = reader.start();

  const stopLayout = layoutStore.start();

  const stopMergeOrder = mergeOrderStore.start();

  const stopHeader = headerStore.start();

  const stopIssuesView = issuesViewStore.start();

  const stopIssuesList = issuesListStore.start();

  const stopActivity = activityStore.start();

  return () => {
    stopToken();

    stopTheme();

    stopReader();

    stopLayout();

    stopMergeOrder();

    stopHeader();

    stopIssuesView();

    stopIssuesList();

    stopActivity();
  };
};

/**
 * A DOM event as an observable. Listened to for as long as the page is open,
 * which is as long as anything here lives.
 */
function fromEvent(
  target: Readonly<EventTarget>,
  type: string,
): SynstateObservable<void> {
  const [event$, emit] = createEventEmitter();

  target.addEventListener(type, emit);

  return event$;
}
