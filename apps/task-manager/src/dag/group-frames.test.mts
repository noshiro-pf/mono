import {
  asGroupId,
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  type DomainState,
  type GraphNodeId,
  type Group,
  type GroupId,
} from '../domain/index.mjs';
import { PLACEMENT_GAP } from './dag-layout.mjs';
import type { LaidOutGroup, LaidOutNode } from './graph-layout.mjs';
import {
  dropTarget,
  EMPTY_GROUP_SIZE,
  frameTitle,
  GROUP_HEADER,
  GROUP_PADDING,
  groupFrames,
  groupIdOfKey,
  groupKey,
  groupMembership,
  groupsByMember,
  placeEmptyGroups,
  withMemberMoved,
  type GroupFrame,
} from './group-frames.mjs';
import type { Point } from './pan-zoom.mjs';

const g = asGroupId('g');

const h = asGroupId('h');

const groupOf = (id: Group['id']): Group =>
  ({ id, title: id, createdAt: 0, updatedAt: 0 }) as const;

/** An empty group's box, as ELK lays it out. */
const box = (id: Group['id'], x: number, y: number): LaidOutGroup =>
  ({ id, members: [], x, y, ...EMPTY_GROUP_SIZE }) as const;

/** A frame 200 wide and high. */
const frame = (id: Group['id'], x: number, y: number): GroupFrame =>
  ({ id, empty: false, x, y, width: 200, height: 200 }) as const;

const nodeA: LaidOutNode = {
  id: 'task:a',
  kind: 'task',
  x: 100,
  y: 100,
  width: 100,
  height: 50,
} as const;

const nodeB: LaidOutNode = {
  id: 'task:b',
  kind: 'task',
  x: 300,
  y: 200,
  width: 100,
  height: 50,
} as const;

describe(groupKey, () => {
  test('is read back by groupIdOfKey, which reads no node’s id', () => {
    assert.strictEqual(groupIdOfKey(groupKey(g)), g);

    assert.isUndefined(groupIdOfKey('task:a'));

    assert.isUndefined(groupIdOfKey('group:'));
  });
});

describe(frameTitle, () => {
  test('keeps a title that fits and cuts one that does not', () => {
    assert.strictEqual(frameTitle('実装', 168), '実装');

    const cut = frameTitle('とても長いグループの名前です', 120);

    assert.notStrictEqual(cut, 'とても長いグループの名前です');

    assert.isTrue(cut.endsWith('…'));
  });
});

describe(groupMembership, () => {
  test('lists the shown nodes of each group, a node of a group that is gone in none', () => {
    const state: DomainState = {
      tasks: [
        {
          ...createTask({ id: asTaskId('a'), title: 'A', now: 0 }),
          groupId: g,
        },
        {
          ...createTask({ id: asTaskId('b'), title: 'B', now: 0 }),
          groupId: g,
        },
        {
          ...createTask({ id: asTaskId('c'), title: 'C', now: 0 }),
          groupId: asGroupId('gone'),
        },
        createTask({ id: asTaskId('d'), title: 'D', now: 0 }),
      ],
      milestones: [
        {
          ...createMilestone({ id: asMilestoneId('m'), title: 'M', now: 0 }),
          groupId: h,
        },
      ],
    } as const;

    assert.deepStrictEqual(
      groupMembership(
        state,
        [groupOf(g), groupOf(h)],
        new Set<GraphNodeId>(['task:b']),
      ),
      [
        { id: g, members: ['task:a'] },
        { id: h, members: ['milestone:m'] },
      ],
    );
  });
});

describe(groupsByMember, () => {
  test('maps each member to its group', () => {
    assert.deepStrictEqual(
      groupsByMember([
        { id: g, members: ['task:a', 'task:b'] },
        { id: h, members: [] },
      ]),
      new Map<GraphNodeId, Group['id']>([
        ['task:a', g],
        ['task:b', g],
      ]),
    );
  });
});

