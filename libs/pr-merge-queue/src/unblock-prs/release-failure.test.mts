// cspell:ignore unlabel
import { endsCycle } from './release-failure.mjs';

describe(endsCycle, () => {
  test.each([
    {
      reason: 'rebase-failed',
      detail: 'conflict in a.mts',
      ofPullRequest: true,
    },
    { reason: 'already-in-base', detail: 'nothing left', ofPullRequest: true },
  ] as const)(
    'moves on to the next candidate after a failure of the pull request ($reason)',
    (failure) => {
      assert.isFalse(endsCycle(failure));
    },
  );

  test.each([
    { reason: 'push-failed', detail: 'push refused: 502' },
    { reason: 'arm-failed', detail: 'enablePullRequestAutoMerge: 503' },
    { reason: 'unlabel-failed', detail: 'removeLabel: 500' },
    { reason: 'rebase-failed', detail: 'fetch failed: timed out' },
  ] as const)(
    'ends the cycle after a failure GitHub may have caused ($reason: $detail)',
    (failure) => {
      assert.isTrue(endsCycle(failure));
    },
  );
});
