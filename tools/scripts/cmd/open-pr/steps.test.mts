import { SKIP_CI_LABEL } from 'pr-report-core';
import { armBlockedBy, isArmed, mergeAfterTrailer } from './steps.mjs';
import { type PullRequest } from './types.mjs';

const pr = (overrides: Partial<PullRequest> = {}): PullRequest =>
  ({
    number: 1901,
    nodeId: 'PR_node_1901',
    state: 'OPEN',
    isDraft: false,
    labels: [{ name: SKIP_CI_LABEL }],
    autoMergeRequest: null,
    ...overrides,
  }) as const;

describe('armBlockedBy', () => {
  test('lets a labelled, open, ready pull request be armed', () => {
    assert.isUndefined(armBlockedBy(pr()));
  });

  // The whole point of the order: the label is the only thing holding the
  // merge, so arming without it is arming with nothing holding it.
  test('refuses when `skip-ci` is not on it', () => {
    const reason = armBlockedBy(pr({ labels: [] }));

    assert.isTrue(reason?.includes(SKIP_CI_LABEL) === true);
  });

  test('refuses a draft, which GitHub will not arm anyway', () => {
    assert.isTrue(armBlockedBy(pr({ isDraft: true })) !== undefined);
  });

  test('refuses one that is no longer open', () => {
    assert.isTrue(armBlockedBy(pr({ state: 'MERGED' })) !== undefined);
  });

  // `merge-queued` is a scope rule for `unblock-prs`; it never stands in for
  // the label that blocks.
  test('does not accept another label in place of `skip-ci`', () => {
    assert.isTrue(
      armBlockedBy(pr({ labels: [{ name: 'merge-queued' }] })) !== undefined,
    );
  });
});

describe('isArmed', () => {
  test('reads the absence of an auto-merge request as unarmed', () => {
    assert.isFalse(isArmed(pr()));
  });

  test('reads a request of any shape as armed', () => {
    assert.isTrue(isArmed(pr({ autoMergeRequest: { mergeMethod: 'SQUASH' } })));
  });
});

describe('mergeAfterTrailer', () => {
  test('is nothing when no pull request was named', () => {
    assert.isUndefined(mergeAfterTrailer([]));
  });

  test('writes the numbers on one line, in the declared order', () => {
    assert.strictEqual(
      mergeAfterTrailer([1901, 1903]),
      'Merge-After: #1901, #1903',
    );
  });
});
