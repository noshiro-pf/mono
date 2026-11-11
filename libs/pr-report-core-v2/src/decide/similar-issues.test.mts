import {
  DUPLICATE_THRESHOLD,
  duplicateSuspects,
  similarIssues,
  titleSimilarity,
  type OpenIssueText,
} from './similar-issues.mjs';

const open = (number: number, title: string, body = ''): OpenIssueText =>
  ({
    number,
    title,
    body,
    url: `https://github.com/o/r/issues/${number}`,
  }) as const;

describe(titleSimilarity, () => {
  test('is 1 for the same title, whatever its case and punctuation', () => {
    assert.strictEqual(
      titleSimilarity(
        'unblock-prs: the queue stops',
        'Unblock-PRs — the queue STOPS.',
      ),
      1,
    );
  });

  test('is 0 for titles that share nothing but filler words', () => {
    assert.strictEqual(
      titleSimilarity('fix the router', 'document the parser'),
      0,
    );
  });

  test('counts neither a Conventional Commits type nor a bare number as a shared word', () => {
    assert.strictEqual(
      titleSimilarity(
        'test(foo): read 100 rows',
        'test(bar): skip 100 columns',
      ),
      0,
    );
  });

  test('reads Japanese by pairs of characters', () => {
    assert.isAbove(
      titleSimilarity(
        '作成ページの下書き保存が動かない',
        '作成ページの下書き保存が最初の変更を保存しない',
      ),
      DUPLICATE_THRESHOLD,
    );
  });

  test('passes the threshold for two reports of one problem', () => {
    assert.isAtLeast(
      titleSimilarity(
        'pr-manager: report cache clear() can be overtaken by a save() still hashing its token',
        'pr-manager: a report cache save still hashing when clear runs writes after it',
      ),
      DUPLICATE_THRESHOLD,
    );
  });
});

describe(duplicateSuspects, () => {
  const issues = [
    open(1, 'pr-manager: report cache clear() is overtaken by a save'),
    open(2, 'synstate-dom: a boolean aria attribute renders empty'),
    open(3, 'pr-manager: the report cache save is overtaken'),
  ] as const;

  test('names the open issues whose title is close, the closest first', () => {
    assert.deepStrictEqual(
      duplicateSuspects(
        'pr-manager: the report cache clear() is overtaken by a save',
        issues,
        [],
      ).map(({ number }) => number),
      [1, 3],
    );
  });

  test('leaves out what the filer said is not a duplicate', () => {
    assert.deepStrictEqual(
      duplicateSuspects(
        'pr-manager: the report cache clear() is overtaken by a save',
        issues,
        [1],
      ).map(({ number }) => number),
      [3],
    );
  });
});

describe(similarIssues, () => {
  test('adds what names a keyword in its title or body, ahead of a close title', () => {
    const found = similarIssues(
      {
        title: 'onUserDelete reports failure as success',
        keywords: ['sendReport'],
      },
      [
        open(
          1,
          'event-schedule-app-functions: onUserDelete hits the batch limit',
        ),
        open(2, 'unrelated', 'Since #3186, `sendReport` waits for the mail.'),
        open(3, 'unrelated too'),
      ],
    );

    assert.deepStrictEqual(
      found.map(({ number, keywords }) => [number, keywords]),
      [
        [2, ['sendReport']],
        [1, []],
      ],
    );
  });

  test('matches a keyword as written, not as part of a longer name', () => {
    const found = similarIssues({ title: 'x', keywords: ['useAlive'] }, [
      open(1, 'y', '`useAliveRef` is fine'),
      open(2, 'z', 'see useAlive.'),
    ]);

    assert.deepStrictEqual(
      found.map(({ number }) => number),
      [2],
    );
  });
});
