// cspell:ignore xhigh
import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import {
  changedParts,
  checkDescription,
  descriptionKindOf,
  readableDescription,
  reviewOpeningOf,
  reviewOpeningRounds,
  splitDescription,
  type DescriptionParts,
} from './body.mjs';

const HEADING = '日本語';

const BODY = dedent`
  Merge-After: #10

  Fixes the parser (#12).

  ## Checks

  - \`check:test\`

  ## Review

  \`/code-review high\`, 2 rounds.

  - Deferred: the rest (#13).

  ## 日本語

  パーサを直す (#12)。

  ### 実行したチェック

  - \`check:test\`

  ### レビュー

  - 先送り: 残り (#13)。

  ---

  Closes #11
  Claude-Session: [title](https://claude.ai/code/session_1)
`;

const split = (body: string): DescriptionParts =>
  Result.unwrapThrow(splitDescription(body, HEADING));

describe(splitDescription, () => {
  test('splits at the heading and at the first rule after it', () => {
    const parts = split(BODY);

    assert.isTrue(parts.original.startsWith('Merge-After: #10\n'));

    assert.isTrue(parts.original.trimEnd().endsWith('the rest (#13).'));

    assert.isTrue(parts.translation.trimStart().startsWith('パーサを直す'));

    assert.isTrue(parts.translation.trimEnd().endsWith('残り (#13)。'));

    assert.strictEqual(
      parts.trailers,
      '---\n\nCloses #11\nClaude-Session: [title](https://claude.ai/code/session_1)',
    );
  });

  test('reads a body GitHub stored with CRLF line ends', () => {
    assert.deepStrictEqual(split(BODY.replaceAll('\n', '\r\n')), split(BODY));
  });

  test('has no trailers when there is no rule after the translation', () => {
    assert.strictEqual(split('A.\n\n## 日本語\n\nあ。').trailers, '');
  });

  test('ignores a heading and a rule inside a code fence', () => {
    const parts = split(dedent`
      A.

      \`\`\`md
      ## 日本語
      ---
      \`\`\`

      ## 日本語

      あ。
    `);

    assert.isTrue(parts.original.includes('```md\n## 日本語\n---\n```'));

    assert.strictEqual(parts.translation.trim(), 'あ。');
  });

  test('refuses a body without the translation', () => {
    const result = splitDescription('A.\n\n## Review\n', HEADING);

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, '## 日本語');
  });

  test('does not take a heading indented as code', () => {
    assert.isTrue(
      Result.isErr(splitDescription('A.\n\n    ## 日本語\n\nあ。', HEADING)),
    );
  });

  test('refuses a rule the translation uses as a section break', () => {
    const result = splitDescription(
      'A.\n\n## B\n\n## 日本語\n\nあ。\n\n---\n\n### い\n\nう。',
      HEADING,
    );

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, '---');
  });

  test('refuses the heading twice', () => {
    assert.isTrue(
      Result.isErr(
        splitDescription(
          'A.\n\n## 日本語\n\nあ。\n\n## 日本語\n\nい。',
          HEADING,
        ),
      ),
    );
  });

  test('refuses an empty half', () => {
    assert.isTrue(Result.isErr(splitDescription('## 日本語\n\nあ。', HEADING)));

    assert.isTrue(
      Result.isErr(splitDescription('A.\n\n## 日本語\n\n---\n', HEADING)),
    );
  });
});

