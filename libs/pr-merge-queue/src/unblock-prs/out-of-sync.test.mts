import { isoSeconds } from '../lib/index.mjs';
import { OUT_OF_SYNC_GRACE_MS } from './constants.mjs';
import {
  observeAtSurvey,
  observeOutOfSync,
  outOfSyncVerdict,
  pruneOutOfSync,
} from './out-of-sync.mjs';
import type {
  OutOfSync,
  OutOfSyncSighting,
  PullRequest,
  SkipRecord,
  SkipRecords,
} from './types.mjs';

const HEAD = 'a'.repeat(40);

const BRANCH = 'e'.repeat(40);

const T0 = 1_000_000;

const none: OutOfSync = new Map<number, OutOfSyncSighting>();

const seenAt = (sinceEpochMs: number): OutOfSync =>
  new Map<number, OutOfSyncSighting>([
    [7, { headSha: HEAD, branchSha: BRANCH, sinceEpochMs }],
  ]);

const sighting = { number: 7, headSha: HEAD, branchSha: BRANCH } as const;

describe(observeOutOfSync, () => {
  // A branch that moved a moment ago is most likely someone else's push that
  // GitHub has yet to take in; the first sighting is not a verdict.
  test('records a first sighting without calling it persistent', () => {
    assert.deepStrictEqual(observeOutOfSync(none, sighting, T0), {
      seen: seenAt(T0),
      sinceEpochMs: T0,
      persisted: false,
    });
  });

  test('keeps the first sighting while the grace has not run out', () => {
    assert.deepStrictEqual(
      observeOutOfSync(seenAt(T0), sighting, T0 + OUT_OF_SYNC_GRACE_MS - 1),
      { seen: seenAt(T0), sinceEpochMs: T0, persisted: false },
    );
  });

  test('calls the same mismatch persistent once the grace has run out', () => {
    assert.deepStrictEqual(
      observeOutOfSync(seenAt(T0), sighting, T0 + OUT_OF_SYNC_GRACE_MS),
      { seen: seenAt(T0), sinceEpochMs: T0, persisted: true },
    );
  });

  // Someone pushing again and again is a writer at work, not GitHub missing one
  // push.
  test('starts over when the branch is somewhere else', () => {
    const later = T0 + OUT_OF_SYNC_GRACE_MS;

    const other = 'f'.repeat(40);

    assert.deepStrictEqual(
      observeOutOfSync(seenAt(T0), { ...sighting, branchSha: other }, later),
      {
        seen: new Map<number, OutOfSyncSighting>([
          [7, { headSha: HEAD, branchSha: other, sinceEpochMs: later }],
        ]),
        sinceEpochMs: later,
        persisted: false,
      },
    );
  });

  test('starts over when GitHub reports another head', () => {
    const later = T0 + OUT_OF_SYNC_GRACE_MS;

    const other = 'b'.repeat(40);

    assert.deepStrictEqual(
      observeOutOfSync(seenAt(T0), { ...sighting, headSha: other }, later),
      {
        seen: new Map<number, OutOfSyncSighting>([
          [7, { headSha: other, branchSha: BRANCH, sinceEpochMs: later }],
        ]),
        sinceEpochMs: later,
        persisted: false,
      },
    );
  });

  test('leaves the other pull requests’ sightings alone', () => {
    const both: OutOfSync = new Map<number, OutOfSyncSighting>([
      ...seenAt(T0),
      [8, { headSha: HEAD, branchSha: BRANCH, sinceEpochMs: T0 }],
    ]);

    assert.deepStrictEqual(observeOutOfSync(both, sighting, T0 + 1).seen, both);
  });
});

describe(outOfSyncVerdict, () => {
  const pr = { number: 7, headRefOid: HEAD } as const;

  const BASE = 'c'.repeat(40);

  test('says what is out of sync, and sets nothing aside at first', () => {
    const verdict = outOfSyncVerdict(none, pr, BRANCH, {
      baseSha: BASE,
      nowEpochMs: T0,
    });

    assert.deepStrictEqual(verdict.seen, seenAt(T0));

    assert.strictEqual(
      verdict.mismatch,
      `its branch is at eeeeeeeeee while GitHub shows aaaaaaaaaa as its head, and has been since ${isoSeconds(T0)}`,
    );

    assert.isUndefined(verdict.setAside);
  });

  test('sets it aside, at the head GitHub shows, once the grace has run out', () => {
    assert.deepStrictEqual(
      outOfSyncVerdict(seenAt(T0), pr, BRANCH, {
        baseSha: BASE,
        nowEpochMs: T0 + OUT_OF_SYNC_GRACE_MS,
      }).setAside,
      {
        number: 7,
        headSha: HEAD,
        baseSha: BASE,
        reason: 'head-out-of-sync',
        detail: `its branch is at eeeeeeeeee while GitHub shows aaaaaaaaaa as its head, and has been since ${isoSeconds(T0)} — a push GitHub never took in, so nothing can rebase or merge it until the branch is pushed again`,
      },
    );
  });
});

