import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import {
  changedParts,
  checkDescription,
  readableDescription,
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
    assert.deepStrictEqual(checkDescription(split(BODY)), []);
  });

  test('names headings that do not mirror', () => {
    const problems = checkDescription(
      split(
        BODY.replace(
          '### 実行したチェック',
          '### 概要\n\nあ。\n\n### 実行したチェック',
        ),
      ),
    );

    assert.strictEqual(problems.length, 1);

    assert.include(problems[0], '### 概要');
  });

  test('lets the translation title prose the original opens with', () => {
    const titled = BODY.replace('パーサを直す', '### 概要\n\nパーサを直す');

    assert.deepStrictEqual(checkDescription(split(titled)), []);

    // One heading for the opening, and no more.
    assert.isNotEmpty(
      checkDescription(
        split(
          titled.replace('### レビュー', '### 補足\n\nあ。\n\n### レビュー'),
        ),
      ),
    );

    assert.deepStrictEqual(
      checkDescription(split('A.\n\n## 日本語\n\n### 概要\n\nあ。')),
      [],
    );
  });

  test('wants the translation one level down', () => {
    assert.isNotEmpty(
      checkDescription(split(BODY.replace('### レビュー', '## レビュー'))),
    );
  });

  test('names a reference only one half makes', () => {
    const problems = checkDescription(
      split(BODY.replace('- 先送り: 残り (#13)。', '- 先送り: 残り。')),
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

    assert.deepStrictEqual(checkDescription(parts), []);
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
      ),
      [`the original has the trailer "${trailer}"; ${TRAILER_RULE}`],
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
      ),
      [],
    );
  });

  test('wants one Review section in the original, however headed', () => {
    assert.deepStrictEqual(
      checkDescription(
        split(dedent`
          ## Review (/code-review high)

          A.

          ## Review findings not fixed

          B.

          ## 日本語

          ### レビュー

          あ。

          ### 直していない指摘

          い。
        `),
      ),
      [
        'the original has a "## Review" section 2 times; the tools read the first, so the findings go under one',
      ],
    );
  });
});

describe(changedParts, () => {
  const before = split(BODY);

  test('sees neither half change when only the trailers do', () => {
    assert.deepStrictEqual(
      changedParts(before, split(`${BODY}\nStart-After: #9`)),
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
      ),
      { original: false, translation: false },
    );
  });

  test('does not count a trailer moved out of a half as a change', () => {
    assert.deepStrictEqual(
      changedParts(
        split('A.\n\nCloses #11\n\n## 日本語\n\nあ。'),
        split('A.\n\n## 日本語\n\nあ。\n\n---\n\nCloses #11'),
      ),
      { original: false, translation: false },
    );
  });

  test('does not count an edited Merge-After line as a change', () => {
    assert.deepStrictEqual(
      changedParts(
        before,
        split(BODY.replace('Merge-After: #10', 'Merge-After: #10, #14')),
      ),
      { original: false, translation: false },
    );
  });

  test('sees each half change', () => {
    assert.deepStrictEqual(
      changedParts(before, split(BODY.replace('the rest', 'the remainder'))),
      { original: true, translation: false },
    );

    assert.deepStrictEqual(
      changedParts(before, split(BODY.replace('残り', 'その他'))),
      { original: false, translation: true },
    );
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
