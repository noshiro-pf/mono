import type { ForestNode } from 'pr-report-core-v2';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  readChoice,
  readFirstName,
  readFlag,
  readNames,
  writeChoice,
  writeFlag,
  writeNames,
  type ParamCodec,
} from '../url/index.mjs';
import {
  LABELLED_PRIORITIES,
  type MergeOrderCard,
  type Priority,
} from './card.mjs';

/**
 * The tiles a repository offers: `queued` and `set aside` only where the queue
 * runs, `awaiting code owner` only where a rule asks for code owner review.
 */
export const availableStatuses = (
  queueRepository: boolean,
  codeOwnerReview: boolean,
): readonly MergeOrderStatus[] =>
  MERGE_ORDER_STATUSES.filter(
    (status) =>
      (queueRepository || (status !== 'queued' && status !== 'setAside')) &&
      (codeOwnerReview || status !== 'codeOwner'),
  );

/**
 * The settings as they apply where only `available` is offered: what they hide
 * or pick of the rest is ignored, not forgotten, since the URL goes along to a
 * repository that has them.
 */
export const withAvailable = (
  settings: MergeOrderSettings,
  available: readonly MergeOrderStatus[],
): MergeOrderSettings =>
  ({
    ...settings,
    hide: settings.hide.filter((status) => available.includes(status)),
    only:
      settings.only !== undefined && available.includes(settings.only)
        ? settings.only
        : undefined,
  }) as const;

/** Hiding a picked status unpicks it: a status is never both. */
export const toggleHidden = (
  prev: MergeOrderSettings,
  status: MergeOrderStatus,
): MergeOrderSettings =>
  ({
    ...prev,
    hide: toggled(prev.hide, status),
    only: prev.only === status ? undefined : prev.only,
  }) as const;

/** Picking a hidden status shows it: a status is never both. */
export const toggleOnly = (
  prev: MergeOrderSettings,
  status: MergeOrderStatus,
): MergeOrderSettings =>
  prev.only === status
    ? ({ ...prev, only: undefined } as const)
    : ({
        ...prev,
        only: status,
        hide: prev.hide.filter((s) => s !== status),
      } as const);

export const togglePriority = (
  prev: MergeOrderSettings,
  priority: Priority,
): MergeOrderSettings =>
  ({
    ...prev,
    hidePriority: toggled(prev.hidePriority, priority),
  }) as const;

/** The statuses a card counts under. */
export const statusesOf = (card: MergeOrderCard): readonly MergeOrderStatus[] =>
  MERGE_ORDER_STATUSES.filter((status) => hasStatus(card, status));

/** Whether `settings` show `card`. */
export const isShown = (
  card: MergeOrderCard,
  settings: MergeOrderSettings,
): boolean =>
  (settings.only === undefined || hasStatus(card, settings.only)) &&
  settings.hide.every((status) => !hasStatus(card, status)) &&
  !settings.hidePriority.includes(card.priority) &&
  !(settings.hideDrafts && card.isDraft);

/**
 * Each tile's number. A tile whose cards show counts the cards shown; a hidden
 * one counts how many showing it would add (spec §7.3).
 */
export const tileCounts = (
  cards: readonly MergeOrderCard[],
  settings: MergeOrderSettings,
): Readonly<{
  open: Readonly<{ shown: number; total: number }>;
  statuses: ReadonlyRecord<MergeOrderStatus, TileCount>;
  priorities: ReadonlyRecord<Priority, TileCount>;
  drafts: TileCount;
}> => {
  const count = (
    has: (card: MergeOrderCard) => boolean,
    hidden: boolean,
    unhidden: MergeOrderSettings,
  ): TileCount =>
    ({
      count: cards.filter(
        (card) => has(card) && isShown(card, hidden ? unhidden : settings),
      ).length,
      hidden,
    }) as const;

  const statusCount = (status: MergeOrderStatus): TileCount =>
    count((card) => hasStatus(card, status), settings.hide.includes(status), {
      ...settings,
      hide: settings.hide.filter((s) => s !== status),
    });

  const priorityCount = (priority: Priority): TileCount =>
    count(
      (card) => card.priority === priority,
      settings.hidePriority.includes(priority),
      {
        ...settings,
        hidePriority: settings.hidePriority.filter((p) => p !== priority),
      },
    );

  return {
    open: {
      shown: cards.filter((card) => isShown(card, settings)).length,
      total: cards.length,
    },
    statuses: {
      queued: statusCount('queued'),
      failing: statusCount('failing'),
      setAside: statusCount('setAside'),
      codeOwner: statusCount('codeOwner'),
      pending: statusCount('pending'),
    },
    priorities: {
      high: priorityCount('high'),
      mid: priorityCount('mid'),
      low: priorityCount('low'),
      none: priorityCount('none'),
    },
    drafts: count((card) => card.isDraft, settings.hideDrafts, {
      ...settings,
      hideDrafts: false,
    }),
  };
};

