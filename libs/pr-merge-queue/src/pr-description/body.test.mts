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

  **Deferred**

  - (too large) the rest (#13).

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

/** A body whose original is `original`, its translation opening with `### 背景`. */
const opened = (original: string): DescriptionParts =>
  split(`${original}\n\n## 日本語\n\n### 背景\n\nあ。`);

/** A Review section of `lines`, its translation naming what they name. */
const review = (lines: string): DescriptionParts =>
  split(
    `## Review\n\n\`/code-review high\`, 3 rounds.\n\n${lines}\n\n## 日本語\n\n### レビュー\n\nあ ${(lines.match(/#\d+/gu) ?? []).join(' ')}。`,
  );

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

      \`\`\`sh
      echo '#4'
      \`\`\`

      \`#6\` と書く。
    `);

    assert.deepStrictEqual(checkDescription(parts, 'pull-request'), []);
  });

  test("wants the original's code blocks repeated in the translation", () => {
    const body = dedent`
      - A:

        \`\`\`ts
        f(1);
        \`\`\`

      \`\`\`text
      out
      \`\`\`

      ## 日本語

      A は次のとおり。

      \`\`\`ts
      f(1);
      \`\`\`

      - 出力:

        \`\`\`text
        out
        \`\`\`
    `;

    assert.deepStrictEqual(checkDescription(split(body), 'pull-request'), []);
  });

  test('names a code block the translation leaves out or adds', () => {
    assert.deepStrictEqual(
      checkDescription(
        split('A.\n\n```ts\nf(1);\n```\n\n## 日本語\n\nあ。'),
        'pull-request',
      ),
      [`the original has 1 code block and the translation 0; ${CODE_RULE}`],
    );

    assert.deepStrictEqual(
      checkDescription(
        split('A.\n\n## 日本語\n\nあ。\n\n```ts\nf(1);\n```'),
        'pull-request',
      ),
      [`the original has 0 code blocks and the translation 1; ${CODE_RULE}`],
    );
  });

  test('names a code block the translation changes', () => {
    assert.deepStrictEqual(
      checkDescription(
        split(
          'A.\n\n```ts\nf(1); // one\n```\n\n## 日本語\n\nあ。\n\n```ts\nf(1); // 一\n```',
        ),
        'pull-request',
      ),
      [`code block 1 of the translation is not the original's; ${CODE_RULE}`],
    );
  });

  test('keeps tables and images in the original', () => {
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
    'Start-After: and Claude-Session: lines are read wherever they are, so each appears once, after the "---" rule that ends the translation';

  /** Says both readings, and that a flag is not the fix: `--issue` passes a pull request's that GitHub would still act on. */
  const closingKeywordProblem = (
    half: 'original' | 'translation',
    line: string,
  ): string =>
    `the ${half} has the closing keyword "${line}"; read as a pull request's description, as this is, GitHub acts on one wherever it is, so it appears once, after the "---" rule that ends the translation. In an issue's description one is prose and stays where it is` as const;

  test.each([
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
    'Closes #2',
    'Closes noshiro-pf/mono#2',
    'Fixes https://github.com/noshiro-pf/mono/issues/2',
    'Fixes:#2',
    'Closes : #2',
  ])(
    'reads %s as a closing keyword, and says what each reading asks',
    (line) => {
      assert.deepStrictEqual(
        checkDescription(
          split(dedent`
            A.

            ${line}

            ## 日本語

            あ。

            ${line}
          `),
          'pull-request',
        ),
        [
          closingKeywordProblem('original', line),
          closingKeywordProblem('translation', line),
        ],
      );
    },
  );

  test('never sends a pull request toward --issue, nor an issue draft toward rewording', () => {
    const problems = checkDescription(
      split(dedent`
        The workaround in #5 resolves #10 only partly.

        ## 日本語

        #5 の回避策は #10 を一部しか解決しない。
      `),
      'pull-request',
    );

    // One problem, the keyword's: not also that the original lacks #10.
    assert.lengthOf(problems, 1);

    assert.notInclude(problems[0], '--issue');

    assert.include(problems[0], "In an issue's description one is prose");
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

          \`Closes #2\` と次を書く。

          \`\`\`md
          Start-After: #3
          \`\`\`
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

  test('takes deferred findings that each open with a reason', () => {
    assert.deepStrictEqual(
      checkDescription(
        review(dedent`
          **Fixed**

          - a thing.

          **Deferred**

          - (predates) b, which the change does not touch (#13).
          - (another change) c,
            continued on a second line.
              - a nested note.
          - **(too large)** d, a check over every package (#14),
            deferred with its \`check:root\` script.

          **Dismissed**

          - e.
        `),
        'pull-request',
      ),
      [],
    );
  });

  test.each([
    '**Deferred**: none.',
    '**Deferred:** None',
    'Deferred: none',
    '**Deferred**\n\nNone.',
  ])('takes a Deferred line that says none, as %j', (label) => {
    assert.deepStrictEqual(checkDescription(review(label), 'pull-request'), []);
  });

  test.each([
    [
      '**Deferred**\n\n- (predates) b (#13).\n- c, left for later (#14).',
      'c, left for later (#14).',
    ],
    [
      '**Deferred**\n\n  - (predates) b (#13).\n- c, left for later (#14).',
      'c, left for later (#14).',
    ],
    [
      '**Deferred**\n\n  - (predates) b (#13).\n\t- c, left for later (#14).',
      'c, left for later (#14).',
    ],
    [
      '**Deferred**\n\n- (predates) b (#13),\n  Fixed upstream.\n- c, left for later (#14).',
      'c, left for later (#14).',
    ],
    [
      '**Deferred**\n\n- (round 3) b (#13).\n- (too large) c (#14).',
      '(round 3) b (#13).',
    ],
    [
      '**Deferred**\n- (predates) b\nwrapped tail (#13).\n- c, left for later (#14).',
      'c, left for later (#14).',
    ],
  ] as const)(
    'names the deferred finding with no reason in %j',
    (lines, item) => {
      assert.deepStrictEqual(checkDescription(review(lines), 'pull-request'), [
        `the deferred finding "${item}" opens with no reason; ${DEFERRAL_RULE}`,
      ]);
    },
  );

  test.each([
    '**Deferred**\n\n1. (predates) b (#13).\n2. (too large) c (#14).',
    '**Deferred**\n\n  - (predates) b (#13).\n  - (too large) c (#14).',
    '**Deferred**\n- (predates) b (#13).',
    '**Deferred**\n\n- (predates) b (#13).\n\tcontinued, deferred later.',
    '**Deferred**\n\n- (predates): b (#13).\n- (Too large) c (#14).\n- *(another change)* d (#15).',
  ])(
    'takes a numbered or indented list under the Deferred line, %j',
    (lines) => {
      assert.deepStrictEqual(
        checkDescription(review(lines), 'pull-request'),
        [],
      );
    },
  );

  test('refuses a Deferred line that lists nothing', () => {
    assert.deepStrictEqual(
      checkDescription(review('**Deferred**\n\nNothing.'), 'pull-request'),
      [`the "**Deferred**" line lists nothing ${NONE_HINT}; ${DEFERRAL_RULE}`],
    );

    assert.deepStrictEqual(
      checkDescription(
        review('**Fixed**\n\n- a.\n\n**Deferred**'),
        'pull-request',
      ),
      [`the "**Deferred**" line lists nothing ${NONE_HINT}; ${DEFERRAL_RULE}`],
    );
  });

  test.each([
    '**Deferred**\n\n- (predates) a (#13).\n\n**Round 3**\n\n- b (#14).',
    '**Deferred**\n\n- (predates) a (#13).\n\n**Dismissed**\n\n- b, as intended.',
    '- Deferred: b (#13).',
    'Deferred to #13: b; c.',
    '**Fixed**\n\n- the parser now reads `Deferred:` labels.',
    '**Fixed**\n\n- a wrapped finding whose next line reads\n  Deferred:\n- b.',
  ])(
    'reads the list under a Deferred line only, up to its end, in %j',
    (lines) => {
      assert.deepStrictEqual(
        checkDescription(review(lines), 'pull-request'),
        [],
      );
    },
  );

  test('shortens a long finding without splitting a character', () => {
    const long = `b ${'x'.repeat(57)}😀 more` as const;

    assert.deepStrictEqual(
      checkDescription(review(`**Deferred**\n\n- ${long}`), 'pull-request'),
      [
        `the deferred finding "b ${'x'.repeat(57)}😀…" opens with no reason; ${DEFERRAL_RULE}`,
      ],
    );
  });

  test('reads deferrals in the Review section only, outside code', () => {
    assert.deepStrictEqual(
      checkDescription(
        split(dedent`
          **Deferred**

          - a note in the summary.

          ## Review

          \`/code-review high\`, 1 round.

          \`\`\`md
          **Deferred**

          - an example.
          \`\`\`

          ## Checks

          **Deferred**

          - not a finding.

          ## 日本語

          あ。

          ### レビュー

          い。

          \`\`\`md
          **Deferred**

          - an example.
          \`\`\`

          ### チェック

          う。
        `),
        'pull-request',
      ),
      [],
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

          \`\`\`md
          ## Review

          Anything.
          \`\`\`
        `),
        'pull-request',
      ),
      [],
    );
  });
});

