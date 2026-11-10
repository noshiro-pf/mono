import { Result } from 'ts-data-forge';
import { PullRequestLabel } from '../conventions/index.mjs';
import type { NativeStackEntry, Read, ReadError } from '../snapshot/index.mjs';
import {
  orderCandidates,
  queueStanding,
  withReviewHold,
  type OrderFacts,
  type QueueStanding,
  type StandingContext,
  type StandingFacts,
} from './standing.mjs';

const BLOCKS_RELEASE_LABEL = PullRequestLabel.blocksRelease;

const MERGE_QUEUED_LABEL = PullRequestLabel.mergeQueued;

const PRIORITY_HIGH_LABEL = PullRequestLabel.priorityHigh;

const PRIORITY_LOW_LABEL = PullRequestLabel.priorityLow;

const SKIP_CI_LABEL = PullRequestLabel.skipCi;

// v1's tests, ported: v1 asked for a fact it had not read (`needs`), where v2
// is handed every fact and answers `unread` for one that could not be read.

const readError = (what: string): ReadError =>
  ({
    kind: 'skipped',
    what,
    message: 'not read',
  }) as const;

const skipped = <A,>(what: string): Read<A> => Result.err(readError(what));

const unread = (what: string): QueueStanding =>
  ({
    kind: 'unread',
    error: readError(what),
  }) as const;

/** v1's call: the reads it was given, the rest unread. */
const standing = (
  pr: StandingFacts,
  queue: StandingContext,
  reads: Readonly<{
    nativeStack?: NativeStackEntry | 'none';
    rebuiltOnTip?: boolean;
    checksFailed?: boolean;
  }> = {},
): QueueStanding =>
  queueStanding(
    {
      ...pr,
      ...(reads.nativeStack === undefined
        ? {}
        : {
            nativeStack: Result.ok(
              reads.nativeStack === 'none' ? undefined : reads.nativeStack,
            ),
          }),
      ...(reads.rebuiltOnTip === undefined
        ? {}
        : { containsBaseTip: Result.ok(reads.rebuiltOnTip) }),
      ...(reads.checksFailed === undefined
        ? {}
        : { checksFailed: Result.ok(reads.checksFailed) }),
    },
    queue,
  );

