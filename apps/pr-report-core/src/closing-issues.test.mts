import { closingIssuesIn } from './closing-issues.mjs';

describe(closingIssuesIn, () => {
  const repo = { owner: 'noshiro-pf', name: 'mono' } as const;

  const issue = (number: number, nameWithOwner: string, state: string) =>
    ({
      number,
      title: `Issue ${number}`,
      url: `https://github.com/${nameWithOwner}/issues/${number}`,
      state,
      repository: { nameWithOwner },
    }) as const;

  test('keeps the issues of this repository', () => {
    assert.deepStrictEqual(
      closingIssuesIn(repo, [issue(12, 'noshiro-pf/mono', 'OPEN')]),
      [
        {
          number: 12,
          title: 'Issue 12',
          url: 'https://github.com/noshiro-pf/mono/issues/12',
          state: 'open',
        },
      ],
    );
  });

  test("leaves out another repository's issue, which `#N` would misname", () => {
    assert.deepStrictEqual(
      closingIssuesIn(repo, [
        issue(13, 'noshiro-pf/other', 'CLOSED'),
        issue(14, 'noshiro-pf/mono', 'CLOSED'),
      ]).map(({ number }) => number),
      [14],
    );
  });

  test('matches the repository the way GitHub does, whatever the case', () => {
    assert.strictEqual(
      closingIssuesIn(repo, [issue(12, 'Noshiro-PF/Mono', 'OPEN')]).length,
      1,
    );
  });

  test('skips an issue the token may not see', () => {
    assert.deepStrictEqual(
      closingIssuesIn(repo, [null, issue(12, 'noshiro-pf/mono', 'CLOSED')]).map(
        ({ state }) => state,
      ),
      ['closed'],
    );
  });

  test('says unknown for a state it does not know', () => {
    assert.strictEqual(
      closingIssuesIn(repo, [issue(12, 'noshiro-pf/mono', 'DRAFT')])[0]?.state,
      'unknown',
    );
  });
});