/** An issue's description whose trailers, after the `---` rule, end with `line`. */
const withTrailer = (line: string): DescriptionParts =>
  split(`A.\n\n## 日本語\n\nあ。\n\n---\n\n${line}`);

// The whole sentence is asserted, as for the file's other rules, so that a
// change to what a refusal tells its writer is seen in the tests.
const namesNothing = (line: string, key: string): string =>
  `"${line}" names nothing; a ${key}: line names this repository's issues and pull requests as #N, and a URL, an owner/repo#N or a bare number on it is not read` as const;

const decorated = (line: string, key: string): string =>
  `"${line}" is not read as a ${key}: line; a declaration line opens with the key and a colon (":"), with nothing but whitespace before the key or between it and the colon` as const;

describe('checkDescription on declaration lines', () => {
  test.each([
    'Start-After: #3877',
    'Start-After: #1, #2',
    'Merge-After: #5 (the layer below)',
    // A quoted line cites a declaration without making one.
    '> Merge-After: #5',
    // A code span is how prose names the key.
    '`Start-After: #5`',
    'The Start-After: line of #12 is read by start-issue.',
    '```\nStart-After: 3\n```',
    // A flag, not a key: a list marker is followed by a space.
    '- --merge-after: takes a number',
    '- `Start-After:` lines are read by start-issue.',
    // Link text, a letter before the key, and a Japanese sentence's full-width
    // colon are prose.
    '[Start-After: #5](https://example.com)',
    'x Start-After: notes',
    'Start-After：の行は #N だけを読む',
    // Strikethrough withdraws a declaration.
    '~~Merge-After: #5~~',
  ])('passes %j', (line) => {
    assert.deepStrictEqual(checkDescription(withTrailer(line), 'issue'), []);
  });

  test.each([
    ['Start-After: 3877', namesNothing('Start-After: 3877', 'Start-After')],
    [
      'Start-After: https://github.com/noshiro-pf/mono/pull/3877',
      namesNothing(
        'Start-After: https://github.com/noshiro-pf/mono/pull/3877',
        'Start-After',
      ),
    ],
    [
      'Start-After: noshiro-pf/mono#3877',
      namesNothing('Start-After: noshiro-pf/mono#3877', 'Start-After'),
    ],
    ['Start-After:', namesNothing('Start-After:', 'Start-After')],
    ['merge-after : 5', namesNothing('merge-after : 5', 'Merge-After')],
    [
      '**Start-After:** #3877',
      decorated('**Start-After:** #3877', 'Start-After'),
    ],
    ['- Start-After: #3877', decorated('- Start-After: #3877', 'Start-After')],
    ['_Merge-After_: #5', decorated('_Merge-After_: #5', 'Merge-After')],
    ['+ Merge-After: #5', decorated('+ Merge-After: #5', 'Merge-After')],
    [
      '1. Start-After: #3877',
      decorated('1. Start-After: #3877', 'Start-After'),
    ],
    [
      '- [ ] Start-After: #3877',
      decorated('- [ ] Start-After: #3877', 'Start-After'),
    ],
    [
      'Start-After**:** #3877',
      decorated('Start-After**:** #3877', 'Start-After'),
    ],
    ['-Start-After: #5', decorated('-Start-After: #5', 'Start-After')],
    [
      '\u{3000}- Start-After: #5',
      decorated('- Start-After: #5', 'Start-After'),
    ],
    ['Start-After **:** #5', decorated('Start-After **:** #5', 'Start-After')],
    // Indented four columns, as a nested list item is here.
    ['    - Merge-After: #5', decorated('- Merge-After: #5', 'Merge-After')],
    ['\t- Start-After: #5', decorated('- Start-After: #5', 'Start-After')],
  ])('refuses %j after the rule', (line, problem) => {
    assert.deepStrictEqual(checkDescription(withTrailer(line), 'issue'), [
      problem,
    ]);
  });

  test('refuses a Merge-After: with a URL at the top of a pull request', () => {
    const line = 'Merge-After: https://github.com/noshiro-pf/mono/pull/5';

    assert.deepStrictEqual(
      checkDescription(
        split(`${line}\n\nA.\n\n## 日本語\n\nあ。`),
        'pull-request',
      ),
      [namesNothing(line, 'Merge-After')],
    );
  });

  test('refuses a decorated key in either half, and no heading', () => {
    // Both name #5 and have one heading each, so that the halves mirror.
    assert.deepStrictEqual(
      checkDescription(
        split(
          'A.\n\n- Merge-After: #5\n\n## Merge-After: how it is read\n\n## 日本語\n\nあ。\n\n* Start-After: #5\n\n### Merge-After: の読み方',
        ),
        'pull-request',
      ),
      [
        decorated('- Merge-After: #5', 'Merge-After'),
        decorated('* Start-After: #5', 'Start-After'),
      ],
    );
  });

  test('looks at no declaration line in a fenced block among the trailers', () => {
    assert.deepStrictEqual(
      checkDescription(
        withTrailer(
          '```md\nStart-After: 3\n- Merge-After: #5\n```\nStart-After: #4',
        ),
        'issue',
      ),
      [],
    );
  });

  test('judges a body with CRLF line ends as its LF form', () => {
    const body = 'A.\n\n## 日本語\n\nあ。\n\n---\n\nStart-After: 3877';

    const problems = checkDescription(split(body), 'issue');

    assert.deepStrictEqual(
      checkDescription(split(body.replaceAll('\n', '\r\n')), 'issue'),
      problems,
    );

    assert.deepStrictEqual(problems, [
      namesNothing('Start-After: 3877', 'Start-After'),
    ]);
  });
});

