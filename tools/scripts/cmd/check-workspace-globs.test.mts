import { findWorkspaceGlobMismatches } from './check-workspace-globs.mjs';

describe(findWorkspaceGlobMismatches, () => {
  test('accepts the same globs in another order', () => {
    assert.deepStrictEqual(
      findWorkspaceGlobMismatches({
        pnpmWorkspace: ['libs/*', 'apps/*'],
        rootWorkspaces: ['apps/*', 'libs/*'],
      }),
      [],
    );
  });

  test('reports a glob only pnpm-workspace.yaml has', () => {
    assert.deepStrictEqual(
      findWorkspaceGlobMismatches({
        pnpmWorkspace: ['libs/*', 'apps/*', 'games/*'],
        rootWorkspaces: ['libs/*', 'apps/*'],
      }),
      [
        {
          glob: 'games/*',
          missingFrom: 'package.json',
        },
      ],
    );
  });

  test('reports a glob only the root workspaces has', () => {
    assert.deepStrictEqual(
      findWorkspaceGlobMismatches({
        pnpmWorkspace: ['libs/*'],
        rootWorkspaces: ['libs/*', 'apps/*'],
      }),
      [
        {
          glob: 'apps/*',
          missingFrom: 'pnpm-workspace.yaml',
        },
      ],
    );
  });
});
