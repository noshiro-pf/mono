import { findPackageManagerDeclarations } from './check-package-manager.mjs';

describe(findPackageManagerDeclarations, () => {
  test('reports a manifest that declares packageManager', () => {
    assert.deepStrictEqual(
      findPackageManagerDeclarations([
        {
          relativePath: 'libs/a/package.json',
          content: JSON.stringify({ name: 'a', packageManager: 'pnpm@1.0.0' }),
        },
        {
          relativePath: 'libs/b/package.json',
          content: JSON.stringify({ name: 'b' }),
        },
      ]),
      ['libs/a/package.json'],
    );
  });

  test('ignores packageManager nested under another key', () => {
    assert.deepStrictEqual(
      findPackageManagerDeclarations([
        {
          relativePath: 'libs/a/package.json',
          content: JSON.stringify({
            name: 'a',
            devEngines: { packageManager: { name: 'pnpm' } },
          }),
        },
      ]),
      [],
    );
  });
});