describe('checkDescription with an opening heading', () => {
  test('passes an original that opens with the heading', () => {
    assert.deepStrictEqual(
      checkDescription(
        opened('## Background\n\nA.'),
        'pull-request',
        'Background',
      ),
      [],
    );
  });

  test('lets declarations and the merge-before note come first', () => {
    assert.deepStrictEqual(
      checkDescription(
        opened(
          'Merge-After: #10\nMerges before #11.\n\n## Background\n\nA (#10, #11).',
        ),
        'pull-request',
        'Background',
      ).filter((problem) => problem.includes('Background')),
      [],
    );
  });

  test('names the heading an original opens with instead', () => {
    assert.deepStrictEqual(
      checkDescription(
        opened('## Summary\n\nA.'),
        'pull-request',
        'Background',
      ),
      [`the original opens with "## Summary"; ${OPENING_RULE}`],
    );
  });

  test('refuses prose before the heading', () => {
    assert.deepStrictEqual(
      checkDescription(
        split(
          'A.\n\n## Background\n\nB.\n\n## 日本語\n\nあ。\n\n### 背景\n\nい。',
        ),
        'pull-request',
        'Background',
      ),
      [`the original opens with prose under no heading; ${OPENING_RULE}`],
    );
  });

  test('refuses an original with no heading at all', () => {
    assert.deepStrictEqual(
      checkDescription(
        split('A.\n\n## 日本語\n\nあ。'),
        'pull-request',
        'Background',
      ),
      [`the original opens with prose under no heading; ${OPENING_RULE}`],
    );
  });

  test('wants the heading at the second level', () => {
    assert.deepStrictEqual(
      checkDescription(
        split('### Background\n\nA.\n\n## 日本語\n\n#### 背景\n\nあ。'),
        'pull-request',
        'Background',
      ),
      [`the original opens with "### Background"; ${OPENING_RULE}`],
    );
  });

  test('reads no heading out of a code fence', () => {
    assert.deepStrictEqual(
      checkDescription(
        opened('```md\n## Background\n```\n\n## Summary\n\nA.'),
        'pull-request',
        'Background',
      ).filter((problem) => problem.includes(OPENING_RULE)),
      [`the original opens with prose under no heading; ${OPENING_RULE}`],
    );
  });

  test('refuses an original that holds only declarations', () => {
    assert.deepStrictEqual(
      checkDescription(
        split('Merge-After: #10\n\n## 日本語\n\nあ。'),
        'pull-request',
        'Background',
      ),
      [`the original has no heading; ${OPENING_RULE}`],
    );
  });

  test('lets an HTML comment come first', () => {
    assert.deepStrictEqual(
      checkDescription(
        opened('<!-- a\nnote -->\n\n## Background\n\nA.'),
        'pull-request',
        'Background',
      ),
      [],
    );
  });

  test('reads no heading out of an HTML comment', () => {
    assert.deepStrictEqual(
      checkDescription(
        opened('<!--\n## Background\n-->\n\n## Summary\n\nA.'),
        'pull-request',
        'Background',
      ).filter((problem) => problem.includes(OPENING_RULE)),
      [`the original opens with "## Summary"; ${OPENING_RULE}`],
    );
  });

  test('asks nothing of an issue', () => {
    assert.deepStrictEqual(
      checkDescription(split('A.\n\n## 日本語\n\nあ。'), 'issue', 'Background'),
      [],
    );
  });
});

const NONE_HINT =
  '(with nothing deferred, write "**Deferred**: none." or leave the line out)';

const DEFERRAL_RULE =
  'a deferred finding is an item under a "**Deferred**" line, opening with why it is out of scope: (predates), (another change) or (too large); a finding in scope is fixed in the pull request, whatever round raised it (docs/code-review-loop.md)';

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

const OPENING_RULE =
  'a pull request\'s description opens with "## Background": what the change is about and why it is needed, for a reader who has not read the issue (the pr-description README says what to write)';

const CODE_RULE =
  'each code block appears in both halves, the same and in the same order, so that either half reads on its own';
