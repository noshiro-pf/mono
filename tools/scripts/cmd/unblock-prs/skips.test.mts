import type { SetAside } from 'pr-report-core';
import { newSkips, settleSkips, withSkip } from './skips.mjs';
import type {
  OwnSetAsideComment,
  PullRequest,
  SkipRecord,
  SkipRecords,
} from './types.mjs';

describe(newSkips, () => {
  const none: SkipRecords = new Map();

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

describe(settleSkips, () => {
  const none: SkipRecords = new Map();

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
            setAside: SET_ASIDE,
            resolvedBy: 'pushed',
          },
        ],
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
      { skipped: held, resolved: [] },
    );
  });

  test('leaves alone what is resolved, closed, or a reason it does not know', () => {
    assert.deepStrictEqual(
      settleSkips(
        none,
        comments(
          [7, { databaseId: 107, says: { kind: 'resolved' } }],
          [8, standingComment()],
          [
            9,
            standingComment({ setAside: { ...SET_ASIDE, reason: 'renamed' } }),
          ],
        ),
        [pullRequest(7), pullRequest(9)],
        BASE,
      ),
      { skipped: none, resolved: [] },
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
  }) as const;

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
