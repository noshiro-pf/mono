/**
 * The groups on the DAG: a frame with rounded corners round the nodes of
 * each, as they are drawn, with room above them for the group's title — so
 * a frame follows its nodes wherever they are put, and nothing of it is
 * stored but where it was. A group none of whose nodes is drawn (it has
 * none, or they are hidden) is an empty frame of a fixed size: where it was
 * when the arrangement last changed (`DagLayout.groupPositions`), or where
 * ELK put its box, moved clear of the nodes, if it never was anywhere.
 *
 * A node dropped with its centre inside a frame goes into that group, and
 * one dropped outside every frame into none (`dropTarget`). The frames are
 * those drawn when the node was picked up, which do not follow it.
 */

import { Arr, Num } from 'ts-data-forge';
import {
  GroupIdCodec,
  listNodes,
  nodeId,
  type DomainState,
  type GraphNodeId,
  type Group,
  type GroupId,
} from '../domain/index.mjs';
import { clearOf, PLACEMENT_GAP, type Bounds } from './dag-layout.mjs';
import type {
  LaidOutGroup,
  LaidOutNode,
  LayoutGroup,
} from './graph-layout.mjs';
import type { Point } from './pan-zoom.mjs';
import { truncateToUnits } from './truncate.mjs';

/** Between a frame and the nodes in it, on the left, the right and below. */
export const GROUP_PADDING = 16;

/** Between the top of a frame and its nodes: the line of its title. */
export const GROUP_HEADER = 32;

/** The frame of a group none of whose nodes is drawn. */
export const EMPTY_GROUP_SIZE = { width: 168, height: 72 } as const;

/** A group among the nodes and groups a pointer can drag, apart from them. */
export const groupKey = (id: GroupId): GroupKey => `group:${id}` as const;

/** The group `key` is of, or `undefined` for a node's id. */
export const groupIdOfKey = (key: string): GroupId | undefined => {
  if (!key.startsWith(GROUP_KEY_PREFIX)) {
    return undefined;
  }

  const id = key.slice(GROUP_KEY_PREFIX.length);

  return GroupIdCodec.is(id) ? id : undefined;
};

/** `title`, cut to fit along the top of a frame `width` wide. */
export const frameTitle = (title: string, width: number): string =>
  truncateToUnits(
    title,
    Math.max(
      0,
      Math.floor(Num.div(width - 2 * GROUP_PADDING, FRAME_TITLE_UNIT_WIDTH)),
    ),
  );

/**
 * Every one of `groups`, in their order, with the nodes of `state` in it
 * that are not `hidden`, in the order of `listNodes`. A node whose group is
 * not one of `groups` is in none.
 */
export const groupMembership = (
  state: DomainState,
  groups: readonly Group[],
  hidden: ReadonlySet<GraphNodeId>,
): readonly LayoutGroup[] => {
  const nodeGroups: readonly (readonly [GraphNodeId, GroupId | undefined])[] = [
    ...state.tasks.map(
      ({ id, groupId }) => [nodeId({ kind: 'task', id }), groupId] as const,
    ),
    ...state.milestones.map(
      ({ id, groupId }) =>
        [nodeId({ kind: 'milestone', id }), groupId] as const,
    ),
  ] as const;

  const groupOf = new Map(nodeGroups);

  const nodes = listNodes(state).filter(({ id }) => !hidden.has(id));

  return groups.map(({ id }) => ({
    id,
    members: nodes
      .filter((node) => groupOf.get(node.id) === id)
      .map((node) => node.id),
  }));
};

/** The group each node of `groups` is in. */
export const groupsByMember = (
  groups: readonly LayoutGroup[],
): ReadonlyMap<GraphNodeId, GroupId> =>
  new Map(
    groups.flatMap(({ id, members }) =>
      members.map((member) => [member, id] as const),
    ),
  );

/** `groups` with the node `id` moved into the group `into`, or into none. */
export const withMemberMoved = (
  groups: readonly LayoutGroup[],
  id: GraphNodeId,
  into: GroupId | undefined,
): readonly LayoutGroup[] =>
  groups.map((group) => {
    const others = group.members.filter((member) => member !== id);

    return {
      id: group.id,
      members: group.id === into ? Arr.toPushed(others, id) : others,
    };
  });

/**
 * The frame of each of `groups`, in their order: round those of its members
 * that are among `nodes`, or for none, the empty frame at the position
 * `emptyAt` has for it — and no frame if it has none.
 */
