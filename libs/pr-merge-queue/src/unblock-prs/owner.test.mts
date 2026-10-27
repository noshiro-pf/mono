import type { Claim } from 'pr-report-core';
import { ownerNote, ownerOf, type OwnerContext } from './owner.mjs';
import type { PullRequest, SkipRecord } from './types.mjs';

const HEAD = 'c'.repeat(40);

const NOW = Date.parse('2026-10-15T00:30:00Z');

const pullRequest = (fields: Partial<PullRequest> = {}): PullRequest =>
  ({
    number: 2267,
    id: 'PR_2267',
    title: '#2267',
    body: '',
    state: 'OPEN',
    headRefName: 'fix/a-thing',
    headRefOid: HEAD,
    baseRefName: 'main',
    isCrossRepository: false,
    isDraft: false,
    mergeStateStatus: 'BLOCKED',
    autoMergeRequest: null,
    labels: [{ name: 'merge-queued' }, { name: 'skip-ci' }],
    ...fields,
  }) as const;

const SKIP: SkipRecord = {
  number: 2267,
  headSha: HEAD,
  baseSha: 'b'.repeat(40),
  reason: 'rebase-failed',
  detail: 'conflicts in a.mts',
} as const;

const CLAIM: Claim = {
  headSha: HEAD,
  by: 'unblock-wren',
  at: '2026-10-15T00:00:00Z',
} as const;

const context = (fields: Partial<OwnerContext> = {}): OwnerContext =>
  ({
    defaultBranch: 'main',
    skipped: new Map<number, SkipRecord>(),
    claimed: new Map<number, Claim>(),
    stackParents: new Map<number, number>(),
    cyclic: new Set<number>(),
    nowEpochMs: NOW,
    ...fields,
  }) as const;

describe(ownerOf, () => {
  test('is the worker’s with nothing set aside or claimed', () => {
    assert.strictEqual(ownerOf(pullRequest(), context())?.owner, 'worker');
  });

  test('reads a record as the comment it was taken up from', () => {
    assert.deepStrictEqual(
      ownerOf(
        pullRequest(),
        context({ skipped: new Map<number, SkipRecord>([[2267, SKIP]]) }),
      ),
      {
        owner: 'skill',
        reason: 'set aside `rebase-failed` at its head; the skill fixes it',
      },
    );
  });

  test('is the claimant’s while the claim holds', () => {
    assert.strictEqual(
      ownerOf(
        pullRequest(),
        context({ claimed: new Map<number, Claim>([[2267, CLAIM]]) }),
      )?.owner,
      'skill',
    );
  });

  test('is undefined outside the queue', () => {
    assert.isUndefined(ownerOf(pullRequest({ labels: [] }), context()));
  });
});

describe(ownerNote, () => {
  test('says whose a set-aside pull request is, and why it was set aside', () => {
    const skipped = new Map<number, SkipRecord>([[2267, SKIP]]);

    assert.deepStrictEqual(
      ownerNote(
        pullRequest(),
        ownerOf(pullRequest(), context({ skipped })),
        skipped,
      ),
      {
        kind: 'note',
        note: "#2267: the /unblock-prs skill's (set aside `rebase-failed` at its head; the skill fixes it); set aside: conflicts in a.mts",
      },
    );
  });

  test('names the claimant', () => {
    const claimed = new Map<number, Claim>([[2267, CLAIM]]);

    const note = ownerNote(
      pullRequest(),
      ownerOf(pullRequest(), context({ claimed })),
      new Map<number, SkipRecord>(),
    );

    assert.include(note?.kind === 'note' ? note.note : '', 'unblock-wren');
  });

  test('says nothing about the worker’s own', () => {
    assert.isUndefined(
      ownerNote(
        pullRequest(),
        ownerOf(pullRequest(), context()),
        new Map<number, SkipRecord>(),
      ),
    );
  });
});
