import { findNestedGitignores } from './check-nested-gitignore.mjs';

describe(findNestedGitignores, () => {
  test('reports a nested .gitignore', () => {
    assert.deepStrictEqual(
      findNestedGitignores([
        '.gitignore',
        'docs/marp-slides/a/.gitignore',
        'docs/marp-slides/a/slides.md',
        'libs/a/.gitignore',
        'libs/b/.GitIgnore',
      ]),
      [
        'docs/marp-slides/a/.gitignore',
        'libs/a/.gitignore',
        'libs/b/.GitIgnore',
      ],
    );
  });

  test('accepts the root .gitignore alone', () => {
    assert.deepStrictEqual(
      findNestedGitignores(['.gitignore', 'README.md']),
      [],
    );
  });

  test('ignores experimental/ and names that only end in .gitignore', () => {
    assert.deepStrictEqual(
      findNestedGitignores([
        'experimental/old-repo/.gitignore',
        'libs/a/template.gitignore',
        'libs/a/.gitignore.sample',
      ]),
      [],
    );
  });
});
