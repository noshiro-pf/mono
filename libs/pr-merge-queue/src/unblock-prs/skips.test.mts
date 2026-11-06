import type { SetAside } from 'pr-report-core';
import {
  newSkips,
  setAsideFailing,
  settleSkips,
  unannouncedSkips,
  withSkip,
} from './skips.mjs';
import type {
  OwnSetAsideComment,
  PullRequest,
  SkipRecord,
  SkipRecords,
} from './types.mjs';

describe(newSkips, () => {
  const none: SkipRecords = new Map<number, SkipRecord>();

  test('reports a pull request set aside for the first time', () => {
    assert.deepStrictEqual(newSkips(none, withSkip(none, skip())), [skip()]);
  });

  test('does not report a record that is still standing', () => {
    const standing = withSkip(none, skip());

    assert.deepStrictEqual(newSkips(standing, standing), []);

    // The detail is prose, and prose that changed is not a new state.
    assert.deepStrictEqual(
      newSkips(standing, withSkip(none, skip({ detail: 'reworded' }))),
      [],
    );
  });

  test('reports it again once the state it was reached in has changed', () => {
    const standing = withSkip(none, skip());

    for (const changed of [
      skip({ headSha: 'pushed' }),
      skip({ baseSha: 'moved' }),
      skip({ reason: 'push-failed' }),
    ]) {
      assert.deepStrictEqual(newSkips(standing, withSkip(none, changed)), [
        changed,
      ]);
    }
  });
});

describe(setAsideFailing, () => {
  // Taken up from a comment after a restart, a record has no `failedChecks`.
  test('names those set aside for a failure, whatever links their record holds', () => {
    const records = new Map<number, SkipRecord>([
      [1, skip({ number: 1, reason: 'checks-failed' })],
      [2, skip({ number: 2, reason: 'rebase-failed' })],
    ]);

    assert.deepStrictEqual(Array.from(setAsideFailing(records)), [1]);
  });
});

describe(unannouncedSkips, () => {
  const none: SkipRecords = new Map<number, SkipRecord>();

  const record = skip({ headSha: HEAD, baseSha: BASE });

  test('names a record whose comment was never written, or says otherwise', () => {
    // The worker holds it aside while the comment the skill reads does not:
    // each would leave it to the other until the comment is written.
    assert.deepStrictEqual(
      unannouncedSkips(withSkip(none, record), comments()),
      [record],
    );

    assert.deepStrictEqual(
      unannouncedSkips(
        withSkip(none, record),
        comments([7, { databaseId: 0, says: { kind: 'resolved' }, body: '' }]),
      ),
      [record],
    );

    assert.deepStrictEqual(
      unannouncedSkips(
        withSkip(none, record),
        comments([
          7,
          standingComment({
            setAside: { ...SET_ASIDE, reason: 'checks-failed' },
          }),
        ]),
      ),
      [record],
    );
  });

  test('passes over a record its comment says', () => {
    assert.deepStrictEqual(
      unannouncedSkips(
        withSkip(none, record),
        comments([7, standingComment()]),
      ),
      [],
    );
  });
});