/**
 * The tree drawn: the forest with what `settings` hide taken out, a hidden pull
 * request giving its place to what is below it, and with the priority sort,
 * siblings ordered by the best priority in their subtree.
 */
export const shownTree = (
  roots: readonly ForestNode[],
  cards: ReadonlyMap<number, MergeOrderCard>,
  settings: MergeOrderSettings,
): readonly ShownNode[] => {
  const shown = (nodes: readonly ForestNode[]): readonly ShownNode[] =>
    nodes.flatMap((node) => {
      const card = cards.get(node.number);

      const children = shown(node.children);

      return card !== undefined && isShown(card, settings)
        ? [{ card, repeated: node.repeated, children }]
        : children;
    });

  const tree = shown(roots);

  return settledRepeats(settings.sort === 'priority' ? byPriority(tree) : tree);
};

/** What a count tile of the merge order counts (spec §7.3). */
export type MergeOrderStatus =
  'codeOwner' | 'failing' | 'pending' | 'queued' | 'setAside';

/** The merge order's filters and sort, kept in the URL. */
export type MergeOrderSettings = Readonly<{
  hide: readonly MergeOrderStatus[];
  only: MergeOrderStatus | undefined;
  hidePriority: readonly Priority[];
  hideDrafts: boolean;
  sort: MergeOrderSort;
}>;

export type MergeOrderSort = 'order' | 'priority';

/** A pull request drawn in the tree, with what it holds up below it. */
export type ShownNode = Readonly<{
  card: MergeOrderCard;
  /** Drawn in full under another parent already: one line here. */
  repeated: boolean;
  children: readonly ShownNode[];
}>;

/** A tile's number: what the list shows, or what showing would add. */
export type TileCount = Readonly<{ count: number; hidden: boolean }>;

export const MERGE_ORDER_STATUSES = [
  'queued',
  'failing',
  'setAside',
  'codeOwner',
  'pending',
] as const satisfies readonly MergeOrderStatus[];

export const PRIORITIES = Arr.toPushed(
  LABELLED_PRIORITIES,
  'none',
) satisfies readonly Priority[];

export const DEFAULT_MERGE_ORDER: MergeOrderSettings = {
  hide: [],
  only: undefined,
  hidePriority: [],
  hideDrafts: false,
  sort: 'order',
} as const;

/**
 * `prs.hide=queued.setAside`, `prs.only=failing`, `prs.hidePriority=low.none`,
 * `prs.hideDrafts=1`, `prs.sort=priority`: v1's spelling. A status both hidden
 * and picked reads as picked.
 */
export const mergeOrderCodec: ParamCodec<MergeOrderSettings> = {
  read: (params) => {
    const only = readFirstName(params, KEY.only, MERGE_ORDER_STATUSES);

    return {
      hide: readNames(params, KEY.hide, MERGE_ORDER_STATUSES).filter(
        (status) => status !== only,
      ),
      only,
      hidePriority: readNames(params, KEY.hidePriority, PRIORITIES),
      hideDrafts: readFlag(params, KEY.hideDrafts),
      sort: readChoice(params, KEY.sort, SORTS, 'order'),
    };
  },
  write: (settings, params) => {
    writeNames(params, KEY.hide, settings.hide);

    writeNames(
      params,
      KEY.only,
      settings.only === undefined ? [] : [settings.only],
    );

    writeNames(params, KEY.hidePriority, settings.hidePriority);

    writeFlag(params, KEY.hideDrafts, settings.hideDrafts);

    writeChoice(params, KEY.sort, settings.sort, 'order');
  },
} as const;