describe(observeAtSurvey, () => {
  const BASE = 'c'.repeat(40);

  const found = [
    { pr: { ...pullRequest(7, HEAD), labels: [queued] }, branchAt: BRANCH },
  ] as const;

  const noSkips: SkipRecords = new Map<number, SkipRecord>();

  // The survey reads the branch of every armed pull request GitHub shows as
  // UNKNOWN, so one far down the queue is seen as much as the next candidate,
  // and the sighting is what lets the next survey stop waiting on it.
  test('records a first sighting, and sets nothing aside', () => {
    const observed = observeAtSurvey(none, noSkips, found, {
      baseSha: BASE,
      nowEpochMs: T0,
    });

    assert.deepStrictEqual(observed.seen, seenAt(T0));

    assert.deepStrictEqual(observed.skipped, noSkips);

    assert.deepStrictEqual(observed.notes, [
      `#7: its branch is at eeeeeeeeee while GitHub shows aaaaaaaaaa as its head, and has been since ${isoSeconds(T0)}`,
    ]);
  });

  test('sets it aside once the same mismatch has lasted the grace', () => {
    const at = {
      baseSha: BASE,
      nowEpochMs: T0 + OUT_OF_SYNC_GRACE_MS,
    } as const;

    const { setAside } = outOfSyncVerdict(seenAt(T0), found[0].pr, BRANCH, at);

    assert.isDefined(setAside);

    assert.deepStrictEqual(observeAtSurvey(seenAt(T0), noSkips, found, at), {
      seen: seenAt(T0),
      skipped: new Map<number, SkipRecord>([[7, setAside]]),
      notes: [`#7: ${setAside.detail}`],
    });
  });

  // A bot's own armed pull request, say: not the queue's, so nothing here
  // comments on it, but the next survey need not wait on it either.
  test('only records one not labelled merge-queued', () => {
    const at = {
      baseSha: BASE,
      nowEpochMs: T0 + OUT_OF_SYNC_GRACE_MS,
    } as const;

    const observed = observeAtSurvey(
      seenAt(T0),
      noSkips,
      [{ pr: pullRequest(7, HEAD), branchAt: BRANCH }],
      at,
    );

    assert.deepStrictEqual(observed, {
      seen: seenAt(T0),
      skipped: noSkips,
      notes: [],
    });
  });

  // Already set aside at that head — by this run, or by an earlier one whose
  // comment was read back after a restart — so there is nothing to observe.
  test('leaves one already set aside out of sync at that head alone', () => {
    const skipped: SkipRecords = new Map<number, SkipRecord>([
      [
        7,
        {
          number: 7,
          headSha: HEAD,
          baseSha: BASE,
          reason: 'head-out-of-sync',
          detail: 'set aside by an earlier run, as its comment says',
        },
      ],
    ]);

    assert.deepStrictEqual(
      observeAtSurvey(none, skipped, found, {
        baseSha: BASE,
        nowEpochMs: T0,
      }),
      { seen: none, skipped, notes: [] },
    );
  });
});

describe(pruneOutOfSync, () => {
  test('keeps a sighting while GitHub still reports the same head', () => {
    assert.deepStrictEqual(
      pruneOutOfSync(seenAt(T0), [pullRequest(7, HEAD)]),
      seenAt(T0),
    );
  });

  // GitHub took in a push: whatever was out of sync is not any more.
  test('drops a sighting once GitHub reports another head', () => {
    assert.deepStrictEqual(
      pruneOutOfSync(seenAt(T0), [pullRequest(7, 'b'.repeat(40))]),
      none,
    );
  });

  test('drops a sighting of a pull request that is gone', () => {
    assert.deepStrictEqual(
      pruneOutOfSync(seenAt(T0), [pullRequest(8, HEAD)]),
      none,
    );
  });
});

const queued = { name: 'merge-queued' } as const;

const pullRequest = (number: number, headRefOid: string): PullRequest =>
  ({
    number,
    id: `PR_${number}`,
    title: `pull request #${number}`,
    body: '',
    state: 'OPEN',
    headRefName: `feature/${number}`,
    headRefOid,
    baseRefName: 'main',
    isCrossRepository: false,
    isDraft: false,
    mergeStateStatus: 'UNKNOWN',
    autoMergeRequest: {},
    labels: [],
  }) as const;
