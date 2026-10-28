// cspell:ignore unlabel

import type { ClaimComment } from './claim.mjs';
import {
  AUTO_REBASE_LABEL,
  MERGE_QUEUED_LABEL,
  SKIP_CI_LABEL,
} from './labels.mjs';
import {
  QUEUE_OWNERS,
  queueOwner,
  SET_ASIDE_REASONS,
  type QueueOwnerInput,
} from './queue-owner.mjs';
import type { SetAsideComment } from './set-aside.mjs';

const HEAD = 'a'.repeat(40);

const OLD_HEAD = 'b'.repeat(40);

const BASE = 'c'.repeat(40);

/** `2026-10-15T00:00:00Z`. */
const NOW = 1_792_022_400_000;

const queued: QueueOwnerInput = {
  number: 2267,
  labels: [MERGE_QUEUED_LABEL, SKIP_CI_LABEL, AUTO_REBASE_LABEL],
  isDraft: false,
  fromFork: false,
  headRef: 'fix/a-thing',
  headSha: HEAD,
  baseRef: 'main',
  defaultBranch: 'main',
  stackedOn: undefined,
  inCycle: false,
  setAside: undefined,
  claim: undefined,
  nowEpochMs: NOW,
} as const;

const standing = (
  reason: string,
  overrides: Partial<Readonly<{ headSha: string; retry: boolean }>> = {},
): SetAsideComment =>
  ({
    kind: 'standing',
    setAside: { reason, headSha: overrides.headSha ?? HEAD, baseSha: BASE },
    retry: overrides.retry ?? false,
  }) as const;

const claimedBy = (by: string, at = '2026-10-14T23:30:00Z'): ClaimComment =>
  ({
    kind: 'standing',
    claim: { headSha: HEAD, by, at },
  }) as const;

describe(queueOwner, () => {
  test('is undefined for a pull request outside the queue', () => {
    assert.isUndefined(queueOwner({ ...queued, labels: [] }));

    assert.isUndefined(queueOwner({ ...queued, labels: [AUTO_REBASE_LABEL] }));
  });

  test('is the worker’s while nothing is set aside', () => {
    assert.deepStrictEqual(queueOwner(queued), {
      owner: 'worker',
      reason: 'in the queue; the worker picks it in its turn',
    });
  });

  test('is the worker’s for an auto-rebase pull request under skip-ci', () => {
    assert.strictEqual(
      queueOwner({ ...queued, labels: [AUTO_REBASE_LABEL, SKIP_CI_LABEL] })
        ?.owner,
      'worker',
    );
  });

  test('is the skill’s for a rebase-failed or checks-failed set-aside at its head', () => {
    assert.deepStrictEqual(
      queueOwner({ ...queued, setAside: standing('rebase-failed') }),
      {
        owner: 'skill',
        reason: 'set aside `rebase-failed` at its head; the skill fixes it',
      },
    );

    assert.strictEqual(
      queueOwner({ ...queued, setAside: standing('checks-failed') })?.owner,
      'skill',
    );
  });

  test('reads the comment alone, never the tip of the default branch', () => {
    // #2267: the worker read the base as the version pull request's head and
    // the report read the real tip, and each left it to the other. Nothing in
    // the input is a base tip, so the two cannot disagree that way again.
    assert.notProperty(queued, 'baseTip');

    assert.strictEqual(
      queueOwner({ ...queued, setAside: standing('rebase-failed') })?.owner,
      'skill',
    );
  });

  test('is the worker’s again once the head moved, or a retry was asked for', () => {
    assert.strictEqual(
      queueOwner({
        ...queued,
        setAside: standing('rebase-failed', { headSha: OLD_HEAD }),
      })?.owner,
      'worker',
    );

    assert.strictEqual(
      queueOwner({
        ...queued,
        setAside: standing('checks-failed', { retry: true }),
      })?.owner,
      'worker',
    );

    assert.strictEqual(
      queueOwner({ ...queued, setAside: { kind: 'resolved' } })?.owner,
      'worker',
    );
  });

  test.each([
    'awaiting-bypass',
    'not-merging',
    'already-in-base',
    'arm-failed',
    'unlabel-failed',
    'push-failed',
    'watch-timeout',
  ] as const)('is a person’s when set aside %s', (reason) => {
    assert.strictEqual(
      queueOwner({ ...queued, setAside: standing(reason) })?.owner,
      'human',
    );
  });

  test('is nobody’s for a set-aside reason it does not know', () => {
    assert.deepStrictEqual(
      queueOwner({ ...queued, setAside: standing('mystery') }),
      {
        owner: 'none',
        reason:
          'set aside for `mystery`, a reason no owner is defined for; a bug in unblock-prs or pr-report-core',
      },
    );
  });

  test('is the claimant’s skill while a claim holds', () => {
    assert.deepStrictEqual(
      queueOwner({
        ...queued,
        setAside: { kind: 'resolved' },
        claim: claimedBy('unblock-wren'),
      }),
      {
        owner: 'skill',
        reason: 'claimed by unblock-wren at 2026-10-14T23:30:00Z',
      },
    );
  });

  test('passes over a claim that ran out', () => {
    assert.strictEqual(
      queueOwner({
        ...queued,
        claim: claimedBy('unblock-wren', '2026-10-14T20:00:00Z'),
      })?.owner,
      'worker',
    );
  });

  test('gives a generated branch’s failure and its conflict to the skill', () => {
    const update = { ...queued, headRef: 'chore/pnpm-update' } as const;

    assert.deepStrictEqual(
      queueOwner({ ...update, setAside: standing('checks-failed') }),
      {
        owner: 'skill',
        reason: 'set aside `checks-failed` at its head; the skill fixes it',
      },
    );

    // The same as for any other branch: which branches are generated, and
    // how, is the repository's configuration, which the skill reads.
    assert.deepStrictEqual(
      queueOwner({ ...update, setAside: standing('rebase-failed') }),
      {
        owner: 'skill',
        reason: 'set aside `rebase-failed` at its head; the skill fixes it',
      },
    );
  });

  test('gives the version pull request’s set-aside to a person', () => {
    assert.strictEqual(
      queueOwner({
        ...queued,
        headRef: 'changeset-release/main',
        setAside: standing('checks-failed'),
      })?.owner,
      'human',
    );
  });

  test('is a person’s for what the queue cannot move', () => {
    assert.strictEqual(
      queueOwner({ ...queued, isDraft: true })?.owner,
      'human',
    );

    assert.strictEqual(
      queueOwner({ ...queued, fromFork: true })?.owner,
      'human',
    );

    assert.strictEqual(
      queueOwner({ ...queued, inCycle: true })?.owner,
      'human',
    );

    assert.strictEqual(
      queueOwner({ ...queued, baseRef: 'some/branch' })?.owner,
      'human',
    );
  });

  test('is the worker’s for a layer of a stack, set aside or not', () => {
    assert.strictEqual(
      queueOwner({
        ...queued,
        baseRef: 'feat/lower',
        stackedOn: 2266,
        setAside: standing('rebase-failed'),
      })?.owner,
      'worker',
    );
  });

  test.each(SET_ASIDE_REASONS)(
    'names an owner other than nobody for %s',
    (reason) => {
      const owner = queueOwner({ ...queued, setAside: standing(reason) });

      assert.include(QUEUE_OWNERS, owner?.owner);

      assert.notStrictEqual(owner?.owner, 'none');
    },
  );
});
