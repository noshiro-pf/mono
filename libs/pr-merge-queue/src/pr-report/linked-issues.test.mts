import dedent from 'dedent';
import { parseClosingIssueRefs } from './linked-issues.mjs';

const repo = { owner: 'noshiro-pf', name: 'mono' } as const;

describe(parseClosingIssueRefs, () => {
  test('reads every keyword GitHub reads', () => {
    for (const keyword of [
      'close',
      'closes',
      'closed',
      'fix',
      'fixes',
      'fixed',
      'resolve',
      'resolves',
      'resolved',
    ]) {
      assert.deepStrictEqual(
        parseClosingIssueRefs(`${keyword} #12`, repo),
        [12],
      );
    }
  });

  test('is case-insensitive and accepts the colon form', () => {
    assert.deepStrictEqual(parseClosingIssueRefs('Closes: #12', repo), [12]);

    assert.deepStrictEqual(parseClosingIssueRefs('FIXES #12', repo), [12]);

    assert.deepStrictEqual(
      parseClosingIssueRefs('RESOLVED https://github.com/X/Y/issues/7', {
        owner: 'x',
        name: 'y',
      }),
      [7],
    );
  });

  test('reads a full URL, but only for this repository', () => {
    assert.deepStrictEqual(
      parseClosingIssueRefs(
        'Fixes https://github.com/noshiro-pf/mono/issues/34',
        repo,
      ),
      [34],
    );

    assert.deepStrictEqual(
      parseClosingIssueRefs(
        'Fixes http://github.com/noshiro-pf/mono/issues/35',
        repo,
      ),
      [35],
    );

    assert.deepStrictEqual(
      parseClosingIssueRefs(
        'Fixes https://github.com/someone/else/issues/34',
        repo,
      ),
      [],
    );

    assert.deepStrictEqual(
      parseClosingIssueRefs(
        'Fixes https://github.com/noshiro-pf/mono-extra/issues/34',
        repo,
      ),
      [],
    );
  });

  test('folds ASCII alone', () => {
    for (const body of [
      'clo\u{017F}es #12',
      'Fixes http\u{017F}://github.com/noshiro-pf/mono/issues/5',
      'Fixes https://github.com/noshiro-pf/mono/i\u{017F}\u{017F}ues/5',
    ]) {
      assert.deepStrictEqual(parseClosingIssueRefs(body, repo), []);
    }

    assert.deepStrictEqual(
      parseClosingIssueRefs('Fixes https://github.com/\u{212A}it/x/issues/7', {
        owner: 'kit',
        name: 'x',
      }),
      [],
    );
  });

  // GitHub's owner and repository names are case-insensitive, as
  // `closingKeywordIssuesIn` and `closingIssuesIn` read them.
  test("matches this repository's URL whatever its case", () => {
    assert.deepStrictEqual(
      parseClosingIssueRefs(
        'Fixes https://github.com/Noshiro-PF/Mono/issues/34',
        repo,
      ),
      [34],
    );

    assert.deepStrictEqual(
      parseClosingIssueRefs(
        'Fixes https://github.com/noshiro-pf/mono/issues/34',
        {
          owner: 'Noshiro-PF',
          name: 'Mono',
        },
      ),
      [34],
    );
  });

  test('a bare reference is not a link', () => {
    // `#12` on its own is a cross-reference; GitHub closes nothing for it, and
    // neither does this.
    assert.deepStrictEqual(parseClosingIssueRefs('see #12', repo), []);
  });

  test('ignores fenced code, like `Merge-After:` does', () => {
    const body = ['```markdown', 'Closes #12', '```', 'Closes #13'].join('\n');

    assert.deepStrictEqual(parseClosingIssueRefs(body, repo), [13]);
  });

  test('reads `owner/repo#N` naming this repository, whatever its case', () => {
    assert.deepStrictEqual(
      parseClosingIssueRefs('Fixes noshiro-pf/mono#12', repo),
      [12],
    );

    assert.deepStrictEqual(
      parseClosingIssueRefs('Fixes Noshiro-PF/Mono#12', repo),
      [12],
    );

    assert.deepStrictEqual(
      parseClosingIssueRefs('Fixes someone/else#12', repo),
      [],
    );
  });

  test('reads a keyword with nothing before the #, which GitHub may not', () => {
    assert.deepStrictEqual(parseClosingIssueRefs('fixes#12', repo), [12]);

    assert.deepStrictEqual(parseClosingIssueRefs('fixes:#12', repo), [12]);
  });

  test('ignores HTML comments and inline code', () => {
    assert.deepStrictEqual(
      parseClosingIssueRefs(
        dedent`
          <!-- Closes #1 -->
          <!--
          Fixes #2
          -->
          Write \`Closes #3\` to close one, or \`\`Fixes #4\`\`.
          Resolves #5
          <!-- left open
          Closes #6
        `,
        repo,
      ),
      [5],
    );
  });

  test('reads the text a parser shows, not the source', () => {
    for (const [body, expected] of [
      ['Closes\n#1', [1]],
      ['| a | b |\n| - | - |\n| x | Fixes #2 |', [2]],
      ['| Bug fix | #12 |\n| - | - |', []],
      ['<ul>\n<li>Bug fix</li>\n<li>#12</li>\n</ul>', []],
      ['<details>\n<summary>Fixed</summary>\n#16 was a dup\n</details>', []],
      // GitHub's tag filter escapes `<script>`, so its content shows.
      ['<script>\n// Fixes #1\n</script>', [1]],
      // A number ends where an element begins.
      ['Fixes #12**3**', [12]],
      ['Fixes #4<b>5</b>', [4]],
      ['<p>Fixes #4<b>5</b></p>', [4]],
      ['<div>\nFixes #1<!-- -->2\n</div>', [1]],
      ['<p>Fixes #1&#50;</p>', [12]],
      ['Fix<em>es</em> #3', [3]],
      ['<!--\n```\n-->\nFixes #4', [4]],
      ['Use `a\nb` here.\nFixes #5', [5]],
      ['See someone/fix#6.', []],
      // A code span or an image between a keyword and its number joins none.
      ['Fixes `x` #14', []],
      ['Fixes ![a](x.png) #15', []],
      ['Fixes <img src="x.png"> #16', []],
      ['Fixes<br>#17', [17]],
      // GitHub reads no reference in an escaped `#`.
      [String.raw`Fixes \#7`, []],
      [String.raw`Fixes \\#8`, []],
    ] as const) {
      assert.deepStrictEqual(parseClosingIssueRefs(body, repo), expected);
    }
  });

  test('reads no issue 0', () => {
    assert.deepStrictEqual(parseClosingIssueRefs('Fixes #0', repo), []);
  });

  test('deduplicates and keeps the first occurrence order', () => {
    assert.deepStrictEqual(
      parseClosingIssueRefs('Closes #5\nFixes #3\nResolves #5', repo),
      [5, 3],
    );
  });
});
