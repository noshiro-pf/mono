import { Result } from 'ts-data-forge';
import { unownedReportMarker } from '../conventions/index.mjs';
import {
  findUnowned,
  planUnownedReports,
  type UnownedPullRequest,
} from './unowned.mjs';

const HEAD = 'b'.repeat(40);

const UNREAD = {
  kind: 'unavailable',
  what: 'the comments of #5',
  message: '502 Bad Gateway',
} as const;

const pullRequest = (
  number: number,
  owner: UnownedPullRequest['owner'],
  options: Readonly<{ stackedOn?: number; labels?: readonly string[] }> = {},
): UnownedPullRequest =>
  ({
    facts: {
      number,
      labels: (options.labels ?? ['merge-queued']).map((name) => ({
        name,
        color: '0e8a16',
        description: '',
      })),
      headRef: `branch-${number}`,
      headSha: HEAD,
      baseRef: 'main',
    },
    owner,
    stackedOn: options.stackedOn,
    comments: Result.ok({ setAside: undefined, claim: undefined }),
  }) as const;

const NONE = Result.ok({ owner: 'none', reason: 'set aside for `mystery`' });

describe(findUnowned, () => {
  test('finds the pull requests nobody owns, and the queued ones whose owner is unread', () => {
    const found = findUnowned([
      pullRequest(5, NONE),
      pullRequest(6, Result.ok({ owner: 'worker', reason: 'queued' })),
      pullRequest(7, Result.err(UNREAD)),
      pullRequest(9, Result.ok(undefined), { labels: [] }),
    ]);

    assert.deepStrictEqual(
      [found.unowned.map(({ facts }) => facts.number), found.unread],
      [[5], [{ pr: 7, unread: 'owner', error: UNREAD }]],
    );
  });

  test('leaves one nobody owns whose comments are unread to a run that reads them', () => {
    const found = findUnowned([
      { ...pullRequest(5, NONE), comments: Result.err(UNREAD) },
    ]);

    assert.deepStrictEqual(found, {
      unowned: [],
      unread: [{ pr: 5, unread: 'comments', error: UNREAD }],
    });
  });
});

describe(planUnownedReports, () => {
  test('files one report for each pull request nobody owns, and none twice', () => {
    const { unowned } = findUnowned([
      pullRequest(5, NONE),
      pullRequest(7, NONE, { stackedOn: 5 }),
    ]);

    const plan = planUnownedReports(unowned, [{ issue: 40, pr: 5 }]);

    assert.deepStrictEqual(
      [plan.reported, plan.toFile.map(({ pr, title }) => [pr, title])],
      [
        [{ pr: 5, issue: 40 }],
        [[7, 'unblock-prs: #7 is in the queue with no owner']],
      ],
    );

    expect(plan.toFile[0]?.body).toContain(unownedReportMarker(7));

    expect(plan.toFile[0]?.body).toContain('(stacked on #5)');
  });

  test('writes what the queue knows of it into the report', () => {
    const setAside = {
      reason: 'mystery',
      headSha: HEAD,
      baseSha: 'f'.repeat(40),
    } as const;

    const says = { kind: 'standing', record: setAside, retry: false } as const;

    const { unowned } = findUnowned([
      {
        ...pullRequest(9, NONE),
        comments: Result.ok({
          setAside: { commentId: 1, says, applies: true },
          claim: undefined,
        }),
      },
    ]);

    const body = planUnownedReports(unowned, []).toFile[0]?.body ?? '';

    assert.strictEqual(body.split('\n', 1)[0], unownedReportMarker(9));

    for (const line of [
      '- Why: set aside for `mystery`',
      '- Labels: `merge-queued`',
      `- Head: \`branch-9\` at \`${HEAD}\`, onto \`main\``,
      `- Set-aside comment: \`${JSON.stringify(says)}\``,
      '- Claim: none',
    ]) {
      expect(body).toContain(line);
    }
  });
});
