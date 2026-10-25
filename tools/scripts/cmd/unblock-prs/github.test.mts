import { latestMergedHead, pullRequestOfNode } from './github.mjs';

describe(pullRequestOfNode, () => {
  const node = {
    number: 12,
    id: 'PR_kwDO',
    title: 'feat: x',
    body: 'Merge-After: #11',
    state: 'OPEN',
    headRefName: 'feat/x',
    headRefOid: 'a'.repeat(40),
    baseRefName: 'main',
    isCrossRepository: false,
    isDraft: false,
    mergeStateStatus: 'BEHIND',
    autoMergeRequest: null,
    labels: { nodes: [{ name: 'merge-queued' }, { name: 'skip-ci' }] },
  } as const;

  test('flattens the labels to the shape every module here reads', () => {
    assert.deepStrictEqual(pullRequestOfNode(node).labels, [
      { name: 'merge-queued' },
      { name: 'skip-ci' },
    ]);
  });

  test('keeps every other field as GitHub answered it', () => {
    const { labels: _labels, ...rest } = pullRequestOfNode(node);

    const { labels: _nodeLabels, ...expected } = node;

    assert.deepStrictEqual(rest, expected);
  });

  test('keeps an armed auto-merge a record, which is what is read of it', () => {
    const armed = pullRequestOfNode({
      ...node,
      autoMergeRequest: { enabledAt: '2026-10-25T00:00:00Z' },
    });

    assert.deepStrictEqual(armed.autoMergeRequest, {
      enabledAt: '2026-10-25T00:00:00Z',
    });
  });
});

describe(latestMergedHead, () => {
  test('is the pull request merged last, and ignores one closed unmerged', () => {
    assert.deepStrictEqual(
      latestMergedHead([
        pull(1, '2026-10-01T00:00:00Z'),
        pull(3, null),
        pull(2, '2026-10-02T00:00:00Z'),
      ]),
      {
        number: 2,
        headSha: '2'.padStart(40, 'h'),
        mergeCommit: '2'.padStart(40, 'c'),
      },
    );
  });

  test('is undefined when none was merged', () => {
    assert.isUndefined(latestMergedHead([pull(3, null)]));
  });

  test('leaves the merge commit out while GitHub has none', () => {
    assert.isUndefined(
      latestMergedHead([pull(1, '2026-10-01T00:00:00Z', null)])?.mergeCommit,
    );
  });
});

const pull = (
  number: number,
  mergedAt: string | null,
  mergeCommit: string | null = String(number).padStart(40, 'c'),
): Parameters<typeof latestMergedHead>[0][number] =>
  ({
    number,
    head: { sha: String(number).padStart(40, 'h') },
    merge_commit_sha: mergeCommit,
    merged_at: mergedAt,
  }) as const;
