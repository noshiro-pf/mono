import type { IssueStartState } from 'pr-report-core-v2';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord, StrictExclude, StrictPick } from 'ts-type-forge';
import type { TileCount } from '../merge-order/index.mjs';
import {
  readChoice,
  readFlag,
  readNames,
  writeChoice,
  writeFlag,
  writeNames,
  type ParamCodec,
} from '../url/index.mjs';
import type { IssueRow, Tier } from './issue-row.mjs';

/** The open issues block's view and filters, kept in the URL (spec §11). */
export type IssuesSettings = Readonly<{
  view: IssuesView;
  hidePriority: readonly Tier[];
  /** Two picked show either. */
  onlyPriority: readonly Tier[];
  /** In progress picked with a tier shows both. */
  hideInProgress: boolean;
  onlyInProgress: boolean;
  /** List only: the start states switched off. */
  hideStart: readonly StartSwitch[];
  /** List only: the labels picked; one picked shows issues with any picked. */
  labels: readonly string[];
  sort: IssuesSort;
}>;

export type IssuesView = 'dag' | 'list';

export type IssuesSort = 'priority' | 'start' | 'updated';

/** Every start state but `in-progress`, which has a tile of its own. */
export type StartSwitch = StrictExclude<IssueStartState, 'in-progress'>;

/** In the order the tiles draw them: the tiers, then `hold` and `close`. */
export const TIERS = [
  'S',
  'A',
  'B',
  'C',
  'D',
  'none',
  'hold',
  'close',
] as const satisfies readonly Tier[];

/** In the order the sort and the switches give them (spec §11.2). */
export const START_SWITCHES = [
  'ready',
  'free',
  'planned',
  'attention',
  'blocked',
  'cycle',
] as const satisfies readonly StartSwitch[];

/** The DAG's words for each start state, which the list uses too. */
export const START_NAMES = {
  ready: 'Can start, wait over',
  free: 'Can start',
  planned: 'Planned',
  'in-progress': 'In progress',
  attention: 'Needs a look',
  blocked: 'Waiting',
  cycle: 'Cycle',
} as const satisfies ReadonlyRecord<IssueStartState, string>;

/** What each tier means, from `docs/issue-priority.md`. */
export const TIER_TITLES = {
  S: 'priority:S — speeds development up right now: CI red on every pull request, a document that misleads sessions.',
  A: 'priority:A — the base of development, automating manual work, security, bugs that stop real users.',
  B: 'priority:B — other bugs in apps in use and published packages, middling efficiency gains.',
  C: 'priority:C — documents, refactoring, small improvements, light features.',
  D: 'priority:D — toy apps, large new features.',
  none: 'No tier label, or several.',
  hold: 'priority:hold — not to be started as things stand.',
  close:
    'priority:close — to close or merge into another issue at the next review.',
} as const satisfies ReadonlyRecord<Tier, string>;

export const DEFAULT_ISSUES: IssuesSettings = {
  view: 'list',
  hidePriority: [],
  onlyPriority: [],
  hideInProgress: false,
  onlyInProgress: false,
  hideStart: [],
  labels: [],
  sort: 'updated',
} as const;

/**
 * `issues=dag`, `issues.hidePriority=D.close`, `issues.onlyPriority=S.A`,
 * `issues.hideStart=blocked.cycle`, `issues.hideInProgress=1` or
 * `issues.onlyInProgress=1`, `issues.sort=priority`, `issues.label=<name>`
 * repeated: v1's spelling. The older `issues.hidePending=1`,
 * `issues.onlyPending=1` and `dag.hidePending=1` read as `hold`, and go once
 * written. A tier both hidden and picked reads as picked.
 */
