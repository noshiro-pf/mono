import {
  AUTO_REBASE_LABEL,
  MERGE_QUEUED_LABEL,
  SKIP_CI_LABEL,
  type QueueOwner,
} from 'pr-report-core';
import {
  mayRepairAhead,
  planRepairsAhead,
  pruneTriedAhead,
} from './repair-ahead.mjs';
import type { BuiltLayer } from './speculate-plan.mjs';
import type { PullRequest } from './types.mjs';

describe(planRepairsAhead, () => {
  const context = {
    conflicted: undefined,
    red: [],
    eligible: new Set<number>([3, 5, 9]),
    fixers: true,
    tried: new Map<number, string>(),
  } as const;

  test('rebases the candidate whose commits conflict with the layers below', () => {
    assert.deepStrictEqual(planRepairsAhead({ ...context, conflicted: 3 }), [
      { kind: 'rebase', number: 3 },
    ]);
  });

  test("fixes each red layer above the first on its pull request's head", () => {
    assert.deepStrictEqual(
      planRepairsAhead({ ...context, red: [built(3), built(9)] }),
      [
        { kind: 'fix', number: 3, head: HEAD, tip: 'tip-3' },
        { kind: 'fix', number: 9, head: HEAD, tip: 'tip-9' },
      ],
    );
  });

  // Rebasing or amending runs the branch's own code and pushes in the queue's
  // name: only to one the worker owns, paused and queued by its author.
  test('leaves a pull request it may not push to', () => {
    assert.deepStrictEqual(
      planRepairsAhead({
        ...context,
        conflicted: 4,
        red: [built(6)],
      }),
      [],
    );
  });

  // The fixers run on the head alone, so a layer rebuilt over other layers
  // below asks nothing new of them, and a head they wrote themselves is not
  // fixed again: a fixer that changed nothing would change nothing again, and
  // one that writes something on every run would push for ever.
  test('does not fix again at the head it was tried at, or the head it pushed', () => {
    assert.deepStrictEqual(
      planRepairsAhead({
        ...context,
        red: [built(3), built(9)],
        tried: new Map<number, string>([
          [3, HEAD],
          [9, 'b'.repeat(40)],
        ]),
      }),
      [{ kind: 'fix', number: 9, head: HEAD, tip: 'tip-9' }],
    );
  });

  test('fixes nothing without fixers, and still rebases', () => {
    assert.deepStrictEqual(
      planRepairsAhead({
        ...context,
        conflicted: 5,
        red: [built(3)],
        fixers: false,
      }),
      [{ kind: 'rebase', number: 5 }],
    );
  });

  // The conflict comes first: a rebase that resolves it moves the head, and the
  // survey after builds its layer again.
  test('rebases before it fixes', () => {
    assert.deepStrictEqual(
      planRepairsAhead({ ...context, conflicted: 9, red: [built(3)] }),
      [
        { kind: 'rebase', number: 9 },
        { kind: 'fix', number: 3, head: HEAD, tip: 'tip-3' },
      ],
    );
  });
});

describe(mayRepairAhead, () => {
  const worker = new Map<number, QueueOwner>([
    [1, { owner: 'worker', reason: '' }],
    [2, { owner: 'worker', reason: '' }],
    [3, { owner: 'skill', reason: 'set aside' }],
    [4, { owner: 'worker', reason: '' }],
    [5, { owner: 'worker', reason: '' }],
  ]);

  test("is each queued, paused pull request on the default branch that is the worker's", () => {
    assert.deepStrictEqual(
      Array.from(
        mayRepairAhead(
          [
            pr(1),
            // Not paused: a push would run the matrix.
            pr(2, { labels: [{ name: MERGE_QUEUED_LABEL }] }),
            // A session's, or a person's.
            pr(3),
            // Stacked on another pull request's branch.
            pr(4, { baseRefName: 'feature/1' }),
            // Not queued by its author: its code is not run.
            pr(5, {
              labels: [{ name: SKIP_CI_LABEL }, { name: AUTO_REBASE_LABEL }],
            }),
          ],
          'main',
          worker,
        ),
      ),
      [1],
    );
  });
});

describe(pruneTriedAhead, () => {
  test('keeps what was tried of the pull requests still at that head', () => {
    assert.deepStrictEqual(
      pruneTriedAhead(
        new Map<number, string>([
          [1, HEAD],
          [2, HEAD],
          [3, 'b'.repeat(40)],
        ]),
        [pr(2), pr(3)],
      ),
      new Map<number, string>([[2, HEAD]]),
    );
  });
});

const HEAD = 'a'.repeat(40);

const built = (number: number): BuiltLayer =>
  ({
    number,
    head: HEAD,
    tip: `tip-${number}`,
    tree: `t${number}`,
    parent: 'below',
    parentTree: 'below-tree',
    builtAt: 0,
  }) as const;

const pr = (
  number: number,
  overrides: Partial<PullRequest> = {},
): PullRequest =>
  ({
    number,
    id: `PR_${number}`,
    title: `#${number}`,
    body: '',
    state: 'OPEN',
    headRefName: `feature/${number}`,
    headRefOid: HEAD,
    baseRefName: 'main',
    isCrossRepository: false,
    isDraft: false,
    mergeStateStatus: 'BLOCKED',
    autoMergeRequest: null,
    labels: [{ name: MERGE_QUEUED_LABEL }, { name: SKIP_CI_LABEL }],
    ...overrides,
  }) as const;
