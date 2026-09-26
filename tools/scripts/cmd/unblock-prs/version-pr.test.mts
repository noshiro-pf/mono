import { type PullRequest, type TriageContext } from './types.mjs';
import {
  isVersionPullRequest,
  releaseBlockers,
  versionBranchName,
  versionPullRequestHold,
} from './version-pr.mjs';

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

const context = (blockers: readonly PullRequest[]): TriageContext =>
  ({
    defaultBranch: 'main',
    baseSha: 'b'.repeat(40),
    skipped: new Map(),
    requiredContexts: [],
    openNumbers: new Set(),
    dependencies: new Map(),
    stackParents: new Map(),
    cyclic: new Set(),
    releaseBlockers: blockers,
  }) as const;

describe('versionBranchName', () => {
  test('is the branch changesets/action opens the pull request from', () => {
    assert.strictEqual(versionBranchName('main'), 'changeset-release/main');
  });
});

describe('isVersionPullRequest', () => {
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

describe('releaseBlockers', () => {
  test('are the open pull requests labelled blocks-release', () => {
    const blocker = pullRequest({
      number: 1901,
      labels: [{ name: 'blocks-release' }],
    });

    assert.deepStrictEqual(
      releaseBlockers(versionPr(1950), context([blocker])),
      [blocker],
    );
  });

  // Otherwise it would hold itself for as long as it existed, with nothing
  // able to take the label off — a `Merge-After` cycle by another name.
  test('never include the version pull request itself', () => {
    const version = versionPr(1950);

    assert.deepStrictEqual(releaseBlockers(version, context([version])), []);
  });
});

describe('versionPullRequestHold', () => {
  test('reports the blockers by number, marking the drafts', async () => {
    const held = await versionPullRequestHold(
      versionPr(1950),
      context([
        pullRequest({ number: 1901, labels: [{ name: 'blocks-release' }] }),
        pullRequest({
          number: 1903,
          isDraft: true,
          labels: [{ name: 'blocks-release' }],
        }),
      ]),
    );

    assert.deepStrictEqual(held, {
      kind: 'note',
      note: '#1950: blocks-release on #1901, #1903 (draft) — still open, so the release waits',
    });
  });
});
