import { Arr } from 'ts-data-forge';
import {
  findUnusedWorkspaceKeys,
  looksLikeWorkspacePath,
} from './check-knip-config.mjs';

describe(findUnusedWorkspaceKeys, () => {
  test('accepts keys that name a package directory', () => {
    assert.deepStrictEqual(
      findUnusedWorkspaceKeys(
        ['libs/synstate', 'apps/profile'],
        ['libs/synstate', 'apps/profile'],
      ),
      [],
    );
  });

  test('reports a key whose package moved away', () => {
    assert.deepStrictEqual(
      findUnusedWorkspaceKeys(
        ['apps/better-preact-use-state', 'apps/profile'],
        ['libs/better-preact-use-state', 'apps/profile'],
      ),
      ['apps/better-preact-use-state'],
    );
  });

  test('accepts the root key', () => {
    assert.deepStrictEqual(findUnusedWorkspaceKeys(['.'], []), []);
  });

  test('accepts a pattern that matches a package directory', () => {
    assert.deepStrictEqual(
      findUnusedWorkspaceKeys(
        ['libs/*', 'strict-lib/v*/output/lib'],
        ['libs/synstate', 'strict-lib/v7.0/output/lib'],
      ),
      [],
    );
  });

  test('reports a pattern that matches no package directory', () => {
    assert.deepStrictEqual(
      findUnusedWorkspaceKeys(
        ['libs/*', 'strict-lib/v*/output/lib'],
        ['libs/synstate', 'strict-lib/v7.0/lib'],
      ),
      ['strict-lib/v*/output/lib'],
    );
  });

  test('reads a key without `*` literally, as knip does', () => {
    assert.deepStrictEqual(
      findUnusedWorkspaceKeys(['apps/{foo,bar}', 'apps/foo?'], ['apps/foo']),
      ['apps/{foo,bar}', 'apps/foo?'],
    );
  });

  test('does not let `*` cross a path segment', () => {
    assert.deepStrictEqual(findUnusedWorkspaceKeys(['apps/*'], ['apps/a/b']), [
      'apps/*',
    ]);
  });

  test('reports a literal key knip would not normalize to its directory', () => {
    assert.deepStrictEqual(
      findUnusedWorkspaceKeys(
        ['./apps/profile', 'apps/profile/', 'apps/x/../profile'],
        ['./apps/profile', 'apps/profile/', 'apps/x/../profile'],
      ),
      ['./apps/profile', 'apps/profile/', 'apps/x/../profile'],
    );
  });
});

describe(looksLikeWorkspacePath, () => {
  const memberGlobs = ['libs/*', 'apps/*', 'strict-lib/v*/output/lib'] as const;

  test('matches a key under a member glob’s top directory', () => {
    assert.isTrue(looksLikeWorkspacePath(memberGlobs, 'libs/ts-data-forge'));

    assert.isTrue(looksLikeWorkspacePath(memberGlobs, 'strict-lib/v7.0'));
  });

  test('matches a top directory a newly added glob introduces', () => {
    assert.isTrue(
      looksLikeWorkspacePath(Arr.toPushed(memberGlobs, 'games/*'), 'games/x'),
    );
  });

  test('does not match a knip option or a path outside the members', () => {
    assert.isFalse(looksLikeWorkspacePath(memberGlobs, 'entry'));

    assert.isFalse(looksLikeWorkspacePath(memberGlobs, 'games/x'));

    assert.isFalse(looksLikeWorkspacePath(memberGlobs, 'libs-old/y'));
  });

  test('matches through a wildcard in the top directory itself', () => {
    assert.isTrue(looksLikeWorkspacePath(['pkg-*/*'], 'pkg-a/b'));

    assert.isFalse(looksLikeWorkspacePath(['pkg-*/*'], 'other/b'));
  });
});
