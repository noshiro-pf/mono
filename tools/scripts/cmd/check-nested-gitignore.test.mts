import {
  ALLOWED_PRETTIERIGNORES,
  findNestedGitignores,
  findNestedPrettierignores,
} from './check-nested-gitignore.mjs';

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

describe(findNestedPrettierignores, () => {
  const allowed = new Map<string, string>([
    ['languages/x/fixtures/.prettierignore', 'its fmt runs from there'],
  ]);

  test('reports a package-level .prettierignore not on the allow-list', () => {
    assert.deepStrictEqual(
      findNestedPrettierignores(
        [
          '.prettierignore',
          'languages/x/fixtures/.prettierignore',
          'libs/a/.prettierignore',
          'libs/b/.PrettierIgnore',
          'experimental/old/.prettierignore',
          'libs/a/x.prettierignore',
        ],
        allowed,
      ),
      {
        notAllowed: ['libs/a/.prettierignore', 'libs/b/.PrettierIgnore'],
        stale: [],
      },
    );
  });

  test('reports an allow-list entry that names no tracked file', () => {
    assert.deepStrictEqual(
      findNestedPrettierignores(['.prettierignore'], allowed),
      { notAllowed: [], stale: ['languages/x/fixtures/.prettierignore'] },
    );
  });

  test('allows the repository’s own list as it stands', () => {
    assert.deepStrictEqual(
      findNestedPrettierignores([
        '.prettierignore',
        ...ALLOWED_PRETTIERIGNORES.keys(),
      ]),
      { notAllowed: [], stale: [] },
    );
  });
});
