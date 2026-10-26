import type { PullRequest } from './types.mjs';
import { isVersionPullRequest, releaseBlockedNote } from './version-pr.mjs';

const pullRequest = (
  fields: Partial<PullRequest> & Readonly<{ number: number }>,
): PullRequest =>
  ({
    id: `PR_${fields.number}`,
    title: `pull request #${fields.number}`,
    body: '',
    state: 'OPEN',
    headRefName: `feature/${fields.number}`,
    headRefOid: 'a'.repeat(40),
    baseRefName: 'main',
    isCrossRepository: false,
    isDraft: false,
    mergeStateStatus: 'BLOCKED',
    autoMergeRequest: {},
    labels: [],
    ...fields,
  }) as const;

const versionPr = (number: number): PullRequest =>
  pullRequest({
    number,
    headRefName: 'changeset-release/main',
    labels: [{ name: 'merge-queued' }, { name: 'skip-ci' }],
  });

describe(isVersionPullRequest, () => {
  test('identifies it by its branch', () => {
    assert.isTrue(
      isVersionPullRequest(
        pullRequest({ number: 1, headRefName: 'changeset-release/main' }),
        'main',
      ),
    );
  });

  // Its title is `pr-title` from `release.yml`, which anyone may reuse, and
  // its number changes with every release. The branch is the only handle.
  test('does not take another branch for it by its title', () => {
    assert.isFalse(
      isVersionPullRequest(
        pullRequest({
          number: 1,
          title: 'chore: version packages',
          headRefName: 'chore/version-packages',
        }),
        'main',
      ),
    );
  });

  test('is read against the default branch it was given', () => {
    assert.isFalse(
      isVersionPullRequest(
        pullRequest({ number: 1, headRefName: 'changeset-release/main' }),
        'develop',
      ),
    );
  });
});

describe(releaseBlockedNote, () => {
  test('reports the blockers by number, marking the drafts', () => {
    assert.deepStrictEqual(
      releaseBlockedNote(versionPr(1950), [
        { number: 1901, isDraft: false },
        { number: 1903, isDraft: true },
      ]),
      {
        kind: 'note',
        note: '#1950: blocks-release on #1901, #1903 (draft) — still open, so the release waits',
      },
    );
  });
});