export const groupFrames = (
  nodes: readonly LaidOutNode[],
  groups: readonly LayoutGroup[],
  emptyAt: ReadonlyMap<GroupId, Point>,
): readonly GroupFrame[] => {
  const byId = new Map(nodes.map((node) => [node.id, node]));

  return groups.flatMap(({ id, members }): readonly GroupFrame[] => {
    const drawn = Arr.generate(function* () {
      for (const member of members) {
        const node = byId.get(member);

        if (node !== undefined) {
          yield node;
        }
      }
    });

    const around = frameAround(drawn);

    if (around !== undefined) {
      return [{ id, empty: false, ...around }];
    }

    const at = emptyAt.get(id);

    return at === undefined
      ? []
      : [{ id, empty: true, x: at.x, y: at.y, ...EMPTY_GROUP_SIZE }];
  });
};

/**
 * Where the frame of each of `groups` that has no member among `nodes` is
 * drawn: where `stored` has it, or else where ELK put its box (`auto`),
 * moved clear of `nodes` and of the empty frames placed before it. A group
 * ELK has not laid out yet is not drawn.
 */
export const placeEmptyGroups = (
  groups: readonly LayoutGroup[],
  auto: readonly LaidOutGroup[],
  nodes: readonly LaidOutNode[],
  stored: ReadonlyMap<GroupId, Point>,
): ReadonlyMap<GroupId, Point> => {
  const drawn = new Set(nodes.map(({ id }) => id));

  const autoAt = new Map(auto.map((group) => [group.id, group]));

  const mut_placed = new Map<GroupId, Point>();

  for (const { id, members } of groups) {
    if (members.some((member) => drawn.has(member))) {
      continue;
    }

    const at = stored.get(id);

    if (at !== undefined) {
      mut_placed.set(id, at);

      continue;
    }

    const box = autoAt.get(id);

    if (box === undefined) {
      continue;
    }

    const others: readonly Bounds[] = [
      ...nodes,
      ...Array.from(mut_placed.values(), (point) => ({
        ...point,
        ...EMPTY_GROUP_SIZE,
      })),
    ] as const;

    const { x, y } = clearOf(
      { x: box.x, y: box.y, ...EMPTY_GROUP_SIZE },
      others,
      PLACEMENT_GAP,
    );

    mut_placed.set(id, { x, y });
  }

  return mut_placed;
};

/**
 * The group a node dropped as `box` goes into: the last of `drawn` — the
 * one drawn on top — that has the centre of the box inside it, or none.
 */
export const dropTarget = (
  drawn: readonly GroupFrame[],
  box: Bounds,
): GroupId | undefined => {
  const cx = box.x + box.width / 2;

  const cy = box.y + box.height / 2;

  return drawn.findLast(
    (frame) =>
      frame.x <= cx &&
      cx <= frame.x + frame.width &&
      frame.y <= cy &&
      cy <= frame.y + frame.height,
  )?.id;
};

/** The frame round `nodes`, or none for none. */
export const frameAround = (nodes: readonly Bounds[]): Bounds | undefined => {
  if (!Arr.isNonEmpty(nodes)) {
    return undefined;
  }

  const minX = Math.min(...nodes.map(({ x }) => x));

  const minY = Math.min(...nodes.map(({ y }) => y));

  const maxX = Math.max(...nodes.map(({ x, width }) => x + width));

  const maxY = Math.max(...nodes.map(({ y, height }) => y + height));

  return {
    x: minX - GROUP_PADDING,
    y: minY - GROUP_HEADER,
    width: maxX - minX + 2 * GROUP_PADDING,
    height: maxY - minY + GROUP_HEADER + GROUP_PADDING,
  };
};

/** The top-left corner of each of `drawn`. */
export const framePositions = (
  drawn: readonly GroupFrame[],
): ReadonlyMap<GroupId, Point> =>
  new Map(drawn.map(({ id, x, y }) => [id, { x, y }]));

/** A group's frame, its top-left corner at `(x, y)`. */
export type GroupFrame = Readonly<{ id: GroupId; empty: boolean } & Bounds>;

export type GroupKey = `group:${string}`;

const GROUP_KEY_PREFIX = 'group:';

/** How wide a narrow character of a frame's title is drawn. */
const FRAME_TITLE_UNIT_WIDTH = 7;