export const issuesCodec: ParamCodec<IssuesSettings> = {
  read: (params) => {
    const onlyPriority = Arr.uniq([
      ...readNames(params, KEY.onlyPriority, TIERS),
      ...(readFlag(params, OLDER.only) ? (['hold'] as const) : []),
    ]);

    const hideInProgress = readFlag(params, KEY.hideInProgress);

    return {
      view: readChoice(params, KEY.view, VIEWS, 'list'),
      hidePriority: Arr.uniq([
        ...readNames(params, KEY.hidePriority, TIERS),
        ...(readFlag(params, OLDER.hide) || readFlag(params, OLDER.dagHide)
          ? (['hold'] as const)
          : []),
      ]).filter((tier) => !onlyPriority.includes(tier)),
      onlyPriority,
      hideInProgress,
      onlyInProgress: !hideInProgress && readFlag(params, KEY.onlyInProgress),
      hideStart: readNames(params, KEY.hideStart, START_SWITCHES),
      labels: Arr.uniq(
        params.getAll(KEY.label).filter((name) => name !== ''),
      ).toSorted((a, b) => a.localeCompare(b)),
      sort: readChoice(params, KEY.sort, SORTS, 'updated'),
    };
  },
  write: (settings, params) => {
    writeChoice(params, KEY.view, settings.view, 'list');

    writeNames(params, KEY.hidePriority, settings.hidePriority);

    writeNames(params, KEY.onlyPriority, settings.onlyPriority);

    writeFlag(params, KEY.hideInProgress, settings.hideInProgress);

    writeFlag(params, KEY.onlyInProgress, settings.onlyInProgress);

    writeNames(params, KEY.hideStart, settings.hideStart);

    if (!Arr.eq(params.getAll(KEY.label), settings.labels)) {
      params.delete(KEY.label);

      for (const name of settings.labels) {
        params.append(KEY.label, name);
      }
    }

    writeChoice(params, KEY.sort, settings.sort, 'updated');

    for (const older of Object.values(OLDER)) {
      params.delete(older);
    }
  },
} as const;

/** Whether the tier and in-progress filters show `row`: both views read it. */
export const passesTiers = (row: IssueRow, s: TierSettings): boolean => {
  const inProgress = row.start === 'in-progress';

  return (
    !s.hidePriority.includes(row.tier) &&
    (!Arr.isNonEmpty(s.onlyPriority) || s.onlyPriority.includes(row.tier)) &&
    (inProgress ? !s.hideInProgress : !s.onlyInProgress)
  );
};

/** The settings the DAG reads: the tiers and in progress, nothing of the list. */
export type TierSettings = StrictPick<
  IssuesSettings,
  'hideInProgress' | 'hidePriority' | 'onlyInProgress' | 'onlyPriority'
>;

export const tierSettingsOf = (s: IssuesSettings): TierSettings =>
  ({
    hidePriority: s.hidePriority,
    onlyPriority: s.onlyPriority,
    hideInProgress: s.hideInProgress,
    onlyInProgress: s.onlyInProgress,
  }) as const;

/** Whether the list shows `row`: the tiers, the starts, the labels, the search. */
export const isListed = (
  row: IssueRow,
  s: IssuesSettings,
  query: string,
): boolean =>
  passesTiers(row, s) &&
  (row.start === 'in-progress' || !s.hideStart.includes(row.start)) &&
  (!Arr.isNonEmpty(s.labels) ||
    row.labels.some(({ name }) => s.labels.includes(name))) &&
  matchesSearch(row, query);

/**
 * A title containing `query` (case and full-width ASCII aside), or the number
 * `123` / `#123`; an empty query matches all.
 */
export const matchesSearch = (row: IssueRow, query: string): boolean => {
  const q = narrowed(query.trim()).toLowerCase();

  if (q === '') {
    return true;
  }

  const number = /^#?(?<n>\d+)$/u.exec(q)?.groups?.['n'];

  return number === undefined
    ? narrowed(row.title).toLowerCase().includes(q)
    : row.number.toString() === number;
};

/**
 * The tiles' numbers. A shown tile counts what the view shows of it; a hidden
 * one, or a tier not picked while others are, counts what showing or picking it
 * would add.
 */
export const issueTileCounts = (
  rows: readonly IssueRow[],
  s: IssuesSettings,
  shows: (row: IssueRow, settings: IssuesSettings) => boolean,
): Readonly<{
  open: Readonly<{ shown: number; total: number }>;
  tiers: ReadonlyRecord<Tier, TileCount>;
  inProgress: TileCount;
}> => {
  const tier = (t: Tier): TileCount => {
    const hidden =
      s.hidePriority.includes(t) ||
      (Arr.isNonEmpty(s.onlyPriority) && !s.onlyPriority.includes(t));

    const as: IssuesSettings = {
      ...s,
      hidePriority: s.hidePriority.filter((x) => x !== t),
      onlyPriority: [],
    } as const;

    return {
      count: rows.filter((row) => row.tier === t && shows(row, as)).length,
      hidden,
    };
  };

  const inProgressHidden = s.hideInProgress;

  return {
    open: {
      shown: rows.filter((row) => shows(row, s)).length,
      total: rows.length,
    },
    tiers: {
      S: tier('S'),
      A: tier('A'),
      B: tier('B'),
      C: tier('C'),
      D: tier('D'),
      none: tier('none'),
      hold: tier('hold'),
      close: tier('close'),
    },
    inProgress: {
      count: rows.filter(
        (row) =>
          row.start === 'in-progress' &&
          shows(row, { ...s, hideInProgress: false, onlyInProgress: false }),
      ).length,
      hidden: inProgressHidden,
    },
  };
};