describe(settleSkips, () => {
  const none: SkipRecords = new Map<number, SkipRecord>();

  test('resolves a comment whose head has moved', () => {
    assert.deepStrictEqual(
      settleSkips(
        none,
        comments([7, standingComment()]),
        [pullRequest(7, { headRefOid: PUSHED })],
        BASE,
      ),
      {
        skipped: none,
        resolved: [
          {
            number: 7,
            databaseId: 107,
            body: STANDING_BODY,
            setAside: SET_ASIDE,
            resolvedBy: 'pushed',
          },
        ],
        rebased: [],
      },
    );
  });

  test('resolves a comment whose base has moved, except for failed checks', () => {
    const settled = settleSkips(
      none,
      comments(
        [7, standingComment()],
        [
          8,
          standingComment({
            setAside: { ...SET_ASIDE, reason: 'checks-failed' },
          }),
        ],
      ),
      [pullRequest(7), pullRequest(8)],
      MOVED,
    );

    assert.deepStrictEqual(
      settled.resolved.map(({ number, resolvedBy }) => [number, resolvedBy]),
      [[7, 'base-moved']],
    );

    // The failed checks stand, and are taken up.
    assert.strictEqual(settled.skipped.get(8)?.reason, 'checks-failed');
  });

  test('keeps a rebase-failed comment that still conflicts, on the new base', () => {
    const settled = settleSkips(
      none,
      comments([7, standingComment()], [8, standingComment()]),
      [pullRequest(7), pullRequest(8)],
      MOVED,
      new Map<number, readonly string[]>([[7, ['a.txt']]]),
    );

    // The one whose conflict is gone is resolved as ever.
    assert.deepStrictEqual(
      settled.resolved.map(({ number, resolvedBy }) => [number, resolvedBy]),
      [[8, 'base-moved']],
    );

    assert.deepStrictEqual(
      settled.rebased.map(({ number, setAside, files }) => [
        number,
        setAside.baseSha,
        files,
      ]),
      [[7, MOVED, ['a.txt']]],
    );

    assert.strictEqual(settled.skipped.get(7)?.baseSha, MOVED);

    assert.isFalse(settled.skipped.has(8));

    // Nothing the cycle acted from reads as new, so nothing is written again.
    assert.deepStrictEqual(newSkips(settled.skipped, settled.skipped), []);

    assert.deepStrictEqual(
      unannouncedSkips(settled.skipped, comments([7, standingComment()])),
      [],
    );
  });

  test('moves a record this run still holds along with its comment', () => {
    const settled = settleSkips(
      withSkip(none, skip({ headSha: HEAD, baseSha: BASE })),
      comments([7, standingComment()]),
      [pullRequest(7)],
      MOVED,
      new Map<number, readonly string[]>([[7, ['a.txt']]]),
    );

    assert.strictEqual(settled.skipped.get(7)?.baseSha, MOVED);
  });

  test('a push or a retry still ends what still conflicts', () => {
    const pushed = settleSkips(
      none,
      comments([7, standingComment()]),
      [pullRequest(7, { headRefOid: PUSHED })],
      MOVED,
      new Map<number, readonly string[]>([[7, ['a.txt']]]),
    );

    assert.deepStrictEqual(
      pushed.resolved.map(({ resolvedBy }) => resolvedBy),
      ['pushed'],
    );

    assert.deepStrictEqual(pushed.rebased, []);

    const retried = settleSkips(
      none,
      comments([7, standingComment({ retry: true })]),
      [pullRequest(7)],
      MOVED,
      new Map<number, readonly string[]>([[7, ['a.txt']]]),
    );

    assert.deepStrictEqual(
      retried.resolved.map(({ resolvedBy }) => resolvedBy),
      ['base-moved'],
    );

    assert.deepStrictEqual(retried.rebased, []);
  });

  test('only rebase-failed is kept', () => {
    const settled = settleSkips(
      none,
      comments([
        7,
        standingComment({ setAside: { ...SET_ASIDE, reason: 'push-failed' } }),
      ]),
      [pullRequest(7)],
      MOVED,
      new Map<number, readonly string[]>([[7, ['a.txt']]]),
    );

    assert.deepStrictEqual(
      settled.resolved.map(({ resolvedBy }) => resolvedBy),
      ['base-moved'],
    );
  });

  test('drops the record of a pull request a person asked to retry', () => {
    const held = withSkip(none, skip({ headSha: HEAD, baseSha: BASE }));

    const settled = settleSkips(
      held,
      comments([7, standingComment({ retry: true })]),
      [pullRequest(7)],
      BASE,
    );

    assert.isFalse(settled.skipped.has(7));

    assert.deepStrictEqual(
      settled.resolved.map(({ number, resolvedBy }) => [number, resolvedBy]),
      [[7, 'retry']],
    );
  });

  test('takes up a record an earlier run left standing', () => {
    const settled = settleSkips(
      none,
      comments([7, standingComment()]),
      [pullRequest(7)],
      BASE,
    );

    assert.deepStrictEqual(settled.resolved, []);

    assert.deepStrictEqual(
      [settled.skipped.get(7)?.reason, settled.skipped.get(7)?.headSha],
      ['rebase-failed', HEAD],
    );

    // Not new: the comment already says it, so nothing writes over it.
    assert.deepStrictEqual(newSkips(settled.skipped, settled.skipped), []);
  });

  test('keeps the record this run holds over the one its comment says', () => {
    const held = withSkip(
      none,
      skip({ headSha: HEAD, baseSha: BASE, detail: 'conflicts in a.mts' }),
    );

    assert.deepStrictEqual(
      settleSkips(
        held,
        comments([7, standingComment()]),
        [pullRequest(7)],
        BASE,
      ),
      { skipped: held, resolved: [], rebased: [] },
    );
  });

  test('leaves alone what is resolved, closed, or a reason it does not know', () => {
    assert.deepStrictEqual(
      settleSkips(
        none,
        comments(
          [7, { databaseId: 107, says: { kind: 'resolved' }, body: '' }],
          [8, standingComment()],
          [
            9,
            standingComment({ setAside: { ...SET_ASIDE, reason: 'renamed' } }),
          ],
        ),
        [pullRequest(7), pullRequest(9)],
        BASE,
      ),
      { skipped: none, resolved: [], rebased: [] },
    );
  });
});

const HEAD = 'c'.repeat(40);

const PUSHED = 'd'.repeat(40);

const BASE = 'a'.repeat(40);

const MOVED = 'b'.repeat(40);

const SET_ASIDE: SetAside = {
  reason: 'rebase-failed',
  headSha: HEAD,
  baseSha: BASE,
} as const;

const standingComment = (
  overrides: Partial<Readonly<{ setAside: SetAside; retry: boolean }>> = {},
): OwnSetAsideComment =>
  ({
    databaseId: 0,
    says: {
      kind: 'standing',
      setAside: overrides.setAside ?? SET_ASIDE,
      retry: overrides.retry ?? false,
    },
    body: STANDING_BODY,
  }) as const;

const STANDING_BODY = 'the comment as written';

/** Each pull request's comment, with a database id of 100 more than its number. */
const comments = (
  ...entries: readonly (readonly [number, OwnSetAsideComment])[]
): ReadonlyMap<number, OwnSetAsideComment> =>
  new Map(
    entries.map(
      ([number, comment]) =>
        [number, { ...comment, databaseId: 100 + number }] as const,
    ),
  );

const pullRequest = (
  number: number,
  fields: Partial<PullRequest> = {},
): PullRequest =>
  ({
    number,
    id: `PR_${number}`,
    title: `pull request #${number}`,
    body: '',
    state: 'OPEN',
    headRefName: `feature/${number}`,
    headRefOid: HEAD,
    baseRefName: 'main',
    isCrossRepository: false,
    isDraft: false,
    mergeStateStatus: 'BEHIND',
    autoMergeRequest: {},
    labels: [{ name: 'merge-queued' }],
    ...fields,
  }) as const;

const skip = (overrides: Partial<SkipRecord> = {}): SkipRecord =>
  ({
    number: 7,
    headSha: 'head',
    baseSha: 'base',
    reason: 'rebase-failed',
    detail: 'rebase conflicts',
    ...overrides,
  }) as const;
