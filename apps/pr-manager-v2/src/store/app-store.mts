import { map, type InitializedObservable } from 'synstate';
import { Result } from 'ts-data-forge';
import {
  dagZoomCodec,
  issuesCodec,
  layoutCodec,
  mergeOrderCodec,
  themeCodec,
  type BlockId,
  type ColorScheme,
  type Repo,
  type Theme,
} from '../domain/index.mjs';
import { browserTokenStores } from '../github/index.mjs';
import {
  browserReadActivity,
  createActivityStore,
  type ActivityStore,
  type ReadActivity,
} from './activity-store.mjs';
import { createClockStore, type ClockStore } from './clock-store.mjs';
import { createHeaderStore, type HeaderStore } from './header-store.mjs';
import { createIssuesStore, type IssuesStore } from './issues-store.mjs';
import { createLayoutStore, type LayoutStore } from './layout-store.mjs';
import {
  createMergeOrderStore,
  type MergeOrderStore,
} from './merge-order-store.mjs';
import { queueBlockViewOf, type QueueBlockView } from './queue-store.mjs';
import {
  browserReadReport,
  createReportStore,
  type ReadReport,
  type ReportStore,
} from './report-store.mjs';
import { browserSettingsDb, type SettingsDb } from './settings-db.mjs';
import { createThemeStore, type ThemeStore } from './theme-store.mjs';
import { browserTimers, type Timers } from './timers.mjs';
import { createTokenStore, type TokenStore } from './token-store.mjs';
import {
  browserUrl,
  createUrlStore,
  type UrlIo,
  type UrlStore,
} from './url-store.mjs';

/**
 * Every store of the page, made once and handed to the view. The browser comes
 * in through {@link AppDeps}, so that a test or a screenshot script can make
 * the same stores over fakes.
 */
export type AppStore = Readonly<{
  repo: Repo;
  url: UrlStore;
  clock: ClockStore;
  token: TokenStore;
  theme: ThemeStore;
  header: HeaderStore;
  layout: LayoutStore;
  report: ReportStore;
  mergeOrder: MergeOrderStore;
  queue: InitializedObservable<QueueBlockView>;
  issues: IssuesStore;
  activity: ActivityStore;
  start: () => () => void;
}>;

export type AppDeps = Readonly<{
  repo: Repo;
  url: UrlIo;
  timers: Timers;
  settings: SettingsDb;
  tokenStores: ReturnType<typeof browserTokenStores>;
  isVisible: () => boolean;
  watchVisibility: (onChange: () => void) => () => void;
  system: Readonly<{
    get: () => ColorScheme;
    watch: (onChange: () => void) => () => void;
  }>;
  applyTheme: (theme: Theme) => void;
  read: ReadReport;
  readActivity: ReadActivity;
}>;

export const createAppStore = (deps: AppDeps): AppStore => {
  const url = createUrlStore({
    ...deps.url,
    timers: deps.timers,
    delayMs: URL_WRITE_DELAY_MS,
  });

  const clock = createClockStore(deps);

  const token = createTokenStore(deps.tokenStores);

  const theme = createThemeStore({
    field: url.field(themeCodec),
    system: deps.system,
    apply: deps.applyTheme,
  });

  const header = createHeaderStore(deps.settings);

  const report = createReportStore({
    token: token.tokenValue,
    timers: deps.timers,
    isVisible: deps.isVisible,
    watchVisibility: deps.watchVisibility,
    read: deps.read,
  });

  // Until the labels are read, the queue is not known to be absent.
  const absent = report.report.pipe(
    map((read): readonly BlockId[] =>
      read !== undefined &&
      Result.isOk(read.snapshot.repository.hasQueueLabel) &&
      !read.snapshot.repository.hasQueueLabel.value
        ? ['queue']
        : [],
    ),
  );

  const layout = createLayoutStore({ field: url.field(layoutCodec), absent });

  const activity = createActivityStore({
    token: token.tokenValue,
    timers: deps.timers,
    read: deps.readActivity,
  });

  return {
    repo: deps.repo,
    url,
    clock,
    token,
    theme,
    header,
    layout,
    report,
    mergeOrder: createMergeOrderStore({
      report: report.report,
      field: url.field(mergeOrderCodec),
    }),
    queue: queueBlockViewOf(report.report),
    issues: createIssuesStore({
      report: report.report,
      field: url.field(issuesCodec),
      zoom: url.field(dagZoomCodec),
    }),
    activity,
    start: () => {
      const stops = [
        clock.start(),
        theme.start(),
        header.start(),
        report.start(),
        activity.start(),
      ] as const;

      return () => {
        for (const stop of stops) {
          stop();
        }

        url.flush();
      };
    },
  };
};

/** The real browser. */
export const browserAppDeps = (repo: Repo): AppDeps => {
  const dark = globalThis.matchMedia('(prefers-color-scheme: dark)');

  return {
    repo,
    url: browserUrl(),
    timers: browserTimers,
    settings: browserSettingsDb,
    tokenStores: browserTokenStores(),
    isVisible: () => document.visibilityState === 'visible',
    watchVisibility: (onChange) =>
      listen(document, 'visibilitychange', onChange),
    system: {
      get: () => (dark.matches ? 'dark' : 'light'),
      watch: (onChange) => listen(dark, 'change', onChange),
    },
    applyTheme: (next) => {
      // eslint-disable-next-line functional/immutable-data
      document.documentElement.dataset['theme'] = next;
    },
    read: browserReadReport(repo),
    readActivity: browserReadActivity(repo),
  };
};

/** Short enough to feel immediate, long enough that a drag writes once. */
const URL_WRITE_DELAY_MS = 300;

const listen = (
  target: EventTarget,
  type: string,
  onEvent: () => void,
): (() => void) => {
  target.addEventListener(type, onEvent);

  return () => {
    target.removeEventListener(type, onEvent);
  };
};