describe(withMemberMoved, () => {
  test('takes the node out of its group and puts it last in the one it goes into', () => {
    const groups = [
      { id: g, members: ['task:a', 'task:b'] },
      { id: h, members: ['task:c'] },
    ] as const;

    assert.deepStrictEqual(withMemberMoved(groups, 'task:a', h), [
      { id: g, members: ['task:b'] },
      { id: h, members: ['task:c', 'task:a'] },
    ]);

    assert.deepStrictEqual(withMemberMoved(groups, 'task:a', undefined), [
      { id: g, members: ['task:b'] },
      { id: h, members: ['task:c'] },
    ]);
  });
});

describe(groupFrames, () => {
  test('draws a frame round the drawn members, with room above for the title', () => {
    assert.deepStrictEqual(
      groupFrames(
        [nodeA, nodeB],
        [{ id: g, members: ['task:a', 'task:b', 'task:hidden'] }],
        new Map<GroupId, Point>(),
      ),
      [
        {
          id: g,
          empty: false,
          x: 100 - GROUP_PADDING,
          y: 100 - GROUP_HEADER,
          width: 300 + 2 * GROUP_PADDING,
          height: 150 + GROUP_HEADER + GROUP_PADDING,
        },
      ],
    );
  });

  test('draws a group with no member drawn empty where it is placed, or not at all', () => {
    assert.deepStrictEqual(
      groupFrames(
        [nodeA],
        [
          { id: g, members: ['task:hidden'] },
          { id: h, members: [] },
        ],
        new Map<GroupId, Point>([[g, { x: 5, y: 6 }]]),
      ),
      [{ id: g, empty: true, x: 5, y: 6, ...EMPTY_GROUP_SIZE }],
    );
  });
});

describe(placeEmptyGroups, () => {
  test('places an empty group where it was, or where ELK put it', () => {
    assert.deepStrictEqual(
      placeEmptyGroups(
        [
          { id: g, members: [] },
          { id: h, members: [] },
        ],
        [box(g, 0, 0), box(h, 600, 600)],
        [nodeA],
        new Map<GroupId, Point>([[g, { x: 10, y: 20 }]]),
      ),
      new Map<GroupId, Point>([
        [g, { x: 10, y: 20 }],
        [h, { x: 600, y: 600 }],
      ]),
    );
  });

  test('moves ELK’s box clear of the nodes, and leaves alone a group with a member drawn or no box', () => {
    const placed = placeEmptyGroups(
      [
        { id: g, members: [] },
        { id: h, members: ['task:a'] },
        { id: asGroupId('new'), members: [] },
      ],
      [box(g, 100, 100)],
      [nodeA],
      new Map<GroupId, Point>(),
    );

    assert.deepStrictEqual(Array.from(placed.keys()), [g]);

    const at = placed.get(g);

    assert.isDefined(at);

    const clear =
      at.x + EMPTY_GROUP_SIZE.width + PLACEMENT_GAP <= nodeA.x ||
      at.x >= nodeA.x + nodeA.width + PLACEMENT_GAP ||
      at.y + EMPTY_GROUP_SIZE.height + PLACEMENT_GAP <= nodeA.y ||
      at.y >= nodeA.y + nodeA.height + PLACEMENT_GAP;

    assert.isTrue(clear);
  });
});

describe(dropTarget, () => {
  test('is the frame the centre of the box is in, the last one drawn on a tie', () => {
    const drawn = [frame(g, 0, 0), frame(h, 100, 100)] as const;

    assert.strictEqual(
      dropTarget(drawn, { x: 0, y: 0, width: 20, height: 20 }),
      g,
    );

    assert.strictEqual(
      dropTarget(drawn, { x: 140, y: 140, width: 20, height: 20 }),
      h,
    );

    assert.isUndefined(
      dropTarget(drawn, { x: 400, y: 0, width: 20, height: 20 }),
    );

    // Its corner in the frame, its centre not.
    assert.isUndefined(
      dropTarget([frame(g, 0, 0)], { x: 190, y: 190, width: 40, height: 40 }),
    );
  });
});
