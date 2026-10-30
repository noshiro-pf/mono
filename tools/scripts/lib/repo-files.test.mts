// cspell:ignore qiita

import {
  hasPath,
  isRepositoryProse,
  isSitePage,
  toTree,
} from './repo-files.mjs';

describe('toTree and hasPath', () => {
  const tree = toTree(['libs/pkg/src/a.mts', 'README.md']);

  test('has every tracked file and every directory that holds one', () => {
    assert.deepStrictEqual(
      ['libs', 'libs/pkg', 'libs/pkg/src', 'libs/pkg/src/a.mts'].filter(
        (p) => !hasPath(tree, p),
      ),
      [],
    );

    assert.isTrue(hasPath(tree, 'README.md'));
  });

  test('has nothing else, a prefix of a name included', () => {
    assert.deepStrictEqual(
      ['libs/pkg/src/a', 'libs/pk', 'libs/pkg/', ''].filter((p) =>
        hasPath(tree, p),
      ),
      [],
    );
  });
});

describe('isRepositoryProse', () => {
  test('reads the Markdown the repository keeps up to date', () => {
    assert.deepStrictEqual(
      [
        'CLAUDE.md',
        'docs/checks-over-fixes.md',
        'libs/synstate/README.md',
        'apps/synstate-docs/src/content/docs/index.mdx',
        '.github/workflows/README.md',
        'repo-settings/README.md',
        'languages/sumi/docs/decisions.md',
        'tools/configs/README.md',
        'strict-lib/README.md',
      ].filter((p) => !isRepositoryProse(p)),
      [],
    );
  });

  test('leaves out what is not Markdown', () => {
    assert.isFalse(isRepositoryProse('docs/a.mts'));

    assert.isFalse(isRepositoryProse('README.txt'));
  });

  test('leaves out history, records and what is never edited', () => {
    assert.deepStrictEqual(
      [
        'libs/synstate/CHANGELOG.md',
        'libs/eslint-config-typed/docs/reports/a.md',
        'libs/ts-fortress/documents/implementation/update-reports/a.md',
        'libs/ts-fortress/documents/implementation/prompts/a.md',
        'strict-lib/docs/work-log/2026-05-17-a.md',
        'libs/ts-type-forge/design-docs/length-constrained-array-report.md',
        'strict-lib/v7.0/output/lib/README.md',
        'docs/json-spec/a.md',
        'docs/rust_book/a.md',
        'docs/typescript_book/a.md',
        'docs/blog/a.md',
        'docs/qiita/a.md',
        'docs/marp-slides/a/b.md',
        'docs/reveal-slides/a/b.md',
        'docs/monorepo-consolidation.md',
        'experimental/packages/a/README.md',
        'articles/a.md',
        'books/a/b.md',
      ].filter(isRepositoryProse),
      [],
    );
  });

  test('reads a document merely named like a record directory', () => {
    assert.isTrue(isRepositoryProse('docs/reports.md'));
  });
});

describe('isSitePage', () => {
  test('is Markdown under an app’s src/', () => {
    assert.isTrue(isSitePage('apps/synstate-docs/src/content/docs/a.md'));

    assert.isTrue(isSitePage('apps/profile/src/assets/biography.mdx'));

    assert.isFalse(isSitePage('apps/synstate-docs/README.md'));

    assert.isFalse(isSitePage('libs/synstate/src/a.md'));
  });
});