describe(checkDescription, () => {
  test('passes halves that mirror each other', () => {
    assert.deepStrictEqual(checkDescription(split(BODY), 'pull-request'), []);
  });

  test('names headings that do not mirror', () => {
    const problems = checkDescription(
      split(
        BODY.replace(
          '### 実行したチェック',
          '### 概要\n\nあ。\n\n### 実行したチェック',
        ),
      ),
      'pull-request',
    );

    assert.strictEqual(problems.length, 1);

    assert.include(problems[0], '### 概要');
  });

  test('lets the translation title prose the original opens with', () => {
    const titled = BODY.replace('パーサを直す', '### 概要\n\nパーサを直す');

    assert.deepStrictEqual(checkDescription(split(titled), 'pull-request'), []);

    // One heading for the opening, and no more.
    assert.isNotEmpty(
      checkDescription(
        split(
          titled.replace('### レビュー', '### 補足\n\nあ。\n\n### レビュー'),
        ),
        'pull-request',
      ),
    );

    assert.deepStrictEqual(
      checkDescription(
        split('A.\n\n## 日本語\n\n### 概要\n\nあ。'),
        'pull-request',
      ),
      [],
    );
  });

  test('wants the translation one level down', () => {
    assert.isNotEmpty(
      checkDescription(
        split(BODY.replace('### レビュー', '## レビュー')),
        'pull-request',
      ),
    );
  });

  test('names a reference only one half makes', () => {
    const problems = checkDescription(
      split(BODY.replace('- 先送り: 残り (#13)。', '- 先送り: 残り。')),
      'pull-request',
    );

    assert.strictEqual(problems.length, 1);

    assert.include(problems[0], '#13');
  });

  test('reads no reference out of the declarations, tables or code', () => {
    const parts = split(dedent`
      Merge-After: #1
      Merges before #2, whose \`Merge-After:\` names this one.

      | pull request | state |
      | :----------- | :---- |
      | #3           | open  |

      \`\`\`sh
      echo '#4'
      \`\`\`

      Written as \`#5\`.

      ## 日本語

      \`#6\` と書く。
    `);

    assert.deepStrictEqual(checkDescription(parts, 'pull-request'), []);
  });

  test('keeps code, tables and images in the original', () => {
    const problems = checkDescription(
      split(dedent`
        A.

        ## 日本語

        \`\`\`sh
        echo
        \`\`\`

        | a |
        | - |

        ![shot](https://example.com/a.png)
      `),
      'pull-request',
    );

    assert.strictEqual(problems.length, 3);
  });

  test('keeps declarations and closing keywords out of the translation', () => {
    const problems = checkDescription(
      split(dedent`
        A.

        ## 日本語

        Merge-After: #1
        Closes #2
      `),
      'pull-request',
    );

    assert.strictEqual(problems.length, 2);
  });

  const TRAILER_RULE =
    'Start-After: and Claude-Session: lines and closing keywords are read wherever they are, so each appears once, after the "---" rule that ends the translation';

  test.each([
    'Closes #2',
    'Start-After: #3',
    'Claude-Session: https://claude.ai/code/session_1',
  ])('keeps the trailer %s out of either half', (trailer) => {
    assert.deepStrictEqual(
      checkDescription(
        split(dedent`
          Merge-After: #1

          A.

          ${trailer}

          ## 日本語

          あ。

          ${trailer}
        `),
        'pull-request',
      ),
      [
        `the original has the trailer "${trailer}"; ${TRAILER_RULE}`,
        `the translation has the trailer "${trailer}"; ${TRAILER_RULE}`,
      ],
    );
  });

  test.each([
    'Closes noshiro-pf/mono#2',
    'Fixes https://github.com/noshiro-pf/mono/issues/2',
    'Fixes:#2',
    'Closes : #2',
  ])('reads %s as a trailer', (trailer) => {
    assert.deepStrictEqual(
      checkDescription(
        split(dedent`
          A.

          ${trailer}

          ## 日本語

          あ。
        `),
        'pull-request',
      ),
      [`the original has the trailer "${trailer}"; ${TRAILER_RULE}`],
    );
  });

  test('reads a closing keyword in an issue as prose, not as a trailer', () => {
    assert.deepStrictEqual(
      checkDescription(
        split(dedent`
          The workaround in #5 resolves #10 only partly.

          ## 日本語

          #5 の回避策は #10 を一部しか解決しない。
        `),
        'issue',
      ),
      [],
    );
  });

  test('counts the reference a closing keyword in an issue names', () => {
    assert.deepStrictEqual(
      checkDescription(
        split(
          'This resolves #10 only partly.\n\n## 日本語\n\n一部しか解決しない。',
        ),
        'issue',
      ),
      ['the original names #10 and the translation does not'],
    );
  });

  const ISSUE_TRAILER_RULE =
    'Start-After: and Claude-Session: lines are read wherever they are, so each appears once, after the "---" rule that ends the translation';

  test.each([
    'Start-After: #3',
    'Claude-Session: https://claude.ai/code/session_1',
  ])('keeps the trailer %s out of either half of an issue', (trailer) => {
    assert.deepStrictEqual(
      checkDescription(
        split(dedent`
          A.

          ${trailer}

          ## 日本語

          あ。

          ${trailer}
        `),
        'issue',
      ),
      [
        `the original has the trailer "${trailer}"; ${ISSUE_TRAILER_RULE}`,
        `the translation has the trailer "${trailer}"; ${ISSUE_TRAILER_RULE}`,
      ],
    );
  });

  test('keeps a Review section out of the translation, even titling its lead', () => {
    assert.deepStrictEqual(
      checkDescription(
        split(dedent`
          A.

          ## 日本語

          ## Review

          あ。
        `),
        'pull-request',
      ),
      [
        'the translation has a "## Review" heading; the tools read the first in the body, so the findings go under the original\'s and the translation titles its own section "### <translated heading>"',
      ],
    );
  });

  test('reads no trailer out of code or inline code', () => {
    assert.deepStrictEqual(
      checkDescription(
        split(dedent`
          Writes \`Closes #2\` and:

          \`\`\`md
          Start-After: #3
          \`\`\`

          ## 日本語

          \`Closes #2\` を書く。
        `),
        'pull-request',
      ),
      [],
    );
  });

  test('wants one Review section in the original, however headed', () => {
    assert.deepStrictEqual(
      checkDescription(
        split(dedent`
          ## Review (/code-review high)

          \`/code-review high\`, 1 round.

          ## Review findings not fixed

          B.

          ## 日本語

          ### レビュー

          あ。

          ### 直していない指摘

          い。
        `),
        'pull-request',
      ),
      [
        'the original has a "## Review" section 2 times; the tools read the first, so the findings go under one',
      ],
    );
  });

  test.each([
    '`/code-review high`, 3 rounds.',
    '`/code-review medium`, 1 round, no findings.',
    '`/code-review xhigh`, 12 rounds; the amend, one more.',
    'Self-review at `high`, 1 round: no review tool was available.',
    'Review at `high`, 2 rounds, with the review tool Codex has.',
    '  `/code-review high`, 2 rounds.  ',
  ])('takes a Review section opening %j', (opening) => {
    assert.deepStrictEqual(
      checkDescription(
        split(
          `## Review\n\n${opening}\n\n- Fixed: a.\n\n## 日本語\n\n### レビュー\n\nあ。`,
        ),
        'pull-request',
      ),
      [],
    );
  });

  test.each([
    'Three rounds of `/code-review high`.',
    '`/code-review high`, three rounds.',
    '`/code-review high`, 1 rounds.',
    '`/code-review high`, 2 round.',
    '`/code-review high`, 0 rounds.',
    '`/code-review high`, 3 rounds and more',
    '    `/code-review high`, 3 rounds.',
    '`/code-review` high, 2 rounds.',
    '- Fixed: a.',
  ])('refuses a Review section opening %j', (opening) => {
    assert.deepStrictEqual(
      checkDescription(
        split(`## Review\n\n${opening}\n\n## 日本語\n\n### レビュー\n\nあ。`),
        'pull-request',
      ),
      [
        `the "## Review" section opens with "${opening}"; ${REVIEW_OPENING_RULE}`,
      ],
    );
  });

  test('names a heading the Review section opens with', () => {
    assert.deepStrictEqual(
      checkDescription(
        split(
          '## Review\n\n### Round 1\n\n- Fixed: a.\n\n## 日本語\n\n### レビュー\n\n#### 1 回目\n\nあ。',
        ),
        'pull-request',
      ),
      [
        `the "## Review" section opens with "### Round 1"; ${REVIEW_OPENING_RULE}`,
      ],
    );
  });

  test('calls a Review section empty when the next section follows it', () => {
    assert.deepStrictEqual(
      checkDescription(
        split(
          '## Review\n\n## Checks\n\nA.\n\n## 日本語\n\n### レビュー\n\n### チェック\n\nあ。',
        ),
        'pull-request',
      ),
      [`the "## Review" section is empty; ${REVIEW_OPENING_RULE}`],
    );
  });

  test('refuses a Review section with nothing under it', () => {
    assert.deepStrictEqual(
      checkDescription(
        split('A.\n\n## Review\n\n## 日本語\n\nあ。\n\n### レビュー'),
        'pull-request',
      ),
      [`the "## Review" section is empty; ${REVIEW_OPENING_RULE}`],
    );
  });

  test('reads the Review opening outside code fences only', () => {
    assert.deepStrictEqual(
      checkDescription(
        split(dedent`
          A.

          \`\`\`md
          ## Review

          Anything.
          \`\`\`

          ## 日本語

          あ。
        `),
        'pull-request',
      ),
      [],
    );
  });
});

