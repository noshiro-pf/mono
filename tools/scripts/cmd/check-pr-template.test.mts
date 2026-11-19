import dedent from 'dedent';
import { templateProblems } from './check-pr-template.mjs';

const settings = { heading: '日本語', openingHeading: 'Background' } as const;

const valid = dedent`
  <!-- How to write it. -->

  ## Background

  <!-- What the change is about. -->

  ## What changes

  ## 日本語

  ### 背景

  ### 何が変わるか

  ---
`;

// The mirror check refuses some fixtures too; only the review headings are
// compared there.
const reviewHeadingsIn = (template: string): readonly string[] =>
  templateProblems(`${template}\n`, settings).filter((problem) =>
    problem.startsWith('it holds the heading '),
  );

describe('templateProblems', () => {
  test('accepts a skeleton the description check accepts', () => {
    assert.deepStrictEqual(templateProblems(`${valid}\n`, settings), []);
  });

  test('refuses what the description check refuses', () => {
    const template = valid.replace('## Background', '## Summary');

    const problems = templateProblems(`${template}\n`, settings);

    assert.strictEqual(problems.length, 1);

    assert.include(problems[0], '"## Background"');
  });

  // A placeholder the description check accepts, posted as it is, reads as a
  // review that never ran.
  test('refuses a review section, however its opening reads', () => {
    const template = valid
      .replace(
        '## 日本語',
        '## Review\n\nSelf-review at `high`, 1 round.\n\n## 日本語',
      )
      .replace('---', '### レビュー\n\n---');

    assert.deepStrictEqual(templateProblems(`${template}\n`, settings), [
      'it holds the heading "## Review", which opens as a review section does; the template must have none, as the review is written after the checks once it has run (docs/code-review-loop.md)',
      'it holds the heading "### レビュー", which opens as a review section does; the template must have none, as the review is written after the checks once it has run (docs/code-review-loop.md)',
    ]);
  });

  test('refuses a review heading in the translation alone', () => {
    const template = valid.replace('---', '### レビュー\n\n---');

    assert.deepStrictEqual(templateProblems(`${template}\n`, settings), [
      'it holds the heading "### レビュー", which opens as a review section does; the template must have none, as the review is written after the checks once it has run (docs/code-review-loop.md)',
    ]);
  });

  test('refuses a review heading inside an HTML comment', () => {
    const template = valid.replace(
      '<!-- How to write it. -->',
      '<!--\n## Review\n-->',
    );

    assert.include(
      templateProblems(`${template}\n`, settings),
      'it holds the heading "## Review", which opens as a review section does; the template must have none, as the review is written after the checks once it has run (docs/code-review-loop.md)',
    );
  });

  test('refuses a review heading set off by a tab', () => {
    const template = valid.replace('---', '##\tReview\n\n---');

    assert.include(
      templateProblems(`${template}\n`, settings),
      String.raw`it holds the heading "##\tReview", which opens as a review section does; the template must have none, as the review is written after the checks once it has run (docs/code-review-loop.md)`,
    );
  });

  test('refuses a translated review heading qualified with no space', () => {
    const template = valid.replace('---', '### レビュー（high、1 回）\n\n---');

    assert.deepStrictEqual(templateProblems(`${template}\n`, settings), [
      'it holds the heading "### レビュー（high、1 回）", which opens as a review section does; the template must have none, as the review is written after the checks once it has run (docs/code-review-loop.md)',
    ]);
  });

  test('refuses a review heading at level 1 and at level 6', () => {
    const template = valid.replace(
      '## 日本語',
      '# Review\n\n###### Review\n\n## 日本語',
    );

    assert.deepStrictEqual(reviewHeadingsIn(template), [
      'it holds the heading "# Review", which opens as a review section does; the template must have none, as the review is written after the checks once it has run (docs/code-review-loop.md)',
      'it holds the heading "###### Review", which opens as a review section does; the template must have none, as the review is written after the checks once it has run (docs/code-review-loop.md)',
    ]);
  });

  test('refuses a heading that only begins with the word, in any case', () => {
    const template = valid.replace(
      '## 日本語',
      '## Reviewer notes\n\n## review\n\n## 日本語',
    );

    assert.deepStrictEqual(reviewHeadingsIn(template), [
      'it holds the heading "## Reviewer notes", which opens as a review section does; the template must have none, as the review is written after the checks once it has run (docs/code-review-loop.md)',
      'it holds the heading "## review", which opens as a review section does; the template must have none, as the review is written after the checks once it has run (docs/code-review-loop.md)',
    ]);
  });

  test('refuses an indented review heading', () => {
    const template = valid.replace('---', '   ### レビュー\n\n---');

    assert.deepStrictEqual(templateProblems(`${template}\n`, settings), [
      'it holds the heading "### レビュー", which opens as a review section does; the template must have none, as the review is written after the checks once it has run (docs/code-review-loop.md)',
    ]);
  });

  test('refuses a review heading inside a code fence', () => {
    const template = valid.replace(
      '## 日本語',
      '```md\n## Review\n```\n\n## 日本語',
    );

    assert.include(
      templateProblems(`${template}\n`, settings),
      'it holds the heading "## Review", which opens as a review section does; the template must have none, as the review is written after the checks once it has run (docs/code-review-loop.md)',
    );
  });

  test('reads a template saved with CRLF line ends', () => {
    assert.deepStrictEqual(
      templateProblems(`${valid.replaceAll('\n', '\r\n')}\r\n`, settings),
      [],
    );
  });
});
