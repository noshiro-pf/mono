import {
  BLOCKS_RELEASE_LABEL,
  MERGE_QUEUED_LABEL,
  PRIORITY_HIGH_LABEL,
  PRIORITY_LOW_LABEL,
  SKIP_CI_LABEL,
} from './labels.mjs';
import {
  orderCandidates,
  queueGraph,
  queueStanding,
  withReviewHold,
  type QueueContext,
  type QueueFacts,
  type QueueGraphMember,
} from './queue-order.mjs';
import type { QueueOwner } from './queue-owner.mjs';

describe(queueGraph, () => {
  test('reads the declared order and the stack together, and the cycles in them', () => {
    const graph = queueGraph(
      [
        member({ number: 1, body: 'Merge-After: #3' }),
        member({ number: 2, baseRef: 'feature/1' }),
        member({ number: 3, body: 'Merge-After: #1' }),
      ],
      'main',
    );

    assert.deepStrictEqual(
      graph.stackParents,
      new Map<number, number>([[2, 1]]),
    );

    assert.deepStrictEqual(
      graph.dependencies,
      new Map<number, readonly number[]>([
        [1, [3]],
        [2, [1]],
        [3, [1]],
      ]),
    );

    assert.deepStrictEqual(graph.cycles, [[1, 3]]);
  });

  test('reads nothing the version pull request declares', () => {
    assert.deepStrictEqual(
      queueGraph(
        [
          member({
            number: 1,
            headRef: 'changeset-release/main',
            body: 'Merge-After: #2',
          }),
          member({ number: 2 }),
        ],
        'main',
      ).dependencies.get(1),
      [],
    );
  });

  test('a pull request also waits for what the issues it closes start after', () => {
    const graph = queueGraph(
      [
        member({ number: 1, closes: [11] }),
        member({ number: 2, closes: [12] }),
        member({ number: 3, body: 'Merge-After: #1' }),
      ],
      'main',
      new Map<number, readonly number[]>([
        [11, [12]],
        [12, [3]],
      ]),
    );

    assert.deepStrictEqual(
      graph.dependencies,
      new Map<number, readonly number[]>([
        [1, [2]],
        [2, [3]],
        [3, [1]],
      ]),
    );

    assert.deepStrictEqual(
      graph.inherited,
      new Map<number, readonly number[]>([
        [1, [2]],
        [2, [3]],
        [3, []],
      ]),
    );

    // The inherited edges close the loop the declared one opens.
    assert.deepStrictEqual(graph.cycles, [[1, 2, 3]]);
  });

  test('lists what holds the release', () => {
    assert.deepStrictEqual(
      queueGraph(
        [
          member({
            number: 1,
            labels: [BLOCKS_RELEASE_LABEL],
            isDraft: true,
          }),
          member({ number: 2 }),
        ],
        'main',
      ).releaseBlockers,
      [{ number: 1, isDraft: true }],
    );
  });
});