const REVIEW_OPENING_RULE =
  'it opens with the level and the total of rounds in digits, as "`/code-review high`, 3 rounds.", "Review at `high`, 2 rounds." or "Self-review at `high`, 1 round."';

describe(reviewOpeningOf, () => {
  test('skips blank lines and code fences', () => {
    assert.strictEqual(
      reviewOpeningOf(
        '\n```md\nTwo rounds.\n```\n\n`/code-review high`, 6 rounds.  \nMore.',
      ),
      '`/code-review high`, 6 rounds.',
    );
  });

  test('is empty when a heading comes first', () => {
    assert.strictEqual(reviewOpeningOf('\n## Checks\n\nA.'), '');
  });

  test('keeps a sub-heading that comes first', () => {
    assert.strictEqual(reviewOpeningOf('### Round 1\n\nA.'), '### Round 1');
  });
});

describe(reviewOpeningRounds, () => {
  test.each([
    ['`/code-review high`, 3 rounds.', 3],
    ['  `/code-review medium`, 1 round, no findings.  ', 1],
    ['Review at `xhigh`, 12 rounds; then the amend.', 12],
  ] as const)('reads %j as %i', (line, expected) => {
    assert.strictEqual(reviewOpeningRounds(line), expected);
  });

  test('reads no total from another form', () => {
    assert.isUndefined(
      reviewOpeningRounds('Three rounds of `/code-review high`.'),
    );
  });
});