describe(queueStanding, () => {
  test('passes over what never asked', () => {
    assert.deepStrictEqual(
      standing(facts({ number: 1, labels: [] }), context()),
      { kind: 'ignore' },
    );
  });

  test('says why a queued draft cannot be acted on', () => {
    assert.deepStrictEqual(
      standing(facts({ number: 1, isDraft: true }), context()),
      { kind: 'unactionable', reason: 'draft' },
    );
  });

  // A pull request set aside could otherwise be picked; and one picked without
  // what it inherits could merge before what an issue it closes waits for.
  test('is unread when its owner or, for a candidate, its inheritance is', () => {
    assert.deepStrictEqual(
      standing(facts({ number: 1, owner: skipped('owner') }), context()),
      unread('owner'),
    );

    assert.deepStrictEqual(
      standing(
        facts({ number: 1, inheritance: skipped('inheritance') }),
        context(),
      ),
      unread('inheritance'),
    );

    assert.deepStrictEqual(
      standing(
        facts({
          number: 1,
          mergeState: 'CLEAN',
          labels: [MERGE_QUEUED_LABEL],
          inheritance: skipped('inheritance'),
        }),
        context(),
      ),
      { kind: 'in-flight' },
    );
  });

  test('leaves one a skill or a person owns to them', () => {
    const owner = { owner: 'skill', reason: 'set aside' } as const;

    assert.deepStrictEqual(
      standing(facts({ number: 1, owner: Result.ok(owner) }), context()),
      {
        kind: 'owned',
        owner,
      },
    );
  });

  test('waits for the layer below', () => {
    assert.deepStrictEqual(
      standing(
        facts({ number: 2, baseRef: 'feature/1' }),
        context({ stackParents: new Map<number, number>([[2, 1]]) }),
      ),
      { kind: 'stacked', on: 1, cyclic: false },
    );
  });

  test('asks for the native stack of one without auto-merge, and passes over one in it', () => {
    const pr = facts({ number: 1, autoMerge: false });

    assert.deepStrictEqual(standing(pr, context()), unread('nativeStack'));

    const entry = { stack: 9, position: 1, size: 2 } as const;

    assert.deepStrictEqual(standing(pr, context(), { nativeStack: entry }), {
      kind: 'native-stack',
      entry,
    });

    assert.deepStrictEqual(standing(pr, context(), { nativeStack: 'none' }), {
      kind: 'candidate',
    });
  });

  test('takes one paused by skip-ci, whatever its merge state, once what it waits for has merged', () => {
    const pr = facts({
      number: 2,
      labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL],
      mergeState: 'BLOCKED',
    });

    assert.deepStrictEqual(standing(pr, context()), {
      kind: 'candidate',
    });

    assert.deepStrictEqual(
      standing(
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

    assert.deepStrictEqual(standing(pr, context()), unread('checksFailed'));

    assert.deepStrictEqual(standing(pr, context(), { checksFailed: true }), {
      kind: 'failing',
    });

    assert.deepStrictEqual(standing(pr, context(), { checksFailed: false }), {
      kind: 'in-flight',
    });
  });

  test('watches what GitHub calls clean', () => {
    assert.deepStrictEqual(
      standing(facts({ number: 1, mergeState: 'CLEAN' }), context()),
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
      standing(
        release,
        context({ releaseBlockers: [{ number: 2, isDraft: false }] }),
      ),
      { kind: 'release-blocked', by: [{ number: 2, isDraft: false }] },
    );

    assert.deepStrictEqual(
      standing(release, context()),
      unread('rebuiltOnTip'),
    );

    assert.deepStrictEqual(
      standing(release, context(), { rebuiltOnTip: false }),
      { kind: 'release-stale' },
    );

    assert.deepStrictEqual(
      standing(release, context(), { rebuiltOnTip: true }),
      { kind: 'candidate' },
    );
  });

  // Otherwise it would hold itself for as long as it existed, with nothing able
  // to take the label off — a `Merge-After` cycle by another name.
  test('never holds the release by its own label', () => {
    const release = facts({
      number: 1,
      headRef: 'changeset-release/main',
      labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL, BLOCKS_RELEASE_LABEL],
    });

    assert.deepStrictEqual(
      standing(
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
  // a release can be declared urgent, and a change declared able to wait goes
  // out in the release after.
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

  // Picked early, it is released, goes green and is set aside for a person, and
  // the cycle it took went to nothing that could merge on its own.
  test('puts one only a bypass merges with priority:low, unless labelled priority:high', () => {
    assert.deepStrictEqual(
      order(
        [
          facts({ number: 1 }),
          facts({
            number: 2,
            labels: [
              MERGE_QUEUED_LABEL,
              PRIORITY_HIGH_LABEL,
              PRIORITY_LOW_LABEL,
            ],
          }),
          facts({
            number: 3,
            labels: [MERGE_QUEUED_LABEL, PRIORITY_LOW_LABEL],
          }),
          facts({ number: 4, headRef: 'changeset-release/main' }),
          facts({ number: 5, mergeState: 'DIRTY' }),
          facts({ number: 6 }),
          facts({ number: 7 }),
          facts({
            number: 8,
            labels: [MERGE_QUEUED_LABEL, PRIORITY_HIGH_LABEL],
          }),
        ],
        [7],
        [1, 2, 7, 8],
      ),
      [8, 6, 5, 4, 1, 2, 3, 7],
    );
  });
});

const order = (
  candidates: readonly StandingFacts[],
  demoted: readonly number[] = [],
  bypass: readonly number[] = [],
): readonly number[] =>
  orderCandidates(candidates, (candidate) => candidate, {
    defaultBranch: 'main',
    demoted: (candidate) => demoted.includes(candidate.number),
    bypass: (candidate) => bypass.includes(candidate.number),
  }).map(({ number }) => number);

const facts = (
  fields: Partial<OrderFacts & StandingFacts> & Readonly<{ number: number }>,
): StandingFacts =>
  ({
    labels: [MERGE_QUEUED_LABEL],
    isDraft: false,
    headRef: `feature/${fields.number}`,
    baseRef: 'main',
    mergeState: 'BEHIND',
    autoMerge: true,
    nativeStack: skipped('nativeStack'),
    containsBaseTip: skipped('rebuiltOnTip'),
    checksFailed: skipped('checksFailed'),
    owner: Result.ok(undefined),
    inheritance: Result.ok([]),
    ...fields,
  }) as const;

const context = (fields: Partial<StandingContext> = {}): StandingContext =>
  ({
    defaultBranch: 'main',
    stackParents: new Map<number, number>(),
    dependencies: new Map<number, readonly number[]>(),
    inherited: new Map<number, readonly number[]>(),
    notStarted: new Map<number, readonly number[]>(),
    cycles: [],
    cyclic: new Set<number>(),
    openNumbers: new Set<number>(),
    inheritanceUnread: new Map<number, ReadError>(),
    releaseBlockers: [],
    ...fields,
  }) as const;