describe(queueStanding, () => {
  test('passes over what never asked', () => {
    assert.deepStrictEqual(
      queueStanding(facts({ number: 1, labels: [] }), context()),
      { kind: 'ignore' },
    );
  });

  test('says why a queued draft cannot be acted on', () => {
    assert.deepStrictEqual(
      queueStanding(facts({ number: 1, isDraft: true }), context()),
      { kind: 'unactionable', reason: 'draft' },
    );
  });

  test('leaves one a skill or a person owns to them', () => {
    const owner = { owner: 'skill', reason: 'set aside' } as const;

    assert.deepStrictEqual(
      queueStanding(
        facts({ number: 1 }),
        context({ owners: new Map<number, QueueOwner>([[1, owner]]) }),
      ),
      { kind: 'owned', owner },
    );
  });

  test('waits for the layer below', () => {
    assert.deepStrictEqual(
      queueStanding(
        facts({ number: 2, baseRef: 'feature/1' }),
        context({ stackParents: new Map<number, number>([[2, 1]]) }),
      ),
      { kind: 'stacked', on: 1, cyclic: false },
    );
  });

  test('asks for the native stack of one without auto-merge, and passes over one in it', () => {
    const pr = facts({ number: 1, autoMerge: false });

    assert.deepStrictEqual(queueStanding(pr, context()), {
      kind: 'needs',
      read: 'nativeStack',
    });

    const entry = { stack: 9, position: 1, size: 2 } as const;

    assert.deepStrictEqual(
      queueStanding(pr, context(), { nativeStack: entry }),
      { kind: 'native-stack', entry },
    );

    assert.deepStrictEqual(
      queueStanding(pr, context(), { nativeStack: 'none' }),
      { kind: 'candidate' },
    );
  });

  test('takes one paused by skip-ci, whatever its merge state, once what it waits for has merged', () => {
    const pr = facts({
      number: 2,
      labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
      mergeState: 'BLOCKED',
    });

    assert.deepStrictEqual(queueStanding(pr, context()), {
      kind: 'candidate',
    });

    assert.deepStrictEqual(
      queueStanding(
        pr,
        context({
          dependencies: new Map<number, readonly number[]>([[2, [1]]]),
          openNumbers: new Set<number>([1, 2]),
        }),
      ),
      { kind: 'waiting', on: [1], cyclic: false },
    );
  });

  test('reads the checks of one GitHub calls blocked', () => {
    const pr = facts({ number: 1, mergeState: 'BLOCKED' });

    assert.deepStrictEqual(queueStanding(pr, context()), {
      kind: 'needs',
      read: 'checksFailed',
    });

    assert.deepStrictEqual(
      queueStanding(pr, context(), { checksFailed: true }),
      { kind: 'failing' },
    );

    assert.deepStrictEqual(
      queueStanding(pr, context(), { checksFailed: false }),
      { kind: 'in-flight' },
    );
  });

  test('watches what GitHub calls clean', () => {
    assert.deepStrictEqual(
      queueStanding(facts({ number: 1, mergeState: 'CLEAN' }), context()),
      { kind: 'in-flight' },
    );
  });

  test('holds the release for blocks-release, then for a branch built before the tip', () => {
    const release = facts({
      number: 1,
      headRef: 'changeset-release/main',
      labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
    });

    assert.deepStrictEqual(
      queueStanding(
        release,
        context({ releaseBlockers: [{ number: 2, isDraft: false }] }),
      ),
      { kind: 'release-blocked', by: [{ number: 2, isDraft: false }] },
    );

    assert.deepStrictEqual(queueStanding(release, context()), {
      kind: 'needs',
      read: 'rebuiltOnTip',
    });

    assert.deepStrictEqual(
      queueStanding(release, context(), { rebuiltOnTip: false }),
      { kind: 'release-stale' },
    );

    assert.deepStrictEqual(
      queueStanding(release, context(), { rebuiltOnTip: true }),
      { kind: 'candidate' },
    );
  });

  // Otherwise it would hold itself for as long as it existed, with nothing
  // able to take the label off — a `Merge-After` cycle by another name.
  test('never holds the release by its own label', () => {
    const release = facts({
      number: 1,
      headRef: 'changeset-release/main',
      labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL, BLOCKS_RELEASE_LABEL],
    });

    assert.deepStrictEqual(
      queueStanding(
        release,
        context({ releaseBlockers: [{ number: 1, isDraft: false }] }),
        { rebuiltOnTip: true },
      ),
      { kind: 'candidate' },
    );
  });
});

describe(withReviewHold, () => {
  const held = { kind: 'held', reason: 'waiting for @owner' } as const;

  test('holds a candidate', () => {
    assert.deepStrictEqual(
      withReviewHold({ kind: 'candidate' }, 'BEHIND', held),
      { kind: 'held', reason: 'waiting for @owner' },
    );
  });

  test('leaves one GitHub calls mergeable to its checks', () => {
    assert.deepStrictEqual(
      withReviewHold({ kind: 'in-flight' }, 'CLEAN', held),
      { kind: 'in-flight' },
    );
  });

  test('leaves one only a bypass merges in the running', () => {
    assert.deepStrictEqual(
      withReviewHold({ kind: 'candidate' }, 'BEHIND', {
        kind: 'bypass',
        reason: 'only its author owns it',
      }),
      { kind: 'candidate' },
    );
  });
});