describe(changedParts, () => {
  const before = split(BODY);

  test('sees neither half change when only the trailers do', () => {
    assert.deepStrictEqual(
      changedParts(before, split(`${BODY}\nStart-After: #9`), 'pull-request'),
      { original: false, translation: false },
    );
  });

  test('sees neither half change for trailing spaces and blank lines', () => {
    assert.deepStrictEqual(
      changedParts(
        before,
        split(
          BODY.replace('(#12).', '(#12).  \n\n').replace(
            '## Review',
            '## Review\n',
          ),
        ),
        'pull-request',
      ),
      { original: false, translation: false },
    );
  });

  test('does not count a trailer moved out of a half as a change', () => {
    assert.deepStrictEqual(
      changedParts(
        split('A.\n\nCloses #11\n\n## 日本語\n\nあ。'),
        split('A.\n\n## 日本語\n\nあ。\n\n---\n\nCloses #11'),
        'pull-request',
      ),
      { original: false, translation: false },
    );
  });

  test('counts an edit to a line of an issue that has a closing keyword', () => {
    const issue =
      'The fix resolves #10 partly.\n\n## 日本語\n\nこの修正は #10 を一部解決する。';

    assert.deepStrictEqual(
      changedParts(
        split(issue),
        split(issue.replace('partly', 'in part')),
        'issue',
      ),
      { original: true, translation: false },
    );
  });

  test('does not count an edited Merge-After line as a change', () => {
    assert.deepStrictEqual(
      changedParts(
        before,
        split(BODY.replace('Merge-After: #10', 'Merge-After: #10, #14')),
        'pull-request',
      ),
      { original: false, translation: false },
    );
  });

  test('sees each half change', () => {
    assert.deepStrictEqual(
      changedParts(
        before,
        split(BODY.replace('the rest', 'the remainder')),
        'pull-request',
      ),
      { original: true, translation: false },
    );

    assert.deepStrictEqual(
      changedParts(
        before,
        split(BODY.replace('残り', 'その他')),
        'pull-request',
      ),
      { original: false, translation: true },
    );
  });
});

describe(descriptionKindOf, () => {
  test('reads a pull request by the pull_request key the issues route sets', () => {
    assert.strictEqual(
      descriptionKindOf({ pull_request: { url: 'https://example.com' } }),
      'pull-request',
    );
  });

  test('reads an issue without it', () => {
    assert.strictEqual(descriptionKindOf({}), 'issue');

    assert.strictEqual(descriptionKindOf({ pull_request: undefined }), 'issue');
  });
});

describe(readableDescription, () => {
  test('leaves the translation out and keeps the trailers', () => {
    const read = readableDescription(split(BODY), HEADING);

    assert.notInclude(read, 'パーサ');

    assert.include(read, 'Fixes the parser (#12).');

    assert.include(
      read,
      '## 日本語\n\n(9 lines left out by `pr-description read`)',
    );

    assert.isTrue(
      read.endsWith(
        'Claude-Session: [title](https://claude.ai/code/session_1)\n',
      ),
    );
  });
});