/** The tile's statuses with what they mean, for the tooltips. */
export const STATUS_NAMES = {
  queued: 'queued',
  failing: 'failing',
  setAside: 'set aside',
  codeOwner: 'awaiting code owner',
  pending: 'pending',
} as const satisfies ReadonlyRecord<MergeOrderStatus, string>;

const KEY = {
  hide: 'prs.hide',
  only: 'prs.only',
  hidePriority: 'prs.hidePriority',
  hideDrafts: 'prs.hideDrafts',
  sort: 'prs.sort',
} as const;

const SORTS = [
  'order',
  'priority',
] as const satisfies readonly MergeOrderSort[];

/** Best first; no priority sits between mid and low. */
const PRIORITY_RANK = {
  high: 0,
  mid: 1,
  none: 2,
  low: 3,
} as const satisfies ReadonlyRecord<Priority, number>;

/**
 * The tree with each pull request drawn in full where it is first met reading
 * downwards, and as one line wherever else: sorting can move a repeat above its
 * full card, and a hidden parent lifting its children can make one pull request
 * its own sibling, which is drawn once.
 */
const settledRepeats = (tree: readonly ShownNode[]): readonly ShownNode[] => {
  const mut_full = new Map<number, readonly ShownNode[]>();

  const collect = (nodes: readonly ShownNode[]): void => {
    for (const node of nodes) {
      if (!node.repeated && !mut_full.has(node.card.number)) {
        mut_full.set(node.card.number, node.children);
      }

      collect(node.children);
    }
  };

  collect(tree);

  const mut_seen = new Set<number>();

  const walk = (nodes: readonly ShownNode[]): readonly ShownNode[] => {
    const mut_siblings = new Set<number>();

    return nodes.flatMap((node): readonly ShownNode[] => {
      const { number } = node.card;

      if (mut_siblings.has(number)) {
        return [];
      }

      mut_siblings.add(number);

      if (mut_seen.has(number)) {
        return [{ card: node.card, repeated: true, children: [] }];
      }

      mut_seen.add(number);

      return [
        {
          card: node.card,
          repeated: false,
          children: walk(mut_full.get(number) ?? node.children),
        },
      ];
    });
  };

  return walk(tree);
};

const toggled = <T,>(list: readonly T[], item: T): readonly T[] =>
  list.includes(item)
    ? list.filter((x) => x !== item)
    : Arr.toPushed(list, item);

const hasStatus = (card: MergeOrderCard, status: MergeOrderStatus): boolean => {
  switch (status) {
    case 'queued':
      return card.queued;

    case 'failing':
      return card.checks.kind === 'counts' && card.checks.verdict === 'failing';

    case 'setAside':
      return card.setAside?.applies === true;

    case 'codeOwner':
      return card.codeOwner !== undefined;

    case 'pending':
      return card.pending;
  }
};

/**
 * Each node sorted with its subtree, and the best rank in it, found once;
 * siblings of one rank keep their merge order.
 */
const rankedByPriority = (
  nodes: readonly ShownNode[],
): readonly Readonly<{ node: ShownNode; best: number }>[] =>
  nodes
    .map((node) => {
      const children = rankedByPriority(node.children);

      return {
        node: { ...node, children: children.map((child) => child.node) },
        best: Math.min(
          PRIORITY_RANK[node.card.priority],
          ...children.map((child) => child.best),
        ),
      };
    })
    // Stable: siblings of one rank keep the order they merge in.
    .toSorted((a, b) => a.best - b.best);

const byPriority = (nodes: readonly ShownNode[]): readonly ShownNode[] =>
  rankedByPriority(nodes).map(({ node }) => node);