describe(orderCandidates, () => {
  test('takes the lowest number first', () => {
    assert.deepStrictEqual(
      order([facts({ number: 3 }), facts({ number: 1 })]),
      [1, 3],
    );
  });

  test('puts what GitHub calls conflicting after the rest, and the release after that', () => {
    assert.deepStrictEqual(
      order([
        facts({ number: 1, headRef: 'changeset-release/main' }),
        facts({ number: 2, mergeState: 'DIRTY' }),
        facts({ number: 3 }),
      ]),
      [3, 2, 1],
    );
  });

  // Last of all, the release included: the release is known to be able to
  // merge, and this one is known to have sat green without merging.
  test('puts a pull request that sat green without merging last', () => {
    assert.deepStrictEqual(
      order(
        [
          facts({ number: 1 }),
          facts({ number: 2, headRef: 'changeset-release/main' }),
          facts({ number: 3, mergeState: 'DIRTY' }),
          facts({ number: 4 }),
        ],
        [1],
      ),
      [4, 3, 2, 1],
    );
  });

  // Priority comes before every rank but the demotion, the release included:
  // a release can be declared urgent, and a change declared able to wait
  // goes out in the release after.
  test('takes priority:high first and priority:low last, before what sat green', () => {
    assert.deepStrictEqual(
      order(
        [
          facts({
            number: 1,
            labels: [MERGE_QUEUED_LABEL, PRIORITY_LOW_LABEL],
          }),
          facts({ number: 2 }),
          facts({ number: 3, headRef: 'changeset-release/main' }),
          facts({
            number: 4,
            labels: [MERGE_QUEUED_LABEL, PRIORITY_HIGH_LABEL],
            mergeState: 'DIRTY',
          }),
          facts({
            number: 5,
            labels: [MERGE_QUEUED_LABEL, PRIORITY_HIGH_LABEL],
          }),
          facts({
            number: 6,
            labels: [MERGE_QUEUED_LABEL, PRIORITY_HIGH_LABEL],
          }),
        ],
        [6],
      ),
      [5, 4, 2, 3, 1, 6],
    );
  });

  test('reads both priority labels at once as neither', () => {
    assert.deepStrictEqual(
      order([
        facts({ number: 1, labels: [MERGE_QUEUED_LABEL, PRIORITY_LOW_LABEL] }),
        facts({
          number: 2,
          labels: [MERGE_QUEUED_LABEL, PRIORITY_HIGH_LABEL, PRIORITY_LOW_LABEL],
        }),
        facts({ number: 3 }),
      ]),
      [2, 3, 1],
    );
  });
});

const order = (
  candidates: readonly QueueFacts[],
  demoted: readonly number[] = [],
): readonly number[] =>
  orderCandidates(candidates, (candidate) => candidate, {
    defaultBranch: 'main',
    demoted: (candidate) => demoted.includes(candidate.number),
  }).map(({ number }) => number);

const facts = (
  fields: Partial<QueueFacts> & Readonly<{ number: number }>,
): QueueFacts =>
  ({
    state: 'OPEN',
    labels: [MERGE_QUEUED_LABEL],
    isDraft: false,
    headRef: `feature/${fields.number}`,
    baseRef: 'main',
    mergeState: 'BEHIND',
    autoMerge: true,
    ...fields,
  }) as const;

const member = (
  fields: Partial<QueueGraphMember> & Readonly<{ number: number }>,
): QueueGraphMember =>
  ({
    body: '',
    isDraft: false,
    labels: [MERGE_QUEUED_LABEL],
    headRef: `feature/${fields.number}`,
    baseRef: 'main',
    fromFork: false,
    ...fields,
  }) as const;

const context = (fields: Partial<QueueContext> = {}): QueueContext =>
  ({
    defaultBranch: 'main',
    stackParents: new Map<number, number>(),
    dependencies: new Map<number, readonly number[]>(),
    inherited: new Map<number, readonly number[]>(),
    cycles: [],
    cyclic: new Set<number>(),
    openNumbers: new Set<number>(),
    releaseBlockers: [],
    owners: new Map<number, QueueOwner>(),
    ...fields,
  }) as const;