/**
 * The list's order: most recently updated first, or by tier (S, A, B, C, none,
 * D, hold, close) or by start (ready, free, planned, in progress, needs a look,
 * waiting, cycle), updated within.
 */
export const sortIssues = (
  rows: readonly IssueRow[],
  sort: IssuesSort,
): readonly IssueRow[] =>
  rows.toSorted((a, b) => {
    const byKey =
      sort === 'priority'
        ? TIER_RANK[a.tier] - TIER_RANK[b.tier]
        : sort === 'start'
          ? START_RANK[a.start] - START_RANK[b.start]
          : 0;

    return byKey === 0
      ? knownOr0(b.updatedAtMs) - knownOr0(a.updatedAtMs)
      : byKey;
  });

/** Hiding a picked tier unpicks it: a tier is never both. */
export const toggleTierHidden = (s: IssuesSettings, t: Tier): IssuesSettings =>
  s.hidePriority.includes(t)
    ? ({ ...s, hidePriority: s.hidePriority.filter((x) => x !== t) } as const)
    : ({
        ...s,
        hidePriority: Arr.toPushed(s.hidePriority, t),
        onlyPriority: s.onlyPriority.filter((x) => x !== t),
      } as const);

/** Picking a hidden tier shows it; two picked show either. */
export const toggleTierOnly = (s: IssuesSettings, t: Tier): IssuesSettings =>
  s.onlyPriority.includes(t)
    ? ({ ...s, onlyPriority: s.onlyPriority.filter((x) => x !== t) } as const)
    : ({
        ...s,
        onlyPriority: Arr.toPushed(s.onlyPriority, t),
        hidePriority: s.hidePriority.filter((x) => x !== t),
      } as const);

export const toggleInProgressHidden = (s: IssuesSettings): IssuesSettings =>
  ({
    ...s,
    hideInProgress: !s.hideInProgress,
    onlyInProgress: false,
  }) as const;

export const toggleInProgressOnly = (s: IssuesSettings): IssuesSettings =>
  ({
    ...s,
    onlyInProgress: !s.onlyInProgress,
    hideInProgress: false,
  }) as const;

const KEY = {
  view: 'issues',
  hidePriority: 'issues.hidePriority',
  onlyPriority: 'issues.onlyPriority',
  hideInProgress: 'issues.hideInProgress',
  onlyInProgress: 'issues.onlyInProgress',
  hideStart: 'issues.hideStart',
  label: 'issues.label',
  sort: 'issues.sort',
} as const;

const OLDER = {
  hide: 'issues.hidePending',
  only: 'issues.onlyPending',
  dagHide: 'dag.hidePending',
} as const;

const VIEWS = ['list', 'dag'] as const satisfies readonly IssuesView[];

const SORTS = [
  'updated',
  'priority',
  'start',
] as const satisfies readonly IssuesSort[];

const TIER_RANK = {
  S: 0,
  A: 1,
  B: 2,
  C: 3,
  none: 4,
  D: 5,
  hold: 6,
  close: 7,
} as const satisfies ReadonlyRecord<Tier, number>;

const START_RANK = {
  ready: 0,
  free: 1,
  planned: 2,
  'in-progress': 3,
  attention: 4,
  blocked: 5,
  cycle: 6,
} as const satisfies ReadonlyRecord<IssueStartState, number>;

/** The full-width forms of the printable ASCII characters but space. */
const FULL_WIDTH_ASCII = /[！-～]/gu;

const FULL_WIDTH_OFFSET = 0xfe_e0;

const narrowed = (text: string): string =>
  text.replaceAll(FULL_WIDTH_ASCII, (wide) =>
    String.fromCodePoint((wide.codePointAt(0) ?? 0) - FULL_WIDTH_OFFSET),
  );

/** A time that did not parse sorts as the oldest. */
const knownOr0 = (ms: number): number => (Number.isFinite(ms) ? ms : 0);
