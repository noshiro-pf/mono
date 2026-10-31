/**
 * The page's state, made once with the browser as its surroundings.
 *
 * The components bind its values straight into the DOM and call its actions;
 * none of them holds state of its own. What each part does, and the tests of
 * it, are in the modules this puts together — this file is only which real
 * thing each of them is handed.
 */

import {
  counter,
  createEventEmitter,
  type Observable as SynstateObservable,
} from 'synstate';
import {
  reportSourceFromSearch,
  repositoryUrl,
  type ReportSource,
} from '../constants.mjs';
import { dagZoomFromLocation, saveDagZoom } from '../dag-zoom.mjs';
import {
  issuesListViewFromLocation,
  saveIssuesListView,
} from '../issues-list-view.mjs';
import {
  issuesViewSettingsFromLocation,
  saveIssuesViewSettings,
} from '../issues-view-settings.mjs';
import { layoutFromLocation, saveLayout } from '../layout.mjs';
import { loadIssuePage, loadReport } from '../load-report.mjs';
import {
  mergeOrderViewFromLocation,
  saveMergeOrderView,
} from '../merge-order-view.mjs';
import { createReportCache } from '../report-cache.mjs';
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
import {
  createIssueGraph,
  createIssuesViewStore,
} from './issues-view-store.mjs';
import { createLayoutStore } from './layout-store.mjs';
import { createMergeOrderStore } from './merge-order-store.mjs';
import { createReader } from './reader.mjs';
import { createThemeStore } from './theme-store.mjs';
import { createTokenStore } from './token-store.mjs';

/**
 * The repository the page reads, as the URL named it when the page opened.
 * `main.tsx` loads this module only when it names one, and shows the start page
 * otherwise.
 */
export const reportSource: ReportSource =
  reportSourceFromSearch(currentSearch()) ??
  unreachable('the store was loaded without ?repo= naming a repository');

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
  cache: createReportCache({
    source: reportSource,
    build: PR_MANAGER_BUILD_ID,
    read: readSetting,
    write: writeSetting,
  }),
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

export const mergeOrderStore = createMergeOrderStore({
  entries: reader.entries,
  roots: reader.roots,
  features: reader.features,
  initial: mergeOrderViewFromLocation(),
  save: saveMergeOrderView,
});

const HEADER_FOLDED_KEY = 'header-folded';

export const headerStore = createHeaderStore({
  load: () => readSetting(HEADER_FOLDED_KEY),
  save: (folded) => {
    writeSetting(HEADER_FOLDED_KEY, folded).catch(() => undefined);
  },
});

const issueGraph = createIssueGraph({
  issues: reader.issues,
  entries: reader.entries,
  repoUrl: repositoryUrl(reportSource),
});

export const issuesListStore = createIssuesListStore({
  issues: reader.issues,
  graph: issueGraph,
  initial: issuesListViewFromLocation(),
  save: saveIssuesListView,
});

export const issuesViewStore = createIssuesViewStore({
  issues: reader.issues,
  graph: issueGraph,
  filter: issuesListStore.filter,
  initial: issuesViewSettingsFromLocation(),
  save: saveIssuesViewSettings,
  initialZoom: dagZoomFromLocation(),
  saveZoom: saveDagZoom,
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
 * Starts the timers and the listeners. Called once, from `main.tsx`, before the
 * first render: the theme is written to `<html>` as it starts, so a page opened
 * with `?theme=` never draws a frame of the other one.
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

/** What cannot happen, said aloud if it does. */
function unreachable(message: string): never {
  throw new Error(message);
}
